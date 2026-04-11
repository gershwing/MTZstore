/**
 * VARIANTES - Arte y Manualidades > Pintura > Acuarelas
 * Ruta: admin/src/variantes/arte-manualidades/pintura/acuarelas/variantes.js
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
    opciones: ["Acuarela pastilla individual (1/2 pan)", "Acuarela pastilla doble (full pan)",
               "Acuarela tubo", "Acuarela líquida (ecoline)", "Acuarela granulante (granulating)",
               "Acuarela metálica / nacarada", "Acuarela neón / fluorescente",
               "Set acuarela pastillas (12–48 colores)", "Set acuarela tubos", "Set acuarela líquida"]
  },

  color: {
    tipo: "imagen",
    nota: "El vendedor sube foto de la muestra lavada sobre papel de acuarela. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco chino / blanco cubriente", "Negro paynes grey", "Negro humo",
      "Amarillo cadmio limón", "Amarillo cadmio medio", "Amarillo indio",
      "Amarillo ocre", "Naranja cadmio", "Naranja quinacridona",
      "Rojo escarlata", "Rojo cadmio", "Carmín quinacridona",
      "Rosa opera", "Violeta cobalto", "Violeta dioxazina",
      "Azul ultramar", "Azul cobalto", "Azul cerúleo (granulante)",
      "Azul ftalo (phthalo)", "Azul prusia",
      "Verde ftalo", "Verde viridian", "Verde oliva",
      "Siena natural (transparente)", "Siena tostada",
      "Tierra sombra natural", "Tierra sombra tostada",
      "Dorado iridiscente", "Cobre nacarado", "Blanco de plata nacarada",
      "Turquesa granulante", "Lavanda granulante"
    ]
  },

  presentacion: {
    tipo: "texto",
    opciones: ["1/2 pan individual", "Full pan individual", "Tubo 5 ml", "Tubo 8 ml", "Tubo 14 ml",
               "Ecoline 30 ml", "Ecoline 250 ml", "Set 12 colores", "Set 24 colores", "Set 48 colores"]
  },

  serie: {
    tipo: "texto",
    opciones: ["Cotman / Estudiante", "Artista serie 1", "Artista serie 2", "Artista (pigmento puro)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Winsor & Newton Cotman / Professional", "Daniel Smith Extra Fine", "Schmincke Horadam",
               "Sennelier L'Aquarelle", "QoR (Golden)", "Holbein Artists'", "Royal Talens Rembrandt / Van Gogh",
               "Ecoline (Royal Talens — líquida)", "Gansai Tambi (Kuretake — japonesa)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
