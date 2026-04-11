// admin/src/Pages/HomeSliderBanners/EditSlider.jsx
import React, { useState, useContext, useEffect } from "react";
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { AppContext } from "../../context/AppContext"; // ✅ named export
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

// NUEVO: campos de publicación + botón de previa
import PublishFields from "../../Components/content/PublishFields";
import PreviewButton from "../../Components/content/PreviewButton";
// 👇 Importa la URL builder desde el service (en vez del helper local)
import { buildSliderPreviewUrl } from "../../services/sliders";

const EditHomeSlide = () => {
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

    useEffect(() => {
        const id = context?.isOpenFullScreenPanel?.id;
        if (!id) return;
        (async () => {
            const res = await fetchDataFromApi(`/api/home-slides/${id}`);
            const slide = res?.slide || res?.data || {};
            const imgs = slide?.images || [];
            setPreviews(Array.isArray(imgs) ? imgs : []);

            // Carga de campos de publicación si existen
            setPub({
                status: slide?.status || "draft",
                visibility: slide?.visibility || "public",
                publishAt: slide?.publishAt ? String(slide.publishAt).slice(0, 16) : "",
                expireAt: slide?.expireAt ? String(slide.expireAt).slice(0, 16) : "",
            });
        })();
    }, [context?.isOpenFullScreenPanel?.id]);

    // Recibe URLs devueltas por /api/homeSlides/uploadImages
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
            const id = context?.isOpenFullScreenPanel?.id;

            // Construye payload combinando imágenes + metadatos de publicación
            const payload = {
                images: previews,
                status: pub.status,
                visibility: pub.visibility,
                // Si están vacíos, mejor no enviarlos (el back puede interpretarlo como null)
                ...(pub.publishAt ? { publishAt: new Date(pub.publishAt).toISOString() } : {}),
                ...(pub.expireAt ? { expireAt: new Date(pub.expireAt).toISOString() } : {}),
            };

            await editData(`/api/homeSlides/${id}`, payload, {
                withCredentials: true,
                headers: { ...getTenantHeaders() },
            });

            context?.alertBox?.("success", "Slide actualizado correctamente");
            context?.setIsOpenFullScreenPanel?.({ open: false });
            history("/homeSlider/list");
        } catch (err) {
            context?.alertBox?.("error", err?.message || "No se pudo actualizar el slide");
        } finally {
            setIsLoading(false);
        }
    };

    const id = context?.isOpenFullScreenPanel?.id;

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
                <div className="flex items-center gap-3">
                    <div className="w-[220px]">
                        <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <CircularProgress color="inherit" />
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="text-[22px] text-white" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </div>

                    {/* NUEVO: botón de previa usando el service */}
                    {id && <PreviewButton id={id} buildUrl={buildSliderPreviewUrl} />}
                </div>
            </form>
        </section>
    );
};

export default EditHomeSlide;
