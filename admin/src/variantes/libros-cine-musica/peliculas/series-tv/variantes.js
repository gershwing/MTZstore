/**
 * VARIANTES - Libros, Cine y Música > Películas > Series TV
 * Ruta: admin/src/variantes/libros-cine-musica/peliculas/series-tv/variantes.js
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
    opciones: ["DVD","Blu-ray (1080p)","Blu-ray 4K UHD","Combo 4K + Blu-ray"]
  },

  contenido: {
    tipo: "texto",
    requerido: true,
    opciones: ["Temporada 1 completa","Temporada 2 completa","Temporada 3 completa",
               "Temporada 4 completa","Temporada 5+","Serie completa (todas las temporadas)",
               "Pack seleccionado (mejores episodios)","Piloto / Episodio especial"]
  },

  edicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Edición estándar","Edición especial (con extras)","Edición coleccionista",
               "Steelbook","Edición limitada","Edición aniversario / Retro"]
  },

  region: {
    tipo: "texto",
    requerido: true,
    opciones: ["Región 1 (USA / Canadá)","Región 2 (Europa)","Región 4 (LATAM)","Región ALL","Región A / B (Blu-ray)"]
  },

  idioma_audio: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español + Inglés","Solo Español","Solo Inglés","Multilenguaje"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del box set / temporada. El cliente elige la imagen en el client.",
    guia_vendedor: ["Temporada X (ver caja)", "Serie completa box set (ver foto)",
                    "Steelbook serie (ver foto — metal)", "Edición coleccionista (ver foto)",
                    "Edición aniversario (ver foto)"]
  },

  numero_discos: {
    tipo: "texto",
    requerido: false,
    opciones: ["1 disco","2 discos","3 discos","4 discos","5–6 discos","7–10 discos","10+ discos"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
