/**
 * VARIANTES - Farmacia > Analgesia y Fiebre > Antiinflamatorios
 * Ruta: admin/src/variantes/farmacia/analgesia-fiebre/antiinflamatorios/variantes.js
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
    opciones: ["Antiinflamatorio oral (AINE)", "Antiinflamatorio tópico (gel / crema)",
               "Antiinflamatorio tópico (parche / emplasto)", "Spray antiinflamatorio tópico",
               "Antiinflamatorio + analgésico combinado", "Antiinflamatorio natural / fitoterapia (árnica / cúrcuma)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Ibuprofeno", "Diclofenaco (tópico OTC)", "Ketoprofeno (tópico OTC)",
               "Naproxeno", "Piroxicam (tópico)", "Indometacina (tópico)",
               "Árnica (homeopático / fitoterapia)", "Cúrcuma + piperina (suplemento)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido / Tableta", "Cápsula blanda", "Gel tópico", "Crema tópica",
               "Spray tópico", "Parche / Emplasto frío-calor", "Solución oral", "Sobres granulados"]
  },

  dosis_mg: {
    tipo: "texto",
    opciones: ["50 mg", "75 mg", "100 mg", "200 mg", "400 mg", "500 mg", "600 mg", "800 mg",
               "1%", "1.5%", "2%", "2.5% (gel tópico — concentración)"]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["10 g / ml", "20 g", "30 g", "50 g", "60 g / ml", "100 g / ml",
               "8 unidades", "10 unidades", "20 unidades", "30 unidades"]
  },

  color_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Gel transparente (ver tubo)", "Crema blanca (ver tubo)",
      "Spray (ver envase)", "Parche frío (ver caja — azul)",
      "Parche calor (ver caja — rojo / naranja)", "Comprimido (ver caja)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Voltaren (Novartis — diclofenaco tópico)", "Fastum Gel (ketoprofeno)",
               "Nurofen Forte Gel", "Dolocyl / Dolgit (ibuprofeno gel)", "Traumeel (árnica)",
               "Arnicare Gel (Boiron)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
