/**
 * VARIANTES - Bebés > Juguetes > Electrónicos
 * Ruta: admin/src/variantes/bebes/juguetes/electronicos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
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
      "Tablet infantil con control parental",
      "Robot programable",
      "Drone mini para niños",
      "Consola portátil infantil",
      "Coche / Moto RC (radio control)",
      "Helicóptero RC",
      "Barco RC",
      "Tren eléctrico",
      "Dinosaurio / Animal RC interactivo",
      "Cámara fotográfica para niños",
      "Walkie-talkie",
      "Proyector de historias / cuentacuentos",
      "Piano / Teclado electrónico infantil",
      "Guitarra eléctrica infantil",
      "Batería electrónica infantil",
      "Set de karaoke para niños",
      "Reloj inteligente infantil (GPS)"
    ]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: ["3–5 años", "5–7 años", "7–10 años", "10–12 años", "12+ años"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del juguete. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Azul + negro", "Rosa + blanco", "Naranja + gris", "Verde + negro",
      "Multicolor", "Rojo + blanco", "Negro (RC)", "Amarillo + negro",
      "Blanco + azul", "Morado + blanco", "Estampado camuflaje (RC)"
    ]
  },

  bateria: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Pilas AA incluidas",
      "Pilas AAA incluidas",
      "Batería recargable USB incluida",
      "Batería Li-Po (RC)",
      "Sin batería / pilas (requiere compra aparte)"
    ]
  },

  frecuencia_rc: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica",
      "27 MHz",
      "40 MHz",
      "2.4 GHz (anti-interferencia)",
      "Bluetooth 5.0"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Amazon Fire Kids (tablet)",
      "Vtech Innotab / Kidizoom",
      "Osmo Genius Kit / Pizza Co.",
      "Sphero Mini / Bolt",
      "Miko 3 (robot IA)",
      "DJI Tello (drone)",
      "Syma (RC)",
      "Leapfrog LeapPad",
      "Fisher-Price (electrónico)",
      "Little Tikes Tobi",
      "Genérico"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "CE",
      "ASTM F963",
      "CPSC",
      "FCC (frecuencia radio)",
      "Sin certificación especificada"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
