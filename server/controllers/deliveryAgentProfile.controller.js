// server/controllers/deliveryAgentProfile.controller.js
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import { ERR } from "../utils/httpError.js";
import { auditLog } from "../services/audit.service.js";
import { getCandidatesForVerified, promoteAgent, demoteAgent } from "../services/trustLevel.service.js";
import { emitToUser } from "../utils/socketEmitter.js";

async function safeAudit(req, payload) {
  try { await auditLog(req, payload); } catch { /* silencio */ }
}

// GET /api/delivery-agent-profile/me
export async function getMyProfile(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("No autorizado"));

    const profile = await DeliveryAgentProfile.findOne({ userId })
      .populate("userId", "name email phone")
      .lean();

    return res.ok({ data: profile || null });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-agent-profile/me
export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("No autorizado"));

    const profile = await DeliveryAgentProfile.findOne({ userId });
    if (!profile) return next(ERR.NOT_FOUND("Perfil de agente no encontrado"));

    const { status, currentLocation } = req.body || {};

    // Solo permitir ACTIVE ↔ PAUSED (no SUSPENDED desde el agente)
    if (status) {
      if (!["ACTIVE", "PAUSED"].includes(status)) {
        return next(ERR.VALIDATION("Solo puedes cambiar entre ACTIVE y PAUSED"));
      }
      if (profile.status === "SUSPENDED") {
        return next(ERR.VALIDATION("Tu perfil está suspendido. Contacta al soporte."));
      }
      profile.status = status;
    }

    if (currentLocation) {
      if (currentLocation.lat != null && currentLocation.lng != null) {
        profile.currentLocation = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          updatedAt: new Date(),
        };
      }
    }

    await profile.save();
    return res.ok({ data: profile });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// POST /api/delivery-agent-profile/me/request-verification
export async function requestVerification(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("No autorizado"));

    const profile = await DeliveryAgentProfile.findOne({ userId });
    if (!profile) return next(ERR.NOT_FOUND("Perfil de agente no encontrado"));

    if (profile.platformTrustLevel !== "BASIC") {
      return next(ERR.VALIDATION("Solo agentes con nivel Basico pueden solicitar verificación"));
    }
    if (profile.verificationRequest?.status === "REQUESTED") {
      return next(ERR.VALIDATION("Ya tienes una solicitud de verificación pendiente"));
    }

    const { notes } = req.body || {};

    profile.verificationRequest = {
      status: "REQUESTED",
      requestedAt: new Date(),
      notes: notes || "",
    };
    await profile.save();

    await safeAudit(req, {
      action: "VERIFICATION_REQUESTED",
      entity: "DeliveryAgentProfile",
      entityId: String(profile._id),
    });

    return res.ok({ data: profile });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-agent-profile/:id/reject-verification
export async function rejectVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const reviewedBy = req.userId || req.user?._id;

    if (!reason || reason.trim().length < 3) {
      return next(ERR.VALIDATION("Se requiere un motivo (mínimo 3 caracteres)"));
    }

    const profile = await DeliveryAgentProfile.findById(id);
    if (!profile) return next(ERR.NOT_FOUND("Perfil no encontrado"));

    if (profile.verificationRequest?.status !== "REQUESTED") {
      return next(ERR.VALIDATION("No hay solicitud de verificación pendiente"));
    }

    profile.verificationRequest.status = "REJECTED";
    profile.verificationRequest.reviewedAt = new Date();
    profile.verificationRequest.reviewedBy = reviewedBy;
    profile.verificationRequest.rejectionReason = reason;
    await profile.save();

    emitToUser(profile.userId, "verification:rejected", { reason });

    await safeAudit(req, {
      action: "VERIFICATION_REJECTED",
      entity: "DeliveryAgentProfile",
      entityId: String(profile._id),
      meta: { reason },
    });

    return res.ok({ data: profile });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-agent-profile — Lista todos los perfiles (super admin)
export async function listAgentProfiles(req, res, next) {
  try {
    const { status, trustLevel, serviceType, page = 1, limit = 20, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (trustLevel) filter.platformTrustLevel = trustLevel;
    if (serviceType) filter.approvedServiceTypes = serviceType;

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [items, total] = await Promise.all([
      DeliveryAgentProfile.find(filter)
        .populate("userId", "name email phone")
        .sort({ "stats.totalDeliveries": -1 })
        .skip(skip).limit(limitN).lean(),
      DeliveryAgentProfile.countDocuments(filter),
    ]);

    return res.ok({ data: items, total, page: +page, limit: limitN, totalPages: Math.ceil(total / limitN) });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-agent-profile/candidates-verified
export async function getCandidatesVerifiedController(req, res, next) {
  try {
    const candidates = await getCandidatesForVerified();
    return res.ok({ data: candidates, total: candidates.length });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-agent-profile/:id/promote
export async function promoteAgentController(req, res, next) {
  try {
    const { id } = req.params; // id del DeliveryAgentProfile
    const { level, reason } = req.body || {};
    const promotedBy = req.userId || req.user?._id;

    if (!level) return next(ERR.VALIDATION("Se requiere el nivel destino (level)"));

    // Buscar profile por _id para obtener userId
    const profile = await DeliveryAgentProfile.findById(id);
    if (!profile) return next(ERR.NOT_FOUND("Perfil no encontrado"));

    const updated = await promoteAgent(profile.userId, level, promotedBy, reason);

    // Notificar al agente
    emitToUser(profile.userId, "trust:promoted", {
      newLevel: level,
      reason: reason || "",
    });

    return res.ok({ data: updated });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-agent-profile/:id/demote
export async function demoteAgentController(req, res, next) {
  try {
    const { id } = req.params;
    const { level, reason } = req.body || {};
    const demotedBy = req.userId || req.user?._id;

    if (!level) return next(ERR.VALIDATION("Se requiere el nivel destino (level)"));
    if (!reason) return next(ERR.VALIDATION("Se requiere un motivo para degradar"));

    const profile = await DeliveryAgentProfile.findById(id);
    if (!profile) return next(ERR.NOT_FOUND("Perfil no encontrado"));

    const updated = await demoteAgent(profile.userId, level, demotedBy, reason);

    emitToUser(profile.userId, "trust:demoted", {
      newLevel: level,
      reason,
    });

    return res.ok({ data: updated });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-agent-profile/:id/suspend
export async function suspendAgentController(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const suspendedBy = req.userId || req.user?._id;

    if (!reason || reason.trim().length < 3) return next(ERR.VALIDATION("Se requiere un motivo (mínimo 3 caracteres)"));

    const profile = await DeliveryAgentProfile.findById(id);
    if (!profile) return next(ERR.NOT_FOUND("Perfil no encontrado"));

    profile.status = "SUSPENDED";
    await profile.save();

    emitToUser(profile.userId, "agent:suspended", { reason });

    await safeAudit(req, {
      action: "AGENT_SUSPENDED",
      entity: "DeliveryAgentProfile",
      entityId: String(profile._id),
      meta: { userId: String(profile.userId), reason },
    });

    return res.ok({ data: profile });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}
