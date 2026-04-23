// admin/src/services/deliveryAgentProfile.js
import { api } from "../utils/api";

const BASE = "/api/delivery-agent-profile";

// Agente: mi perfil
export const getMyAgentProfile = () =>
  api.get(`${BASE}/me`).then((r) => r.data?.data || null);

// Agente: actualizar status/ubicación
export const updateMyAgentProfile = (data) =>
  api.patch(`${BASE}/me`, data).then((r) => r.data?.data);

// Super admin: listar perfiles
export const listAgentProfiles = (params = {}) =>
  api.get(BASE, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return {
      data: d.data || d,
      total: d.total || 0,
      totalPages: d.totalPages || 1,
      page: d.page || 1,
    };
  });

// Super admin: candidatos a VERIFIED
export const getCandidatesVerified = () =>
  api.get(`${BASE}/candidates-verified`).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0 };
  });

// Super admin: promover
export const promoteAgent = (id, level, reason) =>
  api.patch(`${BASE}/${id}/promote`, { level, reason }).then((r) => r.data?.data);

// Super admin: degradar
export const demoteAgent = (id, level, reason) =>
  api.patch(`${BASE}/${id}/demote`, { level, reason }).then((r) => r.data?.data);

// Super admin: suspender
export const suspendAgent = (id, reason) =>
  api.patch(`${BASE}/${id}/suspend`, { reason }).then((r) => r.data?.data);
