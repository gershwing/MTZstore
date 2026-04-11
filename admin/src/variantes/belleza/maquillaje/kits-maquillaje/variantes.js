/**
 * VARIANTES - Belleza y Salud > Maquillaje > Kits de Maquillaje
 * Ruta: admin/src/variantes/belleza/maquillaje/kits-maquillaje/variantes.js
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
    opciones: ["Kit completo principiante", "Kit profesional", "Kit de viaje / Travel set", "Kit para regalo", "Set de brochas / pinceles", "Set de labiales", "Set de sombras", "Kit de contorno e iluminación"]
  },

  piezas: {
    tipo: "texto",
    opciones: ["3–5 piezas", "6–10 piezas", "11–15 piezas", "16–20 piezas", "20+ piezas"]
  },

  incluye_estuche: {
    tipo: "texto",
    opciones: ["Sin estuche", "Con estuche / neceser", "Con maletín profesional"]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Principiante", "Intermedio", "Profesional / MUA"]
  },

  color_estuche: {
    tipo: "imagen",
    opciones: ["Negro", "Rosa", "Dorado / Gold", "Transparente", "Estampado / Print"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
