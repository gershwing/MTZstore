import React, { useState, useContext, useEffect, useMemo } from "react";
import { Button } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation } from "react-router-dom";

import { AppContext } from "../../context/AppContext";
import { fetchDataFromApi, postData, editData, deleteImages } from "../../utils/api";
import UploadBox from "../../Components/UploadBox";
import { getTenantId } from "@/utils/tenant";

const isValidImgUrl = (u) =>
    typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");
const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

const pickUrl = (x) => {
    if (typeof x === "string") return x;
    if (x && typeof x === "object") {
        return x.secure_url || x.url || x.location || x.path || x.logo || "";
    }
    return "";
};

const qsScope = (search) => {
    const q = new URLSearchParams(search);
    const s = (q.get("scope") || "").toLowerCase();
    return s === "store" ? "store" : "platform";
};

// 🔎 resuelve siempre a un ObjectId estable para clave/header
async function resolveStableStoreId(rawSid) {
    const sid = String(rawSid || "").trim();
    if (!sid) return "";
    if (isObjectId(sid)) return sid;
    try {
        const res = await fetchDataFromApi("/api/store/stores/me", {
            __public: false,
            omitTenantHeader: true,
            params: { _ts: Date.now() },
        });
        const list = res?.data || res?.stores || res || [];
        const hit =
            (list || []).find(
                (s) =>
                    String(s.slug || "").toLowerCase() === sid.toLowerCase() ||
                    String(s._id || s.id || s.storeId) === sid
            ) || null;
        const id = hit?._id || hit?.id || hit?.storeId || "";
        return isObjectId(String(id)) ? String(id) : sid;
    } catch {
        return sid;
    }
}

export default function ManageLogo() {
    const location = useLocation();
    const context = useContext(AppContext);

    const tenantIdRaw = getTenantId() || "";
    const [stableStoreId, setStableStoreId] = useState("");

    // Ámbito (platform/store)
    const scope = useMemo(() => {
        const s = qsScope(location.search);
        if (tenantIdRaw && s === "store") return "store";
        return "platform";
    }, [location.search, tenantIdRaw]);

    // Resuelve y guarda un storeId ESTABLE (ObjectId) para claves y headers
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (scope !== "store") {
                setStableStoreId("");
                return;
            }
            const resolved = await resolveStableStoreId(tenantIdRaw);
            if (mounted) setStableStoreId(resolved || "");
        })();
        return () => {
            mounted = false;
        };
    }, [scope, tenantIdRaw]);

    const [formFields, setFormFields] = useState({ logo: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [logoId, setLogoId] = useState("");
    const [editMode, setEditMode] = useState(false);

    // ===== headers/opts por alcance (USAR stableStoreId) =====
    const headers = useMemo(() => {
        if (scope === "store" && stableStoreId) return { "X-Store-Id": stableStoreId };
        return {};
    }, [scope, stableStoreId]);

    const tenantOpts = useMemo(
        () => (scope === "store" ? { headers, omitTenantHeader: false } : { headers: {}, omitTenantHeader: true }),
        [scope, headers]
    );

    // ===== persistencia + broadcast por ALCANCE (USAR stableStoreId) =====
    const persistAndNotify = (url) => {
        try {
            if (scope === "store" && stableStoreId) {
                const k1 = `logo:store:${stableStoreId}`;
                const prev1 = localStorage.getItem(k1);
                if (prev1 !== (url || "")) localStorage.setItem(k1, url || "");

                // opcional: limpiar clave vieja si el tenant guardó slug antes
                const kLegacy = `logo:store:${tenantIdRaw}`;
                if (kLegacy !== k1) {
                    const legacyVal = localStorage.getItem(kLegacy);
                    if (legacyVal && legacyVal === (url || "")) {
                        localStorage.removeItem(kLegacy);
                    }
                }
            } else {
                const prevA = localStorage.getItem("logo:platform");
                const prevB = localStorage.getItem("logo"); // compat legacy
                if (prevA !== (url || "")) localStorage.setItem("logo:platform", url || "");
                if (prevB !== (url || "")) localStorage.setItem("logo", url || "");
            }
        } catch { }

        try {
            const detail =
                scope === "store"
                    ? { scope: "store", url: url || "", storeId: stableStoreId }
                    : { scope: "platform", url: url || "" };
            window.dispatchEvent(new CustomEvent("logo:updated", { detail }));
        } catch { }
    };

    // ===== carga inicial =====
    useEffect(() => {
        (async () => {
            // espera a tener stableStoreId cuando sea scope store
            if (scope === "store" && !stableStoreId) return;

            const tryAdmin = async () => {
                try {
                    const r = await fetchDataFromApi(`/api/logo/admin?_ts=${Date.now()}`, {
                        withCredentials: true,
                        ...tenantOpts,
                    });
                    return r;
                } catch {
                    return null;
                }
            };
            const tryPublic = async () => {
                try {
                    const r = await fetchDataFromApi(`/api/logo?_ts=${Date.now()}`, { ...tenantOpts });
                    return r;
                } catch {
                    return null;
                }
            };

            let res = await tryAdmin();
            if (!res) res = await tryPublic();

            const list = Array.isArray(res?.logo)
                ? res.logo
                : Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : [];

            const imgArr = [];
            for (let i = 0; i < (list?.length || 0); i++) {
                const url = pickUrl(list[i]?.logo ?? list[i]);
                if (isValidImgUrl(url)) imgArr.push(url);
            }

            const firstUrl = imgArr[0] || "";
            setEditMode(imgArr.length > 0);
            setLogoId(list?.[0]?._id || "");
            setPreviews(imgArr);
            setFormFields((prev) => ({ ...prev, logo: firstUrl }));

            if (isValidImgUrl(firstUrl)) {
                persistAndNotify(firstUrl);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, stableStoreId]);

    // Uploader → normalizar SIEMPRE a string URL
    const setPreviewsFun = (previewsArr = []) => {
        const imgArr = (Array.isArray(previewsArr) ? previewsArr : []).map(pickUrl).filter(isValidImgUrl);
        const firstUrl = imgArr[0] || "";
        setPreviews(imgArr);
        setFormFields((prev) => ({ ...prev, logo: firstUrl }));
    };

    const removeImg = async (image, index) => {
        try {
            await deleteImages(`/api/logo/delete-image?img=${encodeURIComponent(image)}`, {
                withCredentials: true,
                ...tenantOpts,
            });
            const next = previews.filter((_, i) => i !== index);
            const firstUrl = next[0] || "";
            setPreviews(next);
            setFormFields((prev) => ({ ...prev, logo: firstUrl }));
            persistAndNotify(firstUrl);
            context?.alertBox?.("success", "Imagen eliminada");
        } catch (e) {
            context?.alertBox?.("error", "No se pudo eliminar la imagen");
        }
    };

    const addLogo = async (e) => {
        e.preventDefault();
        if (previews.length === 0) {
            context?.alertBox?.("error", "Por favor selecciona el logo");
            return;
        }
        setIsLoading(true);

        try {
            if (editMode && logoId) {
                await editData(`/api/logo/${logoId}`, formFields, {
                    withCredentials: true,
                    ...tenantOpts,
                });
                context?.alertBox?.("success", "Logo actualizado correctamente");
            } else {
                const res = await postData(`/api/logo/add`, formFields, {
                    withCredentials: true,
                    ...tenantOpts,
                });
                setLogoId(res?.logo?._id || "");
                setEditMode(true);
                context?.alertBox?.("success", "Logo agregado correctamente");
            }
            persistAndNotify(formFields.logo || "");
        } finally {
            setTimeout(() => setIsLoading(false), 600);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">
                    {scope === "store" ? "Administrar logo de mi tienda" : "Administrar logo de la plataforma"}
                </h2>
            </div>

            <form className="form py-1 md:p-3 md:py-1" onSubmit={addLogo}>
                <div className="card my-4 pt-5 pb-5 shadow-md sm:rounded-lg bg-white w-[100%] sm:w-[100%] lg:w-[65%] p-5">
                    {previews.length > 0 &&
                        previews.map((image, idx) => (
                            <div className="uploadBoxWrapper w-[150px] mr-3 relative" key={idx}>
                                <span
                                    className="absolute w-[20px] h-[20px] rounded-full overflow-hidden bg-red-700 -top-[5px] -right-[5px] flex items-center justify-center z-50 cursor-pointer"
                                    onClick={() => removeImg(image, idx)}
                                    title="Eliminar"
                                >
                                    <IoMdClose className="text-white text-[17px]" />
                                </span>

                                <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center">
                                    <img src={image} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                            </div>
                        ))}

                    {previews.length === 0 && (
                        <div className="w-[150px]">
                            <UploadBox
                                multiple={false}
                                name="images"
                                url="/api/logo/uploadImages"
                                setPreviewsFun={setPreviewsFun}
                                headers={headers}           // ← usa X-Store-Id estable
                                withCredentials
                            />
                        </div>
                    )}

                    <br />

                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={scope === "store" && !stableStoreId}>
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
        </>
    );
}
