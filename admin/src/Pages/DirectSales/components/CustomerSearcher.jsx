import { useState, useEffect } from "react";
import { fetchDataFromApi, postData } from "../../../utils/api";

export default function CustomerSearcher({ selected, onSelect, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("search"); // "search" | "create"
  const [form, setForm] = useState({ nombre: "", email: "", phone: "", document: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "search" || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchDataFromApi(`/api/contacts/search?q=${encodeURIComponent(query)}`);
        setResults(res?.results || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, mode]);

  const handleSelect = async (result) => {
    try {
      const res = await postData("/api/contacts/resolve", { id: result._id, source: result.source });
      if (res?.error) { alert(res.message); return; }
      onSelect({
        contactId: res?.contactId || res?.data?.contactId,
        userId: res?.userId || res?.data?.userId || null,
        nombre: result.nombre,
        email: result.email,
        phone: result.phone,
        document: result.document || "",
        badge: result.badge,
        source: result.source,
      });
      setQuery("");
      setResults([]);
    } catch {
      alert("Error al seleccionar cliente");
    }
  };

  const handleCreate = async () => {
    if (!form.nombre.trim()) { alert("Nombre es obligatorio"); return; }
    setSaving(true);
    try {
      const res = await postData("/api/contacts", form);
      const contact = res?.contact || res?.data?.contact;
      if (!contact) { alert(res?.message || "Error al crear"); return; }
      onSelect({
        contactId: contact._id,
        userId: null,
        nombre: contact.nombre,
        email: contact.email || "",
        phone: contact.phone || "",
        document: contact.document || "",
        badge: "Nuevo",
        source: "CONTACT",
      });
      setMode("search");
      setForm({ nombre: "", email: "", phone: "", document: "" });
    } catch {
      alert("Error al crear cliente");
    } finally {
      setSaving(false);
    }
  };

  // Cliente seleccionado → mostrar resumen
  if (selected) {
    return (
      <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{selected.nombre}</p>
          <p className="text-xs text-gray-500">
            {selected.email}{selected.document ? ` | CI: ${selected.document}` : ""}{selected.phone ? ` | Tel: ${selected.phone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${selected.source === "USER" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
            {selected.badge}
          </span>
          <button onClick={onClear} className="text-xs text-red-500 hover:underline">Cambiar</button>
        </div>
      </div>
    );
  }

  // Modo CREAR
  if (mode === "create") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Nuevo cliente</p>
          <button onClick={() => setMode("search")} className="text-xs text-blue-600 hover:underline">Volver a buscar</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded px-3 py-2 text-sm col-span-2" placeholder="Nombre completo *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
          <input className="border rounded px-3 py-2 text-sm" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm" placeholder="CI / NIT" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm col-span-2" placeholder="Email (opcional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <button
          onClick={handleCreate}
          disabled={saving || !form.nombre.trim()}
          className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar y seleccionar"}
        </button>
      </div>
    );
  }

  // Modo BUSCAR
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Buscar cliente: nombre, email, CI/NIT, teléfono..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={() => setMode("create")}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
        >
          + Nuevo
        </button>
      </div>

      {loading && <p className="text-xs text-gray-400 text-center">Buscando...</p>}

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto border rounded p-1 space-y-1">
          {results.map((r) => (
            <div
              key={`${r.source}-${r._id}`}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                r.source === "USER" ? "bg-blue-50 hover:bg-blue-100" : "bg-green-50 hover:bg-green-100"
              }`}
              onClick={() => handleSelect(r)}
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{r.nombre}</p>
                <p className="text-xs text-gray-500">
                  {r.email}{r.document ? ` | CI: ${r.document}` : ""}{r.phone ? ` | Tel: ${r.phone}` : ""}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ml-2 whitespace-nowrap ${
                r.source === "USER" ? "bg-blue-200 text-blue-900" : "bg-green-200 text-green-900"
              }`}>
                {r.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-3">
          <p className="text-sm text-gray-500 mb-2">No se encontró "{query}"</p>
          <button
            onClick={() => { setForm({ ...form, nombre: query }); setMode("create"); }}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Crear nuevo cliente con ese nombre
          </button>
        </div>
      )}
    </div>
  );
}
