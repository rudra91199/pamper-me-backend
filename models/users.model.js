import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String},
  email: { type: String, required:true },
  lastName: { type: String},
  location: { type: String},
  phone: { type: Number},
  image: {
    type: Object
  },
});

export default mongoose.model("users", userSchema);
