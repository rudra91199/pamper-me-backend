import mongoose, { Schema } from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    parlourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parlours",
    },
    image: { type: Object },
    avg_rating: {
      type: Number,
      default: 0,
    },
    // workingTime: {
    //   startTime: { type: String, required: true },
    //   endTime: { type: String, required: true },
    //   startTimeInMinutes: { type: Number, required: true },
    //   endTimeInMinutes: { type: Number, required: true },
    // },
    bookings: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        startTimeInMinutes: { type: Number, required: true },
        endTimeInMinutes: { type: Number, required: true },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "bookings",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("employees", employeeSchema);
