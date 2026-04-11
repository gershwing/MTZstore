// server/middlewares/authOptional.js
// Auth opcional: intenta autenticar con header o cookie; si falla, sigue como invitado.

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isPlatformSuperAdmin } from "../config/roles.js";

// mismos secretos tolerantes que usa tu middleware "auth"
const getJwtSecret = () =>
  process.env.SECRET_KEY_ACCESS_TOKEN
  || process.env.JWT_ACCESS_SECRET
  || process.env.JWT_SECRET
  || process.env.JSON_WEB_TOKEN_SECRET_KEY;

// extrae access token de Authorization Bearer o cookies
const extractAccessToken = (req) => {
  const h = req.headers?.authorization || req.headers?.Authorization || "";
  if (h && h.startsWith("Bearer ")) return h.slice(7).trim();
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  if (req.cookies?.token) return req.cookies.token; // compat
  return null;
};

export async function authOptional(req, res, next) {
  const token = extractAccessToken(req);
  if (!token) return next(); // invitado, no intenta autenticar

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const uid = String(
      payload?.id || payload?._id || payload?.sub || payload?.userId || ""
    );
    if (!uid) return next();

    const user = await User.findById(uid)
      .select("_id email name roles isSuper storeId role")
      .lean();
    if (!user) return next();

    // super por email de plataforma
    const superByEmail = isPlatformSuperAdmin(user.email || "");
    const isSuper = Boolean(user.isSuper || superByEmail);

    // compat con el resto del código
    req.userId = String(user._id);
    req.user = {
      _id: user._id,
      id: String(user._id),
      email: user.email || null,
      name: user.name || null,
      roles: Array.isArray(user.roles) ? user.roles : [],
      isSuper,
      role: user.role || null,
      storeId: user.storeId || null,
      isPlatformSuperAdmin: superByEmail,
    };
    req.userRole = req.user.role;
    req.accessToken = token;
  } catch {
    // token inválido/expirado -> seguir como invitado SIN responder 401
  }
  return next();
}

export default authOptional;
