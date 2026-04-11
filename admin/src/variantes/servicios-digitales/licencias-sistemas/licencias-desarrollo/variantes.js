/**
 * VARIANTES - Servicios Digitales > Licencias y Sistemas > Licencias de Desarrollo
 * Ruta: admin/src/variantes/servicios-digitales/licencias-sistemas/licencias-desarrollo/variantes.js
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
    opciones: ["IDE / Editor de código (licencia)", "Plugin / Extensión para IDE", "Base de datos (licencia comercial)",
               "API key / Acceso a API (créditos)", "Certificado SSL / TLS", "Certificado SSL wildcard",
               "Certificado de firma de código (code signing)", "Herramienta de testing / CI-CD",
               "Librería / Framework (licencia comercial)", "Font / Tipografía (licencia comercial)",
               "Foto stock (licencia / créditos)", "Ícono / Vector (licencia comercial)", "Template / Plantilla web"]
  },

  software_herramienta: {
    tipo: "imagen",
    nota: "El vendedor sube el logo de la herramienta. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "JetBrains (IntelliJ / PhpStorm / PyCharm / WebStorm — logo)",
      "Visual Studio (logo)", "GitHub Copilot (logo)",
      "Postman (logo)", "TablePlus (logo)", "Navicat (logo)",
      "MySQL / MariaDB (logo)", "MongoDB Atlas (logo)",
      "SSL Comodo / DigiCert (badge)", "SSL Let's Encrypt (badge)",
      "Adobe Fonts (logo)", "Google Fonts (logo)",
      "Shutterstock (logo)", "Getty Images (logo)",
      "Envato / ThemeForest (logo)", "Creative Market (logo)"
    ]
  },

  plan_uso: {
    tipo: "texto",
    opciones: ["Uso personal (1 desarrollador)", "Startup (hasta 5 desarrolladores)",
               "Business (hasta 25 desarrolladores)", "Enterprise (ilimitado)", "Open source (gratis)"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "6 meses", "1 año", "2 años", "Licencia perpetua (sin vencimiento)"]
  },

  tipo_entrega: {
    tipo: "texto",
    opciones: ["Clave de activación (key)", "Código de canje online", "Cuenta / login entregado",
               "Código de descarga", "Certificado descargable (SSL)"]
  },

  numero_dominios_ssl: {
    tipo: "texto",
    opciones: ["1 dominio", "Wildcard (*.dominio.com — subdominios ilimitados)",
               "Multi-dominio SAN (2–5 dominios)", "Multi-dominio SAN (6–100 dominios)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
