// admin/src/components/Filters/ContentFilters.jsx
import React from "react";
import { TextField, MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";

/**
 * Props:
 *  - value: { q, status, storeId, dateFrom, dateTo }
 *  - onChange: (patch) => void
 *  - storeOptions?: Array<{ value: string, label: string }>
 *  - showDates?: boolean        // por defecto true
 *  - showStore?: boolean        // por defecto true si hay storeOptions
 *  - showSearch?: boolean       // por defecto true
 *  - extra?: React.ReactNode    // para inyectar controles extra
 */
const STATUS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

export default function ContentFilters({
  value = {},
  onChange,
  storeOptions = [],
  showDates = true,
  showStore = undefined,
  showSearch = true,
  extra,
}) {
  const v = { q: "", status: "", storeId: "", dateFrom: "", dateTo: "", ...value };
  const _showStore = showStore ?? (storeOptions?.length > 0);

  const patch = (field) => (e) => onChange?.({ [field]: e.target.value });

  const clear = () => {
    onChange?.({ q: "", status: "", storeId: "", dateFrom: "", dateTo: "" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {showSearch && (
          <TextField
            size="small"
            label="Buscar (título/texto)"
            value={v.q}
            onChange={patch("q")}
            fullWidth
          />
        )}

        <FormControl size="small" fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select label="Estado" value={v.status} onChange={patch("status")}>
            {STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>

        {_showStore && (
          <FormControl size="small" fullWidth>
            <InputLabel>Tienda</InputLabel>
            <Select label="Tienda" value={v.storeId} onChange={patch("storeId")}>
              <MenuItem value="">Todas</MenuItem>
              {storeOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showDates && (
          <>
            <TextField
              size="small"
              type="datetime-local"
              label="Desde"
              value={v.dateFrom}
              onChange={patch("dateFrom")}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              size="small"
              type="datetime-local"
              label="Hasta"
              value={v.dateTo}
              onChange={patch("dateTo")}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </>
        )}

        <div className="flex items-center gap-2">
          <Button className="btn" variant="outlined" onClick={clear}>Limpiar</Button>
          {extra}
        </div>
      </div>
    </div>
  );
}
