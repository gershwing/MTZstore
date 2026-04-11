// server/middlewares/withEffectiveAccess.js
import { getEffectiveRoles } from '../config/roles.js';
import { PERMISSIONS as ROLE_PERMISSIONS } from '../config/permissions.js';

export default function withEffectiveAccess(req, _res, next) {
  const tenantId = req.tenantId || req.headers['x-store-id'];
  const roles = getEffectiveRoles(req.user, tenantId);

  const perms = new Set();
  // Permisos derivados de roles
  roles.forEach((r) => (ROLE_PERMISSIONS[r] || []).forEach((p) => perms.add(p)));
  // Permisos ad-hoc del usuario (si existieran)
  if (Array.isArray(req.user?.permissions)) {
    req.user.permissions.forEach((p) => perms.add(p));
  }

  req.effectiveRoles = roles;
  req.effectivePermissions = Array.from(perms);
  next();
}
