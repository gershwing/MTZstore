/**
 * VARIANTES - Automotriz > Accesorios Interiores > Alfombrillas / Pisos
 * Ruta: admin/src/variantes/automotriz/accesorios-interiores/alfombrillas/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Piso alfombra fibra sintética",
      "Piso goma PVC simple",
      "Piso goma batea",
      "Piso goma batea bicolor",
      "Piso goma metalizado brillante",
      "Piso goma metalizado mate",
      "Piso maletero",
      "Piso por modelo de vehículo"
    ]
  },

  piezas: {
    tipo: "texto",
    requerido: true,
    opciones: ["3 set", "4 set", "5 set"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    guia_vendedor: [
      "Negro",
      "Gris",
      "Beige",
      "Rojo",
      "Azul",
      "Carbón",
      "Naranja",
      "Rosa",
      "Lila",
      "Amarillo"
    ]
  },

  marca_vehiculo: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Universal",
      "Hyundai",
      "Ford",
      "Honda",
      "Mazda",
      "Nissan",
      "Suzuki",
      "Toyota",
      "Mitsubishi",
      "Chevrolet"
    ]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
