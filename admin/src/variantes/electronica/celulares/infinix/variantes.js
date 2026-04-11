/**
 * VARIANTES - Electrónica > Celulares > Infinix
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

    "Infinix Smart 8 HD": {
      colores: { tipo: "imagen", opciones: ["Negro", "Dorado", "Verde", "Blanco"] },
      ram: { tipo: "texto", opciones: ["2 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB"] },
    },

    "Infinix Smart 8": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Dorado"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Infinix Smart 8 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Azul", "Blanco"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB", "256 GB"] },
    },

    "Infinix Smart 9": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Cielo", "Dorado", "Verde"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Infinix Smart 10 HD": {
      colores: { tipo: "imagen", opciones: ["Negro", "Dorado", "Verde Cristal", "Blanco Galaxia"] },
      ram: { tipo: "texto", opciones: ["2 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB"] },
    },

    "Infinix Smart 10": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata Titanio", "Azul Iris", "Dorado Crepúsculo"] },
      ram: { tipo: "texto", opciones: ["3 GB", "4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB", "256 GB"] },
    },

    "Infinix Smart 10 Plus": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Verde", "Dorado"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 40i": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Dorado"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 40": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Oro", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 40 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Violeta"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 50i": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Verde", "Dorado"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 50 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Dorado", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 50": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Dorado"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 50 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Gris", "Dorado"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Hot 60i 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Verde", "Azul"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Infinix Hot 60 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Dorado", "Plata"] },
      ram: { tipo: "texto", opciones: ["4 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 60 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 60 Pro": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Jade", "Plata", "Naranja"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Infinix Hot 60 Pro+": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Pino", "Plata", "Azul Neón"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 40 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Jade", "Violeta", "Dorado"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 40 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 40 Pro+ 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 40 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Infinix Note 40 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Infinix Note 50 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 50 Pro 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Naranja"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 50 Pro+ 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul", "Verde Cuero", "Plata"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note 50s 5G+": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde Cuero Aromático", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Zero 40 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Infinix Zero 40 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Verde", "Plata", "Azul Menta"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Infinix Zero Flip": {
      colores: { tipo: "imagen", opciones: ["Negro", "Oro Rosa", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB"] },
    },

    "Infinix GT 20 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro Estelar", "Azul Cibernético", "Verde"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix GT 30 Pro 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Cibernético", "Verde Neón"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB"] },
    },

    "Infinix Note Edge": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plata", "Azul Medianoche"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
