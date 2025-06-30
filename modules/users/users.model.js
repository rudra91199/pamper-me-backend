import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  email: { type: String, required: true },
  lastName: { type: String },
  city: { type: String },
  apartment: { type: String },
  house: { type: String },
  road: { type: String },
  block: { type: String },
  area: { type: String },
  phone: { type: Number },
  image: {
    type: Object,
  },
  shippingAddress: {
    type: Object,
  },
});

export default mongoose.model("users", userSchema);
