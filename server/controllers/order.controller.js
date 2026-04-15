import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.model.js';
import ProductVariantModel from '../models/productVariant.model.js';
import UserModel from '../models/user.model.js';
import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import OrderCancelEmail from "../utils/orderCancelEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
// import cryptixClient from "../config/cryptixClient.js";
// import { getBobToUsdRate } from "../services/binanceService.js";
import { getBobPerUsdtRateCached } from "../services/binanceService.js";
import { ERR } from '../utils/httpError.js';
import Payment from '../models/payment.model.js';
import { paypalCreateOrder } from '../services/paypal.service.js';
import { paypalCaptureOrder } from '../services/paypal.service.js';
import { reconcileOrderPayment } from '../services/orderPayment.service.js';
import DeliveryTask from "../models/deliveryTask.model.js";
import AddressModel from "../models/address.model.js";

// CREATE
// CREATE ORDER (FINAL)
export const createOrderController = async (req, res, next) => {
    try {
        const {
            products = [],
            paymentId,
            payment_status,
            delivery_address,
            paymentMethod = "",
            shippingMethod = "MTZSTORE_STANDARD",
            shippingSettle = 0,
            feesSettle = 0,
            returnUrl,
            cancelUrl,
        } = req.body;

        const userId = req.userId;

        if (!Array.isArray(products) || products.length === 0) {
            throw ERR.VALIDATION("Products array is required");
        }

        /* ======================================================
           0) Infer payment method
        ====================================================== */
        const inferredMethod =
            paymentMethod ||
            (String(payment_status || "").toUpperCase().includes("CASH")
                ? "CashBOB"
                : "");

        /* ======================================================
           1) FX snapshot
        ====================================================== */
        const { rate: bobPerUsd, source } = await getBobPerUsdtRateCached();
        const fxFallbackUsed = source === "env-fallback";

        const round2 = (n) =>
            Math.round((Number(n) + Number.EPSILON) * 100) / 100;

        /* ======================================================
           2) Settle currency
        ====================================================== */
        const settleCurrency = ["PayPal", "Cryptomus"].includes(inferredMethod)
            ? "USD"
            : "BOB";

        let subtotalSettle = 0;
        const storesInOrder = new Set();

        /* ======================================================
           3) Normalize products (DB-trusted)
        ====================================================== */
        const normalizedProducts = await Promise.all(
            products.map(async (p) => {
                const qty = Math.max(1, Number(p.quantity || 1));

                const product = await ProductModel.findById(p.productId)
                    .select(
                        "storeId name images basePrice baseCurrency productType countInStock warehouseStock salesConfig"
                    )
                    .lean();

                if (!product) {
                    throw ERR.NOT_FOUND("Producto no encontrado");
                }

                const productType = product.productType || "SIMPLE";
                let variant = null;

                if (productType === "VARIANT") {
                    if (!p.variantId) {
                        throw ERR.VALIDATION({
                            variantId: "Variante requerida",
                        });
                    }

                    variant = await ProductVariantModel.findById(
                        p.variantId
                    ).lean();

                    if (!variant) {
                        throw ERR.NOT_FOUND("Variante no encontrada");
                    }

                    if (
                        String(variant.productId) !==
                        String(product._id)
                    ) {
                        throw ERR.CONFLICT(
                            "La variante no pertenece al producto"
                        );
                    }
                }

                if (product.storeId) storesInOrder.add(String(product.storeId));

                const baseCurrency =
                    variant?.currency ||
                    product.baseCurrency ||
                    "BOB";

                const baseAmount =
                    variant?.price ??
                    product.basePrice ??
                    0;

                // Determine which stock to check based on shipping method
                const isMtzShipping = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(shippingMethod);

                let stockAvailable;
                if (isMtzShipping) {
                    stockAvailable = productType === "VARIANT"
                        ? (variant.warehouseStock || 0)
                        : (product.warehouseStock || 0);
                } else {
                    stockAvailable = productType === "VARIANT"
                        ? (variant.stock ?? variant.countInStock ?? 0)
                        : (product.countInStock || 0);
                }

                if (stockAvailable < qty) {
                    throw ERR.CONFLICT(
                        `Stock insuficiente para ${product.name}`
                    );
                }

                let unitSettleAmount = baseAmount;

                if (baseCurrency !== settleCurrency) {
                    unitSettleAmount =
                        baseCurrency === "USD"
                            ? baseAmount * bobPerUsd
                            : baseAmount / bobPerUsd;
                }

                if (settleCurrency === "USD") {
                    unitSettleAmount = round2(unitSettleAmount);
                }

                const lineTotalSettle =
                    settleCurrency === "USD"
                        ? round2(unitSettleAmount * qty)
                        : unitSettleAmount * qty;

                subtotalSettle += lineTotalSettle;

                // Tax config del producto
                const taxCfg = product?.salesConfig?.taxConfig || {};
                const ivaEnabled = taxCfg.ivaEnabled !== false;
                const ivaPct = Number(taxCfg.ivaPct) || 13;
                const itEnabled = taxCfg.itEnabled !== false;
                const itPct = Number(taxCfg.otherTaxesPct) || 3;

                return {
                    productId: product._id,
                    variantId: variant?._id || null,
                    productType,

                    storeId: product.storeId,
                    productTitle: product.name,
                    image: product.images?.[0] || "",

                    size: variant?.size || null,
                    ram: variant?.ram || null,
                    weight: variant?.weight || null,
                    variantAttrs: variant?.attributes || null,

                    quantity: qty,
                    price: baseAmount,
                    currency: baseCurrency,
                    subTotal: baseAmount * qty,

                    stockSnapshot: stockAvailable,

                    unitSettleAmount,
                    lineTotalSettle,

                    // Impuestos
                    ivaEnabled,
                    ivaPct,
                    itEnabled,
                    itPct,
                };
            })
        );

        /* ======================================================
           4) One store per order
        ====================================================== */
        if (storesInOrder.size > 1) {
            throw ERR.VALIDATION(
                "El carrito contiene productos de múltiples tiendas"
            );
        }

        /* ======================================================
           5) Totals (incluye IVA + IT)
        ====================================================== */
        let ivaTotal = 0;
        let itTotal = 0;
        for (const line of normalizedProducts) {
            const lineAmt = line.lineTotalSettle || (line.price * line.quantity);
            if (line.ivaEnabled && line.ivaPct > 0) {
                ivaTotal += lineAmt * (line.ivaPct / 100);
            }
            if (line.itEnabled && line.itPct > 0) {
                itTotal += lineAmt * (line.itPct / 100);
            }
        }
        if (settleCurrency === "USD") {
            ivaTotal = round2(ivaTotal);
            itTotal = round2(itTotal);
        }

        let totalAmt =
            subtotalSettle +
            ivaTotal +
            itTotal +
            Number(shippingSettle || 0) +
            Number(feesSettle || 0);

        if (settleCurrency === "USD") {
            totalAmt = round2(totalAmt);
        }

        const totalUsd =
            settleCurrency === "USD"
                ? round2(totalAmt)
                : round2(totalAmt / bobPerUsd);

        const totalBob =
            settleCurrency === "BOB"
                ? totalAmt
                : round2(totalAmt * bobPerUsd);

        const storeId = storesInOrder.size > 0 ? Array.from(storesInOrder)[0] : null;

        /* ======================================================
           6) Create order
        ====================================================== */
        let order = new OrderModel({
            userId,
            storeId,
            products: normalizedProducts,

            paymentId,
            payment_status,
            paymentMethod: inferredMethod,

            delivery_address,
            shippingMethod,

            settleCurrency,
            subtotalAmt: subtotalSettle,
            ivaTotal,
            itTotal,
            totalAmt,
            totalUsd,
            totalBob,
            shippingSettle,
            feesSettle,

            fx: {
                bobPerUsd,
                usedFallback: fxFallbackUsed,
                at: new Date(),
            },
        });

        order = await order.save();

        /* ======================================================
           7) Discount stock (based on shipping method)
        ====================================================== */
        const isMtzShipping = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(shippingMethod);
        const stockField = isMtzShipping ? "warehouseStock" : "countInStock";

        for (const line of normalizedProducts) {
            const qty = line.quantity;

            if (line.productType === "VARIANT" && line.variantId) {
                // For variants: store stock field is "stock", warehouse is "warehouseStock"
                const variantStockField = isMtzShipping ? "warehouseStock" : "stock";
                await ProductVariantModel.findByIdAndUpdate(
                    line.variantId,
                    {
                        $inc: {
                            [variantStockField]: -qty,
                            sale: qty,
                        },
                    }
                );
            } else {
                await ProductModel.findByIdAndUpdate(
                    line.productId,
                    {
                        $inc: {
                            [stockField]: -qty,
                            sale: qty,
                        },
                    }
                );
            }
        }

        /* ======================================================
           7b) Auto-create DeliveryTask for all shipping methods
        ====================================================== */
        if (["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD", "STORE"].includes(shippingMethod)) {
            try {
                const addr = delivery_address
                    ? await AddressModel.findById(delivery_address).lean()
                    : null;

                const orderUser = await UserModel.findById(userId).select("name").lean();

                const methodLabels = {
                    MTZSTORE_EXPRESS: "Express",
                    MTZSTORE_STANDARD: "Estandar",
                    STORE: "Tienda",
                };

                const deliveryPayload = {
                    orderId: order._id,
                    shippingMethod,
                    status: "PENDING",
                    address: addr
                        ? {
                              name: addr.fullName || orderUser?.name || "",
                              phone: addr.mobile || "",
                              line1: addr.address_line1 || "",
                              line2: addr.address_line2 || "",
                              city: addr.city || "",
                              state: addr.state || "",
                              zip: addr.postalCode || "",
                              country: addr.country || "Bolivia",
                              notes: addr.landmark || addr.notes || "",
                              geo: addr.location || {},
                          }
                        : {},
                    timeline: [
                        {
                            type: "CREATED",
                            by: userId,
                            note: `Creado automaticamente (envio ${methodLabels[shippingMethod] || shippingMethod})`,
                            at: new Date(),
                        },
                    ],
                };
                if (storeId) deliveryPayload.storeId = storeId;

                await DeliveryTask.create(deliveryPayload);
            } catch (dtErr) {
                console.error("[order→autoDeliveryTask] Error creando DeliveryTask:", dtErr);
            }
        }

        /* ======================================================
           8) Email
        ====================================================== */
        const user = await UserModel.findById(userId).lean();

        if (user?.email) {
            await sendEmailFun({
                sendTo: [user.email],
                subject: "Order Confirmation",
                html: OrderConfirmationEmail(user.name, order),
            });
        }

        /* ======================================================
           9) PayPal
        ====================================================== */
        if (inferredMethod === "PayPal") {
            const out = await paypalCreateOrder({
                amount: totalUsd,
                currency: "USD",
                referenceId: String(order._id),
                returnUrl:
                    returnUrl ||
                    `${process.env.FRONT_URL}/checkout/success?order=${order._id}`,
                cancelUrl:
                    cancelUrl ||
                    `${process.env.FRONT_URL}/checkout/cancel?order=${order._id}`,
            });

            const payment = await Payment.create({
                storeId,
                orderId: order._id,
                provider: "PAYPAL",
                providerPaymentId: out.providerPaymentId,
                status: "CREATED",
                amount: { currency: "USD", value: totalUsd },
                providerData: out.raw,
            });

            order.latestPaymentId = payment._id;
            order.payment_status = "CREATED";
            await order.save();

            return res.created({
                message: "Order Placed",
                order,
                payment,
                approveLink: out.approveLink,
            });
        }

        /* ======================================================
           10) Finish
        ====================================================== */
        return res.created({
            message: "Order Placed",
            order,
        });
    } catch (e) {
        return next(e);
    }
};

// LIST (admin/seller scope + filtros)
export async function getOrderDetailsController(req, res, next) {
    try {
        const pageNum = Math.max(parseInt(req.query.page ?? "1", 10), 1);
        const limitNum = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);

        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === "SUPER_ADMIN";
        const tenantStoreId = req.tenant?.storeId;

        const baseScope = isSuperAdmin
            ? {}
            : (tenantStoreId
                ? { $or: [{ storeId: tenantStoreId }, { "products.storeId": tenantStoreId }] }
                : {});

        const extra = {};
        if (req.query.status) extra.order_status = String(req.query.status);
        if (req.query.payment_status) extra.payment_status = String(req.query.payment_status);
        if (req.query.userId) extra.userId = req.query.userId;

        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;
        if (from || to) {
            extra.createdAt = {};
            if (from && !isNaN(from)) extra.createdAt.$gte = from;
            if (to && !isNaN(to)) extra.createdAt.$lte = to;
            if (!Object.keys(extra.createdAt).length) delete extra.createdAt;
        }

        const filter = { ...baseScope, ...extra };

        // 1) Traer órdenes paginadas
        const [orderlist, total] = await Promise.all([
            OrderModel.find(filter)
                .sort({ createdAt: -1 })
                .populate("delivery_address userId")
                .populate("storeId", "name")
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            OrderModel.countDocuments(filter)
        ]);

        // 2) Buscar pagos de esas órdenes (en el mismo tenant cuando aplica)
        const orderIds = orderlist.map(o => o._id);
        const payFilter = { orderId: { $in: orderIds } };
        if (!isSuperAdmin && tenantStoreId) payFilter.storeId = tenantStoreId;

        const payments = await Payment.find(payFilter).sort({ createdAt: -1 }).lean();

        // 3) Agrupar pagos por orden
        const byOrder = new Map();
        for (const p of payments) {
            const k = String(p.orderId);
            if (!byOrder.has(k)) byOrder.set(k, []);
            byOrder.get(k).push(p);
        }

        // 4) Construir summary por orden y adjuntar
        const hydrated = orderlist.map(doc => {
            const o = doc.toObject({ getters: true, virtuals: true });
            const pays = byOrder.get(String(doc._id)) || [];

            let captured = 0;
            let refunded = 0;
            let lastStatus = pays[0]?.status || null; // ya vienen ordenados desc
            const providers = new Set();

            for (const p of pays) {
                providers.add(p.provider);
                if (["CAPTURED", "PARTIALLY_REFUNDED", "REFUNDED"].includes(p.status)) {
                    captured += Number(p.capturedAmount?.value ?? p.amount?.value ?? 0);
                }
                if (Array.isArray(p.refunds)) {
                    for (const r of p.refunds) refunded += Number(r.amount?.value ?? 0);
                }
            }

            o.payments = pays;
            o.paymentSummary = {
                lastStatus: lastStatus || "NONE",
                providers: Array.from(providers),
                capturedAmount: captured,
                refundedAmount: refunded,
                currency: pays[0]?.amount?.currency || o.totalCurrency || "USD"
            };

            return o;
        });

        return res.ok({
            message: "order list",
            data: hydrated,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (e) { return next(e); }
}

// LIST (historial del usuario)
export async function getUserOrderDetailsController(req, res, next) {
    try {
        const userId = req.userId;

        const pageNum = Math.max(parseInt(req.query.page ?? "1", 10), 1);
        const limitNum = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);

        const tenantStoreId = req.tenant?.storeId;
        const scopeByStore = tenantStoreId
            ? { $or: [{ storeId: tenantStoreId }, { "products.storeId": tenantStoreId }] }
            : {};

        const extra = {};
        if (req.query.status) extra.order_status = String(req.query.status);
        if (req.query.payment_status) extra.payment_status = String(req.query.payment_status);

        const filter = { userId, ...scopeByStore, ...extra };

        // 1) Traer órdenes del usuario (paginadas)
        const [orderlist, total] = await Promise.all([
            OrderModel.find(filter)
                .sort({ createdAt: -1 })
                .populate("delivery_address userId")
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            OrderModel.countDocuments(filter)
        ]);

        // 2) Traer pagos de esas órdenes en un solo query
        const orderIds = orderlist.map(o => o._id);
        const payFilter = { orderId: { $in: orderIds } };
        if (tenantStoreId) payFilter.storeId = tenantStoreId;

        const payments = await Payment.find(payFilter).sort({ createdAt: -1 }).lean();

        // 3) Agrupar pagos por orderId
        const byOrder = new Map();
        for (const p of payments) {
            const k = String(p.orderId);
            if (!byOrder.has(k)) byOrder.set(k, []);
            byOrder.get(k).push(p);
        }

        // 4) Adjuntar pagos + resumen a cada orden
        const hydrated = orderlist.map(doc => {
            const o = doc.toObject({ getters: true, virtuals: true });
            const pays = byOrder.get(String(doc._id)) || [];

            let captured = 0;
            let refunded = 0;
            let lastStatus = pays[0]?.status || null; // pagos ya ordenados desc
            const providers = new Set();

            for (const p of pays) {
                providers.add(p.provider);
                if (["CAPTURED", "PARTIALLY_REFUNDED", "REFUNDED"].includes(p.status)) {
                    captured += Number(p.capturedAmount?.value ?? p.amount?.value ?? 0);
                }
                if (Array.isArray(p.refunds)) {
                    for (const r of p.refunds) refunded += Number(r.amount?.value ?? 0);
                }
            }

            const currency = pays[0]?.amount?.currency || o.totalCurrency || "USD";

            o.payments = pays;
            o.paymentSummary = {
                lastStatus: lastStatus || "NONE",
                providers: Array.from(providers),
                capturedAmount: captured,
                refundedAmount: refunded,
                currency
            };
            // Atajo útil para el front:
            o.paymentStatus = o.paymentSummary.lastStatus;

            return o;
        });

        return res.ok({
            message: "order list",
            data: hydrated,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (e) { return next(e); }
}

// COUNT (admin/seller scope)
export async function getTotalOrdersCountController(req, res, next) {
    try {
        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === "SUPER_ADMIN";
        const tenantStoreId = req.tenant?.storeId;

        const filter = isSuperAdmin
            ? {}
            : (tenantStoreId
                ? { $or: [{ storeId: tenantStoreId }, { "products.storeId": tenantStoreId }] }
                : {});

        const count = await OrderModel.countDocuments(filter);
        return res.ok({ count });
    } catch (e) { return next(e); }
}

function getPayPalClient() {
    const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

    const clientId =
        mode === "live" ? process.env.PAYPAL_CLIENT_ID_LIVE : process.env.PAYPAL_CLIENT_ID_TEST;
    const clientSecret =
        mode === "live" ? process.env.PAYPAL_SECRET_LIVE : process.env.PAYPAL_SECRET_TEST;

    if (!clientId || !clientSecret) {
        throw new Error(
            `PayPal credentials missing for mode=${mode}. Check your .env configuration.`
        );
    }

    const environment =
        mode === "live"
            ? new paypal.core.LiveEnvironment(clientId, clientSecret)
            : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    const client = new paypal.core.PayPalHttpClient(environment);

    // Extra opcional: adjuntar el modo para logs/debug
    client.mode = mode;

    return client;
}

// ✅ Mantén tu getPayPalClient() tal como lo tienes arriba

// POST /api/paypal/create  (DEPRECATED WRAPPER)
// Mantiene compat con totalBob/totalAmount y responde con payload nuevo + legacy
export const createOrderPaypalController = async (req, res, next) => {
    try {
        const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

        // ① Datos legacy (body o query)
        const body = req.body || {};
        const totalBobFromBody = body.totalBob != null ? Number(body.totalBob) : null;
        const totalUsdLegacy = req.query?.totalAmount != null ? Number(req.query.totalAmount) : null;

        // ② Convertir BOB→USD si vino totalBob
        let amountUsd = totalUsdLegacy;
        let snapshotRate = null;
        if (totalBobFromBody != null) {
            const { rate } = await getBobPerUsdtRateCached(); // BOB por 1 USD/USDT
            snapshotRate = Number(rate);
            if (!snapshotRate || snapshotRate <= 0) throw ERR.SERVER("Invalid FX snapshot rate");
            amountUsd = round2(totalBobFromBody / snapshotRate);
        }
        if (!amountUsd || isNaN(amountUsd) || amountUsd <= 0) {
            throw ERR.VALIDATION("Invalid amount to create PayPal order");
        }

        // ③ URLs e idempotencia
        const idempotencyKey =
            req.headers['x-idempotency-key'] ||
            `legacy:create:${req.tenant?.storeId || 'na'}:${amountUsd}`;

        const RETURN_URL =
            body.returnUrl || `${process.env.FRONT_URL || ""}/checkout/success`;
        const CANCEL_URL =
            body.cancelUrl || `${process.env.FRONT_URL || ""}/checkout/cancel`;

        // ④ Crear orden en PayPal (servicio)
        const out = await paypalCreateOrder({
            amount: amountUsd,
            currency: "USD",
            referenceId: String(body.orderId || ""), // opcional
            returnUrl: RETURN_URL,
            cancelUrl: CANCEL_URL,
        });

        // ⑤ Persistir Payment
        const payment = await Payment.create({
            storeId: req.tenant?.storeId || null,
            orderId: body.orderId || null,
            provider: "PAYPAL",
            providerPaymentId: out.providerPaymentId,
            status: "CREATED",
            idempotencyKey,
            amount: { currency: "USD", value: amountUsd },
            providerData: out.raw,
        });

        // ⑥ Responder (nuevo + legacy para no romper nada)
        return res.created({
            // Nuevo
            payment,
            approveLink: out.approveLink,
            // Legacy compat
            id: out.providerPaymentId,
            amountUsd,
            snapshotRate,
            mode: (process.env.PAYPAL_MODE === "live" ? "live" : "sandbox"),
        });
    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || "Error creating PayPal order (legacy wrapper)"));
    }
};

// POST /api/paypal/capture  (DEPRECATED WRAPPER)
// Captura en PayPal vía servicio, actualiza/crea Payment y reconcilia Order.
// Devuelve payload nuevo + legacy para no romper frontends antiguos.
export const captureOrderPaypalController = async (req, res, next) => {
    try {
        const storeId = req.tenant?.storeId || null;

        // Acepta nombres legacy
        const providerPaymentId =
            req.body?.paymentId ||
            req.body?.providerPaymentId ||
            req.body?.paypalOrderId ||
            req.body?.orderId ||
            req.query?.providerPaymentId ||
            req.query?.orderId;

        if (!providerPaymentId) {
            throw ERR.VALIDATION({ providerPaymentId: "Falta providerPaymentId/paymentId" });
        }

        // 1) Capturar con servicio (sin SDK en el controller)
        const result = await paypalCaptureOrder({ providerPaymentId });
        if (String(result.status || "").toUpperCase() !== "COMPLETED") {
            throw ERR.CONFLICT("La captura no fue completada por PayPal.");
        }

        // 2) Encontrar o crear Payment
        let payment = await Payment.findOne({
            storeId,
            provider: "PAYPAL",
            providerPaymentId
        });

        if (!payment) {
            // Crear si vino por flujo legacy y no existía (p.ej. se creó el PP order fuera)
            payment = await Payment.create({
                storeId,
                orderId: req.body?.orderId || null, // si el cliente la pasa
                provider: "PAYPAL",
                providerPaymentId,
                status: "CAPTURED",
                amount: {
                    currency: String(result.amount?.currency || "USD"),
                    value: Number(result.amount?.value || 0)
                },
                capturedAmount: {
                    currency: String(result.amount?.currency || "USD"),
                    value: Number(result.amount?.value || 0)
                },
                payer: result.payer || {},
                providerData: { capture: result.raw || {} },
            });
        } else {
            payment.status = "CAPTURED";
            payment.capturedAmount = {
                currency: String(result.amount?.currency || "USD"),
                value: Number(result.amount?.value || 0)
            };
            payment.payer = result.payer || payment.payer;
            payment.providerData = { ...(payment.providerData || {}), capture: result.raw || {} };
            await payment.save();
        }

        // 3) Reconciliar estado de la orden (si la hay)
        if (payment.orderId) {
            await reconcileOrderPayment({
                storeId,
                orderId: payment.orderId,
                paymentStatus: "CAPTURED"
            });
        }

        // 4) Compatibilidad legacy: intenta retornar la orden si existe
        let order = null;
        if (payment.orderId) {
            order = await OrderModel.findById(payment.orderId)
                .populate("delivery_address userId")
                .lean();
        }

        // 5) Respuesta combinada (nuevo + legacy)
        return res.ok({
            // Nuevo
            message: "Payment captured",
            payment,
            // Legacy (mantener campos usados históricamente)
            success: true,
            error: false,
            order,                // si existe; en flujos nuevos puede ser null
            paypal: result.raw,   // equivalente a capture.result
        });
    } catch (e) {
        console.error("PayPal Capture Error (legacy wrapper):", e);
        return next(e?.status ? e : ERR.SERVER(e?.message || "Error capturing PayPal order (legacy wrapper)"));
    }
};


export const updateOrderStatusController = async (req, res, next) => {
    try {
        const { id, order_status } = req.body;

        if (!id || !order_status) {
            throw ERR.VALIDATION({ id: 'requerido', order_status: 'requerido' });
        }

        const norm = (s) =>
            String(s || '')
                .trim()
                .toLowerCase()
                .replace('canceled', 'cancelled'); // alias en-US → en-GB

        const to = norm(order_status);

        // 1) Estados de PAGO prohibidos por este endpoint
        const forbiddenPaymentStates = new Set([
            'paid',
            'refunded',
            'partially_refunded',
            'payment_failed'
        ]);
        if (forbiddenPaymentStates.has(to)) {
            throw ERR.CONFLICT(
                "Estados de pago (paid/refunded/partially_refunded/payment_failed) se actualizan vía Payments/Webhooks."
            );
        }

        // 2) Alcance multi-tienda
        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === 'SUPER_ADMIN';
        const tenantStoreId = req.tenant?.storeId;

        const scope = isSuperAdmin
            ? { _id: id }
            : (tenantStoreId
                ? { _id: id, $or: [{ storeId: tenantStoreId }, { 'products.storeId': tenantStoreId }] }
                : { _id: id });

        const order = await OrderModel.findOne(scope);
        if (!order) throw ERR.NOT_FOUND('Order not found');

        const from = norm(order.order_status || order.status || 'created');
        if (from === to) {
            return res.ok({
                message: 'Order status unchanged',
                success: true,
                error: false,
                data: { matchedCount: 1, modifiedCount: 0 }
            });
        }

        // 3) Validación de estados operativos y transiciones
        const operational = new Set(['created', 'confirm', 'processing', 'shipped', 'delivered', 'cancelled']);
        if (!operational.has(to)) {
            throw ERR.VALIDATION({ order_status: `Estado inválido: ${order_status}` });
        }

        const allowedTransitions = {
            created: new Set(['confirm', 'processing', 'cancelled']),
            confirm: new Set(['processing', 'cancelled']),
            processing: new Set(['shipped', 'cancelled']),
            shipped: new Set(['delivered', 'cancelled']),
            delivered: new Set([]),           // final
            cancelled: new Set([]),           // final
        };

        // Estados finales no pueden moverse
        if ((from === 'delivered' || from === 'cancelled') && to !== from) {
            throw ERR.VALIDATION(`No se permite cambiar desde '${from}' a '${to}'`);
        }

        // Si el estado actual no está reconocido, trátalo como 'created' para no romper
        const fromKey = allowedTransitions[from] ? from : 'created';
        if (!allowedTransitions[fromKey].has(to)) {
            throw ERR.VALIDATION(`Transición no permitida: '${from}' → '${to}'`);
        }

        // 4) Reglas extra para cancelación con pagos
        if (to === 'cancelled' && from !== 'cancelled') {
            // Bloquear si hay pagos capturados y NO están totalmente reembolsados
            const payFilter = { orderId: order._id };
            if (!isSuperAdmin && tenantStoreId) payFilter.storeId = tenantStoreId;

            const capturedOrPartial = await Payment.findOne({
                ...payFilter,
                status: { $in: ['CAPTURED', 'PARTIALLY_REFUNDED'] }
            }).lean();

            if (capturedOrPartial) {
                throw ERR.CONFLICT(
                    "La orden tiene pagos capturados o parcialmente reembolsados. Reembolsa totalmente antes de cancelar."
                );
            }
        }

        // 5) Reponer stock si se cancela por primera vez
        if (to === 'cancelled' && from !== 'cancelled') {
            try {
                const orderMethod = order.shippingMethod || "MTZSTORE_STANDARD";
                const isMtz = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(orderMethod);
                const restoreField = isMtz ? "warehouseStock" : "countInStock";

                for (const line of order.products || []) {
                    const pid = line.productId;
                    const qty = Number(line.quantity || 0);
                    if (!pid || !qty) continue;

                    if (line.productType === "VARIANT" && line.variantId) {
                        const variantField = isMtz ? "warehouseStock" : "stock";
                        await ProductVariantModel.findByIdAndUpdate(line.variantId, {
                            $inc: { [variantField]: qty, sale: -qty }
                        });
                    } else {
                        await ProductModel.findByIdAndUpdate(pid, {
                            $inc: { [restoreField]: qty, sale: -qty }
                        });
                    }
                }
            } catch (invErr) {
                console.error('Stock revert error:', invErr?.message || invErr);
            }
        }

        // 6) Si se cancela, sincronizar DeliveryTask y notificar al cliente
        if (to === 'cancelled') {
            try {
                const dt = await DeliveryTask.findOne({ orderId: order._id });
                if (dt && !["DELIVERED", "CANCELLED"].includes(dt.status)) {
                    dt.status = "CANCELLED";
                    dt.timeline.push({ type: "CANCELLED", by: req.userId, note: "Cancelado por admin", at: new Date() });
                    await dt.save();
                }
            } catch (dtErr) {
                console.warn("[updateOrderStatus] DeliveryTask sync error:", dtErr?.message);
            }

            // Email de cancelacion al cliente
            try {
                const customer = await UserModel.findById(order.userId).select("name email").lean();
                if (customer?.email) {
                    const oid = String(order._id);
                    const html = OrderCancelEmail({
                        customerName: customer.name,
                        orderIdShort: oid.slice(-8),
                        totalBob: order.totalBob,
                        products: order.products,
                        reason: "Cancelado por el administrador",
                    });
                    await sendEmailFun({
                        sendTo: customer.email,
                        subject: `Pedido #${oid.slice(-8)} cancelado – MTZstore`,
                        html,
                    });
                }
            } catch (emailErr) {
                console.warn("[updateOrderStatus] Cancel email error:", emailErr?.message);
            }
        }

        // 7) Persistir cambio
        order.order_status = to;
        order.status = to; // compat
        await order.save();

        return res.ok({
            message: 'Update order status',
            success: true,
            error: false,
            data: { matchedCount: 1, modifiedCount: 1 },
            order
        });
    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || 'Error updating order status'));
    }
};

// GET /api/order/total-sales (solo pagos efectivamente cobrados)
// GET /api/order/sales?group=day|month|year&currency=USD|BOB&year=2025&from=YYYY-MM-DD&to=YYYY-MM-DD
export const totalSalesController = async (req, res, next) => {
    try {
        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === 'SUPER_ADMIN';
        const tenantStoreId = req.tenant?.storeId || null;

        const qYear = req.query.year ? parseInt(req.query.year, 10) : null;
        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;

        // NUEVOS params
        const group = (req.query.group || 'month').toLowerCase();  // day | month | year
        const currency = (req.query.currency || 'BOB').toUpperCase(); // USD | BOB

        // Filtro base sobre Payments (NO órdenes)
        const payFilter = {
            status: { $in: ['CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED'] }
        };
        if (!isSuperAdmin && tenantStoreId) payFilter.storeId = tenantStoreId;

        // Usamos updatedAt para reflejar el momento en que el pago quedó capturado/refundado
        if ((from && !isNaN(from)) || (to && !isNaN(to))) {
            payFilter.updatedAt = {};
            if (from && !isNaN(from)) payFilter.updatedAt.$gte = from;
            if (to && !isNaN(to)) payFilter.updatedAt.$lte = to;
            if (!Object.keys(payFilter.updatedAt).length) delete payFilter.updatedAt;
        }

        // 1) Pagos relevantes
        const payments = await Payment
            .find(payFilter)
            .select('orderId amount capturedAmount status updatedAt')
            .sort({ updatedAt: -1 })
            .lean();

        // 2) Map de órdenes para snapshot FX (bobPerUsd) al momento de la orden
        const usdPayments = payments.filter(p => (p.capturedAmount?.currency || p.amount?.currency) === 'USD');
        const orderIdsForFx = [...new Set(usdPayments.map(p => String(p.orderId)).filter(Boolean))];

        const ordersFx = orderIdsForFx.length
            ? await OrderModel.find({ _id: { $in: orderIdsForFx } })
                .select('_id bobPerUsd')
                .lean()
            : [];
        const fxByOrder = new Map(ordersFx.map(o => [String(o._id), Number(o.bobPerUsd || 0)]));

        const fallbackBobPerUsd = Number(process.env.FX_USD_BOB || process.env.BOB_PER_USD || 13);

        // Helpers
        const valOr = (a, b) => (a == null ? b : a);

        // 3) Conversión y agregado
        // Definir contenedores en función de group
        const makeSeries = () => {
            if (group === 'day') return {};              // clave: YYYY-MM-DD
            if (group === 'year') return {};             // clave: YYYY
            // por defecto month:
            return {
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
                6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
            };
        };

        const series = makeSeries();
        let totalSales = 0; // en moneda objetivo (currency)

        // Determinar rango de año activo (para compatibilidad mensual)
        const activeYear = qYear || new Date().getFullYear();

        for (const p of payments) {
            const amt = Number(valOr(p.capturedAmount?.value, p.amount?.value) || 0);
            const cur = (p.capturedAmount?.currency || p.amount?.currency || 'USD').toUpperCase();
            const d = p.updatedAt ? new Date(p.updatedAt) : null;
            if (!d || isNaN(d)) continue;

            // Conversión a moneda objetivo
            let valueInTarget = amt;

            if (currency === 'BOB') {
                // Si viene en USD → convertir a BOB con snapshot por orden o fallback
                if (cur === 'USD') {
                    const perOrderFx = fxByOrder.get(String(p.orderId)) || fallbackBobPerUsd;
                    valueInTarget = amt * perOrderFx;
                } else {
                    // Si viniera ya en BOB, dejamos igual
                    valueInTarget = amt;
                }
            } else if (currency === 'USD') {
                // Si viene en BOB → convertir a USD (usar snapshot si existe, si no, fallback)
                if (cur === 'USD') {
                    valueInTarget = amt;
                } else {
                    const perOrderFx = fxByOrder.get(String(p.orderId)) || fallbackBobPerUsd;
                    valueInTarget = perOrderFx ? (amt / perOrderFx) : 0;
                }
            } else {
                return next(ERR.VALIDATION({ currency: 'currency debe ser USD o BOB' }));
            }

            totalSales += valueInTarget;

            // Bucket según group
            if (group === 'year') {
                const y = d.getFullYear();
                series[y] = Number(series[y] || 0) + valueInTarget;
            } else if (group === 'day') {
                const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
                series[key] = Number(series[key] || 0) + valueInTarget;
            } else {
                // month (compatibilidad: solo sumamos si cae en activeYear)
                if (d.getFullYear() !== activeYear) continue;
                const m = d.getMonth(); // 0..11
                series[m] = Number(series[m] || 0) + valueInTarget;
            }
        }

        // 4) Respuesta: serie genérica y compatibilidad con monthlySales
        const toFixed2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

        const response = {
            error: false,
            success: true,
            currency,
            group,
            totalSales: toFixed2(totalSales),
            series: []
        };

        if (group === 'day') {
            // ordenar por fecha asc
            response.series = Object.keys(series).sort().map(k => ({ name: k, total: toFixed2(series[k]) }));
        } else if (group === 'year') {
            // ordenar por año asc
            response.series = Object.keys(series).sort((a, b) => Number(a) - Number(b))
                .map(k => ({ name: k, total: toFixed2(series[k]) }));
        } else {
            // month → mantener compatibilidad con tu UI (monthlySales con JAN..DEC)
            const monthLabels = ['JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthlySales = monthLabels.map((name, i) => ({
                name,
                TotalSales: toFixed2(series[i] || 0)
            }));
            response.series = monthlySales.map(m => ({ name: m.name, total: m.TotalSales }));
            response.monthlySales = monthlySales; // ← compatibilidad
            response.year = activeYear;
        }

        return res.ok(response);
    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || 'Error calculating total sales'));
    }
};

// GET /api/order/users?group=day|month|year&year=2025&from=YYYY-MM-DD&to=YYYY-MM-DD&metric=buyers|users&buyersOnly=true|false
export const totalUsersController = async (req, res, next) => {
    try {
        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === 'SUPER_ADMIN';
        const tenantStoreId = req.tenant?.storeId || null;

        const qYear = req.query.year ? parseInt(req.query.year, 10) : null;
        const from = req.query.from ? new Date(req.query.from) : null;
        const to = req.query.to ? new Date(req.query.to) : null;

        // NUEVO: agrupación y compatibilidad
        const group = (req.query.group || 'month').toLowerCase(); // day | month | year

        // Modo opcional: contar COMPRADORES efectivos
        const metricParam = String(req.query.metric || '').toLowerCase();
        const buyersOnly = metricParam === 'buyers'
            || String(req.query.buyersOnly || '').toLowerCase() === 'true'
            || String(req.query.buyersOnly || '') === '1';

        const activeYear = qYear || new Date().getFullYear();

        // Helpers
        const monthLabels = ['JAN', 'FEB', 'MAR', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthlyTemplate = () => monthLabels.map(name => ({ name, TotalUsers: 0 }));
        const toFixed0 = (n) => Math.max(0, Math.round(Number(n) || 0));

        // ─────────────────────────────────────────────────────────────
        //   MODO COMPRADORES: usuarios únicos con pagos efectivos
        // ─────────────────────────────────────────────────────────────
        if (buyersOnly) {
            const payFilter = {
                status: { $in: ['CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED'] }
            };
            if (!isSuperAdmin && tenantStoreId) payFilter.storeId = tenantStoreId;
            if ((from && !isNaN(from)) || (to && !isNaN(to))) {
                payFilter.updatedAt = {};
                if (from && !isNaN(from)) payFilter.updatedAt.$gte = from;
                if (to && !isNaN(to)) payFilter.updatedAt.$lte = to;
                if (!Object.keys(payFilter.updatedAt).length) delete payFilter.updatedAt;
            }

            // 1) Traer pagos relevantes
            const payments = await Payment
                .find(payFilter)
                .select('orderId updatedAt')
                .sort({ updatedAt: -1 })
                .lean();

            // 2) Mapear orderId -> userId
            const orderIds = [...new Set(payments.map(p => String(p.orderId)).filter(Boolean))];
            const orders = orderIds.length
                ? await OrderModel.find({ _id: { $in: orderIds } }).select('_id userId').lean()
                : [];
            const userByOrder = new Map(orders.map(o => [String(o._id), String(o.userId)]));

            // 3) Buckets por group
            const buckets = new Map(); // key -> Set<userId>

            const addToBucket = (key, userId) => {
                if (!userId) return;
                if (!buckets.has(key)) buckets.set(key, new Set());
                buckets.get(key).add(userId);
            };

            for (const p of payments) {
                const when = p.updatedAt ? new Date(p.updatedAt) : null;
                if (!when || isNaN(when)) continue;

                const userId = userByOrder.get(String(p.orderId));
                if (!userId) continue;

                if (group === 'year') {
                    const y = when.getFullYear();
                    addToBucket(String(y), userId);
                } else if (group === 'day') {
                    const key = when.toISOString().slice(0, 10); // YYYY-MM-DD
                    addToBucket(key, userId);
                } else {
                    // month: compat → solo el año activo
                    if (when.getFullYear() !== activeYear) continue;
                    const m = when.getMonth(); // 0..11
                    addToBucket(String(m), userId);
                }
            }

            // 4) Respuesta
            if (group === 'year') {
                const series = [...buckets.keys()].sort((a, b) => Number(a) - Number(b))
                    .map(k => ({ name: k, total: buckets.get(k).size }));
                return res.ok({ error: false, success: true, buyersOnly: true, group: 'year', series });
            }

            if (group === 'day') {
                const series = [...buckets.keys()].sort()
                    .map(k => ({ name: k, total: buckets.get(k).size }));
                return res.ok({ error: false, success: true, buyersOnly: true, group: 'day', series });
            }

            // month (compatibilidad con dashboard)
            const monthlyUsers = monthlyTemplate();
            for (let i = 0; i < 12; i++) {
                const setForMonth = buckets.get(String(i));
                monthlyUsers[i].TotalUsers = toFixed0(setForMonth ? setForMonth.size : 0);
            }
            const series = monthlyUsers.map(m => ({ name: m.name, total: m.TotalUsers }));
            return res.ok({ error: false, success: true, buyersOnly: true, group: 'month', year: activeYear, TotalUsers: monthlyUsers, series });
        }

        // ─────────────────────────────────────────────────────────────
        //   MODO USUARIOS CREADOS (original) con group flexible
        // ─────────────────────────────────────────────────────────────
        const match = {};
        if (!isSuperAdmin && tenantStoreId) {
            // si tu schema no tiene memberships en todos los usuarios, este filtro es no-op
            match['memberships.storeId'] = tenantStoreId;
        }
        if ((from && !isNaN(from)) || (to && !isNaN(to))) {
            match.createdAt = {};
            if (from && !isNaN(from)) match.createdAt.$gte = from;
            if (to && !isNaN(to)) match.createdAt.$lte = to;
            if (!Object.keys(match.createdAt).length) delete match.createdAt;
        }

        // Proyección de group
        const groupId = (() => {
            if (group === 'year') return { year: { $year: '$createdAt' } };
            if (group === 'day') return { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } };
            // month (por defecto)
            return { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        })();

        const pipeline = [
            Object.keys(match).length ? { $match: match } : null,
            { $group: { _id: groupId, count: { $sum: 1 } } },
            {
                $sort: group === 'day'
                    ? { '_id.day': 1 }
                    : (group === 'year' ? { '_id.year': 1 } : { '_id.year': 1, '_id.month': 1 })
            }
        ].filter(Boolean);

        const agg = await UserModel.aggregate(pipeline);

        if (group === 'year') {
            const series = agg.map(r => ({ name: String(r._id.year), total: toFixed0(r.count) }));
            return res.ok({ error: false, success: true, group: 'year', series });
        }

        if (group === 'day') {
            const series = agg.map(r => ({ name: r._id.day, total: toFixed0(r.count) }));
            return res.ok({ error: false, success: true, group: 'day', series });
        }

        // month (compatibilidad con dashboard actual)
        const monthlyUsers = monthlyTemplate();
        for (const row of agg) {
            const y = row?._id?.year;
            const m = row?._id?.month; // 1..12
            if (!y || !m || y !== activeYear) continue;
            const idx = m - 1;
            if (idx >= 0 && idx <= 11) monthlyUsers[idx].TotalUsers = toFixed0(row.count);
        }
        const series = monthlyUsers.map(m => ({ name: m.name, total: m.TotalUsers }));
        return res.ok({ error: false, success: true, group: 'month', year: activeYear, TotalUsers: monthlyUsers, series });

    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || 'Error calculating total users'));
    }
};


// DELETE /api/order/:id
export async function deleteOrder(req, res, next) {
    try {
        const { id } = req.params;
        if (!id) throw ERR.VALIDATION({ id: 'requerido' });

        const isSuperAdmin = req.user?.isSuper === true || req.user?.role === 'SUPER_ADMIN';
        const tenantStoreId = req.tenant?.storeId;

        const scope = isSuperAdmin
            ? { _id: id }
            : (tenantStoreId
                ? { _id: id, $or: [{ storeId: tenantStoreId }, { 'products.storeId': tenantStoreId }] }
                : { _id: id });

        const order = await OrderModel.findOne(scope);
        if (!order) throw ERR.NOT_FOUND('Order Not found');

        // ❌ Bloquear si hay pagos cobrados/relacionados
        const payFilter = { orderId: order._id };
        if (!isSuperAdmin && tenantStoreId) payFilter.storeId = tenantStoreId;

        const payments = await Payment.find(payFilter)
            .select('status provider providerPaymentId')
            .lean();

        if (payments.length) {
            const blocking = payments.filter(p =>
                ['CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(p.status)
            );
            if (blocking.length) {
                const summary = blocking.map(p => `${p.provider}:${p.status}`).join(', ');
                throw ERR.CONFLICT(
                    `Order cannot be deleted: payments present (${summary}). Realiza reembolsos/cierre antes de borrar.`
                );
            }

            const inProgress = payments.filter(p =>
                !['FAILED', 'CANCELED'].includes(p.status)
            );
            if (inProgress.length) {
                const summary = inProgress.map(p => `${p.provider}:${p.status}`).join(', ');
                throw ERR.CONFLICT(
                    `Order cannot be deleted: payment(s) in progress (${summary}). Cancela o falla el pago primero.`
                );
            }
            // Si llegamos aquí: solo hay FAILED/CANCELED → permitir borrar
        }

        // Extra: también impedimos borrar entregadas (operativo)
        const statusNow = String(order.order_status || order.status || '').toLowerCase();
        if (statusNow === 'delivered') {
            throw ERR.CONFLICT('Order cannot be deleted because it is delivered.');
        }

        // 🧩 Restock defensivo
        try {
            for (const line of order.products || []) {
                const pid = line.productId;
                const qty = Number(line.quantity || 0);
                if (!pid || !qty) continue;

                const prod = await ProductModel.findById(pid).lean();
                if (prod) {
                    const nextCount = Math.max(0, Number(prod.countInStock || 0) + qty);
                    await ProductModel.findByIdAndUpdate(
                        pid,
                        { countInStock: nextCount, sale: Math.max(0, Number(prod.sale || 0) - qty) },
                        { new: true }
                    );
                }
            }
        } catch (invErr) {
            console.error('Restock on delete error:', invErr?.message || invErr);
        }

        await OrderModel.deleteOne({ _id: order._id });

        return res.ok({ success: true, error: false, message: 'Order Deleted!' });
    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || 'Error deleting order'));
    }
}

// CANCEL MY ORDER (cliente cancela su propio pedido)
const CANCEL_WINDOW_MS = 30 * 60 * 1000; // 30 minutos

export const cancelMyOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const order = await OrderModel.findById(id);
        if (!order) return next(ERR.NOT_FOUND("Orden no encontrada"));
        if (String(order.userId) !== String(userId)) {
            return next(ERR.TENANT_FORBIDDEN());
        }

        const status = (order.order_status || "").toLowerCase();
        if (["delivered", "cancelled", "shipped"].includes(status)) {
            return next(ERR.VALIDATION({ status: "Este pedido ya no puede ser cancelado" }));
        }

        // Reglas segun metodo de envio
        const method = order.shippingMethod || "MTZSTORE_STANDARD";

        if (method === "MTZSTORE_EXPRESS") {
            // Express: solo cancelable si DeliveryTask no fue tomada
            const task = await DeliveryTask.findOne({ orderId: order._id }).lean();
            if (task && task.status !== "PENDING") {
                return next(ERR.VALIDATION({
                    status: "Tu pedido Express ya fue tomado por un repartidor y no puede ser cancelado"
                }));
            }
            // Cancelar la DeliveryTask si existe en PENDING
            if (task) {
                await DeliveryTask.updateOne(
                    { _id: task._id },
                    {
                        $set: { status: "CANCELLED" },
                        $push: { timeline: { type: "CANCELLED", by: userId, note: "Cancelado por el cliente", at: new Date() } }
                    }
                );
            }
        } else {
            // Standard/Store: cancelable dentro de 30 minutos
            const elapsed = Date.now() - new Date(order.createdAt).getTime();
            if (elapsed > CANCEL_WINDOW_MS) {
                return next(ERR.VALIDATION({
                    status: "El tiempo para cancelar este pedido ha expirado (30 minutos)"
                }));
            }
        }

        // Restaurar stock (al campo correcto según método de envío)
        try {
            const orderMethod = order.shippingMethod || "MTZSTORE_STANDARD";
            const isMtz = ["MTZSTORE_EXPRESS", "MTZSTORE_STANDARD"].includes(orderMethod);
            const restoreField = isMtz ? "warehouseStock" : "countInStock";

            for (const line of order.products || []) {
                const pid = line.productId;
                const qty = Number(line.quantity || 0);
                if (!pid || !qty) continue;

                if (line.productType === "VARIANT" && line.variantId) {
                    const variantField = isMtz ? "warehouseStock" : "stock";
                    await ProductVariantModel.findByIdAndUpdate(line.variantId, {
                        $inc: { [variantField]: qty, sale: -qty }
                    });
                } else {
                    await ProductModel.findByIdAndUpdate(pid, {
                        $inc: { [restoreField]: qty, sale: -qty }
                    });
                }
            }
        } catch (invErr) {
            console.error("[cancelMyOrder] Stock revert error:", invErr?.message);
        }

        // Actualizar estado de la orden
        order.order_status = "cancelled";
        await order.save();

        // Enviar email de cancelacion
        try {
            const user = await UserModel.findById(userId).select("name email").lean();
            if (user?.email) {
                const orderId = String(order._id);
                const html = OrderCancelEmail({
                    customerName: user.name,
                    orderIdShort: orderId.slice(-8),
                    totalBob: order.totalBob,
                    products: order.products,
                    reason: "Cancelado por el cliente",
                });
                await sendEmailFun({
                    sendTo: user.email,
                    subject: `Pedido #${orderId.slice(-8)} cancelado – MTZstore`,
                    html,
                });
            }
        } catch (emailErr) {
            console.warn("[cancelMyOrder] Email error:", emailErr?.message);
        }

        return res.ok({ success: true, error: false, message: "Pedido cancelado exitosamente" });
    } catch (e) {
        return next(e?.status ? e : ERR.SERVER(e?.message || "Error al cancelar pedido"));
    }
};

