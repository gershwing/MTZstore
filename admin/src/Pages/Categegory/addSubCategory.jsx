// admin/src/Pages/SubCategory/AddSubCategory.jsx
import React, { useState, useContext } from "react";
import { Button, MenuItem, Select } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../context/AppContext";

const AddSubCategory = () => {
    const [productCat, setProductCat] = useState("");
    const [productCat2, setProductCat2] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);

    const [formFields, setFormFields] = useState({
        name: "",
        parentCatName: null,
        parentId: null,
    });

    const [formFields2, setFormFields2] = useState({
        name: "",
        parentCatName: null,
        parentId: null,
    });

    const context = useContext(AppContext) || {};
    const navigate = useNavigate();

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    // Obtiene tenant desde contexto o localStorage y arma headers
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

    // --- Subcategoría (nivel 2) ---
    const handleChangeProductCat = (event) => {
        const value = event.target.value;
        setProductCat(value);
        setFormFields((prev) => ({ ...prev, parentId: value }));
    };
    const selecteCatFun = (catName) =>
        setFormFields((prev) => ({ ...prev, parentCatName: catName }));

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formFields.name.trim()) {
            notify("error", "Por favor, ingrese el nombre de la categoría");
            setIsLoading(false);
            return;
        }
        if (!productCat) {
            notify("error", "Por favor, seleccione la categoría padre");
            setIsLoading(false);
            return;
        }

        try {
            await postData("/api/category/create", formFields, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            context?.setIsOpenFullScreenPanel?.({ open: false });
            context?.getCat?.();
            navigate("/admin/subCategory/list", { replace: true });
            notify("success", "Subcategoría creada");
        } catch (err) {
            notify("error", err?.message || "No se pudo crear");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Tercer nivel (nivel 3) ---
    const handleChangeProductCat2 = (event) => {
        const value = event.target.value;
        setProductCat2(value);
        setFormFields2((prev) => ({ ...prev, parentId: value }));
    };
    const selecteCatFun2 = (catName) =>
        setFormFields2((prev) => ({ ...prev, parentCatName: catName }));

    const onChangeInput2 = (e) => {
        const { name, value } = e.target;
        setFormFields2((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit2 = async (e) => {
        e.preventDefault();
        setIsLoading2(true);

        if (!formFields2.name.trim()) {
            notify("error", "Por favor, ingrese el nombre");
            setIsLoading2(false);
            return;
        }
        if (!productCat2) {
            notify("error", "Por favor, seleccione la subcategoría padre");
            setIsLoading2(false);
            return;
        }

        try {
            await postData("/api/category/create", formFields2, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });
            context?.setIsOpenFullScreenPanel?.({ open: false });
            context?.getCat?.();
            notify("success", "Categoría de tercer nivel creada");
        } catch (err) {
            notify("error", err?.message || "No se pudo crear");
        } finally {
            setIsLoading2(false);
        }
    };

    return (
        <section className="p-5 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Nivel 2 */}
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <h4 className="font-[600]">Agregar subcategoría</h4>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-1 mb-3 gap-5">
                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">
                                Categoría de producto
                            </h3>
                            <Select
                                id="productCatDrop"
                                size="small"
                                className="w-full"
                                value={productCat}
                                label="Categoría"
                                onChange={handleChangeProductCat}
                            >
                                {Array.isArray(context?.catData) &&
                                    context?.catData?.map((item) => (
                                        <MenuItem
                                            key={item?._id}
                                            value={item?._id}
                                            onClick={() => selecteCatFun(item?.name)}
                                        >
                                            {item?.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">
                                Nombre de subcategoría
                            </h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="name"
                                value={formFields.name}
                                onChange={onChangeInput}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-[250px]">
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {isLoading ? (
                            <CircularProgress color="inherit" size={22} />
                        ) : (
                            <>
                                <FaCloudUploadAlt className="text-[25px] text-white" />
                                Publicar y ver
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Nivel 3 */}
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit2}>
                <h4 className="font-[600]">Agregar categoría de tercer nivel</h4>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-1 mb-3 gap-5">
                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Categoría de producto</h3>
                            <Select
                                id="productCatDrop2"
                                size="small"
                                className="w-full"
                                value={productCat2}
                                label="Categoría"
                                onChange={handleChangeProductCat2}
                            >
                                {Array.isArray(context?.catData) &&
                                    context?.catData?.flatMap((item) =>
                                        (item?.children || []).map((item2) => (
                                            <MenuItem
                                                key={item2?._id}
                                                value={item2?._id}
                                                onClick={() => selecteCatFun2(item2?.name)}
                                            >
                                                {item2?.name}
                                            </MenuItem>
                                        ))
                                    )}
                            </Select>
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Nombre de subcategoría</h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="name"
                                value={formFields2.name}
                                onChange={onChangeInput2}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-[250px]">
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading2}>
                        {isLoading2 ? (
                            <CircularProgress color="inherit" size={22} />
                        ) : (
                            <>
                                <FaCloudUploadAlt className="text-[25px] text-white" />
                                Publicar y ver
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AddSubCategory;
