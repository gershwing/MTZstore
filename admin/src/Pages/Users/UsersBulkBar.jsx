// admin/src/Pages/Users/UsersBulkBar.jsx
import React, { useState } from "react";
import { bulkStatus, bulkPlatformRole, bulkDelete } from "../../services/adminUsers";
import { ASSIGNABLE_ROLES, roleLabel } from "../../constants/roles";
import toast from "react-hot-toast";

export default function UsersBulkBar({ selectedIds = [], onDone }) {
  const disabled = selectedIds.length === 0;
  const [platformRole, setPlatformRole] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    try {
      setBusy(true);
      await fn();
      setPlatformRole("");
      onDone?.();
    } catch (e) {
      console.error("[UsersBulkBar]", e);
      const msg = e?.response?.data?.message || e?.message || "Operación fallida";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const applyPlatformRole = () => {
    if (!platformRole) return;
    return run(async () => {
      await bulkPlatformRole(selectedIds, platformRole);
      toast.success("Rol de plataforma actualizado");
    });
  };

  if (disabled) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-3 p-2 bg-blue-50 rounded">
      <span className="text-sm font-medium">{selectedIds.length} seleccionado(s)</span>

      <button
        className="px-2 py-1 border rounded bg-white"
        disabled={busy}
        onClick={() =>
          run(async () => {
            await bulkStatus(selectedIds, "active");
            toast.success("Usuarios activados");
          })
        }
      >
        Activar
      </button>

      <button
        className="px-2 py-1 border rounded bg-white"
        disabled={busy}
        onClick={() =>
          run(async () => {
            await bulkStatus(selectedIds, "suspended");
            toast.success("Usuarios suspendidos");
          })
        }
      >
        Desactivar
      </button>

      {/* Asignar rol de plataforma */}
      <select
        className="border px-2 py-1 rounded bg-white"
        value={platformRole}
        onChange={(e) => setPlatformRole(e.target.value)}
      >
        <option value="">Asignar rol…</option>
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel(r)}
          </option>
        ))}
      </select>
      <button
        className="px-2 py-1 border rounded bg-white"
        disabled={busy || !platformRole}
        onClick={applyPlatformRole}
      >
        Aplicar
      </button>

      {/* Eliminar */}
      <button
        className="px-2 py-1 border rounded bg-white text-red-600"
        disabled={busy}
        onClick={() => {
          if (!confirm(`Eliminar ${selectedIds.length} usuario(s)?`)) return;
          run(async () => {
            await bulkDelete(selectedIds);
            toast.success("Usuarios eliminados");
          });
        }}
      >
        Eliminar
      </button>
    </div>
  );
}
