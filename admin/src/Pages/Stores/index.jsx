// admin/src/Pages/Stores/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Button, TextField, Pagination, Chip, CircularProgress, Alert as MUIAlert } from "@mui/material";
import { listStores, deleteStore, patchStoreStatus } from "../../services/stores";
import EditStore from "./EditStore";
import NewStoreDialog from "./NewStoreDialog";
import withPerm from "../../routes/withPerm";
import { setCurrentStoreId, getCurrentStoreId } from "../../utils/tenant";
import { usePermission } from "../../hooks/usePermission";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import RequestSellerCard from "./RequestSellerCard";

const CanCreateStore = withPerm(["store:create"]);

export default function StoresPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Crear / Editar
  const [editing, setEditing] = useState(null);
  const [openNew, setOpenNew] = useState(false);

  // Filtros & paginación
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const LIMIT = 20;

  // Selección múltiple
  const [selected, setSelected] = useState([]);

  // Permisos
  const { any: canCreate } = usePermission(["store:create"]);
  const { any: canEdit } = usePermission(["store:update"]);
  const { any: canDelete } = usePermission(["store:delete"]);

  // Tenant actual
  const current = getCurrentStoreId();

  // me (usar /api/user/me + anti-cache)
  const [me, setMe] = useState(null);
  useEffect(() => {
    let alive = true;
    api
      .get("/api/user/me", { params: { t: Date.now() } })
      .then((r) => { if (alive) setMe(r?.data?.data ?? r?.data ?? null); })
      .catch((e) => console.error("[/api/user/me] error:", e));
    return () => { alive = false; };
  }, []);
  const isSuper = !!(me?.platformRole === "SUPER_ADMIN" || me?.isSuper);

  // Auto-activar tenant si tengo memberships y aún no hay X-Store-Id
  useEffect(() => {
    if (!me || isSuper || current) return;
    const memberships = Array.isArray(me.memberships) ? me.memberships : [];
    const active = memberships.filter(m => (m?.status || "active") === "active");
    if (active.length === 0) return;
    const prefer = me.defaultStoreId || active[0]?.storeId || active[0]?.store?._id;
    if (prefer) {
      setCurrentStoreId(prefer);
      navigate("/admin/my-store", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, isSuper, current]);

  const params = useMemo(() => ({ page, limit: LIMIT, q }), [page, LIMIT, q]);

  async function load(p = 1) {
    setLoading(true);
    try {
      const { data, total } = await listStores({ page: p, limit: LIMIT, q });
      const list = Array.isArray(data) ? data : [];
      const totalPages = Math.max(1, Math.ceil((typeof total === "number" ? total : list.length) / LIMIT));
      setRows(list);
      setMeta({ totalPages, total: typeof total === "number" ? total : list.length });
      setSelected((prev) => prev.filter((id) => list.some((s) => String(s._id) === String(id))));
    } catch (e) {
      console.error("stores list error:", e);
      setRows([]);
      setMeta({ totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // page, LIMIT, q

  const setActive = (id) => {
    setCurrentStoreId(id || null);
    // window.location.reload();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta tienda?")) return;
    await deleteStore(id);
    if (current === id) setActive(null);
    load(page);
  };

  // Selección múltiple
  const toggleAll = (e) => {
    if (e.target.checked) setSelected(rows.map((r) => r._id));
    else setSelected([]);
  };
  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Acciones masivas de estado
  const bulkSetStatus = async (status) => {
    if (selected.length === 0) return;
    for (const id of selected) {
      try { await patchStoreStatus(id, status); } catch { }
    }
    setSelected([]);
    load(page);
  };

  const allChecked = selected.length > 0 && selected.length === rows.length;

  // Buscar
  const applySearch = () => {
    setPage(1);
    load(1);
  };

  // CTA “Ir a mi tienda” si tengo membership pero no tenant activo
  const hasMembership = useMemo(() => Array.isArray(me?.memberships) && me.memberships.length > 0, [me]);
  const showGoToMyStoreCTA = !isSuper && hasMembership && !current;

  const goToMyStore = () => {
    const memberships = Array.isArray(me?.memberships) ? me.memberships : [];
    const active = memberships.filter(m => (m?.status || "active") === "active");
    const prefer = me?.defaultStoreId || active[0]?.storeId || active[0]?.store?._id;
    if (prefer) {
      setCurrentStoreId(prefer);
      navigate("/admin/my-store");
    }
  };

  return (
    <div className="p-4">
      {showGoToMyStoreCTA && (
        <div className="mb-4">
          <MUIAlert severity="info" className="mb-2">
            Ya perteneces a una tienda. Actívala para ver su panel.
          </MUIAlert>
          <Button variant="contained" onClick={goToMyStore}>Ir a mi tienda</Button>
        </div>
      )}

      {/* Si NO es super, NO tiene memberships y NO hay tiendas → mostrar solicitud */}
      {!isSuper &&
        Array.isArray(me?.memberships) &&
        me.memberships.length === 0 &&
        rows.length === 0 && (
          <div className="mb-4">
            <RequestSellerCard onSubmitted={() => window.location.reload()} />
          </div>
        )}

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Tiendas</h1>
        <CanCreateStore>
          {canCreate && (
            <Button variant="contained" onClick={() => setOpenNew(true)}>
              Crear tienda
            </Button>
          )}
        </CanCreateStore>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <TextField
          label="Buscar tienda"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          size="small"
        />
        <div className="flex items-center">
          <Button variant="outlined" onClick={applySearch} disabled={loading}>
            Aplicar
          </Button>
        </div>
      </div>

      {/* Toolbar de selección */}
      {canEdit && selected.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm">{selected.length} seleccionadas</span>
          <Button size="small" variant="outlined" onClick={() => bulkSetStatus("active")}>
            Activar
          </Button>
          <Button size="small" variant="outlined" onClick={() => bulkSetStatus("suspended")}>
            Desactivar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Seleccionar todas"
                />
              </th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Alias / Slug</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Moneda</th>
              <th className="p-2 text-left">Activa</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6">
                  <div className="flex items-center gap-2">
                    <CircularProgress size={18} /> Cargando…
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Sin resultados
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(s._id)}
                      onChange={() => toggleOne(s._id)}
                      aria-label={`Seleccionar ${s.name || s.slug || s._id}`}
                    />
                  </td>
                  <td className="p-2">{s.name || "-"}</td>
                  <td className="p-2">{s.alias || s.slug || "-"}</td>
                  <td className="p-2">
                    <Chip
                      size="small"
                      label={s.status === "active" ? "Activo" : s.status || "—"}
                      color={s.status === "active" ? "success" : "warning"}
                    />
                  </td>
                  <td className="p-2">{s.currency || s.defaultCurrency || "BOB"}</td>
                  <td className="p-2">
                    <input
                      type="radio"
                      name="activeStore"
                      checked={String(current || "") === String(s._id)}
                      onChange={() => setActive(s._id)}
                      title="Seleccionar tienda activa"
                    />
                  </td>
                  <td className="p-2 text-right">
                    {canEdit && (
                      <button className="px-2 py-1 border rounded mr-2" onClick={() => setEditing(s)}>
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button className="px-2 py-1 border rounded" onClick={() => handleDelete(s._id)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs opacity-70">Total: {meta.total}</span>
        <Pagination
          count={meta.totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
          size="small"
          color="primary"
        />
      </div>

      {/* Modales */}
      {!!editing && (
        <EditStore
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load(page);
          }}
        />
      )}

      <NewStoreDialog
        open={openNew}
        onClose={(ok) => {
          setOpenNew(false);
          if (ok) load(page);
        }}
      />
    </div>
  );
}

