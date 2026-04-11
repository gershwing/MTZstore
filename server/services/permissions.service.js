// server/services/permissions.service.js
import User from '../models/user.model.js';
import { PERMISSIONS } from '../config/permissions.js';
import {
  ROLES,
  isPlatformSuperAdmin,
  mapLegacyUserRoleToPlatformRole,
} from '../config/roles.js';

/**
 * Devuelve el rol efectivo del usuario dentro de un tenant (store)
 * - SUPER_ADMIN de plataforma: siempre SUPER_ADMIN
 * - Si hay membership activa para el tenant, usa ese rol (roles[0] o role)
 * - Si no hay membership, cae a rol legado mapeado
 */
export async function getEffectiveRoleForTenant(userId, tenantId) {
  // ⬅️ Traemos también el email para poder evaluar súper admin por .env
  const user = await User.findById(userId)
    .select('email role memberships')
    .lean();
  if (!user) return null;

  // Soporta email u objeto
  if (isPlatformSuperAdmin(user?.email || user)) {
    return ROLES.SUPER_ADMIN;
  }

  if (tenantId) {
    const membership = (user.memberships || []).find(
      (m) => String(m.storeId) === String(tenantId) && m.status === 'active'
    );
    if (membership) {
      // Soporta array de roles o campo role único (compat)
      const mbRole = Array.isArray(membership.roles) && membership.roles.length
        ? membership.roles[0]
        : membership.role;
      if (mbRole) return mbRole;
    }
  }

  // fallback a rol legado mapeado a rol de plataforma
  return mapLegacyUserRoleToPlatformRole(user.role);
}

/**
 * Devuelve la lista de permisos del usuario para un tenant específico.
 * Convención:
 *  - SUPER_ADMIN → ['*']
 *  - Resto → PERMISSIONS[effectiveRole] || []
 */
export async function getUserPermissionsForTenant(userId, tenantId) {
  const effectiveRole = await getEffectiveRoleForTenant(userId, tenantId);
  if (!effectiveRole) return [];

  if (effectiveRole === ROLES.SUPER_ADMIN) {
    return ['*'];
  }

  return Array.isArray(PERMISSIONS[effectiveRole])
    ? PERMISSIONS[effectiveRole]
    : [];
}
