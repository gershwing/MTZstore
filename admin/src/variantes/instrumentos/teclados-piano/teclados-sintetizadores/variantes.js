/**
 * VARIANTES - Instrumentos > Teclados y Piano > Teclados y Sintetizadores
 * Ruta: admin/src/variantes/instrumentos/teclados-piano/teclados-sintetizadores/variantes.js
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
    opciones: ["Teclado arranjador (con ritmos + acompañamiento)", "Teclado workstation (producción)",
               "Sintetizador analógico", "Sintetizador virtual analógico (VA)",
               "Sintetizador modular (Eurorack)", "Sintetizador de cuerdas / strings",
               "Controlador MIDI (sin sonido propio)", "Teclado para principiantes / aprendizaje",
               "Órgano Hammond / clone bar", "Mellotron / sampler vintage", "Groovebox / drum machine + synth"]
  },

  numero_teclas: {
    tipo: "texto",
    requerido: true,
    opciones: ["25 teclas (mini)", "32 teclas", "37 teclas", "49 teclas", "61 teclas", "76 teclas", "88 teclas"]
  },

  tipo_teclado: {
    tipo: "texto",
    requerido: false,
    opciones: ["Mini keys (teclas pequeñas)", "Full size sin contrapeso", "Semi-pesado", "Pesado GH"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del sintetizador / teclado. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro mate (standard)", "Negro brillante", "Blanco / Cream vintage",
      "Gris antracita", "Madera + negro (premium)", "Naranja + negro (Arturia)",
      "Azul + negro", "Plata / Aluminio", "Bicolor vintage (blanco + madera)"
    ]
  },

  polifonia: {
    tipo: "texto",
    requerido: false,
    opciones: ["Monofónico (1 voz)", "4 voces", "8 voces", "16 voces", "32 voces", "64 voces+", "Polyfónico (ilimitado digital)"]
  },

  conectividad: {
    tipo: "texto",
    requerido: false,
    opciones: ["USB to Host (MIDI)", "MIDI DIN + USB", "CV/Gate + MIDI + USB (modular)", "Bluetooth MIDI",
               "USB + Bluetooth + WiFi", "Jack 6.35 mm + XLR + USB"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Arturia MiniFreak / PolyBrut / Keystep Pro", "Moog Subsequent 37 / One / Subsequent 25",
               "Korg Minilogue XD / Prologue / Opsix", "Roland JX-08 / JD-08 / Fantom",
               "Yamaha MODX+ / Montage M", "Sequential Prophet-6 / Take 5",
               "Elektron Digitone / Analog Four", "Native Instruments Komplete Kontrol",
               "Novation Summit / Peak / Launchkey", "Teenage Engineering OP-1 Field", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
