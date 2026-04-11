import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../utils/api";

/**
 * useCurrentStore
 * Retorna la tienda activa según el storeId en localStorage.
 * Incluye categoryId para filtrar CategoryCascade.
 */
export default function useCurrentStore() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storeId = localStorage.getItem("X-Store-Id");
    if (!storeId) {
      setLoading(false);
      return;
    }

    fetchDataFromApi(`/api/store/by-id/${storeId}`)
      .then((res) => {
        setStore(res?.row || res?.data || res || null);
      })
      .catch((err) => {
        console.error("useCurrentStore:", err);
        setError(err);
        // Si la tienda no existe (404), limpiar storeId stale
        if (err?.response?.status === 404 || err?.status === 404) {
          try {
            localStorage.removeItem("X-Store-Id");
          } catch (_) { /* ignore */ }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { store, loading, error };
}
