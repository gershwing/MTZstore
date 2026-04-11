export class HttpError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.status = status;     // HTTP status (ej. 403)
    this.code = code;         // código interno (ej. 'TENANT_FORBIDDEN')
    this.details = details;   // opcional (ej. campos inválidos)
  }
}

export const ERR = {
  UNAUTHORIZED: (msg = 'No autenticado') => new HttpError(401, 'UNAUTHORIZED', msg),
  FORBIDDEN: (msg = 'Acceso denegado') => new HttpError(403, 'FORBIDDEN', msg),
  TENANT_FORBIDDEN: (msg = 'No tienes membresía en esta tienda') => new HttpError(403, 'TENANT_FORBIDDEN', msg),
  PERMISSION_DENIED: (perm) => new HttpError(403, 'PERMISSION_DENIED', `Requiere permiso: ${perm}`),
  NOT_FOUND: (msg = 'Recurso no encontrado') => new HttpError(404, 'NOT_FOUND', msg),
  CONFLICT: (msg = 'Conflicto') => new HttpError(409, 'CONFLICT', msg),
  VALIDATION: (details) => new HttpError(422, 'VALIDATION_ERROR', 'Validación fallida', details),
  RATE_LIMIT: (msg = 'Demasiadas solicitudes') => new HttpError(429, 'RATE_LIMIT', msg),
  SERVER: (msg = 'Error interno') => new HttpError(500, 'SERVER_ERROR', msg),
};
