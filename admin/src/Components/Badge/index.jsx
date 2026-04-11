import React from "react";

// Paleta base (Tailwind)
const PALETTE = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-800",
  emerald: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
};

// Mapeos por módulo (ajústalos si agregas más estados)
const MAP = {
  order: {
    PENDING: "yellow",
    CREATED: "yellow",
    CONFIRMED: "blue",
    PROCESSING: "blue",
    SHIPPED: "purple",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "orange",
    PAID: "emerald",
    PARTIALLY_PAID: "emerald",
    FAILED: "red",
  },
  // ✅ NUEVO: delivery
  delivery: {
    PENDING: "yellow",
    ASSIGNED: "blue",
    PICKED_UP: "purple",
    IN_TRANSIT: "blue",
    DELIVERED: "green",
    FAILED: "red",
    CANCELLED: "red",
    CANCELED: "red", // por si viene en US spelling
  },
  payment: {
    PENDING: "yellow",
    AUTHORIZED: "blue",
    COMPLETED: "green",
    CAPTURED: "green",
    REFUNDED: "orange",
    FAILED: "red",
    CANCELED: "red",
  },
  support: {
    OPEN: "blue",
    PENDING: "yellow",
    CLOSED: "gray",
  },
  settlement: {
    PENDING: "yellow",
    IN_PROGRESS: "blue",
    PAID: "green",
    FAILED: "red",
  },
  inventory: {
    RESERVED: "blue",
    ADJUSTED: "green",
    RELEASED: "orange",
    MOVED: "purple",
    LOW_STOCK: "red",
  },
};

// Normaliza: "partially-paid" -> "PARTIALLY_PAID"
const norm = (s) => String(s || "").trim().replace(/[-\s]/g, "_").toUpperCase();
// Title Case para mostrar bonito: "PARTIALLY_PAID" -> "Partially Paid"
const pretty = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function Badge({ status, kind = "order", className = "" }) {
  const key = norm(status);
  const colorKey = MAP[kind]?.[key];
  const palette = PALETTE[colorKey] || PALETTE.gray;

  return (
    <span
      className={`inline-block py-1 px-3 rounded-full text-[11px] font-medium capitalize ${palette} ${className}`}
      title={key}
    >
      {pretty(key)}
    </span>
  );
}
