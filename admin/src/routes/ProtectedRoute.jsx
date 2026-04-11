// admin/src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthFull as useAuth } from "../hooks/useAuth"; // debe exponer: authReady, isAuthenticated, permissions, isSuper, tenantId

/**
 * Props:
 * - require: string[]  -> permisos que se deben cumplir TODOS (AND)
 * - anyOf: string[]    -> basta con cumplir ALGUNO (OR)
 * - requireTenant: bool-> si true, requiere tenantId cuando no eres SUPER
 */
export default function ProtectedRoute({ require = [], anyOf = [], requireTenant = false, children }) {
  const { authReady, isAuthenticated, permissions = [], isSuper = false, tenantId = null } = useAuth();
  const location = useLocation();

  const here = `${location.pathname}${location.search || ""}${location.hash || ""}`;
  const isOn = (path) => location.pathname.startsWith(path);

  // 1) Espera la hidratación de auth para evitar loops/flash
  if (!authReady) {
    return <div className="p-6 text-sm text-gray-600">Verificando tu sesión…</div>;
  }

  // 2) No autenticado → redirige al login (una sola navegación con replace)
  if (!isAuthenticated) {
    // Evita bucle si ya estás en /login
    if (isOn("/login")) return <Outlet />;
    return <Navigate to="/login" replace state={{ from: here }} />;
  }

  // 3) Tenant requerido (excepto SUPER)
  if (requireTenant && !isSuper) {
    const hasTenant = !!tenantId;
    if (!hasTenant) {
      // Evita bucle si ya estás en la página de selección
      if (isOn("/select-store")) return <Outlet />;
      return <Navigate to="/select-store" replace state={{ from: here }} />;
    }
  }

  // 4) Permisos
  const needAll = Array.isArray(require) ? require : [require].filter(Boolean);
  const needAny = Array.isArray(anyOf) ? anyOf : [anyOf].filter(Boolean);

  const hasAll = needAll.length === 0 || needAll.every((p) => permissions.includes(p));
  const hasAny = needAny.length === 0 || needAny.some((p) => permissions.includes(p));

  // SUPER_ADMIN bypass
  const allowed = isSuper || (hasAll && hasAny);

  if (!allowed) {
    // Evita bucle si ya estás en /403
    if (isOn("/403")) return <Outlet />;
    return <Navigate to="/403" replace state={{ from: here }} />;
  }

  // 5) Render final
  return children ?? <Outlet />;
}
