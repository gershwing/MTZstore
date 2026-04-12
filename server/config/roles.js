// server/config/roles.js
// Catálogo oficial de roles de la plataforma (8 niveles)

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',            // plataforma (todas las tiendas)
  STORE_OWNER: 'STORE_OWNER',            // dueño de tienda
  FINANCE_MANAGER: 'FINANCE_MANAGER',    // contabilidad/conciliación/payouts
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',// almacén/stock/variantes
  ORDER_MANAGER: 'ORDER_MANAGER',        // ventas/órdenes/estados
  DELIVERY_AGENT: 'DELIVERY_AGENT',      // repartidor (solo entregas asignadas)
  SUPPORT_AGENT: 'SUPPORT_AGENT',        // soporte/tickets/moderación
  CUSTOMER: 'CUSTOMER'                   // cliente final
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

/** Normaliza un texto (para comparar) */
function norm(v) {
  return String(v || '').trim();
}
function normLower(v) {
  return norm(v).toLowerCase();
}

/**
 * Mapeo de compatibilidad con tu esquema actual:
 * - Si en User.role === "ADMIN" → lo tratamos como STORE_OWNER.
 * - Si User.role === "USER"  → CUSTOMER.
 */
export function mapLegacyUserRoleToPlatformRole(legacyRole) {
  if (!legacyRole) return ROLES.CUSTOMER;
  const up = norm(legacyRole).toUpperCase();
  if (up === 'ADMIN') return ROLES.STORE_OWNER;
  return ROLES.CUSTOMER;
}

/**
 * Súper admins por email desde .env:
 * PLATFORM_SUPER_ADMINS=correo1@dom.com,correo2@dom.com
 *
 * Acepta:
 *  - string: email directo
 *  - objeto usuario: { email: string }
 */
export function isPlatformSuperAdmin(userOrEmail) {
  const email = typeof userOrEmail === 'string'
    ? userOrEmail
    : (userOrEmail?.email || '');

  const list = String(process.env.PLATFORM_SUPER_ADMINS || '')
    .split(',')
    .map(s => normLower(s))
    .filter(Boolean);

  return list.includes(normLower(email));
}

/**
 * Devuelve la membership activa (status: 'active' case-insensitive) para un tenant dado.
 */
function findActiveMembership(user, tenantId) {
  if (!user?.memberships || !tenantId) return null;
  const tid = String(tenantId);
  return user.memberships.find(m =>
    String(m?.storeId) === tid &&
    normLower(m?.status) === 'active'
  ) || null;
}

/**
 * Calcula la lista de roles efectiva para un tenant (tienda) dado:
 * - Si el usuario es SUPER_ADMIN por email en .env → [SUPER_ADMIN]
 * - Si hay tenantId: unión de platformRole + membership.roles + membership.role (si está activa)
 * - Si no hay tenantId / membership: usa retrocompatibilidad con user.role
 * - El resultado es único (sin repetidos)
 */
export function getEffectiveRoles(user, tenantId) {
  if (!user) return [ROLES.CUSTOMER];

  // SUPER_ADMIN por email en .env
  if (isPlatformSuperAdmin(user)) return [ROLES.SUPER_ADMIN];

  // Si no vino tenant, retrocompatibilidad (modo plataforma simple)
  if (!tenantId) {
    const base = new Set();
    if (user.platformRole) base.add(String(user.platformRole));
    // Incluir roles del usuario (ej: DELIVERY_AGENT)
    if (Array.isArray(user.roles)) user.roles.forEach(r => base.add(String(r)));
    base.add(mapLegacyUserRoleToPlatformRole(user.role));
    // Si no tenía nada, al menos CUSTOMER
    if (base.size === 0) base.add(ROLES.CUSTOMER);
    return Array.from(base);
  }

  // Con tenantId: tomamos membership activa para esa tienda
  const roles = new Set();

  // Rol de plataforma (si existe)
  if (user.platformRole) roles.add(String(user.platformRole));

  const mb = findActiveMembership(user, tenantId);
  if (mb) {
    if (Array.isArray(mb.roles)) mb.roles.forEach(r => roles.add(String(r)));
    if (mb.role) roles.add(String(mb.role));
  } else {
    // Sin membership activa: al menos CUSTOMER
    roles.add(ROLES.CUSTOMER);
  }

  return Array.from(roles);
}

/**
 * Devuelve **todos** los roles del usuario (sin tenant),
 * uniendo platformRole + todos los memberships activos + fallback legacy.
 */
export function getAllRoles(user) {
  if (!user) return [ROLES.CUSTOMER];
  // SUPER por email
  if (isPlatformSuperAdmin(user)) return [ROLES.SUPER_ADMIN];

  const roles = new Set();

  if (user.platformRole) roles.add(String(user.platformRole));

  (user.memberships || []).forEach(m => {
    if (normLower(m?.status) === 'active') {
      if (Array.isArray(m.roles)) m.roles.forEach(r => roles.add(String(r)));
      if (m.role) roles.add(String(m.role));
    }
  });

  if (roles.size === 0) {
    roles.add(mapLegacyUserRoleToPlatformRole(user.role));
  }

  return Array.from(roles);
}

/* ======================================================================
   Mapa de permisos por rol (para UI/guards).
   Nota: el backend puede tener su propio control de permisos;
   esto es útil para el Sidebar, botones, etc.
   ====================================================================== */
export const ROLE_PERMS = {
  [ROLES.SUPER_ADMIN]: [],   // En backend, SUPER suele equivaler a "*"
  [ROLES.STORE_OWNER]: [],
  [ROLES.FINANCE_MANAGER]: [],
  [ROLES.INVENTORY_MANAGER]: [],
  [ROLES.ORDER_MANAGER]: [],
  [ROLES.DELIVERY_AGENT]: [],
  [ROLES.SUPPORT_AGENT]: [],
  [ROLES.CUSTOMER]: [],
};

/* ---------- 2.2 Asignaciones solicitadas y set mínimo sensato ---------- */

// SUPER_ADMIN: añade explícitamente store:create y store:delete
ROLE_PERMS[ROLES.SUPER_ADMIN] = Array.from(new Set([
  ...(ROLE_PERMS[ROLES.SUPER_ADMIN] || []),
  'store:create',
  'store:delete',
  // extras útiles (opcional):
  'platform:users:read',
  'platform:stores:read',
]));

// STORE_OWNER: lectura/edición de tienda y gestión de miembros (sin delete global)
ROLE_PERMS[ROLES.STORE_OWNER] = Array.from(new Set([
  ...(ROLE_PERMS[ROLES.STORE_OWNER] || []),
  'store:read',
  'store:update',
  'store:members',
  'product:create',
  'product:update',
  'product:read',
  'inventory:read',
  'inventory:update',
  'order:read',
  'order:update',
  'settlement:read',
]));

// FINANCE_MANAGER: pagos, conciliaciones, reportes financieros
ROLE_PERMS[ROLES.FINANCE_MANAGER] = Array.from(new Set([
  'payment:read',
  'payment:refund',
  'settlement:read',
  'settlement:create',
  'reports:finance',
]));

// INVENTORY_MANAGER: stock/variantes
ROLE_PERMS[ROLES.INVENTORY_MANAGER] = Array.from(new Set([
  'inventory:read',
  'inventory:update',
  'product:read',
  'product:update',
]));

// ORDER_MANAGER: gestión de órdenes/estados
ROLE_PERMS[ROLES.ORDER_MANAGER] = Array.from(new Set([
  'order:read',
  'order:update',
  'order:fulfill',
]));

// DELIVERY_AGENT: ver y completar entregas asignadas
ROLE_PERMS[ROLES.DELIVERY_AGENT] = Array.from(new Set([
  'delivery:read:assigned',
  'delivery:update:assigned',
]));

// SUPPORT_AGENT: tickets, moderación básica
ROLE_PERMS[ROLES.SUPPORT_AGENT] = Array.from(new Set([
  'support:ticket:read',
  'support:ticket:update',
  'moderation:basic',
]));

// CUSTOMER: básico
ROLE_PERMS[ROLES.CUSTOMER] = Array.from(new Set([
  'catalog:read',
  'order:create',
  'order:read:self',
]));

/* ======================================================================
   Helpers de permisos
   ====================================================================== */

/** a) hasPerm(roles, perm): true si cualquier rol concede el permiso (o '*') */
export function hasPerm(roles, perm) {
  if (!Array.isArray(roles) || !perm) return false;
  const p = norm(perm);
  for (const r of roles) {
    const rr = String(r);
    const perms = ROLE_PERMS[rr] || [];
    if (perms.includes('*') || perms.includes(p)) return true;
  }
  return false;
}

/** b) userHas(user, perm, tenantId): calcula roles efectivos y aplica hasPerm */
export function userHas(user, perm, tenantId) {
  // SUPER_ADMIN por email → wildcard
  if (isPlatformSuperAdmin(user)) return true;
  const roles = tenantId ? getEffectiveRoles(user, tenantId) : getAllRoles(user);
  return hasPerm(roles, perm);
}
