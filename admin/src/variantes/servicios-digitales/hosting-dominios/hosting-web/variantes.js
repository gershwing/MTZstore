/**
 * VARIANTES - Servicios Digitales > Hosting y Dominios > Hosting Web
 * Ruta: admin/src/variantes/servicios-digitales/hosting-dominios/hosting-web/variantes.js
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
    opciones: ["Hosting compartido (shared hosting)", "Hosting WordPress administrado",
               "Hosting de tienda online (WooCommerce / PrestaShop)", "Hosting de email (solo correo)",
               "Hosting de revendedor (reseller)", "Cloud hosting (recursos escalables)",
               "Hosting de alto tráfico (dedicated resources)"]
  },

  plan: {
    tipo: "texto",
    opciones: ["Plan Básico / Starter", "Plan Emprendedor / Business", "Plan Profesional",
               "Plan Agencia / Ilimitado", "Plan Enterprise (a medida)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años", "3 años"]
  },

  almacenamiento: {
    tipo: "texto",
    opciones: ["1 GB SSD", "5 GB SSD", "10 GB SSD", "20 GB SSD", "50 GB SSD",
               "100 GB SSD", "200 GB SSD", "500 GB SSD", "Ilimitado (fair use)"]
  },

  sitios_web: {
    tipo: "texto",
    opciones: ["1 sitio", "3 sitios", "5 sitios", "10 sitios", "25 sitios", "Ilimitado"]
  },

  cuentas_email: {
    tipo: "texto",
    opciones: ["1 cuenta", "5 cuentas", "10 cuentas", "25 cuentas", "50 cuentas", "Ilimitado"]
  },

  certificado_ssl: {
    tipo: "texto",
    opciones: ["Sin SSL incluido", "SSL gratuito Let's Encrypt", "SSL Wildcard incluido", "SSL Premium incluido"]
  },

  soporte: {
    tipo: "texto",
    opciones: ["Solo tickets", "Tickets + chat", "24/7 chat + teléfono", "Account manager dedicado"]
  },

  marca_proveedor: {
    tipo: "imagen",
    nota: "El vendedor sube el logo / badge del proveedor. El cliente identifica el servicio por la imagen en el client.",
    guia_vendedor: [
      "GoDaddy (logo)", "Hostinger (logo)", "Bluehost (logo)",
      "SiteGround (logo)", "WP Engine (logo)", "Kinsta (logo)",
      "DigitalOcean (logo)", "A2 Hosting (logo)", "Namecheap (logo)",
      "Proveedor local LATAM (logo)", "Revendedor / Marca propia (logo)"
    ]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
