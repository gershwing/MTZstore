// admin/src/services/_contentUtils.js
export function toISOorNull(v) {
  if (!v) return null;
  // v viene como "YYYY-MM-DDTHH:mm"
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
