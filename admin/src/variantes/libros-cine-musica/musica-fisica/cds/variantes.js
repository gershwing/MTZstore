/**
 * VARIANTES - Libros, Cine y Música > Música Física > CDs
 * Ruta: admin/src/variantes/libros-cine-musica/musica-fisica/cds/variantes.js
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

  formato: {
    tipo: "texto",
    requerido: true,
    opciones: ["CD estándar (1 disco)","Doble CD (2 discos)","Box set (3+ CDs)","Maxi-single",
               "CD + DVD (edición deluxe)","CD + Blu-ray","CD + Libro (Digibook)","SACD (Super Audio CD)"]
  },

  edicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Edición estándar","Edición especial (con bonus tracks)","Edición deluxe (extras)","Edición digipack",
               "Edición Digibook (con libro)","Edición Slipcase","Edición coleccionista","Edición limitada numerada",
               "Edición japonesa (con obi strip)","Reedición remasterizada"]
  },

  genero_musical: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pop","Rock","Rock alternativo / Indie","Heavy metal / Hard rock",
               "Jazz","Blues","Soul / R&B","Hip-hop / Rap","Electrónica","Música clásica",
               "Folk / Country","Reggae","Latin / Tropical","Salsa / Cumbia / Vallenato",
               "Música andina / Folklórica LATAM","Banda sonora / OST","New age / Ambient"]
  },

  region_prensado: {
    tipo: "texto",
    requerido: false,
    opciones: ["Europa","USA / Canadá","Japón (alta calidad + obi)","LATAM","Australia","Universal"]
  },

  portada_edicion: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del CD / packaging. El cliente elige la imagen en el client.",
    guia_vendedor: ["Jewel case estándar (ver portada)", "Digipack (ver foto)",
                    "Digibook (ver foto — con libro)", "Edición japonesa con obi (ver foto)",
                    "Box set (ver foto)", "Edición limitada (ver foto)",
                    "Maxi-single (ver portada)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
