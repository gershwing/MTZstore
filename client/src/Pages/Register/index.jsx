import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import OtpBox from "../../components/OtpBox";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { googleSignInInteractive, completeGoogleRedirectIfAny } from "../../firebase";

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
          {c.ok ? "✓" : "○"} {c.label}
        </div>
      ))}
    </div>
  );
};

const Register = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [formFields, setFormFields] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // OTP inline step
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [regToken, setRegToken] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const context = useContext(MyContext);
  const history = useNavigate();

  const handleGoogleResult = (result) => {
    if (!result) return;
    const user = result.user;
    const fields = {
      name: user.providerData[0].displayName,
      email: user.providerData[0].email,
      password: null,
      avatar: user.providerData[0].photoURL,
      mobile: user.providerData[0].phoneNumber,
      role: "USER"
    };

    postData("/api/user/authWithGoogle", fields).then((res) => {
      if (res?.error !== true) {
        setIsLoading(false);
        context?.alertBox("success", res?.message);
        localStorage.setItem("userEmail", fields.email);
        localStorage.setItem("accessToken", res?.data?.accessToken);
        localStorage.setItem("refreshToken", res?.data?.refreshToken);
        context.setIsLogin(true);
        history("/");
      } else {
        context?.alertBox("error", res?.message);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    completeGoogleRedirectIfAny().then(handleGoogleResult).catch(() => {});
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phone) => setFormFields(prev => ({ ...prev, mobile: phone }));

  const canSubmit = formFields.firstName && formFields.lastName && formFields.email
    && formFields.password && formFields.confirmPassword;

  // Paso 1: Registrar y obtener token
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formFields.firstName || !formFields.lastName) {
      context?.alertBox("error", "Por favor ingresa tus nombres y apellidos");
      setIsLoading(false);
      return;
    }
    if (!formFields.email) {
      context?.alertBox("error", "Por favor ingresa tu correo electronico");
      setIsLoading(false);
      return;
    }
    if (!PASSWORD_REGEX.test(formFields.password)) {
      context?.alertBox("error", "La contrasena debe tener al menos 8 caracteres, 1 mayuscula, 1 numero y 1 caracter especial");
      setIsLoading(false);
      return;
    }
    if (formFields.password !== formFields.confirmPassword) {
      context?.alertBox("error", "Las contrasenas no coinciden");
      setIsLoading(false);
      return;
    }

    const payload = {
      name: `${formFields.firstName.trim()} ${formFields.lastName.trim()}`,
      email: formFields.email,
      password: formFields.password,
      mobile: formFields.mobile,
      birthDate: formFields.birthDate || null,
      gender: formFields.gender,
    };

    postData("/api/user/register", payload).then((res) => {
      setIsLoading(false);
      if (res?.error !== true) {
        context?.alertBox("success", res?.message);
        setRegEmail(formFields.email);
        const _t = res?.data?.registrationToken || res?.registrationToken;
        if (_t) setRegToken(_t);
        setCooldown(30);
        setStep("otp");
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  };

  // Paso 2: Verificar OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      context?.alertBox("error", "Ingresa el codigo de 6 digitos");
      return;
    }
    setIsLoading(true);

    postData("/api/user/verifyEmail", { registrationToken: regToken, otp }).then((res) => {
      setIsLoading(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message || "Correo verificado correctamente");
        history("/login");
      } else {
        context?.alertBox("error", res?.message || "OTP invalido o expirado");
      }
    });
  };

  // Reenviar OTP
  const handleResendOtp = () => {
    if (cooldown > 0 || resending || !regToken) return;
    setResending(true);

    postData("/api/user/resend-verify-email", { registrationToken: regToken }).then((res) => {
      setResending(false);
      if (res?.error === false) {
        context?.alertBox("success", res?.message || "Codigo reenviado");
        const _t2 = res?.data?.registrationToken || res?.registrationToken;
        if (_t2) setRegToken(_t2);
        setCooldown(30);
      } else {
        context?.alertBox("error", res?.message || "No se pudo reenviar el codigo");
        const match = res?.message?.match(/(\d+)s/);
        if (match) setCooldown(parseInt(match[1]));
      }
    });
  };

  const authWithGoogle = async () => {
    try {
      const result = await googleSignInInteractive();
      handleGoogleResult(result);
    } catch (error) {
      context?.alertBox("error", "Error al registrarse con Google");
    }
  };

  return (
    <section className="section py-5 sm:py-10">
      <div className="container">
        <div className="card shadow-md w-full sm:w-[400px] m-auto rounded-md bg-white p-5 px-10">

          {step === "form" && (
            <>
              <h3 className="text-center text-[18px] text-black">
                Registrate con una cuenta nueva
              </h3>

              <form className="w-full mt-5" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-group w-full mb-5">
                  <TextField
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formFields.firstName}
                    disabled={isLoading}
                    label="Nombres"
                    variant="outlined"
                    className="w-full"
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="form-group w-full mb-5">
                  <TextField
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formFields.lastName}
                    disabled={isLoading}
                    label="Apellidos"
                    variant="outlined"
                    className="w-full"
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="form-group w-full mb-5">
                  <TextField
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formFields.birthDate}
                    disabled={isLoading}
                    label="Fecha de nacimiento"
                    variant="outlined"
                    className="w-full"
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="form-group w-full mb-5">
                  <TextField
                    select
                    id="gender"
                    name="gender"
                    value={formFields.gender}
                    disabled={isLoading}
                    label="Genero"
                    variant="outlined"
                    className="w-full"
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  >
                    <MenuItem value="male">Masculino</MenuItem>
                    <MenuItem value="female">Femenino</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefiero no decir</MenuItem>
                  </TextField>
                </div>

                <div className="form-group w-full mb-5">
                  <label className="text-[14px] text-gray-600 mb-1 block">Telefono WhatsApp</label>
                  <PhoneInput
                    defaultCountry="bo"
                    value={formFields.mobile}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group w-full mb-5">
                  <TextField
                    type="email"
                    id="email"
                    name="email"
                    label="Correo electronico"
                    value={formFields.email}
                    disabled={isLoading}
                    variant="outlined"
                    className="w-full"
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="form-group w-full mb-1 relative">
                  <TextField
                    type={isPasswordShow ? 'text' : 'password'}
                    id="password"
                    name="password"
                    label="Contrasena"
                    variant="outlined"
                    className="w-full"
                    value={formFields.password}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                  <Button className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black" onClick={() => setIsPasswordShow(!isPasswordShow)}>
                    {isPasswordShow ? <IoMdEyeOff className="text-[20px] opacity-75" /> : <IoMdEye className="text-[20px] opacity-75" />}
                  </Button>
                </div>

                <PasswordChecklist password={formFields.password} />

                <div className="form-group w-full mb-5 relative">
                  <TextField
                    type={isConfirmPasswordShow ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Repite tu contrasena"
                    variant="outlined"
                    className="w-full"
                    value={formFields.confirmPassword}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                    error={formFields.confirmPassword.length > 0 && formFields.password !== formFields.confirmPassword}
                    helperText={formFields.confirmPassword.length > 0 && formFields.password !== formFields.confirmPassword ? "Las contrasenas no coinciden" : ""}
                  />
                  <Button className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black" onClick={() => setIsConfirmPasswordShow(!isConfirmPasswordShow)}>
                    {isConfirmPasswordShow ? <IoMdEyeOff className="text-[20px] opacity-75" /> : <IoMdEye className="text-[20px] opacity-75" />}
                  </Button>
                </div>

                <div className="flex items-center w-full mt-3 mb-3">
                  <Button type="submit" disabled={!canSubmit || isLoading} className="btn-org btn-lg w-full flex gap-3">
                    {isLoading ? <CircularProgress color="inherit" size={24} /> : 'Registrarse'}
                  </Button>
                </div>

                <p className="text-center">Ya tienes una cuenta? <Link className="link text-[14px] font-[600] text-primary" to="/login"> Iniciar sesion</Link></p>

                <p className="text-center font-[500]">O continua con tu cuenta social</p>

                <Button className="flex gap-3 w-full !bg-[#f1f1f1] btn-lg !text-black" onClick={authWithGoogle}>
                  <FcGoogle className="text-[20px]" /> Registrate con Google
                </Button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="text-center flex items-center justify-center">
                <img src="/verify3.png" width="80" />
              </div>
              <h3 className="text-center text-[18px] text-black mt-4 mb-1">
                Verificar correo
              </h3>
              <p className="text-center mt-0 mb-4 text-sm text-gray-600">
                Enviamos un codigo de 6 digitos a{" "}
                <span className="text-primary font-bold">{regEmail}</span>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <OtpBox length={6} onChange={setOtp} />

                <div className="flex items-center justify-center mt-5 px-3">
                  <Button type="submit" disabled={isLoading || otp.length < 6} className="w-full btn-org btn-lg">
                    {isLoading ? <CircularProgress color="inherit" size={24} /> : "Verificar OTP"}
                  </Button>
                </div>
              </form>

              <div className="flex items-center justify-center mt-3">
                <Button
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || resending}
                  className="text-primary"
                  size="small"
                >
                  {resending
                    ? "Enviando..."
                    : cooldown > 0
                      ? `Reenviar codigo (${cooldown}s)`
                      : "Reenviar codigo"}
                </Button>
              </div>

              <div className="flex items-center justify-center mt-2">
                <Button
                  size="small"
                  className="!text-xs !text-gray-500"
                  onClick={() => { setStep("form"); setOtp(""); }}
                >
                  Volver al registro
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
};

export default Register;
