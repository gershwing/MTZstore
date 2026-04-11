import React from "react";

const INTENT = {
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  error: "bg-rose-600",
  info: "bg-blue-600",
  neutral: "bg-slate-400",
};

const STATUS_MAP = {
  order: {
    PENDING: "warning",
    CREATED: "warning",
    PROCESSING: "info",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "error",
    PAID: "success",
    FAILED: "error",
  },
  payment: {
    PENDING: "warning",
    AUTHORIZED: "info",
    COMPLETED: "success",
    CAPTURED: "success",
    REFUNDED: "warning",
    FAILED: "error",
    CANCELED: "error",
  },
  settlement: {
    PENDING: "warning",
    IN_PROGRESS: "info",
    PAID: "success",
    FAILED: "error",
  },
};

const norm = (s) => String(s || "").trim().replace(/[-\s]/g, "_").toUpperCase();

export default function Progress({
  value = 0,              // porcentaje 0..100
  type,                   // success|warning|error|info|neutral (opcional)
  kind,                   // order|payment|settlement (opcional)
  status,                 // estado del server (opcional)
  size = "md",            // sm|md|lg
  showLabel = false,      // muestra % al lado
  className = "",
  ariaLabel = "Progreso",
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  const sizeH =
    size === "sm" ? "h-[6px]" : size === "lg" ? "h-[10px]" : "h-[8px]";

  const intentKey =
    type ||
    (kind && status && STATUS_MAP[kind]?.[norm(status)]) ||
    "info";

  const barColor = INTENT[intentKey] || INTENT.info;

  return (
    <div
      className={`w-full overflow-hidden rounded-md bg-gray-100 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={ariaLabel}
      title={`${pct}%`}
    >
      <span
        className={`block ${sizeH} ${barColor} transition-all duration-300`}
        style={{ width: `${pct}%` }}   // ✅ seguro con Tailwind JIT
      />
      {showLabel && (
        <div className="mt-1 text-xs text-gray-600 text-right">{pct}%</div>
      )}
    </div>
  );
}
