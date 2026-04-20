import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser, FaRegEye, FaEyeSlash } from "react-icons/fa6";

import { fetchDataFromApi, postData } from "../../utils/api.js";
import { useAuthFull as useAuth } from "../../hooks/useAuth";
import OtpBox from "../../Components/OtpBox";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const INPUT_CLS =
  "w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // "email" | "otp" | "change"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const { alertBox } = useAuth();

  // Logo fetch
  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      const url = res?.logo?.[0]?.logo;
      if (url) localStorage.setItem("logo", url);
    });
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ---- Step 1: Send code ----
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alertBox?.("error", "Ingresa un correo valido");
      return;
    }
    setIsLoading(true);
    try {
      const res = await postData("/api/user/forgot-password", {
        email: email.trim(),
      });
      if (res?.error === false) {
        alertBox?.("success", res?.message || "Codigo enviado a tu correo");
        setCooldown(30);
        setStep("otp");
      } else {
        alertBox?.("error", res?.message || "No se pudo enviar el codigo");
      }
    } catch (err) {
      alertBox?.("error", err?.message || "Error al enviar el codigo");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 2: Verify OTP ----
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      alertBox?.("error", "Ingresa el codigo de 6 digitos");
      return;
    }
    setIsLoading(true);
    try {
      const res = await postData("/api/user/verify-forgot-password-otp", {
        email: email.trim(),
        otp,
      });
      if (res?.error === false) {
        alertBox?.("success", res?.message || "Codigo verificado");
        setStep("change");
      } else {
        alertBox?.("error", res?.message || "Codigo invalido o expirado");
      }
    } catch (err) {
      alertBox?.("error", err?.message || "Error al verificar el codigo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const res = await postData("/api/user/forgot-password", {
        email: email.trim(),
      });
      if (res?.error === false) {
        alertBox?.("success", res?.message || "Codigo reenviado");
        setCooldown(30);
      } else {
        alertBox?.("error", res?.message || "No se pudo reenviar el codigo");
      }
    } catch (err) {
      alertBox?.("error", err?.message || "Error al reenviar el codigo");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 3: Change password ----
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      alertBox?.(
        "error",
        "La contrasena debe cumplir todos los requisitos de seguridad"
      );
      return;
    }
    if (password !== confirmPassword) {
      alertBox?.("error", "Las contrasenas no coinciden");
      return;
    }
    setIsLoading(true);
    try {
      const res = await postData("/api/user/forgot-password/change-password", {
        email: email.trim(),
        newPassword: password,
        confirmPassword,
      });
      if (res?.error === false) {
        alertBox?.("success", res?.message || "Contrasena actualizada correctamente");
        navigate("/login");
      } else {
        alertBox?.("error", res?.message || "No se pudo cambiar la contrasena");
      }
    } catch (err) {
      alertBox?.("error", err?.message || "Error al cambiar la contrasena");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white w-full min-h-[100vh]">
      <header className="w-full fixed top-0 left-0 px-4 py-3 flex items-center justify-between z-50">
        <Link to="/">
          <img
            src={localStorage.getItem("logo") || "/logo.svg"}
            className="w-[200px]"
            alt="Logo"
          />
        </Link>

        <div className="flex items-center gap-0">
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "isActive" : "")}
          >
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <CgLogIn className="text-[18px]" /> Iniciar sesion
            </Button>
          </NavLink>

          <NavLink
            to="/sign-up"
            className={({ isActive }) => (isActive ? "isActive" : "")}
          >
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <FaRegUser className="text-[15px]" /> Registrarse
            </Button>
          </NavLink>
        </div>
      </header>

      <img
        src="/patern.webp"
        className="w-full fixed top-0 left-0 opacity-5"
        alt=""
      />

      <div className="loginBox card w-full md:w-[600px] h-auto px-3 md:px-8 pb-20 mx-auto pt-24 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" alt="" />
        </div>

        <h1 className="text-center text-[22px] sm:text-[35px] font-[800] mt-4">
          {step === "email" && (
            <>
              Tienes problemas para iniciar sesion?
              <br />
              Restablece tu contrasena.
            </>
          )}
          {step === "otp" && "Verifica tu correo"}
          {step === "change" && "Nueva contrasena"}
        </h1>

        <br />

        {/* ========== STEP 1: EMAIL ========== */}
        {step === "email" && (
          <form className="w-full" onSubmit={handleSendCode}>
            <div className="form-group mb-4 w-full">
              <h4 className="text-[14px] font-[500] mb-1">
                Correo electronico
              </h4>
              <input
                type="email"
                placeholder="Ingresa tu correo electronico"
                className={INPUT_CLS}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={!email.trim() || isLoading}
              className="btn-blue btn-lg w-full"
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Enviar codigo"
              )}
            </Button>

            <br />
            <br />
            <div className="text-center flex items-center justify-center gap-4">
              <span>Recordaste tu contrasena?</span>
              <Link
                to="/login"
                className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700"
              >
                Iniciar sesion
              </Link>
            </div>
          </form>
        )}

        {/* ========== STEP 2: OTP ========== */}
        {step === "otp" && (
          <div>
            <p className="text-center text-[15px] mb-6">
              Enviamos un codigo de 6 digitos a{" "}
              <span className="text-primary font-bold">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="text-center flex items-center justify-center flex-col">
                <OtpBox length={6} onChange={setOtp} />
              </div>

              <div className="w-full sm:w-[300px] m-auto mt-5 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="btn-blue w-full"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? (
                    <CircularProgress color="inherit" size={22} />
                  ) : (
                    "Verificar codigo"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={isLoading || cooldown > 0}
                >
                  {cooldown > 0
                    ? `Reenviar codigo (${cooldown}s)`
                    : "Reenviar codigo"}
                </Button>

                <Button
                  size="small"
                  className="!text-xs !text-gray-500"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                >
                  Volver
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========== STEP 3: CHANGE PASSWORD ========== */}
        {step === "change" && (
          <form className="w-full" onSubmit={handleChangePassword}>
            <div className="form-group mb-1 w-full">
              <h4 className="text-[14px] font-[500] mb-1">Nueva contrasena</h4>
              <div className="relative w-full">
                <input
                  type={isPasswordShow ? "text" : "password"}
                  placeholder="Ingresa tu nueva contrasena"
                  className={INPUT_CLS}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                  onClick={() => setIsPasswordShow(!isPasswordShow)}
                >
                  {isPasswordShow ? (
                    <FaEyeSlash className="text-[18px]" />
                  ) : (
                    <FaRegEye className="text-[18px]" />
                  )}
                </Button>
              </div>
              {password && (
                <div className="mt-1 mb-2 text-[12px] space-y-0.5">
                  <div
                    className={
                      password.length >= 8
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {password.length >= 8 ? "\u2713" : "\u25CB"} 8 caracteres
                    minimo
                  </div>
                  <div
                    className={
                      /[A-Z]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/[A-Z]/.test(password) ? "\u2713" : "\u25CB"} 1 mayuscula
                  </div>
                  <div
                    className={
                      /[a-z]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/[a-z]/.test(password) ? "\u2713" : "\u25CB"} 1 minuscula
                  </div>
                  <div
                    className={
                      /\d/.test(password) ? "text-green-600" : "text-gray-400"
                    }
                  >
                    {/\d/.test(password) ? "\u2713" : "\u25CB"} 1 numero
                  </div>
                  <div
                    className={
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                      ? "\u2713"
                      : "\u25CB"}{" "}
                    1 caracter especial
                  </div>
                </div>
              )}
            </div>

            <div className="form-group mb-4 w-full">
              <h4 className="text-[14px] font-[500] mb-1">
                Repite tu contrasena
              </h4>
              <div className="relative w-full">
                <input
                  type={isConfirmPasswordShow ? "text" : "password"}
                  placeholder="Repite tu nueva contrasena"
                  className={`w-full h-[50px] border-2 rounded-md focus:outline-none px-3 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-[rgba(0,0,0,0.1)] focus:border-[rgba(0,0,0,0.7)]"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                  onClick={() =>
                    setIsConfirmPasswordShow(!isConfirmPasswordShow)
                  }
                >
                  {isConfirmPasswordShow ? (
                    <FaEyeSlash className="text-[18px]" />
                  ) : (
                    <FaRegEye className="text-[18px]" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-[12px] mt-1">
                  Las contrasenas no coinciden
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                !PASSWORD_REGEX.test(password) ||
                password !== confirmPassword ||
                isLoading
              }
              className="btn-blue btn-lg w-full"
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Cambiar contrasena"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ForgotPassword;
