// admin/src/Pages/Auth/GoogleCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { afterLogin } from "@/utils/session";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Intercambia el "code" por tokens/sesión en tu backend (ajusta la ruta si es distinta).
        const res = await api.post(
          "/api/user/authWithGoogle/callback",
          {},
          {
            withCredentials: true,
            __public: true,
            __noTenant: true,        // ← no enviar X-Store-Id
            omitTenantHeader: true,  // ← redundante pero explícito
            __noRetry401: true,      // ← evita cascada de refresh si falla
          }
        );

        // afterLogin ya: limpia tenant, persiste tokens, /me sin tenant, fija defaultStoreId y navega a /admin
        await afterLogin({ apiData: res?.data, navigate });
      } catch {
        // Si tu backend usa otra ruta o falla el intercambio, redirige con marca de error.
        navigate("/login?error=google", { replace: true });
      }
    })();
  }, [navigate]);

  return null; // (puedes renderizar un spinner si quieres)
}
