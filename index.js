// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import router from "./routes/index.route.js";

// dotenv.config();
// const port = process.env.PORT || 5000;
// const app = express();
// const uri = process.env.MONGO_URI;

// /*--connection--*/
// const connection = async () => {
//   try {
//     mongoose.set("strictQuery", true);
//     await mongoose.connect(uri);
//     app.listen(port, () => {
//       console.log("Listening at port", port);
//     });
//   } catch (error) {
//     throw error;
//   }
// };
// connection();

// // middleware
// app.use(cors());
// app.use(express.json({ limit: "5mb" }));

// //routes
// app.use("/api", router);

// app.get("/", async (req, res) => {
//   res.send("Server is runing");
// });
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "../routes/index.route.js"; // Adjust if file is elsewhere

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Serverless Express is working!");
});

// Connect to MongoDB only once during cold start
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

const handler = async (req, res) => {
  await connectDB();
  return serverless(app)(req, res);
};

export default handler;
