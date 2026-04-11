/**
 * VARIANTES - Electrónica > Computación > Laptops
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


  marca: {
    tipo: "texto",
    opciones: ["HP", "ASUS", "Dell", "Lenovo", "Acer", "Samsung", "Xiaomi", "Huawei", "MSI", "Razer", "Microsoft"]
  },

  pantalla: {
    tipo: "texto",
    opciones: ["13.3 pulgadas", "13.6 pulgadas", "14 pulgadas", "15.6 pulgadas", "16 pulgadas", "17.3 pulgadas", "18 pulgadas"]
  },

  procesador: {
    tipo: "texto",
    opciones: ["Intel Core i3 12a Gen", "Intel Core i5 12a Gen", "Intel Core i7 12a Gen", "Intel Core i9 12a Gen", "Intel Core i3 13a Gen", "Intel Core i5 13a Gen", "Intel Core i7 13a Gen", "Intel Core i9 13a Gen", "Intel Core i5 14a Gen", "Intel Core i7 14a Gen", "Intel Core i9 14a Gen", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9", "AMD Ryzen 5 5000", "AMD Ryzen 7 5000", "AMD Ryzen 5 7000", "AMD Ryzen 7 7000", "AMD Ryzen 9 7000", "AMD Ryzen 5 8000", "AMD Ryzen 7 8000", "AMD Ryzen 9 8000", "AMD Ryzen 7 9000", "AMD Ryzen 9 9000", "Apple M3", "Apple M4", "Apple M4 Pro", "Snapdragon X Elite", "Snapdragon X Plus"]
  },

  ram: {
    tipo: "texto",
    opciones: ["8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "48 GB", "64 GB"]
  },

  almacenamiento: {
    tipo: "texto",
    opciones: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"]
  },

  gpu_dedicada: {
    tipo: "texto",
    opciones: ["Sin GPU dedicada", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4050", "NVIDIA RTX 4060", "NVIDIA RTX 4070", "NVIDIA RTX 4080", "NVIDIA RTX 4090", "NVIDIA RTX 5060", "NVIDIA RTX 5070", "NVIDIA RTX 5080", "NVIDIA RTX 5090", "AMD RX 6600M", "AMD RX 7600S", "AMD RX 9070XT"]
  },

  color: {
    tipo: "imagen",
    opciones: []
  },

}; // fin variantes

export function getAtributos() { return variantes; }
