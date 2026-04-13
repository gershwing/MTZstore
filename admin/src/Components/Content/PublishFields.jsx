// admin/src/components/Content/PublishFields.jsx
import React from "react";
import { MenuItem, Select, TextField, FormControl, InputLabel } from "@mui/material";

/**
 * Props:
 * - mode: "banner" | "slider" | "blog"
 * - value: { status, visibility, publishAt, expireAt, publishedAt, unpublishAt }
 * - onChange: (patch) => void
 * - disabled: boolean
 */
const STATUS = [
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];
const VISIBILITY = [
  { value: "public", label: "Público" },
  { value: "private", label: "Privado" },
  { value: "unlisted", label: "No listado" },
];

export default function PublishFields({ mode = "banner", value = {}, onChange, disabled = false }) {
  const v = value || {};
  const isBlog = mode === "blog";
  const isMarketing = mode === "banner" || mode === "slider"; // Banners/Sliders

  const handle = (field) => (e) => onChange?.({ [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <FormControl size="small" fullWidth>
        <InputLabel>Estado</InputLabel>
        <Select
          label="Estado"
          value={v.status ?? "draft"}
          onChange={handle("status")}
          disabled={disabled}
        >
          {STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>Visibilidad</InputLabel>
        <Select
          label="Visibilidad"
          value={v.visibility ?? "public"}
          onChange={handle("visibility")}
          disabled={disabled}
        >
          {VISIBILITY.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </Select>
      </FormControl>

      {isMarketing && (
        <>
          <TextField
            size="small"
            type="datetime-local"
            label="Publicar desde"
            value={v.publishAt ?? ""}
            onChange={handle("publishAt")}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            fullWidth
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Ocultar desde"
            value={v.expireAt ?? ""}
            onChange={handle("expireAt")}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            fullWidth
          />
        </>
      )}

      {isBlog && (
        <>
          <TextField
            size="small"
            type="datetime-local"
            label="Fecha de publicación (publishedAt)"
            value={v.publishedAt ?? ""}
            onChange={handle("publishedAt")}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            fullWidth
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Despublicar desde (unpublishAt) — opcional"
            value={v.unpublishAt ?? ""}
            onChange={handle("unpublishAt")}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            fullWidth
          />
        </>
      )}
    </div>
  );
}
