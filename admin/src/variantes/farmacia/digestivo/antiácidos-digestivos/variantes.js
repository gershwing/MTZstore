/**
 * VARIANTES - Farmacia > Digestivo > Antiácidos y Digestivos
 * Ruta: admin/src/variantes/farmacia/digestivo/antiácidos-digestivos/variantes.js
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
    opciones: ["Antiácido (neutralizante)", "Inhibidor bomba protones OTC (omeprazol / pantoprazol)",
               "Antiácido + alginato (reflujo)", "Antiespumante (flatulencia / gases)",
               "Enzimas digestivas (digestión pesada)", "Probiótico digestivo OTC",
               "Antiespasmódico (cólicos / espasmos)", "Antiemético OTC (náuseas / vómitos)",
               "Protector gástrico", "Digestivo natural (alcachofa / jengibre / menta)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Omeprazol 20 mg (IBP OTC)", "Pantoprazol 20 mg (IBP OTC)", "Famotidina (H2)",
               "Hidróxido de aluminio + magnesio", "Carbonato de calcio", "Bicarbonato de sodio",
               "Alginato de sodio (Gaviscon)", "Simeticona (gases)", "Dimeticona",
               "Domperidona OTC (donde aplica)", "Metoclopramida OTC", "Extracto de alcachofa",
               "Lactasa (intolerancia lactosa)", "Alfa-galactosidasa (legumbres / gases)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido masticable", "Comprimido deglutible", "Cápsula", "Sobre",
               "Solución oral / Suspensión (frasco)", "Gel oral", "Polvo efervescente",
               "Pastilla de chupar"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Comprimido masticable (menta / ver caja)", "Comprimido masticable (frutas / ver caja)",
      "Suspensión (ver frasco)", "Sobres (ver caja)", "Cápsula (ver caja)",
      "Gel oral (ver tubo)", "Efervescente (ver tubo)"
    ]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["14 unidades", "20 unidades", "28 unidades", "30 unidades", "40 unidades",
               "Frasco 150 ml", "Frasco 200 ml", "Frasco 250 ml", "Caja 10 sobres", "Caja 20 sobres"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Omeprazol genérico / MK", "Pantozol OTC / Pantoprazol genérico", "Gaviscon (Reckitt)",
               "Mylanta / Maalox (antiácido)", "Rennie (carbonato de calcio)", "Gas-X / Baros (simeticona)",
               "Nexium Control OTC (esomeprazol)", "Beano (alfa-galactosidasa)", "Lactaid (lactasa)",
               "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
