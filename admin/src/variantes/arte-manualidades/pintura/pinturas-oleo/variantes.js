/**
 * VARIANTES - Arte y Manualidades > Pintura > Pinturas al Óleo
 * Ruta: admin/src/variantes/arte-manualidades/pintura/pinturas-oleo/variantes.js
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
    opciones: ["Óleo tradicional (aceite de linaza)", "Óleo alquídico (secado rápido / alkyd)",
               "Óleo water-mixable (soluble en agua)", "Óleo para estudiante / estudio",
               "Óleo artista (pigmento puro, alta concentración)", "Óleo metálico / nacarado",
               "Set óleos (varios tubos)", "Óleo pastoso / impasto"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto de la muestra de color real sobre lienzo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco titanio", "Blanco de plata (flake white)", "Negro marfil", "Negro carbón",
      "Amarillo cadmio claro", "Amarillo cadmio medio", "Amarillo de Nápoles",
      "Amarillo ocre", "Amarillo limón / hansa",
      "Naranja cadmio", "Rojo cadmio claro", "Rojo cadmio oscuro",
      "Carmín / Alizarin crimson", "Rojo bermellón", "Magenta quinacridona",
      "Azul ultramar", "Azul cobalto", "Azul cerúleo",
      "Azul ftalo (phthalo)", "Azul prusia",
      "Verde ftalo", "Verde veronés", "Verde esmeralda",
      "Verde oliva", "Verde permanente",
      "Violeta cobalto", "Dioxazine purple",
      "Siena natural", "Siena tostada", "Tierra sombra natural",
      "Tierra sombra tostada", "Tierra de Cassel (Van Dyck brown)",
      "Dorado iridiscente", "Cobre metálico"
    ]
  },

  volumen: {
    tipo: "texto",
    opciones: ["20 ml (tubo)", "37 ml (tubo)", "60 ml (tubo)", "120 ml (tubo)", "200 ml (tubo)", "500 ml"]
  },

  serie: {
    tipo: "texto",
    opciones: ["Estudio / Estudiante", "Artista serie 1", "Artista serie 2", "Artista serie 3 (máxima pigmentación)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Winsor & Newton Artists' / Winton", "Old Holland Classic", "Williamsburg Handmade",
               "Gamblin Artist Colors / 1980", "Michael Harding", "Schmincke Mussini / Norma",
               "Daler-Rowney Georgian", "Talens Rembrandt / Van Gogh", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
