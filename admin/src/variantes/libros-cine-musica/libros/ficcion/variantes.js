/**
 * VARIANTES - Libros, Cine y Música > Libros > Ficción
 * Ruta: admin/src/variantes/libros-cine-musica/libros/ficcion/variantes.js
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

  genero: {
    tipo: "texto",
    requerido: true,
    opciones: ["Novela literaria","Thriller / Suspenso","Terror / Horror","Ciencia ficción",
               "Fantasía épica","Fantasía urbana","Romance","Romance histórico",
               "Misterio / Policial","Aventura / Acción","Histórica","Distopía",
               "Realismo mágico (LATAM)","Humor / Comedia","Erótica / Romance adulto",
               "Novela gráfica","Antología de cuentos / Relatos cortos"]
  },

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tapa blanda / Rústica (bolsillo)","Tapa blanda estándar","Tapa dura (hardcover)",
               "Tapa dura con sobrecubierta (dustjacket)","Edición de lujo / Collector's edition",
               "Edición especial (slipcase / caja)","Edición ilustrada","Gran formato / Cafetera"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español (España)","Español (LATAM)","Inglés (USA)","Inglés (UK)",
               "Portugués (Brasil)","Francés","Alemán","Italiano","Japonés","Otros"]
  },

  edicion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Primera edición","Edición revisada","Edición aniversario","Edición de bolsillo",
               "Edición escolar / anotada","Edición bilingüe","Edición sin especificar"]
  },

  numero_tomos: {
    tipo: "texto",
    requerido: false,
    opciones: ["Tomo único","Tomo 1 de serie","Tomo 2","Tomo 3","Tomo 4","Tomo 5+",
               "Saga completa (box set)","Duología completa","Trilogía completa"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto de la portada / edición real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Edición tapa blanda (ver portada)", "Edición tapa dura (ver portada)",
                    "Edición especial / ilustrada (ver portada)", "Box set / Caja (ver foto)",
                    "Edición LATAM (ver portada)", "Edición España (ver portada)",
                    "Edición inglés (ver portada)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["Penguin Random House","Planeta / Seix Barral","Anagrama","Tusquets",
               "Alfaguara / Santillana","Salamandra (Harry Potter / Rowling)",
               "SM (literatura juvenil)","Ediciones B","Minotauro (fantasía / sci-fi)",
               "Booket / DeBolsillo","Editorial independiente / Autoedición","Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
