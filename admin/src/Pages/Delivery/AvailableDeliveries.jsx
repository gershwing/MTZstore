import React, { useEffect, useState } from "react";
import { availableDeliveries, takeDelivery } from "../../services/delivery";
import Badge from "../../Components/Badge";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AvailableDeliveries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await availableDeliveries({ limit: 50 });
      const payload = res?.data || res;
      setRows(payload?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTake = async (id) => {
    setTakingId(id);
    try {
      await takeDelivery(id);
      navigate("/admin/my-deliveries");
    } catch {
      setTakingId(null);
      load();
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando entregas disponibles...</div>;

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Entregas disponibles</h1>
      <p className="text-sm text-gray-500">
        Ordenes Express pendientes de asignacion. Toma una orden para iniciar la entrega.
      </p>

      {rows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay entregas disponibles en este momento.</p>
          <p className="text-gray-400 text-sm mt-1">Las nuevas ordenes Express apareceran aqui.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((d) => (
          <div key={d._id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-lg">{d?.address?.name || d?.orderId?.userId?.name || "Sin nombre"}</p>
                <p className="text-sm text-gray-500">{d?.address?.phone || "Sin telefono"}</p>
              </div>
              <Badge kind="delivery" status={d?.status} />
            </div>

            {/* Address */}
            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
              <p>{d?.address?.line1 || "Sin direccion"}</p>
              {d?.address?.line2 && <p>{d.address.line2}</p>}
              <p>{[d?.address?.city, d?.address?.state].filter(Boolean).join(", ")}</p>
              {d?.address?.notes && <p className="text-xs text-gray-400 mt-1">Ref: {d.address.notes}</p>}
            </div>

            {/* Store */}
            <p className="text-xs font-medium text-blue-600">
              {d?.storeId?.name ? `Tienda: ${d.storeId.name}` : "Plataforma MTZ"}
            </p>

            {/* Order info */}
            {d?.orderId && (
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Orden: #{String(d.orderId._id || d.orderId).slice(-8).toUpperCase()}</span>
                {d.orderId.totalBob != null && (
                  <span className="font-semibold text-gray-700">{Number(d.orderId.totalBob).toFixed(2)} Bs.</span>
                )}
              </div>
            )}

            {/* Take button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              disabled={takingId === d._id}
              onClick={() => handleTake(d._id)}
              sx={{ mt: 1, fontWeight: 600, textTransform: "none" }}
            >
              {takingId === d._id ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Tomar orden"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
