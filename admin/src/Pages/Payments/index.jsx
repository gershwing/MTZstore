import React, { useEffect, useState } from "react";
import { listPayments, refundPayment } from "../../services/payments";
import { usePermission } from "../../hooks/usePermission";
import Badge from "../../Components/Badge";
import Progress from "../../Components/ProgressBar";

import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export default function PaymentsPage() {
  const { alertBox } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");  // PENDING|AUTHORIZED|COMPLETED|CAPTURED|REFUNDED|FAILED|CANCELED
  const [q, setQ] = useState("");            // orderId/paymentId/user
  const [page, setPage] = useState(1);
  const { any: canRefund } = usePermission(["payment:refund"]);
  const { any: canRead } = usePermission(["payment:read"]);

  async function load(p = 1) {
    try {
      const res = await listPayments({ page: p, limit: 20, status, q });
      setRows(res?.data || res?.payments || []);
      setPage(p);
    } catch (e) {
      alertBox?.("error", "No se pudieron cargar pagos");
    }
  }

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  const handleRefund = async (payment) => {
    if (!canRefund) return;
    if (!confirm("¿Confirmar reembolso?")) return;
    try {
      await refundPayment(payment._id, { reason: "requested_by_customer" });
      alertBox?.("success", "Reembolso solicitado");
      load(page);
    } catch (e) {
      alertBox?.("error", "Fallo el reembolso");
    }
  };

  if (!canRead) return <p>No tienes permisos para ver pagos.</p>;

  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold mb-3">Pagos</h1>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          className="border rounded px-2 py-1"
          placeholder="Buscar paymentId/orderId/cliente"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pending</option>
          <option value="AUTHORIZED">Authorized</option>
          <option value="COMPLETED">Completed</option>
          <option value="CAPTURED">Captured</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <button className="px-3 py-1 border rounded" onClick={() => load(1)}>Aplicar</button>
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Payment ID</th>
              <th className="px-3 py-2">Orden</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Monto</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Progreso</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p._id} className="border-b">
                <td className="px-3 py-2 whitespace-nowrap">{p.gatewayId || p._id}</td>
                <td className="px-3 py-2">
                  {p.orderId ? (
                    <Link className="text-primary underline" to={`/orders?focus=${p.orderId}`}>
                      {p.orderId}
                    </Link>
                  ) : "-"}
                </td>
                <td className="px-3 py-2">{p.user?.email || p.user?.name || "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {p.currency || "USD"} {Number(p.amount || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2">
                  <Badge kind="payment" status={p.status} />
                </td>
                <td className="px-3 py-2">
                  <Progress
                    kind="payment"
                    status={p.status}
                    value={
                      p.status === "PENDING" ? 15 :
                        p.status === "AUTHORIZED" ? 40 :
                          p.status === "CAPTURED" || p.status === "COMPLETED" ? 100 :
                            p.status === "REFUNDED" ? 100 :
                              p.status === "FAILED" || p.status === "CANCELED" ? 0 : 20
                    }
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  {canRefund && (p.status === "CAPTURED" || p.status === "COMPLETED") && (
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => handleRefund(p)}
                    >
                      Reembolsar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                  Sin pagos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
