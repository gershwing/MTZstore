export function attachResponseHelpers(req, res, next) {
  res.ok = (data, meta) => res.status(200).json({ success: true, error: false, data, meta });
  res.created = (data, meta) => res.status(201).json({ success: true, error: false, data, meta });
  res.noContent = () => res.status(204).send();
  res.err = (status, code, message, details) => res.status(status).json({
    success: false, error: true, code, message, details
  });
  next();
}
