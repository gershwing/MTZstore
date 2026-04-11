/**
 * VARIANTES - Herramientas > Eléctricas > Lijadoras y Fresadoras
 * Ruta: admin/src/variantes/herramientas/electricas/lijadoras-fresadoras/variantes.js
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
      "Lijadora orbital aleatoria (random orbital)",
      "Lijadora de banda / Belt sander",
      "Lijadora de palma / Sheet sander",
      "Lijadora de detalle / Detail sander",
      "Lijadora de disco + banda (combinada)",
      "Fresadora / Router con cable",
      "Fresadora / Router a batería",
      "Cepillo eléctrico / Planer",
      "Tupí de mesa / Router table",
      "Multiherramienta oscilante + accesorios lija"
    ]
  },

  potencia_w: {
    tipo: "texto",
    requerido: false,
    opciones: ["150–300 W", "300–500 W", "500–750 W", "750–1000 W", "1000–1500 W", "1500–2400 W"]
  },

  diametro_plato_mm: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica", "115 mm", "125 mm", "150 mm", "Banda 75×457 mm", "Banda 100×610 mm"]
  },

  velocidad_rpm: {
    tipo: "texto",
    requerido: false,
    opciones: ["4000–6000 rpm", "6000–8000 rpm", "8000–12000 rpm", "12000–20000 rpm", "Variable (regulable)"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Azul (Makita / Bosch)", "Amarillo + negro (DeWalt)", "Rojo (Milwaukee)",
      "Verde (Bosch Pro)", "Naranja (Ridgid)", "Gris + negro (Festool)", "Genérico"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo herramienta",
      "Con 1 hoja de lija",
      "Con kit hojas de lija variadas",
      "Con guía paralela",
      "Kit completo en maletín"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Festool RO 150 / ETS EC 125",
      "Mirka DEROS / PROS",
      "DeWalt DCW210 / D26451",
      "Bosch GEX 125 / GBO 14 CE",
      "Makita BO5041 / BO6040",
      "Milwaukee M18 FROS",
      "Metabo FSR 200 Intec",
      "Ryobi PCL500",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
