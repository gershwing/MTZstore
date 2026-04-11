// src/Pages/Login/index.jsx
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { Link, NavLink, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser, FaRegEye, FaEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// ✅ API (alias @)
import { api, fetchDataFromApi, postData } from "@/utils/api";
import { AppContext } from "../../context/AppContext";

// ✅ sesión unificada (alias @)
import { persistTokens, hydrateMeAndNormalizeScope } from "@/utils/session";
import { updateSocketAuth } from "../../utils/socket";

// 🔐 Google (helpers centralizados en src/firebase.js)
import {
  googleSignInInteractive,
  completeGoogleRedirectIfAny,
  getFirebaseIdToken,
} from "../../firebase";

// Hooks opcionales
import { useAuth } from "../../hooks/useAuth";                 // expone refreshMe()
import { useUI } from "../../context/UIContext";               // expone alertBox()
import { useAuthFull as useAuthState } from "../../hooks/useAuth"; // authReady/isAuthenticated

// ✅ Cache centralizada del logo (no pisar con falsy)
import { getLocalLogo, setLocalLogo } from "@/utils/logoCache";

const GOOGLE_FLOW = "firebase";

/** Limpia alcance de tenant local y avisa a la UI */
function clearTenantScope() {
  try { localStorage.removeItem("X-Store-Id"); } catch { }
  try { window.dispatchEvent(new CustomEvent("tenant:changed", { detail: { storeId: null } })); } catch { }
}

/** Fija Authorization por defecto en axios */
function setDefaultAuthHeader(accessToken) {
  try {
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  } catch { }
}

/* ========= helpers logo públicos ========= */
const isValidUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|data:image|\/|blob:)/i.test(u || "");

function extractLogoUrl(res) {
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
  if (isValidUrl(res?.logo)) return res.logo;
  if (isValidUrl(res?.url)) return res.url;
  return "";
}

const Login = () => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isPasswordShow, setisPasswordShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formFields, setFormsFields] = useState({
    email: localStorage.getItem("rememberEmail") || "",
    password: "",
  });

  const navigate = useNavigate();
  const context = useContext(AppContext);

  // Compat
  const { refreshMe } = (typeof useAuth === "function" ? useAuth?.() : {}) || {};
  const ui = (typeof useUI === "function" ? useUI?.() : null) || {};

  // Estado global de sesión del provider
  const { authReady = false, isAuthenticated = false } =
    (typeof useAuthState === "function" ? useAuthState() : {}) || {};

  // 🟢 Si ya hay sesión, no te quedes en /login
  useEffect(() => {
    if (authReady && isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);

  // Fallback robusto de notificaciones
  const notify = (typeOrObj, maybeMsg) => {
    if (typeof ui?.alertBox === "function") {
      if (typeof typeOrObj === "string") return ui.alertBox({ title: typeOrObj, message: maybeMsg });
      return ui.alertBox(typeOrObj);
    }
    if (typeof context?.alertBox === "function") {
      if (typeof typeOrObj === "string") return context.alertBox(typeOrObj, maybeMsg);
      const title = typeOrObj?.title || "Aviso";
      const message = typeOrObj?.message || "";
      return context.alertBox("info", `${title}: ${message}`);
    }
    try {
      const msg = typeof maybeMsg === "string"
        ? maybeMsg
        : (typeof typeOrObj === "string" ? typeOrObj : (typeOrObj?.message || "Ocurrió un error"));
      window.alert(msg);
    } catch { }
  };

  // ======== LOGO: estado + sincronización con cache central =========
  const [logoUrl, setLogoUrl] = useState(() => getLocalLogo());
  const [imgBroken, setImgBroken] = useState(false);
  const finalLogo = !imgBroken && (logoUrl || getLocalLogo()) ? (logoUrl || getLocalLogo()) : "/logo.svg";

  // Cargar logo público (solo GET) y cachear SIN pisar con falsy
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchDataFromApi("/api/logo", { __public: true });
        const url = extractLogoUrl(res);
        if (isValidUrl(url)) {
          setLocalLogo(url);   // guarda "logo:platform" y "logo" + emite evento
          setLogoUrl(url);
        }
      } catch { }
    })();
  }, []);

  // Escuchar cambios entre pestañas + cambios explícitos (logo:updated)
  useEffect(() => {
    const onStorage = (e) => {
      if (e?.key === "logo:platform" || e?.key === "logo") {
        const v = e?.newValue || "";
        if (v) {
          setImgBroken(false);
          setLogoUrl(v);
        }
      }
    };
    const onLogoUpdated = (ev) => {
      const { url, logo, storeId, scope } = ev?.detail || {};
      if (storeId || scope === "store") return; // <- filtro clave
      const next = url || logo || getLocalLogo();
      if (isValidUrl(next)) {
        setImgBroken(false);
        setLogoUrl(next);
      }
    };
    try { window.addEventListener("storage", onStorage); } catch { }
    try { window.addEventListener("logo:updated", onLogoUpdated); } catch { }
    return () => {
      try { window.removeEventListener("storage", onStorage); } catch { }
      try { window.removeEventListener("logo:updated", onLogoUpdated); } catch { }
    };
  }, []);

  // Procesa resultado de signInWithRedirect (si ocurrió)
  useEffect(() => {
    (async () => {
      try {
        const res = await completeGoogleRedirectIfAny();
        if (res?.user) {
          await handleGoogleAuthResult(res);
        }
      } catch (e) {
        console.error("[RedirectResult Error]", e?.code, e?.message || e);
      }
    })();
  }, []);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields((prev) => ({ ...prev, [name]: value }));
  };

  const validForm = formFields.email && formFields.password;

  // ================= EMAIL/PASSWORD LOGIN =================
  async function onSubmit(e) {
    e.preventDefault();
    if (submitting || !validForm) return;
    setSubmitting(true);
    try {
      // 0) Limpieza mínima de sesión previa (NO tocar logo)
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("X-Store-Id");
      } catch { }

      // 1) Backend login
      const res = await api.post(
        "/api/user/login",
        { email: formFields.email, password: formFields.password },
        { withCredentials: true }
      );

      // 2) Persistir tokens (tolerante a nombres)
      persistTokens(res?.data);

      // 3) Extraer access/refresh para header + sockets
      const access =
        res?.data?.accessToken ||
        res?.data?.data?.accessToken ||
        res?.data?.token ||
        res?.data?.access ||
        "";
      const refresh =
        res?.data?.refreshToken ||
        res?.data?.data?.refreshToken ||
        res?.data?.refresh ||
        "";

      // 4) Fijar Authorization por defecto y avisar a la UI
      setDefaultAuthHeader(access);
      try { window.dispatchEvent(new Event("auth:updated")); } catch { }

      // 5) Actualizar socket (si aplica)
      try { if (access) updateSocketAuth(access, { reconnect: true }); } catch { }

      // 6) Limpiar tenant “pegado”
      clearTenantScope();

      // 7) Hidratar y ESPERAR /me SIN tenant (clave para evitar flash-back)
      await api.get("/api/user/me", {
        omitTenantHeader: true,
        __noTenant: true,
        withCredentials: true,
      });

      // (opcional) refrescar provider si existe
      if (typeof refreshMe === "function") {
        await refreshMe();
        await new Promise((r) => setTimeout(r, 10));
      } else {
        await hydrateMeAndNormalizeScope();
      }

      // 8) Navegar recién ahora
      navigate("/admin", { replace: true });

      // 9) Recordar email (opcional)
      try {
        if (remember) localStorage.setItem("rememberEmail", formFields.email);
        else localStorage.removeItem("rememberEmail");
      } catch { }
    } catch (err) {
      console.error("[login] error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al iniciar sesión";
      notify({ title: "Error de inicio de sesión", message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Forgot password (pública)
  const forgotPassword = async () => {
    if (!formFields.email) {
      return notify("error", "Por favor ingresa tu correo electrónico");
    }
    try {
      const res = await postData(
        "/api/user/forgot-password",
        { email: formFields.email },
        { __public: true }
      );
      if (res?.error) {
        notify("error", res?.message || "No se pudo enviar el código");
        return;
      }
      notify("success", res?.message || "Te enviamos un código");
      localStorage.setItem("userEmail", formFields.email);
      localStorage.setItem("actionType", "forgot-password");
      navigate("/verify-account");
    } catch {
      notify("error", "Error de red. Intenta más tarde.");
    }
  };

  // ---- Login con Google (firebase; popup + fallback redirect)
  const authWithGoogleFirebase = async () => {
    setLoadingGoogle(true);

    // Corta-fuegos de sesión previa (NO tocar logo)
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("X-Store-Id");
    } catch { }

    try {
      const result = await googleSignInInteractive(); // popup o redirige
      if (!result) return; // redirigido → continuará en useEffect
      await handleGoogleAuthResult(result);
    } catch (e) {
      console.error("[Google SignIn Error]", e?.code, e?.message || e);
      showGoogleError(e);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Maneja resultado de popup/redirect
  const handleGoogleAuthResult = async (result) => {
    try {
      const user = result?.user;
      if (!user) throw new Error("NO_USER");

      const idToken = await getFirebaseIdToken(true);
      const fields = {
        name: user?.providerData?.[0]?.displayName || "",
        email: user?.providerData?.[0]?.email || "",
        avatar: user?.providerData?.[0]?.photoURL || "",
        mobile: user?.providerData?.[0]?.phoneNumber || "",
        idToken,
      };

      const res = await postData("/api/user/authWithGoogle", fields, { __public: true, withCredentials: true });
      if (res?.error) throw new Error("BACKEND_GOOGLE_ERROR");

      notify("success", res?.message || "¡Bienvenido!");

      // Tokens desde la respuesta (tolerante)
      const access =
        res?.accessToken || res?.data?.accessToken || res?.token || res?.access || "";
      const refresh =
        res?.refreshToken || res?.data?.refreshToken || res?.refresh || "";

      // Persistir tokens y preparar entorno
      persistTokens({ accessToken: access, refreshToken: refresh });
      setDefaultAuthHeader(access);
      try { window.dispatchEvent(new Event("auth:updated")); } catch { }
      try { if (access) updateSocketAuth(access, { reconnect: true }); } catch { }

      clearTenantScope();

      // Hidratar y ESPERAR /me SIN tenant
      await api.get("/api/user/me", {
        omitTenantHeader: true,
        __noTenant: true,
        withCredentials: true,
      });

      // (opcional) refrescar provider o sesión local
      if (typeof refreshMe === "function") {
        await refreshMe();
        await new Promise((r) => setTimeout(r, 10));
      } else {
        await hydrateMeAndNormalizeScope();
      }

      // Navega al final
      navigate("/admin", { replace: true });
    } catch (e) {
      console.error("[handleGoogleAuthResult]", e);
      const code = e?.code || e?.message || String(e);
      let msg = "Autenticación con Google fallida.";
      if (code === "NO_USER") msg = "No se obtuvo información de usuario desde Google.";
      if (String(code).includes("BACKEND_GOOGLE_ERROR")) msg = "El servidor rechazó el login con Google.";
      showGoogleError({ code: msg });
    }
  };

  const showGoogleError = (e) => {
    const code = e?.code || e?.message || String(e);
    let msg = "Autenticación cancelada o fallida";
    if (code === "auth/popup-closed-by-user") msg = "Cerraste la ventana de Google antes de completar el login.";
    if (code === "auth/popup-blocked") msg = "Tu navegador bloqueó la ventana emergente. Reintentaremos con redirección…";
    if (code === "auth/operation-not-allowed") msg = "El proveedor de Google no está habilitado en Firebase.";
    if (code === "auth/unauthorized-domain") msg = "Dominio no autorizado en Firebase (agrega tu dominio en Authorized Domains).";
    if (code === "BACKEND_GOOGLE_ERROR") msg = "El servidor rechazó el login con Google.";
    if (code === "NO_USER") msg = "No se obtuvo información de usuario desde Google.";
    notify("error", msg);
  };

  const handleGoogle = () => {
    if (GOOGLE_FLOW === "firebase") return authWithGoogleFirebase();
  };

  return (
    <section className="bg-white w-full">
      <header className="w-full static lg:fixed top-0 left-0 px-4 py-3 flex items-center justify-center sm:justify-between z-50">
        <Link to="/">
          <img
            src={finalLogo}
            onError={() => setImgBroken(true)}
            className="w-[200px]"
            alt="Logo"
          />
        </Link>

        <div className="hidden sm:flex items-center gap-0">
          <NavLink to="/login" className={({ isActive }) => (isActive ? "isActive" : "")}>
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <CgLogIn className="text-[18px]" /> Iniciar sesión
            </Button>
          </NavLink>

          <NavLink to="/sign-up" className={({ isActive }) => (isActive ? "isActive" : "")}>
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <FaRegUser className="text-[15px]" /> Registrarse
            </Button>
          </NavLink>
        </div>
      </header>

      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" alt="Pattern" />

      <div className="loginBox card w-full md:w-[600px] pb-20 mx-auto pt-5 lg:pt-20 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" alt="Icon" />
        </div>

        <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
          ¡Bienvenido de nuevo!
          <br /> Inicia sesión con tus credenciales.
        </h1>

        <div className="flex items-center justify-center w-full mt-5 gap-4">
          <LoadingButton
            size="small"
            type="button"
            onClick={handleGoogle}
            endIcon={<FcGoogle />}
            loading={loadingGoogle}
            loadingPosition="end"
            variant="outlined"
            className="!bg-none !py-2 !text-[15px] !capitalize !px-5 !text-[rgba(0,0,0,0.7)]"
          >
            Iniciar sesión con Google
          </LoadingButton>
        </div>

        <br />

        <div className="w-full flex items-center justify-center gap-3">
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          <span className="text-[10px] lg:text-[14px] font-[500]">O, inicia sesión con tu correo</span>
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
        </div>

        <br />

        <form className="w-full px-8 mt-3" onSubmit={onSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Correo electrónico</h4>
            <input
              type="email"
              className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3
                        !bg-white !text-black placeholder-gray-600 dark:!bg-white dark:!text-black"
              name="email"
              value={formFields.email}
              disabled={submitting}
              onChange={onChangeInput}
              required
            />
          </div>

          <div className="form-group mb-4 w_full">
            <h4 className="text-[14px] font-[500] mb-1">Contraseña</h4>
            <div className="relative w-full">
              <input
                type={isPasswordShow ? "text" : "password"}
                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3
                          !bg-white !text-black placeholder-gray-600 dark:!bg-white dark:!text-black"
                name="password"
                value={formFields.password}
                disabled={submitting}
                onChange={onChangeInput}
                required
              />
              <Button
                className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                onClick={() => setisPasswordShow(!isPasswordShow)}
                type="button"
              >
                {isPasswordShow ? <FaEyeSlash className="text-[18px]" /> : <FaRegEye className="text-[18px]" />}
              </Button>
            </div>
          </div>

          <div className="form-group mb-4 w-full flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
              label="Recuérdame"
            />

            <button
              type="button"
              onClick={forgotPassword}
              className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px]">¿No tienes una cuenta?</span>
            <Link to="/sign-up" className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700">
              Regístrate
            </Link>
          </div>

          <LoadingButton
            type="submit"
            loading={submitting}
            disabled={!formFields.email || !formFields.password}
            className="btn-blue btn-lg w-full"
            variant="contained"
          >
            Iniciar sesión
          </LoadingButton>
        </form>
      </div>
    </section>
  );
};

export default Login;
