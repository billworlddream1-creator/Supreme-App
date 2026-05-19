import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { useWallet } from './WalletContext';
import { useAdmin } from './AdminContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export interface Coin {
  id: string;
  name: string;
  color: string;
}

export interface MiningRig {
  id: string;
  name: string;
  rate: number;
  color: string;
  machineImage: string;
  type: 'cloud' | 'gpu' | 'asic';
  purchasePrice?: number;
}

export interface RigSubscription {
  rigId: string;
  expiryDate: number;
  purchaseDate: number;
  paymentMethod: 'wallet' | 'stripe';
}

export interface RigSubscriptionPlan {
  rigId: string;
  price: number;
  durationDays: number;
}

export interface MiningActivity {
  id: string;
  coinId: string;
  rigId: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'stopped';
  amountMined: number;
}

export const COINS: Coin[] = [
  { id: 'BTC', name: 'Bitcoin', color: '#f59e0b' },
  { id: 'ETH', name: 'Ethereum', color: '#6366f1' },
  { id: 'SOL', name: 'Solana', color: '#14b8a6' },
  { id: 'BNB', name: 'Binance Coin', color: '#eab308' },
  { id: 'XRP', name: 'Ripple', color: '#0ea5e9' },
  { id: 'ADA', name: 'Cardano', color: '#3b82f6' },
  { id: 'DOGE', name: 'Dogecoin', color: '#eab308' },
  { id: 'DOT', name: 'Polkadot', color: '#ec4899' },
  { id: 'LINK', name: 'Chainlink', color: '#2563eb' },
  { id: 'SUP', name: 'Supreme Coin', color: '#d97706' }
];

export const EXCHANGE_RATES: Record<string, number> = {
  BTC: 65000,
  ETH: 3500,
  SOL: 150,
  BNB: 400,
  XRP: 0.60,
  ADA: 0.50,
  DOGE: 0.15,
  DOT: 8.00,
  LINK: 18.00,
  SUP: 10.00
};

export const MINING_RIGS: MiningRig[] = [
  { id: '500mb', name: '500MB Rig', rate: 0.0005, color: 'bg-emerald-500', machineImage: 'https://picsum.photos/seed/server-500mb/400/300', type: 'cloud' },
  { id: '1gb', name: '1GB Rig', rate: 0.001, color: 'bg-blue-500', machineImage: 'https://picsum.photos/seed/datacenter-1gb/400/300', type: 'cloud' },
  { id: '2gb', name: '2GB Rig', rate: 0.002, color: 'bg-indigo-500', machineImage: 'https://picsum.photos/seed/mining-rig-2gb/400/300', type: 'cloud' },
  { id: '4gb', name: '4GB Rig', rate: 0.005, color: 'bg-purple-500', machineImage: 'https://picsum.photos/seed/hardware-4gb/400/300', type: 'cloud' },
  { id: '5gb', name: '5GB Rig', rate: 0.008, color: 'bg-pink-500', machineImage: 'https://picsum.photos/seed/gpu-5gb/400/300', type: 'cloud' },
  { id: '7gb', name: '7GB Rig', rate: 0.012, color: 'bg-rose-500', machineImage: 'https://picsum.photos/seed/cpu-7gb/400/300', type: 'cloud' },
  { id: '10gb', name: '10GB Rig', rate: 0.020, color: 'bg-orange-500', machineImage: 'https://picsum.photos/seed/server-10gb/400/300', type: 'cloud' },
  { id: '1tb', name: '1TB Rig', rate: 0.100, color: 'bg-red-600', machineImage: 'https://picsum.photos/seed/datacenter-1tb/400/300', type: 'cloud' },
  // GPU Miners
  { id: 'rtx3080', name: 'NVIDIA RTX 3080', rate: 0.0015, color: 'bg-green-500', machineImage: 'https://picsum.photos/seed/gpu-3080/400/300', type: 'gpu', purchasePrice: 150 },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', rate: 0.0045, color: 'bg-green-600', machineImage: 'https://picsum.photos/seed/gpu-4090/400/300', type: 'gpu', purchasePrice: 450 },
  { id: 'rx7900', name: 'AMD RX 7900 XTX', rate: 0.0038, color: 'bg-red-500', machineImage: 'https://picsum.photos/seed/gpu-7900/400/300', type: 'gpu', purchasePrice: 380 },
  // ASIC Miners
  { id: 'antminer-s19', name: 'Antminer S19 Pro', rate: 0.015, color: 'bg-gray-700', machineImage: 'https://picsum.photos/seed/asic-s19/400/300', type: 'asic', purchasePrice: 1200 },
  { id: 'antminer-s21', name: 'Antminer S21', rate: 0.035, color: 'bg-gray-800', machineImage: 'https://picsum.photos/seed/asic-s21/400/300', type: 'asic', purchasePrice: 2500 },
  { id: 'whatsminer-m50', name: 'Whatsminer M50S', rate: 0.028, color: 'bg-gray-600', machineImage: 'https://picsum.photos/seed/asic-m50/400/300', type: 'asic', purchasePrice: 1800 }
];

export const RIG_SUBSCRIPTION_PLANS: RigSubscriptionPlan[] = [
  { rigId: '1gb', price: 150, durationDays: 38 },
  { rigId: '2gb', price: 200, durationDays: 45 },
  { rigId: '4gb', price: 270, durationDays: 45 },
  { rigId: '5gb', price: 300, durationDays: 64 },
  { rigId: '7gb', price: 400, durationDays: 67 },
  { rigId: '10gb', price: 3500, durationDays: 70 },
  { rigId: '1tb', price: 8000, durationDays: 95 }
];

export const MINING_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms
export const CASH_OUT_THRESHOLD = 0.001000000000;
export const MAX_CASH_OUT_THRESHOLD = 0.100000000000;
export const REQUIRED_MINING_POINTS = 12;

interface MiningContextType {
  activeMiner: string | null;
  miningStartTime: number | null;
  minedBalances: Record<string, number>;
  selectedRigs: Record<string, string>;
  coins: Coin[];
  exchangeRates: Record<string, number>;
  miningRigs: MiningRig[];
  miningActivities: MiningActivity[];
  rigSubscriptions: Record<string, RigSubscription>;
  ownedHardware: string[];
  toggleMining: (coinId: string) => void;
  updateRig: (coinId: string, rigId: string) => void;
  purchaseRigSubscription: (rigId: string, paymentMethod: 'wallet' | 'stripe') => Promise<boolean>;
  purchaseHardware: (rigId: string, paymentMethod: 'wallet' | 'stripe') => Promise<boolean>;
  isRigSubscribed: (rigId: string) => boolean;
  isHardwareOwned: (rigId: string) => boolean;
  convertMined: (coinId: string, amount: number) => void;
  canCashOut: () => { allowed: boolean, reason?: string, isFreeMiner: boolean };
  recordFreeMinerCashout: (amount: number) => void;
  addMiningPoints: (points: number) => Promise<void>;
  miningPoints: number;
  freeMinerCashouts: { amount: number, lastDate: number };
  freeMiningTotal: number;
  timeRemaining: number | null;
  // Admin functions
  updateExchangeRate: (coinId: string, rate: number) => void;
  updateRigRate: (rigId: string, rate: number) => void;
  addCoin: (coin: Coin, rate: number) => void;
  removeCoin: (coinId: string) => void;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<Coin[]>(() => {
    const saved = localStorage.getItem('supreme_mining_coins');
    return saved ? JSON.parse(saved) : COINS;
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('supreme_mining_rates');
    return saved ? JSON.parse(saved) : EXCHANGE_RATES;
  });

  const [miningRigs, setMiningRigs] = useState<MiningRig[]>(() => {
    const saved = localStorage.getItem('supreme_mining_rigs');
    return saved ? JSON.parse(saved) : MINING_RIGS;
  });

  const [miningActivities, setMiningActivities] = useState<MiningActivity[]>(() => {
    const saved = localStorage.getItem('supreme_mining_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMiner, setActiveMiner] = useState<string | null>(() => localStorage.getItem('supreme_active_miner'));
  const [miningStartTime, setMiningStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('supreme_mining_start_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [minedBalances, setMinedBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('supreme_mined_balances');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, number> = {};
    COINS.forEach(c => initial[c.id] = 0);
    return initial;
  });
  const [selectedRigs, setSelectedRigs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('supreme_selected_rigs');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, string> = {};
    COINS.forEach(c => initial[c.id] = '500mb');
    return initial;
  });
  const [rigSubscriptions, setRigSubscriptions] = useState<Record<string, RigSubscription>>(() => {
    const saved = localStorage.getItem('supreme_rig_subscriptions');
    return saved ? JSON.parse(saved) : {};
  });
  const [ownedHardware, setOwnedHardware] = useState<string[]>(() => {
    const saved = localStorage.getItem('supreme_owned_hardware');
    return saved ? JSON.parse(saved) : [];
  });
  const [freeMiningTotal, setFreeMiningTotal] = useState<number>(() => {
    const saved = localStorage.getItem('supreme_free_mining_total');
    return saved ? parseFloat(saved) : 0;
  });
  const [freeMinerCashouts, setFreeMinerCashouts] = useState<{ amount: number, lastDate: number }>(() => {
    const saved = localStorage.getItem('supreme_free_miner_cashouts');
    return saved ? JSON.parse(saved) : { amount: 0, lastDate: 0 };
  });
  const [miningPoints, setMiningPoints] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { user } = useAuth();
  const { boostMultiplier, isBoosted } = useWallet();
  const { settings } = useAdmin();

  const isMasterAdmin = user?.email === 'billworlddream1@gmail.com';

  // Persistence
  useEffect(() => {
    localStorage.setItem('supreme_mining_coins', JSON.stringify(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('supreme_mining_rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  useEffect(() => {
    localStorage.setItem('supreme_mining_rigs', JSON.stringify(miningRigs));
  }, [miningRigs]);

  useEffect(() => {
    localStorage.setItem('supreme_mining_activities', JSON.stringify(miningActivities));
  }, [miningActivities]);

  useEffect(() => {
    if (activeMiner) localStorage.setItem('supreme_active_miner', activeMiner);
    else localStorage.removeItem('supreme_active_miner');
  }, [activeMiner]);

  useEffect(() => {
    if (miningStartTime) localStorage.setItem('supreme_mining_start_time', miningStartTime.toString());
    else localStorage.removeItem('supreme_mining_start_time');
  }, [miningStartTime]);

  useEffect(() => {
    localStorage.setItem('supreme_mined_balances', JSON.stringify(minedBalances));
  }, [minedBalances]);

  useEffect(() => {
    localStorage.setItem('supreme_selected_rigs', JSON.stringify(selectedRigs));
  }, [selectedRigs]);

  useEffect(() => {
    localStorage.setItem('supreme_rig_subscriptions', JSON.stringify(rigSubscriptions));
  }, [rigSubscriptions]);

  useEffect(() => {
    localStorage.setItem('supreme_owned_hardware', JSON.stringify(ownedHardware));
  }, [ownedHardware]);

  useEffect(() => {
    localStorage.setItem('supreme_free_mining_total', freeMiningTotal.toString());
  }, [freeMiningTotal]);

  useEffect(() => {
    localStorage.setItem('supreme_free_miner_cashouts', JSON.stringify(freeMinerCashouts));
  }, [freeMinerCashouts]);

  useEffect(() => {
    if (user) {
      const fetchMiningPoints = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setMiningPoints(userDoc.data().miningPoints || 0);
        }
      };
      fetchMiningPoints();
    }
  }, [user]);

  // Mining Loop
  useEffect(() => {
    if (!activeMiner || !miningStartTime) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - miningStartTime;
      const remaining = Math.max(0, MINING_DURATION - elapsed);
      setTimeRemaining(remaining);

      const rigId = selectedRigs[activeMiner];
      const rig = miningRigs.find(r => r.id === rigId) || miningRigs[0];

      const rateInUSD = rig.rate * (isBoosted ? boostMultiplier : 1);
      const rateInCoin = rateInUSD / exchangeRates[activeMiner];

      if (remaining <= 0) {
        setActiveMiner(null);
        setMiningStartTime(null);
        
        // Update activity
        setMiningActivities(prev => {
          const last = prev[0];
          if (last && last.status === 'active') {
            return [{ ...last, status: 'completed', endTime: now }, ...prev.slice(1)];
          }
          return prev;
        });

        toast.error('Mining session ended. Please reactivate your miner.', {
          description: 'Your 6-hour mining period has expired.',
          duration: 10000,
        });

        // Award points for both free and paid rigs
        addMiningPoints(12);

        clearInterval(interval);
        return;
      }

      setMinedBalances(prev => {
        const next = { ...prev };
        const feeFactor = 1 - ((settings.supremeFeePercentage || 17) / 100);
        const netRateInCoin = rateInCoin * feeFactor;
        next[activeMiner] = (next[activeMiner] || 0) + netRateInCoin;
        
        // Track free mining total in USD
        if (rigId === '500mb') {
          setFreeMiningTotal(curr => curr + rateInUSD);
        }
        
        return next;
      });

      // Update current activity amount
      setMiningActivities(prev => {
        const last = prev[0];
        if (last && last.status === 'active') {
          const feeFactor = 1 - ((settings.supremeFeePercentage || 17) / 100);
          const netRateInCoin = rateInCoin * feeFactor;
          return [{ ...last, amountMined: last.amountMined + netRateInCoin }, ...prev.slice(1)];
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMiner, miningStartTime, selectedRigs, miningRigs, exchangeRates]);

  const toggleMining = useCallback((coinId: string) => {
    const now = Date.now();
    if (activeMiner === coinId) {
      setActiveMiner(null);
      setMiningStartTime(null);
      
      // Update activity
      setMiningActivities(prev => {
        const last = prev[0];
        if (last && last.status === 'active') {
          return [{ ...last, status: 'stopped', endTime: now }, ...prev.slice(1)];
        }
        return prev;
      });

      toast.info(`Stopped mining ${coinId}`);
    } else {
      // If another miner is active, stop it first
      if (activeMiner) {
        setMiningActivities(prev => {
          const last = prev[0];
          if (last && last.status === 'active') {
            return [{ ...last, status: 'stopped', endTime: now }, ...prev.slice(1)];
          }
          return prev;
        });
      }

      setActiveMiner(coinId);
      setMiningStartTime(now);
      
      // Add new activity
      const newActivity: MiningActivity = {
        id: Math.random().toString(36).substr(2, 9),
        coinId,
        rigId: selectedRigs[coinId] || '500mb',
        startTime: now,
        status: 'active',
        amountMined: 0
      };
      setMiningActivities(prev => [newActivity, ...prev]);

      toast.success(`Started mining ${coinId}. Session will run for 6 hours.`);
    }
  }, [activeMiner, selectedRigs]);

  const updateRig = useCallback((coinId: string, rigId: string) => {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig) return;

    if (isMasterAdmin) {
      setSelectedRigs(prev => ({ ...prev, [coinId]: rigId }));
      return;
    }

    if (rig.type === 'cloud') {
      if (rigId !== '500mb' && !isRigSubscribed(rigId)) {
        toast.error(`You need an active subscription for ${rigId.toUpperCase()}`);
        return;
      }
    } else {
      if (!isHardwareOwned(rigId)) {
        toast.error(`You need to purchase the ${rig.name} hardware first`);
        return;
      }
    }
    
    setSelectedRigs(prev => ({ ...prev, [coinId]: rigId }));
  }, [rigSubscriptions, ownedHardware, miningRigs]);

  const isRigSubscribed = useCallback((rigId: string) => {
    if (isMasterAdmin) return true;
    if (rigId === '500mb') return true; // 500MB is free/default
    const sub = rigSubscriptions[rigId];
    if (!sub) return false;
    return sub.expiryDate > Date.now();
  }, [rigSubscriptions]);

  const isHardwareOwned = useCallback((rigId: string) => {
    if (isMasterAdmin) return true;
    return ownedHardware.includes(rigId);
  }, [ownedHardware, isMasterAdmin]);

  const purchaseHardware = useCallback(async (rigId: string, paymentMethod: 'wallet' | 'stripe') => {
    const rig = miningRigs.find(r => r.id === rigId);
    if (!rig || !rig.purchasePrice) return false;

    // Payment logic would be handled by the caller (WalletContext)
    setOwnedHardware(prev => [...prev, rigId]);
    toast.success(`Successfully purchased ${rig.name}!`);
    return true;
  }, [miningRigs]);

  const purchaseRigSubscription = useCallback(async (rigId: string, paymentMethod: 'wallet' | 'stripe') => {
    const plan = RIG_SUBSCRIPTION_PLANS.find(p => p.rigId === rigId);
    if (!plan) return false;

    if (paymentMethod === 'wallet') {
      // Wallet payment logic would go here, but we need WalletContext
      // For now, let's assume it's handled in the component calling this
      // Or we can just simulate success for now if it's from wallet
    }

    const now = Date.now();
    const expiryDate = now + (plan.durationDays * 24 * 60 * 60 * 1000);
    
    setRigSubscriptions(prev => ({
      ...prev,
      [rigId]: {
        rigId,
        expiryDate,
        purchaseDate: now,
        paymentMethod
      }
    }));

    toast.success(`Successfully subscribed to ${rigId.toUpperCase()} for ${plan.durationDays} day(s)`);
    return true;
  }, []);

  // Expiration Alerts
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      Object.values(rigSubscriptions).forEach(sub => {
        const timeLeft = sub.expiryDate - now;
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (timeLeft > 0 && timeLeft < oneDay) {
          toast.warning(`Your ${sub.rigId.toUpperCase()} subscription expires in less than 24 hours!`, {
            description: 'Renew now to continue mining without interruption.',
            duration: 10000
          });
        } else if (timeLeft <= 0) {
          // Auto-downgrade rigs that use this sub
          setSelectedRigs(prev => {
            const next = { ...prev };
            let changed = false;
            Object.keys(next).forEach(coinId => {
              if (next[coinId] === sub.rigId) {
                next[coinId] = '500mb';
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        }
      });
    };

    const interval = setInterval(checkExpirations, 60 * 60 * 1000); // Check every hour
    checkExpirations(); // Initial check
    return () => clearInterval(interval);
  }, [rigSubscriptions]);

  const convertMined = useCallback((coinId: string, amount: number) => {
    setMinedBalances(prev => ({
      ...prev,
      [coinId]: Math.max(0, prev[coinId] - amount)
    }));
  }, []);

  const recordFreeMinerCashout = useCallback((amount: number) => {
    const now = Date.now();
    setFreeMinerCashouts(prev => {
      // If it's been more than 31 days, reset the amount
      const isNewPeriod = now - prev.lastDate > 31 * 24 * 60 * 60 * 1000;
      return {
        amount: isNewPeriod ? amount : prev.amount + amount,
        lastDate: isNewPeriod ? now : prev.lastDate
      };
    });
  }, []);

  const addMiningPoints = useCallback(async (points: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        miningPoints: increment(points)
      });
      setMiningPoints(prev => prev + points);
      toast.success(`You earned ${points} mining points!`);
    } catch (error) {
      console.error('Error adding mining points:', error);
    }
  }, [user]);

  const canCashOut = useCallback(() => {
    if (isMasterAdmin) return { allowed: true, isFreeMiner: false };

    const hasSub = Object.values(rigSubscriptions).some(sub => sub.expiryDate > Date.now());
    const hasHardware = ownedHardware.length > 0;
    const isPaidUser = hasSub || hasHardware;

    // Points requirement for everyone
    if (miningPoints < REQUIRED_MINING_POINTS) {
      return { 
        allowed: false, 
        reason: `You require at least ${REQUIRED_MINING_POINTS} mining points to cash out. You currently have ${miningPoints} points.`,
        isFreeMiner: !isPaidUser
      };
    }
    
    if (isPaidUser) {
      return { allowed: true, isFreeMiner: false };
    }

    // Free miner logic
    const now = Date.now();
    const isNewPeriod = now - freeMinerCashouts.lastDate > 31 * 24 * 60 * 60 * 1000;
    const currentPeriodAmount = isNewPeriod ? 0 : freeMinerCashouts.amount;

    if (currentPeriodAmount >= 2) {
      const daysLeft = Math.ceil((31 * 24 * 60 * 60 * 1000 - (now - freeMinerCashouts.lastDate)) / (24 * 60 * 60 * 1000));
      return { 
        allowed: false, 
        reason: `Free miners can only cash out $2 maximum per 31 days. You have already cashed out $${currentPeriodAmount.toFixed(2)}. Please wait ${daysLeft} more day(s).`,
        isFreeMiner: true 
      };
    }

    return { allowed: true, isFreeMiner: true };
  }, [rigSubscriptions, ownedHardware, freeMinerCashouts, miningPoints]);

  // Admin functions
  const updateExchangeRate = useCallback((coinId: string, rate: number) => {
    setExchangeRates(prev => ({ ...prev, [coinId]: rate }));
    toast.success(`Updated ${coinId} exchange rate to $${rate}`);
  }, []);

  const updateRigRate = useCallback((rigId: string, rate: number) => {
    setMiningRigs(prev => prev.map(r => r.id === rigId ? { ...r, rate } : r));
    toast.success(`Updated rig rate to $${rate}/s`);
  }, []);

  const addCoin = useCallback((coin: Coin, rate: number) => {
    setCoins(prev => [...prev, coin]);
    setExchangeRates(prev => ({ ...prev, [coin.id]: rate }));
    setMinedBalances(prev => ({ ...prev, [coin.id]: 0 }));
    setSelectedRigs(prev => ({ ...prev, [coin.id]: '500mb' }));
    toast.success(`Added ${coin.name} to mining list`);
  }, []);

  const removeCoin = useCallback((coinId: string) => {
    setCoins(prev => prev.filter(c => c.id !== coinId));
    toast.info(`Removed ${coinId} from mining list`);
  }, []);

  return (
    <MiningContext.Provider value={{
      activeMiner,
      miningStartTime,
      minedBalances,
      selectedRigs,
      coins,
      exchangeRates,
      miningRigs,
      miningActivities,
      rigSubscriptions,
      ownedHardware,
      toggleMining,
      updateRig,
      purchaseRigSubscription,
      purchaseHardware,
      isRigSubscribed,
      isHardwareOwned,
      convertMined,
      canCashOut,
      recordFreeMinerCashout,
      addMiningPoints,
      miningPoints,
      freeMinerCashouts,
      freeMiningTotal,
      timeRemaining,
      updateExchangeRate,
      updateRigRate,
      addCoin,
      removeCoin
    }}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = () => {
  const context = useContext(MiningContext);
  if (!context) throw new Error('useMining must be used within a MiningProvider');
  return context;
};
