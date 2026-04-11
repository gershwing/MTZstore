// admin/src/components/StorePicker/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/utils/api";
import {
  getCurrentStoreId,
  setTenantId,                   // helper unificado para escribir tenant
  clearTenantId as _clearTenantId,
} from "@/utils/tenant";
import { useAuth } from "../../hooks/useAuth";

// fallback si utils/tenant no exporta clearTenantId
const clearTenant = typeof _clearTenantId === "function" ? _clearTenantId : () => {
  try { localStorage.removeItem("X-Store-Id"); } catch { }
  try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { id: null, storeId: null } })); } catch { }
  try { window.dispatchEvent(new CustomEvent("mtz:tenant-changed", { detail: { id: null, storeId: null } })); } catch { }
};

// 🚫 Helper no-cache central para estas lecturas (evita 304)
// ✅ Permitimos refresh (no bloqueamos con __noRetry401)
function noCacheOpts(extra = {}) {
  return {
    params: { _ts: Date.now(), ...(extra.params || {}) },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "application/json", ...(extra.headers || {}) },
    omitTenantHeader: true,
    __noTenant: true,
    // ⬇️ quita __noRetry401 para permitir refresh en estos GET “ligeros”
    ...(typeof extra.__noRetry401 === "boolean" ? {} : { __noRetry401: false }),
    timeout: 12000,
    ...extra,
  };
}

const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

export default function StorePicker({
  className = "",
  onChange,
  value: controlledValue,          // modo controlado (opcional)
  allowClear = true,
  label = "Tienda activa",
  hideForSuper = true,
}) {
  // safeAuth evita romper si el hook no existe en algún render
  const auth = (function safeAuth() {
    try { return typeof useAuth === "function" ? useAuth() : null; } catch { return null; }
  })();

  const user = auth?.user || auth?.me || null;

  // ¿Es SUPER_ADMIN (o super de plataforma)?
  const isSuper = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    return Boolean(user?.isSuper) || roles.includes("SUPER_ADMIN") || user?.role === "SUPER_ADMIN" || Boolean(user?.isPlatformSuperAdmin);
  }, [user]);

  // SUPER_ADMIN ya no se oculta — necesita elegir la tienda oficial de plataforma

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Valor interno si NO es controlado (podría venir un slug viejo)
  const [innerValue, setInnerValue] = useState(auth?.activeStoreId ?? getCurrentStoreId() ?? "");
  const value = controlledValue !== undefined ? controlledValue : innerValue;

  // ---------- Carga de tiendas (plataforma, sin tenant) ----------
  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      setLoading(true);
      try {
        // 1) Intento principal (sin tenant) + anti-cache
        let res = await api.get("/api/store/stores/me", noCacheOpts());
        let list = res?.data?.data || res?.data?.stores || [];

        // SUPER_ADMIN: incluir tienda oficial de plataforma si no está en la lista
        if (isSuper) {
          try {
            const platRes = await api.get("/api/store", noCacheOpts({ params: { isPlatformStore: true } }));
            const platStores = platRes?.data?.data || platRes?.data?.stores || platRes?.data || [];
            const platList = Array.isArray(platStores) ? platStores : [];
            const existingIds = new Set((list || []).map((s) => String(s._id || s.id)));
            for (const ps of platList) {
              const psId = String(ps._id || ps.id);
              if (!existingIds.has(psId)) list.push(ps);
            }
          } catch { }
        }

        // 2) Fallback compat (sin tenant)
        if (!Array.isArray(list) || list.length === 0) {
          try {
            res = await api.get("/api/store", noCacheOpts({ params: { mine: 1 } }));
            list = res?.data?.data || res?.data?.stores || [];
          } catch { }
        }

        // 3) Fallback final desde memberships de /api/user/me (sin tenant)
        if (!Array.isArray(list) || list.length === 0) {
          try {
            const meRes = await api.get("/api/user/me", noCacheOpts());
            const u = meRes?.data?.data?.user || meRes?.data?.user || meRes?.data || meRes;
            const ms = Array.isArray(u?.memberships) ? u.memberships : [];
            list = ms
              .filter((m) => m?.storeId)
              .map((m) => ({ _id: m.storeId, name: m.storeName || m.storeId, slug: m.storeSlug || "" }));
          } catch { }
        }

        // Normaliza, de-duplica y ordena por nombre
        const norm = (Array.isArray(list) ? list : [])
          .map((s) => ({
            _id: s._id || s.id || s.storeId,
            slug: s.slug || s.storeSlug || "",
            name: s.name || s.slug || s.storeName || s.title || String(s._id || s.id || s.storeId || ""),
            isPlatformStore: Boolean(s.isPlatformStore),
          }))
          .filter((s) => s._id)
          .reduce((acc, s) => (acc.find((x) => String(x._id) === String(s._id)) ? acc : acc.concat(s)), [])
          // Tienda oficial primero, luego alfabético
          .sort((a, b) => {
            if (a.isPlatformStore && !b.isPlatformStore) return -1;
            if (!a.isPlatformStore && b.isPlatformStore) return 1;
            return String(a.name).localeCompare(String(b.name));
          });

        if (!mounted) return;
        setStores(norm);

        // -------- Normalización de tenant legado (slug → _id) --------
        // Si el value actual NO es ObjectId, intenta mapear contra slug o nombre
        const current = value;
        if (current && !isObjectId(String(current))) {
          const hit = norm.find(
            (s) =>
              String(s.slug || "").toLowerCase() === String(current).toLowerCase() ||
              String(s.name || "").toLowerCase() === String(current).toLowerCase()
          );
          if (hit) {
            const id = String(hit._id);
            if (controlledValue === undefined) setInnerValue(id);
            setTenantId(id);              // guarda _id (emite eventos)
            auth?.setActiveStoreId?.(id);
            onChange?.(id);
            return; // ya normalizamos; no seguir con auto-picks
          }
        }

        // ========= Auto-selección =========
        if (controlledValue === undefined && !value && norm.length > 0) {
          // A) No controlado: si no hay value y hay tiendas, escoger (prioriza defaultStoreId)
          let pick = null;
          try {
            const meRes = await api.get("/api/user/me", noCacheOpts());
            const def = meRes?.data?.data?.defaultStoreId || meRes?.data?.defaultStoreId || null;
            if (def && norm.some((s) => String(s._id) === String(def))) pick = String(def);
          } catch { }
          if (!pick) pick = String(norm[0]._id);

          setInnerValue(pick);
          setTenantId(pick);
          auth?.setActiveStoreId?.(pick);
          onChange?.(pick);
        } else if (controlledValue !== undefined && !controlledValue && norm.length > 0) {
          // B) Controlado: si el padre pasó value vacío, escoger y propagar
          let pick = null;
          try {
            const meRes = await api.get("/api/user/me", noCacheOpts());
            const def = meRes?.data?.data?.defaultStoreId || meRes?.data?.defaultStoreId || null;
            if (def && norm.some((s) => String(s._id) === String(def))) pick = String(def);
          } catch { }
          if (!pick) pick = String(norm[0]._id);

          setTenantId(pick);
          auth?.setActiveStoreId?.(pick);
          onChange?.(pick);
        } else if (!value) {
          // C) Si no hay tenant en LS pero user tiene defaultStoreId, fijarlo
          try {
            const meRes = await api.get("/api/user/me", noCacheOpts());
            const def = meRes?.data?.data?.defaultStoreId || meRes?.data?.defaultStoreId || null;
            if (def) {
              const defStr = String(def);
              setInnerValue(defStr);
              setTenantId(defStr);
              auth?.setActiveStoreId?.(defStr);
              onChange?.(defStr);
            }
          } catch { }
        }
      } catch {
        if (mounted) setStores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStores();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  // ---------- Sincroniza cambios externos de tenant (auth / eventos / cross-tab) ----------
  useEffect(() => {
    if (controlledValue === undefined && auth?.activeStoreId && auth.activeStoreId !== innerValue) {
      const nxt = String(auth.activeStoreId);
      setInnerValue(nxt);
      setTenantId(nxt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.activeStoreId, controlledValue]);

  useEffect(() => {
    const onChanged = (ev) => {
      const next = ev?.detail?.id ?? ev?.detail?.storeId ?? getCurrentStoreId() ?? "";
      if (controlledValue === undefined) setInnerValue(next || "");
    };
    try { window.addEventListener("tenant:changed", onChanged); } catch { }
    try { window.addEventListener("mtz:tenant-changed", onChanged); } catch { }

    const onStorage = (e) => {
      if (e?.key === "X-Store-Id") {
        const next = e.newValue || "";
        if (controlledValue === undefined) setInnerValue(next);
        onChange?.(next || null);
      }
    };
    try { window.addEventListener("storage", onStorage); } catch { }

    return () => {
      try { window.removeEventListener("tenant:changed", onChanged); } catch { }
      try { window.removeEventListener("mtz:tenant-changed", onChanged); } catch { }
      try { window.removeEventListener("storage", onStorage); } catch { }
    };
  }, [controlledValue, onChange]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const id = e?.target?.value || e?.value || e || "";
    if (id) {
      setTenantId(id);
      auth?.setActiveStoreId?.(id);
    } else {
      clearTenant();
      auth?.setActiveStoreId?.(null);
    }
    if (controlledValue === undefined) setInnerValue(id);
    onChange?.(id || null);
  };

  const handleClear = () => {
    clearTenant();
    auth?.setActiveStoreId?.(null);
    if (controlledValue === undefined) setInnerValue("");
    onChange?.(null);
  };

  // ---------- UI ----------
  return (
    <div className={`w-full ${className}`} title="Tienda activa">
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <select
          value={value || ""}
          onChange={handleChange}
          disabled={loading || stores.length === 0}
          className="w-full h-8 rounded-md border border-gray-300 px-3 bg-white text-sm"
        >
          {allowClear && (
            <option value="">
              {stores.length ? (loading ? "Cargando..." : "Seleccionar...") : "(Sin tienda)"}
            </option>
          )}
          {stores.map((s) => (
            <option key={s._id} value={String(s._id)}>
              {s.isPlatformStore ? `⭐ ${s.name} (Oficial)` : (s.name || s._id)}
            </option>
          ))}
        </select>

        {allowClear && (value || "") !== "" && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs underline"
            title="Limpiar tienda activa"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
