// src/utils/api.js
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// Reutilizar headers de auth sin cambiar tu patrón actual
const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

// --- POST (mantengo fetch como lo tienes)
export const postData = async (url, formData) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const json = await response.json();
        return json; // conservamos tu contrato actual
    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: String(error) };
    }
};

// --- GET (axios) sin cambios de contrato
export const fetchDataFromApi = async (url) => {
    try {
        const params = {
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            },
        };
        const { data } = await axios.get(apiUrl + url, params);
        return data;
    } catch (error) {
        console.log(error);
        return error; // conservamos tu retorno actual
    }
};

// --- PUT multipart (no forzar Content-Type para que ponga el boundary)
export const uploadImage = async (url, updatedData) => {
    const params = {
        headers: {
            ...authHeaders(),
            // ¡No seteamos 'Content-Type': el navegador lo define con boundary!
        },
    };
    let response;
    await axios.put(apiUrl + url, updatedData, params).then((res) => {
        response = res;
    });
    return response;
};

// --- PUT JSON (igual que tenías)
export const editData = async (url, updatedData) => {
    const params = {
        headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
        },
    };
    let response;
    await axios.put(apiUrl + url, updatedData, params).then((res) => {
        response = res;
    });
    return response;
};

// --- DELETE (corrige: axios devuelve .data, no { res })
export const deleteData = async (url) => {
    const params = {
        headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
        },
    };
    const { data } = await axios.delete(apiUrl + url, params);
    return data; // <- fix
};

// --- PATCH (para reapply y otros)
export const patchData = async (url, formData) => {
    try {
        const response = await fetch(apiUrl + url, {
            method: 'PATCH',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: String(error) };
    }
};

// --- Helpers ligeros (opcional, no rompe nada)
// FX: R = BOB por 1 USDT
export const getFxLatest = () => fetchDataFromApi('/fx/latest');

// Productos (por si lo quieres usar en listados/detalle)
export const getProducts = (query = '') => fetchDataFromApi(`/products${query}`);
export const getProductById = (id) => fetchDataFromApi(`/products/${id}`);
