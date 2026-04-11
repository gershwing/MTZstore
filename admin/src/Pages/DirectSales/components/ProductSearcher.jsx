import { useState, useEffect } from "react";
import { fetchDataFromApi } from "../../../utils/api";

const r = (n) => Number(n || 0).toFixed(2);

export default function ProductSearcher({ onAddProduct, bobPerUsd, wholesaleEnabled = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Convierte a Bs respetando la moneda del producto
  const displayBs = (price, currency) => {
    if (currency === "BOB") return `Bs. ${r(price)}`;
    return `Bs. ${r(Number(price || 0) * (bobPerUsd || 1))}`;
  };

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchDataFromApi(`/api/direct-sales/search-products?q=${encodeURIComponent(query)}`);
        setResults(res?.products || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = (product, variant = null) => {
    onAddProduct(product, variant);
    setQuery("");
    setResults([]);
    setExpandedId(null);
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Buscar por nombre o marca..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {loading && <p className="text-sm text-gray-400 text-center">Buscando...</p>}
      {results.length > 0 && (
        <div className="max-h-80 overflow-y-auto space-y-1 border rounded p-2">
          {results.map((p) => {
            const cur = p.baseCurrency || "USD";
            return (
              <div key={p._id} className="border-b last:border-0">
                <div
                  className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer"
                  onClick={() => {
                    if (p.variants?.length > 0) {
                      setExpandedId(expandedId === p._id ? null : p._id);
                    } else {
                      handleAdd(p);
                    }
                  }}
                >
                  {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.brand || ""}</p>
                    {p.variants?.length > 0 && (
                      <p className="text-xs text-blue-600">{p.variants.length} variantes disponibles</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold">{displayBs(p.basePrice, cur)}</p>
                    {wholesaleEnabled && p.wholesalePrice > 0 && <p className="text-xs text-gray-500">May: {displayBs(p.wholesalePrice, cur)}</p>}
                    <span className={`text-xs ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>

                {expandedId === p._id && p.variants?.length > 0 && (
                  <div className="pl-14 pb-2 space-y-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Selecciona variante:</p>
                    {p.variants.map((v) => {
                      const attrLabel = v.attributes
                        ? Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(" | ")
                        : v.sku || "Variante";
                      return (
                        <div
                          key={v._id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleAdd(p, v)}
                        >
                          {(v.image || p.image) && (
                            <img src={v.image || p.image} alt="" className="w-10 h-10 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{attrLabel}</span>
                            {v.sku && <span className="text-xs text-gray-400 ml-2">SKU: {v.sku}</span>}
                          </div>
                          <div className="text-right text-sm">
                            <span className="font-bold">{displayBs(v.price || p.basePrice, cur)}</span>
                            {wholesaleEnabled && v.wholesalePrice > 0 && (
                              <div className="text-xs text-gray-500">May: {displayBs(v.wholesalePrice, cur)}</div>
                            )}
                            <span className={`text-xs ${v.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                              Stock: {v.stock}
                            </span>
                          </div>
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
      {query.length >= 2 && !loading && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">Sin resultados para "{query}"</p>
      )}
    </div>
  );
}
