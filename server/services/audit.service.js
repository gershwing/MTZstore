// server/services/audit.service.js
import AuditLog from "../models/auditLog.model.js";

export async function auditLog(req, { action, entity, entityId, status = "OK", meta = {} }) {
  try {
    await AuditLog.create({
      actorId: req.userId || req.user?._id,
      actorRole: req.user?.role,
      tenantStoreId: req.tenant?.storeId,
      action, entity, entityId, status,
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta
    });
  } catch (_) { /* no tirar el flujo por errores de log */ }
}
