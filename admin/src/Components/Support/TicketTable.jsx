// admin/src/Components/Support/TicketTable.jsx
import React from "react";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketTable({ items = [], onRowClick }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="p-2">Asunto</th>
          <th className="p-2">Prioridad</th>
          <th className="p-2">Estado</th>
          <th className="p-2">Último</th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <tr key={t._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick && onRowClick(t)}>
            <td className="p-2">{t.subject}</td>
            <td className="p-2">{t.priority}</td>
            <td className="p-2"><TicketStatusBadge status={t.status} /></td>
            <td className="p-2">{t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}