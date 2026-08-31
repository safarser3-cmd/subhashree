import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export function useAdmin(user: User | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !user.email) {
      setIsAdmin(false);
      return;
    }

    // Dynamically check the 'admins' collection in Firestore.
    // No emails are hardcoded here — all admin management is done via the database.
    const adminDocRef = doc(db, 'admins', user.email);

    const unsubscribe = onSnapshot(adminDocRef, (docSnap) => {
      setIsAdmin(docSnap.exists());
    }, (error) => {
      console.error("Error fetching admin status:", error);
      setIsAdmin(false);
    });

    return () => unsubscribe();
  }, [user]);

  return isAdmin;
}
