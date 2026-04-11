/**
 * VARIANTES - Deportes > Fitness > Bicicletas Est\u00e1ticas
 * Ruta: admin/src/variantes/deportes/fitness/bicicletas-estaticas/variantes.js
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
      "Bicicleta est\u00e1tica vertical magn\u00e9tica",
      "Bicicleta recostada / Recumbent",
      "Bicicleta de spinning / indoor cycling (belt drive)",
      "Bicicleta de spinning (chain drive)",
      "Air bike / Assault bike (resistencia por aire)",
      "Bicicleta con pantalla interactiva",
      "Bicicleta plegable / compacta"
    ]
  },

  niveles_resistencia: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "8 niveles",
      "16 niveles",
      "20 niveles",
      "24 niveles",
      "32 niveles",
      "Resistencia magn\u00e9tica infinita (dial)",
      "Resistencia por aire (ilimitada)"
    ]
  },

  pantalla: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin pantalla",
      "Pantalla LCD b\u00e1sica (vel + dist + cal + tiempo)",
      "Pantalla LCD con puls\u00f3metro",
      "Pantalla t\u00e1ctil HD (clases en vivo)",
      "Compatible con app (Bluetooth + ANT+)"
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

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Negro + rojo", "Negro + plateado", "Blanco + gris",
      "Negro + naranja", "Gris oscuro", "Blanco"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Peloton Bike / Bike+",
      "NordicTrack S22i / S27i",
      "Bowflex VeloCore",
      "Schwinn IC4 / 230 Recumbent",
      "Sunny Health SF-B1805 / B1002C",
      "Keiser M3i",
      "Assault AirBike Classic / Elite",
      "Rogue Echo Bike",
      "Xiaomi Urevo",
      "Life Fitness IC5",
      "Gen\u00e9rico"
    ]
  },

  volante_kg: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "3\u20135 kg", "6\u20138 kg", "9\u201312 kg", "13\u201318 kg", "18\u201325 kg", "25 kg+"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
