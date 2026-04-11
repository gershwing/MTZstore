// src/utils/storage.js

// Guardar valor en localStorage
export function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

// Cargar valor desde localStorage
export function loadLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error("Error loading from localStorage:", err);
    return fallback;
  }
}

// Eliminar valor de localStorage
export function removeLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Error removing from localStorage:", err);
  }
}
