// server/controllers/permissionAdmin.controller.js
import { PERMISSIONS, groupPermissionFor } from "../config/permissions.js";
import { ALL_ROLES, ROLES, isPlatformSuperAdmin } from "../config/roles.js";
import { ERR } from "../utils/httpError.js";
import {
  getEffectivePermissionsMap,
  getOverlay,
  upsertOverlay,
} from "../services/permissionOverlay.service.js";

/** --- Utilidades internas --- */

// Set de permisos estáticos conocidos
const STATIC_KNOWN = new Set(
  (Object.values(PERMISSIONS || {})).flat
    ? Object.values(PERMISSIONS || {}).flat()
    : [].concat(...Object.values(PERMISSIONS || {}))
);

// Permisos extra que tu overlay puede querer tocar aunque no estén en el mapping plano
const EXTRA_KNOWN = new Set([
  "store:create",
  "store:delete",
]);

function isKnownPermission(p) {
  if (!p) return false;
  if (STATIC_KNOWN.has(p) || EXTRA_KNOWN.has(p)) return true;
  const group = groupPermissionFor(p);
  if (group && (STATIC_KNOWN.has(group) || EXTRA_KNOWN.has(group))) return true;
  return false;
}

function normalizeRole(r) {
  return String(r || "").trim().toUpperCase();
}

function sanitizePermArray(arr) {
  const list = Array.isArray(arr) ? arr : [];
  // Normaliza strings, quita falsy y duplica
  return Array.from(
    new Set(
      list
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean)
    )
  );
}

/** --- Middleware simple de SUPER_ADMIN plataforma --- */
function requirePlatformSuperAdmin(req, _res, next) {
  const byFlag =
    req.user?.role === ROLES.SUPER_ADMIN || Boolean(req.user?.isPlatformSuperAdmin);
  const byEmail = isPlatformSuperAdmin(req.user?.email || req.user);
  if (!(byFlag || byEmail)) return next(ERR.FORBIDDEN("Sólo SUPER_ADMIN"));
  return next();
}

/** GET /api/permissions/roles */
export function listRolesController(_req, res) {
  return res.json({ error: false, success: true, data: ALL_ROLES });
}

/** GET /api/permissions/map (estático) */
export function getStaticPermissionsController(_req, res) {
  return res.json({ error: false, success: true, data: PERMISSIONS });
}

/** GET /api/permissions/effective (estático + overlay) */
export async function getEffectivePermissionsController(_req, res, next) {
  try {
    const map = await getEffectivePermissionsMap();
    return res.json({ error: false, success: true, data: map });
  } catch (e) {
    return next(e);
  }
}

/** GET /api/permissions/overlay/:role */
export async function getOverlayController(req, res, next) {
  try {
    const roleParam = normalizeRole(req.params.role);
    if (!ALL_ROLES.includes(roleParam)) {
      return next(ERR.VALIDATION({ role: "Rol inválido" }));
    }
    const data = await getOverlay(roleParam);
    return res.json({ error: false, success: true, data });
  } catch (e) {
    return next(e);
  }
}

/** PATCH /api/permissions/overlay/:role  body: { added:[], removed:[] } */
export async function updateOverlayController(req, res, next) {
  try {
    const roleParam = normalizeRole(req.params.role);
    if (!ALL_ROLES.includes(roleParam)) {
      return next(ERR.VALIDATION({ role: "Rol inválido" }));
    }

    const added = sanitizePermArray(req.body?.added);
    const removed = sanitizePermArray(req.body?.removed);

    // Valida permisos conocidos (admite granulares cubiertos por grupo)
    const unknownAdded = added.filter((p) => !isKnownPermission(p));
    const unknownRemoved = removed.filter((p) => !isKnownPermission(p));
    if (unknownAdded.length || unknownRemoved.length) {
      return next(
        ERR.VALIDATION({
          permissions: {
            added: unknownAdded,
            removed: unknownRemoved,
            message: "Permisos desconocidos para overlay",
          },
        })
      );
    }

    const data = await upsertOverlay(roleParam, { added, removed });
    return res.json({ error: false, success: true, data });
  } catch (e) {
    return next(e);
  }
}

export const onlySuperAdmin = requirePlatformSuperAdmin;
