import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    Brand: { type: String, required: true },
    name: { type: String, required: true},
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    reviews: { type: Array },
  },
  { strict: false }
);

export default mongoose.model("products", productSchema);
