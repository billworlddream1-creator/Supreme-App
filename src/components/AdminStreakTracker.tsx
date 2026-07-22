import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Calendar,
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  Clock,
  Flame,
  Award,
  ChevronDown,
  Sparkles,
  Edit2,
  Trash2,
  Save,
  X,
  ShieldAlert,
  CreditCard,
  Lock,
  ShieldCheck,
  Laptop,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, limit, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useSubscription } from '../context/SubscriptionContext';

interface StreakUser {
  id: string;
  name: string;
  email: string;
  dailyStreak?: number;
  lastDailyBonusClaimed?: string;
  rank?: string;
  lastLogin?: any;
  totalEarnings?: number;
  supremeBalance?: number;
}

interface StreakLog {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  amount: number;
  description: string;
  category: string;
  date: any;
}

export default function AdminStreakTracker() {
  const { user } = useAuth();
  const { events: securityEvents } = useSecurity();
  const { allSubscriptions } = useSubscription();

  const [users, setUsers] = useState<StreakUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [streakFilter, setStreakFilter] = useState<'all' | 'active' | 'high'>('all');
  
  const [streakLogs, setStreakLogs] = useState<StreakLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editStreakValue, setEditStreakValue] = useState<number>(0);
  const [editLastClaimedDate, setEditLastClaimedDate] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Stats calculation
  const totalActiveStreaks = users.filter(u => (u.dailyStreak || 0) > 0).length;
  const highestStreak = users.reduce((max, u) => Math.max(max, u.dailyStreak || 0), 0);
  const topStreakUser = users.find(u => (u.dailyStreak || 0) === highestStreak && highestStreak > 0);

  useEffect(() => {
    fetchUsers();
    fetchStreakLogs();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const fetchedUsers: StreakUser[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id,
          name: data.name || 'Anonymous',
          email: data.email || 'No email',
          dailyStreak: data.dailyStreak || 0,
          lastDailyBonusClaimed: data.lastDailyBonusClaimed || '',
          rank: data.rank || 'Bronze',
          lastLogin: data.lastLogin || null,
          totalEarnings: data.totalEarnings || 0,
          supremeBalance: data.supremeBalance || 0
        });
      });
      // Sort by dailyStreak descending by default
      fetchedUsers.sort((a, b) => (b.dailyStreak || 0) - (a.dailyStreak || 0));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users for streak tracking:', error);
      toast.error('Could not fetch user list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStreakLogs = async () => {
    setLoadingLogs(true);
    try {
      // Fetch recent daily bonus transactions
      const q = query(
        collection(db, 'transactions'),
        where('category', '==', 'Daily Bonus'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const logs: StreakLog[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          userName: data.userName || '',
          amount: data.amount || 0,
          description: data.description || '',
          category: data.category || '',
          date: data.date
        });
      });

      // Sort logs descending by date
      logs.sort((a, b) => {
        const timeA = a.date?.toDate?.()?.getTime() || new Date(a.date).getTime() || 0;
        const timeB = b.date?.toDate?.()?.getTime() || new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });

      setStreakLogs(logs);
    } catch (error) {
      console.error('Failed to fetch streak logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleEditClick = (user: StreakUser) => {
    setEditingUserId(user.id);
    setEditStreakValue(user.dailyStreak || 0);
    setEditLastClaimedDate(user.lastDailyBonusClaimed || '');
  };

  const handleSaveEdit = async (userId: string) => {
    setIsSavingEdit(true);
    try {
      const targetUser = users.find(u => u.id === userId);
      const userMail = targetUser ? targetUser.email : 'unknown';
      const prevStreak = targetUser?.dailyStreak || 0;

      await updateDoc(doc(db, 'users', userId), {
        dailyStreak: editStreakValue,
        lastDailyBonusClaimed: editLastClaimedDate || null
      });

      // Log the event to administrative ledger
      await addDoc(collection(db, 'admin_audit_logs'), {
        category: 'streak',
        action: 'User Streak Parameters Updated',
        details: `Admin modified daily streak parameters for user "${userMail}". Daily streak updated from ${prevStreak} to ${editStreakValue}, last claimed date set to: "${editLastClaimedDate || 'never'}".`,
        adminEmail: user?.email || 'admin@gmt.com',
        timestamp: Timestamp.now(),
        severity: 'medium',
        ip: 'Internal',
        resolved: true
      });

      toast.success('User streak parameters successfully updated.');
      setEditingUserId(null);
      // Refresh local user data
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        dailyStreak: editStreakValue,
        lastDailyBonusClaimed: editLastClaimedDate
      } : u));
    } catch (err) {
      console.error('Error updating user streak:', err);
      toast.error('Failed to update streak value.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (streakFilter === 'active') {
      return matchesSearch && (user.dailyStreak || 0) > 0;
    }
    if (streakFilter === 'high') {
      return matchesSearch && (user.dailyStreak || 0) >= 5;
    }
    return matchesSearch;
  });

  // Calculate Subscriptions Breakdown
  const activeSubs = allSubscriptions.filter(s => s.isActive);
  const monthlySubsCount = activeSubs.filter(s => 
    s.planId?.includes('1m') || 
    s.planId?.includes('3m') || 
    s.planId?.includes('6m') || 
    s.planId?.includes('9m')
  ).length;

  const yearlySubsCount = activeSubs.filter(s => 
    s.planId?.includes('12m') || 
    s.planId?.includes('1y') || 
    s.planId?.includes('2y') || 
    s.planId?.includes('5y')
  ).length;

  // Derive top performers
  const topStreakLeader = users[0];
  const topEarner = [...users].sort((a,b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))[0];

  return (
    <div id="admin-streak-tracker" className="space-y-6">
      
      {/* 1. Admin Distinct Streak Window Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-950/40 via-zinc-950 to-neutral-950 border border-amber-500/35 shadow-2xl text-white"
      >
        <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
          <Trophy className="w-24 h-24 text-amber-400 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                  Admin Master Override Active
                </span>
              </div>
              <h3 className="text-xl font-display font-black tracking-tight text-white mt-2 flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-500" />
                Supreme Administrator Streak Override
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                As a Master Administrator, your system status is exempt from the standard 365-day login streak claiming window. All daily coins remain fully mintable for developer testing.
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl shrink-0 text-right">
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Your Admin Streak</p>
              <p className="text-xl font-black text-white font-mono">{user?.dailyStreak || 0} Days</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Limit Restrictions</span>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">SUSPENDED</p>
            </div>
            <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Max Claim Potential</span>
              <p className="text-xs font-bold text-white font-mono mt-0.5">UNLIMITED</p>
            </div>
            <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Streak Exemption</span>
              <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">ACTIVE</p>
            </div>
            <div className="p-3 bg-black/40 border border-white/5 rounded-2xl">
              <span className="text-[9px] text-neutral-500 uppercase font-black">Audit Ledger Logs</span>
              <p className="text-xs font-bold text-neutral-300 font-mono mt-0.5">SYNCHRONIZED</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Admin Operational Intelligence Hub: 5 Brief Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Brief Info of Recent Sign Ups / Logins */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-blue-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Recent Activity
              </h4>
              <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">5 Latest</span>
            </div>
            <div className="space-y-2">
              {[...users]
                .filter(u => u.lastLogin)
                .slice(0, 3)
                .map(u => {
                  let lastActive = 'Recently';
                  if (u.lastLogin) {
                    try {
                      const dt = u.lastLogin.toDate ? u.lastLogin.toDate() : new Date(u.lastLogin);
                      lastActive = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    } catch (e) {}
                  }
                  return (
                    <div key={u.id} className="text-[10px] pl-2 border-l border-blue-500/20">
                      <p className="font-extrabold text-white truncate max-w-[130px]">{u.name}</p>
                      <p className="text-zinc-500 text-[8px] truncate font-mono">{lastActive}</p>
                    </div>
                  );
                })}
              {users.filter(u => u.lastLogin).length === 0 && (
                <p className="text-[10px] text-zinc-500 italic">No login records tracked.</p>
              )}
            </div>
          </div>
          <div className="text-[9px] text-blue-400/80 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-2">
            Users Log & Registrations
          </div>
        </motion.div>

        {/* Card 2: Brief of Recent Subscriptions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-emerald-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Recent Subs
              </h4>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">Live</span>
            </div>
            <div className="space-y-2">
              {activeSubs.slice(0, 3).map((sub, i) => {
                const subUser = users.find(u => u.id === sub.subscriberId);
                const planName = sub.type ? sub.type.toUpperCase() + ' PLAN' : 'PREMIUM';
                return (
                  <div key={sub.id || i} className="text-[10px] pl-2 border-l border-emerald-500/20">
                    <div className="flex justify-between items-center gap-1">
                      <p className="font-extrabold text-white truncate max-w-[80px]">{subUser ? subUser.name : 'Subscribed User'}</p>
                      <span className="font-mono text-emerald-400 text-[8px] font-bold">ACTIVE</span>
                    </div>
                    <p className="text-zinc-500 text-[8px] truncate font-mono">{planName}</p>
                  </div>
                );
              })}
              {activeSubs.length === 0 && (
                <p className="text-[10px] text-zinc-500 italic">No active subscriptions.</p>
              )}
            </div>
          </div>
          <div className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-2">
            Premium Ledger Feed
          </div>
        </motion.div>

        {/* Card 3: Brief of Security Breaches of the App (Protected and Hidden from normal users) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-red-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                Security Breaches
              </h4>
              <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">Threats</span>
            </div>
            <div className="space-y-2">
              {securityEvents && securityEvents.slice(0, 3).map((ev) => {
                const dt = new Date(ev.timestamp);
                const formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
                return (
                  <div key={ev.id} className="text-[10px] pl-2 border-l border-red-500/30">
                    <div className="flex justify-between items-center gap-1">
                      <p className="font-extrabold text-red-400 truncate max-w-[90px]">{ev.manner}</p>
                      <span className="text-[8px] bg-red-500/20 text-red-400 px-1 font-mono font-bold rounded">BLOCKED</span>
                    </div>
                    <p className="text-zinc-500 text-[8px] font-mono truncate">IP: {ev.ip}</p>
                  </div>
                );
              })}
              {(!securityEvents || securityEvents.length === 0) && (
                <p className="text-[10px] text-zinc-500 italic">No security alerts detected.</p>
              )}
            </div>
          </div>
          <div className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-2">
            Secure Shield Active
          </div>
        </motion.div>

        {/* Card 4: Brief of Yearly / Monthly Subscriptions Tracking */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-purple-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Subs Tracking
              </h4>
              <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold">Volume</span>
            </div>
            <div className="space-y-2.5 text-[10px] font-mono">
              <div className="flex justify-between items-center py-0.5 border-b border-white/[0.02]">
                <span className="text-zinc-500 text-[9px]">Monthly Plans</span>
                <span className="text-white font-extrabold">{monthlySubsCount} Active</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/[0.02]">
                <span className="text-zinc-500 text-[9px]">Yearly Plans</span>
                <span className="text-white font-extrabold">{yearlySubsCount} Active</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-500 text-[9px]">Total Tracking</span>
                <span className="text-purple-400 font-extrabold">{activeSubs.length} Plans</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-purple-400/80 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-2">
            Subscription Plan Stats
          </div>
        </motion.div>

        {/* Card 5: Brief of Best Performer on the Site */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-amber-500/30 transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Best Performers
              </h4>
              <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">Top</span>
            </div>
            <div className="space-y-2 text-[10px]">
              {topStreakLeader && (
                <div className="pl-2 border-l border-amber-500/25">
                  <span className="text-[8px] text-zinc-500 uppercase font-black">Streak Leader</span>
                  <p className="font-extrabold text-white truncate">{topStreakLeader.name}</p>
                  <p className="text-amber-400 font-mono text-[9px] font-bold">{topStreakLeader.dailyStreak || 0} Days</p>
                </div>
              )}
              {topEarner && (
                <div className="pl-2 border-l border-amber-500/25">
                  <span className="text-[8px] text-zinc-500 uppercase font-black">Coin Leader</span>
                  <p className="font-extrabold text-white truncate">{topEarner.name}</p>
                  <p className="text-emerald-400 font-mono text-[9px] font-bold">{topEarner.totalEarnings || 0} SC</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] text-amber-400/80 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-2">
            Site Achievement Record
          </div>
        </motion.div>

      </div>

      {/* 3. Top Stats Cards Grid (Existing Cards with motion wrapper) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400 font-medium">Active Streaks</span>
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
              <Flame className="w-5 h-5 fill-orange-500/20" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalActiveStreaks}</p>
          <p className="text-xs text-zinc-500 mt-1">Users currently on a streak</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400 font-medium">Highest Streak</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{highestStreak} <span className="text-sm text-zinc-400 font-normal">Days</span></p>
          <p className="text-xs text-zinc-500 mt-1">
            {topStreakUser ? `Held by: ${topStreakUser.name}` : 'No active streaks'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400 font-medium">Total Streak Logs</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{streakLogs.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Recent claim receipts cached</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400 font-medium">Avg Streak Score</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {users.length > 0 ? (users.reduce((sum, u) => sum + (u.dailyStreak || 0), 0) / users.length).toFixed(1) : 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Mean streak across all users</p>
        </motion.div>
      </div>

      {/* 4. Main Content Layout with entrance animations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Users & Streaks Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-bold text-white">Users & Streaks Management</h3>
            
            {/* Filter buttons */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1 text-xs">
              <button
                onClick={() => setStreakFilter('all')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  streakFilter === 'all' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                All Users
              </button>
              <button
                onClick={() => setStreakFilter('active')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  streakFilter === 'active' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                Active Only
              </button>
              <button
                onClick={() => setStreakFilter('high')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-medium transition-all",
                  streakFilter === 'high' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                Streak ≥ 5
              </button>
            </div>
          </div>

          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Users List Container */}
          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm text-zinc-400">Loading user database...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 font-medium">No matching users found.</p>
                <p className="text-xs text-zinc-600 mt-1">Try adjusting search parameters or filter views.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold">
                    <th className="pb-3 pl-2">User Details</th>
                    <th className="pb-3 text-center">Current Streak</th>
                    <th className="pb-3">Last Claimed Date</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="text-sm group hover:bg-zinc-800/10 transition-all">
                      {/* Name & email details */}
                      <td className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                            {user.name}
                          </span>
                          <span className="text-xs text-zinc-500">{user.email}</span>
                        </div>
                      </td>

                      {/* Current Streak value */}
                      <td className="py-4 text-center">
                        {editingUserId === user.id ? (
                          <div className="flex items-center justify-center gap-2 max-w-[100px] mx-auto">
                            <input
                              type="number"
                              min="0"
                              value={editStreakValue}
                              onChange={(e) => setEditStreakValue(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center font-mono text-orange-400 font-bold focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold">
                            <Flame className="w-3.5 h-3.5 fill-orange-500/10" />
                            {user.dailyStreak || 0} Days
                          </div>
                        )}
                      </td>

                      {/* Last Claimed Date */}
                      <td className="py-4">
                        {editingUserId === user.id ? (
                          <input
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={editLastClaimedDate}
                            onChange={(e) => setEditLastClaimedDate(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-orange-500"
                          />
                        ) : (
                          <span className="font-mono text-xs text-zinc-400">
                            {user.lastDailyBonusClaimed || 'Never Claimed'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-2">
                        {editingUserId === user.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={isSavingEdit}
                              onClick={() => handleSaveEdit(user.id)}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg transition-all"
                              title="Save Changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isSavingEdit}
                              onClick={() => setEditingUserId(null)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                            title="Edit Streak Values"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Right Column: Recent Claim Log Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-amber-500" />
              Live Activity Stream
            </h3>
            <span className="text-[11px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase">
              Recent Payouts
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loadingLogs ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                <p className="text-xs text-zinc-500">Streaming recent receipts...</p>
              </div>
            ) : streakLogs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-xs">No streak payouts recorded yet.</p>
              </div>
            ) : (
              streakLogs.map((log) => {
                const claimDate = log.date?.toDate?.() || new Date(log.date);
                const timeString = claimDate ? claimDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                const dateString = claimDate ? claimDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

                return (
                  <div 
                    key={log.id} 
                    className="p-3 bg-zinc-950 hover:bg-zinc-800/40 rounded-xl border border-zinc-800/60 flex items-start gap-3 transition-all"
                  >
                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg shrink-0">
                      <Flame className="w-4 h-4 fill-orange-500/10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-zinc-100 truncate">
                          {log.userName || log.userEmail || 'System User'}
                        </p>
                        <span className="font-mono text-emerald-500 font-bold text-xs shrink-0">
                          +{log.amount} SC
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span>{dateString} at {timeString}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
