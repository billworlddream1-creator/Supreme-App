import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  setDoc,
  writeBatch,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { logRecentActivity } from '../services/activityLogger';

export type MiniAdminCategory = 'promotional' | 'email-marketing' | 'user-management' | 'finance' | 'general';

export interface MiniAdmin {
  id: string;
  name: string;
  email: string;
  adminId: string;
  role: 'mini-admin';
  category: MiniAdminCategory;
  permissions: string[];
}

export interface AdCreditLimit {
  planId: string;
  limit: number;
}

export interface SiteUser {
  id: string;
  uid?: string;
  name: string;
  email: string;
  handle?: string;
  avatar?: string;
  rank?: string;
  balance?: number;
  phone?: string;
  mobile?: string;
  followers?: number;
  following?: number;
  role: 'user' | 'dealer' | 'admin' | 'mini-admin' | 'premium-user';
  status: 'active' | 'suspended';
  isSuspended?: boolean;
  hasAcceptedMarketPolicy?: boolean;
  suspensionReason?: string;
  isVerifiedSeller?: boolean;
  businessName?: string;
  businessContact?: string;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  forexBalance?: number;
  forexDemoBalance?: number;
  supremeBalance?: number;
  betWalletBalance?: number;
  celebHubBalance?: number;
  freeMiningTotal?: number;
  miningPoints?: number;
  gender?: string;
  birthday?: string;
  createdAt: any;
}

interface AdminContextType {
  masterAdminEmail: string;
  masterAdminPass: string;
  updateMasterAdmin: (email: string, pass: string) => void;
  miniAdmins: MiniAdmin[];
  addMiniAdmin: (admin: Omit<MiniAdmin, 'id'>) => Promise<void>;
  removeMiniAdmin: (id: string) => Promise<void>;
  updateMiniAdmin: (id: string, data: Partial<MiniAdmin>) => Promise<void>;
  generateAdminId: () => string;
  adCreditLimits: AdCreditLimit[];
  updateAdCreditLimit: (planId: string, limit: number) => void;
  siteUsers: SiteUser[];
  updateUserRole: (userId: string, role: SiteUser['role']) => Promise<void>;
  updateUserStatus: (userId: string, status: SiteUser['status']) => Promise<void>;
  updateUserSuspension: (userId: string, isSuspended: boolean, reason?: string) => Promise<void>;
  updateDealerProductsStatus: (sellerUid: string, status: 'active' | 'on-hold' | 'suspended') => Promise<void>;
  updateSellerVerification: (userId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  settings: PlatformSettings;
  updateSettings: (data: Partial<PlatformSettings>) => Promise<void>;
  generateSecurityKeyForUser: (userId: string, expiryDays?: number) => Promise<string>;
  seedUsers: (count: number) => Promise<void>;
}

export interface PlatformSettings {
  stripePlatformAccount: string;
  paypalBusinessEmail: string;
  bitcoinWalletAddress: string;
  usdtWalletAddress?: string;
  bankWireCoordinates?: string;
  platformFeePercentage: number;
  minimumPayoutAmount: number;
  maintenanceMode: boolean;
  userRegistration: boolean;
  aiFeatures: boolean;
  globalPayoutLimit: string;
  adFrequency: number;
  earningRateSubscription: number;
  earningRatePost: number;
  earningRateComment: number;
  earningRateReferral: number;
  earningRateConnection: number;
  forexMinDeposit: number;
  forexMinWithdrawal: number;
  supremeFeePercentage: number;
  forexDefaultLeverage: number;
  forexTradingEnabled: boolean;
  celebHubSubPrice: number;
  generalSubPrice: number;
  profileCardSubPrice: number;
  monthlyAwardSubPrice: number;
  yearlyAwardSubPrice: number;
  miningSubPrice: number;
  forexMaxDeposit: number;
  platformSubscriptionEnabled: boolean;
  billingCycleDays: number;
  walletEarningsRate: number;
  rankBonusGold: number;
  rankBonusDiamond: number;
  rankBonusSupreme: number;
  followerMonetizationRate: number;
  payoutThresholdGeneral: number;
  payoutThresholdCreator: number;
  payoutThresholdPremium: number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [masterAdminEmail, setMasterAdminEmail] = useState('billworlddream1@gmail.com');
  const [masterAdminPass, setMasterAdminPass] = useState('Billadad!!!!!');
  const [miniAdmins, setMiniAdmins] = useState<MiniAdmin[]>([]);
  const [adCreditLimits, setAdCreditLimits] = useState<AdCreditLimit[]>([
    { planId: 'free', limit: 5 },
    { planId: 'gold', limit: 50 },
    { planId: 'supreme', limit: 999999 },
  ]);
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    stripePlatformAccount: 'billworlddream1@gmail.com',
    paypalBusinessEmail: 'billworlddream1@gmail.com',
    bitcoinWalletAddress: '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm',
    usdtWalletAddress: 'TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk',
    bankWireCoordinates: 'GB49 APEX 6016 1331 4452 90',
    platformFeePercentage: 15,
    minimumPayoutAmount: 50,
    maintenanceMode: false,
    userRegistration: true,
    aiFeatures: true,
    globalPayoutLimit: '$50,000',
    adFrequency: 7,
    earningRateSubscription: 10,
    earningRatePost: 0.5,
    earningRateComment: 0.25,
    earningRateReferral: 5,
    earningRateConnection: 1,
    forexMinDeposit: 100,
    forexMinWithdrawal: 50,
    supremeFeePercentage: 17,
    forexDefaultLeverage: 100,
    forexTradingEnabled: true,
    celebHubSubPrice: 49.99,
    generalSubPrice: 9.99,
    profileCardSubPrice: 19.99,
    monthlyAwardSubPrice: 29.99,
    yearlyAwardSubPrice: 199.99,
    miningSubPrice: 39.99,
    forexMaxDeposit: 10000,
    platformSubscriptionEnabled: true,
    billingCycleDays: 30,
    walletEarningsRate: 0.05,
    rankBonusGold: 50,
    rankBonusDiamond: 150,
    rankBonusSupreme: 500,
    followerMonetizationRate: 0.01,
    payoutThresholdGeneral: 50,
    payoutThresholdCreator: 100,
    payoutThresholdPremium: 25,
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('master_admin_email');
    const storedPass = localStorage.getItem('master_admin_pass');
    const storedAdLimits = localStorage.getItem('ad_credit_limits');

    if (storedEmail) setMasterAdminEmail(storedEmail);
    if (storedPass) setMasterAdminPass(storedPass);
    if (storedAdLimits) {
      try {
        setAdCreditLimits(JSON.parse(storedAdLimits));
      } catch (e) {}
    }

    // Check if user is admin before starting listeners
    const checkAdminAndStartListeners = async () => {
      // We can check the role from the user object in AuthContext, 
      // but AdminProvider is outside AuthProvider in App.tsx? 
      // No, App.tsx shows AdminProvider is INSIDE AuthProvider.
    };

    // However, I'll just use a simple check or wait for the user to be available.
  }, []);

  const { user } = useAuth();

  useEffect(() => {
    const secondaryAdminEmail = 'supremeseller@gmail.com';
    if (!user || (user.role !== 'admin' && user.role !== 'mini-admin' && user.email !== masterAdminEmail && user.email !== secondaryAdminEmail)) {
      setSiteUsers([]);
      setMiniAdmins([]);
      return;
    }

    // Site Users Listener
    const usersQ = query(collection(db, 'users'), limit(1000));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const users: SiteUser[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as SiteUser);
      });
      setSiteUsers(users);
    }, (error) => {
      // Don't toast for permission-denied in the background provider
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    });

    // Mini Admins Listener
    const miniAdminsQ = query(collection(db, 'mini_admins'));
    const unsubscribeMiniAdmins = onSnapshot(miniAdminsQ, (snapshot) => {
      const admins: MiniAdmin[] = [];
      snapshot.forEach((doc) => {
        admins.push({ id: doc.id, ...doc.data() } as MiniAdmin);
      });
      setMiniAdmins(admins);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, 'mini_admins');
      }
    });

    // Settings Listener
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'platform'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PlatformSettings;
        setSettings({
          ...data,
          bitcoinWalletAddress: data.bitcoinWalletAddress || '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm',
          usdtWalletAddress: data.usdtWalletAddress || 'TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk',
          bankWireCoordinates: data.bankWireCoordinates || 'GB49 APEX 6016 1331 4452 90'
        });
      }
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, 'settings/platform');
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMiniAdmins();
      unsubscribeSettings();
    };
  }, [user, masterAdminEmail]);

  const updateMasterAdmin = (email: string, pass: string) => {
    setMasterAdminEmail(email);
    setMasterAdminPass(pass);
    localStorage.setItem('master_admin_email', email);
    localStorage.setItem('master_admin_pass', pass);
  };

  const addMiniAdmin = async (admin: Omit<MiniAdmin, 'id'>) => {
    try {
      await addDoc(collection(db, 'mini_admins'), admin);
      await logRecentActivity({
        category: 'user_roles',
        action: 'Mini-Admin Created',
        details: `Assigned mini-admin category "${admin.category}" to ${admin.email} (Name: ${admin.name}).`,
        targetUser: `${admin.name} (${admin.email})`,
        adminEmail: 'billworlddream1@gmail.com',
        severity: 'medium',
        status: 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'mini_admins');
    }
  };

  const removeMiniAdmin = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mini_admins', id));
      await logRecentActivity({
        category: 'user_roles',
        action: 'Mini-Admin Revoked',
        details: `Revoked mini-admin privileges for record ID ${id}.`,
        adminEmail: 'billworlddream1@gmail.com',
        severity: 'high',
        status: 'warning'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `mini_admins/${id}`);
    }
  };

  const updateMiniAdmin = async (id: string, data: Partial<MiniAdmin>) => {
    try {
      await updateDoc(doc(db, 'mini_admins', id), data);
      await logRecentActivity({
        category: 'user_roles',
        action: 'Mini-Admin Privileges Modified',
        details: `Updated mini-admin record ${id}: ${Object.keys(data).join(', ')}.`,
        adminEmail: 'billworlddream1@gmail.com',
        severity: 'medium',
        status: 'info'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `mini_admins/${id}`);
    }
  };

  const updateAdCreditLimit = (planId: string, limit: number) => {
    const updated = adCreditLimits.map(l => l.planId === planId ? { ...l, limit } : l);
    setAdCreditLimits(updated);
    localStorage.setItem('ad_credit_limits', JSON.stringify(updated));
  };

  const generateAdminId = () => {
    return 'ADM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const updateUserRole = async (userId: string, role: SiteUser['role']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      await logRecentActivity({
        category: 'user_roles',
        action: `User Role Changed to ${role.toUpperCase()}`,
        details: `Modified system role for user ID ${userId} to ${role}.`,
        targetUserId: userId,
        adminEmail: 'billworlddream1@gmail.com',
        severity: role === 'admin' ? 'high' : 'medium',
        status: 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateUserStatus = async (userId: string, status: SiteUser['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status });
      await logRecentActivity({
        category: 'user_roles',
        action: `User Status Changed to ${status.toUpperCase()}`,
        details: `Updated user account status for user ID ${userId} to ${status}.`,
        targetUserId: userId,
        adminEmail: 'billworlddream1@gmail.com',
        severity: status === 'suspended' ? 'high' : 'low',
        status: status === 'suspended' ? 'error' : 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateUserSuspension = async (userId: string, isSuspended: boolean, reason?: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        isSuspended,
        suspensionReason: reason || null,
        status: isSuspended ? 'suspended' : 'active'
      });
      
      // Also update their products
      await updateDealerProductsStatus(userId, isSuspended ? 'on-hold' : 'active');

      await logRecentActivity({
        category: 'user_roles',
        action: isSuspended ? 'User Account Suspended' : 'User Suspension Lifted',
        details: `Account ${userId} was ${isSuspended ? 'suspended' : 'reactivated'}.${reason ? ` Reason: ${reason}` : ''}`,
        targetUserId: userId,
        adminEmail: 'billworlddream1@gmail.com',
        severity: isSuspended ? 'high' : 'low',
        status: isSuspended ? 'error' : 'success'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateDealerProductsStatus = async (sellerUid: string, status: 'active' | 'on-hold' | 'suspended') => {
    try {
      const { getDocs, where } = await import('firebase/firestore');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sellerUid', '==', sellerUid));
      const querySnapshot = await getDocs(q);
      
      const promises = querySnapshot.docs.map(docSnap => 
        updateDoc(doc(db, 'products', docSnap.id), { status })
      );
      
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products (bulk update for ${sellerUid})`);
    }
  };

  const updateSellerVerification = async (userId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        verificationStatus: status,
        isVerifiedSeller: status === 'approved',
        verificationReason: reason || null,
        role: status === 'approved' ? 'dealer' : 'user'
      });
      await logRecentActivity({
        category: 'user_roles',
        action: `Seller Verification ${status.toUpperCase()}`,
        details: `Seller verification status for ${userId} set to ${status}.${reason ? ` Reason: ${reason}` : ''}`,
        targetUserId: userId,
        adminEmail: 'billworlddream1@gmail.com',
        severity: status === 'approved' ? 'medium' : 'high',
        status: status === 'approved' ? 'success' : 'warning'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      await logRecentActivity({
        category: 'user_roles',
        action: 'User Account Purged',
        details: `Permanently removed user account record ID ${userId}.`,
        targetUserId: userId,
        adminEmail: 'billworlddream1@gmail.com',
        severity: 'critical',
        status: 'error'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const updateSettings = async (data: Partial<PlatformSettings>) => {
    try {
      await setDoc(doc(db, 'settings', 'platform'), data, { merge: true });
      await logRecentActivity({
        category: 'system_events',
        action: 'System Platform Settings Modified',
        details: `Platform parameters updated: ${Object.keys(data).join(', ')}.`,
        adminEmail: 'billworlddream1@gmail.com',
        severity: 'medium',
        status: 'info'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/platform');
    }
  };

  const generateSecurityKeyForUser = async (userId: string, expiryDays: number = 30) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newKey = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) newKey += "-";
      newKey += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    try {
      await updateDoc(doc(db, 'users', userId), { 
        securityKey: newKey, 
        isSecurityKeyEnabled: true,
        keyExpiresAt: expiresAt.toISOString()
      });
      return newKey;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      throw error;
    }
  };

  const seedUsers = async (count: number) => {
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const roles: ('user' | 'dealer')[] = ['user', 'dealer'];

    const totalBatches = Math.ceil(count / 500);
    
    for (let b = 0; b < totalBatches; b++) {
      const batch = writeBatch(db);
      const batchSize = Math.min(500, count - (b * 500));
      
      for (let i = 0; i < batchSize; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000000)}@example.com`;
        const role = roles[Math.floor(Math.random() * roles.length)];
        const id = `seed-${Math.random().toString(36).substr(2, 12)}`;
        
        const userRef = doc(db, 'users', id);
        batch.set(userRef, {
          id,
          uid: id,
          name,
          email,
          role,
          status: 'active',
          rank: 'Bronze',
          rankColor: 'text-gray-400',
          balance: Math.floor(Math.random() * 1000),
          createdAt: Timestamp.now(),
          handle: `@${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
          followers: Math.floor(Math.random() * 500),
          following: Math.floor(Math.random() * 500),
          avatar: `https://picsum.photos/seed/${id}/150`,
          isVerifiedSeller: role === 'dealer',
          verificationStatus: role === 'dealer' ? 'approved' : 'none',
          hasAcceptedMarketPolicy: role === 'dealer'
        });
      }
      
      await batch.commit();
      console.log(`Batch ${b + 1}/${totalBatches} committed`);
    }
  };

  return (
    <AdminContext.Provider value={{
      masterAdminEmail,
      masterAdminPass,
      updateMasterAdmin,
      miniAdmins,
      addMiniAdmin,
      removeMiniAdmin,
      updateMiniAdmin,
      generateAdminId,
      adCreditLimits,
      updateAdCreditLimit,
      siteUsers,
      updateUserRole,
      updateUserStatus,
      updateUserSuspension,
      updateDealerProductsStatus,
      updateSellerVerification,
      removeUser,
      settings,
      updateSettings,
      generateSecurityKeyForUser,
      seedUsers
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
