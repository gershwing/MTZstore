// admin/src/services/stores.js
import { api } from "../utils/api";

/** Rutas base */
const BASES = {
  SING: "/api/store",
  PLUR: "/api/stores",          // por si existe la variante plural en tu backend
  MY_STORES: "/api/store/stores/me", // listado de tiendas del usuario (sin tenant)
};

/** Errores que justifican fallback a la ruta alternativa */
const FALLBACK_STATUS = new Set([404, 405]);

/**
 * Intentar ruta singular y, si NO existe (404/405), caer a la plural.
 * Para otros errores (401, 403, 500, timeout) re-lanza y no oculta el problema real.
 */
async function trySingThenPlural(reqSing, reqPlur) {
  try {
    const r = await reqSing();
    return r.data;
  } catch (e) {
    const st = e?.response?.status;
    if (!FALLBACK_STATUS.has(st)) throw e; // ← no enmascarar auth/tenant
    const r = await reqPlur();
    return r.data;
  }
}

/** Opciones comunes para GET sin cache */
function noCache(extra = {}) {
  return {
    params: { _ts: Date.now(), ...(extra.params || {}) },
    headers: { Accept: "application/json", ...(extra.headers || {}) },
    timeout: extra.timeout ?? 15000,
    ...extra,
  };
}

/** ================== LISTAR (plataforma) ==================
 * Devuelve { data, total, page, limit } sin exigir X-Store-Id
 */
export async function listStores({ page = 1, limit = 20, q = "" } = {}) {
  const params = { page, limit, q };
  const res = await api.get(BASES.SING, noCache({ params, omitTenantHeader: true, __noTenant: true, __noRetry401: true }));
  const payload = res?.data?.data ?? res?.data ?? {};
  const data = Array.isArray(payload) ? payload : (payload?.rows || payload?.stores || payload?.data || []);
  const total = payload?.total ?? res?.data?.total ?? (Array.isArray(data) ? data.length : 0);
  return { data, total, page, limit };
}

/** ================== MIS TIENDAS (owner/miembro) ==================
 * Llama a GET /api/store/stores/me sin enviar X-Store-Id
 */
export async function listMyStores() {
  const res = await api.get(
    BASES.MY_STORES,
    noCache({ omitTenantHeader: true, __noTenant: true, __noRetry401: true })
  );
  return res?.data?.data || res?.data?.stores || [];
}

/** ================== DETALLE DE TIENDA ==================
 * Requiere X-Store-Id (o slug). Puedes pasar tenantId para forzar header.
 */
export async function getStoreById(id, { tenantId, timeout = 15000 } = {}) {
  if (!id) throw new Error("id requerido");
  const sid = String(id);
  const headers = tenantId ? { "X-Store-Id": String(tenantId) } : {};
  const data = await trySingThenPlural(
    () => api.get(`${BASES.SING}/${sid}`, noCache({ headers, __noRetry401: true, timeout })),
    () => api.get(`${BASES.PLUR}/${sid}`, noCache({ headers, __noRetry401: true, timeout }))
  );
  // backend puede devolver {row} / {data} / objeto directo
  return data?.row ?? data?.data ?? data;
}

/** ================== CREAR TIENDA ================== */
export function createStore(body, { tenantId, timeout = 15000 } = {}) {
  const headers = tenantId ? { "X-Store-Id": String(tenantId) } : {};
  return trySingThenPlural(
    () => api.post(BASES.SING, body, { headers, __noRetry401: true, timeout }),
    () => api.post(BASES.PLUR, body, { headers, __noRetry401: true, timeout })
  ).then(r => r); // devolvemos response.data de trySingThenPlural
}

/** ================== ACTUALIZAR TIENDA ================== */
export function updateStore(id, body, { tenantId, timeout = 15000 } = {}) {
  const headers = tenantId ? { "X-Store-Id": String(tenantId) } : {};
  return trySingThenPlural(
    () => api.put(`${BASES.SING}/${id}`, body, { headers, __noRetry401: true, timeout }),
    () => api.put(`${BASES.PLUR}/${id}`, body, { headers, __noRetry401: true, timeout })
  ).then(r => r);
}

/** ================== ELIMINAR TIENDA ================== */
export function deleteStore(id, { tenantId, timeout = 15000 } = {}) {
  const headers = tenantId ? { "X-Store-Id": String(tenantId) } : {};
  return trySingThenPlural(
    () => api.delete(`${BASES.SING}/${id}`, { headers, __noRetry401: true, timeout }),
    () => api.delete(`${BASES.PLUR}/${id}`, { headers, __noRetry401: true, timeout })
  ).then(r => r);
}

/** ================== CAMBIAR STATUS ================== */
export function patchStoreStatus(id, status, { tenantId, timeout = 15000 } = {}) {
  const headers = tenantId ? { "X-Store-Id": String(tenantId) } : {};
  const payload = { status };
  return trySingThenPlural(
    () => api.patch(`${BASES.SING}/${id}/status`, payload, { headers, __noRetry401: true, timeout }),
    () => api.patch(`${BASES.PLUR}/${id}/status`, payload, { headers, __noRetry401: true, timeout })
  ).then(r => r);
}
