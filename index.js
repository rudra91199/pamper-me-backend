import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/index.route.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const uri = process.env.MONGO_URI;

/*--connection--*/
const connection = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    app.listen(port, () => {
      console.log("Listening at port", port);
    });
  } catch (error) {
    throw error;
  }
};
connection();

// middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

//routes
app.use("/api", router);

app.get("/", async (req, res) => {
  res.send("Server is runing");
});

// database user and password
// pamperme20
// pamper-me-backend.vercel.app
