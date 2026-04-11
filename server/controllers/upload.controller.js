// Subida genérica a Cloudinary, con ?folder=
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export async function uploadImageController(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: true, message: "No file" });

    const folder = String(req.query.folder || "mtz/misc").trim(); // ej: mtz/seller-apps/ci
    const up = await cloudinary.uploader.upload(req.file.path, { folder });
    try { fs.unlinkSync(req.file.path); } catch { }

    return res.json({
      error: false,
      data: {
        url: up.secure_url,
        public_id: up.public_id,
        width: up.width,
        height: up.height,
        bytes: up.bytes,
        format: up.format,
        folder: up.folder,
      }
    });
  } catch (e) {
    next(e);
  }
}
