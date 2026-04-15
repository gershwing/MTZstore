import ProductModel from '../models/product.model.js';
import ProductVariantModel from '../models/productVariant.model.js';
import CategoryModel from '../models/category.model.js';

import { ERR } from '../utils/httpError.js';
import { tenantFilter } from '../utils/tenant.js';

import {
  getFxSnapshot,
  enrichProductsWithFx,
} from '../services/fx.service.js';

import { getBobToUsdRate } from '../services/binanceService.js';

/* ======================================================
   HELPERS
====================================================== */

// Precio mínimo real del producto (desde variantes)
async function getMinVariantPriceUsd(productId, rate) {
  const variants = await ProductVariantModel.find({
    productId,
    status: 'ACTIVE',
    stock: { $gt: 0 },
  }).select('price');

  if (!variants.length) return null;

  const pricesUsd = variants.map(v => v.price);
  return Math.min(...pricesUsd);
}

/* ======================================================
   LISTADO GENERAL (PAGINADO)
====================================================== */
export async function getAllProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const search = q
      ? { $or: [{ name: new RegExp(q, "i") }, { catName: new RegExp(q, "i") }, { subCat: new RegExp(q, "i") }] }
      : {};
    const filter = tenantFilter(req, search);
    const total = await ProductModel.countDocuments(filter);

    const products = await ProductModel.find(filter)
      .populate('category', 'name ancestors depth')
      .populate('storeId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate stock and variant counts per product
    const productIds = products.map(p => p._id);
    const variantStats = await ProductVariantModel.aggregate([
      { $match: { productId: { $in: productIds }, isActive: true } },
      { $group: {
        _id: "$productId",
        totalStock: { $sum: "$stock" },
        totalWarehouseStock: { $sum: "$warehouseStock" },
        variantsCount: { $sum: 1 },
      } },
    ]);
    const statsMap = Object.fromEntries(variantStats.map(s => [String(s._id), s]));

    const enriched = await enrichProductsWithFx(products);

    // Add computed fields
    const final = enriched.map(p => {
      const id = String(p._id);
      const stats = statsMap[id] || { totalStock: 0, variantsCount: 0 };

      // Extract category hierarchy from populated category + ancestors
      let catL1 = p.catName || "";
      let catL2 = p.subCat || "";
      let catL3 = p.thirdsubCat || "";

      const cat = p.category;
      if (cat && typeof cat === "object") {
        const ancestors = Array.isArray(cat.ancestors) ? cat.ancestors : [];
        // ancestors[0] = L1 (root), ancestors[1] = L2, cat.name = leaf
        if (ancestors.length >= 2) {
          // depth >= 2: L1=ancestors[0], L2=ancestors[1], L3=cat.name
          catL1 = catL1 || ancestors[0]?.name || "";
          catL2 = catL2 || ancestors[1]?.name || "";
          catL3 = catL3 || cat.name || "";
        } else if (ancestors.length === 1) {
          // depth 1: L1=ancestors[0], L2=cat.name
          catL1 = catL1 || ancestors[0]?.name || "";
          catL2 = catL2 || cat.name || "";
        } else {
          // depth 0: L1=cat.name
          catL1 = catL1 || cat.name || "";
        }
      }

      return {
        ...p,
        storeName: p.storeId?.name || "",
        storeIdStr: String(p.storeId?._id || p.storeId || ""),
        catName: catL1,
        subCat: catL2,
        thirdsubCat: catL3,
        totalStock: (stats.totalStock || p.countInStock || 0) + (stats.totalWarehouseStock || p.warehouseStock || 0),
        warehouseStock: stats.totalWarehouseStock || p.warehouseStock || 0,
        variantsCount: stats.variantsCount,
      };
    });

    return res.ok({
      products: final,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   OBTENER POR ID DE CATEGORÍA
====================================================== */
export async function getAllProductsByCatId(req, res, next) {
  try {
    const id = req.params.id;
    // Buscar la categoria y todos sus descendientes
    const descendantIds = await CategoryModel.find({
      $or: [{ _id: id }, { "ancestors._id": id }],
    }).select("_id").lean();
    const allIds = descendantIds.map(c => c._id);

    // Buscar productos por campo legacy (catId) O campo nuevo (category)
    const base = { $or: [{ catId: id }, { category: { $in: allIds } }] };
    const filter = tenantFilter(req, base);
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   OBTENER POR NOMBRE DE CATEGORÍA
====================================================== */
export async function getAllProductsByCatName(req, res, next) {
  try {
    const filter = tenantFilter(req, { catName: req.query.catName });
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   SUBCATEGORÍA
====================================================== */
export async function getAllProductsBySubCatId(req, res, next) {
  try {
    const id = req.params.id;
    const descendantIds = await CategoryModel.find({
      $or: [{ _id: id }, { "ancestors._id": id }],
    }).select("_id").lean();
    const allIds = descendantIds.map(c => c._id);

    const base = { $or: [{ subCatId: id }, { category: { $in: allIds } }] };
    const filter = tenantFilter(req, base);
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

export async function getAllProductsBySubCatName(req, res, next) {
  try {
    const filter = tenantFilter(req, { subCat: req.query.subCat });
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   TERCER NIVEL
====================================================== */
export async function getAllProductsByThirdLavelCatId(req, res, next) {
  try {
    const filter = tenantFilter(req, { thirdsubCatId: req.params.id });
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

export async function getAllProductsByThirdLavelCatName(req, res, next) {
  try {
    const filter = tenantFilter(req, { thirdsubCat: req.query.thirdsubCat });
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   FILTRO POR PRECIO REAL (VARIANTES)
====================================================== */
export async function getAllProductsByPrice(req, res, next) {
  try {
    const currency = String(req.query.currency || 'USD').toUpperCase();
    const min = req.query.minPrice ? Number(req.query.minPrice) : null;
    const max = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const rate = await getBobToUsdRate();
    const filter = tenantFilter(req, {});
    const products = await ProductModel.find(filter);

    const filtered = [];

    for (const product of products) {
      const minPrice = await getMinVariantPriceUsd(product._id, rate);
      if (minPrice === null) continue;

      if (min !== null && minPrice < min) continue;
      if (max !== null && minPrice > max) continue;

      filtered.push(product);
    }

    const enriched = await enrichProductsWithFx(filtered);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   FILTRO POR RATING
====================================================== */
export async function getAllProductsByRating(req, res, next) {
  try {
    const rating = Number(req.query.rating);
    if (!Number.isFinite(rating)) {
      throw ERR.VALIDATION('rating inválido');
    }

    const filter = tenantFilter(req, { rating });
    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);

    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   FILTROS AVANZADOS
====================================================== */
export async function filters(req, res, next) {
  try {
    const {
      catId,
      subCatId,
      thirdsubCatId,
      rating,
      minPrice,
      maxPrice,
      page = 1,
      limit = 25,
    } = req.body;

    const base = {};

    // Categoria: soportar tanto campos legacy (catId/subCatId) como nuevo (category)
    const catConditions = [];
    if (catId?.length) {
      catConditions.push({ catId: { $in: catId } });
      // Buscar todas las categorias descendientes para el campo 'category'
      const descendants = await CategoryModel.find({
        $or: [
          { _id: { $in: catId } },
          { "ancestors._id": { $in: catId } },
        ],
      }).select("_id").lean();
      if (descendants.length) {
        catConditions.push({ category: { $in: descendants.map(d => d._id) } });
      }
    }
    if (subCatId?.length) {
      catConditions.push({ subCatId: { $in: subCatId } });
      const descendants = await CategoryModel.find({
        $or: [
          { _id: { $in: subCatId } },
          { "ancestors._id": { $in: subCatId } },
        ],
      }).select("_id").lean();
      if (descendants.length) {
        catConditions.push({ category: { $in: descendants.map(d => d._id) } });
      }
    }
    if (thirdsubCatId?.length) {
      catConditions.push({ thirdsubCatId: { $in: thirdsubCatId } });
      catConditions.push({ category: { $in: thirdsubCatId } });
    }

    if (catConditions.length) base.$or = catConditions;
    if (rating?.length) base.rating = { $in: rating };

    const filter = tenantFilter(req, base);
    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
    const [products, total] = await Promise.all([
      ProductModel.find(filter).skip(skip).limit(+limit),
      ProductModel.countDocuments(filter),
    ]);

    const rate = await getBobToUsdRate();
    const filtered = [];

    for (const product of products) {
      let productPrice = await getMinVariantPriceUsd(product._id, rate);
      // Fallback a basePrice para productos sin variantes activas
      if (productPrice === null) productPrice = product.basePrice || 0;

      if (minPrice != null && minPrice > 0 && productPrice < minPrice) continue;
      if (maxPrice != null && maxPrice > 0 && productPrice > maxPrice) continue;

      filtered.push(product);
    }

    const enriched = await enrichProductsWithFx(filtered);
    return res.ok({
      products: enriched,
      totalPages: Math.ceil(total / +limit),
      total,
      page: +page,
    });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   ORDENAR (NAME / PRICE)
====================================================== */
export async function sortBy(req, res, next) {
  try {
    const { sortBy = 'name', order = 'asc' } = req.body;
    const dir = order === 'desc' ? -1 : 1;

    const filter = tenantFilter(req, {});
    const products = await ProductModel.find(filter);

    const rate = await getBobToUsdRate();

    products.sort((a, b) => {
      if (sortBy === 'price') {
        const aPrice = a.basePrice || 0;
        const bPrice = b.basePrice || 0;
        return dir * (aPrice - bPrice);
      }

      return dir * String(a.name).localeCompare(String(b.name));
    });

    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   CONTEO DE PRODUCTOS
====================================================== */
export async function getProductsCount(req, res, next) {
  try {
    const filter = tenantFilter(req, {});
    const count = await ProductModel.countDocuments(filter);
    return res.ok({ count });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   PRODUCTOS DESTACADOS
====================================================== */
export async function getAllFeaturedProducts(req, res, next) {
  try {
    const filter = tenantFilter(req, { isFeatured: true });
    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   PRODUCTOS CON BANNER HOME
====================================================== */
export async function getAllProductsBanners(req, res, next) {
  try {
    const filter = tenantFilter(req, { isDisplayOnHomeBanner: true });
    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    const enriched = await enrichProductsWithFx(products);
    return res.ok({ products: enriched });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   BÚSQUEDA
====================================================== */
export async function searchProductController(req, res, next) {
  try {
    const query = req.body.query;
    if (!query) throw ERR.VALIDATION('query requerido');

    const filter = tenantFilter(req, {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { catName: { $regex: query, $options: 'i' } },
        { subCat: { $regex: query, $options: 'i' } },
        { thirdsubCat: { $regex: query, $options: 'i' } },
      ],
    });

    const products = await ProductModel.find(filter);
    const enriched = await enrichProductsWithFx(products);

    return res.ok({
      products: enriched,
      total: enriched.length,
    });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   DETALLE PÚBLICO DE PRODUCTO (para storefront/client)
====================================================== */
export async function getProductDetailPublic(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') throw ERR.VALIDATION('ID de producto requerido');

    const product = await ProductModel.findById(id)
      .populate('category', 'name slug depth ancestors')
      .populate('storeId', 'name slug branding description isPlatformStore')
      .lean();

    if (!product) throw ERR.NOT_FOUND('Producto no encontrado');

    const variants = await ProductVariantModel.find({
      productId: product._id,
      isActive: true,
    }).lean();

    const [enriched] = await enrichProductsWithFx([product]);

    // Obtener categoria para productos relacionados
    const categoryId = product.category?._id || product.category;
    let relatedProducts = [];
    if (categoryId) {
      const catIds = await CategoryModel.find({
        $or: [{ _id: categoryId }, { "ancestors._id": categoryId }],
      }).select("_id").lean();
      const allCatIds = catIds.map(c => c._id);

      const related = await ProductModel.find({
        _id: { $ne: product._id },
        $or: [
          { category: { $in: allCatIds } },
          { catId: product.catId },
          { subCatId: product.subCatId },
        ].filter(c => Object.values(c)[0]),
      }).limit(10).lean();
      relatedProducts = await enrichProductsWithFx(related);
    }

    // Extraer info de tienda para el storefront
    const store = product.storeId;
    let storeInfo;
    if (store && typeof store === 'object') {
      storeInfo = {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        logo: store.branding?.logo || null,
        banner: store.branding?.banner || null,
        description: store.description || '',
        isPlatformStore: store.isPlatformStore || false,
      };
    } else {
      // Producto sin tienda -> vendido por plataforma
      storeInfo = {
        _id: 'platform',
        name: 'MTZstore',
        slug: 'platform',
        logo: null,
        banner: null,
        description: 'Tienda oficial de la plataforma MTZstore',
        isPlatformStore: true,
      };
    }

    return res.ok({ product: enriched, variants, relatedProducts, storeInfo });
  } catch (err) {
    return next(err);
  }
}

/* ======================================================
   PÁGINA PÚBLICA DE TIENDA (storefront)
   GET /api/product-filter/store/:id
====================================================== */
export async function getStorePublic(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) throw ERR.VALIDATION('ID de tienda requerido');

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
    const skip = (page - 1) * limit;

    // Caso especial: productos de plataforma (sin storeId)
    if (id === 'platform') {
      const productFilter = { $or: [{ storeId: null }, { storeId: { $exists: false } }] };
      const [products, total] = await Promise.all([
        ProductModel.find(productFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProductModel.countDocuments(productFilter),
      ]);

      const enriched = await enrichProductsWithFx(products);

      return res.ok({
        store: {
          _id: 'platform',
          name: 'MTZstore',
          slug: 'platform',
          logo: null,
          banner: null,
          description: 'Tienda oficial de la plataforma MTZstore',
          isPlatformStore: true,
          category: null,
        },
        products: enriched,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
      });
    }

    const StoreModel = (await import('../models/store.model.js')).default;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const storeQuery = isObjectId ? { _id: id } : { slug: id };
    const store = await StoreModel.findOne({ ...storeQuery, status: 'active' })
      .populate('categoryId', 'name slug')
      .lean();

    if (!store) throw ERR.NOT_FOUND('Tienda no encontrada');

    const productFilter = { storeId: store._id };
    const [products, total] = await Promise.all([
      ProductModel.find(productFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(productFilter),
    ]);

    const enriched = await enrichProductsWithFx(products);

    const storeInfo = {
      _id: store._id,
      name: store.name,
      slug: store.slug,
      logo: store.branding?.logo || null,
      banner: store.branding?.banner || null,
      description: store.description || '',
      isPlatformStore: store.isPlatformStore || false,
      category: store.categoryId || null,
    };

    return res.ok({
      store: storeInfo,
      products: enriched,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (err) {
    return next(err);
  }
}
