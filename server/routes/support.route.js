// server/routes/support.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  listTicketsController,
  getTicketController,
  createTicketMdw,
  createTicketController,
  replyTicketMdw,
  replyTicketController,
  closeTicketController,
  assignTicketController,
  markSeenController
} from "../controllers/support.controller.js";

const router = Router();

// Listar tickets
router.get(
  "/",
  auth,
  withTenant({ required: false }),
  requirePermission("support:read"),
  listTicketsController
);

// Ver un ticket (hilo)
router.get(
  "/:id",
  auth,
  withTenant({ required: false }),
  requirePermission("support:read"),
  getTicketController
);

// Crear ticket (adjuntos opcionales)
router.post(
  "/",
  auth,
  withTenant({ required: true }),
  requirePermission("support:read"), // o 'support:create' si lo agregas
  createTicketMdw, // <-- upload.array('files', 5)
  createTicketController
);

// Responder en hilo (adjuntos opcionales)
router.post(
  "/:id/reply",
  auth,
  withTenant({ required: false }),
  requirePermission("support:reply"),
  replyTicketMdw, // <-- upload.array('files', 5)
  replyTicketController
);

// Cerrar ticket
router.patch(
  "/:id/close",
  auth,
  withTenant({ required: false }),
  requirePermission("support:close"),
  closeTicketController
);

// Asignar agente
router.patch(
  "/:id/assign",
  auth,
  withTenant({ required: false }),
  requirePermission("support:reply"),
  assignTicketController
);

// Marcar mensajes como vistos
router.patch(
  "/:id/seen",
  auth,
  withTenant({ required: false }),
  requirePermission("support:read"),
  markSeenController
);

export default router;
