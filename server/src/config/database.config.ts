import mongoose from "mongoose";
import { ENV } from "./environment.ts";

const connectDB = async () => {
  try {
    if (!ENV.MONGODB_URI) {
      throw new Error("Thiếu MONGODB_URI trong biến môi trường");
    }

    await mongoose.connect(ENV.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed successfully");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

export { connectDB, closeDB };