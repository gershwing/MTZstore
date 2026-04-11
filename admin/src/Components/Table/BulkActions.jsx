// admin/src/components/Table/BulkActions.jsx
import React, { useState } from "react";

export default function BulkActions({ disabled, onAction }) {
  const [role, setRole] = useState("");
  const [storeId, setStoreId] = useState("");
  const [storeRole, setStoreRole] = useState("");

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button className="px-2 py-1 border rounded" disabled={disabled} onClick={() => onAction("activate")}>
        Activar
      </button>
      <button className="px-2 py-1 border rounded" disabled={disabled} onClick={() => onAction("deactivate")}>
        Desactivar
      </button>
      <div className="flex items-center gap-2">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Asignar rol…</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
          <option value="ORDER_MANAGER">ORDER_MANAGER</option>
          <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
          <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</option>
        </select>
        <button className="px-2 py-1 border rounded"
          disabled={disabled || !role}
          onClick={() => onAction("assignRole", { role })}
        >
          Aplicar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input placeholder="storeId"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="border px-2 py-1 rounded w-40" />
        <select value={storeRole} onChange={(e) => setStoreRole(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Rol tienda…</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
          <option value="ORDER_MANAGER">ORDER_MANAGER</option>
          <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
          <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</option>
        </select>
        <button className="px-2 py-1 border rounded"
          disabled={disabled || !storeId || !storeRole}
          onClick={() => onAction("assignMembership", { storeId, storeRole })}
        >
          Agregar a tienda
        </button>
      </div>

      <button className="px-2 py-1 border rounded" disabled={disabled} onClick={() => onAction("delete")}>
        Eliminar
      </button>
    </div>
  );
}
