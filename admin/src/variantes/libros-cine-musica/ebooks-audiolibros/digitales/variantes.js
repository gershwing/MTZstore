/**
 * VARIANTES - Libros, Cine y Música > E-books y Audiolibros > Digitales
 * Ruta: admin/src/variantes/libros-cine-musica/ebooks-audiolibros/digitales/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar solo donde la diferencia visual entre opciones
 *                  es determinante para la decisión de compra.
 * tipo: "texto"  → selector de chips / botones de texto. Predominante
 *                  en esta categoría por su naturaleza textual.
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
    opciones: ["E-book (archivo descargable)","E-book (código de activación)","Audiolibro MP3 descargable",
               "Audiolibro en CD (físico)","Suscripción de lectura (regalo / tarjeta)","Bundle libro físico + e-book"]
  },

  formato_ebook: {
    tipo: "texto",
    requerido: true,
    opciones: ["EPUB","EPUB3 (con audio/video)","MOBI / AZW (Kindle)","PDF",
               "Múltiples formatos incluidos","Sin DRM (libre de restricciones)"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español (España)","Español (LATAM)","Inglés","Portugués","Francés","Otros"]
  },

  plataforma: {
    tipo: "texto",
    requerido: false,
    opciones: ["Amazon Kindle","Apple Books","Google Play Books","Kobo",
               "Casa del Libro / Fnac digital","Descarga directa (DRM-free)","Audible (audiolibro)","Scribd"]
  },

  genero: {
    tipo: "texto",
    requerido: false,
    opciones: ["Ficción / Novela","No ficción / Ensayo","Autoayuda","Negocios","Técnico / Educativo",
               "Infantil / Juvenil","Cómic / Manga digital","Todos los géneros"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto de la portada digital. El cliente elige la imagen en el client.",
    guia_vendedor: ["Portada e-book (ver imagen)", "Portada audiolibro (ver imagen)",
                    "Bundle físico + digital (ver foto)", "Tarjeta regalo (ver foto)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["Penguin Random House Digital","Planeta eBooks","Amazon KDP",
               "Smashwords / Draft2Digital","Storytel","Audible / Amazon",
               "Editorial independiente","Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
