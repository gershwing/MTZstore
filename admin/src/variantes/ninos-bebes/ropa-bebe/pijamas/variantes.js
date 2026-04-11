/**
 * VARIANTES - Bebés > Ropa Bebé > Pijamas
 * Ruta: admin/src/variantes/bebes/ropa-bebe/pijamas/variantes.js
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

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "RN (0–1 mes)",
      "0–3 meses",
      "3–6 meses",
      "6–9 meses",
      "9–12 meses",
      "12–18 meses",
      "18–24 meses",
      "2 años",
      "3 años",
      "4 años",
      "5–6 años"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Pijama enteriza / Sleeper (1 pieza)",
      "Pijama 2 piezas (camiseta + pantalón)",
      "Pijama 2 piezas (manga larga + pantalón)",
      "Pijama con pies / Footed sleeper",
      "Saco de dormir / Sleep sack",
      "Pijama de verano (manga corta + short)",
      "Pijama tipo kigurumi / disfraz animal"
    ]
  },

  manga: {
    tipo: "texto",
    requerido: false,
    opciones: ["Manga corta", "Manga larga", "Sin manga (saco de dormir)"]
  },

  genero: {
    tipo: "texto",
    requerido: true,
    opciones: ["Niño", "Niña", "Unisex"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del pijama real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco + estrellas", "Azul claro + luna", "Rosa + nubes",
      "Estampado dinosaurios", "Estampado unicornio", "Estampado cohetes / espacio",
      "Estampado animales safari", "Estampado superhéroes",
      "Estampado princesas", "Gris + lunares", "Verde menta liso",
      "Amarillo + patitos", "Celeste + ositos", "Rayas multicolor"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Algodón suave (jersey)",
      "Algodón orgánico",
      "Microfleece (polar suave)",
      "Bambú (termorregulador)",
      "Algodón interlock",
      "Modal suave"
    ]
  },

  certificacion_seguridad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin ignifugado especial",
      "Ajustado (snug fit, sin necesidad de ignifugado)",
      "Tratamiento ignífugo CPSC",
      "OEKO-TEX Standard 100"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Carter's",
      "Gerber",
      "Kyte Baby (bambú)",
      "H&M Baby",
      "Zara Baby",
      "Hanna Andersson",
      "Little Me",
      "Burt's Bees Baby (orgánico)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
