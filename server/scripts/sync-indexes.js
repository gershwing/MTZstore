import mongoose from "mongoose";
import dotenv from "dotenv";

// cargar variables de entorno
dotenv.config({ path: "./.env" });

// importa tus modelos para registrarlos
import "../models/user.model.js";
import "../models/product.modal.js"; // ojo: corrige al nombre real
import "../models/order.model.js";   // corrige al nombre real

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido en .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("DB connected ✅");

    for (const name of mongoose.modelNames()) {
      const Model = mongoose.model(name);
      console.log("Syncing indexes for:", name);
      await Model.syncIndexes();
    }

    console.log("All indexes synced ✅");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error syncing indexes:", err);
    process.exit(1);
  }
})();
