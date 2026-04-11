// admin/src/Pages/Stores/StoreMembers.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import MembershipForm from "../Users/MembershipForm"; // reutilizamos tu form

export default function StoreMembers({ storeId, onChanged }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    const r = await api.get("/api/user/getAllUsers", { params: { storeId, q, limit: 50 } });
    const list = r.data?.users || r.data?.data || [];
    setRows(list);
  }
  useEffect(() => { load(); }, [q, storeId]);

  // helpers para parchear o eliminar la membresía concreta
  async function patchMembership(userId, mid, patch) {
    await api.patch(`/api/user/${userId}/memberships/${mid}`, patch);
    onChanged?.();
    load();
  }
  async function deleteMembership(userId, mid) {
    await api.delete(`/api/user/${userId}/memberships/${mid}`);
    onChanged?.();
    load();
  }

  // encuentra la membresía del usuario para esta tienda (para editar/quitar)
  const findMembershipForStore = (user) =>
    (user.memberships || []).find(m => String(m.storeId) === String(storeId));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="border rounded px-2 py-1 w-full"
        />
        <button className="px-2 py-1 border rounded" onClick={() => setAdding(true)}>
          Agregar a tienda
        </button>
      </div>

      {rows.length > 0 ? (
        <div className="border rounded divide-y">
          {rows.map(u => {
            const m = findMembershipForStore(u);
            if (!m) return null; // usuario listado pero sin membresía en esta tienda (por si acaso)
            return (
              <div key={u._id} className="p-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {u.name} <span className="opacity-60">({u.email})</span>
                  </div>
                  <div className="text-xs opacity-70">Miembro #{m._id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={m.role}
                    className="border px-2 py-1 rounded"
                    onChange={(e) => patchMembership(u._id, m._id, { role: e.target.value })}
                  >
                    <option value="STORE_OWNER">STORE_OWNER</option>
                    <option value="ORDER_MANAGER">ORDER_MANAGER</option>
                    <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
                    <option value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</option>
                  </select>
                  <select
                    defaultValue={m.status || "active"}
                    className="border px-2 py-1 rounded"
                    onChange={(e) => patchMembership(u._id, m._id, { status: e.target.value })}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => deleteMembership(u._id, m._id)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Sin miembros aún.</p>
      )}

      {adding && (
        <MembershipForm
          // Si tu MembershipForm soporta preseleccionar tienda, pásala:
          storeId={storeId}
          // Por ahora no pasamos userId; el propio formulario puede elegir usuario
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); load(); onChanged?.(); }}
        />
      )}
    </div>
  );
}
