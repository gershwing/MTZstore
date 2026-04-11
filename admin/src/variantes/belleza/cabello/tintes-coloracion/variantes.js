/**
 * VARIANTES - Belleza y Salud > Cabello > Tintes y Coloración
 * Ruta: admin/src/variantes/belleza/cabello/tintes-coloracion/variantes.js
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
    opciones: ["Tinte permanente", "Tinte semi-permanente", "Tinte demi-permanente", "Tinte temporal / Lavable", "Decolorante / Bleach", "Matizador / Toner", "Baño de color"]
  },

  tono: {
    tipo: "imagen",
    opciones: ["Negro", "Castaño oscuro", "Castaño medio", "Castaño claro", "Rubio oscuro", "Rubio medio", "Rubio claro / Platino", "Pelirrojo / Cobrizo", "Borgoña / Vino", "Rojo fantasía", "Azul fantasía", "Morado fantasía", "Rosa fantasía", "Verde fantasía", "Gris / Plata"]
  },

  cobertura_canas: {
    tipo: "texto",
    opciones: ["No aplica", "Cobertura parcial", "100% cobertura de canas"]
  },

  contenido: {
    tipo: "texto",
    opciones: ["1 aplicación", "2 aplicaciones", "Kit (tinte + revelador + guantes)", "Solo tinte (sin revelador)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
