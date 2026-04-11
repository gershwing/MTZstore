/**
 * VARIANTES - Farmacia > Respiratorio y Alergias > Antigripales
 * Ruta: admin/src/variantes/farmacia/respiratorio-alergias/antigripales/variantes.js
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
    opciones: ["Antigripal / Resfriado (combinado)", "Descongestionante nasal oral",
               "Descongestionante nasal spray", "Lavado nasal / suero fisiológico",
               "Antigripal para niños", "Antigripal para adultos", "Antigripal con analgésico",
               "Antigripal día + noche (pack combinado)", "Oseltamivir OTC (donde aplica por país)"]
  },

  principio_activo: {
    tipo: "texto",
    opciones: ["Paracetamol + pseudoefedrina + clorfenamina", "Ibuprofeno + pseudoefedrina",
               "Fenilefrina + paracetamol", "Pseudoefedrina solo", "Xilometazolina (nasal)",
               "Oximetazolina (nasal)", "Budesonida nasal (OTC en algunos países)",
               "Suero fisiológico 0.9%", "Solución hipertónica 2.3%", "Combinado (ver descripción)"]
  },

  forma_farmaceutica: {
    tipo: "texto",
    opciones: ["Comprimido", "Cápsula", "Sobre granulado / Polvo para disolver",
               "Jarabe", "Gotas nasales", "Spray nasal", "Solución nebulización",
               "Vaporub / Bálsamo tópico", "Pastilla de chupar"]
  },

  sabor_presentacion: {
    tipo: "imagen",
    nota: "El vendedor sube foto del empaque real. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Sobre limón (ver envase)", "Sobre naranja (ver envase)",
      "Sobre frutos rojos (ver envase)", "Jarabe (ver frasco)",
      "Spray nasal (ver envase)", "Suero fisiológico (ver ampolla / spray)",
      "Vaporub (ver tarro)", "Comprimido (ver caja)",
      "Pack día + noche (ver caja)"
    ]
  },

  cantidad: {
    tipo: "texto",
    opciones: ["1 sobre", "5 sobres", "8 sobres", "10 sobres", "12 sobres", "20 sobres",
               "Frasco 120 ml", "Frasco 150 ml", "Spray nasal 15 ml", "Spray nasal 20 ml",
               "10 unidades", "20 unidades"]
  },

  edad_uso: {
    tipo: "texto",
    opciones: ["Bebé (desde 6 meses)", "Niño (2–11 años)", "Adulto y niños (12+ años)", "Solo adultos (18+)"]
  },

  marca: {
    tipo: "texto",
    opciones: ["Vicks DayQuil / NyQuil / VapoRub", "Coldrex (GSK)", "Desenfriol / Gripevil (LATAM)",
               "Otrivin / Dimetapp", "Nasonex OTC (Mometasona)", "Sterimar (suero nasal)",
               "Physiomer", "Nasivion / Iliadin (xilometazolina)", "Genérico / Farmacia"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
