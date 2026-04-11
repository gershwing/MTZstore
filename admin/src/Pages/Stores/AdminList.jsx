import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  listSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  deleteSellerApplication,
} from "../../services/sellerApps";

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
const isUrl = (u) => !!u && /^(https?:|data:)/i.test(String(u));

function deriveStoreName(row) {
  const u = row?.user || row?.userId || {};
  const first = u?.firstName || row?.firstName || row?.formData?.firstName;
  const last = u?.lastName || row?.lastName || row?.formData?.lastName;
  if (first || last) {
    const full = [first, last].filter(Boolean).join(" ").trim();
    if (full) return `${full} Store`;
  }
  const fromItem = row?.store?.name || row?.storeName || row?.formData?.storeName || row?.businessName || row?.formData?.businessName;
  if (fromItem && String(fromItem).trim()) return String(fromItem).trim();
  if (u?.name) return `Tienda de ${u.name}`;
  return "Tienda MTZ";
}

export default function SellerApplicationsAdminList() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [zoomSrc, setZoomSrc] = useState(null);
  const [rejOpen, setRejOpen] = useState(false);
  const [rejId, setRejId] = useState(null);
  const [rejReason, setRejReason] = useState("");

  const fetchList = async (pg = page, opts = {}) => {
    setLoading(true);
    try {
      const params = { page: pg, limit, _ts: Date.now() };
      const qVal = (opts.q ?? q)?.trim();
      const st = opts.status ?? status;
      if (st && st !== "ALL") params.status = st;
      if (qVal) params.q = qVal;
      const { items, total: t, totalPages: tp, page: p } = await listSellerApplications(params);
      setRows((Array.isArray(items) ? items : []).map((it) => ({ id: it._id || it.id, _id: it._id || it.id, ...it })));
      setTotal(Number(t || 0));
      setTotalPages(Number(tp || 1));
      setPage(Number(p || 1));
    } catch (e) {
      console.error("fetchList error:", e);
      setRows([]); setTotal(0); setTotalPages(1);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(1); }, []);

  const handleApprove = async (row) => {
    if (!confirm("Aprobar esta solicitud y crear la tienda?")) return;
    try {
      await approveSellerApplication(row._id || row.id, { store: { name: deriveStoreName(row) } });
      await fetchList(page);
      toast.success("Solicitud aprobada");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al aprobar");
    }
  };

  const handleRejectOpen = (id) => { setRejId(id); setRejReason(""); setRejOpen(true); };

  const handleRejectConfirm = async () => {
    if (!rejId || loading) return;
    const clean = String(rejReason || "").trim();
    if (clean.length < MIN_REASON) { toast.warn(`Escribe un motivo de al menos ${MIN_REASON} caracteres.`); return; }
    setLoading(true);
    try {
      await rejectSellerApplication(rejId, { reason: clean, notes: clean });
      setRejOpen(false); setRejId(null); setRejReason("");
      await fetchList(page);
      toast.success("Solicitud rechazada");
    } catch (e) {
      toast.error(e?.response?.data?.message || "No se pudo rechazar.");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!id || loading) return;
    if (!confirm("Eliminar esta solicitud? (solo si no fue aprobada)")) return;
    setLoading(true);
    try {
      await deleteSellerApplication(id);
      await fetchList(page);
      toast.success("Solicitud eliminada");
    } catch (e) {
      toast.error(e?.response?.data?.message || "No se pudo eliminar.");
    } finally { setLoading(false); }
  };

  const getApplicant = (row) => {
    const u = row.user || row.userId || row.applicant || {};
    return {
      name: u?.name || u?.fullName || row.formData?.fullName || "Sin nombre",
      email: u?.email || row.formData?.email || "",
    };
  };

  const getStoreName = (row) => row?.store?.name || row?.storeName || row?.formData?.storeName || "";
  const getDocNumber = (row) => row.documentNumber || row.docNumber || row.formData?.documentNumber || "";

  const getImages = (row) => {
    const f = row.idFrontUrl || row.docFrontUrl || row.documents?.frontUrl || row.formData?.idFrontUrl;
    const b = row.idBackUrl || row.docBackUrl || row.documents?.backUrl || row.formData?.idBackUrl;
    const s = row.selfieUrl || row.documents?.selfieUrl || row.formData?.selfieUrl;
    return [
      { url: f, label: "CI Anv." },
      { url: b, label: "CI Rev." },
      { url: s, label: "Selfie" },
    ].filter((i) => isUrl(i.url));
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="p-4 space-y-3 h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Solicitudes de Tiendas</h1>
        <span className="text-sm text-gray-500">{total} solicitudes</span>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-lg p-3 flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fetchList(1, { q: e.target.value }); }}
          placeholder="Buscar por tienda, documento, descripcion..."
          className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); fetchList(1, { status: e.target.value }); }}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => { setQ(""); setStatus("ALL"); fetchList(1, { q: "", status: "ALL" }); }} className="border rounded px-3 py-1.5 text-sm hover:bg-gray-50">
          Limpiar
        </button>
        <div className="flex gap-1 ml-auto">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); fetchList(1, { status: s.value }); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${status === s.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
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
            const applicant = getApplicant(row);
            const storeName = getStoreName(row);
            const docNumber = getDocNumber(row);
            const images = getImages(row);
            const s = row.status || "PENDING";
            const isPending = s === "PENDING";

            return (
              <div key={row.id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{applicant.name}</span>
                    {applicant.email && <span className="text-xs text-gray-400 truncate">{applicant.email}</span>}
                    {(row.reapplyCount || 0) > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5">Re-solicitud #{row.reapplyCount}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    {storeName && <span>Tienda: <span className="text-gray-700 font-medium">{storeName}</span></span>}
                    {docNumber && <span>CI: {docNumber}</span>}
                    <span>{formatDate(row.createdAt)}</span>
                  </div>
                  {s === "REJECTED" && (row.notes || row.reason) && (
                    <p className="text-[11px] text-red-600 mt-0.5 truncate">Motivo: {row.notes || row.reason}</p>
                  )}
                </div>

                {/* Imágenes */}
                <div className="flex gap-1.5 shrink-0">
                  {images.map((img, idx) => (
                    <div key={idx} className="text-center">
                      <img
                        src={img.url}
                        alt={img.label}
                        onClick={() => setZoomSrc(img.url)}
                        className="w-14 h-14 object-cover rounded border border-gray-200 cursor-zoom-in hover:border-blue-400"
                      />
                      <p className="text-[9px] text-gray-400 mt-0.5">{img.label}</p>
                    </div>
                  ))}
                </div>

                {/* Estado */}
                <span className={`text-xs px-2 py-1 rounded font-medium shrink-0 ${STATUS_COLORS[s] || ""}`}>
                  {STATUS_LABELS[s] || s}
                </span>

                {/* Acciones */}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApprove(row)}
                    disabled={!isPending || loading}
                    className="bg-green-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRejectOpen(row._id)}
                    disabled={!isPending || loading}
                    className="bg-orange-500 text-white rounded px-3 py-1 text-xs font-medium hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleDelete(row._id)}
                    disabled={s === "APPROVED" || loading}
                    className="border border-red-300 text-red-600 rounded px-2 py-1 text-xs hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button onClick={() => fetchList(page - 1)} disabled={page <= 1 || loading} className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30">Anterior</button>
          <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
          <button onClick={() => fetchList(page + 1)} disabled={page >= totalPages || loading} className="border rounded px-4 py-1 text-sm hover:bg-gray-50 disabled:opacity-30">Siguiente</button>
        </div>
      )}

      {/* Modal Zoom */}
      {zoomSrc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setZoomSrc(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Vista de imagen</h3>
              <button onClick={() => setZoomSrc(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <img src={zoomSrc} alt="zoom" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}

      {/* Modal Rechazo */}
      {rejOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Rechazar solicitud</h2>
              <button onClick={() => setRejOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Motivo del rechazo *</label>
              <textarea autoFocus rows={3} value={rejReason} onChange={(e) => setRejReason(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej.: El numero de documento no coincide con la imagen." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRejOpen(false)} className="flex-1 border rounded py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleRejectConfirm} disabled={String(rejReason || "").trim().length < MIN_REASON || loading} className="flex-1 bg-orange-500 text-white rounded py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
