// server/middlewares/cacheHeaders.js
export function noStoreAndVaryLogo(req, res, next) {
  try {
    res.setHeader("Vary", "Origin, X-Store-Id, Authorization");
    res.setHeader("Cache-Control", "no-store");
    res.removeHeader?.("ETag");
  } catch { }
  next();
}

export function noStoreAndVarySlider(req, res, next) {
  try {
    res.setHeader("Vary", "Origin, Authorization");
    res.setHeader("Cache-Control", "no-store");
    res.removeHeader?.("ETag");
  } catch { }
  next();
}
