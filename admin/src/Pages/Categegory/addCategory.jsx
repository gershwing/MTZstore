// admin/src/Pages/Category/AddCategory.jsx
import React, { useContext, useState } from "react";
// ⚠️ Verifica el case correcto del folder: suele ser "components" en minúscula.
// Si tu carpeta es "components", cambia la línea de abajo a: "../../components/UploadBox"
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteImages, postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";

// ✅ named export
import { AppContext } from "../../context/AppContext";

const AddCategory = () => {
    const [formFields, setFormFields] = useState({ name: "", images: [] });
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const context = useContext(AppContext) || {};

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    // Header tenant opcional: usa x-tenant-id o x-store-id que tu server acepta
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

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value, images: previews }));
    };

    // Recibe URLs finales desde UploadBox (sube a /api/category/uploadImages)
    const setPreviewsFun = (newUrls = []) => {
        const merged = Array.from(new Set([...(previews || []), ...newUrls]));
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
        context?.setProgress?.(50);
        setIsLoading(true);

        if (!formFields.name.trim()) {
            notify("error", "Por favor, ingrese el nombre de la categoría");
            setIsLoading(false);
            return;
        }
        if (previews.length === 0) {
            notify("error", "Por favor, seleccione la imagen de la categoría");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                name: formFields.name.trim(),
                images: previews,
            };

            await postData("/api/category/create", payload, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            setIsLoading(false);
            context?.setIsOpenFullScreenPanel?.({ open: false });
            context?.getCat?.();
            navigate("/admin/category/list", { replace: true });
            context?.setProgress?.(100);
            notify("success", "Categoría creada correctamente");
        } catch (err) {
            setIsLoading(false);
            context?.setProgress?.(100);
            notify("error", err?.message || "No se pudo crear la categoría");
        }
    };

    return (
        <section className="p-5 bg-gray-50">
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-1 md:pr-4 pt-4">
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

                        {/* Sube a /api/category/uploadImages (auth + tenant header) */}
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

export default AddCategory;
