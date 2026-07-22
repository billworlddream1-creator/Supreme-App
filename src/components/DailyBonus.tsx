import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSound } from '../context/SoundContext';
import { toast } from 'sonner';
import { Coins, Gift, Crown, Check, Sparkles, Flame, X, Calendar, ArrowRight, TrendingUp, Info, Award, Zap, History, ShieldAlert, BarChart3, Clock, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import StreakAnalysisArea from './StreakAnalysisArea';

const DAILY_REWARDS = [
  { day: 1, reward: 10, label: 'Day 1 Bonus', tier: 'Starter', desc: 'Secure base platform entry coins.', color: '#b45309' },
  { day: 2, reward: 15, label: 'Bronze Boost', tier: 'Bronze', desc: '1.5x multi-multiplier applied to yield.', color: '#d97706' },
  { day: 3, reward: 25, label: 'Silver Boost', tier: 'Silver', desc: 'Accelerated cloud mining cycles.', color: '#94a3b8' },
  { day: 4, reward: 40, label: 'Gold Stack', tier: 'Gold', desc: 'Double reward bonus on tasks.', color: '#fbbf24' },
  { day: 5, reward: 60, label: 'Plat Payout', tier: 'Platinum', desc: 'Instant premium fee reductions.', color: '#38bdf8' },
  { day: 6, reward: 100, label: 'Diamond Drop', tier: 'Diamond', desc: 'Unlock rare master level assets.', color: '#8b5cf6' },
  { day: 7, reward: 250, label: 'Crowned Payout', tier: 'Crown Elite', desc: 'Maximum compounding multiplier yield active!', color: '#f59e0b' }
];

export default function DailyBonus() {
  const { user } = useAuth();
  const { receivePayment } = useWallet();
  const { playSound, playPaymentRequest } = useSound();
  const { addNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'claim' | 'history'>('claim');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimedNow, setIsClaimedNow] = useState(false);
  
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    const userId = user?.uid || 'guest';
    const saved = localStorage.getItem(`daily_bonus_reminders_${userId}`);
    return saved !== 'false';
  });
  
  // High fidelity local state variables for accurate consecutive logins
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [lastClaimedDate, setLastClaimedDate] = useState<string>('');
  
  // History list states
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [floatingCoins, setFloatingCoins] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [selectedHoverDay, setSelectedHoverDay] = useState<number | null>(null);

  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayStr = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  };

  const getStreakWindowStart = () => {
    const userId = user?.uid || 'guest';
    let start = user?.streakWindowStart || localStorage.getItem(`streak_window_start_${userId}`);
    if (!start) {
      start = getTodayStr();
      localStorage.setItem(`streak_window_start_${userId}`, start);
    }
    return start;
  };

  const getWindowDaysElapsed = () => {
    const startStr = getStreakWindowStart();
    const start = new Date(startStr);
    const today = new Date(getTodayStr());
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isWindowExpired = () => {
    return getWindowDaysElapsed() >= 365;
  };

  // Synchronize localStorage and current account info
  useEffect(() => {
    const userId = user?.uid || 'guest';
    const localStreak = parseInt(localStorage.getItem(`daily_streak_${userId}`) || '0', 10);
    const localLastClaimed = localStorage.getItem(`daily_last_claimed_${userId}`) || '';

    let resolvedStreak = localStreak;
    let resolvedLastClaimed = localLastClaimed;

    // If logged in, prioritize the highest value / newest claiming record
    if (user) {
      const firestoreStreak = user.dailyStreak || 0;
      const firestoreLastClaimed = user.lastDailyBonusClaimed || '';
      
      if (firestoreLastClaimed && firestoreLastClaimed >= localLastClaimed) {
        resolvedStreak = firestoreStreak;
        resolvedLastClaimed = firestoreLastClaimed;
        localStorage.setItem(`daily_streak_${userId}`, resolvedStreak.toString());
        localStorage.setItem(`daily_last_claimed_${userId}`, resolvedLastClaimed);
      }
    }

    setCurrentStreak(resolvedStreak);
    setLastClaimedDate(resolvedLastClaimed);
    setIsClaimedNow(resolvedLastClaimed === getTodayStr());
  }, [user?.dailyStreak, user?.lastDailyBonusClaimed, user?.uid]);

  // Sync reminders setting from user object or localStorage when user changes
  useEffect(() => {
    const userId = user?.uid || 'guest';
    if (user && user.streakRemindersEnabled !== undefined) {
      setRemindersEnabled(user.streakRemindersEnabled);
      localStorage.setItem(`daily_bonus_reminders_${userId}`, String(user.streakRemindersEnabled));
    } else {
      const saved = localStorage.getItem(`daily_bonus_reminders_${userId}`);
      setRemindersEnabled(saved !== 'false');
    }
  }, [user?.uid, user?.streakRemindersEnabled]);

  // Daily notification reminders trigger logic
  useEffect(() => {
    if (!user || !remindersEnabled || lastClaimedDate === getTodayStr()) return;

    const userId = user.uid || 'guest';
    const todayStr = getTodayStr();
    const lastRemindedToday = localStorage.getItem(`daily_bonus_reminded_${userId}_${todayStr}`);

    const yesterdayStr = getYesterdayStr();
    let calculatedTargetDay = 1;
    if (lastClaimedDate === yesterdayStr) {
      calculatedTargetDay = (currentStreak % 7) + 1;
    } else if (lastClaimedDate === todayStr) {
      calculatedTargetDay = currentStreak === 0 ? 1 : ((currentStreak - 1) % 7) + 1;
    } else {
      calculatedTargetDay = 1;
    }

    if (!lastRemindedToday) {
      // Trigger Web Notification API if granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Streak Bonus Ready! 🔥", {
          body: `Keep your consecutive daily streak active. Log in to claim your Day ${calculatedTargetDay} coins now!`,
          icon: '/favicon.ico'
        });
      }

      // Add to platform internal notifications area
      addNotification({
        type: 'activity',
        title: 'Daily Streak Bonus Reminder',
        description: `Your Day ${calculatedTargetDay} bonus is waiting! Don't let your streak reset. Claim it now.`,
        link: '/wallet'
      });

      localStorage.setItem(`daily_bonus_reminded_${userId}_${todayStr}`, 'true');
    }
  }, [user, remindersEnabled, lastClaimedDate, currentStreak, addNotification]);

  // Event listener to trigger open from other components
  useEffect(() => {
    const handleOpenDailyBonus = (e: any) => {
      const tabToOpen = e?.detail?.tab || 'claim';
      setActiveTab(tabToOpen);
      setShowModal(true);
    };

    window.addEventListener('open-daily-bonus', handleOpenDailyBonus);
    return () => window.removeEventListener('open-daily-bonus', handleOpenDailyBonus);
  }, [user?.streakWindowStart, user?.uid]);

  // Fetch claimed history (merging Firestore and localStorage)
  const fetchClaimHistory = async () => {
    const userId = user?.uid || 'guest';
    setLoadingHistory(true);
    
    // Read local history first
    const localHistoryJson = localStorage.getItem(`daily_bonus_history_${userId}`);
    let localList: any[] = [];
    if (localHistoryJson) {
      try {
        localList = JSON.parse(localHistoryJson).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
      } catch (e) {
        console.error("Parsed local history failed:", e);
      }
    }

    if (!user?.uid) {
      setHistoryLogs(localList);
      setLoadingHistory(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const fbList: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const isDailyBonusCategory = data.category === 'Daily Bonus';
        const isDailyBonusDesc = data.description && data.description.toLowerCase().includes('daily login');
        
        if (isDailyBonusCategory || isDailyBonusDesc) {
          fbList.push({
            id: doc.id,
            amount: data.amount,
            description: data.description,
            category: data.category || 'Daily Bonus',
            date: data.date?.toDate() || new Date()
          });
        }
      });

      // Sort Firestore list in descending order by date in memory
      fbList.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Merge keeping entries unique
      const mergedList = [...fbList];
      localList.forEach(localItem => {
        const exists = mergedList.some(fbItem => 
          fbItem.description === localItem.description &&
          Math.abs(fbItem.date.getTime() - localItem.date.getTime()) < 300000
        );
        if (!exists) {
          mergedList.push(localItem);
        }
      });

      mergedList.sort((a, b) => b.date.getTime() - a.date.getTime());
      setHistoryLogs(mergedList);
    } catch (error) {
      console.error('Failed to query daily bonus claims:', error);
      // Fallback cleanly to local logs on failed queries due to networking or permission errors
      setHistoryLogs(localList);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && showModal) {
      fetchClaimHistory();
    }
  }, [activeTab, showModal, user?.uid]);

  // Handle auto-detection and open pop-up sequence
  useEffect(() => {
    if (!user) return;
    if (isWindowExpired()) return;
    const todayStr = getTodayStr();
    const userId = user.uid;
    const localLastClaimed = localStorage.getItem(`daily_last_claimed_${userId}`) || '';

    // If already claimed today (either in Firestore or local storage)
    const claimedToday = user.lastDailyBonusClaimed === todayStr || localLastClaimed === todayStr;

    // "it should appear only once daily either after first login or sign up"
    const hasSeenToday = localStorage.getItem(`daily_popup_seen_${userId}_${todayStr}`) === 'true';

    if (!claimedToday && !hasSeenToday) {
      const timer = setTimeout(() => {
        setActiveTab('claim');
        setShowModal(true);
        localStorage.setItem(`daily_popup_seen_${userId}_${todayStr}`, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, user?.lastDailyBonusClaimed, user?.uid, user?.streakWindowStart]);

  if (!user || !showModal) return null;

  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  let targetDay = 1;
  let isStreakMaintained = false;

  if (lastClaimedDate === yesterdayStr) {
    targetDay = (currentStreak % 7) + 1;
    isStreakMaintained = true;
  } else if (lastClaimedDate === todayStr) {
    targetDay = currentStreak === 0 ? 1 : ((currentStreak - 1) % 7) + 1;
    isStreakMaintained = true;
  } else {
    targetDay = 1;
    isStreakMaintained = false;
  }

  const activeReward = DAILY_REWARDS[targetDay - 1];
  const displayedStreak = isStreakMaintained ? currentStreak : 0;
  const completionProgress = ((targetDay) / 7) * 100;

  const handleClaim = async () => {
    if (isClaiming || isClaimedNow) return;
    setIsClaiming(true);

    const userId = user?.uid || 'guest';
    const streakValue = lastClaimedDate === yesterdayStr ? currentStreak + 1 : 1;

    try {
      // 1. Instantly save state to localStorage to guarantee persistent storage
      localStorage.setItem(`daily_streak_${userId}`, streakValue.toString());
      localStorage.setItem(`daily_last_claimed_${userId}`, todayStr);

      // Add a transaction record to local history storage
      const localHistoryJson = localStorage.getItem(`daily_bonus_history_${userId}`);
      let localLogs: any[] = [];
      if (localHistoryJson) {
        try {
          localLogs = JSON.parse(localHistoryJson);
        } catch (e) {
          console.error(e);
        }
      }
      const newLocalRef = {
        id: `local_claim_${Date.now()}`,
        amount: activeReward.reward,
        description: `Daily Login Bonus (Day ${targetDay}) [Local Store Saved]`,
        category: 'Daily Bonus',
        date: new Date().toISOString()
      };
      localLogs.unshift(newLocalRef);
      localStorage.setItem(`daily_bonus_history_${userId}`, JSON.stringify(localLogs));

      // Sync React state variables immediately
      setCurrentStreak(streakValue);
      setLastClaimedDate(todayStr);

      // 2. Synchronize to the cloud backend context if authenticated
      if (user?.uid) {
        try {
          await receivePayment(
            activeReward.reward,
            `Daily Login Bonus (Day ${targetDay})`,
            'Daily Bonus'
          );

          await updateDoc(doc(db, 'users', user.uid), {
            lastDailyBonusClaimed: todayStr,
            dailyStreak: streakValue
          });
        } catch (fbError) {
          console.warn('Firebase update failed (continuous local storage session fallback active):', fbError);
        }
      }

      playSound('celebration');
      playPaymentRequest();

      const coinParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 400,
        y: -200 - Math.random() * 300,
        delay: Math.random() * 0.4
      }));
      setFloatingCoins(coinParticles);
      setIsClaimedNow(true);

      toast.success(`Claimed +${activeReward.reward} SC! 💰`, {
        description: `Consecutive Login Day ${targetDay} bonus verified and secured.`,
        duration: 5000
      });

      // Reload/Refetch the claim logs representation
      setTimeout(() => {
        fetchClaimHistory();
      }, 1200);

      setTimeout(() => {
        setIsClaiming(false);
        setShowModal(false);
      }, 5000);

    } catch (error: any) {
      console.error('Failed to claim daily bonus:', error);
      toast.error('An error occurred while claiming your reward.');
      setIsClaiming(false);
    }
  };

  const handleToggleReminders = async () => {
    const newValue = !remindersEnabled;
    setRemindersEnabled(newValue);
    const userId = user?.uid || 'guest';
    localStorage.setItem(`daily_bonus_reminders_${userId}`, String(newValue));
    
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          streakRemindersEnabled: newValue
        });
      } catch (e) {
        console.error("Failed to update firestore user reminders setting:", e);
      }
    }
    
    if (newValue) {
      toast.success("Daily reminders enabled!", {
        description: "We will notify you to claim your streak bonus."
      });
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    } else {
      toast.success("Daily reminders disabled.", {
        description: "Reminders for your streak bonus have been disabled."
      });
    }
  };

  const totalBonusEarnedInLog = historyLogs.reduce((acc, log) => acc + (log.amount || 0), 0);

  const expired = isWindowExpired();

  return (
    <AnimatePresence>
      {showModal && (
        <div id="daily-bonus-overlay" className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <motion.div
            id="daily-bonus-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className={`w-full max-w-4xl hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] text-white rounded-[2.5rem] border relative overflow-hidden flex flex-col max-h-[92vh] transition-all duration-500 ${
              expired
                ? 'bg-emerald-950/20 backdrop-blur-2xl border-emerald-500/30'
                : 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-amber-500/25 shadow-3xl'
            }`}
          >
            {/* Elegant glowing background patterns */}
            {expired ? (
              <>
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-500/10 via-emerald-500/0 text-emerald-500/5 to-transparent pointer-events-none" />
                <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              </>
            ) : (
              <>
                <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-500/10 via-amber-500/0 text-amber-500/5 to-transparent pointer-events-none" />
                <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              </>
            )}

            {/* Header section with closing and tab switcher */}
            <div className="p-6 md:px-10 md:pt-8 flex items-center justify-between border-b border-white/5 relative z-20 shrink-0">
              <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab('claim')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'claim'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  Rewards Board
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Claims History Log
                </button>
              </div>

              {/* Close Button unless claiming */}
              {!isClaiming && !isClaimedNow && (
                <button
                  id="daily-bonus-close"
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Scrollable Container Body */}
            <div className="overflow-y-auto flex-1 relative z-10 p-8 md:px-10">
              <AnimatePresence mode="wait">
                {activeTab === 'claim' ? (
                  expired ? (
                    <motion.div
                      key="rewards-tab-expired"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="w-full flex flex-col gap-6"
                    >
                      {/* Expiry Header Notice */}
                      <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-wider text-emerald-400 font-display">365-Day Bonus Claiming Concluded</h3>
                            <p className="text-xs text-neutral-400 mt-1">Claim privileges have completed. Your user metrics activities and growth logs remain active.</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center shrink-0">
                          <span className="text-[10px] uppercase font-black text-emerald-400 block tracking-widest font-mono">Window Age</span>
                          <span className="text-sm font-mono font-bold text-white">{getWindowDaysElapsed()} Days / 365 Limit</span>
                        </div>
                      </div>

                      {/* Enlarge and Show User Metrics */}
                      <StreakAnalysisArea isExpiredMode={true} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="rewards-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex flex-col items-center"
                    >
                    {/* Flame / Streak Summary Header Widget */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-display text-sm font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      >
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                        <span>Streak Counter: {displayedStreak} Days</span>
                      </motion.div>

                      {isStreakMaintained && displayedStreak > 0 && (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-mono text-[11px] font-bold"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                          <span>STREAK ACTIVE (+{(displayedStreak * 5)}% Multiplier)</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Central Claim Crown/Gift Illustration */}
                    <div className="relative mb-6">
                      <motion.div
                        animate={isClaimedNow ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : { y: [0, -8, 0] }}
                        transition={isClaimedNow ? { duration: 0.8 } : { repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="w-24 h-24 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl flex items-center justify-center p-0.5 shadow-[0_12px_40px_rgba(217,119,6,0.35)] border border-amber-300"
                      >
                        <div className="w-full h-full bg-neutral-900 rounded-[1.45rem] flex items-center justify-center relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                          {targetDay === 7 ? (
                            <Crown className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                          ) : (
                            <Gift className="w-12 h-12 text-amber-400" />
                          )}
                        </div>
                      </motion.div>

                      {/* Animated surrounding star elements */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="absolute -top-3 -left-3"
                      >
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }}
                        className="absolute -bottom-2 -right-2"
                      >
                        <Sparkles className="w-5 h-5 text-amber-300" />
                      </motion.div>

                      {/* Celebration Coin Particle Emitter */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none z-50">
                        {floatingCoins.map((coin) => (
                          <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                            animate={{
                              opacity: [0, 1, 1, 0],
                              x: coin.x,
                              y: coin.y,
                              scale: [0.5, 1.3, 1, 0.5],
                              rotate: [0, coin.id % 2 === 0 ? 360 : -360]
                            }}
                            transition={{
                              duration: 1.8,
                              delay: coin.delay,
                              ease: "easeOut"
                            }}
                            className="absolute"
                          >
                            <Coins className="w-8 h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] fill-amber-500" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Title Header */}
                    <h1 className="text-3xl md:text-4xl font-display font-medium text-white tracking-wide max-w-lg mb-2 text-center">
                      {isClaimedNow ? "REWARD CLAIMED!" : "7-DAY STREAK AVAILABLE"}
                    </h1>
                    <p className="text-neutral-400 text-sm max-w-md mb-8 leading-relaxed text-center">
                      {isClaimedNow 
                        ? `Your Day ${targetDay} streak yield has been added. Connect tomorrow to lock in step ${targetDay === 7 ? 1 : targetDay + 1}!`
                        : `Claim your daily login bonus to expand your Supreme Coins stack! Missing a day resets your 7-day rewards calendar.`
                      }
                    </p>

                    {/* Elegant Progress Streak Meter */}
                    <div className="w-full max-w-xl mb-8 bg-neutral-900/60 p-4 rounded-2xl border border-white/5 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          Week Progress Meter
                        </span>
                        <span className="text-xs font-display font-bold text-amber-400">
                          Day {targetDay} of 7 ({Math.round(completionProgress)}%)
                        </span>
                      </div>
                      {/* Visual Custom Progress Bar Track */}
                      <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionProgress}%` }}
                          transition={{ type: 'spring', damping: 20, stiffness: 60, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full relative"
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-2.5 h-full bg-white blur-sm" />
                        </motion.div>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-neutral-500 uppercase font-mono tracking-widest font-bold">
                        <span>Day 1 (10 SC)</span>
                        <span>Midpoint Checkpoint</span>
                        <span className="text-amber-500/80">Day 7 (250 SC Crown)</span>
                      </div>
                    </div>

                    {/* Interactive 7-Day Rewards Line-up Map */}
                    <div id="daily-bonus-grid" className="grid grid-cols-4 sm:grid-cols-7 gap-3.5 w-full max-w-xl mb-8">
                      {DAILY_REWARDS.map((item) => {
                        const isCompleted = item.day < targetDay && isStreakMaintained;
                        const isActive = item.day === targetDay;

                        return (
                          <div
                            key={item.day}
                            onMouseEnter={() => setSelectedHoverDay(item.day)}
                            onMouseLeave={() => setSelectedHoverDay(null)}
                            className="relative"
                          >
                            <motion.div
                              whileHover={{ scale: 1.06, y: -4 }}
                              className={`relative rounded-2xl p-3 flex flex-col items-center justify-between min-h-[96px] border transition-all cursor-help select-none ${
                                isActive
                                  ? 'bg-gradient-to-b from-amber-500/25 to-amber-500/5 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                                  : isCompleted
                                  ? 'bg-amber-950/15 border-amber-600/30 opacity-75'
                                  : 'bg-white/5 border-white/5 opacity-40 hover:opacity-80'
                              }`}
                            >
                              <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 font-bold mb-1">
                                Day {item.day}
                              </span>

                              <div className="my-1.5">
                                {isCompleted ? (
                                  <div className="w-7 h-7 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/30">
                                    <Check className="w-4 h-4 stroke-[3.5]" />
                                  </div>
                                ) : item.day === 7 ? (
                                  <Crown className={`w-7 h-7 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] ${isActive ? 'text-amber-400 animate-bounce' : 'text-neutral-400'}`} />
                                ) : (
                                  <Coins className={`w-6 h-6 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                                )}
                              </div>

                              <span className={`text-xs font-bold leading-none ${isActive ? 'text-amber-400' : 'text-neutral-300'}`}>
                                {item.reward} SC
                              </span>

                              {isActive && !isClaimedNow && (
                                <div className="absolute inset-0 rounded-2xl border border-amber-400 animate-pulse pointer-events-none" />
                              )}
                            </motion.div>

                            {/* Tooltip detail description list popup */}
                            <AnimatePresence>
                              {selectedHoverDay === item.day && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-900/95 backdrop-blur-md p-3 rounded-xl border border-amber-500/30 text-left z-[100] shadow-2xl pointer-events-none"
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[11px] font-bold text-white font-display block">{item.label}</span>
                                  </div>
                                  <span className="text-[9px] text-amber-400/80 font-semibold block mb-1">Reward Pool: {item.reward} Supreme Coins</span>
                                  <span className="text-[10px] text-neutral-400 leading-tight block">{item.desc}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Bottom Multiplier / Milestone Tip Panel */}
                    <div className="w-full max-w-xl pb-6 border-b border-white/5 mb-8">
                      <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          Hover over days to explore target milestones. <strong>Current Claim Tier:</strong> <span className="text-amber-400 font-bold">{activeReward.tier}</span>.
                        </span>
                      </div>
                    </div>

                    {/* Action Button Section with AnimatePresence */}
                    <div className="w-full max-w-sm flex flex-col items-center">
                      <AnimatePresence mode="wait">
                        {isClaimedNow ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full py-4 text-center text-amber-400 font-display font-bold rounded-2xl border border-amber-500/35 bg-amber-500/10 flex items-center justify-center gap-2.5 shadow-inner"
                          >
                            <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
                            CLAIMED DAY {targetDay} BONUS (+{activeReward.reward} SC)
                          </motion.div>
                        ) : (
                          <motion.button
                            id="daily-bonus-claim-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isClaiming}
                            onClick={handleClaim}
                            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-display font-bold text-base tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isClaiming ? (
                              <>
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>CREDITING COINS...</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="w-5 h-5 stroke-[2.5]" />
                                <span>CLAIM DAY {targetDay} REWARD (+{activeReward.reward} SC)</span>
                                <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
                              </>
                            )}
                          </motion.button>
                        )}
                      </AnimatePresence>

                      {!isClaimedNow && (
                        <p className="text-neutral-500 text-[11px] mt-2.5">
                          Deposits directly to your centralized coin balance instantly with ledger entry.
                        </p>
                      )}
                    </div>

                    {/* Daily Notification Reminder Toggle Section */}
                    <div className="w-full max-w-xl bg-neutral-950/40 hover:bg-neutral-950/60 transition-all p-4 rounded-2xl border border-white/5 mt-6 mb-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border transition-colors ${
                          remindersEnabled 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                            : 'bg-white/5 border-white/10 text-neutral-500'
                        }`}>
                          {remindersEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </div>
                        <div className="text-left">
                          <h5 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                            Daily Claim Reminders
                          </h5>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Receive system & browser push alert reminders to secure your active daily streak
                          </p>
                        </div>
                      </div>
                      
                      {/* Modern Toggle Switch */}
                      <button
                        onClick={handleToggleReminders}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative cursor-pointer focus:outline-none ${
                          remindersEnabled ? 'bg-amber-500' : 'bg-neutral-800 border border-white/10'
                        }`}
                        aria-label="Toggle daily streak reminders"
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`w-4 h-4 rounded-full bg-white shadow-md ${
                            remindersEnabled ? 'ml-6' : 'ml-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expandable/Interactive Activity Analysis Area */}
                    <StreakAnalysisArea />
                  </motion.div>
                  )
                ) : (
                  <motion.div
                    key="history-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    {/* Header Summary Stats of Claims in History Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Total Bonus Claimed</p>
                          <p className="text-lg font-bold text-white font-mono mt-0.5">{totalBonusEarnedInLog.toLocaleString()} SC</p>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                          <Flame className="w-5 h-5 fill-emerald-500/20 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Current Streak</p>
                          <p className="text-lg font-bold text-white font-mono mt-0.5">{displayedStreak} Days</p>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Last Claimed Date</p>
                          <p className="text-sm font-bold text-white font-mono mt-0.5 truncate">{user?.lastDailyBonusClaimed || lastClaimedDate || 'None Today'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline of Claim entries */}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">Archived Platform Claims ({historyLogs.length})</h3>
                      </div>

                      {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider animate-pulse">Syncing Streak Ledgers...</p>
                        </div>
                      ) : historyLogs.length === 0 ? (
                        <div className="text-center py-12 px-4 border border-dashed border-white/5 rounded-2xl bg-white/2">
                          <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">No Claim Transactions Logged</p>
                          <p className="text-neutral-500 text-[11px] mt-1.5 max-w-sm mx-auto">
                            Transactions populate here after claiming your recurring login streak bonuses. Keep checking in daily!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {historyLogs.map((log) => (
                            <div
                              key={log.id}
                              className="p-4 bg-white/2 hover:bg-white/5 transition-colors rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                                  <Award className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white leading-snug">{log.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                                      {log.category}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                    <span className="text-[10px] text-neutral-400 font-medium">
                                      {log.date.toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 justify-end sm:text-right">
                                <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold font-mono">
                                  LEDGER CONFIRMED
                                </span>
                                <span className="text-sm font-bold text-amber-400 font-mono">
                                  +{log.amount} SC
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom guideline info */}
                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-neutral-400 leading-normal">
                        Consecutive 7-day logins trigger advanced multiplier rewards. Break in logs resets payout levels to Starter Day 1. Ensure regular check-ins to maximize compound gains!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
