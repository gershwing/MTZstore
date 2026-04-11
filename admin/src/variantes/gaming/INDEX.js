/**
 * ÍNDICE — Gaming y Tecnología
 * Ruta base: admin/src/variantes/gaming/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Consolas
  'gaming/consolas/playstation':                            () => import('./consolas/playstation/variantes.js'),
  'gaming/consolas/xbox':                                   () => import('./consolas/xbox/variantes.js'),
  'gaming/consolas/nintendo':                               () => import('./consolas/nintendo/variantes.js'),
  // Videojuegos
  'gaming/videojuegos/juegos-fisicos':                      () => import('./videojuegos/juegos-fisicos/variantes.js'),
  'gaming/videojuegos/juegos-digitales':                    () => import('./videojuegos/juegos-digitales/variantes.js'),
  'gaming/videojuegos/accesorios-consola':                  () => import('./videojuegos/accesorios-consola/variantes.js'),
  // PC Gaming
  'gaming/pc-gaming/monitores-gaming':                      () => import('./pc-gaming/monitores-gaming/variantes.js'),
  'gaming/pc-gaming/teclados-mecanicos':                    () => import('./pc-gaming/teclados-mecanicos/variantes.js'),
  'gaming/pc-gaming/mouse-gamer':                           () => import('./pc-gaming/mouse-gamer/variantes.js'),
  'gaming/pc-gaming/headsets-gaming':                       () => import('./pc-gaming/headsets-gaming/variantes.js'),
  'gaming/pc-gaming/sillas-gaming':                         () => import('./pc-gaming/sillas-gaming/variantes.js'),
  // Realidad Virtual
  'gaming/realidad-virtual/visores-vr':                     () => import('./realidad-virtual/visores-vr/variantes.js'),
  'gaming/realidad-virtual/accesorios-vr':                  () => import('./realidad-virtual/accesorios-vr/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
