import { useState } from "react";
import { uploadImages } from "../../utils/api";

/**
 * VariantImageUploader
 * ---------------------------------------------------
 * Maneja imágenes por variante con imagen principal
 */
export default function VariantImageUploader({
  images = [],
  onChange,
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files) => {
    if (!files?.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file);
    }

    setUploading(true);
    try {
      const res = await uploadImages(
        "/api/product/media/images",
        formData
      );

      const uploaded = (res?.data?.images || []).map(
        (url, idx) => ({
          url,
          isMain: images.length === 0 && idx === 0, // primera imagen principal
        })
      );

      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const setMainImage = (url) => {
    onChange(
      images.map((img) => ({
        ...img,
        isMain: img.url === url,
      }))
    );
  };

  const removeImage = (url) => {
    const filtered = images.filter((i) => i.url !== url);

    // si se borró la principal, asignar otra
    if (!filtered.some((i) => i.isMain) && filtered.length) {
      filtered[0].isMain = true;
    }

    onChange(filtered);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {uploading && (
        <p className="text-xs text-gray-500">
          Subiendo imágenes…
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        {images.map((img) => (
          <div
            key={img.url}
            className={`relative w-16 h-16 border rounded overflow-hidden ${img.isMain ? "ring-2 ring-blue-500" : ""
              }`}
          >
            <img
              src={img.url}
              className="w-full h-full object-cover"
            />

            {/* MAIN */}
            <button
              type="button"
              title="Marcar como principal"
              onClick={() => setMainImage(img.url)}
              className="absolute bottom-0 left-0 right-0 text-[10px] bg-black bg-opacity-60 text-white"
            >
              {img.isMain ? "PRINCIPAL" : "HACER PRINCIPAL"}
            </button>

            {/* REMOVE */}
            <button
              type="button"
              onClick={() => removeImage(img.url)}
              className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
