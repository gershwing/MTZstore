// admin/src/config/categoryFeatures.js

// clave = slug de Category (asegúrate que tus categorías raíz usen estos slugs)
export const CATEGORY_FEATURES = {
  electronica: {
    mainSpecKey: "ram",                 // usa ProductRAMS
    mainSpecLabel: "Tecnología / especificación principal",
    showSize: false,
    showWeight: true,
  },
  ropa: {
    mainSpecKey: null,                  // no usamos RAM
    mainSpecLabel: "",
    showSize: true,
    showWeight: true,
  },
  pasteles: {
    mainSpecKey: "ram",                 // reusamos RAM para "sabor"
    mainSpecLabel: "Sabor del producto",
    showSize: false,
    showWeight: true,
  },
  zapatillas: {
    mainSpecKey: "size",                // aquí tamaño del calzado
    mainSpecLabel: "Talla",
    showSize: true,
    showWeight: true,
  },
};

// fallback por defecto
export const DEFAULT_FEATURES = {
  mainSpecKey: "ram",
  mainSpecLabel: "Tecnología / especificación principal",
  showSize: true,
  showWeight: true,
};

export function resolveFeaturesForStore(store) {
  const slug =
    store?.primaryCategorySlug ||
    store?.mainCategorySlug ||
    store?.primaryCategory ||
    "";

  const key = String(slug || "").toLowerCase().trim();

  return CATEGORY_FEATURES[key] || DEFAULT_FEATURES;
}
