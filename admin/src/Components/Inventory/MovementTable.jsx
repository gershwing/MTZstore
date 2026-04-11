import React from "react";
import { Pagination } from "@mui/material";

const ACTION_LABELS = {
  ADJUST: { label: "Ajuste", cls: "bg-blue-100 text-blue-700" },
  RESERVE: { label: "Reserva", cls: "bg-yellow-100 text-yellow-700" },
  RELEASE: { label: "Liberacion", cls: "bg-green-100 text-green-700" },
  RECEIVE: { label: "Recepcion", cls: "bg-purple-100 text-purple-700" },
  DISPATCH: { label: "Despacho", cls: "bg-orange-100 text-orange-700" },
  MOVE: { label: "Traslado", cls: "bg-gray-100 text-gray-700" },
};

export default function MovementTable({ data = [], page = 1, totalPages = 1, onPage }) {
  if (!data.length) {
    return <p className="text-sm text-gray-400 mt-4">Sin movimientos registrados.</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Historial de movimientos</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-100">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Accion</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Desde</th>
              <th className="px-3 py-2">Hacia</th>
              <th className="px-3 py-2">Notas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => {
              const a = ACTION_LABELS[m.action] || { label: m.action, cls: "bg-gray-100 text-gray-600" };
              return (
                <tr key={m._id || i} className="border-b border-gray-100">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.cls}`}>{a.label}</span>
                  </td>
                  <td className="px-3 py-2 font-medium">{m.qty}</td>
                  <td className="px-3 py-2 text-xs">{m.locationFrom || "—"}</td>
                  <td className="px-3 py-2 text-xs">{m.locationTo || "—"}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 max-w-[200px] truncate">{m.notes || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-3">
          <Pagination size="small" count={totalPages} page={page} onChange={(_, v) => onPage?.(v)} />
        </div>
      )}
    </div>
  );
}
