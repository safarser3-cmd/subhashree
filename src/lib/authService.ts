import {
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export type AppUser = User;

export function watchAuth(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (e: any) {
    throw translateAuthError(e);
  }
}

export async function signInAsGuest(displayName: string): Promise<AppUser> {
  try {
    const cred = await signInAnonymously(auth);
    const cleanName = displayName.trim() || 'Anonymous Fan';
    await updateProfile(cred.user, { displayName: cleanName });
    return cred.user;
  } catch (e: any) {
    throw translateAuthError(e);
  }
}

function translateAuthError(e: any): Error {
  const code: string = e?.code || '';
  switch (code) {
    case 'auth/admin-restricted-operation':
      return new Error(
        'Anonymous sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method → Anonymous.',
      );
    case 'auth/popup-closed-by-user':
      return new Error('Sign-in popup was closed before completing.');
    case 'auth/popup-blocked':
      return new Error('Sign-in popup was blocked by the browser. Allow popups for this site.');
    case 'auth/network-request-failed':
      return new Error('Network error. Check your internet connection and try again.');
    case 'auth/operation-not-allowed':
      return new Error(
        'This sign-in method is disabled. Enable Google (and/or Anonymous) in Firebase Console → Authentication → Sign-in method.',
      );
    case 'auth/unauthorized-domain':
      return new Error(
        'This domain is not authorized. Add it under Firebase Console → Authentication → Settings → Authorized domains.',
      );
    default:
      return new Error(e?.message || 'Sign-in failed. Please try again.');
  }
}

export async function signOutCurrentUser(): Promise<void> {
  await fbSignOut(auth);
}
