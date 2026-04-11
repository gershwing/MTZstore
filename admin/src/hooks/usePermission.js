import { useMemo } from "react";
import { useAuth } from "./useAuth";

function usePermission() {
  // Fuente única de verdad (ajusta si tu useAuth expone otras props)
  const auth = (typeof useAuth === "function" ? useAuth() : {}) || {};
  const {
    roles: rolesArr = [],
    permissions: permsArr = [],
    isSuper = false,
  } = auth;

  // Normaliza y crea sets para consultas O(1)
  const roles = useMemo(() => (Array.isArray(rolesArr) ? rolesArr.map(String) : []), [rolesArr]);
  const roleSet = useMemo(() => new Set(roles), [roles]);
  const permSet = useMemo(
    () => new Set((Array.isArray(permsArr) ? permsArr : []).map(String)),
    [permsArr]
  );

  const hasRole = (r) => roleSet.has(String(r));

  // can permite por rol o permiso; isSuper siempre true
  const can = (...rs) => {
    if (isSuper) return true;
    if (!rs || rs.length === 0) return true; // sin requisitos => permitido
    return rs.some((r) => roleSet.has(String(r)) || permSet.has(String(r)));
  };

  // Compat helpers (mucho código previo usa perm.any([...]) / perm.all([...]))
  const any = (arr) => {
    if (isSuper) return true;
    const list = Array.isArray(arr) ? arr : [arr];
    return list.some((r) => roleSet.has(String(r)) || permSet.has(String(r)));
  };

  const all = (arr) => {
    if (isSuper) return true;
    const list = Array.isArray(arr) ? arr : [arr];
    return list.every((r) => roleSet.has(String(r)) || permSet.has(String(r)));
  };

  // Exposición de flags de navegación/módulos (ajústalos a tu taxonomía real)
  const api = useMemo(
    () => ({
      // base
      isSuper,
      roles,
      hasRole,
      can,
      any,
      all,

      // para debug rápido de permisos efectivos
      canList: {
        roles: [...roleSet],
        perms: [...permSet],
      },

      // navegación / onboarding
      canSeeApplications: true,
      canApplySeller: true,
      canApplyDelivery: true,

      // admin / gestión
      canSeeAdminPanels: can("ADMIN", "SUPER_ADMIN"),
      canManageStores: can("STORE_OWNER", "ADMIN", "SUPER_ADMIN", "store:write"),
      canManageUsers: can("ADMIN", "SUPER_ADMIN", "user:write"),

      // módulos
      canSeeInventory: can("INVENTORY", "STORE_OWNER", "ADMIN", "SUPER_ADMIN", "inventory:read"),
      canSeeFinance: can("FINANCE", "STORE_OWNER", "ADMIN", "SUPER_ADMIN", "finance:read"),
      canSeeDeliveryArea: can("DELIVERY", "ADMIN", "SUPER_ADMIN", "delivery:read"),
      canSeeSupport: can("SUPPORT", "ADMIN", "SUPER_ADMIN", "support:read"),
    }),
    [isSuper, roles, roleSet, permSet]
  );

  // Para compat: permitir inspección tipo perm.can.__all
  try {
    api.can.__all = [...permSet];
  } catch { }

  return api;
}

export default usePermission;
export { usePermission };
