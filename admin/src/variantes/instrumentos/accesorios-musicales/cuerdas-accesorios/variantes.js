/**
 * VARIANTES - Instrumentos > Accesorios Musicales > Cuerdas y Accesorios
 * Ruta: admin/src/variantes/instrumentos/accesorios-musicales/cuerdas-accesorios/variantes.js
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
    opciones: ["Cuerdas de guitarra acústica (set)", "Cuerdas de guitarra eléctrica (set)",
               "Cuerdas de guitarra clásica / nylon (set)", "Cuerdas de bajo eléctrico (set)",
               "Cuerdas de ukulele (set)", "Cuerdas de mandolina (set)", "Cuerdas de violín (set)",
               "Cuerdas de cello (set)", "Cejilla / Capo", "Afinador de clip (clip tuner)",
               "Afinador cromático de pedal", "Afinador de soplo (brass / woodwind)", "Metrónomo digital",
               "Metrónomo de péndulo / mecánico", "Soporte de guitarra (piso)", "Soporte de pared (2 guitarras)",
               "Soporte multi-guitarra (5 guitarras)", "Soporte para teclado / X-stand", "Soporte para atril / partituras",
               "Correa de guitarra / bajo", "Slide / Bottleneck", "Púas / Plectros (pack)",
               "Dedales (fingerpick set)", "Limpiador de cuerdas / diapasón", "Humidificador para guitarra",
               "Funda blanda (guitar bag)", "Case rígido (hardcase)", "Rack de cables", "Patch cable set"]
  },

  material_cuerdas: {
    tipo: "texto",
    requerido: false,
    opciones: ["Acero niquelado (round wound)", "Acero inoxidable (stainless)", "Cromo (flat wound)",
               "Bronce fosforoso 80/20 (acústica)", "Bronce 85/15 (acústica)", "Nylon normal tensión",
               "Nylon alta tensión", "Cuerdas de titanio", "Cuerdas de polímero (duración extendida)"]
  },

  calibre: {
    tipo: "texto",
    requerido: false,
    opciones: [".008-.038 (ultra light)", "0.009-.042 (super light — eléctrica)", ".010-.046 (regular — eléctrica)",
               ".011-.049 (medium — eléctrica)", ".012-.054 (heavy)", ".010-.047 (light — acústica)",
               ".011-.052 (medium — acústica)", ".013-.056 (medium heavy — acústica)",
               ".045-.105 (light — bajo 4c)", "0.045-.130 (light — bajo 5c)", "Variado / custom gauge"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto real. El cliente elige la imagen en el client.",
    guia_vendedor: ["Cuerdas (ver empaque)", "Capo negro", "Capo dorado / plateado",
                    "Afinador clip negro", "Afinador clip de color", "Metrónomo (ver foto)",
                    "Soporte negro", "Soporte madera", "Correa (ver diseño)",
                    "Púas (ver color / pack)", "Funda (ver color)"]
  },

  marca_cuerdas: {
    tipo: "texto",
    requerido: false,
    opciones: ["D'Addario EXL / NYXL / XT", "Ernie Ball Regular Slinky / Cobalt / M-Steel",
               "Elixir Nanoweb / Polyweb / Optiweb", "GHS Boomers / Progressives",
               "DR Strings Hi-Beam / Pure Blues", "Rotosound Swing Bass / Nexus",
               "Savarez Alliance / Corum (nylon)", "La Bella Deep Talkin' Bass", "Genérico"]
  },

  marca_accesorios: {
    tipo: "texto",
    requerido: false,
    opciones: ["Boss TU-3 / TU-3W (afinador)", "Korg Pitchblack / CA-50", "Peterson StroboClip HD",
               "Snark SN-8 / ST-8 (clip)", "D'Addario NS Capo", "Shubb C1 / S1 (capo)",
               "Dunlop Trigger (capo)", "Planet Waves / D'Addario (varios)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
