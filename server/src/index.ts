import express from "express";
import { ENV } from "./config/environment.ts";
import { connectDB } from "./config/database.config.ts";
import userRoutes from "./routes/user.route.ts";

const app = express();
const PORT = ENV.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
connectDB();

app.use("/api/users", userRoutes);