/**
 * VARIANTES - Herramientas > Eléctricas > Taladros
 * Ruta: admin/src/variantes/herramientas/electricas/taladros/variantes.js
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
      "Taladro percutor con cable",
      "Taladro percutor a batería",
      "Taladro atornillador a batería",
      "Taladro de impacto / Impact driver",
      "Taladro en ángulo / Right angle drill",
      "Taladro de columna / Drill press",
      "Martillo demoledor SDS-Plus",
      "Martillo demoledor SDS-Max",
      "Taladro magnético (metal / acero)",
      "Destornillador eléctrico compacto"
    ]
  },

  voltaje_bateria: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica (cable 220V)",
      "10.8V / 12V",
      "18V",
      "20V MAX",
      "36V / 40V",
      "54V / 60V"
    ]
  },

  torque_nm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 30 Nm",
      "30–50 Nm",
      "50–80 Nm",
      "80–120 Nm",
      "120–200 Nm",
      "200 Nm+"
    ]
  },

  velocidades: {
    tipo: "texto",
    requerido: false,
    opciones: ["1 velocidad", "2 velocidades", "Variable continua", "2 vel. + reversa"]
  },

  portabrocas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "10 mm sin llave",
      "13 mm sin llave",
      "13 mm con llave",
      "SDS-Plus",
      "SDS-Max",
      "Hex 1/4\""
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del taladro. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Amarillo + negro (DeWalt)", "Rojo + negro (Milwaukee)", "Verde (Bosch)",
      "Azul (Makita)", "Rojo (AEG / Hilti)", "Naranja (Ridgid)",
      "Negro + gris (Craftsman)", "Gris + verde (Metabo)", "Genérico varios colores"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo herramienta (bare tool)",
      "Con 1 batería + cargador",
      "Con 2 baterías + cargador",
      "Kit en maletín"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "DeWalt DCD996 / DCD800",
      "Milwaukee M18 FUEL / M12",
      "Bosch GSB 18V / GBH",
      "Makita DHP486 / DHR243",
      "Hilti TE 6-A22 / SF 6H-A22",
      "Metabo BS 18 L",
      "Ryobi ONE+ HP / PCL",
      "AEG BS18C2LI / BBH36",
      "Black+Decker",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
