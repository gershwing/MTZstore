/**
 * Seed de tarifas de envío por defecto.
 * Ejecutar: node --env-file=.env scripts/seedShippingRates.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const rates = [
  {
    method: "MTZSTORE_EXPRESS",
    zone: "DEFAULT",
    baseRate: 15,
    perKgRate: 3,
    freeAbove: 500,
    estimatedDays: { min: 0, max: 1 },
    active: true,
  },
  {
    method: "MTZSTORE_STANDARD",
    zone: "DEFAULT",
    baseRate: 5,
    perKgRate: 1.5,
    freeAbove: 200,
    estimatedDays: { min: 1, max: 3 },
    active: true,
  },
  {
    method: "STORE_EXPRESS",
    zone: "DEFAULT",
    baseRate: 0,
    perKgRate: 0,
    freeAbove: 0,
    estimatedDays: { min: 1, max: 2 },
    active: true,
  },
  {
    method: "STORE_STANDARD",
    zone: "DEFAULT",
    baseRate: 0,
    perKgRate: 0,
    freeAbove: 0,
    estimatedDays: { min: 3, max: 5 },
    active: true,
  },
  // Legacy "STORE" eliminado — reemplazado por STORE_EXPRESS y STORE_STANDARD
];

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI no está definido en .env");
  await mongoose.connect(MONGODB_URI);
  console.log("Conectado a MongoDB");

  const col = mongoose.connection.collection("shippingrates");

  for (const rate of rates) {
    const filter = { method: rate.method, zone: rate.zone };
    const result = await col.updateOne(filter, { $setOnInsert: rate }, { upsert: true });
    if (result.upsertedCount) {
      console.log(`Creada tarifa: ${rate.method} / ${rate.zone}`);
    } else {
      console.log(`Ya existe: ${rate.method} / ${rate.zone} (no se modificó)`);
    }
  }

  await mongoose.disconnect();
  console.log("Seed completado.");
}

main().catch((e) => { console.error(e); process.exit(1); });
