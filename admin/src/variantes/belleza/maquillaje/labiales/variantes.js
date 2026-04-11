/**
 * VARIANTES - Belleza y Salud > Maquillaje > Labiales
 * Ruta: admin/src/variantes/belleza/maquillaje/labiales/variantes.js
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
    opciones: ["Labial barra clásico", "Labial líquido mate", "Labial líquido glossy", "Lip gloss / Brillo labial", "Lip liner / Delineador de labios", "Lip tint / Tinte de labios", "Bálsamo con color"]
  },

  acabado: {
    tipo: "texto",
    opciones: ["Mate", "Satinado / Satin", "Cremoso", "Glossy / Brillante", "Metálico / Shimmer", "Terciopelo / Velvet"]
  },

  tono: {
    tipo: "imagen",
    opciones: ["Nude claro", "Nude rosado", "Nude marrón", "Rosa suave", "Rosa intenso / Hot Pink", "Rojo clásico", "Rojo oscuro / Burgundy", "Coral", "Terracota", "Mauve / Malva", "Berry / Baya", "Ciruela / Plum", "Marrón chocolate", "Transparente / Clear"]
  },

  duracion: {
    tipo: "texto",
    opciones: ["Estándar (retocar)", "Larga duración (8+ horas)", "Transfer-proof / No transfiere", "Waterproof"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
