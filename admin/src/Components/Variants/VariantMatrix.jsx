import { useEffect } from "react";
import VariantRow from "./VariantRow";
import { generateSKU } from "../../utils/sku";

export default function VariantMatrix({
  productName = "",
  attributes = [],
  value = [],
  onChange,
  baseCurrency = "USD",
  wholesaleDiscountPct = 0,
  wholesaleEnabled = false,
}) {
  const generateCombinations = (attrs, index = 0, current = {}) => {
    if (index === attrs.length) return [{ attributes: current }];
    const attr = attrs[index];
    const results = [];
    for (const opt of attr.options || []) {
      results.push(
        ...generateCombinations(attrs, index + 1, { ...current, [attr.code]: opt })
      );
    }
    return results;
  };

  useEffect(() => {
    if (!attributes.length) return;
    const combinations = generateCombinations(attributes);
    if (combinations.length > 500) return;

    const merged = combinations.map((combo) => {
      const existing = value.find(
        (v) => JSON.stringify(v.attributes) === JSON.stringify(combo.attributes)
      );
      if (existing) return existing;
      return {
        attributes: combo.attributes,
        price: 0,
        wholesalePrice: 0,
        stock: 0,
        sku: generateSKU(productName, combo.attributes),
        images: [],
        status: "inactive",
        skuLocked: false,
      };
    });

    onChange(merged);
    // eslint-disable-next-line
  }, [JSON.stringify(attributes), productName]);

  const updateVariant = (index, patch) => {
    const updated = [...value];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  if (!attributes.length) return null;

  const sym = baseCurrency === "BOB" ? "Bs" : "$";

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            {attributes.map((a) => (
              <th key={a.code} className="border px-2 py-2 text-left">{a.name}</th>
            ))}
            <th className="border px-2 py-2">Minorista ({sym})</th>
            {wholesaleEnabled && <th className="border px-2 py-2">Mayorista ({sym})</th>}
            <th className="border px-2 py-2">Stock</th>
            <th className="border px-2 py-2">SKU</th>
            <th className="border px-2 py-2 w-16">Imagen</th>
            <th className="border px-2 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {value.map((variant, idx) => (
            <VariantRow
              key={idx}
              variant={variant}
              attributes={attributes}
              productName={productName}
              baseCurrency={baseCurrency}
              wholesaleDiscountPct={wholesaleDiscountPct}
              wholesaleEnabled={wholesaleEnabled}
              onChange={(patch) => updateVariant(idx, patch)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
