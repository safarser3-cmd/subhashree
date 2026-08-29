import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase.ts';
import { SOCIAL_POSTS } from './src/data/shubhashreeData.ts';

async function seed() {
  console.log('Seeding social_posts...');
  for (const post of SOCIAL_POSTS) {
    try {
      await setDoc(doc(db, 'social_posts', post.id), post);
      console.log(`Seeded post: ${post.id}`);
    } catch (e) {
      console.error(`Failed to seed post: ${post.id}`, e);
    }
  }
  console.log('Done seeding!');
  process.exit(0);
}

seed();
