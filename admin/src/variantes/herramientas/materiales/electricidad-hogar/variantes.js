/**
 * VARIANTES - Herramientas > Materiales > Electricidad Hogar
 * Ruta: admin/src/variantes/herramientas/materiales/electricidad-hogar/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/acabado es esencial.
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
      "Interruptor simple",
      "Interruptor doble / Triple",
      "Tomacorriente simple",
      "Tomacorriente doble",
      "Tomacorriente con USB-A + USB-C",
      "Toma de TV / Antena",
      "Toma de red RJ45",
      "Placa / Marco para mecanismos",
      "Diferencial / RCCB 25A–40A",
      "Termomagnético / MCB 10A–40A",
      "Cable eléctrico sólido 12–14 AWG (metro)",
      "Cable flexible / cordón 2×0.75 mm (metro)",
      "Manguera / conduit plástico (metro)",
      "Caja de paso / caja de derivación",
      "Canaleta PVC (metro)",
      "Cinta de aislar eléctrico",
      "Multitoma / Regleta con protección sobretensión",
      "Extensión eléctrica 5–10 m",
      "Tablero eléctrico 6–12 circuitos",
      "Timbre / Doorbell + transformador"
    ]
  },

  amperaje: {
    tipo: "texto",
    requerido: false,
    opciones: ["6A", "10A", "16A", "20A", "25A", "32A", "40A", "63A"]
  },

  voltaje: {
    tipo: "texto",
    requerido: false,
    opciones: ["110V", "220V", "110/220V universal", "24V DC", "12V DC"]
  },

  color_mecanismo: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del mecanismo / producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco clásico", "Blanco moderno (marco fino)", "Gris antracita",
      "Negro mate", "Dorado / Champán", "Plateado / Inox",
      "Transparente + negro", "Madera + blanco", "Rojo (cables)", "Azul (cables)"
    ]
  },

  sistema: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Tradicional (tornillo)",
      "Sistema modular (BTicino / Legrand / Schneider)",
      "Montaje en superficie"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Legrand Céliane / Mosaic / Plexo",
      "Schneider Electric Odace / Mureva / Easy9",
      "BTicino Living Light / Livinglight Air",
      "ABB Busch-Jaeger / Zenit",
      "Philips Wiring Devices",
      "Bticino (LATAM)",
      "Luminex / Bgh (Argentina)",
      "TICINO / Hager (Chile)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
