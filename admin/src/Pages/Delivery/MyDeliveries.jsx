import React, { useEffect, useState } from "react";
import { myDeliveries, updateDeliveryStatus, uploadDeliveryProof, deleteDeliveryProof, verifyPickupCode } from "../../services/delivery";
import Badge from "../../Components/Badge";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { toast } from "react-toastify";

export default function MyDeliveries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failModal, setFailModal] = useState({ open: false, id: null });
  const [failNote, setFailNote] = useState("");

  // Estado inline por task (foto, código, verificación)
  const [uploading, setUploading] = useState(null); // taskId que está subiendo foto
  const [codeInputs, setCodeInputs] = useState({}); // { taskId: "ABC123" }
  const [codeErrors, setCodeErrors] = useState({}); // { taskId: "error msg" }
  const [verifyingId, setVerifyingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);

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

  // Tomar foto inline
  const handlePhoto = async (taskId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(taskId);
    try {
      await uploadDeliveryProof(taskId, [file]);
      toast.success("Foto subida");
      load();
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploading(null);
    }
  };

  // Verificar código inline
  const handleVerify = async (taskId) => {
    const code = (codeInputs[taskId] || "").trim();
    if (!code) return;
    setVerifyingId(taskId);
    setCodeErrors((prev) => ({ ...prev, [taskId]: "" }));
    try {
      const res = await verifyPickupCode(taskId, code);
      const data = res?.data || res;
      if (data?.verified) {
        toast.success("Codigo verificado");
        load();
      } else {
        setCodeErrors((prev) => ({ ...prev, [taskId]: data?.message || "Codigo incorrecto" }));
      }
    } catch (err) {
      setCodeErrors((prev) => ({ ...prev, [taskId]: err?.response?.data?.message || "Error" }));
    } finally {
      setVerifyingId(null);
    }
  };

  // Confirmar entrega con geo
  const handleDeliver = async (taskId) => {
    setDeliveringId(taskId);
    try {
      let geo = null;
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
          })
        );
        geo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch { /* sin geo */ }

      const res = await updateDeliveryStatus(taskId, { status: "DELIVERED", geo });
      if (res?.error) {
        const msg = res?.message || "Error";
        toast.error(typeof msg === "object" ? Object.values(msg).join(". ") : msg);
      } else {
        toast.success("Entrega confirmada");
      }
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error al confirmar");
    } finally {
      setDeliveringId(null);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando entregas...</div>;

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Mis entregas</h1>

      {rows.length === 0 && <p className="text-gray-500">No tienes entregas asignadas.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((d) => {
          const hasProof = d.proofs?.length > 0;
          const isInTransit = d.status === "IN_TRANSIT";
          const isCodeVerified = !!d.codeVerifiedAt;
          const hasPickupCode = !!d.pickupCode;
          const canDeliver = isInTransit && hasProof && (!hasPickupCode || isCodeVerified);

          return (
            <div key={d._id} className="bg-white border rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{d?.address?.name || "Sin nombre"}</p>
                  <p className="text-sm text-gray-500">{d?.address?.phone || ""}</p>
                </div>
                <Badge kind="delivery" status={d?.status} />
              </div>

              {/* Dirección */}
              <div className="text-sm text-gray-600">
                <p>{d?.address?.line1 || "Sin direccion"}</p>
                {d?.address?.notes && <p className="text-xs text-gray-400">Ref: {d.address.notes}</p>}
              </div>

              {d?.storeId?.name && (
                <p className="text-xs text-blue-600">Tienda: {d.storeId.name}</p>
              )}

              {/* Miniaturas de pruebas */}
              {hasProof && (
                <div className="flex gap-2 flex-wrap items-center">
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
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                  <span className="text-xs text-green-600 font-medium">Foto OK</span>
                </div>
              )}

              {/* === Verificación inline (solo cuando está EN RUTA) === */}
              {isInTransit && (
                <div className="border-t pt-3 space-y-3">

                  {/* Paso 1: Tomar foto */}
                  {!hasProof && (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-300 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <Button component="label" size="small" variant="outlined" disabled={uploading === d._id} sx={{ textTransform: "none", flex: 1 }}>
                        {uploading === d._id ? "Subiendo..." : "Tomar foto de entrega"}
                        <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => handlePhoto(d._id, e)} />
                      </Button>
                    </div>
                  )}

                  {/* Paso 2: Código de recogida */}
                  {hasPickupCode && !isCodeVerified && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-300 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                        <span className="text-xs text-gray-500">Codigo de recogida</span>
                      </div>
                      <div className="flex gap-2 items-start pl-7">
                        <TextField
                          size="small"
                          placeholder="Ej: A3B5K2"
                          value={codeInputs[d._id] || ""}
                          onChange={(e) => {
                            setCodeInputs((prev) => ({ ...prev, [d._id]: e.target.value.toUpperCase() }));
                            setCodeErrors((prev) => ({ ...prev, [d._id]: "" }));
                          }}
                          error={!!codeErrors[d._id]}
                          helperText={codeErrors[d._id] || ""}
                          inputProps={{ maxLength: 6, style: { textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, fontSize: 14 } }}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="contained" size="small"
                          onClick={() => handleVerify(d._id)}
                          disabled={(codeInputs[d._id] || "").trim().length < 4 || verifyingId === d._id}
                          sx={{ mt: "4px", textTransform: "none", minWidth: 80 }}
                        >
                          {verifyingId === d._id ? "..." : "Verificar"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Indicador código verificado */}
                  {isCodeVerified && (
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Codigo verificado
                    </div>
                  )}
                </div>
              )}

              {/* Botones de estado */}
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
                  onClick={() => handleDeliver(d._id)}
                  disabled={!canDeliver || deliveringId === d._id}>
                  {deliveringId === d._id ? "..." : "Entregado"}
                </Button>
                <Button size="small" variant="outlined" color="error"
                  onClick={() => { setFailModal({ open: true, id: d._id }); setFailNote(""); }}
                  disabled={["DELIVERED", "CANCELLED"].includes(d.status) || !hasProof}>
                  Fallido
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Entrega fallida */}
      <Dialog open={failModal.open} onClose={() => setFailModal({ open: false, id: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Motivo de entrega fallida</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={3} margin="dense" label="Motivo"
            placeholder="Ej: Cliente no se encontraba en el domicilio"
            value={failNote} onChange={(e) => setFailNote(e.target.value)} />
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
