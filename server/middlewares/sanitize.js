// server/middlewares/sanitize.js
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Exporta un conjunto de middlewares de saneamiento
export function applySanitizers(app) {
  // Previene inyección NoSQL: quita $ y .
  app.use(mongoSanitize({ allowDots: false, replaceWith: '_' }));
  // Previene HTTP Parameter Pollution (?a=1&a=2)
  app.use(hpp());
}

// (Opcional) si quieres un filtro de XSS básico del body/params/query:
export function xssTrim(req, _res, next) {
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') {
        // ej: elimina tags básicos. Si necesitas algo más robusto, integra sanitize-html.
        obj[k] = v.replace(/<[^>]*>?/gm, '');
      } else if (typeof v === 'object') scrub(v);
    }
  };
  scrub(req.body); scrub(req.query); scrub(req.params);
  next();
}
