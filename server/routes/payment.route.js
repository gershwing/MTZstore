// server/routes/payment.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { ensureIdempotent } from "../middlewares/idempotency.js";
import { paymentLimiter } from "../middlewares/rateLimit.js";
import {
  createPaypalPaymentController,
  capturePaypalPaymentController,
  refundPaymentController,
  getPaymentController,
  listPaymentsController
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

/**
 * Rutas PayPal con:
 * - Rate limit: paymentLimiter (después de auth)
 * - Idempotencia: ensureIdempotent(...)
 */

// Crear orden de pago PayPal (IDEMPOTENTE)
paymentRouter.post(
  "/paypal/create",
  auth,
  paymentLimiter,
  withTenant({ required: true }),
  requirePermission("payment:read"),          // si manejas permisos finos, cámbialo a "payment:create"
  ensureIdempotent("payment:create"),
  createPaypalPaymentController
);

// Capturar (server-side) (IDEMPOTENTE)
paymentRouter.post(
  "/paypal/capture",
  auth,
  paymentLimiter,
  withTenant({ required: true }),
  requirePermission("payment:read"),          // o "payment:capture"
  ensureIdempotent("payment:capture"),
  capturePaypalPaymentController
);

// Reembolso (IDEMPOTENTE recomendado)
paymentRouter.post(
  "/refund",
  auth,
  paymentLimiter,
  withTenant({ required: true }),
  requirePermission("payment:refund"),
  ensureIdempotent("payment:refund"),
  refundPaymentController
);

// Lectura por id
paymentRouter.get(
  "/:id",
  auth,
  withTenant({ required: true }),
  requirePermission("payment:read"),
  getPaymentController
);

// Listado
paymentRouter.get(
  "/",
  auth,
  withTenant({ required: true }),
  requirePermission("payment:read"),
  listPaymentsController
);

export default paymentRouter;
