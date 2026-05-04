import { auth, db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  skills: string[];
  profileUrl: string;
}

export const getLinkedInAuthUrl = async (): Promise<string> => {
  const response = await fetch('/api/auth/linkedin/url');
  if (!response.ok) throw new Error('Failed to fetch LinkedIn Auth URL');
  const { url } = await response.json();
  return url;
};

export const updateLinkedInConnectionStatus = async (userId: string, isConnected: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      linkedInConnected: isConnected,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    return false;
  }
};
