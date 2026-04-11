// server/routes/order.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import withTenant from "../middlewares/withTenant.js";
import { requirePermission } from "../middlewares/requirePermission.js";

import {
  cancelMyOrder,
  captureOrderPaypalController,
  createOrderController,
  createOrderPaypalController,
  deleteOrder,
  getOrderDetailsController,
  getTotalOrdersCountController,
  getUserOrderDetailsController,
  totalSalesController,
  totalUsersController,
  updateOrderStatusController,
} from "../controllers/order.controller.js";

// ⬇️ Importamos modelos para el GET "/" y el PATCH "/:id/status" (se mantienen)
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

const orderRouter = Router();

/**
 * GET /api/order
 * - ADMIN (o SUPER_ADMIN): ve todo
 * - SELLER/STOCK: pedidos que contengan líneas de su store
 * - BUYER/USER: solo sus pedidos
 *
 * Nota: mantenemos esta ruta "inline" para no romper tu panel actual.
 * Añadimos withTenant({required:false}) + requirePermission('order:read').
 */
orderRouter.get(
  "/",
  auth,
  withTenant({ required: false }),
  requirePermission("order:read"),
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.userId).select("role storeId").lean();
      if (!user) {
        return res.status(401).json({ error: true, message: "Usuario no válido" });
      }

      let rows = [];
      // Compat con tus roles previos:
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        rows = await OrderModel.find().lean();
      } else if (["SELLER", "STOCK", "ORDER_MANAGER"].includes(user.role)) {
        rows = await OrderModel.find({
          $or: [
            { storeId: user.storeId },           // cabecera (nuevo)
            { "products.storeId": user.storeId } // legacy
          ],
        }).lean();
      } else {
        rows = await OrderModel.find({ userId: req.userId }).lean();
      }

      return res.json({ error: false, data: rows });
    } catch (e) {
      console.error("Order list error:", e);
      return res.status(500).json({ error: true, message: e.message || String(e) });
    }
  }
);

/**
 * Cambiar estado (COD / flujo manual)
 * Mantiene tu lógica inline, añade withTenant({required:false}) + requirePermission('order:updateStatus')
 */
orderRouter.patch(
  "/:id/status",
  auth,
  withTenant({ required: false }),
  requirePermission("order:updateStatus"),
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.userId).select("role storeId").lean();
      if (!user) {
        return res.status(401).json({ error: true, message: "Usuario no válido" });
      }

      // Solo ADMIN/STORE roles con permiso pueden intentar cambiar estado
      if (!(user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "SELLER" || user.role === "ORDER_MANAGER")) {
        return res.status(403).json({ error: true, message: "Not allowed" });
      }

      const order = await OrderModel.findById(req.params.id).select("products status order_status");
      if (!order) {
        return res.status(404).json({ error: true, message: "Not found" });
      }

      // Si es SELLER/ORDER_MANAGER, validar que la orden tenga líneas de su tienda
      if (!(user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
        const hasLine = order.products?.some(
          (p) => String(p.storeId) === String(user.storeId)
        );
        if (!hasLine) {
          return res.status(403).json({ error: true, message: "Not your store" });
        }
      }

      const next = req.body.status;
      if (!next) {
        return res.status(400).json({ error: true, message: "Missing status" });
      }

      // Soporte a ambos nombres de campo según tu schema/uso en frontend
      order.status = next;
      if ("order_status" in order) {
        order.order_status = next;
      }

      await order.save();
      return res.json({ error: false, data: { id: order._id, status: next } });
    } catch (e) {
      console.error("Patch status error:", e);
      return res.status(500).json({ error: true, message: e.message || String(e) });
    }
  }
);

/* Rutas existentes: intactas, solo añadimos withTenant({required:false}) + permisos donde es backoffice */

// Crear orden (cliente): requiere login; si usas permiso granular, habilita 'order:create'
orderRouter.post(
  "/create",
  auth,
  withTenant({ required: false }),
  requirePermission("order:create"),
  createOrderController
);

// Listado admin/backoffice con scoping por tienda (el controller ya es compatible)
orderRouter.get(
  "/order-list",
  auth,
  withTenant({ required: false }),
  requirePermission("order:read"),
  getOrderDetailsController
);

// Crear orden PayPal (cliente)
orderRouter.post(
  "/create-order-paypal",
  auth,
  withTenant({ required: false }),
  requirePermission("order:create"),
  createOrderPaypalController
);

// Capturar PayPal (cliente)
orderRouter.post(
  "/capture-order-paypal",
  auth,
  withTenant({ required: false }),
  requirePermission("order:create"),
  captureOrderPaypalController
);

// Actualizar estado (versión controller existente)
orderRouter.put(
  "/order-status/:id",
  auth,
  withTenant({ required: false }),
  requirePermission("order:updateStatus"),
  updateOrderStatusController
);

// Contador de órdenes (dashboard)
orderRouter.get(
  "/count",
  auth,
  withTenant({ required: false }),
  requirePermission("order:read"),
  getTotalOrdersCountController
);

// Ventas (dashboard/reportes)
orderRouter.get(
  "/sales",
  auth,
  withTenant({ required: false }),
  requirePermission("report:read"),
  totalSalesController
);

// Altas de usuarios por mes (dashboard/reportes)
orderRouter.get(
  "/users",
  auth,
  withTenant({ required: false }),
  requirePermission("report:read"),
  totalUsersController
);

// Historial del cliente (tienda)
orderRouter.get(
  "/order-list/orders",
  auth,
  withTenant({ required: false }),
  getUserOrderDetailsController
);

// Cancelar pedido (cliente cancela su propio pedido)
orderRouter.patch(
  "/:id/cancel",
  auth,
  cancelMyOrder
);

// Eliminar orden (backoffice/testing) — normalmente sólo SUPER_ADMIN o flujo especial
orderRouter.delete(
  "/deleteOrder/:id",
  auth,
  withTenant({ required: false }),
  requirePermission("order:cancel"),
  deleteOrder
);

export default orderRouter;
