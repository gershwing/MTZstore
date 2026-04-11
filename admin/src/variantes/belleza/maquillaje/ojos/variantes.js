/**
 * VARIANTES - Belleza y Salud > Maquillaje > Ojos
 * Ruta: admin/src/variantes/belleza/maquillaje/ojos/variantes.js
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
    opciones: ["Paleta de sombras", "Sombra individual", "Delineador líquido (eyeliner)", "Delineador en lápiz", "Delineador en gel / pot", "Máscara de pestañas (rímel)", "Pestañas postizas (tira completa)", "Pestañas individuales / en racimo", "Primer de ojos / Prebase", "Lápiz para cejas", "Gel para cejas", "Kit de cejas (pomada + pincel)"]
  },

  tono_color: {
    tipo: "imagen",
    opciones: ["Neutros / Nude (paleta)", "Tonos cálidos / Warm (paleta)", "Tonos fríos / Cool (paleta)", "Colorida / Multicolor (paleta)", "Negro", "Marrón / Brown", "Gris / Charcoal", "Blanco / Highlight", "Dorado / Gold", "Bronce / Bronze", "Transparente / Clear"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Mate", "Shimmer / Brillante", "Glitter", "Satinado", "Metálico", "Mixto (mate + shimmer)"]
  },

  resistencia: {
    tipo: "texto",
    opciones: ["Estándar", "Waterproof / A prueba de agua", "Smudge-proof / No se corre", "Larga duración (12+ horas)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
