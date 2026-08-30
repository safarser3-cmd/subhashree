import express from "express";
import redis from "../config/redis";

const router = express.Router();

export interface BioContent {
  title: string;
  subtitle: string;
  readTime: string;
  chapters: {
    id: string;
    chapterNumber: string;
    title: string;
    paragraphs: string[];
  }[];
  quote: string;
  quoteAuthor: string;
}

export const DEFAULT_BIO: BioContent = {
  title: "The Story of Subhashree Sahu",
  subtitle: "From regional handloom creator to digital economy pioneer and youth advocate—a comprehensive look at her life, resilience, and advocacy.",
  readTime: "5 Minutes to Read",
  chapters: [
    {
      id: "ch1",
      chapterNumber: "Chapter 01",
      title: "Early Life & Background",
      paragraphs: [
        "Born on June 15, 2007, in Ganjam, Odisha, India, Subhashree was raised in Ganjam where she balanced her budding digital presence alongside her formal schooling, completing her Class 12 secondary education in 2023."
      ]
    },
    {
      id: "ch2",
      chapterNumber: "Chapter 02",
      title: "Career Beginnings & Overcoming Cyber Adversity (2022–2023)",
      paragraphs: [
        "Subhashree began sharing creative content in 2022, creating lifestyle vlogs, lip-sync videos, and dance reels. Her graceful presentation of traditional Odia handloom sarees quickly struck a chord with regional and nationwide audiences, accumulating millions of views.",
        "In 2023, during an account recovery process following a sudden suspension, an extortionist posing as an official intermediary targeted her. After she courageously refused illicit financial demands, private media associated with her was circulated online without consent. A formal cybercrime complaint was registered with law enforcement authorities, leading to decisive police action and legal prosecution under India’s Information Technology (IT) Act."
      ]
    },
    {
      id: "ch3",
      chapterNumber: "Chapter 03",
      title: "Financial Rebound & The Subscription Model (2024–2026)",
      paragraphs: [
        "Refusing to leave the internet or let adversity define her life, Subhashree launched an official YouTube vlog channel in late 2023 and rebuilt her Instagram presence.",
        "She became a pioneering case study in India's creator economy by leveraging Instagram’s paid subscription model (~₹399/month), cultivating thousands of dedicated supporters. Major economic reports highlighted that her exclusive monetization and brand collaborations yielded an estimated ₹23 Lakh to ₹27 Lakh per month, establishing her as one of the region's most financially successful independent digital creators."
      ]
    },
    {
      id: "ch4",
      chapterNumber: "Chapter 04",
      title: "Transition to National Activism & Digital Safety (2026)",
      paragraphs: [
        "In mid-2026, Subhashree stepped into national advocacy as a Youth Ambassador for the 'Citizens for Begging-Free India' initiative, aligning volunteer networks directly with the Ministry of Social Justice and Empowerment's SMILE rehabilitation project.",
        "As a vocal advocate against online cyberbullying and deepfake abuse, she collaborated on regional educational media initiatives to educate young women across Odisha, Bihar, and Jharkhand on digital security and legal reporting."
      ]
    },
    {
      id: "ch5",
      chapterNumber: "Chapter 05",
      title: "Media Disputes & Official Platforms",
      paragraphs: [
        "On August 14, 2026, her primary account with over 1.4 million followers was temporarily suspended during an automated moderation wave. Following immense community support and formal procedural appeals advocating for fair treatment of regional creators, Meta fully restored the account."
      ]
    }
  ],
  quote: "Never judge a person’s soul through the distorted lens of internet noise.",
  quoteAuthor: "Subhashree Sahu"
};

// GET /api/content/bio
router.get("/bio", async (req, res) => {
  try {
    if (redis) {
      const cachedBio = await redis.get("profile-bio");
      if (cachedBio) {
        return res.json(JSON.parse(cachedBio));
      } else {
        // Cache the default bio in Redis and return it
        await redis.set("profile-bio", JSON.stringify(DEFAULT_BIO));
        return res.json(DEFAULT_BIO);
      }
    }
    // Fallback if Redis is not configured
    return res.json(DEFAULT_BIO);
  } catch (error) {
    console.error("Error fetching bio from Redis:", error);
    return res.status(500).json(DEFAULT_BIO);
  }
});

// POST /api/content/bio (Update bio in Redis)
router.post("/bio", async (req, res) => {
  try {
    const newBio = req.body;
    if (redis) {
      await redis.set("profile-bio", JSON.stringify(newBio));
      return res.json({ success: true, bio: newBio });
    }
    return res.status(500).json({ error: "Redis not configured. Cannot update cache." });
  } catch (error) {
    console.error("Error saving bio to Redis:", error);
    return res.status(500).json({ error: "Failed to update bio in cache" });
  }
});

export default router;
