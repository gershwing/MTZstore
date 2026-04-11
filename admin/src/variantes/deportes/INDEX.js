/**
 * \u00cdNDICE \u2014 Deportes y Aire Libre
 * Ruta base: admin/src/variantes/deportes/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos reales subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Fitness
  'deportes/fitness/mancuernas-pesas':          () => import('./fitness/mancuernas-pesas/variantes.js'),
  'deportes/fitness/bandas-elasticas':          () => import('./fitness/bandas-elasticas/variantes.js'),
  'deportes/fitness/bicicletas-estaticas':      () => import('./fitness/bicicletas-estaticas/variantes.js'),
  'deportes/fitness/cintas-trotar':             () => import('./fitness/cintas-trotar/variantes.js'),
  'deportes/fitness/accesorios-gym':            () => import('./fitness/accesorios-gym/variantes.js'),
  // Deportes de equipo
  'deportes/deportes-equipo/futbol':            () => import('./deportes-equipo/futbol/variantes.js'),
  'deportes/deportes-equipo/basquetbol':        () => import('./deportes-equipo/basquetbol/variantes.js'),
  'deportes/deportes-equipo/tenis-padel':       () => import('./deportes-equipo/tenis-padel/variantes.js'),
  'deportes/deportes-equipo/voley':             () => import('./deportes-equipo/voley/variantes.js'),
  'deportes/deportes-equipo/futbol-sala':       () => import('./deportes-equipo/futbol-sala/variantes.js'),
  // Aire libre
  'deportes/aire-libre/carpas-camping':         () => import('./aire-libre/carpas-camping/variantes.js'),
  'deportes/aire-libre/mochilas-trekking':      () => import('./aire-libre/mochilas-trekking/variantes.js'),
  'deportes/aire-libre/linternas':              () => import('./aire-libre/linternas/variantes.js'),
  'deportes/aire-libre/ropa-outdoor':           () => import('./aire-libre/ropa-outdoor/variantes.js'),
  // Ciclismo
  'deportes/ciclismo/bicicletas':               () => import('./ciclismo/bicicletas/variantes.js'),
  'deportes/ciclismo/cascos-ciclismo':          () => import('./ciclismo/cascos-ciclismo/variantes.js'),
  'deportes/ciclismo/accesorios-ciclismo':      () => import('./ciclismo/accesorios-ciclismo/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
