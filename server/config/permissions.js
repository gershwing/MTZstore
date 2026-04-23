// server/config/permissions.js
import { ROLES } from "./roles.js";

/**
 * PERMISOS por ROL.
 * - SUPER_ADMIN: '*' (todo)
 * - ADMIN: superset pragmático para legacy (coincide con tu panel actual)
 * - Resto: lo necesario para cada módulo
 */
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ["*"],

  // ───────────────────────── ADMIN (legacy) ─────────────────────────
  [ROLES.ADMIN]: [
    // --- STORE ---
    "store:read", "store:update", "store:status", "store:settings", "store:members",
    "store:create", "store:delete",

    // --- USERS / MEMBERS ---
    "user:read", "user:delete",
    "user:invite", "user:assignRole", "user:deactivate",

    // --- ADDRESS ---
    "address:read", "address:create", "address:update", "address:delete",

    // --- PRODUCTOS ---
    "product:read", "product:create", "product:update", "product:delete", "product:publish",
    "product:image:upload", "product:image:delete",
    "product:spec:create", "product:spec:update", "product:spec:delete",
    "product:weight:create", "product:weight:update", "product:weight:delete",
    "product:size:create", "product:size:update", "product:size:delete",

    // --- INVENTARIO / ÓRDENES / PAGOS ---
    "inventory:read", "inventory:adjust", "inventory:reserve", "inventory:release", "inventory:move",
    "order:create", "order:read", "order:updateStatus", "order:cancel",
    "payment:read", "payment:refund", "payment:reconcile",

    // --- PROMOS / REPORTES / WEBHOOKS / AUDIT ---
    "promotion:read", "promotion:create", "promotion:update", "promotion:delete",
    "report:read",
    "webhook:read", "webhook:replay",
    "audit:read",

    // --- CATÁLOGO / MEDIA ---
    "catalog:read", "catalog:create", "catalog:update", "catalog:delete",
    "media:upload", "media:image:upload",

    // --- REVIEWS ---
    "review:read", "review:moderate",

    // --- CMS / BRANDING ---
    "logo:read", "logo:create", "logo:update", "logo:delete",
    "slider:read", "slider:create", "slider:update", "slider:delete",
    "blog:read", "blog:create", "blog:update", "blog:delete",

    // --- BANNERS ---
    "banner:read", "banner:create", "banner:update", "banner:delete",
    "banner:image:upload", "banner:image:delete",

    // --- DELIVERY / SUPPORT ---
    "delivery:read", "delivery:take", "delivery:assign", "delivery:updateStatus", "delivery:proof",
    "delivery:partnerships:read", "delivery:partnerships:write", "delivery:trust:manage",
    "support:read", "support:reply", "support:close",

    // --- ADMISSIONS (Aplicaciones) ---
    "seller:applications:read",
    "seller:applications:write",
    "delivery:applications:read",
    "delivery:applications:write",

    // === Agregados (para cobertura granular y validador) ===
    "product:rw", "order:rw", "delivery:rw", "payment:rw",

    // 🔹 Permisos específicos de apps de vendedor
    "sellerApp:approve",
    "sellerApp:admin", // ← añadido para que no sea "desconocido" si lo usa el menú

    // --- WAREHOUSE INBOUND ---
    "warehouse:read", "warehouse:write",
  ],

  [ROLES.STORE_OWNER]: [
    "store:read", "store:update", "store:status", "store:settings", "store:members", "report:read",

    "user:read", "user:delete",
    "user:invite", "user:assignRole", "user:deactivate",

    // Productos/Inventario/Órdenes/Finance
    "product:read", "product:create", "product:update", "product:delete", "product:publish",
    "product:image:upload", "product:image:delete",
    "product:spec:create", "product:spec:update", "product:spec:delete",
    "product:weight:create", "product:weight:update", "product:weight:delete",
    "product:size:create", "product:size:update", "product:size:delete",

    "inventory:read", "inventory:adjust", "inventory:reserve", "inventory:release", "inventory:move",
    "order:read", "order:updateStatus", "order:cancel", "order:create",
    "payment:read", "payment:refund", "payment:reconcile",

    "promotion:read", "promotion:create", "promotion:update", "promotion:delete",
    "report:read",
    "webhook:read", "webhook:replay",
    "audit:read",

    "catalog:read", "catalog:create", "catalog:update", "catalog:delete",
    "media:upload", "media:image:upload",

    "review:read", "review:moderate",

    "logo:read", "logo:create", "logo:update", "logo:delete",
    "slider:read", "slider:create", "slider:update", "slider:delete",
    "blog:read", "blog:create", "blog:update", "blog:delete",

    "banner:read", "banner:create", "banner:update", "banner:delete",
    "banner:image:upload", "banner:image:delete",

    "delivery:read", "delivery:take", "delivery:assign", "delivery:updateStatus", "delivery:proof",
    "delivery:partnerships:read", "delivery:partnerships:write",
    "support:read", "support:reply", "support:close",

    "product:rw", "order:rw", "delivery:rw", "payment:rw",

    // --- WAREHOUSE INBOUND ---
    "warehouse:read", "warehouse:write",
  ],

  [ROLES.FINANCE_MANAGER]: [
    "payment:read", "payment:refund", "payment:reconcile",
    "report:read",
    "order:read",
  ],

  [ROLES.INVENTORY_MANAGER]: [
    "product:read", "product:create", "product:update", "product:delete", "product:publish",
    "product:image:upload", "product:image:delete",
    "product:spec:create", "product:spec:update", "product:spec:delete",
    "product:weight:create", "product:weight:update", "product:weight:delete",
    "product:size:create", "product:size:update", "product:size:delete",

    "inventory:read", "inventory:adjust", "inventory:reserve", "inventory:release", "inventory:move",
    "order:read",
    "delivery:read", "delivery:receiveWarehouse",
    "catalog:read", "catalog:create", "catalog:update", "catalog:delete",
    "media:upload", "media:image:upload",

    "slider:read", "slider:create", "slider:update", "slider:delete",
    "banner:read",

    "product:rw",
  ],

  [ROLES.ORDER_MANAGER]: [
    "order:read", "order:updateStatus", "order:cancel",
    "delivery:assign",
    "inventory:reserve", "inventory:release",
    "payment:read",
    "product:read", "catalog:read",
    "banner:read",
    "report:read",

    "order:rw",
  ],

  [ROLES.DELIVERY_AGENT]: [
    "delivery:read", "delivery:take", "delivery:updateStatus", "delivery:proof",
    "delivery:partnerships:read", "delivery:partnerships:write",
    "order:read",

    "delivery:rw",
  ],

  [ROLES.SUPPORT_AGENT]: [
    "order:read", "payment:read",
    "refund:request",
    "review:read", "review:moderate",
    "report:read",
    "product:read", "catalog:read",
    "blog:read",
    "banner:read",
    "support:read", "support:reply"
  ],

  [ROLES.SELLER]: [
    "product:read",
    "catalog:read",
    "banner:read",
    "order:read",
    "inventory:read",
    "report:read",
  ],

  [ROLES.CUSTOMER]: [
    "order:create", "order:read",
    "refund:request",
    "review:create",
    "address:read", "address:create", "address:update", "address:delete",
  ],
};

/** Helpers de chequeo */
export function roleHasPermission(role, permission) {
  const list = PERMISSIONS[role] || [];
  if (list.includes("*")) return true;
  if (list.includes(permission)) return true;
  const [res] = permission.split(":");
  if (list.includes(`${res}:*`)) return true;
  return false;
}
export function roleHasAnyPermission(role, ...perms) {
  return perms.some((p) => roleHasPermission(role, p));
}

/** "Permisos agregados" que cubren varios granulares */
export const GROUP_PERMISSION_OF = Object.freeze({
  // Users
  "user:read": "user:read",
  "user:delete": "user:read",
  "user:assignRole": "user:read",
  "user:invite": "user:read",

  // Store / Catalog
  "store:read": "store:read",
  "store:create": "store:read",   // ← añadido
  "store:update": "store:read",   // ← añadido
  "store:delete": "store:read",   // ← añadido
  "store:members": "store:read",  // ← añadido
  "catalog:read": "store:read",

  // Category
  "category:read": "product:rw",
  "category:create": "product:rw",
  "category:update": "product:rw",
  "category:delete": "product:rw",
  "category:image:upload": "product:rw",
  "category:image:delete": "product:rw",
  "category:attribute:assign": "product:rw",
  "category:attribute:update": "product:rw",
  "category:attribute:delete": "product:rw",

  // Product
  "product:read": "product:rw",
  "product:create": "product:rw",
  "product:update": "product:rw",
  "product:delete": "product:rw",
  "product:image:upload": "product:rw",
  "product:image:delete": "product:rw",
  "product:spec:create": "product:rw",
  "product:spec:update": "product:rw",
  "product:spec:delete": "product:rw",
  "product:weight:create": "product:rw",
  "product:weight:update": "product:rw",
  "product:weight:delete": "product:rw",
  "product:size:create": "product:rw",
  "product:size:update": "product:rw",
  "product:size:delete": "product:rw",

  // Address
  "address:create": "store:read",
  "address:read": "store:read",
  "address:update": "store:read",
  "address:delete": "store:read",

  // Sliders / Banners / Blog / Media
  "slider:read": "product:rw",
  "slider:create": "product:rw",
  "slider:update": "product:rw",
  "slider:delete": "product:rw",
  "banner:read": "product:rw",
  "banner:create": "product:rw",
  "banner:update": "product:rw",
  "banner:delete": "product:rw",
  "banner:image:upload": "product:rw",
  "banner:image:delete": "product:rw",
  "blog:read": "product:rw",
  "blog:create": "product:rw",
  "blog:update": "product:rw",
  "blog:delete": "product:rw",
  "blog:image:upload": "product:rw",
  "media:image:upload": "product:rw",

  // Orders / Inventory
  "order:read": "order:rw",
  "order:create": "order:rw",
  "order:updateStatus": "order:rw",
  "order:cancel": "order:rw",
  "inventory:read": "product:rw",
  "inventory:adjust": "product:rw",
  "inventory:reserve": "product:rw",
  "inventory:release": "product:rw",
  "inventory:move": "product:rw",

  // Promotions
  "promotion:read": "product:rw",
  "promotion:create": "product:rw",
  "promotion:update": "product:rw",
  "promotion:delete": "product:rw",

  // Payments / Reports
  "payment:read": "payment:rw",
  "payment:refund": "payment:rw",
  "payment:reconcile": "payment:rw",
  "report:read": "report:read",

  // Support
  "support:read": "user:read",
  "support:reply": "user:read",
  "support:close": "user:read",

  // Delivery
  "delivery:read": "delivery:rw",
  "delivery:take": "delivery:rw",
  "delivery:assign": "delivery:rw",
  "delivery:updateStatus": "delivery:rw",
  "delivery:proof": "delivery:rw",
  "delivery:partnerships:read": "delivery:rw",
  "delivery:partnerships:write": "delivery:rw",
  "delivery:trust:manage": "delivery:rw",

  // Reviews
  "review:create": "product:rw",
  "review:moderate": "product:rw",

  // Logos
  "logo:read": "store:read",
  "logo:create": "store:read",
  "logo:update": "store:read",
  "logo:delete": "store:read",

  // Admissions (para validador/agrupación)
  "seller:applications:read": "audit:read",
  "seller:applications:write": "audit:read",
  "delivery:applications:read": "audit:read",
  "delivery:applications:write": "audit:read",

  // 🔹 Permisos específicos
  "sellerApp:approve": "seller:applications:write",
  "sellerApp:admin": "seller:applications:read", // ← añadido

  // Warehouse Inbound
  "warehouse:read": "warehouse:read",
  "warehouse:write": "warehouse:read",
});
export function groupPermissionFor(p) {
  return GROUP_PERMISSION_OF[p] || null;
}

/** ALIAS de compatibilidad (para no romper tus rutas/guards existentes) */
export const PERMISSION_ALIASES = Object.freeze({
  // tus rutas del server usan estos:
  "user:create": ["user:invite"],                           // crear usuario
  "user:update": ["user:assignRole", "user:deactivate"],    // actualizar estado/rol
  "user:delete": ["user:delete"],                           // eliminar
  // si en el front aparece "user:read" ya existe tal cual
});

/**
 * Catálogo explícito de códigos de permisos "conocidos".
 * Útil para evitar warnings del validador cuando el menú referencia permisos
 * que no están aún asignados a roles.
 */
export const PERMISSION_REGISTRY = new Set([
  "store:read", "store:create", "store:update", "store:delete", "store:members",
  "sellerApp:approve", "sellerApp:admin",
  "warehouse:read", "warehouse:write",
  "delivery:partnerships:read", "delivery:partnerships:write", "delivery:trust:manage",
]);

/**
 * Conjunto de permisos conocidos (para el validador).
 * Se arma automáticamente desde PERMISSIONS, GROUP_PERMISSION_OF, PERMISSION_ALIASES
 * y PERMISSION_REGISTRY, y se fuerza la inclusión de 'sellerApp:approve'.
 */
export const KNOWN_PERMISSIONS = (() => {
  const s = new Set();

  // de PERMISSIONS (omitir '*')
  Object.values(PERMISSIONS).forEach(arr => (arr || []).forEach(p => { if (p !== "*") s.add(p); }));

  // claves de agrupación + su permiso padre
  Object.entries(GROUP_PERMISSION_OF).forEach(([k, v]) => { s.add(k); if (v) s.add(v); });

  // aliases (clave y valores)
  Object.entries(PERMISSION_ALIASES).forEach(([k, v]) => {
    s.add(k);
    (v || []).forEach(a => s.add(a));
  });

  // catálogo explícito
  PERMISSION_REGISTRY.forEach(p => s.add(p));

  // asegurar el permiso clave
  s.add("sellerApp:approve");

  return s;
})();
