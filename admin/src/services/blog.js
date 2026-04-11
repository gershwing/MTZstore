// admin/src/services/blog.js
import { fetchDataFromApi, postData, editData, deleteData } from "../utils/api";
import { toISOorNull } from "./_contentUtils";

const BASE = "/api/blog";

export async function listBlogs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return await fetchDataFromApi(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getBlog(id) {
  return await fetchDataFromApi(`${BASE}/${id}`);
}

export async function createBlog(payload) {
  const body = {
    ...payload,
    status: payload.status || "draft",
    visibility: payload.visibility || "public",
    publishedAt: toISOorNull(payload.publishedAt),
    unpublishAt: toISOorNull(payload.unpublishAt),
  };
  return await postData(`${BASE}`, body);
}

export async function updateBlog(id, payload) {
  const body = {
    ...payload,
    publishedAt: toISOorNull(payload.publishedAt),
    unpublishAt: toISOorNull(payload.unpublishAt),
  };
  return await editData(`${BASE}/${id}`, body);
}

export async function removeBlog(id) {
  return await deleteData(`${BASE}/${id}`);
}

export async function buildBlogPreviewUrl(id) {
  return `${BASE}/preview/${id}`;
}
