/**
 * VARIANTES - Libros, Cine y Música > Música Física > Vinilos
 * Ruta: admin/src/variantes/libros-cine-musica/musica-fisica/vinilos/variantes.js
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
    opciones: ["LP estándar (33⅓ rpm — álbum completo)","Single (45 rpm — 1 canción por lado)",
               "EP (45 rpm / 33⅓ rpm — 3–6 canciones)","Doble LP (2 discos)","Box set (3+ discos)",
               "Picture disc (disco con imagen impresa)","Vinilo de color","Vinilo transparente",
               "Vinilo splatter / efecto pintura","Vinilo marmolado","Vinilo fluorescente"]
  },

  velocidad_rpm: {
    tipo: "texto",
    requerido: true,
    opciones: ["33⅓ rpm (LP)","45 rpm (single / EP)","78 rpm (histórico / coleccionista)"]
  },

  tamano_pulgadas: {
    tipo: "texto",
    requerido: true,
    opciones: ["7\" (single)","10\" (EP)","12\" (LP estándar)"]
  },

  edicion: {
    tipo: "texto",
    requerido: false,
    opciones: ["Prensado original (año de lanzamiento)","Reedición estándar","Reedición remasterizada",
               "Reedición 180 g (audiófilo)","Reedición 200 g (audiófilo premium)","Edición limitada",
               "Edición de Record Store Day","Edición especial de fan club","Picture disc"]
  },

  color_vinilo: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del vinilo / packaging. El cliente elige la imagen en el client.",
    guia_vendedor: ["Negro (estándar)", "Blanco", "Rojo", "Azul", "Verde", "Amarillo",
                    "Naranja", "Morado / Lila", "Transparente / Crystal clear",
                    "Splatter multicolor (ver foto)", "Marmolado (ver foto)",
                    "Picture disc (ver foto — imagen impresa)", "Fluorescente (ver foto)",
                    "Box set (ver foto — varios discos)"]
  },

  genero_musical: {
    tipo: "texto",
    requerido: false,
    opciones: ["Rock clásico","Rock alternativo / Indie","Heavy metal","Pop","Jazz",
               "Blues","Soul / R&B","Funk","Hip-hop / Rap","Electrónica / Dance",
               "Música clásica / Orquesta","Folk / Country","Reggae","Latin / Salsa / Cumbia",
               "Bossa nova / MPB","Flamenco","Banda sonora / OST","Música andina (LATAM)"]
  },

  peso_gramos: {
    tipo: "texto",
    requerido: false,
    opciones: ["140 g (estándar)","150 g","180 g (audiófilo)","200 g (premium audiófilo)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
