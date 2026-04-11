/**
 * VARIANTES - Servicios Digitales > Suscripciones Digitales > Herramientas de Productividad
 * Ruta: admin/src/variantes/servicios-digitales/suscripciones-digitales/herramientas-productividad/variantes.js
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
    opciones: ["Gestor de contraseñas (password manager)", "VPN (red privada virtual)", "VPN + Antivirus combo",
               "Gestor de proyectos / trabajo en equipo", "CRM (gestión de clientes)", "Email marketing",
               "Firma electrónica / digital", "Videoconferencia (plan pago)", "Automatización de tareas (no-code)",
               "Inteligencia artificial (acceso a modelos premium)", "Traducción automática (API / plan)"]
  },

  servicio: {
    tipo: "imagen",
    nota: "El vendedor sube el logo del servicio. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "1Password (logo)", "Bitwarden (logo)", "LastPass (logo)",
      "Dashlane (logo)", "NordVPN (logo)", "ExpressVPN (logo)",
      "Surfshark (logo)", "ProtonVPN (logo)", "Mullvad (logo)",
      "Notion (logo)", "Asana (logo)", "Monday.com (logo)",
      "Trello (logo)", "Jira (logo)", "ClickUp (logo)",
      "HubSpot (logo)", "Pipedrive (logo)", "Zoho CRM (logo)",
      "Mailchimp (logo)", "Brevo / Sendinblue (logo)",
      "DocuSign (logo)", "Firma.Digital (logo — LATAM)",
      "Zoom (logo)", "Microsoft Teams (logo)",
      "Zapier (logo)", "Make / Integromat (logo)",
      "Claude Pro (logo)", "ChatGPT Plus (logo)", "Gemini Advanced (logo)",
      "Midjourney (logo)", "DeepL Pro (logo)"
    ]
  },

  plan: {
    tipo: "texto",
    opciones: ["Free / Gratuito (referencia)", "Básico / Starter", "Personal / Individual", "Professional",
               "Team / Equipos (por usuario)", "Business", "Enterprise"]
  },

  numero_usuarios: {
    tipo: "texto",
    opciones: ["1 usuario", "2 usuarios", "3 usuarios", "5 usuarios", "10 usuarios",
               "25 usuarios", "50 usuarios", "Ilimitado"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años", "Lifetime (pago único)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Código de canje", "Cuenta entregada (login)", "Invitación a workspace"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial", "USA / Canadá", "Europa", "LATAM", "Solo España"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
