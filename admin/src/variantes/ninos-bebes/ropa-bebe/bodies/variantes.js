/**
 * VARIANTES - Bebés > Ropa Bebé > Bodies
 * Ruta: admin/src/variantes/bebes/ropa-bebe/bodies/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "RN (Recién nacido 0–1 mes)",
      "0–3 meses",
      "3–6 meses",
      "6–9 meses",
      "9–12 meses",
      "12–18 meses",
      "18–24 meses"
    ]
  },

  manga: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sin manga / Tirantes", "Manga corta", "Manga larga"]
  },

  tipo_cierre: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Broches en entrepierna",
      "Cremallera frontal",
      "Sobre cabeza (sin cierre)"
    ]
  },

  genero: {
    tipo: "texto",
    requerido: true,
    opciones: ["Niño", "Niña", "Unisex"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / estampado real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco liso", "Blanco + estampado animales", "Azul claro", "Rosa claro",
      "Amarillo", "Verde menta", "Gris", "Multicolor / Set",
      "Estampado dinosaurios", "Estampado flores", "Estampado unicornio",
      "Estampado estrellas", "Estampado rayas", "Estampado frutas"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "100% Algodón suave",
      "Algodón orgánico (GOTS)",
      "Algodón + elastano (2–5%)",
      "Bambú orgánico",
      "Interlock (doble tejido)"
    ]
  },

  pack: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Unidad individual",
      "Pack 2 unidades",
      "Pack 3 unidades",
      "Pack 5 unidades",
      "Pack 7 unidades"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Carter's",
      "Chicco",
      "Pampers Pure (textil)",
      "H&M Baby",
      "Zara Baby",
      "OshKosh B'gosh",
      "Gerber Childrenswear",
      "Garanimals",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
