import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { setTenantId } from "../../utils/tenant";
import { useNavigate, useLocation } from "react-router-dom";

export default function SelectStorePage() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    api.get("/api/user/me").then(r => {
      const u = r.data?.data?.user || r.data?.user || r.data;
      const ms = Array.isArray(u?.memberships) ? u.memberships : [];
      setItems(ms);
    }).catch(() => setItems([]));
  }, []);

  function choose(m) {
    setTenantId(m.storeId);
    const to = (loc.state && loc.state.from?.pathname) ? loc.state.from.pathname : "/admin/dashboard";
    nav(to, { replace: true });
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Selecciona una tienda</h2>
      <div className="grid gap-3">
        {items.map(m => (
          <button
            key={m.storeId}
            className="border rounded p-3 text-left hover:bg-gray-50"
            onClick={() => choose(m)}
          >
            <div className="font-medium">{m.storeName || m.storeId}</div>
            <div className="text-xs opacity-70">{m.role}</div>
          </button>
        ))}
        {items.length === 0 && <div>No tienes tiendas asignadas.</div>}
      </div>
    </div>
  );
}
