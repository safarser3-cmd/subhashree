import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'subhashree-sahu-5e0a6'
});

const db = getFirestore();
db.settings({ databaseId: 'subhashree-db' });

async function seed() {
  try {
    await db.collection('admins').doc('blmoon8724@gmail.com').set({
      email: 'blmoon8724@gmail.com',
      role: 'admin',
      migratedAt: new Date().toISOString()
    });
    console.log("Seeded blmoon8724@gmail.com");

    await db.collection('admins').doc('safarser3@gmail.com').set({
      email: 'safarser3@gmail.com',
      role: 'admin',
      migratedAt: new Date().toISOString()
    });
    console.log("Seeded safarser3@gmail.com");

  } catch (e) {
    console.error("Error seeding:", e);
  }
}

seed();
