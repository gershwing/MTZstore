/**
 * VARIANTES - Automotriz > Accesorios Exteriores > Cobertores
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo_vehiculo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Sedan / Auto", "SUV / Vagoneta", "Pickup / Camioneta", "Van / Minivan", "Motocicleta"]
  },

  talla: {
    tipo: "texto",
    variante: true,
    opciones: [
      "Sedan M (457x165x119 cm)",
      "Sedan L (482x178x119 cm)",
      "Sedan XL (533x178x119 cm)",
      "Sedan XXL (571x203x119 cm)",
      "SUV M (457x185x145 cm)",
      "SUV L (482x195x145 cm)",
      "SUV XL (533x195x152 cm)",
      "SUV XXL (571x203x160 cm)",
      "Pickup L (579x198x157 cm)",
      "Pickup XL (625x203x157 cm)",
      "Van (538x192x228 cm)",
      "Moto M",
      "Moto L",
      "Moto XL"
    ]
  },

  material: {
    tipo: "texto",
    opciones: ["PVC con algodon spunlace 210g", "PVC con algodon spunlace 230g", "PVC con algodon spunlace 250g", "Polyester impermeable", "Oxford 210D"]
  },

  color: {
    tipo: "imagen",
    opciones: ["Gris Claro", "Gris Oscuro"]
  },

  incluye: {
    tipo: "texto",
    variante: true,
    opciones: ["Con reflectivo", "Con reflectivo y correa de amarre", "Sin reflectivo", "Sin reflectivo con correa de amarre"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
