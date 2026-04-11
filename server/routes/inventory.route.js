import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  getStockController,
  listMovementsController,
  adjustStockController,
  reserveStockController,
  releaseStockController,
  moveStockController,
  receiveStockController,
  dispatchStockController,
} from "../controllers/inventory.controller.js";

/**
 * Multitienda obligatoria: operaciones escriben sobre un tenant concreto.
 * Permisos granulares: inventory:read | adjust | reserve | release | move
 */
const inventoryRouter = Router();

// READ
inventoryRouter.get(
  "/stock",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:read"),
  getStockController
);

inventoryRouter.get(
  "/movements",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:read"),
  listMovementsController
);

// WRITE
inventoryRouter.post(
  "/adjust",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:adjust"),
  adjustStockController
);

inventoryRouter.post(
  "/reserve",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:reserve"),
  reserveStockController
);

inventoryRouter.post(
  "/release",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:release"),
  releaseStockController
);

inventoryRouter.post(
  "/move",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:move"),
  moveStockController
);

// WAREHOUSE: receive & dispatch
inventoryRouter.post(
  "/receive",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:adjust"),
  receiveStockController
);

inventoryRouter.post(
  "/dispatch",
  auth,
  withTenant({ required: true }),
  requirePermission("inventory:adjust"),
  dispatchStockController
);

export default inventoryRouter;
