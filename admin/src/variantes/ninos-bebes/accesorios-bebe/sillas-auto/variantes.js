/**
 * VARIANTES - Bebés > Accesorios Bebé > Sillas de Auto
 * Ruta: admin/src/variantes/bebes/accesorios-bebe/sillas-auto/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/estampado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  grupo_peso: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Grupo 0+ (hasta 13 kg / 0–15 meses — portabebé)",
      "Grupo 1 (9–18 kg / 9 meses–4 años)",
      "Grupo 2–3 (15–36 kg / 3–12 años)",
      "Grupo 0+/1 convertible (0–18 kg)",
      "Grupo 0+/1/2/3 convertible (0–36 kg — crece con el bebé)",
      "Portabebé + base (2 en 1)"
    ]
  },

  sistema_fijacion: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Solo cinturón del auto",
      "ISOFIX + soporte de apoyo",
      "ISOFIX + Top Tether",
      "ISOFIX + base giratoria 360°",
      "Base ISOFIX + portabebé intercambiable"
    ]
  },

  orientacion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo contra-marcha (más seguro 0–4 años)",
      "Solo a favor de marcha",
      "Ambas orientaciones (giratoria)"
    ]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real de la silla. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Gris", "Beige / Arena", "Azul marino", "Rojo", "Negro + gris",
      "Gris + turquesa", "Negro + dorado", "Marrón", "Rosa / Coral", "Negro + rojo"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Cybex Cloud Z2 i-Size / Sirona T2 i-Size",
      "Cybex Solution T i-Fix (grupo 2–3)",
      "Joie i-Spin 360 / i-Venture / i-Traver",
      "Joie i-Harbour (portabebé)",
      "Maxi-Cosi Coral i-Size / Mica Pro / Titan Pro 2",
      "Chicco Kory Plus / Seat4Fix",
      "Britax Römer Baby-Safe 5Z / Dualfix M i-Size",
      "Britax Römer Evolvafix",
      "Graco Milestone / 4Ever DLX",
      "Nuna Pipa RX / RAVA / EXEC",
      "Genérico"
    ]
  },

  normativa: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "ECE R44/04 (antigua, válida)",
      "ECE R129 / i-Size (nueva, más segura)"
    ]
  },

  peso_silla_kg: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Hasta 4 kg (portabebé ligero)",
      "4–6 kg",
      "6–8 kg",
      "8–10 kg",
      "10 kg+"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
