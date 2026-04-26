// admin/src/services/delivery.js
import { fetchDataFromApi, patchData, deleteData } from "../utils/api";

/** Lista paginada con filtros (q por cliente/teléfono, status, rango fechas, storeId) */
export async function listDeliveries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`/api/delivery${qs ? `?${qs}` : ""}`);
}

/** Entregas disponibles (PENDING, sin asignar) para que el delivery agent las tome */
export async function availableDeliveries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`/api/delivery/available${qs ? `?${qs}` : ""}`);
}

/** Mis entregas (para repartidor). Si el back ya filtra por el usuario logueado, basta GET /api/delivery/my */
export async function myDeliveries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`/api/delivery/my${qs ? `?${qs}` : ""}`);
}

export async function getDelivery(id) {
  return await fetchDataFromApi(`/api/delivery/${id}`);
}

export async function takeDelivery(id, { note } = {}) {
  return await patchData(`/api/delivery/${id}/take`, { note });
}

export async function assignDelivery(id, { assigneeId, note }) {
  return await patchData(`/api/delivery/${id}/assign`, { assigneeId, note });
}

export async function updateDeliveryStatus(id, { status, note, geo }) {
  return await patchData(`/api/delivery/${id}/status`, { status, note, geo });
}

/** Verificar código de recogida */
export async function verifyPickupCode(id, code) {
  return await patchData(`/api/delivery/${id}/verify-code`, { code });
}

/** Subida de pruebas (fotos). files: File[] */
export async function uploadDeliveryProof(id, files = []) {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  return await patchData(`/api/delivery/${id}/proof`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** Eliminar una prueba por indice */
export async function deleteDeliveryProof(id, proofIndex) {
  return await deleteData(`/api/delivery/${id}/proof/${proofIndex}`);
}

/** Tienda despacha producto a almacen MTZ (solo STANDARD) */
export async function dispatchToWarehouse(id, { note } = {}) {
  return await patchData(`/api/delivery/${id}/dispatch-warehouse`, { note });
}

/** Marcar producto recibido en almacen (solo STANDARD) */
export async function receiveAtWarehouse(id, { note } = {}) {
  return await patchData(`/api/delivery/${id}/receive-warehouse`, { note });
}
