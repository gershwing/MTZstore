import React from "react";

import Users from "../Pages/Users";
import AuditLogsPage from "../Pages/Audit/AuditLogsPage";
import PermissionsPanelPage from "../Pages/Security/PermissionsPanelPage";
import StoresPage from "../Pages/Stores";
import DeliveryApplicationsAdmin from "../Pages/Delivery/AdminList";
import DeliveryAgents from "../Pages/Delivery/DeliveryAgents";
import SellerApplicationsAdminList from "../Pages/Stores/AdminList";
import WarehouseInboundAdminList from "../Pages/WarehouseInbound/AdminList";
import TrustManagement from "../Pages/Delivery/TrustManagement";

export const superAdminRoutes = [
  { path: "users", element: <Users /> },
  { path: "audit", element: <AuditLogsPage /> },
  { path: "security/permissions", element: <PermissionsPanelPage /> },
  { path: "stores", element: <StoresPage /> },
  { path: "delivery-agents", element: <DeliveryAgents /> },
  { path: "delivery-applications/admin", element: <DeliveryApplicationsAdmin /> },
  { path: "trust-management", element: <TrustManagement /> },
  { path: "seller-applications/admin", element: <SellerApplicationsAdminList /> },
  { path: "warehouse-inbound", element: <WarehouseInboundAdminList /> },
];
