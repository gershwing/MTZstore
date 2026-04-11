// admin/src/routes/RequireAdmin.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const BASE_ADMIN_ROLES = new Set(["SUPER_ADMIN", "STORE_OWNER"]);

export default function RequireAdmin({ roles = ["SUPER_ADMIN"] }) {
  const { user, roles: userRoles = [], authReady } = useAuth();
  const location = useLocation();

  // Loader central vive fuera; aquí no dupliquemos UI
  if (!authReady) return null;

  // Union de roles base + roles permitidos por prop
  const allowed = new Set([...BASE_ADMIN_ROLES, ...roles.map(String)]);

  const can =
    allowed.has(String(user?.role)) ||
    userRoles.some((r) => allowed.has(String(r)));

  if (!can) return <Navigate to="/403" replace state={{ from: location }} />;

  return <Outlet />;
}
