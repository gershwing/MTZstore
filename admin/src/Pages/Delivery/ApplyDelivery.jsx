// admin/src/Pages/Delivery/ApplyDelivery.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Grid, TextField, Alert, MenuItem, InputAdornment,
  Card, CardContent, Chip, Stack
} from "@mui/material";
import UploadBox from "../../components/UploadBox";
import { createDeliveryApp, getMyDeliveryApp } from "../../services/deliveryApps";
import PageContainer from "../../layout/PageContainer";

const VEHICLES = ["Moto", "Auto", "Camioneta", "Bicicleta", "Otro"];
const BOLIVIA_CITIES = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí",
  "Sucre", "Tarija", "Trinidad", "Cobija",
];

const isMotorized = (v) => ["Moto", "Auto", "Camioneta"].includes(v);
const fmt = (d) => { try { return new Date(d).toLocaleString(); } catch { return ""; } };

// Normaliza payloads {data: {...}} o planos
const unwrap = (r) => r?.data ?? r ?? null;
const getAppData = (x) => (x?.data ?? x ?? null);

/* ---------- Slot de subida con tamaño estable y preview ---------- */
function UploadField({
  title,
  url,
  value,
  locked,
  emptyHelp,
  onStart,
  onError,
  onDone,
}) {
  const boxStyle = { minHeight: 180 }; // evita “salto” de layout

  return (
    <div>
      <div className="mb-2 text-sm text-gray-700">{title}</div>

      {locked && !value && (
        <div
          className="border border-dashed rounded-md bg-gray-50 flex items-center justify-center text-gray-400"
          style={boxStyle}
        >
          <span className="text-sm">{emptyHelp}</span>
        </div>
      )}

      {!locked && (
        <div style={boxStyle}>
          <UploadBox
            url={url}
            name="image"
            multiple={false}
            maxFiles={1}
            onStart={onStart}
            onError={onError}
            onComplete={(images) => {
              const first = Array.isArray(images) ? images[0] : images;
              const v = first?.url || first?.secure_url || "";
              onDone(v);
            }}
          />
        </div>
      )}

      {!value && <Alert className="mt-2" severity="info">{emptyHelp}</Alert>}
      {value && (
        <div className="mt-2">
          <div className="text-xs text-emerald-600 mb-1">Subida OK</div>
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt={title}
              className="w-24 h-24 object-cover rounded-md border"
            />
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Ver grande
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyDelivery() {
  // ===== Server state / solicitud previa =====
  const [myApp, setMyApp] = useState(null);
  const app = getAppData(myApp);
  const status = app?.status || null;
  const locked = status === "PENDING" || status === "APPROVED";

  // ===== Campos =====
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Moto");
  const [city, setCity] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  // ===== Imágenes =====
  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");

  // Flags de subida
  const [upFront, setUpFront] = useState(false);
  const [upBack, setUpBack] = useState(false);
  const [upSelfie, setUpSelfie] = useState(false);
  const [upLic, setUpLic] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Boot: carga mi postulación
  useEffect(() => {
    (async () => {
      try {
        const r = unwrap(await getMyDeliveryApp());
        setMyApp(getAppData(r));
      } catch {
        setMyApp(null);
      }
    })();
  }, []);

  // Hidrata estados desde app
  useEffect(() => {
    if (!app) return;
    setFullName(app.fullName || app.formData?.fullName || "");
    setPhone((app.phone || app.formData?.phone || "").replace(/^\+?591\s?/, ""));
    setVehicleType(app.vehicleType || app.formData?.vehicleType || "Moto");
    setCity(app.city || app.formData?.city || "");
    setDocumentNumber(app.documentNumber || app.formData?.documentNumber || "");
    setPlateNumber(app.plateNumber || app.formData?.plateNumber || "");

    setIdFrontUrl(app.idFrontUrl || app.documents?.frontUrl || "");
    setIdBackUrl(app.idBackUrl || app.documents?.backUrl || "");
    setSelfieUrl(app.selfieUrl || app.documents?.selfieUrl || "");
    setLicenseUrl(app.licenseUrl || app.documents?.licenseUrl || "");
  }, [app]);

  const motor = isMotorized(vehicleType);

  const canSubmit = useMemo(() => {
    if (locked) return false;
    const phoneDigits = phone.replace(/\D/g, "");
    const basicOk =
      fullName.trim().length >= 2 &&
      phoneDigits.length >= 6 &&
      documentNumber.trim().length >= 5 &&
      city.trim().length >= 2 &&
      !!idFrontUrl && !!idBackUrl && !!selfieUrl &&
      !upFront && !upBack && !upSelfie && !upLic &&
      !loading;
    const motorOk = !motor || (plateNumber.trim().length >= 4 && !!licenseUrl);
    return basicOk && motorOk;
  }, [
    locked, fullName, phone, documentNumber, city,
    idFrontUrl, idBackUrl, selfieUrl, licenseUrl,
    plateNumber, motor, upFront, upBack, upSelfie, upLic, loading
  ]);

  const submit = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      setLoading(true);
      const payload = {
        fullName: fullName.trim(),
        phone: `+591 ${phone.replace(/\D/g, "")}`,
        vehicleType,
        city: city.trim(),
        documentNumber: documentNumber.trim(),
        plateNumber: motor ? plateNumber.trim() : "",
        idFrontUrl,
        idBackUrl,
        selfieUrl,
        licenseUrl: motor ? licenseUrl : "",
      };
      const created = unwrap(await createDeliveryApp(payload));
      setMyApp(getAppData(created));
      setSuccessMsg("¡Solicitud enviada! Te avisaremos por email cuando se revise.");
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Etiqueta y estado del botón (mismo patrón que vendedor) =====
  const submitLabel = locked
    ? (status === "PENDING" ? "Solicitud en revisión" : "Aprobada")
    : (loading ? "Enviando..." : (status === "REJECTED" ? "Reenviar solicitud" : "Enviar solicitud"));

  const submitDisabled = locked ? true : !canSubmit;

  return (
    <PageContainer>
      <div className="mx-auto w-full p-6" style={{ maxWidth: 1120 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Postulación a Delivery</h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Completa tus datos para habilitar tu cuenta de repartidor. No necesitas tener una tienda.
        </p>

        {/* Estado si existe */}
        {status && (
          <Card className="mb-4">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip
                  label={status}
                  color={status === "APPROVED" ? "success" : status === "REJECTED" ? "error" : "warning"}
                />
                <div className="text-sm text-gray-700">
                  {status === "PENDING" && (
                    <>Tu solicitud está en revisión desde <b>{fmt(app?.createdAt)}</b>.</>
                  )}
                  {status === "APPROVED" && (
                    <>¡Felicidades! Fuiste aprobado el <b>{fmt(app?.updatedAt || app?.createdAt)}</b>.</>
                  )}
                  {status === "REJECTED" && (
                    <>Tu solicitud fue rechazada{app?.reason ? <>: <b>{app.reason}</b></> : ""}. Puedes corregir y volver a enviar.</>
                  )}
                </div>
              </Stack>
            </CardContent>
          </Card>
        )}

        {successMsg && <Alert severity="success" className="mb-3">{successMsg}</Alert>}
        {errorMsg && <Alert severity="warning" className="mb-3">{errorMsg}</Alert>}

        <Card>
          <CardContent>
            <fieldset disabled={locked} style={locked ? { opacity: 0.6 } : undefined}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    label="Nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    label="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    placeholder="7x xxx xxx"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span role="img" aria-label="Bolivia">🇧🇴</span> +591
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select size="small" label="Tipo de vehículo"
                    value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                    fullWidth
                  >
                    {VEHICLES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select size="small" label="Ciudad"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    fullWidth
                  >
                    {BOLIVIA_CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    size="small" label="Documento (Nº)"
                    value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)}
                    fullWidth
                  />
                </Grid>

                {isMotorized(vehicleType) && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      size="small" label="Matrícula del vehículo"
                      placeholder="p. ej., 1234-ABC"
                      value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                )}

                {/* Uploads con altura estable y preview */}
                <Grid item xs={12} md={6}>
                  <UploadField
                    title="CI – Anverso"
                    url="/api/upload/image?folder=mtz/delivery-apps/ci"
                    value={idFrontUrl}
                    locked={locked}
                    emptyHelp="Sube la foto del anverso"
                    onStart={() => setUpFront(true)}
                    onError={() => setUpFront(false)}
                    onDone={(v) => { setIdFrontUrl(v); setUpFront(false); }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <UploadField
                    title="CI – Reverso"
                    url="/api/upload/image?folder=mtz/delivery-apps/ci"
                    value={idBackUrl}
                    locked={locked}
                    emptyHelp="Sube la foto del reverso"
                    onStart={() => setUpBack(true)}
                    onError={() => setUpBack(false)}
                    onDone={(v) => { setIdBackUrl(v); setUpBack(false); }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <UploadField
                    title="Selfie con CI"
                    url="/api/upload/image?folder=mtz/delivery-apps/selfies"
                    value={selfieUrl}
                    locked={locked}
                    emptyHelp="Sube tu selfie con el CI"
                    onStart={() => setUpSelfie(true)}
                    onError={() => setUpSelfie(false)}
                    onDone={(v) => { setSelfieUrl(v); setUpSelfie(false); }}
                  />
                </Grid>

                {isMotorized(vehicleType) && (
                  <Grid item xs={12} md={6}>
                    <UploadField
                      title="Licencia de conducir"
                      url="/api/upload/image?folder=mtz/delivery-apps/license"
                      value={licenseUrl}
                      locked={locked}
                      emptyHelp="Sube foto de tu licencia"
                      onStart={() => setUpLic(true)}
                      onError={() => setUpLic(false)}
                      onDone={(v) => { setLicenseUrl(v); setUpLic(false); }}
                    />
                  </Grid>
                )}
              </Grid>

              <div className="mt-4 flex gap-2">
                <Button
                  className="btn-blue btn"
                  variant="contained"
                  disabled={submitDisabled}
                  onClick={!submitDisabled ? submit : undefined}
                >
                  {submitLabel}
                </Button>
              </div>
            </fieldset>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
