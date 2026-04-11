/**
 * VARIANTES - Deportes > Aire Libre > Ropa Outdoor
 * Ruta: admin/src/variantes/deportes/aire-libre/ropa-outdoor/variantes.js
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
      "Chaqueta cortavientos",
      "Chaqueta impermeable / Rain jacket",
      "Chaqueta softshell",
      "Chaqueta pluma / Down jacket",
      "Chaqueta polar / Fleece",
      "Camiseta t\u00e9cnica manga larga",
      "Camiseta t\u00e9cnica manga corta",
      "Pantal\u00f3n de trekking",
      "Pantal\u00f3n convertible (short + largo)",
      "Mallas / Leggings t\u00e9rmicos",
      "Base layer superior (interior t\u00e9rmico)",
      "Base layer inferior",
      "Polainas / Gaiters",
      "Sombrero / Gorra outdoor",
      "Buff / Bandana multifuncional",
      "Guantes de trekking / Ski",
      "Chaleco pluma / Down vest"
    ]
  },

  genero: {
    tipo: "texto",
    requerido: true,
    opciones: ["Hombre", "Mujer", "Unisex"]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la prenda. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Gris oscuro", "Azul marino", "Verde oliva", "Rojo", "Naranja fluor",
      "Azul cielo", "Beige / Arena", "Amarillo", "Morado", "Verde bosque",
      "Gris + azul", "Negro + rojo", "Multicolor / Estampado monta\u00f1a"
    ]
  },

  impermeabilidad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No impermeable",
      "DWR (repelente agua b\u00e1sico)",
      "5.000 mm HH",
      "10.000 mm HH",
      "15.000 mm HH",
      "20.000 mm+ (GTX / H2No)"
    ]
  },

  transpirabilidad_mvp: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No transpirable",
      "5.000 g/m\u00b2/24h",
      "10.000 g/m\u00b2/24h",
      "20.000 g/m\u00b2/24h",
      "30.000 g/m\u00b2/24h+"
    ]
  },

  temperatura_base: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aislante",
      "0\u00b0C a 5\u00b0C",
      "\u22125\u00b0C a 0\u00b0C",
      "\u221210\u00b0C a \u22125\u00b0C",
      "\u221220\u00b0C a \u221210\u00b0C",
      "\u221220\u00b0C o menos"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "The North Face Resolve / Venture / Summit",
      "Patagonia Torrentshell / Nano Puff / R1",
      "Arc'teryx Beta / Zeta / Atom",
      "Columbia Watertight / Omni-Heat",
      "Salomon Bonatti / Outline",
      "Mammut Convey / Masao",
      "Marmot PreCip / Minimalist",
      "Quechua MH500 / MH900 (Decathlon)",
      "Rab Downpour / Microlight",
      "Jack Wolfskin Stormy Point / Helium",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
