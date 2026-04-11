// admin/src/Pages/Products/index.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Button } from "@mui/material";
import Rating from "@mui/material/Rating";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { IoMdClose } from "react-icons/io";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import ProductCreate from "./ProductCreate";
import ProductEdit from "./ProductEdit";
import { deleteData, api } from "../../utils/api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import CircularProgress from "@mui/material/CircularProgress";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { formatPrice } from "../../utils/formatPrice";
import { asPlatform } from "@/utils/httpFlags";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const SORT_FIELDS = {
    product: "name",
    category: "catName",
    brand: "brand",
    price: "basePrice",
    wholesale: "wholesalePrice",
    stock: "totalStock",
    rating: "rating",
};

const ENTRY_TYPE_LABELS = {
    MARITIMO: "Marítimo",
    AEREO: "Aéreo",
    LOCAL: "Local",
    OTRO: "Otro",
};

const columns = [
    { id: "product", label: "PRODUCTO", minWidth: 150, sortable: true },
    { id: "category", label: "CATEGORÍA", minWidth: 100, sortable: true },
    { id: "brand", label: "MARCA", minWidth: 80, sortable: true },
    { id: "currency", label: "MONEDA", minWidth: 60 },
    { id: "price", label: "PRECIO BASE", minWidth: 100, sortable: true },
    { id: "wholesale", label: "MAYORISTA", minWidth: 100, sortable: true },
    { id: "stock", label: "STOCK/MIN", minWidth: 90, sortable: true },
    { id: "variants", label: "VARIANTES", minWidth: 70 },
    { id: "discount", label: "DESC.", minWidth: 60 },
    { id: "entryType", label: "INGRESO", minWidth: 80 },
    { id: "entryRef", label: "REF.", minWidth: 100 },
    { id: "salesStatus", label: "VENTA", minWidth: 60 },
    { id: "rating", label: "RATING", minWidth: 90, sortable: true },
    { id: "action", label: "ACCIONES", minWidth: 100 },
];

function ProductRow({ p, onCheck, onEdit, onDelete }) {
    const cur = p.baseCurrency || "USD";
    const discount = Number(p.discount) || 0;
    const hasSalesConfig = p.salesConfig?.enableSalesConfig;
    const wholesaleP = p.wholesalePrice || p.salesConfig?.marginConfig?.precioMayorista || 0;

    return (
        <TableRow>
            <TableCell>
                <Checkbox checked={!!p.checked} onChange={() => onCheck(p._id)} size="small" />
            </TableCell>
            {/* PRODUCTO */}
            <TableCell>
                <div className="flex gap-2 items-center">
                    <LazyLoadImage src={p.images?.[0]} className="w-[50px] h-[50px] object-cover rounded" />
                    <div className="min-w-0">
                        <b className="block truncate text-sm">{p.name}</b>
                    </div>
                </div>
            </TableCell>
            {/* CATEGORÍA */}
            <TableCell className="text-xs">{p.catName}</TableCell>
            {/* MARCA */}
            <TableCell className="text-xs">{p.brand || "—"}</TableCell>
            {/* MONEDA */}
            <TableCell>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cur === "USD" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                    {cur}
                </span>
            </TableCell>
            {/* PRECIO BASE */}
            <TableCell>
                <b className="text-sm">{formatPrice(p.basePrice, cur)}</b>
            </TableCell>
            {/* MAYORISTA */}
            <TableCell>
                {wholesaleP > 0
                    ? <span className="text-sm">{formatPrice(wholesaleP, cur)}</span>
                    : <span className="text-xs text-gray-400">—</span>
                }
            </TableCell>
            {/* STOCK / MIN */}
            <TableCell>
                <b className="text-sm">{p.totalStock || 0}</b>
                <span className="text-xs text-gray-400">/{p.stockMinimo || 0}</span>
            </TableCell>
            {/* VARIANTES */}
            <TableCell className="text-center text-sm">{p.variantsCount || 0}</TableCell>
            {/* DESCUENTO */}
            <TableCell>
                {discount > 0
                    ? <span className="text-xs font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{discount}%</span>
                    : <span className="text-xs text-gray-400">—</span>
                }
            </TableCell>
            {/* TIPO INGRESO */}
            <TableCell className="text-xs">{ENTRY_TYPE_LABELS[p.entryType] || "—"}</TableCell>
            {/* REF. INGRESO */}
            <TableCell>
                <span className="text-xs truncate block max-w-[100px]" title={p.entryReference}>
                    {p.entryReference || "—"}
                </span>
            </TableCell>
            {/* ESTADO VENTA */}
            <TableCell>
                {hasSalesConfig
                    ? <span className="text-xs font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Activa</span>
                    : <span className="text-xs text-gray-400">—</span>
                }
            </TableCell>
            {/* RATING */}
            <TableCell>
                <Rating size="small" value={Number(p.rating) || 0} readOnly />
            </TableCell>
            {/* ACCIONES */}
            <TableCell>
                <div className="flex gap-1">
                    <Button size="small" onClick={() => onEdit(p._id)}><AiOutlineEdit /></Button>
                    <Button size="small" onClick={() => onDelete(p._id)}><GoTrash /></Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

const Products = () => {
    /* ============================
       STATE – FILTERS / PAGINATION
    ============================ */
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const searchTimer = useRef(null);

    const onSearchChange = useCallback((val) => {
        setSearchQuery(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedQuery(val.trim());
            setPage(0);
        }, 400);
    }, []);

    useEffect(() => () => clearTimeout(searchTimer.current), []);

    /* ============================
       STATE – DATA
    ============================ */
    const [data, setData] = useState({ products: [], totalCount: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [openLightbox, setOpenLightbox] = useState(false);

    const {
        isSuper,
        can,
        isOpenFullScreenPanel,
        setIsOpenFullScreenPanel,
    } = useAuth();

    /* ============================
       TENANT HEADERS
    ============================ */
    const getTenantHeaders = () => {
        if (isSuper) return {};
        const sid = localStorage.getItem("X-Store-Id");
        return sid ? { "X-Store-Id": sid } : {};
    };

    const scopeParam = isSuper ? "scope=all" : "";
    const withScope = (url) =>
        scopeParam ? `${url}${url.includes("?") ? "&" : "?"}${scopeParam}` : url;

    /* ============================
       LOAD PRODUCTS
    ============================ */
    const getProducts = async () => {
        try {
            setIsLoading(true);

            const params = new URLSearchParams({
                page: String(page + 1),
                limit: String(rowsPerPage),
                sort: sortField,
                order: sortOrder,
                ...(debouncedQuery ? { q: debouncedQuery } : {}),
            });

            const res = await api.get(
                withScope(`/api/product/getAllProducts?${params.toString()}&_ts=${Date.now()}`),
                isSuper ? asPlatform() : { headers: getTenantHeaders() }
            );

            const root = res?.data?.data || res?.data || {};
            const products = root?.products || [];
            setData({
                products,
                totalCount: root?.totalCount || products.length,
            });

            setPhotos(
                products
                    .map((p) => (p?.images?.[0] ? { src: p.images[0] } : null))
                    .filter(Boolean)
            );
        } catch {
            setData({ products: [], totalCount: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpenFullScreenPanel?.open) getProducts();
        // eslint-disable-next-line
    }, [page, rowsPerPage, sortField, sortOrder, isSuper, isOpenFullScreenPanel?.open, debouncedQuery]);

    /* ============================
       HELPERS
    ============================ */
    const visibleProducts = data.products;

    // Group products by store for super admin
    const [expandedStores, setExpandedStores] = useState({});
    const storeGroups = useMemo(() => {
        if (!isSuper) return null;
        const map = new Map();
        for (const p of visibleProducts) {
            const sid = p.storeIdStr || String(p.storeId?._id || p.storeId || "unknown");
            if (!map.has(sid)) {
                map.set(sid, { storeId: sid, storeName: p.storeName || "Productos de plataforma", products: [] });
            }
            map.get(sid).products.push(p);
        }
        return Array.from(map.values());
    }, [visibleProducts, isSuper]);

    const toggleStore = (sid) => {
        setExpandedStores(prev => ({ ...prev, [sid]: !prev[sid] }));
    };

    const toggleSort = (columnId) => {
        const field = SORT_FIELDS[columnId];
        if (!field) return;
        if (sortField === field) {
            setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const updated = visibleProducts.map((p) => ({
            ...p,
            checked,
        }));
        setData((prev) => ({ ...prev, products: updated }));
        setSelectedIds(checked ? updated.map((p) => p._id) : []);
    };

    const handleCheckboxChange = (id) => {
        const updated = data.products.map((p) =>
            p._id === id ? { ...p, checked: !p.checked } : p
        );
        setData((prev) => ({ ...prev, products: updated }));
        setSelectedIds(updated.filter((p) => p.checked).map((p) => p._id));
    };

    const deleteProduct = async (id) => {
        if (!(isSuper || can("product:delete")))
            return toast.error("Sin permisos");
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await deleteData(`/api/product/${id}`);
            toast.success("Producto eliminado");
            getProducts();
        } catch {
            toast.error("No se pudo eliminar");
        }
    };

    /* ============================
       FULLSCREEN PANEL
    ============================ */
    const panel = isOpenFullScreenPanel;
    const panelOpen = !!panel?.open;
    const panelModel = (panel?.model || "").toLowerCase();
    const closePanel = () => setIsOpenFullScreenPanel({ open: false });

    /* ============================
       RENDER
    ============================ */
    return (
        <>
            {panelOpen && (
                <div className="absolute inset-0 z-20 bg-white overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {panelModel.includes("edit") ? "Editar Producto" : "Agregar Producto"}
                        </h3>
                        <Button onClick={closePanel} className="!min-w-0 !p-1">
                            <IoMdClose className="text-2xl" />
                        </Button>
                    </div>
                    {panelModel.includes("edit")
                        ? <ProductEdit id={panel?.id} onSuccess={closePanel} />
                        : <ProductCreate onSuccess={closePanel} />}
                </div>
            )}

            <div className="flex items-center justify-between px-2 mt-3">
                <h2 className="text-[18px] font-[600]">Productos</h2>

                <Button
                    className="btn-blue !text-white btn-sm"
                    onClick={() =>
                        setIsOpenFullScreenPanel({
                            open: true,
                            model: "Agregar Producto",
                        })
                    }
                >
                    Agregar Producto
                </Button>
            </div>

            <div className="px-2 mt-3">
                <input
                    className="border px-3 py-2 rounded w-full md:w-80"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="card my-4 pt-5 shadow-md bg-white">
                <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox {...label} size="small" onChange={handleSelectAll} />
                                </TableCell>

                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        onClick={() => col.sortable && toggleSort(col.id)}
                                        style={{ minWidth: col.minWidth }}
                                    >
                                        {col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && isSuper && storeGroups
                                ? storeGroups.map((group) => (
                                    <React.Fragment key={group.storeId}>
                                        <TableRow
                                            className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                                            onClick={() => toggleStore(group.storeId)}
                                        >
                                            <TableCell colSpan={11}>
                                                <div className="flex items-center gap-3">
                                                    <Button className="!min-w-0 !p-1 !rounded-full !bg-gray-200">
                                                        {expandedStores[group.storeId]
                                                            ? <FaAngleUp className="text-gray-600" />
                                                            : <FaAngleDown className="text-gray-600" />}
                                                    </Button>
                                                    <span className="font-semibold text-sm">
                                                        {group.storeName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({group.products.length} productos)
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {expandedStores[group.storeId] && group.products.map((p) => (
                                            <ProductRow
                                                key={p._id}
                                                p={p}
                                                onCheck={handleCheckboxChange}
                                                onEdit={(id) => setIsOpenFullScreenPanel({ open: true, model: "Editar Producto", id })}
                                                onDelete={deleteProduct}
                                            />
                                        ))}
                                    </React.Fragment>
                                ))
                                : !isLoading && visibleProducts.map((p) => (
                                    <ProductRow
                                        key={p._id}
                                        p={p}
                                        onCheck={handleCheckboxChange}
                                        onEdit={(id) => setIsOpenFullScreenPanel({ open: true, model: "Editar Producto", id })}
                                        onDelete={deleteProduct}
                                    />
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={data.totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                    }}
                />
            </div>

            <Lightbox
                open={openLightbox}
                close={() => setOpenLightbox(false)}
                slides={photos}
            />
        </>
    );
};

export default Products;
