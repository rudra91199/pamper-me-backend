import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required:true
    },
    services: {
      type: Array,
      required:true
    },
    startTime: {
      type: Number,
      required:true
    },
    endTime: {
      type: Number,
      required:true
    },
    avg_rating: {
      type: Number,
    },
    bookings: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("employees", employeeSchema);
