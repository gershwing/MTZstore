/**
 * VARIANTES - Servicios Digitales > Software de Oficina > Antivirus y Seguridad
 * Ruta: admin/src/variantes/servicios-digitales/software-oficina/antivirus-seguridad/variantes.js
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
    nota: "El vendedor sube el logo / badge del antivirus. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Norton 360 (logo)", "Kaspersky Total Security (logo)",
      "Bitdefender Total Security (logo)", "ESET NOD32 / Internet Security (logo)",
      "Malwarebytes Premium (logo)", "Avast Premium (logo)",
      "AVG Internet Security (logo)", "McAfee Total Protection (logo)",
      "Trend Micro Maximum Security (logo)", "Sophos Home (logo)",
      "F-Secure Total (logo)", "G Data Total Security (logo)"
    ]
  },

  tipo_proteccion: {
    tipo: "texto",
    opciones: ["Antivirus básico", "Internet Security (antivirus + firewall + web)", "Total Security (suite completa)",
               "VPN incluida", "VPN + Antivirus", "Password Manager incluido", "Suite completa (antivirus + VPN + password + dark web)"]
  },

  numero_dispositivos: {
    tipo: "texto",
    opciones: ["1 dispositivo", "3 dispositivos", "5 dispositivos", "10 dispositivos", "Ilimitado"]
  },

  sistemas_compatibles: {
    tipo: "texto",
    opciones: ["Solo Windows", "Windows + Mac", "Windows + Mac + Android", "Multiplataforma (Win + Mac + Android + iOS)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "6 meses", "1 año", "2 años", "3 años"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Descarga + key", "Cuenta online"]
  },

  region_activacion: {
    tipo: "texto",
    opciones: ["Mundial", "USA / Canadá", "Europa", "LATAM", "Asia-Pacífico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
