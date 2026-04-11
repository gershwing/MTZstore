// admin/src/Pages/Products/InventoryTab.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, TextField, Tooltip } from "@mui/material";
import { getMovements, getStock } from "../../services/inventory";
import MovementForm from "../../Components/Inventory/MovementForm";
import MovementTable from "../../Components/Inventory/MovementTable";
import Badge from "../../Components/Badge";
import { usePermission } from "../../hooks/usePermission";
import toast from "react-hot-toast";

export default function InventoryTab({ productId, initialLocation = "", stockMinimo = 0 }) {
  const [location, setLocation] = useState(initialLocation);
  const [stock, setStock] = useState(null);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  // Evitar notificaciones duplicadas
  const lowNotifiedRef = useRef(false);

  // Permisos granulares
  const { any: canRead } = usePermission(["inventory:read"]);
  const { any: canAdjust } = usePermission(["inventory:adjust"]);
  const { any: canReserve } = usePermission(["inventory:reserve"]);
  const { any: canRelease } = usePermission(["inventory:release"]);
  const { any: canMove } = usePermission(["inventory:move"]);

  const disabledActions = useMemo(
    () => ({
      adjust: !canAdjust,
      reserve: !canReserve,
      release: !canRelease,
      move: !canMove,
    }),
    [canAdjust, canReserve, canRelease, canMove]
  );

  const notifyLowIfNeeded = (s) => {
    const isLowNext = s != null && Number(s) <= Number(stockMinimo ?? 0);
    if (isLowNext && !lowNotifiedRef.current) {
      toast.error(`Stock bajo: ${s} (mínimo ${stockMinimo})`, { id: `low-${productId}` });
      lowNotifiedRef.current = true;
    } else if (!isLowNext && lowNotifiedRef.current) {
      // si vuelve a estar por encima del mínimo, permitimos notificar de nuevo en el futuro
      lowNotifiedRef.current = false;
    }
  };

  const refreshStock = async () => {
    const res = await getStock(productId, location || undefined);
    if (res?.error === false) {
      const next = res?.stock ?? 0;
      setStock(next);
      notifyLowIfNeeded(next);
    }
  };

  const refreshMovements = async (p = 1) => {
    const res = await getMovements({ productId, page: p, limit: 10 });
    if (res?.error === false) {
      setRows(res?.data || []);
      setMeta({ totalPages: res?.totalPages || 1 });
      setPage(p);
    }
  };

  useEffect(() => {
    if (!canRead) return;
    refreshStock();
    refreshMovements(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, location, canRead]);

  // Si cambia el umbral, re-evaluamos
  useEffect(() => {
    notifyLowIfNeeded(stock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockMinimo]);

  const handleDone = (ok, err) => {
    if (!ok) {
      console.error(err);
      return;
    }
    refreshStock();
    refreshMovements(page);
  };

  if (!canRead) {
    return (
      <div className="p-4">
        <p>No tienes permisos para ver inventario.</p>
      </div>
    );
  }

  const isLow = stock != null && Number(stock) <= Number(stockMinimo ?? 0);

  return (
    <div className="p-4">
      {/* Header: selector de ubicación + stock */}
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <TextField
            size="small"
            fullWidth
            label="Ubicación (opcional)"
            placeholder="Ej: Almacén Central / Sucursal 1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button className="btn" onClick={refreshStock}>
            Actualizar stock
          </Button>
          <div className="px-3 py-2 rounded-md bg-gray-100">
            <span className="text-sm text-gray-500">Stock disponible</span>
            <div
              className={`text-2xl font-semibold flex items-center ${isLow ? "text-red-600" : "text-gray-900"
                }`}
            >
              {stock == null ? "—" : stock}
              {isLow && (
                <Tooltip title={`Stock bajo (mínimo ${stockMinimo})`}>
                  <span className="ml-2 inline-flex">
                    <Badge kind="inventory" status="LOW_STOCK" />
                  </span>
                </Tooltip>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Mínimo: {Number(stockMinimo ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de movimiento */}
      <div className="mt-4">
        <MovementForm
          productId={productId}
          defaultLocation={location}
          disabledActions={disabledActions}
          onDone={handleDone}
        />
      </div>

      {/* Tabla de movimientos */}
      <MovementTable
        data={rows}
        page={page}
        totalPages={meta.totalPages}
        onPage={(p) => refreshMovements(p)}
      />
    </div>
  );
}
