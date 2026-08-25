import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDoc,
  increment 
} from 'firebase/firestore';
import { db } from './firebase';
import { FanMessage, FanArtSubmission, GalleryItem, SocialPost } from '../types';
import { INITIAL_FAN_MESSAGES, INITIAL_FAN_ART, GALLERY_ITEMS, SOCIAL_POSTS } from '../data/shubhashreeData';

// --- FAN MESSAGES ---
export const subscribeToFanMessages = (callback: (messages: FanMessage[]) => void) => {
  try {
    const q = query(collection(db, 'fan_messages'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Seed initial if empty
        seedFanMessagesIfNeeded();
        callback(INITIAL_FAN_MESSAGES);
      } else {
        const msgs: FanMessage[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FanMessage[];
        callback(msgs);
      }
    }, (error) => {
      console.warn('Firestore snapshot error (fan_messages), falling back to local:', error);
      callback(getFallbackFanMessages());
    });
  } catch (err) {
    console.warn('Firestore subscribe error, using fallback:', err);
    callback(getFallbackFanMessages());
    return () => {};
  }
};

async function seedFanMessagesIfNeeded() {
  try {
    const colRef = collection(db, 'fan_messages');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const m of INITIAL_FAN_MESSAGES) {
        await addDoc(colRef, {
          senderName: m.senderName,
          location: m.location,
          message: m.message,
          badge: m.badge,
          avatarColor: m.avatarColor,
          createdAt: new Date().toISOString(),
          likes: m.likes
        });
      }
    }
  } catch (e) {
    console.error('Error seeding fan messages:', e);
  }
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
    const docRef = await addDoc(collection(db, 'fan_messages'), {
      ...msg,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding fan message to Firestore:', e);
    // Fallback to localStorage
    const fallback = getFallbackFanMessages();
    const newMsg: FanMessage = { id: `msg-${Date.now()}`, ...msg };
    const updated = [newMsg, ...fallback];
    localStorage.setItem('shubhashree_fan_messages', JSON.stringify(updated));
    return newMsg.id;
  }
};

export const likeFanMessageInFirestore = async (id: string, currentLikes: number) => {
  try {
    const ref = doc(db, 'fan_messages', id);
    await updateDoc(ref, { likes: currentLikes + 1 });
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
    const ref = doc(db, 'site_stats', 'love_meter');
    await updateDoc(ref, { count: increment(1) });
  } catch {
    const saved = localStorage.getItem('shubhashree_love_count');
    const next = (saved ? parseInt(saved, 10) : 18450) + 1;
    localStorage.setItem('shubhashree_love_count', next.toString());
  }
};

// --- GALLERY ITEMS ---
export const subscribeToGalleryItems = (callback: (items: GalleryItem[]) => void) => {
  try {
    const colRef = collection(db, 'gallery_media');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        // Seed
        for (const item of GALLERY_ITEMS) {
          await setDoc(doc(db, 'gallery_media', item.id), item);
        }
        callback(GALLERY_ITEMS);
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
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        for (const art of INITIAL_FAN_ART) {
          await setDoc(doc(db, 'fan_art', art.id), art);
        }
        callback(INITIAL_FAN_ART);
      } else {
        const arts = snap.docs.map(d => ({ id: d.id, ...d.data() })) as FanArtSubmission[];
        callback(arts);
      }
    }, () => {
      const saved = localStorage.getItem('shubhashree_fan_arts_v2');
      callback(saved ? JSON.parse(saved) : INITIAL_FAN_ART);
    });
  } catch {
    const saved = localStorage.getItem('shubhashree_fan_arts_v2');
    callback(saved ? JSON.parse(saved) : INITIAL_FAN_ART);
    return () => {};
  }
};

export const addFanArtToFirestore = async (art: FanArtSubmission) => {
  try {
    await setDoc(doc(db, 'fan_art', art.id), art);
  } catch (e) {
    console.error('Error adding fan art to Firestore:', e);
    const saved = localStorage.getItem('shubhashree_fan_arts_v2');
    const existing = saved ? JSON.parse(saved) : INITIAL_FAN_ART;
    localStorage.setItem('shubhashree_fan_arts_v2', JSON.stringify([art, ...existing]));
  }
};

export const likeFanArtInFirestore = async (id: string, currentLikes: number) => {
  try {
    const ref = doc(db, 'fan_art', id);
    await updateDoc(ref, { likes: currentLikes + 1 });
  } catch (e) {
    console.error('Error liking fan art:', e);
  }
};
