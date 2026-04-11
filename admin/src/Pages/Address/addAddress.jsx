// src/Pages/Address/addAddress.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { FaCloudUploadAlt } from "react-icons/fa";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { fetchDataFromApi, postData } from '../../utils/api';
// ✅ usa named export (no default)
import { AppContext } from "../../context/AppContext";
// ✅ mejor aún: usa el hook unificado para identidad/roles
import { useAuth } from "../../hooks/useAuth";

const AddAddress = () => {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(false); // para futuros PATCH

    // Contexto (solo para setters/alertas de UI si existen)
    const context = useContext(AppContext) || {};
    // Identidad unificada
    const { me } = useAuth() || {};

    // Notificador defensivo (no rompe si no hay provider o alertBox)
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        if (typeof context?.alertBox === "function") return context.alertBox(type, text);
        try { window.alert(text); } catch { }
    };

    const [formFields, setFormsFields] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',        // o usa postalCode; el server acepta ambos
        country: '',
        mobile: '',
        isDefault: false,   // backend usa isDefault
        addressType: 'home',
        // userId: NO lo envíes (el server lo toma del token)
    });

    useEffect(() => {
        // Si quieres prefijar algo del usuario autenticado:
        // setFormsFields(prev => ({ ...prev, fullName: me?.name || '' }));
    }, [me?.name]);

    const handleChangeStatus = (event) => {
        const value = event.target.value === true || event.target.value === 'true';
        setStatus(value);
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormsFields(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validaciones mínimas
        if (!formFields.address_line1?.trim()) { notify("error", "Por favor ingrese la Dirección (Línea 1)"); setIsLoading(false); return; }
        if (!formFields.city?.trim()) { notify("error", "Por favor ingrese su Ciudad"); setIsLoading(false); return; }
        if (!formFields.state?.trim()) { notify("error", "Por favor ingrese su Estado/Provincia"); setIsLoading(false); return; }
        if (!formFields.pincode?.trim()) { notify("error", "Por favor ingrese su Código Postal"); setIsLoading(false); return; }
        if (!formFields.country?.trim()) { notify("error", "Por favor ingrese su País"); setIsLoading(false); return; }
        if (!phone?.trim()) { notify("error", "Por favor ingrese su número de celular"); setIsLoading(false); return; }

        try {
            const payload = {
                ...formFields,
                mobile: phone,
                // postalCode: formFields.pincode, // opcional si prefieres ese nombre
            };

            // Crear dirección
            const res = await postData(`/api/address`, payload, { withCredentials: true });

            if (res?.error !== true) {
                notify("success", res?.data?.message || "Dirección creada");

                // Cerrar panel (si tu UI lo usa)
                context?.setIsOpenFullScreenPanel?.({ open: false });

                // Refrescar lista
                const list = await fetchDataFromApi(`/api/address`, { withCredentials: true });
                context?.setAddress?.(list?.data);
            } else {
                notify("error", res?.data?.message || "No se pudo guardar");
            }
        } catch {
            notify("error", "Error de red/servidor al guardar la dirección");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className='p-5 bg-gray-50'>
            <form className='form py-3 p-8' onSubmit={handleSubmit}>
                <div className='scroll max-h-[72vh] overflow-y-scroll pr-4 pt-4'>
                    <div className='grid grid-cols-2 mb-3 gap-4'>
                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Dirección (Línea 1)</h3>
                            <input
                                type="text"
                                name="address_line1"
                                onChange={onChangeInput}
                                value={formFields.address_line1}
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            />
                        </div>

                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Dirección (Línea 2)</h3>
                            <input
                                type="text"
                                name="address_line2"
                                onChange={onChangeInput}
                                value={formFields.address_line2}
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-3 mb-3 gap-4'>
                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Departamento</h3>
                            <input
                                type="text"
                                name="state"
                                onChange={onChangeInput}
                                value={formFields.state}
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            />
                        </div>

                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Código Postal</h3>
                            <input
                                type="text"
                                name="pincode"
                                onChange={onChangeInput}
                                value={formFields.pincode}
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            />
                        </div>

                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> País</h3>
                            <input
                                type="text"
                                name="country"
                                onChange={onChangeInput}
                                value={formFields.country}
                                className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            />
                        </div>

                        <div className='col w-[100%]'>
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Teléfono Móvil</h3>
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

                        <div className="col w-[100%]">
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Por defecto</h3>
                            <Select
                                value={formFields.isDefault}
                                onChange={(e) => setFormsFields(prev => ({ ...prev, isDefault: Boolean(e.target.value) }))}
                                size="small"
                                className="w-full"
                            >
                                <MenuItem value={true}>Sí</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </div>

                        <div className="col w-[100%]">
                            <h3 className='text-[14px] font-[500] mb-1 text-black'> Estado (opcional)</h3>
                            <Select
                                value={status}
                                onChange={handleChangeStatus}
                                size="small"
                                className="w-full"
                            >
                                <MenuItem value={true}>Activo</MenuItem>
                                <MenuItem value={false}>Inactivo</MenuItem>
                            </Select>
                        </div>
                    </div>
                </div>

                <br /><br />
                <div className='w-[250px]'>
                    <Button type="submit" disabled={isLoading} className="btn-blue btn-lg w-full flex gap-2">
                        <FaCloudUploadAlt className='text-[25px] text-white' />
                        {isLoading ? 'Guardando…' : 'Publicar y Ver'}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AddAddress;
