// admin/src/utils/buildListParams.js

/** Convierte fechas a ISO “local” con offset, evitando el corrimiento a UTC */
function toIsoWithOffset(date, endOfDay = false) {
  if (!date) return undefined;
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return undefined;

  if (endOfDay) {
    // 23:59:59.999 local
    d.setHours(23, 59, 59, 999);
  } else {
    // 00:00:00.000 local
    d.setHours(0, 0, 0, 0);
  }
  // Representación con offset local (no forzar a UTC)
  const tzOffsetMin = d.getTimezoneOffset(); // e.g. 240 para La Paz (UTC-4)
  const sign = tzOffsetMin <= 0 ? "+" : "-";
  const pad = (n, s = 2) => String(Math.abs(n)).padStart(s, "0");
  const offset = `${sign}${pad(Math.floor(Math.abs(tzOffsetMin) / 60))}:${pad(Math.abs(tzOffsetMin) % 60)}`;

  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.${ms}${offset}`;
}

/** Serializa arrays como CSV: ['a','b'] -> "a,b" */
function toCsv(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(",");
  return v;
}

/** Coerce int positivo */
function posInt(v, def) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : def;
}

/**
 * Construye un objeto params limpio para axios a partir de filtros.
 * Mantiene compatibilidad con tu versión original.
 *
 * @param {Object} filters - { q, status, role, storeId, dateFrom, dateTo, page, limit, sort }
 * @param {Object} base    - params base a mezclar
 * @returns {Object} params listos para axios.get(url, { params })
 */
export function buildListParams(filters = {}, base = {}) {
  const {
    q,
    status,
    role,
    storeId,
    dateFrom,
    dateTo,
    page,
    limit,
    sort, // e.g. "-createdAt" o "name"
    // extras soportadas pero opcionales:
    include, // e.g. ['memberships','roles']
  } = filters || {};

  const params = { ...base };

  if (q) params.q = String(q).trim();
  if (status) params.status = toCsv(status);
  if (role) params.role = toCsv(role);
  if (storeId) params.storeId = String(storeId).trim();

  // Rango de fechas con zona local (evita shift a UTC)
  const fromIso = toIsoWithOffset(dateFrom, false);
  const toIso = toIsoWithOffset(dateTo, true);
  if (fromIso) params.dateFrom = fromIso;
  if (toIso) params.dateTo = toIso;

  // Paginación
  const p = posInt(page, undefined);
  if (p) params.page = p;
  const l = posInt(limit, undefined);
  if (l) params.limit = l;

  if (sort) params.sort = String(sort).trim();
  if (include && include.length) params.include = toCsv(include);

  return params;
}

/**
 * Construye un querystring a partir de los params (si necesitas `?a=1&b=2`).
 * @param {Object} params
 * @returns {string} Ej: "?q=foo&status=active"
 */
export function buildSearch(params = {}) {
  const esc = encodeURIComponent;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${entries.map(([k, v]) => `${esc(k)}=${esc(v)}`).join("&")}`;
}
