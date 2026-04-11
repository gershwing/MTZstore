// admin/src/Pages/Stores/EditStore.jsx
import React, { useEffect, useState } from "react";
import { createStore, updateStore } from "../../services/stores";
import StoreMembers from "./StoreMembers"; // <-- nuevo import

// Encapsulamos tu formulario existente para usarlo como "General"
function YourExistingStoreForm({ value = {}, onSaved, onClose }) {
  const isEdit = Boolean(value?._id);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    status: "active",
    currency: "BOB",
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: value.name || "",
        slug: value.slug || "",
        status: value.status || "active",
        currency: value.currency || "BOB",
      });
    } else {
      setForm({
        name: "",
        slug: "",
        status: "active",
        currency: "BOB",
      });
    }
  }, [isEdit, value]);

  const submit = async (e) => {
    e.preventDefault();
    if (isEdit) await updateStore(value._id, form);
    else await createStore(form);
    onSaved?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm">Nombre</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm">Slug</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm">Estado</label>
        <select
          className="border px-2 py-1 rounded w-full"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">active</option>
          <option value="suspended">suspended</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Moneda</label>
        <select
          className="border px-2 py-1 rounded w-full"
          value={form.currency}
          onChange={(e) =>
            setForm({ ...form, currency: e.target.value })
          }
        >
          <option value="BOB">BOB</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="px-3 py-1 border rounded"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button type="submit" className="px-3 py-1 border rounded">
          Guardar
        </button>
      </div>
    </form>
  );
}

export default function EditStore({ value = {}, onClose, onSaved }) {
  const [tab, setTab] = useState("general");
  const isEdit = Boolean(value?._id);

  return (
    <div className="absolute inset-0 bg-black/40 z-20 flex justify-end">
      <div className="w-[520px] bg-white h-full p-4 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Editar tienda" : "Nueva tienda"}
          </h2>
          <button className="px-2 py-1 border rounded" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            className={`px-2 py-1 border rounded ${tab === "general" ? "bg-gray-100" : ""
              }`}
            onClick={() => setTab("general")}
          >
            General
          </button>

          {isEdit && (
            <button
              className={`px-2 py-1 border rounded ${tab === "members" ? "bg-gray-100" : ""
                }`}
              onClick={() => setTab("members")}
            >
              Miembros
            </button>
          )}
        </div>

        {/* Content */}
        {tab === "general" && (
          <YourExistingStoreForm
            value={value}
            onSaved={onSaved}
            onClose={onClose}
          />
        )}

        {tab === "members" && isEdit && (
          <StoreMembers storeId={value._id} onChanged={onSaved} />
        )}
      </div>
    </div>
  );
}
