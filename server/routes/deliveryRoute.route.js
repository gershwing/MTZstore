// server/routes/deliveryRoute.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import {
  createRoute,
  listRoutes,
  getRoute,
  getMyRoutes,
  startRoute,
  addTasks,
  removeTask,
  cancelRoute,
} from "../controllers/deliveryRoute.controller.js";

const router = Router();

// Agente: mis rutas activas
router.get("/my", auth, requirePermission("delivery:updateStatus"), getMyRoutes);

// Admin: listar rutas
router.get("/", auth, withTenant({ required: false }), requirePermission("delivery:assign"), listRoutes);

// Admin: detalle de ruta
router.get("/:id", auth, withTenant({ required: false }), requirePermission("delivery:read"), getRoute);

// Admin: crear ruta
router.post("/", auth, withTenant({ required: false }), requirePermission("delivery:assign"), createRoute);

// Agente: iniciar ruta
router.patch("/:id/start", auth, requirePermission("delivery:updateStatus"), startRoute);

// Admin: agregar tasks
router.patch("/:id/add-tasks", auth, withTenant({ required: false }), requirePermission("delivery:assign"), addTasks);

// Admin: quitar task
router.patch("/:id/remove-task", auth, withTenant({ required: false }), requirePermission("delivery:assign"), removeTask);

// Admin: cancelar ruta
router.delete("/:id", auth, withTenant({ required: false }), requirePermission("delivery:assign"), cancelRoute);

export default router;
