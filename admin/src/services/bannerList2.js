// admin/src/services/bannerList2.js
import { fetchDataFromApi, postData, editData, deleteData } from "../utils/api";
import { toISOorNull } from "./_contentUtils";

const BASE = "/api/bannerList2";

export async function listBannerList2(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getBannerList2(id) {
  return await fetchDataFromApi(`${BASE}/${id}`);
}

export async function createBannerList2(payload) {
  const body = {
    ...payload,
    status: payload.status || "draft",
    visibility: payload.visibility || "public",
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return await postData(`${BASE}`, body);
}

export async function updateBannerList2(id, payload) {
  const body = {
    ...payload,
    publishAt: toISOorNull(payload.publishAt),
    expireAt: toISOorNull(payload.expireAt),
  };
  return await editData(`${BASE}/${id}`, body);
}

export async function removeBannerList2(id) {
  return await deleteData(`${BASE}/${id}`);
}

export async function buildBannerList2PreviewUrl(id) {
  return `${BASE}/preview/${id}`;
}
