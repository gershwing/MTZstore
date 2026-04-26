// server/controllers/deliveryPartnership.controller.js
import DeliveryPartnership from "../models/deliveryPartnership.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import StoreModel from "../models/store.model.js";
import UserModel from "../models/user.model.js";
import { ERR } from "../utils/httpError.js";
import { auditLog } from "../services/audit.service.js";
import { emitToUser } from "../utils/socketEmitter.js";

async function safeAudit(req, payload) {
  try { await auditLog(req, payload); } catch { /* silencio */ }
}

// POST /api/delivery-partnerships — Agente solicita sociedad con tienda
export async function requestPartnership(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("No autorizado"));

    const { storeId, serviceType, notes } = req.body || {};
    if (!storeId || !serviceType) return next(ERR.VALIDATION("storeId y serviceType son requeridos"));
    if (!["express", "standard"].includes(serviceType)) return next(ERR.VALIDATION("serviceType debe ser 'express' o 'standard'"));

    // Standard solo por invitación de tienda/plataforma (seguridad: llevan múltiples productos)
    if (serviceType === "standard") {
      return next(ERR.VALIDATION("Las sociedades estandar solo pueden ser creadas por invitación de la tienda o plataforma"));
    }

    // Validar perfil de agente
    const profile = await DeliveryAgentProfile.findOne({ userId, status: "ACTIVE" });
    if (!profile) return next(ERR.VALIDATION("No tienes un perfil de agente activo"));
    if (!profile.approvedServiceTypes.includes(serviceType)) {
      return next(ERR.VALIDATION(`No tienes el tipo de servicio '${serviceType}' aprobado`));
    }

    // Validar tienda
    const store = await StoreModel.findById(storeId);
    if (!store || store.status !== "active") return next(ERR.NOT_FOUND("Tienda no encontrada o inactiva"));

    // Crear partnership
    let partnership;
    try {
      partnership = await DeliveryPartnership.create({
        agentId: userId,
        storeId,
        serviceType,
        status: "PENDING",
        requestedBy: "agent",
        notes: notes || undefined,
      });
    } catch (err) {
      if (err.code === 11000) return next(ERR.CONFLICT("Ya existe una sociedad con esta tienda para este tipo de servicio"));
      throw err;
    }

    // Notificar al dueño de la tienda
    if (store.ownerId) {
      emitToUser(store.ownerId, "partnership:requested", {
        partnershipId: partnership._id,
        agentName: req.user?.name || "Agente",
        storeName: store.name,
        serviceType,
      });
    }

    await safeAudit(req, {
      action: "PARTNERSHIP_REQUESTED",
      entity: "DeliveryPartnership",
      entityId: String(partnership._id),
      meta: { storeId: String(storeId), serviceType },
    });

    return res.ok({ data: partnership });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// POST /api/delivery-partnerships/invite — Tienda invita agente
export async function invitePartnership(req, res, next) {
  try {
    const storeId = req.tenant?.storeId;
    if (!storeId) return next(ERR.VALIDATION("Se requiere contexto de tienda"));

    const { agentId, serviceType, notes } = req.body || {};
    if (!agentId || !serviceType) return next(ERR.VALIDATION("agentId y serviceType son requeridos"));
    if (!["express", "standard"].includes(serviceType)) return next(ERR.VALIDATION("serviceType inválido"));

    // Validar agente
    const profile = await DeliveryAgentProfile.findOne({ userId: agentId, status: "ACTIVE" });
    if (!profile) return next(ERR.NOT_FOUND("Agente no encontrado o inactivo"));
    if (!profile.approvedServiceTypes.includes(serviceType)) {
      return next(ERR.VALIDATION(`El agente no tiene el tipo '${serviceType}' aprobado`));
    }

    let partnership;
    try {
      partnership = await DeliveryPartnership.create({
        agentId,
        storeId,
        serviceType,
        status: "PENDING",
        requestedBy: "store",
        notes: notes || undefined,
      });
    } catch (err) {
      if (err.code === 11000) return next(ERR.CONFLICT("Ya existe una sociedad con este agente para este tipo de servicio"));
      throw err;
    }

    // Notificar al agente
    const store = await StoreModel.findById(storeId).select("name").lean();
    emitToUser(agentId, "partnership:invited", {
      partnershipId: partnership._id,
      storeName: store?.name || "Tienda",
      serviceType,
    });

    await safeAudit(req, {
      action: "PARTNERSHIP_INVITED",
      entity: "DeliveryPartnership",
      entityId: String(partnership._id),
      meta: { agentId: String(agentId), serviceType },
    });

    return res.ok({ data: partnership });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-partnerships/me — Agente ve sus sociedades
export async function getMyPartnerships(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { status, serviceType, page = 1, limit = 50 } = req.query;

    const filter = { agentId: userId };
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [items, total] = await Promise.all([
      DeliveryPartnership.find(filter)
        .populate("storeId", "name branding status")
        .sort({ updatedAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryPartnership.countDocuments(filter),
    ]);

    return res.ok({ data: items, total, page: +page, limit: limitN });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-partnerships/my-store — Tienda ve sus sociedades
export async function getStorePartnerships(req, res, next) {
  try {
    const storeId = req.tenant?.storeId;
    if (!storeId) return next(ERR.VALIDATION("Se requiere contexto de tienda"));

    const { status, serviceType, page = 1, limit = 50 } = req.query;
    const filter = { storeId };
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [items, total] = await Promise.all([
      DeliveryPartnership.find(filter)
        .populate("agentId", "name email phone")
        .sort({ updatedAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryPartnership.countDocuments(filter),
    ]);

    // Enriquecer con trust level del agente
    const agentIds = [...new Set(items.map((p) => String(p.agentId?._id || p.agentId)))];
    const profiles = await DeliveryAgentProfile.find({ userId: { $in: agentIds } })
      .select("userId platformTrustLevel stats").lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const enriched = items.map((p) => ({
      ...p,
      agentProfile: profileMap.get(String(p.agentId?._id || p.agentId)) || null,
    }));

    return res.ok({ data: enriched, total, page: +page, limit: limitN });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-partnerships/:id/accept
export async function acceptPartnership(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;

    const partnership = await DeliveryPartnership.findById(id);
    if (!partnership) return next(ERR.NOT_FOUND("Sociedad no encontrada"));
    if (partnership.status !== "PENDING") return next(ERR.VALIDATION("Solo se pueden aceptar sociedades pendientes"));

    // Validar que el acceptor es la parte contraria
    const storeId = req.tenant?.storeId;
    if (partnership.requestedBy === "agent") {
      // Solo la tienda puede aceptar
      if (!storeId || String(partnership.storeId) !== String(storeId)) {
        return next(ERR.VALIDATION("Solo la tienda puede aceptar esta solicitud"));
      }
    } else {
      // Solo el agente puede aceptar
      if (String(partnership.agentId) !== String(userId)) {
        return next(ERR.VALIDATION("Solo el agente puede aceptar esta invitación"));
      }
    }

    partnership.status = "ACTIVE";
    partnership.respondedAt = new Date();
    partnership.respondedBy = userId;
    await partnership.save();

    // Notificar al solicitante
    const notifyId = partnership.requestedBy === "agent" ? partnership.agentId : partnership.storeId;
    const store = await StoreModel.findById(partnership.storeId).select("name ownerId").lean();
    const targetUserId = partnership.requestedBy === "agent" ? partnership.agentId : store?.ownerId;
    if (targetUserId) {
      emitToUser(targetUserId, "partnership:accepted", {
        partnershipId: partnership._id,
        serviceType: partnership.serviceType,
      });
    }

    await safeAudit(req, {
      action: "PARTNERSHIP_ACCEPTED",
      entity: "DeliveryPartnership",
      entityId: String(partnership._id),
    });

    return res.ok({ data: partnership });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-partnerships/:id/reject
export async function rejectPartnership(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;
    const { reason = "" } = req.body || {};

    const partnership = await DeliveryPartnership.findById(id);
    if (!partnership) return next(ERR.NOT_FOUND("Sociedad no encontrada"));
    if (partnership.status !== "PENDING") return next(ERR.VALIDATION("Solo se pueden rechazar sociedades pendientes"));

    // Validar que el rejector es la parte contraria
    const storeId = req.tenant?.storeId;
    if (partnership.requestedBy === "agent") {
      if (!storeId || String(partnership.storeId) !== String(storeId)) {
        return next(ERR.VALIDATION("Solo la tienda puede rechazar esta solicitud"));
      }
    } else {
      if (String(partnership.agentId) !== String(userId)) {
        return next(ERR.VALIDATION("Solo el agente puede rechazar esta invitación"));
      }
    }

    partnership.status = "REJECTED";
    partnership.rejectionReason = reason || "Rechazado";
    partnership.respondedAt = new Date();
    partnership.respondedBy = userId;
    await partnership.save();

    // Notificar
    const store = await StoreModel.findById(partnership.storeId).select("ownerId").lean();
    const targetUserId = partnership.requestedBy === "agent" ? partnership.agentId : store?.ownerId;
    if (targetUserId) {
      emitToUser(targetUserId, "partnership:rejected", {
        partnershipId: partnership._id,
        reason: partnership.rejectionReason,
      });
    }

    await safeAudit(req, {
      action: "PARTNERSHIP_REJECTED",
      entity: "DeliveryPartnership",
      entityId: String(partnership._id),
      meta: { reason },
    });

    return res.ok({ data: partnership });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-partnerships/:id/suspend
export async function suspendPartnership(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;
    const { reason = "" } = req.body || {};

    if (!reason || reason.trim().length < 3) return next(ERR.VALIDATION("Se requiere un motivo (mínimo 3 caracteres)"));

    const partnership = await DeliveryPartnership.findById(id);
    if (!partnership) return next(ERR.NOT_FOUND("Sociedad no encontrada"));
    if (partnership.status !== "ACTIVE") return next(ERR.VALIDATION("Solo se pueden suspender sociedades activas"));

    // Cualquier lado puede suspender
    const storeId = req.tenant?.storeId;
    const isAgent = String(partnership.agentId) === String(userId);
    const isStore = storeId && String(partnership.storeId) === String(storeId);
    if (!isAgent && !isStore) return next(ERR.VALIDATION("No tienes permiso para suspender esta sociedad"));

    partnership.status = "SUSPENDED";
    partnership.suspendedAt = new Date();
    partnership.suspendedBy = userId;
    partnership.suspensionReason = reason;
    await partnership.save();

    // Notificar al otro lado
    const store = await StoreModel.findById(partnership.storeId).select("ownerId").lean();
    const targetUserId = isAgent ? store?.ownerId : partnership.agentId;
    if (targetUserId) {
      emitToUser(targetUserId, "partnership:suspended", {
        partnershipId: partnership._id,
        reason,
      });
    }

    await safeAudit(req, {
      action: "PARTNERSHIP_SUSPENDED",
      entity: "DeliveryPartnership",
      entityId: String(partnership._id),
      meta: { reason, by: isAgent ? "agent" : "store" },
    });

    return res.ok({ data: partnership });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-partnerships/available-agents — Agentes disponibles para invitar
export async function getAvailableAgents(req, res, next) {
  try {
    const storeId = req.tenant?.storeId;
    if (!storeId) return next(ERR.VALIDATION("Se requiere contexto de tienda"));

    const { serviceType, city, page = 1, limit = 20 } = req.query;

    // Agentes activos con el serviceType
    const profileFilter = { status: "ACTIVE" };
    if (serviceType) profileFilter.approvedServiceTypes = serviceType;

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    // Excluir agentes que ya tienen partnership con esta tienda (del mismo serviceType)
    const existingFilter = { storeId };
    if (serviceType) existingFilter.serviceType = serviceType;
    const existing = await DeliveryPartnership.find(existingFilter).select("agentId").lean();
    const excludeIds = existing.map((p) => p.agentId);

    if (excludeIds.length) profileFilter.userId = { $nin: excludeIds };

    // Filtro por ciudad (buscar en la application del agente)
    // Por ahora retornamos todos y filtramos post-query si hay city
    const [profiles, total] = await Promise.all([
      DeliveryAgentProfile.find(profileFilter)
        .populate("userId", "name email phone")
        .sort({ "stats.rating": -1, "stats.totalDeliveries": -1 })
        .skip(skip).limit(limitN).lean(),
      DeliveryAgentProfile.countDocuments(profileFilter),
    ]);

    return res.ok({ data: profiles, total, page: +page, limit: limitN });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-partnerships/available-stores — Tiendas disponibles para solicitar
export async function getAvailableStores(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { serviceType, page = 1, limit = 20 } = req.query;

    // Tiendas activas
    const storeFilter = { status: "active" };

    // Excluir tiendas donde ya tiene partnership del mismo serviceType
    const existingFilter = { agentId: userId };
    if (serviceType) existingFilter.serviceType = serviceType;
    const existing = await DeliveryPartnership.find(existingFilter).select("storeId").lean();
    const excludeIds = existing.map((p) => p.storeId);
    if (excludeIds.length) storeFilter._id = { $nin: excludeIds };

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [stores, total] = await Promise.all([
      StoreModel.find(storeFilter)
        .select("name slug branding categoryId delivery")
        .sort({ name: 1 }).skip(skip).limit(limitN).lean(),
      StoreModel.countDocuments(storeFilter),
    ]);

    return res.ok({ data: stores, total, page: +page, limit: limitN });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}
