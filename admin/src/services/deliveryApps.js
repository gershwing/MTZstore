// admin/src/services/deliveryApps.js
import { api } from "../utils/api";

export const getMyDeliveryApp = () =>
  api.get("/api/delivery-applications/me").then((r) => r.data?.data || null);

export const createDeliveryApp = (payload) =>
  api
    .post("/api/delivery-applications", payload, {
      headers: { "X-Store-Id": "" }, // ← requerido por backend; vacío para apps sin tienda
    })
    .then((r) => r.data?.data);

// Admin (panel)
export const listDeliveryAppsAdmin = (params = {}) =>
  api
    .get("/api/delivery-applications/admin", {
      params: { _ts: Date.now(), ...params },
    })
    .then((r) => {
      const d = r.data || {};
      return {
        items: d.items || d.data || [],
        total: d.total || d.meta?.total || 0,
        totalPages: d.totalPages || d.meta?.pages || 1,
        page: d.page || d.meta?.page || 1,
        limit: d.limit || d.meta?.limit || 20,
      };
    });

export const approveDeliveryApp = (id) =>
  api.post(`/api/delivery-applications/${id}/approve`).then((r) => r.data?.data);

export const rejectDeliveryApp = (id, reason) =>
  api
    .post(`/api/delivery-applications/${id}/reject`, { reason })
    .then((r) => r.data?.data);

export const deleteDeliveryApp = (id) =>
  api.delete(`/api/delivery-applications/admin/${id}`).then((r) => r.data);
