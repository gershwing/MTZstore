import { useRef } from "react";
import { generateSKU } from "../../utils/sku";
import { uploadImages } from "../../utils/api";

const r = (n) => Math.round(Number(n || 0) * 100) / 100;

export default function VariantRow({
  variant,
  attributes,
  productName,
  onChange,
  baseCurrency = "USD",
  wholesaleDiscountPct = 0,
  wholesaleEnabled = false,
}) {
  const sym = baseCurrency === "BOB" ? "Bs" : "$";
  const fileRef = useRef(null);

  const handleAutoWholesale = () => {
    const base = Number(variant.price) || 0;
    if (base <= 0 || wholesaleDiscountPct <= 0) return;
    const auto = r(base * (1 - wholesaleDiscountPct / 100));
    onChange({ wholesalePrice: auto });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    try {
      const res = await uploadImages("/api/product/media/images", formData);
      const url = res?.data?.images?.[0];
      if (url) {
        onChange({ images: [{ url, isMain: true }] });
      }
    } catch {
      /* silenciar */
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const mainImage = (variant.images || []).find((i) => i.isMain)?.url
    || (variant.images || [])[0]?.url
    || variant.image
    || null;

  return (
    <tr className={variant.status === "inactive" ? "opacity-50" : ""}>
      {/* ATRIBUTOS */}
      {attributes.map((a) => (
        <td key={a.code} className="border px-2 py-1">
          {variant.attributes[a.code]}
        </td>
      ))}

      {/* PRECIO MINORISTA */}
      <td className="border px-2 py-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 font-medium">{sym}</span>
          <input
            type="number"
            value={variant.price === 0 ? "" : variant.price}
            placeholder="0"
            onChange={(e) =>
              onChange({ price: e.target.value === "" ? 0 : Number(e.target.value) })
            }
            onFocus={(e) => e.target.value === "0" && e.target.select()}
            className="w-full border rounded px-2 py-1"
            min="0"
          />
        </div>
      </td>

      {/* PRECIO MAYORISTA (condicional) */}
      {wholesaleEnabled && (
        <td className="border px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 font-medium">{sym}</span>
            <input
              type="number"
              value={variant.wholesalePrice === 0 ? "" : variant.wholesalePrice}
              placeholder="0"
              onChange={(e) =>
                onChange({ wholesalePrice: e.target.value === "" ? 0 : Number(e.target.value) })
              }
              onFocus={(e) => e.target.value === "0" && e.target.select()}
              className="w-full border rounded px-2 py-1"
              min="0"
            />
            {wholesaleDiscountPct > 0 && (
              <button
                type="button"
                title={`Auto: -${wholesaleDiscountPct}% del minorista`}
                onClick={handleAutoWholesale}
                className="px-1.5 py-0.5 border rounded text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 whitespace-nowrap"
              >
                Auto
              </button>
            )}
          </div>
        </td>
      )}

      {/* STOCK */}
      <td className="border px-2 py-1">
        <input
          type="number"
          value={variant.stock === 0 ? "" : variant.stock}
          placeholder="0"
          onChange={(e) =>
            onChange({ stock: e.target.value === "" ? 0 : Number(e.target.value) })
          }
          onFocus={(e) => e.target.value === "0" && e.target.select()}
          className="w-full border rounded px-2 py-1"
          min="0"
        />
      </td>

      {/* SKU */}
      <td className="border px-2 py-1">
        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={variant.sku || ""}
            onChange={(e) => onChange({ sku: e.target.value, skuLocked: true })}
            className="w-full border rounded px-2 py-1"
          />
          <button
            type="button"
            title="Regenerar SKU"
            onClick={() =>
              onChange({ sku: generateSKU(productName, variant.attributes), skuLocked: false })
            }
            className="px-2 border rounded text-xs"
          >
            &#9851;
          </button>
        </div>
      </td>

      {/* IMAGEN */}
      <td className="border px-2 py-1 text-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {mainImage ? (
          <div className="relative inline-block">
            <img
              src={mainImage}
              alt=""
              className="w-10 h-10 object-cover rounded cursor-pointer"
              onClick={() => fileRef.current?.click()}
              title="Cambiar imagen"
            />
            <button
              type="button"
              onClick={() => onChange({ images: [], image: "" })}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] leading-none flex items-center justify-center"
            >
              x
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 mx-auto"
            title="Subir imagen"
          >
            +
          </button>
        )}
      </td>

      {/* STATUS */}
      <td className="border px-2 py-1 text-center">
        <input
          type="checkbox"
          checked={variant.status === "active"}
          onChange={(e) =>
            onChange({ status: e.target.checked ? "active" : "inactive" })
          }
          className="w-4 h-4 cursor-pointer accent-green-600"
          title={variant.status === "active" ? "Activo" : "Inactivo"}
        />
      </td>
    </tr>
  );
}
