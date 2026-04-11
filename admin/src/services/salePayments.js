import { fetchDataFromApi, postData, patchData, deleteData } from "../utils/api";

export const getPendingSales = (params = {}) => {
  const qp = new URLSearchParams();
  if (params.search) qp.append("search", params.search);
  if (params.page) qp.append("page", params.page);
  if (params.pageSize) qp.append("pageSize", params.pageSize);
  return fetchDataFromApi(`/api/sale-payments/pending?${qp}`);
};

export const getPaymentsBySale = (directSaleId) =>
  fetchDataFromApi(`/api/sale-payments/${directSaleId}`);

export const createSalePayment = (body) =>
  postData("/api/sale-payments", body);

export const deleteSalePayment = (id) =>
  deleteData(`/api/sale-payments/${id}`);

export const removeItemFromSale = (saleId, productId, variantId) =>
  patchData(`/api/direct-sales/${saleId}/remove-item`, { productId, variantId });
