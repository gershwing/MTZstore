// server/utils/escapeRegexExp.js
export function escapeRegexExp(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
