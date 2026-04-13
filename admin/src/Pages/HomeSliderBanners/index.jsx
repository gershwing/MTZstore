// admin/src/Pages/HomeSliderBanners/List.jsx
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
import { IoMdClose } from "react-icons/io";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { AppContext } from "../../context/AppContext"; // ✅ named export correcto
import UIContext from "../../context/UIContext";        // ✅ setProgress vive aquí
import { deleteData, fetchDataFromApi } from "../../utils/api";

import ContentFilters from "../../Components/Filters/ContentFilters";
import { buildListParams } from "../../utils/buildListParams";
import AddHomeSlide from "./addHomeSlide";
import EditHomeSlide from "./editHomeSlide";

const columns = [
    { id: "image", label: "IMAGEN", minWidth: 250 },
    { id: "action", label: "Acción", minWidth: 100 },
];

// helper para fecha futura
const isFuture = (iso) => iso && new Date(iso).getTime() > Date.now();

// badge pequeño para estado/visibilidad y programado
const PubBadge = ({ status, visibility, publishAt }) => {
    const scheduled = status === "scheduled" && isFuture(publishAt);
    return (
        <div className="mt-2">
            <div className="flex items-center gap-2">
                {status && <span className="px-2 py-[2px] text-xs rounded bg-gray-100 border">{status}</span>}
                {visibility && <span className="px-2 py-[2px] text-xs rounded bg-gray-100 border">{visibility}</span>}
            </div>
            {scheduled && (
                <div className="text-[12px] text-amber-700 mt-1">
                    Programado para {new Date(publishAt).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export const HomeSliderBanners = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [slidesData, setSlidesData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [open, setOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // NUEVO: filtros
    const [filters, setFilters] = useState({
        status: "", // draft | scheduled | published | archived
        q: "",
        storeId: "",
        dateFrom: "",
        dateTo: "",
    });

    const app = useContext(AppContext); // datos/acciones de app (alertBox, panel, tenant ids)
    const ui = useContext(UIContext);   // progreso/tema/medidas

    const getTenantHeaders = () => {
        if (app?.isSuper) return {};
        const sid = localStorage.getItem("X-Store-Id");
        return sid ? { "X-Store-Id": sid } : {};
    };

    // Opciones de tienda (si tienes)
    const storeOptions = []; // [{ value:'storeId1', label:'Sucursal 1' }, ...]

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [app?.isOpenFullScreenPanel?.open]);

    useEffect(() => {
        getData(); // refetch al cambiar filtros
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const getData = async () => {
        try {
            ui?.setProgress?.(50);

            // Construye query con orden por publishAt desc, createdAt desc
            // Nota: SIN page/limit (paginación en cliente)
            const params = buildListParams(filters, { sort: "publishAt:desc,createdAt:desc" });

            const res = await fetchDataFromApi("/api/homeSlides/admin", {
                params,
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            const data = res?.data || res || [];
            const list = Array.isArray(data) ? data : [];

            setSlidesData(list);
            setPhotos(list.map((s) => ({ src: s?.images?.[0] })).filter(Boolean));
            setPage(0);

            ui?.setProgress?.(100);
        } catch (err) {
            ui?.setProgress?.(100);
            const msg = err?.response?.data?.message || err?.message || "No se pudo cargar los slides";
            app?.alertBox?.("error", msg);
        }
    };

    const rows = slidesData;

    // Paginación en cliente
    const pagedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return rows.slice(start, start + rowsPerPage);
    }, [rows, page, rowsPerPage]);

    const deleteSlide = async (id) => {
        try {
            await deleteData(`/api/homeSlides/${id}`, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            app?.alertBox?.("success", "Slide eliminado");
            getData();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "No se pudo eliminar el slide";
            app?.alertBox?.("error", msg);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const deleteMultipleSlides = async () => {
        if (selectedIds.length === 0) return;
        try {
            await deleteData(`/api/homeSlides/bulk`, {
                data: { ids: selectedIds },
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            app?.alertBox?.("success", "Slides eliminados");
            setSelectedIds([]);
            getData();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "No se pudo eliminar en lote";
            app?.alertBox?.("error", msg);
        }
    };

    const panel = app?.isOpenFullScreenPanel;
    const panelOpen = !!panel?.open;
    const panelModel = (panel?.model || "").toLowerCase();
    const closePanel = () => app?.setIsOpenFullScreenPanel?.({ open: false });

    return (
        <>
            {/* Fullscreen panel overlay */}
            {panelOpen && (panelModel.includes("slide") || panelModel.includes("slider")) && (
                <div className="absolute inset-0 z-20 bg-white overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {panelModel.includes("editar") ? "Editar Slide Principal" : "Agregar Slide Principal"}
                        </h3>
                        <Button onClick={closePanel} className="!min-w-0 !p-1">
                            <IoMdClose className="text-2xl" />
                        </Button>
                    </div>
                    {panelModel.includes("editar") ? <EditHomeSlide /> : <AddHomeSlide />}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 px-2 py-0 mt-1 md:mt-2">
                <h2 className="text-[18px] font-[600]">Banners del Slider Principal</h2>

                <div className="col flex items-center justify-start md:justify-end gap-3">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="contained"
                            className="btn-sm"
                            size="small"
                            color="error"
                            onClick={deleteMultipleSlides}
                        >
                            Eliminar
                        </Button>
                    )}
                    <Button
                        className="btn-blue !text-white btn-sm"
                        onClick={() =>
                            app?.setIsOpenFullScreenPanel?.({ open: true, model: "Agregar Slide Principal" })
                        }
                    >
                        Agregar Slide Principal
                    </Button>
                </div>
            </div>

            {/* NUEVO: Filtros (estado, tienda, búsqueda, fechas) */}
            <div className="mt-3">
                <ContentFilters
                    value={filters}
                    onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                    storeOptions={storeOptions}
                    showDates
                />
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell width={column.minWidth} key={column.id} align={column.align}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {pagedRows.map((item) => (
                                <TableRow key={item?._id}>
                                    <TableCell width={300}>
                                        <div
                                            className="flex flex-col gap-2 w-[300px] cursor-pointer"
                                            onClick={() => {
                                                setLightboxIndex(Math.max(0, rows.indexOf(item)));
                                                setOpen(true);
                                            }}
                                            title="Ver imagen"
                                        >
                                            <div className="img w-full rounded-md overflow-hidden group">
                                                <img
                                                    src={item?.images?.[0]}
                                                    className="w-full group-hover:scale-105 transition-all"
                                                    alt="slide"
                                                />
                                            </div>

                                            {/* NUEVO: badges de publicación debajo de la imagen */}
                                            <PubBadge
                                                status={item?.status}
                                                visibility={item?.visibility}
                                                publishAt={item?.publishAt}
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell width={100}>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="w-[16px] h-[16px]"
                                                checked={selectedIds.includes(item?._id)}
                                                onChange={() => toggleSelect(item?._id)}
                                                title="Seleccionar para eliminar"
                                            />

                                            <Button
                                                className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() =>
                                                    app?.setIsOpenFullScreenPanel?.({
                                                        open: true,
                                                        model: "Editar Slide Principal",
                                                        id: item?._id,
                                                    })
                                                }
                                                title="Editar"
                                            >
                                                <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px]" />
                                            </Button>

                                            <Button
                                                className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() => deleteSlide(item?._id)}
                                                title="Eliminar"
                                            >
                                                <GoTrash className="text-[rgba(0,0,0,0.7)] text-[18px]" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {pagedRows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-gray-500">
                                        No hay slides para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                    }}
                />
            </div>

            <Lightbox open={open} close={() => setOpen(false)} slides={photos} index={lightboxIndex} />
        </>
    );
};

export default HomeSliderBanners;
