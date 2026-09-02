const admin = require('firebase-admin');
const config = require('./firebase-applet-config.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.projectId,
  });
}

const db = admin.firestore();
if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
  db.settings({ databaseId: config.firestoreDatabaseId });
}

const INITIAL_SOCIAL_PROFILES = [
  {
    platform: 'instagram',
    name: 'Shubhashree Sahu',
    handle: '@subhaslyf',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Instagram Creator',
    statusHighlight: 'Live Audience Sync',
    followers: 1559122,
    followersDisplay: '1.56M',
    following: '2',
    postsCount: '253',
    growth: 'Apify Actor Ready',
    bio: 'Turning reels into real stories✨\nOdisha📍\nEmail 📧 : Collabs@subhashreesocials.in',
    category: 'Fashion & Visual Creator',
    profileUrl: 'https://www.instagram.com/subhaslyf/',
    themeGradient: 'from-pink-500 via-rose-500 to-amber-400',
    badgeBg: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-rose-300 border-rose-500/30',
    borderHover: 'hover:border-rose-500/50 hover:shadow-rose-500/10'
  },
  {
    platform: 'twitter',
    name: 'Shubhashree Sahu',
    handle: '@againsubha',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Official X Profile',
    statusHighlight: 'Direct Updates & Thoughts',
    bio: 'Official X (formerly Twitter) profile of Shubhashree Sahu. Follow @againsubha for direct thoughts, official announcements, and community interactions.',
    category: 'Official X Profile',
    profileUrl: 'https://x.com/againsubha',
    themeGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    badgeBg: 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
    borderHover: 'hover:border-sky-500/50 hover:shadow-sky-500/10'
  },
  {
    platform: 'youtube',
    name: 'Shubhashree Sahu',
    handle: '@subhaback',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Official YouTube Channel',
    statusHighlight: 'Video Content & Vlogs',
    bio: 'Official YouTube home of Shubhashree Sahu. Subscribe to @subhaback for fashion lookbooks, personal vlogs, and 4K video diaries.',
    category: 'Official YouTube Channel',
    profileUrl: 'https://www.youtube.com/@subhaback',
    themeGradient: 'from-red-500 via-rose-600 to-amber-500',
    badgeBg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30',
    borderHover: 'hover:border-red-500/50 hover:shadow-red-500/10'
  }
];

async function run() {
  try {
    console.log('Seeding social_profiles...');
    await db.collection('site_config').doc('social_profiles').set({ profiles: INITIAL_SOCIAL_PROFILES });
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

run();
