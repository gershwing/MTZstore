// admin/src/hooks/useLogo.js
import { useEffect, useState } from "react";
import { fetchDataFromApi } from "@/utils/api";
import { getTenantId } from "@/utils/tenant";

/* ===================== helpers ===================== */
const isValidUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");
const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

/* ---- dedup + TTL para evitar request storms ---- */
const _cache = new Map();          // key → { url, ts }
const _inflight = new Map();       // key → Promise
const CACHE_TTL = 30_000;          // 30s

/** Extrae una URL de logo tolerando varias formas de respuesta del backend */
export function extractLogoUrl(res) {
  if (!res) return "";
  const list =
    (Array.isArray(res?.logo) && res.logo) ||
    (Array.isArray(res?.data) && res.data) ||
    (Array.isArray(res) && res) ||
    null;

  if (list && list.length) {
    for (const it of list) {
      const u = it?.logo || it?.url || it?.image || it;
      if (isValidUrl(u)) return u;
    }
  }

  const obj =
    (res && typeof res === "object" && !Array.isArray(res) && res) ||
    (res?.data && typeof res.data === "object" && res.data);

  const u = obj?.logo || obj?.url || obj?.image || "";
  return isValidUrl(u) ? u : "";
}

function readCache(key, fallback = "") {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function writeCache(key, val) {
  try {
    if (val) localStorage.setItem(key, val);
    else localStorage.removeItem(key);
  } catch { }
}

/**
 * fetchLogo:
 *  - Si viene storeId ⇒ logo efectivo de ESA tienda (usa X-Store-Id, respeta tenant).
 *  - Si NO viene storeId ⇒ logo efectivo de PLATAFORMA (omite tenant por completo).
 *  ⚠️ SOLO usa /api/logo?effective=true (endpoint público). NUNCA /api/logo/admin aquí.
 */
async function fetchLogo({ storeId } = {}) {
  const key = storeId || "__platform__";

  // TTL: si ya tenemos un resultado reciente, retornarlo sin request
  const cached = _cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.url;

  // Dedup: si ya hay un request en vuelo para esta key, reutilizarlo
  if (_inflight.has(key)) return _inflight.get(key);

  const headers = {};
  const opts = {
    headers,
    __public: true,
    timeout: 12000,
  };

  if (storeId) {
    headers["X-Store-Id"] = storeId;
  } else {
    opts.omitTenantHeader = true;
  }

  const promise = fetchDataFromApi(`/api/logo?effective=true`, opts)
    .then((res) => {
      const url = extractLogoUrl(res) || "";
      _cache.set(key, { url, ts: Date.now() });
      _inflight.delete(key);
      return url;
    })
    .catch(() => {
      _inflight.delete(key);
      return cached?.url || "";
    });

  _inflight.set(key, promise);
  return promise;
}

/* ===================== hooks ===================== */

export function usePlatformLogo() {
  const [url, setUrl] = useState(() => {
    const cached = readCache("logo:platform") || readCache("logo");
    return cached || "";
  });

  useEffect(() => {
    let mounted = true;
    let inflight = 0;

    const apply = (u) => {
      if (mounted) setUrl(u || "");
    };

    const load = async () => {
      const seq = ++inflight;
      try {
        // ⬇ sin storeId => MODO PLATAFORMA (omitTenantHeader = true en fetchLogo)
        const fresh = await fetchLogo({});
        if (!mounted || seq !== inflight) return;
        if (fresh) {
          apply(fresh);
          writeCache("logo:platform", fresh);
          writeCache("logo", fresh);
        } else {
          apply("");
          writeCache("logo:platform", "");
        }
      } catch { }
    };

    load();

    const onStorage = (e) => {
      if (e?.key === "logo:platform" || e?.key === "logo") {
        apply(String(e.newValue || ""));
      }
    };

    const onLogoUpdated = (ev) => {
      const det = ev?.detail || {};
      const scope = String(det.scope || "").toLowerCase();
      const storeId = det.storeId;

      // ⛔ Ignora eventos de logos de tienda
      if (storeId || scope === "store") return;

      // ✅ Solo reaccionar a cambios de logo GLOBAL
      const direct = det.url || det.logo || "";
      if (isValidUrl(direct)) {
        apply(direct);
        writeCache("logo:platform", direct);
        writeCache("logo", direct);
        return;
      }

      // Fallback: recargar desde cache
      const cached =
        readCache("logo:platform") ||
        readCache("logo") ||
        "";
      apply(cached || "");
    };

    const onAuthUpdated = () => {
      load();
    };

    try {
      window.addEventListener("storage", onStorage);
    } catch { }
    try {
      window.addEventListener("logo:updated", onLogoUpdated);
    } catch { }
    try {
      window.addEventListener("auth:updated", onAuthUpdated);
    } catch { }

    return () => {
      mounted = false;
      inflight++;
      try {
        window.removeEventListener("storage", onStorage);
      } catch { }
      try {
        window.removeEventListener("logo:updated", onLogoUpdated);
      } catch { }
      try {
        window.removeEventListener("auth:updated", onAuthUpdated);
      } catch { }
    };
  }, []);

  return url;
}

/**
 * Logo por tienda (con tenant). Lee tanto clave por id como por slug, y luego pide al servidor.
 * Cache: "logo:store:<storeId>"
 */
export function useStoreLogo(passedStoreId) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    let inflight = 0;
    const raw = passedStoreId || getTenantId() || "";

    const apply = (u) => {
      if (mounted) setUrl(u || "");
    };

    const load = async () => {
      const seq = ++inflight;

      if (!raw) {
        const g = readCache("logo:platform") || readCache("logo");
        apply(g || "");
        return;
      }

      // 🔎 intenta ambas claves: por id y por slug
      const keyId = `logo:store:${raw}`;
      const cachedId = readCache(keyId);

      let firstHit = cachedId;
      if (!firstHit && !isObjectId(raw)) {
        const legacyKey = `logo:store:${raw}`;
        firstHit = readCache(legacyKey);
      }

      if (firstHit) apply(firstHit);

      try {
        const fresh = await fetchLogo({ storeId: raw });
        if (!mounted || seq !== inflight) return;
        if (fresh) {
          writeCache(keyId, fresh);
          apply(fresh);
        } else {
          const global = readCache("logo:platform") || readCache("logo");
          apply(global);
        }
      } catch {
        const global = readCache("logo:platform") || readCache("logo");
        if (!firstHit && global) apply(global);
      }
    };

    load();

    const onStorage = (e) => {
      if (!raw) {
        if (e?.key === "logo:platform" || e?.key === "logo") {
          apply(String(e.newValue || ""));
        }
        return;
      }
      if (e?.key === `logo:store:${raw}`) {
        apply(String(e.newValue || ""));
      }
      if (e?.key === "X-Store-Id") {
        const sid = getTenantId() || "";
        if (sid) apply(readCache(`logo:store:${sid}`) || "");
        else apply(readCache("logo:platform") || readCache("logo") || "");
      }
    };

    const onLogoUpdated = (ev) => {
      const det = ev?.detail || {};
      const scope = String(det.scope || "").toLowerCase();
      const nextUrl = det.url || det.logo || "";
      const sid = raw;

      if (!sid) return;
      // solo eventos de ESTA tienda y scope "store"
      if (String(det.storeId || "") !== String(sid)) return;
      if (scope && scope !== "store") return;

      if (nextUrl) {
        writeCache(`logo:store:${sid}`, nextUrl);
        apply(nextUrl);
      }
    };

    const onTenantChanged = () => {
      load();
    };
    const onAuthUpdated = () => {
      load();
    };

    try {
      window.addEventListener("storage", onStorage);
    } catch { }
    try {
      window.addEventListener("logo:updated", onLogoUpdated);
    } catch { }
    try {
      window.addEventListener("tenant:changed", onTenantChanged);
    } catch { }
    try {
      window.addEventListener("auth:updated", onAuthUpdated);
    } catch { }

    return () => {
      mounted = false;
      inflight++;
      try {
        window.removeEventListener("storage", onStorage);
      } catch { }
      try {
        window.removeEventListener("logo:updated", onLogoUpdated);
      } catch { }
      try {
        window.removeEventListener("tenant:changed", onTenantChanged);
      } catch { }
      try {
        window.removeEventListener("auth:updated", onAuthUpdated);
      } catch { }
    };
  }, [passedStoreId]);

  return url;
}

export default function useLogo() {
  return usePlatformLogo();
}
