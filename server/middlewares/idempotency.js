// server/middlewares/idempotency.js
import Idem from "../models/idempotencyKey.model.js";
import { hashPayload } from "../utils/idempotency.js"; // tu helper existente
import { ERR } from "../utils/httpError.js";

function computeHash({ body, op, tenant, userId }) {
  // Incluye datos que cambian el efecto de la operación
  return hashPayload({ body, op, tenant, userId });
}

/**
 * ensureIdempotent('payment:create') / ensureIdempotent('payment:capture')
 * Requiere header 'Idempotency-Key' en métodos no idempotentes (POST/PATCH).
 */
export function ensureIdempotent(op) {
  return async function idemMiddleware(req, res, next) {
    try {
      const method = (req.method || "GET").toUpperCase();
      if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) return next();

      const key = req.header("Idempotency-Key");
      if (!key) return next(ERR.VALIDATION({ "Idempotency-Key": "required" }));

      const tenant = req?.tenant?.storeId ? String(req.tenant.storeId) : undefined;
      const userId = req?.userId || req?.user?._id;
      const payloadHash = computeHash({ body: req.body, op, tenant, userId });

      // ¿ya existe?
      let row = await Idem.findOne({ key, op }).lean();
      if (row) {
        // Si hash distinto → la misma clave con otro payload es inválida
        if (row.payloadHash !== payloadHash) {
          return next(ERR.CONFLICT("Idempotency-Key reuse with different payload"));
        }
        if (row.status === "COMPLETED") {
          // Devuelve la misma respuesta guardada (cache hit)
          return res.ok ? res.ok(row.response) : res.status(200).json(row.response);
        }
        if (row.status === "PENDING") {
          // Otro request en curso / retry demasiado pronto
          return next(ERR.CONFLICT("Request already in progress"));
        }
        // FAILED → permitimos reintentar con mismo hash
      } else {
        // Crear ficha PENDING
        await Idem.create({ key, op, tenant, userId, payloadHash, status: "PENDING" });
      }

      // Guardamos funciones para finalizar
      res.locals.__idem = { key, op, tenant, userId, payloadHash };
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

/** Llama al terminar con éxito para sellar la respuesta */
export async function sealIdempotentSuccess(req, resPayload) {
  const idem = res.locals.__idem;
  if (!idem) return;
  await Idem.updateOne(
    { key: idem.key, op: idem.op, payloadHash: idem.payloadHash },
    { $set: { status: "COMPLETED", response: resPayload }, $unset: { error: 1 } }
  ).catch(() => { });
}

/** Llama en error para marcar FAILED (opcional) */
export async function sealIdempotentError(req, err) {
  const idem = res.locals.__idem;
  if (!idem) return;
  await Idem.updateOne(
    { key: idem.key, op: idem.op, payloadHash: idem.payloadHash },
    { $set: { status: "FAILED", error: err ? { message: err.message, code: err.code } : {} } }
  ).catch(() => { });
}
