import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { getProfitLoss } from "../controllers/profitLoss.controller.js";

const router = Router();
const noCache = (req, res, next) => { res.set("Cache-Control", "no-store"); next(); };

router.use(auth, withTenant({ required: false }), noCache);
router.get("/", getProfitLoss);

export default router;
