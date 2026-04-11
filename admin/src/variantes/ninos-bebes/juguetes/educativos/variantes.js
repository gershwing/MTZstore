/**
 * VARIANTES - Bebés > Juguetes > Educativos
 * Ruta: admin/src/variantes/bebes/juguetes/educativos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "0–6 meses",
      "6–12 meses",
      "1–2 años",
      "2–3 años",
      "3–5 años",
      "5–8 años",
      "8–12 años",
      "12+ años"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Móvil de cuna / Proyector de estrellas",
      "Gimnasio de actividades / Play mat",
      "Sonajero / Mordillo",
      "Bloques de construcción (Duplo / Mega Bloks)",
      "Bloques LEGO",
      "Puzzle / Rompecabezas (piezas grandes)",
      "Puzzle (100+ piezas)",
      "Ábaco conteo",
      "Tablero de figuras / Shape sorter",
      "Juego de memoria",
      "Juego de mesa familiar",
      "Set de ciencia / experimentos STEM",
      "Kit de magnetismo / electricidad",
      "Instrumentos musicales mini",
      "Set de cocina de juguete",
      "Set de herramientas juguete",
      "Set médico de juguete",
      "Teatro de marionetas",
      "Libro interactivo / sonoro",
      "Flashcards / Tarjetas educativas",
      "Montessori (set varios)",
      "Tangram / Geometría"
    ]
  },

  habilidades: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Motricidad fina",
      "Motricidad gruesa",
      "Desarrollo cognitivo",
      "Coordinación ojo-mano",
      "Lenguaje y comunicación",
      "Creatividad",
      "Pensamiento lógico-matemático",
      "Conciencia espacial",
      "Habilidades sociales",
      "STEM / Ciencias"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del juguete. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Colores primarios vivos", "Pasteles suaves", "Madera natural", "Madera + colores",
      "Multicolor set", "Azul + verde", "Rosa + morado", "Naranja + amarillo",
      "Blanco + gris (minimalista)", "Estampado animales"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Madera natural (FSC)",
      "Plástico ABS libre BPA",
      "Tela / Peluche",
      "Espuma suave EVA",
      "Silicona",
      "Cartón grueso",
      "Metal (mayores 8 años)"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "CE (Europa)",
      "ASTM F963 (USA)",
      "CPSC",
      "OEKO-TEX",
      "Sin certificación especificada"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "LEGO / LEGO Duplo",
      "Melissa & Doug",
      "Fisher-Price",
      "VTech",
      "Leapfrog",
      "Hape (madera)",
      "PlanToys (sostenible)",
      "Ravensburger (puzzles)",
      "Janod (Francia)",
      "Learning Resources",
      "Magna-Tiles",
      "Playmobil",
      "Hasbro",
      "Mattel",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
