// server/utils/session.js
import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const SESSION_TTL_SEC = Number(process.env.SESSION_TTL_SEC || 86400); // 1 día

export function makeSessionValue(user, extra = {}) {
  const payload = {
    sub: String(user?._id || user?.id),
    email: user?.email,
    name: user?.name,
    ...extra,
  };
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: SESSION_TTL_SEC });
}
