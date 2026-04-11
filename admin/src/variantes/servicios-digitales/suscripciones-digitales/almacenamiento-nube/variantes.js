/**
 * VARIANTES - Servicios Digitales > Suscripciones Digitales > Almacenamiento en la Nube
 * Ruta: admin/src/variantes/servicios-digitales/suscripciones-digitales/almacenamiento-nube/variantes.js
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
      "Google One (logo)", "iCloud+ (logo)", "OneDrive (logo)",
      "Dropbox Plus / Business (logo)", "Box (logo)",
      "pCloud Premium (logo)", "Mega (logo)", "Backblaze (logo)",
      "Amazon Drive (logo)", "Nextcloud (logo — self-hosted)"
    ]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["50 GB", "100 GB", "200 GB", "500 GB", "1 TB", "2 TB", "3 TB", "5 TB", "10 TB", "20 TB", "Ilimitado"]
  },

  plan: {
    tipo: "texto",
    opciones: ["Personal / Individual", "Familia (hasta 5–6 usuarios)", "Business Starter", "Business Plus", "Enterprise"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años", "3 años", "Pago de por vida (lifetime)"]
  },

  usuarios: {
    tipo: "texto",
    opciones: ["1 usuario", "2 usuarios", "3 usuarios", "5 usuarios", "6 usuarios", "Hasta 10 usuarios", "Ilimitado"]
  },

  funciones: {
    tipo: "texto",
    opciones: ["Solo almacenamiento", "Almacenamiento + ofimática online", "Almacenamiento + backup automático",
               "Almacenamiento + VPN", "Suite completa (almacenamiento + office + VPN)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Código de canje (upgrade plan)", "Cuenta entregada (login)", "Crédito de almacenamiento", "Gift card"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
