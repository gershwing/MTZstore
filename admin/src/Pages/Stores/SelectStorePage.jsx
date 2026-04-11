// admin/src/Pages/Stores/SelectStorePage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent } from "@mui/material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import AppContext from "../../context/AppContext";
import PageContainer from "../../layout/PageContainer";
import StorePicker from "../../Components/StorePicker";
import NewStoreDialog from "./NewStoreDialog";

const LOCK_KEY = "mtz:redirectLock";      // evita replaceState spam
const LOCK_MS = 4000;                     // 4s de ventana

function hasLock(target) {
  try {
    const raw = sessionStorage.getItem(LOCK_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw);
    if (!obj?.until || !obj?.to) return false;
    if (Date.now() > obj.until) return false;
    return obj.to === target;
  } catch {
    return false;
  }
}

function setLock(target) {
  try {
    sessionStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ to: target, until: Date.now() + LOCK_MS })
    );
  } catch { }
}

export default function SelectStorePage() {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();
  const redirectTo = sp.get("redirectTo") || "/admin/my-store";

  const [openNew, setOpenNew] = useState(false);

  // tiendas del usuario
  const stores = useMemo(() => {
    const raw = ctx?.userData?.stores || ctx?.user?.stores || [];
    return Array.isArray(raw) ? raw : [];
  }, [ctx?.userData, ctx?.user]);

  const active =
    ctx?.viewer?.activeStoreId ||
    (typeof window !== "undefined" ? localStorage.getItem("X-Store-Id") : null);

  // Si solo hay 1 tienda y no hay tenant → autoseleccionar una sola vez (con lock)
  useEffect(() => {
    if (active) return;
    if (stores.length !== 1) return;

    const only = stores[0]?._id || stores[0]?.id;
    if (!only) return;

    // establece tenant
    ctx?.setTenant?.(String(only));

    // navega solo si hace falta y no hay candado
    if (location.pathname !== redirectTo && !hasLock(redirectTo)) {
      setLock(redirectTo);
      // usa navigate replace UNA sola vez
      navigate(redirectTo, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores.length, active, ctx, navigate, redirectTo, location.pathname]);

  // Cambio manual desde el picker
  const handlePick = (id) => {
    if (!id) return;
    if (String(id) === String(active || "")) return; // ya es el mismo tenant

    ctx?.setTenant?.(String(id));

    if (location.pathname !== redirectTo && !hasLock(redirectTo)) {
      setLock(redirectTo);
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full" style={{ maxWidth: 960 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Selecciona tu tienda</h1>
          <Button variant="outlined" size="small" onClick={() => setOpenNew(true)}>
            Crear nueva tienda
          </Button>
        </div>

        {/* Selector principal */}
        <div className="mb-6">
          <StorePicker allowClear={false} onChange={handlePick} />
        </div>

        {/* Fallback visual */}
        {stores.length === 0 ? (
          <Card>
            <CardContent>
              Aún no tienes tiendas. Crea una para comenzar.
              <div className="mt-3">
                <Button variant="contained" onClick={() => setOpenNew(true)}>
                  Crear tienda
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stores.map((s) => {
              const id = s?._id || s?.id;
              const name = s?.name || s?.title || "Tienda";
              return (
                <Card key={id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-500">{String(id)}</div>
                    </div>
                    <Button size="small" variant="contained" onClick={() => handlePick(id)}>
                      Usar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <NewStoreDialog
          open={openNew}
          onClose={() => setOpenNew(false)}
          onCreated={(newId) => {
            if (!newId) return;
            ctx?.setTenant?.(String(newId));
            if (location.pathname !== redirectTo && !hasLock(redirectTo)) {
              setLock(redirectTo);
              navigate(redirectTo, { replace: true });
            }
          }}
        />
      </div>
    </PageContainer>
  );
}
