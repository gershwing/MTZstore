// server/controllers/cart.controller.js
import CartProductModel from "../models/cartProduct.model.js";
import ProductModel from "../models/product.model.js";
import ProductVariantModel from "../models/productVariant.model.js";
import { ERR } from "../utils/httpError.js";
import { enrichProductsWithFx } from "../services/fx.service.js";

/* ======================================================
   HELPERS
====================================================== */
const toNumber = (v, d = 0) =>
    Number.isFinite(Number(v)) ? Number(v) : d;

const round2 = (n) =>
    Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/* ======================================================
   ADD TO CART (VARIANT-CÉNTRICO)
====================================================== */
export const addToCartItemController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tenantStoreId = req.tenant?.storeId || null;

        const {
            productId,
            variantId = null,
            quantity,
            qty,

            // snapshots opcionales (front)
            productTitle,
            image,
            rating,
            brand,
            size,
            weight,
            ram,
            discount,
            variantAttrs,
            price: frontendPrice,
        } = req.body;

        if (!productId) throw ERR.VALIDATION({ productId: "requerido" });

        // 1) Producto base (incluir campos de impuestos y margen)
        const product = await ProductModel.findById(productId).select(
            "storeId name images brand rating countInStock basePrice baseCurrency marginPct salesConfig"
        );
        if (!product) throw ERR.NOT_FOUND("Producto no encontrado");

        if (tenantStoreId && String(product.storeId) !== String(tenantStoreId)) {
            throw ERR.FORBIDDEN("El producto no pertenece a la tienda actual");
        }

        // 2) Resolver cantidad
        const qtyInput = qty ?? quantity;
        const finalQty = Math.max(1, toNumber(qtyInput, 1));

        // 3) Resolver SIMPLE vs VARIANT
        let productType = "SIMPLE";
        let unitPrice = toNumber(product.basePrice, 0);
        let currency = product.baseCurrency || "BOB";
        let stockSnapshot = toNumber(product.countInStock, 0);

        let variant = null;

        if (variantId) {
            productType = "VARIANT";

            variant = await ProductVariantModel.findById(variantId).lean();
            if (!variant) throw ERR.NOT_FOUND("Variante no encontrada");

            if (String(variant.productId) !== String(product._id)) {
                throw ERR.CONFLICT("La variante no pertenece al producto");
            }

            unitPrice = toNumber(variant.price, 0);
            currency = variant.currency || currency;
            stockSnapshot = toNumber(variant.countInStock, 0);
        }

        // (opcional) bloqueo por stock snapshot
        // if (stockSnapshot > 0 && finalQty > stockSnapshot) {
        //   throw ERR.CONFLICT("Cantidad supera el stock disponible");
        // }

        // 4) Evitar duplicados (user + product + variant + store)
        const duplicateFilter = {
            userId,
            productId,
            variantId: variantId || null,
            ...(tenantStoreId && { storeId: tenantStoreId }),
        };

        const existing = await CartProductModel.findOne(duplicateFilter);
        if (existing) throw ERR.CONFLICT("Item already in cart");

        // 5) Convertir precio a BOB
        // El frontend envía price ya convertido a BOB (via ProductDetailsComponent)
        let priceBob;
        if (frontendPrice && toNumber(frontendPrice, 0) > 0) {
            // Usar el precio del frontend (ya en BOB)
            priceBob = round2(toNumber(frontendPrice, 0));
        } else if (String(currency).toUpperCase() === "USD") {
            // Fallback: convertir server-side
            const [enriched] = await enrichProductsWithFx([product]);
            if (enriched?.priceBob > 0) {
                if (variant) {
                    const basePriceNum = toNumber(product.basePrice, 0);
                    const factor = basePriceNum > 0 ? (enriched.priceBob / basePriceNum) : 1;
                    priceBob = round2(unitPrice * factor);
                } else {
                    priceBob = enriched.priceBob;
                }
            } else {
                priceBob = unitPrice;
            }
        } else {
            priceBob = unitPrice;
        }

        // 6) Extraer configuración de impuestos del producto
        const taxConfig = product.salesConfig?.taxConfig || {};
        const ivaPct = toNumber(taxConfig.ivaPct, 0);
        const ivaEnabled = !!taxConfig.ivaEnabled;
        const itPct = toNumber(taxConfig.otherTaxesPct, 0);
        const itEnabled = !!taxConfig.itEnabled;

        // 7) Construir item
        const cartItem = new CartProductModel({
            /* SNAPSHOT VISUAL */
            productTitle: productTitle || product.name,
            image: image || product.images?.[0] || "",
            rating: typeof rating === "number" ? rating : product.rating || 0,
            brand: brand || product.brand || "",

            /* REFERENCIAS */
            productId: product._id,
            variantId: variant ? variant._id : null,
            productType,

            /* SNAPSHOT ATRIBUTOS (INFO) */
            size: size || variant?.size || "",
            weight: weight || variant?.weight || "",
            ram: ram || variant?.ram || "",
            variantAttrs: variantAttrs || variant?.attributes || {},

            /* PRECIO (siempre en BOB) */
            price: priceBob,
            currency: "BOB",
            oldPrice: variant?.oldPrice || 0,
            discount: discount || 0,

            /* IMPUESTOS SNAPSHOT */
            ivaPct,
            ivaEnabled,
            itPct,
            itEnabled,

            /* CANTIDAD */
            quantity: finalQty,
            subTotal: round2(priceBob * finalQty),

            /* STOCK SNAPSHOT */
            stockSnapshot,

            /* MULTI-TENANT / USER */
            storeId: product.storeId || tenantStoreId || null,
            userId,
        });

        const saved = await cartItem.save();
        return res.created(saved);
    } catch (e) {
        return next(e);
    }
};

/* ======================================================
   GET CART
====================================================== */
export const getCartItemController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tenantStoreId = req.tenant?.storeId || null;

        const filter = { userId, ...(tenantStoreId && { storeId: tenantStoreId }) };
        const cartItems = await CartProductModel.find(filter).sort({ createdAt: -1 });

        return res.ok(cartItems);
    } catch (e) {
        return next(e);
    }
};

/* ======================================================
   UPDATE QTY (NO CAMBIA VARIANTE)
====================================================== */
export const updateCartItemQtyController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tenantStoreId = req.tenant?.storeId || null;
        const { _id, qty } = req.body;

        if (!_id || qty == null) {
            throw ERR.VALIDATION({ _id: "requerido", qty: "requerido" });
        }

        const safeQty = Math.max(1, Number(qty) || 1);

        const filter = { _id, userId, ...(tenantStoreId && { storeId: tenantStoreId }) };
        const cartItem = await CartProductModel.findOne(filter);
        if (!cartItem) throw ERR.NOT_FOUND("Cart item not found");

        const maxQty =
            typeof cartItem.stockSnapshot === "number" && cartItem.stockSnapshot > 0
                ? cartItem.stockSnapshot
                : safeQty;

        const finalQty = Math.min(safeQty, maxQty);
        const newSubTotal = round2(Number(cartItem.price || 0) * finalQty);

        const updated = await CartProductModel.findOneAndUpdate(
            filter,
            { $set: { quantity: finalQty, subTotal: newSubTotal } },
            { new: true }
        );

        return res.ok(updated);
    } catch (e) {
        return next(e);
    }
};

/* ======================================================
   DELETE ITEM
====================================================== */
export const deleteCartItemQtyController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tenantStoreId = req.tenant?.storeId || null;
        const { id } = req.params;

        if (!id) throw ERR.VALIDATION({ id: "requerido" });

        const filter = { _id: id, userId, ...(tenantStoreId && { storeId: tenantStoreId }) };
        const deleted = await CartProductModel.findOneAndDelete(filter);
        if (!deleted) throw ERR.NOT_FOUND("The product in the cart is not found");

        return res.ok({ _id: deleted._id, message: "Item removed" });
    } catch (e) {
        return next(e);
    }
};

/* ======================================================
   EMPTY CART
====================================================== */
export const emptyCartController = async (req, res, next) => {
    try {
        const userId = req.userId;
        const tenantStoreId = req.tenant?.storeId || null;
        const allStores = req.query.allStores === "1";

        if (!userId) throw ERR.UNAUTHORIZED("Unauthorized");

        const filter = { userId };
        if (tenantStoreId && !allStores) filter.storeId = tenantStoreId;

        const result = await CartProductModel.deleteMany(filter);

        return res.ok({
            deleted: result?.deletedCount ?? 0,
            scope: tenantStoreId && !allStores ? "store" : "all",
        });
    } catch (e) {
        return next(e);
    }
};
