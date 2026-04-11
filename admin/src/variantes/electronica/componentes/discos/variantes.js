/**
 * VARIANTES - Electrónica > Componentes > Discos
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


  tipo_disco: {
    tipo: "texto",
    opciones: ["SSD NVMe M.2 PCIe 4.0", "SSD NVMe M.2 PCIe 5.0", "SSD SATA 2.5 pulgadas", "HDD 3.5 pulgadas Interno", "HDD 2.5 pulgadas Portatil", "SSD Externo USB-C"]
  },

  capacidad: {
    tipo: "texto",
    opciones: ["250 GB", "500 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Samsung", "WD", "Seagate", "Kingston", "Crucial", "Lexar", "Corsair"]
  },

  incluye_disipador: {
    tipo: "texto",
    opciones: ["Sin disipador", "Con disipador incluido"]
  },

  color: {
    tipo: "imagen",
    guia_vendedor: ["Negro", "Plateado", "Azul", "Rojo"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
