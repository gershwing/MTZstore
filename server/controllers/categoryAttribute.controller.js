import CategoryAttributeModel from "../models/categoryAttribute.model.js";
import CategoryModel from "../models/category.model.js";
import AttributeModel from "../models/attribute.model.js";

import { ERR } from "../utils/httpError.js";
import { categoryTenantFilter } from "../utils/tenant.js";

/* ======================================================
   CREATE / ASSIGN ATTRIBUTE TO CATEGORY
====================================================== */
export async function assignAttributeToCategory(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId || null;

    const {
      categoryId,
      attributeId,
      required = false,
      variant = false,
      affectsPrice = false,
      affectsStock = false,
      sortOrder = 0,
    } = req.body;

    if (!categoryId || !attributeId) {
      throw ERR.VALIDATION("categoryId y attributeId son requeridos");
    }

    // Validar categoría
    const category = await CategoryModel.findOne({
      _id: categoryId,
      ...categoryTenantFilter(req, {}),
    });

    if (!category) {
      throw ERR.NOT_FOUND("Categoría no encontrada");
    }

    // Validar atributo
    const attribute = await AttributeModel.findById(attributeId);
    if (!attribute || !attribute.isActive) {
      throw ERR.NOT_FOUND("Atributo no encontrado o inactivo");
    }

    const item = await CategoryAttributeModel.create({
      storeId,
      categoryId,
      attributeId,
      required,
      variant,
      affectsPrice,
      affectsStock,
      sortOrder,
      isActive: true,
    });

    return res.created({ data: item });
  } catch (e) {
    if (e?.code === 11000) {
      return next(ERR.VALIDATION("El atributo ya está asignado a esta categoría"));
    }
    next(e);
  }
}

/* ======================================================
   UPDATE CATEGORY ATTRIBUTE RULES
====================================================== */
export async function updateCategoryAttribute(req, res, next) {
  try {
    const where = {
      _id: req.params.id,
      ...categoryTenantFilter(req, {}),
    };

    const update = {
      required: Boolean(req.body.required),
      variant: Boolean(req.body.variant),
      affectsPrice: Boolean(req.body.affectsPrice),
      affectsStock: Boolean(req.body.affectsStock),
      sortOrder: Number(req.body.sortOrder) || 0,
      isActive: Boolean(req.body.isActive),
    };

    const item = await CategoryAttributeModel.findOneAndUpdate(
      where,
      update,
      { new: true }
    );

    if (!item) {
      throw ERR.NOT_FOUND("Relación categoría-atributo no encontrada");
    }

    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   DELETE ATTRIBUTE FROM CATEGORY
====================================================== */
export async function removeAttributeFromCategory(req, res, next) {
  try {
    const deleted = await CategoryAttributeModel.findOneAndDelete({
      _id: req.params.id,
      ...categoryTenantFilter(req, {}),
    });

    if (!deleted) {
      throw ERR.NOT_FOUND("Relación categoría-atributo no encontrada");
    }

    return res.ok({ message: "Atributo removido de la categoría" });
  } catch (e) {
    next(e);
  }
}

/* ======================================================
   GET ATTRIBUTES BY CATEGORY (HEREDADOS)
====================================================== */
export async function getCategoryAttributes(req, res, next) {
  try {
    const { categoryId } = req.params;
    if (!categoryId) throw ERR.VALIDATION("categoryId requerido");

    // 1️⃣ Obtener categoría con ancestors
    const category = await CategoryModel.findOne({
      _id: categoryId,
      ...categoryTenantFilter(req, {}),
    }).lean();

    if (!category) {
      throw ERR.NOT_FOUND("Categoría no encontrada");
    }

    // IDs de categorías heredadas (padres + actual)
    const categoryIds = [
      ...(category.ancestors || []).map(a => a._id),
      category._id,
    ];

    // 2️⃣ Buscar atributos por esas categorías
    const relations = await CategoryAttributeModel.find({
      categoryId: { $in: categoryIds },
      isActive: true,
      ...categoryTenantFilter(req, {}),
    })
      .populate("attributeId")
      .sort({ sortOrder: 1 })
      .lean();

    // 3️⃣ Normalizar respuesta
    const attributes = relations
      .filter(r => r.attributeId && r.attributeId.isActive)
      .map(r => ({
        _id: r.attributeId._id,
        code: r.attributeId.code,
        name: r.attributeId.name,
        type: r.attributeId.type,
        options: r.allowedOptions?.length ? r.allowedOptions : r.attributeId.options,
        unit: r.attributeId.unit,

        // reglas heredadas
        required: r.required,
        variant: r.variant,
        affectsPrice: r.affectsPrice,
        affectsStock: r.affectsStock,
        modelOptions: r.modelOptions || null,
      }));

    return res.ok({
      categoryId,
      attributes,
    });
  } catch (e) {
    next(e);
  }
}
