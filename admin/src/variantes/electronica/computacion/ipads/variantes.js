/**
 * VARIANTES - Electrónica > Computación > iPads
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

    "iPad 10 10.9 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Azul", "Rosa", "Plateado", "Amarillo"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "256 GB"] },
    },

    "iPad Mini 6 8.3 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Gris espacial", "Rosa", "Morado", "Blanco estelar"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["64 GB", "256 GB"] },
    },

    "iPad Mini 7 8.3 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Blanco estelar", "Azul", "Violeta"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB"] },
    },

    "iPad Air M2 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Azul", "Morado", "Blanco estelar", "Gris espacial"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPad Air M2 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Azul", "Morado", "Blanco estelar", "Gris espacial"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    },

    "iPad Pro M4 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "iPad Pro M4 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro espacial", "Plata"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+Cellular"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "iPad Pro M5 11 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plateado"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

    "iPad Pro M5 13 pulgadas": {
      colores: { tipo: "imagen", opciones: ["Negro Espacial", "Plateado"] },
      conectividad: { tipo: "texto", opciones: ["Wi-Fi", "Wi-Fi+5G"] },
      almacenamiento: { tipo: "texto", opciones: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    },

  }

}; // fin variantes

export function getAtributos() { return variantes; }
export function getVariantesModelo(nombre) { return variantes.modelos[nombre] ?? null; }
export function getListaModelos() { return Object.keys(variantes.modelos); }
