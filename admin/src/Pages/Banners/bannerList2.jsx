// admin/src/Pages/BannerList2/List.jsx
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

import { AppContext } from "../../context/AppContext";
import ContentFilters from "../../Components/Filters/ContentFilters";
import { buildListParams } from "../../utils/buildListParams";
import { listBannerList2, removeBannerList2 } from "../../services/bannerList2";

const columns = [
    { id: "image", label: "IMAGEN", minWidth: 160 },
    { id: "status", label: "Estado", minWidth: 120 },
    { id: "visibility", label: "Visibilidad", minWidth: 120 },
    { id: "dates", label: "Fechas", minWidth: 220 },
    { id: "action", label: "Acción", minWidth: 240 },
];

const defaultFilters = {
    status: "",        // draft | scheduled | published | archived
    visibility: "",    // public | private | unlisted
    q: "",
    storeId: "",
    dateFrom: "",
    dateTo: "",
};

export const BannerList2 = () => {
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

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Si manejas selector de tiendas en contexto, pásalas aquí {value,label}
    const storeOptions = []; // [{ value:'storeId1', label:'Sucursal 1' }, ...]

    // permisos helper (si ya tienes usePermission, úsalo)
    const can = (perms) => {
        if (typeof context?.can === "function") return context.can(perms);
        return true; // fallback permisivo
    };

    useEffect(() => {
        fetchData(page + 1); // backend 1-based
        // refresca cuando cierras drawers add/edit
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, context?.isOpenFullScreenPanel, JSON.stringify(filters)]);

    const fetchData = async (p = 1) => {
        try {
            const params = buildListParams(filters, {
                page: p,
                limit: rowsPerPage,
                sort: "publishAt:desc,createdAt:desc",
            });

            const res = await listBannerList2(params);
            const list = Array.isArray(res?.data) ? res.data : [];
            setItems(list);
            setMeta({
                total: res?.meta?.total ?? list.length,
                totalPages: res?.meta?.totalPages ?? 1,
                page: res?.meta?.page ?? p,
            });

            // si cambió la data (filtro) vuelve al inicio
            if (p === 1) setPage(0);
        } catch (err) {
            notify("error", err?.message || "No se pudo cargar la lista de banners");
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleChangePage = (_event, newPage) => setPage(newPage);

    const onPreview = (id) => window.open(`/preview/${id}`, "_blank", "noopener,noreferrer");

    const onEdit = (id) =>
        context?.setIsOpenFullScreenPanel?.({ open: true, model: "Edit bannerList2", id });

    const onAdd = () =>
        context?.setIsOpenFullScreenPanel?.({ open: true, model: "Add bannerList2" });

    const deleteBanner = async (id) => {
        try {
            if (!can(["banner:delete", "banners:delete"])) {
                notify("error", "No tienes permiso para eliminar banners");
                return;
            }
            await removeBannerList2(id);
            notify("success", "Banner eliminado");
            fetchData(page + 1);
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar el banner");
        }
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

    const StatusBadge = ({ item }) => {
        const { status, publishAt } = item || {};
        const isScheduled =
            status === "scheduled" && publishAt && new Date(publishAt).getTime() > Date.now();

        const base =
            "px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1";
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
                        Programado para {fmtDate(publishAt)}
                    </span>
                )}
            </div>
        );
    };

    // slides para lightbox (solo la página actual)
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
            <div className="flex items-center justify-between px-2 py-0 mt-1 md:mt-3">
                <h2 className="text-[18px] font-[600]">Lista de Banners (List2)</h2>
                <div className="col ml-auto flex items-center justify-end gap-3">
                    {can(["banner:create", "banners:create"]) && (
                        <Button className="btn-blue !text-white btn-sm" onClick={onAdd}>
                            Agregar Banner
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
                        stores: storeOptions,
                        placeholders: { q: "Buscar por título / texto" },
                    }}
                />
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader aria-label="banners list2 table">
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
                                    <TableCell width={160}>
                                        <div className="flex items-center gap-4 w-[130px] lg:w-[200px]">
                                            <div
                                                className="img w-full rounded-md overflow-hidden group cursor-pointer"
                                                onClick={() => openLightboxAt(idx)}
                                                title="Ver imagen"
                                            >
                                                <img
                                                    src={item?.images?.[0]}
                                                    className="w-full group-hover:scale-105 transition-all"
                                                    alt="banner"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ESTADO */}
                                    <TableCell width={120}>
                                        <StatusBadge item={item} />
                                    </TableCell>

                                    {/* VISIBILIDAD */}
                                    <TableCell width={120}>
                                        <span className="text-sm">{item?.visibility || "—"}</span>
                                    </TableCell>

                                    {/* FECHAS */}
                                    <TableCell width={220}>
                                        <div className="text-sm leading-5">
                                            <div>
                                                <span className="font-medium">Publicación: </span>
                                                {fmtDate(item?.publishAt)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Expira: </span>
                                                {fmtDate(item?.expireAt)}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ACCIONES */}
                                    <TableCell width={240}>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <Button
                                                className="!h-[35px] !px-3 bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() => onPreview(item?._id)}
                                                title="Ver previa"
                                            >
                                                <span className="text-[13px]">Previa</span>
                                            </Button>

                                            {can(["banner:update", "banners:update"]) && (
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                    onClick={() =>
                                                        context?.setIsOpenFullScreenPanel?.({
                                                            open: true,
                                                            model: "Edit bannerList2",
                                                            id: item?._id,
                                                        })
                                                    }
                                                    title="Editar"
                                                >
                                                    <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px]" />
                                                </Button>
                                            )}

                                            {can(["banner:delete", "banners:delete"]) && (
                                                <Button
                                                    className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                    onClick={() => deleteBanner(item?._id)}
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
                                            No hay banners para los filtros seleccionados.
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
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                    }}
                />
            </div>

            {/* Lightbox (usa los items de la página actual) */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
        </>
    );
};

export default BannerList2;
