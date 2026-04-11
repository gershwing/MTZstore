import { api } from "../utils/api";

export function listPayments(params = {}) {
  return api.get("/api/payment", { params }).then(r => r.data);
}
export function getPayment(id) {
  return api.get(`/api/payment/${id}`).then(r => r.data);
}
// sólo si el backend lo permite (PayPal/Cryptix):
export function refundPayment(id, body = { reason: "requested_by_customer", amount: null }) {
  return api.post(`/api/payment/${id}/refund`, body).then(r => r.data);
}
