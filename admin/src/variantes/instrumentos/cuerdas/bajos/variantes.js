/**
 * VARIANTES - Instrumentos > Cuerdas > Bajos
 * Ruta: admin/src/variantes/instrumentos/cuerdas/bajos/variantes.js
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

  tipo_cuerpo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Bajo Precision (split coil)", "Bajo Jazz (2 single coil)",
               "Bajo moderno activo (HH / soapbar)", "Bajo semi-hollow / acústico-eléctrico",
               "Bajo sin trastes (fretless)", "Bajo 5 cuerdas", "Bajo 6 cuerdas",
               "Bajo 4 cuerdas short scale (30\")", "Bajo acústico (upright / contrabajo eléctrico)"]
  },

  acabado_color: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del acabado. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Sunburst 3 colores (tabaco)", "Sunburst negro", "Cherry sunburst",
      "Negro brillante", "Negro mate", "Blanco crema / Olympic White",
      "Natural (madera vista)", "Azul lago / Lake Placid Blue",
      "Rojo candy apple", "Dorado / Honey burst",
      "Trans Blue (translúcido azul)", "Trans Red", "Caoba oscura",
      "Quilted maple top (arce acolchado)"
    ]
  },

  numero_cuerdas: {
    tipo: "texto",
    requerido: true,
    opciones: ["4 cuerdas", "5 cuerdas", "6 cuerdas"]
  },

  escala: {
    tipo: "texto",
    requerido: false,
    opciones: ["Short scale 762 mm (30\")", "Medium scale 813 mm (32\")", "Long scale 864 mm (34\")", "Extra long 889 mm (35\")"]
  },

  pastillas: {
    tipo: "texto",
    requerido: false,
    opciones: ["Precision (split coil)", "Jazz (2 single coil)", "Soapbar (HH activo)", "Active EMG / Bartolini", "Piezo acústico"]
  },

  mastil: {
    tipo: "texto",
    requerido: false,
    opciones: ["Maple (arce) 1 pieza", "Maple laminado / roasted maple", "Caoba", "Wenge", "Graphite reforzado"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Fender American Professional II P / J", "Fender Player P / J Bass",
               "Squier Affinity / Classic Vibe P / J", "Gibson SG Bass / Thunderbird",
               "Music Man StingRay / Sterling", "Ibanez SR500 / SR1200 / SRFF",
               "ESP LTD B-204SM / B-1004", "Schecter Stiletto / Diamond P",
               "Warwick Rockbass / German Pro", "Sadowsky Metro", "Genérico"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo bajo", "Con funda blanda", "Con case rígido", "Kit completo (funda + correa + cuerdas + cable)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
