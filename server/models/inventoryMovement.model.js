import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Movimientos atómicos de inventario (auditable).
 * Acción y cantidades SIEMPRE positivas; el signo lo determina la acción.
 */
export const INVENTORY_ACTIONS = ["ADJUST", "RESERVE", "RELEASE", "MOVE", "RECEIVE", "DISPATCH"];

const movementSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true, required: true },

    action: { type: String, enum: INVENTORY_ACTIONS, required: true },

    // Para MOVE: origen → destino; para otras: sólo locationTo
    locationFrom: { type: String, default: "" },
    locationTo: { type: String, default: "" },

    // Cantidades “crudas” de la acción
    qty: { type: Number, min: 0, required: true }, // p.ej. 5

    // Campo libre para vincular reservas a órdenes, etc.
    refType: { type: String, default: "" }, // "ORDER" | "MANUAL" | ...
    refId: { type: String, default: "" },

    // Snapshot opcional (para consultas rápidas)
    notes: { type: String, default: "" },

    // Auditoría
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

movementSchema.index({ productId: 1, storeId: 1, createdAt: -1 });

const InventoryMovement =
  mongoose.models.InventoryMovement || mongoose.model("InventoryMovement", movementSchema);

export default InventoryMovement;
