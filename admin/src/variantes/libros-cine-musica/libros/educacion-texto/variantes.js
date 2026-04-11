/**
 * VARIANTES - Libros, Cine y Música > Libros > Educación y Texto
 * Ruta: admin/src/variantes/libros-cine-musica/libros/educacion-texto/variantes.js
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

  nivel: {
    tipo: "texto",
    requerido: true,
    opciones: ["Preescolar / Kinder","1°–4° Educación Básica / Primaria","5°–8° Educación Básica / Primaria",
               "Enseñanza Media / Secundaria","Bachillerato / Preparatoria",
               "Educación Superior / Universidad","Posgrado / Profesional","Formación técnica / Vocacional",
               "Certificación profesional (PMP / CISSP / CPA etc.)","Idiomas (nivel A1–C2)"]
  },

  materia: {
    tipo: "texto",
    requerido: true,
    opciones: ["Matemáticas","Lenguaje / Comunicación","Historia / Geografía","Ciencias Naturales",
               "Física","Química","Biología","Inglés / Idiomas","Educación Física",
               "Arte / Música","Computación / Informática","Derecho","Medicina / Enfermería",
               "Administración / Contabilidad","Ingeniería","Psicología","Arquitectura",
               "Gastronomía / Hotelería","Diseño gráfico / Digital"]
  },

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tapa blanda","Tapa dura","Carpeta / Cuadernillo fotocopiable","Digital / PDF (código)",
               "Pack libro + cuaderno de ejercicios","Edición con respuestas incluidas"]
  },

  edicion: {
    tipo: "texto",
    requerido: false,
    opciones: ["1ª edición","2ª edición","3ª edición","4ª edición","5ª edición","6ª edición+",
               "Edición actualizada (año actual)","Edición sin especificar"]
  },

  idioma: {
    tipo: "texto",
    requerido: true,
    opciones: ["Español","Inglés","Bilingüe","Otros"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del libro de texto. El cliente elige la imagen en el client.",
    guia_vendedor: ["Libro texto (ver portada + edición)", "Pack libro + cuaderno (ver foto)",
                    "Edición actualizada (ver portada)", "Manual profesional (ver portada)"]
  },

  marca_editorial: {
    tipo: "texto",
    requerido: false,
    opciones: ["Santillana / Loqueleo","SM","McGraw-Hill","Pearson / Prentice Hall",
               "Oxford University Press","Cambridge University Press","Cengage Learning",
               "Anaya","Edebé","Kapelusz (Argentina)","ECOE Ediciones (Colombia / LATAM)",
               "Genérico / Editorial local"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
