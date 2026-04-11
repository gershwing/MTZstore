// server/controllers/audit.controller.js
import AuditLog from "../models/auditLog.model.js";
import { ERR } from "../utils/httpError.js";

function buildAuditFilter(req) {
  const { actorId, storeId, action, status, from, to, q } = req.query;

  const isSuper = req.user?.role === "SUPER_ADMIN";
  const tenantStoreId = req?.tenant?.storeId || null;

  const filter = {};
  // Multitienda: si no es SUPER_ADMIN, fija la tienda actual
  if (!isSuper && tenantStoreId) filter.tenantStoreId = tenantStoreId;
  if (isSuper && storeId) filter.tenantStoreId = storeId;

  if (actorId) filter.actorId = actorId;
  if (action) filter.action = action;
  if (status) filter.status = status;

  // Rango de fechas por campo 'at'
  if (from || to) {
    filter.at = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }

  // Búsqueda ligera en meta o entity
  if (q) {
    filter.$or = [
      { entity: { $regex: q, $options: "i" } },
      { action: { $regex: q, $options: "i" } },
      { "meta.message": { $regex: q, $options: "i" } },
    ];
  }

  return filter;
}

/** GET /api/audit/logs?actorId=&storeId=&action=&status=&from=&to=&page=&limit=&q= */
export async function listAuditLogsController(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = buildAuditFilter(req);

    const p = Math.max(1, +page);
    const l = Math.max(1, +limit);
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ at: -1 }).skip(skip).limit(l).lean(),
      AuditLog.countDocuments(filter),
    ]);

    const payload = { error: false, success: true, data: items, total, page: p, limit: l };
    return res.ok?.(payload) || res.json(payload);
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/audit/logs/export.json
export async function exportAuditLogsJSONController(req, res, next) {
  try {
    const filter = buildAuditFilter(req);
    const cursor = AuditLog.find(filter).sort({ at: -1 }).lean().cursor();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="audit-logs.json"');

    res.write("[");
    let first = true;
    for await (const doc of cursor) {
      if (!first) res.write(",");
      first = false;
      res.write(JSON.stringify(doc));
    }
    res.write("]");
    res.end();
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/audit/logs/export.csv
export async function exportAuditLogsCSVController(req, res, next) {
  try {
    const filter = buildAuditFilter(req);
    const cursor = AuditLog.find(filter).sort({ at: -1 }).lean().cursor();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="audit-logs.csv"');

    // Cabeceras CSV (ajusta si quieres más/menos columnas)
    const headers = [
      "at", "action", "entity", "entityId", "status",
      "actorId", "actorRole", "tenantStoreId", "ip", "ua", "meta"
    ];
    res.write(headers.join(",") + "\n");

    // Writer simple (escapado mínimo para comas y comillas)
    const esc = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    for await (const d of cursor) {
      const row = [
        d.at ? new Date(d.at).toISOString() : "",
        d.action ?? "",
        d.entity ?? "",
        d.entityId ?? "",
        d.status ?? "",
        d.actorId ?? "",
        d.actorRole ?? "",
        d.tenantStoreId ?? "",
        d.ip ?? "",
        d.ua ?? "",
        JSON.stringify(d.meta ?? {}),
      ].map(esc).join(",");
      res.write(row + "\n");
    }
    res.end();
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// === NUEVO: /api/audit/actions-stats ===
export async function actionsStatsController(req, res, next) {
  try {
    const {
      storeId, from, to, actorId, status, q, limit = 50,
    } = req.query;

    // Reutilizamos el mismo filtro que usas para /logs:
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const tenantStoreId = req?.tenant?.storeId || null;

    const match = {};
    if (!isSuper && tenantStoreId) match.tenantStoreId = tenantStoreId;
    if (isSuper && storeId) match.tenantStoreId = storeId;
    if (actorId) match.actorId = actorId;
    if (status) match.status = status;
    if (from || to) {
      match.at = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }
    if (q) {
      match.$or = [
        { entity: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
        { "meta.message": { $regex: q, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: match },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(1, parseInt(limit, 10)) },
      { $project: { _id: 0, action: "$_id", count: 1 } },
    ];

    const data = await (await import("../models/auditLog.model.js")).default
      .aggregate(pipeline);

    return res.json({ error: false, success: true, data });
  } catch (e) {
    return next(e);
  }
}
