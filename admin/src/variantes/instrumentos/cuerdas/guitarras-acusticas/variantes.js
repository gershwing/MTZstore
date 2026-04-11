/**
 * VARIANTES - Instrumentos > Cuerdas > Guitarras Acústicas
 * Ruta: admin/src/variantes/instrumentos/cuerdas/guitarras-acusticas/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar en: colores / acabados de cuerpo, diseños de funda,
 *                  colores de batería — el músico compra por lo que ve.
 * tipo: "texto"  → selector de chips para especificaciones técnicas:
 *                  número de cuerdas, teclas, tallas, materiales, potencia.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo_cuerpo: {
    tipo: "texto",
    requerido: true,
    opciones: ["Dreadnought (clásica grande)", "Concert / OM (mediana)", "Auditorium / Grand Auditorium",
               "Jumbo (cuerpo extra grande)", "Parlor (pequeña vintage)", "Traveler / Mini (viaje)",
               "Semi-acústica / Electroacústica con pastilla", "12 cuerdas dreadnought",
               "Resonador / Dobro", "Archtop acústica"]
  },

  tapa: {
    tipo: "texto",
    requerido: true,
    opciones: ["Tapa sólida (solid top) abeto / spruce", "Tapa sólida cedro (cedar)",
               "Tapa laminada abeto", "Tapa laminada caoba", "All-solid (tapa + aros + fondo sólidos)"]
  },

  acabado_color: {
    tipo: "imagen",
    requerido: true,
    nota: "El vendedor sube foto real del acabado / color del cuerpo. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Natural (madera desnuda brillante)", "Natural mate (satin)",
      "Sunburst 3 colores (tabaco)", "Sunburst negro (black burst)",
      "Caoba oscura", "Negro brillante", "Negro mate",
      "Azul marino / Denim burst", "Rojo vino / Crimson",
      "Blanco crema", "Cherry / Cereza",
      "Vintage sunburst (amarillo + naranja + marrón)",
      "Quilted maple top (arce acolchado)", "Bambú / Exótico (ver foto)"
    ]
  },

  numero_cuerdas: {
    tipo: "texto",
    requerido: true,
    opciones: ["6 cuerdas (estándar)", "7 cuerdas", "12 cuerdas"]
  },

  escala_mm: {
    tipo: "texto",
    requerido: false,
    opciones: ["628 mm (short scale)", "645 mm", "648 mm (estándar Gibson)", "650 mm", "652 mm", "660 mm (estándar Fender)"]
  },

  talla: {
    tipo: "texto",
    requerido: true,
    opciones: ["1/4 (niño 4–6 años)", "1/2 (niño 6–9 años)", "3/4 (niño 9–12 años)", "4/4 / Full size (adulto)"]
  },

  marca: {
    tipo: "texto",
    requerido: true,
    opciones: ["Martin D-28 / D-18 / 000-15M", "Taylor 114ce / 214ce / 814ce", "Gibson J-45 / J-200",
               "Yamaha FG800 / FS800 / AC3R", "Fender CD-60S / Newporter", "Seagull S6 Original",
               "Takamine GN93CE / Pro Series", "Epiphone DR-100 / Masterbilt",
               "Cort AD810 / Earth100", "Sigma DM-1ST", "Genérico / Sin marca"]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: ["Solo guitarra", "Con funda blanda", "Con funda rígida (case)", "Kit completo (funda + correa + cuerdas + afinador)"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
