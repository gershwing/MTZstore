/**
 * VARIANTES - Servicios Digitales > Software Especializado > Software de Contabilidad
 * Ruta: admin/src/variantes/servicios-digitales/software-especializado/software-contabilidad/variantes.js
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

  software: {
    tipo: "imagen",
    nota: "El vendedor sube el logo del software. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "QuickBooks (logo)", "Xero (logo)", "Zoho Books (logo)",
      "FreshBooks (logo)", "Wave Accounting (logo)", "Sage 50 / Sage Business Cloud (logo)",
      "Alegra (logo — LATAM)", "Contasol (logo — España)",
      "Monica (logo — Bolivia)", "Siigo (logo — Colombia)",
      "CONCAR (logo — Perú)", "Tango (logo — Argentina)",
      "SAP Business One (logo)", "Odoo (logo — ERP)"
    ]
  },

  plan: {
    tipo: "texto",
    opciones: ["Starter / Básico (1 usuario)", "Estándar (hasta 3 usuarios)", "Profesional (hasta 5 usuarios)",
               "Business (hasta 10 usuarios)", "Enterprise (usuarios ilimitados)", "Módulo adicional (ver descripción)"]
  },

  numero_empresas: {
    tipo: "texto",
    opciones: ["1 empresa / RUC", "3 empresas", "5 empresas", "10 empresas", "Ilimitado"]
  },

  numero_usuarios: {
    tipo: "texto",
    opciones: ["1 usuario", "2 usuarios", "3 usuarios", "5 usuarios", "10 usuarios", "Ilimitado"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años", "Licencia perpetua"]
  },

  pais_normativa: {
    tipo: "texto",
    opciones: ["Bolivia (NIT + SIN)", "Chile (RUT + SII)", "Perú (RUC + SUNAT)", "Argentina (CUIT + AFIP)",
               "Colombia (NIT + DIAN)", "México (RFC + SAT)", "España (CIF + AEAT)", "Internacional / Multi-país"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Cuenta SaaS (login online)", "Instalación local + key", "USB físico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
