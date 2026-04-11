// admin/src/services/bannersV1.js
import { fetchDataFromApi, postData, editData, deleteData } from "../utils/api";
import { toISOorNull } from "./_contentUtils";

const BASE = "/api/bannerV1";

export async function listBannerV1(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getBannerV1(id) {
  return await fetchDataFromApi(`${BASE}/${id}`);
}

export async function createBannerV1(payload) {
  const body = {
    ...payload,
    status: payload.status || "draft",
    visibility: payload.visibility || "public",
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return await postData(`${BASE}`, body);
}

export async function updateBannerV1(id, payload) {
  const body = {
    ...payload,
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return await editData(`${BASE}/${id}`, body);
}

export async function removeBannerV1(id) {
  return await deleteData(`${BASE}/${id}`);
}

export async function buildBannerV1PreviewUrl(id) {
  return `${BASE}/preview/${id}`;
}
