/**
 * ÍNDICE — Farmacia y Medicamentos OTC
 * Ruta base: admin/src/variantes/farmacia/
 *
 * IMPORTANTE: Solo productos OTC (venta libre sin receta médica).
 * condicion siempre "Nuevo" en toda esta categoría.
 * El vendedor debe indicar en la descripción del producto:
 * número de registro sanitario y fecha de vencimiento.
 */

export const MAPA = {
  // Analgesia y fiebre
  'farmacia/analgesia-fiebre/analgésicos':                () => import('./analgesia-fiebre/analgésicos/variantes.js'),
  'farmacia/analgesia-fiebre/antiinflamatorios':          () => import('./analgesia-fiebre/antiinflamatorios/variantes.js'),
  // Respiratorio y alergias
  'farmacia/respiratorio-alergias/antigripales':          () => import('./respiratorio-alergias/antigripales/variantes.js'),
  'farmacia/respiratorio-alergias/antihistamínicos':      () => import('./respiratorio-alergias/antihistamínicos/variantes.js'),
  'farmacia/respiratorio-alergias/tos-garganta':          () => import('./respiratorio-alergias/tos-garganta/variantes.js'),
  // Digestivo
  'farmacia/digestivo/antiácidos-digestivos':             () => import('./digestivo/antiácidos-digestivos/variantes.js'),
  'farmacia/digestivo/laxantes-diarrea':                  () => import('./digestivo/laxantes-diarrea/variantes.js'),
  // Primeros auxilios
  'farmacia/primeros-auxilios/curaciones':                () => import('./primeros-auxilios/curaciones/variantes.js'),
  'farmacia/primeros-auxilios/botiquín':                  () => import('./primeros-auxilios/botiquín/variantes.js'),
  'farmacia/primeros-auxilios/ortopedia':                 () => import('./primeros-auxilios/ortopedia/variantes.js'),
  // Dermatología OTC
  'farmacia/dermatologia-otc/piel':                       () => import('./dermatologia-otc/piel/variantes.js'),
  'farmacia/dermatologia-otc/ojos-oidos':                 () => import('./dermatologia-otc/ojos-oidos/variantes.js'),
  // Vitaminas OTC
  'farmacia/vitaminas-otc/vitaminas-minerales':           () => import('./vitaminas-otc/vitaminas-minerales/variantes.js'),
  'farmacia/vitaminas-otc/complementos-otc':              () => import('./vitaminas-otc/complementos-otc/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
