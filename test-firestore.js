const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "gen-lang-client-0250984123",
  firestoreDatabaseId: "ai-studio-shubhashreesahuf-b7597c00-ccb8-4efe-93b3-07b8951f4efc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'fan_art'));
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
run();
