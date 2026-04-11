// admin/src/routes/withPerm.jsx
import React, { useMemo } from "react";
import { usePermission } from "../hooks/usePermission";

// Intento seguro para usar useAuth si existe (evita crashear si no está)
let useAuthSafe = null;
try {
  // eslint-disable-next-line import/no-unresolved
  const mod = require("../hooks/useAuth");
  useAuthSafe = mod.useAuth || mod.default || null;
} catch {
  useAuthSafe = null;
}

// --- helpers de normalización (paridad con backend) ---
function normalizeRequired(input) {
  if (!input) return { anyOf: [] };
  if (typeof input === "string") return { anyOf: [input] };
  if (Array.isArray(input)) return { anyOf: input.filter(Boolean) };
  if (typeof input === "object") {
    const anyOf = Array.isArray(input.anyOf) ? input.anyOf.filter(Boolean) : undefined;
    const allOf = Array.isArray(input.allOf) ? input.allOf.filter(Boolean) : undefined;
    if (anyOf || allOf) return { anyOf, allOf };
  }
  return { anyOf: [] };
}

function evaluateRequired(reqObj, can) {
  const { anyOf, allOf } = reqObj || {};
  if (anyOf?.length && anyOf.some((p) => can(p))) return true;
  if (allOf?.length && allOf.every((p) => can(p))) return true;
  return false;
}

/**
 * withPerm(required?) → puede usarse:
 *
 * 1) Como **componente envoltorio**:
 *    const Can = withPerm(["perm:a", "perm:b"]);
 *    <Can><Button>...</Button></Can>
 *
 * 2) Como **HOC**:
 *    const Guarded = withPerm({ allOf:["perm:a","perm:b"] })(MyComponent);
 *    <Guarded .../>
 */
export default function withPerm(required = []) {
  const requiredNorm = normalizeRequired(required);

  // === Hook interno con capacidades ===
  function useCaps() {
    const perm = usePermission(); // { can, list? }
    let canFn = (p) => perm.can(p);
    let isSuper = Array.isArray(perm?.list) && perm.list.includes("*"); // comodín

    if (useAuthSafe) {
      try {
        const a = useAuthSafe(); // { role, isPlatformSuperAdmin, can? }
        if (typeof a?.can === "function") canFn = a.can;
        if (a?.role === "SUPER_ADMIN" || a?.isPlatformSuperAdmin) isSuper = true; // ⬅️ bypass SUPER_ADMIN
      } catch {
        // cae a permisos locales
      }
    }

    return { can: canFn, isSuper };
  }

  // Lógica de autorización compartida (memoizada)
  function useAllowed() {
    const { can, isSuper } = useCaps();

    const ok = useMemo(() => {
      // SUPER_ADMIN ve todo
      if (isSuper) return true;

      // Sin requisitos => acceso
      const nothingRequested =
        (!requiredNorm.anyOf || requiredNorm.anyOf.length === 0) &&
        (!requiredNorm.allOf || requiredNorm.allOf.length === 0);
      if (nothingRequested) return true;

      return evaluateRequired(requiredNorm, can);
    }, [isSuper, can, requiredNorm.anyOf?.join("|"), requiredNorm.allOf?.join("|")]);

    return ok;
  }

  // ---------- MODO 1: componente wrapper ----------
  function PermWrapper(props) {
    const ok = useAllowed();
    if (!ok && import.meta?.env?.DEV) {

      console.debug("[withPerm] ocultando por falta de permiso:", required);
    }
    return ok ? <>{props.children}</> : null;
  }

  // ---------- MODO 2: HOC ----------
  function asHOC(Wrapped) {
    function Wrapper(props) {
      const ok = useAllowed();
      return ok ? <Wrapped {...props} /> : null;
    }
    Wrapper.displayName = `withPerm(${Wrapped.displayName || Wrapped.name || "Component"})`;
    return Wrapper;
  }

  // Soporta ambos patrones con una sola API
  return function PermWrapperOrHOC(arg) {
    if (typeof arg === "function") {
      // HOC
      return asHOC(arg);
    }
    // Componente envoltorio
    return <PermWrapper {...(arg || {})} />;
  };
}

// ---------- Exports adicionales ----------

// Versión explícita HOC
export function withPermHOC(required = []) {
  return withPerm(required);
}

// Hook booleano reutilizable para checks en línea (p.ej., disabled en botones)
export function usePermGuard(required = []) {
  const perm = usePermission();
  let canFn = (p) => perm.can(p);
  let isSuper = Array.isArray(perm?.list) && perm.list.includes("*");

  if (useAuthSafe) {
    try {
      const a = useAuthSafe();
      if (typeof a?.can === "function") canFn = a.can;
      if (a?.role === "SUPER_ADMIN" || a?.isPlatformSuperAdmin) isSuper = true;
    } catch {
      // noop
    }
  }

  const req = normalizeRequired(required);

  if (isSuper) return true;

  const nothingRequested =
    (!req.anyOf || req.anyOf.length === 0) &&
    (!req.allOf || req.allOf.length === 0);
  if (nothingRequested) return true;

  return evaluateRequired(req, canFn);
}

// Versión componente explícito: <WithPerm required={...}>{children}</WithPerm>
export function WithPerm({ required = [], children }) {
  const Guard = withPerm(required);
  return <Guard>{children}</Guard>;
}
