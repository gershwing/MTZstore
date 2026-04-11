import { Router } from "express";

import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  assignAttributeToCategory,
  updateCategoryAttribute,
  removeAttributeFromCategory,
  getCategoryAttributes,
} from "../controllers/categoryAttribute.controller.js";

const router = Router();

/* ======================================================
   PROTECCIÓN GLOBAL
====================================================== */
router.use(auth, withTenant({ required: false }));

/* ======================================================
   CATEGORY ↔ ATTRIBUTE
====================================================== */
router.post(
  "/category-attributes",
  requirePermission("category:attribute:assign"),
  assignAttributeToCategory
);

router.put(
  "/category-attributes/:id",
  requirePermission("category:attribute:update"),
  updateCategoryAttribute
);

router.delete(
  "/category-attributes/:id",
  requirePermission("category:attribute:delete"),
  removeAttributeFromCategory
);

// 👈 ESTA ES LA RUTA QUE CONSUME EL ADMIN UI
router.get(
  "/categories/:categoryId/attributes",
  requirePermission("category:read"),
  getCategoryAttributes
);

export default router;
