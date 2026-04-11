// admin/src/Pages/Users/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    IconButton,
    Menu,
    MenuItem,
    Checkbox,
    CircularProgress,
    Pagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";

// Servicios y hooks
import {
    listUsers as adminListUsers,
    fetchUsers as fetchUsersSvc,
    updateUserStatus,
    updateUserPlatformRole,
    removeUser,
} from "../../services/adminUsers";
import { listStores } from "../../services/stores";
import { usePermission } from "../../hooks/usePermission";
import withPerm from "../../routes/withPerm";
import NewUserDialog from "./NewUserDialog";
import UserDrawer from "./UserDrawer";
import { useAuth } from "../../hooks/useAuth";
import { getSocket } from "../../utils/socket"; // ⬅️ para refresh en vivo

// ✅ componentes
import UsersFilters from "./UsersFilters";
import UsersBulkBar from "./UsersBulkBar";

const CanInvite = withPerm(["user:invite"]);

// Deriva un rol de plataforma "visible" de forma robusta
const derivePlatformRole = (u = {}) => {
    const pr = String(u.platformRole || u.role || "").trim().toUpperCase();
    if (pr) return pr;
    const arr = Array.isArray(u.roles) ? u.roles.map(String) : [];
    if (arr.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
    if (arr.includes("STORE_OWNER")) return "STORE_OWNER";
    if (arr.includes("DELIVERY_AGENT")) return "DELIVERY_AGENT";
    if (arr.length) return String(arr[0]).toUpperCase();
    return "CUSTOMER";
};

// Obtiene TODOS los roles unicos del usuario (platformRole + memberships)
// Suprime CUSTOMER cuando hay roles operativos (CUSTOMER es implícito)
const getAllUserRoles = (u = {}) => {
    const roles = new Set();
    const pr = String(u.platformRole || "").trim().toUpperCase();
    if (pr) roles.add(pr);
    const legacy = String(u.role || "").trim().toUpperCase();
    if (legacy && legacy !== pr) roles.add(legacy);
    if (Array.isArray(u.memberships)) {
        for (const m of u.memberships) {
            if (m?.role) roles.add(String(m.role).toUpperCase());
        }
    }
    if (roles.size === 0) roles.add("CUSTOMER");

    // Suprimir CUSTOMER/USER si hay roles operativos
    const implicit = ["CUSTOMER", "USER"];
    const hasOperational = [...roles].some((r) => !implicit.includes(r));
    if (hasOperational) {
        for (const ir of implicit) roles.delete(ir);
    }

    return [...roles];
};

const ROLE_BADGE_STYLES = {
    SUPER_ADMIN: "bg-red-100 text-red-700",
    STORE_OWNER: "bg-blue-100 text-blue-700",
    DELIVERY_AGENT: "bg-purple-100 text-purple-700",
    FINANCE_MANAGER: "bg-amber-100 text-amber-700",
    INVENTORY_MANAGER: "bg-teal-100 text-teal-700",
    ORDER_MANAGER: "bg-indigo-100 text-indigo-700",
    SUPPORT_AGENT: "bg-cyan-100 text-cyan-700",
    CUSTOMER: "bg-gray-100 text-gray-600",
};

function UsersPage() {
    const perm = usePermission();
    const { me } = useAuth?.() || { me: null };
    const isPlatform =
        !!me?.isSuper ||
        me?.role === "SUPER_ADMIN" ||
        (Array.isArray(me?.roles) && me.roles.includes("SUPER_ADMIN"));

    // ===== Estado principal =====
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);

    const [stores, setStores] = useState([]);
    const [openNew, setOpenNew] = useState(false);

    const [filters, setFilters] = useState({ q: "", role: "", status: "" });
    const [page, setPage] = useState(1);

    // ===== Selección y menús =====
    const [selectedIds, setSelectedIds] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuForId, setMenuForId] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Drawer detalle
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUser, setDrawerUser] = useState(null);

    // Map de storeId → nombre para resolver tiendas en la tabla
    const storeMap = useMemo(() => {
        const m = new Map();
        stores.forEach((s) => m.set(String(s._id), s.name));
        return m;
    }, [stores]);

    // Si tu hook aún no tiene any(), usa can como fallback
    const canRead = useMemo(() => {
        if (perm?.any) return perm.any(["user:read"]);
        return typeof perm?.can === "function" ? perm.can("user:read") : true;
    }, [perm]);

    // ===== Cargas =====
    const fetchStores = async () => {
        try {
            const res = await listStores({ limit: 200 });
            setStores(res?.data || res?.items || []);
        } catch {
            /* opcional toast */
        }
    };

    // util para refrescar explícitamente
    const loadUsers = async (p = page) => {
        setLoading(true);
        try {
            const res = await adminListUsers(
                { page: p, limit: 20, q: filters.q, status: filters.status, role: filters.role },
                { omitTenantHeader: true }
            );

            const items = res?.data?.items || res?.items || res?.data || res?.users || [];
            const total = res?.data?.total ?? res?.total ?? res?.meta?.total ?? items.length;
            const totalPages = res?.meta?.totalPages || res?.totalPages || Math.max(1, Math.ceil(total / 20));

            setRows(items);
            setMeta({ totalPages, total });
            setSelectedIds([]);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "No se pudo cargar usuarios";
            toast.error(msg);
            setRows([]);
            setMeta({ totalPages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Carga de TIENDAS
    useEffect(() => {
        if (!canRead) return;
        fetchStores();
    }, [canRead]);

    // 🔄 Carga de USUARIOS (reacciona a page y filtros)
    useEffect(() => {
        let mounted = true;
        setLoading(true);

        fetchUsersSvc(
            { page, limit: 20, q: filters.q, status: filters.status, role: filters.role },
            { omitTenantHeader: true }
        )
            .then(({ data, total }) => {
                if (!mounted) return;
                setRows(Array.isArray(data) ? data : []);
                setMeta((m) => ({ ...m, total, totalPages: Math.max(1, Math.ceil(total / 20)) }));
                setSelectedIds([]);
            })
            .catch((e) => {
                toast.error(e?.response?.data?.message || "No se pudo listar usuarios");
                setRows([]);
                setMeta({ totalPages: 1, total: 0 });
            })
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [page, filters.q, filters.status, filters.role]);

    // 🔔 Refresco en vivo cuando cambian roles o se aprueba una seller-app
    useEffect(() => {
        const s = getSocket?.();
        if (!s) return;
        const reload = () => loadUsers(1);
        s.on("role:changed", reload);
        s.on("seller-app:status", reload);
        return () => {
            s.off("role:changed", reload);
            s.off("seller-app:status", reload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Selecciones =====
    const allChecked = useMemo(() => rows.length > 0 && selectedIds.length === rows.length, [rows, selectedIds]);
    const indeterminate = useMemo(
        () => selectedIds.length > 0 && selectedIds.length < rows.length,
        [rows, selectedIds]
    );

    const toggleAll = (checked) => {
        if (checked) setSelectedIds(rows.map((r) => r._id));
        else setSelectedIds([]);
    };

    const toggleOne = (id, checked) => {
        setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
    };

    // ===== Acciones POR FILA =====
    const onRowMenu = (e, id) => {
        setAnchorEl(e.currentTarget);
        setMenuForId(id);
    };
    const closeMenu = () => {
        setAnchorEl(null);
        setMenuForId(null);
    };

    const onEdit = (row) => {
        setDrawerUser(row);
        setDrawerOpen(true);
        closeMenu();
    };

    const onToggleStatus = async (row) => {
        try {
            const next = row?.status === "active" || row?.active ? "suspended" : "active";
            await updateUserStatus(row._id, next);
            toast.success(next === "active" ? "Usuario activado" : "Usuario suspendido");
            await loadUsers();
        } catch (e) {
            console.error("[toggleStatus]", e);
            toast.error("No se pudo cambiar el estado");
        } finally {
            closeMenu();
        }
    };

    const onDelete = async (row) => {
        try {
            await removeUser(row._id);
            toast.success("Usuario eliminado");
            await loadUsers();
        } catch (e) {
            console.error("[deleteUser]", e);
            toast.error("No se pudo eliminar");
        } finally {
            closeMenu();
        }
    };

    const onQuickRoleChange = async (row, newRole) => {
        try {
            await updateUserPlatformRole(row._id, newRole);
            toast.success(`Rol cambiado a ${newRole}`);
            await loadUsers();
        } catch (e) {
            console.error("[quickRoleChange]", e);
            toast.error(e?.response?.data?.message || "No se pudo cambiar el rol");
        } finally {
            closeMenu();
        }
    };

    return (
        <div
            className="p-4 bg-[#f7f7f8] text-slate-900
                 [&_*]:text-slate-900
                 [&_input]:bg-white [&_input]:text-slate-900
                 [&_select]:bg-white [&_select]:text-slate-900
                 [&_.MuiInputBase-root]:bg-white
                 [&_.MuiInputBase-input]:text-slate-900
                 [&_.MuiOutlinedInput-notchedOutline]:!border-gray-300"
            style={{ colorScheme: "light" }}
        >
            {/* Header + botón crear */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">Usuarios</h1>
                <CanInvite>
                    <Button variant="contained" onClick={() => setOpenNew(true)}>
                        Crear usuario
                    </Button>
                </CanInvite>
            </div>

            {/* Filtros */}
            <UsersFilters
                initial={filters}
                onApply={(p) => {
                    setFilters((s) => ({ ...s, q: p.q, role: p.role, status: p.status }));
                    setPage(1);
                }}
            />

            {/* Barra de acciones bulk */}
            <UsersBulkBar
                selectedIds={selectedIds}
                onDone={() => {
                    setSelectedIds([]);
                    loadUsers(page);
                }}
            />

            {/* Tabla */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left">
                            <th className="px-3 py-2">
                                <Checkbox
                                    checked={allChecked}
                                    indeterminate={indeterminate}
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    size="small"
                                />
                            </th>
                            <th className="px-3 py-2">Usuario</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Rol plataforma</th>
                            <th className="px-3 py-2">Estado</th>
                            <th className="px-3 py-2">Tiendas</th>
                            <th className="px-3 py-2 w-[60px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center">
                                    <CircularProgress size={24} />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center opacity-70">
                                    Sin resultados
                                </td>
                            </tr>
                        ) : (
                            rows.map((u) => {
                                const status = u.status ?? (u.active ? "active" : "suspended");
                                const memberships = Array.isArray(u.memberships) ? u.memberships : [];

                                return (
                                    <tr key={u._id} className="border-t">
                                        <td className="px-3 py-2">
                                            <Checkbox
                                                size="small"
                                                checked={selectedIds.includes(u._id)}
                                                onChange={(e) => toggleOne(u._id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {u.avatar ? (
                                                    <img src={u.avatar} alt="av" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.fullName || u.name || "-"}</span>
                                                    <span className="text-[11px] opacity-60">
                                                        #{String(u._id || "").slice(-6)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">{u.email}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {getAllUserRoles(u).map((r) => (
                                                    <span key={r} className={`text-xs font-medium px-2 py-0.5 rounded ${ROLE_BADGE_STYLES[r] || "bg-gray-100 text-gray-600"}`}>
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {status === "active" ? "Activo" : "Suspendido"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            {memberships.length
                                                ? memberships
                                                    .map((m) =>
                                                        m.store?.name ||
                                                        m.storeName ||
                                                        storeMap.get(String(m.storeId?._id || m.storeId)) ||
                                                        null
                                                    )
                                                    .filter(Boolean)
                                                    .join(", ") || "-"
                                                : "-"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <IconButton size="small" onClick={(e) => onRowMenu(e, u._id)}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>

                                            {menuForId === u._id && (() => {
                                                const userRoles = getAllUserRoles(u);
                                                const isSuper = userRoles.includes("SUPER_ADMIN");
                                                const isStoreOwner = userRoles.includes("STORE_OWNER");
                                                const isDelivery = userRoles.includes("DELIVERY_AGENT");
                                                const opCount = userRoles.filter(r => !["CUSTOMER", "USER"].includes(r)).length;

                                                return (
                                                    <Menu open={openMenu} onClose={closeMenu} anchorEl={anchorEl}>
                                                        <MenuItem onClick={() => onEdit(u)}>Editar</MenuItem>
                                                        <MenuItem onClick={() => onToggleStatus(u)}>
                                                            {status === "active" ? "Suspender" : "Activar"}
                                                        </MenuItem>

                                                        {/* Acciones rápidas de rol */}
                                                        {!isSuper && (
                                                            <div>
                                                                <MenuItem disabled sx={{ fontSize: 12, opacity: 0.6, minHeight: 28 }}>
                                                                    Roles ({opCount}/2)
                                                                </MenuItem>
                                                                {!isStoreOwner && opCount < 2 && (
                                                                    <MenuItem onClick={() => onQuickRoleChange(u, "STORE_OWNER")} sx={{ fontSize: 13 }}>
                                                                        + Vendedor de tienda
                                                                    </MenuItem>
                                                                )}
                                                                {isStoreOwner && (
                                                                    <MenuItem onClick={() => onQuickRoleChange(u, "CUSTOMER")} sx={{ fontSize: 13 }}>
                                                                        - Quitar vendedor
                                                                    </MenuItem>
                                                                )}
                                                                {!isDelivery && opCount < 2 && (
                                                                    <MenuItem onClick={() => onQuickRoleChange(u, "DELIVERY_AGENT")} sx={{ fontSize: 13 }}>
                                                                        + Delivery
                                                                    </MenuItem>
                                                                )}
                                                                {isDelivery && (
                                                                    <MenuItem onClick={() => onQuickRoleChange(u, "CUSTOMER")} sx={{ fontSize: 13 }}>
                                                                        - Quitar Delivery
                                                                    </MenuItem>
                                                                )}
                                                            </div>
                                                        )}

                                                        <MenuItem onClick={() => onDelete(u)} sx={{ color: "error.main" }}>
                                                            Eliminar
                                                        </MenuItem>
                                                    </Menu>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })
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

            {/* Modal Crear Usuario */}
            <NewUserDialog
                open={openNew}
                onClose={(ok) => {
                    setOpenNew(false);
                    if (ok) {
                        loadUsers(page);
                        toast.success("Usuario creado");
                    }
                }}
                onCreated={() => {
                    loadUsers(page);
                    toast.success("Usuario creado");
                }}
                isPlatform={isPlatform}
            />

            {/* Drawer de detalle */}
            <UserDrawer
                open={drawerOpen}
                user={drawerUser}
                stores={stores}
                onClose={() => setDrawerOpen(false)}
                onChanged={loadUsers}
            />
        </div>
    );
}

export default UsersPage;
