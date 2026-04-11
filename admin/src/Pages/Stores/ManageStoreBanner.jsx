// admin/src/Pages/Stores/ManageStoreBanner.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { IoMdClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../context/AppContext";
import { api } from "../../utils/api";
import UploadBox from "../../Components/UploadBox";
import { getTenantId } from "@/utils/tenant";

const isValidImgUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");

const pickUrl = (x) => {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    return (
      x.secure_url ||
      x.url ||
      x.location ||
      x.path ||
      x.logo ||
      x.banner ||
      ""
    );
  }
  return "";
};

export default function ManageStoreBanner() {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  // tenant actual (tienda activa)
  const tenantId = getTenantId() || "";

  const [storeName, setStoreName] = useState("");
  const [previews, setPreviews] = useState([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);

  // headers para apuntar SIEMPRE a la tienda actual cuando haga falta
  const headers = useMemo(
    () => (tenantId ? { "X-Store-Id": String(tenantId) } : {}),
    [tenantId]
  );

  // ========= Cargar datos actuales de la tienda (banner existente) =========
  useEffect(() => {
    if (!tenantId) {
      setLoadingStore(false);
      return;
    }

    let mounted = true;

    (async () => {
      setLoadingStore(true);
      try {
        // Ruta ligera que ya usamos en MyStore
        const resp = await api.get(`/api/store/by-id/${tenantId}`, {
          params: { _ts: Date.now() },
          timeout: 12000,
        });

        const store =
          resp?.data?.row ||
          resp?.data?.store ||
          resp?.data?.data ||
          resp?.data ||
          null;

        if (!mounted || !store) {
          setLoadingStore(false);
          return;
        }

        setStoreName(store.name || store.displayName || store.slug || "");

        const currentBanner =
          store?.settings?.bannerUrl ||
          store?.branding?.banner ||
          store?.bannerUrl ||
          "";

        if (isValidImgUrl(currentBanner)) {
          setBannerUrl(currentBanner);
          setPreviews([currentBanner]);
        }
      } catch (e) {
        console.error("[ManageStoreBanner] error cargando tienda:", e);
      } finally {
        if (mounted) setLoadingStore(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tenantId]);

  // ========= Uploader → normalizar SIEMPRE a string URL =========
  const setPreviewsFun = (previewsArr = []) => {
    const imgArr = (Array.isArray(previewsArr) ? previewsArr : [])
      .map(pickUrl)
      .filter(isValidImgUrl);

    const firstUrl = imgArr[0] || "";
    setPreviews(imgArr);
    setBannerUrl(firstUrl);
  };

  const removeImg = (image, index) => {
    const next = previews.filter((_, i) => i !== index);
    const firstUrl = next[0] || "";
    setPreviews(next);
    setBannerUrl(firstUrl);
  };

  // ========= Guardar banner en la tienda =========
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!tenantId) {
      context?.alertBox?.("error", "No hay tienda activa.");
      return;
    }

    if (!isValidImgUrl(bannerUrl)) {
      context?.alertBox?.("error", "Por favor selecciona un banner válido.");
      return;
    }

    setIsLoading(true);
    try {
      // 🔁 Nueva ruta: PATCH /api/store/:id/banner
      await api.patch(
        `/api/store/${tenantId}/banner`,
        { bannerUrl },
        {
          headers,
          withCredentials: true,
          timeout: 15000,
        }
      );

      context?.alertBox?.(
        "success",
        "Banner de la tienda actualizado correctamente"
      );

      // Aviso opcional a otras vistas (MyStore) para refrescar en caliente
      try {
        window.dispatchEvent(
          new CustomEvent("store:banner-updated", {
            detail: { storeId: tenantId, bannerUrl },
          })
        );
      } catch { }

      // Volver a Mi Tienda después de guardar
      setTimeout(() => navigate("/admin/my-store"), 800);
    } catch (err) {
      console.error("[ManageStoreBanner] error guardando banner:", err);
      context?.alertBox?.(
        "error",
        "No se pudo guardar el banner de la tienda"
      );
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  if (loadingStore) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Cargando información de la tienda…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-2 py-0 mt-3">
        <h2 className="text-[18px] font-[600]">
          Administrar banner de mi tienda
          {storeName ? ` – ${storeName}` : ""}
        </h2>
      </div>

      <form className="form py-1 md:p-3 md:py-1" onSubmit={onSubmit}>
        <div className="card my-4 pt-5 pb-5 shadow-md sm:rounded-lg bg-white w-[100%] sm:w-[100%] lg:w-[80%] p-5">
          {/* Previsualización actual */}
          {previews.length > 0 &&
            previews.map((image, idx) => (
              <div
                className="uploadBoxWrapper w-[280px] mr-3 relative"
                key={idx}
              >
                <span
                  className="absolute w-[24px] h-[24px] rounded-full overflow-hidden bg-red-700 -top-[6px] -right-[6px] flex items-center justify-center z-50 cursor-pointer"
                  onClick={() => removeImg(image, idx)}
                  title="Eliminar"
                >
                  <IoMdClose className="text-white text-[17px]" />
                </span>

                <div className="uploadBox p-0 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[180px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center">
                  <img
                    src={image}
                    alt="Banner tienda"
                    className="max-w-full max-h-full object-cover"
                  />
                </div>
              </div>
            ))}

          {/* Uploader cuando no hay banner */}
          {previews.length === 0 && (
            <div className="w-[280px]">
              <UploadBox
                multiple={false}
                name="images"
                url="/api/logo/uploadImages"
                setPreviewsFun={setPreviewsFun}
                headers={headers}
                withCredentials
              />
            </div>
          )}

          <br />

          <Button
            type="submit"
            className="btn-blue btn-lg w-full flex gap-2"
            disabled={!tenantId || isLoading || !bannerUrl}
          >
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
