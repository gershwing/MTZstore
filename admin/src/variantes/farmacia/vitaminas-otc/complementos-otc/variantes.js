/**
 * VARIANTES - Farmacia > Vitaminas OTC > Complementos OTC
 * Ruta: admin/src/variantes/farmacia/vitaminas-otc/complementos-otc/variantes.js
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
    opciones: ["Sellado de fabrica", "Fecha vigente"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Melatonina 0.5–5 mg (sueño OTC)", "Valeriana (sueño / ansiedad leve OTC)",
               "Pasiflora + valeriana (sueño natural)", "Magnesio + B6 (estrés / sueño)",
               "Triptófano (sueño / ánimo OTC)", "Ginkgo biloba (memoria / circulación)",
               "Ginseng (energía / fatiga)", "Equinácea (inmunidad / resfriado)", "Propóleo + vitamina C",
               "Glucosamina + condroitín (articulaciones)", "Colágeno hidrolizado OTC",
               "Omega-3 EPA+DHA (cardiovascular)", "Lecitina de soja", "Ajo (cardiovascular / colesterol)",
               "Alcachofa + cardo mariano (hígado)", "Drenante / Diurético herbal (cola de caballo + abedul)",
               "Levadura de cerveza (piel / uñas / pelo)", "Antioxidante (coenzima Q10 + vitaminas)",
               "Probiótico + prebiótico (inmunidad / digestión)", "L-carnitina (energía / metabolismo)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Cápsula", "Comprimido", "Gominola / Gummy", "Sobre granulado", "Ampolla bebible",
               "Solución oral / Jarabe", "Infusión / Té medicinal", "Extracto líquido (gotas)"]
  },

  dosis: {
    tipo: "texto",
    opciones: ["0.5 mg (melatonina)", "1 mg", "1.9 mg (melatonina)", "5 mg", "10 mg", "100 mg", "200 mg", "300 mg",
               "500 mg", "1000 mg", "1500 mg", "Ver descripción"]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["10 unidades", "14 unidades", "20 unidades", "28 unidades", "30 unidades",
               "45 unidades", "60 unidades", "90 unidades", "100 unidades"]
  },

  presentacion_imagen: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Cápsula (ver frasco)", "Gominola (ver frasco)", "Ampolla bebible (ver caja)",
      "Sobre granulado (ver caja)", "Solución oral (ver frasco)",
      "Infusión / Té (ver caja)", "Gotas extracto (ver frasco)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Jamieson Melatonin", "Circadin (melatonina retard OTC)", "Dormidina (doxilamina — OTC sueño)",
               "Sedorelax (valeriana)", "Gincosan (ginkgo + ginseng)", "Pharmaton Vitality",
               "Arkocápsulas / Arkofluidos (fitoterapia)", "Omega-3 genérico / Laboratorio ISDIN",
               "Solgar / Vitaminstore", "Nature's Bounty", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
