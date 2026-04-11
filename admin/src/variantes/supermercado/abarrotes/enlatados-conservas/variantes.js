/**
 * VARIANTES - Supermercado > Abarrotes > Enlatados y Conservas
 * Ruta: admin/src/variantes/supermercado/abarrotes/enlatados-conservas/variantes.js
 */

export const variantes = {
  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sellado de fábrica"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Atún en lata",
      "Sardina en lata",
      "Caballa en lata",
      "Paté",
      "Choclo en conserva",
      "Arveja en conserva",
      "Frejol en conserva",
      "Palmito en conserva",
      "Durazno en conserva",
      "Piña en conserva",
      "Leche condensada",
      "Leche evaporada",
      "Puré de tomate",
      "Salsa de tomate",
      "Ají en pasta",
      "Encurtidos"
    ]
  },

  presentacion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Lata", "Frasco", "Botella", "Doypack"]
  },

  contenido: {
    tipo: "texto",
    requerido: false,
    opciones: ["Pequeño", "Mediano", "Grande", "Pack x3", "Pack x6"]
  },

  tipo_conserva: {
    tipo: "texto",
    requerido: false,
    opciones: ["En agua", "En aceite", "En almíbar", "Al natural", "En salsa"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
