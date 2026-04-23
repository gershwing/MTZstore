// server/scripts/migrate-delivery-agents.js
// Crea DeliveryAgentProfile para agentes aprobados existentes.
// Idempotente: si el perfil ya existe, solo actualiza stats sin duplicar.
// Uso: node --env-file=.env scripts/migrate-delivery-agents.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "./.env" });

import User from "../models/user.model.js";
import DeliveryApplication from "../models/deliveryApplication.model.js";
import DeliveryAgentProfile from "../models/deliveryAgentProfile.model.js";
import DeliveryTask from "../models/deliveryTask.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Conectado.\n");

  // 1. Buscar agentes: platformRole o memberships con DELIVERY_AGENT
  const agents = await User.find({
    $or: [
      { platformRole: "DELIVERY_AGENT" },
      { "memberships.role": "DELIVERY_AGENT" },
    ],
  })
    .select("_id name email platformRole memberships")
    .lean();

  console.log(`Agentes encontrados: ${agents.length}\n`);

  let created = 0;
  let skipped = 0;
  let appUpdated = 0;
  let errors = 0;
  const details = [];

  for (const agent of agents) {
    const label = agent.name || agent.email || String(agent._id);
    try {
      // 2a. Si ya tiene perfil, skip
      const existing = await DeliveryAgentProfile.findOne({ userId: agent._id });
      if (existing) {
        skipped++;
        console.log(`  = ${label} — perfil ya existe, skip`);
        details.push({ userId: String(agent._id), label, action: "skipped" });
        continue;
      }

      // 2b. Buscar su DeliveryApplication
      const app = await DeliveryApplication.findOne({ userId: agent._id }).lean();

      // 2c. Contar entregas completadas
      const [totalDelivered, totalExpress] = await Promise.all([
        DeliveryTask.countDocuments({ assigneeId: agent._id, status: "DELIVERED" }),
        DeliveryTask.countDocuments({
          assigneeId: agent._id,
          status: "DELIVERED",
          shippingMethod: "MTZSTORE_EXPRESS",
        }),
      ]);

      // 2d. Construir vehículo express desde la application legacy
      let vehicleExpress = null;
      if (app) {
        vehicleExpress = {
          vehicleType: app.vehicleType || "Moto",
          licensePlate: app.plateNumber || undefined,
          licensePhotoUrl: app.licenseUrl || undefined,
        };
      }

      // 2e. Crear perfil
      await DeliveryAgentProfile.create({
        userId: agent._id,
        approvedServiceTypes: ["express"],
        platformTrustLevel: "BASIC",
        status: "ACTIVE",
        vehicles: {
          express: vehicleExpress,
          standard: null,
        },
        stats: {
          totalDeliveries: totalDelivered,
          totalExpress: totalExpress,
          totalStandard: totalDelivered - totalExpress,
        },
      });

      created++;
      console.log(`  + ${label} — perfil creado (${totalDelivered} entregas)`);
      details.push({
        userId: String(agent._id),
        label,
        action: "created",
        totalDelivered,
        totalExpress,
      });

      // 2f. Actualizar DeliveryApplication con campos V2
      if (app) {
        const update = {
          serviceTypesRequested: ["express"],
          approvedServiceTypes: app.status === "APPROVED" ? ["express"] : [],
        };

        // Copiar datos legacy al bloque vehicleExpress si no existe
        if (!app.vehicleExpress?.vehicleType) {
          update.vehicleExpress = {
            vehicleType: app.vehicleType || "Moto",
            licensePlate: app.plateNumber || undefined,
            licensePhotoUrl: app.licenseUrl || undefined,
          };
        }

        await DeliveryApplication.updateOne({ _id: app._id }, { $set: update });
        appUpdated++;
      }
    } catch (err) {
      errors++;
      console.error(`  x Error con ${label}:`, err.message);
      details.push({ userId: String(agent._id), label, action: "error", error: err.message });
    }
  }

  // 3. Resumen
  const summary = {
    date: new Date().toISOString(),
    total: agents.length,
    created,
    skipped,
    appUpdated,
    errors,
    details,
  };

  console.log(`\nResultado: ${created} creados, ${skipped} ya existían, ${appUpdated} apps actualizadas, ${errors} errores.`);

  // 4. Guardar log
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logFile = path.join(logsDir, `migrate-delivery-agents-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(logFile, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`Log guardado en: ${logFile}`);

  await mongoose.disconnect();
  console.log("Desconectado.");
}

run().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
