import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const STATUSES = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"];

export default function DeliveryStatusSelect({ value, onChange, disabled = false, label = "Estado" }) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
        {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replaceAll("_", " ")}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
