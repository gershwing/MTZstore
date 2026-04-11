/**
 * VARIANTES - Electrónica > Celulares > Xiaomi
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

    "Xiaomi 14": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Verde Jade", "Morado Jade"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Xiaomi 14 Ultra": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Titanio"] },
      ram: { tipo: "texto", opciones: ["16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi 14T": {
      colores: { tipo: "imagen", opciones: ["Titanio Gris", "Titanio Negro", "Verde Limón"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Xiaomi 14T Pro": {
      colores: { tipo: "imagen", opciones: ["Titanio Gris", "Titanio Negro", "Titanio Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi MIX Flip": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB"] },
    },

    "Xiaomi MIX Fold 4": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Plata"] },
      ram: { tipo: "texto", opciones: ["16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["512 GB", "1 TB"] },
    },

    "Xiaomi 15": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Azul Glaciar"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi 15 Ultra": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Titanio"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi 15T": {
      colores: { tipo: "imagen", opciones: ["Titanio Gris", "Titanio Negro", "Azul Saturno"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

    "Xiaomi 15T Pro": {
      colores: { tipo: "imagen", opciones: ["Titanio Gris", "Titanio Negro", "Titanio Azul"] },
      ram: { tipo: "texto", opciones: ["12 GB", "16 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB"] },
    },

    "Xiaomi MIX Flip 2": {
      colores: { tipo: "imagen", opciones: ["Negro", "Blanco", "Rosa"] },
      ram: { tipo: "texto", opciones: ["12 GB"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
