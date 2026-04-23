// admin/src/Pages/Delivery/ApplyDelivery.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Grid, TextField, Alert, MenuItem, InputAdornment,
  Card, CardContent, Chip, Stack, Checkbox, FormControlLabel
} from "@mui/material";
import UploadBox from "../../Components/UploadBox";
import { createDeliveryApp, getMyDeliveryApp } from "../../services/deliveryApps";
import PageContainer from "../../layout/PageContainer";

const BOLIVIA_CITIES = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí",
  "Sucre", "Tarija", "Trinidad", "Cobija",
];

const EXPRESS_VEHICLES = ["Moto", "Bicicleta", "Otro"];
const STANDARD_VEHICLES = ["Auto", "Camioneta", "Van", "Otro"];

const isMotorizedExpress = (v) => v === "Moto";
const fmt = (d) => { try { return new Date(d).toLocaleString(); } catch { return ""; } };

const unwrap = (r) => r?.data ?? r ?? null;
const getAppData = (x) => (x?.data ?? x ?? null);

/* ---------- Slot de subida con tamaño estable y preview ---------- */
function UploadField({ title, url, value, locked, emptyHelp, onStart, onError, onDone }) {
  const boxStyle = { minHeight: 180 };

  return (
    <div>
      <div className="mb-2 text-sm text-gray-700">{title}</div>
      {locked && !value && (
        <div className="border border-dashed rounded-md bg-gray-50 flex items-center justify-center text-gray-400" style={boxStyle}>
          <span className="text-sm">{emptyHelp}</span>
        </div>
      )}
      {!locked && (
        <div style={boxStyle}>
          <UploadBox
            url={url} name="image" multiple={false} maxFiles={1}
            onStart={onStart} onError={onError}
            onComplete={(images) => {
              const first = Array.isArray(images) ? images[0] : images;
              onDone(first?.url || first?.secure_url || "");
            }}
          />
        </div>
      )}
      {!value && <Alert className="mt-2" severity="info">{emptyHelp}</Alert>}
      {value && (
        <div className="mt-2">
          <div className="text-xs text-emerald-600 mb-1">Subida OK</div>
          <div className="flex items-center gap-3">
            <img src={value} alt={title} className="w-24 h-24 object-cover rounded-md border" />
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Ver grande</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyDelivery() {
  const [myApp, setMyApp] = useState(null);
  const app = getAppData(myApp);
  const status = app?.status || null;
  const locked = status === "PENDING" || status === "APPROVED";

  // ===== Datos personales =====
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // ===== Tipos de servicio (V2) =====
  const [svcExpress, setSvcExpress] = useState(true);
  const [svcStandard, setSvcStandard] = useState(false);

  // ===== Vehículo Express =====
  const [vExpressType, setVExpressType] = useState("Moto");
  const [vExpressPlate, setVExpressPlate] = useState("");
  const [vExpressLicenseUrl, setVExpressLicenseUrl] = useState("");
  const [upVExpressLic, setUpVExpressLic] = useState(false);

  // ===== Vehículo Estándar =====
  const [vStandardType, setVStandardType] = useState("Auto");
  const [vStandardPlate, setVStandardPlate] = useState("");
  const [vStandardLicenseUrl, setVStandardLicenseUrl] = useState("");
  const [vStandardCapacity, setVStandardCapacity] = useState("");
  const [upVStandardLic, setUpVStandardLic] = useState(false);

  // ===== Documentos personales =====
  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [upFront, setUpFront] = useState(false);
  const [upBack, setUpBack] = useState(false);
  const [upSelfie, setUpSelfie] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Boot
  useEffect(() => {
    (async () => {
      try {
        const r = unwrap(await getMyDeliveryApp());
        setMyApp(getAppData(r));
      } catch { setMyApp(null); }
    })();
  }, []);

  // Hidratar estados desde app existente
  useEffect(() => {
    if (!app) return;
    setFullName(app.fullName || "");
    setPhone((app.phone || "").replace(/^\+?591\s?/, ""));
    setCity(app.city || "");
    setDocumentNumber(app.documentNumber || "");

    // V2 tipos
    if (app.serviceTypesRequested?.length) {
      setSvcExpress(app.serviceTypesRequested.includes("express"));
      setSvcStandard(app.serviceTypesRequested.includes("standard"));
    }

    // Vehículo Express
    if (app.vehicleExpress?.vehicleType) {
      setVExpressType(app.vehicleExpress.vehicleType);
      setVExpressPlate(app.vehicleExpress.licensePlate || "");
      setVExpressLicenseUrl(app.vehicleExpress.licensePhotoUrl || "");
    } else if (app.vehicleType && EXPRESS_VEHICLES.includes(app.vehicleType)) {
      // Legacy fallback
      setVExpressType(app.vehicleType);
      setVExpressPlate(app.plateNumber || "");
      setVExpressLicenseUrl(app.licenseUrl || "");
    }

    // Vehículo Estándar
    if (app.vehicleStandard?.vehicleType) {
      setVStandardType(app.vehicleStandard.vehicleType);
      setVStandardPlate(app.vehicleStandard.licensePlate || "");
      setVStandardLicenseUrl(app.vehicleStandard.licensePhotoUrl || "");
      setVStandardCapacity(String(app.vehicleStandard.cargoCapacityKg || ""));
    } else if (app.vehicleType && STANDARD_VEHICLES.includes(app.vehicleType)) {
      setVStandardType(app.vehicleType);
      setVStandardPlate(app.plateNumber || "");
      setVStandardLicenseUrl(app.licenseUrl || "");
    }

    // Documentos
    setIdFrontUrl(app.idFrontUrl || "");
    setIdBackUrl(app.idBackUrl || "");
    setSelfieUrl(app.selfieUrl || "");
  }, [app]);

  const motorExpress = isMotorizedExpress(vExpressType);

  const canSubmit = useMemo(() => {
    if (locked) return false;
    const atLeastOne = svcExpress || svcStandard;
    const phoneDigits = phone.replace(/\D/g, "");
    const basicOk =
      fullName.trim().length >= 2 &&
      phoneDigits.length >= 6 &&
      documentNumber.trim().length >= 5 &&
      city.trim().length >= 2 &&
      !!idFrontUrl && !!idBackUrl && !!selfieUrl &&
      !upFront && !upBack && !upSelfie && !loading;

    const expressOk = !svcExpress || (
      !!vExpressType &&
      (!motorExpress || (vExpressPlate.trim().length >= 4 && !!vExpressLicenseUrl)) &&
      !upVExpressLic
    );

    const standardOk = !svcStandard || (
      !!vStandardType &&
      vStandardPlate.trim().length >= 4 &&
      !!vStandardLicenseUrl &&
      !upVStandardLic
    );

    return atLeastOne && basicOk && expressOk && standardOk;
  }, [
    locked, svcExpress, svcStandard, fullName, phone, documentNumber, city,
    idFrontUrl, idBackUrl, selfieUrl, upFront, upBack, upSelfie,
    vExpressType, vExpressPlate, vExpressLicenseUrl, upVExpressLic, motorExpress,
    vStandardType, vStandardPlate, vStandardLicenseUrl, upVStandardLic, loading
  ]);

  const submit = async () => {
    setErrorMsg(""); setSuccessMsg("");
    try {
      setLoading(true);
      const payload = {
        fullName: fullName.trim(),
        phone: `+591 ${phone.replace(/\D/g, "")}`,
        city: city.trim(),
        documentNumber: documentNumber.trim(),
        idFrontUrl, idBackUrl, selfieUrl,
        // Legacy compat
        vehicleType: svcExpress ? vExpressType : vStandardType,
        plateNumber: svcExpress && motorExpress ? vExpressPlate.trim() : (svcStandard ? vStandardPlate.trim() : ""),
        licenseUrl: svcExpress && motorExpress ? vExpressLicenseUrl : (svcStandard ? vStandardLicenseUrl : ""),
        // V2 fields
        serviceTypesRequested: [
          ...(svcExpress ? ["express"] : []),
          ...(svcStandard ? ["standard"] : []),
        ],
        vehicleExpress: svcExpress ? {
          vehicleType: vExpressType,
          licensePlate: motorExpress ? vExpressPlate.trim() : undefined,
          licensePhotoUrl: motorExpress ? vExpressLicenseUrl : undefined,
        } : undefined,
        vehicleStandard: svcStandard ? {
          vehicleType: vStandardType,
          licensePlate: vStandardPlate.trim(),
          licensePhotoUrl: vStandardLicenseUrl,
          cargoCapacityKg: Number(vStandardCapacity) || undefined,
        } : undefined,
      };
      const created = unwrap(await createDeliveryApp(payload));
      setMyApp(getAppData(created));
      setSuccessMsg("¡Solicitud enviada! Te avisaremos por email cuando se revise.");
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally { setLoading(false); }
  };

  const submitLabel = locked
    ? (status === "PENDING" ? "Solicitud en revisión" : "Aprobada")
    : (loading ? "Enviando..." : (status === "REJECTED" ? "Reenviar solicitud" : "Enviar solicitud"));

  return (
    <PageContainer>
      <div className="mx-auto w-full p-6" style={{ maxWidth: 1120 }}>
        <h1 className="text-xl font-semibold mb-1">Postulación a Delivery</h1>
        <p className="text-sm text-gray-600 mb-4">
          Completa tus datos para habilitar tu cuenta de repartidor. Puedes postularte a uno o ambos tipos de servicio.
        </p>

        {/* Estado */}
        {status && (
          <Card className="mb-4">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Chip label={status} color={status === "APPROVED" ? "success" : status === "REJECTED" ? "error" : "warning"} />
                {app.approvedServiceTypes?.includes("express") && <Chip label="Express aprobado" color="success" size="small" variant="outlined" />}
                {app.approvedServiceTypes?.includes("standard") && <Chip label="Estándar aprobado" color="success" size="small" variant="outlined" />}
                {app.reviewNotesByType?.express?.status === "REJECTED" && <Chip label="Express rechazado" color="error" size="small" variant="outlined" />}
                {app.reviewNotesByType?.standard?.status === "REJECTED" && <Chip label="Estándar rechazado" color="error" size="small" variant="outlined" />}
                <div className="text-sm text-gray-700">
                  {status === "PENDING" && <>Tu solicitud está en revisión desde <b>{fmt(app?.createdAt)}</b>.</>}
                  {status === "APPROVED" && <>¡Felicidades! Fuiste aprobado el <b>{fmt(app?.updatedAt || app?.createdAt)}</b>.</>}
                  {status === "REJECTED" && <>Tu solicitud fue rechazada{app?.reason ? <>: <b>{app.reason}</b></> : ""}. Puedes corregir y volver a enviar.</>}
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

              {/* ===== Datos personales ===== */}
              <h2 className="text-base font-semibold mb-3">Datos personales</h2>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField size="small" label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField size="small" label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth placeholder="7x xxx xxx"
                    InputProps={{ startAdornment: <InputAdornment position="start"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span role="img" aria-label="Bolivia">🇧🇴</span> +591</span></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select size="small" label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} fullWidth>
                    {BOLIVIA_CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField size="small" label="Documento (Nº)" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} fullWidth />
                </Grid>
              </Grid>

              {/* ===== Tipos de servicio ===== */}
              <h2 className="text-base font-semibold mt-6 mb-2">Tipos de servicio</h2>
              <p className="text-xs text-gray-500 mb-3">Selecciona al menos un tipo. Puedes postularte a ambos.</p>

              <div className="space-y-2 mb-4">
                <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${svcExpress ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <Checkbox checked={svcExpress} onChange={(e) => setSvcExpress(e.target.checked)} color="secondary" disabled={locked} />
                  <div>
                    <div className="font-medium text-sm">Reparto Express</div>
                    <div className="text-xs text-gray-500">Entregas rápidas urbanas en moto o bicicleta. Paquetes pequeños, rutas cortas, alta rotación.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${svcStandard ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <Checkbox checked={svcStandard} onChange={(e) => setSvcStandard(e.target.checked)} color="primary" disabled={locked} />
                  <div>
                    <div className="font-medium text-sm">Reparto Estándar</div>
                    <div className="text-xs text-gray-500">Entregas programadas con mayor volumen. Autos/camionetas, rutas largas, horarios planificados.</div>
                  </div>
                </label>
              </div>

              {!svcExpress && !svcStandard && (
                <Alert severity="warning" className="mb-3">Debes seleccionar al menos un tipo de servicio.</Alert>
              )}

              {/* ===== Vehículo Express ===== */}
              {svcExpress && (
                <>
                  <h2 className="text-base font-semibold mt-4 mb-3 text-purple-700">Vehículo Express</h2>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField select size="small" label="Tipo de vehículo" value={vExpressType} onChange={(e) => setVExpressType(e.target.value)} fullWidth>
                        {EXPRESS_VEHICLES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                      </TextField>
                    </Grid>
                    {motorExpress && (
                      <Grid item xs={12} md={6}>
                        <TextField size="small" label="Matrícula" placeholder="p. ej., 1234-ABC" value={vExpressPlate} onChange={(e) => setVExpressPlate(e.target.value)} fullWidth />
                      </Grid>
                    )}
                    {motorExpress && (
                      <Grid item xs={12} md={6}>
                        <UploadField
                          title="Licencia de conducir (Express)"
                          url="/api/upload/image?folder=mtz/delivery-apps/license-express"
                          value={vExpressLicenseUrl} locked={locked}
                          emptyHelp="Sube foto de tu licencia"
                          onStart={() => setUpVExpressLic(true)}
                          onError={() => setUpVExpressLic(false)}
                          onDone={(v) => { setVExpressLicenseUrl(v); setUpVExpressLic(false); }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {/* ===== Vehículo Estándar ===== */}
              {svcStandard && (
                <>
                  <h2 className="text-base font-semibold mt-4 mb-3 text-blue-700">Vehículo Estándar</h2>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField select size="small" label="Tipo de vehículo" value={vStandardType} onChange={(e) => setVStandardType(e.target.value)} fullWidth>
                        {STANDARD_VEHICLES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField size="small" label="Matrícula" placeholder="p. ej., 1234-ABC" value={vStandardPlate} onChange={(e) => setVStandardPlate(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField size="small" label="Capacidad de carga (kg)" type="number" value={vStandardCapacity} onChange={(e) => setVStandardCapacity(e.target.value)} fullWidth placeholder="ej: 500" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <UploadField
                        title="Licencia de conducir (Estándar)"
                        url="/api/upload/image?folder=mtz/delivery-apps/license-standard"
                        value={vStandardLicenseUrl} locked={locked}
                        emptyHelp="Sube foto de tu licencia tipo B o C"
                        onStart={() => setUpVStandardLic(true)}
                        onError={() => setUpVStandardLic(false)}
                        onDone={(v) => { setVStandardLicenseUrl(v); setUpVStandardLic(false); }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* ===== Documentos personales ===== */}
              <h2 className="text-base font-semibold mt-6 mb-3">Documentos de identidad</h2>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <UploadField title="CI – Anverso" url="/api/upload/image?folder=mtz/delivery-apps/ci" value={idFrontUrl} locked={locked} emptyHelp="Sube la foto del anverso" onStart={() => setUpFront(true)} onError={() => setUpFront(false)} onDone={(v) => { setIdFrontUrl(v); setUpFront(false); }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <UploadField title="CI – Reverso" url="/api/upload/image?folder=mtz/delivery-apps/ci" value={idBackUrl} locked={locked} emptyHelp="Sube la foto del reverso" onStart={() => setUpBack(true)} onError={() => setUpBack(false)} onDone={(v) => { setIdBackUrl(v); setUpBack(false); }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <UploadField title="Selfie con CI" url="/api/upload/image?folder=mtz/delivery-apps/selfies" value={selfieUrl} locked={locked} emptyHelp="Sube tu selfie con el CI" onStart={() => setUpSelfie(true)} onError={() => setUpSelfie(false)} onDone={(v) => { setSelfieUrl(v); setUpSelfie(false); }} />
                </Grid>
              </Grid>

              <div className="mt-6 flex gap-2">
                <Button variant="contained" disabled={locked ? true : !canSubmit} onClick={!locked && canSubmit ? submit : undefined}>
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
