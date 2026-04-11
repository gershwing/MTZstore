// server/routes/promotion.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  createPromotionController,
  updatePromotionController,
  deletePromotionController,
  getPromotionController,
  listPromotionsController,
  previewPromotionController,
  redeemPromotionController
} from "../controllers/promotion.controller.js";

const promotionRouter = Router();

/**
 * Admin/Panel: todas protegidas
 * Multitienda: requerido para operar sobre una tienda específica
 */

// CRUD
promotionRouter.post(
  "/",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:create"),
  createPromotionController
);

promotionRouter.put(
  "/:id",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:update"),
  updatePromotionController
);

promotionRouter.delete(
  "/:id",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:delete"),
  deletePromotionController
);

promotionRouter.get(
  "/:id",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:read"),
  getPromotionController
);

promotionRouter.get(
  "/",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:read"),
  listPromotionsController
);

// Preview / Redeem
promotionRouter.post(
  "/preview",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:read"),
  previewPromotionController
);

promotionRouter.post(
  "/redeem",
  auth,
  withTenant({ required: true }),
  requirePermission("promotion:update"),
  redeemPromotionController
);

export default promotionRouter;
