import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { api } from "../../utils/api";
import { assignDelivery } from "../../services/delivery";

export default function AssignModal({ open, onClose, taskId, onAssigned }) {
  const [agents, setAgents] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    // Trae usuarios con rol DELIVERY_AGENT; si ya tienes endpoint, cámbialo aquí:
    api.get("/api/admin/users", {
      params: { role: "DELIVERY_AGENT", limit: 50 },
      __noTenant: true,
    }).then(({ data: res }) => {
      setAgents(Array.isArray(res?.data) ? res.data : []);
    });
  }, [open]);

  const submit = async () => {
    if (!taskId || !assigneeId) return;
    const res = await assignDelivery(taskId, { assigneeId, note });
    if (res?.error === false) {
      onAssigned?.(res);
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar repartidor</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          select fullWidth size="small" label="Repartidor"
          value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
        >
          {agents.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.name || u.email} {u.phone ? `— ${u.phone}` : ""}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          multiline minRows={2} fullWidth size="small"
          label="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Asignar</Button>
      </DialogActions>
    </Dialog>
  );
}
