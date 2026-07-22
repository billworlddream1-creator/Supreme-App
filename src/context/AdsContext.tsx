import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  Timestamp,
  increment,
  getDoc,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

export interface Ad {
  id: string;
  userId: string;
  type: 'video' | 'text' | 'ai-generated' | 'image';
  level: 1 | 2 | 3 | 4;
  size: 'leaderboard' | 'banner' | 'large-rectangle' | 'medium-rectangle' | 'square' | 'skyscraper' | 'wide-skyscraper';
  backgroundColor: string;
  content: string;
  title: string;
  url?: string;
  videoUrl?: string;
  backgroundType?: 'color' | 'image' | 'video';
  backgroundUrl?: string;
  textBackgroundColor?: string;
  startTime?: string;
  endTime?: string;
  activeHours?: number[];
  targeting?: string[];
  createdAt: any;
  expiresAt: any;
  subscriptionId: string;
  clicks: number;
  revenue: number;
  status?: 'active' | 'coming-soon';
}

export interface PromotionalInjection {
  id: string;
  message: string;
  color: string;
  speed: number;
  isActive: boolean;
  createdAt: string;
}

interface AdsContextType {
  ads: Ad[];
  createAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'expiresAt' | 'clicks' | 'revenue'>) => Promise<void>;
  trackClick: (adId: string, clickerId?: string) => Promise<void>;
  getActiveAds: (level?: number) => Ad[];
  getDashboardAds: () => Ad[];
  getAdsDomain: () => Ad[];
  promotionalInjections: PromotionalInjection[];
  addPromotionalInjection: (injection: Omit<PromotionalInjection, 'id' | 'createdAt' | 'isActive'>) => void;
  toggleInjection: (id: string) => void;
  removeInjection: (id: string) => void;
  globalVideoPlaytime: number;
  incrementVideoPlaytime: (seconds: number) => void;
  shouldShowVideoAd: boolean;
  resetVideoAdTimer: () => void;
  productViewCount: number;
  incrementProductViewCount: () => void;
  shouldShowMarketAd: boolean;
  resetMarketAdCounter: () => void;
  postViewCount: number;
  incrementPostViewCount: () => void;
  shouldShowNetworkAd: boolean;
  resetNetworkAdCounter: () => void;
  vibePlayCount: number;
  incrementVibePlayCount: () => void;
  shouldShowVibeAd: boolean;
  resetVibeAdCounter: () => void;
  deleteAd: (id: string) => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotionalInjections, setPromotionalInjections] = useState<PromotionalInjection[]>([]);
  const [globalVideoPlaytime, setGlobalVideoPlaytime] = useState(0);
  const [shouldShowVideoAd, setShouldShowVideoAd] = useState(false);
  const [productViewCount, setProductViewCount] = useState(0);
  const [shouldShowMarketAd, setShouldShowMarketAd] = useState(false);
  const [postViewCount, setPostViewCount] = useState(0);
  const [shouldShowNetworkAd, setShouldShowNetworkAd] = useState(false);
  const [vibePlayCount, setVibePlayCount] = useState(0);
  const [shouldShowVibeAd, setShouldShowVibeAd] = useState(false);

  // 30 minutes in seconds for Level 2
  const AD_INTERVAL_SECONDS = 30 * 60;

  const incrementVideoPlaytime = (seconds: number) => {
    setGlobalVideoPlaytime(prev => {
      const newTime = prev + seconds;
      if (newTime >= AD_INTERVAL_SECONDS) {
        setShouldShowVideoAd(true);
      }
      return newTime;
    });
  };

  const resetVideoAdTimer = () => {
    setGlobalVideoPlaytime(0);
    setShouldShowVideoAd(false);
  };

  const incrementProductViewCount = () => {
    setProductViewCount(prev => {
      const next = prev + 1;
      if (next >= 10) setShouldShowMarketAd(true);
      return next;
    });
  };

  const resetMarketAdCounter = () => {
    setProductViewCount(0);
    setShouldShowMarketAd(false);
  };

  const incrementPostViewCount = () => {
    setPostViewCount(prev => {
      const next = prev + 1;
      if (next >= 7) setShouldShowNetworkAd(true);
      return next;
    });
  };

  const resetNetworkAdCounter = () => {
    setPostViewCount(0);
    setShouldShowNetworkAd(false);
  };

  const incrementVibePlayCount = () => {
    setVibePlayCount(prev => {
      const next = prev + 1;
      if (next >= 7) setShouldShowVibeAd(true);
      return next;
    });
  };

  const resetVibeAdCounter = () => {
    setVibePlayCount(0);
    setShouldShowVibeAd(false);
  };

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setAds([]);
      return;
    }
    const q = query(collection(db, 'ads'), limit(1000));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData: Ad[] = [];
      snapshot.forEach((doc) => {
        adsData.push({ id: doc.id, ...doc.data() } as Ad);
      });
      setAds(adsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ads');
    });

    const storedInjections = localStorage.getItem('supreme_injections');
    if (storedInjections) {
      try {
        setPromotionalInjections(JSON.parse(storedInjections));
      } catch (e) {}
    }

    return () => unsubscribe();
  }, [currentUser]);

  const createAd = async (adData: Omit<Ad, 'id' | 'createdAt' | 'expiresAt' | 'clicks' | 'revenue'>) => {
    const createdAt = Timestamp.now();
    const expiresAtDate = new Date();
    expiresAtDate.setFullYear(expiresAtDate.getFullYear() + 1);
    const expiresAt = Timestamp.fromDate(expiresAtDate);

    try {
      await addDoc(collection(db, 'ads'), {
        ...adData,
        createdAt,
        expiresAt,
        clicks: 0,
        revenue: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ads');
    }
  };

  const addPromotionalInjection = (data: Omit<PromotionalInjection, 'id' | 'createdAt' | 'isActive'>) => {
    const newInjection: PromotionalInjection = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      ...data
    };
    const updated = [newInjection, ...promotionalInjections];
    setPromotionalInjections(updated);
    localStorage.setItem('supreme_injections', JSON.stringify(updated));
  };

  const toggleInjection = (id: string) => {
    const updated = promotionalInjections.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i);
    setPromotionalInjections(updated);
    localStorage.setItem('supreme_injections', JSON.stringify(updated));
  };

  const removeInjection = (id: string) => {
    const updated = promotionalInjections.filter(i => i.id !== id);
    setPromotionalInjections(updated);
    localStorage.setItem('supreme_injections', JSON.stringify(updated));
  };

  const trackClick = async (adId: string, clickerId?: string) => {
    try {
      const adRef = doc(db, 'ads', adId);
      const adSnap = await getDoc(adRef);
      
      if (adSnap.exists()) {
        const adData = adSnap.data() as Ad;
        if (clickerId && adData.userId === clickerId) {
          return;
        }

        await updateDoc(adRef, {
          clicks: increment(1),
          revenue: increment(0.05)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ads/${adId}`);
    }
  };

  const getActiveAds = (level?: number) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    return ads.filter(ad => {
      const expires = ad.expiresAt instanceof Timestamp ? ad.expiresAt.toDate() : new Date(ad.expiresAt);
      const startTime = ad.startTime ? new Date(ad.startTime) : null;
      const endTime = ad.endTime ? new Date(ad.endTime) : null;
      
      const isLevelMatch = level ? ad.level === level : true;
      const isWithinTimeRange = (!startTime || now >= startTime) && (!endTime || now <= endTime);
      const isWithinActiveHours = !ad.activeHours || ad.activeHours.length === 0 || ad.activeHours.includes(currentHour);
      
      return expires > now && isLevelMatch && isWithinTimeRange && isWithinActiveHours;
    });
  };

  const getDashboardAds = () => {
    const now = new Date();
    return ads.filter(ad => {
      if (ad.level !== 4) return false;
      const created = ad.createdAt instanceof Timestamp ? ad.createdAt.toDate() : new Date(ad.createdAt);
      const diff = now.getTime() - created.getTime();
      return diff < 24 * 60 * 60 * 1000;
    });
  };

  const getAdsDomain = () => {
    return getActiveAds();
  };

  const deleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ads/${id}`);
    }
  };

  return (
    <AdsContext.Provider value={{
      ads,
      createAd,
      trackClick,
      getActiveAds,
      getDashboardAds,
      getAdsDomain,
      promotionalInjections,
      addPromotionalInjection,
      toggleInjection,
      removeInjection,
      globalVideoPlaytime,
      incrementVideoPlaytime,
      shouldShowVideoAd,
      resetVideoAdTimer,
      productViewCount,
      incrementProductViewCount,
      shouldShowMarketAd,
      resetMarketAdCounter,
      postViewCount,
      incrementPostViewCount,
      shouldShowNetworkAd,
      resetNetworkAdCounter,
      vibePlayCount,
      incrementVibePlayCount,
      shouldShowVibeAd,
      resetVibeAdCounter,
      deleteAd
    }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
}
