/**
 * VARIANTES - Electrónica > Celulares > Reacondicionados
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Usado", "Reacondicionado", "Caja Abierta"]
  },

  estado_cosmetico: {
    tipo: "texto",
    requerido: true,
    opciones: ["Como nuevo (A+)", "Excelente (A)", "Muy bueno (B)", "Bueno (C)", "Para partes (D)"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Apple", "Samsung", "Xiaomi", "Redmi", "POCO", "Honor", "Infinix", "Tecno", "Motorola", "Otra"]
  },

  modelo: {
    tipo: "texto",
    dinamico: true,
    fuente: "electronica/celulares/{marca}/variantes.js"
  },

  bateria: {
    tipo: "texto",
    opciones: ["100%", "95-99%", "90-94%", "85-89%", "80-84%", "Menor 80%"]
  },

  accesorios_incluidos: {
    tipo: "texto",
    opciones: ["Caja original completa", "Solo cargador", "Solo equipo"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Blanco", "Azul", "Rojo", "Verde", "Dorado", "Morado"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
