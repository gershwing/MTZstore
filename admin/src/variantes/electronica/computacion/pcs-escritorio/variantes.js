/**
 * VARIANTES - Electrónica > Computación > PCs de Escritorio
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


  tipo: {
    tipo: "texto",
    opciones: ["Torre ATX", "Torre mATX", "Mini PC", "All-in-One", "Torre gaming"]
  },

  procesador: {
    tipo: "texto",
    opciones: ["Intel Core i3 12a Gen", "Intel Core i5 12a Gen", "Intel Core i7 12a Gen", "Intel Core i9 12a Gen", "Intel Core i3 13a Gen", "Intel Core i5 13a Gen", "Intel Core i7 13a Gen", "Intel Core i9 13a Gen", "Intel Core i5 14a Gen", "Intel Core i7 14a Gen", "Intel Core i9 14a Gen", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9", "AMD Ryzen 5 5000", "AMD Ryzen 7 5000", "AMD Ryzen 9 5000", "AMD Ryzen 5 7000", "AMD Ryzen 7 7000", "AMD Ryzen 9 7000", "AMD Ryzen 5 9000", "AMD Ryzen 7 9000", "AMD Ryzen 9 9000"]
  },

  ram: {
    tipo: "texto",
    opciones: ["8 GB DDR4", "16 GB DDR4", "32 GB DDR4", "16 GB DDR5", "32 GB DDR5", "64 GB DDR5"]
  },

  almacenamiento_primario: {
    tipo: "texto",
    opciones: ["256 GB SSD NVMe", "512 GB SSD NVMe", "1 TB SSD NVMe", "2 TB SSD NVMe"]
  },

  almacenamiento_secundario: {
    tipo: "texto",
    opciones: ["Sin HDD adicional", "1 TB HDD", "2 TB HDD", "4 TB HDD"]
  },

  gpu: {
    tipo: "texto",
    opciones: ["Integrada", "NVIDIA RTX 3060", "NVIDIA RTX 3070", "NVIDIA RTX 3080", "NVIDIA RTX 3090", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "NVIDIA RTX 4090", "NVIDIA RTX 5070", "NVIDIA RTX 5080", "NVIDIA RTX 5090", "AMD RX 6700 XT", "AMD RX 7600", "AMD RX 7800 XT", "AMD RX 7900 XTX", "AMD RX 9070 XT"]
  },

  fuente_poder: {
    tipo: "texto",
    opciones: ["550W 80+ Bronze", "650W 80+ Gold", "750W 80+ Gold", "850W 80+ Gold", "1000W 80+ Platinum"]
  },

  color_gabinete: {
    tipo: "imagen",
    opciones: ["Negro", "Blanco", "Negro+RGB", "Blanco+RGB"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
