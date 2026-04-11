/**
 * VARIANTES - Arte y Manualidades > Pintura > Soportes para Pintura
 * Ruta: admin/src/variantes/arte-manualidades/pintura/soportes-pintura/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  AMPLIO uso en esta categoría: colores de pintura, tonos
 *                  de tela, texturas de papel, colores de hilo — la foto
 *                  del color real es decisiva para el artista.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  gramaje, tamaño, volumen, número de pinceles, dureza.
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
    guia_vendedor: ["Lienzo en bastidor", "Bloc papel acuarela", "Bloc papel óleo", "Cartón entelado", "Tabla MDF", "Tela suelta por metro", "Gesso imprimación", "Bastidor solo"]
  },

  tamano: {
    tipo: "texto",
    opciones: ["9×12 cm", "13×18 cm", "18×24 cm", "20×20 cm (cuadrado)", "24×30 cm", "30×40 cm",
               "40×50 cm", "50×60 cm", "50×70 cm", "60×80 cm", "70×100 cm", "80×100 cm", "100×120 cm",
               "120×150 cm", "Por metro lineal (tela suelta)"]
  },

  profundidad_bastidor: {
    tipo: "texto",
    opciones: ["No aplica (panel / bloc)", "18 mm (fino)", "38 mm (estándar)", "50 mm (galería)", "70 mm (extra)"]
  },

  imprimado: {
    tipo: "texto",
    opciones: ["Sin imprimación (crudo)", "Con imprimación blanca (gesso)", "Con imprimación negra",
               "Con imprimación de color (terra / siena)", "Listo para óleo", "Listo para acrílico", "Universal"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["1 unidad", "Pack 2", "Pack 3", "Pack 5", "Pack 10", "Bloc 10 hojas", "Bloc 20 hojas", "Por metro"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Fredrix", "Raymar Art", "Centurion (lino)", "Clairefontaine",
               "Golden Gesso / GAC", "Winsor & Newton Gesso", "Liquitex Gesso", "Mont Marte (LATAM)", "Artistica Nacional (Bolivia)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
