import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Shield, Medal, Star, Crown, Coins, Wallet, Sparkles, Filter, RefreshCw, Award, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { getRankData } from '../constants/ranks';

interface RankUser {
  uid: string;
  name: string;
  email: string;
  rank: string;
  avatar?: string;
  balance: number;
  supremeBalance: number;
  totalEarnings: number;
}

type RankingType = 'supremeBalance' | 'balance' | 'totalEarnings';

export default function GlobalRankings() {
  const [rankingType, setRankingType] = useState<RankingType>('supremeBalance');
  const [users, setUsers] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRankings = async (type: RankingType, isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // Query users collection ordered by the selected metric
      const q = query(
        collection(db, 'users'),
        orderBy(type, 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const rankingList: RankUser[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Anonymous User',
          email: data.email || '',
          rank: data.rank || 'Bronze',
          avatar: data.avatar,
          balance: data.balance || 0,
          supremeBalance: data.supremeBalance || 0,
          totalEarnings: data.totalEarnings || 0
        };
      });

      setUsers(rankingList);
    } catch (error) {
      console.error('Error fetching global rankings:', error);
      // Fallback: search and order manually from all users if compound index is missing
      try {
        const fallbackQuery = query(collection(db, 'users'), limit(50));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const mappedList: RankUser[] = fallbackSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            name: data.name || 'Anonymous User',
            email: data.email || '',
            rank: data.rank || 'Bronze',
            avatar: data.avatar,
            balance: data.balance || 0,
            supremeBalance: data.supremeBalance || 0,
            totalEarnings: data.totalEarnings || 0
          };
        });

        // Manual sort based on chosen type
        mappedList.sort((a, b) => {
          if (type === 'supremeBalance') return b.supremeBalance - a.supremeBalance;
          if (type === 'balance') return b.balance - a.balance;
          return b.totalEarnings - a.totalEarnings;
        });

        setUsers(mappedList.slice(0, 10));
      } catch (fallbackError) {
        console.error('Fallback fetching also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRankings(rankingType);
  }, [rankingType]);

  const handleRefresh = () => {
    fetchRankings(rankingType, true);
  };

  const getMetricLabel = (type: RankingType) => {
    switch (type) {
      case 'supremeBalance':
        return 'Supreme Coins';
      case 'balance':
        return 'Central balance';
      case 'totalEarnings':
        return 'Total Earnings';
    }
  };

  const formatMetricValue = (user: RankUser, type: RankingType) => {
    switch (type) {
      case 'supremeBalance':
        return `${(user.supremeBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SC`;
      case 'balance':
        return `$${(user.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'totalEarnings':
        return `$${(user.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const renderRankBadgeIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="absolute -top-3 -right-3 z-30 bg-yellow-500 rounded-full p-1 border border-black shadow-lg">
            <Crown className="w-5 h-5 text-black fill-black" />
          </div>
        );
      case 1:
        return (
          <div className="absolute -top-3 -right-3 z-30 bg-slate-300 rounded-full p-1 border border-black shadow-lg">
            <Medal className="w-5 h-5 text-black fill-black" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-3 -right-3 z-30 bg-amber-600 rounded-full p-1 border border-black shadow-lg">
            <Award className="w-5 h-5 text-black fill-black" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8" id="global-rankings-container">
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <span className="text-amber-500 font-mono text-xs font-bold tracking-[0.25em] uppercase block mb-2">Live Wealth Distribution</span>
          <h2 className="text-4xl font-display font-medium text-white flex items-center gap-3">
            <Trophy className="w-10 h-10 text-[var(--color-supreme-gold)]" />
            Global Supreme Wealth
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Meet the elite nodes of the Supreme network. rankings are compiled live based on direct account ledger data.
          </p>
        </div>

        {/* Refresh and Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-xs font-bold font-mono tracking-wider disabled:opacity-50"
          >
            <RefreshCw className={clsx("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? "SYNCING..." : "SYNC LEDGER"}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Ledger Verified</span>
          </div>
        </div>
      </div>

      {/* Tabs list to select rankings type */}
      <div className="flex flex-wrap p-2 bg-white/5 rounded-3rem border border-white/5 gap-2 max-w-xl">
        <button
          onClick={() => setRankingType('supremeBalance')}
          className={clsx(
            "flex-1 min-w-[140px] py-4 rounded-2xl text-xs font-bold tracking-wider font-display uppercase transition-all flex items-center justify-center gap-2 border",
            rankingType === 'supremeBalance'
              ? "bg-amber-500 text-black border-amber-600 shadow-xl shadow-amber-500/10"
              : "text-gray-400 hover:text-white bg-transparent border-transparent hover:bg-white/5"
          )}
        >
          <Coins className="w-4 h-4" />
          Supreme Coins
        </button>
        <button
          onClick={() => setRankingType('balance')}
          className={clsx(
            "flex-1 min-w-[140px] py-4 rounded-2xl text-xs font-bold tracking-wider font-display uppercase transition-all flex items-center justify-center gap-2 border",
            rankingType === 'balance'
              ? "bg-amber-500 text-black border-amber-600 shadow-xl shadow-amber-500/10"
              : "text-gray-400 hover:text-white bg-transparent border-transparent hover:bg-white/5"
          )}
        >
          <Wallet className="w-4 h-4" />
          Central Wallet
        </button>
        <button
          onClick={() => setRankingType('totalEarnings')}
          className={clsx(
            "flex-1 min-w-[140px] py-4 rounded-2xl text-xs font-bold tracking-wider font-display uppercase transition-all flex items-center justify-center gap-2 border",
            rankingType === 'totalEarnings'
              ? "bg-amber-500 text-black border-amber-600 shadow-xl shadow-amber-500/10"
              : "text-gray-400 hover:text-white bg-transparent border-transparent hover:bg-white/5"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Total Earnings
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 rounded-[2.50rem] border border-white/5">
          <div className="relative">
            <Trophy className="w-16 h-16 text-amber-500 animate-pulse relative z-10" />
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl animate-pulse" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] animate-pulse">Scanning Platform Ledgers...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 text-center rounded-[2.5rem] bg-white/5 border border-white/10">
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Awaiting First Node Transactions</p>
          <p className="text-gray-600 text-xs mt-2">No users found with positive {getMetricLabel(rankingType)}.</p>
        </div>
      ) : (
        <div id="rankings-grid" className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {users.map((rankUser, index) => {
              const rankInfo = getRankData(rankUser.rank);
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const positionClass = clsx(
                isFirst && "border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-black hover:shadow-[0_0_50px_rgba(217,119,6,0.15)]",
                isSecond && "border-slate-400/25 bg-gradient-to-r from-slate-500/5 to-black hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
                isThird && "border-amber-700/25 bg-gradient-to-r from-amber-800/5 to-black hover:shadow-[0_0_30px_rgba(217,119,6,0.05)]",
                !isFirst && !isSecond && !isThird && "border-white/5 bg-gradient-to-r from-white/2 to-black"
              );

              return (
                <motion.div
                  key={rankUser.uid}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
                  className={clsx(
                    "flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group hover:border-amber-500/40",
                    positionClass
                  )}
                >
                  {/* Glowing background on hover for podium */}
                  {index < 3 && (
                    <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  {/* Positioning / Rank number background watermarked for visual design */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-9xl font-display font-black text-white/[0.012] group-hover:text-white/[0.025] pointer-events-none select-none transition-colors duration-300 leading-none">
                    #{index + 1}
                  </div>

                  {/* Left Column: Number + User Identity info */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 z-10 w-full md:w-auto">
                    {/* Position Number */}
                    <div className="flex items-center justify-center shrink-0">
                      <span className={clsx(
                        "text-2xl font-display font-black font-mono tracking-tighter italic",
                        isFirst ? "text-amber-400 font-extrabold scale-110 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" :
                        isSecond ? "text-slate-300" :
                        isThird ? "text-amber-600" : "text-gray-600"
                      )}>
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Avatar Container with glowing rank rings */}
                    <div className="relative">
                      <div className={clsx(
                        "rounded-full p-1 border",
                        isFirst ? "bg-gradient-to-tr from-amber-400 to-amber-600 shadow-xl shadow-amber-500/20" :
                        isSecond ? "bg-gradient-to-tr from-slate-400 to-slate-200" :
                        isThird ? "bg-gradient-to-tr from-amber-800 to-amber-600" : "bg-white/10"
                      )}>
                        <img
                          src={rankUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rankUser.name)}&background=18181b&color=ffffff&size=128&bold=true`}
                          alt={rankUser.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-black bg-zinc-900"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {renderRankBadgeIcon(index)}
                    </div>

                    {/* Details: Name, email/identity token, Rank Badge */}
                    <div className="min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <p className="text-xl font-display font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors truncate">
                          {rankUser.name}
                        </p>
                        {/* Elite Rank Label Badge */}
                        <div
                          className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border whitespace-nowrap"
                          style={{
                            backgroundColor: `${rankInfo.color}11`,
                            borderColor: `${rankInfo.color}33`,
                            color: rankInfo.color
                          }}
                        >
                          {rankUser.rank}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1 font-semibold">
                        ID: {rankUser.uid.substring(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Status Indicators */}
                  <div className="hidden lg:flex items-center gap-8 z-10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                        <Shield className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none">Authentication</p>
                        <p className="text-xs font-bold text-white mt-1">Verified Node</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none">Multiplier</p>
                        <p className="text-xs font-bold text-white mt-1">{rankInfo.earningMultiplier} Yield</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Earnings value */}
                  <div className="text-center md:text-right mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 md:pl-8 md:border-l border-white/5 z-10 w-full md:w-auto shrink-0 flex flex-col items-center md:items-end">
                    <p className="text-[9px] font-extrabold text-gray-500 uppercase tracking-[0.25em] mb-1.5">
                      {getMetricLabel(rankingType)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "text-2xl font-display font-bold font-mono tracking-tight cursor-default",
                        isFirst ? "text-amber-400 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]" : "text-white"
                      )}>
                        {formatMetricValue(rankUser, rankingType)}
                      </span>
                      {isFirst && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer Banner */}
      <div className="p-6 rounded-[2.5rem] bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 text-center flex items-center justify-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.3em]">
          Platform wide leaderboards synchronize securely every minute. Want to rank higher? Fuel your central balance stack!
        </p>
      </div>
    </div>
  );
}
