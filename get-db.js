import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  projectId: "gen-lang-client-0250984123",
  firestoreDatabaseId: "ai-studio-shubhashreesahuf-b7597c00-ccb8-4efe-93b3-07b8951f4efc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(query(collection(db, 'fan_art'), limit(10)));
  let result = '';
  snap.forEach(doc => {
    result += `${doc.id} | ${doc.data().imageUrl} | ${doc.data().status}\n`;
  });
  fs.writeFileSync('db-result.txt', result);
  process.exit(0);
}
run();
