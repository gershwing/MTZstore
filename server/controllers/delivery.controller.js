import DeliveryTask from "../models/deliveryTask.model.js";
import OrderModel from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import { createAutoSettlement } from "./settlement.controller.js";
import { buildAvailableTasksFilter, canAgentTakeTask } from "../services/deliveryEligibility.service.js";
import upload from "../middlewares/multer.js";
import { ERR } from "../utils/httpError.js";
import { auditLog } from "../services/audit.service.js";
import sendEmailFun from "../config/sendEmail.js";
import DeliveryStatusEmail, { STATUS_CONFIG } from "../utils/deliveryStatusEmailTemplate.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

// util
const asEvent = (type, by, note = "") => ({ type, by, note, at: new Date() });

async function uploadToCloudinary(files = []) {
  const results = [];
  for (const f of files) {
    try {
      const up = await cloudinary.uploader.upload(f.path, {
        folder: "mtz/delivery-proofs",
        resource_type: "auto",
      });
      results.push({
        url: up.secure_url,
        publicId: up.public_id,
        name: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
      });
    } catch (err) {
      console.warn("[cloudinary] Upload failed for", f.originalname, err?.message);
    } finally {
      try { fs.unlinkSync(f.path); } catch { }
    }
  }
  return results;
}

// no romper el flujo ante fallas de auditoría
async function safeAudit(req, payload) {
  try {
    await auditLog(req, payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("auditLog failed:", e?.message || e);
  }
}

// GET /api/delivery
export async function listDeliveryController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { status, shippingMethod, q, page = 1, limit = 20, startDate, endDate } = req.query;

    const filter = {};
    if (!isSuper && storeId) filter.storeId = storeId;
    if (status) filter.status = status;
    if (shippingMethod) filter.shippingMethod = shippingMethod;
    if (q)
      filter.$or = [
        { "address.name": { $regex: q, $options: "i" } },
        { "address.phone": { $regex: q, $options: "i" } }
      ];
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
    }

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;
    const [items, total] = await Promise.all([
      DeliveryTask.find(filter)
        .populate("assigneeId", "name email phone")
        .populate("storeId", "name")
        .sort({ updatedAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryTask.countDocuments(filter)
    ]);

    return res.ok({
      data: items,
      total,
      page: +page,
      limit: limitN,
      totalPages: Math.ceil(total / limitN),
    });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/delivery/available — Entregas disponibles filtradas por elegibilidad del agente
export async function availableDeliveriesController(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    const { page = 1, limit = 50, serviceType } = req.query;

    // Buscar perfil del agente
    const agentProfile = await DeliveryAgentProfile.findOne({ userId, status: "ACTIVE" });
    if (!agentProfile) {
      return res.ok({ data: [], total: 0, page: 1, limit: +limit });
    }

    // Construir filtro dinámico basado en capabilities + trust + partnerships
    const filter = await buildAvailableTasksFilter(agentProfile);

    // Filtro adicional por serviceType si se especifica
    if (serviceType && filter.$or) {
      const expressMethods = ["MTZSTORE_EXPRESS", "STORE_EXPRESS"];
      const standardMethods = ["MTZSTORE_STANDARD", "STORE_STANDARD", "STORE"];
      const allowedMethods = serviceType === "express" ? expressMethods : standardMethods;
      filter.$or = filter.$or.filter((f) => {
        const m = f.shippingMethod;
        if (typeof m === "string") return allowedMethods.includes(m);
        if (m?.$in) return m.$in.some((v) => allowedMethods.includes(v));
        return false;
      });
      if (filter.$or.length === 0) {
        return res.ok({ data: [], total: 0, page: 1, limit: +limit });
      }
    }

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;

    const [items, total] = await Promise.all([
      DeliveryTask.find(filter)
        .populate("storeId", "name")
        .populate({
          path: "orderId",
          select: "totalBob totalAmt shippingMethod products userId",
          populate: { path: "userId", select: "name email" }
        })
        .sort({ createdAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryTask.countDocuments(filter)
    ]);

    return res.ok({ data: items, total, page: +page, limit: limitN });
  } catch (e) {
    console.error("[availableDeliveries] error:", e);
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/take — El delivery agent se auto-asigna una tarea PENDING
export async function takeDeliveryController(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("Usuario no autenticado"));

    const { id } = req.params;
    const { note } = req.body || {};

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));
    if (task.status !== "PENDING") return next(ERR.VALIDATION({ status: "Solo se pueden tomar entregas pendientes" }));
    if (task.assigneeId) return next(ERR.CONFLICT("Esta entrega ya fue tomada por otro repartidor"));

    // Verificar elegibilidad del agente (Delivery V2)
    const agentProfile = await DeliveryAgentProfile.findOne({ userId });
    if (!agentProfile || agentProfile.status !== "ACTIVE") {
      return next(ERR.VALIDATION("No tienes un perfil de agente activo"));
    }
    const store = task.storeId ? await StoreModel.findById(task.storeId).lean() : null;
    const eligible = await canAgentTakeTask(agentProfile, task, store);
    if (!eligible) {
      return next(ERR.VALIDATION("No tienes permisos para tomar esta entrega"));
    }

    task.assigneeId = userId;
    task.status = "ASSIGNED";
    task.timeline.push(asEvent("ASSIGNED", userId, note || "Tomado por repartidor"));
    await task.save();

    // Notificar al cliente por email
    try {
      const [driver, order] = await Promise.all([
        UserModel.findById(userId).select("name mobile").lean(),
        OrderModel.findById(task.orderId).populate("userId", "name email").lean(),
      ]);
      if (order?.userId?.email) {
        const orderId = String(order._id);
        const html = DeliveryStatusEmail({
          status: "ASSIGNED",
          customerName: order.userId.name,
          driverName: driver?.name,
          driverPhone: driver?.mobile,
          orderIdShort: orderId.slice(-8),
          totalBob: order.totalBob,
          products: order.products,
          shippingMethod: order.shippingMethod,
          shippingSettle: order.shippingSettle,
          ivaTotal: order.ivaTotal,
          itTotal: order.itTotal,
        });
        await sendEmailFun({
          sendTo: order.userId.email,
          subject: `${STATUS_CONFIG.ASSIGNED.subject} #${orderId.slice(-8)} – MTZstore`,
          html,
        });
      }
    } catch (emailErr) {
      console.warn("[delivery→takeEmail] Error:", emailErr?.message);
    }

    await safeAudit(req, {
      action: "DELIVERY_TAKEN",
      entity: "DeliveryTask",
      entityId: String(task._id),
      meta: { assigneeId: String(userId) }
    });

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/delivery/my — Entregas asignadas al agente logueado
export async function myDeliveriesController(req, res, next) {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return next(ERR.VALIDATION("Usuario no autenticado"));

    const { status, page = 1, limit = 50 } = req.query;

    const filter = { assigneeId: userId };
    // Por defecto, tareas activas (no finalizadas)
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $nin: ["DELIVERED", "CANCELLED"] };
    }

    const limitN = Math.max(1, +limit);
    const skip = (Math.max(1, +page) - 1) * limitN;
    const [items, total] = await Promise.all([
      DeliveryTask.find(filter)
        .populate("storeId", "name")
        .populate("orderId", "saleNumber total")
        .sort({ updatedAt: -1 }).skip(skip).limit(limitN).lean(),
      DeliveryTask.countDocuments(filter)
    ]);

    return res.ok({ data: items, total, page: +page, limit: limitN });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// GET /api/delivery/:id — Detalle de una entrega
export async function getDeliveryController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;

    const task = await DeliveryTask.findById(id)
      .populate("assigneeId", "name email phone")
      .populate("storeId", "name")
      .populate("orderId", "saleNumber total status")
      .lean();

    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));
    if (!isSuper && storeId && String(task.storeId?._id || task.storeId) !== String(storeId)) {
      return next(ERR.TENANT_FORBIDDEN());
    }

    return res.ok({ data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// POST /api/delivery/create
export async function createDeliveryController(req, res, next) {
  try {
    const storeId = req.tenant?.storeId;
    if (!storeId) return next(ERR.TENANT_FORBIDDEN());

    const { orderId, address } = req.body;
    if (!orderId) return next(ERR.VALIDATION({ orderId: "Requerido" }));

    const order = await OrderModel.findById(orderId).select("_id storeId status shippingAddress").lean();
    if (!order) return next(ERR.NOT_FOUND("Orden no encontrada"));
    if (String(order.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    const exists = await DeliveryTask.findOne({ orderId });
    if (exists) return next(ERR.CONFLICT("Ya existe una tarea de delivery para esta orden"));

    const task = await DeliveryTask.create({
      storeId,
      orderId,
      address: address || order.shippingAddress || {},
      status: "PENDING",
      timeline: [asEvent("CREATED", req.userId, "Creado")]
    });

    return res.status(201).json({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/assign
export async function assignDeliveryController(req, res, next) {
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;
    const { assigneeId, note } = req.body;

    if (!assigneeId) return next(ERR.VALIDATION({ assigneeId: "Requerido" }));

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));
    if (!isSuper && String(task.storeId) !== String(storeId)) return next(ERR.TENANT_FORBIDDEN());

    // Standard requiere recepcion en almacen antes de asignar
    if (task.shippingMethod === "MTZSTORE_STANDARD") {
      const hasReceipt = task.timeline.some(e => e.type === "RECEIVED_AT_WAREHOUSE");
      if (!hasReceipt) {
        return next(ERR.VALIDATION({ status: "El producto debe ser recibido en almacen antes de asignar repartidor" }));
      }
    }

    task.assigneeId = assigneeId;
    task.status = "ASSIGNED";
    task.timeline.push(asEvent("ASSIGNED", req.userId, note || "Asignado"));
    await task.save();

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// Mapa delivery status → order_status (minusculas, segun enum del Order model)
const DELIVERY_TO_ORDER_STATUS = {
  PICKED_UP: "processing",
  IN_TRANSIT: "shipped",
  DELIVERED: "delivered",
  FAILED: "cancelled",
  CANCELLED: "cancelled",
};

// PATCH /api/delivery/:id/status  body: { status, note }
export async function updateStatusController(req, res, next) {
  let task = null;
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;
    const { status, note, geo } = req.body;

    const allowed = new Set(["PICKED_UP", "IN_TRANSIT", "FAILED", "DELIVERED", "CANCELLED"]);
    if (!allowed.has(status)) return next(ERR.VALIDATION({ status: "Inválido" }));

    task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));
    const userId = req.userId || req.user?._id;
    const isAssignee = userId && String(task.assigneeId) === String(userId);
    if (!isSuper && !isAssignee && String(task.storeId) !== String(storeId)) {
      return next(ERR.TENANT_FORBIDDEN());
    }

    // Validar prueba antes de DELIVERED o FAILED
    if (status === "DELIVERED" && (!task.proofs || task.proofs.length === 0)) {
      return next(ERR.VALIDATION({ status: "Debe subir prueba de entrega antes de marcar como entregado" }));
    }

    // Validar código de recogida verificado antes de DELIVERED
    if (status === "DELIVERED" && task.pickupCode && !task.codeVerifiedAt) {
      return next(ERR.VALIDATION({ status: "Debe verificar el código de recogida antes de marcar como entregado" }));
    }

    // Capturar geolocalización al momento de entrega
    if (status === "DELIVERED" && geo?.lat != null && geo?.lng != null) {
      task.deliveryGeo = { lat: geo.lat, lng: geo.lng, capturedAt: new Date() };
    }
    if (status === "FAILED") {
      if (!task.proofs || task.proofs.length === 0) {
        return next(ERR.VALIDATION({ status: "Debe subir prueba antes de marcar como fallido" }));
      }
      if (!note?.trim()) {
        return next(ERR.VALIDATION({ note: "Debe indicar el motivo de la entrega fallida" }));
      }
    }

    task.status = status;
    task.timeline.push(asEvent(status, req.userId, note || ""));
    await task.save();

    // Sincronizar stats de la ruta si el task pertenece a una
    if (task.routeId) {
      try {
        const { syncRouteStats } = await import("./deliveryRoute.controller.js");
        await syncRouteStats(task.routeId);
      } catch (e) { console.warn("[syncRouteStats]", e?.message); }
    }

    // Sincronizar estado de la orden (minusculas, matchea enum del Order model)
    const orderStatus = DELIVERY_TO_ORDER_STATUS[status];
    if (orderStatus) {
      await OrderModel.updateOne(
        { _id: task.orderId },
        { $set: { order_status: orderStatus } }
      ).catch(() => { });
    }

    // Auto-settlement cuando se entrega
    if (status === "DELIVERED") {
      try {
        const payment = await Payment.findOne({ orderId: task.orderId, status: "CAPTURED" }).lean();
        if (payment) {
          await createAutoSettlement({
            storeId: String(task.storeId),
            orderId: String(task.orderId),
            amountUSD: payment.capturedAmount || payment.amount?.value || 0,
            bobPerUsd: 0,
            createdBy: req.userId,
          });
        }
      } catch (settleErr) {
        console.warn("[delivery→autoSettlement] Error:", settleErr?.message);
      }
    }

    // Notificar al cliente por email
    if (STATUS_CONFIG[status]) {
      try {
        const [driver, order] = await Promise.all([
          UserModel.findById(task.assigneeId).select("name mobile").lean(),
          OrderModel.findById(task.orderId).populate("userId", "name email").lean(),
        ]);
        if (order?.userId?.email) {
          const orderId = String(order._id);
          const html = DeliveryStatusEmail({
            status,
            customerName: order.userId.name,
            driverName: driver?.name,
            driverPhone: driver?.mobile,
            orderIdShort: orderId.slice(-8),
            totalBob: order.totalBob,
            products: order.products,
            shippingMethod: order.shippingMethod,
            shippingSettle: order.shippingSettle,
            ivaTotal: order.ivaTotal,
            itTotal: order.itTotal,
            note: note || "",
          });
          await sendEmailFun({
            sendTo: order.userId.email,
            subject: `${STATUS_CONFIG[status].subject} #${orderId.slice(-8)} – MTZstore`,
            html,
          });
        }
      } catch (emailErr) {
        console.warn("[delivery→statusEmail] Error:", emailErr?.message);
      }
    }

    // Audit
    await safeAudit(req, {
      action: "DELIVERY_STATUS",
      entity: "DeliveryTask",
      entityId: String(task._id),
      meta: { status }
    });

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    await safeAudit(req, {
      action: "DELIVERY_STATUS",
      entity: "DeliveryTask",
      entityId: String(task?._id || req.params?.id || ""),
      status: "ERROR",
      meta: { message: e?.message }
    });

    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/verify-code — Repartidor verifica código de recogida
export async function verifyPickupCodeController(req, res, next) {
  try {
    const { id } = req.params;
    const { code } = req.body || {};
    const userId = req.userId || req.user?._id;

    if (!code || typeof code !== "string") {
      return next(ERR.VALIDATION("Se requiere el código de recogida"));
    }

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));

    const isAssignee = userId && String(task.assigneeId) === String(userId);
    if (!isAssignee) {
      return next(ERR.VALIDATION("Solo el repartidor asignado puede verificar el código"));
    }

    if (!task.pickupCode) {
      return next(ERR.VALIDATION("Esta entrega no tiene código de recogida"));
    }

    const matches = code.trim().toUpperCase() === task.pickupCode.toUpperCase();
    if (!matches) {
      return res.ok({ verified: false, message: "Código incorrecto" });
    }

    task.codeVerifiedAt = new Date();
    task.codeVerifiedBy = userId;
    await task.save();

    return res.ok({ verified: true, message: "Código verificado correctamente" });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/proof  (form-data files[])
export const uploadProofMdw = upload.array("files", 6);
export async function uploadProofController(req, res, next) {
  let task = null;
  try {
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const storeId = req.tenant?.storeId || null;
    const { id } = req.params;

    task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));
    const userId = req.userId || req.user?._id;
    const isAssignee = userId && String(task.assigneeId) === String(userId);
    if (!isSuper && !isAssignee && String(task.storeId) !== String(storeId)) {
      return next(ERR.TENANT_FORBIDDEN());
    }

    const proofs = await uploadToCloudinary(req.files || []);
    if (!proofs.length) return next(ERR.VALIDATION({ files: "Adjuntar al menos un archivo" }));

    task.proofs.push(...proofs);
    task.timeline.push(asEvent(task.status, req.userId, `Prueba adjuntada (${proofs.length} archivo${proofs.length > 1 ? "s" : ""})`));
    await task.save();

    // ✅ Audit: agregado de pruebas
    await safeAudit(req, {
      action: "DELIVERY_PROOF_ADD",
      entity: "DeliveryTask",
      entityId: String(task._id),
      meta: { files: proofs.map(p => ({ name: p.name, size: p.size })) }
    });

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    // ❌ Audit: error al subir pruebas
    await safeAudit(req, {
      action: "DELIVERY_PROOF_ADD",
      entity: "DeliveryTask",
      entityId: String(task?._id || req.params?.id || ""),
      status: "ERROR",
      meta: { message: e?.message }
    });

    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/dispatch-warehouse — Tienda despacha producto a almacen MTZ
export async function dispatchToWarehouseController(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const userId = req.userId || req.user?._id;
    const isSuper = req.user?.role === "SUPER_ADMIN";

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));

    if (task.shippingMethod !== "MTZSTORE_STANDARD") {
      return next(ERR.VALIDATION({ status: "Solo entregas Estandar requieren despacho a almacen" }));
    }
    if (task.status !== "PENDING") {
      return next(ERR.VALIDATION({ status: "Solo entregas pendientes pueden ser despachadas" }));
    }

    // Verificar que el usuario pertenece a la tienda de la task (o es super admin)
    const storeId = req.tenant?.storeId || null;
    if (!isSuper && String(task.storeId) !== String(storeId)) {
      return next(ERR.TENANT_FORBIDDEN());
    }

    const alreadyDispatched = task.timeline.some(e => e.type === "DISPATCHED_TO_WAREHOUSE");
    if (alreadyDispatched) {
      return next(ERR.CONFLICT("Este producto ya fue despachado a almacen"));
    }

    task.timeline.push(asEvent("DISPATCHED_TO_WAREHOUSE", userId, note || "Producto despachado a almacen MTZ Group"));
    await task.save();

    // Actualizar orden a "processing"
    await OrderModel.updateOne(
      { _id: task.orderId },
      { $set: { order_status: "processing" } }
    ).catch(() => {});

    // Notificar al cliente
    try {
      const order = await OrderModel.findById(task.orderId).populate("userId", "name email").lean();
      if (order?.userId?.email) {
        const orderId = String(order._id);
        const html = DeliveryStatusEmail({
          status: "DISPATCHED_TO_WAREHOUSE",
          customerName: order.userId.name,
          driverName: null,
          driverPhone: null,
          orderIdShort: orderId.slice(-8),
          totalBob: order.totalBob,
          products: order.products,
          shippingMethod: order.shippingMethod,
          shippingSettle: order.shippingSettle,
          ivaTotal: order.ivaTotal,
          itTotal: order.itTotal,
        });
        await sendEmailFun({
          sendTo: order.userId.email,
          subject: `${STATUS_CONFIG.DISPATCHED_TO_WAREHOUSE.subject} #${orderId.slice(-8)} – MTZstore`,
          html,
        });
      }
    } catch (emailErr) {
      console.warn("[delivery→dispatchEmail] Error:", emailErr?.message);
    }

    await safeAudit(req, {
      action: "DELIVERY_DISPATCH_WAREHOUSE",
      entity: "DeliveryTask",
      entityId: String(task._id),
      meta: { shippingMethod: task.shippingMethod }
    });

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// PATCH /api/delivery/:id/receive-warehouse — INVENTORY_MANAGER marca recepcion en almacen
export async function receiveWarehouseController(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const userId = req.userId || req.user?._id;

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));

    if (task.shippingMethod !== "MTZSTORE_STANDARD") {
      return next(ERR.VALIDATION({ status: "Solo entregas Estandar requieren recepcion en almacen" }));
    }
    if (task.status !== "PENDING") {
      return next(ERR.VALIDATION({ status: "Solo entregas pendientes pueden ser recibidas en almacen" }));
    }
    const dispatched = task.timeline.some(e => e.type === "DISPATCHED_TO_WAREHOUSE");
    if (!dispatched) {
      return next(ERR.VALIDATION({ status: "La tienda debe despachar el producto primero" }));
    }
    const alreadyReceived = task.timeline.some(e => e.type === "RECEIVED_AT_WAREHOUSE");
    if (alreadyReceived) {
      return next(ERR.CONFLICT("Este producto ya fue recibido en almacen"));
    }

    task.timeline.push(asEvent("RECEIVED_AT_WAREHOUSE", userId, note || "Producto recibido en almacen MTZ Group"));
    await task.save();

    // Actualizar orden a "processing"
    await OrderModel.updateOne(
      { _id: task.orderId },
      { $set: { order_status: "processing" } }
    ).catch(() => {});

    // Notificar al cliente
    try {
      const order = await OrderModel.findById(task.orderId).populate("userId", "name email").lean();
      if (order?.userId?.email) {
        const orderId = String(order._id);
        const html = DeliveryStatusEmail({
          status: "RECEIVED_AT_WAREHOUSE",
          customerName: order.userId.name,
          driverName: null,
          driverPhone: null,
          orderIdShort: orderId.slice(-8),
          totalBob: order.totalBob,
          products: order.products,
          shippingMethod: order.shippingMethod,
          shippingSettle: order.shippingSettle,
          ivaTotal: order.ivaTotal,
          itTotal: order.itTotal,
        });
        await sendEmailFun({
          sendTo: order.userId.email,
          subject: `${STATUS_CONFIG.RECEIVED_AT_WAREHOUSE.subject} #${orderId.slice(-8)} – MTZstore`,
          html,
        });
      }
    } catch (emailErr) {
      console.warn("[delivery→warehouseEmail] Error:", emailErr?.message);
    }

    await safeAudit(req, {
      action: "DELIVERY_WAREHOUSE_RECEIVE",
      entity: "DeliveryTask",
      entityId: String(task._id),
      meta: { shippingMethod: task.shippingMethod }
    });

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}

// DELETE /api/delivery/:id/proof/:proofIndex
export async function deleteProofController(req, res, next) {
  try {
    const { id, proofIndex } = req.params;
    const idx = Number(proofIndex);

    const task = await DeliveryTask.findById(id);
    if (!task) return next(ERR.NOT_FOUND("Delivery no encontrado"));

    const userId = req.userId || req.user?._id;
    const isSuper = req.user?.role === "SUPER_ADMIN";
    const isAssignee = userId && String(task.assigneeId) === String(userId);
    const storeId = req.tenant?.storeId || null;
    if (!isSuper && !isAssignee && String(task.storeId) !== String(storeId)) {
      return next(ERR.TENANT_FORBIDDEN());
    }

    if (!Number.isInteger(idx) || idx < 0 || idx >= (task.proofs?.length || 0)) {
      return next(ERR.VALIDATION({ proofIndex: "Indice de prueba invalido" }));
    }

    const removed = task.proofs.splice(idx, 1)[0];

    // Eliminar de Cloudinary si tiene publicId
    if (removed?.publicId) {
      try { await cloudinary.uploader.destroy(removed.publicId); } catch { }
    }

    task.timeline.push(asEvent(task.status, userId, `Prueba eliminada: ${removed?.name || "archivo"}`));
    await task.save();

    return res.ok({ error: false, success: true, data: task });
  } catch (e) {
    return next(e?.status ? e : ERR.SERVER(e.message));
  }
}
