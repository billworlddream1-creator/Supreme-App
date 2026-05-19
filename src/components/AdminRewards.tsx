import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Gift, 
  Users, 
  Mail, 
  Phone, 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Search, 
  Filter, 
  Send, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  DollarSign,
  RefreshCw,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc, Timestamp, limit } from 'firebase/firestore';
import { toast } from 'sonner';

interface SupremeUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rank: string;
  balance: number;
  engagementScore?: number;
  lastActive?: any;
}

const RANKS = ['Silver', 'Gold', 'Diamond', 'Crowned', 'Official'];

export default function AdminRewards() {
  const [users, setUsers] = useState<SupremeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('All');
  const [rewardAmount, setRewardAmount] = useState<string>('10');
  const [rewardMessage, setRewardMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchSupremeUsers();
    fetchRewardHistory();
  }, []);

  const fetchRewardHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('category', '==', 'Reward'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => b.date?.toMillis() - a.date?.toMillis());
      setRewardHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch reward history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchSupremeUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('rank', 'in', RANKS)
      );
      const snapshot = await getDocs(q);
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupremeUser[];
      setUsers(userData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRank = selectedRank === 'All' || user.rank === selectedRank;
    return matchesSearch && matchesRank;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleSendRewards = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      toast.error('Please enter a valid reward amount');
      return;
    }

    setIsSending(true);
    try {
      const amount = parseFloat(rewardAmount);
      const promises = selectedUsers.map(async (userId) => {
        const userRef = doc(db, 'users', userId);
        const user = users.find(u => u.id === userId);
        
        // Update balance
        await updateDoc(userRef, {
          balance: increment(amount)
        });

        // Add transaction record
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'receive',
          amount,
          date: Timestamp.now(),
          description: rewardMessage || `Supreme Rank Reward for ${user?.rank} status`,
          category: 'Reward',
          status: 'completed'
        });

        // Add notification
        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Supreme Reward Received! 🎁',
          message: `Congratulations! You've received a reward of $${amount} for your engagement as a ${user?.rank} member. ${rewardMessage}`,
          time: 'Just now',
          read: false,
          type: 'reward'
        });
      });

      await Promise.all(promises);
      toast.success(`Successfully sent rewards to ${selectedUsers.length} users!`);
      clearSelection();
      setRewardMessage('');
      fetchSupremeUsers();
      fetchRewardHistory();
    } catch (error) {
      toast.error('Failed to send rewards');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-display font-bold text-white tracking-tight">Supreme <span className="text-[var(--color-supreme-gold)]">Rewards</span></h3>
          <p className="text-gray-400 mt-1">Reward high-ranking members for their engagement and activities.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Eligible</p>
            <p className="text-xl font-bold text-white">{users.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected</p>
            <p className="text-xl font-bold text-[var(--color-supreme-gold)]">{selectedUsers.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
            <h4 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Reward Configuration
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Reward Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Custom Message (Optional)</label>
                <textarea 
                  value={rewardMessage}
                  onChange={(e) => setRewardMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] h-32 resize-none"
                  placeholder="Add a personalized note to the reward..."
                />
              </div>

              <button 
                onClick={handleSendRewards}
                disabled={isSending || selectedUsers.length === 0}
                className={clsx(
                  "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                  isSending || selectedUsers.length === 0
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-[var(--color-supreme-gold)] text-black hover:bg-yellow-500 shadow-[var(--color-supreme-gold)]/20"
                )}
              >
                {isSending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSending ? 'Processing...' : `Send Rewards to ${selectedUsers.length} Users`}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Engagement Rules
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Rewards are added directly to user wallets.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Users receive instant push notifications.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                All rewards are logged in transaction history.
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                Verify user engagement score before sending large amounts.
              </li>
            </ul>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
              >
                <option value="All" className="bg-gray-900">All Ranks</option>
                {RANKS.map(rank => (
                  <option key={rank} value={rank} className="bg-gray-900">{rank}</option>
                ))}
              </select>
              <button 
                onClick={selectAllFiltered}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 transition-all"
              >
                Select All
              </button>
              <button 
                onClick={clearSelection}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/10 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balance</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <RefreshCw className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Supreme Members...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <Users className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No users found matching your criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user.id}
                        className={clsx(
                          "hover:bg-white/5 transition-colors cursor-pointer group",
                          selectedUsers.includes(user.id) && "bg-[var(--color-supreme-gold)]/5"
                        )}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <td className="px-6 py-4">
                          <div className={clsx(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            selectedUsers.includes(user.id) 
                              ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)]" 
                              : "border-white/10 group-hover:border-white/30"
                          )}>
                            {selectedUsers.includes(user.id) && <CheckCircle className="w-4 h-4 text-black" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-white text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{user.name}</p>
                              <p className="text-[10px] text-gray-500 font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            user.rank === 'Official' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            user.rank === 'Crowned' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            user.rank === 'Diamond' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                            user.rank === 'Gold' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            user.rank === 'Silver' ? 'bg-gray-400/10 text-gray-400 border-gray-400/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          )}>
                            {user.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">${user.balance.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <a href={`mailto:${user.email}`} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                              <Mail className="w-4 h-4" />
                            </a>
                            {user.phone && (
                              <a href={`tel:${user.phone}`} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
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

      {/* Reward History */}
      <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" /> Recent Reward History
          </h4>
          <button 
            onClick={fetchRewardHistory}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <RefreshCw className={clsx("w-5 h-5", loadingHistory && "animate-spin")} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recipient ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingHistory ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Fetching history...</p>
                  </td>
                </tr>
              ) : rewardHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic text-sm">
                    No recent reward transactions found.
                  </td>
                </tr>
              ) : (
                rewardHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-4 text-xs text-gray-400">
                      {tx.date?.toDate()?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-8 py-4 text-xs font-mono text-gray-500">
                      {tx.userId}
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm font-bold text-emerald-400">+${tx.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-300 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
