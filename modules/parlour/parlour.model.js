import { model, Schema } from "mongoose";

const ParlourSchema = new Schema(
  {
    title: { type: String, required: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "DashboardUsers",
    },
    image: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "services",
      },
    ],
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "employees",
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "bookings",
      },
    ],
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
  },
  { timestamps: true }
);

export const Parlour = model("Parlours", ParlourSchema);
