import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDelivery, updateDeliveryStatus, uploadDeliveryProof } from "../../services/delivery";
import Badge from "../../Components/Badge";
import VerifiedBadge from "../../Components/VerifiedBadge";
import DeliveryStatusSelect from "./DeliveryStatusSelect";
import { Button, Chip } from "@mui/material";

const EVENT_LABELS = {
  CREATED: "Creado",
  ASSIGNED: "Asignado",
  PICKED_UP: "Recogido",
  IN_TRANSIT: "En transito",
  DELIVERED: "Entregado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
};

export default function DeliveryDetail({ id: propId }) {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await getDelivery(id);
    const payload = res?.data || res;
    setData(payload?.data || payload);
  };

  useEffect(() => { if (id) load(); /* eslint-disable-next-line */ }, [id]);

  const changeStatus = async (status) => {
    await updateDeliveryStatus(id, { status });
    load();
  };

  const upload = (files) => {
    if (!files?.length) return;
    uploadDeliveryProof(id, [...files]).then(() => load());
  };

  if (!data) return <div className="p-5 text-gray-500">Cargando...</div>;

  const assignee = data.assigneeId;
  const store = data.storeId;
  const order = data.orderId;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Entrega</h1>
          <p className="text-sm text-gray-500">
            {order?.saleNumber || `#${data._id?.slice(-8)}`}
            {store?.name && <span className="ml-2 text-blue-600">| {store.name}</span>}
          </p>
          <p className="text-xs text-gray-400">Actualizado: {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"}</p>
        </div>
        <Badge kind="delivery" status={data?.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Direccion */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">Direccion de entrega</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">{data?.address?.name || "—"}</p>
            <p>{data?.address?.phone || "—"}</p>
            <p>{data?.address?.line1 || "—"}</p>
            {data?.address?.line2 && <p>{data.address.line2}</p>}
            {data?.address?.city && <p>{data.address.city}{data.address.state ? `, ${data.address.state}` : ""}</p>}
            {data?.address?.notes && <p className="text-xs text-gray-400">Ref: {data.address.notes}</p>}
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">Acciones</h3>
          <div className="space-y-2">
            <DeliveryStatusSelect value={data?.status} onChange={changeStatus} />
            <Button component="label" variant="outlined" fullWidth size="small">
              Subir pruebas
              <input type="file" hidden multiple onChange={(e) => upload(e.target.files)} />
            </Button>
          </div>
        </div>

        {/* Asignacion */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">Asignacion</h3>
          <div className="text-sm space-y-1">
            <p>Agente: <span className="font-medium">{assignee?.name || "Sin asignar"}</span> <VerifiedBadge trustLevel={data?.assigneeTrustLevel} size={14} /></p>
            {assignee?.email && <p className="text-xs text-gray-500">{assignee.email}</p>}
            {assignee?.phone && <p className="text-xs text-gray-500">Tel: {assignee.phone}</p>}
          </div>
          {order?.total && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">Total orden: <span className="font-medium">Bs. {Number(order.total || 0).toFixed(2)}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-700">Timeline</h3>
        {(data?.timeline || []).length > 0 ? (
          <div className="space-y-2">
            {(data.timeline || []).map((ev, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs text-gray-400 w-32 shrink-0">
                  {ev?.at ? new Date(ev.at).toLocaleString() : "—"}
                </span>
                <Chip label={EVENT_LABELS[ev?.type] || ev?.type} size="small" variant="outlined" />
                {ev?.note && <span className="text-gray-600">{ev.note}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin eventos</p>
        )}
      </div>

      {/* Pruebas */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-700">Pruebas de entrega</h3>
        {(data?.proofs || []).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.proofs.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer" className="block">
                <img src={p.url} className="w-full h-40 object-cover rounded-md border" alt={`proof-${i}`} />
                {p.name && <p className="text-xs text-gray-400 mt-1 truncate">{p.name}</p>}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin archivos adjuntos</p>
        )}
      </div>
    </div>
  );
}
