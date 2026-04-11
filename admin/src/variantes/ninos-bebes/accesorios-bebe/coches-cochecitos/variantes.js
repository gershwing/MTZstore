/**
 * VARIANTES - Bebés > Accesorios Bebé > Coches y Cochecitos
 * Ruta: admin/src/variantes/bebes/accesorios-bebe/coches-cochecitos/variantes.js
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

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Cochecito urbano (silla de paseo)",
      "Cochecito travel system (silla + capazo + base auto)",
      "Cochecito dúo / gemelar",
      "Silla de paseo ligera / buggy",
      "Cochecito todo terreno / offroad",
      "Silla de paseo ultra-compacta (avión)",
      "Cochecito con capazo independiente",
      "Triciclo evolutivo (crece con el bebé)"
    ]
  },

  edad_uso: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Desde nacimiento (capazo reclinable)",
      "Desde 6 meses (sentado)",
      "Desde 3 meses",
      "Desde 9 meses",
      "1–5 años"
    ]
  },

  peso_max_kg: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hasta 15 kg", "Hasta 18 kg", "Hasta 22 kg", "Hasta 25 kg"]
  },

  color: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del cochecito. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Negro", "Gris marengo", "Beige / Arena", "Azul marino", "Verde oliva",
      "Rojo", "Blanco + gris", "Negro + dorado", "Marrón / Cognac",
      "Gris + negro", "Rosa polvo + gris", "Azul + negro"
    ]
  },

  ruedas: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "3 ruedas (triangular)",
      "4 ruedas fijas",
      "4 ruedas giratorias 360°",
      "4 ruedas todo terreno (espuma)"
    ]
  },

  plegado: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Plegado manual compacto",
      "Plegado automático (1 mano)",
      "Plegado tipo paraguas",
      "Plegado plano (para maletero avión)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Bugaboo Fox 5 / Cameleon 3",
      "Cybex Priam / Mios / Gazelle S",
      "UPPAbaby Vista V2 / Cruz V2",
      "Babyzen YOYO 2 (avión)",
      "Stokke Xplory X / Crusi",
      "Chicco Activ3 / Urban Plus",
      "Maxi-Cosi Leona / Adorra 2",
      "Joie Versatrax / Tourist / Pact Pro",
      "Silver Cross Dune / Tide",
      "Graco Modes / FastAction",
      "Genérico"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo cochecito",
      "Con bolso pañalera",
      "Con capazo incluido",
      "Con protector lluvia",
      "Kit completo (silla + capazo + accesorios)"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
