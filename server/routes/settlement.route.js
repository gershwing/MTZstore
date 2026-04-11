// server/routes/settlement.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import upload from "../middlewares/multer.js";
import {
  listSettlementsController,
  createSettlementProposalController,
  paySettlementController,
  getPendingSettlementsController,
} from "../controllers/settlement.controller.js";

const settlementRouter = Router();

/**
 * Liquidaciones a tiendas (payouts)
 * - FINANCE_MANAGER / SUPER_ADMIN: crear propuesta y pagar
 * - STORE_OWNER: puede listar las suyas (withTenant limita el alcance)
 */
settlementRouter.get(
  "/pending",
  auth,
  withTenant({ required: false }),
  requirePermission("payment:reconcile"),
  getPendingSettlementsController
);

settlementRouter.get(
  "/",
  auth,
  withTenant({ required: false }),
  requirePermission("report:read"),
  listSettlementsController
);

settlementRouter.post(
  "/create",
  auth,
  withTenant({ required: true }),
  requirePermission("payment:reconcile"), // generar propuesta
  createSettlementProposalController
);

settlementRouter.patch(
  "/:id/pay",
  auth,
  withTenant({ required: false }),
  requirePermission("payment:reconcile"), // marcar pagado
  upload.single("proof"), // opcional: comprobante
  paySettlementController
);

export default settlementRouter;
