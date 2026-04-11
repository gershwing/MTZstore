// server/routes/deliveryApplication.route.js
import express from "express";
import auth from "../middlewares/auth.js"; // default import
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  getMyDeliveryApp,
  createDeliveryApp,
  listDeliveryAppsAdmin,
  approveDeliveryApp,
  rejectDeliveryApp,
  deleteDeliveryApp,
} from "../controllers/deliveryApplication.controller.js";

const router = express.Router();

/**
 * Se monta como:
 *   app.use("/api/delivery-applications", router)
 * Por eso las rutas internas son cortas: "/", "/me", "/admin", etc.
 */

// Usuario autenticado (rutas relativas)
router.get("/me", auth, getMyDeliveryApp);
router.post("/", auth, createDeliveryApp);

// Admin
router.get(
  "/admin",
  auth,
  (req, res, next) => requirePermission("delivery:applications:read")(req, res, next),
  listDeliveryAppsAdmin
);

router.post(
  "/:id/approve",
  auth,
  (req, res, next) => requirePermission("delivery:applications:write")(req, res, next),
  approveDeliveryApp
);

router.post(
  "/:id/reject",
  auth,
  (req, res, next) => requirePermission("delivery:applications:write")(req, res, next),
  rejectDeliveryApp
);

router.delete(
  "/admin/:id",
  auth,
  (req, res, next) => requirePermission("delivery:applications:write")(req, res, next),
  deleteDeliveryApp
);

export default router;
