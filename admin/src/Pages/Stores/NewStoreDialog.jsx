import React, { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Alert
} from "@mui/material";
import UploadBox from "../../Components/UploadBox"; // respeta tu ruta/uppercase
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { setCurrentStoreId } from "../../utils/tenant";

export default function NewStoreDialog({ open, onClose, storeId }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(() => ({
    "X-Store-Id": storeId || ""
  }), [storeId]);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      // Guarda nombre opcional + imágenes en settings generales de la tienda
      await api.patch("/api/store/settings", { name, logoUrl, bannerUrl }, { headers });
      if (storeId) setCurrentStoreId(storeId);
      onClose?.();
      navigate("/admin/products/add");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error al guardar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const goAddProducts = () => {
    if (storeId) setCurrentStoreId(storeId);
    onClose?.();
    navigate("/admin/products/add");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>¡Tu tienda está lista! 🎉</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre público de la tienda"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: MTZ Store Oruro"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            {/* Puedes agregar slug si tu backend lo soporta */}
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className="text-sm text-gray-700 mb-2">Logo</div>
            <UploadBox
              style={{ minHeight: 160 }}
              url="/api/upload"                // si tienes un uploader dedicado, cámbialo
              onStart={() => { }}
              onError={(e) => setError(e?.message || "Error subiendo logo")}
              onDone={(resp) => {
                const url = resp?.data?.url || resp?.url || resp?.secure_url || "";
                setLogoUrl(url);
              }}
            />
            {logoUrl && <div className="text-xs mt-1 text-gray-500 break-all">{logoUrl}</div>}
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className="text-sm text-gray-700 mb-2">Banner</div>
            <UploadBox
              style={{ minHeight: 160 }}
              url="/api/upload"
              onStart={() => { }}
              onError={(e) => setError(e?.message || "Error subiendo banner")}
              onDone={(resp) => {
                const url = resp?.data?.url || resp?.url || resp?.secure_url || "";
                setBannerUrl(url);
              }}
            />
            {bannerUrl && <div className="text-xs mt-1 text-gray-500 break-all">{bannerUrl}</div>}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cerrar</Button>
        <Button variant="outlined" onClick={goAddProducts} disabled={saving}>
          Agregar productos
        </Button>
        <Button variant="contained" onClick={save} disabled={saving}>
          Guardar y continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

