// server/middlewares/onlySuperAdmin.js
export default function onlySuperAdmin(req, res, next) {
  if (req?.user?.role === 'SUPER_ADMIN' || req?.user?.isSuper) return next();
  return res.status(403).json({ error: 'FORBIDDEN' });
}
