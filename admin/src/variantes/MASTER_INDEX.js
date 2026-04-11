/**
 * MASTER_INDEX — Punto de entrada único del sistema de variantes
 * Ruta: admin/src/variantes/MASTER_INDEX.js
 *
 * Agrega los 18 INDEX.js de cada categoría raíz.
 * Lazy loading: solo carga la categoría activa cuando se necesita.
 *
 * 18 categorías · 306 variantes.js · 18 INDEX.js
 */

const CATEGORIAS = {
  'electronica':          () => import('./electronica/INDEX.js'),
  'moda':                 () => import('./moda/INDEX.js'),
  'hogar':                () => import('./hogar/INDEX.js'),
  'automotriz':           () => import('./automotriz/INDEX.js'),
  'gaming':               () => import('./gaming/INDEX.js'),
  'belleza':              () => import('./belleza/INDEX.js'),
  'deportes':             () => import('./deportes/INDEX.js'),
  'ninos-bebes':          () => import('./ninos-bebes/INDEX.js'),
  'oficina':              () => import('./oficina/INDEX.js'),
  'herramientas':         () => import('./herramientas/INDEX.js'),
  'supermercado':         () => import('./supermercado/INDEX.js'),
  'gastronomia':          () => import('./gastronomia/INDEX.js'),
  'mascotas':             () => import('./mascotas/INDEX.js'),
  'instrumentos':         () => import('./instrumentos/INDEX.js'),
  'libros-cine-musica':   () => import('./libros-cine-musica/INDEX.js'),
  'farmacia':             () => import('./farmacia/INDEX.js'),
  'arte-manualidades':    () => import('./arte-manualidades/INDEX.js'),
  'servicios-digitales':  () => import('./servicios-digitales/INDEX.js'),
};

/**
 * Obtiene las variantes de una ruta completa.
 * @param {string} ruta — ej: "electronica/smartphones/android"
 * @returns {Promise<object|null>} — el objeto variantes o null
 */
export async function getVariantesPorRuta(ruta) {
  const categoriaRaiz = ruta.split('/')[0];
  const loader = CATEGORIAS[categoriaRaiz];
  if (!loader) return null;

  const mod = await loader();
  if (mod.getVariantesPorRuta) {
    return mod.getVariantesPorRuta(ruta);
  }

  const mapa = mod.MAPA;
  if (!mapa || !mapa[ruta]) return null;

  const varMod = await mapa[ruta]();
  return varMod.variantes ?? null;
}

/**
 * Lista todas las rutas disponibles de una categoría raíz.
 * @param {string} categoriaRaiz — ej: "electronica"
 * @returns {Promise<string[]>} — array de rutas
 */
export async function getRutasPorCategoria(categoriaRaiz) {
  const loader = CATEGORIAS[categoriaRaiz];
  if (!loader) return [];

  const mod = await loader();
  return Object.keys(mod.MAPA || {});
}

export { CATEGORIAS };
