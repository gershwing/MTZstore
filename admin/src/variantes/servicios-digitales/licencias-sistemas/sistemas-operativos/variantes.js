/**
 * VARIANTES - Servicios Digitales > Licencias y Sistemas > Sistemas Operativos
 * Ruta: admin/src/variantes/servicios-digitales/licencias-sistemas/sistemas-operativos/variantes.js
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
    nota: "El vendedor sube el logo / badge del SO. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Windows 11 Home (badge)", "Windows 11 Pro (badge)",
      "Windows 11 Pro for Workstations (badge)", "Windows 10 Home (badge)",
      "Windows 10 Pro (badge)", "Windows Server 2022 Standard (badge)",
      "Windows Server 2022 Datacenter (badge)", "Windows Server 2019 (badge)",
      "macOS (no aplica — incluido en hardware Apple)",
      "Ubuntu Pro (logo)", "Red Hat Enterprise Linux (logo)"
    ]
  },

  edicion: {
    tipo: "texto",
    opciones: ["Home / Doméstica", "Pro / Professional", "Pro for Workstations", "Enterprise", "Education",
               "Server Standard", "Server Datacenter", "LTSC (Long Term Servicing Channel)"]
  },

  tipo_licencia: {
    tipo: "texto",
    opciones: ["OEM (vinculada a 1 PC — sin soporte Microsoft)", "Retail (transferible entre PCs)",
               "MAK (clave de activación múltiple — volumen)", "KMS (activación corporativa)",
               "Suscripción (Microsoft 365 / Azure)"]
  },

  numero_pcs: {
    tipo: "texto",
    opciones: ["1 PC (OEM / Retail)", "2–5 PCs (volumen)", "6–10 PCs", "11–25 PCs", "26–50 PCs", "50+ PCs (a medida)"]
  },

  bits: {
    tipo: "texto",
    opciones: ["64 bits", "32 bits", "64 + 32 bits (dual)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave digital (key) por email", "USB booteable + key", "DVD + key", "Clave + descarga ISO"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial", "USA / Canadá", "Europa", "LATAM", "Asia-Pacífico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
