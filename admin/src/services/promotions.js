// admin/src/services/promotions.js
import { fetchDataFromApi, postData, editData, deleteData } from "../utils/api";

const BASE = "/api/promotion";

export async function listPromotions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getPromotion(id) {
  return await fetchDataFromApi(`${BASE}/${id}`);
}

export async function createPromotion(payload) {
  return await postData(`${BASE}`, payload);
}

export async function updatePromotion(id, payload) {
  return await editData(`${BASE}/${id}`, payload);
}

export async function removePromotion(id) {
  return await deleteData(`${BASE}/${id}`);
}

export async function previewPromotion(payload) {
  return await postData(`${BASE}/preview`, payload);
}

export async function redeemPromotion(payload) {
  return await postData(`${BASE}/redeem`, payload);
}