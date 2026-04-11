/**
 * VARIANTES - Deportes > Deportes de Equipo > F\u00fatbol
 * Ruta: admin/src/variantes/deportes/deportes-equipo/futbol/variantes.js
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
      "Bal\u00f3n de f\u00fatbol",
      "Camiseta de f\u00fatbol",
      "Shorts de f\u00fatbol",
      "Medias de f\u00fatbol",
      "Botines tacos (c\u00e9sped natural)",
      "Botines multitaco (c\u00e9sped artificial)",
      "Zapatillas f\u00fatbol sala / indoor",
      "Espinilleras",
      "Portero (guantes)",
      "Arco / Porter\u00eda",
      "Kit completo jugador",
      "Bomba infladora de bal\u00f3n"
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
    opciones: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"]
  },

  numero_balon: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "N\u00b03 (infantil)",
      "N\u00b04 (juvenil)",
      "N\u00b05 (oficial / adulto)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / dise\u00f1o real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco", "Negro", "Azul", "Rojo", "Verde", "Amarillo", "Naranja",
      "Multicolor", "Blanco + negro", "Azul + blanco", "Rojo + negro",
      "Dise\u00f1o club espec\u00edfico (ver foto)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Nike Mercurial / Phantom / Tiempo",
      "Adidas Predator / Copa / X Speedportal",
      "Puma Future / King",
      "New Balance Furon / Tekela",
      "Umbro / Joma / Kelme",
      "Mitre / Molten (balones)",
      "Gen\u00e9rico"
    ]
  },

  tipo_superficie: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "C\u00e9sped natural (FG)",
      "C\u00e9sped artificial (AG)",
      "C\u00e9sped artificial corto (TF)",
      "F\u00fatbol sala / Indoor (IC)",
      "Universal (MG multi-ground)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
