import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Activity, MessageSquare, Heart, Share2, BarChart3, Award, Star, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t10Service, WeeklyEngagement, getWeekId } from '../services/t10Service';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Engager extends WeeklyEngagement {
  name: string;
  handle: string;
  avatar: string;
  rank: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
}

export default function T10Engagers() {
  const { profile } = useAuth();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [engagers, setEngagers] = useState<Engager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const weekId = getWeekId();
    
    const q = query(
      collection(db, 'weekly_engagement'),
      where('weekId', '==', weekId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const engagersData: Engager[] = [];
      
      const sortedDocs = [...snapshot.docs]
        .sort((a, b) => (b.data().score || 0) - (a.data().score || 0))
        .slice(0, 10);
      
      for (let i = 0; i < sortedDocs.length; i++) {
        const data = sortedDocs[i].data() as WeeklyEngagement;
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;

        engagersData.push({
          ...data,
          rank: i + 1,
          name: userData?.name || 'Unknown User',
          handle: userData?.handle || '@unknown',
          avatar: userData?.avatar || `https://picsum.photos/seed/${data.userId}/150/150`,
          trend: 'neutral', // Trends would require comparing with previous week
          trendValue: 0
        });
      }
      
      setEngagers(engagersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching engagers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [timeframe]);

  const handleDistributeRewards = async () => {
    setIsDistributing(true);
    try {
      const result = await t10Service.distributeWeeklyRewards();
      if (result.success) {
        toast.success(`Successfully distributed rewards to ${result.winnersCount} winners!`);
      } else {
        toast.info(result.message || 'No rewards to distribute at this time.');
      }
    } catch (error) {
      toast.error('Failed to distribute rewards.');
    } finally {
      setIsDistributing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-[var(--color-supreme-gold)] animate-spin" />
        <p className="text-gray-500 font-medium">Analyzing engagement data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl">
              <Trophy className="w-8 h-8 text-[var(--color-supreme-gold)]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">T10 Engagers</h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Celebrating the top 10 most active users across the platform. Top 10 members receive a $1.00 weekly reward!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {(profile?.role === 'admin' || profile?.role === 'mini-admin') && (
            <button
              onClick={handleDistributeRewards}
              disabled={isDistributing}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isDistributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Distribute Rewards
            </button>
          )}

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'weekly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {engagers.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center border border-dashed border-gray-200">
          <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Engagement Data Yet</h3>
          <p className="text-gray-500">Be the first to engage and top the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
            {[engagers[1], engagers[0], engagers[2]].filter(Boolean).map((user, idx) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;
              
              return (
                <motion.div 
                  key={user.userId}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center ${
                    isFirst ? 'md:-mt-12 md:mb-12 border-[var(--color-supreme-gold)]/30 ring-4 ring-[var(--color-supreme-gold)]/10' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    isFirst ? 'bg-yellow-400' : isSecond ? 'bg-gray-300' : 'bg-amber-600'
                  }`}>
                    #{user.rank}
                  </div>

                  <div className="relative mb-4">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className={`rounded-full object-cover border-4 border-white shadow-md ${
                        isFirst ? 'w-32 h-32' : 'w-24 h-24'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {isFirst && (
                      <div className="absolute -bottom-2 -right-2 bg-[var(--color-supreme-gold)] text-white p-2 rounded-full shadow-lg">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{user.handle}</p>

                  <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="text-sm text-gray-500 mb-1">Engagement Score</div>
                    <div className={`text-2xl font-black ${
                      isFirst ? 'text-[var(--color-supreme-gold)]' : 'text-gray-900'
                    }`}>
                      {user.score.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium">
                    {user.trend === 'up' ? (
                      <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{user.trendValue}%
                      </span>
                    ) : user.trend === 'down' ? (
                      <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        -{user.trendValue}%
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <Activity className="w-4 h-4 mr-1" />
                        0%
                      </span>
                    )}
                    <span className="text-gray-400">vs last week</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ranks 4-10 List */}
          {engagers.length > 3 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                  Activity Analysis (Ranks 4-10)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-50">
                {engagers.slice(3).map((user, idx) => (
                  <motion.div 
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col lg:flex-row items-center gap-6"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 w-full lg:w-1/3">
                      <div className="w-8 text-center font-bold text-gray-400 text-lg">
                        #{user.rank}
                      </div>
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500 text-sm">{user.handle}</p>
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="flex-1 w-full grid grid-cols-4 gap-4">
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-100">
                        <Activity className="w-4 h-4 text-blue-500 mb-1" />
                        <span className="text-xs text-gray-500">Posts</span>
                        <span className="font-bold text-gray-900">{user.posts}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-100">
                        <MessageSquare className="w-4 h-4 text-green-500 mb-1" />
                        <span className="text-xs text-gray-500">Comments</span>
                        <span className="font-bold text-gray-900">{user.comments}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-100">
                        <Heart className="w-4 h-4 text-red-500 mb-1" />
                        <span className="text-xs text-gray-500">Likes</span>
                        <span className="font-bold text-gray-900">{user.likes}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-100">
                        <Share2 className="w-4 h-4 text-purple-500 mb-1" />
                        <span className="text-xs text-gray-500">Shares</span>
                        <span className="font-bold text-gray-900">{user.shares}</span>
                      </div>
                    </div>

                    {/* Total Score & Trend */}
                    <div className="w-full lg:w-48 flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total Score</div>
                        <div className="text-xl font-black text-gray-900">{user.score.toLocaleString()}</div>
                      </div>
                      <div className="w-16 flex justify-end">
                        {user.trend === 'up' ? (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {user.trendValue}%
                          </span>
                        ) : user.trend === 'down' ? (
                          <span className="flex items-center text-red-600 text-sm font-medium">
                            <TrendingDown className="w-4 h-4 mr-1" />
                            {user.trendValue}%
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-400 text-sm font-medium">
                            <Activity className="w-4 h-4 mr-1" />
                            0%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
