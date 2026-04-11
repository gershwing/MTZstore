/**
 * VARIANTES - Deportes > Aire Libre > Mochilas de Trekking
 * Ruta: admin/src/variantes/deportes/aire-libre/mochilas-trekking/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  capacidad_litros: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "15\u201320 L (day pack)",
      "20\u201330 L (senderismo d\u00eda)",
      "30\u201340 L (fin de semana)",
      "40\u201350 L (viaje corto)",
      "50\u201360 L (trekking semana)",
      "60\u201370 L (expedici\u00f3n)",
      "70\u201385 L (expedici\u00f3n larga)"
    ]
  },

  genero: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hombre", "Mujer", "Unisex / Ni\u00f1o"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Mochila de senderismo / Trekking",
      "Mochila de hidrataci\u00f3n (con reservorio)",
      "Mochila t\u00e9cnica de alpinismo",
      "Mochila de carrera / Trail running",
      "Day pack urbano-outdoor",
      "Mochila escolar + outdoor"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la mochila. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Azul marino", "Verde oliva", "Rojo", "Naranja", "Gris",
      "Beige / Arena", "Azul cielo", "Morado", "Multicolor / Estampado",
      "Negro + rojo", "Verde + gris"
    ]
  },

  suspension: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin sistema de suspensi\u00f3n (b\u00e1sica)",
      "Con espaldar acolchado",
      "Con sistema de suspensi\u00f3n ajustable",
      "Con armaz\u00f3n met\u00e1lico interno",
      "Con armaz\u00f3n + cintur\u00f3n lumbar articulado"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Nylon 210D",
      "Nylon 420D",
      "Ripstop nylon",
      "Poli\u00e9ster 600D",
      "Dyneema / Cuben Fiber (ultraligero)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Osprey Atmos / Aura / Kestrel / Tempest",
      "Deuter Speed Lite / Trail / Aircontact",
      "The North Face Borealis / Terra / Recon",
      "Gregory Baltoro / Deva / Zulu",
      "Arc'teryx Bora / Aerios / Mantis",
      "Salomon Trailblazer / ACS / Out Night",
      "Quechua NH500 / MH100 (Decathlon)",
      "Black Diamond Trail / Speed",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
