import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  listDeliveryController,
  availableDeliveriesController,
  takeDeliveryController,
  myDeliveriesController,
  getDeliveryController,
  createDeliveryController,
  assignDeliveryController,
  updateStatusController,
  verifyPickupCodeController,
  uploadProofMdw,
  uploadProofController,
  deleteProofController,
  dispatchToWarehouseController,
  receiveWarehouseController
} from "../controllers/delivery.controller.js";

const router = Router();

/**
 * Permisos sugeridos (mapeados en permissions.js):
 * - delivery:read
 * - delivery:assign
 * - delivery:updateStatus
 * - delivery:proof
 */

// Entregas disponibles (PENDING, sin asignar) — para delivery agents
router.get(
  "/available",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:take"),
  availableDeliveriesController
);

// Mis entregas (para delivery agents) — DEBE ir antes de /:id
router.get(
  "/my",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:updateStatus"),
  myDeliveriesController
);

// Listar tareas de delivery
router.get(
  "/",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:read"),
  listDeliveryController
);

// Detalle de una entrega
router.get(
  "/:id",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:read"),
  getDeliveryController
);

// Crear tarea para una orden
router.post(
  "/create",
  auth,
  withTenant({ required: true }),
  requirePermission("delivery:assign"),
  createDeliveryController
);

// Auto-asignar (delivery agent toma la orden)
router.patch(
  "/:id/take",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:take"),
  takeDeliveryController
);

// Asignar repartidor
router.patch(
  "/:id/assign",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:assign"),
  assignDeliveryController
);

// Actualizar estado: PICKED_UP | IN_TRANSIT | FAILED | DELIVERED | CANCELLED
router.patch(
  "/:id/status",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:updateStatus"),
  updateStatusController
);

// Verificar código de recogida
router.patch(
  "/:id/verify-code",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:updateStatus"),
  verifyPickupCodeController
);

// Subir prueba de entrega (foto/archivo)
router.patch(
  "/:id/proof",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:proof"),
  uploadProofMdw,   // <-- multer array('files', 5)
  uploadProofController
);

// Despacho a almacen (tienda despacha producto a almacen MTZ - solo STANDARD)
router.patch(
  "/:id/dispatch-warehouse",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:updateStatus"),
  dispatchToWarehouseController
);

// Recepcion en almacen (INVENTORY_MANAGER marca producto recibido - solo STANDARD)
router.patch(
  "/:id/receive-warehouse",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:receiveWarehouse"),
  receiveWarehouseController
);

// Eliminar prueba de entrega por indice
router.delete(
  "/:id/proof/:proofIndex",
  auth,
  withTenant({ required: false }),
  requirePermission("delivery:proof"),
  deleteProofController
);

export default router;
