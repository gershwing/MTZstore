/**
 * ÍNDICE — Oficina y Papelería
 * Ruta base: admin/src/variantes/oficina/
 *
 * Los atributos tipo:"imagen" son seleccionados por el cliente
 * desde fotos reales subidas por el vendedor en el panel admin.
 */

export const MAPA = {
  // Impresoras
  'oficina/impresoras/tinta-inkjet':                    () => import('./impresoras/tinta-inkjet/variantes.js'),
  'oficina/impresoras/laser':                           () => import('./impresoras/laser/variantes.js'),
  'oficina/impresoras/multifuncionales':                () => import('./impresoras/multifuncionales/variantes.js'),
  'oficina/impresoras/consumibles':                     () => import('./impresoras/consumibles/variantes.js'),
  // Material escolar
  'oficina/material-escolar/cuadernos':                 () => import('./material-escolar/cuadernos/variantes.js'),
  'oficina/material-escolar/mochilas-escolar':          () => import('./material-escolar/mochilas-escolar/variantes.js'),
  'oficina/material-escolar/utiles-escritura':          () => import('./material-escolar/utiles-escritura/variantes.js'),
  'oficina/material-escolar/sets-escolares':            () => import('./material-escolar/sets-escolares/variantes.js'),
  // Papelería oficina
  'oficina/papeleria-oficina/carpetas-archivadores':    () => import('./papeleria-oficina/carpetas-archivadores/variantes.js'),
  'oficina/papeleria-oficina/plumas-lapices':           () => import('./papeleria-oficina/plumas-lapices/variantes.js'),
  'oficina/papeleria-oficina/organizadores':            () => import('./papeleria-oficina/organizadores/variantes.js'),
  // Mobiliario oficina
  'oficina/mobiliario-oficina/escritorios-oficina':     () => import('./mobiliario-oficina/escritorios-oficina/variantes.js'),
  'oficina/mobiliario-oficina/sillas-ergonomicas':      () => import('./mobiliario-oficina/sillas-ergonomicas/variantes.js'),
  'oficina/mobiliario-oficina/archivadores-muebles':    () => import('./mobiliario-oficina/archivadores-muebles/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
