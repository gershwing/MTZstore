// server/routes/productFilter.route.js
import { Router } from 'express';

import withTenant from '../middlewares/withTenant.js';
import { authOptional } from '../middlewares/authOptional.js';

import {
  getAllProducts,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsBySubCatId,
  getAllProductsBySubCatName,
  getAllProductsByThirdLavelCatId,
  getAllProductsByPrice,
  getAllProductsByRating,
  getAllFeaturedProducts,
  getAllProductsBanners,
  getProductsCount,
  filters,
  sortBy,
  searchProductController,
  getProductDetailPublic,
  getStorePublic,
} from '../controllers/productFilter.controller.js';

/* ============================================================
   Utils locales
   ============================================================ */

// Sanitiza paginación y sort para catálogos públicos
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const parseListQuery = (req, _res, next) => {
  const q = req.query || {};
  const page = clamp(parseInt(q.page ?? '1', 10) || 1, 1, 100000);
  const limit = clamp(parseInt(q.limit ?? '24', 10) || 24, 1, 100);

  const ALLOWED_SORT = new Set([
    'createdAt',
    'price',
    'rating',
    'name',
    '-createdAt',
    '-price',
    '-rating',
    '-name',
  ]);

  const sort = ALLOWED_SORT.has(q.sort) ? q.sort : '-createdAt';

  req.listQuery = { page, limit, sort };
  next();
};

// Cache corto para catálogo (solo GET)
const cache10s = (_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
  next();
};

/* ============================================================
   Router
   ============================================================ */

const filterRouter = Router();

// Tenant opcional (X-Store-Id si llega)
const optionalTenant = withTenant({ required: false, source: 'header' });

/* ============================================================
   RUTAS PÚBLICAS (Store-front)
   ============================================================ */

// Listado general
filterRouter.get(
  '/',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProducts
);

// Detalle publico de producto (para storefront/client)
filterRouter.get(
  '/detail/:id',
  authOptional,
  optionalTenant,
  getProductDetailPublic
);

// Alias legacy (el frontend llama GET /api/product/getAllProducts)
filterRouter.get(
  '/getAllProducts',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProducts
);

// Conteo total
filterRouter.get(
  '/count',
  authOptional,
  optionalTenant,
  cache10s,
  getProductsCount
);

// Destacados
filterRouter.get(
  '/featured',
  authOptional,
  optionalTenant,
  cache10s,
  getAllFeaturedProducts
);

// Productos con banner home
filterRouter.get(
  '/banners',
  authOptional,
  optionalTenant,
  cache10s,
  getAllProductsBanners
);

/* =========================
   Filtros por categoría
   ========================= */

filterRouter.get(
  '/by-category/:id',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsByCatId
);

filterRouter.get(
  '/by-category',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsByCatName
);

filterRouter.get(
  '/by-subcategory/:id',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsBySubCatId
);

filterRouter.get(
  '/by-subcategory',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsBySubCatName
);

filterRouter.get(
  '/by-third-category/:id',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsByThirdLavelCatId
);

/* =========================
   Filtros especiales
   ========================= */

// Rango de precio (USD / BOB)
filterRouter.get(
  '/by-price',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsByPrice
);

// Por rating
filterRouter.get(
  '/by-rating',
  authOptional,
  optionalTenant,
  parseListQuery,
  cache10s,
  getAllProductsByRating
);

/* =========================
   Búsqueda y filtros avanzados
   ========================= */

// Filtros complejos (payload grande)
filterRouter.post(
  '/filters',
  authOptional,
  optionalTenant,
  filters
);

// Ordenamiento sobre resultados ya cargados
filterRouter.post(
  '/sort',
  authOptional,
  optionalTenant,
  sortBy
);

// Búsqueda textual
filterRouter.post(
  '/search',
  authOptional,
  optionalTenant,
  searchProductController
);

/* =========================
   Página pública de tienda
   ========================= */
filterRouter.get(
  '/store/:id',
  authOptional,
  optionalTenant,
  cache10s,
  getStorePublic
);

export default filterRouter;
