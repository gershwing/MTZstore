/**
 * VARIANTES - Deportes > Ciclismo > Accesorios de Ciclismo
 * Ruta: admin/src/variantes/deportes/ciclismo/accesorios-ciclismo/variantes.js
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
      "Ciclocomputador / GPS",
      "Luces delanteras LED",
      "Luces traseras LED",
      "Set luces delantera + trasera",
      "Candado / Antirrobo",
      "Bomba de inflar (port\u00e1til)",
      "Bomba de inflar (de pie / taller)",
      "Bolso de cuadro / frame bag",
      "Bolso de sillin / saddle bag",
      "Portabid\u00f3n + bid\u00f3n",
      "Guantes de ciclismo",
      "Culotte / Pantal\u00f3n ciclismo",
      "Maillot / Camiseta ciclismo",
      "Zapatillas de ciclismo MTB",
      "Zapatillas de ciclismo carretera",
      "Rodillo de entrenamiento / Smart trainer",
      "C\u00e1mara de aire / Neum\u00e1tico",
      "Kit antipinchazo",
      "Herramienta multifunci\u00f3n / multiherramienta",
      "Soporte de bicicleta (caballete)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / dise\u00f1o del accesorio. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Blanco", "Rojo", "Azul", "Verde", "Naranja fluor",
      "Amarillo fluor", "Gris", "Multicolor / Estampado equipo"
    ]
  },

  compatibilidad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Universal",
      "Carretera (700c)",
      "MTB 26\"",
      "MTB 27.5\"",
      "MTB 29\"",
      "Shimano SPD",
      "Shimano SPD-SL",
      "Look Keo",
      "Time / Speedplay"
    ]
  },

  marca_gps: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Garmin Edge 130 / 530 / 830 / 1040",
      "Wahoo ELEMNT Bolt / Roam",
      "Sigma ROX 4.0 / 12.1",
      "Bryton Rider 420 / 750",
      "Polar Vantage M2 (con GPS)"
    ]
  },

  marca_rodillo: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Wahoo KICKR / KICKR Core / KICKR Snap",
      "Tacx NEO 2T / Flux S / Satori",
      "Elite Suito-T / Direto XR",
      "Saris H3 / M2"
    ]
  },

  marca_general: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Lezyne",
      "Topeak",
      "Ortlieb (bolsos)",
      "Kryptonite / Abus (candados)",
      "Continental / Schwalbe (neum\u00e1ticos)",
      "Pirelli / Michelin",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
