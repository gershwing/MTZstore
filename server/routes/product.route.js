import { Router } from "express";

import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { requireStoreOwnership } from "../middlewares/requireStoreOwnership.js";

import { Product as ProductModel } from "../models/product.model.js";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller.js";

const router = Router();

/* ======================================================
   PROTECCIÓN GLOBAL
====================================================== */
router.use(auth, withTenant({ required: true }));

// Resolver storeId para ownership
const getStoreIdFromProduct = async (req) => {
  const p = await ProductModel.findById(req.params.id).select("storeId");
  return p?.storeId ? String(p.storeId) : null;
};

/* ======================================================
   PRODUCTO BASE
====================================================== */
router.post(
  "/",
  requirePermission("product:create"),
  createProduct
);

router.get(
  "/:id",
  requirePermission("product:read"),
  getProductById
);

router.put(
  "/:id",
  requirePermission("product:update"),
  requireStoreOwnership(getStoreIdFromProduct),
  updateProduct
);

router.delete(
  "/:id",
  requirePermission("product:delete"),
  requireStoreOwnership(getStoreIdFromProduct),
  deleteProduct
);

export default router;
