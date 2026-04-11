/**
 * VARIANTES - Servicios Digitales > Software de Oficina > Suite Oficina
 * Ruta: admin/src/variantes/servicios-digitales/software-oficina/suite-oficina/variantes.js
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
    nota: "El vendedor sube el logo / badge del software. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Microsoft 365 Personal (logo + badge)", "Microsoft 365 Family (logo + badge)",
      "Microsoft 365 Business Basic (logo)", "Microsoft 365 Business Standard (logo)",
      "Microsoft 365 Apps for Business (logo)", "Microsoft 365 E3 (logo)",
      "Office 2021 Home & Student (badge físico)", "Office 2021 Professional (badge)",
      "Google Workspace Starter (logo)", "Google Workspace Business (logo)",
      "Google Workspace Enterprise (logo)", "LibreOffice (logo — gratis)",
      "WPS Office Pro (logo)", "Zoho Workplace (logo)"
    ]
  },

  plan: {
    tipo: "texto",
    opciones: ["Personal (1 usuario)", "Family / Hogar (hasta 6 usuarios)", "Business Básico", "Business Estándar",
               "Business Premium", "Enterprise", "Solo apps (sin servicios cloud)"]
  },

  numero_dispositivos: {
    tipo: "texto",
    opciones: ["1 dispositivo", "2 dispositivos", "3 dispositivos", "5 dispositivos",
               "6 dispositivos (familia)", "Ilimitado (usuarios del plan)"]
  },

  plazo_suscripcion: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "Licencia perpetua (sin vencimiento)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Descarga directa + key", "Cuenta vinculada (login)", "USB físico + key"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial (global)", "USA / Canadá", "Europa", "LATAM", "Solo España", "Asia-Pacífico"]
  },

  almacenamiento_nube: {
    tipo: "texto",
    opciones: ["Sin almacenamiento cloud", "15 GB (Google Drive)", "100 GB", "1 TB OneDrive", "2 TB", "6 TB (familia)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
