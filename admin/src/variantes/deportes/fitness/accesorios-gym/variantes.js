/**
 * VARIANTES - Deportes > Fitness > Accesorios Gym
 * Ruta: admin/src/variantes/deportes/fitness/accesorios-gym/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/diseño es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
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
    opciones: [
      "Esterilla / Mat de yoga (6 mm)",
      "Esterilla de pilates (10\u201315 mm)",
      "Foam roller / Rodillo de espuma",
      "Pelota de yoga / swiss ball",
      "Cuerda para saltar / Jump rope",
      "Rueda abdominal / Ab wheel",
      "TRX / Suspensi\u00f3n trainer",
      "Stepper / Escal\u00f3n aer\u00f3bico",
      "Balance board / Tabla equilibrio",
      "Guantes de gym",
      "Cintur\u00f3n lumbar de gym",
      "Mu\u00f1equeras / Rodilleras / Tobilleras",
      "Bolsa deportiva / Gym bag",
      "Botella / Shaker deportivo",
      "Banda de sudor / Headband",
      "Set accesorios gym completo"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "TPE (sin PVC / eco)",
      "PVC",
      "Caucho natural",
      "EVA foam",
      "Neopreno",
      "Polipropileno",
      "Algod\u00f3n + elastano",
      "Acero inoxidable (shaker)"
    ]
  },

  talla: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "XS", "S", "M", "L", "XL", "Talla \u00fanica",
      "45 cm", "55 cm", "65 cm", "75 cm", "85 cm (pelota)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto del color / dise\u00f1o. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Gris", "Azul", "Verde", "Rosa", "Morado", "Naranja", "Rojo",
      "Amarillo", "Multicolor", "Negro + rosa", "Tie-dye"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Lululemon (mat)",
      "Manduka PRO / PRO Lite",
      "Gaiam (mat/pelota)",
      "TRX Home2 / Pro4",
      "Rogue Speed Rope",
      "WOD Nation",
      "Decathlon Domyos",
      "Gen\u00e9rico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
