import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Award, 
  Crown, 
  TrendingUp, 
  Target,
  Medal,
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Play, 
  Calendar,
  CheckCircle,
  Shield
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Types ---

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  unlocked: boolean;
  progress: number; // 0-100
}

interface Rank {
  name: string;
  minSubs: number;
  color: string;
  icon: any;
  bonus: number;
  description: string;
}

// --- Mock Data ---

const RANKS: Rank[] = [
  { name: 'Royal', minSubs: 0, color: 'text-gray-500', icon: Star, bonus: 0, description: 'Just signed up. No subs yet.' },
  { name: 'Elite', minSubs: 1, color: 'text-blue-500', icon: Shield, bonus: 0, description: '1-3 subs. No earning increase.' },
  { name: 'Silver', minSubs: 4, color: 'text-slate-500', icon: Medal, bonus: 1.80, description: '4+ subs. Earnings +1.80%.' },
  { name: 'Diamond', minSubs: 5, color: 'text-cyan-600', icon: Award, bonus: 2.0, description: '5+ subs. Earnings +2.0%.' },
  { name: 'Gold', minSubs: 7, color: 'text-yellow-600', icon: Trophy, bonus: 2.5, description: '7+ subs. Earnings +2.50%.' },
  { name: 'Crowned', minSubs: 10, color: 'text-[var(--color-supreme-gold)]', icon: Crown, bonus: 3.8, description: '10+ subs. Earnings +3.80%.' },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Post', description: 'Create your first post on the Network', icon: MessageCircle, points: 50, unlocked: true, progress: 100 },
  { id: '2', title: 'Market Mogul', description: 'Make 5 purchases in the Market', icon: ShoppingBag, points: 100, unlocked: false, progress: 40 },
  { id: '3', title: 'Influencer', description: 'Reach 100 followers', icon: Users, points: 200, unlocked: false, progress: 75 },
  { id: '4', title: 'Content Creator', description: 'Upload a video to Media', icon: Play, points: 150, unlocked: true, progress: 100 },
  { id: '5', title: 'Daily Streak', description: 'Login for 7 consecutive days', icon: Calendar, points: 75, unlocked: false, progress: 57 }, // 4/7 days
];

export default function Gamification() {
  const [subs, setSubs] = useState(2); // Mock current subs
  const [currentRank, setCurrentRank] = useState<Rank>(RANKS[0]);
  const [nextRank, setNextRank] = useState<Rank>(RANKS[1]);
  const [progressToNext, setProgressToNext] = useState(0);

  useEffect(() => {
    // Calculate Rank
    let rank = RANKS[0];
    let next = RANKS[1];
    
    for (let i = 0; i < RANKS.length; i++) {
      if (subs >= RANKS[i].minSubs) {
        rank = RANKS[i];
        next = RANKS[i + 1] || null;
      }
    }
    
    setCurrentRank(rank);
    setNextRank(next);

    if (next) {
      const range = next.minSubs - rank.minSubs;
      const current = subs - rank.minSubs;
      // Prevent division by zero if range is 0 (e.g., same minSubs, though shouldn't happen)
      setProgressToNext(range > 0 ? (current / range) * 100 : 100);
    } else {
      setProgressToNext(100);
    }
  }, [subs]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-[var(--color-supreme-text)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Supreme Ranks
        </h3>
        <div className="px-3 py-1 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-full text-xs font-bold border border-[var(--color-supreme-gold)]/20 flex items-center gap-1">
          <Crown className="w-3 h-3 fill-current" /> {subs} Subs
        </div>
      </div>

      {/* Rank Progress */}
      <div className="mb-8 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        {currentRank.bonus > 0 && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
            +{currentRank.bonus.toFixed(2)}% Earnings
          </div>
        )}
        <div className="flex justify-between items-center mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className={clsx("p-2 rounded-lg bg-white shadow-sm", currentRank.color)}>
              <currentRank.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Current Rank</p>
              <h4 className={clsx("font-bold text-lg", currentRank.color)}>{currentRank.name}</h4>
            </div>
          </div>
          {nextRank && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Next Rank</p>
              <h4 className="font-bold text-sm text-gray-600">{nextRank.name}</h4>
            </div>
          )}
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", currentRank.name === 'Crowned' ? "from-yellow-400 to-[var(--color-supreme-gold)]" : "from-blue-400 to-purple-500")}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-bold text-gray-400">
          <span>{currentRank.minSubs} Subs</span>
          {nextRank && <span>{nextRank.minSubs} Subs</span>}
        </div>
      </div>

      {/* Rank Analysis / Info */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Rank Benefits & Analysis</h4>
        {RANKS.slice().reverse().map((rank) => (
          <div 
            key={rank.name} 
            className={clsx(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              currentRank.name === rank.name 
                ? "bg-white border-[var(--color-supreme-gold)]/50 shadow-md ring-1 ring-[var(--color-supreme-gold)]/20" 
                : subs >= rank.minSubs
                  ? "bg-white border-gray-200 shadow-sm"
                  : "bg-gray-50 border-gray-100 opacity-70 grayscale"
            )}
          >
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              subs >= rank.minSubs ? `bg-opacity-10 ${rank.color.replace('text-', 'bg-')}` : "bg-gray-200",
              rank.color
            )}>
              <rank.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className={clsx("font-bold text-sm truncate", rank.color)}>{rank.name}</h4>
                {subs >= rank.minSubs ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-md">{rank.minSubs} Subs</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{rank.description}</p>
            </div>
            
            <div className={clsx(
              "text-xs font-bold whitespace-nowrap",
              rank.bonus > 0 ? "text-green-600" : "text-gray-400"
            )}>
              +{rank.bonus.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
