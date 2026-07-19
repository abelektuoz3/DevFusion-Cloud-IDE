// backend/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable trust proxy for Render
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Compression
app.use(compression());

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://dev-fusion-cloud-ide.vercel.app",
  "https://devfusion-cloud-ide.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Import routes
const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspaces");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");
const settingsRoutes = require("./routes/settings");
const notificationRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const projectRoutes = require("./routes/projects");
const runRoutes = require("./routes/run");
const profileRoutes = require("./routes/profile"); // ✅ NEW

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/run", runRoutes);
app.use("/api/profile", profileRoutes); // ✅ NEW

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "DevFusion Workspace v2 API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DevFusion Workspace v2 API",
    version: "2.0.0",
    status: "Running",
    endpoints: {
      auth: "/api/auth",
      workspaces: "/api/workspaces",
      folders: "/api/folders",
      files: "/api/files",
      settings: "/api/settings",
      notifications: "/api/notifications",
      search: "/api/search",
      projects: "/api/projects",
      run: "/api/run",
      profile: "/api/profile", // ✅ NEW
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
});

module.exports = app;
