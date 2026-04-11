// admin/src/services/inventory.js
import { fetchDataFromApi, postData } from "../utils/api";

// Stock disponible por producto (opcional: por ubicación)
export async function getStock(productId, location) {
  const qs = new URLSearchParams({ productId });
  if (location) qs.set("location", location);
  return await fetchDataFromApi(`/api/inventory/stock?${qs.toString()}`); // { stock }
}

// Lista de movimientos (paginada)
export async function getMovements({ productId, page = 1, limit = 10 }) {
  const qs = new URLSearchParams({ productId, page, limit });
  return await fetchDataFromApi(`/api/inventory/movements?${qs.toString()}`);
}

// Ajuste (+|−). El server guarda qty positiva y delta en notes (auditoría).
export async function adjust({ productId, qty, locationTo = "", notes = "", deltaSign = "+" }) {
  return await postData("/api/inventory/adjust", {
    productId, qty, locationTo, notes, deltaSign // "+" o "-"
  });
}

// Reserva (valida stock disponible)
export async function reserve({ productId, qty, refType = "ORDER", refId = "", locationTo = "" }) {
  return await postData("/api/inventory/reserve", {
    productId, qty, refType, refId, locationTo
  });
}

// Liberación (revierte reservas)
export async function release({ productId, qty, refType = "ORDER", refId = "", locationTo = "" }) {
  return await postData("/api/inventory/release", {
    productId, qty, refType, refId, locationTo
  });
}

// Movimiento entre ubicaciones
export async function move({ productId, qty, from = "", to = "", refType = "MANUAL", refId = "" }) {
  return await postData("/api/inventory/move", {
    productId, qty, from, to, refType, refId
  });
}

// Recepcionar producto en almacen (vendedor entrega al almacen)
export async function receive({ productId, qty, trackingCode, orderId = "", notes = "" }) {
  return await postData("/api/inventory/receive", {
    productId, qty, trackingCode, orderId, notes
  });
}

// Despachar producto del almacen a delivery
export async function dispatch({ productId, qty, deliveryTaskId = "", trackingCode = "", notes = "" }) {
  return await postData("/api/inventory/dispatch", {
    productId, qty, deliveryTaskId, trackingCode, notes
  });
}
