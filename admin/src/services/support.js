// admin/src/services/support.js
import { fetchDataFromApi, postData, editData } from "../utils/api";

const BASE = "/api/support";

export async function listTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getTicket(id) {
  return await fetchDataFromApi(`${BASE}/${id}`);
}

export async function replyTicket(id, { body, files = [] }) {
  const form = new FormData();
  form.append("body", body || "");
  files.forEach((f) => form.append("files", f));
  return await postData(`${BASE}/${id}/reply`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function closeTicket(id) {
  return await editData(`${BASE}/${id}/close`, {});
}

export async function assignTicket(id, { userId }) {
  return await editData(`${BASE}/${id}/assign`, { userId });
}

export async function markSeen(id, { all = false, messageIds = [] } = {}) {
  if (all) return await editData(`${BASE}/${id}/seen?all=true`, {});
  return await editData(`${BASE}/${id}/seen`, { messageIds });
}