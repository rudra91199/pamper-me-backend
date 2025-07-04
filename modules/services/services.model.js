import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    parlourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parlours",
      required: true,
    },
    category: { type: Object, required: true },
    shortDescription: { type: String, required: true },
    images: [{ type: Object, required: true }],
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    steps: [{ type: String, required: true }],
    benefits: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { strict: false, timestamps: true }
);

export default mongoose.model("services", serviceSchema);
