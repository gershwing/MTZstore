// admin/src/Pages/Profile/index.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import { Button, IconButton, InputAdornment, TextField, MenuItem } from '@mui/material';
import { editData, fetchDataFromApi, postData, uploadImage } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Collapse } from "react-collapse";
import { useAuth } from "../../hooks/useAuth";

const ROLE_LABELS = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    STORE_OWNER: "Vendedor",
    WAREHOUSE_STAFF: "Almacen",
    DELIVERY_PERSON: "Repartidor",
};

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

    const [formFields, setFormsFields] = useState({ firstName: '', lastName: '', email: '', mobile: '', birthDate: '', gender: '' });
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
            const fullName = u.name || '';
            const spaceIdx = fullName.indexOf(' ');
            const firstName = spaceIdx > -1 ? fullName.substring(0, spaceIdx) : fullName;
            const lastName = spaceIdx > -1 ? fullName.substring(spaceIdx + 1) : '';
            setFormsFields({
                firstName,
                lastName,
                email: u.email || '',
                mobile: u.mobile || '',
                birthDate: u.birthDate ? new Date(u.birthDate).toISOString().split('T')[0] : '',
                gender: u.gender || '',
            });
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

    const valideValue = Boolean(formFields.firstName && formFields.email && formFields.mobile);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!formFields.firstName) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese nombre"); }
        if (!formFields.email) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese email"); }
        if (!formFields.mobile) { setIsLoading(false); return alertBox?.("error", "Por favor ingrese celular"); }

        const payload = {
            name: (formFields.firstName + " " + formFields.lastName).trim(),
            email: formFields.email,
            mobile: formFields.mobile,
            birthDate: formFields.birthDate,
            gender: formFields.gender,
        };

        const res = await editData(`/api/user/${userId}`, payload, { withCredentials: true });
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

    // Derive initials and display name
    const displayName = ((formFields.firstName || '') + ' ' + (formFields.lastName || '')).trim();
    const initials = displayName ? displayName.substring(0, 2).toUpperCase() : '??';
    const avatarSrc = previews.length && previews[0] ? previews[0] : null;
    const u = me || user;
    const userRoles = u?.roles || (u?.role ? [u.role] : []);

    const inputClass = "w-full h-[45px] border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none px-4 text-sm transition";

    return (
        <>
            {/* Card 1 - Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="w-[128px] h-[128px] rounded-full overflow-hidden mb-4 relative group flex items-center justify-center">
                        {uploading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <CircularProgress color="inherit" />
                            </div>
                        ) : (
                            avatarSrc ? (
                                <img src={avatarSrc} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold">
                                    {initials}
                                </div>
                            )
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-full">
                            <FaCloudUploadAlt className="text-white text-2xl" />
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={onChangeFile} name="avatar" />
                        </div>
                    </div>

                    {/* Name & email */}
                    <h2 className="text-2xl font-bold text-gray-800">{displayName || 'Usuario'}</h2>
                    <p className="text-gray-500 mt-1">{formFields.email}</p>

                    {/* Role badges */}
                    {userRoles.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            {userRoles.map((role) => (
                                <span key={role} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {ROLE_LABELS[role] || role}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Card 2 - Personal Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Informacion personal
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Nombres */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Nombres</label>
                            <input
                                type="text"
                                className={inputClass}
                                name="firstName"
                                value={formFields.firstName}
                                disabled={isLoading}
                                onChange={onChangeInput}
                                placeholder="Nombres"
                            />
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Apellidos</label>
                            <input
                                type="text"
                                className={inputClass}
                                name="lastName"
                                value={formFields.lastName}
                                disabled={isLoading}
                                onChange={onChangeInput}
                                placeholder="Apellidos"
                            />
                        </div>

                        {/* Correo */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Correo</label>
                            <input
                                type="email"
                                className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                                name="email"
                                value={formFields.email}
                                disabled
                                onChange={onChangeInput}
                                placeholder="Correo"
                            />
                        </div>

                        {/* Telefono */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Telefono</label>
                            <PhoneInput
                                defaultCountry="bo"
                                value={phone}
                                disabled={isLoading}
                                onChange={(val) => { setPhone(val); setFormsFields(prev => ({ ...prev, mobile: val })); }}
                            />
                        </div>

                        {/* Fecha nacimiento */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Fecha nacimiento</label>
                            <input
                                type="date"
                                className={inputClass}
                                name="birthDate"
                                value={formFields.birthDate || ""}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            />
                        </div>

                        {/* Genero */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Genero</label>
                            <select
                                className={inputClass}
                                name="gender"
                                value={formFields.gender || ""}
                                disabled={isLoading}
                                onChange={onChangeInput}
                            >
                                <option value="">Seleccionar</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                                <option value="prefer_not_to_say">Prefiero no decir</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button type="submit" disabled={!valideValue || isLoading} className="btn-blue btn-lg w-full">
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Card 3 - Security */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                        Seguridad
                    </h3>
                    <Button onClick={handleTogglePasswordPanel}>
                        {isChangePasswordFormShow ? 'Cancelar' : 'Cambiar contrasena'}
                    </Button>
                </div>

                <Collapse isOpened={isChangePasswordFormShow}>
                    <hr className="mb-4" />

                    {/* Paso 1: Verificar OTP */}
                    {otpStep === "verifying" && (
                        <div className="mt-4">
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
                        <form className="mt-4" onSubmit={handleSubmitChangePassword}>
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
                            <div className="mt-6">
                                <Button type="submit" disabled={isLoading2} className="btn-blue btn-lg w-full">
                                    {isLoading2 ? <CircularProgress size={20} color="inherit" /> : "Guardar Contraseña"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Collapse>
            </div>
        </>
    );
};

export default Profile;
