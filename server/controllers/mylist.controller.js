
import mongoose from "mongoose";
import MyListModel from '../models/myList.model.js';
import ProductModel from '../models/product.model.js';
import { getBobToUsdRate } from "../services/binanceService.js";
import { ERR } from '../utils/httpError.js';

// ------------------------------------------------------------------
// ADD
// ------------------------------------------------------------------
export const addToMyListController = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) throw ERR.UNAUTHORIZED("Unauthorized");

        const storeId = req.tenant?.storeId || req.storeId || null;

        const {
            productId,
            productTitle,
            image,
            rating,
            brand,
            discount
            // ❌ price/oldPrice no se toman del cliente
        } = req.body;

        if (!productId) throw ERR.VALIDATION({ productId: "required" });

        // Producto canónico
        const product = await ProductModel.findById(productId).lean();
        if (!product) throw ERR.NOT_FOUND("Product not found");

        // Validar consistencia de tienda
        if (storeId && product.storeId && String(product.storeId) !== String(storeId)) {
            throw ERR.FORBIDDEN("Product does not belong to the active store");
        }

        // Evitar duplicados por usuario/producto/tienda
        const duplicateFilter = {
            userId: new mongoose.Types.ObjectId(userId),
            productId: new mongoose.Types.ObjectId(productId),
            storeId: storeId ? new mongoose.Types.ObjectId(storeId) : null
        };
        const exists = await MyListModel.findOne(duplicateFilter).lean();
        if (exists) throw ERR.CONFLICT("Item already in my list");

        // Campos canónicos con fallback (compatibilidad)
        const basePrice = Number(product.basePrice ?? product.price ?? 0);
        const oldBasePrice = Number(product.oldBasePrice ?? product.oldPrice ?? 0);
        const baseCurrency = String(product.baseCurrency ?? product.currency ?? "USD").toUpperCase();

        const ratingNum = Number.isFinite(Number(rating)) ? Number(rating) : Number(product.rating ?? 0);
        const discountNum = Number.isFinite(Number(discount)) ? Number(discount) : Number(product.discount ?? 0);

        const doc = {
            productId: new mongoose.Types.ObjectId(productId),
            userId: new mongoose.Types.ObjectId(userId),
            storeId: storeId ? new mongoose.Types.ObjectId(storeId) : null,
            productTitle: productTitle ?? product.name ?? "",
            image: image ?? product.images?.[0] ?? "",
            rating: ratingNum,
            price: basePrice,
            oldPrice: oldBasePrice,
            currency: baseCurrency, // USD o BOB
            brand: brand ?? product.brand ?? "",
            discount: discountNum
        };

        await MyListModel.create(doc);

        // Mantengo tu mensaje original
        return res.created({ message: "The product saved in the my list" });
    } catch (e) {
        if (e?.code === 11000) return next(ERR.CONFLICT("Item already in my list"));
        return next(e);
    }
};

// ------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------
export const deleteToMyListController = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) throw ERR.UNAUTHORIZED("Unauthorized");

        const { id } = req.params;
        if (!id) throw ERR.VALIDATION({ id: "required" });
        if (!mongoose.Types.ObjectId.isValid(id)) throw ERR.VALIDATION({ id: "invalid" });

        const storeId = req.tenant?.storeId || req.storeId || null;

        const baseFilter = {
            _id: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        };

        if (storeId) {
            baseFilter.storeId = new mongoose.Types.ObjectId(storeId);
        } else {
            baseFilter.$or = [{ storeId: null }, { storeId: { $exists: false } }];
        }

        const myListItem = await MyListModel.findOne(baseFilter);
        if (!myListItem) throw ERR.NOT_FOUND("The item with this given id was not found");

        const result = await MyListModel.deleteOne({ _id: myListItem._id, userId: myListItem.userId });
        if (result.deletedCount !== 1) throw ERR.NOT_FOUND("The item is not deleted");

        return res.ok({ message: "The item removed from My List", deletedId: id });
    } catch (e) { return next(e); }
};

// ------------------------------------------------------------------
// GET
// ------------------------------------------------------------------
export const getMyListController = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) throw ERR.UNAUTHORIZED("Unauthorized");

        const viewerCurrency = (req.query.currency || "").toUpperCase(); // "USD" | "BOB" | ""
        const storeId = req.tenant?.storeId || req.storeId || null;

        const filter = { userId };
        if (storeId) {
            filter.storeId = storeId;
        } else {
            filter.$or = [{ storeId: null }, { storeId: { $exists: false } }];
        }

        const myListItems = await MyListModel.find(filter).sort({ createdAt: -1 }).lean();

        // Sin currency solicitada → devolver tal cual
        if (viewerCurrency !== "USD" && viewerCurrency !== "BOB") {
            return res.ok({ data: myListItems });
        }

        // fx USDT/BOB (BOB por 1 USDT ≈ USD)
        let rate = null;
        try {
            const r = await getBobToUsdRate();
            if (Number.isFinite(r) && r > 0) rate = r;
        } catch { rate = null; }

        const mapped = myListItems.map((obj) => {
            const baseCur = String(obj.currency || "USD").toUpperCase();
            const p = Number(obj.price) || 0;
            const o = Number(obj.oldPrice) || 0;

            let priceUsd = null, oldPriceUsd = null, priceBob = null, oldPriceBob = null;

            if (baseCur === "USD") {
                priceUsd = +p.toFixed(2);
                oldPriceUsd = +o.toFixed(2);
                if (rate) {
                    priceBob = +(p * rate).toFixed(2);
                    oldPriceBob = +(o * rate).toFixed(2);
                }
            } else {
                priceBob = +p.toFixed(2);
                oldPriceBob = +o.toFixed(2);
                if (rate) {
                    priceUsd = +(p / rate).toFixed(2);
                    oldPriceUsd = +(o / rate).toFixed(2);
                }
            }

            const displayCurrency = viewerCurrency;
            const displayPrice = viewerCurrency === "USD" ? (priceUsd ?? null) : (priceBob ?? null);
            const displayOldPrice = viewerCurrency === "USD" ? (oldPriceUsd ?? null) : (oldPriceBob ?? null);

            const out = {
                ...obj,
                priceUsd,
                oldPriceUsd,
                priceBob,
                oldPriceBob,
                displayCurrency,
                displayPrice,
                displayOldPrice
            };

            if (rate) out.fx = { pair: "USDT/BOB", rate };
            return out;
        });

        return res.ok({ currency: viewerCurrency, data: mapped });
    } catch (e) { return next(e); }
};
