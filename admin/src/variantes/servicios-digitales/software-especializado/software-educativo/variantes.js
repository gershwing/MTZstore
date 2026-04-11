/**
 * VARIANTES - Servicios Digitales > Software Especializado > Software Educativo
 * Ruta: admin/src/variantes/servicios-digitales/software-especializado/software-educativo/variantes.js
 *
 * IMPORTANTE: Solo productos / servicios digitales (sin entrega física).
 * condicion: siempre ["Nuevo"] — licencias y servicios no son Usados.
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Uso MÍNIMO: solo donde el logo / badge del software
 *                  es lo que identifica visualmente la opción.
 * tipo: "texto"  → PREDOMINANTE: plan, capacidad, plazo, usuarios,
 *                  región de activación, número de licencias.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]   // ← servicios digitales siempre Nuevo
  },

  tipo: {
    tipo: "texto",
    opciones: ["Curso online (acceso de por vida)", "Curso online (acceso por tiempo limitado)",
               "Suscripción a plataforma educativa", "Libro digital / e-book técnico",
               "Software de aprendizaje de idiomas", "Software de matemáticas / STEM",
               "Simulador / Software de práctica profesional", "Examen de certificación (voucher)",
               "Pack preparación certificación (curso + voucher)"]
  },

  software_plataforma: {
    tipo: "imagen",
    nota: "El vendedor sube el logo de la plataforma. El cliente identifica el producto por la imagen.",
    guia_vendedor: [
      "Udemy (logo)", "Coursera (logo)", "LinkedIn Learning (logo)",
      "Pluralsight (logo)", "Duolingo (logo)", "Rosetta Stone (logo)",
      "Mavis Beacon (logo)", "GMetrix (logo)", "Pearson VUE (voucher)",
      "Certiport (voucher)", "CompTIA (voucher)", "Microsoft Learn (logo)",
      "AWS Training (logo)", "Google Cloud Skills Boost (logo)"
    ]
  },

  nivel: {
    tipo: "texto",
    opciones: ["Principiante / Sin experiencia previa", "Intermedio", "Avanzado", "Experto / Profesional", "Todos los niveles"]
  },

  idioma: {
    tipo: "texto",
    opciones: ["Español", "Inglés", "Bilingüe (español + inglés)", "Subtítulos en español", "Otros"]
  },

  area: {
    tipo: "texto",
    opciones: ["Programación / Desarrollo web", "Ciencia de datos / IA / ML", "Diseño gráfico / UX",
               "Marketing digital / SEO", "Contabilidad / Finanzas", "Idiomas", "STEM / Matemáticas",
               "Certificaciones IT (CompTIA / AWS / Azure / Google)", "Gestión de proyectos (PMP / CAPM)",
               "Ciberseguridad", "Fotografía / Video / Diseño", "Otros"]
  },

  plazo_acceso: {
    tipo: "texto",
    opciones: ["Acceso de por vida", "7 días", "30 días", "3 meses", "6 meses", "1 año", "2 años"]
  },

  incluye: {
    tipo: "texto",
    opciones: ["Solo acceso al curso", "Con certificado de finalización", "Con examen de certificación incluido",
               "Con mentorship / tutor", "Con proyectos prácticos evaluados"]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
