import AttributeInput from "./AttributeInput";

/**
 * AttributeRenderer
 * ---------------------------------------------------
 * Renderiza inputs dinámicos basados en atributos
 *
 * Props:
 * - attributes: [{ code, name, type, required, options }]
 * - values: { [code]: value }
 * - onChange: (newValues) => void
 */
export default function AttributeRenderer({
  attributes = [],
  values = {},
  onChange,
}) {
  const handleChange = (code, value) => {
    onChange({
      ...values,
      [code]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {attributes.map((attr) => (
        <AttributeInput
          key={attr.code}
          attribute={attr}
          value={values[attr.code]}
          onChange={(val) => handleChange(attr.code, val)}
        />
      ))}
    </div>
  );
}
