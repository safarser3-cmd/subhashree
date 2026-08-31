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

    const adminDocRef = doc(db, 'admins', user.email);
    
    const unsubscribe = onSnapshot(adminDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setIsAdmin(true);
      } else {
        // Legacy migration: automatically add them to the database if they are legacy admins
        if (user.email === 'blmoon8724@gmail.com' || user.email === 'safarser3@gmail.com') {
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(adminDocRef, { 
              email: user.email, 
              role: 'admin', 
              migratedAt: new Date().toISOString() 
            });
            setIsAdmin(true);
          } catch (e) {
            console.error("Could not seed admin in Firestore", e);
            setIsAdmin(true); // Fallback so they don't lose access
          }
        } else {
          setIsAdmin(false);
        }
      }
    }, (error) => {
      console.error("Error fetching admin status:", error);
      // Fallback in case Firestore rules block reads
      if (user.email === 'blmoon8724@gmail.com' || user.email === 'safarser3@gmail.com') {
         setIsAdmin(true);
      } else {
         setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return isAdmin;
}
