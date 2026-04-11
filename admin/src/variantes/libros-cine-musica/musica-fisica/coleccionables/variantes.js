/**
 * VARIANTES - Libros, Cine y Música > Música Física > Coleccionables
 * Ruta: admin/src/variantes/libros-cine-musica/musica-fisica/coleccionables/variantes.js
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
    opciones: ["Cassette / Cinta (vintage / repress)","MiniDisc","8-Track cartridge (coleccionista)",
               "VHS musical (concierto / videoclip)","Laserdisc musical","DVD de concierto",
               "Blu-ray de concierto / Live","4K UHD concierto","Box set discografía completa",
               "Box set edición de lujo (libros + discos + extras)","Super Deluxe Edition (SDE)",
               "Autógrafo + certificado de autenticidad","Edición de Record Store Day exclusiva",
               "Caja de coleccionista (figura + vinilo + libro)"]
  },

  soporte: {
    tipo: "texto",
    requerido: true,
    opciones: ["Vinilo LP","CD","Cassette","DVD","Blu-ray","4K UHD","Caja mixta (varios formatos)"]
  },

  edicion_especial: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del coleccionable. El cliente elige la imagen en el client.",
    guia_vendedor: ["Box set discografía (ver foto)", "Super Deluxe Edition (ver foto)",
                    "Cassette de color (ver foto)", "Picture disc vinilo (ver foto)",
                    "Caja con figura + vinilo (ver foto)", "Edición RSD (Record Store Day, ver foto)",
                    "Autógrafo + COA (ver foto)", "Blu-ray concierto (ver caja)"]
  },

  artista_genero: {
    tipo: "texto",
    requerido: false,
    opciones: ["Rock clásico (Beatles / Rolling Stones / Led Zeppelin / Pink Floyd)",
               "Rock alternativo (Nirvana / Radiohead / REM)","Metal (Metallica / Maiden / Sabbath)",
               "Pop (Michael Jackson / Prince / Madonna)","Hip-hop / Rap clásico",
               "Jazz (Miles Davis / Coltrane / Ella Fitzgerald)","Electrónica / Dance",
               "Música latina / Salsa","Música andina / Folklórica","Banda sonora / OST"]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin certificado","Con COA (Certificate of Authenticity)","Numerado y firmado",
               "Edición oficial del sello discográfico","Edición bootleg / no oficial (aclarar)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
