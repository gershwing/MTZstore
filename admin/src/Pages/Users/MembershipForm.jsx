// admin/src/Pages/Users/MembershipForm.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import { asPlatform } from "../../utils/httpFlags";
import { addMembership } from "../../services/adminUsers";

export default function MembershipForm({ userId, onClose, onSaved }) {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [role, setRole] = useState("ORDER_MANAGER");
  const [loading, setLoading] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    // Listar tiendas en contexto "plataforma" (sin X-Store-Id)
    setLoadingStores(true);
    api
      .get("/api/store", asPlatform())
      .then((r) => {
        const list = r.data?.data || r.data?.stores || [];
        setStores(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        setStores([]);
        toast.error(e?.response?.data?.message || "No se pudieron cargar las tiendas");
      })
      .finally(() => setLoadingStores(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!userId || !storeId || !role) return;
    setLoading(true);
    try {
      // POST /api/admin/users/:id/memberships { storeId, role }
      // Enviamos en contexto "plataforma" para evitar X-Store-Id
      await addMembership(userId, { storeId, role }, asPlatform());
      toast.success("Membresía agregada");
      onSaved?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "No se pudo agregar la membresía");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-black/30 z-20 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white w-[420px] p-4 rounded shadow space-y-3">
        <h3 className="text-lg font-semibold">Agregar a tienda</h3>

        <div>
          <label className="block text-sm">Tienda</label>
          <select
            className="border px-2 py-1 rounded w-full"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
            disabled={loadingStores || loading}
          >
            <option value="">{loadingStores ? "Cargando tiendas…" : "Seleccionar…"}</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || s.slug || s._id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Rol</label>
          <select
            className="border px-2 py-1 rounded w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            disabled={loading}
          >
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="ORDER_MANAGER">ORDER_MANAGER</option>
            <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
            <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
            <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-3 py-1 border rounded" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="px-3 py-1 border rounded" disabled={loading || loadingStores}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
