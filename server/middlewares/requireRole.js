export const requireRole = (...roles) => (req, res, next) => {
  const r = req?.user?.role;
  if (!r) return res.status(401).json({ error: true, message: "Unauthorized" });
  if (!roles.includes(r)) {
    return res.status(403).json({ error: true, message: "Forbidden" });
  }
  next();
};
