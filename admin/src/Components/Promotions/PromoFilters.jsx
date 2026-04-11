// admin/src/Components/Promotions/PromoFilters.jsx
import React from "react";
import { TextField, MenuItem, Select, InputLabel, FormControl, Button } from "@mui/material";

export default function PromoFilters({ values, onChange, onSubmit }) {
  const { q = "", status = "" } = values || {};
  return (
    <div className="flex items-center gap-3 mb-4">
      <TextField size="small" label="Buscar" value={q} onChange={(e) => onChange({ ...values, q: e.target.value })} />
      <FormControl size="small">
        <InputLabel>Estado</InputLabel>
        <Select label="Estado" value={status} onChange={(e) => onChange({ ...values, status: e.target.value })} style={{ minWidth: 160 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="PAUSED">Paused</MenuItem>
          <MenuItem value="EXPIRED">Expired</MenuItem>
        </Select>
      </FormControl>
      <Button variant="outlined" onClick={onSubmit}>Aplicar filtros</Button>
    </div>
  );
}