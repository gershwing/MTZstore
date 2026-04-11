import { Router } from "express";

import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  createProductVariant,
  getProductVariants,
  updateProductVariant,
  deleteProductVariant,
} from "../controllers/product.controller.js";

const router = Router();

/* ======================================================
   PROTECCIÓN GLOBAL
====================================================== */
router.use(auth, withTenant({ required: true }));

/* ======================================================
   VARIANTES
====================================================== */
router.post(
  "/products/:productId/variants",
  requirePermission("product:variant:create"),
  createProductVariant
);

router.get(
  "/products/:productId/variants",
  requirePermission("product:read"),
  getProductVariants
);

router.put(
  "/variants/:id",
  requirePermission("product:variant:update"),
  updateProductVariant
);

router.delete(
  "/variants/:id",
  requirePermission("product:variant:delete"),
  deleteProductVariant
);

export default router;
