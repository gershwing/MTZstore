import CategoryModel from "../models/category.model.js";
import CategoryAttributeModel from "../models/categoryAttribute.model.js";

import { ERR } from "../utils/httpError.js";
import { categoryTenantFilter } from "../utils/tenant.js";

export async function getInheritedCategoryAttributes(req, categoryId) {
  const category = await CategoryModel.findOne({
    _id: categoryId,
    ...categoryTenantFilter(req, {}),
  }).lean();

  if (!category) throw ERR.NOT_FOUND("Categoría no encontrada");

  const categoryIds = [
    ...(category.ancestors || []).map(a => a._id),
    category._id,
  ];

  const relations = await CategoryAttributeModel.find({
    categoryId: { $in: categoryIds },
    isActive: true,
    ...categoryTenantFilter(req, {}),
  })
    .populate("attributeId")
    .lean();

  return relations
    .filter(r => r.attributeId && r.attributeId.isActive)
    .map(r => ({
      attributeId: r.attributeId._id,
      code: r.attributeId.code,
      name: r.attributeId.name,
      type: r.attributeId.type,
      required: r.required,
      variant: r.variant,
      affectsPrice: r.affectsPrice,
      affectsStock: r.affectsStock,
    }));
}
