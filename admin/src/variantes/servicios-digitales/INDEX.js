/**
 * ÍNDICE — Servicios Digitales
 * Ruta base: admin/src/variantes/servicios-digitales/
 *
 * Solo productos / servicios digitales sin entrega física.
 * condicion siempre "Nuevo" en toda esta categoría.
 * tipo:"imagen" se usa selectivamente en logos de software
 * reconocibles — la foto del badge / logo identifica mejor
 * el producto que el texto para el cliente final.
 *
 * El vendedor debe indicar en la descripción del producto:
 * - Región de activación
 * - Si la licencia es transferible
 * - Fecha de expiración (si aplica)
 * - Forma de entrega (key / cuenta / código)
 */

export const MAPA = {
  // Hosting y dominios
  'servicios-digitales/hosting-dominios/hosting-web':           () => import('./hosting-dominios/hosting-web/variantes.js'),
  'servicios-digitales/hosting-dominios/dominios':              () => import('./hosting-dominios/dominios/variantes.js'),
  'servicios-digitales/hosting-dominios/servidores-vps':        () => import('./hosting-dominios/servidores-vps/variantes.js'),
  // Software de oficina
  'servicios-digitales/software-oficina/suite-oficina':         () => import('./software-oficina/suite-oficina/variantes.js'),
  'servicios-digitales/software-oficina/antivirus-seguridad':   () => import('./software-oficina/antivirus-seguridad/variantes.js'),
  'servicios-digitales/software-oficina/software-diseno':       () => import('./software-oficina/software-diseno/variantes.js'),
  // Software especializado
  'servicios-digitales/software-especializado/software-contabilidad':   () => import('./software-especializado/software-contabilidad/variantes.js'),
  'servicios-digitales/software-especializado/software-educativo':      () => import('./software-especializado/software-educativo/variantes.js'),
  'servicios-digitales/software-especializado/software-entretenimiento':() => import('./software-especializado/software-entretenimiento/variantes.js'),
  // Licencias y sistemas
  'servicios-digitales/licencias-sistemas/sistemas-operativos':     () => import('./licencias-sistemas/sistemas-operativos/variantes.js'),
  'servicios-digitales/licencias-sistemas/licencias-desarrollo':    () => import('./licencias-sistemas/licencias-desarrollo/variantes.js'),
  // Suscripciones digitales
  'servicios-digitales/suscripciones-digitales/streaming-entretenimiento': () => import('./suscripciones-digitales/streaming-entretenimiento/variantes.js'),
  'servicios-digitales/suscripciones-digitales/almacenamiento-nube':       () => import('./suscripciones-digitales/almacenamiento-nube/variantes.js'),
  'servicios-digitales/suscripciones-digitales/herramientas-productividad':() => import('./suscripciones-digitales/herramientas-productividad/variantes.js'),
};

export async function getVariantesPorRuta(ruta) {
  const loader = MAPA[ruta];
  if (!loader) return null;
  const mod = await loader();
  return mod.variantes ?? null;
}
