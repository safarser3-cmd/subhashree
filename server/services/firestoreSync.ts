import redis from "../config/redis";

const PROJECT_ID = "ai-studio-shubhashreesahuf-b7597c00-ccb8-4efe-93b3-07b8951f4efc";
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export async function syncMessagesToFirestore() {
  if (!redis) return;
  try {
    const len = await redis.llen("fan_messages_pending_sync");
    if (len > 0) {
      console.log(`[Background Sync] Found ${len} pending fan messages. Syncing to Firestore...`);
      for (let i = 0; i < len; i++) {
        const msgStr = await redis.rpop("fan_messages_pending_sync");
        if (!msgStr) continue;
        const msg = JSON.parse(msgStr);
        const firestorePayload = {
          fields: {
            userId: { stringValue: msg.userId || "" },
            senderName: { stringValue: msg.senderName || "" },
            photoURL: msg.photoURL ? { stringValue: msg.photoURL } : { nullValue: null },
            isAnonymous: { booleanValue: !!msg.isAnonymous },
            message: { stringValue: msg.message || "" },
            createdAt: { stringValue: msg.createdAt || new Date().toISOString() },
            likes: { integerValue: msg.likes || 0 }
          }
        };
        const response = await fetch(`${FIRESTORE_BASE_URL}/fan_messages?documentId=${msg.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestorePayload)
        });
        if (!response.ok) {
          console.error(`[Background Sync] Error syncing message ${msg.id}:`, await response.text());
          await redis.rpush("fan_messages_pending_sync", msgStr);
        }
      }
    }

    // Sync Love Meter
    const loveIncrementsStr = await redis.get("love_meter_pending_sync");
    if (loveIncrementsStr) {
      const increments = parseInt(loveIncrementsStr, 10);
      if (increments > 0) {
        console.log(`[Background Sync] Syncing ${increments} love taps to Firestore...`);
        // Current value
        const currentRes = await fetch(`${FIRESTORE_BASE_URL}/site_stats/love_meter`);
        if (currentRes.ok) {
          const currentDoc = await currentRes.json();
          const currentCount = parseInt(currentDoc.fields?.count?.integerValue || "18450", 10);
          
          await fetch(`${FIRESTORE_BASE_URL}/site_stats/love_meter`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: { count: { integerValue: currentCount + increments } } })
          });
          
          // Reset redis counter
          await redis.decrby("love_meter_pending_sync", increments);
        }
      }
    }

    // Sync Fan Art
    const fanartLen = await redis.llen("fanart_pending_sync");
    if (fanartLen > 0) {
      console.log(`[Background Sync] Found ${fanartLen} pending fan arts. Syncing...`);
      for (let i = 0; i < fanartLen; i++) {
        const artStr = await redis.rpop("fanart_pending_sync");
        if (!artStr) continue;
        const art = JSON.parse(artStr);
        const firestorePayload = {
          fields: {
            id: { stringValue: art.id },
            title: { stringValue: art.title || "" },
            artistName: { stringValue: art.artistName || "" },
            artistHandle: art.artistHandle ? { stringValue: art.artistHandle } : { nullValue: null },
            category: { stringValue: art.category || "" },
            size: { stringValue: art.size || "" },
            description: art.description ? { stringValue: art.description } : { nullValue: null },
            imageUrl: art.imageUrl ? { stringValue: art.imageUrl } : { nullValue: null },
            videoUrl: art.videoUrl ? { stringValue: art.videoUrl } : { nullValue: null },
            textEssay: art.textEssay ? { stringValue: art.textEssay } : { nullValue: null },
            submittedAt: { stringValue: art.submittedAt || new Date().toISOString() },
            likes: { integerValue: art.likes || 1 },
            status: { stringValue: art.status || "pending" },
            isFeatured: { booleanValue: false }
          }
        };
        const response = await fetch(`${FIRESTORE_BASE_URL}/fan_art?documentId=${art.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestorePayload)
        });
        if (!response.ok) {
          console.error(`[Background Sync] Error syncing fan art ${art.id}:`, await response.text());
          await redis.rpush("fanart_pending_sync", artStr);
        }
      }
    }

    console.log(`[Background Sync] Sync routine completed.`);
  } catch (error) {
    console.error("[Background Sync] Error:", error);
  }
}
