/**
 * VARIANTES - Herramientas > Manuales > Martillos
 * Ruta: admin/src/variantes/herramientas/manuales/martillos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/acabado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
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
    opciones: [
      "Martillo de carpintero (uña recta)",
      "Martillo de carpintero (uña curva)",
      "Martillo de bola / Ball peen",
      "Martillo de goma / Mazo",
      "Martillo de nailon / Plástico",
      "Mazo de demolición",
      "Martillo de picapedrero / Maceta",
      "Martillo de tapicero",
      "Martillo de acero antichispa",
      "Martillo de orejas",
      "Cincel + martillo set"
    ]
  },

  peso_g: {
    tipo: "texto",
    requerido: false,
    opciones: ["200–300 g", "300–450 g", "450–600 g", "600–800 g", "800–1200 g", "1200–2000 g", "2000 g+"]
  },

  material_cabeza: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Acero forjado",
      "Acero inoxidable",
      "Goma / Neopreno",
      "Nailon",
      "Cobre (antichispa)",
      "Latón (antichispa)",
      "Fibra de vidrio"
    ]
  },

  material_mango: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Madera (fresno / hickory)",
      "Fibra de vidrio",
      "Acero tubular",
      "Acero con grip de goma",
      "Polímero / Plástico reforzado",
      "Titanio"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del martillo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Plateado + madera natural", "Negro + mango gris", "Negro + mango amarillo",
      "Negro + mango rojo", "Azul + negro", "Amarillo (Stanley)",
      "Rojo + negro (Milwaukee)", "Genérico plateado"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Stanley FatMax / AntiVibe",
      "Estwing E3-20C / Milled Face",
      "Fiskars Isocore / Pro",
      "Vaughan California Framer",
      "Truper Tata / Maestro",
      "Irwin Tools",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
