/**
 * ÍNDICE — Herramientas y Construcción
 * Ruta base: admin/src/variantes/herramientas/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos reales subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Herramientas eléctricas
  'herramientas/electricas/taladros':                   () => import('./electricas/taladros/variantes.js'),
  'herramientas/electricas/amoladoras':                 () => import('./electricas/amoladoras/variantes.js'),
  'herramientas/electricas/sierras':                    () => import('./electricas/sierras/variantes.js'),
  'herramientas/electricas/lijadoras-fresadoras':       () => import('./electricas/lijadoras-fresadoras/variantes.js'),
  // Herramientas manuales
  'herramientas/manuales/martillos':                    () => import('./manuales/martillos/variantes.js'),
  'herramientas/manuales/destornilladores':             () => import('./manuales/destornilladores/variantes.js'),
  'herramientas/manuales/llaves':                       () => import('./manuales/llaves/variantes.js'),
  'herramientas/manuales/kits-herramientas':            () => import('./manuales/kits-herramientas/variantes.js'),
  // Medición y seguridad
  'herramientas/medicion-seguridad/medicion':           () => import('./medicion-seguridad/medicion/variantes.js'),
  'herramientas/medicion-seguridad/seguridad-epp':      () => import('./medicion-seguridad/seguridad-epp/variantes.js'),
  // Materiales
  'herramientas/materiales/pinturas':                   () => import('./materiales/pinturas/variantes.js'),
  'herramientas/materiales/adhesivos':                  () => import('./materiales/adhesivos/variantes.js'),
  'herramientas/materiales/electricidad-hogar':         () => import('./materiales/electricidad-hogar/variantes.js'),
  // Jardinería
  'herramientas/jardineria/herramientas-jardin':        () => import('./jardineria/herramientas-jardin/variantes.js'),
  'herramientas/jardineria/riego':                      () => import('./jardineria/riego/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
