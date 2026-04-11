// admin/src/Pages/Promotions/List.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPromotions, removePromotion } from "../../services/promotions";
import { Button, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";

export default function PromotionsList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function fetchData(p = 1) {
    const res = await listPromotions({ q, status, page: p, limit: 10, sort: "priority:asc,createdAt:desc" });
    const data = res?.data || res; // adapta a tu shape
    setRows(data?.rows || data?.items || []);
    setTotal(data?.total ?? 0);
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <TextField size="small" label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
        <FormControl size="small">
          <InputLabel>Estado</InputLabel>
          <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} style={{ minWidth: 160 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="PAUSED">Paused</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => fetchData()}>Aplicar filtros</Button>
        <Button variant="contained" onClick={() => navigate("/promotions/new")}>Nueva promoción</Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Nombre</th>
            <th className="p-2">Código</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Alcance</th>
            <th className="p-2">Vigencia</th>
            <th className="p-2">Estado</th>
            <th className="p-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-b hover:bg-gray-50">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.code || (r.autoApply ? "Auto-apply" : "-")}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.appliesTo}</td>
              <td className="p-2">
                {r.startAt ? new Date(r.startAt).toLocaleDateString() : "-"} —{" "}
                {r.endAt ? new Date(r.endAt).toLocaleDateString() : "-"}
              </td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">
                <div className="flex gap-1 justify-end">
                  <IconButton size="small" onClick={() => navigate(`/promotions/${r._id}`)}>
                    <MdEdit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      if (confirm("¿Eliminar?")) {
                        await removePromotion(r._id);
                        await fetchData();
                      }
                    }}
                  >
                    <MdDelete size={18} />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-xs text-gray-500 mt-2">{total} resultados</div>
    </div>
  );
}
