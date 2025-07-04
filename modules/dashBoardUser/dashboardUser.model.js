import mongoose, { model, Schema } from "mongoose";

const DashboardUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "parlour"] },
    parlourId: { type: Schema.Types.ObjectId, ref: "Parlours" },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "blocked"],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const DashboardUser =
  mongoose.models.DashboardUsers ||
  model("DashboardUsers", DashboardUserSchema);
