/**
 * VARIANTES - Farmacia > Primeros Auxilios > Ortopedia
 * Ruta: admin/src/variantes/farmacia/primeros-auxilios/ortopedia/variantes.js
 *
 * IMPORTANTE: Solo productos OTC (venta libre sin receta).
 * condicion: siempre ["Nuevo"] — nunca Usado / Reacondicionado.
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar solo en: sabores de jarabes, colores de vendas,
 *                  presentaciones con packaging visualmente distinto.
 * tipo: "texto"  → predominante en farmacia: dosis, forma farmacéutica,
 *                  principio activo, cantidad, rango de edad.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tobillera elástica / de compresión", "Rodillera elástica", "Muñequera elástica",
               "Codiera / Epicondilera", "Faja lumbar (dolor de espalda)", "Faja abdominal postoperatoria",
               "Collarín cervical blando", "Collarín cervical rígido", "Cabestrillo / Inmovilizador brazo",
               "Plantillas ortopédicas (pie plano / fascitis)", "Calcetín de compresión (varices)",
               "Media de compresión hasta rodilla", "Media de compresión muslo completo",
               "Férula / Inmovilizador de muñeca", "Muletas (par)", "Bastón / Andador",
               "Almohada cervical ortopédica", "Cojín coccígeo (tailbone)", "Reposapiés ergonómico"]
  },

  talla: {
    tipo: "texto",
    opciones: ["XS", "S", "M", "L", "XL", "XXL", "Talla única ajustable", "34–36 (medias compresión)",
               "38–40", "42–44", "46–48"]
  },

  nivel_compresion: {
    tipo: "texto",
    opciones: ["No aplica", "Ligera (8–15 mmHg)", "Moderada (15–20 mmHg)",
               "Firme (20–30 mmHg — requiere orientación médica)", "Clase I (18–21 mmHg)", "Clase II (23–32 mmHg)"]
  },

  color_producto: {
    tipo: "imagen",
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro (estándar)", "Beige / Skin color", "Gris", "Azul marino",
      "Blanco", "Negro + velcro (inmovilizador)", "Beige (collarín)",
      "Rojo + negro (faja lumbar)", "Multicolor compresión (ver foto)"
    ]
  },

  lado: {
    tipo: "texto",
    opciones: ["Sin distinción (bilateral)", "Lado derecho", "Lado izquierdo", "Par (derecho + izquierdo)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Futuro (3M)", "Thuasne", "Orliman", "Oppo Medical", "Donjoy", "Vulkan",
               "Sigvaris (compresión)", "Jobst (compresión)", "Dr. Scholl's (plantillas)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
