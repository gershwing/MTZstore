import ProductRAMSModel from '../models/productRAMS.js';
import { ERR } from '../utils/httpError.js';
import { tenantFilter } from '../utils/tenant.js';

/* ======================================================
   RAM (atributo del producto)
====================================================== */

/**
 * Crear RAM
 * POST /api/product/rams
 */
export async function createProductRAMS(req, res, next) {
  try {
    const storeId = req?.tenant?.storeId;
    if (!storeId) throw ERR.VALIDATION('storeId requerido');

    const name = req.body?.name?.trim();
    if (!name) throw ERR.VALIDATION('Nombre requerido');

    const item = await ProductRAMSModel.create({
      name,
      storeId,
    });

    return res.created({ data: item });
  } catch (e) {
    // índice único (storeId + name)
    if (e?.code === 11000) {
      return next(ERR.VALIDATION('RAM duplicada'));
    }
    next(e);
  }
}

/**
 * Actualizar RAM
 * PUT /api/product/rams/:id
 */
export async function updateProductRam(req, res, next) {
  try {
    const name = req.body?.name?.trim();
    if (!name) throw ERR.VALIDATION('Nombre requerido');

    const item = await ProductRAMSModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...tenantFilter(req, {}),
      },
      { name },
      { new: true }
    );

    if (!item) throw ERR.NOT_FOUND('RAM no encontrada');

    return res.ok({ data: item });
  } catch (e) {
    if (e?.code === 11000) {
      return next(ERR.VALIDATION('RAM duplicada'));
    }
    next(e);
  }
}

/**
 * Eliminar RAM
 * DELETE /api/product/rams/:id
 */
export async function deleteProductRAMS(req, res, next) {
  try {
    const deleted = await ProductRAMSModel.findOneAndDelete({
      _id: req.params.id,
      ...tenantFilter(req, {}),
    });

    if (!deleted) throw ERR.NOT_FOUND('RAM no encontrada');

    return res.ok({ message: 'RAM eliminada' });
  } catch (e) {
    next(e);
  }
}

/**
 * Listar RAMs
 * GET /api/product/rams
 */
export async function getProductRams(req, res, next) {
  try {
    const list = await ProductRAMSModel.find(
      tenantFilter(req, {})
    ).sort({ name: 1 });

    return res.ok({ data: list });
  } catch (e) {
    next(e);
  }
}

/**
 * Obtener RAM por ID
 * GET /api/product/rams/:id
 */
export async function getProductRamsById(req, res, next) {
  try {
    const item = await ProductRAMSModel.findOne({
      _id: req.params.id,
      ...tenantFilter(req, {}),
    });

    if (!item) throw ERR.NOT_FOUND('RAM no encontrada');

    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}
