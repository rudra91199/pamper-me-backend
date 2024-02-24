import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model("services", serviceSchema);
