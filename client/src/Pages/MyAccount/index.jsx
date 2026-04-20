import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, IconButton, InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { editData, postData, uploadImage, fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Collapse } from "react-collapse";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import MenuItem from "@mui/material/MenuItem";
import { FaCloudUploadAlt } from "react-icons/fa";

const MyAccount = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState({ new: false, confirm: false });

  // Avatar upload
  const [avatarPreviews, setAvatarPreviews] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // OTP flow: idle → verifying → changing
  const [otpStep, setOtpStep] = useState("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // Countdown timer para reenvio
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  const [formFields, setFormsFields] = useState({
    firstName: '',
    lastName: '',
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
    // Solo redirigir si no hay token Y el contexto ya termino de cargar
    if (!token && context?.isLogin === false) {
      history("/");
    }
  }, [context?.isLogin])

  useEffect(() => {
    if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {
      setUserId(context?.userData?._id);

      // Split name into firstName and lastName
      const fullName = context?.userData?.name || "";
      const spaceIndex = fullName.indexOf(" ");
      const firstName = spaceIndex > -1 ? fullName.substring(0, spaceIndex) : fullName;
      const lastName = spaceIndex > -1 ? fullName.substring(spaceIndex + 1) : "";

      setTimeout(() => {
        setFormsFields({
          firstName,
          lastName,
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

      // Load avatar
      if (context?.userData?.avatar !== "" && context?.userData?.avatar !== undefined) {
        setAvatarPreviews([context.userData.avatar]);
      }

      setChangePassword({ newPassword: '', confirmPassword: '' })
    }

  }, [context?.userData])

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(prev => ({ ...prev, [name]: value }));
    setChangePassword(prev => ({ ...prev, [name]: value }));
  }

  const valideValue = formFields.firstName && formFields.email && formFields.mobile;

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    // Combine firstName + lastName back into name
    const combinedName = (formFields.firstName + " " + formFields.lastName).trim();

    if (formFields.firstName === "") {
      context.alertBox("error", "Por favor ingrese su nombre");
      setIsLoading(false);
      return false
    }

    if (formFields.email === "") {
      context.alertBox("error", "Por favor ingrese su correo");
      setIsLoading(false);
      return false
    }

    if (formFields.mobile === "") {
      context.alertBox("error", "Por favor ingrese su celular");
      setIsLoading(false);
      return false
    }

    const dataToSend = {
      name: combinedName,
      email: formFields.email,
      mobile: formFields.mobile,
      birthDate: formFields.birthDate,
      gender: formFields.gender,
    };

    editData(`/api/user/${userId}`, dataToSend, { withCredentials: true }).then((res) => {
      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.data?.message);
      } else {
        context.alertBox("error", res?.data?.message);
        setIsLoading(false);
      }
    })
  }

  // Avatar upload handler
  const onChangeAvatarFile = async (e) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!(file.type === "image/jpeg" || file.type === "image/jpg" ||
        file.type === "image/png" || file.type === "image/webp")) {
        context.alertBox("error", "Por favor selecciona una imagen JPG, PNG o WebP valida.");
        return;
      }

      setAvatarUploading(true);
      const formdata = new FormData();
      formdata.append("avatar", file);

      uploadImage("/api/user/user-avatar", formdata).then((res) => {
        setAvatarUploading(false);
        const avatar = res?.data?.data?.avatar || res?.data?.avatar || res?.avatar;
        if (avatar) {
          setAvatarPreviews([avatar]);
        }
        context.alertBox("success", "Foto de perfil actualizada!");
        fetchDataFromApi(`/api/user/user-details`).then((res) => {
          context?.setUserData(res.data);
        });
      });
    } catch (error) {
      console.log(error);
      setAvatarUploading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = context?.userData?.name || "U";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  // Paso 1: Enviar OTP al email
  const handleSendOtp = async () => {
    const email = formFields.email || context?.userData?.email;
    if (!email) return context.alertBox("error", "No se encontro el email");
    if (cooldown > 0) return;
    setOtpLoading(true);
    const res = await postData("/api/user/forgot-password", { email });
    setOtpLoading(false);
    if (res?.error !== true) {
      context.alertBox("success", "Codigo enviado a tu email");
      setOtpStep("verifying");
      setCooldown(60);
    } else {
      const match = res?.message?.match(/(\d+)s/);
      if (match) setCooldown(parseInt(match[1]));
      context.alertBox("error", res?.message || "No se pudo enviar el codigo");
    }
  };

  // Paso 2: Verificar OTP
  const handleVerifyOtp = async () => {
    const email = formFields.email || context?.userData?.email;
    if (!otpCode || otpCode.length < 6) return context.alertBox("error", "Ingrese el codigo de 6 digitos");
    setOtpLoading(true);
    const res = await postData("/api/user/verify-forgot-password-otp", { email, otp: otpCode });
    setOtpLoading(false);
    if (res?.error !== true) {
      context.alertBox("success", "Codigo verificado");
      setOtpStep("changing");
    } else {
      context.alertBox("error", res?.message || "Codigo invalido o expirado");
    }
  };

  // Paso 3: Guardar nueva contrasena
  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    const email = formFields.email || context?.userData?.email;
    if (!changePassword.newPassword) return context.alertBox("error", "Ingrese la nueva contrasena");
    if (!changePassword.confirmPassword) return context.alertBox("error", "Confirme su contrasena");
    if (changePassword.newPassword !== changePassword.confirmPassword) return context.alertBox("error", "Las contrasenas no coinciden");
    if (changePassword.newPassword.length < 8) return context.alertBox("error", "La contrasena debe tener al menos 8 caracteres");

    setIsLoading2(true);
    const res = await postData("/api/user/forgot-password/change-password", {
      email,
      newPassword: changePassword.newPassword,
      confirmPassword: changePassword.confirmPassword,
    });
    setIsLoading2(false);
    if (res?.error !== true) {
      context.alertBox("success", res?.message || "Contrasena actualizada");
      setChangePassword({ newPassword: '', confirmPassword: '' });
      setOtpStep("idle");
      setOtpCode("");
      setisChangePasswordFormShow(false);
    } else {
      context.alertBox("error", res?.message || "No se pudo cambiar la contrasena");
    }
  };

  // Abrir panel + enviar OTP
  const handleTogglePasswordPanel = () => {
    if (isChangePasswordFormShow) {
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

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar with upload overlay */}
              <div className="w-[128px] h-[128px] rounded-full overflow-hidden relative group flex-shrink-0 flex items-center justify-center bg-gray-200 ring-4 ring-blue-50">
                {avatarUploading ? (
                  <CircularProgress color="inherit" />
                ) : (
                  <>
                    {avatarPreviews.length > 0 && avatarPreviews[0] ? (
                      <img
                        src={avatarPreviews[0]}
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[40px] font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </>
                )}
                <div className="overlay w-full h-full absolute top-0 left-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 rounded-full">
                  <FaCloudUploadAlt className="text-white text-[28px]" />
                  <input
                    type="file"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={onChangeAvatarFile}
                    name="avatar"
                  />
                </div>
              </div>

              {/* Name & Email */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {context?.userData?.name || "Usuario"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {context?.userData?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Informacion personal</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <TextField
                    label="Nombres"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="firstName"
                    value={formFields.firstName || ""}
                    disabled={isLoading}
                    onChange={onChangeInput}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>

                <div>
                  <TextField
                    label="Apellidos"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="lastName"
                    value={formFields.lastName || ""}
                    disabled={isLoading}
                    onChange={onChangeInput}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>

                <div>
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
                    InputLabelProps={{ shrink: true }}
                  />
                </div>

                <div>
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

                <div>
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

                <div>
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

              <div className="mt-6">
                <Button type="submit" disabled={!valideValue} className="btn-org btn-sm w-[160px]">
                  {isLoading ? <CircularProgress color="inherit" size={22} /> : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Seguridad</h3>
            </div>

            <Button
              className={isChangePasswordFormShow ? "btn-org btn-sm" : "btn-org btn-sm"}
              onClick={handleTogglePasswordPanel}
            >
              {isChangePasswordFormShow ? "Cancelar" : "Cambiar contrasena"}
            </Button>

            <Collapse isOpened={isChangePasswordFormShow}>
              <div className="mt-6 pt-5 border-t border-gray-100">

                {/* Paso 1: Verificar OTP */}
                {otpStep === "verifying" && (
                  <div>
                    {otpLoading ? (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CircularProgress size={20} />
                        <span>Enviando codigo a tu email...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-4">
                          Enviamos un codigo de verificacion a tu email. Ingresalo para continuar.
                        </p>
                        <div className="flex items-center gap-3">
                          <TextField
                            label="Codigo OTP"
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
                          {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar codigo"}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Paso 2: Nueva contrasena */}
                {otpStep === "changing" && (
                  <form onSubmit={handleSubmitChangePassword}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
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
                          <div className="mt-2 text-[11px] space-y-0.5">
                            <div className={changePassword.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}>
                              {changePassword.newPassword.length >= 8 ? "\u2713" : "\u25CB"} 8 caracteres
                            </div>
                            <div className={/[A-Z]/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                              {/[A-Z]/.test(changePassword.newPassword) ? "\u2713" : "\u25CB"} 1 mayuscula
                            </div>
                            <div className={/\d/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                              {/\d/.test(changePassword.newPassword) ? "\u2713" : "\u25CB"} 1 numero
                            </div>
                            <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changePassword.newPassword) ? "text-green-600" : "text-gray-400"}>
                              {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(changePassword.newPassword) ? "\u2713" : "\u25CB"} 1 especial
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
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

                    <div className="mt-6">
                      <Button type="submit" disabled={isLoading2} className="btn-org btn-sm w-[200px]">
                        {isLoading2 ? <CircularProgress color="inherit" size={22} /> : "Guardar Contrasena"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Collapse>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MyAccount;
