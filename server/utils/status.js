// server/utils/status.js

/** normaliza "disabled/deactive/inactive" -> "suspended"; solo acepta "active" o "suspended" */
export function pickStatus(s) {
  const x = String(s || '').trim().toLowerCase();
  if (!x) return undefined;
  if (['disabled', 'deactive', 'inactive'].includes(x)) return 'suspended';
  return ['active', 'suspended'].includes(x) ? x : undefined;
}

/** para filtros Mongoose: devuelve { $regex: '^active$', $options: 'i' } o null */
export function normStatusFilter(s) {
  const wanted = pickStatus(s);
  return wanted ? { $regex: `^${wanted}$`, $options: 'i' } : null;
}

/** helper básico de strings */
export function normalizeStr(s) {
  return String(s || '').trim();
}
