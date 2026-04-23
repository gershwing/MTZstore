// server/models/deliveryRoute.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const DeliveryRouteSchema = new Schema(
  {
    // Contexto de tienda (null = plataforma MTZSTORE_*)
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null, index: true },

    // Repartidor asignado
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Estado de la ruta
    status: {
      type: String,
      enum: ["CREATED", "IN_PROGRESS", "COMPLETED", "PARTIAL"],
      default: "CREATED",
      index: true,
    },

    // Tareas (paradas) de la ruta
    tasks: [{ type: Schema.Types.ObjectId, ref: "DeliveryTask" }],

    // Estadísticas (se actualizan al cambiar status de tasks)
    stats: {
      totalStops: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },

    // Quién creó la ruta
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Nota del admin
    note: { type: String, default: "" },

    // Timestamps de ejecución
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

DeliveryRouteSchema.index({ agentId: 1, status: 1 });
DeliveryRouteSchema.index({ status: 1, createdAt: -1 });

const DeliveryRoute =
  mongoose.models.DeliveryRoute ||
  mongoose.model("DeliveryRoute", DeliveryRouteSchema);

export default DeliveryRoute;
