/**
 * VARIANTES - Servicios Digitales > Suscripciones Digitales > Streaming y Entretenimiento
 * Ruta: admin/src/variantes/servicios-digitales/suscripciones-digitales/streaming-entretenimiento/variantes.js
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

  servicio: {
    tipo: "imagen",
    nota: "El vendedor sube el logo del servicio. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Netflix (logo)", "Disney+ (logo)", "Amazon Prime Video (logo)",
      "HBO Max / Max (logo)", "Apple TV+ (logo)", "Paramount+ (logo)",
      "Crunchyroll (logo)", "Claro Video (logo)", "Star+ (logo)",
      "Spotify (logo)", "Apple Music (logo)", "Amazon Music Unlimited (logo)",
      "YouTube Premium (logo)", "Tidal (logo)", "Deezer (logo)",
      "Audible (logo)", "Kindle Unlimited (logo)"
    ]
  },

  plan: {
    tipo: "texto",
    opciones: ["Individual / Personal", "Duo (2 personas)", "Familiar (hasta 4–6 personas)", "Student (descuento)",
               "Básico (con publicidad)", "Estándar", "Premium (mayor calidad / 4K)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años"]
  },

  pantallas_simultaneas: {
    tipo: "texto",
    opciones: ["1 pantalla", "2 pantallas", "3 pantallas", "4 pantallas", "Según plan"]
  },

  calidad_video: {
    tipo: "texto",
    opciones: ["SD (480p)", "HD (1080p)", "Full HD + HDR", "4K Ultra HD + HDR + Dolby Vision"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Gift card (código)", "Recarga de cuenta (email)", "Cuenta premium entregada (login)", "Código de canje"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Bolivia", "Chile", "Perú", "Argentina", "Colombia", "México", "España", "LATAM (regional)", "Mundial"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
