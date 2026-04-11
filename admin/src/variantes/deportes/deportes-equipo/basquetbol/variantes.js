/**
 * VARIANTES - Deportes > Deportes de Equipo > Basquetbol
 * Ruta: admin/src/variantes/deportes/deportes-equipo/basquetbol/variantes.js
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
      "Bal\u00f3n de basquetbol",
      "Camiseta de basquetbol",
      "Shorts de basquetbol",
      "Zapatillas de basquetbol",
      "Aro de basquetbol (portable)",
      "Aro de basquetbol (mural)",
      "Rodilleras de basquetbol",
      "Kit completo jugador"
    ]
  },

  talla_ropa: {
    tipo: "texto",
    requerido: false,
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
  },

  talla_calzado: {
    tipo: "texto",
    requerido: false,
    opciones: ["38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"]
  },

  numero_balon: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "N\u00b05 (mujer / juvenil)",
      "N\u00b06 (mujer oficial)",
      "N\u00b07 (hombre oficial)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / dise\u00f1o. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Naranja cl\u00e1sico", "Negro", "Blanco", "Azul", "Rojo",
      "Negro + dorado", "Blanco + azul", "Dise\u00f1o equipo (ver foto)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Nike Air Jordan / Zoom Freak / KD",
      "Adidas Dame / Harden / Pro Bounce",
      "Spalding (bal\u00f3n)",
      "Wilson Evolution / NCAA (bal\u00f3n)",
      "Under Armour Curry",
      "Puma Clyde / MB.01",
      "New Balance TWO WXY",
      "Gen\u00e9rico"
    ]
  },

  superficie_aro: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Interior (suelo parqu\u00e9 / madera)",
      "Exterior (cemento / asfalto)",
      "Universal"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
