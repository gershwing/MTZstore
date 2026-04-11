/**
 * VARIANTES - Herramientas > Manuales > Kits de Herramientas
 * Ruta: admin/src/variantes/herramientas/manuales/kits-herramientas/variantes.js
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
      "Kit básico hogar (10–20 piezas)",
      "Kit estándar hogar (25–50 piezas)",
      "Kit profesional (80–100 piezas)",
      "Kit electricista",
      "Kit plomero / fontanero",
      "Kit carpintero",
      "Kit mecánico automóvil",
      "Kit emergencia auto",
      "Kit instalador / contratista",
      "Kit para regalar (caja premium)"
    ]
  },

  piezas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "10–20 piezas", "20–40 piezas", "40–60 piezas",
      "60–80 piezas", "80–100 piezas", "100–150 piezas", "150 piezas+"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Martillo", "Destornilladores (PH + SL)", "Llaves Allen", "Llaves fijas",
      "Alicates / Pinzas", "Cinta métrica", "Nivel de burbuja", "Cúter / Exacto",
      "Taladro a batería", "Linterna LED", "Cinta aislante / teflon", "Set de bits"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bolsa de herramientas",
      "Maletín plástico",
      "Maletín metálico / aluminio",
      "Caja de herramientas con ruedas",
      "Caja apilable modular",
      "Caja de regalo premium"
    ]
  },

  color_caja: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del kit completo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro + amarillo (DeWalt)", "Rojo + negro (Milwaukee / Craftsman)",
      "Azul (Bosch / Makita)", "Gris + negro", "Rojo metálico",
      "Negro mate", "Naranja + negro (Ridgid)", "Genérico varios colores"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "DeWalt DWMT72165 / TSTAK",
      "Milwaukee PACKOUT",
      "Bosch Home + Garden",
      "Stanley FMST1-75791 / STMT",
      "Craftsman CMMT99206",
      "Ryobi PCL500K1",
      "Truper 10690 / 15200",
      "Black+Decker BDHT60220",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
