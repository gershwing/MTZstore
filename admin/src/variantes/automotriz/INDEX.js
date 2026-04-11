/**
 * ÍNDICE — Automotriz
 * Ruta base: admin/src/variantes/automotriz/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Accesorios exteriores
  'automotriz/accesorios-exteriores/cobertores':                 () => import('./accesorios-exteriores/cobertores/variantes.js'),
  'automotriz/accesorios-exteriores/luces-led':                  () => import('./accesorios-exteriores/luces-led/variantes.js'),
  'automotriz/accesorios-exteriores/tapa-aros':                  () => import('./accesorios-exteriores/tapa-aros/variantes.js'),
  'automotriz/accesorios-exteriores/parrillas-portaequipajes':   () => import('./accesorios-exteriores/parrillas-portaequipajes/variantes.js'),
  // Accesorios interiores
  'automotriz/accesorios-interiores/fundas-asiento':             () => import('./accesorios-interiores/fundas-asiento/variantes.js'),
  'automotriz/accesorios-interiores/espaldares-cojines':         () => import('./accesorios-interiores/espaldares-cojines/variantes.js'),
  'automotriz/accesorios-interiores/alfombrillas':               () => import('./accesorios-interiores/alfombrillas/variantes.js'),
  'automotriz/accesorios-interiores/cubre-volantes':             () => import('./accesorios-interiores/cubre-volantes/variantes.js'),
  // Repuestos
  'automotriz/repuestos/filtros':                                () => import('./repuestos/filtros/variantes.js'),
  'automotriz/repuestos/baterias':                               () => import('./repuestos/baterias/variantes.js'),
  'automotriz/repuestos/escobillas':                             () => import('./repuestos/escobillas/variantes.js'),
  // Herramientas de taller
  'automotriz/herramientas-taller/gatos-hidraulicos':            () => import('./herramientas-taller/gatos-hidraulicos/variantes.js'),
  'automotriz/herramientas-taller/compresores':                  () => import('./herramientas-taller/compresores/variantes.js'),
  'automotriz/herramientas-taller/kits-emergencia':              () => import('./herramientas-taller/kits-emergencia/variantes.js'),
  // Audio y navegación
  'automotriz/audio-navegacion/radios-pantallas':                () => import('./audio-navegacion/radios-pantallas/variantes.js'),
  'automotriz/audio-navegacion/altavoces-auto':                  () => import('./audio-navegacion/altavoces-auto/variantes.js'),
  'automotriz/audio-navegacion/camaras-sensores':                () => import('./audio-navegacion/camaras-sensores/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
