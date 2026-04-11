// server/middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isPlatformSuperAdmin } from "../config/roles.js"; // ⬅️ mantiene superadmin por email

/** Extrae el access token desde:
 *  - Authorization: Bearer <token>
 *  - cookies: accessToken (y compat: token)
 */
export function extractAccessToken(req) {
    const h = req.headers?.authorization || req.headers?.Authorization || "";
    if (h && h.startsWith("Bearer ")) return h.slice(7).trim();
    if (req.cookies?.accessToken) return req.cookies.accessToken;
    if (req.cookies?.token) return req.cookies.token; // compat
    return null;
}

// Usa tus dos nombres de secreto de access y deja fallback seguro
const getJwtSecret = () =>
    process.env.SECRET_KEY_ACCESS_TOKEN
    || process.env.JWT_ACCESS_SECRET
    || process.env.JWT_SECRET
    || process.env.JSON_WEB_TOKEN_SECRET_KEY;

/** Auth estricto:
 *  - Responde 401 si no hay token / inválido / user inexistente
 *  - Setea req.user con campos mínimos útiles
 */
async function coreAuth(req, res, next) {
    try {
        const token = extractAccessToken(req);
        if (!token) {
            return res.status(401).json({ error: true, message: "No autorizado" });
        }

        let payload;
        try {
            payload = jwt.verify(token, getJwtSecret());
        } catch (err) {
            const msg =
                err?.name === "TokenExpiredError"
                    ? "Token inválido o expirado"
                    : "Token inválido o expirado";
            return res.status(401).json({ error: true, message: msg });
        }

        // Acepta distintas claims: id | _id | sub | userId
        const uid = String(
            payload?.id || payload?._id || payload?.sub || payload?.userId || ""
        );
        if (!uid) {
            return res.status(401).json({ error: true, message: "Token inválido o expirado" });
        }

        // Cargar usuario con los campos que necesitamos en req.user
        const user = await User.findById(uid)
            .select("_id email name roles isSuper storeId role")
            .lean();

        if (!user) {
            return res.status(401).json({ error: true, message: "No autorizado" });
        }

        // SUPER_ADMIN por email de plataforma (override derivado)
        const superByEmail = isPlatformSuperAdmin(user.email || "");
        const isSuper = Boolean(user.isSuper || superByEmail);

        // Compat antiguos
        req.userId = String(user._id);

        // Objeto unificado y mínimo para el resto de middlewares/controladores
        req.user = {
            _id: user._id,
            id: String(user._id),
            email: user.email || null,
            name: user.name || null,
            roles: Array.isArray(user.roles) ? user.roles : [],
            isSuper,
            // legacy / opcional
            role: user.role || null,
            storeId: user.storeId || null,
            isPlatformSuperAdmin: superByEmail,
        };

        // auxiliares legacy
        req.userRole = req.user.role;
        req.accessToken = token;

        return next();
    } catch (e) {
        console.error("[auth] error:", e);
        return res.status(401).json({ error: true, message: "No autorizado" });
    }
}

/** Middleware de rol sencillo (RBAC)
 * Uso: router.post('/ruta', auth, requireRole('ADMIN','SELLER'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
    const r = req?.user?.role;
    if (!r) return res.status(401).json({ error: true, message: "No autorizado" });
    if (!roles.includes(r)) {
        return res.status(403).json({ error: true, message: "Rol insuficiente" });
    }
    next();
};

/** Alias explícito para semántica (por compatibilidad con snippets) */
export const authRequired = coreAuth;

/** SUPER_ADMIN estricto (plataforma)
 *  - Acepta: req.user.isSuper, req.user.isPlatformSuperAdmin, role === 'SUPER_ADMIN', roles[] incluye 'SUPER_ADMIN'
 *  - 401 si no autenticado; 403 si autenticado pero sin privilegio
 */
export function requireSuperAdmin(req, res, next) {
    const u = req?.user;
    if (!u) return res.status(401).json({ error: true, message: "No autorizado" });

    const roles = Array.isArray(u.roles) ? u.roles.map(String) : [];
    const isSuper =
        u.isSuper === true ||
        u.isPlatformSuperAdmin === true ||
        String(u.role || "").toUpperCase() === "SUPER_ADMIN" ||
        roles.includes("SUPER_ADMIN");

    if (!isSuper) {
        return res.status(403).json({ error: true, message: "SUPER_ADMIN requerido" });
    }
    next();
}

/* Exports compatibles:
   - import auth from '../middlewares/auth.js'
   - import auth, { requireRole, authRequired, requireSuperAdmin } from '../middlewares/auth.js'
   - import { auth, requireRole, authRequired, requireSuperAdmin } from '../middlewares/auth.js'
*/
const auth = coreAuth;
export default auth;
export { auth };
