import AtributoImagenUpload from "./AtributoImagenUpload";

/**
 * AttributeInput
 * ---------------------------------------------------
 * Input genérico para atributos dinámicos
 *
 * attribute = {
 *   code: "color",
 *   name: "Color",
 *   type: "select" | "text" | "number" | "boolean" | "image_upload",
 *   required: true,
 *   options?: ["Rojo", "Azul"]
 * }
 */
export default function AttributeInput({
  attribute,
  value,
  onChange,
}) {
  const {
    name,
    type = "text",
    required = false,
    options = [],
  } = attribute;

  /* IMAGE_UPLOAD — componente dedicado */
  if (type === "image_upload") {
    return (
      <AtributoImagenUpload
        attribute={attribute}
        value={value || []}
        onChange={onChange}
      />
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {name}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* TEXT */}
      {type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      )}

      {/* NUMBER */}
      {type === "number" && (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      )}

      {/* SELECT */}
      {type === "select" && (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleccione</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* BOOLEAN */}
      {type === "boolean" && (
        <select
          value={value === true ? "true" : value === false ? "false" : ""}
          onChange={(e) =>
            onChange(
              e.target.value === ""
                ? null
                : e.target.value === "true"
            )
          }
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleccione</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      )}
    </div>
  );
}
