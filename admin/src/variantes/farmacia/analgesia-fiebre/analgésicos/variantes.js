/**
 * VARIANTES - Farmacia > Analgesia y Fiebre > Analgésicos
 * Ruta: admin/src/variantes/farmacia/analgesia-fiebre/analgésicos/variantes.js
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

  principio_activo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Paracetamol / Acetaminofén", "Ibuprofeno", "Ácido acetilsalicílico (aspirina)",
               "Naproxeno sódico", "Dipirona / Metamizol", "Paracetamol + cafeína",
               "Paracetamol + codeína (OTC donde aplica)", "Ketorolaco (tópico OTC)", "Combinados (ver descripción)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido / Tableta", "Comprimido recubierto", "Comprimido efervescente",
               "Cápsula", "Jarabe / Solución oral", "Gotas orales pediátricas",
               "Supositorio", "Gel / Crema tópica", "Parche transdérmico", "Spray bucal"]
  },

  dosis_mg: {
    tipo: "texto",
    opciones: ["80 mg (pediátrico)", "100 mg", "200 mg", "250 mg (pediátrico)", "300 mg",
               "400 mg", "500 mg", "600 mg", "800 mg", "1000 mg", "Ver descripción (combinado)"]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["4 unidades", "8 unidades", "10 unidades", "12 unidades", "16 unidades",
               "20 unidades", "24 unidades", "30 unidades", "40 unidades", "50 unidades",
               "100 unidades", "Frasco 60 ml", "Frasco 100 ml", "Frasco 120 ml", "Frasco 150 ml"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["Bebé (desde 3 meses)", "Niño (2–11 años)", "Adolescente (12–17 años)",
               "Adulto (18+ años)", "Adulto mayor (60+ años)", "Adultos y niños (ver dosis)"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Comprimido blanco (ver caja)", "Efervescente (ver tubo)",
      "Jarabe fresa (ver frasco)", "Jarabe naranja (ver frasco)",
      "Jarabe frambuesa (ver frasco)", "Gotas pediátricas (ver frasco)",
      "Gel tópico (ver tubo)", "Supositorio (ver caja)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Panadol (GSK)", "Advil (Pfizer)", "Aspirina (Bayer)", "Aleve / Naproxeno (Bayer)",
               "Nurofen (Reckitt)", "Ibuprofeno genérico", "Tempra / Apiretal (pediátrico)",
               "Dolmed / Kitadol (LATAM)", "Genérico / Marca propia farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
