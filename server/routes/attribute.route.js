import { Router } from "express";

import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributes,
  getAttributeById,
} from "../controllers/attribute.controller.js";

const router = Router();

/* ======================================================
   PROTECCIÓN GLOBAL
====================================================== */
router.use(auth, withTenant({ required: false }));

/* ======================================================
   ATTRIBUTES
====================================================== */
router.post(
  "/attributes",
  requirePermission("attribute:create"),
  createAttribute
);

router.get(
  "/attributes",
  requirePermission("attribute:read"),
  getAttributes
);

router.get(
  "/attributes/:id",
  requirePermission("attribute:read"),
  getAttributeById
);

router.put(
  "/attributes/:id",
  requirePermission("attribute:update"),
  updateAttribute
);

router.delete(
  "/attributes/:id",
  requirePermission("attribute:delete"),
  deleteAttribute
);

export default router;
