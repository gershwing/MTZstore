/**
 * VARIANTES - Arte y Manualidades > Dibujo > Lápices de Dibujo
 * Ruta: admin/src/variantes/arte-manualidades/dibujo/lapices-dibujo/variantes.js
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
    opciones: ["Lápiz grafito (dureza individual)", "Set lápices grafito (varios durezas)",
               "Lápiz carboncillo (individual)", "Set carboncillos", "Carboncillo prensado (barra)",
               "Lápiz de color (individual)", "Set lápices de color (12–120 colores)",
               "Lápiz acuarelable (individual)", "Set lápices acuarelables", "Lápiz pastel (individual)",
               "Set lápices pastel", "Lápiz de colores metálicos / neón", "Lápiz blanco (destacar / papel de color)",
               "Portaminas artístico 0.3–0.7 mm", "Mina de repuesto (grafito artístico)",
               "Esfumino / difumino (set)", "Goma maleable / moldeable"]
  },

  color_lapiz: {
    tipo: "imagen",
    nota: "El vendedor sube foto del color / set real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "9H / 8H / 7H (durísimo, líneas finas)", "6H / 5H / 4H (muy duro)",
      "3H / 2H / H (duro)", "F / HB (medio — escritura)", "B / 2B (suave)",
      "3B / 4B (blando)", "5B / 6B (muy blando)", "7B / 8B / 9B (extra blando)",
      "Set 12 colores básicos", "Set 24 colores", "Set 36 colores",
      "Set 48 colores", "Set 72 colores", "Set 120 colores profesional",
      "Amarillo cadmio / limón", "Naranja", "Rojo escarlata", "Carmín",
      "Violeta", "Azul ultramar", "Azul cobalto", "Verde prado",
      "Verde oliva", "Siena tostada", "Tierra sombra", "Negro",
      "Blanco (lápiz para paper de color)",
      "Set acuarelable 12 colores", "Set acuarelable 24 colores",
      "Set acuarelable 36 colores", "Set acuarelable 48 colores",
      "Set pastel 12 colores", "Set pastel 24 colores", "Set pastel 48 colores"
    ]
  },

  dureza_grafito: {
    tipo: "texto",
    opciones: ["9H", "8H", "7H", "6H", "5H", "4H", "3H", "2H", "H", "F", "HB", "B",
               "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B", "Set variado"]
  },

  cantidad_set: {
    tipo: "texto",
    opciones: ["Unidad individual", "Set 6", "Set 12", "Set 24", "Set 36", "Set 48", "Set 72", "Set 120"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Faber-Castell 9000 / Polychromos / Albrecht Dürer",
               "Staedtler Mars Lumograph / Ergosoft / Karat",
               "Derwent Graphic / Coloursoft / Watercolour / Inktense",
               "Prismacolor Premier / Scholar", "Caran d'Ache Luminance / Pablo / Supracolor",
               "Koh-I-Noor Hardtmuth / Progresso", "Lyra Rembrandt", "Artesco (escolar)", "Maped (escolar)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
