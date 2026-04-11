// server/scripts/migrate-add-storeId.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import Product from "../models/product.model.js"; // ⬅️ fix: model (no 'modal')
import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import User from "../models/user.model.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DEFAULT_STORE_ID = process.env.DEFAULT_STORE_ID; // opcional

// Busca/crea tienda por defecto evitando disparar hooks que toquen User
async function getDefaultStoreId() {
  // 1) Si hay DEFAULT_STORE_ID en .env, úsalo
  if (DEFAULT_STORE_ID) {
    const s = await Store.findById(DEFAULT_STORE_ID).lean();
    if (!s) throw new Error(`DEFAULT_STORE_ID no existe en stores: ${DEFAULT_STORE_ID}`);
    return s._id;
  }

  // 2) ¿Existe ya “Tienda General”?
  //    Usamos status:'active' para ser coherentes con withTenant
  let s = await Store.findOne({ name: "Tienda General", status: "active" })
    .select("_id")
    .lean();
  if (s?._id) return s._id;

  // 3) Preparar un ownerId existente (si tu Store lo requiere). Tomamos un ADMIN si hay, si no, el primer usuario.
  const admin = await User.findOne({ role: "ADMIN" }).select("_id").lean().catch(() => null);
  const anyUser = admin || (await User.findOne({}).select("_id").lean().catch(() => null));
  const ownerId = anyUser?._id || null;

  // 4) Intento 1: crear con Mongoose (si tu Store NO dispara hooks que creen User, esto basta)
  try {
    const payload = ownerId
      ? { name: "Tienda General", status: "active", ownerId }
      : { name: "Tienda General", status: "active" };
    const created = await Store.create(payload);
    return created._id;
  } catch (e) {
    // 5) Fallback duro: insertar directo en la colección para saltar validaciones/hooks
    const doc = { name: "Tienda General", status: "active" };
    if (ownerId) doc.ownerId = ownerId;
    const res = await mongoose.connection.collection("stores").insertOne(doc);
    if (!res.insertedId) throw new Error("No se pudo crear la tienda por defecto (insertOne sin insertedId)");
    return res.insertedId;
  }
}

async function backfillProductsStoreId(storeId) {
  const filter = { $or: [{ storeId: { $exists: false } }, { storeId: null }] };
  const total = await Product.countDocuments(filter);
  if (!total) return console.log("✅ Productos: todos ya tienen storeId");
  const r = await Product.updateMany(filter, { $set: { storeId } });
  console.log(`🛠️ Productos sin storeId actualizados: ${r.modifiedCount}/${total}`);
}

async function backfillOrdersProductsStore(storeId) {
  const cursor = Order.find({
    products: { $elemMatch: { $or: [{ storeId: { $exists: false } }, { storeId: null }] } },
  }).cursor();

  let touched = 0;
  for await (const ord of cursor) {
    let changed = false;
    for (const line of ord.products || []) {
      if (!line.storeId) {
        if (line.productId) {
          const p = await Product.findById(line.productId).select("storeId").lean();
          line.storeId = p?.storeId ?? storeId;
        } else {
          line.storeId = storeId;
        }
        changed = true;
      }
    }
    if (changed) {
      await ord.save();
      touched++;
    }
  }
  console.log(`🧾 Órdenes con líneas sin storeId actualizadas: ${touched}`);
}

async function backfillSellersStore(storeId) {
  // No creamos tiendas nuevas; solo asignamos la tienda por defecto a SELLERs sin storeId
  const filter = { role: "SELLER", $or: [{ storeId: { $exists: false } }, { storeId: null }] };
  const sellers = await User.find(filter).select("_id").lean();
  if (!sellers.length) return console.log("✅ SELLERs: todos ya tienen storeId");
  const r = await User.updateMany(
    { _id: { $in: sellers.map((s) => s._id) } },
    { $set: { storeId } }
  );
  console.log(`👤 SELLERs sin storeId actualizados: ${r.modifiedCount}/${sellers.length}`);
}

async function main() {
  try {
    if (!MONGO_URI) throw new Error("Falta MONGO_URI/MONGODB_URI en .env");

    await mongoose.connect(MONGO_URI, { autoIndex: false });
    console.log("✅ Conectado a Mongo");

    const defStoreId = await getDefaultStoreId();

    await backfillProductsStoreId(defStoreId);
    await backfillOrdersProductsStore(defStoreId);
    await backfillSellersStore(defStoreId);

    await Promise.all([
      Product.syncIndexes(),
      Order.syncIndexes(),
      Store.syncIndexes(),
      User.syncIndexes(),
    ]);
    console.log("✅ Índices sincronizados");

    await mongoose.disconnect();
    console.log("🏁 Migración completada");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en migración:", err);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
  }
}

main();
