// src/firebase.js  (ajusta la ruta/nombre si usas otro)

const VITE_FIREBASE_APP_API_KEY = import.meta.env.VITE_FIREBASE_APP_API_KEY;
const VITE_FIREBASE_APP_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_APP_AUTH_DOMAIN;
const VITE_FIREBASE_APP_PROJECT_ID = import.meta.env.VITE_FIREBASE_APP_PROJECT_ID;
const VITE_FIREBASE_APP_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_APP_STORAGE_BUCKET;
const VITE_FIREBASE_APP_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_APP_MESSAGING_SENDER_ID;
const VITE_FIREBASE_APP_APP_ID = import.meta.env.VITE_FIREBASE_APP_APP_ID;
const VITE_FIREBASE_APP_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_APP_MEASUREMENT_ID;

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

// --- Configuración ---
const firebaseConfig = {
  apiKey: VITE_FIREBASE_APP_API_KEY,
  authDomain: VITE_FIREBASE_APP_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_APP_PROJECT_ID,
  storageBucket: VITE_FIREBASE_APP_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_APP_ID,
  measurementId: VITE_FIREBASE_APP_MEASUREMENT_ID,
};

// --- Inicialización base ---
export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
// persistencia en el navegador (evita perder sesión al refrescar)
setPersistence(auth, browserLocalPersistence);

// --- Provider Google con “select account” ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ===== Helpers clave =====

// 1) Intento de popup directo; si el navegador bloquea, hace fallback a redirect
export async function googleSignInInteractive() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred; // tenemos userCredential
  } catch (e) {
    if (e?.code === "auth/popup-blocked" || e?.code === "auth/popup-closed-by-user") {
      // Safari/iOS/Settings estrictos → usa redirect
      await signInWithRedirect(auth, googleProvider);
      return null; // el flujo continuará al volver con completeGoogleRedirectIfAny()
    }
    throw e;
  }
}

// 2) Completar el flujo si venimos de redirect (llámalo en useEffect al montar Login)
export async function completeGoogleRedirectIfAny() {
  const cred = await getRedirectResult(auth);
  return cred || null;
}

// 3) Obtener el ID token de Firebase del usuario actual
export async function getFirebaseIdToken(forceRefresh = true) {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}
