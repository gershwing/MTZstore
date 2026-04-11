/**
 * VARIANTES - Libros, Cine y Música > Películas > Películas Físico
 * Ruta: admin/src/variantes/libros-cine-musica/peliculas/peliculas-fisico/variantes.js
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

  formato_fisico: {
    tipo: "texto",
    requerido: true,
    opciones: ["DVD","Blu-ray (1080p)","Blu-ray 4K UHD","4K UHD + Blu-ray (combo)",
               "4K UHD + Blu-ray + Digital (combo 3 discos)","HD DVD (coleccionista)",
               "VHS (coleccionista vintage)"]
  },

  edicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Edición estándar","Edición especial (con extras)","Edición coleccionista",
               "Edición de lujo / Digibook","Edición Steelbook (metálica)","Edición con slipcase",
               "Edición aniversario","Edición limitada numerada","Edición restaurada / 4K remasterizada"]
  },

  region: {
    tipo: "texto",
    requerido: true,
    opciones: ["Región 1 (USA / Canadá)","Región 2 (Europa / Japón)","Región 4 (LATAM / Australia)",
               "Región ALL (sin restricción)","Región B (Blu-ray Europa / Australia)","Región A (Blu-ray América)"]
  },

  idioma_audio: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español + Inglés","Solo Español","Solo Inglés","Multilenguaje (5+ idiomas)","Versión original (VO)"]
  },

  subtitulos: {
    tipo: "texto",
    requerido: false,
    opciones: ["Español","Español + Inglés","Multilenguaje","Sin subtítulos","Opcionales (varios)"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la caja / edición. El cliente elige la imagen en el client.",
    guia_vendedor: ["Edición estándar DVD (ver caja)", "Blu-ray estándar (ver caja)",
                    "4K UHD (ver caja)", "Steelbook (ver foto — metal)",
                    "Edición coleccionista (ver foto)", "Digibook (ver foto)",
                    "Slipcase edición especial (ver foto)", "Box set / Saga completa (ver foto)"]
  },

  contenido: {
    tipo: "texto",
    requerido: false,
    opciones: ["Película individual","Saga / Colección (box set 2 films)","Saga (box set 3 films)",
               "Saga completa (4+ films)","Trilogía","Obra completa del director"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
