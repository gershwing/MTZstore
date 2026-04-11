// server/scripts/fixDeliveryAgentRoles.js
// Busca DeliveryApplications aprobadas y asigna platformRole="DELIVERY_AGENT" a los usuarios.
// Uso: node --env-file=.env scripts/fixDeliveryAgentRoles.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import DeliveryApplication from "../models/deliveryApplication.model.js";
import User from "../models/user.model.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Conectado.\n");

  const approved = await DeliveryApplication.find({ status: "APPROVED" })
    .select("userId fullName")
    .lean();

  console.log(`Postulaciones aprobadas: ${approved.length}`);

  let fixed = 0;
  let already = 0;
  let errors = 0;

  for (const app of approved) {
    try {
      const user = await User.findById(app.userId);
      if (!user) {
        console.log(`  ? Usuario ${app.userId} no encontrado (${app.fullName})`);
        continue;
      }

      if (user.platformRole === "DELIVERY_AGENT") {
        already++;
        console.log(`  = ${user.name || user.email} ya tiene platformRole=DELIVERY_AGENT`);
        continue;
      }

      const prev = user.platformRole || "(sin rol)";
      user.platformRole = "DELIVERY_AGENT";
      await user.save();
      fixed++;
      console.log(`  + ${user.name || user.email}: ${prev} → DELIVERY_AGENT`);
    } catch (err) {
      errors++;
      console.error(`  x Error con userId ${app.userId}:`, err.message);
    }
  }

  console.log(`\nResultado: ${fixed} corregidos, ${already} ya correctos, ${errors} errores.`);
  await mongoose.disconnect();
  console.log("Desconectado.");
}

run().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
