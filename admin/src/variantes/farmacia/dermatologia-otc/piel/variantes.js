/**
 * VARIANTES - Farmacia > Dermatología OTC > Piel
 * Ruta: admin/src/variantes/farmacia/dermatologia-otc/piel/variantes.js
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
    opciones: ["Crema / Pomada para eczema (OTC)", "Crema para dermatitis de contacto",
               "Crema con hidrocortisona 0.5%–1% OTC", "Crema antifúngica OTC (pie de atleta / candida)",
               "Crema antibacteriana OTC", "Crema para psoriasis leve OTC", "Tratamiento acné OTC (peróxido benzoílo / adapaleno OTC)",
               "Solución / Gel para acné", "Crema para manchas / hiperpigmentación (sin receta)",
               "Crema para estrías", "Crema cicatrizante", "Crema anticelulítica", "Repelente de insectos",
               "Tratamiento pediculosis (piojos)", "Crema antipiojos / loción", "Tratamiento sarna OTC (donde aplica)",
               "Verrugas OTC (ácido salicílico / criocirugía en frío)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Hidrocortisona 0.5%", "Hidrocortisona 1%", "Clotrimazol 1% (antifúngico)",
               "Miconazol (antifúngico)", "Terbinafina 1% (antifúngico)", "Peróxido de benzoílo 2.5%–5%",
               "Adapaleno 0.1% (OTC en algunos países)", "Ácido salicílico", "Ácido azelaico",
               "Niacinamida", "Pantenol / Dexapantenol", "Urea 5%–10%", "DEET (repelente)",
               "Permetrina 1% (piojos)", "Permetrina 5% (sarna OTC donde aplica)", "Dimeticona (piojos)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Crema", "Pomada", "Gel", "Loción", "Spray", "Champú / Loción capilar (piojos)",
               "Solución líquida", "Parche (verruga)"]
  },

  cantidad_presentacion: {
    tipo: "texto",
    opciones: ["15 g", "20 g", "30 g", "50 g", "60 g", "100 g", "150 g / ml", "250 ml", "Spray 50 ml", "Spray 100 ml"]
  },

  color_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Crema / tubo (ver foto)", "Gel (ver tubo)", "Spray (ver envase)",
      "Loción (ver frasco)", "Champú piojos (ver frasco)", "Kit completo (ver caja)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Canesten (Bayer — clotrimazol)", "Lamisil AT (terbinafina)", "Cortaid / Dermacort (hidrocortisona)",
               "Benzac / Brevoxyl (benzoílo)", "Differin OTC (adapaleno)", "Bepanthen (pantenol)",
               "Eucerin Urea (hidratación)", "ISDIN Ureadin (urea)", "Autan / Repel (repelente)",
               "Lyclear / Nix (permetrina piojos)", "Full Marks (dimeticona piojos)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
