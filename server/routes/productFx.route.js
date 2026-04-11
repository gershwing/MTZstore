// server/routes/productFx.route.js
import { Router } from 'express';

import withTenant from '../middlewares/withTenant.js';

import {
  getFxRateController,
} from '../controllers/productFx.controller.js';

/* ============================================================
   Router FX
   - público
   - cacheable
   - sin auth (no es sensible)
   ============================================================ */

const fxRouter = Router();

// Tenant opcional (por consistencia con el resto del sistema)
const optionalTenant = withTenant({ required: false, source: 'header' });

// Cache corto (puedes subir a 30s o 60s sin problema)
const cache15s = (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  next();
};

/* =========================
   FX Rate
   ========================= */

// USDT ↔ BOB
fxRouter.get(
  '/',
  optionalTenant,
  cache15s,
  getFxRateController
);

export default fxRouter;
