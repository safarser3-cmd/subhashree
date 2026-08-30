import Redis from "ioredis";

let redis: Redis | null = null;
if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    console.log("Redis cache enabled.");
  } catch (error) {
    console.warn("Failed to initialize Redis. Using in-memory cache instead.");
    redis = null;
  }
} else if (process.env.REDIS_URL) {
  console.warn("REDIS_URL is provided but not a valid Redis connection string. Using in-memory cache instead.");
} else {
  console.log("No REDIS_URL found, using in-memory cache.");
}

export default redis;
