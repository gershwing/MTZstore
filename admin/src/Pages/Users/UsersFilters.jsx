import React, { useState, useEffect, useRef, useCallback } from "react";
import { PLATFORM_ROLES, roleLabel } from "../../constants/roles";

export default function UsersFilters({ initial = {}, onApply }) {
  const [q, setQ] = useState(initial.q || "");
  const [role, setRole] = useState(initial.role || "");
  const [status, setStatus] = useState(initial.status || "");
  const timerRef = useRef(null);

  useEffect(() => {
    setQ(initial.q || "");
    setRole(initial.role || "");
    setStatus(initial.status || "");
  }, [initial]);

  const apply = useCallback(
    (overrides = {}) => {
      const next = { q: q.trim(), role, status, page: 1, ...overrides };
      onApply?.(next);
    },
    [q, role, status, onApply]
  );

  // Debounce text search — fires 400ms after user stops typing
  const onSearchChange = (val) => {
    setQ(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onApply?.({ q: val.trim(), role, status, page: 1 });
    }, 400);
  };

  // Dropdowns apply immediately
  const onRoleChange = (val) => {
    setRole(val);
    apply({ role: val });
  };
  const onStatusChange = (val) => {
    setStatus(val);
    apply({ status: val });
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-3">
      <div>
        <label className="block text-sm mb-1">Buscar</label>
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="Nombre o email"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Rol plataforma</label>
        <select
          className="border px-2 py-1 rounded w-full"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          <option value="">Todos</option>
          {PLATFORM_ROLES.map((r) => (
            <option key={r} value={r}>{roleLabel(r)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Estado</label>
        <select
          className="border px-2 py-1 rounded w-full"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="suspended">Suspendido</option>
        </select>
      </div>
    </div>
  );
}
