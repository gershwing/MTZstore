import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, IconButton, InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Collapse } from "react-collapse";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import MenuItem from "@mui/material/MenuItem";

const MyAccount = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState({ new: false, confirm: false });

  // OTP flow: idle → verifying → changing
  const [otpStep, setOtpStep] = useState("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // Countdown timer para reenvío
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  const [formFields, setFormsFields] = useState({
    name: '',
    email: '',
    mobile: '',
    birthDate: '',
    gender: '',
  });

  const [changePassword, setChangePassword] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    // Solo redirigir si no hay token Y el contexto ya terminó de cargar
    if (!token && context?.isLogin === false) {
      history("/");
    }
  }, [context?.isLogin])


  useEffect(() => {
    if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {
      setUserId(context?.userData?._id);
      setTimeout(() => {
        setFormsFields({
          name: context?.userData?.name,
          email: context?.userData?.email,
          mobile: context?.userData?.mobile,
          birthDate: context?.userData?.birthDate ? new Date(context.userData.birthDate).toISOString().split('T')[0] : '',
          gender: context?.userData?.gender || '',
        })
      }, 200);
      setPhone(
        typeof context?.userData?.mobile === "string" && context?.userData?.mobile.trim() !== ""
          ? context.userData.mobile
          : ""
      );


      setChangePassword({ newPassword: '', confirmPassword: '' })
    }

  }, [context?.userData])



  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(prev => ({ ...prev, [name]: value }));
    setChangePassword(prev => ({ ...prev, [name]: value }));
  }


  const valideValue = Object.values(formFields).every(el => el)

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.name === "") {
      context.alertBox("error", "Por favor ingrese su nombre");
      return false
    }

    if (formFields.email === "") {
      context.alertBox("error", "Por favor ingrese su correo");
      return false
    }

    if (formFields.mobile === "") {
      context.alertBox("error", "Por favor ingrese su celular");
      return false
    }


    editData(`/api/user/${userId}`, formFields, { withCredentials: true }).then((res) => {
      console.log(res)
      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.data?.message);

      } else {
        context.alertBox("error", res?.data?.message);
        setIsLoading(false);
      }

    })


  }

  // Paso 1: Enviar OTP al email
  const handleSendOtp = async () => {
    const email = formFields.email || context?.userData?.email;
    if (!email) return context.alertBox("error", "No se encontró el email");
    if (cooldown > 0) return;
    setOtpLoading(true);
    const res = await postData("/api/user/forgot-password", { email });
    setOtpLoading(false);
    if (res?.error !== true) {
      context.alertBox("success", "Código enviado a tu email");
      setOtpStep("verifying");
      setCooldown(60); // 60 segundos de cooldown
    } else {
      // Extraer segundos del mensaje del servidor si hay cooldown
      const match = res?.message?.match(/(\d+)s/);
      if (match) setCooldown(parseInt(match[1]));
      context.alertBox("error", res?.message || "No se pudo enviar el código");
    }
  };

  // Paso 2: Verificar OTP
  const handleVerifyOtp = async () => {
    const email = formFields.email || context?.userData?.email;
    if (!otpCode || otpCode.length < 6) return context.alertBox("error", "Ingrese el código de 6 dígitos");
    setOtpLoading(true);
    const res = await postData("/api/user/verify-forgot-password-otp", { email, otp: otpCode });
    setOtpLoading(false);
    if (res?.error !== true) {
      context.alertBox("success", "Código verificado");
      setOtpStep("changing");
    } else {
      context.alertBox("error", res?.message || "Código inválido o expirado");
    }
  };

  // Paso 3: Guardar nueva contraseña
  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    const email = formFields.email || context?.userData?.email;
    if (!changePassword.newPassword) return context.alertBox("error", "Ingrese la nueva contraseña");
    if (!changePassword.confirmPassword) return context.alertBox("error", "Confirme su contraseña");
    if (changePassword.newPassword !== changePassword.confirmPassword) return context.alertBox("error", "Las contraseñas no coinciden");
    if (changePassword.newPassword.length < 8) return context.alertBox("error", "La contraseña debe tener al menos 8 caracteres");

    setIsLoading2(true);
    const res = await postData("/api/user/forgot-password/change-password", {
      email,
      newPassword: changePassword.newPassword,
      confirmPassword: changePassword.confirmPassword,
    });
    setIsLoading2(false);
    if (res?.error !== true) {
      context.alertBox("success", res?.message || "Contraseña actualizada");
      setChangePassword({ newPassword: '', confirmPassword: '' });
      setOtpStep("idle");
      setOtpCode("");
      setisChangePasswordFormShow(false);
    } else {
      context.alertBox("error", res?.message || "No se pudo cambiar la contraseña");
    }
  };

  // Abrir panel + enviar OTP
  const handleTogglePasswordPanel = () => {
    if (isChangePasswordFormShow) {
      // Cerrar y resetear
      setisChangePasswordFormShow(false);
      setOtpStep("idle");
      setOtpCode("");
      setCooldown(0);
      setChangePassword({ newPassword: '', confirmPassword: '' });
    } else {
      setisChangePasswordFormShow(true);
      setOtpStep("verifying");
      handleSendOtp();
    }
  };

  return (
    <section className="py-3 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[20%]">

          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[50%]">
          <div className="card bg-white p-5 shadow-md rounded-md mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">Mi perfil</h2>
              <Button className="!ml-auto" onClick={handleTogglePasswordPanel}>
                Cambiar contraseña
              </Button>
            </div>
            <hr />

            <form className="mt-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
                <div className="col">
                  <TextField
                    label="Nombre completo"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="name"
                    value={formFields.name || ""}
                    disabled={isLoading === true ? true : false}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="col">
                  <TextField
                    type="email"
                    label="Correo"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="email"
                    value={formFields.email || ""}
                    disabled={true}
                    onChange={onChangeInput}
                  />
                </div>



                <div className="col">
                  <PhoneInput
                    defaultCountry="bo"
                    value={phone}
                    disabled={isLoading}
                    onChange={(phone) => {
                      setPhone(phone);
                      setFormsFields(prev => ({ ...prev, mobile: phone }));
                    }}
                  />
                </div>

                <div className="col">
                  <TextField
                    type="date"
                    label="Fecha de nacimiento"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="birthDate"
                    value={formFields.birthDate || ""}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="col">
                  <TextField
                    select
                    label="Genero"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="gender"
                    value={formFields.gender || ""}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    onChange={onChangeInput}
                  >
                    <MenuItem value="">Seleccionar</MenuItem>
                    <MenuItem value="male">Masculino</MenuItem>
                    <MenuItem value="female">Femenino</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefiero no decir</MenuItem>
                  </TextField>
                </div>

              </div>


              <br />

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={!valideValue} className="btn-org btn-sm w-[150px]">
                  {
                    isLoading === true ? <CircularProgress color="inherit" />
                      :
                      'Actualizar Perfil'
                  }
                </Button>

              </div>
            </form>
          </div>





          <Collapse isOpened={isChangePasswordFormShow}>
            <div className="card bg-white p-5 shadow-md rounded-md">
              <div className="flex items-center pb-3">
                <h2 className="pb-0">Cambiar contraseña</h2>
              </div>
              <hr />

              {/* Paso 1: Verificar OTP */}
              {otpStep === "verifying" && (
                <div className="mt-8">
                  {otpLoading ? (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CircularProgress size={20} />
                      <span>Enviando código a tu email...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        Enviamos un código de verificación a tu email. Ingrésalo para continuar.
                      </p>
                      <div className="flex items-center gap-3">
                        <TextField
                          label="Código OTP"
                          variant="outlined"
                          size="small"
                          className="w-[200px]"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          inputProps={{ maxLength: 6, inputMode: "numeric" }}
                        />
                        <Button onClick={handleVerifyOtp} disabled={otpCode.length < 6} className="btn-org btn-sm">
                          Verificar
                        </Button>
                      </div>
                      <Button size="small" className="!mt-3 !text-xs" onClick={handleSendOtp} disabled={cooldown > 0}>
                        {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Paso 2: Nueva contraseña */}
              {otpStep === "changing" && (
                <form className="mt-8" onSubmit={handleSubmitChangePassword}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="col">
                      <TextField
                        type={showPw.new ? "text" : "password"}
                        label="Nueva contrasena"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={changePassword.newPassword || ""}
                        onChange={(e) => setChangePassword(prev => ({ ...prev, newPassword: e.target.value }))}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                                {showPw.new ? <IoMdEyeOff /> : <IoMdEye />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {changePassword.newPassword && (
                        <div className="mt-1 text-[11px] space-y-0.5">
                          <div className={changePassword.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}>
                            {changePassword.newPassword.length >= 8 ? "✓" : "○"} 8 caracteres
                          </div>
                          <div className={/[A-Z]/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                            {/[A-Z]/.test(changePassword.newPassword) ? "✓" : "○"} 1 mayuscula
                          </div>
                          <div className={/\d/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                            {/\d/.test(changePassword.newPassword) ? "✓" : "○"} 1 numero
                          </div>
                          <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changePassword.newPassword) ? "✓" : "○"} 1 especial
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col">
                      <TextField
                        type={showPw.confirm ? "text" : "password"}
                        label="Confirmar contrasena"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        value={changePassword.confirmPassword || ""}
                        onChange={(e) => setChangePassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                                {showPw.confirm ? <IoMdEyeOff /> : <IoMdEye />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <br />

                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isLoading2} className="btn-org btn-sm w-[200px]">
                      {isLoading2 ? <CircularProgress color="inherit" /> : "Guardar Contraseña"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Collapse>



        </div>
      </div>
    </section>
  );
};

export default MyAccount;
