// server/config/cookies.js

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

// Si el front usa proxy de Vite, las requests parecen mismo origen (sameSite=Lax es OK)
const USING_PROXY = String(process.env.USE_PROXY ?? process.env.VITE_USE_PROXY ?? "")
  .toLowerCase() === "true";

// Overrides opcionales por ENV
const FORCE_COOKIE_SECURE = process.env.FORCE_COOKIE_SECURE; // 'true' | 'false' | undefined
const FORCE_COOKIE_SAMESITE = (process.env.FORCE_COOKIE_SAMESITE || "").toLowerCase(); // 'lax'|'strict'|'none'|''
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ""; // ej: ".tu-dominio.com"

// Nombre de cookie de sesión (compat)
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || process.env.COOKIE_NAME || "sid";

/* ──────────────────────────────────────────────────────────────────────────
 * Utilidades internas
 * ────────────────────────────────────────────────────────────────────────── */

/** ¿La conexión es HTTPS efectiva? (considera proxy y overrides) */
function isEffectivelySecure(req) {
  if (FORCE_COOKIE_SECURE === "true") return true;
  if (FORCE_COOKIE_SECURE === "false") return false;

  // Si confías en el proxy, req.secure ya refleja X-Forwarded-Proto
  if (req?.secure) return true;

  // Fallback: mira el header si no confías globalmente en el proxy
  const xfp = req?.headers?.["x-forwarded-proto"];
  if (typeof xfp === "string" && xfp.split(",")[0].trim() === "https") return true;

  return false; // dev http local
}

/** sameSite según modo (proxy = mismo origen → 'lax'; cross-site → 'none') con override */
function decideSameSite(isSameOrigin) {
  if (["lax", "strict", "none"].includes(FORCE_COOKIE_SAMESITE)) return FORCE_COOKIE_SAMESITE;
  return isSameOrigin ? "lax" : "none";
}

/* ──────────────────────────────────────────────────────────────────────────
 * API “clásica” (compat con tu código actual)
 * ────────────────────────────────────────────────────────────────────────── */

/** Cookie genérica (p. ej. access/refresh) sin necesidad de `req` */
export const cookiesOption = {
  httpOnly: true,
  secure: IS_PROD, // En prod se espera HTTPS
  sameSite: IS_PROD ? "none" : "lax", // cross-site en prod → 'none'
  path: "/",
  maxAge: ONE_WEEK, // 7 días
  domain: COOKIE_DOMAIN || undefined,
};

/** Config del nombre de la cookie de sesión (LEGADO/COMPAT) */
export const sessionCookieName = COOKIE_NAME;

/**
 * Construye opciones de cookie de sesión por request (logout/clear, etc.)
 * - 1 día por defecto para sesión
 * - Detecta HTTPS efectiva (req.secure / X-Forwarded-Proto)
 * - sameSite: 'lax' si usas proxy, 'none' si cross-site
 */
export function buildSessionCookie(req) {
  const sameOrigin = USING_PROXY;
  const samesite = decideSameSite(sameOrigin);

  // Si sameSite es 'none', los navegadores exigen secure=true (en prod)
  const secureEff = isEffectivelySecure(req);
  const secure = samesite === "none" ? secureEff || IS_PROD : secureEff;

  return {
    httpOnly: true,
    secure,
    sameSite: samesite,
    path: "/",
    maxAge: ONE_DAY, // 1 día para la sesión
    domain: COOKIE_DOMAIN || undefined,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * API avanzada (más flexible)
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Construye opciones de cookie según request/entorno.
 * @param {import('express').Request} req
 * @param {object} overrides - para cambiar p.ej. maxAge, sameSite, secure, etc.
 */
export function buildCookieOptions(req, overrides = {}) {
  const sameOrigin = USING_PROXY;
  const samesite = decideSameSite(sameOrigin);

  const secureEff = isEffectivelySecure(req);
  const secure = samesite === "none" ? secureEff || IS_PROD : secureEff;

  const base = {
    httpOnly: true,
    sameSite: samesite, // 'lax' | 'strict' | 'none'
    secure,
    path: "/",
    maxAge: ONE_WEEK,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };

  return { ...base, ...overrides };
}

/** Cookie de refresh a 30 días (si usas refresh separado) */
export function buildRefreshCookie(req) {
  return buildCookieOptions(req, { maxAge: 30 * 24 * 60 * 60 * 1000 });
}

/**
 * Wrapper “simple” tipo el diff que pasaste.
 * Útil si algún sitio de tu código espera esa interfaz minimalista.
 * Nota: no fija maxAge (solo flags base).
 */
export function buildCookieOptionsBasic(req) {
  // En dev (localhost + Vite proxy) LAX funciona porque es "same-site".
  // Si usas subdominios distintos en prod, cambia a "none" (+ secure true).
  // expires/maxAge SOLO cuando SETEAS (no para clearCookie)
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
  };
}

/**
 * Helper específico para limpiar cookies (logout).
 * NO incluye expires ni maxAge para evitar el warning de Express v5:
 * res.clearCookie ignora esas opciones y expira automáticamente.
 */
export function buildCookieClearOptions(req) {
  // Basado en las opciones activas de buildCookieOptions (flags y scope)
  const base = buildCookieOptions(req);
  const { httpOnly, sameSite, secure, path } = base;
  const out = { httpOnly, sameSite, secure, path };
  if (base.domain) out.domain = base.domain;
  // ⚠️ NO poner expires ni maxAge aquí
  return out;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Config nombres de cookies de tokens (según tu diff)
 * ────────────────────────────────────────────────────────────────────────── */

// ⚠ NUNCA reusar 'accessToken' para cookies "ligeras" de sesión UI
export const cookieConfig = {
  name: "sid",
  refreshName: "refreshToken",
};

/** Export de metadata útil */
export const cookieMeta = {
  usingProxy: USING_PROXY,
  isProd: IS_PROD,
  defaults: {
    sessionMaxAge: ONE_DAY,
    defaultMaxAge: ONE_WEEK,
    shortMaxAge: TEN_MINUTES,
  },
};
