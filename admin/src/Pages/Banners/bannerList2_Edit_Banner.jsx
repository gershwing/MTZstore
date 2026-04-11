// admin/src/Pages/BannerList2/Edit_Banner.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
// ✅ usa named export
import { AppContext } from "../../context/AppContext";
// ⚠️ carpeta "components" en minúscula
import UploadBox from "../../Components/UploadBox";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Button } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";

// 👇 NUEVO: botón de previa + generador de URL para bannerList2
import PreviewButton from "../../Components/content/PreviewButton";
import { buildBannerList2PreviewUrl } from "../../services/bannerList2";

/**
 * BannerList2_Edit_Banner — alineado al backend
 *
 * Backend esperado (según bannerList2):
 *  - GET    /api/bannerList2/:id                 (detalle)
 *  - POST   /api/bannerList2/uploadImages        (UploadBox -> devuelve URL[])
 *  - DELETE /api/bannerList2/deleteImage?img=URL (elimina en storage)
 *  - PUT    /api/bannerList2/:id                 (actualiza banner)
 */

export const BannerList2_Edit_Banner = () => {
    const [formFields, setFormFields] = useState({
        catId: null,
        subCatId: null,
        thirdsubCatId: null,
        images: [],
    });

    // estados UI (selects + previews)
    const [productCat, setProductCat] = useState("");
    const [productSubCat, setProductSubCat] = useState("");
    const [productThirdLavelCat, setProductThirdLavelCat] = useState("");
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const context = useContext(AppContext) || {};
    const cats = context?.catData || [];

    // 🔔 Notificador defensivo
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    // 👇 NUEVO: id del panel para el botón de previa
    const panelId = context?.isOpenFullScreenPanel?.id;

    // Cargar datos del banner
    useEffect(() => {
        const id = panelId;
        if (!id) return;
        (async () => {
            try {
                const res = await fetchDataFromApi(`/api/bannerList2/${id}`);
                const banner = res?.banner || {};
                const initImages = Array.isArray(banner?.images) ? banner.images : [];

                setPreviews(initImages);
                setFormFields({
                    catId: banner?.catId ?? null,
                    subCatId: banner?.subCatId ?? null,
                    thirdsubCatId: banner?.thirdsubCatId ?? null,
                    images: initImages,
                });

                setProductCat(banner?.catId ?? "");
                setProductSubCat(banner?.subCatId ?? "");
                setProductThirdLavelCat(banner?.thirdsubCatId ?? "");
            } catch (err) {
                notify("error", err?.message || "No se pudo cargar el banner");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers Selects
    const handleChangeProductCat = (event) => {
        const value = event.target.value ?? null;
        setProductCat(value ?? "");
        setFormFields((prev) => ({ ...prev, catId: value }));
    };

    const handleChangeProductSubCat = (event) => {
        const value = event.target.value ?? null;
        setProductSubCat(value ?? "");
        setFormFields((prev) => ({ ...prev, subCatId: value }));
    };

    const handleChangeProductThirdLavelCat = (event) => {
        const value = event.target.value ?? null;
        setProductThirdLavelCat(value ?? "");
        setFormFields((prev) => ({ ...prev, thirdsubCatId: value }));
    };

    // UploadBox -> setPreviewsFun recibe URL[] y las fusiona sin duplicados
    const setPreviewsFun = (urls = []) => {
        const unique = Array.from(new Set([...(previews || []), ...urls]));
        setPreviews(unique);
        setFormFields((prev) => ({ ...prev, images: unique }));
    };

    // Eliminar imagen del banner y del estado
    const removeImg = async (imageUrl, index) => {
        try {
            await deleteImages(`/api/bannerList2/deleteImage?img=${encodeURIComponent(imageUrl)}`);
            const next = [...previews];
            next.splice(index, 1);
            setPreviews(next);
            setFormFields((prev) => ({ ...prev, images: next }));
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar la imagen");
        }
    };

    // Validación mínima (al menos una imagen)
    const validate = () => {
        if (!formFields.images || formFields.images.length === 0) {
            notify("error", "Por favor agrega al menos una imagen");
            return false;
        }
        return true;
    };

    // Guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const id = panelId;
            const res = await editData(`/api/bannerList2/${id}`, formFields);
            if (res?.error) throw new Error(res?.message || "No se pudo actualizar el banner");

            notify("success", "Banner actualizado correctamente");
            context?.setIsOpenFullScreenPanel?.({ open: false });
            navigate("/bannerlist2/list", { replace: true });
        } catch (err) {
            notify("error", err?.message || "Error al actualizar el banner");
        } finally {
            setIsLoading(false);
        }
    };

    // Listas aplanadas para selects
    const flatSubCats = useMemo(() => cats.flatMap((c) => c?.children || []), [cats]);
    const flatThirdCats = useMemo(() => flatSubCats.flatMap((sc) => sc?.children || []), [flatSubCats]);

    return (
        <section className="p-5 bg-gray-50">
            <form className="form py-1 p-1 md:p-8 md:py-1" onSubmit={handleSubmit}>
                <div className="scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 mb-3 gap-5">
                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Categoría</h3>
                            {cats.length !== 0 && (
                                <Select
                                    id="productCatDrop"
                                    size="small"
                                    className="w-full"
                                    value={productCat}
                                    label="Categoría"
                                    onChange={handleChangeProductCat}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Ninguna</em>
                                    </MenuItem>
                                    {cats.map((cat) => (
                                        <MenuItem value={cat?._id} key={cat?._id}>
                                            {cat?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Subcategoría</h3>
                            {cats.length !== 0 && (
                                <Select
                                    id="productSubCatDrop"
                                    size="small"
                                    className="w-full"
                                    value={productSubCat}
                                    label="Subcategoría"
                                    onChange={handleChangeProductSubCat}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Ninguna</em>
                                    </MenuItem>
                                    {flatSubCats.map((sub) => (
                                        <MenuItem value={sub?._id} key={sub?._id}>
                                            {sub?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Tercera Subcategoría</h3>
                            {cats.length !== 0 && (
                                <Select
                                    id="productThirdCatDrop"
                                    size="small"
                                    className="w-full"
                                    value={productThirdLavelCat}
                                    label="Tercera Subcategoría"
                                    onChange={handleChangeProductThirdLavelCat}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Ninguna</em>
                                    </MenuItem>
                                    {flatThirdCats.map((third) => (
                                        <MenuItem value={third?._id} key={third?._id}>
                                            {third?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </div>

                    <br />

                    <h3 className="text-[18px] font-[500] mb-0 text-black">Imagen</h3>
                    <br />
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {previews?.length > 0 &&
                            previews.map((image, index) => (
                                <div className="uploadBoxWrapper mr-3 relative" key={`${image}-${index}`}>
                                    <span
                                        className="absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                        onClick={() => removeImg(image, index)}
                                        title="Eliminar imagen"
                                    >
                                        <IoMdClose className="text-white text-[17px]" />
                                    </span>
                                    <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative">
                                        <img src={image} alt="banner" className="w-100" />
                                    </div>
                                </div>
                            ))}

                        <UploadBox
                            multiple
                            name="images"
                            url="/api/bannerList2/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                        />
                    </div>
                </div>

                <br />
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-[250px]">
                        <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <CircularProgress color="inherit" size={22} />
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="text-[25px] text-white" />
                                    Guardar cambios
                                </>
                            )}
                        </Button>
                    </div>

                    {/* 👇 NUEVO: botón de previsualización (misma UX que sliders/banners/blog) */}
                    {panelId && <PreviewButton id={panelId} buildUrl={buildBannerList2PreviewUrl} />}
                </div>
            </form>
        </section>
    );
};

export default BannerList2_Edit_Banner;
