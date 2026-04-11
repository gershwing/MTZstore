import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  createSalePayment,
  getPaymentsBySale,
  getPendingSales,
  deleteSalePayment,
} from "../controllers/salePayments.controller.js";

const router = Router();

router.use(auth, withTenant({ required: false }));

router.get("/pending", requirePermission("product:read"), getPendingSales);
router.get("/:directSaleId", requirePermission("product:read"), getPaymentsBySale);
router.post("/", requirePermission("product:read"), createSalePayment);
router.delete("/:id", requirePermission("product:delete"), deleteSalePayment);

export default router;
