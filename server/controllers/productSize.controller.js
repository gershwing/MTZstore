// server/controllers/productSize.controller.js
import ProductSIZEModel from '../models/productSIZE.js';
import { ERR } from '../utils/httpError.js';

/* ======================================================
   SIZE / TALLA / TAMAÑO
====================================================== */

export async function createProductSize(req, res, next) {
  try {
    const item = await ProductSIZEModel.create({
      name: req.body.name?.trim(),
    });
    return res.created({ data: item });
  } catch (e) {
    next(e);
  }
}

export async function updateProductSize(req, res, next) {
  try {
    const item = await ProductSIZEModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name?.trim() },
      { new: true }
    );
    if (!item) throw ERR.NOT_FOUND('Size not found');
    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}

export async function deleteProductSize(req, res, next) {
  try {
    const item = await ProductSIZEModel.findByIdAndDelete(req.params.id);
    if (!item) throw ERR.NOT_FOUND('Size not found');
    return res.ok({ message: 'Size deleted' });
  } catch (e) {
    next(e);
  }
}

export async function getProductSize(req, res, next) {
  try {
    const list = await ProductSIZEModel.find().sort({ name: 1 });
    return res.ok({ data: list });
  } catch (e) {
    next(e);
  }
}

export async function getProductSizeById(req, res, next) {
  try {
    const item = await ProductSIZEModel.findById(req.params.id);
    if (!item) throw ERR.NOT_FOUND('Size not found');
    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}
