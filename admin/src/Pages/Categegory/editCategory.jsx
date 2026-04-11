// admin/src/Pages/Category/EditCategory.jsx
import React, { useContext, useEffect, useState } from "react";
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";

import { AppContext } from "../../context/AppContext";

const EditCategory = () => {
    const [formFields, setFormFields] = useState({ name: "", images: [] });
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AppContext) || {};

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    // headers multi-tenant (tu server acepta x-tenant-id o x-store-id)
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

    // Cargar categoría por id
    useEffect(() => {
        const id = context?.isOpenFullScreenPanel?.id;
        if (!id) return;

        (async () => {
            try {
                const res = await fetchDataFromApi(`/api/category/${id}`);
                const cat = res?.data || res?.category || {};
                const imgs = Array.isArray(cat?.images) ? cat.images : [];
                setFormFields({ name: cat?.name || "", images: imgs });
                setPreviews(imgs);
            } catch (err) {
                notify("error", err?.message || "No se pudo cargar la categoría");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context?.isOpenFullScreenPanel?.id]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value, images: previews }));
    };

    // recibe URLs de UploadBox (sube a /api/category/uploadImages)
    const setPreviewsFun = (newUrls) => {
        const merged = [...previews, ...newUrls];
        setPreviews(merged);
        setFormFields((prev) => ({ ...prev, images: merged }));
    };

    const removeImg = async (imageUrl, index) => {
        try {
            await deleteImages(
                `/api/category/deleteImage?img=${encodeURIComponent(imageUrl)}`,
                {},
                { withCredentials: true, headers: { ...getTenantHeaders() } }
            );
            const next = previews.filter((_, i) => i !== index);
            setPreviews(next);
            setFormFields((prev) => ({ ...prev, images: next }));
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar la imagen");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formFields.name.trim()) {
            notify("error", "Por favor, ingrese el nombre de la categoría");
            return;
        }
        if (!previews.length) {
            notify("error", "Por favor, seleccione la imagen de la categoría");
            return;
        }

        setIsLoading(true);
        try {
            const id = context?.isOpenFullScreenPanel?.id;
            const payload = {
                name: formFields.name.trim(),
                images: previews, // el server también soporta imagesDetailed, pero no es necesario
            };

            const res = await editData(`/api/category/${id}`, payload, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            notify("success", res?.data?.message || "Categoría actualizada");
            context?.setIsOpenFullScreenPanel?.({ open: false });
        } catch (err) {
            notify("error", err?.message || "No se pudo actualizar la categoría");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="p-5 bg-gray-50">
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-1 mb-3">
                        <div className="col w-full md:w-[25%]">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Nombre de la categoría</h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="name"
                                value={formFields.name}
                                onChange={onChangeInput}
                            />
                        </div>
                    </div>

                    <br />

                    <h3 className="text-[14px] font-[500] mb-2 text-black">Imagen de la categoría</h3>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {previews.map((image, index) => (
                            <div className="uploadBoxWrapper mr-3 relative" key={`${image}-${index}`}>
                                <span
                                    className="absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                    onClick={() => removeImg(image, index)}
                                    title="Eliminar imagen"
                                >
                                    <IoMdClose className="text-white text-[17px]" />
                                </span>

                                <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative">
                                    <img src={image} alt="category" className="w-100" />
                                </div>
                            </div>
                        ))}

                        {/* Subida: requiere auth + tenant + permiso category:image:upload */}
                        <UploadBox
                            multiple
                            name="images"
                            url="/api/category/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                            headers={{ ...getTenantHeaders() }}
                        />
                    </div>
                </div>

                <br />
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
        </section>
    );
};

export default EditCategory;
