// admin/src/Pages/Blog/AddBlog.jsx
import React, { useContext, useState } from "react";
// ⚠️ carpeta "components" en minúscula
import UploadBox from "../../Components/UploadBox";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import Editor from "react-simple-wysiwyg";

import { deleteImages, postData } from "../../utils/api";
// ✅ usa named export
import { AppContext } from "../../context/AppContext";

// NUEVO: publicación + previa
import PublishFields from "../../Components/content/PublishFields";
import PreviewButton from "../../Components/content/PreviewButton";
import { buildBlogPreviewUrl } from "../../services/blog"; // ajusta si tu ruta difiere

const AddBlog = () => {
    const [formFields, setFormFields] = useState({
        title: "",
        images: [],        // array de URLs
        description: "",
    });

    // NUEVO: estado de publicación del blog
    // (para blog: publishedAt y opcional unpublishAt)
    const [pub, setPub] = useState({
        status: "draft",
        visibility: "public",
        publishedAt: "",
        unpublishAt: "",
    });

    // Para mostrar PreviewButton tras crear
    const [createdId, setCreatedId] = useState(null);

    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [html, setHtml] = useState(""); // estado del editor (UI)

    const navigate = useNavigate();
    const context = useContext(AppContext) || {};

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

    // UploadBox -> espera URL[]; fusionamos sin duplicados
    const setPreviewsFun = (urls = []) => {
        const unique = Array.from(new Set([...(previews || []), ...urls]));
        setPreviews(unique);
        setFormFields((prev) => ({ ...prev, images: unique }));
    };

    const removeImg = async (imageUrl, index) => {
        try {
            await deleteImages(`/api/blog/deleteImage?img=${encodeURIComponent(imageUrl)}`);
            const next = [...previews];
            next.splice(index, 1);
            setPreviews(next);
            setFormFields((prev) => ({ ...prev, images: next }));
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar la imagen");
        }
    };

    const onChangeDescription = (e) => {
        const value = e.target.value;
        setHtml(value);
        setFormFields((prev) => ({ ...prev, description: value }));
    };

    const validate = () => {
        if (!formFields.title?.trim()) {
            notify("error", "Por favor, ingrese el título.");
            return false;
        }
        const plain = formFields.description?.replace(/<[^>]*>/g, "").trim();
        if (!plain) {
            notify("error", "Por favor, ingrese la descripción.");
            return false;
        }
        if (!formFields.images || formFields.images.length === 0) {
            notify("error", "Por favor, seleccione al menos una imagen.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Construye payload con metadatos de publicación (ISO sólo si hay valor)
            const payload = {
                ...formFields,
                status: pub.status,
                visibility: pub.visibility,
                ...(pub.publishedAt ? { publishedAt: new Date(pub.publishedAt).toISOString() } : {}),
                ...(pub.unpublishAt ? { unpublishAt: new Date(pub.unpublishAt).toISOString() } : {}),
            };

            const res = await postData("/api/blog/add", payload);
            if (res?.error) throw new Error(res?.message || "No se pudo crear el blog");

            const created = res?.data?.blog || res?.data || {};
            const id = created?._id || created?.id || null;
            setCreatedId(id);

            notify("success", "Entrada publicada correctamente");

            // Si hay id, abrimos previsualización
            if (id) {
                window.open(buildBlogPreviewUrl(id), "_blank", "noopener");
            }

            context?.setIsOpenFullScreenPanel?.({ open: false });
            navigate("/blog/list", { replace: true });
        } catch (err) {
            notify("error", err?.message || "Error al publicar la entrada");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="p-5 bg-gray-50">
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-1 mb-3">
                        <div className="col w-full">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Título</h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="title"
                                value={formFields.title}
                                onChange={onChangeInput}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 mb-3">
                        <div className="col w-full">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Descripción</h3>
                            <Editor
                                value={html}
                                onChange={onChangeDescription}
                                containerProps={{ style: { resize: "vertical" } }}
                            />
                        </div>
                    </div>

                    <br />

                    <h3 className="text-[18px] font-[500] mb-1 text-black">Imagen</h3>
                    <br />
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {previews.map((image, index) => (
                            <div className="uploadBoxWrapper relative" key={`${image}-${index}`}>
                                <span
                                    className="absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                    onClick={() => removeImg(image, index)}
                                    title="Eliminar"
                                >
                                    <IoMdClose className="text-white text-[17px]" />
                                </span>
                                <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-full bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative">
                                    <img src={image} alt="blog" className="w-100" />
                                </div>
                            </div>
                        ))}

                        <UploadBox
                            multiple
                            name="images"
                            url="/api/blog/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                        />
                    </div>

                    {/* NUEVO: Campos de publicación (status, visibility, fechas) */}
                    <div className="mt-6">
                        <PublishFields
                            mode="blog"
                            value={pub}
                            onChange={(p) => setPub((prev) => ({ ...prev, ...p }))}
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

                {/* NUEVO: botón de previsualización si ya existe un id creado */}
                <div className="mt-3">
                    {createdId && (
                        <PreviewButton id={createdId} buildUrl={buildBlogPreviewUrl} />
                    )}
                </div>
            </form>
        </section>
    );
};

export default AddBlog;
