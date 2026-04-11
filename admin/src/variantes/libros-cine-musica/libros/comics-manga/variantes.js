/**
 * VARIANTES - Libros, Cine y Música > Libros > Cómics y Manga
 * Ruta: admin/src/variantes/libros-cine-musica/libros/comics-manga/variantes.js
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
    opciones: ["Manga (japonés → español)","Manhwa (coreano → español)","Manhua (chino → español)",
               "Cómic Marvel","Cómic DC","Cómic independiente / Indie","Novela gráfica adulta",
               "Webtoon impreso","Artbook / Libro de arte oficial","Guía oficial / Companion book"]
  },

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tomo individual (tankōbon)","Edición especial con extras","Edición de lujo (deluxe)",
               "Omnibus (varios tomos en uno)","Box set colección completa","Edición kanzenban",
               "Formato americano (32 páginas)","Formato europeo (álbum 48 páginas)"]
  },

  numero_tomo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tomo 1","Tomo 2","Tomo 3","Tomo 4","Tomo 5","Tomo 6","Tomo 7","Tomo 8",
               "Tomo 9","Tomo 10","Tomos 11–20","Tomos 21–30","Tomos 31–40","Tomos 41+",
               "Tomo único / One-shot","Serie completa"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español (España — lectura occidental)","Español (LATAM)","Japonés (original)",
               "Inglés","Lectura oriental (derecha a izquierda)"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la portada / edición. El cliente elige la imagen en el client.",
    guia_vendedor: ["Tomo estándar (ver portada)", "Edición especial (ver portada)",
                    "Edición deluxe (ver portada)", "Omnibus / Box set (ver foto)",
                    "Artbook oficial (ver portada)", "Cómic Marvel / DC (ver portada)"]
  },

  sentido_lectura: {
    tipo: "texto",
    requerido: false,
    opciones: ["Occidental (izquierda → derecha)","Oriental (derecha → izquierda)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["Norma Editorial (España)","Planeta Cómic","ECC Ediciones (DC / Vertigo)",
               "Panini Comics (Marvel)","Ivréa (manga LATAM)","Ovni Press (LATAM)",
               "Viz Media","Kodansha Comics","Shueisha Jump Comics","Dark Horse Comics",
               "Image Comics","BOOM! Studios","Genérico / Autoedición"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
