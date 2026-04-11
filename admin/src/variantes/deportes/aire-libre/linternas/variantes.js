/**
 * VARIANTES - Deportes > Aire Libre > Linternas
 * Ruta: admin/src/variantes/deportes/aire-libre/linternas/variantes.js
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
      "Linterna frontal / Headlamp",
      "Linterna de mano / T\u00e1ctica",
      "Linterna de campamento / Farol",
      "Linterna de bolsillo (EDC)",
      "Linterna de emergencia / Recargable USB",
      "Linterna solar",
      "Luz de acampada colgante / L\u00e1mpara LED",
      "Linterna de buceo / Sumergible"
    ]
  },

  lumenes: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Hasta 100 lm",
      "100\u2013300 lm",
      "300\u2013600 lm",
      "600\u20131000 lm",
      "1000\u20132000 lm",
      "2000\u20135000 lm",
      "5000 lm+"
    ]
  },

  autonomia_horas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 3 h",
      "3\u20138 h",
      "8\u201315 h",
      "15\u201330 h",
      "30\u201380 h",
      "80 h+ (modo eco)"
    ]
  },

  fuente_energia: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Pilas AAA",
      "Pilas AA",
      "Pilas 18650 (recargables)",
      "USB-C recargable",
      "Solar + USB-C",
      "Cuerda dinamo"
    ]
  },

  resistencia_agua: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin resistencia al agua",
      "IPX4 (salpicaduras)",
      "IPX6 (chorros)",
      "IPX7 (sumergible 1 m)",
      "IPX8 (sumergible 2 m+)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Negro + rojo", "Negro + naranja", "Gris", "Verde oliva",
      "Naranja fluor", "Amarillo", "Plateado", "Azul"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Petzl Actik / Tikka / Swift RL",
      "Black Diamond Spot / Storm / Sprinter",
      "Fenix HM65R / HL60R / BC21R V3",
      "Nitecore NU25 / HC60 / TIP SE",
      "Olight Perun 2 / H2R / S2R",
      "Coleman CPX 6 (farol)",
      "BioLite HeadLamp / Baselantern",
      "Ledlenser MH5 / H7R Core",
      "Gen\u00e9rico"
    ]
  },

  modos_luz: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1 modo (solo encendido)",
      "2 modos (alto + bajo)",
      "3 modos (alto + medio + bajo)",
      "M\u00faltiples modos + luz roja emergencia + estrobosc\u00f3pico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
