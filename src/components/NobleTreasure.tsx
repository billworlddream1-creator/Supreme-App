import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Gem, 
  Shield, 
  ShieldCheck,
  Gift,
  Lock,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  Wallet,
  AlertCircle,
  Key,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSound } from '../context/SoundContext';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';

const TREASURE_ELIGIBILITY_THRESHOLD = 50000;

interface RewardTier {
  rank: string;
  amount: number;
  color: string;
  glow: string;
  icon: any;
}

const REWARD_TIERS: Record<string, RewardTier> = {
  'Bronze': { rank: 'Bronze', amount: 1000, color: 'text-orange-500', glow: 'shadow-orange-500/20', icon: Shield },
  'Silver': { rank: 'Silver', amount: 1500, color: 'text-slate-300', glow: 'shadow-slate-300/20', icon: ShieldCheck },
  'Diamond': { rank: 'Diamond', amount: 2000, color: 'text-cyan-400', glow: 'shadow-cyan-400/20', icon: Gem },
  'Gold': { rank: 'Gold', amount: 2500, color: 'text-yellow-500', glow: 'shadow-yellow-500/20', icon: Trophy },
  'Crowned': { rank: 'Crowned', amount: 3000, color: 'text-fuchsia-500', glow: 'shadow-fuchsia-500/20', icon: Crown },
  'Clowned': { rank: 'Clowned', amount: 3000, color: 'text-purple-500', glow: 'shadow-purple-500/20', icon: Sparkles },
};

const NobleTreasure: React.FC = () => {
  const { profile } = useAuth();
  const { receivePayment, balance } = useWallet();
  const { playSound } = useSound();
  
  const [rankingIdInput, setRankingIdInput] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [showReward, setShowReward] = useState(false);

  if (!profile) return null;

  const totalEarnings = profile.totalEarnings || 0;
  const isEligible = totalEarnings >= TREASURE_ELIGIBILITY_THRESHOLD;
  const currentRank = profile.rank || 'Bronze';
  const tier = REWARD_TIERS[currentRank] || REWARD_TIERS['Bronze'];
  const hasClaimedCurrentRank = profile.claimedNobleTreasures?.includes(currentRank);

  const handleClaim = async () => {
    if (!isEligible) {
      toast.error("Eligibility Denied: Total earnings below $50,000.");
      return;
    }

    if (rankingIdInput !== profile.rankingId) {
      toast.error("Authentication Failure: Invalid Ranking ID.");
      playSound('error');
      return;
    }

    if (hasClaimedCurrentRank) {
      toast.error(`Treasure Reclaimed: Reward for ${currentRank} already collected.`);
      return;
    }

    setIsClaiming(true);
    try {
      // 1. Update Firestore for claimedNobleTreasures first to prevent race conditions
      await updateDoc(doc(db, 'users', profile.uid), {
        claimedNobleTreasures: arrayUnion(currentRank)
      });

      // 2. Use receivePayment to credit the balance and totalEarnings, and log transaction
      // This also gives them their rank/boost bonuses which is very "Billionaire"
      await receivePayment(tier.amount, `Noble Treasure Grant: ${currentRank} Rank`, 'Noble Treasure');

      playSound('celebration');
      setShowReward(true);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#B8860B', '#FFFFFF']
      });

      toast.success(`Royal Grant Approved: $${tier.amount} credited to Central Wallet.`);
    } catch (error) {
      console.error("Error claiming treasure:", error);
      toast.error("Treasury System Offline. Please try again later.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-[#050505] bg-gradient-to-br from-[#1a110a] via-[#050505] to-[#0a0f12] min-h-[600px] rounded-[3rem] border border-amber-500/10 overflow-hidden flex flex-col relative shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 blur-[150px] rounded-full pointer-events-none bg-amber-500/5 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none bg-orange-500/5" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 backdrop-blur-xl bg-black/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Noble <span className="text-amber-500">Treasure</span></h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Exclusive Billionaire Monthly Grant</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
           <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Treasury Status</p>
              <div className="flex items-center gap-2">
                 <div className={clsx("w-2 h-2 rounded-full", isEligible ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")} />
                 <span className={clsx("text-xs font-black uppercase tracking-widest", isEligible ? "text-emerald-500" : "text-red-500")}>
                    {isEligible ? 'Authorized' : 'Restricted'}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isEligible ? (
            <motion.div 
              key="locked"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                   <Lock className="w-12 h-12 text-gray-700" />
                   <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-800 animate-spin-slow" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-black text-white">Access Denied</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The Noble Treasury is a sacred chamber reserved only for the platform's highest earners. Reach <span className="text-white font-bold text-lg">$50,000</span> in total earnings to unlock your monthly royal grants.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Current Progress</span>
                  <span className="text-xs font-bold text-white">${totalEarnings.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, (totalEarnings / TREASURE_ELIGIBILITY_THRESHOLD) * 100)}%` }}
                     className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                   />
                </div>
                <p className="mt-3 text-[10px] text-gray-600 italic">Continue your legacy to earn your seat among the elite.</p>
              </div>
            </motion.div>
          ) : showReward ? (
            <motion.div 
              key="claimed"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-center space-y-8 max-w-lg"
            >
               <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 m-auto w-48 h-48 border-2 border-dashed border-amber-500/30 rounded-full"
                  />
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-amber-600/20 to-amber-400/20 border border-amber-500/40 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                     <tier.icon className={clsx("w-20 h-20", tier.color)} />
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-4xl font-display font-black text-white">Monthly Grant Claimed</h3>
                  <p className="text-gray-400 text-sm">
                    You have successfully claimed the <span className={clsx("font-bold", tier.color)}>{tier.rank} Tier</span> treasure. Your account has been credited with <span className="text-white font-black">$${tier.amount.toLocaleString()}</span>.
                  </p>
               </div>

               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">New Balance</p>
                    <p className="text-2xl font-display font-black text-white tabular-nums">${balance.toLocaleString()}</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Completed</p>
                  </div>
               </div>

               <button 
                 onClick={() => setShowReward(false)}
                 className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
               >
                 Return to Treasury
               </button>
            </motion.div>
          ) : (
            <motion.div 
              key="treasure"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left Column: Treasure Info */}
              <div className="space-y-8 order-2 lg:order-1">
                 <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                       <Sparkles className="w-3 h-3 text-amber-500" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Tier: {currentRank}</span>
                    </div>
                    <h3 className="text-4xl font-display font-black text-white leading-tight">
                       Your Monthly <br /> <span className="text-amber-500 underline decoration-amber-500/30">Royal Grant</span>
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md italic">
                       As a Noble of the realm with over $50,000 in earnings, your contribution to the platform is recognized. Enter your credentials below to unlock your rank-specific treasure.
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Potential Reward</p>
                       <p className="text-2xl font-display font-black text-white">${tier.amount.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Claim Status</p>
                       <p className={clsx("text-xs font-black uppercase tracking-widest", hasClaimedCurrentRank ? "text-amber-500" : "text-emerald-500")}>
                         {hasClaimedCurrentRank ? 'Reclaimed' : 'Available'}
                       </p>
                    </div>
                 </div>

                 {/* Input Area */}
                 <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ranking ID Auth</label>
                       <span className="text-[9px] font-bold text-gray-600 italic underline">Check Profile for ID</span>
                    </div>
                    <div className="relative group">
                       <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                       <input 
                         type="password"
                         placeholder="Enter Ranking ID..."
                         value={rankingIdInput}
                         onChange={(e) => setRankingIdInput(e.target.value)}
                         className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-display font-bold focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-800"
                       />
                       <button 
                         onClick={() => {
                           if (profile.rankingId) {
                             navigator.clipboard.writeText(profile.rankingId);
                             toast.success("Ranking ID copied to clipboard.");
                           } else {
                             toast.error("Ranking ID not found. Contact Support.");
                           }
                         }}
                         className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-500 transition-all"
                         title="Copy your Ranking ID"
                       >
                         <Copy className="w-4 h-4" />
                       </button>
                    </div>
                    <button 
                      onClick={handleClaim}
                      disabled={isClaiming || hasClaimedCurrentRank}
                      className={clsx(
                        "w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all relative overflow-hidden group shadow-2xl",
                        hasClaimedCurrentRank 
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                          : "bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/20 active:scale-95"
                      )}
                    >
                      {isClaiming ? "Authenticating Treasury..." : hasClaimedCurrentRank ? "Rewards Exhausted for Rank" : "Claim Royal Treasure"}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                    {!hasClaimedCurrentRank && <p className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-widest">Valid for current {currentRank} status only.</p>}
                 </div>
              </div>

              {/* Right Column: Visual Box */}
              <div className="flex flex-col items-center justify-center order-1 lg:order-2">
                 <div className="relative w-full max-w-[320px] aspect-square">
                    {/* Visual Orbitals */}
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-amber-500/10 rounded-full scale-125"
                    />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-amber-500/5 rounded-full scale-150"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-[60px] opacity-30" />
                    
                    <motion.div 
                       animate={{ y: [0, -20, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="relative z-10 w-full h-full flex items-center justify-center"
                    >
                       <div className="relative group cursor-pointer">
                          {/* The Box Visual */}
                          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 rounded-[3rem] shadow-[0_0_80px_rgba(184,134,11,0.4)] relative flex items-center justify-center border-4 border-amber-300 transform group-hover:scale-105 transition-transform duration-700">
                             <div className="absolute inset-0 bg-grid-black/[0.1] rounded-[2.8rem]" />
                             <Gift className="w-20 h-20 sm:w-24 sm:h-24 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
                             
                             {/* Accents */}
                             <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-[2.8rem]" />
                             <div className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-amber-200/50" />
                             </div>
                          </div>

                          {/* Floaties */}
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl"
                          >
                             <Trophy className="w-5 h-5 text-amber-400" />
                          </motion.div>
                       </div>
                    </motion.div>

                    <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center w-full">
                       <div className="h-1 w-32 bg-amber-500/20 rounded-full blur-md mx-auto" />
                       <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/50">Imperial Asset Vault</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 bg-white/5 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Verification</p>
                 <p className="text-[10px] font-bold text-white uppercase">Noble Verified</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Yield Type</p>
                 <p className="text-[10px] font-bold text-white uppercase">Direct Deposit</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                 <ChevronRight className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Processing</p>
                 <p className="text-[10px] font-bold text-white uppercase">Instantaneous</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                 <Search className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Platform Check</p>
                 <p className="text-[10px] font-bold text-white uppercase">Monthly Audit</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NobleTreasure;
