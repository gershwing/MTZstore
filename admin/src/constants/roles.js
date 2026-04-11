// admin/src/constants/roles.js

// mismos valores que el server (ALL_ROLES)
export const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "STORE_OWNER",
  "FINANCE_MANAGER",
  "INVENTORY_MANAGER",
  "ORDER_MANAGER",
  "DELIVERY_AGENT",
  "SUPPORT_AGENT",
  "CUSTOMER",
];

// Roles asignables desde la UI (SUPER_ADMIN se gestiona desde .env)
export const ASSIGNABLE_ROLES = PLATFORM_ROLES.filter(
  (r) => r !== "SUPER_ADMIN"
);

// Si un rol de tienda no debe incluir SUPER_ADMIN y CUSTOMER:
export const STORE_ROLES = PLATFORM_ROLES.filter(
  (r) => r !== "SUPER_ADMIN" && r !== "CUSTOMER"
);

// Etiquetas bonitas para UI
export const ROLE_LABELS = {
  SUPER_ADMIN: "Super admin",
  STORE_OWNER: "Dueno de tienda",
  FINANCE_MANAGER: "Finanzas",
  INVENTORY_MANAGER: "Inventario",
  ORDER_MANAGER: "Pedidos",
  DELIVERY_AGENT: "Reparto",
  SUPPORT_AGENT: "Soporte",
  CUSTOMER: "Cliente",
};

// Roles operativos (no incluyen CUSTOMER ni SUPER_ADMIN)
export const OPERATIONAL_ROLES = [
  "STORE_OWNER",
  "DELIVERY_AGENT",
  "FINANCE_MANAGER",
  "INVENTORY_MANAGER",
  "ORDER_MANAGER",
  "SUPPORT_AGENT",
];

// Roles implícitos que no cuentan para el límite
export const IMPLICIT_ROLES = ["CUSTOMER", "USER"];

// Máximo de roles operativos por usuario
export const MAX_OPERATIONAL_ROLES = 2;

// Helpers
export const isStoreRole = (r) => STORE_ROLES.includes(r);
export const isOperationalRole = (r) => !IMPLICIT_ROLES.includes(r) && r !== "SUPER_ADMIN";
export const roleLabel = (r) => ROLE_LABELS[r] || r;
