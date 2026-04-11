// admin/src/services/settlements.js
import { fetchDataFromApi, editData, postData } from "../utils/api";

/** Lista de settlements con filtros */
export async function listSettlements(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`/api/settlements${qs ? `?${qs}` : ""}`);
}

/** Settlements pendientes agrupados por tienda */
export async function getPendingSettlements() {
  return await fetchDataFromApi(`/api/settlements/pending?_ts=${Date.now()}`);
}

/** Marcar settlement como pagado */
export async function paySettlement(id, { notes = "" } = {}) {
  return await editData(`/api/settlements/${id}/pay`, { notes });
}
