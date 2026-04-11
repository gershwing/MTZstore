// admin/src/Pages/Stores/RequestSellerCard.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Button, Grid, MenuItem, TextField, Alert,
  Card, CardContent, Chip, Stack, InputAdornment
} from "@mui/material";
import PageContainer from "../../layout/PageContainer";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";

import UploadBox from "../../components/UploadBox";
import { createSellerApp, reapplySellerApp } from "../../services/sellerApps";
import { api } from "../../utils/api";

// ⬇️ React Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ⬇️ Socket.IO helpers (singleton + listeners)
import { on, getSocket } from "../../utils/socket";

// ⬇️ Fuente de verdad del tenant
import { setTenantId } from "../../utils/tenant";

/* ============================== utils ============================== */
function fmt(d) { try { return new Date(d).toLocaleString(); } catch { return ""; } }

function UploadField({ title, url, value, locked, emptyHelp, onStart, onError, onDone }) {
  const boxStyle = { minHeight: 180 };
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
            <img src={value} alt={title} className="w-24 h-24 object-cover rounded-md border" />
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Ver grande</a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== React Query hook ============================== */
function useSellerApp() {
  return useQuery({
    queryKey: ['sellerApp'],
    queryFn: async () => {
      const res = await api.get('/api/seller-applications/me');
      // Normaliza: { error:false, data:{...} } o { data:{...} }
      return res?.data ?? res;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

/* ============================== Componente principal ============================== */
export default function RequestSellerCard() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const qc = useQueryClient();

  // ---- user/roles (desde contexto) ----
  const me = (ctx?.user || ctx?.viewer || {});
  const roles = Array.isArray(me?.roles) ? me.roles : [];
  const isOwnerRole = roles.includes("STORE_OWNER");

  // ---- Query principal (SIN polling) ----
  const { data, isLoading, isFetching } = useSellerApp();
  const app = data?.data || data || null;

  // ---- Form state ----
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [phoneLocal, setPhoneLocal] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const [docFrontUrl, setDocFrontUrl] = useState("");
  const [docBackUrl, setDocBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [upFront, setUpFront] = useState(false);
  const [upBack, setUpBack] = useState(false);
  const [upSelfie, setUpSelfie] = useState(false);

  // ---- UI ----
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Cargar subcategorías (nivel 2) una vez
  useEffect(() => {
    api.get("/api/category")
      .then((r) => {
        const tree = Array.isArray(r?.data?.category) ? r.data.category : (r?.data?.data || []);
        // Aplanar: extraer hijos de nivel 2, agrupados por categoría padre
        const subs = [];
        tree.forEach((parent) => {
          if (Array.isArray(parent.children)) {
            parent.children.forEach((child) => {
              subs.push({ ...child, _parentName: parent.name || parent.title });
            });
          }
        });
        setCategories(subs);
      })
      .catch(() => setCategories([]));
  }, []);

  // Hidratar campos con la app
  useEffect(() => {
    if (!app) return;
    setStoreName(app.storeName || app.formData?.storeName || "");
    setDescription(app.description || app.formData?.description || "");
    setCategoryId(String(app.categoryId || app.formData?.categoryId || ""));
    const phoneRaw = app.phone || app.formData?.phone || "";
    const local = String(phoneRaw || "").replace(/^\+?591/, "").replace(/\D/g, "");
    setPhoneLocal(local);
    setDocumentNumber(app.documentNumber || app.formData?.documentNumber || "");
    setDocFrontUrl(app.idFrontUrl || app.documents?.frontUrl || "");
    setDocBackUrl(app.idBackUrl || app.documents?.backUrl || "");
    setSelfieUrl(app.selfieUrl || app.documents?.selfieUrl || "");
  }, [app]);

  // ===== Estado derivado =====
  const statusRaw = app?.status ?? app?.state ?? app?.currentStatus ?? null;
  const status = statusRaw ? String(statusRaw).toUpperCase() : null;
  const isPending = ["PENDING", "SUBMITTED", "IN_REVIEW", "UNDER_REVIEW"].includes(status || "");
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const storeId = app?.storeId || app?.store?._id || app?.store_id || null;

  // ❌ Nada de limpiar X-Store-Id aquí (se eliminó el useEffect que lo hacía)

  // ============================== Socket listeners ==============================
  useEffect(() => {
    getSocket();

    const offUpdated = on("sellerApp:updated", () => {
      qc.invalidateQueries({ queryKey: ['sellerApp'] });
    });

    // Si el server aprueba y emite socket
    const offApproved = on("sellerApp:approved", ({ storeId: sid }) => {
      // Actualiza cache de inmediato para que la UI muestre "APPROVED"
      qc.setQueryData(['sellerApp'], (prev) => {
        const base = (prev?.data || prev || {});
        return { error: false, data: { ...base, status: "APPROVED", storeId: sid || base?.storeId } };
      });

      // ✅ fija tenant correctamente (unificado)
      if (sid) setTenantId(sid);

      // no navegues; el sidebar ya existe y el usuario entra por “Mi tienda”
      // navigate("/my-store");
    });

    return () => {
      offUpdated();
      offApproved();
    };
  }, [qc, ctx, storeId /* , navigate */]);

  // Validaciones
  const phoneValid = /^\d{8}$/.test(phoneLocal || "");
  const docValid = (documentNumber || "").trim().length >= 5;

  const isLocked = isPending || isApproved || loading || isFetching;
  const canSubmit = useMemo(() => (
    !isLocked &&
    storeName.trim().length >= 2 &&
    description.trim().length >= 10 &&
    !!categoryId &&
    !!docFrontUrl && !!docBackUrl && !!selfieUrl &&
    phoneValid && docValid &&
    !upFront && !upBack && !upSelfie
  ), [isLocked, storeName, description, categoryId, docFrontUrl, docBackUrl, selfieUrl, phoneValid, docValid, upFront, upBack, upSelfie]);

  const disableApplyBtn = isOwnerRole || isPending || isApproved;

  // Acciones
  const doSubmit = async () => {
    if (!canSubmit) return;
    setServerErr(""); setSuccessMsg(""); setLoading(true);
    try {
      const fullPhone = phoneValid ? `+591${phoneLocal}` : "";
      await createSellerApp({
        storeName: storeName.trim(),
        businessName: storeName.trim(),
        description: description.trim(),
        categoryId,
        phone: fullPhone,
        documentNumber: documentNumber.trim(),
        docFrontUrl, docBackUrl, selfieUrl,
        documents: { frontUrl: docFrontUrl, backUrl: docBackUrl, selfieUrl },
        formData: {
          storeName: storeName.trim(),
          businessName: storeName.trim(),
          description: description.trim(),
          categoryId,
          phone: fullPhone,
          documentNumber: documentNumber.trim(),
        },
      });

      // Optimista: pone pendiente para bloquear UI mientras llega el WS
      qc.setQueryData(['sellerApp'], (prev) => {
        const base = (prev?.data || prev || {});
        return { error: false, data: { ...base, status: "PENDING" } };
      });

      setSuccessMsg("¡Solicitud enviada! Te avisaremos por correo cuando sea revisada.");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo enviar la solicitud";
      setServerErr(msg);
      console.error("seller-app error:", e?.response?.data || e);
    } finally {
      setLoading(false);
      qc.invalidateQueries({ queryKey: ['sellerApp'] });
    }
  };

  const onReapply = async () => {
    if (isLocked) return;
    setServerErr(""); setSuccessMsg(""); setLoading(true);
    try {
      await reapplySellerApp({
        storeName: storeName.trim(),
        categoryId,
        documentNumber: documentNumber.trim(),
        description: description.trim(),
        formData: { storeName: storeName.trim(), categoryId, documentNumber: documentNumber.trim(), description: description.trim() },
        idFrontUrl: docFrontUrl,
        idBackUrl: docBackUrl,
        selfieUrl,
        notes: "Actualizo la información requerida",
      });

      // Optimista: vuelve a PENDING
      qc.setQueryData(['sellerApp'], (prev) => {
        const base = (prev?.data || prev || {});
        return { error: false, data: { ...base, status: "PENDING" } };
      });
      setSuccessMsg("Solicitud reenviada. Pronto tendrás novedades.");
    } catch (e) {
      const d = e?.response?.data;
      setServerErr(d?.message || "No se pudo reenviar.");
      console.error("reapply error:", d || e);
    } finally {
      setLoading(false);
      qc.invalidateQueries({ queryKey: ['sellerApp'] });
    }
  };

  /* ============================== Render ============================== */
  if (isLoading) {
    return (
      <PageContainer>
        <div className="p-6">Cargando…</div>
      </PageContainer>
    );
  }

  const pendingSince = app?.lastReappliedAt || app?.updatedAt || app?.createdAt;

  return (
    <PageContainer>
      <div className="mx-auto w-full" style={{ maxWidth: 1120 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Solicitud de vendedor</h1>
          <Button
            size="small"
            variant="outlined"
            onClick={() => qc.invalidateQueries({ queryKey: ['sellerApp'] })}
            disabled={loading}
          >
            Actualizar estado
          </Button>
        </div>

        {/* Estado actual */}
        {!!app && (
          <div className="mb-3 space-y-2">
            {isPending && (
              <Alert severity="info">
                Tu solicitud está <b>en revisión</b> desde <b>{fmt(pendingSince)}</b>.
              </Alert>
            )}
            {isRejected && (
              <Alert severity="warning">
                Tu solicitud fue <b>rechazada</b>{app?.notes ? <>: <b>{app.notes}</b></> : ""}.
              </Alert>
            )}
            {isApproved && (
              <Alert severity="success">
                Tu tienda fue <b>aprobada</b>. Usa el menú <b>Mi tienda</b> para configurar logo, banner y publicar productos.
              </Alert>
            )}
          </div>
        )}

        <Card>
          <CardContent>
            {!!app && (
              <div className="mb-3">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={(status || "SIN ESTADO")}
                    color={isApproved ? "success" : isRejected ? "error" : "warning"}
                  />
                </Stack>
              </div>
            )}

            <fieldset disabled={isLocked || disableApplyBtn} style={(isLocked || disableApplyBtn) ? { opacity: 0.6 } : undefined}>
              <Grid container spacing={2}>
                {/* ...tus campos tal como estaban... */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre de la tienda"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    fullWidth size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select label="Subcategoría" fullWidth size="small"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="" disabled>Selecciona una subcategoría</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c._parentName ? `${c._parentName} › ` : ""}{c.name || c.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Celular (Bolivia)"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal((e.target.value || "").replace(/\D/g, "").slice(0, 8))}
                    fullWidth size="small" placeholder="7xxxxxxx / 6xxxxxxx"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span role="img" aria-label="Bolivia" style={{ marginRight: 6 }}>🇧🇴</span>
                          <span style={{ opacity: 0.8 }}>+591</span>
                        </InputAdornment>
                      ),
                      inputMode: "numeric",
                    }}
                    error={!!phoneLocal && !/^\d{8}$/.test(phoneLocal)}
                    helperText={phoneLocal && !/^\d{8}$/.test(phoneLocal) ? "Debe tener 8 dígitos." : "Usaremos este número para contactarte."}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nº de documento / CI"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    fullWidth size="small"
                    placeholder="Ej.: 12345678 LP"
                    helperText="Este dato es importante para verificar tu identidad."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción de lo que venderás"
                    multiline minRows={3} fullWidth size="small"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <UploadField
                    title="CI – Anverso"
                    url="/api/upload/image?folder=mtz/seller-apps/ci"
                    value={docFrontUrl}
                    locked={isLocked || disableApplyBtn}
                    emptyHelp="Sube la foto del anverso"
                    onStart={() => setUpFront(true)}
                    onError={() => setUpFront(false)}
                    onDone={(v) => { setDocFrontUrl(v); setUpFront(false); }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <UploadField
                    title="CI – Reverso"
                    url="/api/upload/image?folder=mtz/seller-apps/ci"
                    value={docBackUrl}
                    locked={isLocked || disableApplyBtn}
                    emptyHelp="Sube la foto del reverso"
                    onStart={() => setUpBack(true)}
                    onError={() => setUpBack(false)}
                    onDone={(v) => { setDocBackUrl(v); setUpBack(false); }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <UploadField
                    title="Selfie sosteniendo tu CI (rostro visible + anverso del documento)"
                    url="/api/upload/image?folder=mtz/seller-apps/selfie"
                    value={selfieUrl}
                    locked={isLocked || disableApplyBtn}
                    emptyHelp="Sube tu selfie con el CI"
                    onStart={() => setUpSelfie(true)}
                    onError={() => setUpSelfie(false)}
                    onDone={(v) => { setSelfieUrl(v); setUpSelfie(false); }}
                  />
                </Grid>
              </Grid>

              <div className="mt-4 flex gap-2">
                <Button
                  className="btn-blue btn"
                  onClick={isRejected ? onReapply : doSubmit}
                  disabled={!canSubmit || isPending || loading || disableApplyBtn}
                >
                  {disableApplyBtn
                    ? (isOwnerRole ? "Ya eres vendedor" : (isApproved ? "Aprobada" : "Solicitud en revisión"))
                    : (loading ? "Enviando..." : (isRejected ? "Reenviar solicitud" : "Enviar solicitud"))}
                </Button>
              </div>
            </fieldset>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
