/**
 * VARIANTES - Belleza y Salud > Cuidado Personal > Afeitadoras
 * Ruta: admin/src/variantes/belleza/cuidado-personal/afeitadoras/variantes.js
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
    opciones: ["Afeitadora eléctrica rotativa", "Afeitadora eléctrica de lámina", "Recortadora de barba", "Recortadora multiusos (barba + cuerpo)", "Afeitadora de cabeza / Skull shaver", "Rasuradora corporal (body groomer)"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Recargable (batería Li-ion)", "Con cable", "Cable + batería", "Pilas AA / AAA"]
  },

  resistencia_agua: {
    tipo: "texto",
    opciones: ["No resistente al agua", "Uso en seco solamente", "Wet & Dry (seco y mojado)", "Sumergible / lavable bajo el grifo"]
  },

  accesorios: {
    tipo: "texto",
    opciones: ["Sin accesorios extra", "Con base de carga", "Con estuche de viaje", "Con peines guía (múltiples longitudes)", "Kit completo (base + estuche + peines)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Plateado", "Azul", "Negro mate", "Gris oscuro"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
