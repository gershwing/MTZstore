// admin/src/components/Variants/VariantMatrix.jsx
import React, { useEffect, useMemo } from "react";
import VariantRow from "./VariantRow";

/**
 * VariantMatrix
 * ---------------------------------------------------
 * Genera combinaciones de variantes según atributos marcados como variant=true
 *
 * Props:
 * - attributes: [{ code, name, options, variant }]
 * - value: array de variantes
 * - onChange: (variants[]) => void
 */
export default function VariantMatrix({
  attributes = [],
  value = [],
  onChange,
}) {
  const variantAttrs = attributes.filter(a => a.variant && a.options?.length);

  // Generar combinaciones (cartesiano)
  const combinations = useMemo(() => {
    if (!variantAttrs.length) return [];

    const build = (idx, acc) => {
      if (idx === variantAttrs.length) return [acc];
      const attr = variantAttrs[idx];
      return attr.options.flatMap(opt =>
        build(idx + 1, { ...acc, [attr.code]: opt })
      );
    };

    return build(0, {});
  }, [variantAttrs]);

  // Sincronizar variantes
  useEffect(() => {
    const next = combinations.map((combo) => {
      const key = JSON.stringify(combo);
      const existing = value.find(v => v._key === key);
      return (
        existing || {
          _key: key,
          attributes: combo,
          price: 0,
          stock: 0,
          sku: "",
          image: "",
        }
      );
    });
    onChange?.(next);
  }, [combinations]);

  if (!variantAttrs.length) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">Variantes</h3>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {variantAttrs.map(a => (
                <th key={a.code} className="px-3 py-2 text-left">
                  {a.name}
                </th>
              ))}
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Imagen</th>
            </tr>
          </thead>

          <tbody>
            {value.map((v, i) => (
              <VariantRow
                key={v._key}
                variant={v}
                attributes={variantAttrs}
                onChange={(patch) => {
                  const copy = [...value];
                  copy[i] = { ...copy[i], ...patch };
                  onChange(copy);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
