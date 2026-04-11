/**
 * VARIANTES - Belleza y Salud > Cuidado Personal > Depiladoras
 * Ruta: admin/src/variantes/belleza/cuidado-personal/depiladoras/variantes.js
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
    opciones: ["Depiladora eléctrica (epilator)", "IPL / Luz pulsada intensa", "Láser doméstico", "Depiladora de cera eléctrica (calentador)", "Depiladora con hilo (threading)"]
  },

  zona_uso: {
    tipo: "texto",
    opciones: ["Cuerpo completo", "Piernas y brazos", "Rostro", "Bikini / Axilas", "Multizona (cuerpo + rostro + bikini)"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Recargable (batería)", "Con cable", "Cable + batería"]
  },

  resistencia_agua: {
    tipo: "texto",
    opciones: ["No resistente al agua", "Wet & Dry (seco y mojado)"]
  },

  accesorios: {
    tipo: "texto",
    opciones: ["Sin accesorios extra", "Con cabezales intercambiables", "Con estuche de viaje", "Con gel / crema incluido", "Kit completo (cabezales + estuche + gel)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Rosa", "Morado", "Dorado / Rose Gold", "Negro"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
