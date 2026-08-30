import { Router, Response } from "express";
import { moderateMessageService } from "../services/moderationService";
import redis from "../config/redis";

const router = Router();
const fallbackRateLimit = new Map<string, { count: number, resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;

// SSE Clients
const clients = new Set<Response>();

// Redis Pub/Sub for cross-instance SSE broadcasting
if (redis) {
  const subscriber = redis.duplicate();
  subscriber.subscribe("fan_messages_updates", (err) => {
    if (err) console.error("Failed to subscribe to fan_messages_updates", err);
  });

  subscriber.on("message", (channel, message) => {
    if (channel === "fan_messages_updates") {
      for (const client of clients) {
        client.write(`data: ${message}\n\n`);
      }
    }
  });
}

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send an initial heartbeat
  res.write(":\n\n");

  clients.add(res);

  // Heartbeat every 30s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

router.get("/", async (req, res) => {
  try {
    if (redis) {
      const cached = await redis.get("fan_messages_cache");
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    return res.json([]);
  } catch (error) {
    console.error("GET messages error:", error);
    res.status(500).json([]);
  }
});

router.post("/", async (req, res) => {
  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw.split(',')[0].trim() : 'unknown');
  const key = `rate_limit:messages:${ip}`;

  // Rate Limiting
  if (redis) {
    try {
      const currentCount = await redis.incr(key);
      if (currentCount === 1) await redis.expire(key, 600);
      if (currentCount > MAX_REQUESTS) {
        return res.status(429).json({ safe: false, reason: "You are posting too fast! Please wait 10 minutes." });
      }
    } catch (err) { }
  } else {
    const now = Date.now();
    const record = fallbackRateLimit.get(key);
    if (record) {
      if (now > record.resetAt) {
        fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        record.count++;
        if (record.count > MAX_REQUESTS) {
          return res.status(429).json({ safe: false, reason: "You are posting too fast! Please wait 10 minutes." });
        }
      }
    } else {
      fallbackRateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    }
  }

  const { senderName, message, isAnonymous, photoURL, userId } = req.body;
  if (!message || !senderName) {
    return res.status(400).json({ safe: false, reason: "Message and name are required." });
  }

  // Moderate
  const modResult = await moderateMessageService(message);
  if (!modResult.safe) {
    return res.status(400).json(modResult); // Return unsafe reason
  }

  // Safe message - add to cache and pending sync
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId || 'anonymous',
    senderName,
    isAnonymous: !!isAnonymous,
    photoURL: photoURL || null,
    message,
    createdAt: new Date().toISOString(),
    likes: 0
  };

  if (redis) {
    try {
      // Add to Cache (for UI)
      const cached = await redis.get("fan_messages_cache");
      let messages = cached ? JSON.parse(cached) : [];
      messages.unshift(newMsg);
      if (messages.length > 200) messages = messages.slice(0, 200); // Keep last 200
      await redis.set("fan_messages_cache", JSON.stringify(messages));

      // Push to pending sync queue
      await redis.lpush("fan_messages_pending_sync", JSON.stringify(newMsg));
      
      // Publish event for SSE
      await redis.publish("fan_messages_updates", JSON.stringify({ type: "NEW_MESSAGE", data: newMsg }));
    } catch (error) {
      console.error("Redis save message error:", error);
    }
  } else {
    // If no Redis, just broadcast locally
    for (const client of clients) {
      client.write(`data: ${JSON.stringify({ type: "NEW_MESSAGE", data: newMsg })}\n\n`);
    }
  }

  return res.json({ safe: true, message: newMsg });
});

router.post("/like", async (req, res) => {
  const { id } = req.body;
  if (redis) {
    try {
      const cached = await redis.get("fan_messages_cache");
      if (cached) {
        const messages = JSON.parse(cached);
        const idx = messages.findIndex((m: any) => m.id === id);
        if (idx !== -1) {
          messages[idx].likes = (messages[idx].likes || 0) + 1;
          await redis.set("fan_messages_cache", JSON.stringify(messages));
          // Publish like update
          await redis.publish("fan_messages_updates", JSON.stringify({ type: "LIKE_MESSAGE", data: { id: messages[idx].id, likes: messages[idx].likes } }));
        }
      }
    } catch (error) { }
  }
  res.json({ success: true });
});

export default router;
