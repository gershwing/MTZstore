// src/components/QtyBox/index.jsx
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

/**
 * Props (todas opcionales, se mantienen compatibilidades):
 * - value:     número inicial/controlado (default 1)
 * - min:       mínimo permitido (default 1)
 * - max:       máximo permitido (default 99)
 * - step:      paso de incremento/decremento (default 1)
 * - className: clases extra para el contenedor
 * - handleSelecteQty: callback legacy (n -> void)
 * - onChange:  callback moderna (n -> void) (alias del anterior)
 */
function QtyBox({
  value = 1,
  min = 1,
  max = 99,
  step = 1,
  className = "",
  handleSelecteQty,
  onChange,
}) {
  // estado interno (soporta modo semi-controlado)
  const [qtyVal, setQtyVal] = useState(sanitize(value, { min, max }));

  // sincroniza cuando cambia "value" desde el padre
  useEffect(() => {
    setQtyVal(sanitize(value, { min, max }));
  }, [value, min, max]);

  const emit = (n) => {
    handleSelecteQty?.(n);
    onChange?.(n);
  };

  const update = (n) => {
    const v = sanitize(n, { min, max });
    setQtyVal(v);
    emit(v);
  };

  const plusQty = () => update(qtyVal + step);
  const minusQty = () => update(qtyVal - step);

  const onInputChange = (e) => {
    const raw = e.target.value;
    // permite vacío temporal para que el usuario pueda escribir
    if (raw === "") {
      setQtyVal("");
      return;
    }
    // solo números
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      setQtyVal(parsed);
    }
  };

  const onInputBlur = () => {
    // al perder foco, clamp seguro
    update(qtyVal === "" ? min : qtyVal);
  };

  // evita scroll accidental que cambie el valor
  const onWheel = (e) => e.currentTarget.blur();

  return (
    <div className={`qtyBox flex items-center relative ${className}`}>
      <input
        type="number"
        className="w-full h-[40px] p-2 pl-5 text-[15px] focus:outline-none border border-[rgba(0,0,0,0.2)] rounded-md"
        value={qtyVal}
        min={min}
        max={max}
        step={step}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onWheel={onWheel}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Cantidad"
      />

      <div className="flex items-center flex-col justify-between h-[40px] absolute top-0 right-0 z-50">
        <Button
          type="button"
          className="!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]"
          onClick={plusQty}
          disabled={Number(qtyVal) >= max}
          aria-label="Incrementar cantidad"
        >
          <FaAngleUp className="text-[12px] opacity-55" />
        </Button>
        <Button
          type="button"
          className="!min-w-[25px] !w-[25px] !h-[20px] !text-[#000] !rounded-none hover:!bg-[#f1f1f1]"
          onClick={minusQty}
          disabled={Number(qtyVal) <= min}
          aria-label="Disminuir cantidad"
        >
          <FaAngleDown className="text-[12px] opacity-55" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function sanitize(n, { min, max }) {
  const num = Number(n);
  if (!Number.isFinite(num)) return min;
  return clamp(num, min, max);
}

/* Export default + named para no romper imports existentes */
export { QtyBox };
export default QtyBox;
