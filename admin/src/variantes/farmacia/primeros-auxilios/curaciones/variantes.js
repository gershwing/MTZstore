/**
 * VARIANTES - Farmacia > Primeros Auxilios > Curaciones
 * Ruta: admin/src/variantes/farmacia/primeros-auxilios/curaciones/variantes.js
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
    opciones: ["Apósito / Curita adhesiva", "Apósito hidrocoloide (heridas húmedas)", "Apósito para quemaduras",
               "Gasa estéril (unidad / caja)", "Venda de gasa", "Venda elástica (crepe)", "Venda cohesiva (self-adhesive)",
               "Esparadrapo / Cinta adhesiva médica", "Micropore / Cinta papel", "Vendaje tubular",
               "Antiséptico líquido (povidona yodada)", "Antiséptico spray (clorhexidina)",
               "Agua oxigenada 10 vol", "Suero fisiológico monodosis (lavado heridas)",
               "Crema antibiótica tópica OTC (neomicina / mupirocina OTC)",
               "Crema cicatrizante (centella asiática / vitamina E)", "Gel para quemaduras (aloe vera + lidocaína)"]
  },

  tamano_medida: {
    tipo: "texto",
    opciones: ["Pequeño (2x3 cm)", "Mediano (5x7 cm)", "Grande (10x10 cm)", "Extralarge (15x20 cm)",
               "Tira larga (1 m)", "2.5 cm x 5 m (venda)", "5 cm x 5 m", "7.5 cm x 5 m",
               "10 cm x 5 m", "Frasco 100 ml", "Frasco 250 ml", "Frasco 500 ml", "Monodosis 10 ml"]
  },

  cantidad_pack: {
    tipo: "texto",
    opciones: ["1 unidad", "5 unidades", "10 unidades", "20 unidades", "50 unidades", "100 unidades",
               "Caja 6 unidades", "Caja 10 unidades", "Caja 50 unidades", "Caja 100 unidades"]
  },

  color_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del producto real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Curita beige / skin color (ver caja)", "Curita transparente (ver caja)",
      "Curita de colores / infantil (ver caja)", "Apósito hidrocoloide (ver caja)",
      "Apósito quemaduras (ver caja)", "Venda blanca (ver rollo)",
      "Venda elástica (ver rollo — varios colores)", "Venda cohesiva (ver colores)",
      "Antiséptico (ver frasco)", "Crema cicatrizante (ver tubo)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Curita / Band-Aid (J&J)", "Urgoplast / Urgo", "Hartmann Cutisoft / Medicomp",
               "Hansaplast / Elastoplast (Beiersdorf)", "Betadine (povidona yodada — Meda)",
               "Chlorhexol / Clorhexidina genérico", "Bepanthen Cicaplast (cicatrizante)",
               "Compeed (hidrocoloide)", "Flammazine (quemaduras)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
