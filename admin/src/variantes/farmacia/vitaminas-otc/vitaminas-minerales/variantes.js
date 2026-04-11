/**
 * VARIANTES - Farmacia > Vitaminas OTC > Vitaminas y Minerales
 * Ruta: admin/src/variantes/farmacia/vitaminas-otc/vitaminas-minerales/variantes.js
 *
 * IMPORTANTE: Solo productos OTC (venta libre sin receta).
 * condicion: siempre ["Nuevo"] — nunca Usado / Reacondicionado.
 *
 * Nota: este archivo complementa vitaminas de Belleza y Salud Cat6
 * pero cubre la presentación farmacéutica — ampollas, sobres clínicos,
 * formatos OTC de farmacia con dosis terapéuticas.
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
    opciones: ["Sellado de fabrica", "Fecha vigente"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Vitamina C 500 mg", "Vitamina C 1000 mg efervescente", "Vitamina D3 400 UI (pediátrico)",
               "Vitamina D3 1000 UI", "Vitamina D3 2000 UI", "Vitamina D3 + K2",
               "Vitamina B12 1000 mcg", "Complejo vitamínico B (B1+B6+B12)", "Vitamina B12 inyectable OTC (donde aplica)",
               "Ácido fólico 400 mcg (embarazo)", "Hierro ferroso (anemia leve OTC)",
               "Magnesio 300–400 mg (calambres / sueño)", "Zinc 15–50 mg", "Calcio + Vitamina D",
               "Multivitamínico adulto", "Multivitamínico mujer (con hierro + ácido fólico)",
               "Multivitamínico hombre", "Multivitamínico senior (60+)", "Multivitamínico pediátrico",
               "Vitamina A", "Vitamina E 400 UI"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido", "Comprimido efervescente", "Cápsula blanda (softgel)",
               "Gominola / Gummy", "Jarabe / Solución oral", "Gotas (pediátrico)",
               "Ampolla bebible", "Sobre granulado", "Polvo para disolver", "Spray sublingual"]
  },

  dosis_ui_mg: {
    tipo: "texto",
    opciones: ["200 UI", "400 UI", "500 mg", "800 UI", "1000 UI", "1000 mg", "2000 UI", "5000 UI",
               "Ver descripción (combinado)"]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["7 unidades", "14 unidades", "20 unidades", "28 unidades", "30 unidades",
               "60 unidades", "90 unidades", "100 unidades", "120 unidades", "Frasco 150 ml",
               "Caja 7 ampollas", "Caja 10 ampollas", "Caja 20 ampollas"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Efervescente naranja (ver tubo)", "Efervescente limón (ver tubo)",
      "Efervescente frutos rojos (ver tubo)", "Gominola (ver frasco)",
      "Cápsula softgel (ver frasco)", "Gotas pediátricas (ver frasco)",
      "Ampolla bebible (ver caja)", "Sobre granulado (ver caja)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Redoxon (Vitamina C — Bayer)", "Cebion (Merck)", "Decavit / Centrum (Pfizer)",
               "Supradyn (Bayer)", "Pharmaton", "Vigantol / Vitamina D3 Kern", "Magnesium Diasporal",
               "Tardyferon (hierro)", "Actiferro", "Sambucol (Vitamina C + Zinc)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
