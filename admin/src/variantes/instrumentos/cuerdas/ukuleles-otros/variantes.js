/**
 * VARIANTES - Instrumentos > Cuerdas > Ukuleles y Otros
 * Ruta: admin/src/variantes/instrumentos/cuerdas/ukuleles-otros/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
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
    opciones: ["Ukulele soprano (21\")", "Ukulele concert (23\")", "Ukulele tenor (26\")", "Ukulele barítono (30\")",
               "Ukulele bass (eléctrico)", "Banjo 5 cuerdas (open back)", "Banjo 5 cuerdas (resonador)",
               "Mandolina tipo A", "Mandolina tipo F", "Arpa celta / folk (22–36 cuerdas)",
               "Charango (10 cuerdas LATAM)", "Cuatro venezolano (4 cuerdas)", "Tiple colombiano",
               "Sitar", "Cavaquinho / Cavaco", "Lap steel guitar", "Cigar box guitar"]
  },

  acabado_color: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del instrumento. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Natural brillante", "Natural mate", "Caoba / Mahogany natural",
      "Aqua / Turquesa", "Rosa", "Azul marino", "Negro", "Rojo",
      "Amarillo", "Verde", "Blanco", "Estampado hawaiano / floral",
      "Con diseño pintado a mano (ver foto)"
    ]
  },

  numero_cuerdas: {
    tipo: "texto",
    requerido: true,
    opciones: ["4 cuerdas", "5 cuerdas", "6 cuerdas", "8 cuerdas (ukulele tenor 4 pares)", "22–36 cuerdas (arpa)"]
  },

  tapa: {
    tipo: "texto",
    requerido: false,
    opciones: ["Tapa sólida (solid top)", "Tapa laminada", "All-solid", "Plástico ABS (principiante)"]
  },

  con_pastilla: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin pastilla (acústico puro)", "Con pastilla pasiva", "Con pastilla activa + preamp", "Con afinador integrado"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Kala KA-15S / Waterman / Makala (ukulele)", "Lanikai LU-21 / Concert",
               "Ohana SK-28 / TK-35G", "Flight NUS310 / TUS35",
               "Deering Goodtime (banjo)", "Eastman MD305 (mandolina)",
               "Dusty Strings (arpa)", "Roosebeck (arpa celta)", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo instrumento", "Con funda blanda", "Con funda acolchada", "Kit completo (funda + cuerdas + afinador)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
