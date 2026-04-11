/**
 * VARIANTES - Belleza y Salud > Cuidado Personal > Cuidado de Piel
 * Ruta: admin/src/variantes/belleza/cuidado-personal/cuidado-piel/variantes.js
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
    opciones: ["Cepillo facial eléctrico", "Masajeador facial", "Vaporizador facial", "Dispositivo de microdermoabrasión", "Dispositivo LED (terapia de luz)", "Rodillo derma (derma roller)", "Dispositivo de radiofrecuencia facial"]
  },

  tipo_piel: {
    tipo: "texto",
    opciones: ["Para todo tipo de piel", "Piel grasa / mixta", "Piel seca / sensible", "Piel madura / anti-edad"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Recargable USB", "Pilas", "Con cable", "Manual (sin batería)"]
  },

  accesorios: {
    tipo: "texto",
    opciones: ["Sin accesorios extra", "Con cabezales de repuesto", "Con estuche de viaje", "Con suero / gel incluido", "Kit completo (cabezales + estuche + suero)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Blanco", "Rosa", "Dorado / Rose Gold", "Negro", "Verde menta"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
