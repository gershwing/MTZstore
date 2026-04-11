/**
 * ÍNDICE — Libros, Cine y Música
 * Ruta base: admin/src/variantes/libros-cine-musica/
 *
 * Categoría de alto tráfico con variantes predominantemente
 * de texto (idioma, formato, edición, región).
 * tipo:"imagen" se usa selectivamente en ediciones especiales,
 * vinilos de color y coleccionables donde el packaging visual
 * es parte del valor del producto.
 */

export const MAPA = {
  // Libros
  'libros-cine-musica/libros/ficcion':                  () => import('./libros/ficcion/variantes.js'),
  'libros-cine-musica/libros/no-ficcion':               () => import('./libros/no-ficcion/variantes.js'),
  'libros-cine-musica/libros/infantil-juvenil':         () => import('./libros/infantil-juvenil/variantes.js'),
  'libros-cine-musica/libros/educacion-texto':          () => import('./libros/educacion-texto/variantes.js'),
  'libros-cine-musica/libros/comics-manga':             () => import('./libros/comics-manga/variantes.js'),
  // E-books y audiolibros
  'libros-cine-musica/ebooks-audiolibros/digitales':    () => import('./ebooks-audiolibros/digitales/variantes.js'),
  // Películas
  'libros-cine-musica/peliculas/peliculas-fisico':      () => import('./peliculas/peliculas-fisico/variantes.js'),
  'libros-cine-musica/peliculas/series-tv':             () => import('./peliculas/series-tv/variantes.js'),
  // Música física
  'libros-cine-musica/musica-fisica/vinilos':           () => import('./musica-fisica/vinilos/variantes.js'),
  'libros-cine-musica/musica-fisica/cds':               () => import('./musica-fisica/cds/variantes.js'),
  'libros-cine-musica/musica-fisica/coleccionables':    () => import('./musica-fisica/coleccionables/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
