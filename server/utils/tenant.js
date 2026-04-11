// server/utils/tenant.js
export function tenantFilter(req, base = {}) {
  const isSuper = req.user?.role === 'SUPER_ADMIN';
  const sid = req.tenant?.storeId || null;
  // SUPER: global (no inyectamos storeId)
  if (isSuper) return { ...base };
  // No super: si hay storeId -> filtramos por tienda; si no hay, no filtramos.
  return sid ? { ...base, storeId: sid } : { ...base };
}

export function categoryTenantFilter(req, base = {}) {
  const isSuper = req.user?.role === 'SUPER_ADMIN';
  if (isSuper) return { ...base };
  const sid = req.tenant?.storeId || null;
  if (!sid) return { ...base };
  // Categorías pueden ser globales (storeId: null) O de tienda
  return { ...base, storeId: { $in: [sid, null] } };
}
