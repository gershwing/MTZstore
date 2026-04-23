import React, { useEffect, useState } from "react";
import { availableDeliveries, takeDelivery } from "../../services/delivery";
import Badge from "../../Components/Badge";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SERVICE_TABS = [
  { value: "", label: "Todos" },
  { value: "express", label: "Express" },
  { value: "standard", label: "Estándar" },
];

const METHOD_BADGE = {
  MTZSTORE_EXPRESS: { label: "MTZ Express", cls: "bg-purple-100 text-purple-700" },
  MTZSTORE_STANDARD: { label: "MTZ Estándar", cls: "bg-blue-100 text-blue-700" },
  STORE_EXPRESS: { label: "Tienda Express", cls: "bg-orange-100 text-orange-700" },
  STORE_STANDARD: { label: "Tienda Estándar", cls: "bg-teal-100 text-teal-700" },
  STORE: { label: "Tienda", cls: "bg-gray-100 text-gray-600" },
};

export default function AvailableDeliveries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState(null);
  const [serviceType, setServiceType] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (serviceType) params.serviceType = serviceType;
      const res = await availableDeliveries(params);
      const payload = res?.data || res;
      setRows(payload?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [serviceType]);

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

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Entregas disponibles</h1>
      <p className="text-sm text-gray-500">
        Ordenes pendientes de asignacion segun tu perfil y sociedades activas.
      </p>

      {/* Filtro por tipo */}
      <div className="flex gap-1 flex-wrap">
        {SERVICE_TABS.map((t) => (
          <button key={t.value} onClick={() => setServiceType(t.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${serviceType === t.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando entregas disponibles...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay entregas disponibles en este momento.</p>
          <p className="text-gray-400 text-sm mt-1">
            {serviceType ? `No hay entregas ${serviceType === "express" ? "Express" : "Estándar"} disponibles.` : "Nuevas ordenes apareceran aqui segun tus permisos y sociedades."}
          </p>
          <button onClick={() => navigate("/admin/my-partnerships")} className="mt-3 text-blue-600 text-sm hover:underline">
            Explorar sociedades con tiendas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((d) => {
            const method = METHOD_BADGE[d.shippingMethod] || METHOD_BADGE.STORE;
            return (
              <div key={d._id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-lg">{d?.address?.name || d?.orderId?.userId?.name || "Sin nombre"}</p>
                    <p className="text-sm text-gray-500">{d?.address?.phone || "Sin telefono"}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge kind="delivery" status={d?.status} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${method.cls}`}>
                      {method.label}
                    </span>
                  </div>
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
                <Button fullWidth variant="contained" color="primary" size="medium"
                  disabled={takingId === d._id} onClick={() => handleTake(d._id)}
                  sx={{ mt: 1, fontWeight: 600, textTransform: "none" }}>
                  {takingId === d._id ? <CircularProgress size={20} color="inherit" /> : "Tomar orden"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
