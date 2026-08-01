import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as updateAuthProfile, updateEmail, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, Timestamp, getDocFromServer } from 'firebase/firestore';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore smoothly without forced long polling which causes internal watch stream assertion crashes in iframe proxies
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? (async () => {
  try {
    return getAnalytics(app);
  } catch (e) {
    console.warn('Firebase Analytics failed to initialize:', e);
    return null;
  }
})() : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  const isExpectedOrOffline = 
    errMsg.toLowerCase().includes('permission') || 
    errMsg.toLowerCase().includes('offline') || 
    errMsg.toLowerCase().includes('insufficient permissions') ||
    errMsg.toLowerCase().includes('permission-denied');

  if (isExpectedOrOffline) {
    // If it is a permission block (like 'if false;') or offline, log as a warning and do NOT throw, to prevent crashing the app.
    console.warn(`Firestore Operation ${operationType} on /${path || ''} was gracefully handled:`, errMsg);
  } else {
    // For other unexpected errors, log as standard console.warn and throw so the promise rejects.
    console.warn('Firestore Error occurred:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}

// Handle Firestore operations gracefully
export async function verifyFirestoreConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log("Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error) {
      console.warn("Firestore status:", error.message);
    }
  }
}

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateAuthProfile,
  updateEmail,
  updatePassword,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
};
export type { FirebaseUser };
