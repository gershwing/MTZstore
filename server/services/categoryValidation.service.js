import CategoryModel from "../models/category.model.js";

export async function validateCategoryBelongsToStore(categoryId, storeCategoryId) {
  if (!categoryId || !storeCategoryId) return false;
  if (String(categoryId) === String(storeCategoryId)) return true;

  const category = await CategoryModel.findById(categoryId)
    .select('ancestors')
    .lean();
  if (!category) return false;

  return (category.ancestors || []).some(
    a => String(a._id) === String(storeCategoryId)
  );
}
