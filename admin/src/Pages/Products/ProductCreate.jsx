import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import { postData } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import useCurrentStore from "../../hooks/useCurrentStore";

/**
 * ProductCreate
 * ---------------------------------------------------
 * Página para crear producto base
 * Luego redirige a ProductDetails
 */
export default function ProductCreate({ onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isSuper } = useAuth();
  const { store } = useCurrentStore();

  const handleCreate = async (payload) => {
    setLoading(true);
    try {
      const res = await postData("/api/product", payload);

      // postData swallows errors — check for error response
      if (res?.error || res?.success === false) {
        console.error("Server validation details:", res?.details);
        const details = res?.details ? JSON.stringify(res.details, null, 2) : "";
        throw new Error(res?.message || `Error del servidor${details ? ": " + details : ""}`);
      }

      const product =
        res?.data?.data?.product ||
        res?.data?.product ||
        res?.data?.data ||
        res?.data ||
        null;

      if (!product?._id) {
        throw new Error("No se recibió el ID del producto");
      }

      // Producto creado — cerrar panel
      alert("Producto creado exitosamente");
      onSuccess ? onSuccess() : navigate("/admin/products");

    } catch (err) {
      console.error("422 response:", err?.response?.data);
      console.error(err);
      alert(
        err?.response?.data?.details
          ? `${err?.response?.data?.message}: ${JSON.stringify(err?.response?.data?.details)}`
          : err?.response?.data?.message || "Error al crear el producto"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ProductForm
        onSubmit={handleCreate}
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
