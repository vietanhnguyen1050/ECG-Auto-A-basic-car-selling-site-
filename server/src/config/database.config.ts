import mongoose from "mongoose";
import { ENV } from "./environment.ts";

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI as string);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
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