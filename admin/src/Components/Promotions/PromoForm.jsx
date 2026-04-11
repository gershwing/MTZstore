// admin/src/Components/Promotions/PromoForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPromotion,
  createPromotion,
  updatePromotion,
  previewPromotion,
} from "../../services/promotions";
import {
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";

const TYPES = ["PERCENT", "FIXED", "BOGO", "FREE_SHIPPING"];
const APPLIES = ["ALL", "PRODUCTS", "CATEGORIES"];

export default function PromoForm({ promotionId }) {
  const navigate = useNavigate();
  const isEdit = Boolean(promotionId);

  const [m, setM] = useState({
    name: "",
    description: "",
    code: "",
    autoApply: false,
    type: "PERCENT",
    value: 10,
    buyQty: 0,
    freeQty: 0,
    appliesTo: "ALL",
    productIds: [],
    categoryIds: [],
    minOrderAmount: 0,
    baseCurrency: "USD",
    maxUses: 0,
    maxUsesPerUser: 0,
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
    stackable: false,
    priority: 100,
    status: "DRAFT",
  });

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      const res = await getPromotion(promotionId);
      const data = res?.data || res;
      if (data) {
        setM((prev) => ({
          ...prev,
          ...data,
          startAt: data.startAt
            ? new Date(data.startAt).toISOString().slice(0, 16)
            : prev.startAt,
          endAt: data.endAt
            ? new Date(data.endAt).toISOString().slice(0, 16)
            : prev.endAt,
        }));
      }
    })();

  }, [promotionId, isEdit]);

  const patch = (k, v) => setM((prev) => ({ ...prev, [k]: v }));

  async function save() {
    const payload = {
      ...m,
      startAt: new Date(m.startAt),
      endAt: new Date(m.endAt),
    };
    if (isEdit) {
      await updatePromotion(promotionId, payload);
    } else {
      await createPromotion(payload);
    }
    alert("Guardado");
    navigate("/promotions");
  }

  // ✅ Este bloque es una función, no código suelto
  async function doPreview() {
    try {
      const body = {
        autoApply: !!m.autoApply,
        items: [{ productId: m.productIds?.[0], price: 100, qty: 2 }],
        shipping: { price: 10 },
      };
      const res = await previewPromotion(body);
      const data = res?.data || res;
      alert(`Descuento total: ${data?.totalDiscount ?? "N/A"}`);
    } catch (e) {
      alert("No se pudo previsualizar la promoción");
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="text" onClick={() => navigate("/promotions")}>
          ← Volver
        </Button>
        <div className="font-medium">
          {isEdit ? "Editar" : "Nueva"} promoción
        </div>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Nombre"
            value={m.name}
            onChange={(e) => patch("name", e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Descripción"
            value={m.description}
            onChange={(e) => patch("description", e.target.value)}
            className="mt-2"
          />

          <div className="grid grid-cols-2 gap-2 mt-2">
            <TextField
              select
              label="Tipo"
              value={m.type}
              onChange={(e) => patch("type", e.target.value)}
            >
              {TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label={m.type === "PERCENT" ? "%" : "Monto"}
              value={m.value}
              onChange={(e) => patch("value", Number(e.target.value))}
            />
            {m.type === "BOGO" && (
              <>
                <TextField
                  type="number"
                  label="Buy Qty"
                  value={m.buyQty}
                  onChange={(e) => patch("buyQty", Number(e.target.value))}
                />
                <TextField
                  type="number"
                  label="Free Qty"
                  value={m.freeQty}
                  onChange={(e) => patch("freeQty", Number(e.target.value))}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <TextField
              select
              label="Aplica a"
              value={m.appliesTo}
              onChange={(e) => patch("appliesTo", e.target.value)}
            >
              {APPLIES.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Mínimo de compra"
              value={m.minOrderAmount}
              onChange={(e) =>
                patch("minOrderAmount", Number(e.target.value))
              }
            />
            <TextField
              type="number"
              label="Priority"
              value={m.priority}
              onChange={(e) => patch("priority", Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <TextField
              type="datetime-local"
              label="Inicio"
              value={m.startAt?.slice(0, 16)}
              onChange={(e) => patch("startAt", e.target.value)}
            />
            <TextField
              type="datetime-local"
              label="Fin"
              value={m.endAt?.slice(0, 16)}
              onChange={(e) => patch("endAt", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <TextField
              type="number"
              label="Max uses"
              value={m.maxUses}
              onChange={(e) => patch("maxUses", Number(e.target.value))}
            />
            <TextField
              type="number"
              label="Max uses/user"
              value={m.maxUsesPerUser}
              onChange={(e) => patch("maxUsesPerUser", Number(e.target.value))}
            />
            <TextField
              select
              label="Estado"
              value={m.status}
              onChange={(e) => patch("status", e.target.value)}
            >
              {["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="mt-2">
            <FormControlLabel
              control={
                <Checkbox
                  checked={m.autoApply}
                  onChange={(e) => patch("autoApply", e.target.checked)}
                />
              }
              label="Aplicar automáticamente (sin código)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={m.stackable}
                  onChange={(e) => patch("stackable", e.target.checked)}
                />
              }
              label="Combinable con otras promos"
            />
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Código"
            value={m.code}
            onChange={(e) => patch("code", e.target.value.toUpperCase())}
            placeholder="BLACKFRIDAY20"
          />
          <div className="text-xs text-gray-500 mt-1">
            El código es opcional si la promo es auto-aplicable.
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="contained" onClick={save}>
              Guardar
            </Button>
            <Button variant="outlined" onClick={doPreview}>
              Preview
            </Button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
