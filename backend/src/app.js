import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import fs from "fs";
import config from "./config/index.js";
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/video.js";
import adminRoutes from "./routes/admin.js";

export const createApp = (io) => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan("dev"));

  if (process.env.NODE_ENV !== "test") {
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { message: "Too many attempts. Please try again later." },
    });

    const uploadLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { message: "Upload limit reached. Please try again later." },
    });

    app.use("/api/auth/login", authLimiter);
    app.use("/api/auth/register", authLimiter);
    app.use("/api/videos/upload", uploadLimiter);
  }

  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  if (io) app.set("io", io);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/videos", videoRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ message: "File too large. Maximum size is 100MB." });
    }
    if (err.message?.includes("Invalid file type")) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error." });
  });

  return app;
};
