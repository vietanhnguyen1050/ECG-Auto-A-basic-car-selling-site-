import express from "express";
import cors from "cors";
import path from "node:path";
import { ENV } from "./config/environment.ts";
import { connectDB } from "./config/database.config.ts";
import authRoutes from "./routes/auth.route.ts";
import userRoutes from "./routes/user.route.ts";
import carRoutes from "./routes/car.route.ts";
import brandRoutes from "./routes/brand.route.ts";
import bidRoutes from "./routes/bid.route.ts";
import adminRoutes from "./admin/route.ts";
import { startAuctionSessionMonitor } from "./admin/auction-session.ts";

const app = express();
const PORT = Number(ENV.PORT) || 3000;

const allowedOrigins = ENV.CORS_ORIGINS;

const corsOrigin: cors.CorsOptions["origin"] = (origin, callback) => {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Không được phép CORS từ origin này"));
};

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

let isBootstrapped = false;

const bootstrap = async () => {
  if (isBootstrapped) return;
  await connectDB();
  startAuctionSessionMonitor();
  isBootstrapped = true;
};

app.use("/ecg/auth", authRoutes);
app.use("/ecg/user", userRoutes);
app.use("/ecg/car", carRoutes);
app.use("/ecg/bid", bidRoutes);
app.use("/ecg/brand", brandRoutes);
// app.use("/ecg/auction", auctionRoutes);
app.use("/ecg/admin", adminRoutes);

if (!process.env.VERCEL) {
  bootstrap()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Khởi động server thất bại:", error);
      process.exit(1);
    });
}

export { app, bootstrap };
export default app;