// src/Pages/Category/EditCategory.jsx
import React, { useContext, useEffect, useState } from "react";
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";
import { AppContext } from "../../context/AppContext"; // ✅ named export

const EditCategory = () => {
    const [formFields, setFormFields] = useState({ name: "", images: [] });
    const [previews, setPreviews] = useState([]); // solo URLs
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(AppContext); // ✅ contexto correcto

    // Helper: tenant header opcional
    const getTenantHeaders = () => {
        const tenantId =
            context?.viewer?.activeStoreId ||
            context?.viewer?.storeId ||
            context?.userData?.storeId ||
            context?.tenant?.storeId ||
            null;

        return tenantId ? { "x-tenant-id": String(tenantId) } : {};
    };

    // Cargar categoría por id (panel fullscreen trae el id)
    useEffect(() => {
        const id = context?.isOpenFullScreenPanel?.id;
        if (!id) return;

        (async () => {
            const res = await fetchDataFromApi(`/api/category/${id}`);
            // El server responde con shape { success, error, data: <category> }
            const cat = res?.data || {};
            setFormFields((prev) => ({
                ...prev,
                name: cat?.name || "",
                images: Array.isArray(cat?.images) ? cat.images : [],
            }));
            setPreviews(Array.isArray(cat?.images) ? cat.images : []);
        })();
    }, [context?.isOpenFullScreenPanel?.id]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value, images: previews }));
    };

    // Recibe URLs desde <UploadBox /> después de subir a /api/category/uploadImages
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
        } catch (e) {
            context?.alertBox?.("error", "No se pudo eliminar la imagen");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formFields.name.trim()) {
            context?.alertBox?.("error", "Por favor ingresa el nombre de la categoría");
            return;
        }
        if (!previews.length) {
            context?.alertBox?.("error", "Por favor selecciona la imagen de la categoría");
            return;
        }

        setIsLoading(true);
        try {
            const id = context?.isOpenFullScreenPanel?.id;
            const payload = {
                name: formFields.name.trim(),
                images: previews, // el server acepta `images` (también soporta imagesDetailed)
            };

            const res = await editData(`/api/category/${id}`, payload, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            const msg = res?.data?.message || "Categoría actualizada";
            context?.alertBox?.("success", msg);

            // cerrar panel
            context?.setIsOpenFullScreenPanel?.({ open: false });
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "No se pudo actualizar la categoría";
            context?.alertBox?.("error", msg);
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
                                name="name"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                value={formFields.name}
                                onChange={onChangeInput}
                            />
                        </div>
                    </div>

                    <br />

                    <h3 className="text-[14px] font-[500] mb-2 text-black">Imagen de la categoría</h3>

                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {previews?.length > 0 &&
                            previews.map((image, index) => (
                                <div className="uploadBoxWrapper mr-3 relative" key={image + index}>
                                    <span
                                        className="absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                        onClick={() => removeImg(image, index)}
                                        title="Eliminar imagen"
                                    >
                                        <IoMdClose className="text-white text-[17px]" />
                                    </span>

                                    <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative">
                                        <img src={image} className="w-100" />
                                    </div>
                                </div>
                            ))}

                        {/* UploadBox debe enviar multipart con campo 'images' a /api/category/uploadImages */}
                        <UploadBox
                            multiple
                            name="images"
                            url="/api/category/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                            headers={getTenantHeaders()}
                        />
                    </div>
                </div>

                <br />
                <br />
                <div className="w-[250px]">
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {isLoading ? (
                            <CircularProgress color="inherit" />
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
