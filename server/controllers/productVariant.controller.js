// server/controllers/productVariant.controller.js
import ProductVariantModel from '../models/productVariant.model.js';
import ProductModel from '../models/product.model.js';
import { ERR } from '../utils/httpError.js';
import { tenantFilter } from '../utils/tenant.js';
import { getInheritedCategoryAttributes } from "../services/categoryAttributes.service.js";
/* ======================================================
   CREATE VARIANT
   ====================================================== */
export async function createProductVariant(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION("storeId requerido");

    const productId = req.params.productId;
    if (!productId) throw ERR.VALIDATION("productId requerido");

    /**
     * 1️⃣ Obtener producto base
     */
    const product = await ProductModel.findOne({
      _id: productId,
      ...tenantFilter(req, {}),
    });

    if (!product) throw ERR.NOT_FOUND("Producto no encontrado");

    /**
     * 2️⃣ El producto DEBE ser VARIANT
     */
    if (product.productType !== "VARIANT") {
      throw ERR.VALIDATION(
        "Este producto no admite variantes (productType=SIMPLE)"
      );
    }

    /**
     * 3️⃣ Obtener atributos heredados de la categoría
     */
    const attributes = await getInheritedCategoryAttributes(
      req,
      product.category
    );

    const variantAttributesDef = attributes.filter(
      (a) => a.variant === true
    );

    if (!variantAttributesDef.length) {
      throw ERR.VALIDATION(
        "La categoría no define atributos de variante"
      );
    }

    /**
     * 4️⃣ Validar atributos enviados
     */
    if (!Array.isArray(req.body.attributes)) {
      throw ERR.VALIDATION("attributes debe ser un array");
    }

    const provided = req.body.attributes;

    // Atributos esperados (codes)
    const expectedCodes = variantAttributesDef.map((a) => a.code);

    // Atributos enviados (codes)
    const providedCodes = provided.map((a) => a.code);

    /**
     * 4.1 Faltantes
     */
    const missing = expectedCodes.filter(
      (code) => !providedCodes.includes(code)
    );

    if (missing.length) {
      throw ERR.VALIDATION(
        `Faltan atributos de variante: ${missing.join(", ")}`
      );
    }

    /**
     * 4.2 Sobrantes (atributos inválidos)
     */
    const extra = providedCodes.filter(
      (code) => !expectedCodes.includes(code)
    );

    if (extra.length) {
      throw ERR.VALIDATION(
        `Atributos inválidos para esta categoría: ${extra.join(", ")}`
      );
    }

    /**
     * 4.3 Validar valores vacíos
     */
    for (const attr of provided) {
      if (
        attr.value == null ||
        (typeof attr.value === "string" && !attr.value.trim())
      ) {
        throw ERR.VALIDATION(
          `Valor inválido para atributo ${attr.code}`
        );
      }
    }

    /**
     * 5️⃣ Crear variante
     */
    const variant = await ProductVariantModel.create({
      productId,
      storeId,
      attributes: provided,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      sku: req.body.sku,
      isActive: true,
    });

    return res.created({
      variant,
      meta: {
        productId,
        variantAttributes: variantAttributesDef,
      },
    });
  } catch (e) {
    if (e?.code === 11000) {
      return next(ERR.VALIDATION("Variante duplicada"));
    }
    next(e);
  }
}

/* ======================================================
   GET VARIANTS BY PRODUCT
   ====================================================== */
export async function getVariantsByProduct(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId) throw ERR.VALIDATION('productId requerido');

    const variants = await ProductVariantModel.find({
      productId,
      ...tenantFilter(req, {}),
      status: 'ACTIVE',
    })
      .populate('attributes.ramId')
      .populate('attributes.sizeId')
      .populate('attributes.weightId');

    return res.ok({ variants });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   FIND VARIANT BY ATTRIBUTES (MATCH EXACTO)
   ====================================================== */
// Ejemplo:
// /api/variant/match?productId=xxx&ramId=aaa&sizeId=bbb
export async function findVariantByAttributes(req, res, next) {
  try {
    const { productId, ...attrs } = req.query;
    if (!productId) throw ERR.VALIDATION('productId requerido');

    const query = {
      productId,
      ...tenantFilter(req, {}),
      status: 'ACTIVE',
    };

    // Construye match exacto de atributos
    Object.entries(attrs).forEach(([key, value]) => {
      query[`attributes.${key}`] = value;
    });

    const variant = await ProductVariantModel.findOne(query)
      .populate('attributes.ramId')
      .populate('attributes.sizeId')
      .populate('attributes.weightId');

    if (!variant) {
      throw ERR.NOT_FOUND('Variante no encontrada');
    }

    return res.ok({ variant });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   GET VARIANT BY ID
   ====================================================== */
export async function getVariantById(req, res, next) {
  try {
    const variant = await ProductVariantModel.findOne({
      _id: req.params.id,
      ...tenantFilter(req, {}),
    })
      .populate('attributes.ramId')
      .populate('attributes.sizeId')
      .populate('attributes.weightId');

    if (!variant) throw ERR.NOT_FOUND('Variante no encontrada');
    return res.ok({ variant });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   UPDATE VARIANT
   ====================================================== */
export async function updateVariant(req, res, next) {
  try {
    const update = {
      attributes: req.body.attributes,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      sku: req.body.sku,
      status: req.body.status,
    };

    const variant = await ProductVariantModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...tenantFilter(req, {}),
      },
      update,
      { new: true }
    );

    if (!variant) throw ERR.NOT_FOUND('Variante no encontrada');
    return res.ok({ variant });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   DELETE VARIANT (HARD DELETE)
   ====================================================== */
export async function deleteVariant(req, res, next) {
  try {
    const deleted = await ProductVariantModel.findOneAndDelete({
      _id: req.params.id,
      ...tenantFilter(req, {}),
    });

    if (!deleted) throw ERR.NOT_FOUND('Variante no encontrada');
    return res.ok({ message: 'Variante eliminada' });
  } catch (e) {
    next(e);
  }
}
