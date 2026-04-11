// server/routes/cart.route.js
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import withTenant from '../middlewares/withTenant.js';

import {
  addToCartItemController,
  getCartItemController,
  updateCartItemQtyController,
  deleteCartItemQtyController,
  emptyCartController,
} from '../controllers/cart.controller.js';

const cartRouter = Router();

/**
 * 🛒 CARRITO (multiusuario + multitienda opcional)
 *
 * Reglas:
 * - Auth SIEMPRE requerido
 * - withTenant({ required:false }) filtra por x-tenant-id si se envía
 *
 * Contrato:
 * - SIMPLE  → { productId, qty }
 * - VARIANT → { productId, variantId, qty }
 */

// ➕ Añadir item al carrito
cartRouter.post(
  '/add',
  auth,
  withTenant({ required: false, source: 'header' }),
  addToCartItemController
);

// 📥 Obtener items del carrito del usuario
cartRouter.get(
  '/get',
  auth,
  withTenant({ required: false, source: 'header' }),
  getCartItemController
);

// 🔄 Actualizar cantidad de un item
cartRouter.put(
  '/update-qty',
  auth,
  withTenant({ required: false, source: 'header' }),
  updateCartItemQtyController
);

// ❌ Eliminar item específico del carrito
cartRouter.delete(
  '/delete-cart-item/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  deleteCartItemQtyController
);

// 🧹 Vaciar carrito
// - Con x-tenant-id → solo esa tienda
// - Sin x-tenant-id → todas (legacy)
cartRouter.delete(
  '/empty',
  auth,
  withTenant({ required: false, source: 'header' }),
  emptyCartController
);

// 🧯 Alias legacy (NO eliminar)
// - Mantiene compatibilidad con front antiguo
cartRouter.delete(
  '/emptyCart/:id',
  auth,
  withTenant({ required: false, source: 'header' }),
  emptyCartController
);

export default cartRouter;
