import mongoose from "mongoose";

const PermissionOverrideSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true, index: true }, // e.g. 'ORDER_MANAGER'
  added: { type: [String], default: [] },    // permisos extra
  removed: { type: [String], default: [] },  // permisos revocados
}, { timestamps: true });

export default mongoose.model("PermissionOverride", PermissionOverrideSchema);
