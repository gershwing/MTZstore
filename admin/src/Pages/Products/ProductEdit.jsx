import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import { api, editData } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import useCurrentStore from "../../hooks/useCurrentStore";

/**
 * ProductEdit
 * ---------------------------------------------------
 * Página para editar producto existente
 */
export default function ProductEdit({ id: propId, onSuccess }) {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const { isSuper } = useAuth();
  const { store } = useCurrentStore();

  /* ======================================================
     CARGAR PRODUCTO
  ====================================================== */
  useEffect(() => {
    if (!id) return;
    setInitialData(null);
    api.get(`/api/product/${id}`, {
      params: { _ts: Date.now() },
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    }).then((res) => {
      const body = res?.data;
      // res.ok() wraps as { success, data: { product, variants } }
      const payload = body?.data || body;
      console.log("[ProductEdit] loaded:", { attributes: payload?.product?.attributes, variantsCount: payload?.variants?.length });
      if (payload?.product) {
        setInitialData({ ...payload.product, variants: payload.variants || [] });
      } else {
        setInitialData(payload);
      }
    }).catch((err) => {
      console.error("[ProductEdit] fetch error:", err);
      setInitialData({});
    });
  }, [id]);

  /* ======================================================
     UPDATE
  ====================================================== */
  const handleUpdate = async (payload) => {
    setLoading(true);
    try {
      await editData(`/api/product/${id}`, payload);
      alert("Producto actualizado correctamente");
      onSuccess ? onSuccess() : navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
        "Error al actualizar el producto"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return <p>Cargando producto...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ProductForm
        initialData={initialData}
        onSubmit={handleUpdate}
        loading={loading}
        isSuper={isSuper}
        storeCategoryId={isSuper ? null : (store?.categoryId?._id || store?.categoryId)}
        storeCurrency={store?.currency || "USD"}
        storeName={store?.name || ""}
        storeConfig={store?.config || {}}
        storeType={store?.config?.storeType || "IMPORTER"}
      />
    </div>
  );
}
