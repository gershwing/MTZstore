import React, { useEffect, useMemo, useState } from "react";
import { fetchRoles, fetchStaticMap, fetchEffectiveMap, fetchOverlay, updateOverlay } from "../../services/permissionsAdmin";
import { Button, Checkbox, FormControlLabel, MenuItem, Select } from "@mui/material";
import toast from "react-hot-toast";

export default function PermissionsPanelPage() {
  const [roles, setRoles] = useState([]);
  const [staticMap, setStaticMap] = useState({});
  const [effectiveMap, setEffectiveMap] = useState({});
  const [role, setRole] = useState("");
  const [overlay, setOverlay] = useState({ role: "", added: [], removed: [] });
  const [allPerms, setAllPerms] = useState([]); // universo de permisos
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetchRoles();
      const m = await fetchStaticMap();
      const e = await fetchEffectiveMap();
      setRoles(r);
      setStaticMap(m);
      setEffectiveMap(e);

      // universo de permisos = unión de todos
      const uni = new Set();
      Object.values(m || {}).forEach(list => (list || []).forEach(p => uni.add(p)));
      Object.values(e || {}).forEach(list => (list || []).forEach(p => uni.add(p)));
      setAllPerms(Array.from(uni).sort());
    })();
  }, []);

  const loadOverlay = async (ro) => {
    if (!ro) return;
    const ov = await fetchOverlay(ro);
    setOverlay(ov || { role: ro, added: [], removed: [] });
  };

  const currentEffective = useMemo(() => effectiveMap?.[role] || [], [effectiveMap, role]);
  const baseStatic = useMemo(() => staticMap?.[role] || [], [staticMap, role]);
  const toggled = new Set([...currentEffective]); // comienzas de lo efectivo

  const isChecked = (perm) => toggled.has(perm);
  const onToggle = (perm) => {
    const inBase = baseStatic.includes(perm);
    const isOn = isChecked(perm);
    const nextOverlay = { ...overlay, added: [...overlay.added], removed: [...overlay.removed] };

    if (inBase) {
      // si venía de mapa estático, check = quitar de removed, uncheck = agregar a removed
      if (isOn) {
        // lo apagan => marcar removed si existe en base o quitar de added si estaba
        if (!nextOverlay.removed.includes(perm)) nextOverlay.removed.push(perm);
        nextOverlay.added = nextOverlay.added.filter(x => x !== perm);
      } else {
        // lo encienden => sacar de removed
        nextOverlay.removed = nextOverlay.removed.filter(x => x !== perm);
      }
    } else {
      // si NO está en base, check = agregar a added, uncheck = quitar de added
      if (isOn) {
        // lo apagan => quitar de added
        nextOverlay.added = nextOverlay.added.filter(x => x !== perm);
      } else {
        // lo encienden => agregar a added
        if (!nextOverlay.added.includes(perm)) nextOverlay.added.push(perm);
      }
    }
    setOverlay(nextOverlay);
    // también simula visualmente el cambio en efectivo local:
    const nextEff = new Set(currentEffective);
    if (isOn) nextEff.delete(perm); else nextEff.add(perm);
    setEffectiveMap(s => ({ ...s, [role]: Array.from(nextEff).sort() }));
  };

  const save = async () => {
    if (!role) return;
    setLoading(true);
    try {
      await updateOverlay(role, { added: overlay.added, removed: overlay.removed });
      toast.success("Permisos actualizados");
    } catch (e) {
      toast.error(e?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Panel de Permisos (SUPER_ADMIN)</h1>

      <div className="flex items-center gap-3">
        <Select size="small" value={role} displayEmpty onChange={e => { setRole(e.target.value); loadOverlay(e.target.value); }}>
          <MenuItem value="">(elige un rol)</MenuItem>
          {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
        <Button size="small" variant="contained" disabled={!role || loading} onClick={save}>Guardar cambios</Button>
      </div>

      {!!role && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {allPerms.map(perm => (
            <FormControlLabel
              key={perm}
              control={<Checkbox checked={isChecked(perm)} onChange={() => onToggle(perm)} />}
              label={perm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
