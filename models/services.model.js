import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title:{type:String, required:true}
}, { strict: false });

export default mongoose.model("services", serviceSchema);
