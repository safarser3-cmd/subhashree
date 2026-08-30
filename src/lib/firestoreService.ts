import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { FanMessage, FanArtSubmission, GalleryItem, SocialPost } from '../types';
import { INITIAL_FAN_MESSAGES, GALLERY_ITEMS, SOCIAL_POSTS } from '../data/shubhashreeData';

// --- FAN MESSAGES ---
export const subscribeToFanMessages = (callback: (messages: FanMessage[]) => void) => {
  let isSubscribed = true;
  
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const msgs = await response.json();
        if (isSubscribed) callback(msgs);
      }
    } catch (err) {
      console.warn('Error fetching messages from API:', err);
    }
  };

  fetchMessages();
  
  // Use Server-Sent Events (SSE) for true push-based real-time updates (no idle polling)
  const eventSource = new EventSource('/api/messages/stream');
  
  eventSource.onmessage = (event) => {
    if (!isSubscribed) return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE' || data.type === 'LIKE_MESSAGE') {
        // Whenever a new message or like comes in, we just re-fetch the latest list from the cache
        // Or we could parse data.data and append it, but re-fetching is safest to guarantee ordering
        fetchMessages();
      }
    } catch (e) {
      console.error("Error parsing SSE event:", e);
    }
  };

  eventSource.onerror = () => {
    // Silently reconnect on error
  };

  return () => {
    isSubscribed = false;
    eventSource.close();
  };
};

async function seedFanMessagesIfNeeded() {
  // Logic handled in backend now if needed
}

function getFallbackFanMessages(): FanMessage[] {
  try {
    const saved = localStorage.getItem('shubhashree_fan_messages');
    return saved ? JSON.parse(saved) : INITIAL_FAN_MESSAGES;
  } catch {
    return INITIAL_FAN_MESSAGES;
  }
}

export const addFanMessageToFirestore = async (msg: Omit<FanMessage, 'id'>) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.reason || 'Failed to add message');
    }
    const data = await response.json();
    return data.message.id;
  } catch (e) {
    console.error('Error adding fan message via API:', e);
    throw e;
  }
};

export const likeFanMessageInFirestore = async (id: string, currentLikes: number) => {
  try {
    // Optimistic UI update in the backend cache
    await fetch('/api/messages/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    // Still persist to Firestore for long term if needed, or rely on cache syncing
    const ref = doc(db, 'fan_messages', id);
    await updateDoc(ref, { likes: increment(1) }).catch(() => {});
  } catch (e) {
    console.error('Error liking fan message in API:', e);
  }
};

// --- COMMUNITY LOVE METER ---
export const subscribeToLoveCount = (callback: (count: number) => void) => {
  try {
    const ref = doc(db, 'site_stats', 'love_meter');
    return onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.count || 18450);
      } else {
        // Initialize
        setDoc(ref, { count: 18450 }).catch(() => {});
        callback(18450);
      }
    }, () => {
      const saved = localStorage.getItem('shubhashree_love_count');
      callback(saved ? parseInt(saved, 10) : 18450);
    });
  } catch {
    const saved = localStorage.getItem('shubhashree_love_count');
    callback(saved ? parseInt(saved, 10) : 18450);
    return () => {};
  }
};

export const incrementLoveCountInFirestore = async () => {
  try {
    const response = await fetch('/api/interactions/love', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Rate limited');
    }
    // Let Firestore trigger the snapshot automatically, no need to manually updateDoc here!
  } catch (e) {
    const saved = localStorage.getItem('shubhashree_love_count');
    const next = (saved ? parseInt(saved, 10) : 18450) + 1;
    localStorage.setItem('shubhashree_love_count', next.toString());
  }
};

// --- GALLERY ITEMS ---
export const subscribeToGalleryItems = (callback: (items: GalleryItem[]) => void) => {
  try {
    const colRef = collection(db, 'gallery_media_v2');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        // Fallback
        callback(GALLERY_ITEMS);
        if (auth.currentUser?.email === 'safarser3@gmail.com') {
          try {
            for (const item of GALLERY_ITEMS) {
              await setDoc(doc(db, 'gallery_media_v2', item.id), item);
            }
          } catch (e) {
            console.warn('Could not seed gallery', e);
          }
        }
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryItem[];
        callback(items);
      }
    }, () => {
      callback(GALLERY_ITEMS);
    });
  } catch {
    callback(GALLERY_ITEMS);
    return () => {};
  }
};

export const addGalleryItemInFirestore = async (item: GalleryItem) => {
  try {
    const cleanItem = Object.fromEntries(
      Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, 'gallery_media_v2', item.id), cleanItem);
  } catch (e) {
    console.error('Error adding gallery item:', e);
    throw new Error('Failed to upload. Are you logged in as admin?');
  }
};

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

export const subscribeToBio = (callback: (bio: BioContent) => void) => {
  try {
    const ref = doc(db, 'bio', 'profile');
    return onSnapshot(ref, async (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as BioContent);
      } else {
        // Initialize if missing
        await setDoc(ref, DEFAULT_BIO);
        callback(DEFAULT_BIO);
      }
    }, () => {
      callback(DEFAULT_BIO);
    });
  } catch {
    callback(DEFAULT_BIO);
    return () => {};
  }
};

export const updateBioInFirestore = async (newBio: BioContent) => {
  try {
    const ref = doc(db, 'bio', 'profile');
    await setDoc(ref, newBio);
  } catch (e) {
    console.error('Error updating bio in Firestore:', e);
  }
};

export const subscribeToFanArt = (callback: (arts: FanArtSubmission[]) => void) => {
  try {
    const colRef = collection(db, 'fan_art');
    return onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        callback([]);
      } else {
        const arts = snap.docs.map(d => ({ id: d.id, ...d.data() })) as FanArtSubmission[];
        callback(arts);
      }
    }, () => {
      callback([]);
    });
  } catch {
    callback([]);
    return () => {};
  }
};

export const addFanArtToFirestore = async (art: FanArtSubmission) => {
  try {
    const cleanArt = Object.fromEntries(
      Object.entries(art).filter(([_, v]) => v !== undefined)
    );
    const response = await fetch('/api/interactions/fanart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanArt)
    });
    if (!response.ok) {
      throw new Error('Failed to upload artwork due to rate limits or spam block.');
    }
  } catch (e) {
    console.error('Error adding fan art via API:', e);
    throw new Error('Failed to upload artwork. Please try again later.');
  }
};

export const likeFanArtInFirestore = async (id: string, currentLikes: number) => {
  try {
    const response = await fetch('/api/interactions/fanart/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (response.ok) {
      // Still apply optimistic update locally by writing to Firestore, though this could fail if rules block.
      // Actually, since we're rate-limiting, we should remove the direct write or rely entirely on sync.
      // We'll leave the optimistic update but swallow errors if rules block direct writes.
      const ref = doc(db, 'fan_art', id);
      await updateDoc(ref, { likes: increment(1) }).catch(() => {});
    }
  } catch (e) {
    console.error('Error liking fan art via API:', e);
  }
};

export const approveFanArtInFirestore = async (id: string, newImageUrl?: string, newVideoUrl?: string) => {
  try {
    const ref = doc(db, 'fan_art', id);
    const updates: any = { status: 'approved' };
    if (newImageUrl) updates.imageUrl = newImageUrl;
    if (newVideoUrl) updates.videoUrl = newVideoUrl;
    await updateDoc(ref, updates);
  } catch (e) {
    console.error('Error approving fan art:', e);
  }
};

export const featureFanArtInGallery = async (art: FanArtSubmission) => {
  try {
    const galleryRef = doc(db, 'gallery_media_v2', `fanart_${art.id}`);
    const galleryItem = {
      id: galleryRef.id,
      title: art.title,
      category: 'Wallpapers & Graphics', // Mapped category
      imageUrl: art.imageUrl || '',
      date: new Date().toISOString().split('T')[0],
      aspectRatio: art.size?.includes('9:16') ? '9:16' : 
                   art.size?.includes('16:9') ? '16:9' : 
                   art.size?.includes('1:1') ? '1:1' : '4:5',
      orientation: art.size?.includes('9:16') ? 'mobile' : 
                   art.size?.includes('16:9') ? 'desktop' : 
                   art.size?.includes('1:1') ? 'square' : 'portrait',
      caption: `Created by ${art.artistName}`,
      photographerOrLocation: `Fan Art by ${art.artistHandle || art.artistName}`,
      likes: art.likes,
      tags: ['Fan Art', 'Featured']
    };
    await setDoc(galleryRef, galleryItem);
    
    // Mark as featured in fan_art collection as well
    const fanArtRef = doc(db, 'fan_art', art.id);
    await updateDoc(fanArtRef, { isFeatured: true });
  } catch (e) {
    console.error('Error featuring fan art:', e);
  }
};

export const unfeatureFanArtFromGallery = async (artId: string) => {
  try {
    // Remove from gallery
    const galleryRef = doc(db, 'gallery_media_v2', `fanart_${artId}`);
    await deleteDoc(galleryRef);
    
    // Unmark in fan_art
    const fanArtRef = doc(db, 'fan_art', artId);
    await updateDoc(fanArtRef, { isFeatured: false });
  } catch (e) {
    console.error('Error unfeaturing fan art:', e);
  }
};

export const deleteFanArtFromFirestore = async (id: string) => {
  try {
    const ref = doc(db, 'fan_art', id);
    await deleteDoc(ref); try { await deleteDoc(doc(db, "gallery_media_v2", `fanart_${id}`)); } catch(e) {}
  } catch (e) {
    console.error('Error deleting fan art:', e);
  }
};

export const subscribeToSocialPosts = (callback: (posts: any[]) => void) => {
  try {
    const colRef = collection(db, 'social_posts');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        // Fallback to static posts if empty
        const initialPosts = SOCIAL_POSTS;
        callback(initialPosts);
        
        // Attempt to seed without synchronous auth check (Firestore rules will block if not admin)
        // This allows seeding to work if the user is already authenticated but auth.currentUser was null on first tick
        try {
          for (const post of initialPosts) {
            await setDoc(doc(db, 'social_posts', post.id), post);
          }
          console.log('Successfully seeded social posts to Firestore');
        } catch (e) {
          console.warn('Silent fallback: Could not seed social posts to Firestore (likely permission denied)', e);
        }
      } else {
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(posts);
      }
    }, (error) => {
      console.error('Error fetching social posts:', error);
      callback(SOCIAL_POSTS);
    });
  } catch (error) {
    console.error('Error subscribing to social posts:', error);
    callback(SOCIAL_POSTS);
    return () => {};
  }
};

export interface InstagramPost {
  id: string;
  postUrl: string;
  addedAt?: unknown;
}

export const subscribeToInstagramPosts = (callback: (posts: InstagramPost[]) => void) => {
  try {
    return onSnapshot(collection(db, 'instagramPosts'), (snapshot) => {
      const posts = snapshot.docs.map((post) => ({
        id: post.id,
        ...post.data()
      })) as InstagramPost[];
      callback(
        posts
          .filter((post) => typeof post.postUrl === 'string' && post.postUrl.length > 0)
          .sort((left, right) => String(right.addedAt ?? '').localeCompare(String(left.addedAt ?? '')))
      );
    }, (error) => {
      console.error('Error fetching Instagram posts:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to Instagram posts:', error);
    callback([]);
    return () => {};
  }
};

export const addInstagramPostToFirestore = async (postUrl: string) => {
  const postRef = doc(collection(db, 'instagramPosts'));
  await setDoc(postRef, {
    postUrl,
    addedAt: serverTimestamp()
  });
  return postRef.id;
};

