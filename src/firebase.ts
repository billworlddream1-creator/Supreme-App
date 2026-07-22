import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as updateAuthProfile, updateEmail, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, Timestamp, getDocFromServer } from 'firebase/firestore';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Enable auto-detect long polling to improve connectivity in restricted environments safely
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId)
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

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

// Validate Connection to Firestore
async function testConnection() {
  // Add a small delay to ensure network is initialized
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.warn("DEBUG - Firestore Connection info:", {
        message: error.message,
        name: error.name
      });
      if (error.message.includes('the client is offline')) {
        console.warn("Firebase configuration: The client appears to be offline. Keeping local fallback state.");
      } else {
        console.warn("Firestore connection: ", error.message);
      }
    } else {
      console.warn("DEBUG - Firestore Connection is not an Error instance:", error);
    }
  }
}
testConnection();

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
