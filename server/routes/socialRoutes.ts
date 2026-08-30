import { Router } from "express";
import redis from "../config/redis";
import { scrapeTwitter } from "../services/twitterService";
import { scrapeInstagram } from "../services/apifyService";

const router = Router();

// In-memory fallback cache
export let memCachedMetrics: {
  data: any;
  lastFetched: number;
} | null = null;

export async function fetchAndCacheSocialMetrics() {
  console.log("[Background Worker] Fetching latest social metrics from APIs...");
  const apifyToken = process.env.APIFY_API_TOKEN;
  
  const { instagramData, isLiveApify, apifyError } = await scrapeInstagram(apifyToken);

  // Call X / Twitter API v2 scraper
  const twitterResult = await scrapeTwitter('againsubha');

  let twitterData: any = {
    handle: '@againsubha',
    status: 'Official X Profile',
    profileUrl: 'https://x.com/againsubha',
    bio: 'Official X profile of Shubhashree Sahu. Follow @againsubha for direct updates, live thoughts, and announcements.',
    verified: true,
    badge: 'Official Account',
    source: 'official-link',
    isLive: false
  };

  if (twitterResult.isLive && twitterResult.count !== null) {
    const followers = twitterResult.count;
    let display = `${followers.toLocaleString()}`;
    if (followers >= 1000000) {
      display = `${(followers / 1000000).toFixed(2)}M`;
    } else if (followers >= 1000) {
      display = `${(followers / 1000).toFixed(1)}K`;
    }

    twitterData = {
      ...twitterData,
      followers: followers,
      followersDisplay: display,
      following: twitterResult.followingCount ? String(twitterResult.followingCount.toLocaleString()) : '—',
      postsCount: twitterResult.tweetCount ? String(twitterResult.tweetCount.toLocaleString()) : '—',
      bio: twitterResult.bio || twitterData.bio,
      avatar: twitterResult.pf || null,
      verified: twitterResult.verified,
      isLive: true,
      source: 'x-api-v2'
    };
  }

  const payload = {
    timestamp: new Date().toISOString(),
    isApifyConfigured: Boolean(apifyToken),
    isLiveFromApify: isLiveApify,
    apifyError: apifyError,
    isTwitterConfigured: Boolean(process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN),
    isLiveFromTwitter: twitterResult.isLive,
    twitterError: twitterResult.error || null,
    profiles: {
      instagram: instagramData,
      twitter: twitterData,
      youtube: {
        handle: '@subhaback',
        status: 'Official Channel',
        profileUrl: 'https://www.youtube.com/@subhaback',
        bio: 'Official YouTube home of Shubhashree Sahu. Subscribe to @subhaback for fashion lookbooks, personal vlogs, and video updates.',
        verified: true,
        badge: 'Official Channel',
        source: 'official-link'
      }
    }
  };

  // Save to Cache (Redis or Memory) with a safe TTL (e.g. 1 hour)
  if (redis) {
    try {
      await redis.setex("social-metrics-cache", 3600, JSON.stringify(payload));
    } catch (err) {
      console.error("Redis set error:", err);
    }
  } else {
    memCachedMetrics = {
      data: payload,
      lastFetched: Date.now()
    };
  }

  return payload;
}

router.get("/social-metrics", async (req, res) => {
  // 1. Return from Redis or memory cache instantly
  if (redis) {
    try {
      const cachedStr = await redis.get("social-metrics-cache");
      if (cachedStr) {
        return res.json(JSON.parse(cachedStr));
      }
    } catch (err) {
      console.error("Redis get error:", err);
    }
  } else if (memCachedMetrics) {
    return res.json(memCachedMetrics.data);
  }

  // 2. Only if the cache is completely empty (e.g. first boot), fetch it manually
  console.log("Cache empty. Fetching social metrics synchronously for the first time...");
  const payload = await fetchAndCacheSocialMetrics();
  res.json(payload);
});

export default router;
