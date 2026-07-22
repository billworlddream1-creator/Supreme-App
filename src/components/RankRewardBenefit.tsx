import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Zap, ShieldCheck, Key, Clock, BarChart3, AlertCircle, 
  CheckCircle2, Pickaxe, Coins, Play, Search, Filter, Info,
  TrendingUp, Activity, Server, Database, Plus, Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, addDoc, query, where, onSnapshot, 
  updateDoc, doc, getDoc, setDoc, serverTimestamp, 
  Timestamp, orderBy, limit, getDocs
} from 'firebase/firestore';

interface RankReward {
  id: string;
  userId: string;
  rank: string;
  rankingId: string;
  miningKey: string;
  status: 'pending' | 'active' | 'completed';
  startTime?: any;
  endTime?: any;
  amountMined: number;
  durationHours: number;
  rewardType: 'BTC' | 'ETH' | 'SUP' | 'USDT';
  createdAt: any;
}

const RANK_BENEFITS = {
  'Silver': { duration: 24, label: '24 Hours Migration', rigPower: '2 GB', rewardScale: 1 },
  'Diamond': { duration: 48, label: '48 Hours / 2 Days', rigPower: '2 GB', rewardScale: 1.5 },
  'Gold': { duration: 120, label: '5 Days Migration', rigPower: '2 GB', rewardScale: 2.5 },
  'Crowned': { duration: 168, label: '7 Days / 1 Week', rigPower: '2 GB', rewardScale: 5 },
};

export default function RankRewardBenefit() {
  const { user } = useAuth();
  const [rankingIdInput, setRankingIdInput] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [activeReward, setActiveReward] = useState<RankReward | null>(null);
  const [rewardHistory, setRewardHistory] = useState<RankReward[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<string>('Elite');
  const [usedRanks, setUsedRanks] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch user rank and rankingId
    const fetchUserRank = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.rank) setUserRank(data.rank);
        if (data.rankingId) setRankingIdInput(data.rankingId);
      }
    };
    fetchUserRank();

    // Listen to reward history and active reward
    const q = query(
      collection(db, 'rank_reward_benefits'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rewards: RankReward[] = [];
      let active: RankReward | null = null;
      const used: string[] = [];

      const docs = [...snapshot.docs];
      // Sort in memory by createdAt descending
      docs.sort((a, b) => {
        const timeA = a.data().createdAt?.toDate?.()?.getTime() || (a.data().createdAt ? new Date(a.data().createdAt).getTime() : 0);
        const timeB = b.data().createdAt?.toDate?.()?.getTime() || (b.data().createdAt ? new Date(b.data().createdAt).getTime() : 0);
        return timeB - timeA;
      });

      docs.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as RankReward;
        rewards.push(data);
        if (data.status === 'active') {
          active = data;
        }
        if (data.status === 'completed' || data.status === 'active') {
          used.push(data.rank);
        }
      });

      setRewardHistory(rewards);
      setActiveReward(active);
      setUsedRanks(used);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'rank_reward_benefits'));

    return () => unsubscribe();
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (!activeReward || !activeReward.startTime) {
      setTimer(null);
      return;
    }

    const updateTimer = () => {
      const start = activeReward.startTime.toDate();
      const end = new Date(start.getTime() + activeReward.durationHours * 60 * 60 * 1000);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        completeMining(activeReward.id);
        setTimer('COMPLETED');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimer(`${h}h ${m}m ${s}s`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [activeReward]);

  const generateMiningKey = async () => {
    if (!user) return;
    if (!rankingIdInput) {
      toast.error('Please enter your Ranking ID');
      return;
    }

    // Validation: Rank must be one of the eligible ones
    const eligibleRanks = ['Silver', 'Diamond', 'Gold', 'Crowned'];
    if (!eligibleRanks.includes(userRank)) {
      toast.error(`Your current rank (${userRank}) is not eligible for this benefit. Requires Silver or higher.`);
      return;
    }

    // Validation: Only once per rank
    if (usedRanks.includes(userRank)) {
      toast.error(`You have already redeemed your ${userRank} rank reward benefit.`);
      return;
    }

    setIsProcessing(true);
    try {
      const newKey = `MINING-${userRank.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const benefit = RANK_BENEFITS[userRank as keyof typeof RANK_BENEFITS];
      
      // Save the key as pending in Firestore immediately
      await addDoc(collection(db, 'rank_reward_benefits'), {
        userId: user.uid,
        rank: userRank,
        rankingId: rankingIdInput,
        miningKey: newKey,
        status: 'pending',
        amountMined: 0,
        durationHours: benefit.duration,
        rewardType: 'SUP',
        createdAt: serverTimestamp()
      });

      setGeneratedKey(newKey);
      toast.success('Mining Key generated and saved! You can activate it here or in the Supreme Miner tab.', {
        duration: 5000
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rank_reward_benefits');
    } finally {
      setIsProcessing(false);
    }
  };

  const startMining = async () => {
    if (!user || !generatedKey) return;
    
    setIsProcessing(true);
    try {
      // Find the pending reward we just created and activate it
      const q = query(
        collection(db, 'rank_reward_benefits'),
        where('userId', '==', user.uid),
        where('miningKey', '==', generatedKey),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const rewardDoc = querySnapshot.docs[0];
        const rewardData = rewardDoc.data();
        
        await updateDoc(doc(db, 'rank_reward_benefits', rewardDoc.id), {
          status: 'active',
          startTime: serverTimestamp(),
          endTime: new Date(Date.now() + (rewardData.durationHours * 60 * 60 * 1000))
        });
        
        setGeneratedKey(null);
        toast.success(`Mining session activated!`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'rank_reward_benefits');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeMining = async (rewardId: string) => {
    try {
      const rewardDoc = await getDoc(doc(db, 'rank_reward_benefits', rewardId));
      if (!rewardDoc.exists()) return;
      
      const data = rewardDoc.data();
      if (data.status !== 'active') return;

      const benefit = RANK_BENEFITS[data.rank as keyof typeof RANK_BENEFITS];
      // Simulate 2GB reward amount (2000 SUP coins or similar)
      const finalAmount = 2000 * (benefit?.rewardScale || 1);

      await updateDoc(doc(db, 'rank_reward_benefits', rewardId), {
        status: 'completed',
        endTime: serverTimestamp(),
        amountMined: finalAmount
      });

      toast.success(`Mining completed! You've earned ${finalAmount} SUP coins.`, {
        duration: 5000,
        icon: <Trophy className="w-5 h-5 text-yellow-500" />
      });
    } catch (error) {
      console.error('Error completing mining:', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4a] to-[#1a0b2e] p-8 rounded-[40px] text-white shadow-2xl border border-purple-500/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/30">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
              RANK REWARD BENEFIT
            </h2>
          </div>
          <p className="text-purple-200/80 max-w-2xl text-lg leading-relaxed">
            Exclusive mining rewards for Supreme users who reach Silver, Diamond, Gold, and Crowned ranks. 
            Earn high-yield assets with specialized 2GB mining rigs available once per rank milestone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Area */}
        <div className="lg:col-span-12 space-y-8">
          {activeReward ? (
            <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-[40px] border border-yellow-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                  <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
                  <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">Active Mining Session</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-6">
                <p className="text-gray-400 uppercase tracking-[0.3em] font-black text-xs">Mining Power: 2 GB Dedicated Rig</p>
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="bg-black/80 backdrop-blur-3xl border-2 border-yellow-500/50 w-64 h-64 rounded-full flex flex-col items-center justify-center relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                    <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
                    <span className="text-3xl font-black text-white font-mono">{timer || '00:00:00'}</span>
                    <span className="text-[10px] text-yellow-500 font-bold uppercase mt-2 tracking-widest">Remaining</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{activeReward.rank} Rank Reward</h3>
                  <p className="text-gray-500 text-sm max-w-md">Your 2GB rig is currently generating Supreme Coins. Keep this session active to claim your reward.</p>
                </div>

                <div className="w-full max-w-lg h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 mt-8">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: activeReward.durationHours * 3600, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Generator Card */}
              <div className="bg-white/5 backdrop-blur-xl p-8 lg:p-12 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Generate Mining Key</h3>
                  <p className="text-purple-200/40 text-sm">Enter your Supreme Ranking ID to unlock your milestone reward.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Verified Current Rank</p>
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "p-2 rounded-xl",
                        userRank === 'Crowned' ? "bg-purple-500/20" : 
                        userRank === 'Gold' ? "bg-yellow-500/20" :
                        userRank === 'Diamond' ? "bg-cyan-500/20" : "bg-gray-500/20"
                      )}>
                        <ShieldCheck className={clsx(
                          "w-6 h-6",
                          userRank === 'Crowned' ? "text-purple-400" : 
                          userRank === 'Gold' ? "text-yellow-400" :
                          userRank === 'Diamond' ? "text-cyan-400" : "text-gray-400"
                        )} />
                      </div>
                      <span className="text-2xl font-black text-white italic">{userRank}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rank ID Verification</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="text" 
                        value={rankingIdInput}
                        onChange={(e) => setRankingIdInput(e.target.value)}
                        placeholder="ENTER YOUR RANK ID"
                        className="w-full bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-mono focus:outline-none focus:border-yellow-500 transition-all placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  {!generatedKey ? (
                    <button
                      onClick={generateMiningKey}
                      disabled={isProcessing}
                      className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-yellow-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? <Zap className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                      Generate Key
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-8 bg-black/40 rounded-[32px] border border-white/10 relative group">
                        <div className="absolute top-0 right-0 p-4">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedKey || '');
                              toast.success('Key copied to clipboard!');
                            }}
                            className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition-all shadow-lg"
                          >
                            <Plus className="w-5 h-5 rotate-45" />
                          </button>
                        </div>
                        <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] mb-4 text-center">Your Mining Key (Copy to activate)</p>
                        <div className="font-mono text-xl md:text-3xl font-black text-white text-center tracking-wider break-all">
                          {generatedKey}
                        </div>
                      </div>
                      <button
                        onClick={startMining}
                        disabled={isProcessing}
                        className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
                      >
                        <Cpu className="w-5 h-5" />
                        Initialize 2GB Rig
                      </button>
                      <p className="text-[10px] text-gray-500 text-center font-bold">
                        You can also activate this key in the main Supreme Miner tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits Info */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(RANK_BENEFITS).map(([rank, benefit]) => {
                  const isCurrent = userRank === rank;
                  const isUsed = usedRanks.includes(rank);
                  
                  return (
                    <div 
                      key={rank} 
                      className={clsx(
                        "p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden group",
                        isCurrent ? "bg-white/10 border-yellow-500/50 shadow-2xl" : "bg-white/5 border-white/5 opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "p-3 rounded-2xl",
                            rank === 'Crowned' ? "bg-purple-500/20 text-purple-400" : 
                            rank === 'Gold' ? "bg-yellow-500/20 text-yellow-400" :
                            rank === 'Diamond' ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-400/20 text-gray-400"
                          )}>
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">{rank} Milestone</h4>
                            <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Duration: {benefit.label}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Rig Capacity</p>
                          <p className="text-lg font-black text-white">{benefit.rigPower}</p>
                        </div>
                      </div>

                      {isUsed && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Reward Redeemed</span>
                          </div>
                        </div>
                      )}

                      {isCurrent && !isUsed && (
                        <div className="mt-4 flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          <Zap className="w-3 h-3" />
                          Available Now
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking & Analysis */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <BarChart3 className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Reward Tracking & Analysis</h3>
                  <p className="text-gray-500 text-sm">Detailed history of your rank milestone mining sessions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Mined</p>
                  <p className="text-xl font-black text-white">
                    {rewardHistory.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.amountMined || 0), 0).toLocaleString()}
                    <span className="text-xs text-yellow-500 ml-1">SUP</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-y border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Rank Milestone</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mining Key</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Earnings</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rewardHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <Database className="w-12 h-12 opacity-10" />
                          <p className="font-bold uppercase tracking-widest text-xs">No reward sessions recorded yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rewardHistory.map((reward) => (
                      <tr key={reward.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
                              reward.rank === 'Crowned' ? "bg-purple-600" : 
                              reward.rank === 'Gold' ? "bg-yellow-600" :
                              reward.rank === 'Diamond' ? "bg-cyan-600" : "bg-gray-600"
                            )}>
                              {reward.rank[0]}
                            </div>
                            <span className="font-bold text-white uppercase text-xs tracking-wider">{reward.rank}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-mono text-[10px] text-gray-500 group-hover:text-white transition-colors">{reward.miningKey}</span>
                        </td>
                        <td className="px-8 py-6 text-xs text-gray-400 font-bold">
                          {reward.durationHours} Hours
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-mono font-black text-white text-sm">
                            {parseFloat(reward.amountMined.toString()).toLocaleString()} <span className="text-[10px] text-yellow-500">SUP</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right lg:text-left">
                          <span className={clsx(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            reward.status === 'active' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            reward.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          )}>
                            {reward.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="text-xs font-bold text-gray-400">{reward.createdAt?.toDate().toLocaleDateString()}</div>
                          <div className="text-[10px] text-gray-600 font-mono italic">{reward.createdAt?.toDate().toLocaleTimeString()}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
