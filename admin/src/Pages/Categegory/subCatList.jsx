// admin/src/Pages/Category/SubCategoryList.jsx
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

import AddSubCategory from "./addSubCategory";
import EditSubCatBox from "./EditSubCatBox";

const columns = [
    { id: "catName", label: "SUBCATEGORÍA", minWidth: 200 },
    { id: "parentName", label: "CATEGORÍA PADRE", minWidth: 200 },
    { id: "action", label: "Acción", minWidth: 100 },
];

export const SubCategoryList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [editItem, setEditItem] = useState(null);
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
            context?.setCatData?.(res?.data || res || []);
        } catch (err) {
            notify("error", err?.message || "No se pudo cargar categorías");
        } finally {
            context?.setProgress?.(100);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [context?.isOpenFullScreenPanel?.open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Flatten L2 subcategories from the tree
    const subCategories = useMemo(() => {
        const catData = Array.isArray(context?.catData) ? context.catData : [];
        const result = [];
        for (const parent of catData) {
            if (Array.isArray(parent?.children)) {
                for (const child of parent.children) {
                    result.push({
                        ...child,
                        _parentName: parent.name,
                        _parentId: parent._id,
                    });
                }
            }
        }
        return result;
    }, [context?.catData]);

    const pagedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return subCategories.slice(start, start + rowsPerPage);
    }, [subCategories, page, rowsPerPage]);

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
            notify("success", "Subcategoría eliminada");
        } catch (err) {
            notify("error", err?.response?.data?.message || err?.message || "No se pudo eliminar");
        }
    };

    const panel = context?.isOpenFullScreenPanel;
    const panelOpen = !!panel?.open;

    const closePanel = () => {
        setEditItem(null);
        context?.setIsOpenFullScreenPanel?.({ open: false });
    };

    return (
        <>
            {/* Fullscreen panel overlay */}
            {panelOpen && (
                <div className="absolute inset-0 z-20 bg-white overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                        <h3 className="text-lg font-semibold">
                            {editItem ? "Editar subcategoría" : "Agregar subcategoría"}
                        </h3>
                        <Button onClick={closePanel} className="!min-w-0 !p-1">
                            <IoMdClose className="text-2xl" />
                        </Button>
                    </div>
                    {editItem ? (
                        <EditSubCatBox
                            name={editItem.name}
                            selectedCat={editItem._parentId}
                            selectedCatName={editItem._parentName}
                            catData={Array.isArray(context?.catData) ? context.catData : []}
                            id={editItem._id}
                            onDone={() => {
                                closePanel();
                                loadCategories();
                            }}
                        />
                    ) : (
                        <AddSubCategory />
                    )}
                </div>
            )}

            <div className="flex items-center justify-between px-2 py-0 mt-1">
                <h2 className="text-[18px] font-[600]">Subcategorías (Nivel 2)</h2>
                <div className="col w-[40%] ml-auto flex items-center justify-end gap-3">
                    <Button
                        className="btn-blue btn !text-white btn-sm"
                        onClick={() =>
                            context?.setIsOpenFullScreenPanel?.({
                                open: true,
                                model: "Add New Sub Category",
                            })
                        }
                    >
                        Agregar subcategoría
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
                    <Table stickyHeader aria-label="subcategories table">
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
                                    <TableCell>{item?.name}</TableCell>
                                    <TableCell>
                                        <span className="text-gray-500">{item?._parentName}</span>
                                    </TableCell>
                                    <TableCell width={100}>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                className="!w-[35px] !h-[35px] bg-[#f1f1f1] !border !border-[rgba(0,0,0,0.4)] !rounded-full hover:!bg-[#f1f1f1] !min-w-[35px]"
                                                onClick={() => {
                                                    setEditItem(item);
                                                    context?.setIsOpenFullScreenPanel?.({
                                                        open: true,
                                                        model: "Edit Sub Category",
                                                        id: item?._id,
                                                    });
                                                }}
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
                                            No hay subcategorías para mostrar.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[15, 25, 100]}
                    component="div"
                    count={subCategories.length}
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

export default SubCategoryList;
