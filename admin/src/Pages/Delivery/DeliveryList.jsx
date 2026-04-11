import React, { useEffect, useState } from "react";
import ContentFilters from "../../components/Filters/ContentFilters";
import Badge from "../../components/Badge";
import { Button, Pagination, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { listDeliveries, updateDeliveryStatus, uploadDeliveryProof, dispatchToWarehouse, receiveAtWarehouse } from "../../services/delivery";
import AssignModal from "./AssignModal";
import DeliveryStatusSelect from "./DeliveryStatusSelect";
import { FaRegEye } from "react-icons/fa";
import { MdWarehouse } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";

const METHOD_LABELS = {
  MTZSTORE_EXPRESS: { label: "Express", cls: "bg-orange-100 text-orange-700" },
  MTZSTORE_STANDARD: { label: "Estandar", cls: "bg-blue-100 text-blue-700" },
  STORE: { label: "Tienda", cls: "bg-purple-100 text-purple-700" },
};

export default function DeliveryList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get("shippingMethod") || "";

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState(initialMethod);
  const [filters, setFilters] = useState({ q: "", status: "", storeId: "", dateFrom: "", dateTo: "" });

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async (p = 1) => {
    const params = {
      page: p,
      limit: 10,
      ...(filters.q && { q: filters.q }),
      ...(filters.status && { status: filters.status }),
      ...(filters.dateFrom && { startDate: filters.dateFrom }),
      ...(filters.dateTo && { endDate: filters.dateTo }),
      ...(methodFilter && { shippingMethod: methodFilter }),
    };
    const res = await listDeliveries(params);
    const payload = res?.data || res;
    setItems(payload?.data || []);
    setMeta({ totalPages: payload?.totalPages || Math.ceil((payload?.total || 0) / 10) || 1 });
  };

  useEffect(() => { fetchData(page); }, [page]);
  useEffect(() => { setPage(1); fetchData(1); }, [JSON.stringify(filters), methodFilter]);

  const openAssign = (id) => { setSelectedId(id); setAssignOpen(true); };

  const quickStatus = async (id, status) => {
    await updateDeliveryStatus(id, { status });
    fetchData(page);
  };

  const uploadProof = (id, files) => {
    if (!files?.length) return;
    uploadDeliveryProof(id, [...files]).then(() => fetchData(page));
  };

  const handleDispatchWarehouse = async (id) => {
    if (!window.confirm("Confirmar despacho del producto a almacen MTZ?")) return;
    try {
      const res = await dispatchToWarehouse(id);
      if (res?.error) alert(res?.details ? Object.values(res.details).join(". ") : res?.message || "Error");
    } catch { }
    fetchData(page);
  };

  const handleReceiveWarehouse = async (id) => {
    if (!window.confirm("Confirmar recepcion del producto en almacen?")) return;
    try {
      const res = await receiveAtWarehouse(id);
      if (res?.error) alert(res?.details ? Object.values(res.details).join(". ") : res?.message || "Error");
    } catch { }
    fetchData(page);
  };

  const hasDispatchedToWarehouse = (row) =>
    row?.timeline?.some(e => e.type === "DISPATCHED_TO_WAREHOUSE");

  const hasWarehouseReceipt = (row) =>
    row?.timeline?.some(e => e.type === "RECEIVED_AT_WAREHOUSE");

  return (
    <div className="card bg-white shadow-md sm:rounded-lg p-4">
      <h1 className="text-[20px] font-semibold mb-3">Entregas</h1>

      {/* Filtro por metodo de envio */}
      <div className="mb-3">
        <ToggleButtonGroup
          value={methodFilter}
          exclusive
          onChange={(_, v) => setMethodFilter(v ?? "")}
          size="small"
        >
          <ToggleButton value="">Todos</ToggleButton>
          <ToggleButton value="MTZSTORE_EXPRESS">Express</ToggleButton>
          <ToggleButton value="MTZSTORE_STANDARD">Estandar</ToggleButton>
          <ToggleButton value="STORE">Tienda</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <ContentFilters value={filters} onChange={(patch) => setFilters((v) => ({ ...v, ...patch }))}
        showSearch={true} showDates={true} />

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Telefono</th>
              <th className="px-4 py-3">Envio</th>
              <th className="px-4 py-3">Agente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const ml = METHOD_LABELS[row?.shippingMethod] || METHOD_LABELS.MTZSTORE_EXPRESS;
              const isStandard = row?.shippingMethod === "MTZSTORE_STANDARD";
              const isPending = row?.status === "PENDING";
              const dispatched = hasDispatchedToWarehouse(row);
              const received = hasWarehouseReceipt(row);

              return (
                <tr key={row._id} className="bg-white border-b border-gray-200">
                  <td className="px-4 py-3 whitespace-nowrap">{row?.address?.name || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row?.address?.phone || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ml.cls}`}>
                      {ml.label}
                    </span>
                    {isStandard && dispatched && !received && (
                      <span className="ml-1 text-[10px] text-yellow-600 font-medium">Despachado</span>
                    )}
                    {isStandard && received && (
                      <span className="ml-1 text-[10px] text-green-600 font-medium">Recibido</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {row?.assigneeId?.name || <span className="text-gray-400">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge kind="delivery" status={row?.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {row?.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <IconButton size="small" onClick={() => navigate(`/admin/delivery/${row._id}`)}>
                        <FaRegEye />
                      </IconButton>

                      {/* Boton despachar a almacen (tienda, Standard pendiente, sin despacho) */}
                      {isStandard && isPending && !dispatched && (
                        <Button size="small" variant="contained" color="info"
                          onClick={() => handleDispatchWarehouse(row._id)}>
                          Despachar
                        </Button>
                      )}

                      {/* Boton recibir en almacen (Standard, pendiente, despachado pero no recibido) */}
                      {isStandard && isPending && dispatched && !received && (
                        <Button size="small" variant="contained" color="warning"
                          startIcon={<MdWarehouse />}
                          onClick={() => handleReceiveWarehouse(row._id)}>
                          Recibir
                        </Button>
                      )}

                      <Button size="small" variant="outlined" onClick={() => openAssign(row._id)}>
                        Asignar
                      </Button>

                      <DeliveryStatusSelect
                        value={row?.status}
                        onChange={(s) => quickStatus(row._id, s)}
                      />

                      <Button component="label" size="small" variant="outlined">
                        Prueba
                        <input type="file" hidden multiple onChange={(e) => uploadProof(row._id, e.target.files)} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center mt-5">
          <Pagination count={meta.totalPages} page={page} onChange={(_, v) => setPage(v)} />
        </div>
      )}

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        taskId={selectedId}
        onAssigned={() => fetchData(page)}
      />
    </div>
  );
}
