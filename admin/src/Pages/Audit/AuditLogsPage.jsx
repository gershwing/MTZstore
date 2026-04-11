import React, { useEffect, useRef, useState } from "react";
import {
  listAuditLogs,
  exportAuditJSON,
  exportAuditCSV,
  getActionStats,
} from "../../services/audit";
import {
  Button,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
} from "@mui/material";
import dayjs from "dayjs";

function MetaPreview({ obj }) {
  if (!obj) return <em className="text-gray-500">—</em>;
  return (
    <pre className="text-xs whitespace-pre-wrap max-w-[540px] overflow-auto">
      {JSON.stringify(obj, null, 2)}
    </pre>
  );
}

const INTERVALS = [
  { label: "5s", ms: 5000 },
  { label: "10s", ms: 10000 },
  { label: "30s", ms: 30000 },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [filters, setFilters] = useState({
    storeId: "",
    actorId: "",
    action: "",
    status: "",
    from: "",
    to: "",
    q: "",
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);

  // Tiempo real
  const [live, setLive] = useState(false);
  const [intervalMs, setIntervalMs] = useState(INTERVALS[0].ms);
  const timerRef = useRef(null);

  // Acciones frecuentes
  const [topActions, setTopActions] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  // Modal de detalle
  const [dlgOpen, setDlgOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const load = async (p = filters.page) => {
    setLoading(true);
    const res = await listAuditLogs({ ...filters, page: p });
    setLogs(res?.data || []);
    setMeta({
      total: res?.total || 0,
      page: res?.page || p,
      limit: res?.limit || filters.limit,
    });
    setLoading(false);
  };

  const refreshTopActions = async () => {
    setLoadingTop(true);
    const stats = await getActionStats({
      storeId: filters.storeId || undefined,
      actorId: filters.actorId || undefined,
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      q: filters.q || undefined,
      limit: 30,
    });
    setTopActions(stats || []);
    setLoadingTop(false);
  };

  useEffect(() => {
    load(1);
    refreshTopActions();
    // eslint-disable-next-line
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (live) {
      timerRef.current = setInterval(() => {
        load(meta.page);
        refreshTopActions();
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [live, intervalMs, meta.page, filters]);

  const onChange = (k, v) => setFilters((s) => ({ ...s, [k]: v }));
  const onOpenDetail = (row) => {
    setCurrent(row);
    setDlgOpen(true);
  };

  // Exportaciones
  const doExportJSON = async () => {
    const blob = await exportAuditJSON(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const doExportCSV = async () => {
    const blob = await exportAuditCSV(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const applyTopAction = (act) => {
    setFilters((s) => ({ ...s, action: act, page: 1 }));
    setTimeout(() => load(1), 0);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <div className="flex items-center gap-3">
          <FormControlLabel
            control={
              <Switch checked={live} onChange={(e) => setLive(e.target.checked)} />
            }
            label="Tiempo real"
          />
          <Select
            size="small"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            disabled={!live}
          >
            {INTERVALS.map((x) => (
              <MenuItem key={x.ms} value={x.ms}>
                {x.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            size="small"
            onClick={doExportJSON}
            disabled={loading}
          >
            Export JSON
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={doExportCSV}
            disabled={loading}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
        <TextField
          size="small"
          label="StoreId"
          value={filters.storeId}
          onChange={(e) => onChange("storeId", e.target.value)}
        />
        <TextField
          size="small"
          label="ActorId"
          value={filters.actorId}
          onChange={(e) => onChange("actorId", e.target.value)}
        />
        <TextField
          size="small"
          label="Acción"
          value={filters.action}
          onChange={(e) => onChange("action", e.target.value)}
        />
        <Select
          size="small"
          value={filters.status}
          displayEmpty
          onChange={(e) => onChange("status", e.target.value)}
        >
          <MenuItem value="">(status)</MenuItem>
          <MenuItem value="OK">OK</MenuItem>
          <MenuItem value="ERROR">ERROR</MenuItem>
        </Select>
        <TextField
          size="small"
          type="date"
          label="Desde"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(e) => onChange("from", e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Hasta"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(e) => onChange("to", e.target.value)}
        />
        <TextField
          size="small"
          label="Buscar (entity/meta)"
          value={filters.q}
          onChange={(e) => onChange("q", e.target.value)}
        />
        <div className="col-span-2 md:col-span-1 flex items-end">
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              load(1);
              refreshTopActions();
            }}
            disabled={loading}
          >
            Filtrar
          </Button>
        </div>
      </div>

      {/* Acciones frecuentes */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Acciones frecuentes:</span>
        <Select
          size="small"
          value=""
          displayEmpty
          onChange={(e) => applyTopAction(e.target.value)}
          disabled={loadingTop}
        >
          <MenuItem value="">
            {loadingTop ? "Cargando..." : "(elige)"}
          </MenuItem>
          {topActions.map((a) => (
            <MenuItem key={a.action} value={a.action}>
              {a.action} — {a.count}
            </MenuItem>
          ))}
        </Select>
        <div className="flex gap-2 flex-wrap">
          {topActions.slice(0, 6).map((a) => (
            <button
              key={`chip-${a.action}`}
              onClick={() => applyTopAction(a.action)}
              className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50"
              title={`${a.count} eventos`}
            >
              {a.action}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Acción</th>
              <th className="p-2 text-left">Entidad</th>
              <th className="p-2 text-left">Actor</th>
              <th className="p-2 text-left">Tienda</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">UA</th>
              <th className="p-2 text-left">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <tr
                key={row._id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => onOpenDetail(row)}
              >
                <td className="p-2">
                  {dayjs(row.at || row.createdAt).format("YYYY-MM-DD HH:mm")}
                </td>
                <td className="p-2">{row.action}</td>
                <td className="p-2">
                  {row.entity}#{row.entityId?.slice?.(0, 6)}
                </td>
                <td className="p-2">
                  {row.actorRole} ({row.actorId})
                </td>
                <td className="p-2">{row.tenantStoreId}</td>
                <td className="p-2">{row.status}</td>
                <td className="p-2">{row.ip}</td>
                <td className="p-2 truncate max-w-[240px]" title={row.ua}>
                  {row.ua}
                </td>
                <td className="p-2">
                  <div className="text-xs text-blue-600 underline">ver</div>
                </td>
              </tr>
            ))}
            {!logs.length && !loading && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={9}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <span>Página {meta.page}</span>
        <Button
          size="small"
          disabled={meta.page <= 1 || loading}
          onClick={() => load(meta.page - 1)}
        >
          Anterior
        </Button>
        <Button
          size="small"
          disabled={loading || meta.page * meta.limit >= meta.total}
          onClick={() => load(meta.page + 1)}
        >
          Siguiente
        </Button>
        <span className="text-gray-500">Total: {meta.total}</span>
      </div>

      {/* Modal de detalle */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle de evento</DialogTitle>
        <DialogContent>
          {current ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <b>Fecha:</b>{" "}
                  {dayjs(current.at || current.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </div>
                <div>
                  <b>Status:</b> {current.status}
                </div>
                <div>
                  <b>Acción:</b> {current.action}
                </div>
                <div>
                  <b>Entidad:</b> {current.entity}#{current.entityId}
                </div>
                <div>
                  <b>Actor:</b> {current.actorRole} ({current.actorId})
                </div>
                <div>
                  <b>Tienda:</b> {current.tenantStoreId}
                </div>
                <div>
                  <b>IP:</b> {current.ip}
                </div>
                <div>
                  <b>UA:</b>{" "}
                  <span className="break-all">{current.ua}</span>
                </div>
              </div>
              <div>
                <b>Meta:</b>
                <MetaPreview obj={current.meta} />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
