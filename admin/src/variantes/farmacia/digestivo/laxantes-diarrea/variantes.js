/**
 * VARIANTES - Farmacia > Digestivo > Laxantes y Diarrea
 * Ruta: admin/src/variantes/farmacia/digestivo/laxantes-diarrea/variantes.js
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
    opciones: ["Antidiarreico (loperamida)", "Antidiarreico natural (taninos / carbón activado)",
               "Sales de rehidratación oral (SRO)", "Probiótico + zinc (diarrea infantil)",
               "Laxante osmótico (polietilenglicol / PEG)", "Laxante estimulante (bisacodilo / sena)",
               "Laxante formador de masa (psyllium / plantago)", "Supositorios laxantes (glicerina)",
               "Enema de limpieza", "Laxante natural (fibra / ciruelas / lactulosa)",
               "Antiparasitario intestinal OTC (donde aplica)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Loperamida 2 mg", "Carbón activado", "Kaolin + pectina", "Sales ORS (OMS)",
               "Polietilenglicol 3350 / 4000", "Bisacodilo", "Senósidos (sena)",
               "Glicerina (supositorio)", "Lactulosa", "Psyllium / Ispágula",
               "Metronidazol OTC (donde aplica)", "Mebendazol 100 mg OTC"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Cápsula", "Comprimido", "Supositorio", "Sobre (SRO / polvo para disolver)",
               "Solución oral / Jarabe", "Polvo + frasco (reconstituir)", "Enema (líquido rectal)", "Goma de mascar"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "SRO sobres sabor naranja (ver caja)", "SRO sobres sabor limón (ver caja)",
      "SRO sobres neutro (ver caja)", "Solución oral (ver frasco)",
      "Supositorio (ver caja)", "Comprimido / cápsula (ver caja)",
      "Sobre polvo (ver caja)"
    ]
  },

  cantidad_unidades: {
    tipo: "texto",
    opciones: ["4 unidades", "6 unidades", "8 unidades", "10 unidades", "20 unidades", "30 unidades",
               "6 sobres", "10 sobres", "20 sobres", "Frasco 200 ml", "Frasco 500 ml", "Bote 500 g"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["Bebé (desde 3 meses — SRO)", "Niño (2–11 años)", "Adulto y adolescente (12+)", "Solo adultos (18+)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Imodium / Loperamida (J&J)", "Smecta (diosmectita)", "Pedialyte / Suero Oral (Abbott)",
               "ORS (SRO OMS)", "Lactulosa genérico", "Microlax (enema)", "Bisacodilo genérico",
               "Metamucil / Psyllium (P&G)", "Mebendazol genérico / Mebex", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
