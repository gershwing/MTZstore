import React, { useState, useEffect, useContext } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import { MyContext } from '../../App';
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { getDepartamentos, getProvincias, getCiudades } from '../../utils/boliviaData';

const AddAddress = () => {
    const [phone, setPhone] = useState('');
    const [addressType, setAddressType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Selects en cascada
    const [departamento, setDepartamento] = useState('');
    const [provincia, setProvincia] = useState('');
    const [ciudad, setCiudad] = useState('');

    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    const [formFields, setFormFields] = useState({
        address_line1: '',
        city: '',
        state: '',
        pincode: '',
        country: 'Bolivia',
        mobile: '',
        userId: '',
        addressType: '',
        landmark: '',
    });

    const context = useContext(MyContext);

    useEffect(() => {
        if (context?.userData?._id) {
            setFormFields((prev) => ({ ...prev, userId: context.userData._id }));
        }
    }, [context?.userData]);

    // Cascada: departamento -> provincias
    useEffect(() => {
        if (departamento) {
            setProvincias(getProvincias(departamento));
            // Si la provincia actual no pertenece al nuevo departamento, resetear
            const newProvs = getProvincias(departamento);
            if (!newProvs.includes(provincia)) {
                setProvincia('');
                setCiudad('');
                setCiudades([]);
            }
        } else {
            setProvincias([]);
            setProvincia('');
            setCiudades([]);
            setCiudad('');
        }
    }, [departamento]);

    // Cascada: provincia -> ciudades
    useEffect(() => {
        if (departamento && provincia) {
            setCiudades(getCiudades(departamento, provincia));
            const newCities = getCiudades(departamento, provincia);
            if (!newCities.includes(ciudad)) {
                setCiudad('');
            }
        } else {
            setCiudades([]);
            setCiudad('');
        }
    }, [provincia, departamento]);

    // Sync selects con formFields
    useEffect(() => {
        setFormFields((prev) => ({
            ...prev,
            state: departamento,
            city: ciudad,
            pincode: provincia, // Usamos pincode para guardar provincia
        }));
    }, [departamento, provincia, ciudad]);

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeAddressType = (event) => {
        setAddressType(event.target.value);
        setFormFields((prev) => ({ ...prev, addressType: event.target.value }));
    };

    // Cargar datos al editar
    useEffect(() => {
        if (context?.addressMode === 'edit') {
            fetchAddress(context?.addressId);
        }
    }, [context?.addressMode]);

    const fetchAddress = (id) => {
        fetchDataFromApi(`/api/address/${id}`).then((res) => {
            const addr = res?.address || res?.data?.address || res?.data;
            if (!addr) return;

            setFormFields({
                address_line1: addr.address_line1 || '',
                city: addr.city || '',
                state: addr.state || '',
                pincode: addr.pincode || '',
                country: addr.country || 'Bolivia',
                mobile: addr.mobile || '',
                userId: addr.userId || '',
                addressType: addr.addressType || '',
                landmark: addr.landmark || '',
            });

            // Restaurar selects
            setDepartamento(addr.state || '');
            setProvincia(addr.pincode || ''); // provincia guardada en pincode
            setCiudad(addr.city || '');
            setAddressType(addr.addressType || '');
            setPhone(addr.mobile || '');
        });
    };

    const resetForm = () => {
        setFormFields({
            address_line1: '',
            city: '',
            state: '',
            pincode: '',
            country: 'Bolivia',
            mobile: '',
            userId: context?.userData?._id || '',
            addressType: '',
            landmark: '',
        });
        setDepartamento('');
        setProvincia('');
        setCiudad('');
        setAddressType('');
        setPhone('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!departamento) {
            context.alertBox('error', 'Por favor selecciona un departamento');
            return;
        }
        if (!provincia) {
            context.alertBox('error', 'Por favor selecciona una provincia');
            return;
        }
        if (!ciudad) {
            context.alertBox('error', 'Por favor selecciona una ciudad');
            return;
        }
        if (!formFields.address_line1) {
            context.alertBox('error', 'Por favor ingresa la direccion (calle, zona)');
            return;
        }
        if (!phone || phone.length < 5) {
            context.alertBox('error', 'Por favor ingresa tu numero de celular');
            return;
        }
        if (!formFields.landmark) {
            context.alertBox('error', 'Por favor ingresa un punto de referencia');
            return;
        }
        if (!formFields.addressType) {
            context.alertBox('error', 'Por favor selecciona el tipo de direccion');
            return;
        }

        setIsLoading(true);

        if (context?.addressMode === 'add') {
            postData('/api/address/add', formFields, { withCredentials: true }).then((res) => {
                if (res?.error !== true) {
                    context.alertBox('success', res?.message || 'Direccion guardada');
                    setTimeout(() => {
                        context.setOpenAddressPanel(false);
                        setIsLoading(false);
                    }, 500);
                    context.getUserDetails();
                    resetForm();
                } else {
                    context.alertBox('error', res?.message);
                    setIsLoading(false);
                }
            });
        }

        if (context?.addressMode === 'edit') {
            editData(`/api/address/${context?.addressId}`, formFields, { withCredentials: true }).then(() => {
                fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`).then(() => {
                    setTimeout(() => {
                        setIsLoading(false);
                        context.setOpenAddressPanel(false);
                    }, 500);
                    context?.getUserDetails();
                    resetForm();
                });
            });
        }
    };

    return (
        <form className="p-4 py-3 pb-8 space-y-4" onSubmit={handleSubmit}>
            {/* 1. Dirección */}
            <TextField
                className="w-full"
                label="Direccion (calle, zona, numero)"
                variant="outlined"
                size="small"
                name="address_line1"
                onChange={onChangeInput}
                value={formFields.address_line1}
            />

            {/* 2. Punto de referencia */}
            <TextField
                className="w-full"
                label="Punto de referencia"
                variant="outlined"
                size="small"
                name="landmark"
                onChange={onChangeInput}
                value={formFields.landmark}
            />

            {/* 3. Teléfono */}
            <div>
                <PhoneInput
                    defaultCountry="bo"
                    value={phone}
                    onChange={(ph) => {
                        setPhone(ph);
                        setFormFields((prev) => ({ ...prev, mobile: ph }));
                    }}
                />
            </div>

            {/* 4. Tipo de dirección */}
            <FormControl>
                <FormLabel>Tipo de direccion</FormLabel>
                <RadioGroup
                    row
                    value={addressType}
                    onChange={handleChangeAddressType}
                    className="flex items-center gap-4"
                >
                    <FormControlLabel value="home" control={<Radio size="small" />} label="Casa" />
                    <FormControlLabel value="office" control={<Radio size="small" />} label="Oficina" />
                </RadioGroup>
            </FormControl>

            {/* 5. País */}
            <TextField
                className="w-full"
                label="Pais"
                variant="outlined"
                size="small"
                value="Bolivia"
                disabled
            />

            {/* 6. Departamento */}
            <FormControl fullWidth size="small">
                <InputLabel>Departamento</InputLabel>
                <Select
                    value={departamento}
                    label="Departamento"
                    onChange={(e) => setDepartamento(e.target.value)}
                    MenuProps={{ style: { zIndex: 10001 } }}
                >
                    {getDepartamentos().map((dep) => (
                        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* 7. Provincia */}
            <FormControl fullWidth size="small" disabled={!departamento}>
                <InputLabel>Provincia</InputLabel>
                <Select
                    value={provincia}
                    label="Provincia"
                    onChange={(e) => setProvincia(e.target.value)}
                    MenuProps={{ style: { zIndex: 10001 } }}
                >
                    {provincias.map((prov) => (
                        <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* 8. Ciudad / Municipio */}
            <FormControl fullWidth size="small" disabled={!provincia}>
                <InputLabel>Ciudad / Municipio</InputLabel>
                <Select
                    value={ciudad}
                    label="Ciudad / Municipio"
                    onChange={(e) => setCiudad(e.target.value)}
                    MenuProps={{ style: { zIndex: 10001 } }}
                >
                    {ciudades.map((city) => (
                        <MenuItem key={city} value={city}>{city}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Guardar */}
            <Button type="submit" className="btn-org btn-lg w-full flex gap-2 items-center">
                {isLoading ? <CircularProgress color="inherit" size={24} /> : 'Guardar'}
            </Button>
        </form>
    );
};

export default AddAddress;
