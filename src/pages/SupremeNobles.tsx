import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Trophy, Users, Search, Filter, ShieldCheck, Star, Shield, TrendingUp, ChevronRight, User, AlertCircle, Gamepad2, Coins, Gift } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import NobleSpin from '../components/NobleSpin';
import NobleRoller from '../components/NobleRoller';
import SupremeMysteriousBox from '../components/SupremeMysteriousBox';
import NobleTreasure from '../components/NobleTreasure';

interface NobleUser {
  uid: string;
  name: string;
  handle: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other' | '';
  rank: string;
  totalEarnings: number;
  nobleTitle: string;
  isNoble: boolean;
}

const SupremeNobles: React.FC = () => {
  const [nobles, setNobles] = useState<NobleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'noble' | 'non-noble'>('all');
  const [activeView, setActiveView] = useState<'leaderboard' | 'spin' | 'roller' | 'box' | 'treasure'>('leaderboard');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNoblesData = async () => {
      setLoading(true);
      try {
        // Query users directly by totalEarnings to find candidates
        const q = query(
          collection(db, 'users'),
          where('totalEarnings', '>=', 50000),
          orderBy('totalEarnings', 'desc')
        );
        
        const userSnapshot = await getDocs(q);
        
        if (userSnapshot.empty) {
          setNobles([]);
          return;
        }

        const nobleUsers: NobleUser[] = userSnapshot.docs.map(doc => {
          const userData = doc.data();
          const earnings = userData.totalEarnings || 0;
          const rank = (userData.rank || 'Bronze').toLowerCase();
          const gender = userData.gender || '';
          const isNobleRank = rank === 'crowned' || rank === 'clowned' || rank === 'royal';

          let title = 'Member';
          let isNoble = false;

          if (earnings >= 100000) {
            if (gender === 'female') {
              title = isNobleRank ? 'Noble Queen' : 'Non-Noble Queen';
            } else {
              title = isNobleRank ? 'Noble King' : 'Non-Noble King';
            }
            isNoble = isNobleRank;
          } else if (earnings >= 50000) {
            if (gender === 'female') {
              title = isNobleRank ? 'Crowned Princess' : 'Non-Crowned Princess';
            } else {
              title = isNobleRank ? 'Crowned Prince' : 'Non-Crowned Prince';
            }
            isNoble = isNobleRank;
          }

          return {
            uid: userData.uid || doc.id,
            name: userData.name || 'Anonymous',
            handle: userData.handle || `@${(userData.uid || doc.id).substring(0, 5)}`,
            avatar: userData.avatar,
            gender: gender as any,
            rank: userData.rank || 'Bronze',
            totalEarnings: earnings,
            nobleTitle: title,
            isNoble
          };
        });

        setNobles(nobleUsers);
      } catch (error) {
        console.error('Error fetching Supreme Nobles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoblesData();
  }, []);

  const filteredNobles = nobles.filter(noble => {
    const matchesSearch = 
      noble.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      noble.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noble.nobleTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'noble' && noble.isNoble) || 
      (filterType === 'non-noble' && !noble.isNoble);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#1a000e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a0020] via-[#0f0007] to-[#050002] text-white p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Background Decorative Elemets */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-pink-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-pink-500/10 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20 shadow-lg shadow-[var(--color-supreme-gold)]/5">
                <Crown className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tighter text-white">
                Supreme <span className="text-[var(--color-supreme-gold)]">Nobles</span>
              </h1>
            </div>
            <p className="text-gray-500 text-lg max-w-2xl font-medium leading-relaxed">
              Celebrating the elite hierarchy of Supreme. Based on excessive earnings, 
              unwavering engagement, and noble platform status.
            </p>
            
            {/* View Switcher */}
            <div className="flex gap-4 pt-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              <button 
                onClick={() => setActiveView('leaderboard')}
                className={clsx(
                  "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap",
                  activeView === 'leaderboard' 
                    ? "bg-white text-black shadow-xl" 
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
                )}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                Hall of Nobles
              </button>
              <button 
                onClick={() => setActiveView('spin')}
                className={clsx(
                  "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group whitespace-nowrap",
                  activeView === 'spin' 
                    ? "bg-[var(--color-supreme-gold)] text-black shadow-[0_0_30px_rgba(184,134,11,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
                )}
              >
                <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 anim-bounce-slow" />
                Noble Spin
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">HOT</span>
              </button>
              <button 
                onClick={() => setActiveView('roller')}
                className={clsx(
                  "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group whitespace-nowrap",
                  activeView === 'roller' 
                    ? "bg-pink-600 text-white shadow-[0_0_30px_rgba(236,72,153,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
                )}
              >
                <Coins className="w-4 h-4 md:w-5 md:h-5 anim-bounce-slow" />
                Supreme Roller
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">NEW</span>
              </button>
              <button 
                onClick={() => setActiveView('box')}
                className={clsx(
                  "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group whitespace-nowrap",
                  activeView === 'box' 
                    ? "bg-fuchsia-600 text-white shadow-[0_0_30px_rgba(217,70,239,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
                )}
              >
                <Gift className="w-4 h-4 md:w-5 md:h-5 anim-bounce-slow" />
                Supreme Box
                <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">POWERFUL</span>
              </button>
              <button 
                onClick={() => setActiveView('treasure')}
                className={clsx(
                  "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 relative overflow-hidden group whitespace-nowrap",
                  activeView === 'treasure' 
                    ? "bg-amber-600 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white border border-white/10"
                )}
              >
                <Trophy className="w-4 h-4 md:w-5 md:h-5 anim-bounce-slow" />
                Noble Treasure
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse shadow-lg">ROYAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-12">
          {activeView === 'spin' ? (
            <NobleSpin />
          ) : activeView === 'roller' ? (
            <NobleRoller />
          ) : activeView === 'box' ? (
            <SupremeMysteriousBox />
          ) : activeView === 'treasure' ? (
            <NobleTreasure />
          ) : (
            <>
              {/* Filter Area (Original) */}
              <div className="flex flex-col md:flex-row items-center gap-4 justify-end">
                <div className="relative group w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-supreme-gold)] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search Nobles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]/50 transition-all w-full md:w-64 lg:w-80"
                  />
                </div>
                
                <div className="flex flex-wrap p-1 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto justify-center">
                  {(['all', 'noble', 'non-noble'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={clsx(
                        "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                        filterType === type ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-500 hover:text-white"
                      )}
                    >
                      {type === 'all' ? 'Everyone' : type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-[var(--color-supreme-gold)]/20 border-t-[var(--color-supreme-gold)] rounded-full animate-spin" />
                    <Crown className="absolute inset-0 m-auto w-8 h-8 text-[var(--color-supreme-gold)] animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Calculating Royal Lineage...</p>
                </div>
              ) : filteredNobles.length === 0 ? (
                <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-white/5">
                  <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Nobles Found</h3>
                  <p className="text-gray-500">The royal records are currently empty for this criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNobles.map((noble, index) => (
                    <motion.div
                      key={noble.uid || `noble-card-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Visual Flair */}
                      <div className={clsx(
                        "absolute inset-0 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none",
                        noble.isNoble ? "bg-[var(--color-supreme-gold)]" : "bg-blue-500"
                      )} />

                      <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 overflow-hidden hover:border-[var(--color-supreme-gold)]/40 hover:translate-y-[-8px] transition-all duration-500 shadow-2xl">
                        {/* Title Badge */}
                        <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                          <div className={clsx(
                            "px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl flex items-center gap-2",
                            noble.isNoble 
                              ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)]/30 text-[var(--color-supreme-gold)]" 
                              : "bg-white/5 border-white/10 text-gray-400"
                          )}>
                            {noble.isNoble ? <Crown className="w-3 h-3 md:w-4 md:h-4" /> : <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />}
                            {noble.nobleTitle}
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Status</p>
                            <span className={clsx("text-[9px] md:text-[10px] font-bold", noble.isNoble ? "text-emerald-500" : "text-blue-400")}>
                              {noble.isNoble ? 'ELITE NOBLE' : 'LEGACY CLASS'}
                            </span>
                          </div>
                        </div>

                        {/* User Profile Info */}
                        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 relative z-10">
                          <div className="relative">
                            <div className={clsx(
                              "p-1 rounded-[1.5rem] md:rounded-[2rem] transition-transform duration-500 group-hover:scale-110",
                              noble.isNoble ? "bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-xl shadow-amber-500/20" : "bg-white/10"
                            )}>
                              <img 
                                src={noble.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(noble.name)}&background=random`} 
                                alt={noble.name}
                                className="w-16 h-16 md:w-24 md:h-24 rounded-[1.3rem] md:rounded-[1.8rem] border-4 border-[#111] object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {noble.isNoble && (
                              <div className="absolute -right-2 -bottom-2 bg-[var(--color-supreme-gold)] text-black p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-[#111]">
                                <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl md:text-2xl font-display font-black text-white group-hover:text-[var(--color-supreme-gold)] transition-colors truncate">
                              {noble.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium truncate">{noble.handle}</p>
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                              <Star className="w-3 h-3 text-[var(--color-supreme-gold)]" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{noble.rank}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group-hover:bg-white/[0.08] transition-all">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Accumulated Yield</p>
                            <p className="text-2xl font-display font-black text-white">
                              ${noble.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group-hover:bg-white/[0.08] transition-all">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Gender Class</p>
                            <p className="text-base font-bold text-gray-300 capitalize">
                              {noble.gender || 'Not Specified'}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/profile?uid=${noble.uid}`)}
                          className="w-full py-4 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-[var(--color-supreme-gold)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                          View Royal Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Decorative Elements */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="py-20 text-center border-t border-white/5 space-y-6">
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Verified Supreme Aristocracy Ledger</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Rankings are updated in real-time based on transaction volume and verified subscription levels. 
            Nobles who fail to maintain their tier may be demoted to legacy status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupremeNobles;
