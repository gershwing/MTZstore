/**
 * VARIANTES - Servicios Digitales > Hosting y Dominios > Dominios
 * Ruta: admin/src/variantes/servicios-digitales/hosting-dominios/dominios/variantes.js
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
    opciones: ["Registro de dominio nuevo", "Transferencia de dominio (desde otro registrar)",
               "Renovación de dominio", "Dominio premium (nombre corto / keyword)",
               "Dominio + hosting (combo)", "Dominio + email profesional (combo)",
               "Dominio + SSL + hosting (pack completo)"]
  },

  extension_tld: {
    tipo: "texto",
    opciones: [".com", ".net", ".org", ".io", ".co", ".app", ".dev", ".store", ".shop",
               ".online", ".site", ".web", ".info", ".biz", ".me", ".us", ".ca",
               ".com.bo (Bolivia)", ".cl (Chile)", ".com.pe (Perú)", ".com.ar (Argentina)",
               ".com.co (Colombia)", ".mx (México)", ".com.mx", ".br / .com.br (Brasil)",
               ".es (España)", ".eu", ".uk / .co.uk", ".de", ".fr", ".it", ".jp",
               "Pack multi-extensión (.com + .net + .org)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 año", "2 años", "3 años", "5 años", "10 años"]
  },

  privacidad_whois: {
    tipo: "texto",
    opciones: ["Sin protección WHOIS", "Con protección WHOIS (privacidad incluida)", "Con protección + bloqueo de transferencia"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo dominio", "Dominio + DNS básico", "Dominio + redirección email", "Dominio + página de inicio temporal"]
  },

  marca_registrar: {
    tipo: "imagen",
    nota: "El vendedor sube el logo del registrar. El cliente identifica el servicio por la imagen en el client.",
    guia_vendedor: [
      "GoDaddy (logo)", "Namecheap (logo)", "Google Domains / Squarespace (logo)",
      "Cloudflare Registrar (logo)", "Porkbun (logo)", "NIC Bolivia (logo)",
      "NIC Chile (logo)", "NIC Perú (logo)", "Proveedor local (logo)"
    ]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
