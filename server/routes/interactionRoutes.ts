import { Router } from "express";
import redis from "../config/redis";

const router = Router();
const fallbackRateLimit = new Map<string, { count: number, resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_LIKE_REQUESTS = 50; // 50 likes per 10 mins
const MAX_LOVE_REQUESTS = 100; // 100 love taps per 10 mins

function checkRateLimit(ip: string, action: string, maxRequests: number): boolean {
  const key = `rate_limit:${action}:${ip}`;
  
  if (redis) {
    // Note: async redis incr is tricky in a sync function, we'll handle it inline
    return true; // placeholder, actual logic below
  } else {
    const now = Date.now();
    const record = fallbackRateLimit.get(key);
    if (record) {
      if (now > record.resetAt) {
        fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return true;
      } else {
        record.count++;
        return record.count <= maxRequests;
      }
    } else {
      fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
  }
}

async function checkRedisRateLimit(ip: string, action: string, maxRequests: number): Promise<boolean> {
  if (!redis) return checkRateLimit(ip, action, maxRequests);
  const key = `rate_limit:${action}:${ip}`;
  try {
    const currentCount = await redis.incr(key);
    if (currentCount === 1) await redis.expire(key, 600);
    return currentCount <= maxRequests;
  } catch (err) {
    return true; // fail open if redis is down
  }
}

router.post("/love", async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  
  const allowed = await checkRedisRateLimit(ip, "love", MAX_LOVE_REQUESTS);
  if (!allowed) {
    return res.status(429).json({ success: false, reason: "Too many love taps!" });
  }

  if (redis) {
    try {
      await redis.incr("love_meter_pending_sync");
      // Could also broadcast SSE here if we wanted true live without Firestore, but we can stick to Firestore for love meter read
    } catch (e) {}
  }
  res.json({ success: true });
});

router.post("/fanart", async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  
  const allowed = await checkRedisRateLimit(ip, "fanart", 10); // max 10 fan arts per 10 mins
  if (!allowed) {
    return res.status(429).json({ success: false, reason: "Too many submissions! Try again later." });
  }

  const art = req.body;
  if (!art || !art.id) return res.status(400).json({ success: false });

  if (redis) {
    try {
      await redis.lpush("fanart_pending_sync", JSON.stringify(art));
    } catch (e) {}
  }
  res.json({ success: true });
});

router.post("/fanart/like", async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  
  const allowed = await checkRedisRateLimit(ip, "fanart_like", MAX_LIKE_REQUESTS);
  if (!allowed) {
    return res.status(429).json({ success: false, reason: "Too many likes!" });
  }

  const { id } = req.body;
  if (id) {
    try {
      const PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || "gen-lang-client-0250984123";
      const DB_ID = process.env.FIRESTORE_DATABASE_ID || "ai-studio-shubhashreesahuf-b7597c00-ccb8-4efe-93b3-07b8951f4efc";
      const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;
      
      const currentRes = await fetch(`${FIRESTORE_BASE_URL}/fan_art/${id}`);
      if (currentRes.ok) {
        const currentDoc = await currentRes.json();
        const currentLikes = parseInt(currentDoc.fields?.likes?.integerValue || "1", 10);
        
        await fetch(`${FIRESTORE_BASE_URL}/fan_art/${id}?updateMask.fieldPaths=likes`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: { likes: { integerValue: currentLikes + 1 } } })
        });
      }
    } catch (e) {
      console.error("Error liking fanart directly:", e);
    }
  }
  res.json({ success: true });
});

export default router;
