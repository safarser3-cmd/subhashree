const admin = require('firebase-admin');
const config = require('./firebase-applet-config.json');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: config.projectId,
});

const db = admin.firestore();
if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
  db.settings({ databaseId: config.firestoreDatabaseId });
}

const INITIAL_RESILIENCE_CONTENT = {
  title: "Resilience in the Face of Online Judgment",
  subtitle: "An Emotional Reflection",
  quote: "Never judge a person’s soul through the distorted lens of internet noise.",
  paragraphs: [
    "In the digital era, public judgment is often swift and unforgiving. When private moments or unverified viral narratives circulate across social platforms, the online world frequently rushes to label, mock, and criticize a human being without knowing their reality, the silent battles they fight, or the genuine kindness in their heart.",
    "Facing severe cyberbullying, intrusive scrutiny, and instant character judgments, Subhashree demonstrated profound internal resilience. Instead of returning anger with anger, she chose quiet dignity, mental resolve, and steadfast focus on her life, her creativity, and her community.",
    "Her story stands as an enduring reminder to every young person online: you are defined by your genuine compassion, how you treat those around you, and how you rise with grace—never by the fleeting, cruel opinions of strangers."
  ]
};

const INITIAL_HERO_PHOTOS = [
  {
    id: 'saree-heritage',
    name: 'Sambalpuri Silk Ikat',
    tag: 'Traditional Handloom',
    url: 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page/hero1.jpg',
    fallback: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'sunset-glamour',
    name: 'Sunset Spotlight',
    tag: 'Editorial Glamour',
    url: 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page/hero2.jpg',
    fallback: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'red-carpet-noir',
    name: 'Power Saree Noir',
    tag: 'Red Carpet Gala',
    url: 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page/hero3.jpg',
    fallback: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'outdoor-grace',
    name: 'Sanctuary Bloom',
    tag: 'Eco-Green Series',
    url: 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page/hero4.jpg',
    fallback: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1920&q=90',
  },
];

async function run() {
  try {
    console.log('Seeding hero_carousel...');
    await db.collection('site_config').doc('hero_carousel').set({ photos: INITIAL_HERO_PHOTOS });
    
    console.log('Seeding about_resilience...');
    await db.collection('site_config').doc('about_resilience').set({ content: INITIAL_RESILIENCE_CONTENT });

    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

run();
