import mongoose from "mongoose";
import connectDb from "../config/connectDb.js";
import Product from "../models/product.modal.js";

(async () => {
  await connectDb();
  const res = await Product.updateMany(
    { stockMinimo: { $exists: false } },
    { $set: { stockMinimo: 0 } }
  );
  console.log("Productos actualizados:", res.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
})();
