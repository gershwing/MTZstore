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

  // Modal de confirmación de entrega
  const [deliverModal, setDeliverModal] = useState({ open: false, id: null, task: null });
  const [deliverPhoto, setDeliverPhoto] = useState(null); // File preview
  const [deliverPhotoUploaded, setDeliverPhotoUploaded] = useState(false);
  const [deliverCode, setDeliverCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  // --- Modal de entrega verificada ---
  const openDeliverModal = (task) => {
    setDeliverModal({ open: true, id: task._id, task });
    setDeliverPhoto(null);
    setDeliverPhotoUploaded(task.proofs?.length > 0);
    setDeliverCode("");
    setCodeVerified(!!task.codeVerifiedAt);
    setCodeError("");
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeliverPhoto(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      await uploadDeliveryProof(deliverModal.id, [file]);
      setDeliverPhotoUploaded(true);
      await load();
    } catch {
      toast.error("Error al subir la foto");
      setDeliverPhoto(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!deliverCode.trim()) return;
    setVerifying(true);
    setCodeError("");
    try {
      const res = await verifyPickupCode(deliverModal.id, deliverCode.trim());
      const data = res?.data || res;
      if (data?.verified) {
        setCodeVerified(true);
        toast.success("Codigo verificado correctamente");
      } else {
        setCodeError(data?.message || "Codigo incorrecto");
      }
    } catch (err) {
      setCodeError(err?.response?.data?.message || "Error al verificar");
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setDelivering(true);
    try {
      // Capturar geolocalización automáticamente
      let geo = null;
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        );
        geo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        // Si no se puede obtener geo, continuar sin ella
        console.warn("No se pudo obtener la geolocalizacion");
      }

      const res = await updateDeliveryStatus(deliverModal.id, {
        status: "DELIVERED",
        geo,
      });

      if (res?.error) {
        const msg = res?.message || "Error al confirmar entrega";
        toast.error(typeof msg === "object" ? Object.values(msg).join(". ") : msg);
      } else {
        toast.success("Entrega confirmada exitosamente");
        setDeliverModal({ open: false, id: null, task: null });
      }
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error al confirmar entrega");
    } finally {
      setDelivering(false);
    }
  };

  const canConfirmDelivery = deliverPhotoUploaded && codeVerified;

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

              {/* Indicador de código verificado */}
              {d.codeVerifiedAt && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Codigo verificado
                </p>
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
                  onClick={() => openDeliverModal(d)}
                  disabled={d.status !== "IN_TRANSIT"}
                  title={d.status !== "IN_TRANSIT" ? "Primero marque Recogido y En ruta" : ""}>
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

      {/* Modal: Confirmar entrega con verificación */}
      <Dialog open={deliverModal.open} onClose={() => !delivering && setDeliverModal({ open: false, id: null, task: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar entrega</DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">

            {/* Paso 1: Foto */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${deliverPhotoUploaded ? "bg-green-500" : "bg-gray-300"}`}>
                  {deliverPhotoUploaded ? "✓" : "1"}
                </span>
                <span className="font-medium text-sm">Foto de entrega</span>
              </div>
              {deliverPhotoUploaded ? (
                <div className="flex items-center gap-2 pl-8">
                  {deliverPhoto && (
                    <img src={deliverPhoto} alt="Foto" className="w-16 h-16 rounded object-cover border" />
                  )}
                  <span className="text-sm text-green-600">Foto subida correctamente</span>
                </div>
              ) : (
                <div className="pl-8">
                  <Button component="label" size="small" variant="outlined" disabled={uploadingPhoto}>
                    {uploadingPhoto ? "Subiendo..." : "Tomar foto"}
                    <input type="file" accept="image/*" capture="environment" hidden onChange={handlePhotoCapture} />
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">Se abrira la camara de tu dispositivo</p>
                </div>
              )}
            </div>

            {/* Paso 2: Código */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${codeVerified ? "bg-green-500" : "bg-gray-300"}`}>
                  {codeVerified ? "✓" : "2"}
                </span>
                <span className="font-medium text-sm">Codigo de recogida</span>
              </div>
              {codeVerified ? (
                <p className="text-sm text-green-600 pl-8 flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Codigo verificado
                </p>
              ) : (
                <div className="pl-8">
                  <div className="flex gap-2 items-start">
                    <TextField
                      size="small"
                      label="Codigo"
                      placeholder="Ej: A3B5K2"
                      value={deliverCode}
                      onChange={(e) => {
                        setDeliverCode(e.target.value.toUpperCase());
                        setCodeError("");
                      }}
                      error={!!codeError}
                      helperText={codeError}
                      inputProps={{ maxLength: 6, style: { textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 } }}
                      sx={{ width: 160 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleVerifyCode}
                      disabled={deliverCode.trim().length < 4 || verifying}
                      sx={{ mt: "4px", textTransform: "none" }}
                    >
                      {verifying ? "..." : "Verificar"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Solicite el codigo al cliente</p>
                </div>
              )}
            </div>

            {/* Paso 3: Confirmar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${canConfirmDelivery ? "bg-blue-500" : "bg-gray-300"}`}>
                  3
                </span>
                <span className="font-medium text-sm">Confirmar entrega</span>
              </div>
              {!canConfirmDelivery && (
                <p className="text-xs text-gray-400 pl-8">Complete los pasos 1 y 2 para habilitar</p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeliverModal({ open: false, id: null, task: null })} disabled={delivering}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmDelivery}
            disabled={!canConfirmDelivery || delivering}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {delivering ? "Confirmando..." : "Confirmar entregado"}
          </Button>
        </DialogActions>
      </Dialog>

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
