import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    clientInfo: {
      type: Object,
      required: true,
    },
    OrderedProduct: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    coupon: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    PaymentMethod: {
      type: String,
      required: true,
    },
    paid: {
      type: Boolean,
      required: true,
    },
    shippingCharge: {
      type: Number,
      required: true,
    },
    vat: {
      type: Number,
      required: false,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("orders", orderSchema);
