import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config({ override: true });

// Initialize Redis if configured
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    console.log("Redis cache enabled.");
  } catch (error) {
    console.error("Failed to initialize Redis (possibly invalid URL). Using in-memory cache instead.", error);
    redis = null;
  }
} else {
  console.log("No REDIS_URL found, using in-memory cache.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory fallback cache
  let memCachedMetrics: {
    data: any;
    lastFetched: number;
  } | null = null;

  // --- X / TWITTER (Official API v2 Scraper) ---
  const scrapeTwitter = async (
    username = 'againsubha',
    bearerToken = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN
  ) => {
    if (!bearerToken) {
      return {
        count: null,
        error: 'TWITTER_BEARER_TOKEN not configured',
        isLive: false
      };
    }

    try {
      const url =
        `https://api.twitter.com/2/users/by/username/${username}` +
        `?user.fields=public_metrics,description,profile_image_url,verified`;

      const tokenHeader = bearerToken.startsWith('Bearer ')
        ? bearerToken
        : `Bearer ${bearerToken}`;

      const response = await fetch(url, {
        headers: {
          Authorization: tokenHeader,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorDetail = `Status ${response.status}`;
        try {
          const bodyJson: any = await response.json();
          if (bodyJson?.title) errorDetail = `${bodyJson.title} (${bodyJson.detail || response.status})`;
        } catch {
          // ignore parse error
        }

        // Informational log instead of noisy console.error for expected API credit/rate constraints
        console.log(`[X] API notice: ${errorDetail}`);
        return {
          count: null,
          error: errorDetail,
          status: response.status,
          isLive: false
        };
      }

      const user: any = await response.json();
      const metrics = user.data?.public_metrics;

      return {
        count: metrics?.followers_count ?? null,
        followingCount: metrics?.following_count ?? null,
        tweetCount: metrics?.tweet_count ?? null,
        bio: user.data?.description ?? null,
        pf: user.data?.profile_image_url?.replace('_normal', '') ?? null,
        verified: user.data?.verified ?? true,
        status: response.status,
        isLive: true
      };
    } catch (error: any) {
      console.log('[X] Notice: Connection timeout or unreachable:', error?.message || error);
      return {
        count: null,
        error: error?.message || 'Connection to X API unavailable',
        isLive: false
      };
    }
  };

  // Social Stats API route with Apify & Twitter API v2 integration
  app.get("/api/social-metrics", async (req, res) => {
    const apifyToken = process.env.APIFY_API_TOKEN;
    const now = Date.now();
    const forceRefresh = req.query.force === 'true' || req.query.force === '1';

    // Check Redis or fallback cache (Valid for 3 minutes)
    if (!forceRefresh) {
      if (redis) {
        try {
          const cachedStr = await redis.get("social-metrics-cache");
          if (cachedStr) {
            console.log("Serving social metrics from Redis cache");
            return res.json(JSON.parse(cachedStr));
          }
        } catch (err) {
          console.error("Redis get error:", err);
        }
      } else if (memCachedMetrics && now - memCachedMetrics.lastFetched < 180000) {
        console.log("Serving social metrics from Memory cache");
        return res.json(memCachedMetrics.data);
      }
    }

    let instagramData = {
      followers: 1559122,
      followersDisplay: '1.56M',
      following: '2',
      postsCount: '253',
      growth: 'Live Sync Ready',
      bio: 'Turning reels into real stories✨\nOdisha📍\nEmail 📧 : Collabs@subhashreesocials.in',
      verified: true,
      source: 'live-scraped'
    };

    let isLiveApify = false;
    let apifyError: string | null = null;

    if (apifyToken) {
      try {
        console.log("Fetching live Instagram profile metrics for subhaslyf using Apify Actor...");
        // Apify Instagram Profile Scraper actor call with 30s timeout
        const response = await fetch(
          `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usernames: ["subhaslyf"],
              resultsLimit: 1
            }),
            signal: AbortSignal.timeout(30000)
          }
        );

        if (response.ok) {
          const items: any = await response.json();
          if (Array.isArray(items) && items.length > 0) {
            const profile = items[0];
            const followers = profile.followersCount ?? profile.followers ?? 1559122;
            let display = `${(followers / 1000000).toFixed(2)}M`;
            if (followers < 1000000) {
              display = `${(followers / 1000).toFixed(1)}K`;
            }

            instagramData = {
              followers: followers,
              followersDisplay: display,
              following: String(profile.followsCount ?? profile.followingCount ?? '2'),
              postsCount: String(profile.postsCount ?? profile.mediaCount ?? '253'),
              growth: '+Live from Apify Actor',
              bio: profile.biography || instagramData.bio,
              verified: profile.verified !== undefined ? profile.verified : true,
              source: 'apify-actor'
            };
            isLiveApify = true;
          }
        } else {
          const errText = await response.text();
          console.warn("Apify returned non-200 status:", response.status, errText);
          apifyError = `Apify responded with status ${response.status}`;
        }
      } catch (err: any) {
        console.warn("Apify fetch note:", err?.message || err);
        apifyError = err?.message || "Timeout on live scrape";
      }
    }

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

    // Save to Cache (Redis or Memory)
    if (redis) {
      try {
        await redis.setex("social-metrics-cache", 180, JSON.stringify(payload));
      } catch (err) {
        console.error("Redis set error:", err);
      }
    } else {
      memCachedMetrics = {
        data: payload,
        lastFetched: now
      };
    }

    res.json(payload);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
