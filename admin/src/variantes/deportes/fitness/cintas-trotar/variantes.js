/**
 * VARIANTES - Deportes > Fitness > Cintas de Trotar
 * Ruta: admin/src/variantes/deportes/fitness/cintas-trotar/variantes.js
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
      "Cinta de trotar dom\u00e9stica b\u00e1sica",
      "Cinta de trotar dom\u00e9stica premium",
      "Cinta profesional / comercial",
      "Cinta plegable (fold-up)",
      "Cinta bajo escritorio (walking pad)",
      "Cinta curva (sin motor / curved manual)"
    ]
  },

  velocidad_max: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Hasta 10 km/h (caminar)",
      "10\u201314 km/h",
      "14\u201318 km/h",
      "18\u201322 km/h",
      "22 km/h+"
    ]
  },

  potencia_hp: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "1\u20131.5 HP",
      "1.5\u20132 HP",
      "2\u20132.5 HP",
      "2.5\u20133 HP",
      "3\u20134 HP",
      "4 HP+",
      "Sin motor (curva)"
    ]
  },

  superficie_cm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "100\u00d735 cm (b\u00e1sica)",
      "120\u00d740 cm",
      "130\u00d745 cm (est\u00e1ndar)",
      "140\u00d750 cm",
      "150\u00d755 cm+"
    ]
  },

  inclinacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin inclinaci\u00f3n",
      "Manual 0\u20133%",
      "Motorizada 0\u201310%",
      "Motorizada 0\u201315%",
      "Motorizada 0\u201320%+"
    ]
  },

  pantalla: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin pantalla",
      "LCD b\u00e1sica",
      "T\u00e1ctil HD",
      "Compatible app (Bluetooth / iFit / Zwift)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Negro + rojo", "Negro + verde", "Gris + negro",
      "Blanco + gris", "Negro + naranja"
    ]
  },

  peso_max_usuario: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 100 kg",
      "Hasta 120 kg",
      "Hasta 136 kg",
      "Hasta 150 kg",
      "Hasta 180 kg+"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "NordicTrack Commercial 1750 / 2950",
      "Bowflex Treadmill 22",
      "Peloton Tread",
      "LifeFitness T3 / T5",
      "Precor TRM 243",
      "Sunny Health SF-T7515",
      "Xiaomi WalkingPad R2 / C2",
      "Urevo Foldi Mini",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
