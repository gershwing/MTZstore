/**
 * VARIANTES - Arte y Manualidades > Manualidades > Scrapbooking
 * Ruta: admin/src/variantes/arte-manualidades/manualidades/scrapbooking/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  AMPLIO uso en esta categoría: colores de pintura, tonos
 *                  de tela, texturas de papel, colores de hilo — la foto
 *                  del color real es decisiva para el artista.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  gramaje, tamaño, volumen, número de pinceles, dureza.
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
    opciones: ["Papel decorativo / Cardstock de color (hoja)", "Papel decorativo estampado (patterned paper)",
               "Pack papel decorativo (12×12\" — 30×30 cm)", "Cartulina (hoja individual)",
               "Cartulina pack colores (A4 / A3)", "Washi tape / Cinta decorativa (rollo individual)",
               "Set washi tapes", "Sellos de goma / acrílico (sello)", "Set sellos temáticos",
               "Almohadilla de tinta (ink pad)", "Set almohadillas de tinta multicolor",
               "Troqueladora / Die cut (figura)", "Set troqueladoras", "Esquinadora",
               "Perforador decorativo (punch)", "Stickers / Pegatinas decorativas",
               "Adhesivo doble cara (cinta)", "Glitter / Purpurina (pote)", "Set glitter",
               "Brads / Ojillos metálicos", "Flores de papel / embellishments", "Cinta de tela / ribbon"]
  },

  color_patron: {
    tipo: "imagen",
    nota: "El vendedor sube foto del papel / washi / patrón real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Papel liso rojo", "Papel liso azul marino", "Papel liso verde", "Papel liso negro",
      "Papel liso blanco", "Papel liso rosa", "Papel liso amarillo",
      "Papel floral (fondo blanco)", "Papel floral (fondo negro)", "Papel geométrico",
      "Papel punteado / lunares", "Papel a rayas", "Papel vintage / kraft",
      "Papel navideño", "Papel baby shower", "Papel boda / romántico",
      "Washi tape floral", "Washi tape rayas", "Washi tape puntos",
      "Washi tape colores sólidos", "Washi tape dorado / plateado",
      "Washi tape transparente + patrón", "Set washi tapes variados"
    ]
  },

  tamano_hoja: {
    tipo: "texto",
    opciones: ["A4 (21×29.7 cm)", "A3 (29.7×42 cm)", "12×12\" (30.5×30.5 cm)", "8.5×11\" (carta)",
               "6×6\" (15×15 cm)", "Rollo (washi)"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["1 hoja / unidad", "Pack 10 hojas", "Pack 20 hojas", "Pack 50 hojas", "Pack 100 hojas",
               "Rollo 5 m", "Rollo 10 m", "Rollo 15 m", "Set (ver descripción)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Fiskars (troqueladoras)", "We R Memory Keepers", "Sizzix / Tim Holtz",
               "Ranger Ink (almohadillas)", "Tombow (adhesivos)", "MT Tape (washi tape Japón)",
               "American Crafts", "Recollections / Michaels", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
