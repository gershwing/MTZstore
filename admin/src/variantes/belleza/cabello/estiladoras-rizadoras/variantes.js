/**
 * VARIANTES - Belleza y Salud > Cabello > Estiladoras y Rizadoras
 * Ruta: admin/src/variantes/belleza/cabello/estiladoras-rizadoras/variantes.js
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
    opciones: ["Plancha alisadora", "Rizadora (curling iron)", "Tenaza cónica", "Rizadora automática (auto-curl)", "Cepillo alisador eléctrico", "Ondulador triple barril", "Multi-estiladora (placas intercambiables)"]
  },

  tamano_barril: {
    tipo: "texto",
    opciones: ["Delgado (< 25 mm)", "Mediano (25–32 mm)", "Grueso (32–38 mm)", "Extra grueso (38 mm+)", "No aplica (plancha)"]
  },

  material_placas: {
    tipo: "texto",
    opciones: ["Cerámica", "Turmalina", "Titanio", "Cerámica + turmalina", "Queratina infundida"]
  },

  temperatura: {
    tipo: "texto",
    opciones: ["Fija (una temperatura)", "Ajustable (150°–230°C)", "Digital con control preciso", "Con protección de calor automática"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Con cable", "Inalámbrica (recargable)", "Dual voltage (viaje)"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Negro", "Rosa", "Blanco", "Dorado / Rose Gold", "Morado", "Rojo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
