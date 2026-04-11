// server/middlewares/requireSuper.js
export default function requireSuper(req, res, next) {
  try {
    // roles posibles que ya tienes en req.user (vía auth)
    const user = req.user || {};
    const role = user.role || user.platformRole || null;
    const roles = Array.isArray(user.roles) ? user.roles : [];

    const isPlatform = user.isPlatformSuperAdmin === true;
    const isSuper =
      isPlatform ||
      role === "SUPER_ADMIN" ||
      roles.includes("SUPER_ADMIN");

    if (!isSuper) {
      return res.status(403).json({ error: true, message: "forbidden: super admin required" });
    }

    return next();
  } catch (e) {
    return res.status(500).json({ error: true, message: "requireSuper failed" });
  }
}
