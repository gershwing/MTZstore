/**
 * VARIANTES - Electrónica > Componentes > Memorias RAM
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


  generacion: {
    tipo: "texto",
    opciones: ["DDR4", "DDR5", "LPDDR5 (laptop)", "SO-DIMM DDR4", "SO-DIMM DDR5"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["8 GB (1x8)", "16 GB (2x8)", "32 GB (2x16)", "48 GB (2x24)", "64 GB (2x32)", "128 GB (2x64)"]
  },

  velocidad: {
    tipo: "texto",
    opciones: ["DDR4-2666", "DDR4-3200", "DDR4-3600", "DDR5-4800", "DDR5-5600", "DDR5-6000", "DDR5-6400", "DDR5-7200+"]
  },

  latencia: {
    tipo: "texto",
    opciones: ["CL16", "CL18", "CL30", "CL32", "CL36", "CL38"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Corsair Vengeance", "G.Skill Trident/Ripjaws", "Kingston Fury", "Crucial", "Teamgroup T-Force", "ADATA XPG"]
  },

  rgb: {
    tipo: "texto",
    opciones: ["Sin RGB", "Con RGB sincronizable"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Negro / Rojo", "Negro / RGB", "Blanco"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
