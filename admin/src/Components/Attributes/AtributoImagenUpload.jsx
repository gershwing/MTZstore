import { useState, useRef } from "react";
import { uploadImages } from "../../utils/api";

/**
 * AtributoImagenUpload
 * ---------------------------------------------------
 * Maneja atributos de tipo "image_upload".
 * El vendedor sube una foto real por cada opción
 * (color, sabor, logo de marca, etc.)
 *
 * Props:
 * - attribute: { code, name, options, required }
 *     options = sugerencias de autocompletado (no obligatorias)
 * - value: [{ valor: string, imagen_url: string }]
 * - onChange: (newValue) => void
 */
export default function AtributoImagenUpload({
  attribute,
  value = [],
  onChange,
}) {
  const { name, options = [], required } = attribute;
  const [uploading, setUploading] = useState(null); // index que está subiendo
  const [newLabel, setNewLabel] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRefs = useRef({});

  // Labels ya usados
  const usedLabels = new Set(value.map((v) => v.valor));

  // Sugerencias filtradas (no usadas, coinciden con input)
  const suggestions = options
    .filter((opt) => !usedLabels.has(opt))
    .filter((opt) =>
      !newLabel || opt.toLowerCase().includes(newLabel.toLowerCase())
    );

  /* ======================================================
     AGREGAR OPCIÓN
  ====================================================== */
  const addOption = (label) => {
    if (!label.trim()) return;
    if (usedLabels.has(label.trim())) return;
    onChange([...value, { valor: label.trim(), imagen_url: "" }]);
    setNewLabel("");
    setShowSuggestions(false);
  };

  /* ======================================================
     SUBIR IMAGEN POR OPCIÓN
  ====================================================== */
  const handleUpload = async (index, files) => {
    if (!files?.length) return;

    const formData = new FormData();
    formData.append("images", files[0]); // una foto por opción

    setUploading(index);
    try {
      const res = await uploadImages("/api/product/media/images", formData);
      const urls = res?.data?.images || res?.data || [];
      const url = Array.isArray(urls) ? urls[0] : urls;

      if (url) {
        const updated = [...value];
        updated[index] = { ...updated[index], imagen_url: url };
        onChange(updated);
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err);
    } finally {
      setUploading(null);
    }
  };

  /* ======================================================
     ELIMINAR OPCIÓN
  ====================================================== */
  const removeOption = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  /* ======================================================
     REORDENAR
  ====================================================== */
  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...value];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index) => {
    if (index >= value.length - 1) return;
    const updated = [...value];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-1">
        {name}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-xs text-gray-400 ml-2">
          (sube una foto por opción)
        </span>
      </label>

      {/* OPCIONES AGREGADAS */}
      {value.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-2 border rounded bg-gray-50"
        >
          {/* IMAGEN */}
          <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0 bg-white">
            <input
              ref={(el) => { fileInputRefs.current[`new_${idx}`] = el; }}
              type="file"
              accept="image/*"
              className="absolute w-0 h-0 overflow-hidden opacity-0"
              style={{ position: "absolute", top: "-9999px" }}
              onChange={(e) => {
                handleUpload(idx, e.target.files);
                e.target.value = "";
              }}
            />
            {item.imagen_url ? (
              <img
                src={item.imagen_url}
                alt={item.valor}
                className="w-full h-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRefs.current[`new_${idx}`]?.click()}
                className="flex items-center justify-center w-full h-full cursor-pointer text-xs text-gray-400 hover:bg-gray-100 active:bg-gray-200"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {uploading === idx ? "..." : "+Foto"}
              </button>
            )}
          </div>

          {/* NOMBRE */}
          <span className="flex-1 text-sm font-medium truncate">
            {item.valor}
          </span>

          {/* CAMBIAR FOTO (si ya tiene) */}
          {item.imagen_url && (
            <>
              <input
                ref={(el) => { fileInputRefs.current[`change_${idx}`] = el; }}
                type="file"
                accept="image/*"
                className="absolute w-0 h-0 overflow-hidden opacity-0"
                style={{ position: "absolute", top: "-9999px" }}
                onChange={(e) => {
                  handleUpload(idx, e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRefs.current[`change_${idx}`]?.click()}
                className="text-xs text-blue-600 cursor-pointer hover:underline active:text-blue-800"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                Cambiar
              </button>
            </>
          )}

          {/* FLECHAS */}
          <button
            type="button"
            onClick={() => moveUp(idx)}
            disabled={idx === 0}
            className="text-xs px-1 disabled:opacity-30"
            title="Subir"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => moveDown(idx)}
            disabled={idx === value.length - 1}
            className="text-xs px-1 disabled:opacity-30"
            title="Bajar"
          >
            ▼
          </button>

          {/* ELIMINAR */}
          <button
            type="button"
            onClick={() => removeOption(idx)}
            className="text-red-500 text-sm px-1 hover:text-red-700"
            title="Eliminar opción"
          >
            ✕
          </button>
        </div>
      ))}

      {/* AGREGAR NUEVA OPCIÓN */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption(newLabel);
              }
            }}
            placeholder="Nombre de la opción (ej: Rojo cereza)"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => addOption(newLabel)}
            disabled={!newLabel.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-40 hover:bg-blue-700"
          >
            + Agregar
          </button>
        </div>

        {/* SUGERENCIAS */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
            {suggestions.slice(0, 10).map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => addOption(sug)}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 truncate"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CERRAR SUGERENCIAS AL CLICK FUERA */}
      {showSuggestions && (
        <div
          className="fixed inset-0"
          style={{ zIndex: -1 }}
          onClick={() => setShowSuggestions(false)}
          onTouchEnd={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
