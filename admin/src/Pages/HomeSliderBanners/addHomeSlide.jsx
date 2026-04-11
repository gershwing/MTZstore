// admin/src/Pages/HomeSliderBanners/AddHomeSlide.jsx
import React, { useState, useContext } from "react";
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { AppContext } from "../../context/AppContext"; // ✅ named export
import { deleteImages, postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

// NUEVO: campos de publicación
import PublishFields from "../../components/content/PublishFields";

const AddHomeSlide = () => {
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // NUEVO: estado de publicación/visibilidad/fechas
    const [pub, setPub] = useState({
        status: "draft",
        visibility: "public",
        publishAt: "",
        expireAt: "",
    });

    const context = useContext(AppContext); // ✅ contexto correcto
    const history = useNavigate();

    // Header opcional de tenant
    const getTenantHeaders = () => {
        const tenantId =
            context?.viewer?.activeStoreId ||
            context?.viewer?.storeId ||
            context?.userData?.storeId ||
            context?.tenant?.storeId ||
            null;
        return tenantId ? { "x-tenant-id": String(tenantId) } : {};
    };

    // Helper para URL de previa (abre /preview/:id)
    const buildSliderPreviewUrl = (id) => `/preview/${id}`;

    // Recibe URLs que devuelve /uploadImages
    const setPreviewsFun = (newUrls) => {
        setPreviews((prev) => [...prev, ...newUrls]);
    };

    const removeImg = async (imageUrl, index) => {
        try {
            await deleteImages(
                `/api/home-slides/delete-image?img=${encodeURIComponent(imageUrl)}`,
                {},
                { withCredentials: true, headers: { ...getTenantHeaders() } }
            );
            setPreviews((prev) => prev.filter((_, i) => i !== index));
        } catch (e) {
            context?.alertBox?.("error", "No se pudo eliminar la imagen");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!previews.length) {
            context?.alertBox?.("error", "Por favor selecciona al menos una imagen");
            return;
        }
        setIsLoading(true);
        try {
            // Construye payload combinando imágenes + metadatos de publicación
            const payload = {
                images: previews,
                status: pub.status,
                visibility: pub.visibility,
                ...(pub.publishAt ? { publishAt: new Date(pub.publishAt).toISOString() } : {}),
                ...(pub.expireAt ? { expireAt: new Date(pub.expireAt).toISOString() } : {}),
            };

            const res = await postData("/api/homeSlides/add", payload, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            const created = res?.data?.slide || res?.data || {};
            const createdId = created?._id || created?.id;

            context?.alertBox?.("success", res?.data?.message || "Slide creado");

            // Si tenemos el id del creado, abrimos la previsualización en una nueva pestaña
            if (createdId) {
                window.open(buildSliderPreviewUrl(createdId), "_blank", "noopener");
            }

            context?.setIsOpenFullScreenPanel?.({ open: false });
            history("/homeSlider/list");
        } catch (err) {
            context?.alertBox?.("error", err?.message || "No se pudo crear el slide");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="p-5 bg-gray-50">
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {previews.map((image, index) => (
                            <div className="uploadBoxWrapper mr-3 relative" key={`${image}-${index}`}>
                                <span
                                    className="absolute w-[20px] h-[20px] rounded-full bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                    onClick={() => removeImg(image, index)}
                                    title="Eliminar imagen"
                                >
                                    <IoMdClose className="text-white text-[17px]" />
                                </span>
                                <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative">
                                    <img src={image} className="w-100" alt="slide" />
                                </div>
                            </div>
                        ))}

                        {/* Asegúrate de que UploadBox envíe withCredentials y headers */}
                        <UploadBox
                            multiple={false}
                            name="images"
                            url="/api/home-slides/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                            withCredentials={true}
                            headers={{ ...getTenantHeaders() }}
                        />
                    </div>

                    {/* NUEVO: sección de publicación */}
                    <div className="mt-6">
                        <PublishFields
                            mode="slider"
                            value={pub}
                            onChange={(p) => setPub((prev) => ({ ...prev, ...p }))}
                        />
                    </div>
                </div>

                <br />
                <div className="w-[250px]">
                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {isLoading ? (
                            <CircularProgress color="inherit" />
                        ) : (
                            <>
                                <FaCloudUploadAlt className="text-[25px] text-white" />
                                Crear y previsualizar
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AddHomeSlide;
