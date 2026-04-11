// admin/src/Pages/Blog/List.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// ✅ named export
import { AppContext } from "../../context/AppContext";

// NUEVO: servicios + filtros + params
import ContentFilters from "../../components/Filters/ContentFilters";
import { buildListParams } from "../../utils/buildListParams";
import { listBlogs, removeBlog } from "../../services/blog";

const columns = [
    { id: "image", label: "IMAGEN", minWidth: 120 },
    { id: "title", label: "TÍTULO", minWidth: 200 },
    { id: "description", label: "DESCRIPCIÓN", minWidth: 260 },
    { id: "status", label: "Estado", minWidth: 110 },
    { id: "visibility", label: "Visibilidad", minWidth: 110 },
    { id: "pinned", label: "Pinned", minWidth: 90 },
    { id: "dates", label: "Fechas", minWidth: 220 },
    { id: "action", label: "Acción", minWidth: 180 },
];

const defaultFilters = {
    status: "",        // draft | scheduled | published | archived
    visibility: "",    // public | private | unlisted
    pinned: "",        // "" | "true" | "false"
    q: "",
    storeId: "",
    dateFrom: "",
    dateTo: "",
};

export const BlogList = () => {
    const context = useContext(AppContext) || {};

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    // filtros y datos
    const [filters, setFilters] = useState(defaultFilters);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0); // UI 0-based
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

    // lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Si manejas tiendas en contexto, mapea a {value,label}
    const storeOptions = []; // [{ value: 'storeId1', label: 'Sucursal 1' }, ...]

    const can = (perms) => {
        if (typeof context?.can === "function") return context.can(perms);
        return true;
    };

    useEffect(() => {
        fetchData(page + 1); // backend 1-based
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, context?.isOpenFullScreenPanel, JSON.stringify(filters)]);

    const fetchData = async (p = 1) => {
        try {
            context?.setProgress?.(50);
            const params = buildListParams(filters, {
                page: p,
                limit: rowsPerPage,
                sort: "pinned:desc,publishedAt:desc",
            });
            const res = await listBlogs(params);
            const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.blogs) ? res.blogs : []);
            setItems(list);
            setMeta({
                total: res?.meta?.total ?? list.length,
                totalPages: res?.meta?.totalPages ?? 1,
                page: res?.meta?.page ?? p,
            });
            if (p === 1) setPage(0);
            context?.setProgress?.(100);
        } catch (err) {
            context?.setProgress?.(100);
            notify("error", err?.message || "No se pudo cargar la lista de blogs");
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleChangePage = (_event, newPage) => setPage(newPage);

    const onPreview = (id) => window.open(`/preview/${id}`, "_blank", "noopener,noreferrer");

    const onEdit = (id) =>
        context?.setIsOpenFullScreenPanel?.({ open: true, model: "Edit Blog", id });

    const onAdd = () =>
        context?.setIsOpenFullScreenPanel?.({ open: true, model: "Add Blog" });

    const deleteBlog = async (id) => {
        try {
            if (!can(["blog:delete", "blogs:delete"])) {
                notify("error", "No tienes permiso para eliminar blogs");
                return;
            }
            await removeBlog(id);
            notify("success", "Blog eliminado");
            fetchData(page + 1);
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar el blog");
        }
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

    const StatusBadge = ({ item }) => {
        const { status, publishedAt } = item || {};
        const isScheduled =
            status === "scheduled" && publishedAt && new Date(publishedAt).getTime() > Date.now();

        const base = "px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1";
        const palette = {
            draft: "bg-gray-100 text-gray-700 border border-gray-300",
            scheduled: "bg-amber-50 text-amber-700 border border-amber-300",
            published: "bg-green-50 text-green-700 border border-green-300",
            archived: "bg-slate-100 text-slate-700 border border-slate-300",
        };
        const cls = palette[status] || "bg-gray-100 text-gray-700 border";

        return (
            <div className="flex flex-col gap-1">
                <span className={`${base} ${cls}`}>{status || "—"}</span>
                {isScheduled && (
                    <span className="text-[12px] text-amber-700">
                        Programado para {fmtDate(publishedAt)}
                    </span>
                )}
            </div>
        );
    };

    // slides del lightbox (página actual para que el índice coincida con la tabla)
    const lightboxSlides = useMemo(
        () => items.map((b) => ({ src: b?.images?.[0] })),
        [items]
    );
    const openLightboxAt = (idx) => {
        setLightboxIndex(idx);
        setLightboxOpen(true);
    };

    const rows = useMemo(() => items, [items]);

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">Lista de blogs</h2>
                <div className="col w-[25%] ml-auto flex items-center justify-end gap-3">
                    {can(["blog:create", "blogs:create"]) && (
                        <Button className="btn-blue !text-white btn-sm" onClick={onAdd}>
                            Agregar blog
                        </Button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="card my-3 p-3 shadow-sm bg-white">
                <ContentFilters
                    value={filters}
                    onChange={setFilters}
                    options={{
                        status: [
                            { value: "", label: "Todos" },
                            { value: "draft", label: "Borrador" },
                            { value: "scheduled", label: "Programado" },
                            { value: "published", label: "Publicado" },
                            { value: "archived", label: "Archivado" },
                        ],
                        visibility: [
                            { value: "", label: "Todas" },
                            { value: "public", label: "Pública" },
                            { value: "private", label: "Privada" },
                            { value: "unlisted", label: "No listada" },
                        ],
                        // filtro opcional de pinned
                        pinned: [
                            { value: "", label: "Todos" },
                            { value: "true", label: "Solo fijados" },
                            { value: "false", label: "No fijados" },
                        ],
                        stores: storeOptions,
                        // placeholders si tu componente los soporta
                        placeholders: { q: "Buscar por título / contenido" },
                    }}
                />
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader aria-label="blogs table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell width={column.minWidth} key={column.id}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.map((item, idx) => (
                                <TableRow key={item?._id || idx} hover>
                                    {/* IMAGEN (abre lightbox) */}
                                    <TableCell width={120}>
                                        <div className="flex items-center gap-4 w-[200px]">
                                            <div
                                                className="img w-full rounded-md overflow-hidden group cursor-pointer"
                                                onClick={() => openLightboxAt(idx)}
                                                title="Ver imagen"
                                            >
                                                <img
                                                    src={item?.images?.[0]}
                                                    className="w-full group-hover:scale-105 transition-all"
                                                    alt="blog"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* TÍTULO */}
                                    <TableCell width={200}>
                                        <span className="text-[15px] font-[500] inline-block w-[200px] sm:w-[200px] md:w-[300px]">
                                            {item?.title}
                                        </span>
                                    </TableCell>

                                    {/* DESCRIPCIÓN (extracto seguro) */}
                                    <TableCell width={260}>
                                        <div
                                            className="w-[250px] sm:w-[220px] md:w-[300px] line-clamp-3 text-[14px] text-gray-700"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    (item?.description || "").slice(0, 150) +
                                                    (item?.description?.length > 150 ? "..." : ""),
                                            }}
                                        />
                                    </TableCell>

                                    {/* ESTADO */}
                                    <TableCell width={110}>
                                        <StatusBadge item={item} />
                                    </TableCell>

                                    {/* VISIBILIDAD */}
                                    <TableCell width={110}>
                                        <span className="text-sm">{item?.visibility || "—"}</span>
                                    </TableCell>

                                    {/* PINNED */}
                                    <TableCell width={90}>
                                        <span className="text-sm">{item?.pinned ? "Sí" : "No"}</span>
                                    </TableCell>

                                    {/* FECHAS */}
                                    <TableCell width={220}>
                                        <div className="text-sm leading-5">
                                            <div>
                                                <span className="font-medium">Publicado: </span>
                                                {fmtDate(item?.publishedAt)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Despublicar: </span>
                                                {fmtDate(item?.unpublishAt)}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ACCIONES */}
                                    <TableCell width={180}>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <Button
                                                className="!h-[35px] !px-3 bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() => onPreview(item?._id)}
                                                title="Ver previa"
                                            >
                                                <span className="text-[13px]">Previa</span>
                                            </Button>

                                            {can(["blog:update", "blogs:update"]) && (
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                    onClick={() => onEdit(item?._id)}
                                                    title="Editar"
                                                >
                                                    <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px]" />
                                                </Button>
                                            )}

                                            {can(["blog:delete", "blogs:delete"]) && (
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                    onClick={() => deleteBlog(item?._id)}
                                                    title="Eliminar"
                                                >
                                                    <GoTrash className="text-[rgba(0,0,0,0.7)] text-[18px]" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                        <div className="py-10 text-center text-sm text-gray-500">
                                            No hay blogs para los filtros seleccionados.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={meta?.total ?? items.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
        </>
    );
};

export default BlogList;
