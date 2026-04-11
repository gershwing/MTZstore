// src/Pages/VerifyAccount/index.jsx
import { Button } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import OtpBox from "../../Components/OtpBox";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchDataFromApi, postData } from "../../utils/api";
import MyContext from "../../context/AppContext";

const COOLDOWN_SECONDS = 60; // coincide con el server (anti-spam)

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // reenvío
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail") || "";
  const actionType = localStorage.getItem("actionType") || ""; // "forgot-password" | ""(verify email)

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      const url = res?.logo?.[0]?.logo;
      if (url) localStorage.setItem("logo", url);
    });
  }, []);

  // timer de cooldown para el botón "Reenviar OTP"
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleOtpChange = (value) => setOtp(value);

  const verityOTP = async (e) => {
    e.preventDefault();
    if (!otp || String(otp).length < 6) {
      context.alertBox("error", "Por favor, ingresa el código OTP (6 dígitos).");
      return;
    }

    setIsLoading(true);
    try {
      if (actionType === "forgot-password") {
        // Verifica OTP para recuperar contraseña
        const res = await postData("/api/user/verify-forgot-password-otp", { email, otp });
        // Server valida código y expiración, y limpia OTP si es válido
        // TTL 10 min y anti-spam ya están del lado del servidor. :contentReference[oaicite:3]{index=3}
        if (res?.error === false) {
          context.alertBox("success", res?.message || "Código verificado.");
          navigate("/change-password");
        } else {
          context.alertBox("error", res?.message || "OTP inválido o expirado.");
        }
      } else {
        // Verifica OTP de verificación de email
        const res = await postData("/api/user/verifyEmail", { email, otp });
        if (res?.error === false) {
          context.alertBox("success", res?.message || "Correo verificado correctamente.");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("actionType");
          navigate("/login");
        } else {
          context.alertBox("error", res?.message || "OTP inválido o expirado.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar OTP (respeta cooldown cliente; el server además limita 60s y TTL 10m)
  const resendOtp = async () => {
    if (!email) {
      return context.alertBox("error", "No se encontró el correo para reenviar el código.");
    }
    if (cooldown > 0) return;

    setResending(true);
    try {
      if (actionType === "forgot-password") {
        // Reutiliza el flujo de "forgot password" para enviar un nuevo OTP
        // En el backend: genera OTP, guarda otpExpires (10m) y aplica cooldown 60s. :contentReference[oaicite:4]{index=4}
        const res = await postData("/api/user/forgot-password", { email });
        if (res?.error) {
          context.alertBox("error", res?.message || "No se pudo reenviar el código.");
        } else {
          context.alertBox("success", res?.message || "Te enviamos un nuevo código.");
          setCooldown(COOLDOWN_SECONDS);
        }
      } else {
        // Para verificación de email tras registro:
        // Si tu server expone un endpoint de reenvío específico, úsalo aquí.
        // Ejemplos comunes (ajusta al que tengas disponible):
        //   POST /api/user/resend-verify-email  { email }
        //   POST /api/user/send-verify-email    { email }
        const res = await postData("/api/user/resend-verify-email", { email });
        if (res?.error) {
          context.alertBox("error", res?.message || "No se pudo reenviar el código.");
        } else {
          context.alertBox("success", res?.message || "Te enviamos un nuevo código.");
          setCooldown(COOLDOWN_SECONDS);
        }
      }
    } catch {
      context.alertBox("error", "Error de red al reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="bg-white w-full min-h-[100vh]">
      <header className="w-full static lg:fixed top-0 left-0 px-4 py-3 flex items-center justify-center sm:justify-between z-50">
        <Link to="/">
          <img src={localStorage.getItem("logo")} className="w-[200px]" alt="Logo" />
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
          <img src="/verify3.png" className="w-[100px] m-auto" alt="Verify" />
        </div>

        <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
          ¡Bienvenido de nuevo!
          <br />
          Por favor, verifica tu correo electrónico
        </h1>

        <p className="text-center text-[15px] mt-4">
          OTP enviado a{" "}
          <span className="text-primary font-bold text-[12px] sm:text-[14px]">{email}</span>
        </p>

        <form onSubmit={verityOTP} className="mt-5">
          <div className="text-center flex items-center justify-center flex-col">
            <OtpBox length={6} onChange={handleOtpChange} />
          </div>

          <div className="w-full sm:w-[300px] m-auto mt-5 px-3 sm:px-0 flex flex-col gap-3">
            <Button
              type="submit"
              className="btn-blue w-full"
              disabled={isLoading || String(otp).length < 6}
            >
              {isLoading ? <CircularProgress color="inherit" size={22} /> : "Verificar OTP"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              className="w-full"
              onClick={resendOtp}
              disabled={resending || cooldown > 0}
            >
              {resending
                ? "Reenviando..."
                : cooldown > 0
                  ? `Reenviar OTP (${cooldown}s)`
                  : "Reenviar OTP"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default VerifyAccount;
