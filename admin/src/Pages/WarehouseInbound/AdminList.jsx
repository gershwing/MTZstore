import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { listAdmin, approveRequest, rejectRequest } from "../../services/warehouseInbound";
import { useAuth } from "../../hooks/useAuth";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "REJECTED", label: "Rechazadas" },
];

const STATUS_LABELS = { PENDING: "Pendiente", APPROVED: "Aprobada", REJECTED: "Rechazada" };
const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const MIN_REASON = 6;

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
}

function getRequesterInfo(row) {
  const u = row.user || row.userId || row.requester || {};
  return {
    name: u?.name || u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "Sin nombre",
    email: u?.email || "",
  };
}

function getStoreInfo(row) {
  const s = row?.storeId || row?.store || {};
  const name = s?.name || s?.businessName || row?.storeName || "—";
  const id = s?._id || row?.storeId?._id || "";
  const shortId = id ? String(id).slice(-6).toUpperCase() : "";
  return { name, id, shortId };
}

function getLineItemsSummary(row) {
  const items = row?.items || row?.lineItems || [];
  const count = items.length;
  const totalUnits = items.reduce((sum, it) => sum + (Number(it.qty) || Number(it.quantity) || 0), 0);
  return { count, totalUnits };
}

export default function WarehouseInboundAdminList() {
  const { isSuper } = useAuth();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  // Reject modal
  const [rejOpen, setRejOpen] = useState(false);
  const [rejId, setRejId] = useState(null);
  const [rejReason, setRejReason] = useState("");

  // Detail modal
  const [detailRow, setDetailRow] = useState(null);

  const fetchList = async (pg = page, opts = {}) => {
    setLoading(true);
    try {
      const params = { page: pg, limit, _ts: Date.now() };
      const qVal = (opts.q ?? q)?.trim();
      const st = opts.status ?? status;
      if (st && st !== "ALL") params.status = st;
      if (qVal) params.q = qVal;
      const raw = await listAdmin(params);
      // res.ok() wraps in { success, error, data: { items, total, ... } }
      const d = raw?.data || raw;
      const items = Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [];
      setRows(items.map((it) => ({ id: it._id || it.id, _id: it._id || it.id, ...it })));
      setTotal(Number(d?.total || items.length || 0));
      setTotalPages(Number(d?.totalPages || Math.ceil((d?.total || items.length) / limit) || 1));
      setPage(Number(d?.page || pg));
    } catch (e) {
      console.error("fetchList error:", e);
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const handleApprove = async (row) => {
    if (!confirm("¿Aprobar esta solicitud de envío al almacén?")) return;
    setLoading(true);
    try {
      await approveRequest(row._id || row.id);
      await fetchList(page);
      toast.success("Solicitud aprobada");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al aprobar");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOpen = (id) => {
    setRejId(id);
    setRejReason("");
    setRejOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejId || loading) return;
    const clean = String(rejReason || "").trim();
    if (clean.length < MIN_REASON) {
      toast.warn(`Escribe un motivo de al menos ${MIN_REASON} caracteres.`);
      return;
    }
    setLoading(true);
    try {
      await rejectRequest(rejId, { reason: clean, notes: clean });
      setRejOpen(false);
      setRejId(null);
      setRejReason("");
      await fetchList(page);
      toast.success("Solicitud rechazada");
    } catch (e) {
      toast.error(e?.response?.data?.message || "No se pudo rechazar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-3 h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Solicitudes de Envio al Almacen</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} solicitudes</span>
          <Link to="create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              + Nueva Solicitud
            </button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-lg p-3 flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchList(1, { q: e.target.value });
          }}
          placeholder="Buscar por tienda, vendedor..."
          className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            fetchList(1, { status: e.target.value });
          }}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setQ("");
            setStatus("ALL");
            fetchList(1, { q: "", status: "ALL" });
          }}
          className="border rounded px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Limpiar
        </button>
        <div className="flex gap-1 ml-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatus(s.value);
                fetchList(1, { status: s.value });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                status === s.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">No hay solicitudes</div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const requester = getRequesterInfo(row);
            const store = getStoreInfo(row);
            const { count, totalUnits } = getLineItemsSummary(row);
            const s = row.status || "PENDING";
            const isPending = s === "PENDING";

            return (
              <div
                key={row.id}
                className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{store.name}</span>
                    {store.shortId && <span className="text-xs text-gray-400 font-mono">#{store.shortId}</span>}
                    <span className="text-xs text-gray-400 truncate">{requester.name}</span>
                    {requester.email && (
                      <span className="text-xs text-gray-400 truncate">{requester.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span>
                      {count} producto{count !== 1 ? "s" : ""} &middot; {totalUnits} unidad{totalUnits !== 1 ? "es" : ""}
                    </span>
                    <span>{formatDate(row.createdAt)}</span>
                  </div>
                  {row.notes && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">Nota: {row.notes}</p>
                  )}
                  {s === "REJECTED" && (row.rejectionReason || row.reason) && (
                    <p className="text-[11px] text-red-600 mt-0.5 truncate">
                      Motivo: {row.rejectionReason || row.reason}
                    </p>
                  )}
                </div>

                {/* Detalle */}
                <button
                  onClick={() => setDetailRow(row)}
                  className="border border-gray-300 text-gray-600 rounded px-3 py-1 text-xs hover:bg-gray-50 shrink-0"
                >
                  Ver detalle
                </button>

                {/* Estado */}
                <span className={`text-xs px-2 py-1 rounded font-medium shrink-0 ${STATUS_COLORS[s] || ""}`}>
                  {STATUS_LABELS[s] || s}
                </span>

                {/* Acciones — solo SUPER_ADMIN puede aprobar/rechazar */}
                {isSuper && isPending && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(row)}
                      disabled={loading}
                      className="bg-green-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectOpen(row._id)}
                      disabled={loading}
                      className="bg-orange-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginacion */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => fetchList(page - 1)}
            disabled={page <= 1 || loading}
            className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => fetchList(page + 1)}
            disabled={page >= totalPages || loading}
            className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Detalle */}
      {detailRow && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailRow(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Detalle de solicitud</h2>
              <button
                onClick={() => setDetailRow(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Tienda:</span> {getStoreInfo(detailRow).name}
                {getStoreInfo(detailRow).shortId && <span className="text-xs text-gray-400 font-mono ml-1">#{getStoreInfo(detailRow).shortId}</span>}
              </p>
              <p>
                <span className="font-medium">Solicitante:</span> {getRequesterInfo(detailRow).name}
              </p>
              <p>
                <span className="font-medium">Fecha:</span> {formatDate(detailRow.createdAt)}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[detailRow.status] || ""}`}>
                  {STATUS_LABELS[detailRow.status] || detailRow.status}
                </span>
              </p>
              {detailRow.notes && (
                <p>
                  <span className="font-medium">Notas:</span> {detailRow.notes}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">Productos ({(detailRow.items || detailRow.lineItems || []).length})</h3>
              <div className="border rounded divide-y">
                {(detailRow.items || detailRow.lineItems || []).map((item, idx) => (
                  <div key={idx} className="px-3 py-2 flex justify-between items-center text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName || item.name || "Producto"}</p>
                      {(item.variantLabel || item.variantName) && (
                        <p className="text-xs text-gray-500">{item.variantLabel || item.variantName}</p>
                      )}
                      {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    </div>
                    <span className="font-semibold text-gray-700 shrink-0 ml-3">
                      {item.qty || item.quantity} uds.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazo */}
      {rejOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Rechazar solicitud</h2>
              <button
                onClick={() => setRejOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Motivo del rechazo *</label>
              <textarea
                autoFocus
                rows={3}
                value={rejReason}
                onChange={(e) => setRejReason(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej.: Cantidades exceden el espacio disponible."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRejOpen(false)}
                className="flex-1 border rounded py-2 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={String(rejReason || "").trim().length < MIN_REASON || loading}
                className="flex-1 bg-orange-500 text-white rounded py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
