// server/middlewares/multer.js
import multer from "multer";
import fs from "fs";
import path from "path";

/* Carpeta destino (local) */
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* Config desde ENV (con defaults seguros) */
const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB || 10); // 10 MB por archivo
const MAX_FILES_PER_REQ = Number(process.env.UPLOAD_MAX_FILES || 6);   // 5 archivos por request

/* Tipos permitidos (ajusta si necesitas más) */
const ALLOWED_MIME = new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic",
    "application/pdf"
]);

/* Storage local (si migras a S3/Cloudinary: cambia a memoryStorage o multer-s3) */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const orig = file.originalname || "file";
        const ext = path.extname(orig).toLowerCase();
        const base = path.basename(orig, ext)
            .replace(/[^a-zA-Z0-9._-]+/g, "_")        // limpia caracteres raros
            .replace(/_+/g, "_")
            .slice(0, 60);                             // límite razonable
        cb(null, `${Date.now()}_${base}${ext}`);
    }
});

/* Filtro por tipo */
function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Tipo no permitido: ${file.mimetype}`));
    }
    cb(null, true);
}

/* Uploader por defecto (bueno para la mayoría de rutas) */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // bytes
        files: MAX_FILES_PER_REQ
    }
});

/**
 * Factory para crear uploaders con límites diferentes por ruta.
 *   Ej: export const uploadProofMdw = makeUploader({ maxFiles: 3, maxSizeMB: 15 });
 */
export function makeUploader({ maxFiles = MAX_FILES_PER_REQ, maxSizeMB = MAX_FILE_SIZE_MB, allowed = ALLOWED_MIME } = {}) {
    const customFilter = (req, file, cb) => {
        if (!allowed.has(file.mimetype)) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", `Tipo no permitido: ${file.mimetype}`));
        }
        cb(null, true);
    };
    return multer({
        storage,
        fileFilter: customFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024,
            files: maxFiles
        }
    });
}

export default upload;
