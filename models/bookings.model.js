import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bookingDates: { type: Array, required: true },
    location: { type: Object, required: true },
    email:{ type: String, required: true},
    phone: { type: Number, required: true },
    employee: { type: String, required: true },
    serviceId: { type: String, required: true },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model("bookings", bookingSchema);
