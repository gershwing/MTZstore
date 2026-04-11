// server/controllers/productWeight.controller.js
import ProductWEIGHTModel from '../models/productWEIGHT.js';
import { ERR } from '../utils/httpError.js';

/* ======================================================
   WEIGHT / PESO
====================================================== */

export async function createProductWEIGHT(req, res, next) {
  try {
    const item = await ProductWEIGHTModel.create({
      name: req.body.name?.trim(),
    });
    return res.created({ data: item });
  } catch (e) {
    next(e);
  }
}

export async function updateProductWeight(req, res, next) {
  try {
    const item = await ProductWEIGHTModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name?.trim() },
      { new: true }
    );
    if (!item) throw ERR.NOT_FOUND('Weight not found');
    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}

export async function deleteProductWEIGHT(req, res, next) {
  try {
    const item = await ProductWEIGHTModel.findByIdAndDelete(req.params.id);
    if (!item) throw ERR.NOT_FOUND('Weight not found');
    return res.ok({ message: 'Weight deleted' });
  } catch (e) {
    next(e);
  }
}

export async function getProductWeight(req, res, next) {
  try {
    const list = await ProductWEIGHTModel.find().sort({ name: 1 });
    return res.ok({ data: list });
  } catch (e) {
    next(e);
  }
}

export async function getProductWeightById(req, res, next) {
  try {
    const item = await ProductWEIGHTModel.findById(req.params.id);
    if (!item) throw ERR.NOT_FOUND('Weight not found');
    return res.ok({ data: item });
  } catch (e) {
    next(e);
  }
}
