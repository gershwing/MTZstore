// server/controllers/deliveryRoute.controller.js
import DeliveryRoute from "../models/deliveryRoute.model.js";
import DeliveryTask from "../models/deliveryTask.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import { ERR } from "../utils/httpError.js";
import { auditLog } from "../services/audit.service.js";
import { canAgentTakeTask } from "../services/deliveryEligibility.service.js";
import StoreModel from "../models/store.model.js";
import { emitToUser } from "../utils/socketEmitter.js";

async function safeAudit(req, payload) {
  try { await auditLog(req, payload); } catch { /* silencio */ }
}

const asEvent = (type, by, note = "") => ({ type, by, note, at: new Date() });

const STANDARD_METHODS = ["MTZSTORE_STANDARD", "STORE_STANDARD", "STORE"];

// POST /api/delivery-routes — Crear ruta con múltiples tasks
export async function createRoute(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const storeId = req.tenant?.storeId || null;
    const { taskIds, agentId, note } = req.body || {};

    if (!Array.isArray(taskIds) || !taskIds.length) return next(ERR.VALIDATION("Se requiere al menos un pedido (taskIds)"));
    if (!agentId) return next(ERR.VALIDATION("Se requiere un repartidor (agentId)"));

    // Validar agente
    const profile = await DeliveryAgentProfile.findOne({ userId: agentId, status: "ACTIVE" });
    if (!profile) return next(ERR.NOT_FOUND("Repartidor no encontrado o inactivo"));
    if (!profile.approvedServiceTypes.includes("standard")) {
      return next(ERR.VALIDATION("El repartidor no tiene aprobado el servicio estándar"));
    }

    // Verificar que no tiene ruta IN_PROGRESS
    const activeRoute = await DeliveryRoute.findOne({ agentId, status: "IN_PROGRESS" });
    if (activeRoute) return next(ERR.CONFLICT("El repartidor ya tiene una ruta en progreso"));

    // Cargar tasks
    const tasks = await DeliveryTask.find({ _id: { $in: taskIds } });
    if (tasks.length !== taskIds.length) return next(ERR.VALIDATION("Algunos pedidos no fueron encontrados"));

    // Validar cada task
    for (const task of tasks) {
      if (task.status !== "PENDING") return next(ERR.VALIDATION(`El pedido ${String(task._id).slice(-8)} no está pendiente`));
      if (!STANDARD_METHODS.includes(task.shippingMethod)) return next(ERR.VALIDATION(`El pedido ${String(task._id).slice(-8)} no es de tipo estándar`));
      if (task.routeId) return next(ERR.VALIDATION(`El pedido ${String(task._id).slice(-8)} ya está en otra ruta`));
      if (task.assigneeId) return next(ERR.VALIDATION(`El pedido ${String(task._id).slice(-8)} ya tiene repartidor asignado`));

      // Verificar RECEIVED_AT_WAREHOUSE para MTZSTORE_STANDARD
      if (task.shippingMethod === "MTZSTORE_STANDARD") {
        const received = task.timeline?.some(e => e.type === "RECEIVED_AT_WAREHOUSE");
        if (!received) return next(ERR.VALIDATION(`El pedido ${String(task._id).slice(-8)} no ha sido recibido en almacén`));
      }

      // Verificar elegibilidad del agente
      const store = task.storeId ? await StoreModel.findById(task.storeId).lean() : null;
      const eligible = await canAgentTakeTask(profile, task, store);
      if (!eligible) return next(ERR.VALIDATION(`El repartidor no es elegible para el pedido ${String(task._id).slice(-8)}`));
    }

    // Crear ruta
    const route = await DeliveryRoute.create({
      storeId,
      agentId,
      tasks: taskIds,
      stats: { totalStops: tasks.length, pending: tasks.length, delivered: 0, failed: 0 },
      createdBy: userId,
      note: note || "",
    });

    // Asignar todos los tasks
    for (const task of tasks) {
      task.routeId = route._id;
      task.assigneeId = agentId;
      task.status = "ASSIGNED";
      task.timeline.push(asEvent("ASSIGNED", userId, `Asignado via ruta ${String(route._id).slice(-8)}`));
      await task.save();
    }

    // Notificar al agente
    emitToUser(agentId, "delivery:route-assigned", {
      routeId: route._id,
      taskCount: tasks.length,
    });

    await safeAudit(req, {
      action: "DELIVERY_ROUTE_CREATED",
      entity: "DeliveryRoute",
      entityId: String(route._id),
      meta: { agentId: String(agentId), taskCount: tasks.length },
    });

    return res.ok({ data: route });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-routes — Listar rutas
export async function listRoutes(req, res, next) {
  try {
    const storeId = req.tenant?.storeId || null;
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const { status, agentId: filterAgent, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (!isSuper && storeId) filter.storeId = storeId;
    if (status) filter.status = status;
    if (filterAgent) filter.agentId = filterAgent;

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [items, total] = await Promise.all([
      DeliveryRoute.find(filter)
        .populate("agentId", "name email phone")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryRoute.countDocuments(filter),
    ]);

    return res.ok({ data: items, total, page: +page, limit: limitN, totalPages: Math.ceil(total / limitN) });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-routes/:id — Detalle de ruta
export async function getRoute(req, res, next) {
  try {
    const route = await DeliveryRoute.findById(req.params.id)
      .populate("agentId", "name email phone")
      .populate("createdBy", "name")
      .populate({
        path: "tasks",
        populate: [
          { path: "orderId", select: "totalBob totalAmt products userId", populate: { path: "userId", select: "name email" } },
          { path: "storeId", select: "name" },
        ],
      })
      .lean();

    if (!route) return next(ERR.NOT_FOUND("Ruta no encontrada"));
    return res.ok({ data: route });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// GET /api/delivery-routes/my — Rutas del agente
export async function getMyRoutes(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const routes = await DeliveryRoute.find({
      agentId: userId,
      status: { $in: ["CREATED", "IN_PROGRESS"] },
    })
      .populate({
        path: "tasks",
        populate: [
          { path: "orderId", select: "totalBob products userId", populate: { path: "userId", select: "name" } },
        ],
      })
      .sort({ createdAt: -1 }).lean();

    return res.ok({ data: routes });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-routes/:id/start — Agente inicia la ruta
export async function startRoute(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const route = await DeliveryRoute.findById(req.params.id);
    if (!route) return next(ERR.NOT_FOUND("Ruta no encontrada"));
    if (String(route.agentId) !== String(userId)) return next(ERR.VALIDATION("Solo el repartidor asignado puede iniciar la ruta"));
    if (route.status !== "CREATED") return next(ERR.VALIDATION("Solo se pueden iniciar rutas con estado CREATED"));

    route.status = "IN_PROGRESS";
    route.startedAt = new Date();
    await route.save();

    return res.ok({ data: route });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-routes/:id/add-tasks — Agregar tasks a ruta CREATED
export async function addTasks(req, res, next) {
  try {
    const { taskIds } = req.body || {};
    if (!Array.isArray(taskIds) || !taskIds.length) return next(ERR.VALIDATION("taskIds requeridos"));

    const route = await DeliveryRoute.findById(req.params.id);
    if (!route) return next(ERR.NOT_FOUND("Ruta no encontrada"));
    if (route.status !== "CREATED") return next(ERR.VALIDATION("Solo se pueden agregar pedidos a rutas con estado CREATED"));

    const tasks = await DeliveryTask.find({ _id: { $in: taskIds }, status: "PENDING", routeId: null });
    if (!tasks.length) return next(ERR.VALIDATION("No se encontraron pedidos pendientes válidos"));

    const userId = req.userId || req.user?._id;
    for (const task of tasks) {
      task.routeId = route._id;
      task.assigneeId = route.agentId;
      task.status = "ASSIGNED";
      task.timeline.push(asEvent("ASSIGNED", userId, `Agregado a ruta ${String(route._id).slice(-8)}`));
      await task.save();
      route.tasks.push(task._id);
    }

    route.stats.totalStops = route.tasks.length;
    route.stats.pending = route.stats.totalStops - route.stats.delivered - route.stats.failed;
    await route.save();

    return res.ok({ data: route });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// PATCH /api/delivery-routes/:id/remove-task — Quitar task de ruta CREATED
export async function removeTask(req, res, next) {
  try {
    const { taskId } = req.body || {};
    if (!taskId) return next(ERR.VALIDATION("taskId requerido"));

    const route = await DeliveryRoute.findById(req.params.id);
    if (!route) return next(ERR.NOT_FOUND("Ruta no encontrada"));
    if (route.status !== "CREATED") return next(ERR.VALIDATION("Solo se pueden quitar pedidos de rutas con estado CREATED"));

    const task = await DeliveryTask.findById(taskId);
    if (!task || String(task.routeId) !== String(route._id)) return next(ERR.VALIDATION("El pedido no pertenece a esta ruta"));

    // Revertir task
    task.routeId = null;
    task.assigneeId = null;
    task.status = "PENDING";
    task.timeline.push(asEvent("CANCELLED", req.userId || req.user?._id, "Removido de ruta"));
    await task.save();

    // Actualizar ruta
    route.tasks = route.tasks.filter(t => String(t) !== String(taskId));
    route.stats.totalStops = route.tasks.length;
    route.stats.pending = route.stats.totalStops;
    await route.save();

    return res.ok({ data: route });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// DELETE /api/delivery-routes/:id — Cancelar ruta CREATED
export async function cancelRoute(req, res, next) {
  try {
    const route = await DeliveryRoute.findById(req.params.id);
    if (!route) return next(ERR.NOT_FOUND("Ruta no encontrada"));
    if (route.status !== "CREATED") return next(ERR.VALIDATION("Solo se pueden cancelar rutas con estado CREATED"));

    // Revertir todos los tasks
    const tasks = await DeliveryTask.find({ routeId: route._id });
    for (const task of tasks) {
      task.routeId = null;
      task.assigneeId = null;
      task.status = "PENDING";
      task.timeline.push(asEvent("CANCELLED", req.userId || req.user?._id, "Ruta cancelada"));
      await task.save();
    }

    await DeliveryRoute.deleteOne({ _id: route._id });

    await safeAudit(req, {
      action: "DELIVERY_ROUTE_CANCELLED",
      entity: "DeliveryRoute",
      entityId: String(route._id),
    });

    return res.ok({ message: "Ruta cancelada y pedidos liberados" });
  } catch (e) { return next(e?.status ? e : ERR.SERVER(e.message)); }
}

// Función utilitaria: sincronizar stats de ruta cuando un task cambia de status
export async function syncRouteStats(routeId) {
  if (!routeId) return;
  try {
    const route = await DeliveryRoute.findById(routeId);
    if (!route) return;

    const tasks = await DeliveryTask.find({ routeId }).select("status").lean();
    const delivered = tasks.filter(t => t.status === "DELIVERED").length;
    const failed = tasks.filter(t => ["FAILED", "CANCELLED"].includes(t.status)).length;
    const pending = tasks.length - delivered - failed;

    route.stats = { totalStops: tasks.length, delivered, failed, pending };

    if (pending === 0 && tasks.length > 0) {
      route.status = failed > 0 ? "PARTIAL" : "COMPLETED";
      route.completedAt = new Date();
    }

    await route.save();
  } catch (e) {
    console.warn("[syncRouteStats] error:", e?.message);
  }
}
