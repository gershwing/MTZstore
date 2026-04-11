/**
 * VARIANTES - Belleza y Salud > Maquillaje > Coloretes y Bronzer
 * Ruta: admin/src/variantes/belleza/maquillaje/coloretes-bronzer/variantes.js
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
    opciones: ["Colorete / Rubor en polvo", "Colorete / Rubor en crema", "Colorete líquido", "Bronzer en polvo", "Bronzer en crema", "Bronzer líquido", "Iluminador / Highlighter en polvo", "Iluminador / Highlighter en crema", "Iluminador líquido", "Contour en polvo", "Contour en crema / stick", "Paleta rostro (colorete + bronzer + iluminador)"]
  },

  tono: {
    tipo: "imagen",
    opciones: ["Rosa suave", "Melocotón / Peach", "Coral", "Berry / Baya", "Mauve / Malva", "Dorado / Gold (bronzer)", "Bronce medio (bronzer)", "Bronce oscuro (bronzer)", "Champagne (iluminador)", "Rosa dorado / Rose Gold (iluminador)", "Multipaleta (ver descripción)"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Mate", "Satinado", "Shimmer / Con brillo", "Luminoso / Dewy"]
  },

  formato: {
    tipo: "texto",
    opciones: ["Individual (compacto)", "Mini / Travel size", "Paleta multi-tonos", "Stick / Barra", "Líquido con gotero"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
