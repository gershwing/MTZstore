/**
 * VARIANTES - Libros, Cine y Música > Libros > No Ficción
 * Ruta: admin/src/variantes/libros-cine-musica/libros/no-ficcion/variantes.js
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
    opciones: ["Autobiografía / Memorias","Biografía","Historia","Política y sociedad",
               "Economía y finanzas","Negocios / Emprendimiento","Psicología popular",
               "Autoayuda / Desarrollo personal","Filosofía","Ciencia divulgativa",
               "Naturaleza / Medio ambiente","Viajes y geografía","Gastronomía / Recetas",
               "Arte y fotografía","Arquitectura y diseño","Deportes","Tecnología / Programación",
               "Salud y bienestar","Espiritualidad / Mindfulness","Crianza / Parentalidad",
               "Derecho","Medicina","Ingeniería"]
  },

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tapa blanda / Rústica","Tapa dura (hardcover)","Tapa dura con dustjacket",
               "Edición ilustrada / Coffee table book","Edición de lujo","Gran formato"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español (España)","Español (LATAM)","Inglés (USA)","Inglés (UK)",
               "Portugués (Brasil)","Francés","Alemán","Otros"]
  },

  edicion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Primera edición","Edición revisada y ampliada","Edición actualizada",
               "Edición aniversario","Edición sin especificar"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto de la portada / edición real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Tapa blanda (ver portada)", "Tapa dura (ver portada)",
                    "Coffee table book (ver portada)", "Edición especial (ver foto)",
                    "Box set (ver foto)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["Penguin Random House","Planeta","Paidós","Crítica / Ariel",
               "Debate","Deusto","Gestión 2000","LID Editorial","Empresa Activa",
               "O'Reilly (tecnología)","Anaya (tecnología)","Editorial independiente","Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
