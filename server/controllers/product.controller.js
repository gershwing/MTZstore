import ProductModel from "../models/product.model.js";
import ProductVariantModel from "../models/productVariant.model.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { ERR } from "../utils/httpError.js";
import { tenantFilter } from "../utils/tenant.js";

import { enrichProductsWithFx } from "../services/fx.service.js";
import { getBobToUsdRate } from "../services/binanceService.js";
import { getInheritedCategoryAttributes } from "../services/categoryAttributes.service.js";
import StoreModel from "../models/store.model.js";
import { validateCategoryBelongsToStore } from "../services/categoryValidation.service.js";

/* ======================================================
   CLOUDINARY
====================================================== */
cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

/* ======================================================
   HELPERS
====================================================== */
async function uploadAndCleanup(file, options = {}) {
    if (!file?.path) throw ERR.VALIDATION("Archivo inválido");
    try {
        const { secure_url } = await cloudinary.uploader.upload(file.path, options);
        return secure_url;
    } finally {
        try { fs.unlinkSync(file.path); } catch { }
    }
}

/* ======================================================
   IMAGE UPLOADS
====================================================== */
export async function uploadImages(req, res, next) {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) throw ERR.VALIDATION("No files");
        const urls = await Promise.all(files.map(f => uploadAndCleanup(f)));
        return res.ok({ images: urls });
    } catch (e) { next(e); }
}

export async function uploadBannerImages(req, res, next) {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) throw ERR.VALIDATION("No files");
        const urls = await Promise.all(files.map(f => uploadAndCleanup(f)));
        return res.ok({ images: urls });
    } catch (e) { next(e); }
}

/* ======================================================
   PRODUCT (BASE)
====================================================== */
export async function createProduct(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId || null;
        const isSuperAdmin = req?.tenant?.role === 'SUPER_ADMIN' || req?.user?.isSuper;

        // Tiendas deben tener storeId; SUPER_ADMIN puede crear sin él
        if (!storeId && !isSuperAdmin) throw ERR.VALIDATION("storeId requerido");

        const { category } = req.body;
        if (!category) throw ERR.VALIDATION("category requerida");

        // Validar que la categoría pertenece al rubro de la tienda
        if (!isSuperAdmin && storeId) {
            const store = req.store || await StoreModel.findById(storeId).select('categoryId').lean();
            if (store?.categoryId) {
                const isValid = await validateCategoryBelongsToStore(category, store.categoryId);
                if (!isValid) {
                    throw ERR.VALIDATION("La categoría seleccionada no pertenece al rubro de tu tienda");
                }
            }
        }

        const attributes = await getInheritedCategoryAttributes(req, category);

        const providedAttributes = req.body.attributes || {};
        const missingRequired = attributes.filter(
            a => a.required && !a.variant && providedAttributes[a.code] == null
        );

        if (missingRequired.length) {
            throw ERR.VALIDATION(
                `Faltan atributos obligatorios: ${missingRequired.map(a => a.name).join(", ")}`
            );
        }

        const hasVariants = attributes.some(a => a.variant === true);

        const productData = {
            storeId,
            name: req.body.name?.trim(),
            description: req.body.description?.trim(),
            brand: req.body.brand?.trim(),
            images: req.body.images || [],
            bannerimages: req.body.bannerimages || [],
            bannerTitleName: req.body.bannerTitleName?.trim(),
            isDisplayOnHomeBanner: Boolean(req.body.isDisplayOnHomeBanner),
            isFeatured: Boolean(req.body.isFeatured),
            category,
            productType: hasVariants ? "VARIANT" : "SIMPLE",
            basePrice: Number(req.body.basePrice) || 0,
            wholesaleEnabled: Boolean(req.body.wholesaleEnabled),
            wholesalePrice: Number(req.body.wholesalePrice) || 0,
            oldBasePrice: Number(req.body.oldBasePrice) || 0,
            baseCurrency: req.body.baseCurrency === "BOB" ? "BOB" : "USD",
            discount: Number(req.body.discount) || 0,
            countInStock: Number(req.body.countInStock) || 0,
            stockMinimo: Number(req.body.stockMinimo) || 0,
            entryDate: req.body.entryDate || null,
            entryType: req.body.entryType || "",
            entryReference: req.body.entryReference?.trim() || "",
            marginPct: Math.max(0, Math.min(500, Number(req.body.marginPct) || 0)),
            details: Array.isArray(req.body.details)
                ? req.body.details.filter(d => d.key?.trim())
                : [],
            shippedBy: req.body.shippedBy || "STORE",
            shipping: req.body.shipping || { mtzExpress: false, mtzStandard: false, storeExpress: false, storeStandard: true, storeSelf: true },
            dimensions: req.body.dimensions || { weight: 0, length: 0, width: 0, height: 0 },
            attributes: req.body.attributes || {},
        };

        // Wholesale tiers (precios por mayor para ventas online)
        if (req.body.wholesaleTiers) {
            productData.wholesaleTiers = req.body.wholesaleTiers;
        }

        // Importation: importCode para todos, campos completos para SUPER_ADMIN
        if (req.body.importation) {
            if (isSuperAdmin) {
                productData.importation = req.body.importation;
            } else if (req.body.importation.importCode) {
                productData.importation = { importCode: req.body.importation.importCode };
            }
        }

        // Configuración de venta (todos los vendedores)
        if (req.body.salesConfig?.enableSalesConfig) {
            productData.salesConfig = req.body.salesConfig;
        }

        const product = await ProductModel.create(productData);

        // Save variants if present
        const incomingVariants = Array.isArray(req.body.variants) ? req.body.variants : [];
        let savedVariants = [];
        if (incomingVariants.length > 0) {
            const variantDocs = incomingVariants.map(v => ({
                productId: product._id,
                attributes: v.attributes || {},
                sku: v.sku || "",
                price: Number(v.price) || product.basePrice || 0,
                wholesalePrice: Number(v.wholesalePrice) || 0,
                stock: Number(v.stock) || 0,
                images: v.images || [],
                isActive: v.status !== "inactive",
            }));
            savedVariants = await ProductVariantModel.insertMany(variantDocs);
        }

        const [enriched] = await enrichProductsWithFx([product]);

        return res.created({
            product: enriched,
            variants: savedVariants,
            meta: {
                productType: product.productType,
                variantAttributes: attributes.filter(a => a.variant),
                allAttributes: attributes,
            },
        });
    } catch (e) { next(e); }
}

export async function updateProduct(req, res, next) {
    try {
        const isSuperAdmin = req?.tenant?.role === 'SUPER_ADMIN' || req?.user?.isSuper;

        const updateData = {
            name: req.body.name?.trim(),
            description: req.body.description?.trim(),
            brand: req.body.brand?.trim(),
            images: req.body.images || [],
            bannerimages: req.body.bannerimages || [],
            bannerTitleName: req.body.bannerTitleName?.trim(),
            isDisplayOnHomeBanner: Boolean(req.body.isDisplayOnHomeBanner),
            isFeatured: Boolean(req.body.isFeatured),
            basePrice: Number(req.body.basePrice) || 0,
            wholesaleEnabled: Boolean(req.body.wholesaleEnabled),
            wholesalePrice: Number(req.body.wholesalePrice) || 0,
            oldBasePrice: Number(req.body.oldBasePrice) || 0,
            baseCurrency: req.body.baseCurrency === "BOB" ? "BOB" : "USD",
            discount: Number(req.body.discount) || 0,
            countInStock: Number(req.body.countInStock) || 0,
            stockMinimo: Number(req.body.stockMinimo) || 0,
            entryDate: req.body.entryDate || null,
            entryType: req.body.entryType || "",
            entryReference: req.body.entryReference?.trim() || "",
            marginPct: Math.max(0, Math.min(500, Number(req.body.marginPct) || 0)),
            details: Array.isArray(req.body.details)
                ? req.body.details.filter(d => d.key?.trim())
                : [],
            shippedBy: req.body.shippedBy || "STORE",
            shipping: req.body.shipping || undefined,
            dimensions: req.body.dimensions || undefined,
            attributes: req.body.attributes || {},
        };

        // Wholesale tiers (precios por mayor para ventas online)
        if (req.body.wholesaleTiers !== undefined) {
            updateData.wholesaleTiers = req.body.wholesaleTiers;
        }

        // Importation: importCode para todos, campos completos para SUPER_ADMIN
        if (req.body.importation !== undefined) {
            if (isSuperAdmin) {
                updateData.importation = req.body.importation;
            } else if (req.body.importation?.importCode !== undefined) {
                updateData["importation.importCode"] = req.body.importation.importCode;
            }
        }

        // Configuración de venta (todos los vendedores)
        if (req.body.salesConfig !== undefined) {
            updateData.salesConfig = req.body.salesConfig;
        }

        const updated = await ProductModel.findOneAndUpdate(
            { _id: req.params.id, ...tenantFilter(req, {}) },
            { $set: updateData },
            { new: true }
        );

        if (!updated) throw ERR.NOT_FOUND("Producto no encontrado");

        // Sync variants if present in payload
        const incomingVariants = Array.isArray(req.body.variants) ? req.body.variants : [];
        let savedVariants = [];
        if (incomingVariants.length > 0) {
            // Remove old variants and insert new ones
            await ProductVariantModel.deleteMany({ productId: updated._id });
            const variantDocs = incomingVariants.map(v => ({
                productId: updated._id,
                attributes: v.attributes || {},
                sku: v.sku || "",
                price: Number(v.price) || updated.basePrice || 0,
                stock: Number(v.stock) || 0,
                images: v.images || [],
                isActive: v.status !== "inactive",
            }));
            savedVariants = await ProductVariantModel.insertMany(variantDocs);
        }

        return res.ok({ product: updated, variants: savedVariants });
    } catch (e) { next(e); }
}

export async function deleteProduct(req, res, next) {
    try {
        const deleted = await ProductModel.findOneAndDelete({
            _id: req.params.id,
            ...tenantFilter(req, {}),
        });

        if (!deleted) throw ERR.NOT_FOUND("Producto no encontrado");
        return res.ok({ message: "Producto eliminado" });
    } catch (e) { next(e); }
}

export async function getProductById(req, res, next) {
    try {
        const product = await ProductModel.findOne({
            _id: req.params.id,
            ...tenantFilter(req, {}),
        }).lean();

        if (!product) throw ERR.NOT_FOUND("Product not found");

        const variants = await ProductVariantModel.find({
            productId: product._id,
            isActive: true,
        }).lean();

        const [enriched] = await enrichProductsWithFx([product]);

        try { res.set("Cache-Control", "no-store"); } catch {}
        return res.ok({ product: enriched, variants });
    } catch (e) { next(e); }
}

/* ======================================================
   PRODUCT VARIANTS
====================================================== */
export async function createProductVariant(req, res, next) {
    try {
        const storeId = req?.tenant?.storeId;
        const productId = req.params.productId;

        if (!storeId) throw ERR.VALIDATION("storeId requerido");
        if (!productId) throw ERR.VALIDATION("productId requerido");

        const product = await ProductModel.findOne({
            _id: productId,
            ...tenantFilter(req, {}),
        });

        if (!product) throw ERR.NOT_FOUND("Producto no encontrado");
        if (product.productType !== "VARIANT") {
            throw ERR.VALIDATION("Producto SIMPLE no admite variantes");
        }

        const attributes = await getInheritedCategoryAttributes(req, product.category);
        const variantDefs = attributes.filter(a => a.variant);

        const provided = req.body.attributes;
        if (!Array.isArray(provided)) {
            throw ERR.VALIDATION("attributes debe ser un array");
        }

        const expectedCodes = variantDefs.map(a => a.code);
        const providedCodes = provided.map(a => a.code);

        const missing = expectedCodes.filter(c => !providedCodes.includes(c));
        if (missing.length) {
            throw ERR.VALIDATION(`Faltan atributos: ${missing.join(", ")}`);
        }

        const extra = providedCodes.filter(c => !expectedCodes.includes(c));
        if (extra.length) {
            throw ERR.VALIDATION(`Atributos inválidos: ${extra.join(", ")}`);
        }

        const variant = await ProductVariantModel.create({
            productId,
            storeId,
            attributes: provided,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            sku: req.body.sku,
            isActive: true,
        });

        return res.created({ variant });
    } catch (e) {
        if (e?.code === 11000) {
            return next(ERR.VALIDATION("Variante duplicada"));
        }
        next(e);
    }
}

export async function getProductVariants(req, res, next) {
    try {
        const variants = await ProductVariantModel.find({
            productId: req.params.productId,
            ...tenantFilter(req, {}),
        });

        return res.ok({ variants });
    } catch (e) { next(e); }
}

export async function updateProductVariant(req, res, next) {
    try {
        const variant = await ProductVariantModel.findOneAndUpdate(
            { _id: req.params.id, ...tenantFilter(req, {}) },
            {
                price: Number(req.body.price),
                stock: Number(req.body.stock),
                sku: req.body.sku,
                isActive: Boolean(req.body.isActive),
            },
            { new: true }
        );

        if (!variant) throw ERR.NOT_FOUND("Variante no encontrada");
        return res.ok({ variant });
    } catch (e) { next(e); }
}

export async function deleteProductVariant(req, res, next) {
    try {
        const deleted = await ProductVariantModel.findOneAndDelete({
            _id: req.params.id,
            ...tenantFilter(req, {}),
        });

        if (!deleted) throw ERR.NOT_FOUND("Variante no encontrada");
        return res.ok({ message: "Variante eliminada" });
    } catch (e) { next(e); }
}

/* ======================================================
   FX RATE
====================================================== */
export async function getFxRateController(req, res) {
    const rate = await getBobToUsdRate();
    return res.ok({ fx: { pair: "USDT/BOB", rate } });
}
