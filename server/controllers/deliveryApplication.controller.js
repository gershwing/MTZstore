// server/controllers/deliveryApplication.controller.js
import DeliveryApplication from "../models/deliveryApplication.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import User from "../models/user.model.js";

// Emails (best-effort)
import sendEmailFun from "../config/sendEmail.js";
import deliveryReceived from "../utils/emailTemplates/deliveryReceived.js";
import deliveryApprovedTemplate from "../utils/emailTemplates/deliveryApproved.js";
import deliveryRejectedTemplate from "../utils/emailTemplates/deliveryRejected.js";

const SHOULD_SEND_EMAILS = String(process.env.SEND_EMAILS ?? "true") !== "false";
const DEFAULT_FROM = process.env.EMAIL_FROM || "MTZstore <no-reply@mtzstore.com>";

// Helper para crear errores con status
function httpError(status, message) {
  const e = new Error(message || "Error");
  e.status = status;
  return e;
}

/* =========================
 * GET /api/delivery-applications/me
 * ========================= */
export async function getMyDeliveryApp(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) throw httpError(401, "No autorizado");

    const doc = await DeliveryApplication.findOne({ userId }).lean();
    return res.json({ error: false, data: doc || null });
  } catch (e) {
    next(e);
  }
}

/* =========================
 * POST /api/delivery-applications
 *  - Evita duplicados si ya hay PENDING o APPROVED
 *  - Crea con status PENDING
 *  - Envía email de recibido (best-effort)
 *  - Registra reviews[SUBMITTED]
 * ========================= */
export async function createDeliveryApp(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) throw httpError(401, "No autorizado");

    // Bloquea si ya existe en revisión o aprobada
    const exists = await DeliveryApplication.findOne({
      userId,
      status: { $in: ["PENDING", "APPROVED"] },
    }).lean();

    if (exists) {
      return res
        .status(409)
        .json({ error: true, message: "Ya tienes una postulación en revisión o aprobada" });
    }

    const {
      fullName,
      phone,
      vehicleType,
      city,
      documentNumber,
      plateNumber,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      licenseUrl,
      // Delivery V2
      serviceTypesRequested,
      vehicleExpress,
      vehicleStandard,
    } = req.body || {};

    const motor = ["Moto", "Auto", "Camioneta"].includes(vehicleType);

    // Validaciones mínimas
    const missing = [];
    if (!fullName) missing.push("nombre");
    if (!phone) missing.push("teléfono");
    if (!vehicleType) missing.push("tipo de vehículo");
    if (!city) missing.push("ciudad");
    if (!documentNumber) missing.push("documento");
    if (!idFrontUrl) missing.push("CI anverso");
    if (!idBackUrl) missing.push("CI reverso");
    if (!selfieUrl) missing.push("selfie con CI");
    if (motor && !plateNumber) missing.push("matrícula");
    if (motor && !licenseUrl) missing.push("licencia de conducir");

    if (missing.length) {
      return res.status(400).json({
        error: true,
        message: `Faltan campos: ${missing.join(", ")}`,
      });
    }

    const doc = await DeliveryApplication.create({
      userId,
      fullName,
      phone,
      vehicleType,
      city,
      documentNumber,
      plateNumber,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      licenseUrl,
      status: "PENDING",
      // Delivery V2
      serviceTypesRequested: Array.isArray(serviceTypesRequested) && serviceTypesRequested.length
        ? serviceTypesRequested
        : ["express"],
      vehicleExpress: vehicleExpress || undefined,
      vehicleStandard: vehicleStandard || undefined,
      reviews: [
        {
          action: "SUBMITTED",
          by: userId,
          at: new Date(),
        },
      ],
    });

    // Email de recibido (best-effort, silencioso)
    if (SHOULD_SEND_EMAILS) {
      (async () => {
        try {
          const to = req.user?.email;
          if (to) {
            const tpl = deliveryReceived({ name: req.user?.name || "Postulante" });
            await sendEmailFun({
              sendTo: to,
              subject: tpl.subject || "MTZstore: Recibimos tu postulación como Delivery",
              html: tpl.html,
              from: DEFAULT_FROM,
            });
          }
        } catch {
          /* silencio */
        }
      })();
    }

    return res.status(201).json({ error: false, data: doc });
  } catch (e) {
    next(e);
  }
}

/* =========================
 * GET /api/delivery-applications/admin
 *  - Listado admin con filtros simples (q, status, city, vehicleType)
 *  - Paginación básica (page, limit)
 * ========================= */
export async function listDeliveryAppsAdmin(req, res, next) {
  try {
    const {
      q = "",
      status = "",
      city = "",
      vehicleType = "",
      page = 1,
      limit = 20,
    } = req.query || {};

    const filt = { deletedAt: null };
    const like = String(q || "").trim();

    if (status) filt.status = status;
    if (city) filt.city = city;
    if (vehicleType) filt.vehicleType = vehicleType;
    if (like) {
      filt.$or = [
        { fullName: { $regex: like, $options: "i" } },
        { phone: { $regex: like, $options: "i" } },
        { documentNumber: { $regex: like, $options: "i" } },
        { plateNumber: { $regex: like, $options: "i" } },
      ];
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const [items, total] = await Promise.all([
      DeliveryApplication.find(filt)
        .populate("userId", "name email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      DeliveryApplication.countDocuments(filt),
    ]);

    return res.json({
      error: false,
      items,
      total,
      totalPages: Math.ceil(total / l),
      page: p,
      limit: l,
    });
  } catch (e) {
    next(e);
  }
}

/* =========================
 * POST /api/delivery-applications/:id/approve
 *  - Soporta aprobación granular por tipo (body.serviceType) o global (legacy)
 *  - Marca APPROVED, limpia reason
 *  - Asigna rol DELIVERY_AGENT
 *  - Crea/actualiza DeliveryAgentProfile
 *  - Email de aprobación (best-effort)
 *  - Registra reviews[APPROVED]
 * ========================= */
export async function approveDeliveryApp(req, res, next) {
  try {
    const { id } = req.params;
    const { serviceType } = req.body || {}; // 'express' | 'standard' | undefined (legacy global)

    const app = await DeliveryApplication.findById(id);
    if (!app) throw httpError(404, "Postulación no encontrada.");

    // Determinar qué tipos aprobar
    const typesToApprove = serviceType
      ? [serviceType]
      : (app.serviceTypesRequested?.length ? [...app.serviceTypesRequested] : ["express"]);

    // Validar tipos
    for (const t of typesToApprove) {
      if (!["express", "standard"].includes(t)) throw httpError(400, `Tipo de servicio inválido: ${t}`);
    }

    // Actualizar reviewNotesByType
    const now = new Date();
    if (!app.reviewNotesByType) app.reviewNotesByType = {};
    for (const t of typesToApprove) {
      app.reviewNotesByType[t] = {
        reviewedBy: req.user?._id,
        reviewedAt: now,
        notes: "",
        status: "APPROVED",
      };
    }

    // Actualizar approvedServiceTypes (merge con existentes)
    const approved = new Set([...(app.approvedServiceTypes || []), ...typesToApprove]);
    app.approvedServiceTypes = [...approved];

    // Status global: APPROVED si al menos un tipo aprobado
    app.status = "APPROVED";
    app.reason = undefined;
    app.reviewedBy = req.user?._id;
    if (!app.serviceTypesRequested?.length) app.serviceTypesRequested = ["express"];

    // historial
    app.reviews.push({
      action: "APPROVED",
      by: req.user?._id,
      at: now,
      reason: serviceType ? `Tipo: ${serviceType}` : "Global",
    });

    await app.save();

    // Rol DELIVERY_AGENT — asignar platformRole
    const u = await User.findById(app.userId);
    if (u) {
      if (u.platformRole !== "DELIVERY_AGENT") {
        u.platformRole = "DELIVERY_AGENT";
        await u.save();
      }
    }

    // Delivery V2: crear o actualizar DeliveryAgentProfile
    let profile = await DeliveryAgentProfile.findOne({ userId: app.userId });
    if (!profile) {
      profile = await DeliveryAgentProfile.create({
        userId: app.userId,
        approvedServiceTypes: app.approvedServiceTypes,
        platformTrustLevel: "BASIC",
        status: "ACTIVE",
        vehicles: {
          express: app.vehicleExpress?.vehicleType
            ? app.vehicleExpress
            : (app.approvedServiceTypes.includes("express")
              ? { vehicleType: app.vehicleType, licensePlate: app.plateNumber, licensePhotoUrl: app.licenseUrl }
              : null),
          standard: app.vehicleStandard?.vehicleType ? app.vehicleStandard : null,
        },
      });
    } else {
      // Actualizar profile existente con nuevos tipos
      const profileTypes = new Set([...(profile.approvedServiceTypes || []), ...typesToApprove]);
      profile.approvedServiceTypes = [...profileTypes];

      // Actualizar vehículos si corresponde
      for (const t of typesToApprove) {
        if (t === "express" && !profile.vehicles?.express?.vehicleType && app.vehicleExpress?.vehicleType) {
          profile.vehicles = { ...profile.vehicles, express: app.vehicleExpress };
        }
        if (t === "standard" && !profile.vehicles?.standard?.vehicleType && app.vehicleStandard?.vehicleType) {
          profile.vehicles = { ...profile.vehicles, standard: app.vehicleStandard };
        }
      }
      await profile.save();
    }

    // Email de aprobación
    if (SHOULD_SEND_EMAILS && u?.email) {
      (async () => {
        try {
          const html = deliveryApprovedTemplate({ userName: u?.name || "Usuario" });
          await sendEmailFun({
            sendTo: u.email,
            subject: "MTZstore: ¡Tu postulación como Delivery fue aprobada!",
            html,
            from: DEFAULT_FROM,
          });
        } catch {
          /* silencio */
        }
      })();
    }

    return res.json({ error: false, data: app });
  } catch (e) {
    next(e);
  }
}

/* =========================
 * POST /api/delivery-applications/:id/reject
 *  - Marca REJECTED con reason
 *  - Email de rechazo con motivo (best-effort)
 *  - Registra reviews[REJECTED]
 * ========================= */
export async function rejectDeliveryApp(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body || {};

    const app = await DeliveryApplication.findById(id);
    if (!app) throw httpError(404, "Postulación no encontrada.");

    app.status = "REJECTED";
    app.reason = String(reason || "No cumple con los requisitos.");
    app.reviewedBy = req.user?._id;

    // historial
    app.reviews.push({
      action: "REJECTED",
      by: req.user?._id,
      at: new Date(),
      reason: app.reason,
    });

    await app.save();

    const u = await User.findById(app.userId).select("name email").lean().catch(() => null);

    if (SHOULD_SEND_EMAILS && u?.email) {
      (async () => {
        try {
          const html = deliveryRejectedTemplate({
            userName: u?.name || "Usuario",
            reason: app.reason,
          });
          await sendEmailFun({
            sendTo: u.email,
            subject: "MTZstore: Tu postulación como Delivery fue rechazada",
            html,
            from: DEFAULT_FROM,
          });
        } catch {
          /* silencio */
        }
      })();
    }

    return res.json({ error: false, data: app });
  } catch (e) {
    next(e);
  }
}

/* =========================
 * DELETE /api/delivery-applications/admin/:id
 *  - Soft-delete (sets deletedAt)
 *  - No permite eliminar APPROVED
 * ========================= */
export async function deleteDeliveryApp(req, res, next) {
  try {
    const { id } = req.params;

    const app = await DeliveryApplication.findById(id);
    if (!app) throw httpError(404, "Postulación no encontrada.");

    if (app.status === "APPROVED") {
      throw httpError(400, "No se puede eliminar una postulación aprobada.");
    }

    app.deletedAt = new Date();
    await app.save();

    return res.json({ error: false, message: "Postulación eliminada." });
  } catch (e) {
    next(e);
  }
}
