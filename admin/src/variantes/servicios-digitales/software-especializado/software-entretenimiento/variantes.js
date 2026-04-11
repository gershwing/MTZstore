/**
 * VARIANTES - Servicios Digitales > Software Especializado > Software de Entretenimiento
 * Ruta: admin/src/variantes/servicios-digitales/software-especializado/software-entretenimiento/variantes.js
 *
 * IMPORTANTE: Solo productos / servicios digitales (sin entrega física).
 * condicion: siempre ["Nuevo"] — licencias y servicios no son Usados.
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Uso MÍNIMO: solo donde el logo / badge del software
 *                  es lo que identifica visualmente la opción.
 * tipo: "texto"  → PREDOMINANTE: plan, capacidad, plazo, usuarios,
 *                  región de activación, número de licencias.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]   // ← servicios digitales siempre Nuevo
  },

  tipo: {
    tipo: "texto",
    opciones: ["Videojuego (clave de activación PC)", "DLC / Contenido descargable (juego)", "Season Pass completo",
               "Créditos / Moneda de juego (gift card)", "Gift card plataforma de juegos", "Suscripción gaming",
               "Software de grabación / streaming (OBS / XSplit)", "Software de edición de video (consumer)",
               "Reconocimiento de voz / transcripción"]
  },

  plataforma_juego: {
    tipo: "imagen",
    nota: "El vendedor sube el logo de la plataforma / juego. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Steam (logo)", "Epic Games (logo)", "GOG.com (logo)",
      "EA App / Origin (logo)", "Ubisoft Connect (logo)", "Battle.net (logo)",
      "Rockstar Games Launcher (logo)", "Xbox PC Game Pass (logo)",
      "PlayStation Now / PC (logo)", "Gift card Steam (logo)",
      "Gift card Xbox (logo)", "Gift card PlayStation (logo)",
      "Riot Games (logo — RP)", "Roblox (logo — Robux)"
    ]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial (global)", "América (USA + LATAM)", "Solo USA / Canadá", "Europa",
               "LATAM (Argentina / Chile / México / Colombia / Bolivia / Perú)",
               "Solo Argentina", "Solo Chile", "Solo México"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave (key) por email", "Código QR", "Código digital en pantalla", "Cuenta entregada (login)"]
  },

  plazo_suscripcion: {
    tipo: "texto",
    opciones: ["No aplica (compra única)", "1 mes", "3 meses", "6 meses", "1 año", "Indefinido"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
