/**
 * VARIANTES - Libros, Cine y Música > Libros > Infantil y Juvenil
 * Ruta: admin/src/variantes/libros-cine-musica/libros/infantil-juvenil/variantes.js
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
    opciones: ["Álbum ilustrado (0–3 años)","Libro de cartón / Board book (0–2 años)",
               "Libro de tela (bebé)","Cuento ilustrado (3–6 años)","Libro de actividades (3–7 años)",
               "Libro con sonidos / interactivo","Novela infantil (7–10 años)",
               "Novela juvenil (10–14 años)","Young Adult / Adulto joven (14–18 años)",
               "Saga juvenil de fantasía","Saga juvenil de aventura","Libro de humor infantil",
               "Libro educativo / STEM infantil","Libro de manualidades para niños",
               "Cómic infantil / Novela gráfica juvenil"]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: ["0–2 años","2–4 años","4–6 años","6–8 años","8–10 años",
               "10–12 años","12–14 años","14–17 años","Sin límite de edad"]
  },

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["Cartón duro (board book)","Tapa blanda","Tapa dura","Gran formato ilustrado",
               "Libro pop-up","Libro con pegatinas / stickers","Libro + juego / actividad"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español","Inglés","Bilingüe (español + inglés)","Portugués","Otros"]
  },

  numero_tomos: {
    tipo: "texto",
    requerido: false,
    opciones: ["Libro único","Tomo 1","Tomo 2","Tomo 3","Tomo 4+","Serie completa (box set)"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la portada. El cliente elige la imagen en el client.",
    guia_vendedor: ["Álbum ilustrado (ver portada)", "Board book (ver portada)",
                    "Novela juvenil (ver portada)", "Box set completo (ver foto)",
                    "Edición especial ilustrada (ver portada)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["SM Ediciones","Alfaguara Infantil","Planeta Junior / Destino",
               "Anaya Infantil","Scholastic","Penguin Young Readers",
               "Edelvives","Barcanova","Timun Mas (fantasía juvenil)","Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
