// admin/src/Pages/Profile/index.jsx
import React, { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { editData, fetchDataFromApi, postData, uploadImage } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Collapse } from "react-collapse";

// ✅ usar el hook centralizado
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [userId, setUserId] = useState('');
    const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
    const [phone, setPhone] = useState('');

    const [formFields, setFormsFields] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    const [changePassword, setChangePassword] = useState({
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const history = useNavigate();

    // 🧩 desde useAuth
    const {
        isAuthenticated,
        me,                    // usuario enriquecido
        user,                  // usuario crudo (por si lo prefieres)
        alertBox,              // passthrough opcional desde contexto
        setUserData,           // passthrough opcional para refrescar user
    } = useAuth();

    // gate por token / auth
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token || !isAuthenticated) {
            history("/login");
        }
    }, [isAuthenticated, history]);

    // cargar datos del usuario (prefiere `me`, fallback `user`)
    useEffect(() => {
        const u = me || user;
        if (u?._id) {
            setUserId(u._id);
            setFormsFields({
                name: u.name || '',
                email: u.email || '',
                mobile: u.mobile || ''
            });

            // PhoneInput requiere string con prefijo país
            setPhone(u?.mobile ? String(u.mobile) : '');

            // para cambiar contraseña
            setChangePassword(prev => ({
                ...prev,
                email: u?.email || ''
            }));
        }
    }, [me, user]);

    // previsualización avatar
    useEffect(() => {
        const u = me || user;
        const userAvatar = [];
        if (u?.avatar) {
            userAvatar.push(u.avatar);
            setPreviews(userAvatar);
        }
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
            // refrescar user (server tiene /api/user/user-details)
            const fresh = await fetchDataFromApi(`/api/user/user-details`, { withCredentials: true });
            if (fresh?.data) setUserData?.(fresh.data);
        } else {
            alertBox?.("error", res?.message || res?.data?.message || "Error al actualizar");
        }
        setIsLoading(false);
    };

    const valideValue2 = Boolean(changePassword.oldPassword && changePassword.newPassword && changePassword.confirmPassword);

    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();
        setIsLoading2(true);

        if (!changePassword.oldPassword) { setIsLoading2(false); return alertBox?.("error", "Ingrese contraseña actual"); }
        if (!changePassword.newPassword) { setIsLoading2(false); return alertBox?.("error", "Ingrese nueva contraseña"); }
        if (!changePassword.confirmPassword) { setIsLoading2(false); return alertBox?.("error", "Confirme su contraseña"); }
        if (changePassword.confirmPassword !== changePassword.newPassword) {
            setIsLoading2(false);
            return alertBox?.("error", "La confirmación no coincide");
        }

        const payload = {
            email: changePassword.email || formFields.email,
            oldPassword: changePassword.oldPassword,
            newPassword: changePassword.newPassword
        };

        const res = await postData(`/api/user/reset-password`, payload, { withCredentials: true });
        if (res?.error !== true) {
            alertBox?.("success", res?.message || "Contraseña actualizada");
            setChangePassword(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
        } else {
            alertBox?.("error", res?.message || res?.data?.message || "No se pudo cambiar la contraseña");
        }
        setIsLoading2(false);
    };

    // Upload avatar -> /api/user/user-avatar
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

            const newAvatar = res?.avatar || res?.data?.avatar; // el server retorna { _id, avatar }
            if (newAvatar) {
                setPreviews([newAvatar]);
                alertBox?.("success", "¡Foto actualizada!");
                // refrescar user
                const fresh = await fetchDataFromApi(`/api/user/user-details`, { withCredentials: true });
                if (fresh?.data) setUserData?.(fresh.data);
            } else {
                alertBox?.("error", "No se recibió el avatar nuevo");
            }
        } catch (error) {
            setUploading(false);
            alertBox?.("error", "Sube JPG, PNG o WEBP válidos");
        }
    };

    return (
        <>
            <div className="card my-2 pt-3 w-[100%] sm:w-[100%] lg:w-[65%] shadow-md sm:rounded-lg bg-white px-5 pb-5">
                <div className='flex items-center justify-between'>
                    <h2 className="text-[18px] font-[600]">Perfil de Usuario</h2>
                    <Button className="!ml-auto" onClick={() => setisChangePasswordFormShow(v => !v)}>Cambiar Contraseña</Button>
                </div>

                <br />

                <div className="w-[110px] h-[110px] rounded-full overflow-hidden mb-4 relative group flex items-center justify-center bg-gray-200">
                    {uploading ? (
                        <CircularProgress color="inherit" />
                    ) : (
                        <>
                            {previews.length
                                ? previews.map((img, i) => (
                                    <img src={img} key={i} className="w-full h-full object-cover" />
                                ))
                                : <img src={"/user.jpg"} className="w-full h-full object-cover" />
                            }
                        </>
                    )}

                    <div className="overlay w-full h-full absolute top-0 left-0 z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer opacity-0 transition-all group-hover:opacity-100">
                        <FaCloudUploadAlt className="text-[#fff] text-[25px]" />
                        <input
                            type="file"
                            className="absolute top-0 left-0 w-full h-full opacity-0"
                            accept="image/*"
                            onChange={onChangeFile}
                            name="avatar"
                        />
                    </div>
                </div>

                <form className="form mt-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="col">
                            <input
                                type="text"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="name"
                                value={formFields.name}
                                disabled={isLoading}
                                onChange={onChangeInput}
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div className="col">
                            <input
                                type="email"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                name="email"
                                value={formFields.email}
                                disabled
                                onChange={onChangeInput}
                                placeholder="Correo"
                            />
                        </div>

                        <div className="col">
                            <PhoneInput
                                defaultCountry="bo"
                                value={phone}
                                disabled={isLoading}
                                onChange={(val) => {
                                    setPhone(val);
                                    setFormsFields(prev => ({ ...prev, mobile: val }));
                                }}
                            />
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
                <div className="card w-[100%] sm:w-[100%] lg:w-[65%] bg-white p-5 shadow-md rounded-md">
                    <div className="flex items-center pb-3">
                        <h2 className="text-[18px] font-[600] pb-0">Cambiar Contraseña</h2>
                    </div>
                    <hr />

                    <form className="mt-8" onSubmit={handleSubmitChangePassword}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="col">
                                <input
                                    type="password"
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                    name="oldPassword"
                                    value={changePassword.oldPassword}
                                    disabled={isLoading2}
                                    onChange={(e) => setChangePassword(prev => ({ ...prev, oldPassword: e.target.value }))}
                                    placeholder="Contraseña Actual"
                                />
                            </div>

                            <div className="col">
                                <input
                                    type="password"
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                    name="newPassword"
                                    value={changePassword.newPassword}
                                    disabled={isLoading2}
                                    onChange={(e) => setChangePassword(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Nueva Contraseña"
                                />
                            </div>

                            <div className="col">
                                <input
                                    type="password"
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
                                    name="confirmPassword"
                                    value={changePassword.confirmPassword}
                                    disabled={isLoading2}
                                    onChange={(e) => setChangePassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="Confirmar Contraseña"
                                />
                            </div>
                        </div>

                        <br />

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={!valideValue2 || isLoading2} className="btn-blue btn-lg w-[100%]">
                                {isLoading2 ? <CircularProgress color="inherit" /> : 'Cambiar Contraseña'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Collapse>
        </>
    );
};

export default Profile;
