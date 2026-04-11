/**
 * VARIANTES - Oficina > Material Escolar > Mochilas Escolar
 * Ruta: admin/src/variantes/oficina/material-escolar/mochilas-escolar/variantes.js
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

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Mochila escolar primaria (1–6 básico)",
      "Mochila escolar secundaria / media",
      "Mochila universitaria / portátil",
      "Mochila con ruedas / trolley escolar",
      "Mochila ergonómica con espalda rígida",
      "Mochila de jardín / preescolar (mini)",
      "Mochila deportiva + escolar (2 en 1)",
      "Maletín escolar (asa sin rueda)"
    ]
  },

  capacidad_litros: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "8–12 L (preescolar)",
      "12–18 L (primaria)",
      "18–25 L (secundaria)",
      "25–35 L (universitaria)",
      "35 L+"
    ]
  },

  compartimentos: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1 compartimento principal",
      "2 compartimentos",
      "3 compartimentos",
      "4+ compartimentos + organizador"
    ]
  },

  bolsillo_laptop: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin bolsillo laptop",
      "Para laptop 13\"",
      "Para laptop 14\"",
      "Para laptop 15.6\"",
      "Para laptop 17\""
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la mochila. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro liso", "Azul marino", "Gris", "Rojo", "Verde oscuro",
      "Rosa", "Morado", "Celeste", "Estampado personaje infantil",
      "Estampado dinosaurios", "Estampado unicornio", "Estampado astronauta",
      "Camuflaje", "Negro + detalle de color", "Multicolor tie-dye"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Poliéster 600D",
      "Oxford nylon",
      "Nylon balístico",
      "Canvas / Lona",
      "Cuero sintético PU"
    ]
  },

  espalda_ergonomica: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Espalda plana acolchada",
      "Espalda ventilada con canales de aire",
      "Espalda ergonómica rígida (ortopédica)",
      "Tirantes regulables + pectoral"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Totto (LATAM)",
      "Kipling Fundamental / Seoul",
      "Eastpak Padded Pak'R / Provider",
      "Samsonite Paradiver / Guardit",
      "Herschel Pop Quiz / Little America",
      "Jansport Superbreak / Big Student",
      "Targus (laptop)",
      "SwissGear / Wenger",
      "Genérico",
      "Marca escolar local (Artesco / Norma / Scribe)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
