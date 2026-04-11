// server/middlewares/requirePermission.js
import {
  ROLES,
  mapLegacyUserRoleToPlatformRole,
  isPlatformSuperAdmin,
  getEffectiveRoles, // roles efectivos por tenant
} from '../config/roles.js';

import {
  roleHasPermission,
  PERMISSIONS,              // catálogo (roles -> lista de permisos)
  groupPermissionFor,      // cobertura granular -> permiso agregado (ej: product:rw)
  PERMISSION_ALIASES,      // ⬅️ alias de compat (ej: user:create → user:invite)
  KNOWN_PERMISSIONS,       // ⬅️ set global de permisos conocidos (incluye sellerApp:approve)
} from '../config/permissions.js';

import User from '../models/user.model.js';
import { getUserPermissionsForTenant } from '../services/permissions.service.js';
import { ERR } from '../utils/httpError.js';

/* ───────────────────────── Utilidades internas ───────────────────────── */

// Normaliza IDs: "", null, undefined o "   " => null
const normalizeId = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
};

/**
 * Entrada aceptada:
 *  - "product:create"               -> { anyOf: ["product:create"] }
 *  - ["a","b"]                      -> { anyOf: ["a","b"] }
 *  - { anyOf:[...]} / { allOf:[...] }
 */
function normalizePerms(input) {
  if (!input) return { anyOf: [] };
  if (typeof input === 'string') return { anyOf: [input] };
  if (Array.isArray(input)) return { anyOf: input };
  if (typeof input === 'object') {
    const anyOf = Array.isArray(input.anyOf) ? input.anyOf : undefined;
    const allOf = Array.isArray(input.allOf) ? input.allOf : undefined;
    if (anyOf || allOf) return { anyOf, allOf };
  }
  return { anyOf: [] };
}

/**
 * Expande permisos:
 *  - Alias de compat (PERMISSION_ALIASES)
 *  - Cobertura por grupo (groupPermissionFor)
 * Devuelve un set con el permiso original + variantes.
 */
function expandPermSet(permsInput) {
  const { anyOf, allOf } = normalizePerms(permsInput);
  const list = [...(anyOf || []), ...(allOf || [])];
  const out = new Set();

  for (const p of list) {
    if (!p) continue;
    // original
    out.add(p);

    // alias → p.ej. "user:create" → ["user:invite"]
    const alias = PERMISSION_ALIASES?.[p];
    if (Array.isArray(alias)) {
      for (const a of alias) out.add(a);
    }

    // grupo → p.ej. "product:create" → "product:rw"
    const grp = groupPermissionFor(p);
    if (grp) out.add(grp);
  }
  return out;
}

/**
 * Warn suave por permisos desconocidos (no bloquea).
 * Usa el set global KNOWN_PERMISSIONS (incluye sellerApp:approve).
 */
function warnUnknownPerms(permsInput) {
  const expanded = expandPermSet(permsInput);
  const unknown = [];

  for (const p of expanded) {
    if (!p) continue;
    if (KNOWN_PERMISSIONS.has(p)) continue;

    // Si el expandido vino de alias o grupo, revisa su grupo raíz también
    const grp = groupPermissionFor(p);
    if (grp && KNOWN_PERMISSIONS.has(grp)) continue;

    // Tampoco señales los propios originales si están cubiertos por alias conocidos
    const aliases = PERMISSION_ALIASES?.[p];
    if (Array.isArray(aliases) && aliases.some(a => KNOWN_PERMISSIONS.has(a))) continue;

    unknown.push(p);
  }

  if (unknown.length && process.env.NODE_ENV !== 'production') {
    console.warn('[requirePermission] Permisos no reconocidos:', unknown);
  }
}

/**
 * Crea un checker que combina:
 *  - Permisos del servicio (scoped por tenant) -> '*' o directo concede
 *  - Mapa estático por rol -> directo o por grupo concede
 */
function buildPermissionChecker({ effectiveRole, servicePerms }) {
  const svc = new Set(Array.isArray(servicePerms) ? servicePerms : []);
  const svcWildcard = svc.has('*');

  return function has(p) {
    if (!p) return false;

    // 0) wildcard del servicio
    if (svcWildcard) return true;

    // 1) directo vía servicio
    if (svc.has(p)) return true;

    // 2) directo vía rol estático
    if (roleHasPermission(effectiveRole, p)) return true;

    // 3) cobertura granular -> permiso agregado
    const grp = groupPermissionFor(p);
    if (grp) {
      if (svc.has(grp)) return true;
      if (roleHasPermission(effectiveRole, grp)) return true;
    }

    return false;
  };
}

/**
 * Evalúa:
 *  - anyOf: pasa si alguno es true
 *  - allOf: pasa si todos son true
 * (Antes de evaluar expandimos alias y grupos)
 */
function evaluateWithChecker(permsInput, has) {
  const norm = normalizePerms(permsInput);
  const any = norm.anyOf || [];
  const all = norm.allOf || []; // <-- ojo con 'the' accidental, debe eliminarse si copias de otro lado

  // expandimos (alias + grupos)
  const anyExpanded = Array.from(expandPermSet({ anyOf: any }));
  const allExpanded = Array.from(expandPermSet({ allOf: all }));

  if (anyExpanded.length > 0 && anyExpanded.some(has)) return true;
  if (allExpanded.length > 0 && allExpanded.every(has)) return true;

  return false;
}

/* ───────────────────────── Middleware principal ─────────────────────────
 *   - Mantiene API existente (string | string[] | {anyOf}|{allOf})
 *   - Respeta SUPER_ADMIN plataforma (flag/email)
 *   - Respeta SUPER_ADMIN por rol efectivo
 *   - Integra permisos tenant-scoped del servicio
 *   - Usa ERR.* para respuestas consistentes
 *   - Soporta alias y grupos (PERMISSION_ALIASES + groupPermissionFor)
 *   - Normaliza X-Store-Id vacío/espacios a null
 */
export function requirePermission(permsRequired) {
  // Fast-path: si no se pide nada, no bloqueamos
  const normAtInit = normalizePerms(permsRequired);
  if (
    !permsRequired ||
    ((normAtInit.anyOf?.length || 0) === 0 &&
      (normAtInit.allOf?.length || 0) === 0)
  ) {
    return (_req, _res, next) => next();
  }

  // Validación suave (no rompe si hay permisos “desconocidos”)
  warnUnknownPerms(permsRequired);

  return async function (req, res, next) {
    try {
      if (!req.userId) {
        return next(ERR.UNAUTHORIZED('No autenticado'));
      }

      // Carga minimal de usuario (lean)
      const user = await User.findById(req.userId)
        .select('email role platformRole memberships')
        .lean();

      if (!user) {
        return next(ERR.UNAUTHORIZED('Usuario no válido'));
      }

      // Resolver tenantId (header tiene prioridad)
      const hdrTenant =
        normalizeId(req.headers['x-store-id'] || req.headers['x-storeid']);
      const tenantId =
        hdrTenant ||
        normalizeId(req.tenantId) ||
        normalizeId(req.storeId) ||
        normalizeId(req.tenant && req.tenant.storeId) ||
        null;

      // Fast-path SUPER_ADMIN plataforma
      const isPlatSuper =
        Boolean(req.user?.isPlatformSuperAdmin) ||
        isPlatformSuperAdmin(user?.email || user);

      if (isPlatSuper) return next();

      // Rol efectivo (por tenant si aplica, si no legacy/platform)
      let effectiveRole;
      if (tenantId) {
        const roles = getEffectiveRoles(user, tenantId);
        effectiveRole = Array.isArray(roles) && roles.length ? roles[0] : ROLES.CUSTOMER;
      } else {
        effectiveRole = user.platformRole || mapLegacyUserRoleToPlatformRole(user.role);
      }

      // Otro fast-path: SUPER_ADMIN por rol efectivo
      if (effectiveRole === ROLES.SUPER_ADMIN) return next();

      // Permisos del servicio (scoped por tenant); si falla, continúa con mapa estático
      let servicePerms = [];
      try {
        if (tenantId) {
          servicePerms = await getUserPermissionsForTenant(req.userId, tenantId);
        }
      } catch {
        servicePerms = [];
      }

      const has = buildPermissionChecker({ effectiveRole, servicePerms });
      const allowed = evaluateWithChecker(permsRequired, has);

      if (!allowed) {
        const norm = normalizePerms(permsRequired);
        const payload =
          typeof permsRequired === 'string'
            ? permsRequired
            : (norm.anyOf && norm.anyOf.length
              ? { anyOf: norm.anyOf }
              : { allOf: norm.allOf || [] });

        return next(ERR.PERMISSION_DENIED(payload));
      }

      return next();
    } catch (err) {
      console.error('requirePermission error:', err);
      return next(ERR.SERVER('No se pudo evaluar permisos'));
    }
  };
}

/** Azúcar: requireAnyPermission / requireAllPermissions */
export function requireAnyPermission(list) {
  return requirePermission({ anyOf: list });
}
export function requireAllPermissions(list) {
  return requirePermission({ allOf: list });
}

export default requirePermission;
