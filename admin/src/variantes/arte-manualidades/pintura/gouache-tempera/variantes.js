/**
 * VARIANTES - Arte y Manualidades > Pintura > Gouache y Témpera
 * Ruta: admin/src/variantes/arte-manualidades/pintura/gouache-tempera/variantes.js
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
    opciones: ["Gouache tradicional opaco", "Gouache acrílico (hybrid)", "Gouache blanco (Chinese white)",
               "Gouache metálico / nacarado", "Témpera escolar (pote)", "Témpera artística",
               "Témpera en polvo (reconstituir)", "Set gouache (varios tubos / potes)", "Set témpera escolar"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto de la muestra de color real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco permanente", "Negro", "Amarillo primario", "Amarillo cadmio",
      "Amarillo ocre", "Naranja", "Rojo escarlata", "Rojo carmín",
      "Magenta", "Violeta", "Azul ultramar", "Azul cobalto",
      "Azul cerúleo", "Azul ftalo", "Verde permanente", "Verde oliva",
      "Verde esmeralda", "Siena tostada", "Tierra sombra", "Blanco chino",
      "Dorado metálico", "Plateado metálico", "Rosa pastel", "Azul pastel"
    ]
  },

  volumen: {
    tipo: "texto",
    opciones: ["14 ml (tubo)", "20 ml (tubo)", "50 ml (pote)", "100 ml (pote)", "500 ml (pote)", "1 L (pote)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Winsor & Newton Designers' Gouache", "Holbein Acryla Gouache", "M. Graham Gouache",
               "Schmincke HKS Designers'", "Caran d'Ache Gouache", "Talens Gouache",
               "Pelikan Plaka (témpera)", "Alpino (témpera escolar)", "Artesco (témpera escolar)", "Acrilex (témpera)", "Faber-Castell (témpera)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
