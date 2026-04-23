import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Typography, Switch, FormControlLabel } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/utils/api";
import { getTenantId, setTenantId } from "@/utils/tenant";
import { usePlatformLogo, useStoreLogo } from "@/hooks/useLogo";

const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);
const isValidUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");

const COUNTRY_CODES = [
  { code: "+591", flag: "\u{1F1E7}\u{1F1F4}", name: "Bolivia" },
  { code: "+54", flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { code: "+55", flag: "\u{1F1E7}\u{1F1F7}", name: "Brasil" },
  { code: "+56", flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { code: "+57", flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { code: "+593", flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" },
  { code: "+51", flag: "\u{1F1F5}\u{1F1EA}", name: "Peru" },
  { code: "+595", flag: "\u{1F1F5}\u{1F1FE}", name: "Paraguay" },
  { code: "+598", flag: "\u{1F1FA}\u{1F1FE}", name: "Uruguay" },
  { code: "+58", flag: "\u{1F1FB}\u{1F1EA}", name: "Venezuela" },
  { code: "+52", flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico" },
  { code: "+1", flag: "\u{1F1FA}\u{1F1F8}", name: "Estados Unidos" },
  { code: "+34", flag: "\u{1F1EA}\u{1F1F8}", name: "Espana" },
];

const BOLIVIA_CITIES = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosi", "Sucre", "Tarija", "Trinidad", "Cobija",
];

function parsePhone(fullPhone) {
  if (!fullPhone) return { code: "+591", number: "" };
  const str = String(fullPhone).trim();
  for (const c of COUNTRY_CODES) {
    if (str.startsWith(c.code)) {
      return { code: c.code, number: str.slice(c.code.length).trim() };
    }
  }
  return { code: "+591", number: str.replace(/^\+?\d{1,3}\s*/, "") };
}

function noCacheOpts(extra = {}) {
  return {
    params: { _ts: Date.now(), ...(extra.params || {}) },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache", ...(extra.headers || {}) },
    omitTenantHeader: true,
    __noTenant: true,
    ...extra,
  };
}

export default function MyStore() {
  const navigate = useNavigate();
  const location = useLocation();

  const sidFromUrl =
    new URLSearchParams(location.search).get("sid") ||
    (location.state && location.state.storeId) ||
    null;

  const [storeId, setStoreId] = useState(sidFromUrl || getTenantId() || "");
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulario editable
  const [form, setForm] = useState({ name: "", description: "", email: "", phoneCode: "+591", phoneNumber: "", city: "", street: "", wholesaleEnabled: false, categoryId: "", deliveryExpressMode: "open", deliveryStandardMode: "partners_only" });
  const [level2Categories, setLevel2Categories] = useState([]);

  const platformLogo = usePlatformLogo();

  // Cargar categorias de nivel 2 para selector de rubro
  useEffect(() => {
    api.get("/api/category")
      .then((r) => {
        const tree = Array.isArray(r?.data?.category) ? r.data.category : (r?.data?.data || []);
        const subs = [];
        tree.forEach((parent) => {
          if (Array.isArray(parent.children)) {
            parent.children.forEach((child) => {
              subs.push({ ...child, _parentName: parent.name || parent.title });
            });
          }
        });
        setLevel2Categories(subs);
      })
      .catch(() => setLevel2Categories([]));
  }, []);

  // Escuchar cambios de tenant
  useEffect(() => {
    const onTenantChanged = (ev) => {
      const next = ev?.detail?.id ?? ev?.detail?.storeId ?? getTenantId();
      setStoreId(next || "");
    };
    window.addEventListener("mtz:tenant-changed", onTenantChanged);
    window.addEventListener("tenant:changed", onTenantChanged);
    return () => {
      window.removeEventListener("mtz:tenant-changed", onTenantChanged);
      window.removeEventListener("tenant:changed", onTenantChanged);
    };
  }, []);

  useEffect(() => {
    if (sidFromUrl && sidFromUrl !== storeId) {
      setStoreId(sidFromUrl);
      setTenantId(sidFromUrl);
    }
  }, [sidFromUrl]);

  async function resolveStoreId(sid) {
    if (!sid) return "";
    if (isObjectId(sid)) return sid;
    try {
      const res = await api.get("/api/store/stores/me", noCacheOpts());
      const list = res?.data?.data || res?.data?.stores || [];
      const hit = (list || []).find(
        (s) => String(s.slug || "").toLowerCase() === String(sid).toLowerCase() || String(s._id || s.id) === String(sid)
      );
      const resolved = hit?._id || hit?.id || "";
      if (resolved && isObjectId(String(resolved))) {
        setTenantId(String(resolved));
        setStoreId(String(resolved));
        return String(resolved);
      }
    } catch { /* noop */ }
    return sid;
  }

  // Cargar tienda
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      let userEmail = "";
      try {
        let sid = storeId || getTenantId();
        // Obtener datos del usuario (email como fallback + defaultStoreId)
        try {
          const me = await api.get("/api/user/me", noCacheOpts({ __noRetry401: true, timeout: 8000 }));
          const meData = me?.data?.user || me?.data?.data || me?.data || {};
          userEmail = meData.email || "";
          if (!sid) {
            const ds = meData.defaultStoreId;
            if (ds) { setTenantId(ds); sid = ds; if (mounted) setStoreId(ds); }
          }
        } catch { /* noop */ }

        if (sid && !isObjectId(sid)) sid = await resolveStoreId(sid);
        if (!sid || !isObjectId(String(sid))) { if (mounted) setStore(null); return; }

        const st = await api.get(`/api/store/by-id/${sid}`, { timeout: 8000 });
        const storeData = st?.data?.row || null;
        if (mounted && storeData) {
          setStore(storeData);
          const parsed = parsePhone(storeData.phone);
          setForm({
            name: storeData.name || "",
            description: storeData.description || storeData.about || "",
            email: storeData.email || userEmail || "",
            phoneCode: parsed.code,
            phoneNumber: parsed.number,
            city: storeData.address?.city || "",
            street: storeData.address?.street || "",
            wholesaleEnabled: storeData.config?.wholesaleEnabled || false,
            categoryId: storeData.categoryId?._id || storeData.categoryId || "",
            deliveryExpressMode: storeData.delivery?.expressMode || "open",
            deliveryStandardMode: storeData.delivery?.standardMode || "partners_only",
          });
        }
      } catch {
        if (mounted) setStore(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [storeId]);

  // Guardar cambios
  const handleSave = async () => {
    if (!store?._id) return;
    setSaving(true);
    try {
      const fullPhone = form.phoneNumber ? `${form.phoneCode} ${form.phoneNumber}` : "";
      await api.put(`/api/store/${store._id}`, {
        name: form.name,
        description: form.description,
        email: form.email,
        phone: fullPhone,
        address: {
          ...(store.address || {}),
          city: form.city,
          street: form.street,
        },
        config: {
          ...(store.config || {}),
          wholesaleEnabled: form.wholesaleEnabled,
        },
        delivery: {
          ...(store.delivery || {}),
          expressMode: form.deliveryExpressMode,
          standardMode: form.deliveryStandardMode,
        },
        ...(form.categoryId ? { categoryId: form.categoryId } : {}),
      }, { headers: { "X-Store-Id": String(store._id) } });
      alert("Tienda actualizada correctamente");
      setStore((prev) => {
        if (!prev) return prev;
        const catObj = form.categoryId ? level2Categories.find((c) => String(c._id) === String(form.categoryId)) : null;
        return {
          ...prev,
          name: form.name,
          description: form.description,
          email: form.email,
          phone: fullPhone,
          address: { ...(prev.address || {}), city: form.city, street: form.street },
          config: { ...(prev.config || {}), wholesaleEnabled: form.wholesaleEnabled },
          delivery: { ...(prev.delivery || {}), expressMode: form.deliveryExpressMode, standardMode: form.deliveryStandardMode },
          categoryId: catObj ? { _id: catObj._id, name: catObj.name, slug: catObj.slug } : prev.categoryId,
        };
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Logos
  const storeLogoUrl = useStoreLogo(store?._id);
  const [storeLogoLive, setStoreLogoLive] = useState("");
  useEffect(() => {
    const onLogoUpdated = (ev) => {
      const { url, logo, storeId: evStoreId } = ev?.detail || {};
      if (!store?._id || String(evStoreId) !== String(store._id)) return;
      if (isValidUrl(url || logo)) setStoreLogoLive(url || logo || "");
    };
    window.addEventListener("logo:updated", onLogoUpdated);
    return () => window.removeEventListener("logo:updated", onLogoUpdated);
  }, [store?._id]);

  if (loading) {
    return <Box p={2}><Typography>Cargando tienda...</Typography></Box>;
  }

  if (!store) {
    return (
      <Box p={2}>
        <Typography variant="body1" sx={{ mb: 1 }}>No se encontro tu tienda activa.</Typography>
        <Typography variant="body2" color="text.secondary">Elige una tienda desde el selector "Tienda activa" del encabezado.</Typography>
      </Box>
    );
  }

  const storeBanner = store?.settings?.bannerUrl || store?.branding?.banner || store?.bannerUrl || "";
  const logo = isValidUrl(storeLogoLive) ? storeLogoLive : isValidUrl(storeLogoUrl) ? storeLogoUrl : isValidUrl(platformLogo) ? platformLogo : "/logo-placeholder.svg";
  const banner = isValidUrl(storeBanner) ? storeBanner : "/banner-placeholder.svg";

  return (
    <div className="p-4 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
      {/* Banner + Logo */}
      <Box sx={{ position: "relative", mb: 8 }}>
        <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <Box component="img" src={banner} alt="Banner" sx={{ width: "100%", height: 300, objectFit: "cover", display: "block" }} />
          <IconButton
            size="small"
            onClick={() => navigate("/admin/my-store/banner")}
            sx={{ position: "absolute", right: 12, bottom: 12, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ position: "absolute", left: 32, bottom: -40, width: 120, height: 120, borderRadius: "50%", border: "4px solid #fff", overflow: "hidden", bgcolor: "#fff", boxShadow: 1 }}>
          <Box component="img" src={logo} alt="Logo" sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }} onError={(e) => { e.currentTarget.src = "/logo-placeholder.svg"; }} />
          <IconButton
            size="small"
            onClick={() => navigate("/admin/logo/manage?scope=store")}
            sx={{ position: "absolute", right: 12, bottom: 8, zIndex: 2, bgcolor: "rgba(0,0,0,0.65)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.85)" } }}
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Información de la tienda - editable */}
      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Informacion de la tienda</h2>
          <button
            onClick={() => navigate("/admin/products")}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            + Agregar producto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la tienda *</label>
            <input
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Nombre de tu tienda"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email de contacto</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="tienda@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefono</label>
            <div className="flex">
              <select
                value={form.phoneCode}
                onChange={(e) => updateForm("phoneCode", e.target.value)}
                className="border rounded-l px-2 py-2 text-sm bg-gray-50 border-r-0 w-[130px] shrink-0"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                value={form.phoneNumber}
                onChange={(e) => updateForm("phoneNumber", e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full border rounded-r px-3 py-2 text-sm"
                placeholder="7XXXXXXX"
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad</label>
            <select
              value={form.city}
              onChange={(e) => updateForm("city", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Seleccionar ciudad...</option>
              {BOLIVIA_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Direccion</label>
            <input
              value={form.street}
              onChange={(e) => updateForm("street", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Calle, numero, zona..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripcion de la tienda</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Cuenta a tus clientes sobre tu tienda, que vendes, tu historia..."
            />
          </div>
        </div>

        {/* Rubro / Categoria de la tienda */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Rubro de la tienda</h3>
          {store.categoryId?.name ? (
            <p className="text-sm text-gray-600 bg-gray-50 border rounded px-3 py-2">
              {store.categoryId.name}
            </p>
          ) : (
            <div>
              {!form.categoryId && (
                <p className="text-xs text-amber-600 mb-2">Tu tienda no tiene un rubro asignado. Selecciona uno para poder crear productos correctamente.</p>
              )}
              <select
                value={form.categoryId}
                onChange={(e) => updateForm("categoryId", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Seleccionar rubro...</option>
                {level2Categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c._parentName ? `${c._parentName} > ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Configuracion de ventas */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Configuracion de ventas</h3>
          <FormControlLabel
            control={
              <Switch
                checked={form.wholesaleEnabled}
                onChange={(e) => updateForm("wholesaleEnabled", e.target.checked)}
              />
            }
            label={
              <div>
                <span className="text-sm font-medium">Habilitar precios mayoristas</span>
                <p className="text-xs text-gray-500">Permite definir precios mayoristas en productos y seleccionarlos en ventas rapidas.</p>
              </div>
            }
          />
        </div>

        {/* Configuracion de entrega */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Configuracion de entrega</h3>
          <p className="text-xs text-gray-500 mb-3">Define quien puede repartir tus pedidos. "Abierto" permite que cualquier repartidor aprobado tome tus envios. "Solo socios" restringe a repartidores que hayas aprobado como socios.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modo Express</label>
              <select
                value={form.deliveryExpressMode}
                onChange={(e) => updateForm("deliveryExpressMode", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="open">Abierto a todos</option>
                <option value="partners_only">Solo socios</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Entregas rapidas (1-2 dias) por moto o bicicleta.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modo Estandar</label>
              <select
                value={form.deliveryStandardMode}
                onChange={(e) => updateForm("deliveryStandardMode", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="open">Abierto a todos</option>
                <option value="partners_only">Solo socios</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Entregas programadas (3-5 dias) con mayor volumen.</p>
            </div>
          </div>

          {form.deliveryStandardMode === "open" && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
              Los envios estandar suelen transportar articulos de mayor valor. Considera usar modo "Solo socios" para mayor seguridad.
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={() => navigate("/admin/store-partnerships")}
              className="text-blue-600 text-xs hover:underline"
            >
              Gestionar socios de delivery →
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="bg-green-600 text-white rounded px-6 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
