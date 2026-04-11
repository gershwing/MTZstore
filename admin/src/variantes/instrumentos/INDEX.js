/**
 * ÍNDICE — Instrumentos Musicales
 * Ruta base: admin/src/variantes/instrumentos/
 *
 * Los atributos tipo:"imagen" (colores / acabados de cuerpo,
 * sunburst, quilted maple, colores de batería) son seleccionados
 * por el cliente desde fotos reales subidas por el vendedor
 * en el panel admin.
 */

export const MAPA = {
  // Cuerdas
  'instrumentos/cuerdas/guitarras-acusticas':       () => import('./cuerdas/guitarras-acusticas/variantes.js'),
  'instrumentos/cuerdas/guitarras-electricas':      () => import('./cuerdas/guitarras-electricas/variantes.js'),
  'instrumentos/cuerdas/guitarras-clasicas':        () => import('./cuerdas/guitarras-clasicas/variantes.js'),
  'instrumentos/cuerdas/bajos':                     () => import('./cuerdas/bajos/variantes.js'),
  'instrumentos/cuerdas/ukuleles-otros':            () => import('./cuerdas/ukuleles-otros/variantes.js'),
  'instrumentos/cuerdas/charangos':                () => import('./cuerdas/charangos/variantes.js'),
  // Teclados y piano
  'instrumentos/teclados-piano/pianos-digitales':   () => import('./teclados-piano/pianos-digitales/variantes.js'),
  'instrumentos/teclados-piano/teclados-sintetizadores': () => import('./teclados-piano/teclados-sintetizadores/variantes.js'),
  'instrumentos/teclados-piano/organos-acordeones': () => import('./teclados-piano/organos-acordeones/variantes.js'),
  // Percusión
  'instrumentos/percusion/baterias':                () => import('./percusion/baterias/variantes.js'),
  'instrumentos/percusion/percusion-latina':        () => import('./percusion/percusion-latina/variantes.js'),
  'instrumentos/percusion/cajones-bongos':          () => import('./percusion/cajones-bongos/variantes.js'),
  'instrumentos/percusion/percusion-andina':       () => import('./percusion/percusion-andina/variantes.js'),
  // Vientos
  'instrumentos/vientos/vientos-madera':            () => import('./vientos/vientos-madera/variantes.js'),
  'instrumentos/vientos/vientos-metal':             () => import('./vientos/vientos-metal/variantes.js'),
  'instrumentos/vientos/vientos-madera-andinos':   () => import('./vientos/vientos-madera-andinos/variantes.js'),
  'instrumentos/vientos/vientos-metal-banda':      () => import('./vientos/vientos-metal-banda/variantes.js'),
  // Accesorios musicales
  'instrumentos/accesorios-musicales/cuerdas-accesorios': () => import('./accesorios-musicales/cuerdas-accesorios/variantes.js'),
  'instrumentos/accesorios-musicales/pedales-efectos':    () => import('./accesorios-musicales/pedales-efectos/variantes.js'),
  'instrumentos/accesorios-musicales/amplificadores':     () => import('./accesorios-musicales/amplificadores/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
