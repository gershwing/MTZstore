/**
 * generateSKU
 * ------------------------------------
 * Genera SKU basado en:
 * - productName
 * - atributos de variante
 */
export function generateSKU(productName, attributes = {}) {
  const clean = (str) =>
    String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

  const namePart = clean(productName).slice(0, 8);

  const attrPart = Object.values(attributes)
    .map((v) => clean(v).slice(0, 4))
    .join("-");

  return [namePart, attrPart].filter(Boolean).join("-");
}
