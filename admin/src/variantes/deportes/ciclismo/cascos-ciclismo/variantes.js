/**
 * VARIANTES - Deportes > Ciclismo > Cascos de Ciclismo
 * Ruta: admin/src/variantes/deportes/ciclismo/cascos-ciclismo/variantes.js
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
      "Casco MTB / Senderismo",
      "Casco de ruta (aerodin\u00e1mico)",
      "Casco urbano / City",
      "Casco full face (DH / enduro)",
      "Casco de ni\u00f1o / infantil",
      "Casco BMX",
      "Casco con MIPS (protecci\u00f3n rotacional)",
      "Casco con visera integrada"
    ]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "XS (48\u201352 cm)",
      "S (51\u201355 cm)",
      "M (54\u201358 cm)",
      "L (57\u201361 cm)",
      "XL (59\u201363 cm)",
      "Talla \u00fanica ajustable"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del casco. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro mate", "Negro brillante", "Blanco", "Rojo", "Azul marino",
      "Gris", "Verde", "Naranja fluor", "Amarillo fluor",
      "Multicolor / Estampado", "Negro + rojo", "Blanco + azul"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "CE EN 1078 (Europa / est\u00e1ndar)",
      "CPSC (USA)",
      "AS/NZS (Australia)",
      "CE + CPSC (doble certificaci\u00f3n)",
      "Sin certificaci\u00f3n"
    ]
  },

  sistema_ajuste: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Rueda de ajuste (dial)",
      "Correas fijas",
      "Sistema BOA",
      "Ajuste manual tipo ciclismo"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Giro Fixture / Fixture MIPS / Chronicle",
      "Bell Spark / Sixer / Stratus",
      "Fox Proframe / Speedframe / Flux",
      "POC Axion / Trabec / Coron Air",
      "Kask Mojito / Protone / Infinity",
      "Specialized Ambush / Align / Propero",
      "Scott Groove Plus / Arx / Centric",
      "MET Terranova / Vinci / Rivale",
      "Decathlon Rockrider / Triban (Gen\u00e9rico marca propia)",
      "Gen\u00e9rico"
    ]
  },

  peso_g: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Menos de 200 g",
      "200\u2013300 g",
      "300\u2013400 g",
      "400\u2013500 g",
      "500\u2013700 g",
      "700 g+ (full face)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
