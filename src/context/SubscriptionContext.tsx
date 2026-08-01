import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp,
  getDocs,
  increment,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type PlanType = 'marketplace' | 'ai-ads' | 'streaming' | 'general' | 'mining';

export interface SubscriptionPlan {
  id: string;
  type: PlanType;
  name: string;
  price: number;
  durationMonths: number;
  durationDays?: number;
  creditsPerDay?: number;
  streamingHoursPerDay?: number;
  canDownload?: boolean;
  isPaused?: boolean;
}

export interface UserSubscription {
  id?: string;
  subscriberId: string;
  planId: string;
  type: PlanType;
  startDate: any;
  endDate: any;
  isActive: boolean;
}

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  allSubscriptions: UserSubscription[]; // For admin
  subscribe: (planId: string, method?: 'stripe' | 'wallet') => Promise<void>;
  isSubscribed: (type: PlanType) => boolean;
  getSubscription: (type: PlanType) => UserSubscription | undefined;
  checkAccess: (type: PlanType | 'supreme-mode' | 'supreme-insight' | 'media') => { hasAccess: boolean; message?: string };
  updateSubscription: (subId: string, data: Partial<UserSubscription>) => Promise<void>;
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => Promise<void>;
  updatePlan: (planId: string, data: Partial<SubscriptionPlan>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const PLANS: SubscriptionPlan[] = [
  // Marketplace
  { id: 'market-1m', type: 'marketplace', name: 'Marketplace Monthly', price: 5, durationMonths: 1 },
  { id: 'market-6m', type: 'marketplace', name: 'Marketplace 6 Months', price: 18, durationMonths: 6 },
  { id: 'market-1y', type: 'marketplace', name: 'Marketplace 1 Year', price: 25, durationMonths: 12 },
  { id: 'market-2y', type: 'marketplace', name: 'Marketplace 24 Months', price: 40, durationMonths: 24 },
  { id: 'market-5y', type: 'marketplace', name: 'Marketplace 5 Years', price: 150, durationMonths: 60 },
  
  // AI Tools for Ads
  { id: 'ai-ads-1m', type: 'ai-ads', name: 'AI Ads 1 Month', price: 5, durationMonths: 1, creditsPerDay: 60 },
  { id: 'ai-ads-3m', type: 'ai-ads', name: 'AI Ads 3 Months', price: 12, durationMonths: 3, creditsPerDay: 100 },
  { id: 'ai-ads-6m', type: 'ai-ads', name: 'AI Ads 6 Months', price: 30, durationMonths: 6, creditsPerDay: 110 },
  { id: 'ai-ads-9m', type: 'ai-ads', name: 'AI Ads 9 Months', price: 40, durationMonths: 9, creditsPerDay: 150 },
  { id: 'ai-ads-12m', type: 'ai-ads', name: 'AI Ads 12 Months', price: 60, durationMonths: 12, creditsPerDay: 200 },
  
  // Streaming
  { id: 'stream-1m', type: 'streaming', name: 'Streaming Monthly', price: 5, durationMonths: 1, streamingHoursPerDay: 2, canDownload: false },
  { id: 'stream-3m', type: 'streaming', name: 'Streaming 3 Months', price: 13, durationMonths: 3, streamingHoursPerDay: 2.5, canDownload: true },
  { id: 'stream-9m', type: 'streaming', name: 'Streaming 9 Months', price: 21, durationMonths: 9, streamingHoursPerDay: 3.5, canDownload: true },
  { id: 'stream-12m', type: 'streaming', name: 'Streaming 12 Months', price: 50, durationMonths: 12, streamingHoursPerDay: 4, canDownload: true },
  
  // General Subscription
  { id: 'general-1m', type: 'general', name: 'General Subs 1 Month', price: 25, durationMonths: 1, creditsPerDay: 100 },
  { id: 'general-6m', type: 'general', name: 'General Subs 6 Months', price: 55, durationMonths: 6, creditsPerDay: 150 },
  { id: 'general-12m', type: 'general', name: 'General Subs 12 Months', price: 100, durationMonths: 12, creditsPerDay: 200 },
  
  // Mining Rigs
  { id: 'mining-1gb', type: 'mining', name: '1GB Rig Subscription', price: 150, durationMonths: 0, durationDays: 38 },
  { id: 'mining-2gb', type: 'mining', name: '2GB Rig Subscription', price: 200, durationMonths: 0, durationDays: 45 },
  { id: 'mining-4gb', type: 'mining', name: '4GB Rig Subscription', price: 270, durationMonths: 0, durationDays: 45 },
  { id: 'mining-5gb', type: 'mining', name: '5GB Rig Subscription', price: 300, durationMonths: 0, durationDays: 64 },
  { id: 'mining-7gb', type: 'mining', name: '7GB Rig Subscription', price: 400, durationMonths: 0, durationDays: 67 },
  { id: 'mining-10gb', type: 'mining', name: '10GB Rig Subscription', price: 550, durationMonths: 0, durationDays: 70 },
  { id: 'mining-1tb', type: 'mining', name: '1TB Rig Subscription', price: 1000, durationMonths: 0, durationDays: 95 },
];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    // Dynamically synchronize the plans from Firestore with robust fallback
    const seedDefaultPlans = async () => {
      try {
        for (const p of PLANS) {
          await setDoc(doc(db, 'subscription_plans', p.id), {
            ...p,
            isPaused: false
          });
        }
      } catch (err) {
        console.warn("Failed to seed subscription plans (gracefully using static fallback):", err);
      }
    };

    const unsubscribePlans = onSnapshot(collection(db, 'subscription_plans'), (snapshot) => {
      if (snapshot.empty) {
        setPlans(PLANS);
        // Seed database in background asynchronously outside listener loop
        seedDefaultPlans();
      } else {
        const loadedPlans: SubscriptionPlan[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedPlans.push({
            ...data,
            id: docSnap.id
          } as SubscriptionPlan);
        });
        setPlans(loadedPlans);
      }
    }, (error) => {
      console.warn("Gracefully using static fallback for subscription plans:", error.message);
      setPlans(PLANS);
    });

    return () => unsubscribePlans();
  }, []);

  useEffect(() => {
    if (!user || !user.uid) {
      setUserSubscriptions([]);
      setAllSubscriptions([]);
      return;
    }

    // Current user's subscriptions
    const q = query(collection(db, 'subscriptions'), where('subscriberId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs: UserSubscription[] = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as UserSubscription);
      });
      setUserSubscriptions(subs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'subscriptions');
    });

    // All subscriptions for admin
    let unsubscribeAll = () => {};
    if (user.role === 'admin' || user.role === 'mini-admin' || user.email === 'billworlddream1@gmail.com') {
      const allQ = query(collection(db, 'subscriptions'));
      unsubscribeAll = onSnapshot(allQ, (snapshot) => {
        const subs: UserSubscription[] = [];
        snapshot.forEach((doc) => {
          subs.push({ id: doc.id, ...doc.data() } as UserSubscription);
        });
        setAllSubscriptions(subs);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'subscriptions');
      });
    }

    return () => {
      unsubscribe();
      unsubscribeAll();
    };
  }, [user]);

  const addPlan = async (plan: Omit<SubscriptionPlan, 'id'>) => {
    try {
      const cleanId = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.round(Math.random() * 1000);
      await setDoc(doc(db, 'subscription_plans', cleanId), {
        ...plan,
        id: cleanId,
        isPaused: false
      });
      toast.success(`Plan ${plan.name} created successfully!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subscription_plans');
    }
  };

  const updatePlan = async (planId: string, data: Partial<SubscriptionPlan>) => {
    try {
      await updateDoc(doc(db, 'subscription_plans', planId), data);
      toast.success('Subscription plan updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subscription_plans/${planId}`);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'subscription_plans', planId));
      toast.success('Subscription plan deleted successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subscription_plans/${planId}`);
    }
  };

  const subscribe = async (planId: string, method: 'stripe' | 'wallet' = 'stripe') => {
    if (!user) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (method === 'wallet') {
      const userBalance = user.balance || 0;
      if (userBalance < plan.price) {
        toast.error('Insufficient wallet balance. Please top up or use another payment method.');
        return;
      }
    }

    const startDate = Timestamp.now();
    const endDateDate = new Date();
    if (plan.durationDays) {
      endDateDate.setDate(endDateDate.getDate() + plan.durationDays);
    } else {
      endDateDate.setMonth(endDateDate.getMonth() + plan.durationMonths);
    }
    const endDate = Timestamp.fromDate(endDateDate);

    const newSub: Omit<UserSubscription, 'id'> = {
      subscriberId: user.uid,
      planId,
      type: plan.type,
      startDate,
      endDate,
      isActive: true
    };

    try {
      if (method === 'wallet') {
        // Deduct from wallet
        await updateDoc(doc(db, 'users', user.uid), {
          balance: increment(-plan.price)
        });

        // Record transaction
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          amount: plan.price,
          type: 'payment',
          category: 'Subscription',
          description: `Subscription to ${plan.name}`,
          status: 'completed',
          date: Timestamp.now()
        });
      } else if (method === 'stripe') {
        // In a real app, we'd redirect to Stripe checkout here
        // For now, we'll simulate a successful payment
        toast.success(`Redirecting to Stripe for ${plan.name}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Check if already has a sub of this type and deactivate it
      const existing = userSubscriptions.find(s => s.type === plan.type);
      if (existing && existing.id) {
        await updateDoc(doc(db, 'subscriptions', existing.id), { isActive: false });
      }
      await addDoc(collection(db, 'subscriptions'), newSub);
      
      toast.success(`Successfully subscribed to ${plan.name}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
    }
  };

  const updateSubscription = async (subId: string, data: Partial<UserSubscription>) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  const isSubscribed = (type: PlanType) => {
    const sub = userSubscriptions.find(s => (s.type === type || s.type === 'general') && s.isActive);
    if (!sub) return false;
    
    const end = sub.endDate instanceof Timestamp ? sub.endDate.toDate() : new Date(sub.endDate);
    return end > new Date();
  };

  const getSubscription = (type: PlanType) => {
    return userSubscriptions.find(s => (s.type === type || s.type === 'general') && s.isActive);
  };

  const checkAccess = (type: PlanType | 'supreme-mode' | 'supreme-insight' | 'media'): { hasAccess: boolean; message?: string } => {
    if (!user) return { hasAccess: false, message: 'Please login to access this feature.' };
    
    const signupDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt);
    const now = new Date();
    const daysSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24);

    // Check trials
    if (type === 'supreme-mode' || type === 'media') {
      if (daysSinceSignup <= 30) return { hasAccess: true };
      if (isSubscribed('general')) return { hasAccess: true };
      return { hasAccess: false, message: 'Your 1-month free trial has expired. Please subscribe to General Subs to continue.' };
    }

    if (type === 'supreme-insight') {
      if (daysSinceSignup <= 7) return { hasAccess: true };
      if (isSubscribed('general')) return { hasAccess: true };
      return { hasAccess: false, message: 'Your 1-week free trial has expired. Please subscribe to General Subs to continue.' };
    }

    // For other types, check specific sub or general sub
    const subType = (type === 'ai-ads' || type === 'marketplace' || type === 'streaming') ? type : 'general';
    
    // Trial for specific features as well (1 month)
    if (daysSinceSignup <= 30) return { hasAccess: true };
    
    if (isSubscribed(subType as PlanType)) return { hasAccess: true };

    return { hasAccess: false, message: `Subscription required for ${type}. Please choose a plan.` };
  };

  return (
    <SubscriptionContext.Provider value={{
      plans,
      userSubscriptions,
      allSubscriptions,
      subscribe,
      isSubscribed,
      getSubscription,
      checkAccess,
      updateSubscription,
      addPlan,
      updatePlan,
      deletePlan
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
