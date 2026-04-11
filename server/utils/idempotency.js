// server/utils/idempotency.js
import crypto from "crypto";

export function hashPayload(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj || {});
  return crypto.createHash("sha256").update(json, "utf8").digest("hex");
}
