// admin/src/services/users.js
import { api } from "../utils/api";

// Lista de usuarios con filtros y paginación (page, limit, q, role, status)
export function listUsers(params = {}) {
  const p = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q ?? "",
    role: params.role ?? "",
    status: params.status ?? "",
    _ts: Date.now(), // rompe caché 304 del navegador
  };
  return api
    .get("/api/admin/users", {
      params: p,
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "application/json" },
      withCredentials: true,
    })
    .then((r) => r?.data);
}

// Actualiza campos del usuario (parcial)
export function updateUser(id, patch) {
  return api.patch(`/api/admin/users/${id}/role`, patch).then(r => r.data);
}

// Membresías/roles por tienda/tenant
export function createMembership(userId, body) {
  return api.post(`/api/admin/users/${userId}/memberships`, body).then(r => r.data);
}
export function patchMembership(userId, mid, patch) {
  return api.patch(`/api/admin/users/${userId}/memberships/${mid}`, patch).then(r => r.data);
}
export function deleteMembership(userId, mid) {
  return api.delete(`/api/admin/users/${userId}/memberships/${mid}`).then(r => r.data);
}
