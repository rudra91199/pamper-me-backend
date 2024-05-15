import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    _id: { type: String },
    Brand: { type: String, required: true },
    name: { type: String, required: true},
    slug: { type: String, required: true},
    sku: { type: String},
    description: { type: String},
    meta_description: { type: String},
    short_description: { type: String},
    price: { type: String},
    sale_price: { type: String},
    on_sale: { type: String},
    short_description: { type: String},
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    reviews: { type: Array },
    attributes: { type: Array },
    tags: { type: Array },
    images: { type: Array },
    variations: { type: Array },
  },
  { strict: false }
);

export default mongoose.model("products", productSchema);
