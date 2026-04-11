/**
 * VARIANTES - Farmacia > Primeros Auxilios > Botiquín
 * Ruta: admin/src/variantes/farmacia/primeros-auxilios/botiquín/variantes.js
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
    opciones: ["Botiquín completo (caja + contenido)", "Botiquín básico hogar (10–15 artículos)",
               "Botiquín de auto / emergencias vial", "Botiquín deportivo", "Botiquín de viaje (compacto)",
               "Botiquín de montaña / trekking", "Botiquín laboral / empresarial",
               "Bolsa / Mochila de primeros auxilios (solo contenedor)",
               "Caja / Maletín vacío para armar botiquín",
               "Termómetro digital (accesorio botiquín)", "Tijeras de primeros auxilios", "Pinzas"]
  },

  contenido_incluye: {
    tipo: "texto",
    opciones: ["Curitas / Apósitos adhesivos", "Gasas estériles", "Vendas elásticas",
               "Esparadrapo / Micropore", "Antiséptico (povidona / clorhexidina)",
               "Analgésico / Antifebril", "Guantes de látex / nitrilo",
               "Termómetro digital", "Tijeras + pinzas", "Manta de emergencia",
               "RCP / Mascarilla de reanimación", "Manual de primeros auxilios"]
  },

  numero_artículos: {
    tipo: "texto",
    opciones: ["5–10 artículos", "10–20 artículos", "20–30 artículos", "30–50 artículos", "50+ artículos"]
  },

  color_caja: {
    tipo: "imagen",
    nota: "El vendedor sube foto real del botiquín. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Caja rígida roja (estándar)", "Caja rígida blanca", "Caja metálica",
      "Bolsa / Mochila roja", "Bolsa compacta de viaje (ver foto)",
      "Botiquín auto (ver foto)", "Maletín profesional (ver foto)"
    ]
  },

  certificacion: {
    tipo: "texto",
    opciones: ["Sin certificación específica", "CE (Europa)", "ISO 13485", "OSHA (laboral USA)",
               "Norma ISO 8317 (primeros auxilios)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Hartmann (botiquines profesionales)", "MedLine", "Precision Medical",
               "Lifeline First Aid", "Honeywell Safety", "Kit de Primeros Auxilios genérico (LATAM)", "Genérico"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
