import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../utils/api";

/**
 * useCategoryAttributes
 * ---------------------------------------------------
 * Carga los atributos dinámicos de una categoría (heredados).
 * Consume: GET /api/categoryAttribute/categories/:categoryId/attributes
 *
 * Retorna:
 * - attributes: [{ _id, code, name, type, options, required, variant, affectsPrice, affectsStock }]
 * - loading: boolean
 * - error: string | null
 */
export function useCategoryAttributes(categoryId) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setAttributes([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDataFromApi(
      `/api/categoryAttribute/categories/${categoryId}/attributes`
    )
      .then((res) => {
        if (cancelled) return;

        const raw = res?.data?.attributes || res?.data || [];

        // Normalizar opciones: el backend devuelve options como [{label, value}]
        // pero AttributeInput espera strings simples en options
        const normalized = raw.map((attr) => ({
          ...attr,
          options: (attr.options || []).map((o) =>
            typeof o === "string" ? o : o.label || o.value || ""
          ),
          modelOptions: attr.modelOptions || null,
        }));

        setAttributes(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("useCategoryAttributes error:", err);
        setError(
          err?.response?.data?.message || "Error cargando atributos"
        );
        setAttributes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return { attributes, loading, error };
}
