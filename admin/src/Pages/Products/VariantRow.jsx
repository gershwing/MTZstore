// admin/src/components/Variants/VariantRow.jsx
import React from "react";
import VariantImageUploader from "./VariantImageUploader";

export default function VariantRow({
  variant,
  attributes,
  onChange,
}) {
  return (
    <tr className="border-t">
      {attributes.map(a => (
        <td key={a.code} className="px-3 py-2">
          {variant.attributes[a.code]}
        </td>
      ))}

      <td className="px-2 py-1">
        <input
          className="border rounded px-2 py-1 w-full"
          value={variant.sku}
          onChange={e => onChange({ sku: e.target.value })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          value={variant.price}
          onChange={e => onChange({ price: Number(e.target.value) })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          type="number"
          className="border rounded px-2 py-1 w-full"
          value={variant.stock}
          onChange={e => onChange({ stock: Number(e.target.value) })}
        />
      </td>

      <td className="px-2 py-1">
        <VariantImageUploader
          value={variant.image}
          onChange={(url) => onChange({ image: url })}
        />
      </td>
    </tr>
  );
}
