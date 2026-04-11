/**
 * VARIANTES - Electrónica > Celulares > Samsung
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

    "Galaxy A05": {
      colores: { tipo: "imagen", opciones: ["Negro", "Plateado", "Verde Claro", "Cobre"] },
      ram: { tipo: "texto", opciones: ["4 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Galaxy A05s": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Verde Agua", "Cobre"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "128 GB"] },
    },

    "Galaxy A15 4G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro", "Azul Marino", "Amarillo Limón", "Verde Agua"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Galaxy A15 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Claro", "Azul Marino"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Galaxy A16 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Verde Agua", "Gris Claro"] },
      ram: { tipo: "texto", opciones: ["4 GB", "6 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB"] },
    },

    "Galaxy A25 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Amarillo", "Azul"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy A26 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Lila", "Verde Agua"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy A35 5G": {
      colores: { tipo: "imagen", opciones: ["Azul Marino", "Lila", "Azul Hielo", "Amarillo Genial"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy A36 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Lila", "Azul Hielo"] },
      ram: { tipo: "texto", opciones: ["6 GB", "8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy A55 5G": {
      colores: { tipo: "imagen", opciones: ["Azul Marino", "Lila", "Azul Hielo", "Amarillo Genial"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy A56 5G": {
      colores: { tipo: "imagen", opciones: ["Negro", "Azul Marino", "Azul Hielo", "Lila"] },
      ram: { tipo: "texto", opciones: ["8 GB", "12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy S24": {
      colores: { tipo: "imagen", opciones: ["Negro Ónix", "Gris Mármol", "Mármol Violeta", "Amarillo Ámbar"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy S24+": {
      colores: { tipo: "imagen", opciones: ["Negro Ónix", "Gris Mármol", "Mármol Violeta", "Amarillo Ámbar"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy S24 Ultra": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Gris", "Titanio Violeta", "Titanio Amarillo"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Galaxy Z Flip5": {
      colores: { tipo: "imagen", opciones: ["Menta", "Grafito", "Crema", "Lavanda"] },
      ram: { tipo: "texto", opciones: ["8 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy Z Fold5": {
      colores: { tipo: "imagen", opciones: ["Crema", "Fantasma Negro", "Azul Glaciar"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Galaxy Z Flip6": {
      colores: { tipo: "imagen", opciones: ["Plata", "Azul", "Amarillo", "Menta"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy Z Fold6": {
      colores: { tipo: "imagen", opciones: ["Plata", "Azul Marino", "Rosa", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Galaxy S25": {
      colores: { tipo: "imagen", opciones: ["Navy", "Azul Hielo", "Menta", "Silver Shadow"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB"] },
    },

    "Galaxy S25+": {
      colores: { tipo: "imagen", opciones: ["Navy", "Azul Hielo", "Menta", "Silver Shadow"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy S25 Ultra": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Plata", "Titanio Blanco Porcelana", "Titanio Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Galaxy S25 Edge": {
      colores: { tipo: "imagen", opciones: ["Titanio Negro", "Titanio Plata", "Azul Hielo"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy Z Flip7": {
      colores: { tipo: "imagen", opciones: ["Silver Shadow", "Navy", "Menta", "Rosa Marino"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy Z Fold7": {
      colores: { tipo: "imagen", opciones: ["Silver Shadow", "Navy", "Azul Hielo"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Galaxy S26": {
      colores: { tipo: "imagen", opciones: ["Negro", "Violeta Cobalto", "Azul Cielo", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy S26+": {
      colores: { tipo: "imagen", opciones: ["Negro", "Violeta Cobalto", "Azul Cielo", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Galaxy S26 Ultra": {
      colores: { tipo: "imagen", opciones: ["Negro", "Violeta Cobalto", "Azul Cielo", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
