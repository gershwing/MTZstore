/**
 * VARIANTES - Belleza y Salud > Salud > Termómetros
 * Ruta: admin/src/variantes/belleza/salud/termometros/variantes.js
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
    guia_vendedor: ["Digital oral", "Infrarrojo sin contacto", "De oído", "De frente", "Smart / Bluetooth"]
  },

  velocidad: {
    tipo: "texto",
    opciones: ["Lectura estándar (30–60 seg)", "Lectura rápida (1–10 seg)", "Lectura instantánea (< 1 seg)"]
  },

  pantalla: {
    tipo: "texto",
    opciones: ["LCD estándar", "LCD retroiluminada", "LCD con código de colores (fiebre)", "Sin pantalla digital (analógico)"]
  },

  memorias: {
    tipo: "texto",
    opciones: ["Sin memoria", "Última lectura", "10 lecturas", "20+ lecturas"]
  },

  uso_recomendado: {
    tipo: "texto",
    opciones: ["Bebés / Niños", "Adultos", "Toda la familia", "Uso clínico / profesional"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
