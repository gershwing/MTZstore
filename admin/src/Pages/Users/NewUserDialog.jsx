// admin/src/Pages/Users/NewUserDialog.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, FormControl, InputLabel, Select
} from "@mui/material";
import usePermission from "../../hooks/usePermission";
import { inviteUser } from "../../services/adminUsers";
import toast from "react-hot-toast";

const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "STORE_OWNER",
  "FINANCE_MANAGER",
  "INVENTORY_MANAGER",
  "ORDER_MANAGER",
  "DELIVERY_AGENT",
  "SUPPORT_AGENT",
  "CUSTOMER",
];

export default function NewUserDialog({ open, onClose, stores = [] }) {
  const perm = usePermission();
  const canInvite = perm.any(["user:invite"]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    platformRole: "CUSTOMER",
    assignStoreId: "",
    storeRole: "",
  });

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async () => {
    if (!canInvite) return toast.error("No tienes permiso para invitar usuarios");
    if (!form.email) return toast.error("Email requerido");
    setLoading(true);
    try {
      await inviteUser({
        email: form.email,
        fullName: form.fullName,
        platformRole: form.platformRole,
        membership:
          form.assignStoreId && form.storeRole
            ? { storeId: form.assignStoreId, role: form.storeRole }
            : null,
      });
      toast.success("Usuario creado/invitado");
      onClose?.(true);
    } catch (err) {
      toast.error(err?.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose?.(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Crear / Invitar usuario</DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-1 gap-4 py-2">
          <TextField label="Email *" type="email" value={form.email} onChange={handleChange("email")} fullWidth />
          <TextField label="Nombre completo" value={form.fullName} onChange={handleChange("fullName")} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Rol plataforma</InputLabel>
            <Select label="Rol plataforma" value={form.platformRole} onChange={handleChange("platformRole")}>
              {PLATFORM_ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth>
              <InputLabel>Asignar a tienda</InputLabel>
              <Select
                label="Asignar a tienda"
                value={form.assignStoreId}
                onChange={handleChange("assignStoreId")}
              >
                <MenuItem value="">(Ninguna)</MenuItem>
                {stores.map((s) => (
                  <MenuItem key={s._id || s.value} value={s._id || s.value}>
                    {s.name || s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!form.assignStoreId}>
              <InputLabel>Rol en tienda</InputLabel>
              <Select label="Rol en tienda" value={form.storeRole} onChange={handleChange("storeRole")}>
                <MenuItem value="">(Ninguno)</MenuItem>
                {PLATFORM_ROLES
                  .filter((r) => r !== "SUPER_ADMIN" && r !== "CUSTOMER")
                  .map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose?.(false)} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
