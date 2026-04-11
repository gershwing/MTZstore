// server/middlewares/requireProductOwnership.js
import ProductModel from '../models/product.model.js';
import { ERR } from '../utils/httpError.js';

export const requireProductOwnership = async (req, _res, next) => {
  try {
    // productId puede venir por body o params
    const productId =
      req.body.productId ||
      req.params.productId ||
      req.query.productId;

    if (!productId) {
      throw ERR.VALIDATION('productId requerido');
    }

    const product = await ProductModel
      .findById(productId)
      .select('storeId');

    if (!product) {
      throw ERR.NOT_FOUND('Producto no existe');
    }

    if (String(product.storeId) !== String(req.tenant.storeId)) {
      throw ERR.FORBIDDEN('No tienes permiso sobre este producto');
    }

    next();
  } catch (err) {
    next(err);
  }
};
