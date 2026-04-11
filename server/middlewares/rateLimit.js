// server/middlewares/rateLimit.js
import rateLimit from "express-rate-limit";

// 15 min ventana para auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, code: "RATE_LIMIT", message: "Too many requests, try later." }
});

// 1 min ventana para pagos (más conservador)
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PAYMENT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, code: "RATE_LIMIT", message: "Payment rate limit exceeded." }
});
