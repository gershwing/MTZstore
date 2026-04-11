import { Router } from "express";
import { uploadImageController } from "../controllers/upload.controller.js";
import upload from "../middlewares/multer.js"; // tu multer existente

const r = Router();
r.post("/image", upload.single("image"), uploadImageController); // campo = image
export default r;
