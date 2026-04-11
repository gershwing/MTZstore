import { useState, useEffect, useCallback } from "react";
import { Tabs, Tab } from "@mui/material";
import { fetchDataFromApi } from "../../utils/api";
import * as inventoryService from "../../services/inventory";

const ACTION_LABELS = {
  ADJUST: "Ajuste",
  RESERVE: "Reserva",
  RELEASE: "Liberacion",
  MOVE: "Movimiento",
  RECEIVE: "Recepcion",
  DISPATCH: "Despacho",
};

const ACTION_COLORS = {
  RECEIVE: "bg-green-100 text-green-800",
  DISPATCH: "bg-blue-100 text-blue-800",
  ADJUST: "bg-yellow-100 text-yellow-800",
  RESERVE: "bg-orange-100 text-orange-800",
  RELEASE: "bg-purple-100 text-purple-800",
  MOVE: "bg-gray-100 text-gray-800",
};

export default function InventoryPage() {
  const [tab, setTab] = useState(0);

  // --- Tab Almacen: productos en stock ---
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSearch, setProdSearch] = useState("");

  // --- Tab Recepcionar ---
  const [receiveForm, setReceiveForm] = useState({ trackingCode: "", productSearch: "", productId: "", productName: "", qty: 1, notes: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [receiveLoading, setReceiveLoading] = useState(false);

  // --- Tab Movimientos ---
  const [movements, setMovements] = useState([]);
  const [movLoading, setMovLoading] = useState(false);
  const [movPage, setMovPage] = useState(1);
  const [movTotal, setMovTotal] = useState(0);

  // Cargar productos con stock
  const loadProducts = useCallback(async () => {
    setProdLoading(true);
    try {
      const qs = new URLSearchParams({ page: 1, limit: 50 });
      if (prodSearch) qs.set("q", prodSearch);
      const res = await fetchDataFromApi(`/api/product/getAllProducts?${qs}`);
      const list = res?.products || res?.data?.products || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    } finally {
      setProdLoading(false);
    }
  }, [prodSearch]);

  // Cargar movimientos
  const loadMovements = useCallback(async () => {
    setMovLoading(true);
    try {
      const qs = new URLSearchParams({ page: movPage, limit: 20 });
      const res = await fetchDataFromApi(`/api/inventory/movements?${qs}`);
      const data = res?.data || res;
      setMovements(data?.rows || []);
      setMovTotal(data?.total || 0);
    } catch {
      setMovements([]);
    } finally {
      setMovLoading(false);
    }
  }, [movPage]);

  useEffect(() => {
    if (tab === 0) loadProducts();
    if (tab === 2) loadMovements();
  }, [tab, loadProducts, loadMovements]);

  // Buscar productos para recepcionar
  const searchProductsForReceive = async (q) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetchDataFromApi(`/api/direct-sales/search-products?q=${encodeURIComponent(q)}`);
      setSearchResults(res?.products || []);
    } catch {
      setSearchResults([]);
    }
  };

  // Recepcionar producto
  const handleReceive = async () => {
    if (!receiveForm.productId || !receiveForm.trackingCode || receiveForm.qty < 1) {
      alert("Completa todos los campos: producto, guia y cantidad");
      return;
    }
    setReceiveLoading(true);
    try {
      const res = await inventoryService.receive({
        productId: receiveForm.productId,
        qty: Number(receiveForm.qty),
        trackingCode: receiveForm.trackingCode,
        notes: receiveForm.notes,
      });
      if (res?.error) throw new Error(res.message || "Error");
      alert("Producto recepcionado en almacen");
      setReceiveForm({ trackingCode: "", productSearch: "", productId: "", productName: "", qty: 1, notes: "" });
      setSearchResults([]);
    } catch (err) {
      alert(err?.message || "Error al recepcionar");
    } finally {
      setReceiveLoading(false);
    }
  };

  // Despachar producto
  const handleDispatch = async (product) => {
    const qty = prompt(`Cantidad a despachar de "${product.name}":`);
    if (!qty || isNaN(qty) || Number(qty) < 1) return;
    const tracking = prompt("Numero de guia (opcional):") || "";
    try {
      const res = await inventoryService.dispatch({
        productId: product._id,
        qty: Number(qty),
        trackingCode: tracking,
      });
      if (res?.error) throw new Error(res.message || "Error");
      alert("Producto despachado a delivery");
      loadProducts();
    } catch (err) {
      alert(err?.message || "Error al despachar");
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
      <h1 className="text-2xl font-bold">Almacen</h1>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label="Stock" />
        <Tab label="Recepcionar" />
        <Tab label="Movimientos" />
      </Tabs>

      {/* ========== TAB 0: STOCK ========== */}
      {tab === 0 && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <input
              value={prodSearch}
              onChange={(e) => setProdSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="border rounded px-3 py-2 text-sm flex-1 max-w-md"
            />
            <button onClick={loadProducts} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              Buscar
            </button>
          </div>

          {prodLoading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No hay productos.</p>
          ) : (
            <div className="bg-white border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Producto</th>
                    <th className="text-left p-3">Tienda</th>
                    <th className="text-center p-3">Stock</th>
                    <th className="text-center p-3">Min.</th>
                    <th className="text-left p-3">Envio</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600">{p.storeId?.name || "Plataforma"}</td>
                      <td className="p-3 text-center font-medium">{p.countInStock ?? 0}</td>
                      <td className="p-3 text-center text-gray-500">{p.stockMinimo ?? 0}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${p.shippedBy?.includes("MTZSTORE") ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                          {p.shippedBy || "STORE"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {p.shippedBy?.includes("MTZSTORE") && (
                          <button
                            onClick={() => handleDispatch(p)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Despachar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB 1: RECEPCIONAR ========== */}
      {tab === 1 && (
        <div className="max-w-xl space-y-4">
          <div className="bg-white border rounded-lg p-5 space-y-4">
            <h2 className="font-semibold">Recepcionar producto en almacen</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Numero de guia *</label>
              <input
                value={receiveForm.trackingCode}
                onChange={(e) => setReceiveForm((f) => ({ ...f, trackingCode: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: GUIA-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Buscar producto *</label>
              <input
                value={receiveForm.productSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setReceiveForm((f) => ({ ...f, productSearch: v, productId: "", productName: "" }));
                  searchProductsForReceive(v);
                }}
                className="w-full border rounded px-3 py-2"
                placeholder="Nombre o marca del producto..."
              />
              {searchResults.length > 0 && !receiveForm.productId && (
                <div className="border rounded mt-1 max-h-48 overflow-y-auto bg-white shadow">
                  {searchResults.map((p) => (
                    <div
                      key={p._id}
                      className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setReceiveForm((f) => ({ ...f, productId: p._id, productName: p.name, productSearch: p.name }));
                        setSearchResults([]);
                      }}
                    >
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {receiveForm.productId && (
                <p className="text-xs text-green-600 mt-1">Seleccionado: {receiveForm.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={receiveForm.qty}
                  onChange={(e) => setReceiveForm((f) => ({ ...f, qty: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <input
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Opcional..."
                />
              </div>
            </div>

            <button
              onClick={handleReceive}
              disabled={receiveLoading || !receiveForm.productId || !receiveForm.trackingCode}
              className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {receiveLoading ? "Recepcionando..." : "Recepcionar en almacen"}
            </button>
          </div>
        </div>
      )}

      {/* ========== TAB 2: MOVIMIENTOS ========== */}
      {tab === 2 && (
        <div className="space-y-3">
          {movLoading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : movements.length === 0 ? (
            <p className="text-gray-500">No hay movimientos registrados.</p>
          ) : (
            <>
              <div className="bg-white border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Accion</th>
                      <th className="text-center p-3">Cantidad</th>
                      <th className="text-left p-3">Origen</th>
                      <th className="text-left p-3">Destino</th>
                      <th className="text-left p-3">Referencia</th>
                      <th className="text-left p-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${ACTION_COLORS[m.action] || "bg-gray-100"}`}>
                            {ACTION_LABELS[m.action] || m.action}
                          </span>
                        </td>
                        <td className="p-3 text-center font-medium">{m.qty}</td>
                        <td className="p-3 text-xs text-gray-600">{m.locationFrom || "-"}</td>
                        <td className="p-3 text-xs text-gray-600">{m.locationTo || "-"}</td>
                        <td className="p-3 text-xs">{m.refId || "-"}</td>
                        <td className="p-3 text-xs text-gray-500">{m.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {movTotal > 20 && (
                <div className="flex justify-center gap-2">
                  <button
                    disabled={movPage <= 1}
                    onClick={() => setMovPage((p) => p - 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600 py-1">Pagina {movPage} de {Math.ceil(movTotal / 20)}</span>
                  <button
                    disabled={movPage >= Math.ceil(movTotal / 20)}
                    onClick={() => setMovPage((p) => p + 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
