// admin/src/Components/Support/TicketStatusBadge.jsx
import React from "react";

const MAP = {
  OPEN: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

export default function TicketStatusBadge({ status }) {
  const cls = MAP[status] || "bg-slate-100 text-slate-700";
  return <span className={`px-2 py-1 rounded text-xs ${cls}`}>{status || "-"}</span>;
}