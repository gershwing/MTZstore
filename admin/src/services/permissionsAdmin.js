import { api } from "../utils/api";

export async function fetchRoles() {
  const { data } = await api.get("/api/permissions/roles");
  return data?.data || [];
}

export async function fetchStaticMap() {
  const { data } = await api.get("/api/permissions/map");
  return data?.data || {};
}

export async function fetchEffectiveMap() {
  const { data } = await api.get("/api/permissions/effective");
  return data?.data || {};
}

export async function fetchOverlay(role) {
  const { data } = await api.get(`/api/permissions/overlay/${role}`);
  return data?.data || { role, added: [], removed: [] };
}

export async function updateOverlay(role, payload) {
  const { data } = await api.patch(`/api/permissions/overlay/${role}`, payload);
  return data?.data;
}
