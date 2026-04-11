// src/utils/formatPrice.js
export function formatPrice(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "—";

  const num = Number(amount);
  if (isNaN(num)) return amount;

  switch (currency?.toUpperCase()) {
    case "USD":
      return `$${num.toFixed(2)}`;
    case "BOB":
      return `${num.toFixed(2)} Bs`;
    default:
      return `${num.toFixed(2)} ${currency || ""}`;
  }
}
