// admin/src/Pages/HomeSliderBanners/EditBannerV1.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { AppContext } from "../../context/AppContext";
// ⚠️ carpeta "components" en minúscula
import UploadBox from "../../components/UploadBox";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Button } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";

// NUEVO: publicación + previa
import PublishFields from "../../components/content/PublishFields";
import PreviewButton from "../../components/content/PreviewButton";
// 👉 Importa la URL builder desde el service (igual que sliders/bannerList2/blog)
import { buildBannerV1PreviewUrl } from "../../services/bannersV1";

export const EditBannerV1 = () => {
    const [formFields, setFormFields] = useState({
        catId: null,
        bannerTitle: "",
        subCatId: null,
        thirdsubCatId: null,
        price: "",
        alignInfo: "left",
        images: [],
    });

    // NUEVO: estado de publicación
    const [pub, setPub] = useState({
        status: "draft",
        visibility: "public",
        publishAt: "",
        expireAt: "",
    });

    const [productCat, setProductCat] = useState("");
    const [productSubCat, setProductSubCat] = useState("");
    const [productThirdLavelCat, setProductThirdLavelCat] = useState("");
    const [alignInfo, setAlignInfo] = useState("left");
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

    // 👇 usamos el id del panel para el botón de previa
    const panelId = context?.isOpenFullScreenPanel?.id;

    // Cargar banner
    useEffect(() => {
        const id = panelId;
        if (!id) return;
        (async () => {
            try {
                const res = await fetchDataFromApi(`/api/bannerV1/${id}`);
                const b = res?.banner || res?.data || {};
                const imgs = Array.isArray(b?.images) ? b.images : [];

                setPreviews(imgs);
                setAlignInfo(b?.alignInfo ?? "left");
                setProductCat(b?.catId ?? "");
                setProductSubCat(b?.subCatId ?? "");
                setProductThirdLavelCat(b?.thirdsubCatId ?? "");

                setFormFields({
                    catId: b?.catId ?? null,
                    bannerTitle: b?.bannerTitle ?? "",
                    subCatId: b?.subCatId ?? null,
                    thirdsubCatId: b?.thirdsubCatId ?? null,
                    price: b?.price ?? "",
                    alignInfo: b?.alignInfo ?? "left",
                    images: imgs,
                });

                // NUEVO: carga de publicación
                setPub({
                    status: b?.status || "draft",
                    visibility: b?.visibility || "public",
                    publishAt: b?.publishAt ? String(b.publishAt).slice(0, 16) : "",
                    expireAt: b?.expireAt ? String(b.expireAt).slice(0, 16) : "",
                });
            } catch (err) {
                notify("error", err?.message || "No se pudo cargar el banner");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelId]);

    // Handlers de selects/inputs
    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

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

    const handleChangeAlignInfo = (event) => {
        const value = event.target.value;
        setAlignInfo(value);
        setFormFields((prev) => ({ ...prev, alignInfo: value }));
    };

    // Upload: fusiona sin duplicados
    const setPreviewsFun = (urls = []) => {
        const unique = Array.from(new Set([...(previews || []), ...urls]));
        setPreviews(unique);
        setFormFields((prev) => ({ ...prev, images: unique }));
    };

    const removeImg = async (imageUrl, index) => {
        try {
            await deleteImages(`/api/bannerV1/deleteImage?img=${encodeURIComponent(imageUrl)}`);
            const next = [...previews];
            next.splice(index, 1);
            setPreviews(next);
            setFormFields((prev) => ({ ...prev, images: next }));
        } catch (err) {
            notify("error", err?.message || "No se pudo eliminar la imagen");
        }
    };

    // Validaciones mínimas
    const validate = () => {
        if (!formFields.bannerTitle?.trim()) {
            notify("error", "Por favor ingrese el título del banner");
            return false;
        }
        if (formFields.price === "" || isNaN(Number(formFields.price))) {
            notify("error", "Por favor ingrese un precio válido");
            return false;
        }
        if (!formFields.images || formFields.images.length === 0) {
            notify("error", "Por favor agregue al menos una imagen");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const id = panelId;
            const payload = {
                ...formFields,
                price: Number(formFields.price),
                // NUEVO: publicación (solo si hay fecha, enviamos ISO)
                status: pub.status,
                visibility: pub.visibility,
                ...(pub.publishAt ? { publishAt: new Date(pub.publishAt).toISOString() } : {}),
                ...(pub.expireAt ? { expireAt: new Date(pub.expireAt).toISOString() } : {}),
            };

            const res = await editData(`/api/bannerV1/${id}`, payload);
            if (res?.error) throw new Error(res?.message || "No se pudo actualizar el banner");

            notify("success", "Banner actualizado correctamente");
            context?.setIsOpenFullScreenPanel?.({ open: false });
            navigate("/bannerV1/list", { replace: true });
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
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Título del Banner</h3>
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="bannerTitle"
                                value={formFields.bannerTitle}
                                onChange={onChangeInput}
                            />
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Categoría</h3>
                            {cats.length !== 0 && (
                                <Select
                                    id="productCatDrop"
                                    size="small"
                                    className="w-full"
                                    value={productCat}
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

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Precio</h3>
                            <input
                                type="number"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="price"
                                value={formFields.price}
                                onChange={onChangeInput}
                                min={0}
                                step="0.01"
                            />
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1 text-black">Alinear Información</h3>
                            <Select
                                id="alignInfoDrop"
                                size="small"
                                className="w-full"
                                value={alignInfo}
                                onChange={handleChangeAlignInfo}
                            >
                                <MenuItem value={"left"}>Izquierda</MenuItem>
                                <MenuItem value={"right"}>Derecha</MenuItem>
                            </Select>
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
                            url="/api/bannerV1/uploadImages"
                            setPreviewsFun={setPreviewsFun}
                        />
                    </div>

                    {/* NUEVO: Campos de publicación (status, visibility, fechas) */}
                    <div className="mt-6">
                        <PublishFields
                            mode="banner"
                            value={pub}
                            onChange={(p) => setPub((prev) => ({ ...prev, ...p }))}
                        />
                    </div>
                </div>

                <br />
                <div className="flex items-center gap-3">
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

                    {/* NUEVO: botón de previsualización (usa el id del panel actual) */}
                    {panelId && (
                        <PreviewButton id={panelId} buildUrl={buildBannerV1PreviewUrl} />
                    )}
                </div>
            </form>
        </section>
    );
};

export default EditBannerV1;
