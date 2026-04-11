// admin/src/services/reports.js
import { fetchDataFromApi } from "../utils/api";

/** Limpia undefined/null/vacíos y agrega cache-busting */
function cleanParams(params = {}) {
  const clean = { _ts: Date.now() };
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  }
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

/** Serie de ventas (reutiliza tu endpoint del dashboard) */
export async function getSalesSeries(params = {}) {
  return await fetchDataFromApi(`/api/order/sales${cleanParams(params)}`);
}

/** Serie de usuarios (reutiliza tu endpoint del dashboard) */
export async function getUsersSeries(params = {}) {
  return await fetchDataFromApi(`/api/order/users${cleanParams(params)}`);
}

/** Pedidos por estado */
export async function getOrdersByStatus(params = {}) {
  return await fetchDataFromApi(`/api/report/orders-by-status${cleanParams(params)}`);
}

/** Top productos (qty y revenue) */
export async function getTopProducts(params = {}) {
  return await fetchDataFromApi(`/api/report/top-products${cleanParams(params)}`);
}

/** Delivery SLA (avg/p50/p90) con opción de group=day|month */
export async function getDeliverySLA(params = {}) {
  return await fetchDataFromApi(`/api/report/delivery-sla${cleanParams(params)}`);
}
