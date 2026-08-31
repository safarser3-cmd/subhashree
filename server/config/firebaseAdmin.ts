import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore as getRawFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ override: true });

if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'subhashree-sahu-5e0a6';
    
    // In production Vercel, these must be set
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized securely with service account.');
    } else {
      console.warn('FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY missing. Admin SDK may fall back to default credentials which could fail.');
      initializeApp({
        projectId
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const databaseId = process.env.FIRESTORE_DATABASE_ID || 'subhashree-db';
export const getFirestore = () => getRawFirestore(databaseId);
export { getAuth, FieldValue };
