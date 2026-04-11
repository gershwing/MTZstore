/**
 * VARIANTES - Gaming y Tecnología > Videojuegos > Juegos Físicos
 * Ruta: admin/src/variantes/gaming/videojuegos/juegos-fisicos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota gaming: las ediciones especiales y bundles se manejan como variante,
 *              NO como producto separado.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo sellado", "Usado", "Caja Abierta"]
  },


  plataforma: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: ["PlayStation 5", "PlayStation 4", "Xbox Series", "Nintendo Switch", "PC"]
  },

  genero: {
    tipo: "texto",
    opciones: ["Acción / Aventura", "RPG", "Shooter / FPS", "Deportes", "Carreras / Racing", "Pelea / Fighting", "Estrategia", "Terror / Horror", "Plataformas", "Sandbox / Mundo abierto", "Simulación", "Musical / Ritmo", "Infantil / Familiar"]
  },

  clasificacion_edad: {
    tipo: "texto",
    opciones: ["E (Everyone / Todos)", "E10+ (Mayores de 10)", "T (Teen / Adolescentes)", "M (Mature / Adultos 17+)", "RP (Rating Pending)"]
  },

  idioma: {
    tipo: "texto",
    opciones: ["Español completo (audio + texto)", "Español subtítulos / Inglés audio", "Solo inglés", "Multiidioma (ver descripción)"]
  },

  edicion: {
    tipo: "texto",
    opciones: ["Edición estándar", "Edición Deluxe", "Edición Gold / GOTY", "Edición Coleccionista", "Edición Steelbook"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
