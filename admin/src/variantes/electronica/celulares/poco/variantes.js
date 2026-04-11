/**
 * VARIANTES - Electrónica > Celulares > POCO
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

    "POCO C65": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde Claro"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "POCO C71": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro", "Verde"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "POCO C75": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Dorado"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "POCO C75 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Violeta Claro"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "POCO M6 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO M7 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Dorado"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "POCO M7 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "POCO M7 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Plata"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "POCO X6 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO X6 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Amarillo", "Gris"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO X7 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO X7 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Amarillo", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO F6 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Verde"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO F6 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "POCO F7 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "POCO F7 Ultra 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "POCO F8 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
