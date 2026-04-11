/**
 * VARIANTES - Electrónica > Celulares > Honor
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },

  modelos: {

    "Honor X8b": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Esmeralda", "Morado"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "Honor X8c": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Violeta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "Honor X8d": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Jade", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor X9b": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul Titán", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor X9c": {
      colores: { tipo: "imagen", opciones: ["Negro Titán", "Plata Titán"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor X9d": {
      colores: { tipo: "imagen", opciones: ["Negro Titán", "Verde Titán", "Plata Titán"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor X70": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor 200 Lite": {
      colores: { tipo: "imagen", opciones: ["Negro"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Honor 200": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Esmeralda", "Plata"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor 200 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Morado"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Honor 300": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor 300 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul", "Verde Pino"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor 400 Lite": {
      colores: { tipo: "imagen", opciones: ["Verde Marrs", "Gris Terciopelo", "Negro"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Honor 400": {
      colores: { tipo: "imagen", opciones: ["Negro Medianoche", "Plata", "Gris Lunar", "Verde Menta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor 400 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro Medianoche", "Gris Lunar", "Verde Abeto"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor Magic6 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Esmeralda", "Gris"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Honor Magic7 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Brisa", "Plata", "Verde"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Porsche Design Honor Magic7 RSR": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB"] },
    },

    "Honor Magic8 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Verde", "Azul Océano"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Honor Magic8 Pro Air": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Verde"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Honor Magic V3": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Naranja", "Marrón"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Honor Magic V5": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
