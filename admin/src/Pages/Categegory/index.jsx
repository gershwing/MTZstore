// admin/src/Pages/Category/CategoryList.jsx
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

import { AppContext } from "../../context/AppContext";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import AddCategory from "./addCategory";
import EditCategory from "./editCategory";

const columns = [
    { id: "image", label: "IMAGEN", minWidth: 100 },
    { id: "catName", label: "NOMBRE DE CATEGORÍA", minWidth: 200 },
    { id: "action", label: "Acción", minWidth: 100 },
];

export const CategoryList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const context = useContext(AppContext) || {};

    const notify = (type, message) => {
        const text = typeof message === "string" ? message : message?.message || "Ocurrió un error";
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    const getTenantHeaders = () => {
        const tenantId =
            context?.viewer?.activeStoreId ||
            context?.viewer?.storeId ||
            context?.userData?.storeId ||
            context?.tenant?.storeId ||
            localStorage.getItem("X-Store-Id") ||
            null;
        return tenantId ? { "x-tenant-id": String(tenantId) } : {};
    };

    const isAdminOrSuper =
        context?.userData?.role === "ADMIN" ||
        context?.userData?.role === "SUPER_ADMIN" ||
        (Array.isArray(context?.userData?.roles) &&
            (context.userData.roles.includes("ADMIN") ||
                context.userData.roles.includes("SUPER_ADMIN"))) ||
        Boolean(context?.isSuper);

    const loadCategories = async () => {
        try {
            context?.setProgress?.(50);
            const res = await fetchDataFromApi("/api/category", {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            context?.setCatData?.(res?.data || []);
        } catch (err) {
            notify("error", err?.message || "No se pudo cargar categorías");
        } finally {
            context?.setProgress?.(100);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [context?.isOpenFullScreenPanel?.open]); // eslint-disable-line react-hooks/exhaustive-deps

    const deleteCat = async (id) => {
        try {
            if (!isAdminOrSuper) {
                notify("error", "Solo administradores pueden eliminar datos");
                return;
            }
            await deleteData(`/api/category/${id}`, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            await loadCategories();
            notify("success", "Categoría eliminada");
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar la categoría");
        }
    };

    // Solo L1 (raíz): catData es un árbol donde items raíz tienen parentId null
    const items = Array.isArray(context?.catData) ? context.catData : [];
    const pagedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return items.slice(start, start + rowsPerPage);
    }, [items, page, rowsPerPage]);

    const panel = context?.isOpenFullScreenPanel;
    const panelOpen = !!panel?.open;
    const panelModel = (panel?.model || "").toLowerCase();

    const closePanel = () => context?.setIsOpenFullScreenPanel?.({ open: false });

    return (
        <>
            {/* Fullscreen panel overlay */}
            {panelOpen && (
                <div className="absolute inset-0 z-20 bg-white overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {panelModel.includes("edit") ? "Editar categoría" : "Agregar categoría"}
                        </h3>
                        <Button onClick={closePanel} className="!min-w-0 !p-1">
                            <IoMdClose className="text-2xl" />
                        </Button>
                    </div>
                    {panelModel.includes("edit") ? <EditCategory /> : <AddCategory />}
                </div>
            )}

            <div className="flex items-center justify-between px-2 py-0 mt-1">
                <h2 className="text-[18px] font-[600]">Categorías (Nivel 1)</h2>
                <div className="col w-[40%] ml-auto flex items-center justify-end gap-3">
                    <Button
                        className="btn-blue btn !text-white btn-sm"
                        onClick={() =>
                            context?.setIsOpenFullScreenPanel?.({
                                open: true,
                                model: "Add New Category",
                            })
                        }
                    >
                        Agregar categoría
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
                    <Table stickyHeader aria-label="categories table">
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
                            {pagedRows.map((item) => (
                                <TableRow key={item?._id} hover>
                                    <TableCell width={100}>
                                        <div className="w-[50px] h-[50px] rounded-md overflow-hidden">
                                            <img
                                                alt={item?.name || "categoría"}
                                                className="w-full h-full object-cover hover:scale-105 transition-all"
                                                src={item?.images?.[0] || "/placeholder.png"}
                                                onError={(e) => { e.target.src = "/placeholder.png"; }}
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell>{item?.name}</TableCell>

                                    <TableCell width={100}>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() =>
                                                    context?.setIsOpenFullScreenPanel?.({
                                                        open: true,
                                                        model: "Edit Category",
                                                        id: item?._id,
                                                    })
                                                }
                                                title="Editar"
                                            >
                                                <AiOutlineEdit className="text-[rgba(0,0,0,0.7)] text-[20px]" />
                                            </Button>

                                            <Button
                                                className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() => deleteCat(item?._id)}
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
                                    <TableCell colSpan={columns.length}>
                                        <div className="py-10 text-center text-sm text-gray-500">
                                            No hay categorías para mostrar.
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
                    count={items.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                    }}
                />
            </div>
        </>
    );
};

export default CategoryList;
