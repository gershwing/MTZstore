/**
 * VARIANTES - Automotriz > Repuestos > Filtros
 * Ruta: admin/src/variantes/automotriz/repuestos/filtros/variantes.js
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo_filtro: {
    tipo: "imagen",
    requerido: true,
    guia_vendedor: [
      "Filtro de aire",
      "Filtro de habitáculo / cabina",
      "Filtro de aceite",
      "Filtro de combustible gasolina",
      "Filtro de combustible diésel",
      "Filtro de transmisión",
      "Kit filtros completo"
    ]
  },

  intervalo_cambio: {
    tipo: "texto",
    requerido: false,
    opciones: ["Cada 10.000 km", "Cada 15.000 km", "Cada 20.000 km", "Según fabricante"]
  }
}; // fin variantes

export function getAtributos() { return variantes; }
