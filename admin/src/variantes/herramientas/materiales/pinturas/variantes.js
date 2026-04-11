/**
 * VARIANTES - Herramientas > Materiales > Pinturas
 * Ruta: admin/src/variantes/herramientas/materiales/pinturas/variantes.js
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
      "Pintura látex interior mate",
      "Pintura látex interior satinado",
      "Pintura látex exterior",
      "Esmalte al agua satinado",
      "Esmalte al agua brillante",
      "Esmalte al aceite (tradicional)",
      "Pintura para madera / deck",
      "Pintura para metal anticorrosiva",
      "Pintura para pizarrón",
      "Pintura en spray aerosol",
      "Pintura de tráfico / señalización",
      "Barniz / Laca transparente",
      "Sellador / Fondo imprimante",
      "Estuco / Pasta mural",
      "Pintura efecto concreto",
      "Pintura efecto mármol",
      "Pintura fluorescente / Neón",
      "Pintura lavable para niños"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la muestra de color pintada en pared. El cliente elige el tono viendo la foto en el client.",
    guia_vendedor: [
      "Blanco puro", "Blanco hueso / Marfil", "Blanco roto / Off-white",
      "Gris claro (light grey)", "Gris medio", "Gris oscuro (charcoal)",
      "Beige / Arena", "Beige oscuro / Camel", "Terracota / Ladrillo",
      "Verde salvia", "Verde oliva", "Verde bosque",
      "Azul cielo", "Azul marino", "Azul petróleo",
      "Amarillo suave / Mantequilla", "Amarillo mostaza",
      "Rosa palo / Nude", "Terracota rosado", "Salmón",
      "Café / Marrón oscuro", "Negro mate", "Negro brillante",
      "Rojo óxido (anticorrosivo)", "Gris aluminio (metal)", "Transparente / Barniz"
    ]
  },

  volumen: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "100 ml (spray)", "200 ml (spray)", "400 ml (spray)",
      "1 L", "2 L", "4 L", "5 L", "10 L", "18–20 L", "Balde 25 L"
    ]
  },

  rendimiento_m2: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 5 m²", "5–10 m²", "10–15 m²",
      "15–20 m² / L", "20–25 m² / L", "25 m²+ / L"
    ]
  },

  acabado: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Mate",
      "Satinado",
      "Semi-brillante",
      "Brillante",
      "Texturado / Rugoso",
      "Liso premium"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sherwin-Williams SuperPaint / Emerald",
      "Benjamin Moore Regal / Aura",
      "Pinturas Kem / Alba (Argentina)",
      "Anypsa / CPP (Perú)",
      "Sipa / Montana (Bolivia)",
      "Teknos / Sayerlack (madera)",
      "Rust-Oleum (metal / spray)",
      "Krylon (spray)",
      "Montana Cans (spray arte)",
      "Bruguer / Valentine (España / LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
