// ======================================================
//  Menus por rol + builder con permisos (8 roles)
//  SUPER_ADMIN, STORE_OWNER, INVENTORY_MANAGER, ORDER_MANAGER,
//  DELIVERY_AGENT, SUPPORT_AGENT, FINANCE_MANAGER, CUSTOMER
// ======================================================

import { getTenantId } from "@/utils/tenant";

/* ========= Roles utilitarios ========= */
export const STORE_SCOPED_ROLES = new Set([
  "STORE_OWNER",
  "INVENTORY_MANAGER",
  "ORDER_MANAGER",
  "DELIVERY_AGENT",
]);

export const NON_STORE_ROLES = new Set([
  "FINANCE_MANAGER",
  "SUPPORT_AGENT",
]);

/**
 * Prefijos de rutas seguras para navegacion inicial/onboarding.
 * Solo rutas neutrales o de selector que NO requieren tenant.
 * ⚠️ Incluimos también las rutas de administración global bajo /admin
 *    que montaste como SAFE en App.jsx (users, stores, audit, permissions, apps).
 */
export const SAFE_PREFIXES = [
  "/admin/get-started",
  "/admin/applications",
  "/admin/sell",
  "/admin/store/select",
  "/admin/apply-delivery",
  "/",
  "/profile",
  "/logo",
  "/logo/manage",

  // ✅ Admin global (sin tenant)
  "/admin/users",
  "/admin/stores",
  "/admin/audit",
  "/admin/security/permissions",
  "/admin/seller-applications/admin",
  "/admin/delivery-applications/admin",
];

/* Áreas de tienda que requieren tenant (usado para ocultar si no hay X-Store-Id)
   Normalizadas bajo /admin/... para que coincidan con tus rutas reales. */
export const STORE_TENANT_PREFIXES = [
  "/admin/my-store",
  "/admin/catalog",
  "/admin/orders",
  "/admin/products",
  "/admin/direct-sales",
  "/admin/sales-history",
  "/admin/accounts-receivable",
  "/admin/inventory",
  "/admin/promotions",
  "/admin/payments",
  "/admin/branding",
  "/admin/homeSlider",       // ⚠️ ajustado a tu App.jsx
  "/admin/banners",          // (en App.jsx usas bannerV1/list y bannerlist2/List)
  "/admin/blog",             // blog/List
  "/admin/reports",
  "/admin/warehouse-inbound",
];

/* Rutas permitidas sin tenant aunque el rol sea de tienda */
export const ALLOW_WITHOUT_TENANT_PREFIXES = [
  "/admin/applications",
  "/admin/get-started",
  "/admin/sell",
  "/admin/store/select",
  "/admin/apply-delivery",
  "/admin/delivery",
  "/admin/available-deliveries",
  "/admin/my-deliveries",
];

const startsWithAny = (path, prefixes = []) =>
  !!prefixes.find((p) => path === p || path.startsWith(p));

/* ============ Helpers básicos ============ */
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const uniq = (xs) => Array.from(new Set(xs));
const normStr = (s) => String(s || "").trim();
const normPerms = (p) => new Set(arr(p).map(normStr));

export const isSuper = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return Boolean(
    user?.isSuper ||
    user?.isPlatformSuperAdmin ||
    roles.includes("SUPER_ADMIN") ||
    String(user?.role || "").toUpperCase() === "SUPER_ADMIN"
  );
};

// compat
const getActiveStoreId = (user) =>
  user?.activeStoreId ?? user?.viewer?.activeStoreId ?? null;

const hasAll = (permsSet, required = []) => {
  const req = arr(required);
  if (!req.length) return true;
  if (typeof permsSet.has === "function") {
    if (permsSet.has("*")) return true;
    return req.every((r) => permsSet.has(r));
  }
  return false;
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/** Merge no-destructivo de items por 'label' + 'to' */
function mergeMenus(a = [], b = []) {
  const key = (it) => `${it.label}|${it.to || "-"}`;
  const map = new Map();

  for (const it of [...a, ...b]) {
    const k = key(it);
    if (!map.has(k)) {
      map.set(k, deepClone(it));
    } else {
      const prev = map.get(k);
      const mergedChildren = mergeMenus(prev.children || [], it.children || []);
      prev.children = mergedChildren.length ? mergedChildren : undefined;
      prev.required = uniq([...(prev.required || []), ...(it.required || [])]);
      prev.onlySuper = prev.onlySuper || it.onlySuper;
      prev.onlyNoMemberships = prev.onlyNoMemberships || it.onlyNoMemberships;
      map.set(k, prev);
    }
  }
  return Array.from(map.values());
}

/** Filtra por permisos + reglas especiales y oculta padres sin hijos
 *  Además: si el usuario es de tienda y NO hay tenant, oculta módulos store-scoped
 *  salvo excepciones (Applications, selector, etc.).
 */
function filterItems(
  items,
  permsSet,
  { superMode = false, isStoreScopedUser = false, hasTenant = false } = {}
) {
  const out = [];
  for (const it of items || []) {
    if (!it) continue;

    if (superMode && it.hideWhenSuper) continue;
    if (it.onlySuper && !superMode) continue;
    if (!hasAll(permsSet, it.required)) continue;

    if (!superMode && isStoreScopedUser && !hasTenant && it.to) {
      const to = String(it.to);
      const isStoreArea = startsWithAny(to, STORE_TENANT_PREFIXES);
      const isAllowed = startsWithAny(to, ALLOW_WITHOUT_TENANT_PREFIXES);
      if (isStoreArea && !isAllowed) continue;
    }

    let children = undefined;
    if (Array.isArray(it.children) && it.children.length) {
      children = filterItems(it.children, permsSet, {
        superMode,
        isStoreScopedUser,
        hasTenant,
      });
    }
    if (!it.to && (!children || children.length === 0)) continue;

    out.push({ ...it, ...(children ? { children } : {}) });
  }
  return out;
}

/* ============ Mapa de permisos por módulo (referencial) ============ */
export const MODULE_PERMS = {
  users: { read: "user:read", invite: "user:invite" },
  stores: {
    read: "store:read",
    create: "store:create",
    members: "store:members",
    sellerAdmin: "sellerApp:admin",
  },
  products: { read: "product:read" },
  inventory: { read: "inventory:read" },
  promos: { read: "promotion:read" },
  orders: { read: "order:read" },
  delivery: {
    read: "delivery:read",
    take: "delivery:take",
    assign: "delivery:assign",
    selfUpdate: "delivery:updateStatus",
  },
  payments: { read: "payment:read" },
  reports: { read: "report:read" },
  support: { read: "support:read", moderate: "review:moderate" },
  branding: {
    logo: "logo:read",
    slider: "slider:read",
    banner: "banner:read",
    blog: "blog:read",
  },
  security: { perm: "permission:read", audit: "audit:read" },
  categories: {
    read: "category:read",
    create: "category:create",
    update: "category:update",
    delete: "category:delete",
  },
  applications: {
    deliveryAdmin: "deliveryApp:admin",
    adminAdmin: "adminApp:admin",
  },
  warehouse: {
    read: "warehouse:read",
    create: "warehouse:create",
    update: "warehouse:update",
    moves: "warehouse:moves",
    audit: "warehouse:audit",
  },
};

/* ============ Plantillas por rol ============ */
/**
 * Plataforma (solo SUPER) – rutas RELATIVAS a /admin para encajar con tu App.jsx
 * y evitar el rebote al dashboard.
 */
export const PLATFORM_MENU = [
  { label: "Panel de control", icon: "RxDashboard", to: "/admin", exact: true, required: [], onlySuper: true },

  // --- GESTION DE PLATAFORMA ---
  {
    label: "Usuarios",
    icon: "FiUsers",
    required: [MODULE_PERMS.users.read],
    onlySuper: true,
    children: [
      { label: "Lista de usuarios", icon: "FiUsers", to: "users", required: [MODULE_PERMS.users.read] },
    ],
  },

  {
    label: "Tiendas",
    icon: "TbBuildingStore",
    required: [MODULE_PERMS.stores.read],
    onlySuper: true,
    children: [
      { label: "Listado", icon: "TbBuildingStore", to: "stores", required: [MODULE_PERMS.stores.read] },
    ],
  },

  {
    label: "Categorias",
    icon: "BiCategory",
    required: [MODULE_PERMS.categories.read],
    onlySuper: true,
    children: [
      { label: "Categorias (L1)", icon: "BiCategory", to: "category/list", required: [MODULE_PERMS.categories.read] },
      { label: "Subcategorias (L2)", icon: "BiCategory", to: "subCategory/list", required: [MODULE_PERMS.categories.read] },
      { label: "Tercer nivel (L3)", icon: "BiCategory", to: "thirdCategory/list", required: [MODULE_PERMS.categories.read] },
    ],
  },

  {
    label: "Postulaciones",
    icon: "MdAssignment",
    required: [],
    onlySuper: true,
    children: [
      { label: "Tiendas", icon: "TbBuildingStore", to: "seller-applications/admin", required: [MODULE_PERMS.applications.adminAdmin] },
      { label: "Delivery", icon: "TbTruckDelivery", to: "delivery-applications/admin", required: [MODULE_PERMS.applications.deliveryAdmin] },
    ],
  },

  // --- OPERACIONES ---
  {
    label: "Productos",
    icon: "RiProductHuntLine",
    required: [MODULE_PERMS.products.read],
    onlySuper: true,
    children: [
      { label: "Lista de productos", icon: "RiProductHuntLine", to: "products", required: [MODULE_PERMS.products.read] },
    ],
  },

  {
    label: "Ventas directas",
    icon: "MdPointOfSale",
    required: [MODULE_PERMS.products.read],
    onlySuper: true,
    children: [
      { label: "Nueva venta", icon: "MdPointOfSale", to: "direct-sales", required: [MODULE_PERMS.products.read] },
      { label: "Historial", icon: "MdPointOfSale", to: "sales-history", required: [MODULE_PERMS.products.read] },
      { label: "Cuentas por cobrar", icon: "MdPointOfSale", to: "accounts-receivable", required: [MODULE_PERMS.products.read] },
    ],
  },

  {
    label: "Órdenes en línea",
    icon: "IoBagCheckOutline",
    required: [MODULE_PERMS.orders.read],
    onlySuper: true,
    children: [
      { label: "Todas las órdenes", icon: "IoBagCheckOutline", to: "orders", required: [MODULE_PERMS.orders.read] },
    ],
  },

  // --- LOGISTICA ---
  {
    label: "Almacen",
    icon: "MdWarehouse",
    required: [MODULE_PERMS.inventory.read],
    onlySuper: true,
    children: [
      { label: "Inventario", icon: "MdWarehouse", to: "inventory", required: [MODULE_PERMS.inventory.read] },
      { label: "Envios al almacen", icon: "MdLocalShipping", to: "warehouse-inbound", required: [MODULE_PERMS.inventory.read] },
    ],
  },

  {
    label: "Delivery",
    icon: "TbTruckDelivery",
    required: [MODULE_PERMS.delivery.read],
    onlySuper: true,
    children: [
      { label: "Entregas", icon: "TbTruckDelivery", to: "delivery", required: [MODULE_PERMS.delivery.read] },
      { label: "Entregas disponibles", icon: "MdLocalShipping", to: "available-deliveries", required: [MODULE_PERMS.delivery.read] },
      { label: "Repartidores", icon: "FiUsers", to: "delivery-agents", required: [MODULE_PERMS.delivery.read] },
      { label: "Mis entregas", icon: "TbTruckDelivery", to: "my-deliveries", required: [MODULE_PERMS.delivery.selfUpdate] },
    ],
  },

  // --- FINANZAS ---
  {
    label: "Finanzas",
    icon: "MdBarChart",
    required: [],
    onlySuper: true,
    children: [
      { label: "Estado de resultados", icon: "MdBarChart", to: "profit-loss", required: [MODULE_PERMS.products.read] },
      { label: "Liquidaciones", icon: "MdAccountBalance", to: "settlements", required: [MODULE_PERMS.payments.read] },
      { label: "Pagos", icon: "TbCreditCard", to: "payments", required: [MODULE_PERMS.payments.read] },
      { label: "Reportes", icon: "MdQueryStats", to: "reports", required: [MODULE_PERMS.reports.read] },
    ],
  },

  // --- CMS & SEGURIDAD ---
  {
    label: "Branding & CMS",
    icon: "IoLogoBuffer",
    required: ["slider:read", "banner:read", "logo:read"],
    onlySuper: true,
    children: [
      { label: "Logos", icon: "FaRegImage", to: "logo/manage", required: "logo:read" },
      { label: "Sliders", icon: "IoLogoBuffer", to: "homeSlider/list", required: ["slider:read"] },
      { label: "Banners", icon: "IoLogoBuffer", to: "bannerV1/list", required: ["banner:read"] },
      { label: "Banners V2", icon: "IoLogoBuffer", to: "bannerlist2/List", required: ["banner:read"] },
      { label: "Blog", icon: "IoLogoBuffer", to: "blog/List", required: ["blog:read"] },
    ],
  },

  {
    label: "Seguridad",
    icon: "FiUsers",
    required: [],
    onlySuper: true,
    children: [
      { label: "Permisos", icon: "FiUsers", to: "security/permissions", required: ["permission:read"] },
      { label: "Auditoria", icon: "FiUsers", to: "audit", required: ["audit:read"] },
    ],
  },
];

/** Base tienda (para componer con roles de tienda) */
export const BASE_STORE_MENU = [
  { label: "Empezar", icon: "MdRocketLaunch", to: "/admin/get-started", required: [], hideWhenSuper: true },
  { label: "Panel de control", icon: "RxDashboard", to: "/admin", exact: true, required: [] },
  { label: "Mi tienda", icon: "TbBuildingStore", to: "/admin/my-store", required: [] },

  {
    label: "Productos",
    icon: "RiProductHuntLine",
    required: [MODULE_PERMS.products.read],
    children: [
      { label: "Lista de productos", icon: "RiProductHuntLine", to: "/admin/products", required: [MODULE_PERMS.products.read] },
    ],
  },

  {
    label: "Ventas directas",
    icon: "MdPointOfSale",
    required: [MODULE_PERMS.products.read],
    children: [
      { label: "Nueva venta", icon: "MdPointOfSale", to: "/admin/direct-sales", required: [MODULE_PERMS.products.read] },
      { label: "Historial", icon: "MdPointOfSale", to: "/admin/sales-history", required: [MODULE_PERMS.products.read] },
      { label: "Cuentas por cobrar", icon: "MdPointOfSale", to: "/admin/accounts-receivable", required: [MODULE_PERMS.products.read] },
    ],
  },

  {
    label: "Órdenes en línea",
    icon: "IoBagCheckOutline",
    required: [MODULE_PERMS.orders.read],
    children: [
      { label: "Todas las órdenes", icon: "IoBagCheckOutline", to: "/admin/orders", required: [MODULE_PERMS.orders.read] },
    ],
  },

  {
    label: "Almacen",
    icon: "MdWarehouse",
    required: [MODULE_PERMS.inventory.read],
    children: [
      { label: "Inventario", icon: "MdWarehouse", to: "/admin/inventory", required: [MODULE_PERMS.inventory.read] },
      { label: "Envios al almacen", icon: "MdLocalShipping", to: "/admin/warehouse-inbound", required: [MODULE_PERMS.inventory.read] },
    ],
  },

  {
    label: "Delivery",
    icon: "TbTruckDelivery",
    required: [MODULE_PERMS.delivery.read],
    children: [
      { label: "Entregas", icon: "TbTruckDelivery", to: "/admin/delivery", required: [MODULE_PERMS.delivery.read] },
      { label: "Entregas disponibles", icon: "MdLocalShipping", to: "/admin/available-deliveries", required: [MODULE_PERMS.delivery.take] },
      { label: "Mis entregas", icon: "TbTruckDelivery", to: "/admin/my-deliveries", required: [MODULE_PERMS.delivery.selfUpdate] },
    ],
  },

  {
    label: "Finanzas",
    icon: "MdBarChart",
    required: [],
    children: [
      { label: "Estado de resultados", icon: "MdBarChart", to: "/admin/profit-loss", required: [MODULE_PERMS.products.read] },
      { label: "Liquidaciones", icon: "MdAccountBalance", to: "/admin/settlements", required: [MODULE_PERMS.payments.read] },
      { label: "Reportes", icon: "MdQueryStats", to: "/admin/reports", required: [MODULE_PERMS.reports.read] },
    ],
  },
];

/** Plantillas por rol de tienda
 * BASE_STORE_MENU indices:
 * [0] Empezar  [1] Panel  [2] Mi tienda  [3] Productos  [4] Ventas directas
 * [5] Órdenes en línea  [6] Almacen  [7] Delivery  [8] Finanzas
 */
export const ROLE_MENU_TEMPLATES = {
  STORE_OWNER: BASE_STORE_MENU,

  INVENTORY_MANAGER: [
    BASE_STORE_MENU[1], // Panel de control
    BASE_STORE_MENU[2], // Mi tienda
    {
      label: "Almacen",
      icon: "MdWarehouse",
      required: [MODULE_PERMS.inventory.read],
      children: [
        { label: "Inventario", icon: "MdWarehouse", to: "/admin/inventory", required: [MODULE_PERMS.inventory.read] },
        { label: "Envios al almacen", icon: "MdLocalShipping", to: "/admin/warehouse-inbound", required: [MODULE_PERMS.inventory.read] },
      ],
    },
    BASE_STORE_MENU[3], // Productos
  ],

  ORDER_MANAGER: [
    BASE_STORE_MENU[1], // Panel de control
    BASE_STORE_MENU[2], // Mi tienda
    BASE_STORE_MENU[5], // Ordenes
    BASE_STORE_MENU[7], // Delivery
    {
      label: "Reportes",
      icon: "MdQueryStats",
      to: "/admin/reports",
      required: [MODULE_PERMS.reports.read],
    },
  ],

  DELIVERY_AGENT: [
    BASE_STORE_MENU[1], // Panel de control
    BASE_STORE_MENU[2], // Mi tienda
    {
      label: "Entregas disponibles",
      icon: "MdLocalShipping",
      to: "/admin/available-deliveries",
      required: [MODULE_PERMS.delivery.take],
    },
    {
      label: "Mis entregas",
      icon: "TbTruckDelivery",
      to: "/admin/my-deliveries",
      required: [MODULE_PERMS.delivery.selfUpdate],
    },
  ],

  SUPPORT_AGENT: [
    BASE_STORE_MENU[1], // Panel de control
    BASE_STORE_MENU[2], // Mi tienda
  ],

  FINANCE_MANAGER: [
    BASE_STORE_MENU[1], // Panel de control
    BASE_STORE_MENU[2], // Mi tienda
    {
      label: "Finanzas",
      icon: "MdBarChart",
      required: [],
      children: [
        { label: "Estado de resultados", icon: "MdBarChart", to: "/admin/profit-loss", required: [MODULE_PERMS.reports.read] },
        { label: "Liquidaciones", icon: "MdAccountBalance", to: "/admin/settlements", required: [MODULE_PERMS.payments.read] },
        { label: "Pagos", icon: "TbCreditCard", to: "/admin/payments", required: [MODULE_PERMS.payments.read] },
        { label: "Reportes", icon: "MdQueryStats", to: "/admin/reports", required: [MODULE_PERMS.reports.read] },
      ],
    },
  ],

  CUSTOMER: [{ ...BASE_STORE_MENU[0], hideWhenSuper: true }],
};

/* Export "MENU" legacy (compat) */
export const MENU = deepClone(BASE_STORE_MENU);

/* Builders recomendados */
export function buildSidebarMenu(user, hasPerm = () => true) {
  const superMode = isSuper(user);
  const hasTenant = Boolean(getTenantId());
  const roles = Array.isArray(user?.roles) ? user.roles.map(String) : [];
  const isStoreOwner = roles.includes("STORE_OWNER");
  const isStoreScopedUser = arr(user?.roles).some((r) => STORE_SCOPED_ROLES.has(r));
  const permsSet = normPerms((hasPerm && hasPerm.__all) ? hasPerm.__all : []);
  const proxy = permsSet.size ? permsSet : { has: (p) => (typeof hasPerm === "function" ? !!hasPerm(p) : false) };

  return superMode
    ? filterItems(PLATFORM_MENU, proxy, { superMode, hasTenant, isStoreScopedUser })
    : filterItems(BASE_STORE_MENU, proxy, { superMode, hasTenant, isStoreScopedUser, isStoreOwner });
}

export function buildSidebarMenuByRoles(user, hasPerm = () => true) {
  const superMode = isSuper(user);
  const hasTenant = Boolean(getTenantId());
  const roles = Array.isArray(user?.roles) ? user.roles.map(String) : [];
  const isStoreOwner = roles.includes("STORE_OWNER");
  const isStoreScopedUser = arr(user?.roles).some((r) => STORE_SCOPED_ROLES.has(r));

  if (superMode) {
    const perms = normPerms((hasPerm && hasPerm.__all) ? hasPerm.__all : []);
    const proxy = perms.size ? perms : { has: (p) => (typeof hasPerm === "function" ? !!hasPerm(p) : false) };
    return filterItems(PLATFORM_MENU, proxy, { superMode, hasTenant, isStoreScopedUser });
  }

  const rolesClean = uniq(arr(user?.roles).filter((r) => r && r !== "SUPER_ADMIN"));
  const rolesToUse = rolesClean.length ? rolesClean : ["CUSTOMER"];

  let composed = [];
  for (const r of rolesToUse) composed = mergeMenus(composed, ROLE_MENU_TEMPLATES[r] || []);
  if (!composed.length) composed = deepClone(BASE_STORE_MENU);

  const permsSet = normPerms((hasPerm && hasPerm.__all) ? hasPerm.__all : []);
  const proxy = permsSet.size ? permsSet : { has: (p) => (typeof hasPerm === "function" ? !!hasPerm(p) : false) };

  return filterItems(composed, proxy, { superMode, hasTenant, isStoreScopedUser, isStoreOwner });
}

