/**
 * Extrae el mensaje de error legible de una respuesta del backend.
 * El backend devuelve: { message: "Validación fallida", details: "..." | { field: "msg" } }
 * Esta función prioriza `details` sobre `message`.
 */
export function extractErrorMsg(res, fallback = "Ocurrió un error") {
  const details = res?.details;
  if (details) {
    if (typeof details === "string") return details;
    if (typeof details === "object") return Object.values(details).join(". ");
  }
  return res?.message || fallback;
}
