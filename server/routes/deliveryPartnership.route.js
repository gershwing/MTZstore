// server/routes/deliveryPartnership.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  requestPartnership,
  invitePartnership,
  getMyPartnerships,
  getStorePartnerships,
  acceptPartnership,
  rejectPartnership,
  suspendPartnership,
  getAvailableAgents,
  getAvailableStores,
} from "../controllers/deliveryPartnership.controller.js";

const router = Router();

// Agente: mis sociedades
router.get(
  "/me",
  auth,
  requirePermission("delivery:partnerships:read"),
  getMyPartnerships
);

// Agente: tiendas disponibles para solicitar
router.get(
  "/available-stores",
  auth,
  requirePermission("delivery:partnerships:read"),
  getAvailableStores
);

// Tienda: mis sociedades
router.get(
  "/my-store",
  auth,
  withTenant({ required: true }),
  requirePermission("delivery:partnerships:read"),
  getStorePartnerships
);

// Tienda: agentes disponibles para invitar
router.get(
  "/available-agents",
  auth,
  withTenant({ required: true }),
  requirePermission("delivery:partnerships:read"),
  getAvailableAgents
);

// Agente solicita sociedad con tienda
router.post(
  "/",
  auth,
  requirePermission("delivery:partnerships:write"),
  requestPartnership
);

// Tienda invita agente
router.post(
  "/invite",
  auth,
  withTenant({ required: true }),
  requirePermission("delivery:partnerships:write"),
  invitePartnership
);

// Aceptar sociedad
router.patch(
  "/:id/accept",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:partnerships:write"),
  acceptPartnership
);

// Rechazar sociedad
router.patch(
  "/:id/reject",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:partnerships:write"),
  rejectPartnership
);

// Suspender sociedad
router.patch(
  "/:id/suspend",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:partnerships:write"),
  suspendPartnership
);

export default router;
