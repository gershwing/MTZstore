// admin/src/utils/httpErrorClient.js
export function normalizeHttpError(error) {
  // Axios error shape (interceptor ya está arriba)
  const status = error?.response?.status ?? error?.status ?? 0;
  const payload = error?.response?.data ?? error?.data ?? {};
  const headers = error?.response?.headers ?? error?.headers ?? {};
  const message =
    payload?.message ||
    error?.message ||
    (status ? `HTTP ${status}` : "Error de red");

  return {
    status,
    code: payload?.code || null,
    message,
    details: payload?.details || null,
    headers,
    // original para depurar si hace falta
    original: error,
  };
}
