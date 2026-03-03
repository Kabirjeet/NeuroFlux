import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("✅ MongoDB Connected Successfully");
  process.exit(0);
} catch (error) {
  console.error("❌ Connection Error:");
  console.error(error.message);
  process.exit(1);
}