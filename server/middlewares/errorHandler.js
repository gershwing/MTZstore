import { HttpError } from '../utils/httpError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      error: true,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Mongoose / Joi / Zod u otros
  if (err?.name === 'ValidationError') {
    console.error('ValidationError details:', JSON.stringify(err.errors, null, 2));
    return res.status(422).json({
      success: false, error: true, code: 'VALIDATION_ERROR',
      message: 'Validación fallida',
      details: err.errors ?? String(err)
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false, error: true, code: 'SERVER_ERROR',
    message: 'Error interno'
  });
}
