// admin/src/Components/Support/InternalNoteEditor.jsx
import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

export default function InternalNoteEditor({ onSubmit }) {
  const [note, setNote] = useState("");
  return (
    <div className="flex gap-2 items-start">
      <TextField fullWidth multiline minRows={2} placeholder="Nota interna (no visible para el cliente)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button variant="outlined" onClick={() => { onSubmit && onSubmit(note); setNote(""); }}>Guardar nota</Button>
    </div>
  );
}