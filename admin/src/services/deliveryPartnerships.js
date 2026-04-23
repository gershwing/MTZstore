// admin/src/services/deliveryPartnerships.js
import { api } from "../utils/api";

const BASE = "/api/delivery-partnerships";

// Agente solicita sociedad con tienda
export const requestPartnership = (storeId, serviceType, notes) =>
  api.post(BASE, { storeId, serviceType, notes }).then((r) => r.data?.data);

// Tienda invita agente
export const invitePartnership = (agentId, serviceType, notes) =>
  api.post(`${BASE}/invite`, { agentId, serviceType, notes }).then((r) => r.data?.data);

// Agente: mis sociedades
export const getMyPartnerships = (params = {}) =>
  api.get(`${BASE}/me`, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0 };
  });

// Tienda: sociedades de mi tienda
export const getStorePartnerships = (params = {}) =>
  api.get(`${BASE}/my-store`, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0 };
  });

// Aceptar sociedad
export const acceptPartnership = (id) =>
  api.patch(`${BASE}/${id}/accept`).then((r) => r.data?.data);

// Rechazar sociedad
export const rejectPartnership = (id, reason) =>
  api.patch(`${BASE}/${id}/reject`, { reason }).then((r) => r.data?.data);

// Suspender sociedad
export const suspendPartnership = (id, reason) =>
  api.patch(`${BASE}/${id}/suspend`, { reason }).then((r) => r.data?.data);

// Agentes disponibles para invitar (tienda)
export const getAvailableAgents = (params = {}) =>
  api.get(`${BASE}/available-agents`, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0 };
  });

// Tiendas disponibles para solicitar (agente)
export const getAvailableStores = (params = {}) =>
  api.get(`${BASE}/available-stores`, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0 };
  });
