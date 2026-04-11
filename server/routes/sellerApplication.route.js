// server/routes/sellerApplication.route.js
import express from "express";
import auth, { requireSuperAdmin } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import withTenantOrSuper from "../middlewares/withTenantOrSuper.js";
import {
  getMySellerApp,
  createSellerApp,
  reapplySellerApplication as reapplySellerApp,
  resetMySellerApplication,
  resetMySellerFlow,
  listSellerAppsAdmin,
  getSellerAppById,
  approveSellerApp,
  rejectSellerApp,
  deleteSellerApp,
  repairApprovedSellerApplications,
} from "../controllers/sellerApplication.controller.js";

const router = express.Router();

/* ===== Usuario autenticado ===== */
router.get("/me", auth, getMySellerApp);
router.post("/", auth, createSellerApp);
router.patch("/reapply", auth, reapplySellerApp);
router.delete("/me", auth, resetMySellerApplication);
router.post("/reset-my-flow", auth, resetMySellerFlow);

/* ===== Admin (plataforma) ===== */
router.get(
  "/admin",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("seller:applications:read"),
  listSellerAppsAdmin
);
router.get(
  "/admin/:id",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("seller:applications:read"),
  getSellerAppById
);
router.post(
  "/:id/approve",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("seller:applications:write"),
  approveSellerApp
);
router.post(
  "/:id/reject",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("seller:applications:write"),
  rejectSellerApp
);
router.delete(
  "/admin/:id",
  auth,
  withTenantOrSuper({ required: false }),
  requirePermission("user:delete"),
  deleteSellerApp
);

/* ===== Reparación (solo SUPER_ADMIN, sin tenant) ===== */
router.post(
  "/admin/seller-applications/repair-approved",
  auth,
  requireSuperAdmin, // ⬅️ más claro y sin depender de permisos
  repairApprovedSellerApplications
);

// (Opcional) Alias para compatibilidad si ya usabas /seller-apps/...
router.post(
  "/admin/seller-apps/repair-approved",
  auth,
  requireSuperAdmin,
  repairApprovedSellerApplications
);

export default router;
