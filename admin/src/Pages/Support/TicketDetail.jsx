// admin/src/Pages/Support/TicketDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicket, replyTicket, closeTicket, markSeen } from "../../services/support";
import { Button, TextField } from "@mui/material";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t, setT] = useState(null);
  const [text, setText] = useState("");
  const fileRef = useRef();

  async function fetch() {
    const res = await getTicket(id);
    const data = res?.data || res;
    setT(data || null);
    // marcar como visto al abrir
    await markSeen(id, { all: true });
  }

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function send() {
    const files = Array.from(fileRef.current?.files || []);
    await replyTicket(id, { body: text, files });
    setText("");
    if (fileRef.current) fileRef.current.value = "";
    await fetch();
  }

  async function doClose() {
    await closeTicket(id);
    await fetch();
  }

  if (!t) return null;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="text" onClick={() => navigate("/support")}>← Volver</Button>
        <div className="font-medium">Ticket #{t._id}</div>
      </div>

      <div className="space-y-3 border rounded p-3 bg-white">
        {(t.messages || []).map((m) => (
          <div key={m._id} className="border-b pb-2">
            <div className="text-xs text-gray-500">
              {m.role} — {new Date(m.createdAt).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{m.body}</div>
            {Array.isArray(m.attachments) && m.attachments.length > 0 && (
              <div className="mt-1 text-xs">
                {m.attachments.map((a, i) => (
                  <a key={i} className="underline mr-2" href={a.url} target="_blank" rel="noreferrer">
                    {a.name || a.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start">
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Escribe una respuesta"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" />
        <Button variant="contained" onClick={send}>Responder</Button>
        <Button variant="outlined" color="secondary" onClick={doClose}>Cerrar</Button>
      </div>
    </div>
  );
}
