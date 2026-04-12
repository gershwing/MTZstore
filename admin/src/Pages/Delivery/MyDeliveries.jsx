import React, { useEffect, useState } from "react";
import { myDeliveries, updateDeliveryStatus, uploadDeliveryProof, deleteDeliveryProof } from "../../services/delivery";
import Badge from "../../Components/Badge";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function MyDeliveries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failModal, setFailModal] = useState({ open: false, id: null });
  const [failNote, setFailNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await myDeliveries({ limit: 50 });
      const payload = res?.data || res;
      setRows(payload?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status, note) => {
    const res = await updateDeliveryStatus(id, { status, note });
    if (res?.error) {
      const msg = res?.message || "Error al actualizar estado";
      alert(typeof msg === "object" ? Object.values(msg).join(". ") : msg);
    }
    load();
  };

  const handleFail = () => {
    if (!failNote.trim()) return alert("Debe indicar el motivo de la entrega fallida");
    setStatus(failModal.id, "FAILED", failNote.trim());
    setFailModal({ open: false, id: null });
    setFailNote("");
  };

  const up = (id, files) => {
    if (!files?.length) return;
    uploadDeliveryProof(id, [...files]).then(() => load());
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando entregas...</div>;

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Mis entregas</h1>

      {rows.length === 0 && <p className="text-gray-500">No tienes entregas asignadas.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((d) => {
          const hasProof = d.proofs?.length > 0;

          return (
            <div key={d._id} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{d?.address?.name || "Sin nombre"}</p>
                  <p className="text-sm text-gray-500">{d?.address?.phone || ""}</p>
                </div>
                <Badge kind="delivery" status={d?.status} />
              </div>

              <div className="text-sm text-gray-600">
                <p>{d?.address?.line1 || "Sin direccion"}</p>
                {d?.address?.notes && <p className="text-xs text-gray-400">Ref: {d.address.notes}</p>}
              </div>

              {d?.storeId?.name && (
                <p className="text-xs text-blue-600">Tienda: {d.storeId.name}</p>
              )}

              {/* Miniaturas de pruebas */}
              {hasProof && (
                <div>
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Prueba ({d.proofs.length} archivo{d.proofs.length > 1 ? "s" : ""})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {d.proofs.map((p, i) => {
                      const isImg = p.mimeType?.startsWith("image/");
                      const proofUrl = p.url?.startsWith("/") || p.url?.startsWith("http") ? p.url : `/${p.url}`;
                      return (
                        <div key={i} className="relative group">
                          {isImg ? (
                            <img src={proofUrl} alt={p.name || "prueba"}
                              className="w-12 h-12 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-gray-50 text-[10px] text-gray-400">
                              {(p.name || "file").split(".").pop()?.toUpperCase()}
                            </div>
                          )}
                          <button
                            onClick={() => deleteDeliveryProof(d._id, i).then(() => load())}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            title="Eliminar prueba"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button size="small" variant="outlined" onClick={() => setStatus(d._id, "PICKED_UP")}
                  disabled={d.status !== "ASSIGNED"}>
                  Recogido
                </Button>
                <Button size="small" variant="outlined" onClick={() => setStatus(d._id, "IN_TRANSIT")}
                  disabled={d.status !== "PICKED_UP"}>
                  En ruta
                </Button>
                <Button size="small" variant="contained" color="success"
                  onClick={() => setStatus(d._id, "DELIVERED")}
                  disabled={d.status !== "IN_TRANSIT" || !hasProof}
                  title={d.status !== "IN_TRANSIT" ? "Primero marque Recogido y En ruta" : !hasProof ? "Suba prueba de entrega primero" : ""}>
                  Entregado
                </Button>
                <Button size="small" variant="outlined" color="error"
                  onClick={() => { setFailModal({ open: true, id: d._id }); setFailNote(""); }}
                  disabled={["DELIVERED", "CANCELLED"].includes(d.status) || !hasProof}
                  title={!hasProof ? "Suba prueba primero" : ""}>
                  Fallido
                </Button>
                <Button component="label" size="small" variant="outlined" className="col-span-2">
                  Subir prueba
                  <input type="file" hidden multiple onChange={(e) => up(d._id, e.target.files)} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para nota de entrega fallida */}
      <Dialog open={failModal.open} onClose={() => setFailModal({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Motivo de entrega fallida</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            margin="dense"
            label="Motivo"
            placeholder="Ej: Cliente no se encontraba en el domicilio"
            value={failNote}
            onChange={(e) => setFailNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFailModal({ open: false, id: null })}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleFail} disabled={!failNote.trim()}>
            Confirmar fallido
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
