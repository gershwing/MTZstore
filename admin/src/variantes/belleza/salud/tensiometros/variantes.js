/**
 * VARIANTES - Belleza y Salud > Salud > Tensiómetros
 * Ruta: admin/src/variantes/belleza/salud/tensiometros/variantes.js
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
    guia_vendedor: ["Digital de brazo", "Digital de muñeca", "Manual / Aneroide", "Monitor Bluetooth / Smart"]
  },

  pantalla: {
    tipo: "texto",
    opciones: ["LCD estándar", "LCD retroiluminada", "Pantalla grande (fácil lectura)", "Con indicador semáforo (colores)"]
  },

  memorias: {
    tipo: "texto",
    opciones: ["Sin memoria", "30 lecturas", "60 lecturas", "90 lecturas", "120+ lecturas", "2 usuarios (memoria independiente)"]
  },

  conectividad: {
    tipo: "texto",
    opciones: ["Sin conectividad", "Bluetooth (app móvil)", "USB (descarga a PC)", "Wi-Fi"]
  },

  alimentacion: {
    tipo: "texto",
    opciones: ["Pilas AA", "Pilas AAA", "Recargable USB", "Adaptador AC + pilas"]
  },

  tamano_brazalete: {
    tipo: "texto",
    opciones: ["Estándar (22–32 cm)", "Grande (32–42 cm)", "Extra grande (42–52 cm)", "Ajustable universal"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
