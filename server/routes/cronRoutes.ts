import { Router } from "express";
import { fetchAndCacheSocialMetrics } from "./socialRoutes";
import { syncMessagesToFirestore } from "../services/firestoreSync";

const router = Router();

// Endpoint for Vercel Cron to trigger the Apify/Twitter scrape (Every 30 mins)
router.get("/social", async (req, res) => {
  try {
    // Note: In production on Vercel, you should secure this by checking req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`
    console.log("[Vercel Cron] Triggering Social Metrics Fetch...");
    await fetchAndCacheSocialMetrics();
    res.json({ success: true, message: "Social metrics updated via Cron." });
  } catch (error) {
    console.error("[Vercel Cron] Social metrics error:", error);
    res.status(500).json({ success: false });
  }
});

// Endpoint for Vercel Cron to trigger the Redis -> Firestore Batch Sync (Every 15 mins)
router.get("/sync", async (req, res) => {
  try {
    console.log("[Vercel Cron] Triggering Firestore Sync...");
    await syncMessagesToFirestore();
    res.json({ success: true, message: "Firestore sync completed via Cron." });
  } catch (error) {
    console.error("[Vercel Cron] Sync error:", error);
    res.status(500).json({ success: false });
  }
});

export default router;
