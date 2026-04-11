import SupportTicket from "../models/supportTicket.model.js";
import { sendEmail } from "../config/emailService.js";
import upload from "../middlewares/multer.js";
import { ERR } from "../utils/httpError.js";
import { auditLog } from "../services/audit.service.js";

/** Util: mapea files de multer a attachments */
function mapFiles(files = []) {
  return files.map(f => ({
    url: f.path || f.location || f.secure_url || "", // según tu storage
    name: f.originalname,
    mimeType: f.mimetype,
    size: f.size
  }));
}

// No romper el flujo si falla la auditoría
async function safeAudit(req, payload) {
  try {
    await auditLog(req, payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("auditLog failed:", e?.message || e);
  }
}

// GET /api/support
export async function listTicketsController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;

    const { status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (!isSuper) filter.storeId = storeId;
    if (status) filter.status = status;
    if (q) filter.subject = { $regex: q, $options: "i" };

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
    const [items, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(+limit)
        .select("subject status priority category storeId orderId userId assignedTo lastMessageAt updatedAt")
        .lean(),
      SupportTicket.countDocuments(filter)
    ]);

    return res.ok({ error: false, success: true, data: items, total, page: +page, limit: +limit });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/support/:id (ver hilo)
export async function getTicketController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;

    const { id } = req.params;
    const t = await SupportTicket.findById(id).lean();
    if (!t) return next(ERR.NOT_FOUND("Ticket no encontrado"));
    if (!isSuper && String(t.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    return res.ok({ error: false, success: true, data: t });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// POST /api/support  (crear ticket: con adjuntos opcionales)
export const createTicketMdw = upload.array("files", 5);
export async function createTicketController(req, res, next) {
  try {
    const storeId = req.tenant?.storeId;
    if (!storeId) return next(ERR.TENANT_FORBIDDEN());

    const { subject, body, orderId, category, priority } = req.body;
    if (!subject || !body) return next(ERR.VALIDATION({ subject, body }));

    const attachments = mapFiles(req.files);

    const ticket = await SupportTicket.create({
      storeId,
      orderId: orderId || null,
      userId: req.userId,
      subject,
      category: category || "OTHER",
      priority: priority || "LOW",
      messages: [{
        authorId: req.userId,
        role: req.user?.role === "STORE_OWNER" ? "STORE" : "BUYER",
        body,
        attachments,
        seenBy: [req.userId]
      }],
      lastMessageAt: new Date()
    });

    // Notificación (ignora errores)
    sendEmail(process.env.SUPPORT_EMAIL || process.env.EMAIL,
      `[Ticket] ${subject}`,
      `Nuevo ticket en la tienda ${storeId}`,
      `<p>Nuevo ticket: ${subject}</p>`).catch(() => { });

    return res.status(201).json({ error: false, success: true, data: ticket });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// POST /api/support/:id/reply  (responder: con adjuntos opcionales)
export const replyTicketMdw = upload.array("files", 5);
export async function replyTicketController(req, res, next) {
  let ticket = null;
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;
    const { body } = req.body;

    if (!body) return next(ERR.VALIDATION({ body: "Requerido" }));

    ticket = await SupportTicket.findById(id);
    if (!ticket) return next(ERR.NOT_FOUND("Ticket no encontrado"));
    if (!isSuper && String(ticket.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    const role = req.user?.role === "STORE_OWNER" ? "STORE" :
      req.user?.role === "SUPER_ADMIN" ? "SUPPORT" : "BUYER";

    const attachments = mapFiles(req.files);

    ticket.messages.push({
      authorId: req.userId,
      role,
      body,
      attachments,
      seenBy: [req.userId]
    });
    ticket.lastMessageAt = new Date();
    if (ticket.status === "OPEN") ticket.status = "PENDING";

    await ticket.save();

    // ✅ Audit: respuesta
    await safeAudit(req, {
      action: "SUPPORT_REPLY",
      entity: "SupportTicket",
      entityId: String(ticket._id),
      meta: { length: (body || "").length, files: (req.files || []).length }
    });

    // Notificación (ignora errores)
    sendEmail(
      process.env.SUPPORT_EMAIL || process.env.EMAIL,
      `[Ticket#${ticket._id}] Nueva respuesta`,
      body,
      `<p>${body}</p>`
    ).catch(() => { });

    return res.ok({ error: false, success: true, data: ticket });
  } catch (e) {
    // ❌ Audit: error al responder
    await safeAudit(req, {
      action: "SUPPORT_REPLY",
      entity: "SupportTicket",
      entityId: String(ticket?._id || req.params?.id || ""),
      status: "ERROR",
      meta: { message: e?.message }
    });

    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/support/:id/close
export async function closeTicketController(req, res, next) {
  let ticket = null;
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;

    ticket = await SupportTicket.findById(id);
    if (!ticket) return next(ERR.NOT_FOUND("Ticket no encontrado"));
    if (!isSuper && String(ticket.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    ticket.status = "CLOSED";
    await ticket.save();

    // ✅ Audit: cierre
    await safeAudit(req, {
      action: "SUPPORT_CLOSE",
      entity: "SupportTicket",
      entityId: String(ticket._id)
    });

    return res.ok({ error: false, success: true, data: ticket });
  } catch (e) {
    // ❌ Audit: error al cerrar
    await safeAudit(req, {
      action: "SUPPORT_CLOSE",
      entity: "SupportTicket",
      entityId: String(ticket?._id || req.params?.id || ""),
      status: "ERROR",
      meta: { message: e?.message }
    });

    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/support/:id/assign
export async function assignTicketController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return next(ERR.VALIDATION({ userId: "Requerido" }));

    const ticket = await SupportTicket.findById(id);
    if (!ticket) return next(ERR.NOT_FOUND("Ticket no encontrado"));
    if (!isSuper && String(ticket.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    ticket.assignedTo = userId;
    if (ticket.status === "OPEN") ticket.status = "PENDING";
    await ticket.save();

    return res.ok({ error: false, success: true, data: ticket });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

/**
 * PATCH /api/support/:id/seen
 * Marca mensajes como "vistos" por el usuario autenticado.
 * - Si envías ?all=true marca todos; si pasas body { messageIds: [] } marca solo esos.
 */
export async function markSeenController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;
    const all = String(req.query.all || "").toLowerCase() === "true";
    const messageIds = Array.isArray(req.body?.messageIds) ? req.body.messageIds : null;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) return next(ERR.NOT_FOUND("Ticket no encontrado"));
    if (!isSuper && String(ticket.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    let changed = 0;
    if (all) {
      for (const m of ticket.messages) {
        if (!m.seenBy?.some(u => String(u) === String(req.userId))) {
          m.seenBy.push(req.userId);
          changed++;
        }
      }
    } else if (messageIds?.length) {
      const setIds = new Set(messageIds.map(String));
      for (const m of ticket.messages) {
        if (setIds.has(String(m._id)) && !m.seenBy?.some(u => String(u) === String(req.userId))) {
          m.seenBy.push(req.userId);
          changed++;
        }
      }
    }
    if (changed > 0) await ticket.save();

    return res.ok({ error: false, success: true, updated: changed });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}
