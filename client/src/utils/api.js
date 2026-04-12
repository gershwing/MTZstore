// src/utils/api.js
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// Reutilizar headers de auth sin cambiar tu patrón actual
const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

// Auto-refresh: renueva el access token usando el refresh token
let _refreshPromise = null;
async function tryRefreshToken() {
    if (_refreshPromise) return _refreshPromise;
    _refreshPromise = (async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return false;
            const res = await fetch(apiUrl + '/api/user/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include',
            });
            const data = await res.json();
            if (data?.error === false && data?.data?.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken);
                if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
                return true;
            }
            return false;
        } catch { return false; }
        finally { _refreshPromise = null; }
    })();
    return _refreshPromise;
}

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

        // Auto-refresh on 401
        if (response.status === 401 && !url.includes('refresh-token') && !url.includes('login')) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                const retry = await fetch(apiUrl + url, {
                    method: 'POST',
                    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                return await retry.json();
            }
        }

        const json = await response.json();
        return json;
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
        // Auto-refresh on 401
        if (error?.response?.status === 401 && !url.includes('refresh-token')) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                const { data } = await axios.get(apiUrl + url, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
                return data;
            }
        }
        console.log(error);
        return error;
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
