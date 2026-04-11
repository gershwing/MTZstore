// scripts/migrate-banners-v1.js
import mongoose from "mongoose";
import BannerV1Model from "../models/bannerV1.model.js"; // tu modelo anterior
import BannerModel from "../models/banner.model.js";

const DEFAULT_STORE_ID = process.env.DEFAULT_STORE_ID; // configura esto

await mongoose.connect(process.env.MONGODB_URI);

const v1 = await BannerV1Model.find({}).lean();

for (const b of v1) {
  await BannerModel.create({
    storeId: DEFAULT_STORE_ID,                 // o resuélvelo por usuario/tenant
    createdBy: null,
    updatedBy: null,
    bannerTitle: b.bannerTitle || "",
    images: (b.images || []).map((u, i) => ({ url: u, publicId: "", alt: "", order: i })),
    alignInfo: ["left", "center", "right"].includes(b.alignInfo) ? b.alignInfo : "left",
    price: typeof b.price === "number" ? b.price : 0,
    catId: b.catId || "",
    subCatId: b.subCatId || "",
    thirdsubCatId: b.thirdsubCatId || "",
    linkType: "none",
    status: "draft",
    isActive: true,
    priority: 0,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  });
}

console.log("✅ Migración de banners completada");
process.exit(0);
