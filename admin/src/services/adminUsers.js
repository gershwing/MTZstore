// admin/src/services/adminUsers.js
import { api, postData } from "../utils/api";
import { asPlatform } from "../utils/httpFlags";

/* ===================== LISTADO (base) ===================== */
/** Devuelve el payload crudo del backend (suele traer {items,total} o {data:{items,total}}) */
export function listUsers(params = {}, opt = {}) {
  return api.get("/api/admin/users", { params, ...opt }).then((r) => r.data);
}

/* ===================== LISTADO (compat) ===================== */
/** Normaliza a { data: [], total: number } para que el frontend no tenga que preocuparse del formato */
export async function fetchUsers(
  { q = "", role = "", status = "", page = 1, limit = 20 } = {},
  opt = {}
) {
  const data = await listUsers({ q, role, status, page, limit }, opt);
  const items = data?.data?.items || data?.items || data?.data || data || [];
  const total = data?.data?.total ?? data?.total ?? items.length;
  return { data: items, total };
}

/* ===== Alias para plataforma (sin X-Store-Id) ===== */
export const fetchUsersPlatform = (p = {}, opt = asPlatform()) => fetchUsers(p, opt);
export const listUsersPlatform = (p = {}, opt = asPlatform()) => listUsers(p, opt);

/* ===================== BULK ===================== */
/** OJO: por defecto usan modo plataforma (omitTenantHeader / sin X-Store) */
export async function bulkStatus(ids, status, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users/bulk/status", { ids, status }, { ...opt });
  return data?.data ?? data;
}
export async function bulkRole(ids, role, opt = asPlatform()) {
  // Cambia el rol de NEGOCIO (campo `role`)
  const { data } = await api.post("/api/admin/users/bulk/role", { ids, role }, { ...opt });
  return data?.data ?? data;
}
export async function bulkMembership(ids, { storeId, role }, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users/bulk/membership", { ids, storeId, role }, { ...opt });
  return data?.data ?? data;
}
export async function bulkDelete(ids, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users/bulk/delete", { ids }, { ...opt });
  return data?.data ?? data;
}

/** ✅ NUEVO: Cambia el rol de PLATAFORMA (campo `platformRole`) para varios usuarios */
export async function bulkPlatformRole(ids, role, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users/bulk/platform-role", { ids, role }, { ...opt });
  return data?.data ?? data;
}

/* ===================== SINGLE ===================== */
export async function updateUserStatus(id, status, opt = asPlatform()) {
  const { data } = await api.patch(`/api/admin/users/${id}/status`, { status }, { ...opt });
  return data?.data ?? data;
}
export async function updateUserRole(id, role, opt = asPlatform()) {
  // Cambia el rol de NEGOCIO (campo `role`)
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role }, { ...opt });
  return data?.data ?? data;
}
export async function addMembership(id, { storeId, role }, opt = asPlatform()) {
  const { data } = await api.post(`/api/admin/users/${id}/memberships`, { storeId, role }, { ...opt });
  return data?.data ?? data;
}
export async function removeMembership(id, storeId, opt = asPlatform()) {
  const { data } = await api.delete(`/api/admin/users/${id}/memberships/${storeId}`, { ...opt });
  return data?.data ?? data;
}
export async function removeUser(id, opt = asPlatform()) {
  const { data } = await api.delete(`/api/admin/users/${id}`, { ...opt });
  return data?.data ?? data;
}

/** ✅ NUEVO: Cambia el rol de PLATAFORMA (campo `platformRole`) para un usuario */
export async function updateUserPlatformRole(userId, role, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users/platform-role", { userId, role }, { ...opt });
  return data?.data ?? data;
}

/* ===================== INVITACIÓN / CREACIÓN ===================== */
export async function inviteUser(payload /*, opt = {} */) {
  // Si prefieres en modo plataforma:
  // const { data } = await api.post("/api/user/invite", payload, asPlatform());
  // return data?.data ?? data;
  return postData("/api/user/invite", payload);
}
export async function createAdminUser(payload, opt = asPlatform()) {
  const { data } = await api.post("/api/admin/users", payload, { ...opt });
  return data?.data ?? data;
}
