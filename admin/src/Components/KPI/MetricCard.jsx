// admin/src/components/KPI/MetricCard.jsx
import React from "react";

export default function MetricCard({ title, value, subtitle, right }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-start justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value ?? "—"}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
