import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  createDirectSale,
  listDirectSales,
  getDirectSale,
  deleteDirectSale,
  removeItemFromSale,
  searchProducts,
  getDirectSalesStats,
} from "../controllers/directSales.controller.js";

const router = Router();

router.use(auth, withTenant({ required: false }));

// Buscar productos y stats (antes de /:id para que no lo capture)
router.get("/search-products", requirePermission("product:read"), searchProducts);
router.get("/stats", requirePermission("product:read"), (req, res, next) => { res.set("Cache-Control", "no-store"); next(); }, getDirectSalesStats);

router.post("/", requirePermission("product:read"), createDirectSale);
router.get("/", requirePermission("product:read"), listDirectSales);
router.get("/:id", requirePermission("product:read"), getDirectSale);
router.patch("/:id/remove-item", requirePermission("product:delete"), removeItemFromSale);
router.delete("/:id", requirePermission("product:delete"), deleteDirectSale);

export default router;
