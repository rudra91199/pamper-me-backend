import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Brand: { type: String },
    name: { type: String},
    slug: { type: String},
    sku: { type: String},
    description: { type: String},
    meta_description: { type: String},
    short_description: { type: String},
    price: { type: String},
    sale_price: { type: String},
    on_sale: { type: String},
    short_description: { type: String},
    category: { type: String },
    subcategory: { type: String},
    reviews: { type: Array },
    attributes: { type: Array },
    tags: { type: Array },
    images: { type: Array },
    variations: { type: Array },
  },
  { strict: false }
);

export default mongoose.model("products", productSchema);
