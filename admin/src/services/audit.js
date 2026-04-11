import { fetchDataFromApi } from "../utils/api";
import { api } from "../utils/api";

// Lista paginada
export async function listAuditLogs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`/api/audit/logs${qs ? `?${qs}` : ""}`);
}

// Descarga JSON como Blob
export async function exportAuditJSON(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/audit/logs/export.json${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: localStorage.getItem("accessToken") ? `Bearer ${localStorage.getItem("accessToken")}` : undefined }
  });
  const blob = await res.blob();
  return blob;
}

// Descarga CSV como Blob
export async function exportAuditCSV(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/audit/logs/export.csv${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: localStorage.getItem("accessToken") ? `Bearer ${localStorage.getItem("accessToken")}` : undefined }
  });
  const blob = await res.blob();
  return blob;
}

// (opcional) abrir en nueva pestaña en vez de Blob
export function openAuditExport(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  window.open(`${url}${qs ? `?${qs}` : ""}`, "_blank");
}

// YA EXISTENTES: listAuditLogs, exportAuditJSON, exportAuditCSV ...

export async function getActionStats(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/api/audit/actions-stats${qs ? `?${qs}` : ""}`);
  return data?.data || [];
}