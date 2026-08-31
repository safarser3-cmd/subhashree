import { Router } from "express";
import redis from "../config/redis";
import { getAuth, getFirestore, FieldValue } from "../config/firebaseAdmin";

const router = Router();
const fallbackRateLimit = new Map<string, { count: number, resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_LIKE_REQUESTS = 50; 
const MAX_LOVE_REQUESTS = 100;

function checkRateLimit(ip: string, action: string, maxRequests: number): boolean {
  const key = `rate_limit:${action}:${ip}`;
  
  if (redis) {
    return true; 
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

// Middleware to verify Firebase Auth token
const verifyFirebaseAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, reason: "Unauthorized: Missing Bearer token" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase auth verification failed:", error);
    return res.status(401).json({ success: false, reason: "Unauthorized: Invalid token" });
  }
};

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
    } catch (e) {}
  }
  res.json({ success: true });
});

router.post("/fanart", verifyFirebaseAuth, async (req: any, res: any) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  const uid = req.user.uid;
  
  const ipAllowed = await checkRedisRateLimit(ip, "fanart", 10);
  const userAllowed = await checkRedisRateLimit(uid, "fanart_user", 10);
  
  if (!ipAllowed || !userAllowed) {
    return res.status(429).json({ success: false, reason: "Too many submissions! Try again later." });
  }

  const { title, artistName, artistHandle, category, size, imageUrl, videoUrl, textEssay, description } = req.body;
  
  if (!title || typeof title !== 'string' || title.length > 160) {
    return res.status(400).json({ success: false, reason: "Invalid or missing title." });
  }
  if (!artistName || typeof artistName !== 'string' || artistName.length > 120) {
    return res.status(400).json({ success: false, reason: "Invalid or missing artist name." });
  }

  const db = getFirestore();
  const artRef = db.collection('fan_art').doc(); // generate secure server-side ID
  
  const artPayload = {
    id: artRef.id,
    userId: uid,
    title: title.trim(),
    artistName: artistName.trim(),
    artistHandle: artistHandle ? String(artistHandle).trim() : null,
    category: category ? String(category) : "Digital Illustration",
    size: size ? String(size) : null,
    imageUrl: imageUrl && String(imageUrl).startsWith('https://') ? String(imageUrl).trim() : null,
    videoUrl: videoUrl && String(videoUrl).startsWith('https://') ? String(videoUrl).trim() : null,
    textEssay: textEssay ? String(textEssay).substring(0, 5000) : null,
    description: description ? String(description).substring(0, 2000) : null,
    submittedAt: new Date().toISOString(),
    likes: 1,
    isFeatured: false,
    status: 'pending' // strict moderation enforcement
  };

  try {
    await artRef.set(artPayload);
    res.json({ success: true, artId: artRef.id });
  } catch (err) {
    console.error("Error saving fanart:", err);
    res.status(500).json({ success: false, reason: "Server error saving fan art." });
  }
});

router.get("/fanart/my-uploads", verifyFirebaseAuth, async (req: any, res: any) => {
  const uid = req.user.uid;
  try {
    const db = getFirestore();
    const snapshot = await db.collection('fan_art')
      .where('userId', '==', uid)
      .get();
      
    const uploads: any[] = [];
    snapshot.forEach(doc => {
      uploads.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory (simplest without requiring composite indexes)
    uploads.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    
    res.json({ success: true, data: uploads });
  } catch (err) {
    console.error("Error fetching my uploads:", err);
    res.status(500).json({ success: false, reason: "Server error fetching uploads." });
  }
});

router.post("/fanart/like", async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  
  const allowed = await checkRedisRateLimit(ip, "fanart_like", MAX_LIKE_REQUESTS);
  if (!allowed) {
    return res.status(429).json({ success: false, reason: "Too many likes!" });
  }

  const { id } = req.body;
  if (id && typeof id === 'string') {
    try {
      const db = getFirestore();
      const ref = db.collection('fan_art').doc(id);
      await ref.update({
        likes: FieldValue.increment(1)
      });
    } catch (e) {
      console.error("Error liking fanart directly:", e);
    }
  }
  res.json({ success: true });
});

export default router;
