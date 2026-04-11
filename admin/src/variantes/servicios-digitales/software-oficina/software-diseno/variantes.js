/**
 * VARIANTES - Servicios Digitales > Software de Oficina > Software de Diseño
 * Ruta: admin/src/variantes/servicios-digitales/software-oficina/software-diseno/variantes.js
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
      "Adobe Creative Cloud (logo)", "Adobe Photoshop (logo)",
      "Adobe Illustrator (logo)", "Adobe Premiere Pro (logo)",
      "Adobe After Effects (logo)", "Adobe InDesign (logo)",
      "Adobe Acrobat Pro (logo)", "Adobe Lightroom (logo)",
      "Affinity Photo 2 (logo)", "Affinity Designer 2 (logo)",
      "Affinity Publisher 2 (logo)", "CorelDRAW Graphics Suite (logo)",
      "Canva Pro (logo)", "Figma (logo)", "Sketch (logo)",
      "DaVinci Resolve Studio (logo)", "Final Cut Pro (logo)",
      "Capture One (logo)"
    ]
  },

  plan: {
    tipo: "texto",
    opciones: ["App individual (1 app)", "Fotografía (Lightroom + Photoshop)", "Suite completa All Apps",
               "Business (por usuario)", "Teams / Equipos", "Educación / Student", "Licencia perpetua (sin suscripción)"]
  },

  numero_usuarios: {
    tipo: "texto",
    opciones: ["1 usuario", "2 usuarios", "3 usuarios", "5 usuarios", "10 usuarios", "Por puesto (ver descripción)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "6 meses", "1 año", "Licencia perpetua"]
  },

  almacenamiento_nube: {
    tipo: "texto",
    opciones: ["Sin almacenamiento", "20 GB", "100 GB", "1 TB", "Ilimitado (teams)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Cuenta Creative Cloud / login", "Descarga directa + key", "Código de canje"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial", "USA / Canadá", "Europa", "LATAM"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
