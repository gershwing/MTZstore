/**
 * VARIANTES - Herramientas > Materiales > Adhesivos
 * Ruta: admin/src/variantes/herramientas/materiales/adhesivos/variantes.js
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
      "Silicona selladora transparente",
      "Silicona selladora blanca",
      "Silicona selladora para baño",
      "Silicona estructural",
      "Silicona de alta temperatura",
      "Espuma de poliuretano expansiva",
      "Adhesivo de contacto / Cemento de contacto",
      "Adhesivo epoxi bicomponente",
      "Adhesivo de montaje (tipo Stikaflex / PL Premium)",
      "Cinta doble cara espuma",
      "Cinta aluminio (ductos)",
      "Cinta aislante / Masking tape",
      "Pegamento cianocrilato (super glue)",
      "Pegamento para PVC / CPVC",
      "Cola de carpintero / PVA",
      "Adhesivo de mosaico / Fragüe",
      "Pegamento para azulejo / ceramica (porcelana)",
      "Drywall / Masilla de acabado",
      "Pasta de relleno / Polyfilla",
      "Cinta de juntas drywall"
    ]
  },

  volumen_presentacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "10 ml", "50 ml", "100 ml", "280–310 ml (cartucho)",
      "500 ml", "750 ml", "1 L", "5 L", "25 L"
    ]
  },

  temperatura_uso: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hasta 80°C", "Hasta 150°C", "Hasta 250°C", "Hasta 350°C", "Hasta 500°C+"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Transparente / Incoloro", "Blanco", "Negro", "Gris", "Beige",
      "Rojo (alta temperatura)", "Plata / Aluminio (cinta)",
      "Amarillo (espuma PU)", "Azul (cinta masking)", "Set varios tipos"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sika SikaSeal / SikaFlex / SikaBoom",
      "Dow Corning 100%",
      "Momentive GE Silicone",
      "Loctite Super Glue / Titebond",
      "Henkel Pritt / Metylan",
      "3M VHB / Scotch",
      "Hilti CF 116 / CFS-S (espuma / silicona)",
      "Den Braven",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
