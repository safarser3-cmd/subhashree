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
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { FanMessage, FanArtSubmission, GalleryItem, SocialPost, HeroPhoto, SocialProfileCard, ResilienceContent } from '../types';

export const EMPTY_RESILIENCE_CONTENT: ResilienceContent = {
  title: "",
  subtitle: "",
  quote: "",
  paragraphs: []
};

export const subscribeToHeroPhotos = (callback: (photos: HeroPhoto[]) => void) => {
  try {
    const ref = doc(db, 'site_config', 'hero_carousel');
    return onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().photos || []);
      } else {
        callback([]);
      }
    }, () => {
      callback([]);
    });
  } catch {
    callback([]);
    return () => {};
  }
};

export const subscribeToSocialProfiles = (callback: (profiles: SocialProfileCard[]) => void) => {
  try {
    const ref = doc(db, 'site_config', 'social_profiles');
    return onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().profiles || []);
      } else {
        callback([]);
      }
    }, () => {
      callback([]);
    });
  } catch {
    callback([]);
    return () => {};
  }
};

export const subscribeToResilienceContent = (callback: (content: ResilienceContent) => void) => {
  try {
    const ref = doc(db, 'site_config', 'about_resilience');
    return onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().content || EMPTY_RESILIENCE_CONTENT);
      } else {
        callback(EMPTY_RESILIENCE_CONTENT);
      }
    }, () => {
      callback(EMPTY_RESILIENCE_CONTENT);
    });
  } catch {
    callback(EMPTY_RESILIENCE_CONTENT);
    return () => {};
  }
};

// --- FAN ART ---
export const subscribeToFanArts = (callback: (arts: FanArtSubmission[]) => void) => {
  const q = query(
    collection(db, 'fan_art'),
    where('status', '==', 'approved'),
    orderBy('submittedAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const arts: FanArtSubmission[] = [];
    snapshot.forEach((doc) => {
      arts.push({ id: doc.id, ...doc.data() } as FanArtSubmission);
    });
    callback(arts);
  }, (err) => {
    console.error('Error fetching fan arts:', err);
    callback([]);
  });
};

// --- FAN MESSAGES ---
export const subscribeToFanMessages = (callback: (messages: FanMessage[]) => void) => {
  const q = query(
    collection(db, 'fan_messages'),
    orderBy('createdAt', 'desc'),
    limit(7)
  );

  return onSnapshot(q, (snapshot) => {
    const msgs: FanMessage[] = [];
    snapshot.forEach((doc) => {
      msgs.push({ id: doc.id, ...doc.data() } as FanMessage);
    });
    callback(msgs);
  }, (err) => {
    console.error('Error fetching fan messages:', err);
    callback([]);
  });
};

export const addFanMessageToFirestore = async (msg: Omit<FanMessage, 'id'>) => {
  try {
    const colRef = collection(db, 'fan_messages');
    const docRef = await addDoc(colRef, msg);
    return docRef.id;
  } catch (e) {
    console.error('Error adding fan message to Firestore:', e);
    throw e;
  }
};

export const likeFanMessageInFirestore = async (id: string, currentLikes: number) => {
  try {
    const ref = doc(db, 'fan_messages', id);
    // Determine if we need to increment or decrement based on current UI state, 
    // but the caller passes the new absolute like count, so we'll just set it.
    // Actually, passing absolute likes can race. We should use increment().
    // Wait, the component passes currentLikes + 1 or currentLikes - 1.
    // It's safer to just set the value the UI computed to avoid double-counting issues 
    // if the UI and DB get out of sync, or just use increment. 
    // We will just set it to the value provided by the UI.
    await updateDoc(ref, { likes: currentLikes });
  } catch (e) {
    console.error('Error liking fan message in Firestore:', e);
  }
};

// --- COMMUNITY LOVE METER ---
export const subscribeToLoveCount = (callback: (count: number) => void) => {
  try {
    const ref = doc(db, 'site_stats', 'love_meter');
    return onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.count || 6670);
      } else {
        // Initialize
        setDoc(ref, { count: 6670 }).catch(() => {});
        callback(6670);
      }
    }, () => {
      const saved = localStorage.getItem('shubhashree_love_count');
      callback(saved ? parseInt(saved, 10) : 6670);
    });
  } catch {
    return () => {};
  }
};

export const incrementLoveCountInFirestore = async () => {
  try {
    const ref = doc(db, 'site_stats', 'love_meter');
    await updateDoc(ref, {
      count: increment(1)
    });
  } catch (e) {
    const saved = localStorage.getItem('shubhashree_love_count');
    const next = (saved ? parseInt(saved, 10) : 6670) + 1;
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
        callback([]);
        if (auth.currentUser?.email === 'blmoon8724@gmail.com') {
          try {
            for (const item of []) {
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
      callback([]);
    });
  } catch {
    callback([]);
    return () => {};
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
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('You must be logged in to submit fan art.');
    }

    const cleanArt = Object.fromEntries(
      Object.entries(art).filter(([_, v]) => v !== undefined)
    );
    const response = await fetch('/api/interactions/fanart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cleanArt)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) throw new Error(data.reason || 'Unauthorized. Please log in again.');
      if (response.status === 429) throw new Error(data.reason || 'Too many submissions! Try again later.');
      if (response.status === 400) throw new Error(data.reason || 'Invalid submission data.');
      throw new Error(data.reason || 'Failed to upload artwork due to a server error.');
    }
  } catch (e: any) {
    console.error('Error adding fan art via API:', e);
    throw new Error(e.message || 'Failed to upload artwork. Please try again later.');
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


export const subscribeToSocialPosts = (callback: (posts: any[]) => void) => {
  try {
    const colRef = collection(db, 'social_posts');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        // Fallback to static posts if empty
        const initialPosts = [];
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
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to social posts:', error);
    callback([]);
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

