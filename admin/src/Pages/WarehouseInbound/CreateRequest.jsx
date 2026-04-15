import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { fetchDataFromApi } from "../../utils/api";
import { createRequest } from "../../services/warehouseInbound";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function CreateWarehouseInboundRequest() {
  const navigate = useNavigate();
  const { me } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  // Map of productId -> { selected, quantity, variants: { variantId: quantity } }
  const [selections, setSelections] = useState({});

  // Fetch store products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetchDataFromApi("/api/product/getAllProducts", { withCredentials: true });
        const list = Array.isArray(res?.products)
          ? res.products
          : Array.isArray(res?.data?.products)
          ? res.data.products
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setProducts(list);
      } catch (e) {
        console.error("Error fetching products:", e);
        toast.error("Error al cargar productos");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleProduct = (productId) => {
    setSelections((prev) => {
      const existing = prev[productId];
      if (existing?.selected) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: { selected: true, quantity: 1, variants: {} } };
    });
  };

  const setProductQty = (productId, qty) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: Math.max(1, Number(qty) || 1) },
    }));
  };

  const setVariantQty = (productId, variantId, qty) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        variants: {
          ...(prev[productId]?.variants || {}),
          [variantId]: Math.max(0, Number(qty) || 0),
        },
      },
    }));
  };

  const hasVariants = (product) => {
    const v = product?.variants || product?.productVariants || [];
    return Array.isArray(v) && v.length > 0;
  };

  const getVariants = (product) => {
    return product?.variants || product?.productVariants || [];
  };

  // Build line items from selections
  const buildLineItems = () => {
    const items = [];
    for (const [productId, sel] of Object.entries(selections)) {
      if (!sel.selected) continue;
      const product = products.find((p) => (p._id || p.id) === productId);
      if (!product) continue;

      if (hasVariants(product)) {
        const variants = getVariants(product);
        for (const [variantId, qty] of Object.entries(sel.variants || {})) {
          if (qty <= 0) continue;
          const variant = variants.find((v) => (v._id || v.id) === variantId);
          items.push({
            productId,
            productName: product.name,
            variantId,
            variantName: variant
              ? variant.name || variant.label || Object.values(variant.attributes || {}).join(" / ")
              : variantId,
            sku: variant?.sku || product.sku || "",
            quantity: qty,
          });
        }
      } else {
        if (sel.quantity <= 0) continue;
        items.push({
          productId,
          productName: product.name,
          sku: product.sku || "",
          quantity: sel.quantity,
        });
      }
    }
    return items;
  };

  const selectedCount = Object.values(selections).filter((s) => s.selected).length;

  const handleSubmit = async () => {
    const items = buildLineItems();
    if (items.length === 0) {
      toast.warn("Selecciona al menos un producto con cantidad mayor a 0.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { items, notes: notes.trim() || undefined };
      const res = await createRequest(payload);

      if (res?.error) {
        toast.error(res?.message || "Error al crear la solicitud.");
        return;
      }

      toast.success("Solicitud creada exitosamente.");
      navigate("/admin/warehouse-inbound");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al crear la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nueva Solicitud de Envio al Almacen</h1>
        <button
          onClick={() => navigate("/admin/warehouse-inbound")}
          className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {/* Buscar productos */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-sm">Seleccionar productos</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre, SKU o marca..."
          className="border rounded px-3 py-1.5 text-sm w-full"
        />

        {loadingProducts ? (
          <p className="text-center text-gray-500 py-4">Cargando productos...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No se encontraron productos</p>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredProducts.map((product) => {
              const pid = product._id || product.id;
              const sel = selections[pid];
              const isSelected = !!sel?.selected;
              const prodHasVariants = hasVariants(product);
              const variants = getVariants(product);

              return (
                <div
                  key={pid}
                  className={`border rounded-lg p-3 transition-colors ${
                    isSelected ? "border-blue-400 bg-blue-50/30" : "border-gray-200"
                  }`}
                >
                  {/* Product row */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(pid)}
                      className="w-4 h-4 shrink-0"
                    />
                    {/* Thumbnail */}
                    {(product.images?.[0] || product.image) && (
                      <img
                        src={product.images?.[0] || product.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded border shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {product.sku && <span>SKU: {product.sku}</span>}
                        {product.brand && <span>Marca: {product.brand}</span>}
                        {product.countInStock != null && <span>Stock: {product.countInStock}</span>}
                      </div>
                    </div>

                    {/* Quantity (only for non-variant products) */}
                    {isSelected && !prodHasVariants && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-xs text-gray-500">Cantidad:</label>
                        <input
                          type="number"
                          min={1}
                          value={sel?.quantity || 1}
                          onChange={(e) => setProductQty(pid, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-20 text-center"
                        />
                      </div>
                    )}
                  </div>

                  {/* Variants */}
                  {isSelected && prodHasVariants && variants.length > 0 && (
                    <div className="mt-2 ml-7 space-y-1">
                      <p className="text-xs font-medium text-gray-600 mb-1">Variantes:</p>
                      {variants.map((v) => {
                        const vid = v._id || v.id;
                        const variantLabel =
                          v.name ||
                          v.label ||
                          Object.values(v.attributes || {}).join(" / ") ||
                          vid;

                        return (
                          <div key={vid} className="flex items-center gap-2 text-sm">
                            <span className="flex-1 text-gray-700 truncate">{variantLabel}</span>
                            {v.sku && <span className="text-xs text-gray-400">SKU: {v.sku}</span>}
                            <input
                              type="number"
                              min={0}
                              value={sel?.variants?.[vid] || 0}
                              onChange={(e) => setVariantQty(pid, vid, e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-20 text-center"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border rounded-lg p-4 space-y-2">
        <label className="block text-sm font-medium">Notas (opcional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Instrucciones especiales, detalles de empaque, etc."
        />
      </div>

      {/* Submit */}
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selectedCount} producto{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedCount === 0}
          className="bg-blue-600 text-white rounded px-6 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
}
