import { Button } from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";

import { AppContext } from "../../context/AppContext"; // ✅ named export correcto
import { fetchDataFromApi, postData } from "../../utils/api.js";

const MIN_LEN = 6; // ajusta si tu backend exige más

const ChangePassword = () => {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isPasswordShow2, setIsPasswordShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formFields, setFormsFields] = useState({
    email: localStorage.getItem("userEmail") || "",
    newPassword: "",
    confirmPassword: "",
  });

  const context = useContext(AppContext); // ✅ usa AppContext correcto
  const navigate = useNavigate();

  useEffect(() => {
    // Logo para el header público
    fetchDataFromApi("/api/logo").then((res) => {
      const url = res?.logo?.[0]?.logo;
      if (url) localStorage.setItem("logo", url);
    });
  }, []);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields((prev) => ({ ...prev, [name]: value }));
  };

  const passwordsMatch = useMemo(
    () => formFields.newPassword === formFields.confirmPassword,
    [formFields.newPassword, formFields.confirmPassword]
  );

  const strongEnough = useMemo(
    () => (formFields.newPassword || "").length >= MIN_LEN,
    [formFields.newPassword]
  );

  const canSubmit =
    !!formFields.email && !!formFields.newPassword && !!formFields.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.newPassword) {
      context?.alertBox?.("error", "Por favor ingresa la nueva contraseña");
      return;
    }
    if (!formFields.confirmPassword) {
      context?.alertBox?.("error", "Por favor confirma la contraseña");
      return;
    }
    if (!passwordsMatch) {
      context?.alertBox?.("error", "La contraseña y la confirmación no coinciden");
      return;
    }
    if (!strongEnough) {
      context?.alertBox?.("error", `La contraseña debe tener al menos ${MIN_LEN} caracteres`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await postData(`/api/user/reset-password`, {
        email: formFields.email,
        newPassword: formFields.newPassword,
        confirmPassword: formFields.confirmPassword,
      });

      if (res?.error === false) {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("actionType");
        context?.alertBox?.("success", res?.message || "Contraseña actualizada");
        navigate("/login", { replace: true });
      } else {
        context?.alertBox?.("error", res?.message || "No se pudo cambiar la contraseña");
      }
    } catch (err) {
      context?.alertBox?.("error", err?.message || "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white w-full">
      <header className="w-full static lg:fixed top-0 left-0 px-4 py-3 flex items-center justify-center sm:justify-between z-50">
        <Link to="/">
          <img src={localStorage.getItem("logo")} className="w-[200px]" alt="Logo" />
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

      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" alt="" />

      <div className="loginBox card w-full md:w-[600px] h-auto px-3 pb-20 mx-auto pt-5 lg:pt-20 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" alt="" />
        </div>

        <h1 className="text-center text-[18px] sm:text-[35px] font-[800] mt-4">
          ¡Bienvenido de nuevo!
          <br />
          Aquí puedes cambiar tu contraseña
        </h1>

        <br />

        <form className="w-full px-3 sm:px-3 mt-3" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Nueva contraseña</h4>
            <div className="relative w-full">
              <input
                type={isPasswordShow ? "text" : "password"}
                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                name="newPassword"
                value={formFields.newPassword}
                disabled={isLoading}
                onChange={onChangeInput}
                autoComplete="new-password"
                aria-label="Nueva contraseña"
              />
              <Button
                type="button"
                className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                onClick={() => setIsPasswordShow((s) => !s)}
                aria-label={isPasswordShow ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {isPasswordShow ? <FaEyeSlash className="text-[18px]" /> : <FaRegEye className="text-[18px]" />}
              </Button>
            </div>
            {!strongEnough && formFields.newPassword && (
              <p className="text-[12px] text-amber-600 mt-1">Mínimo {MIN_LEN} caracteres.</p>
            )}
          </div>

          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Confirmar contraseña</h4>
            <div className="relative w-full">
              <input
                type={isPasswordShow2 ? "text" : "password"}
                className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
                name="confirmPassword"
                value={formFields.confirmPassword}
                disabled={isLoading}
                onChange={onChangeInput}
                autoComplete="new-password"
                aria-label="Confirmar contraseña"
              />
              <Button
                type="button"
                className="!absolute top-[7px] right-[10px] z-50 !rounded-full !w-[35px] !h-[35px] !min-w-[35px] !text-gray-600"
                onClick={() => setIsPasswordShow2((s) => !s)}
                aria-label={isPasswordShow2 ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {isPasswordShow2 ? <FaEyeSlash className="text-[18px]" /> : <FaRegEye className="text-[18px]" />}
              </Button>
            </div>
            {formFields.confirmPassword && !passwordsMatch && (
              <p className="text-[12px] text-rose-600 mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          <Button type="submit" disabled={!canSubmit || isLoading} className="btn-blue btn-lg w-full">
            {isLoading ? <CircularProgress color="inherit" size={22} /> : "Cambiar contraseña"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
