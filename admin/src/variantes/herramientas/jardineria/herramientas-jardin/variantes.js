/**
 * VARIANTES - Herramientas > Jardinería > Herramientas de Jardín
 * Ruta: admin/src/variantes/herramientas/jardineria/herramientas-jardin/variantes.js
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
      "Pala de jardín",
      "Azadón / Escarda",
      "Rastrillo",
      "Horquilla de jardín",
      "Transplantador / Palín",
      "Podadora manual / Tijera poda",
      "Podadora telescópica (ramas altas)",
      "Tijera de seto (topiar)",
      "Segadora de césped eléctrica",
      "Segadora a batería",
      "Segadora de gasolina",
      "Desbrozadora / Bordeadora a hilo",
      "Desbrozadora a batería",
      "Soplador de hojas",
      "Motosierra de poda a batería",
      "Aireador de césped",
      "Set herramientas jardín (3–5 piezas)",
      "Guantes de jardinería",
      "Carretilla de jardín",
      "Macetas + tierra (set inicio)"
    ]
  },

  potencia_w_cc: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica (manual)",
      "18V batería",
      "20V MAX batería",
      "36V / 40V batería",
      "1000–1200 W (cable)",
      "1200–1500 W",
      "1500–1800 W",
      "25–50 cc (gasolina)",
      "50–70 cc"
    ]
  },

  ancho_corte_cm: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica", "28–33 cm", "33–38 cm", "38–42 cm", "42–46 cm", "46–55 cm", "55 cm+"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Verde + negro (Bosch / Stihl)", "Naranja + negro (Husqvarna / Stiga)",
      "Rojo + negro (Honda / Toro)", "Amarillo + negro (DeWalt)",
      "Azul + negro (Makita)", "Verde oliva + naranja (Husqvarna)",
      "Madera + acero (herramientas manuales)", "Genérico verde / rojo"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bosch UniversalRotak / AdvancedRotak (segadora)",
      "Husqvarna LC 253i / 450X",
      "Stihl FSA 56 / MSA 120 (batería)",
      "Greenworks 40V / 80V",
      "EGO Power+ LM2102SP / ST1521S",
      "DeWalt DCMW564 / DCST920",
      "Fiskars (herramientas manuales)",
      "Tramontina Garden (LATAM)",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
