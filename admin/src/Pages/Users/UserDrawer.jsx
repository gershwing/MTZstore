import React, { useEffect, useMemo, useState } from "react";
import MembershipForm from "./MembershipForm";
import {
  updateUserStatus,
  updateUserRole,
  updateUserPlatformRole,
  addMembership as addMembershipSvc,
  removeMembership as removeMembershipSvc,
} from "../../services/adminUsers";

import {
  ASSIGNABLE_ROLES,
  STORE_ROLES,
  IMPLICIT_ROLES,
  MAX_OPERATIONAL_ROLES,
  roleLabel,
  isOperationalRole,
} from "../../constants/roles";

/** ===== Normalización de estado ===== */
function normalizeStatusIn(s) {
  const x = String(s || "").toLowerCase();
  if (x === "suspended" || x === "inactive" || x === "disabled") return "disabled";
  return "active";
}
function normalizeStatusOut(s) {
  const x = String(s || "").toLowerCase();
  if (x === "disabled" || x === "inactive") return "suspended";
  return "active";
}

const ROLE_BADGE_STYLES = {
  SUPER_ADMIN: "bg-red-100 text-red-700 border-red-200",
  STORE_OWNER: "bg-blue-100 text-blue-700 border-blue-200",
  DELIVERY_AGENT: "bg-purple-100 text-purple-700 border-purple-200",
  FINANCE_MANAGER: "bg-amber-100 text-amber-700 border-amber-200",
  INVENTORY_MANAGER: "bg-teal-100 text-teal-700 border-teal-200",
  ORDER_MANAGER: "bg-indigo-100 text-indigo-700 border-indigo-200",
  SUPPORT_AGENT: "bg-cyan-100 text-cyan-700 border-cyan-200",
  CUSTOMER: "bg-gray-100 text-gray-600 border-gray-200",
};

// Roles disponibles para Rol 1 y Rol 2 (sin SUPER_ADMIN)
const ROLE_OPTIONS = ASSIGNABLE_ROLES;

/** Calcula todos los roles operativos actuales del usuario */
function getOperationalRoles(userData) {
  const ops = new Set();
  const pr = String(userData.platformRole || "").trim().toUpperCase();
  if (pr && isOperationalRole(pr)) ops.add(pr);
  const legacy = String(userData.role || "").trim().toUpperCase();
  if (legacy && isOperationalRole(legacy)) ops.add(legacy);
  if (Array.isArray(userData.memberships)) {
    for (const m of userData.memberships) {
      const r = String(m?.role || "").trim().toUpperCase();
      if (r && isOperationalRole(r)) ops.add(r);
    }
  }
  return ops;
}

export default function UserDrawer({ open, user, stores = [], onClose, onSaved, onChanged }) {
  const [data, setData] = useState(user || {});
  const [tab, setTab] = useState("profile");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const safe = {
      ...user,
      status: normalizeStatusIn(user.status),
      memberships: Array.isArray(user.memberships) ? user.memberships : [],
    };
    setData(safe);
  }, [user]);

  // Hooks ANTES del early return
  const storeMap = useMemo(() => {
    const m = new Map();
    (stores || []).forEach((s) => m.set(String(s._id), s.name));
    return m;
  }, [stores]);

  const membershipRoles = useMemo(() => {
    const set = new Set();
    (data.memberships || []).forEach((m) => {
      if (m?.role) set.add(String(m.role).toUpperCase());
    });
    return set;
  }, [data.memberships]);

  if (!open || !user) return null;

  const isSuperAdmin = (data.role || data.platformRole) === "SUPER_ADMIN";
  const currentOps = getOperationalRoles(data);

  const resolveStoreName = (m) =>
    m.store?.name || m.storeName || storeMap.get(String(m.storeId?._id || m.storeId)) || String(m.storeId?._id || m.storeId);

  // ===== Derivar Rol 1 y Rol 2 =====
  const role1 = data.platformRole || data.role || "CUSTOMER";

  // Rol 2: primer rol operativo de memberships diferente a Rol 1
  const role2Entry = (data.memberships || []).find(
    (m) => m?.role && String(m.role).toUpperCase() !== String(role1).toUpperCase() && isOperationalRole(String(m.role))
  );
  const role2 = role2Entry ? String(role2Entry.role).toUpperCase() : "";
  const role2IsFromMembership = !!role2Entry;

  /* ============ Acciones ============ */
  async function saveProfile() {
    try {
      setSaving(true);
      if (data.status) {
        await updateUserStatus(data._id, normalizeStatusOut(data.status));
      }
      onSaved?.();
      onChanged?.();
    } catch (err) {
      console.error("[UserDrawer.saveProfile] error:", err);
      alert(err?.response?.data?.message || "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole1(newRole) {
    try {
      setSaving(true);
      await updateUserPlatformRole(data._id, newRole);
      setData((d) => ({ ...d, platformRole: newRole }));
      onSaved?.();
      onChanged?.();
    } catch (err) {
      console.error("[UserDrawer.changeRole1] error:", err);
      alert(err?.response?.data?.message || "No se pudo cambiar el rol.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole2(newRole) {
    try {
      setSaving(true);
      // Actualiza el campo `role` (legacy) como segundo rol
      await updateUserRole(data._id, newRole || "CUSTOMER");
      setData((d) => ({ ...d, role: newRole || "CUSTOMER" }));
      onSaved?.();
      onChanged?.();
    } catch (err) {
      console.error("[UserDrawer.changeRole2] error:", err);
      alert(err?.response?.data?.message || "No se pudo cambiar el rol.");
    } finally {
      setSaving(false);
    }
  }

  /* ============ Membresías ============ */
  async function updateMembershipRole(storeId, role) {
    try {
      setSaving(true);
      await addMembershipSvc(data._id, { storeId, role });
      onSaved?.();
      onChanged?.();
    } catch (err) {
      console.error("[UserDrawer.updateMembershipRole] error:", err);
      alert(err?.response?.data?.message || "No se pudo actualizar el rol en la tienda.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMembership(storeId) {
    try {
      setSaving(true);
      await removeMembershipSvc(data._id, storeId);
      onSaved?.();
      onChanged?.();
    } catch (err) {
      console.error("[UserDrawer.removeMembership] error:", err);
      alert(err?.response?.data?.message || "No se pudo quitar de la tienda.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-black/40 z-20 flex justify-end">
      <div className="w-[480px] bg-white h-full p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Editar usuario</h2>
            <div className="text-sm text-gray-500">{data.email}</div>
          </div>
          <button className="px-2 py-1 border rounded" onClick={onClose} disabled={saving}>
            Cerrar
          </button>
        </div>

        {/* Roles actuales (resumen visual) */}
        <div className="mb-3 p-2 bg-gray-50 rounded border">
          <div className="text-xs text-gray-500 mb-1">Roles activos</div>
          <div className="flex flex-wrap gap-1">
            {currentOps.size > 0 ? (
              [...currentOps].map((r) => (
                <span
                  key={r}
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${ROLE_BADGE_STYLES[r] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                  {roleLabel(r)}
                </span>
              ))
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">
                {roleLabel("CUSTOMER")}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {currentOps.size}/{MAX_OPERATIONAL_ROLES} roles operativos
            {currentOps.size === 0 && " (Cliente es implícito para todos)"}
          </div>
        </div>

        {/* Tabs - solo Perfil y Membresías */}
        <div className="flex gap-2 mb-3">
          <button
            className={`px-2 py-1 border rounded ${tab === "profile" ? "bg-gray-100" : ""}`}
            onClick={() => setTab("profile")}
            disabled={saving}
          >
            Perfil
          </button>
          <button
            className={`px-2 py-1 border rounded ${tab === "memberships" ? "bg-gray-100" : ""}`}
            onClick={() => setTab("memberships")}
            disabled={saving}
          >
            Membresías
          </button>
        </div>

        {/* Tab: Perfil */}
        {tab === "profile" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm">Nombre</label>
              <input
                className="border px-2 py-1 rounded w-full"
                value={data.name || ""}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm">Email</label>
              <input className="border px-2 py-1 rounded w-full" value={data.email || ""} disabled />
            </div>

            <div>
              <label className="block text-sm">Estado</label>
              <select
                className="border px-2 py-1 rounded w-full"
                value={data.status || "active"}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                disabled={saving}
              >
                <option value="active">Activo</option>
                <option value="disabled">Deshabilitado</option>
              </select>
              <div className="flex justify-end mt-1">
                <button className="px-3 py-1 border rounded text-sm" onClick={saveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar estado"}
                </button>
              </div>
            </div>

            {/* Separador */}
            <hr className="my-2" />

            {/* Rol 1 y Rol 2 */}
            {isSuperAdmin ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                Super Admin (gestionado desde .env)
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {/* Rol 1 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Rol 1</label>
                    <select
                      className="border px-2 py-1 rounded w-full"
                      value={role1}
                      onChange={(e) => changeRole1(e.target.value)}
                      disabled={saving}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {roleLabel(r)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Rol principal de plataforma</p>
                  </div>

                  {/* Rol 2 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Rol 2</label>
                    {role2IsFromMembership ? (
                      <>
                        <div className={`border px-2 py-1 rounded w-full bg-green-50 text-sm flex items-center gap-1`}>
                          <span>{roleLabel(role2)}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Asignado vía membresía</p>
                      </>
                    ) : (
                      <>
                        <select
                          className="border px-2 py-1 rounded w-full"
                          value={role2 || data.role || ""}
                          onChange={(e) => changeRole2(e.target.value)}
                          disabled={saving}
                        >
                          <option value="">(Ninguno)</option>
                          <option value="CUSTOMER">Cliente</option>
                          {ROLE_OPTIONS.filter(
                            (r) => r !== "CUSTOMER" && r !== role1
                          ).map((r) => (
                            <option
                              key={r}
                              value={r}
                              disabled={isOperationalRole(r) && currentOps.size >= MAX_OPERATIONAL_ROLES && !currentOps.has(r)}
                            >
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Rol secundario (opcional)</p>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Los cambios de rol se aplican inmediatamente.
                </p>
              </>
            )}
          </div>
        )}

        {/* Tab: Membresías */}
        {tab === "memberships" && (
          <div className="space-y-3">
            {/* Rol de plataforma */}
            {(() => {
              const pr = String(data.platformRole || data.role || "").toUpperCase();
              if (pr && isOperationalRole(pr)) {
                return (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                    <div className="text-xs text-purple-500 mb-1">Rol de plataforma</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ROLE_BADGE_STYLES[pr] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {roleLabel(pr)}
                      </span>
                      <span className="text-xs text-purple-400">
                        (a nivel plataforma, no vinculado a tienda)
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Membresías de tienda</span>
              <button className="px-2 py-1 border rounded text-sm" onClick={() => setAdding(true)} disabled={saving}>
                Agregar a tienda
              </button>
            </div>

            {Array.isArray(data.memberships) && data.memberships.length > 0 ? (
              <div className="border rounded divide-y">
                {data.memberships.map((m) => {
                  const storeId = m.storeId?._id || m.storeId;
                  const statusUi = normalizeStatusIn(m.status);

                  return (
                    <div key={storeId} className="p-2 flex items-center justify-between">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">Tienda: </span>
                          {resolveStoreName(m)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Rol: </span>
                          {roleLabel(m.role)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Estado: </span>
                          {statusUi}
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <select
                          className="border px-2 py-1 rounded"
                          defaultValue={m.role}
                          onChange={(e) => updateMembershipRole(storeId, e.target.value)}
                          disabled={saving}
                        >
                          {STORE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>

                        <select className="border px-2 py-1 rounded" value={statusUi} disabled>
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
                        </select>

                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => removeMembership(storeId)}
                          disabled={saving}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin membresías aún.</p>
            )}

            {adding && (
              <MembershipForm
                userId={data._id}
                onClose={() => setAdding(false)}
                onSaved={() => {
                  setAdding(false);
                  onSaved?.();
                  onChanged?.();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
