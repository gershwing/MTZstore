// src/Pages/SignUp/index.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";

import { CgLogIn } from "react-icons/cg";
import { FaRegUser, FaRegEye, FaEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

import { fetchDataFromApi, postData } from "../../utils/api.js";
import { useAuthFull as useAuth } from "../../hooks/useAuth";
import { afterLogin } from "../../utils/session.js";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";

// ✅ logo cache centralizado
import { getLocalLogo, setLocalLogo } from "@/utils/logoCache";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

/* ========= helpers respuesta logo ========= */
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
    return "";
}

const SignUp = () => {
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordShow, setIsPasswordShow] = useState(false);

    const [formFields, setFormFields] = useState({
        name: "",
        email: "",
        password: "",
    });

    // ✅ usa helper para inicializar y re-renderizar
    const [logoUrl, setLogoUrl] = useState(() => getLocalLogo());

    const { alertBox, authReady, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authReady && isAuthenticated) {
            navigate("/admin", { replace: true });
        }
    }, [authReady, isAuthenticated, navigate]);

    // ✅ Carga pública del logo (solo GET) y guarda con helper (no pisa falsy)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetchDataFromApi("/api/logo?effective=true");
                const url =
                    res?.logo?.[0]?.logo ||
                    res?.data?.logo ||
                    res?.logo ||
                    extractLogoUrl(res) ||
                    "";
                if (isValidUrl(url)) {
                    setLocalLogo(url);       // centralizado: escribe doble clave + evento
                    if (mounted) setLogoUrl(url);
                }
            } catch {
                // silencio
            }
        })();
        return () => { mounted = false; };
    }, []);

    // 🔄 Sincroniza cuando cambie el logo en otra pestaña o por evento custom
    useEffect(() => {
        const onStorage = (ev) => {
            if ((ev.key === "logo:platform" || ev.key === "logo") && isValidUrl(ev.newValue)) {
                setLogoUrl(ev.newValue);
            }
        };
        const onLogoUpdated = (ev) => {
            const { url, logo, storeId, scope } = ev?.detail || {};
            // ⛔️ SignUp muestra SOLO logo GLOBAL → ignora updates de tienda
            if (storeId || scope === "store") return;
            const u = url || logo;
            if (isValidUrl(u)) setLogoUrl(u);
        };
        try { window.addEventListener("storage", onStorage); } catch { }
        try { window.addEventListener("logo:updated", onLogoUpdated); } catch { }
        return () => {
            try { window.removeEventListener("storage", onStorage); } catch { }
            try { window.removeEventListener("logo:updated", onLogoUpdated); } catch { }
        };
    }, []);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

    const valideValue = Object.values(formFields).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formFields.name) {
            alertBox?.("error", "Por favor ingrese su nombre completo");
            setIsLoading(false);
            return;
        }
        if (!formFields.email) {
            alertBox?.("error", "Por favor ingrese su correo");
            setIsLoading(false);
            return;
        }
        if (!formFields.password) {
            alertBox?.("error", "Por favor ingrese su contraseña");
            setIsLoading(false);
            return;
        }

        try {
            const res = await postData("/api/user/register", formFields);
            if (res?.error !== true) {
                alertBox?.("success", res?.message);
                localStorage.setItem("userEmail", formFields.email);
                setFormFields({ name: "", email: "", password: "" });
                navigate("/verify-account");
            } else {
                alertBox?.("error", res?.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const authWithGoogle = async () => {
        setLoadingGoogle(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const fields = {
                name: user.displayName || "",
                email: user.email,
                password: null,
                avatar: user.photoURL || "",
                mobile: user.phoneNumber || "",
                role: "USER",
            };

            const res = await postData("/api/user/authWithGoogle", fields);

            if (res?.error !== true) {
                alertBox?.("success", res?.message);
                localStorage.setItem("userEmail", fields.email);
                await afterLogin({ apiData: res, navigate });
            } else {
                alertBox?.("error", res?.message);
            }
        } catch (err) {
            console.error(err);
            alertBox?.("error", "Error en autenticación con Google");
        } finally {
            setLoadingGoogle(false);
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white w-full">
            <header className="w-full static lg:fixed top-0 left-0 px-4 py-3 flex items-center justify-center sm:justify-between z-50">
                <Link to="/">
                    <img
                        src={logoUrl || "/logo.svg"}
                        onError={(e) => { e.currentTarget.src = "/logo.svg"; }}
                        className="w-[200px]"
                        alt="Logo"
                    />
                </Link>

                <div className="hidden sm:flex items-center gap-0">
                    <NavLink to="/login" className={({ isActive }) => (isActive ? "isActive" : "")}>
                        <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
                            <CgLogIn className="text-[18px]" /> Iniciar Sesión
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

            <div className="loginBox card w-full md:w-[600px] h-auto pb-20 mx-auto pt-5 lg:pt-20 relative z-50">
                <div className="text-center">
                    <img src="/icon.svg" className="m-auto" alt="Icon" />
                </div>

                <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
                    ¡Únete hoy! Obtén beneficios especiales <br />y mantente al día.
                </h1>

                <div className="flex items-center justify-center w-full mt-5 gap-4">
                    <LoadingButton
                        size="small"
                        onClick={authWithGoogle}
                        endIcon={<FcGoogle />}
                        loading={loadingGoogle}
                        loadingPosition="end"
                        variant="outlined"
                        className="!bg-none !py-2 !text-[15px] !capitalize !px-5 !text-[rgba(0,0,0,0.7)]"
                    >
                        Iniciar con Google
                    </LoadingButton>
                </div>

                <div className="w-full flex items-center justify-center gap-3 my-5">
                    <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
                    <span className="text-[10px] lg:text-[14px] font-[500]">O, regístrate con tu correo</span>
                    <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
                </div>

                <form className="w-full px-8 mt-3" onSubmit={handleSubmit}>
                    <div className="form-group mb-4 w-full">
                        <h4 className="text-[14px] font-[500] mb-1">Nombre Completo</h4>
                        <input
                            type="text"
                            name="name"
                            value={formFields.name}
                            disabled={isLoading}
                            onChange={onChangeInput}
                            className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                        />
                    </div>

                    <div className="form-group mb-4 w-full">
                        <h4 className="text-[14px] font-[500] mb-1">Correo Electrónico</h4>
                        <input
                            type="email"
                            name="email"
                            value={formFields.email}
                            disabled={isLoading}
                            onChange={onChangeInput}
                            className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                        />
                    </div>

                    <div className="form-group mb-4 w-full">
                        <h4 className="text-[14px] font-[500] mb-1">Contraseña</h4>
                        <div className="relative w-full">
                            <input
                                type={isPasswordShow ? "text" : "password"}
                                name="password"
                                value={formFields.password}
                                disabled={isLoading}
                                onChange={onChangeInput}
                                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                            />
                            <Button
                                type="button"
                                className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                                onClick={() => setIsPasswordShow(!isPasswordShow)}
                            >
                                {isPasswordShow ? <FaEyeSlash className="text-[18px]" /> : <FaRegEye className="text-[18px]" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[14px]">¿Ya tienes una cuenta?</span>
                        <Link to="/login" className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700 cursor-pointer">
                            Inicia Sesión
                        </Link>
                    </div>

                    <Button type="submit" className="btn-blue btn-lg w-full" disabled={!valideValue}>
                        {isLoading ? <CircularProgress color="inherit" size={22} /> : "Registrarse"}
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default SignUp;
