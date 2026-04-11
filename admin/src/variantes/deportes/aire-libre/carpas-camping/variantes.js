/**
 * VARIANTES - Deportes > Aire Libre > Carpas y Camping
 * Ruta: admin/src/variantes/deportes/aire-libre/carpas-camping/variantes.js
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

  capacidad: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "1 persona",
      "2 personas",
      "3 personas",
      "4 personas",
      "5\u20136 personas",
      "7\u20138 personas",
      "8+ personas"
    ]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "C\u00fapula / Dome (est\u00e1ndar)",
      "T\u00fanel / Tunnel (familiar)",
      "Cabina / Cabin (vertical)",
      "Pop-up (apertura autom\u00e1tica)",
      "Bivy / Vivac (ultraligera 1p)",
      "Inflable",
      "Con porche / vest\u00edbulo",
      "Doble capa (4 estaciones)",
      "Tienda de campa\u00f1a + sombra combo"
    ]
  },

  estaciones: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "2 estaciones (primavera / verano)",
      "3 estaciones (primavera / oto\u00f1o)",
      "4 estaciones (invierno incluido)",
      "Ultraligera (>1.5 kg / trekking)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la carpa. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Verde oliva", "Naranja + gris", "Azul + gris", "Amarillo + gris",
      "Verde + naranja", "Beige / Arena", "Rojo + negro", "Camuflaje",
      "Gris + naranja fluor"
    ]
  },

  peso_kg: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Menos de 1 kg",
      "1\u20131.5 kg",
      "1.5\u20132.5 kg",
      "2.5\u20134 kg",
      "4\u20137 kg",
      "7\u201312 kg",
      "12 kg+"
    ]
  },

  impermeabilidad_mm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1000\u20131500 mm (b\u00e1sica)",
      "1500\u20132000 mm",
      "2000\u20133000 mm",
      "3000\u20135000 mm",
      "5000 mm+ (premium)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "MSR Hubba Hubba / FreeLite",
      "Big Agnes Copper Spur / Tiger Wall",
      "Hilleberg Nallo / Akto",
      "The North Face Stormbreak / Homestead",
      "Coleman Sundome / Skydome",
      "Quechua 2 Seconds / MH100 (Decathlon)",
      "Vango Blade / Soul",
      "Forclaz Trek 500 / MT900",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
