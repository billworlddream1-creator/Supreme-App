import React, { useState, useMemo } from 'react';
import { 
  Award, TrendingUp, Calendar, User, Search, 
  ChevronRight, BarChart3, Star, Medal, Trophy,
  ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { useMonthlyAwards, AwardWinner } from '../context/MonthlyAwardsContext';
import { useAdmin } from '../context/AdminContext';

export default function AdminHallOfFame() {
  const { winnersHistory } = useMonthlyAwards();
  const { siteUsers } = useAdmin();
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'leaderboard'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');

  // Filter winners by type
  const filteredWinners = useMemo(() => {
    return winnersHistory.filter(w => {
      const matchesType = activeTab === 'leaderboard' ? true : w.awardType === activeTab;
      const matchesSearch = w.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           w.userId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [winnersHistory, activeTab, searchQuery]);

  // Group winners by period for monthly/yearly views
  const groupedWinners = useMemo(() => {
    const groups: Record<string, AwardWinner[]> = {};
    filteredWinners.forEach(w => {
      if (!groups[w.period]) groups[w.period] = [];
      groups[w.period].push(w);
    });
    // Sort groups by date (descending)
    return Object.entries(groups).sort((a, b) => {
      return new Date(b[1][0].claimedAt).getTime() - new Date(a[1][0].claimedAt).getTime();
    });
  }, [filteredWinners]);

  // Overall Leaderboard (Top Performers across all time)
  const leaderboard = useMemo(() => {
    const userStats: Record<string, { 
      userId: string; 
      userName: string; 
      totalScore: number; 
      awardCount: number;
      highestRank: number;
      lastAward: string;
    }> = {};

    winnersHistory.forEach(w => {
      if (!userStats[w.userId]) {
        userStats[w.userId] = {
          userId: w.userId,
          userName: w.userName,
          totalScore: 0,
          awardCount: 0,
          highestRank: 10,
          lastAward: w.period
        };
      }
      userStats[w.userId].totalScore += w.score;
      userStats[w.userId].awardCount += 1;
      userStats[w.userId].highestRank = Math.min(userStats[w.userId].highestRank, w.rank);
    });

    return Object.values(userStats).sort((a, b) => b.totalScore - a.totalScore);
  }, [winnersHistory]);

  // Selected User Performance History
  const userPerformance = useMemo(() => {
    if (!selectedUser) return null;
    return winnersHistory
      .filter(w => w.userId === selectedUser)
      .sort((a, b) => new Date(a.claimedAt).getTime() - new Date(b.claimedAt).getTime());
  }, [selectedUser, winnersHistory]);

  const selectedUserData = useMemo(() => {
    if (!selectedUser) return null;
    return siteUsers.find(u => u.id === selectedUser) || { name: 'Unknown User', email: 'N/A' };
  }, [selectedUser, siteUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <Trophy className="w-7 h-7" />
            Hall of Fame Analysis
          </h2>
          <p className="text-red-200/60">Track and analyze award winners' historical performance.</p>
        </div>

        <div className="flex bg-red-950/50 p-1 rounded-xl border border-amber-500/20">
          <button
            onClick={() => { setActiveTab('monthly'); setSelectedUser(null); }}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'monthly' ? "bg-amber-500 text-red-950" : "text-amber-500/60 hover:text-amber-500"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => { setActiveTab('yearly'); setSelectedUser(null); }}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'yearly' ? "bg-amber-500 text-red-950" : "text-amber-500/60 hover:text-amber-500"
            )}
          >
            Yearly
          </button>
          <button
            onClick={() => { setActiveTab('leaderboard'); setSelectedUser(null); }}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'leaderboard' ? "bg-amber-500 text-red-950" : "text-amber-500/60 hover:text-amber-500"
            )}
          >
            Leaderboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List & Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50" />
            <input
              type="text"
              placeholder="Search winners by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-red-900/20 border border-amber-500/20 rounded-2xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          {activeTab === 'leaderboard' ? (
            <div className="bg-red-900/20 rounded-3xl border border-amber-500/10 overflow-hidden">
              <div className="p-6 border-b border-red-800/30 flex justify-between items-center">
                <h3 className="font-bold text-amber-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  All-Time Top Performers
                </h3>
                <span className="text-xs text-red-200/40 font-bold uppercase tracking-widest">Ranked by Total Score</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest border-b border-red-800/30">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Winner</th>
                      <th className="px-6 py-4">Awards</th>
                      <th className="px-6 py-4">Best Rank</th>
                      <th className="px-6 py-4 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-800/10">
                    {leaderboard.map((entry, i) => (
                      <tr 
                        key={`${entry.userId}-${i}`} 
                        onClick={() => setSelectedUser(entry.userId)}
                        className={clsx(
                          "hover:bg-red-900/40 transition-colors cursor-pointer group",
                          selectedUser === entry.userId && "bg-amber-500/10"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                            i === 0 ? "bg-amber-500 text-red-950" : 
                            i === 1 ? "bg-gray-300 text-gray-800" :
                            i === 2 ? "bg-amber-700 text-amber-100" : "bg-red-950/50 text-amber-500/50"
                          )}>
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold border border-amber-500/20">
                              {entry.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-amber-100 group-hover:text-amber-500 transition-colors">{entry.userName}</p>
                              <p className="text-[10px] text-red-200/40 font-mono">{entry.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Medal className="w-4 h-4" />
                            {entry.awardCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-red-200/80 font-bold">#{entry.highestRank}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-green-400">{entry.totalScore.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-red-200/30">
                          No performance data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedWinners.map(([period, winners]) => (
                <div key={period} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/20"></div>
                    <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {period}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/20"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {winners.sort((a, b) => a.rank - b.rank).map((winner) => (
                      <motion.div
                        key={winner.awardId}
                        layoutId={winner.awardId}
                        onClick={() => setSelectedUser(winner.userId)}
                        className={clsx(
                          "p-4 rounded-2xl border transition-all cursor-pointer group",
                          selectedUser === winner.userId 
                            ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5" 
                            : "bg-red-900/20 border-amber-500/10 hover:border-amber-500/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={clsx(
                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            winner.rank === 1 ? "bg-amber-500 text-red-950" : "bg-red-950/50 text-amber-500"
                          )}>
                            Rank #{winner.rank}
                          </div>
                          <div className="text-xs font-bold text-green-400">
                            Score: {winner.score.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xl border border-amber-500/20">
                            {winner.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-amber-100 group-hover:text-amber-500 transition-colors">{winner.userName}</p>
                            <p className="text-[10px] text-red-200/40 font-mono">{winner.userId}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-amber-500/30 ml-auto group-hover:text-amber-500 transition-all" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              {groupedWinners.length === 0 && (
                <div className="py-20 text-center text-red-200/30 border-2 border-dashed border-red-800/30 rounded-3xl">
                  No {activeTab} winners found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: User Detail Performance */}
        <div className="space-y-6">
          <div className="bg-red-900/30 rounded-3xl border border-amber-500/20 p-6 sticky top-6">
            <h3 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Performance Details
            </h3>

            {selectedUser ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-red-950/50 rounded-2xl border border-amber-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 text-2xl font-bold border border-amber-500/30 shadow-inner">
                    {selectedUserData?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-amber-100">{selectedUserData?.name}</h4>
                    <p className="text-sm text-red-200/60">{selectedUserData?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-bold border border-amber-500/20">
                        ID: {selectedUser.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-red-950/30 rounded-xl border border-amber-500/5">
                    <p className="text-[10px] text-amber-500/50 font-bold uppercase mb-1">Total Awards</p>
                    <p className="text-2xl font-bold text-white">{userPerformance?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-red-950/30 rounded-xl border border-amber-500/5">
                    <p className="text-[10px] text-amber-500/50 font-bold uppercase mb-1">Avg. Rank</p>
                    <p className="text-2xl font-bold text-white">
                      {userPerformance?.length 
                        ? (userPerformance.reduce((acc, w) => acc + w.rank, 0) / userPerformance.length).toFixed(1)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-amber-500/50 uppercase tracking-widest flex items-center justify-between">
                    Historical Progression
                    <span className="text-[10px] lowercase font-normal italic">Least to Last</span>
                  </h5>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/20">
                    {userPerformance?.map((w, i) => {
                      const prevScore = i > 0 ? userPerformance[i-1].score : w.score;
                      const trend = w.score >= prevScore ? 'up' : 'down';
                      
                      return (
                        <div key={w.awardId} className="relative pl-6 border-l-2 border-amber-500/20 py-2">
                          <div className="absolute left-[-9px] top-4 w-4 h-4 rounded-full bg-red-950 border-2 border-amber-500 shadow-sm shadow-amber-500/50"></div>
                          <div className="bg-red-950/40 p-3 rounded-xl border border-amber-500/10">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-amber-100">{w.period}</span>
                              <span className={clsx(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                w.rank === 1 ? "bg-amber-500 text-red-950" : "bg-red-900 text-amber-500"
                              )}>
                                Rank #{w.rank}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-green-400">{w.score.toLocaleString()}</p>
                              <div className="flex items-center gap-1">
                                {trend === 'up' ? (
                                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                                )}
                                <span className={clsx(
                                  "text-[10px] font-bold",
                                  trend === 'up' ? "text-green-400" : "text-red-400"
                                )}>
                                  {i === 0 ? 'Initial' : `${Math.abs(((w.score - prevScore) / prevScore) * 100).toFixed(1)}%`}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-1">
                              <div className="text-[8px] text-red-200/40">F: {w.stats.friends}</div>
                              <div className="text-[8px] text-red-200/40">L: {w.stats.likes}</div>
                              <div className="text-[8px] text-red-200/40">V: {w.stats.videos}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-3 bg-red-950/50 border border-amber-500/20 text-amber-500 font-bold rounded-xl hover:bg-red-950 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500/20">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-amber-100/60 font-bold">No User Selected</p>
                  <p className="text-xs text-red-200/40">Select a winner from the list to view their detailed performance analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
