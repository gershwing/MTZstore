/**
 * VARIANTES - Bebés > Alimentación > Lactancia
 * Ruta: admin/src/variantes/bebes/alimentacion/lactancia/variantes.js
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

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Sacaleches eléctrico simple",
      "Sacaleches eléctrico doble",
      "Sacaleches manual",
      "Sacaleches portátil / wearable (manos libres)",
      "Bolsas de almacenamiento leche materna",
      "Biberón / Mamadera",
      "Set biberones (pack)",
      "Tetina / Chupete para biberón",
      "Calienta biberones / esterilizador",
      "Almohada de lactancia",
      "Pezoneras",
      "Copas de lactancia / Silverette",
      "Gel / Crema para pezones",
      "Sujetador de lactancia"
    ]
  },

  talla_copa_sujeta: {
    tipo: "texto",
    requerido: false,
    opciones: ["S", "M", "L", "XL", "XXL", "Talla única / ajustable"]
  },

  flujo_tetina: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Flujo lento (0–3 meses)",
      "Flujo medio (3–6 meses)",
      "Flujo rápido (6+ meses)",
      "Flujo variable"
    ]
  },

  capacidad_ml: {
    tipo: "texto",
    requerido: false,
    opciones: ["120 ml", "150 ml", "160 ml", "180 ml", "240 ml", "260 ml", "300 ml", "330 ml"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Rosa", "Azul", "Verde menta", "Transparente / Vidrio",
      "Gris", "Lila", "Multicolor set", "Azul marino + blanco"
    ]
  },

  material_biberon: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Plástico PPSU (libre BPA)",
      "Plástico PP (libre BPA)",
      "Vidrio borosilicato",
      "Acero inoxidable"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Medela Freestyle / Swing / Sonata",
      "Spectra S1 / S2 / 9 Plus",
      "Haakaa (manual / wearable)",
      "Elvie Stride (wearable)",
      "Willow Go (wearable)",
      "Philips Avent Natural / Classic",
      "Dr. Brown's Original / Options+",
      "Mam Easy Start",
      "Chicco Perfect 5",
      "Comotomo",
      "Lansinoh (bolsas / crema)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
