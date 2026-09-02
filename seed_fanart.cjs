const admin = require('firebase-admin');
const config = require('./firebase-applet-config.json');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: config.projectId });
}
const db = admin.firestore();
db.settings({ databaseId: config.firestoreDatabaseId });

const SAMPLE_FAN_ART = [
  {
    id: 'fanart-1',
    title: 'Subhashree in Sambalpuri Saree',
    artistName: 'Priya Mohanty',
    artistHandle: '@priya_creates',
    category: 'Digital Illustration',
    size: '1:1 (Instagram)',
    imageUrl: 'https://images.unsplash.com/photo-1633330041783-0bfb0fe929fc?auto=format&fit=crop&w=800&q=80',
    description: 'A digital painting celebrating Subhashree\'s love for traditional Sambalpuri weaves. Drew this for her heritage month post.',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 247,
    isFeatured: true,
    status: 'approved'
  },
  {
    id: 'fanart-2',
    title: 'Pencil Portrait Study',
    artistName: 'Rahul Kumar',
    artistHandle: '@rahul_sketches',
    category: 'Pencil Sketch',
    size: '4:5 (Portrait)',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-drawn pencil portrait. Took 12 hours to complete — every shade placed with love.',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 189,
    isFeatured: false,
    status: 'approved'
  },
  {
    id: 'fanart-3',
    title: 'Strength — A Poetry Tribute',
    artistName: 'Ananya Singh',
    artistHandle: '@ananya_writes',
    category: 'Poetry & Words',
    size: '1:1 (Instagram)',
    textEssay: 'She stands where storms once shattered,\nUnbroken through the noise and hate,\nHer silence spoke what words have scattered —\nA soul too pure to bend to fate.\n\nIn every frame, in every smile,\nA quiet fire, a steady grace,\nShe walked her truth, mile after mile,\nAnd lit the world — a softer place.',
    description: 'Wrote this poem after watching her resilience through difficult times. She inspired me to be stronger.',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 312,
    isFeatured: true,
    status: 'approved'
  },
  {
    id: 'fanart-4',
    title: 'Cinematic Edit — Golden Hour',
    artistName: 'Vikram Patel',
    artistHandle: '@vikram_edits',
    category: 'Video Edit & Reel',
    size: '9:16 (Mobile)',
    imageUrl: 'https://images.unsplash.com/photo-1513721032312-6a18a42c8763?auto=format&fit=crop&w=800&q=80',
    description: 'A cinematic colour-grade edit using her official photos. Used DaVinci Resolve with a custom LUT.',
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 156,
    isFeatured: false,
    status: 'approved'
  },
  {
    id: 'fanart-5',
    title: 'Watercolour Dreamscape',
    artistName: 'Meera Nair',
    artistHandle: '@meera_art',
    category: 'Digital Illustration',
    size: '4:5 (Portrait)',
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
    description: 'Watercolour-style digital art inspired by her garden content. Soft pastels and dreamy tones.',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 203,
    isFeatured: false,
    status: 'approved'
  }
];

async function run() {
  try {
    console.log('Seeding fan_art collection...');
    const batch = db.batch();
    for (const art of SAMPLE_FAN_ART) {
      const ref = db.collection('fan_art').doc(art.id);
      batch.set(ref, art);
    }
    await batch.commit();
    console.log(`Seeded ${SAMPLE_FAN_ART.length} fan art items successfully!`);
  } catch (err) {
    console.error('Error seeding:', err);
  }
}

run();
