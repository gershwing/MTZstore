import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  ordersByStatus, topProducts, deliverySla
} from "../controllers/report.controller.js";

const router = Router();
const noCache = (req, res, next) => { res.set("Cache-Control", "no-store"); next(); };
router.use(auth, withTenant({ required: false }), requirePermission("report:read"), noCache);

router.get("/orders-by-status", ordersByStatus);
router.get("/top-products", topProducts);
router.get("/delivery-sla", deliverySla);

export default router;
