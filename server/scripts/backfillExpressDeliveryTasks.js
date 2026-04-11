// server/scripts/backfillExpressDeliveryTasks.js
// Crea/actualiza DeliveryTask para ordenes Express existentes.
// Uso: node --env-file=.env scripts/backfillExpressDeliveryTasks.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import Order from "../models/order.model.js";
import DeliveryTask from "../models/deliveryTask.model.js";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Conectado.\n");

  // 1) Buscar ordenes Express
  const expressOrders = await Order.find({ shippingMethod: "MTZSTORE_EXPRESS" })
    .select("_id storeId userId delivery_address shippingMethod")
    .lean();

  console.log(`Ordenes con shippingMethod=MTZSTORE_EXPRESS: ${expressOrders.length}`);

  if (expressOrders.length === 0) {
    console.log("No hay ordenes Express. Nada que hacer.");
    await mongoose.disconnect();
    return;
  }

  // 2) Procesar cada orden: crear si no existe, actualizar nombre si falta
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const order of expressOrders) {
    try {
      // Obtener nombre del usuario
      const user = await User.findById(order.userId).select("name").lean();
      const userName = user?.name || "";

      // Obtener dirección
      let address = {};
      if (order.delivery_address) {
        const addr = await Address.findById(order.delivery_address).lean();
        if (addr) {
          address = {
            name: addr.fullName || userName,
            phone: addr.mobile || "",
            line1: addr.address_line1 || "",
            line2: addr.address_line2 || "",
            city: addr.city || "",
            state: addr.state || "",
            zip: addr.postalCode || "",
            country: addr.country || "Bolivia",
            notes: addr.landmark || addr.notes || "",
            geo: addr.location || {},
          };
        }
      }
      if (!address.name) address.name = userName;

      // Buscar DeliveryTask existente
      const existing = await DeliveryTask.findOne({ orderId: order._id });

      if (!existing) {
        // Crear nuevo
        await DeliveryTask.create({
          storeId: order.storeId,
          orderId: order._id,
          status: "PENDING",
          address,
          timeline: [
            {
              type: "CREATED",
              by: order.userId,
              note: "Backfill: orden Express existente",
              at: new Date(),
            },
          ],
        });
        created++;
        console.log(`  + DeliveryTask creado para orden ${order._id} (${userName})`);
      } else if (!existing.address?.name && userName) {
        // Actualizar nombre si falta
        existing.address = { ...existing.address?.toObject?.() || existing.address || {}, name: userName };
        await existing.save();
        updated++;
        console.log(`  ~ Nombre actualizado para orden ${order._id} → ${userName}`);
      } else {
        console.log(`  = Orden ${order._id} ya tiene DeliveryTask con nombre: "${existing.address?.name}"`);
      }
    } catch (err) {
      errors++;
      console.error(`  x Error en orden ${order._id}:`, err.message);
    }
  }

  console.log(`\nResultado: ${created} creados, ${updated} actualizados, ${errors} errores.`);
  await mongoose.disconnect();
  console.log("Desconectado.");
}

run().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
