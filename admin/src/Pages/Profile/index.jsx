// admin/src/Pages/Profile/index.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { editData, fetchDataFromApi, postData, uploadImage } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Collapse } from "react-collapse";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [userId, setUserId] = useState('');
    const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
    const [phone, setPhone] = useState('');

    // OTP flow
    const [otpStep, setOtpStep] = useState("idle");
    const [otpCode, setOtpCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);
    const [showPw, setShowPw] = useState({ new: false, confirm: false });

    const [formFields, setFormsFields] = useState({ name: '', email: '', mobile: '' });
    const [changePassword, setChangePassword] = useState({ newPassword: '', confirmPassword: '' });

    const history = useNavigate();
    const { isAuthenticated, me, user, alertBox, setUserData } = useAuth();

    // Countdown timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
        }
        return () => clearTimeout(cooldownRef.current);
    }, [cooldown]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token && !isAuthenticated) history("/login");
    }, [isAuthenticated, history]);

    useEffect(() => {
        const u = me || user;
        if (u?._id) {
            setUserId(u._id);
            setFormsFields({ name: u.name || '', email: u.email || '', mobile: u.mobile || '' });
            setPhone(u?.mobile ? String(u.mobile) : '');
        }
    }, [me, user]);

    useEffect(() => {
        const u = me || user;
        if (u?.avatar) setPreviews([u.avatar]);
    }, [me, user]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormsFields(prev => ({ ...prev, [name]: value }));
    };

    const valideValue = Boolean(formFields.name && formFields.email && formFields.mobile);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!formFields.name) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese nombre"); }
        if (!formFields.email) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese email"); }
        if (!formFields.mobile) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese celular"); }

        const res = await editData(`/api/user/${userId}`, formFields, { withCredentials: true });
        if (res?.error !== true) {
            alertBox?.("success", res?.message || "Perfil actualizado");
            const fresh = await fetchDataFromApi(`/api/user/user-details`, { withCredentials: true });
            if (fresh?.data) setUserData?.(fresh.data);
        } else {
            alertBox?.("error", res?.message || res?.data?.message || "Error al actualizar");
        }
        setIsLoading(false);
    };

    // OTP Paso 1: Enviar
    const handleSendOtp = async () => {
        const email = formFields.email || me?.email || user?.email;
        if (!email) return alertBox?.("error", "No se encontró el email");
        if (cooldown > 0) return;
        setOtpLoading(true);
        const res = await postData("/api/user/forgot-password", { email }, { withCredentials: true });
        setOtpLoading(false);
        if (res?.error !== true) {
            alertBox?.("success", "Código enviado a tu email");
            setOtpStep("verifying");
            setCooldown(60);
        } else {
            const match = res?.message?.match(/(\d+)s/);
            if (match) setCooldown(parseInt(match[1]));
            alertBox?.("error", res?.message || "No se pudo enviar el código");
        }
    };

    // OTP Paso 2: Verificar
    const handleVerifyOtp = async () => {
        const email = formFields.email || me?.email || user?.email;
        if (!otpCode || otpCode.length < 6) return alertBox?.("error", "Ingrese el código de 6 dígitos");
        setOtpLoading(true);
        const res = await postData("/api/user/verify-forgot-password-otp", { email, otp: otpCode }, { withCredentials: true });
        setOtpLoading(false);
        if (res?.error !== true) {
            alertBox?.("success", "Código verificado");
            setOtpStep("changing");
        } else {
            alertBox?.("error", res?.message || "Código inválido o expirado");
        }
    };

    // OTP Paso 3: Cambiar contraseña
    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();
        const email = formFields.email || me?.email || user?.email;
        if (!changePassword.newPassword) return alertBox?.("error", "Ingrese la nueva contraseña");
        if (!changePassword.confirmPassword) return alertBox?.("error", "Confirme su contraseña");
        if (changePassword.newPassword !== changePassword.confirmPassword) return alertBox?.("error", "Las contraseñas no coinciden");
        if (changePassword.newPassword.length < 8) return alertBox?.("error", "La contraseña debe tener al menos 8 caracteres");

        setIsLoading2(true);
        const res = await postData("/api/user/forgot-password/change-password", {
            email,
            newPassword: changePassword.newPassword,
            confirmPassword: changePassword.confirmPassword,
        }, { withCredentials: true });
        setIsLoading2(false);
        if (res?.error !== true) {
            alertBox?.("success", res?.message || "Contraseña actualizada");
            setChangePassword({ newPassword: '', confirmPassword: '' });
            setOtpStep("idle");
            setOtpCode("");
            setCooldown(0);
            setisChangePasswordFormShow(false);
        } else {
            alertBox?.("error", res?.message || "No se pudo cambiar la contraseña");
        }
    };

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

    // Upload avatar
    const onChangeFile = async (e) => {
        try {
            setPreviews([]);
            const files = e.target.files;
            if (!files || !files.length) return;
            setUploading(true);
            const formdata = new FormData();
            Array.from(files).forEach(f => {
                if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
                    throw new Error("Formato inválido");
                }
                formdata.append('avatar', f);
            });
            const res = await uploadImage("/api/user/user-avatar", formdata, { withCredentials: true });
            setUploading(false);
            const newAvatar = res?.avatar || res?.data?.avatar;
            if (newAvatar) {
                setPreviews([newAvatar]);
                alertBox?.("success", "Foto actualizada");
                const fresh = await fetchDataFromApi(`/api/user/user-details`, { withCredentials: true });
                if (fresh?.data) setUserData?.(fresh.data);
            } else {
                alertBox?.("error", "No se recibió el avatar nuevo");
            }
        } catch {
            setUploading(false);
            alertBox?.("error", "Sube JPG, PNG o WEBP válidos");
        }
    };

    return (
        <>
            <div className="card my-2 pt-3 w-[100%] sm:w-[100%] lg:w-[65%] shadow-md sm:rounded-lg bg-white px-5 pb-5">
                <div className='flex items-center justify-between'>
                    <h2 className="text-[18px] font-[600]">Perfil de Usuario</h2>
                    <Button className="!ml-auto" onClick={handleTogglePasswordPanel}>
                        Cambiar Contraseña
                    </Button>
                </div>

                <br />

                <div className="w-[110px] h-[110px] rounded-full overflow-hidden mb-4 relative group flex items-center justify-center bg-gray-200">
                    {uploading ? (
                        <CircularProgress color="inherit" />
                    ) : (
                        <>
                            {previews.length
                                ? previews.map((img, i) => (
                                    <img src={img} key={i} className="w-full h-full object-cover" alt="avatar" />
                                ))
                                : <img src={"/user.jpg"} className="w-full h-full object-cover" alt="avatar" />
                            }
                        </>
                    )}
                    <div className="overlay w-full h-full absolute top-0 left-0 z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer opacity-0 transition-all group-hover:opacity-100">
                        <FaCloudUploadAlt className="text-[#fff] text-[25px]" />
                        <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0" accept="image/*" onChange={onChangeFile} name="avatar" />
                    </div>
                </div>

                <form className="form mt-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="col">
                            <input type="text" className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm" name="name" value={formFields.name} disabled={isLoading} onChange={onChangeInput} placeholder="Nombre completo" />
                        </div>
                        <div className="col">
                            <input type="email" className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm" name="email" value={formFields.email} disabled onChange={onChangeInput} placeholder="Correo" />
                        </div>
                        <div className="col">
                            <PhoneInput defaultCountry="bo" value={phone} disabled={isLoading} onChange={(val) => { setPhone(val); setFormsFields(prev => ({ ...prev, mobile: val })); }} />
                        </div>
                    </div>
                    <br />
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={!valideValue || isLoading} className="btn-blue btn-lg w-full">
                            {isLoading ? <CircularProgress color="inherit" /> : 'Actualizar Perfil'}
                        </Button>
                    </div>
                </form>
            </div>

            <Collapse isOpened={isChangePasswordFormShow}>
                <div className="card w-[100%] sm:w-[100%] lg:w-[65%] bg-white p-5 shadow-md rounded-md mt-3">
                    <div className="flex items-center pb-3">
                        <h2 className="text-[18px] font-[600] pb-0">Cambiar Contraseña</h2>
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
                                        <TextField label="Código OTP" variant="outlined" size="small" className="w-[200px]" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputProps={{ maxLength: 6, inputMode: "numeric" }} />
                                        <Button onClick={handleVerifyOtp} disabled={otpCode.length < 6} className="btn-blue btn-sm">
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
                                        label="Nueva contraseña"
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
                                </div>
                                <div className="col">
                                    <TextField
                                        type={showPw.confirm ? "text" : "password"}
                                        label="Confirmar contraseña"
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
                                <Button type="submit" disabled={isLoading2} className="btn-blue btn-lg w-full">
                                    {isLoading2 ? <CircularProgress color="inherit" /> : "Guardar Contraseña"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Collapse>
        </>
    );
};

export default Profile;
