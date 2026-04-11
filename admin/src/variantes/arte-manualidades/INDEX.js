/**
 * ÍNDICE — Arte y Manualidades
 * Ruta base: admin/src/variantes/arte-manualidades/
 *
 * Categoría con uso AMPLIO de tipo:"imagen" —
 * el artista elige por lo que ve: color de pintura,
 * tono de lana, textura de papel, color de arcilla.
 * Las fotos de muestras reales son esenciales para la venta.
 */

export const MAPA = {
  // Pintura
  'arte-manualidades/pintura/pinturas-acrilicas':         () => import('./pintura/pinturas-acrilicas/variantes.js'),
  'arte-manualidades/pintura/pinturas-oleo':              () => import('./pintura/pinturas-oleo/variantes.js'),
  'arte-manualidades/pintura/acuarelas':                  () => import('./pintura/acuarelas/variantes.js'),
  'arte-manualidades/pintura/gouache-tempera':            () => import('./pintura/gouache-tempera/variantes.js'),
  'arte-manualidades/pintura/soportes-pintura':           () => import('./pintura/soportes-pintura/variantes.js'),
  // Dibujo
  'arte-manualidades/dibujo/lapices-dibujo':              () => import('./dibujo/lapices-dibujo/variantes.js'),
  'arte-manualidades/dibujo/tintas-plumillas':            () => import('./dibujo/tintas-plumillas/variantes.js'),
  'arte-manualidades/dibujo/papeles-cuadernos-arte':      () => import('./dibujo/papeles-cuadernos-arte/variantes.js'),
  // Manualidades
  'arte-manualidades/manualidades/scrapbooking':          () => import('./manualidades/scrapbooking/variantes.js'),
  'arte-manualidades/manualidades/costura-tejido':        () => import('./manualidades/costura-tejido/variantes.js'),
  'arte-manualidades/manualidades/ceramica-arcilla':      () => import('./manualidades/ceramica-arcilla/variantes.js'),
  'arte-manualidades/manualidades/resina-moldes':         () => import('./manualidades/resina-moldes/variantes.js'),
  // Materiales generales
  'arte-manualidades/materiales-generales/pinceles-herramientas': () => import('./materiales-generales/pinceles-herramientas/variantes.js'),
  'arte-manualidades/materiales-generales/pegamentos-barnices':   () => import('./materiales-generales/pegamentos-barnices/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
