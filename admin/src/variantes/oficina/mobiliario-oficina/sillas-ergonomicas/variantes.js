/**
 * VARIANTES - Oficina > Mobiliario Oficina > Sillas Ergonómicas
 * Ruta: admin/src/variantes/oficina/mobiliario-oficina/sillas-ergonomicas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
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
      "Silla ergonómica básica (respaldo ajustable)",
      "Silla ergonómica premium (lumbar + cabezal)",
      "Silla ergonómica malla transpirable",
      "Silla ejecutiva cuero",
      "Silla de operador / Call center",
      "Silla de visita / Sala de espera",
      "Silla de conferencia / reunión",
      "Taburete regulable de pie",
      "Silla de rodillas ergonómica",
      "Balón de ejercicio como silla",
      "Silla de trabajo en casa (home office)"
    ]
  },

  ajustes: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo altura",
      "Altura + inclinación respaldo",
      "Altura + inclinación + reposabrazos 2D",
      "Altura + inclinación + reposabrazos 4D + lumbar",
      "Ajuste completo multifunción (10+ puntos)"
    ]
  },

  peso_max_kg: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 100 kg",
      "Hasta 120 kg",
      "Hasta 136 kg",
      "Hasta 150 kg",
      "150 kg+"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la silla. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro liso", "Negro malla", "Gris malla", "Blanco + gris", "Negro + azul",
      "Negro + rojo", "Beige / Nude cuero", "Marrón cuero", "Azul marino", "Verde musgo"
    ]
  },

  material_asiento: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Espuma de alta densidad + tela",
      "Espuma + cuero genuino",
      "Espuma + cuero sintético PU",
      "Malla transpirable (asiento + respaldo)",
      "Malla respaldo + espuma asiento"
    ]
  },

  mecanismo_inclinacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Inclinación básica con palanca",
      "Mecanismo sincronizado",
      "Mecanismo libre (multifunción)",
      "Tilt tension ajustable",
      "Mecanismo 3D / Tri-motion"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin certificación",
      "BIFMA x5.1 (resistencia USA)",
      "EN 1335 (Europa)",
      "ISO 9241-5",
      "GREENGUARD"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Herman Miller Aeron / Embody / Mirra 2",
      "Steelcase Leap V2 / Gesture / Think",
      "Haworth Fern / Comforto",
      "Humanscale Freedom / Liberty",
      "Secretlab Titan Evo (home office)",
      "ErgoChair Pro / Plus (Autonomous)",
      "Flexispot BS10 / BS11",
      "Hbada / Sihoo (relación calidad-precio)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
