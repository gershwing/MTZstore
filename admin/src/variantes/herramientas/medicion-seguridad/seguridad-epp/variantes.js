/**
 * VARIANTES - Herramientas > Medición y Seguridad > Seguridad EPP
 * Ruta: admin/src/variantes/herramientas/medicion-seguridad/seguridad-epp/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/acabado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Casco de seguridad (construction)",
      "Casco minero con linterna",
      "Gafas de seguridad transparentes",
      "Gafas de seguridad oscuras / solar",
      "Pantalla facial / Face shield",
      "Tapón para oídos (espuma) — caja",
      "Orejeras / Protector auditivo",
      "Respirador media cara (con filtros P100)",
      "Mascarilla N95 (pack)",
      "Guantes de trabajo cuero",
      "Guantes anticorte nivel 5",
      "Guantes de goma / látex (caja)",
      "Guantes nitrilo (caja)",
      "Chaleco reflectante clase 2",
      "Chaleco reflectante clase 3",
      "Cinturón lumbar de seguridad",
      "Rodilleras de trabajo",
      "Calzado de seguridad punta acero",
      "Arnés de seguridad altura",
      "Kit EPP completo (casco + gafas + guantes + chaleco)"
    ]
  },

  talla: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "S", "M", "L", "XL", "XXL", "Talla única ajustable",
      "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"
    ]
  },

  cantidad: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "1 unidad", "Pack 2", "Pack 5", "Pack 10",
      "Pack 25", "Caja 50", "Caja 100", "Caja 200"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del EPP. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Blanco (casco)", "Amarillo (casco)", "Naranja (casco / chaleco)",
      "Rojo (casco)", "Azul (casco)", "Verde (casco)",
      "Transparente (gafas / pantalla)", "Negro (guantes)", "Naranja fluor (chaleco)",
      "Multicolor set EPP completo"
    ]
  },

  certificacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "ANSI Z89.1 (casco USA)",
      "EN 397 (casco Europa)",
      "ANSI Z87.1 (gafas)",
      "EN 166 (gafas Europa)",
      "NIOSH N95",
      "EN 149 FFP2",
      "EN 388 (guantes corte)",
      "ISO 20345 (calzado seguridad)",
      "OSHA 1926 (arnés)",
      "Sin certificación"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "3M (respirador / gafas / tapones / guantes nitrilo)",
      "Honeywell Uvex / Miller (arnés)",
      "MSA Safety (cascos / arnés)",
      "Moldex (respirador)",
      "Milwaukee (guantes / gafas)",
      "Ironclad (guantes trabajo)",
      "Condor / MCR Safety",
      "Truper (LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
