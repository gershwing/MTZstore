// admin/src/services/sliders.js
import { fetchDataFromApi, postData, editData, deleteData } from "../utils/api";
import { toISOorNull } from "./_contentUtils";

const BASE = "/api/homeSlides";

export function listSliders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export function getSlider(id) {
  return fetchDataFromApi(`${BASE}/${id}`);
}

export function createSlider(payload) {
  const body = {
    ...payload,
    status: payload.status || "draft",
    visibility: payload.visibility || "public",
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return postData(`${BASE}`, body);
}

export function updateSlider(id, payload) {
  const body = {
    ...payload,
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return editData(`${BASE}/${id}`, body);
}

export function removeSlider(id) {
  return deleteData(`${BASE}/${id}`);
}

// Preview URL builder (sin async)
export function buildSliderPreviewUrl(id) {
  // Si tu preview pública no va bajo /api, cámbialo a `/preview/${id}`
  return `${BASE}/preview/${id}`;
}
