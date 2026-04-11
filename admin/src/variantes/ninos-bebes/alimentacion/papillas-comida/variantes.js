/**
 * VARIANTES - Bebés > Alimentación > Papillas y Comida
 * Ruta: admin/src/variantes/bebes/alimentacion/papillas-comida/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
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
    opciones: [
      "Papilla / Puré en frasco (listo para consumir)",
      "Papilla en sobre / pouch",
      "Cereal infantil en polvo",
      "Leche de fórmula etapa 1 (0–6 meses)",
      "Leche de fórmula etapa 2 (6–12 meses)",
      "Leche de fórmula etapa 3 (1–3 años)",
      "Leche de fórmula etapa 4 (3+ años)",
      "Snack / Galleta infantil",
      "Agua para bebés",
      "Jugo 100% natural sin azúcar",
      "Alimento orgánico",
      "Mix / Variety pack (varios sabores)"
    ]
  },

  edad_recomendada: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "A partir de 4 meses",
      "A partir de 6 meses",
      "A partir de 8 meses",
      "A partir de 10 meses",
      "A partir de 12 meses",
      "1–3 años",
      "3+ años"
    ]
  },

  sabor_variedad: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del sabor / variedad del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Manzana + pera", "Banana + avena", "Zanahoria + batata", "Espinaca + manzana",
      "Durazno + mango", "Pera + ciruela", "Multi-cereal", "Vainilla", "Sin sabor (neutro)",
      "Pack variado / surtido"
    ]
  },

  volumen_g: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "50 g", "80 g", "100 g", "113 g / 4 oz", "125 g",
      "160 g", "200 g", "400 g", "800 g", "900 g (fórmula)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Gerber (Nestlé)",
      "Beech-Nut Organics",
      "Happy Baby / Happy Tot",
      "Earth's Best Organic",
      "Similac (fórmula)",
      "Enfamil (fórmula)",
      "NAN (Nestlé)",
      "Nutrilon / Aptamil",
      "Heinz Baby (papillas)",
      "Ella's Kitchen",
      "Sprout Organics",
      "Genérico"
    ]
  },

  organico: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Convencional",
      "Orgánico certificado",
      "Sin gluten",
      "Sin lactosa",
      "Vegano"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
