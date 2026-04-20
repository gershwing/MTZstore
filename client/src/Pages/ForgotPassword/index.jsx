import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import OtpBox from "../../components/OtpBox";
import { postData } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const PasswordChecklist = ({ password }) => {
  const checks = [
    { label: "8 caracteres minimo", ok: password.length >= 8 },
    { label: "1 mayuscula", ok: /[A-Z]/.test(password) },
    { label: "1 minuscula", ok: /[a-z]/.test(password) },
    { label: "1 numero", ok: /\d/.test(password) },
    { label: "1 caracter especial", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-1 mb-2 text-[12px] space-y-0.5">
      {checks.map((c) => (
        <div key={c.label} className={c.ok ? "text-green-600" : "text-gray-400"}>
          {c.ok ? "\u2713" : "\u25CB"} {c.label}
        </div>
      ))}
    </div>
  );
};

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // "email" | "otp" | "change"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isPasswordShow2, setIsPasswordShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const context = useContext(MyContext);
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Step 1: Send code
  const handleSendCode = (e) => {
    e.preventDefault();
    if (!email) {
      context?.alertBox("error", "Por favor ingresa tu correo electronico");
      return;
    }
    setIsLoading(true);
    postData("/api/user/forgot-password", { email }).then((res) => {
      setIsLoading(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        setCooldown(30);
        setStep("otp");
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  // Resend code
  const handleResendCode = () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    postData("/api/user/forgot-password", { email }).then((res) => {
      setIsLoading(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message || "Codigo reenviado");
        setCooldown(30);
      } else {
        context?.alertBox("error", res?.message);
        const match = res?.message?.match(/(\d+)s/);
        if (match) setCooldown(parseInt(match[1]));
      }
    });
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      context?.alertBox("error", "Ingresa el codigo de 6 digitos");
      return;
    }
    setIsLoading(true);
    postData("/api/user/verify-forgot-password-otp", { email, otp }).then((res) => {
      setIsLoading(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        setStep("change");
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  // Step 3: Change password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword) {
      context?.alertBox("error", "Por favor ingresa la nueva contrasena");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      context?.alertBox("error", "La contrasena no cumple los requisitos");
      return;
    }
    if (newPassword !== confirmPassword) {
      context?.alertBox("error", "Las contrasenas no coinciden");
      return;
    }
    setIsLoading(true);
    postData("/api/user/forgot-password/change-password", { email, newPassword, confirmPassword }).then((res) => {
      setIsLoading(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        navigate("/login");
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  return (
    <section className="section py-5 lg:py-10">
      <div className="container">
        <div className="card shadow-md w-full sm:w-[400px] m-auto rounded-md bg-white p-5 px-10">

          {/* Step 1: Email */}
          {step === "email" && (
            <>
              <h3 className="text-center text-[18px] text-black">
                Recuperar contrasena
              </h3>

              <form className="w-full mt-5" onSubmit={handleSendCode}>
                <div className="form-group w-full mb-5">
                  <TextField
                    type="email"
                    id="email"
                    label="Correo electronico"
                    variant="outlined"
                    className="w-full"
                    value={email}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex items-center w-full mt-3 mb-3">
                  <Button type="submit" disabled={!email || isLoading} className="btn-org btn-lg w-full flex gap-3">
                    {isLoading ? <CircularProgress color="inherit" size={24} /> : "Enviar codigo"}
                  </Button>
                </div>

                <p className="text-center">
                  <Link className="link text-[14px] font-[600] text-primary" to="/login">
                    Volver a iniciar sesion
                  </Link>
                </p>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <div className="text-center flex items-center justify-center">
                <img src="/verify3.png" width="80" />
              </div>
              <h3 className="text-center text-[18px] text-black mt-4 mb-1">
                Verificar codigo
              </h3>
              <p className="text-center mt-0 mb-4 text-sm text-gray-600">
                Enviamos un codigo de 6 digitos a{" "}
                <span className="text-primary font-bold">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <OtpBox length={6} onChange={setOtp} />

                <div className="flex items-center justify-center mt-5 px-3">
                  <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full btn-org btn-lg">
                    {isLoading ? <CircularProgress color="inherit" size={24} /> : "Verificar codigo"}
                  </Button>
                </div>
              </form>

              <div className="flex items-center justify-center mt-3">
                <Button
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || isLoading}
                  className="text-primary"
                  size="small"
                >
                  {cooldown > 0 ? `Reenviar codigo (${cooldown}s)` : "Reenviar codigo"}
                </Button>
              </div>

              <div className="flex items-center justify-center mt-2">
                <Button
                  size="small"
                  className="!text-xs !text-gray-500"
                  onClick={() => { setStep("email"); setOtp(""); }}
                >
                  Volver
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Change password */}
          {step === "change" && (
            <>
              <h3 className="text-center text-[18px] text-black">
                Nueva contrasena
              </h3>

              <form className="w-full mt-5" onSubmit={handleChangePassword}>
                <div className="form-group w-full mb-1 relative">
                  <TextField
                    type={isPasswordShow ? "text" : "password"}
                    id="newPassword"
                    label="Nueva contrasena"
                    variant="outlined"
                    className="w-full"
                    value={newPassword}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black"
                    onClick={() => setIsPasswordShow(!isPasswordShow)}
                  >
                    {isPasswordShow ? <IoMdEyeOff className="text-[20px] opacity-75" /> : <IoMdEye className="text-[20px] opacity-75" />}
                  </Button>
                </div>

                <PasswordChecklist password={newPassword} />

                <div className="form-group w-full mb-5 relative">
                  <TextField
                    type={isPasswordShow2 ? "text" : "password"}
                    id="confirmPassword"
                    label="Confirmar contrasena"
                    variant="outlined"
                    className="w-full"
                    value={confirmPassword}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                    helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? "Las contrasenas no coinciden" : ""}
                  />
                  <Button
                    className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black"
                    onClick={() => setIsPasswordShow2(!isPasswordShow2)}
                  >
                    {isPasswordShow2 ? <IoMdEyeOff className="text-[20px] opacity-75" /> : <IoMdEye className="text-[20px] opacity-75" />}
                  </Button>
                </div>

                <div className="flex items-center w-full mt-3 mb-3">
                  <Button
                    type="submit"
                    disabled={!newPassword || !confirmPassword || isLoading}
                    className="btn-org btn-lg w-full flex gap-3"
                  >
                    {isLoading ? <CircularProgress color="inherit" size={24} /> : "Cambiar contrasena"}
                  </Button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
