/**
 * VARIANTES - Deportes > Fitness > Bandas El\u00e1sticas
 * Ruta: admin/src/variantes/deportes/fitness/bandas-elasticas/variantes.js
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
      "Loop band mini (gl\u00fateos / piernas)",
      "Loop band grande (cuerpo completo)",
      "Banda de resistencia larga (pull-ups / movilidad)",
      "Tubo con manijas (entrenamiento brazos)",
      "Banda lateral (lateral walk)",
      "Set 5 bandas (resistencia graduada)",
      "Set 3 bandas largas",
      "Banda para sentadillas / squat band",
      "Banda para cadera / hip thrust",
      "Banda con agarres de tela (fabric band)"
    ]
  },

  resistencia: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Extra ligera: 5\u201315 lb (2\u20137 kg)",
      "Ligera: 15\u201335 lb (7\u201316 kg)",
      "Media: 35\u201365 lb (16\u201329 kg)",
      "Fuerte: 65\u2013100 lb (29\u201345 kg)",
      "Extra fuerte: 100\u2013150 lb (45\u201368 kg)",
      "Set graduado (XS a XL)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "L\u00e1tex natural",
      "L\u00e1tex sint\u00e9tico",
      "Tela + l\u00e1tex (fabric)",
      "TPE (sin l\u00e1tex)",
      "Goma / Caucho"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / set. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Gris", "Azul", "Verde", "Amarillo", "Rojo", "Naranja", "Rosa",
      "Morado", "Multicolor set 5 bandas", "Set tela (varios)"
    ]
  },

  ancho_mm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "10 mm", "13 mm", "22 mm", "32 mm", "44 mm", "64 mm", "83 mm",
      "Banda de tela (ancha)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Rogue Monster Bands",
      "WODFitters",
      "Fit Simplify",
      "Victorem",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
