// server/middlewares/previewGuard.js
import jwt from "jsonwebtoken";
import { ERR } from "../utils/httpError.js";

/**
 * Permite dos modos:
 * 1) Usuario autenticado (req.user): opcionalmente valida permiso `${resource}:read`
 * 2) Token de preview en query (?token=...): JWT con { aud:"preview", rid, storeId? }
 *
 * Efectos:
 * - Si pasa, setea req.query.scope = 'internal' para evitar filtros públicos.
 * - No modifica el controller: tus get* usan scope para decidir si fuerzan publish windows.
 */
export function previewGuard({ resource, requirePermission = false } = {}) {
  return (req, _res, next) => {
    const token = (req.query?.token || "").toString().trim();

    // --- Modo token firmado ---
    if (token) {
      try {
        const secret = process.env.PREVIEW_JWT_SECRET;
        if (!secret) throw ERR.SERVER("PREVIEW_JWT_SECRET no definido");

        const claims = jwt.verify(token, secret, { algorithms: ["HS256"] });
        if (claims?.aud !== "preview") throw ERR.UNAUTHORIZED("aud inválido");

        // rid = resource id que se está previsualizando
        const rid = String(claims?.rid || "");
        if (!rid) throw ERR.UNAUTHORIZED("rid faltante en token");
        if (String(req.params?.id || "") !== rid) {
          throw ERR.FORBIDDEN("rid del token no coincide con el recurso solicitado");
        }

        // Si hay storeId en el token y tenemos tenant, exigir coincidencia
        const tokenStoreId = claims?.storeId ? String(claims.storeId) : null;
        const tenantStoreId = req?.tenant?.storeId ? String(req.tenant.storeId) : null;
        if (tokenStoreId && tenantStoreId && tokenStoreId !== tenantStoreId) {
          throw ERR.FORBIDDEN("storeId del token no coincide con el tenant actual");
        }

        // Marca contexto de preview y evita filtros públicos
        req.preview = { mode: "token", claims };
        req.query.scope = "internal";
        return next();
      } catch (e) {
        return next(e?.status ? e : ERR.UNAUTHORIZED("Token de preview inválido"));
      }
    }

    // --- Modo autenticado ---
    if (req.user) {
      // Si deseas validar permisos aquí (en lugar de un middleware aparte)
      if (requirePermission && resource) {
        const perm = `${resource}:read`;
        const perms = new Set(
          Array.isArray(req.user?.permissions) ? req.user.permissions : []
        );

        const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
        if (!isSuperAdmin && !perms.has(perm)) {
          return next(ERR.FORBIDDEN(`Falta permiso ${perm}`));
        }
      }

      // Evita filtros públicos
      req.preview = { mode: "auth" };
      req.query.scope = "internal";
      return next();
    }

    // Ni token ni user
    return next(ERR.UNAUTHORIZED("Se requiere auth o token de preview"));
  };
}
