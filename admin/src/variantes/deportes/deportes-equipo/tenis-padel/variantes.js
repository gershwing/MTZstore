/**
 * VARIANTES - Deportes > Deportes de Equipo > Tenis y P\u00e1del
 * Ruta: admin/src/variantes/deportes/deportes-equipo/tenis-padel/variantes.js
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
      "Raqueta de tenis",
      "Raqueta de p\u00e1del",
      "Pelota de tenis (tubo x3)",
      "Pelota de p\u00e1del (tubo x3)",
      "Overgrip / Grip de raqueta",
      "Zapatillas de tenis",
      "Zapatillas de p\u00e1del",
      "Bolso / Mochila porta raqueta",
      "Ropa de tenis (camiseta)",
      "Ropa de tenis (vestido mujer)",
      "Munequera / Banda sudor",
      "Funda individual para raqueta"
    ]
  },

  nivel_jugador: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Iniciante / Principiante",
      "Intermedio",
      "Avanzado",
      "Competici\u00f3n / Profesional"
    ]
  },

  talla_grip: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "G1 (4 1/8\")",
      "G2 (4 1/4\")",
      "G3 (4 3/8\")",
      "G4 (4 1/2\")",
      "G5 (4 5/8\")"
    ]
  },

  talla_ropa: {
    tipo: "texto",
    requerido: false,
    opciones: ["XS", "S", "M", "L", "XL", "XXL"]
  },

  talla_calzado: {
    tipo: "texto",
    requerido: false,
    opciones: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Blanco", "Azul", "Rojo", "Verde", "Naranja",
      "Negro + rojo", "Blanco + negro", "Multicolor"
    ]
  },

  marca_tenis: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Wilson Blade / Pro Staff / Clash",
      "Babolat Pure Drive / Pure Aero / Pure Strike",
      "Head Speed / Radical / Prestige",
      "Prince Phantom / Warrior",
      "Yonex EZONE / VCORE",
      "Tecnifibre T-Fight / TFlash",
      "Dunlop SX / CX"
    ]
  },

  marca_padel: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bullpadel Hack / Vertex",
      "Adidas Metalbone / Adipower",
      "Head Delta / Delta Motion",
      "Nox ML10 / AT10",
      "Babolat Technical Viper / Air Viper",
      "Wilson Bela / Carbon Force",
      "Starvie Astrum / Metheora",
      "Varlion Summum / Bourne"
    ]
  },

  peso_raqueta: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Menos de 265 g",
      "265\u2013280 g",
      "280\u2013295 g",
      "295\u2013310 g",
      "310\u2013330 g",
      "330 g+"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
