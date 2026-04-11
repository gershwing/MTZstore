import React, { useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import { api } from "../../utils/api";

const STATUS_BADGE = {
  active: { label: "Activo", cls: "bg-green-100 text-green-700" },
  suspended: { label: "Suspendido", cls: "bg-red-100 text-red-700" },
};

export default function DeliveryAgents() {
  const [agents, setAgents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/api/admin/users", {
        params: { role: "DELIVERY_AGENT", page: p, limit },
        __noTenant: true,
      });
      setAgents(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.total || 0);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repartidores</h1>
          <p className="text-sm text-gray-500">
            Usuarios con rol Delivery Agent aprobados en la plataforma.
          </p>
        </div>
        <span className="text-sm text-gray-400">{total} repartidor{total !== 1 ? "es" : ""}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay repartidores registrados.</p>
          <p className="text-gray-400 text-sm mt-1">Los delivery agents aprobados apareceran aqui.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Telefono</th>
                <th className="text-center p-3">Roles</th>
                <th className="text-center p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((u) => {
                const st = STATUS_BADGE[u?.status] || STATUS_BADGE.active;
                return (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{u?.name || "---"}</td>
                    <td className="p-3 text-gray-600">{u?.email || "---"}</td>
                    <td className="p-3 text-gray-600">{u?.mobile || u?.phone || "---"}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                          DELIVERY_AGENT
                        </span>
                        {Array.isArray(u?.memberships) && u.memberships
                          .filter((m) => m?.role && m.role !== "DELIVERY_AGENT")
                          .map((m, i) => (
                            <span key={i} className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              {m.role}
                            </span>
                          ))
                        }
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            size="small"
          />
        </div>
      )}
    </div>
  );
}
