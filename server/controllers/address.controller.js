// server/controllers/address.controller.js
import mongoose from "mongoose";
import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import { ERR } from "../utils/httpError.js";

/** Utils */
const asBool = (v, def = false) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return ["1", "true", "yes", "on"].includes(v.toLowerCase());
    return def;
};
const isValidId = (id) => mongoose.isValidObjectId(id);

/**
 * POST /api/address
 * Crea dirección para el usuario autenticado.
 * - Usa req.userId (middleware auth)
 * - Usa req.storeId si manejas tenant; si no, queda null (válido)
 * - Marca default si isDefault=true (el modelo desmarca las demás)
 */
export const addAddressController = async (req, res, next) => {
    try {
        const authUserId = req.userId || req?.user?._id;
        if (!authUserId) throw ERR.UNAUTHORIZED("No autenticado");

        const storeId = req.storeId || req?.tenant?.storeId || req.body.storeId || null;

        const {
            address_line1,
            address_line2 = "",
            city = "",
            state = "",
            pincode = "",           // compat
            postalCode = "",        // preferido
            country = "Bolivia",
            mobile = "",
            landmark = "",
            addressType = "home",
            fullName = "",
            email = "",
            company = "",
            taxId = "",
            isBilling = false,
            isDefault = false,
            notes = "",
            location,               // { lat, lng } opcional
        } = req.body || {};

        if (!address_line1 || typeof address_line1 !== "string") {
            throw ERR.VALIDATION({ address_line1: "requerido" });
        }

        const address = await AddressModel.create({
            storeId,
            userId: authUserId,
            fullName,
            email,
            mobile,
            address_line1,
            address_line2,
            landmark,
            city,
            state,
            country,
            postalCode: postalCode || pincode, // compatibilidad
            pincode: pincode || postalCode,
            location,
            company,
            taxId,
            isBilling: Boolean(isBilling),
            addressType,
            isDefault: Boolean(isDefault),
            notes
        });

        // Sincronizar referencia en UserModel
        await UserModel.updateOne({ _id: authUserId }, { $addToSet: { address_details: address._id } });

        return res.created(address);
    } catch (e) { return next(e); }
};

/**
 * GET /api/address
 * Lista direcciones del usuario autenticado (y tienda si aplica).
 * Query:
 *  - page, perPage
 *  - isDefault=true|false
 *  - status=true|false
 *  - q=texto (fullName, mobile, address_line1, city, state, country, postalCode)
 */
export const getAddressController = async (req, res, next) => {
    try {
        const authUserId = req.userId || req?.user?._id;
        if (!authUserId) throw ERR.UNAUTHORIZED("No autenticado");

        const storeId = req.storeId || req?.tenant?.storeId || req.query.storeId || null;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const perPage = Math.min(Math.max(parseInt(req.query.perPage) || 20, 1), 100);
        const onlyDefault = asBool(req.query.isDefault, false);
        const status = req.query.status; // "true"/"false"
        const q = (req.query.q || "").trim();

        const filter = { userId: authUserId, deletedAt: { $in: [null, undefined] } };
        if (storeId) filter.storeId = storeId;
        if (onlyDefault) filter.isDefault = true;
        if (status === "true" || status === "false") filter.status = status === "true";
        if (q) {
            filter.$or = [
                { fullName: { $regex: q, $options: "i" } },
                { mobile: { $regex: q, $options: "i" } },
                { address_line1: { $regex: q, $options: "i" } },
                { city: { $regex: q, $options: "i" } },
                { state: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } },
                { postalCode: { $regex: q, $options: "i" } },
            ];
        }

        const total = await AddressModel.countDocuments(filter);
        const skip = (page - 1) * perPage;

        const docs = await AddressModel.find(filter)
            .sort({ isDefault: -1, createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .lean();

        // Backfill: sync any orphan address IDs into user.address_details
        if (docs.length > 0) {
            const ids = docs.map((d) => d._id);
            await UserModel.updateOne(
                { _id: authUserId },
                { $addToSet: { address_details: { $each: ids } } }
            );
        }

        return res.ok(docs, {
            page, perPage, total,
            totalPages: total ? Math.ceil(total / perPage) : 0,
            hasNext: total ? page * perPage < total : false,
            hasPrev: page > 1
        });
    } catch (e) { return next(e); }
};

/**
 * GET /api/address/:id
 * Obtiene una dirección del usuario autenticado (valida ownership y store).
 */
export const getSingleAddressController = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!isValidId(id)) throw ERR.VALIDATION({ id: "inválido" });

        const authUserId = req.userId || req?.user?._id;
        if (!authUserId) throw ERR.UNAUTHORIZED("No autenticado");

        const storeId = req.storeId || req?.tenant?.storeId || req.query.storeId || null;

        const filter = { _id: id, userId: authUserId };
        if (storeId) filter.storeId = storeId;

        const address = await AddressModel.findOne(filter).lean();
        if (!address) throw ERR.NOT_FOUND("Address not found");

        return res.ok(address);
    } catch (e) { return next(e); }
};

/**
 * PUT /api/address/:id
 * Actualiza una dirección del usuario (ownership + tienda). Si isDefault=true,
 * el hook del modelo desmarca las demás del mismo user+store.
 */
export async function editAddress(req, res, next) {
    try {
        const id = req.params.id;
        if (!isValidId(id)) throw ERR.VALIDATION({ id: "inválido" });

        const authUserId = req.userId || req?.user?._id;
        if (!authUserId) throw ERR.UNAUTHORIZED("No autenticado");

        const storeId = req.storeId || req?.tenant?.storeId || null;

        const existing = await AddressModel.findOne({ _id: id, userId: authUserId, ...(storeId && { storeId }) });
        if (!existing) throw ERR.NOT_FOUND("Dirección no encontrada");

        const {
            address_line1, address_line2, city, state,
            pincode, postalCode, country, mobile,
            landmark, addressType, fullName, email,
            company, taxId, isBilling, isDefault, notes, location,
            status
        } = req.body || {};

        const $set = {};
        const assign = (k, v) => { if (typeof v !== "undefined") $set[k] = v; };

        assign("address_line1", address_line1);
        assign("address_line2", address_line2);
        assign("city", city);
        assign("state", state);
        assign("country", country);
        assign("mobile", mobile);
        assign("landmark", landmark);
        assign("addressType", addressType);
        assign("fullName", fullName);
        assign("email", email);
        assign("company", company);
        assign("taxId", taxId);
        assign("isBilling", typeof isBilling === "boolean" ? isBilling : undefined);
        assign("isDefault", typeof isDefault === "boolean" ? isDefault : undefined);
        assign("notes", notes);
        assign("location", location);
        if (typeof status === "boolean") assign("status", status);

        // Compat postal/pincode
        if (typeof postalCode !== "undefined" || typeof pincode !== "undefined") {
            $set.postalCode = postalCode || pincode || "";
            $set.pincode = pincode || postalCode || "";
        }

        const updated = await AddressModel.findByIdAndUpdate(id, { $set }, { new: true });

        return res.ok(updated);
    } catch (e) { return next(e); }
}

/**
 * DELETE /api/address/:id
 * Elimina una dirección del usuario (hard delete) o soft con ?soft=true.
 */
export const deleteAddressController = async (req, res, next) => {
    try {
        const authUserId = req.userId || req?.user?._id;
        if (!authUserId) throw ERR.UNAUTHORIZED("No autenticado");

        const _id = req.params.id;
        if (!_id || !isValidId(_id)) throw ERR.VALIDATION({ _id: "inválido" });

        const storeId = req.storeId || req?.tenant?.storeId || null;
        const soft = asBool(req.query.soft, false);

        const filter = { _id, userId: authUserId };
        if (storeId) filter.storeId = storeId;

        const existing = await AddressModel.findOne(filter);
        if (!existing) throw ERR.NOT_FOUND("The address in the database is not found");

        let result;
        if (soft) {
            result = await AddressModel.updateOne({ _id }, { $set: { deletedAt: new Date(), status: false, isDefault: false } });
        } else {
            result = await AddressModel.deleteOne({ _id });
        }

        // Remove reference from user's address_details array
        await UserModel.updateOne({ _id: authUserId }, { $pull: { address_details: _id } });

        return res.ok({ archived: soft, result });
    } catch (e) { return next(e); }
};

export async function setDefaultAddress(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) throw ERR.VALIDATION({ id: "inválido" });

        const userId = req.userId || req?.user?._id;
        if (!userId) throw ERR.UNAUTHORIZED("No autenticado");

        const storeId = req.storeId || req?.tenant?.storeId || null;

        // Verifica ownership (y tienda si aplica)
        const filter = { _id: id, userId };
        if (storeId) filter.storeId = storeId;

        const doc = await AddressModel.findOne(filter);
        if (!doc) throw ERR.NOT_FOUND("Dirección no encontrada");

        // Marcar como default → el hook post('save') del modelo desmarca las demás
        doc.isDefault = true;
        await doc.save();

        return res.ok(doc);
    } catch (e) { return next(e); }
}
