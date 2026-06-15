import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, Timestamp, FirebaseUser, collection, query, where, getDocs, handleFirestoreError, OperationType, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateAuthProfile, updateEmail, updatePassword, onSnapshot } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { useSound } from './SoundContext';

interface UserProfile {
  uid: string;
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'dealer' | 'admin' | 'mini-admin' | 'premium-user';
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Crowned' | 'Official' | 'crowned' | 'gold' | 'diamond' | 'silver' | 'elite' | 'royal';
  rankColor: string;
  balance: number;
  createdAt: any;
  isVerified?: boolean;
  handle: string;
  bio?: string;
  location?: string;
  city?: string;
  mobile?: string;
  followers: number;
  following: number;
  chatId?: string;
  networkId?: string;
  marketId?: string;
  mediaId?: string;
  vibesId?: string;
  adsId?: string;
  streamId?: string;
  profileCardSub?: {
    plan: 'monthly' | '6months' | 'yearly';
    expiresAt: string;
  };
  tolerance?: number;
  likes?: string[];
  dislikes?: string[];
  skills?: string[];
  careers?: string[];
  monetizationEnabled?: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
  exclusiveContent?: boolean;
  payPerView?: boolean;
  ppvPrice?: number;
  monthlyFeatures?: string[];
  yearlyFeatures?: string[];
  isSecurityKeyEnabled?: boolean;
  keyExpiresAt?: string;
  securityKey?: string;
  accountNumber?: string;
  isAccountActive?: boolean;
  isBoosted?: boolean;
  boostExpiry?: string;
  boostMultiplier?: number;
  rankingId?: string;
  dealerId?: string;
  lockedFeatures?: Record<string, {
    lockedAt: string;
    reason: string;
    status: 'locked' | 'appealing';
    appealDay?: number;
    lastAppealDate?: string;
    correctStreak?: number;
  }>;
  stripeAccountId?: string;
  isStripeConnected?: boolean;
  paypalEmail?: string;
  bitcoinAddress?: string;
  hasAcceptedMarketPolicy?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  isVerifiedSeller?: boolean;
  businessName?: string;
  businessContact?: string;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  forexBalance?: number;
  forexWalletBalance?: number;
  forexProfitBalance?: number;
  forexDemoBalance?: number;
  supremeBalance?: number;
  betWalletBalance?: number;
  celebHubBalance?: number;
  boxWalletBalance?: number;
  totalEarnings?: number;
  nobleAssets?: string[];
  claimedNobleTreasures?: string[];
  appealSubscription?: {
    plan: '60days' | '90days' | '150days' | '365days';
    expiresAt: string;
    purchasedAt: string;
  };
  gender?: 'male' | 'female' | 'other' | '';
  birthday?: string; // ISO date string YYYY-MM-DD
  ipAddress?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role: UserProfile['role']) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  updateAuthEmail: (newEmail: string) => Promise<void>;
  updateAuthPassword: (newPassword: string) => Promise<void>;
  generateSecurityKey: (expiryDays?: number) => Promise<string>;
  findUserByEmail: (email: string) => Promise<UserProfile | null>;
  failedAttempts: number;
  lockoutUntil: string | null;
  isPendingSecurityVerification: boolean;
  recordFailedAttempt: () => void;
  resetFailedAttempts: () => void;
  confirmSecurityKey: (key: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<string | null>(null);
  const [isPendingSecurityVerification, setIsPendingSecurityVerification] = useState(false);
  const { playNewUserSignup, playFailedLogin, playIntruderAlert } = useSound();

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      // Clean up previous profile listener if it exists
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 seconds timeout

      if (firebaseUser) {
        console.log(`[Auth] User logged in: ${firebaseUser.uid} (${firebaseUser.email})`);
        console.log(`[Firestore] Using database: ${firebaseConfig.firestoreDatabaseId}`);
        
        // Listen for real-time profile updates
        profileUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          clearTimeout(timeoutId);
          if (snapshot.exists()) {
            const profileData = snapshot.data() as UserProfile;
            setProfile(profileData);
            if (profileData.isSecurityKeyEnabled && !profile) {
              setIsPendingSecurityVerification(true);
            }
          } else {
            // Create default profile if it doesn't exist
            const handle = `@${(firebaseUser.displayName || 'user').toLowerCase().replace(/\s+/g, '')}`.substring(0, 49);
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Supreme User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/150`,
              role: 'user',
              rank: 'Bronze',
              rankColor: 'text-gray-400',
              balance: 0,
              createdAt: Timestamp.now(),
              handle: handle,
              followers: 0,
              following: 0,
              hasAcceptedMarketPolicy: false,
              isSuspended: false,
              forexBalance: 0,
              forexWalletBalance: 0,
              forexProfitBalance: 0,
              forexDemoBalance: 10000,
              supremeBalance: 0,
              totalEarnings: 0,
              rankingId: `NOBLE-${Math.floor(100000 + Math.random() * 900000)}`,
            };
            setDoc(doc(db, 'users', firebaseUser.uid), newProfile).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
            });
          }
          setLoading(false);
        }, (error) => {
          clearTimeout(timeoutId);
          setLoading(false);
          // Only show error if it's not a common permission race condition during login/logout
          if (firebaseUser && error.code !== 'permission-denied') {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          }
        });
      } else {
        clearTimeout(timeoutId);
        setProfile(null);
        setIsPendingSecurityVerification(false);
        setLoading(false);
      }
    });

    const storedFailed = localStorage.getItem('failed_login_attempts');
    const storedLockout = localStorage.getItem('login_lockout_until');

    if (storedFailed) setFailedAttempts(parseInt(storedFailed));
    if (storedLockout) {
      const until = new Date(storedLockout);
      if (until > new Date()) {
        setLockoutUntil(storedLockout);
      } else {
        localStorage.removeItem('login_lockout_until');
      }
    }

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Capture IP on login for tracking
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const ip = data.ip;
        
        // Update profile with last IP
        await setDoc(doc(db, 'users', firebaseUser.uid), { 
          ipAddress: ip,
          lastLogin: Timestamp.now()
        }, { merge: true });
      } catch (e) {
        console.warn("Failed to capture IP on login", e);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signup = async (email: string, pass: string, name: string, role: UserProfile['role']) => {
    try {
      // Get IP Address
      let ip = 'unknown';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
      } catch (e) {
        console.warn("Failed to fetch IP", e);
      }

      // Check for same IP with different role
      // Bypass in development, localhost, or deployment preview environments where testers need to test multiple roles
      const isDevOrPreview = import.meta.env.DEV || 
                            window.location.hostname.includes('localhost') || 
                            window.location.hostname.includes('run.app') ||
                            window.location.hostname.includes('127.0.0.1');

      if (ip !== 'unknown' && !isDevOrPreview) {
        const q = query(collection(db, 'users'), where('ipAddress', '==', ip));
        const snapshot = await getDocs(q);
        const existingRoles = snapshot.docs.map(doc => (doc.data() as UserProfile).role);
        
        if (existingRoles.length > 0) {
          const hasDealer = existingRoles.includes('dealer');
          const hasUser = existingRoles.includes('user') || existingRoles.includes('premium-user');
          
          if ((role === 'dealer' && hasUser) || (role === 'user' && hasDealer)) {
            throw new Error("Security Restriction: A person cannot have both a User and a Dealer account from the same location/IP. Please use your existing account.");
          }
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Update auth profile with name
      await updateAuthProfile(firebaseUser, { displayName: name });
      
      const handle = `@${name.toLowerCase().replace(/\s+/g, '')}`.substring(0, 49);
      
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: name,
        email: email,
        avatar: `https://picsum.photos/seed/${firebaseUser.uid}/150`,
        role: role,
        rank: 'Bronze',
        rankColor: 'text-gray-400',
        balance: 0,
        createdAt: Timestamp.now(),
        handle: handle,
        followers: 0,
        following: 0,
        hasAcceptedMarketPolicy: false,
        isSuspended: false,
        forexBalance: 0,
        forexWalletBalance: 0,
        forexProfitBalance: 0,
        forexDemoBalance: 10000,
        supremeBalance: 0,
        totalEarnings: 0,
        rankingId: `NOBLE-${Math.floor(100000 + Math.random() * 900000)}`,
        ipAddress: ip,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
      setProfile(newProfile);
      playNewUserSignup();
    } catch (error: any) {
      console.error("Signup failed", error);
      if (error.message && error.message.includes("Security Restriction")) {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, `users/unknown`);
      throw error;
    }
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (profile) {
      await setDoc(doc(db, 'users', profile.uid), data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
    const path = 'users';
    try {
      const q = query(collection(db, path), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  };

  const confirmSecurityKey = async (key: string) => {
    if (!profile || !profile.securityKey || !profile.keyExpiresAt) return false;
    const isExpired = new Date(profile.keyExpiresAt) < new Date();
    if (isExpired) {
      setIsPendingSecurityVerification(false); // Let them in but maybe disable key? Or keep them locked?
      // For now, if expired, we'll say it's invalid
      return false;
    }
    
    if (profile.securityKey === key) {
      setIsPendingSecurityVerification(false);
      return true;
    }
    return false;
  };

  const generateSecurityKey = async (expiryDays: number = 30) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newKey = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) newKey += "-";
      newKey += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    await updateUser({ 
      securityKey: newKey, 
      isSecurityKeyEnabled: true,
      keyExpiresAt: expiresAt.toISOString()
    });
    return newKey;
  };

  const loginWithGoogle = async () => {
    if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      setFailedAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem('failed_login_attempts');
      localStorage.removeItem('login_lockout_until');
    } catch (error) {
      console.error("Login failed", error);
      recordFailedAttempt();
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateAuthEmail = async (newEmail: string) => {
    if (auth.currentUser) {
      await updateEmail(auth.currentUser, newEmail);
      await updateUser({ email: newEmail });
    }
  };

  const updateAuthPassword = async (newPassword: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    await updateUser(data);
  };

  const recordFailedAttempt = () => {
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    localStorage.setItem('failed_login_attempts', newCount.toString());
    playFailedLogin();

    if (newCount >= 5) {
      const until = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      setLockoutUntil(until);
      localStorage.setItem('login_lockout_until', until);
      playIntruderAlert();
    }
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    localStorage.removeItem('failed_login_attempts');
    localStorage.removeItem('login_lockout_until');
  };

  return (
    <AuthContext.Provider value={{ 
      user: profile, profile, loading, loginWithGoogle, login, signup, logout, updateProfile, updateUser,
      updateAuthEmail, updateAuthPassword,
      generateSecurityKey, findUserByEmail, confirmSecurityKey,
      failedAttempts, lockoutUntil, recordFailedAttempt, resetFailedAttempts,
      isPendingSecurityVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
