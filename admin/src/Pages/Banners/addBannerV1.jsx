// admin/src/Pages/HomeSliderBanners/AddBannerV1.jsx
import React, { useState, useContext, useMemo } from "react";
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
import { deleteImages, postData } from "../../utils/api";

// NUEVO: publicación + previa
import PublishFields from "../../Components/content/PublishFields";
import PreviewButton from "../../Components/content/PreviewButton";

export const AddBannerV1 = () => {
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

    // Para mostrar PreviewButton luego de crear
    const [createdId, setCreatedId] = useState(null);

    // estados locales para selects (solo UI). El valor de verdad está en formFields
    const [productCat, setProductCat] = useState("");
    const [productSubCat, setProductSubCat] = useState("");
    const [productThirdLavelCat, setProductThirdLavelCat] = useState("");
    const [alignInfo, setAlignInfo] = useState("left");

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

    // UploadBox -> setPreviewsFun recibe array de URLs
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

    const validate = () => {
        if (!formFields.bannerTitle?.trim()) {
            notify("error", "Por favor ingrese el Título del Banner");
            return false;
        }
        if (formFields.price === "" || isNaN(Number(formFields.price))) {
            notify("error", "Por favor ingrese un Precio válido");
            return false;
        }
        if (!formFields.images || formFields.images.length === 0) {
            notify("error", "Por favor suba al menos una imagen");
            return false;
        }
        return true;
    };

    // Helper para URL de previa (ajusta si tu backend usa otra ruta)
    const buildBannerV1PreviewUrl = (id) => `/preview/${id}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const payload = {
                ...formFields,
                price: Number(formFields.price),
                // metadatos de publicación
                status: pub.status,
                visibility: pub.visibility,
                ...(pub.publishAt ? { publishAt: new Date(pub.publishAt).toISOString() } : {}),
                ...(pub.expireAt ? { expireAt: new Date(pub.expireAt).toISOString() } : {}),
            };

            const res = await postData("/api/bannerV1/add", payload);
            if (res?.error) throw new Error(res?.message || "No se pudo crear el banner");

            const created = res?.data?.banner || res?.data || {};
            const id = created?._id || created?.id || null;
            setCreatedId(id);

            notify("success", "Banner publicado correctamente");

            // Abrir previa si hay id
            if (id) {
                window.open(buildBannerV1PreviewUrl(id), "_blank", "noopener");
            }

            // Cerrar/navegar/recargar
            context?.setIsOpenFullScreenPanel?.({ open: false });
            context?.reloadBanners?.();
            navigate("/bannerV1/list", { replace: true });
        } catch (err) {
            notify("error", err?.message || "Error al publicar el banner");
        } finally {
            setIsLoading(false);
        }
    };

    const cats = context?.catData || [];

    const flatSubCats = useMemo(() => {
        return cats.flatMap((c) => c?.children || []);
    }, [cats]);

    const flatThirdCats = useMemo(() => {
        return flatSubCats.flatMap((sc) => sc?.children || []);
    }, [flatSubCats]);

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

                        {/* Upload múltiple - espera URL[] del backend */}
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
                <div className="w-[250px]">
                    <Button
                        type="submit"
                        className="btn-blue btn-lg w-full flex gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress color="inherit" size={22} />
                        ) : (
                            <>
                                <FaCloudUploadAlt className="text-[25px] text-white" />
                                Publicar y Ver
                            </>
                        )}
                    </Button>
                </div>

                {/* NUEVO: botón de previsualización si ya tenemos un id creado */}
                <div className="mt-3">
                    {createdId && (
                        <PreviewButton id={createdId} buildUrl={buildBannerV1PreviewUrl} />
                    )}
                </div>
            </form>
        </section>
    );
};

export default AddBannerV1;
