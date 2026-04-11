// admin/src/Pages/ForgotPassword/index.jsx (ajusta la ruta del archivo si difiere)
import { Button } from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import CircularProgress from "@mui/material/CircularProgress";

import { fetchDataFromApi, postData } from "../../utils/api.js";
import { AppContext } from "../../context/AppContext"; // ✅ named export

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const context = useContext(AppContext); // ✅ contexto correcto

  useEffect(() => {
    // Consistencia con el resto del proyecto: guardamos logo para cabecera pública
    fetchDataFromApi("/api/logo").then((res) => {
      const url = res?.logo?.[0]?.logo;
      if (url) localStorage.setItem("logo", url);
    });
  }, []);

  const isValidEmail = useMemo(() => {
    // valida formato básico; el backend validará estrictamente
    return /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email.trim());
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail) {
      context?.alertBox?.("error", "Ingresa un correo válido");
      return;
    }

    setIsLoading(true);
    try {
      // 1) POST /api/user/forgot-password { email }
      // 2) Server envía OTP/código al correo y responde { error:false, message, ... }
      const res = await postData("/api/user/forgot-password", { email: email.trim() });

      if (res?.error === false) {
        // Persistimos el contexto para los siguientes pasos del flujo (Verify -> ChangePassword)
        localStorage.setItem("userEmail", email.trim());
        localStorage.setItem("actionType", "reset-password");
        context?.alertBox?.("success", res?.message || "Te enviamos un código de verificación");
        navigate("/verify", { replace: true }); // coincide con tus rutas públicas
      } else {
        context?.alertBox?.("error", res?.message || "No se pudo iniciar el restablecimiento");
      }
    } catch (err) {
      context?.alertBox?.("error", err?.message || "Error al solicitar el restablecimiento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white w-full min-h-[100vh]">
      <header className="w-full fixed top-0 left-0 px-4 py-3 flex items-center justify-between z-50">
        <Link to="/">
          <img src={localStorage.getItem("logo") || "/logo.svg"} className="w-[200px]" alt="Logo" />
        </Link>

        <div className="flex items-center gap-0">
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

      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" alt="" />

      <div className="loginBox card w-full md:w-[600px] h-auto px-3 md:px-8 pb-20 mx-auto pt-24 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" alt="" />
        </div>

        <h1 className="text-center text-[22px] sm:text-[35px] font-[800] mt-4">
          ¿Tienes problemas para iniciar sesión?
          <br />
          Restablece tu contraseña.
        </h1>

        <br />

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Correo electrónico</h4>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <Button type="submit" disabled={!isValidEmail || isLoading} className="btn-blue btn-lg w-full">
            {isLoading ? <CircularProgress color="inherit" size={22} /> : "Restablecer contraseña"}
          </Button>

          <br />
          <br />
          <div className="text-center flex items-center justify-center gap-4">
            <span>¿Recordaste tu contraseña?</span>
            <Link to="/login" className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
