import React from "react";

import ProtectedRoute from "./ProtectedRoute";
import RequireAdmin from "./RequireAdmin";
import RequireTenant from "../components/Guards/RequireTenant";
import RoleRedirect from "./RoleRedirect";
import AppLayout from "../layout/AppLayout";

import Profile from "../Pages/Profile";
import ApplicationsBridgePage from "../Pages/Applications/index.jsx";
import RequestSellerCard from "../Pages/Stores/RequestSellerCard";
import ApplyDelivery from "../Pages/Delivery/ApplyDelivery";

import { superAdminRoutes } from "./superAdminRoutes";
import { tenantRoutes } from "./tenantRoutes";

export const adminRoute = {
  path: "/admin",
  element: (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <RoleRedirect /> },
    { path: "profile", element: <Profile /> },

    // Onboarding: NO requieren tenant
    { path: "get-started", element: <ApplicationsBridgePage /> },
    { path: "sell", element: <RequestSellerCard /> },
    { path: "apply-delivery", element: <ApplyDelivery /> },

    // Super admin
    {
      element: <RequireAdmin roles={["SUPER_ADMIN"]} />,
      children: superAdminRoutes,
    },

    // Tenant
    {
      element: <RequireTenant />,
      children: tenantRoutes,
    },
  ],
};
