import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bitcoin, Coins, ArrowRightLeft, Wallet, Activity, Cpu, Zap, Pickaxe, CheckCircle2, X, Clock, TrendingUp, BarChart3, Info, ShieldCheck, CreditCard, Calendar, History, Server, Users, ShieldAlert, Trophy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { loadStripe } from '@stripe/stripe-js';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useMining, COINS, EXCHANGE_RATES, MINING_RIGS, CASH_OUT_THRESHOLD, MAX_CASH_OUT_THRESHOLD, RIG_SUBSCRIPTION_PLANS, REQUIRED_MINING_POINTS } from '../context/MiningContext';
import GMTForexOptimum from '../components/GMTForexOptimum';
import BetOptimum from '../components/BetOptimum';
import FastAndFurious from '../components/FastAndFurious';
import RankRewardBenefit from '../components/RankRewardBenefit';

export default function SupremeCoinOptimum() {
  const { deposit } = useWallet();
  const { 
    activeMiner, 
    minedBalances, 
    selectedRigs, 
    toggleMining, 
    updateRig, 
    convertMined,
    canCashOut,
    recordFreeMinerCashout,
    freeMinerCashouts,
    freeMiningTotal,
    miningPoints,
    timeRemaining,
    rigSubscriptions,
    purchaseRigSubscription,
    isRigSubscribed,
    isHardwareOwned,
    miningActivities
  } = useMining();
  
  const { balance: walletBalance, withdraw } = useWallet();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Rank Key Activation State
  const [activationKey, setActivationKey] = useState('');
  const [isActivatingKey, setIsActivatingKey] = useState(false);
  
  // Subscription State
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'mining' | 'forex' | 'analysis' | 'betting' | 'fast_furious' | 'rank_reward'>('mining');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Global Stats State
  const [globalStats, setGlobalStats] = useState({
    totalMiners: 12450,
    totalMined: 854200.50,
    totalSubscribers: 3240
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        totalMiners: prev.totalMiners + Math.floor(Math.random() * 5),
        totalMined: prev.totalMined + (Math.random() * 0.5),
        totalSubscribers: prev.totalSubscribers + Math.floor(Math.random() * 2)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Conversion State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [convertAmount, setConvertAmount] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleConvert = () => {
    const cashOutStatus = canCashOut();
    if (!cashOutStatus.allowed) {
      toast.error('Cashout Restricted!', {
        description: cashOutStatus.reason || `You must have an active rig subscription or own hardware to cash out your earnings.`,
        duration: 10000,
      });
      return;
    }

    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount < CASH_OUT_THRESHOLD) {
      toast.error(`Minimum cash out threshold is ${CASH_OUT_THRESHOLD.toFixed(12)} ${selectedCoin}`);
      return;
    }

    if (amount > MAX_CASH_OUT_THRESHOLD) {
      toast.error(`Maximum cash out threshold is ${MAX_CASH_OUT_THRESHOLD.toFixed(12)} ${selectedCoin}`);
      return;
    }

    if (amount > minedBalances[selectedCoin]) {
      toast.error(`Insufficient ${selectedCoin} balance`);
      return;
    }

    const grossUsdValue = amount * EXCHANGE_RATES[selectedCoin];
    const commissionRate = 0.17; // 17% commission
    const commission = grossUsdValue * commissionRate;
    const netUsdValue = grossUsdValue - commission;

    if (cashOutStatus.isFreeMiner) {
      // Check if this cashout exceeds the $2 limit
      const currentPeriodAmount = freeMinerCashouts.amount;
      const now = Date.now();
      const isNewPeriod = now - freeMinerCashouts.lastDate > 31 * 24 * 60 * 60 * 1000;
      const periodTotal = isNewPeriod ? 0 : currentPeriodAmount;

      if (periodTotal + netUsdValue > 2) {
        const remaining = Math.max(0, 2 - periodTotal);
        toast.error('Cashout Limit Exceeded!', {
          description: `Free miners can only cash out $2 maximum per 31 days. You have $${remaining.toFixed(2)} remaining for this period.`,
        });
        return;
      }
      recordFreeMinerCashout(netUsdValue);
    }
    
    // Deduct coin
    convertMined(selectedCoin, amount);
    
    // Add to Supreme Wallet
    deposit(netUsdValue, 'Mining', 'Supreme Coin Optimum');
    
    toast.success(`Successfully converted ${amount} ${selectedCoin} to $${netUsdValue.toFixed(2)} (after 17% commission) and transferred to wallet`);
    setShowConvertModal(false);
    setConvertAmount('');
  };

  const handlePurchaseSub = async () => {
    if (!selectedPlan) return;
    const plan = RIG_SUBSCRIPTION_PLANS.find(p => p.rigId === selectedPlan);
    if (!plan) return;

    setIsProcessing(true);
    try {
      if (paymentMethod === 'wallet') {
        if (walletBalance < plan.price) {
          toast.error('Insufficient wallet balance');
          return;
        }
        
        // Deduct from wallet
        withdraw(plan.price, 'Mining Subscription', `Subscription for ${plan.rigId.toUpperCase()}`);
        
        // Update context
        await purchaseRigSubscription(plan.rigId, 'wallet');
        setShowSubModal(false);
      } else {
        // Stripe Payment
        const response = await fetch('/api/stripe/create-rig-subscription-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rigId: plan.rigId,
            price: plan.price,
            durationDays: plan.durationDays,
            successUrl: `${window.location.origin}/supreme-coin-optimum?sub=success&rig=${plan.rigId}`,
            cancelUrl: `${window.location.origin}/supreme-coin-optimum?sub=cancel`
          })
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') {
      const rigId = params.get('rig');
      if (rigId) {
        // The context will handle persistence, but we might need to trigger a refresh or just rely on the effect in MiningContext
        toast.success(`Subscription for ${rigId.toUpperCase()} activated!`);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleActivateRankKey = async () => {
    if (!user || !activationKey.trim()) {
      toast.error('Please enter a valid activation key');
      return;
    }

    setIsActivatingKey(true);
    try {
      const q = query(
        collection(db, 'rank_reward_benefits'),
        where('userId', '==', user.uid),
        where('miningKey', '==', activationKey.trim()),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Invalid or already activated key');
        setIsActivatingKey(false);
        return;
      }

      const rewardDoc = querySnapshot.docs[0];
      const rewardData = rewardDoc.data();
      
      const startTime = Date.now();
      const endTime = startTime + (rewardData.durationHours * 60 * 60 * 1000);

      await updateDoc(doc(db, 'rank_reward_benefits', rewardDoc.id), {
        status: 'active',
        startTime,
        endTime
      });

      toast.success('Mining key activated! Your rank reward mining session has started.');
      setActivationKey('');
      setActiveTab('rank_reward'); // Redirect to rank reward tab to see progress
    } catch (error) {
      console.error('Error activating key:', error);
      toast.error('Failed to activate key. Please try again.');
    } finally {
      setIsActivatingKey(false);
    }
  };

  const totalUsdValue = Object.entries(minedBalances).reduce((total, [coinId, amount]) => {
    return total + (amount * (EXCHANGE_RATES[coinId] || 0));
  }, 0);

  // Profitability Analysis Data
  const profitabilityData = COINS.map(coin => {
    const rigId = selectedRigs[coin.id] || '500mb';
    const rig = MINING_RIGS.find(r => r.id === rigId) || MINING_RIGS[0];
    const hourlyUSD = rig.rate * 3600; // rig.rate is per second
    return {
      name: coin.id,
      profit: hourlyUSD,
      color: coin.color
    };
  }).sort((a, b) => b.profit - a.profit);

  const mostProfitable = profitabilityData[0];

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--color-bet-purple-dark)]">
        <div className="relative flex items-center justify-center w-32 h-32 mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-[var(--color-supreme-gold)]/20 rounded-full"
          />
          <motion.div
            className="absolute inset-0 border-4 border-[var(--color-supreme-gold)] rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Cpu className="w-12 h-12 text-[var(--color-supreme-gold)]" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wider">Optimum Miner</h2>
        <p className="text-purple-200/60 mt-2 font-medium">Initializing cloud mining rigs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bet-purple-dark)] py-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl w-full sm:w-fit mx-auto mb-10 overflow-x-auto no-scrollbar border border-white/10 shadow-2xl sticky top-4 z-50">
          {[
            { id: 'mining', label: 'Supreme Miner', icon: Pickaxe },
            { id: 'analysis', label: 'Analysis', icon: BarChart3 },
            { id: 'rank_reward', label: 'Rank Reward', icon: Trophy },
            { id: 'forex', label: 'GMT Forex', icon: TrendingUp },
            { id: 'betting', label: 'Bet Optimum', icon: Trophy },
            { id: 'fast_furious', label: 'Fast & Furious', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white shadow-lg shadow-yellow-900/20 scale-[1.02]" 
                  : "text-purple-200/40 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={clsx("w-4 h-4", activeTab === tab.id ? "text-white" : "text-purple-400")} />
              {tab.label}
            </button>
          ))}
        </div>

      <div className="space-y-8">
      {activeTab === 'forex' ? (
        <GMTForexOptimum 
          onShowSubscriptions={() => setShowSubModal(true)}
          onShowTransfer={() => setShowConvertModal(true)}
        />
      ) : activeTab === 'betting' ? (
        <BetOptimum />
      ) : activeTab === 'fast_furious' ? (
        <FastAndFurious />
      ) : activeTab === 'rank_reward' ? (
        <RankRewardBenefit />
      ) : activeTab === 'analysis' ? (
        <div className="space-y-8">
          {/* Mining Banner */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-8 bg-gradient-to-br from-[var(--color-bet-purple-dark)] via-[#1a0b2e] to-[var(--color-bet-purple)] p-6 sm:p-10 rounded-[40px] shadow-2xl border border-purple-800/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-purple-500/10 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full -ml-32 -mb-32 blur-[80px]" />
            
            <div className="relative z-10 flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl shadow-2xl">
                  <Bitcoin className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-supreme-gold)]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Supreme <span className="text-[var(--color-supreme-gold)]">Optimum</span></h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">System Online</span>
                  </div>
                </div>
              </div>
              
              <p className="text-purple-200/60 max-w-xl text-sm sm:text-base leading-relaxed">
                Advanced cloud mining infrastructure. Select a high-performance rig to mine premium assets for 6-hour cycles.
              </p>

              <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 inline-block">
                <div className="flex items-center gap-2 text-[var(--color-supreme-gold)] font-bold text-xs uppercase tracking-wider mb-2">
                  <Info className="w-4 h-4" />
                  Cashout Limits
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300/40 uppercase font-black">Minimum Cashout</span>
                    <span className="text-white font-mono font-bold">{CASH_OUT_THRESHOLD.toFixed(12)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300/40 uppercase font-black">Maximum Cashout</span>
                    <span className="text-white font-mono font-bold">{MAX_CASH_OUT_THRESHOLD.toFixed(12)}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-purple-300/60 uppercase tracking-widest font-bold">
                  Required Mining Points: {REQUIRED_MINING_POINTS}
                </div>
              </div>

              {/* Global Stats in Banner */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 pt-4">
                <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Active Miners</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    {globalStats.totalMiners.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Total Mined</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <Pickaxe className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    ${globalStats.totalMined.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Subscribers</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    {globalStats.totalSubscribers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:w-80">
              {activeMiner && timeRemaining !== null && (
                <div className="p-6 bg-black/40 border border-[var(--color-supreme-gold)]/30 rounded-[32px] backdrop-blur-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Mining: {activeMiner}</span>
                    <Zap className="w-4 h-4 text-[var(--color-supreme-gold)] animate-pulse" />
                  </div>
                  <div className="font-mono text-4xl font-black text-white tracking-tighter flex justify-center gap-2">
                    {formatTime(timeRemaining).split(' ').map((part, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-white leading-none">{part.slice(0, -1).padStart(2, '0')}</span>
                        <span className="text-[var(--color-supreme-gold)] text-[10px] uppercase font-black mt-1">{part.slice(-1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(timeRemaining / (6 * 60 * 60 * 1000)) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-center lg:text-right">
                  <p className="text-purple-300/40 text-[10px] font-black uppercase tracking-widest mb-1">Total Mined Value</p>
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    <span className="text-[var(--color-supreme-gold)] text-2xl mr-1">$</span>
                    {totalUsdValue.toFixed(2)}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <button 
                    onClick={() => setShowSubModal(true)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest shadow-xl"
                  >
                    <ShieldCheck className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    Rig Subscriptions
                  </button>
                  <button 
                    onClick={() => setShowConvertModal(true)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white rounded-2xl shadow-2xl shadow-yellow-900/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Convert & Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Header */}
          <div className="bg-[#001f3f] p-8 rounded-3xl text-white shadow-2xl border border-blue-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-[var(--color-supreme-gold)]">Mining Performance Analysis</h2>
              <p className="text-blue-100/80">Track your mining efficiency, limits, and profitability in real-time.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Mining Points Card */}
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-8 rounded-3xl shadow-xl flex flex-col text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Mining Points</h3>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
                <div className="text-5xl font-black mb-2">{miningPoints}</div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Current Points</div>
                <div className="mt-6 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(100, (miningPoints / REQUIRED_MINING_POINTS) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] mt-2 font-bold opacity-70">
                  {miningPoints >= REQUIRED_MINING_POINTS 
                    ? "✓ Cashout Requirement Met" 
                    : `Need ${REQUIRED_MINING_POINTS - miningPoints} more points to cash out`}
                </p>
              </div>
            </div>

            {/* Free Miner Analysis Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col text-gray-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Free Miner Policy</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 text-sm mb-1">500MB Rig Upgrade</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    The free miner rig has been upgraded from 25MB to 500MB, increasing your base mining rate by 20x.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <h4 className="font-bold text-purple-900 text-sm mb-1">Supreme Commission (17%)</h4>
                  <p className="text-xs text-purple-700 leading-relaxed">
                    A 17% commission is applied to all mining conversions to support the Supreme Network infrastructure.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-sm mb-1">Cashout Limits</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Free miners can cash out a maximum of $2.00 every 31 days. To remove this limit, upgrade to a paid subscription or own hardware.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-gray-900 rounded-2xl text-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400">Period Progress</span>
                    <span className="text-xs font-bold text-[var(--color-supreme-gold)]">
                      ${freeMinerCashouts.amount.toFixed(2)} / $2.00
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-supreme-gold)] transition-all duration-500"
                      style={{ width: `${Math.min(100, (freeMinerCashouts.amount / 2) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Resets every 31 days from your last cashout.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col text-gray-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Pickaxe className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-xl font-bold">Mining & Cashout</h3>
              </div>

              <div className="flex-1 space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Free Mining: UNLIMITED</p>
                      <p className="text-xs opacity-80">You can mine for free as long as you want with the 500MB rig.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Mined (USD)</p>
                  <p className="text-2xl font-bold text-gray-900">${freeMiningTotal.toFixed(2)}</p>
                </div>

                <div className={clsx(
                  "p-4 rounded-2xl border flex items-start gap-3",
                  canCashOut().allowed 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-amber-50 border-amber-100 text-amber-600"
                )}
                >
                  {!canCashOut().allowed ? (
                    <>
                      <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Cashout Restricted</p>
                        <p className="text-xs opacity-80">{canCashOut().reason}</p>
                        <button 
                          onClick={() => setShowSubModal(true)}
                          className="mt-4 w-full py-2.5 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold shadow-lg hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Subscribe for Unlimited Cashout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Cashout Eligible</p>
                        <p className="text-xs opacity-80">
                          {canCashOut().isFreeMiner 
                            ? `Free Miner: $${(2 - freeMinerCashouts.amount).toFixed(2)} remaining for this 31-day period.`
                            : "Your active subscription allows you to cash out your mined earnings."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profitability Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-gray-900">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <BarChart3 className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Profitability Analysis</h3>
                    <p className="text-sm text-gray-500">Estimated USD profit per hour based on selected rigs</p>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '16px', 
                        border: '1px solid #e5e7eb', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(4)} / hr`, 'Profit']}
                    />
                    <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                      {profitabilityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mining Activity Log */}
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-2xl overflow-hidden text-gray-900">
            <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <History className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mining Activity Log</h3>
                  <p className="text-sm text-gray-500">History of your recent mining sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100">
                <Activity className="w-4 h-4" />
                {miningActivities.length} Sessions Recorded
              </div>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30 border-y border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Coin Asset</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mining Rig</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yield</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {miningActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">
                        <div className="flex flex-col items-center gap-4">
                          <Pickaxe className="w-12 h-12 opacity-10" />
                          <p>No mining activity recorded yet. Start a miner to see history.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    miningActivities.map((activity) => {
                      const coin = COINS.find(c => c.id === activity.coinId);
                      const rig = MINING_RIGS.find(r => r.id === activity.rigId);
                      const duration = activity.endTime 
                        ? formatTime(activity.endTime - activity.startTime)
                        : activeMiner === activity.coinId 
                          ? 'In Progress...'
                          : 'Stopped';
                      
                      return (
                        <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                                style={{ backgroundColor: coin?.color || '#000' }}
                              >
                                {activity.coinId}
                              </div>
                              <span className="font-bold text-gray-900">{coin?.name || activity.coinId}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 uppercase border border-gray-200">
                              {rig?.name || activity.rigId}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                            {new Date(activity.startTime).toLocaleString()}
                          </td>
                          <td className="px-8 py-5 text-sm text-gray-500 font-mono">
                            {duration}
                          </td>
                          <td className="px-8 py-5">
                            <div className="font-mono font-black text-gray-900">
                              {activity.amountMined.toFixed(12)} <span className="text-[10px] text-gray-400">{activity.coinId}</span>
                            </div>
                            <div className="text-[10px] text-emerald-600 font-black">
                              ≈ ${(activity.amountMined * (EXCHANGE_RATES[activity.coinId] || 0)).toFixed(4)}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={clsx(
                              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              activity.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                              activity.status === 'completed' ? "bg-blue-50 text-blue-600 border-blue-200" :
                              "bg-gray-50 text-gray-400 border-gray-200"
                            )}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {miningActivities.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p>No mining activity recorded yet.</p>
                </div>
              ) : (
                miningActivities.map((activity) => {
                  const coin = COINS.find(c => c.id === activity.coinId);
                  const rig = MINING_RIGS.find(r => r.id === activity.rigId);
                  return (
                    <div key={activity.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black text-white"
                            style={{ backgroundColor: coin?.color || '#000' }}
                          >
                            {activity.coinId}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{coin?.name || activity.coinId}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{rig?.name}</p>
                          </div>
                        </div>
                        <span className={clsx(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          activity.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
                        )}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Yield</p>
                          <p className="text-sm font-black text-gray-900">{activity.amountMined.toFixed(8)}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">≈ ${(activity.amountMined * (EXCHANGE_RATES[activity.coinId] || 0)).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Start Time</p>
                          <p className="text-[10px] font-bold text-gray-600">{new Date(activity.startTime).toLocaleTimeString()}</p>
                          <p className="text-[10px] text-gray-400">{new Date(activity.startTime).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Mining Banner */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-8 bg-gradient-to-br from-[var(--color-bet-purple-dark)] via-[#1a0b2e] to-[var(--color-bet-purple)] p-6 sm:p-10 rounded-[40px] shadow-2xl border border-purple-800/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-purple-500/10 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full -ml-32 -mb-32 blur-[80px]" />
            
            <div className="relative z-10 flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-xl shadow-2xl">
                  <Bitcoin className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-supreme-gold)]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Supreme <span className="text-[var(--color-supreme-gold)]">Optimum</span></h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">System Online</span>
                  </div>
                </div>
              </div>
              
              <p className="text-purple-200/60 max-w-xl text-sm sm:text-base leading-relaxed">
                Advanced cloud mining infrastructure. Select a high-performance rig to mine premium assets for 6-hour cycles.
              </p>

              <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5 inline-block">
                <div className="flex items-center gap-2 text-[var(--color-supreme-gold)] font-bold text-xs uppercase tracking-wider mb-2">
                  <Info className="w-4 h-4" />
                  Cashout Limits
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300/40 uppercase font-black">Minimum Cashout</span>
                    <span className="text-white font-mono font-bold">{CASH_OUT_THRESHOLD.toFixed(12)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-300/40 uppercase font-black">Maximum Cashout</span>
                    <span className="text-white font-mono font-bold">{MAX_CASH_OUT_THRESHOLD.toFixed(12)}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-purple-300/60 uppercase tracking-widest font-bold">
                  Required Mining Points: {REQUIRED_MINING_POINTS}
                </div>
              </div>

              {/* Global Stats in Banner */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 pt-4">
                <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Active Miners</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    {globalStats.totalMiners.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Total Mined</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <Pickaxe className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    ${globalStats.totalMined.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest mb-1">Subscribers</span>
                  <span className="text-xl font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    {globalStats.totalSubscribers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:w-80">
              {activeMiner && timeRemaining !== null && (
                <div className="p-6 bg-black/40 border border-[var(--color-supreme-gold)]/30 rounded-[32px] backdrop-blur-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Mining: {activeMiner}</span>
                    <Zap className="w-4 h-4 text-[var(--color-supreme-gold)] animate-pulse" />
                  </div>
                  <div className="font-mono text-4xl font-black text-white tracking-tighter flex justify-center gap-2">
                    {formatTime(timeRemaining).split(' ').map((part, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-white leading-none">{part.slice(0, -1).padStart(2, '0')}</span>
                        <span className="text-[var(--color-supreme-gold)] text-[10px] uppercase font-black mt-1">{part.slice(-1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(timeRemaining / (6 * 60 * 60 * 1000)) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-center lg:text-right">
                  <p className="text-purple-300/40 text-[10px] font-black uppercase tracking-widest mb-1">Total Mined Value</p>
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    <span className="text-[var(--color-supreme-gold)] text-2xl mr-1">$</span>
                    {totalUsdValue.toFixed(2)}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <button 
                    onClick={() => setShowSubModal(true)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest shadow-xl"
                  >
                    <ShieldCheck className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    Rig Subscriptions
                  </button>
                  <button 
                    onClick={() => setShowConvertModal(true)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white rounded-2xl shadow-2xl shadow-yellow-900/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    Convert & Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rank Reward Key Activation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-8 bg-gradient-to-br from-indigo-900/40 to-black/40 backdrop-blur-xl border border-indigo-500/30 rounded-[40px] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                    <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Activate Rank Reward Key</h3>
                </div>
                <p className="text-indigo-200/60 max-w-lg mx-auto md:mx-0">
                  Did you generate a mining key from your Rank Rewards? Enter it here to activate your specialized high-yield mining session instantly.
                </p>
              </div>
              
              <div className="w-full md:w-96">
                <div className="relative group/input">
                  <input
                    type="text"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value)}
                    placeholder="Enter Rank Mining Key..."
                    className="w-full pl-6 pr-16 py-5 bg-black/60 border-2 border-indigo-500/30 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-black text-lg text-white placeholder-indigo-300/20 shadow-inner"
                  />
                  <button
                    onClick={handleActivateRankKey}
                    disabled={isActivatingKey || !activationKey.trim()}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/20 disabled:text-indigo-300/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    {isActivatingKey ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-3 px-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">
                    <Info className="w-3 h-3" />
                    Keys are case-sensitive
                  </div>
                  <button 
                    onClick={() => setActiveTab('rank_reward')}
                    className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Generate a key →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mining Rigs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {COINS.map((coin) => {
              const isMining = activeMiner === coin.id;
              const balance = minedBalances[coin.id] || 0;
              const usdValue = balance * (EXCHANGE_RATES[coin.id] || 0);
              const currentRigId = selectedRigs[coin.id] || '500mb';
              const currentRig = MINING_RIGS.find(r => r.id === currentRigId) || MINING_RIGS[0];
              
              return (
                <div 
                  key={coin.id}
                  className={clsx(
                    "relative p-6 rounded-[32px] border transition-all duration-500 overflow-hidden flex flex-col group",
                    isMining 
                      ? "bg-white/10 border-[var(--color-supreme-gold)] shadow-2xl shadow-[var(--color-supreme-gold)]/20 scale-[1.02]" 
                      : "bg-white/5 border-white/10 shadow-xl hover:border-white/30 hover:bg-white/[0.07]"
                  )}
                >
                  {isMining && (
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--color-supreme-gold)] to-transparent animate-pulse" />
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg"
                        style={{ backgroundColor: coin.color }}
                      >
                        {coin.id}
                      </div>
                      <div>
                        <span className="font-black text-white block leading-tight">{coin.name}</span>
                        <span className="text-[10px] text-purple-300/40 uppercase font-bold tracking-widest">Asset</span>
                      </div>
                    </div>
                    {isMining && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl"
                      >
                        <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Rig Machine Image */}
                  <div className="mb-6 relative h-40 rounded-[24px] overflow-hidden bg-black/40 border border-white/10 group-hover:border-[var(--color-supreme-gold)]/30 transition-all">
                    <img 
                      src={currentRig.machineImage} 
                      alt={currentRig.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{currentRig.name}</p>
                      </div>
                      {isMining && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg border border-emerald-500/30">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase">Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentRigId === '500mb' && (
                    <div className="mb-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="text-emerald-400/60">Free Rig Status</span>
                        <span className="text-emerald-400">Unlimited</span>
                      </div>
                      <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6 space-y-1">
                    <p className="text-[10px] font-black text-purple-300/40 uppercase tracking-widest">Mined Balance</p>
                    <div className="font-mono font-black text-2xl text-white tracking-tighter">
                      {balance.toFixed(8)} <span className="text-xs text-purple-300/40 font-bold">{coin.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-emerald-400">≈ ${usdValue.toFixed(4)}</span>
                      <div className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className="text-[10px] font-bold text-purple-300/40 uppercase">USD Value</span>
                    </div>
                  </div>

                  {isMining && timeRemaining !== null && (
                    <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-black text-purple-300/60 uppercase tracking-widest">Cycle Ends</span>
                      </div>
                      <div className="text-sm font-black text-white font-mono">
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                        <label className="text-[10px] uppercase font-black text-purple-300/40 tracking-widest">Select Rig</label>
                      </div>
                      <select
                        value={selectedRigs[coin.id]}
                        onChange={(e) => updateRig(coin.id, e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 font-black outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 transition-all appearance-none cursor-pointer"
                      >
                        <optgroup label="Cloud Mining (Subscription)" className="bg-[var(--color-bet-purple-dark)]">
                          {MINING_RIGS.filter(r => r.type === 'cloud').map(rig => (
                            <option key={rig.id} value={rig.id}>{rig.name}</option>
                          ))}
                        </optgroup>
                        {MINING_RIGS.some(r => r.type !== 'cloud' && isHardwareOwned(r.id)) && (
                          <optgroup label="Hardware Mining (Owned)" className="bg-[var(--color-bet-purple-dark)]">
                            {MINING_RIGS.filter(r => r.type !== 'cloud' && isHardwareOwned(r.id)).map(rig => (
                              <option key={rig.id} value={rig.id}>{rig.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => toggleMining(coin.id)}
                      className={clsx(
                        "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl",
                        isMining 
                          ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white" 
                          : "bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white hover:scale-[1.02] shadow-yellow-900/20"
                      )}
                    >
                      {isMining ? (
                        <>
                          <X className="w-4 h-4" />
                          Stop Mining
                        </>
                      ) : (
                        <>
                          <Pickaxe className="w-4 h-4" />
                          Start Mining
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

      {/* Market Analysis & Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profitability Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-xl text-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl border border-[var(--color-supreme-gold)]/30">
                <BarChart3 className="w-6 h-6 text-[var(--color-supreme-gold)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Profitability Analysis</h3>
                <p className="text-sm text-purple-200/50">Estimated USD profit per hour based on selected rigs</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Live Estimates
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#111827',
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                    padding: '12px'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(4)} / hr`, 'Profit']}
                />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {profitabilityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--color-supreme-gold)] mt-0.5" />
            <p className="text-sm text-purple-200/60 leading-relaxed">
              Analysis: <span className="font-bold text-white">{mostProfitable.name}</span> is currently the most profitable coin to mine with your current configuration, yielding approximately <span className="font-bold text-emerald-400">${mostProfitable.profit.toFixed(4)}</span> per hour. Consider switching rigs to maximize efficiency.
            </p>
          </div>
        </div>

        {/* Live Conversion Rates */}
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Activity className="w-6 h-6 text-[var(--color-supreme-gold)]" />
              </div>
              <h3 className="text-xl font-bold text-white">Market Rates</h3>
            </div>

            <div className="space-y-4">
              {COINS.slice(0, 8).map(coin => {
                const trend = (Math.random() * 2).toFixed(2);
                const isUp = Math.random() > 0.3;
                const difficulty = (Math.random() * 100).toFixed(1);
                
                return (
                  <div key={coin.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: coin.color }}>
                        {coin.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors">{coin.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-purple-200/40 uppercase font-bold tracking-widest">{coin.id}/USD</p>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-purple-200/40 border border-white/10">Diff: {difficulty}T</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-white">${(EXCHANGE_RATES[coin.id] || 0).toLocaleString()}</p>
                      <div className={clsx(
                        "flex items-center justify-end gap-1 text-[10px] font-bold",
                        isUp ? "text-emerald-400" : "text-red-400"
                      )}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {isUp ? '+' : '-'}{trend}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/10 transition-all">
              View Full Market Data
            </button>
          </div>
        </div>
      </div>

      {/* Mining Activity Log */}
      <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
              <History className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Mining Activity Log</h3>
              <p className="text-sm text-purple-200/50">History of your recent mining sessions</p>
            </div>
          </div>
          <div className="text-xs font-bold text-purple-200/40 uppercase tracking-widest">
            Last {miningActivities.length} Sessions
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-y border-white/5">
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest">Coin</th>
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest">Rig</th>
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest">Start Time</th>
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest">Duration</th>
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest">Amount Mined</th>
                <th className="px-8 py-4 text-[10px] font-black text-purple-200/40 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {miningActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-purple-200/40 font-medium">
                    No mining activity recorded yet. Start a miner to see history.
                  </td>
                </tr>
              ) : (
                miningActivities.map((activity) => {
                  const coin = COINS.find(c => c.id === activity.coinId);
                  const rig = MINING_RIGS.find(r => r.id === activity.rigId);
                  const duration = activity.endTime 
                    ? formatTime(activity.endTime - activity.startTime)
                    : activeMiner === activity.coinId 
                      ? 'In Progress...'
                      : 'Stopped';
                  
                  return (
                    <tr key={activity.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: coin?.color || '#000' }}
                          >
                            {activity.coinId}
                          </div>
                          <span className="font-bold text-white">{coin?.name || activity.coinId}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-purple-200/60 uppercase border border-white/10">
                          {rig?.name || activity.rigId}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-purple-200/40 font-medium">
                        {new Date(activity.startTime).toLocaleString()}
                      </td>
                      <td className="px-8 py-4 text-sm text-purple-200/40 font-mono">
                        {duration}
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-mono font-bold text-white">
                          {activity.amountMined.toFixed(12)} <span className="text-[10px] text-purple-200/40">{activity.coinId}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          ≈ ${(activity.amountMined * (EXCHANGE_RATES[activity.coinId] || 0)).toFixed(4)}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          activity.status === 'active' ? "bg-emerald-500/20 text-white animate-pulse" :
                          activity.status === 'completed' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          "bg-white/5 text-purple-200/40"
                        )}>
                          <div className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            activity.status === 'active' ? "bg-white" :
                            activity.status === 'completed' ? "bg-blue-400" :
                            "bg-purple-400"
                          )} />
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert & Transfer Modal */}
      <AnimatePresence>
        {showConvertModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-bet-purple-dark)] rounded-[40px] shadow-2xl border border-white/10 p-10 w-full max-w-md my-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ArrowRightLeft className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                  Convert & Transfer
                </h3>
                <button onClick={() => setShowConvertModal(false)} className="p-2 text-purple-200/40 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-purple-300/50 uppercase tracking-widest mb-3">Select Coin</label>
                  <select
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all text-white font-bold appearance-none"
                  >
                    {COINS.map(c => (
                      <option key={c.id} value={c.id} className="bg-[var(--color-bet-purple-dark)] text-white">
                        {c.name} ({c.id}) - Balance: {minedBalances[c.id]?.toFixed(12) || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Amount to Convert</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-purple-200/40 font-bold">Min: {CASH_OUT_THRESHOLD.toFixed(12)}</span>
                      <button 
                        onClick={() => {
                          const maxPossible = Math.min(minedBalances[selectedCoin], MAX_CASH_OUT_THRESHOLD);
                          setConvertAmount(maxPossible.toString());
                        }}
                        className="text-xs font-black text-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-gold-light)] transition-colors uppercase tracking-widest"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="w-full pl-5 pr-20 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none transition-all font-black text-2xl text-white placeholder-white/10"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                      <span className="text-[var(--color-supreme-gold)] font-black text-xl">{selectedCoin}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-purple-200/40">Current Rate</span>
                    <span className="font-bold text-white">1 {selectedCoin} = ${EXCHANGE_RATES[selectedCoin].toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-200/60">You will receive</span>
                    <span className="font-black text-2xl text-emerald-400">
                      ${((parseFloat(convertAmount || '0') * EXCHANGE_RATES[selectedCoin]) * 0.83).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-200/30 mt-2 text-right italic">After 17% Supreme Commission</p>
                </div>

                <div className="flex items-center gap-4 p-5 bg-white/5 text-purple-200/60 rounded-2xl text-sm border border-white/5">
                  <Wallet className="w-6 h-6 shrink-0 text-[var(--color-supreme-gold)]" />
                  <p>Funds will be transferred directly to your Supreme Central Wallet.</p>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={!convertAmount || parseFloat(convertAmount) <= 0 || parseFloat(convertAmount) > minedBalances[selectedCoin]}
                  className="w-full py-5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white rounded-2xl font-black shadow-2xl shadow-yellow-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-bet-purple-dark)] rounded-[40px] shadow-2xl border border-white/10 w-full max-w-4xl my-auto overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[var(--color-bet-purple-dark)] to-[var(--color-bet-purple)] p-10 text-white border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <Server className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                      </div>
                      Mining Rig Subscriptions
                    </h3>
                    <p className="text-purple-200/60 mt-2">Unlock high-performance rigs to maximize your mining output.</p>
                  </div>
                  <button 
                    onClick={() => setShowSubModal(false)} 
                    className="flex items-center gap-3 px-6 py-3 text-purple-200/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-white/10 group"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Exit</span>
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                  {RIG_SUBSCRIPTION_PLANS.map(plan => {
                    const isSubscribed = isRigSubscribed(plan.rigId);
                    const sub = rigSubscriptions[plan.rigId];
                    const rig = MINING_RIGS.find(r => r.id === plan.rigId);
                    
                    // Profit Analysis
                    const grossHourly = (rig?.rate || 0) * 3600;
                    const hourly = grossHourly * 0.83; // 17% fee
                    const daily = hourly * 24;
                    const weekly = daily * 7;
                    const monthly = daily * 30;
                    const totalPotential = daily * plan.durationDays;
                    const netProfit = totalPotential - plan.price;
                    const supremeFee = grossHourly * 0.17 * 24 * plan.durationDays;
                    
                    return (
                      <motion.div 
                        key={plan.rigId}
                        whileHover={!isSubscribed ? { scale: 1.02, y: -5 } : {}}
                        whileTap={!isSubscribed ? { scale: 0.98 } : {}}
                        onClick={() => !isSubscribed && setSelectedPlan(plan.rigId)}
                        className={clsx(
                          "relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col group",
                          selectedPlan === plan.rigId 
                            ? "border-[var(--color-supreme-gold)] bg-white/10 shadow-[0_0_40px_rgba(245,158,11,0.2)] scale-[1.02]" 
                            : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]",
                          isSubscribed && "opacity-75 cursor-default border-emerald-500 bg-emerald-500/5"
                        )}
                      >
                        {isSubscribed && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className={clsx("w-3 h-3 rounded-full shadow-sm", rig?.color)} />
                          <span className="font-black text-white uppercase tracking-wider text-xs">{plan.rigId} Rig</span>
                          <Server className={clsx("w-4 h-4 ml-auto transition-colors", selectedPlan === plan.rigId ? "text-[var(--color-supreme-gold)]" : "text-purple-200/20")} />
                        </div>

                      {/* Rig machine image in sub modal */}
                      <div className="mb-5 h-28 rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                        <img 
                          src={rig?.machineImage} 
                          alt={rig?.name}
                          className="w-full h-full object-cover opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="mb-5">
                        <div className="text-3xl font-black text-white">${plan.price}</div>
                        <div className="text-[10px] font-black text-purple-200/40 uppercase tracking-widest">for {plan.durationDays} day(s)</div>
                      </div>

                      <div className="space-y-3 mb-5 flex-1">
                        <div className="flex items-center gap-3 text-xs text-purple-200/60">
                          <Zap className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                          <span>Rate: {rig?.rate} USD/s</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-purple-200/60">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{plan.durationDays} Days Access</span>
                        </div>
                        
                        {/* Profit Analysis Section */}
                        <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                          <p className="text-[10px] font-black text-purple-300/30 uppercase tracking-widest mb-3">Profit Analysis</p>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-purple-200/40">Hourly:</span>
                            <span className="font-bold text-emerald-400">${hourly.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-purple-200/40">Daily:</span>
                            <span className="font-bold text-emerald-400">${daily.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-purple-200/40">Weekly:</span>
                            <span className="font-bold text-emerald-400">${weekly.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-purple-200/40">Monthly:</span>
                            <span className="font-bold text-emerald-400">${monthly.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] border-t border-white/5 pt-2 mt-2">
                            <span className="text-purple-200/20 italic">Supreme Fee (17%):</span>
                            <span className="font-medium text-amber-500">-${supremeFee.toFixed(2)}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[10px]">
                            <span className="text-white font-black uppercase tracking-widest">Net Profit:</span>
                            <span className="font-black text-emerald-400 text-sm">${netProfit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {isSubscribed ? (
                        <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl inline-block text-center mt-5 border border-emerald-500/20">
                          {sub ? `Expires: ${new Date(sub.expiryDate).toLocaleDateString()}` : 'Subscribe'}
                        </div>
                      ) : (
                        <div className={clsx(
                          "w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all mt-5",
                          selectedPlan === plan.rigId ? "bg-[var(--color-supreme-gold)] text-white shadow-xl shadow-yellow-900/20" : "bg-white/5 text-purple-200/40 border border-white/5"
                        )}>
                          {selectedPlan === plan.rigId ? 'Selected' : 'Select Plan'}
                        </div>
                      )}
                      </motion.div>
                    );
                  })}
              </div>

              {selectedPlan && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-white/5 rounded-[40px] border border-white/10"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Payment Method</h4>
                      <p className="text-sm text-purple-200/40">Choose how you want to pay for your subscription.</p>
                      
                      <div className="flex gap-6 mt-6">
                        <button 
                          onClick={() => setPaymentMethod('wallet')}
                          className={clsx(
                            "flex items-center gap-4 px-8 py-4 rounded-2xl border-2 transition-all",
                            paymentMethod === 'wallet' ? "border-[var(--color-supreme-gold)] bg-white/5 shadow-2xl" : "border-transparent bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <Wallet className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                          <div className="text-left">
                            <div className="text-sm font-black text-white uppercase tracking-wider">Supreme Wallet</div>
                            <div className="text-[10px] text-purple-200/40">Balance: ${walletBalance.toFixed(2)}</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('stripe')}
                          className={clsx(
                            "flex items-center gap-4 px-8 py-4 rounded-2xl border-2 transition-all",
                            paymentMethod === 'stripe' ? "border-blue-500 bg-white/5 shadow-2xl" : "border-transparent bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <CreditCard className="w-6 h-6 text-blue-400" />
                          <div className="text-left">
                            <div className="text-sm font-black text-white uppercase tracking-wider">External Account</div>
                            <div className="text-[10px] text-purple-200/40">Powered by Stripe</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6">
                      <div className="text-right">
                        <div className="text-xs text-purple-200/40 font-black uppercase tracking-widest mb-2">Total Amount</div>
                        <div className="text-5xl font-black text-white tracking-tighter">
                          <span className="text-[var(--color-supreme-gold)] text-2xl mr-1">$</span>
                          {RIG_SUBSCRIPTION_PLANS.find(p => p.rigId === selectedPlan)?.price}
                        </div>
                      </div>
                      <button
                        onClick={handlePurchaseSub}
                        disabled={isProcessing}
                        className="w-full md:w-72 py-5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white rounded-2xl font-black shadow-2xl shadow-yellow-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                      >
                        {isProcessing ? (
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {paymentMethod === 'wallet' ? <Wallet className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                            Pay & Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      </div>
    )}
      </div>
    </div>
  </div>
);
}
