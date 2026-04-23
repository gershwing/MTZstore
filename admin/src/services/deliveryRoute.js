// admin/src/services/deliveryRoute.js
import { api } from "../utils/api";

const BASE = "/api/delivery-routes";

export const createRoute = (taskIds, agentId, note) =>
  api.post(BASE, { taskIds, agentId, note }).then((r) => r.data?.data);

export const listRoutes = (params = {}) =>
  api.get(BASE, { params }).then((r) => {
    const d = r.data?.data || r.data || {};
    return { data: d.data || d, total: d.total || 0, totalPages: d.totalPages || 1, page: d.page || 1 };
  });

export const getRoute = (id) =>
  api.get(`${BASE}/${id}`).then((r) => r.data?.data);

export const getMyRoutes = () =>
  api.get(`${BASE}/my`).then((r) => {
    const d = r.data?.data || r.data || {};
    return Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
  });

export const startRoute = (id) =>
  api.patch(`${BASE}/${id}/start`).then((r) => r.data?.data);

export const addTasksToRoute = (id, taskIds) =>
  api.patch(`${BASE}/${id}/add-tasks`, { taskIds }).then((r) => r.data?.data);

export const removeTaskFromRoute = (id, taskId) =>
  api.patch(`${BASE}/${id}/remove-task`, { taskId }).then((r) => r.data?.data);

export const cancelRoute = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data);
