// admin/src/services/sellerApps.js
import { api } from "@/utils/api";

/* ============ Normalizador (lista admin) ============ */
function norm(resp, params = {}) {
  const root = resp?.data ?? resp ?? {};
  const data = root?.data ?? root;

  const items = data?.items ?? data?.rows ?? data?.results ?? [];
  const total = Number.isFinite(data?.total) ? data.total : (Array.isArray(items) ? items.length : 0);
  const page = Number.isFinite(data?.page) ? data.page : Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const totalPages = Number.isFinite(data?.totalPages)
    ? data.totalPages
    : Math.max(1, Math.ceil((total || 0) / limit));

  return { items, total, page, limit, totalPages };
}

/* Plataforma (sin tenant) y User (con tenant) */
const NO_TENANT_HEADERS = { headers: { "X-Store-Id": "" } };
const NO_TENANT_FLAGS = { withCredentials: true, omitTenantHeader: true, __noTenant: true };
const NO_TENANT = { ...NO_TENANT_HEADERS, ...NO_TENANT_FLAGS };

const PLATFORM = {
  USER_BASE: "/api/seller-applications",
  ADMIN_BASE: "/api/seller-applications/admin",
  APPROVE: (id) => `/api/seller-applications/${id}/approve`,
  REJECT: (id) => `/api/seller-applications/${id}/reject`,
  DELETE: (id) => `/api/seller-applications/admin/${id}`,
};

const USER = {
  USER_BASE: "/api/seller-applications",
  ADMIN_BASE: "/api/user/admin/seller-applications",
  APPROVE: (id) => `/api/user/admin/seller-applications/${id}/approve`,
  REJECT: (id) => `/api/user/admin/seller-applications/${id}/reject`,
  DELETE: (id) => `/api/user/admin/seller-applications/${id}`,
};

function isFallbackStatus(s) {
  const code = Number(s);
  return code === 404 || code === 405 || code === 501;
}

/* ===================== Usuario ===================== */
export async function getMySellerApp() {
  // 1) Plataforma (no tenant)
  try {
    const r = await api.get(`${PLATFORM.USER_BASE}/me`, {
      params: { _ts: Date.now() },
      ...NO_TENANT,
    });
    return r?.data?.data ?? r?.data ?? null;
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }
  // 2) User (con tenant)
  const r2 = await api.get(`${USER.USER_BASE}/me`, { params: { _ts: Date.now() } });
  return r2?.data?.data ?? r2?.data ?? null;
}

export async function createSellerApp(payload) {
  try {
    const r = await api.post(PLATFORM.USER_BASE, payload, NO_TENANT);
    return r?.data?.data ?? r?.data;
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }
  const r2 = await api.post(USER.USER_BASE, payload);
  return r2?.data?.data ?? r2?.data;
}

export async function reapplySellerApp(payload = {}) {
  try {
    const r = await api.patch(`${PLATFORM.USER_BASE}/reapply`, payload, NO_TENANT);
    return r?.data?.data ?? r?.data;
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }
  const r2 = await api.patch(`${USER.USER_BASE}/reapply`, payload);
  return r2?.data?.data ?? r2?.data;
}

/** Crear o, si existe rechazada, re-aplicar automáticamente */
export async function submitOrReapplySellerApp(payload) {
  try {
    return await createSellerApp(payload);
  } catch (e) {
    if (e?.response?.status === 409) {
      return await reapplySellerApp(payload);
    }
    throw e;
  }
}

/* ===================== Admin ===================== */
export async function listSellerApplications(params = {}) {
  const p = { _ts: Date.now(), page: 1, limit: 20, ...params };
  // 1) Plataforma (no tenant)
  try {
    const r = await api.get(PLATFORM.ADMIN_BASE, { params: p, ...NO_TENANT });
    return norm(r, p);
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }
  // 2) User (con tenant)
  const r2 = await api.get(USER.ADMIN_BASE, { params: p });
  return norm(r2, p);
}

/**
 * Aprobar
 * - Integra tu requerimiento de usar POST a la ruta de plataforma
 * - Mantiene fallback a rutas USER con PATCH si la plataforma no lo soporta
 */
export async function approveSellerApplication(id, payload = {}, fallbackStoreName) {
  if (!id) throw new Error("id requerido");
  const body = withFallbackStoreName(payload, fallbackStoreName);

  // 1) POST Plataforma (como pediste en el diff)
  try {
    const { data } = await api.post(PLATFORM.APPROVE(id), body, NO_TENANT);
    return data;
  } catch (e) {
    // si la plataforma no soporta (404/405/501), cae a fallback
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }

  // 2) Fallback: PATCH User
  const { data: data2 } = await api.patch(USER.APPROVE(id), body);
  return data2;
}

/**
 * Rechazar
 * - Integra tu requerimiento de usar POST a la ruta de plataforma
 * - Mantiene fallback a rutas USER con PATCH si la plataforma no lo soporta
 */
export async function rejectSellerApplication(id, body = {}) {
  if (!id) throw new Error("id requerido");
  const text = String(body.reason ?? body.notes ?? "Información insuficiente").trim();
  const payload = {
    notes: body.notes ?? text,
    reason: body.reason ?? text,
    allowReapply: body.allowReapply ?? true,
    status: "REJECTED",
  };

  // 1) POST Plataforma (como pediste en el diff)
  try {
    const { data } = await api.post(PLATFORM.REJECT(id), payload, NO_TENANT);
    return data;
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }

  // 2) Fallback: PATCH User
  const { data: data2 } = await api.patch(USER.REJECT(id), payload);
  return data2;
}

// Eliminar (si lo usas)
export async function deleteSellerApplication(id) {
  if (!id) throw new Error("id requerido");
  // 1) Plataforma
  try {
    const { data } = await api.delete(PLATFORM.DELETE(id), NO_TENANT);
    return data;
  } catch (e) {
    if (!isFallbackStatus(e?.response?.status)) throw e;
  }
  // 2) User
  const { data: data2 } = await api.delete(USER.DELETE(id));
  return data2;
}

/* ===================== Helpers ===================== */
function withFallbackStoreName(payload = {}, fallbackStoreName) {
  const body = { ...payload };
  const currentName =
    body?.store?.name ??
    body?.storeName ??
    body?.name ??
    body?.businessName;

  const hasName = Boolean(String(currentName || "").trim());
  const fallback = String(fallbackStoreName || "").trim();

  if (!body.store || typeof body.store !== "object") body.store = {};
  if (hasName) {
    if (!String(body.store.name || "").trim()) body.store.name = String(currentName).trim();
  } else if (fallback) {
    body.store.name = fallback;
  }

  return body;
}
