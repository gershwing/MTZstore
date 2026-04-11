import React, { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Checkbox,
  RadioGroup, Radio, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { createAdminUser } from "../../services/adminUsers";
import StorePicker from "../StorePicker";

const STAFF_ROLES = [
  { value: "ORDER_MANAGER", label: "Gestor de Órdenes" },
  { value: "INVENTORY_MANAGER", label: "Almacén / Inventario" },
  { value: "DELIVERY_AGENT", label: "Delivery" },
  { value: "SUPPORT_AGENT", label: "Soporte" },
  { value: "FINANCE_MANAGER", label: "Finanzas" },
];

export default function NewUserDialog({ open, onClose, onCreated, isPlatform }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("CUSTOMER"); // SUPER | OWNER | STAFF | CUSTOMER
  const [createStore, setCreateStore] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [storeId, setStoreId] = useState(null);

  const canSubmit = useMemo(() => {
    if (!name || !email) return false;
    if (accountType !== "SUPER" && !password) return false;
    if (accountType === "OWNER" && createStore) return !!storeName && !!storeSlug;
    if (accountType === "STAFF") return !!staffRole && !!storeId;
    return true;
  }, [name, email, password, accountType, createStore, storeName, storeSlug, staffRole, storeId]);

  async function onSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const payload = { name, email, password, accountType };
      if (accountType === "OWNER") {
        payload.createStore = !!createStore;
        if (createStore) payload.store = { name: storeName, slug: storeSlug };
      } else if (accountType === "STAFF") {
        payload.role = staffRole;
        payload.storeId = storeId;
      }
      const res = await createAdminUser(payload);
      onCreated?.(res?.user || res);
      onClose?.();
      // reset
      setName(""); setEmail(""); setPassword("");
      setAccountType("CUSTOMER");
      setCreateStore(false); setStoreName(""); setStoreSlug("");
      setStaffRole(""); setStoreId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear nuevo usuario</DialogTitle>
      <DialogContent dividers>
        {error && <p style={{ color: "tomato", marginTop: 0 }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <TextField label="Nombre" fullWidth margin="dense" value={name} onChange={e => setName(e.target.value)} />
          <TextField label="Email" type="email" fullWidth margin="dense" value={email} onChange={e => setEmail(e.target.value)} />
          {accountType !== "SUPER" && (
            <TextField label="Contraseña" type="password" fullWidth margin="dense" value={password} onChange={e => setPassword(e.target.value)} />
          )}

          <RadioGroup row value={accountType} onChange={e => setAccountType(e.target.value)} style={{ marginTop: 12 }}>
            {isPlatform && <FormControlLabel value="SUPER" control={<Radio />} label="Súper admin" />}
            <FormControlLabel value="OWNER" control={<Radio />} label="Dueño de tienda" />
            <FormControlLabel value="STAFF" control={<Radio />} label="Staff de tienda" />
            <FormControlLabel value="CUSTOMER" control={<Radio />} label="Cliente" />
          </RadioGroup>

          {accountType === "OWNER" && (
            <>
              <FormControlLabel control={<Checkbox checked={createStore} onChange={e => setCreateStore(e.target.checked)} />} label="Crear una tienda nueva junto con el usuario" />
              {createStore && (
                <>
                  <TextField label="Nombre de la tienda" fullWidth margin="dense" value={storeName} onChange={e => setStoreName(e.target.value)} />
                  <TextField label="Slug de la tienda" fullWidth margin="dense" helperText="minúsculas y guiones" value={storeSlug} onChange={e => setStoreSlug(e.target.value)} />
                </>
              )}
            </>
          )}

          {accountType === "STAFF" && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="staff-role">Rol</InputLabel>
                <Select labelId="staff-role" label="Rol" value={staffRole} onChange={e => setStaffRole(e.target.value)}>
                  {STAFF_ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
              <div style={{ marginTop: 8 }}>
                <StorePicker value={storeId} onChange={setStoreId} allowClear={false} label="Asignar a tienda" />
              </div>
            </>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={!canSubmit || loading} variant="contained">
          {loading ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
