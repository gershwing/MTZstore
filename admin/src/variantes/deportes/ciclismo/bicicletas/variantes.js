/**
 * VARIANTES - Deportes > Ciclismo > Bicicletas
 * Ruta: admin/src/variantes/deportes/ciclismo/bicicletas/variantes.js
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
      "MTB (monta\u00f1a) hardtail",
      "MTB (monta\u00f1a) doble suspensi\u00f3n",
      "Bicicleta de ruta / Road",
      "Bicicleta urbana / City",
      "Bicicleta plegable",
      "Bicicleta el\u00e9ctrica urbana (e-bike)",
      "Bicicleta el\u00e9ctrica MTB",
      "Bicicleta el\u00e9ctrica de ruta",
      "BMX",
      "Bicicleta de gravel",
      "Bicicleta infantil",
      "Bicicleta playera / Cruiser"
    ]
  },

  rodado: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "16\"", "20\"", "24\"", "26\"", "27.5\" (650B)", "29\"", "700c (ruta / gravel)"
    ]
  },

  velocidades: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "1 velocidad (single speed / fixie)",
      "3 velocidades",
      "7 velocidades",
      "21 velocidades",
      "1\u00d710 (10 vel. mono plato)",
      "1\u00d711",
      "1\u00d712 (12 vel. mono plato)",
      "2\u00d711",
      "Di2 / Electr\u00f3nico"
    ]
  },

  material_cuadro: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Acero Hi-Ten",
      "Acero Cromoly",
      "Aluminio 6061",
      "Aluminio 7005",
      "Carbono",
      "Titanio"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la bicicleta. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro mate", "Negro brillante", "Blanco", "Rojo", "Azul marino",
      "Verde oliva", "Naranja", "Gris grafito", "Dorado / Champ\u00e1n",
      "Turquesa", "Bicolor (cuadro + horquilla)"
    ]
  },

  talla_cuadro: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "XS (13\"\u201314\")",
      "S (15\"\u201316\")",
      "M (17\"\u201318\")",
      "L (19\"\u201320\")",
      "XL (21\"\u201322\")",
      "XXL (23\"+)",
      "Talla \u00fanica plegable"
    ]
  },

  frenos: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "V-Brake (zapata)",
      "Disco mec\u00e1nico",
      "Disco hidr\u00e1ulico",
      "Caliper (ruta)",
      "Coaster (contrapedal)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Trek Marlin / Dual Sport / FX",
      "Specialized Rockhopper / Sirrus / Stumpjumper",
      "Giant Talon / Escape / Trance",
      "Cannondale Trail / Quick / SuperSix",
      "Scott Aspect / Contessa / Speedster",
      "Merida Big.Nine / Crossway",
      "Cube Aim / Attention / Stereo",
      "Decathlon Rockrider / Riverside / Triban",
      "Polygon Xtrada / Heist / Path",
      "Bianchi Dolomiti / C-Sport",
      "Gen\u00e9rico"
    ]
  },

  bateria_ebike: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica (sin motor)",
      "250 Wh",
      "375 Wh",
      "500 Wh",
      "625 Wh",
      "750 Wh",
      "900 Wh+"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
