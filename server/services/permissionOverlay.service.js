import PermissionOverride from "../models/permissionOverride.model.js";
import { PERMISSIONS } from "../config/permissions.js";
import { ALL_ROLES } from "../config/roles.js";

export async function getEffectivePermissionsMap() {
  const base = PERMISSIONS; // mapa estático
  const overlays = await PermissionOverride.find({}).lean();

  const map = {};
  for (const role of ALL_ROLES) {
    const baseList = Array.isArray(base[role]) ? [...base[role]] : [];
    const ov = overlays.find(o => o.role === role) || { added: [], removed: [] };
    const set = new Set(baseList);
    (ov.added || []).forEach(p => set.add(p));
    (ov.removed || []).forEach(p => set.delete(p));
    map[role] = Array.from(set).sort();
  }
  return map;
}

export async function getOverlay(role) {
  const doc = await PermissionOverride.findOne({ role }).lean();
  return doc || { role, added: [], removed: [] };
}

export async function upsertOverlay(role, { added = [], removed = [] }) {
  return await PermissionOverride.findOneAndUpdate(
    { role },
    { $set: { added, removed } },
    { new: true, upsert: true }
  );
}
