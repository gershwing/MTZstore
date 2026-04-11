/**
 * VARIANTES - Belleza y Salud > Maquillaje > Bases de Maquillaje
 * Ruta: admin/src/variantes/belleza/maquillaje/bases/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota belleza: los tonos de maquillaje y colores de producto se manejan
 *               con tipo:"imagen" para que el cliente vea el tono real.
 *               Cada variante de tono requiere foto subida por el vendedor.
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
    opciones: ["Base líquida", "Base en polvo", "Base en barra (stick)", "BB Cream", "CC Cream", "Base cushion (compacta)", "Base mousse / espuma"]
  },

  cobertura: {
    tipo: "texto",
    opciones: ["Ligera / Natural", "Media", "Alta / Full coverage", "Buildable (construible)"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Mate", "Semi-mate", "Satinado / Natural", "Luminoso / Dewy", "Aterciopelado"]
  },

  tono: {
    tipo: "imagen",
    opciones: ["Porcelana / Ivory", "Beige claro / Fair", "Beige medio / Medium", "Beige dorado / Golden", "Canela / Tan", "Caramelo / Caramel", "Moreno / Brown", "Moreno oscuro / Deep", "Espresso / Ebony"]
  },

  tipo_piel: {
    tipo: "texto",
    opciones: ["Para todo tipo de piel", "Piel grasa / mixta", "Piel seca", "Piel sensible", "Piel madura"]
  },

  duracion: {
    tipo: "texto",
    opciones: ["Hasta 8 horas", "Hasta 12 horas", "Hasta 16 horas", "Hasta 24 horas", "Larga duración (waterproof)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
