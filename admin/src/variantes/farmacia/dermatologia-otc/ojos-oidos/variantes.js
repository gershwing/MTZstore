/**
 * VARIANTES - Farmacia > Dermatología OTC > Ojos y Oídos
 * Ruta: admin/src/variantes/farmacia/dermatologia-otc/ojos-oidos/variantes.js
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
    opciones: ["Lágrimas artificiales / Lubricante ocular", "Colirio antihistamínico (ojo alérgico)",
               "Colirio descongestionante ocular (ojo rojo)", "Colirio antiséptico OTC",
               "Ungüento oftálmico lubricante", "Solución limpiadora de lentes de contacto",
               "Estuche / Kit lentes de contacto", "Solución salina ocular (lavado)", "Compresas oculares calientes",
               "Gotas para oído (tapones de cera)", "Gotas para oído (infección externa OTC)",
               "Spray lavado nasal / auricular", "Protectores auditivos (tapones de dormir / ruido)"]
  },

  principio_activo_ojos: {
    tipo: "texto",
    opciones: ["Carboximetilcelulosa (CMC)", "Hialuronato de sodio (ácido hialurónico)",
               "Polivinil alcohol (PVA)", "Carbómero (gel)", "Ketotifeno (antihistamínico)",
               "Olopatadina (antihistamínico)", "Nafazolina + antazolina (descongestionante)",
               "Clorhexidina 0.01% (antiséptico)", "Agua de rosas (natural)"]
  },

  principio_activo_oidos: {
    tipo: "texto",
    opciones: ["Agua oxigenada 3% + glicerina", "Polietilenglicol (ablande tapones)",
               "Aceite de oliva / almendra (tapones naturales)", "Alcohol boricado 3%"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Colirio (frasco multidosis)", "Colirio monodosis (ampollas)", "Gel / Ungüento ocular",
               "Spray ocular", "Gotas para oído", "Solución limpiadora (frasco)", "Compresas estériles"]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["10 monodosis", "20 monodosis", "30 monodosis", "Frasco 10 ml", "Frasco 15 ml", "Frasco 20 ml",
               "Frasco 30 ml", "Frasco 360 ml (limpiador lentes)", "Par tapones (unidad)", "Pack 3 pares", "Caja 10 pares"]
  },

  presentacion_imagen: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Colirio monodosis (ver caja)", "Colirio frasco multidosis (ver frasco)",
      "Gel ocular (ver tubo)", "Gotas oído (ver frasco)",
      "Solución lentes (ver frasco)", "Compresas oculares (ver caja)",
      "Tapones auditivos (ver pack)"
    ]
  },

  marca: {
    tipo: "texto",
    opciones: ["Systane Ultra / Balance (Alcon)", "Refresh Tears / Optive (AbbVie)", "Hylo-Comod (Ursapharm)",
               "Artelac (Bausch + Lomb)", "Zaditen (ketotifeno — Alcon)", "Naphcon-A (descongestionante)",
               "Optrex (antiséptico)", "ReNu / Opti-Free (lentes)", "Cerumol / Otrivin (oídos)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
