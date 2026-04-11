/**
 * VARIANTES - Belleza y Salud > Salud > Vitaminas y Suplementos
 * Ruta: admin/src/variantes/belleza/salud/vitaminas-suplementos/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estilo es esencial para decidir.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 *
 * Nota belleza: los tonos de maquillaje y colores de producto se manejan
 *               con tipo:"imagen" para que el cliente vea el tono real.
 *               Cada variante de tono requiere foto subida por el vendedor.
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
    opciones: ["Multivitamínico", "Vitamina C", "Vitamina D / D3", "Vitamina B12 / Complejo B", "Omega 3 / Aceite de pescado", "Hierro", "Calcio + Vitamina D", "Zinc", "Magnesio", "Colágeno", "Probióticos", "Proteína en polvo (suplemento)", "Creatina", "Pre-workout", "Melatonina (sueño)", "Biotina (cabello y uñas)"]
  },

  formato: {
    tipo: "imagen",
    guia_vendedor: ["Cápsulas", "Tabletas", "Gomitas", "Polvo", "Líquido"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["30 unidades (1 mes)", "60 unidades (2 meses)", "90 unidades (3 meses)", "120 unidades (4 meses)", "180+ unidades (6+ meses)"]
  },

  para_quien: {
    tipo: "texto",
    opciones: ["Adultos general", "Mujeres", "Hombres", "Niños", "Adultos mayores (50+)", "Embarazo / Prenatal", "Deportistas / Fitness"]
  },

  certificacion: {
    tipo: "texto",
    opciones: ["Sin certificación especial", "Libre de gluten", "Vegano / Plant-based", "Orgánico / Organic", "Non-GMO", "GMP Certified"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
