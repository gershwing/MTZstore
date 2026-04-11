/**
 * VARIANTES - Farmacia > Respiratorio y Alergias > Tos y Garganta
 * Ruta: admin/src/variantes/farmacia/respiratorio-alergias/tos-garganta/variantes.js
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
    opciones: ["Jarabe para tos seca (antitusivo)", "Jarabe para tos productiva (expectorante / mucolítico)",
               "Jarabe para tos mixta (doble acción)", "Pastilla / Tableta para tos",
               "Spray bucal para garganta", "Pastilla de chupar para garganta (con anestésico local)",
               "Pastilla de chupar miel + limón", "Aerosol faríngeo (antibacteriano + anestésico)",
               "Nebulización / Solución para inhalar", "Gárgaras antisépticas",
               "Tónico natural para garganta (miel + jengibre + propóleo)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Dextrometorfano (antitusivo)", "Codeína OTC (donde aplica)",
               "Ambroxol (mucolítico)", "Acetilcisteína / NAC (mucolítico)",
               "Bromhexina (mucolítico)", "Guaifenesina (expectorante)",
               "Bencidamina (anestésico local garganta)", "Clorexidina + clorobutanol (antiséptico)",
               "Flurbiprofen (AINE local garganta)", "Miel + extractos naturales (OTC natural)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Jarabe", "Solución oral (gotas)", "Comprimido", "Pastilla de chupar / Lozenge",
               "Spray bucal / Faríngeo", "Granulado / Sobre efervescente",
               "Vapor / Inhalación (eucalipto)"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque / sabor real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Jarabe miel + limón (ver frasco)", "Jarabe frambuesa (ver frasco)",
      "Jarabe menta (ver frasco)", "Pastilla miel + limón (ver caja)",
      "Pastilla menta fuerte (ver caja)", "Spray garganta (ver envase)",
      "Sobre granulado limón (ver sobre)", "Tónico natural (ver frasco)"
    ]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["8 pastillas", "12 pastillas", "16 pastillas", "24 pastillas", "Frasco 100 ml", "Frasco 120 ml",
               "Frasco 150 ml", "Frasco 200 ml", "Spray 30 ml", "Spray 40 ml", "5 sobres", "10 sobres"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["Niño (3–11 años)", "Adulto y adolescente (12+ años)", "Solo adultos (18+)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Bisolvon (bromhexina — Boehringer)", "Fluimucil / Fluibron (ambroxol)", "Mucosolvan",
               "Robitussin (guaifenesina)", "Strepsils (antiséptico pastillas)", "Tantum Verde (bencidamina)",
               "Difflam (flurbiprofen)", "Neo-Angin", "Vicks Formula 44", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
