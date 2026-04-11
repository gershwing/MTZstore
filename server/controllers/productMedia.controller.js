import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ERR } from '../utils/httpError.js';

/* ======================================================
   CLOUDINARY CONFIG
====================================================== */
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

/* ======================================================
   HELPERS
====================================================== */
async function uploadAndCleanup(file, options) {
  if (!file?.path) {
    throw ERR.VALIDATION('Archivo inválido o no presente');
  }

  try {
    const { secure_url } = await cloudinary.uploader.upload(
      file.path,
      options
    );
    return secure_url;
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch {
      /* noop */
    }
  }
}

/* ======================================================
   SUBIR IMÁGENES GENERALES
====================================================== */
export async function uploadImages(req, res, next) {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      throw ERR.VALIDATION('No se recibieron archivos');
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    const urls = await Promise.all(
      files.map((file) => uploadAndCleanup(file, options))
    );

    return res.ok({ images: urls });
  } catch (error) {
    return next(error);
  }
}

/* ======================================================
   SUBIR IMÁGENES DE BANNER
====================================================== */
export async function uploadBannerImages(req, res, next) {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      throw ERR.VALIDATION('No se recibieron archivos');
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    const urls = await Promise.all(
      files.map((file) => uploadAndCleanup(file, options))
    );

    return res.ok({ images: urls });
  } catch (error) {
    return next(error);
  }
}

/* ======================================================
   ELIMINAR IMAGEN DE CLOUDINARY
====================================================== */
export async function removeImageFromCloudinary(req, res, next) {
  try {
    const imgUrl = req.query.img;
    if (!imgUrl || typeof imgUrl !== 'string') {
      throw ERR.VALIDATION('img es requerido');
    }

    const parts = imgUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.').slice(0, -1).join('.');

    if (!publicId) {
      throw ERR.VALIDATION('URL de imagen inválida');
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.ok(result);
  } catch (error) {
    return next(error);
  }
}
