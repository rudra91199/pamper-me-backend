import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bookingDates: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        startTimeInMinutes: { type: Number, required: true },
        endTimeInMinutes: { type: Number, required: true },
      },
    ],
    address: { type: Object, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
    },
    parlourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "parlours",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "services",
      required: true,
    },
    isOnline: {
      type: Boolean,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model("bookings", bookingSchema);
