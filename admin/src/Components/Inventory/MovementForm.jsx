// admin/src/components/Inventory/MovementForm.jsx
import React, { useMemo, useState } from "react";
import { Button, MenuItem, Select, TextField } from "@mui/material";
import { adjust, move, release, reserve } from "../../services/inventory";
import Badge from "../Badge";

const ACTIONS = [
  { key: "ADJUST_PLUS", label: "Ajuste (+)" },
  { key: "ADJUST_MINUS", label: "Ajuste (−)" },
  { key: "RESERVE", label: "Reserva" },
  { key: "RELEASE", label: "Liberación" },
  { key: "MOVE", label: "Mover" },
];

export default function MovementForm({
  productId,
  defaultLocation = "",
  onDone = () => { },
  disabledActions = {}, // { adjust:false, reserve:false, release:false, move:false }
}) {
  const [action, setAction] = useState("ADJUST_PLUS");
  const [qty, setQty] = useState("");
  const [locationTo, setLocationTo] = useState(defaultLocation);
  const [locationFrom, setLocationFrom] = useState("");
  const [notes, setNotes] = useState("");
  const [refType, setRefType] = useState("ORDER");
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdjust = action.startsWith("ADJUST");
  const isReserve = action === "RESERVE";
  const isRelease = action === "RELEASE";
  const isMove = action === "MOVE";

  const canSubmit = useMemo(() => {
    const q = Number(qty);
    if (!productId || !Number.isFinite(q) || q <= 0) return false;
    if ((isAdjust || isReserve || isRelease) && !locationTo) return false;
    if (isMove && !locationFrom && !locationTo) return false;
    if (isMove && !locationTo) return false;
    return true;
  }, [productId, qty, locationTo, locationFrom, isAdjust, isReserve, isRelease, isMove]);

  const doSubmit = async () => {
    try {
      if (!canSubmit || loading) return;
      setLoading(true);

      const q = Number(qty);
      if (isAdjust) {
        const deltaSign = action === "ADJUST_MINUS" ? "-" : "+";
        await adjust({ productId, qty: q, locationTo, notes, deltaSign });
      } else if (isReserve) {
        await reserve({ productId, qty: q, refType, refId, locationTo });
      } else if (isRelease) {
        await release({ productId, qty: q, refType, refId, locationTo });
      } else if (isMove) {
        await move({ productId, qty: q, from: locationFrom, to: locationTo, refType, refId });
      }
      onDone(true);
      setQty("");
      setNotes("");
      setRefId("");
    } catch (e) {
      onDone(false, e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 bg-white rounded-md border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Select
          size="small"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="md:col-span-1"
        >
          {ACTIONS.map(a => (
            <MenuItem
              key={a.key}
              value={a.key}
              disabled={
                (a.key.startsWith("ADJUST") && disabledActions?.adjust) ||
                (a.key === "RESERVE" && disabledActions?.reserve) ||
                (a.key === "RELEASE" && disabledActions?.release) ||
                (a.key === "MOVE" && disabledActions?.move)
              }
            >
              {a.label}
            </MenuItem>
          ))}
        </Select>

        <TextField
          size="small"
          type="number"
          label="Cantidad"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        {/* Ubicaciones */}
        {isMove && (
          <TextField
            size="small"
            label="Desde (origen)"
            placeholder="Ej: Almacén Central"
            value={locationFrom}
            onChange={(e) => setLocationFrom(e.target.value)}
          />
        )}

        {(isAdjust || isReserve || isRelease || isMove) && (
          <TextField
            size="small"
            label="Hacia (destino)"
            placeholder="Ej: Sucursal 1"
            value={locationTo}
            onChange={(e) => setLocationTo(e.target.value)}
          />
        )}

        <TextField
          size="small"
          label={isAdjust ? "Notas (opcional)" : "Notas/Referencia (opcional)"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {(isReserve || isRelease || isMove) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <TextField
            size="small"
            label="Tipo de referencia"
            value={refType}
            onChange={(e) => setRefType(e.target.value)}
            placeholder="ORDER | MANUAL | TRANSFER | ..."
          />
          <TextField
            size="small"
            label="ID referencia"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            placeholder="ID de pedido u otro"
          />
          <div className="flex items-center">
            <Badge status={isReserve ? "RESERVED" : isRelease ? "RELEASED" : isMove ? "MOVED" : "ADJUSTED"} kind="inventory" />
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button className="btn-blue btn" onClick={doSubmit} disabled={!canSubmit || loading}>
          {loading ? "Guardando..." : "Guardar movimiento"}
        </Button>
      </div>
    </div>
  );
}
