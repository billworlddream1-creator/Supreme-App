import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, Shield, Medal, Star, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { getRankData } from '../constants/ranks';

interface Earner {
  uid: string;
  name: string;
  email: string;
  rank: string;
  avatar?: string;
  totalEarnings: number;
}

const TopEarners: React.FC = () => {
  const [earners, setEarners] = useState<Earner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEarners = async () => {
      setLoading(true);
      try {
        // Query users by their totalEarnings field directly
        const q = query(
          collection(db, 'users'),
          orderBy('totalEarnings', 'desc'),
          limit(5)
        );
        
        const userSnapshot = await getDocs(q);
        const topEarners: Earner[] = userSnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            uid: userData.uid || doc.id,
            name: userData.name || 'Anonymous',
            email: userData.email,
            rank: userData.rank || 'Bronze',
            avatar: userData.avatar,
            totalEarnings: userData.totalEarnings || 0
          };
        });

        setEarners(topEarners);
      } catch (error) {
        console.error('Error fetching top earners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopEarners();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <TrendingUp className="w-12 h-12 text-[var(--color-supreme-gold)] animate-pulse relative z-10" />
        <div className="absolute inset-0 bg-[var(--color-supreme-gold)]/20 blur-xl animate-pulse" />
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] animate-pulse">Analyzing Wealth Distribution...</p>
    </div>
  );

  if (earners.length === 0) return (
    <div className="p-12 text-center rounded-[2.5rem] bg-white/5 border border-white/10">
      <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-4" />
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Market cycle starting. No earnings recorded yet.</p>
    </div>
  );

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-4">
            <Trophy className="w-8 h-8 text-[var(--color-supreme-gold)]" />
            Elite Earners
          </h2>
          <p className="text-gray-500 text-sm mt-2">Verified transaction-based performance leaderboard.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Market Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {earners.map((earner, index) => (
          <motion.div
            key={earner.uid || `earner-${index}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
            className="group relative overflow-hidden"
          >
            {/* Background Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[2.5rem] border border-white/5 group-hover:border-[var(--color-supreme-gold)]/40 transition-all duration-500 shadow-2xl" />
            
            {/* Rank Visual */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-[12rem] font-display font-bold text-white/[0.015] leading-none pointer-events-none transition-colors group-hover:text-[var(--color-supreme-gold)]/[0.04]">
              {index + 1}
            </div>

            <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center gap-8">
              {/* Avatar Section */}
              <div className="relative">
                {(() => {
                  const rankInfo = getRankData(earner.rank);
                  return (
                    <>
                      <div className={clsx(
                        "relative p-1.5 rounded-full z-10 transition-transform duration-500 group-hover:scale-110",
                        index === 0 ? "bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-xl shadow-amber-500/30" :
                        index === 1 ? "bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-500 shadow-xl shadow-slate-500/20" :
                        index === 2 ? "bg-gradient-to-tr from-orange-400 via-orange-200 to-orange-700 shadow-xl shadow-orange-500/20" :
                        "bg-white/10"
                      )} style={index >= 3 ? { border: `2px solid ${rankInfo.color}44` } : {}}>
                        <img 
                          src={earner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(earner.name)}&background=random`} 
                          alt={earner.name}
                          className="w-20 h-20 rounded-full border-4 border-[#111]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {index === 0 ? (
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute -right-2 -top-2 p-2 bg-[#111] rounded-full border border-amber-500/30 shadow-2xl z-20"
                        >
                          <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
                        </motion.div>
                      ) : index < 3 && (
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute -right-2 -top-2 p-2 bg-[#111] rounded-full border border-white/10 shadow-2xl z-20"
                        >
                          {index === 1 ? <Medal className="w-5 h-5 text-slate-300 fill-slate-300" /> :
                           <Shield className="w-5 h-5 text-orange-600 fill-orange-600" />}
                        </motion.div>
                      )}
                    </>
                  );
                })()}
                {/* Visual Rank Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#111] px-4 py-1 rounded-full border border-white/10 z-20 shadow-xl">
                  <span className="text-[10px] font-black text-white italic tracking-tighter">#{index + 1}</span>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h4 className="text-2xl font-display font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors truncate w-full sm:w-auto">
                    {earner.name}
                  </h4>
                  {(() => {
                    const rankInfo = getRankData(earner.rank);
                    return (
                      <div 
                        className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg"
                        style={{ 
                          backgroundColor: `${rankInfo.color}11`, 
                          borderColor: `${rankInfo.color}33`, 
                          color: rankInfo.color 
                        }}
                      >
                        {earner.rank}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Status</p>
                      <p className="text-xs font-bold text-white mt-1">Growth Phase</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Security</p>
                      <p className="text-xs font-bold text-white mt-1">Vault Protected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Section */}
              <div className="text-center sm:text-right pt-6 sm:pt-0 sm:pl-8 sm:border-l border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Total Derived Earnings</p>
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-4xl font-display font-black text-white tracking-tighter hover:scale-105 transition-transform cursor-default">
                    ${earner.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">+High Yield</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Noble Glass Overlay (Decorative) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--color-supreme-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </motion.div>
        ))}
      </div>
      
      <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 text-center">
        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.5em]">Global Ranking Updates Daily | Based on Real-Time Market Flux</p>
      </div>
    </div>
  );
};

export default TopEarners;
