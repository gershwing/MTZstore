/**
 * VARIANTES - Belleza y Salud > Cabello > Tratamientos de Cabello
 * Ruta: admin/src/variantes/belleza/cabello/tratamientos-cabello/variantes.js
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
    tipo: "imagen",
    requerido: true,
    guia_vendedor: ["Mascarilla capilar", "Aceite capilar", "Sérum", "Crema para peinar", "Ampolla", "Keratina", "Botox capilar", "Protector térmico"]
  },

  tipo_cabello: {
    tipo: "texto",
    opciones: ["Para todo tipo de cabello", "Cabello liso", "Cabello ondulado", "Cabello rizado / Afro", "Cabello teñido / Con color", "Cabello dañado / Quebradizo", "Cabello graso", "Cabello seco"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["Muestra / Travel size (< 100 ml)", "100–250 ml", "250–500 ml", "500 ml – 1 L", "1 L+ (tamaño profesional)"]
  },

  uso: {
    tipo: "texto",
    opciones: ["Uso diario", "1–2 veces por semana", "Tratamiento mensual", "Uso profesional en salón"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
