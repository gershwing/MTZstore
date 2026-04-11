/**
 * VARIANTES - Instrumentos > Cuerdas > Guitarras Clásicas
 * Ruta: admin/src/variantes/instrumentos/cuerdas/guitarras-clasicas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
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
    opciones: ["Clásica estudio (nylon)", "Clásica concierto (nylon)", "Flamenca (nylon + golpeador)",
               "Electroclásica (nylon + pastilla)", "Requinto (6 cuerdas escala corta)", "Guitarra de 10 cuerdas (extendida)"]
  },

  tapa: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tapa sólida abeto (spruce)", "Tapa sólida cedro (cedar)", "Tapa laminada abeto", "Tapa laminada cedro",
               "All-solid (tapa + aros + fondo macizos)"]
  },

  acabado_color: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto del acabado / color. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Natural brillante (gloss)", "Natural mate (satin)",
      "Caoba oscura brillante", "Palisandro + abeto natural",
      "Negro brillante", "Blanco crema",
      "Sunburst clásico", "Barnizado al poro abierto (francés)"
    ]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["1/4 (4–6 años)", "1/2 (6–9 años)", "3/4 (9–12 años)", "7/8 (adolescente / mano pequeña)", "4/4 Full size (adulto)"]
  },

  numero_trastes: {
    tipo: "texto",
    requerido: false,
    opciones: ["17 trastes", "18 trastes", "19 trastes", "20 trastes"]
  },

  tension_cuerdas: {
    tipo: "texto",
    requerido: false,
    opciones: ["Tensión alta", "Tensión media", "Tensión baja", "Cuerdas de concierto (alta tensión plateadas)"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Yamaha C40 / CG102 / GC32", "Classical Alhambra 1C / 3C / 5P",
               "La Patrie Concert / Etude", "Cordoba C5 / C7 / GK Studio",
               "Ramirez Studio / Tradicional", "Raimundo", "Admira Juanita",
               "Sigma CR-1 / CR-6", "Genérico / Sin marca"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo guitarra", "Con funda blanda", "Con case rígido", "Kit completo + afinador + método"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
