/**
 * VARIANTES - Electrónica > Accesorios Celulares > Protectores
 *
 * tipo: "imagen" → selector con foto del producto (estilo AliExpress)
 * tipo: "texto"  → selector de chips / botones de texto
 */

export const MODELOS_COMPATIBLES = ["iPhone SE 2022", "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16 E", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max", "Galaxy A05", "Galaxy A05s", "Galaxy A15 4G", "Galaxy A15 5G", "Galaxy A16 5G", "Galaxy A25 5G", "Galaxy A26 5G", "Galaxy A35 5G", "Galaxy A36 5G", "Galaxy A55 5G", "Galaxy A56 5G", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy Z Flip5", "Galaxy Z Fold5", "Galaxy Z Flip6", "Galaxy Z Fold6", "Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 Edge", "Galaxy Z Flip7", "Galaxy Z Fold7", "Galaxy S26", "Galaxy S26+", "Galaxy S26 Ultra", "Xiaomi 14", "Xiaomi 14 Ultra", "Xiaomi 14T", "Xiaomi 14T Pro", "Xiaomi MIX Flip", "Xiaomi MIX Fold 4", "Xiaomi 15", "Xiaomi 15 Ultra", "Xiaomi 15T", "Xiaomi 15T Pro", "Xiaomi MIX Flip 2", "Redmi A3", "Redmi 13C", "Redmi 14C", "Redmi A4 5G", "Redmi Note 13 4G", "Redmi Note 13 5G", "Redmi Note 13 Pro 4G", "Redmi Note 13 Pro 5G", "Redmi Note 13 Pro+ 5G", "Redmi A5", "Redmi 13x", "Redmi 15C", "Redmi Note 14 4G", "Redmi Note 14 5G", "Redmi Note 14 Pro 4G", "Redmi Note 14 Pro 5G", "Redmi Note 14 Pro+ 5G", "Redmi Note 15 5G", "Redmi Note 15 Pro 5G", "Redmi Note 15 Pro+ 5G", "Redmi Turbo 4 Pro", "POCO C65", "POCO C71", "POCO C75", "POCO C75 5G", "POCO M6 Pro 5G", "POCO M7 4G", "POCO M7 5G", "POCO M7 Pro 5G", "POCO X6 5G", "POCO X6 Pro 5G", "POCO X7 5G", "POCO X7 Pro 5G", "POCO F6 5G", "POCO F6 Pro 5G", "POCO F7 5G", "POCO F7 Ultra 5G", "POCO F8 Pro 5G", "Honor X8b", "Honor X8c", "Honor X8d", "Honor X9b", "Honor X9c", "Honor X9d", "Honor X70", "Honor 200 Lite", "Honor 200", "Honor 200 Pro", "Honor 300", "Honor 300 Pro", "Honor 400 Lite", "Honor 400", "Honor 400 Pro", "Honor Magic6 Pro", "Honor Magic7 Pro", "Porsche Design Honor Magic7 RSR", "Honor Magic8 Pro", "Honor Magic8 Pro Air", "Honor Magic V3", "Honor Magic V5", "Infinix Smart 8 HD", "Infinix Smart 8", "Infinix Smart 8 Pro", "Infinix Smart 9", "Infinix Smart 10 HD", "Infinix Smart 10", "Infinix Smart 10 Plus", "Infinix Hot 40i", "Infinix Hot 40", "Infinix Hot 40 Pro", "Infinix Hot 50i", "Infinix Hot 50 4G", "Infinix Hot 50", "Infinix Hot 50 Pro 4G", "Infinix Hot 60i 5G", "Infinix Hot 60 4G", "Infinix Hot 60 5G", "Infinix Hot 60 Pro", "Infinix Hot 60 Pro+", "Infinix Note 40 4G", "Infinix Note 40 Pro 4G", "Infinix Note 40 Pro+ 4G", "Infinix Note 40 5G", "Infinix Note 40 Pro 5G", "Infinix Note 50 4G", "Infinix Note 50 Pro 4G", "Infinix Note 50 Pro+ 4G", "Infinix Note 50s 5G+", "Infinix Zero 40 4G", "Infinix Zero 40 5G", "Infinix Zero Flip", "Infinix GT 20 Pro 5G", "Infinix GT 30 Pro 5G", "Infinix Note Edge", "Tecno Spark 20C", "Tecno Spark 20", "Tecno Spark 20 Pro", "Tecno Spark 20 Pro+", "Tecno Spark Go 2024", "Tecno Spark Go 1", "Tecno Spark Go 1S", "Tecno Spark 30C", "Tecno Spark 30", "Tecno Spark 30 Pro", "Tecno Spark 40C", "Tecno Spark 40 4G", "Tecno Spark 40 Pro", "Tecno Spark 40 Pro+", "Tecno Camon 30", "Tecno Camon 30 5G", "Tecno Camon 30 Pro 5G", "Tecno Camon 30 Premier 5G", "Tecno Camon 30S", "Tecno Camon 30S Pro", "Tecno Camon 40 4G", "Tecno Camon 40 Pro 4G", "Tecno Camon 40 Pro 5G", "Tecno Camon 40 Premier 5G", "Tecno Pova 6 Neo", "Tecno Pova 6", "Tecno Pova 6 Pro 5G", "Tecno Pova 6 Neo 5G", "Tecno Pova 7 4G", "Tecno Pova 7 5G", "Tecno Pova 7 Pro 5G", "Tecno Pova 7 Ultra 5G", "Tecno Pova Curve 2 5G", "Tecno Pop 9 4G", "Tecno Pop 9 5G", "Tecno Phantom V Flip2 5G", "Tecno Phantom V Fold2 5G", "Moto G04", "Moto G04s", "Moto G05", "Moto G06", "Moto G06 Power", "Moto G15", "Moto G24", "Moto G24 Power", "Moto G35 5G", "Moto G45 5G", "Moto G55 5G", "Moto G56 5G", "Moto G57 5G", "Moto G57 Power 5G", "Moto G64 5G", "Moto G67 5G", "Moto G67 Power 5G", "Moto G75 5G", "Moto G85 5G", "Moto G86 5G", "Moto G86 Power 5G", "Moto G96 5G", "Motorola Edge 50 Fusion", "Motorola Edge 50", "Motorola Edge 50 Pro", "Motorola Edge 50 Ultra", "Motorola Edge 50 Neo", "Motorola Edge 60 Fusion", "Motorola Edge 60 Stylus", "Motorola Edge 60", "Motorola Edge 60 Pro", "Motorola Razr 2024", "Motorola Razr Plus 2024", "Motorola Razr 2025", "Motorola Razr Plus 2025", "Motorola Razr Ultra 2025"];

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo", "Usado", "Reacondicionado", "Caja Abierta"]
  },

  modelo_compatible: {
    tipo: "texto",
    requerido: true,
    opciones: MODELOS_COMPATIBLES
  },

  tipo_protector: {
    tipo: "imagen",
    guia_vendedor: ["Vidrio templado transparente", "Vidrio templado mate", "Vidrio privacidad", "Hidrogel flexible", "Protector cámara"]
  },

  pack: {
    tipo: "texto",
    opciones: ["1 unidad", "2 unidades", "3 unidades", "Pack 5 unidades"]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
