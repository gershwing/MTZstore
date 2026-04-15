import { fetchDataFromApi, postData, editData } from "../utils/api";

const BASE = "/api/warehouse-inbound";

export function listMine(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchDataFromApi(`${BASE}/mine${qs ? `?${qs}` : ""}`, { withCredentials: true });
}

export function listAdmin(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchDataFromApi(`${BASE}/admin${qs ? `?${qs}` : ""}`, { withCredentials: true });
}

export function getById(id) {
  return fetchDataFromApi(`${BASE}/admin/${id}`, { withCredentials: true });
}

export function createRequest(payload) {
  return postData(BASE, payload, { withCredentials: true });
}

export function approveRequest(id, body = {}) {
  return editData(`${BASE}/${id}/approve`, body, { withCredentials: true });
}

export function rejectRequest(id, body) {
  return editData(`${BASE}/${id}/reject`, body, { withCredentials: true });
}

export function resubmitRequest(id, body = {}) {
  return postData(`${BASE}/${id}/resubmit`, body, { withCredentials: true });
}
