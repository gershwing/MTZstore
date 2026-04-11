/**
 * VARIANTES - Belleza y Salud > Salud > Mascarillas y Protección
 * Ruta: admin/src/variantes/belleza/salud/mascarillas-proteccion/variantes.js
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
    opciones: ["Mascarilla quirúrgica desechable", "Mascarilla KN95", "Mascarilla N95", "Mascarilla de tela reutilizable", "Careta facial / Face shield", "Guantes de nitrilo (caja)", "Guantes de látex (caja)", "Gel antibacterial", "Alcohol en spray"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["1 unidad", "Paquete 10 unidades", "Paquete 20 unidades", "Paquete 50 unidades", "Caja 100 unidades", "A granel (ver descripción)"]
  },

  talla: {
    tipo: "texto",
    opciones: ["Unitalla", "Chica / S", "Mediana / M", "Grande / L", "Extra Grande / XL", "Infantil"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Negro", "Azul médico", "Rosa", "Gris", "Estampado / Diseño"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
