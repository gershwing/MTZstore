/**
 * VARIANTES - Instrumentos > Accesorios Musicales > Amplificadores
 * Ruta: admin/src/variantes/instrumentos/accesorios-musicales/amplificadores/variantes.js
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
    opciones: ["Amplificador de guitarra combo (1 parlante)", "Amplificador de guitarra cabezal (head)",
               "Gabinete para guitarra (cabinet 1×12\")", "Gabinete para guitarra (cabinet 2×12\")",
               "Gabinete para guitarra (cabinet 4×12\")", "Amplificador de bajo combo",
               "Amplificador de bajo cabezal", "Gabinete para bajo (4×10\" / 1×15\")",
               "Amplificador de teclado", "Amplificador de micrófono / PA mini",
               "Amplificador de práctica (micro amp)", "Amplificador acústico (para guitarra acústica)",
               "Amplificador con efectos integrados", "Amplificador bluetooth / portátil"]
  },

  tecnologia: {
    tipo: "texto",
    requerido: true,
    opciones: ["Válvulas / Tubos (all-tube)", "Válvulas preamp + sólido estado power",
               "Sólido estado (transistores)", "Modelado digital (modelling)", "Class D (bajo)", "Híbrido"]
  },

  potencia_w: {
    tipo: "texto",
    requerido: true,
    opciones: ["Hasta 5 W (práctica / dormitorio)", "5–15 W", "15–30 W", "30–50 W", "50–100 W",
               "100–200 W", "200–500 W", "500 W+"]
  },

  parlantes: {
    tipo: "texto",
    requerido: false,
    opciones: ["Sin parlante (head / cabezal)", "1×8\"", "1×10\"", "1×12\"", "2×10\"", "2×12\"",
               "4×10\"", "1×15\"", "4×12\""]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del amplificador. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro + rejilla negra", "Negro + rejilla crema / beige",
      "Negro + rejilla de cuadros", "Tweed (tela beige clásica)",
      "Marrón / Brown tolex", "Azul marino + rejilla dorada",
      "Blanco + rejilla negra", "Naranja + rejilla negra (Orange)",
      "Rojo + negro", "Metal / Rack negro 19\""
    ]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fender Blues Junior / Deluxe Reverb / Twin Reverb", "Marshall DSL20 / DSL40 / DSL100 / 1960A",
               "Vox AC15 / AC30 / MV50", "Blackstar Studio 10 / ID:Core / HT-40",
               "Boss Katana 50 / 100 / Air (modelado)", "Line 6 Spider V / Powercab",
               "Mesa Boogie Mark V / Rectifier", "Orange Crush 35RT / TH30 / Rocker 32",
               "Ampeg SVT-CL / BA-210 (bajo)", "Hartke HD25 / LX8500 (bajo)",
               "Markbass CMD121H / Little Mark III (bajo)", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo amplificador", "Con cable de instrumento", "Con funda protectora", "Con footswitch (canal)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
