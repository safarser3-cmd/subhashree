import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";

// Load env before other imports
dotenv.config({ override: true });

import socialRoutes, { fetchAndCacheSocialMetrics } from "./routes/socialRoutes";
import moderationRoutes from "./routes/moderationRoutes";
import contentRoutes from "./routes/contentRoutes";
import messageRoutes from "./routes/messageRoutes";
import cronRoutes from "./routes/cronRoutes";
import interactionRoutes from "./routes/interactionRoutes";
import { syncMessagesToFirestore } from "./services/firestoreSync";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Security headers (helmet) - disables CSP so Vite's HMR and inline styles work seamlessly
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS — allow same origin in production, open in dev
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.APP_URL || false)
    : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50kb' })); // Limit body size to prevent DoS

// --- Background Tasks ---
// In Vercel (serverless), we cannot use setInterval. Vercel Cron will hit the /api/cron routes instead.
// We only run these local intervals if we are NOT in Vercel.
if (!process.env.VERCEL) {
  const THIRTY_MINUTES = 30 * 60 * 1000;
  setInterval(() => {
    fetchAndCacheSocialMetrics().catch(console.error);
  }, THIRTY_MINUTES);
  
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  setInterval(() => {
    syncMessagesToFirestore().catch(console.error);
  }, FIFTEEN_MINUTES);

  // Optionally do an initial fetch immediately if you want to prime the cache (local only)
  fetchAndCacheSocialMetrics().catch(console.error);
  syncMessagesToFirestore().catch(console.error);
}

// --- API Routes ---
app.use("/api", socialRoutes);
app.use("/api/moderate", moderationRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api/interactions", interactionRoutes);

// Health check endpoint for production
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Vite / Static Serving / Local Start ---
if (!process.env.VERCEL) {
  const startLocalServer = async () => {
    if (process.env.NODE_ENV !== "production") {
      // Development mode
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Production mode locally
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT as number, "0.0.0.0", () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  };

  startLocalServer();
}

export default app;
