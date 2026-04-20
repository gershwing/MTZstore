// admin/src/routes/RoleRedirect.jsx
import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Membresía "activa" tolerante
function hasActiveMembership(u) {
  const list = Array.isArray(u?.memberships) ? u.memberships : [];
  return list.some(m => String(m?.status || "").toLowerCase() === "active");
}

// Detección robusta de SUPER
function isSuperUser(u) {
  if (!u) return false;
  if (u.isSuper === true) return true;
  if (u.isPlatformSuperAdmin === true) return true;
  if (String(u.role || "").toUpperCase() === "SUPER_ADMIN") return true;
  const roles = Array.isArray(u.roles) ? u.roles : [];
  return roles.includes("SUPER_ADMIN");
}

export default function RoleRedirect() {
  const { authReady, isAuthenticated, me } =
    (typeof useAuth === "function" ? useAuth() : {}) || {};

  if (!authReady) return <div className="p-6">Cargando sesión…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = Array.isArray(me?.roles) ? me.roles : [];
  const isSuper = isSuperUser(me);
  const activeStoreId =
    String(
      me?.activeStoreId ||
      me?.viewer?.activeStoreId ||
      (typeof window !== "undefined" ? localStorage.getItem("X-Store-Id") : "") ||
      ""
    ).trim();
  const hasTenant = !!activeStoreId;
  const hasMembership = hasActiveMembership(me);

  const target = useMemo(() => {
    const has = (r) => roles.includes(r);
    const BASE = "/admin";

    // 1) Plataforma (SUPER)
    if (isSuper) return `${BASE}/dashboard/super`;

    // 2) Dashboards por rol (globales o de tienda)
    if (has("INVENTORY_MANAGER") || has("INVENTORY"))
      return `${BASE}/dashboard/inventory`;
    if (has("FINANCE_MANAGER") || has("FINANCE"))
      return `${BASE}/dashboard/finance`;
    if (has("DELIVERY_AGENT") || has("DELIVERY"))
      return `${BASE}/dashboard/delivery`;
    if (has("SUPPORT_AGENT") || has("SUPPORT"))
      return `${BASE}/dashboard/support`;
    if (has("STORE_OWNER") || has("SELLER") || has("STORE"))
      return `${BASE}/dashboard/store`;

    // 3) Sin rol pero con tienda o membresía → dashboard de tienda
    if (hasTenant || hasMembership) return `${BASE}/dashboard/store`;

    // 4) CUSTOMER nuevo (sin roles ni tienda) → onboarding
    return `${BASE}/get-started`;
  }, [roles, isSuper, hasTenant, hasMembership]);

  return <Navigate to={target} replace />;
}

