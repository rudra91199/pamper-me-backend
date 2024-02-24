import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Brand: { type: String, required: true },
    name: { type: String, required: true},
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
  },
  { strict: false }
);

export default mongoose.model("products", productSchema);
