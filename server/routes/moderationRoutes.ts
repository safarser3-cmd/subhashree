import { Router } from "express";
import { moderateMessageService } from "../services/moderationService";
import redis from "../config/redis";

const router = Router();

// In-memory fallback if Redis is down
const fallbackRateLimit = new Map<string, { count: number, resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 10;

router.post("/", async (req, res) => {
  // Try to get a reliable IP address (handles proxies like Cloud Run / Nginx)
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  const key = `rate_limit:moderation:${ip}`;

  // Redis Rate Limiting
  if (redis) {
    try {
      const currentCount = await redis.incr(key);
      if (currentCount === 1) {
        await redis.expire(key, 600); // 600 seconds = 10 minutes
      }

      if (currentCount > MAX_REQUESTS) {
        return res.status(429).json({ 
          safe: false, 
          reason: "You are posting too fast! Please wait 10 minutes before sending more messages." 
        });
      }
    } catch (err) {
      console.error("Redis rate limiting error:", err);
    }
  } else {
    // In-memory Rate Limiting Fallback
    const now = Date.now();
    const record = fallbackRateLimit.get(key);
    if (record) {
      if (now > record.resetAt) {
        fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        record.count++;
        if (record.count > MAX_REQUESTS) {
          return res.status(429).json({ 
            safe: false, 
            reason: "You are posting too fast! Please wait 10 minutes before sending more messages." 
          });
        }
      }
    } else {
      fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    }
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ safe: false, reason: "Text is required" });
  }

  const result = await moderateMessageService(text);
  res.json(result);
});

export default router;
