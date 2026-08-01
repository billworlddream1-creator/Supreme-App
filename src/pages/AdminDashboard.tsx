import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import AdminGreetingControl from '../components/AdminGreetingControl';
import { HashRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Radio,
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar,
  ShieldCheck,
  Crown,
  Gamepad2,
  Settings,
  Play,
  Pause,
  Square,
  Clock,
  MessageSquare,
  Shield,
  Eye,
  Lock as LockIcon,
  Bell,
  Database,
  Cpu,
  Globe,
  Search,
  MoreVertical,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Zap,
  Edit2,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Award,
  Star,
  UserCheck,
  UserPlus,
  Wallet,
  Bitcoin,
  Gift,
  Menu,
  X,
  CreditCard,
  Trophy,
  Send,
  Phone,
  Filter,
  ChevronDown,
  RefreshCw,
  Save,
  Package,
  Key,
  Pickaxe,
  Coins,
  Info,
  Megaphone,
  Briefcase,
  Building2,
  Terminal,
  Wifi,
  Flame,
  ClipboardList
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx } from 'clsx';
import { useAdmin, MiniAdminCategory, PlatformSettings } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useFeatureControl, FeatureId } from '../context/FeatureControlContext';
import { SUPREME_FEATURES, SupremeFeature } from '../constants/featureIds';
import { Timestamp, query, collection, where, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs, addDoc, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import AdminMiningManager from '../components/AdminMiningManager';
import AdminRewards from '../components/AdminRewards';
import AdminWallet from '../components/AdminWallet';
import PromoteTrackingAdmin from '../components/PromoteTrackingAdmin';
import AdminEmail from '../components/AdminEmail';
import AdminNobleTracker from '../components/AdminNobleTracker';
import AdminAppealAnalytics from '../components/AdminAppealAnalytics';
import AdminTreasureTracker from '../components/AdminTreasureTracker';
import ConnectivityMonitor from '../components/ConnectivityMonitor';
import SupremeCMD from '../components/SupremeCMD';
import AdminStreakTracker from '../components/AdminStreakTracker';
import DashboardStats from '../components/DashboardStats';
import AdminSubscriptionManager from '../components/AdminSubscriptionManager';
import AdminAuditLogs from '../components/AdminAuditLogs';
import RecentActivityLog from '../components/RecentActivityLog';
import { logRecentActivity } from '../services/activityLogger';
import StreakAnalysisArea from '../components/StreakAnalysisArea';
import UserGrowthAnalytics from '../components/UserGrowthAnalytics';
import AdminSuperShortsViolations from '../components/AdminSuperShortsViolations';

interface AnalyticsData {
  daily: number[];
  weekly: number[];
  monthly: number[];
  yearly: number[];
  bestSubscribers: {
    id: string;
    name: string;
    totalPaid: number;
    plan: string;
  }[];
}

const DATA = [
  { name: 'Mon', users: 400, revenue: 2400, engagement: 240 },
  { name: 'Tue', users: 300, revenue: 1398, engagement: 221 },
  { name: 'Wed', users: 200, revenue: 9800, engagement: 229 },
  { name: 'Thu', users: 278, revenue: 3908, engagement: 200 },
  { name: 'Fri', users: 189, revenue: 4800, engagement: 218 },
  { name: 'Sat', users: 239, revenue: 3800, engagement: 250 },
  { name: 'Sun', users: 349, revenue: 4300, engagement: 210 },
];

const STATS = [
  { label: 'Total Users', value: '12,458', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Active Sessions', value: '1,284', change: '+5.2%', trend: 'up', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Total Revenue', value: '$45,285', change: '+18.7%', trend: 'up', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Ad Impressions', value: '842K', change: '-2.4%', trend: 'down', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
];

function EarningRatesAdmin() {
  const { settings, updateSettings } = useAdmin();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast.success('Earning rates updated successfully');
    } catch (error) {
      toast.error('Failed to update earning rates');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PlatformSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const rateItems = [
    { label: 'Post Creation', field: 'earningRatePost', icon: MessageSquare, color: 'text-blue-400', desc: 'Amount earned per post created' },
    { label: 'Comment Creation', field: 'earningRateComment', icon: MessageSquare, color: 'text-purple-400', desc: 'Amount earned per comment' },
    { label: 'Referrals', field: 'earningRateReferral', icon: Users, color: 'text-emerald-400', desc: 'Amount earned per successful referral' },
    { label: 'Subscriptions', field: 'earningRateSubscription', icon: Zap, color: 'text-yellow-400', desc: 'Amount earned per subscription activity' },
    { label: 'New Connections', field: 'earningRateConnection', icon: UserPlus, color: 'text-pink-400', desc: 'Amount earned per new connection' },
    { label: 'Wallet Earnings Rate', field: 'walletEarningsRate', icon: Wallet, color: 'text-orange-400', desc: 'Percentage earned on wallet balance' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Earning Rates Configuration</h3>
          <p className="text-gray-400">Configure how much users earn for different activities on the platform</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rateItems.map((item) => (
          <div key={item.field} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 space-y-4 hover:border-[var(--color-supreme-gold)]/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-white/5 ${item.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white">{item.label}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input 
                type="number"
                step="0.01"
                value={localSettings[item.field as keyof PlatformSettings] as number}
                onChange={(e) => handleChange(item.field as keyof PlatformSettings, parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Earning Logic Information</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              These rates determine the amount of Supreme Credits or currency credited to a user's account upon successful completion of the specified activity. 
              Changes take effect immediately for all future activities. Ensure you balance these rates with your platform's economy to maintain sustainability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureControlAdmin() {
  const { siteUsers } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lockReason, setLockReason] = useState('Policy Violation');

  // Derive current user state from siteUsers to ensure real-time synchronization
  const currentUser = selectedUser ? (siteUsers || []).find(u => u.id === selectedUser.id) || selectedUser : null;

  const handleToggleFeature = async (featureId: string, currentStatus: any) => {
    if (!currentUser) return;
    setIsUpdating(true);
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const lockedFeatures = currentUser.lockedFeatures || {};
      
      if (lockedFeatures[featureId] && lockedFeatures[featureId].status === 'locked') {
        // Unlock
        delete lockedFeatures[featureId];
      } else {
        // Lock
        lockedFeatures[featureId] = {
          featureId,
          lockDate: Timestamp.now(),
          reason: lockReason,
          status: 'locked',
          appealProgress: 0,
          masteryLevel: 0,
          violations: (lockedFeatures[featureId]?.violations || 0) + 1
        };
      }

      await updateDoc(userRef, { lockedFeatures });
      await logRecentActivity({
        category: 'feature_access',
        action: lockedFeatures[featureId] ? `Feature Locked: ${featureId}` : `Feature Unlocked: ${featureId}`,
        details: `Administrator modified access status for feature "${featureId}" on user "${currentUser.name || currentUser.email}". Reason: ${lockReason}.`,
        targetUser: `${currentUser.name} (${currentUser.email})`,
        targetUserId: currentUser.id,
        adminEmail: 'billworlddream1@gmail.com',
        severity: lockedFeatures[featureId] ? 'high' : 'low',
        status: lockedFeatures[featureId] ? 'warning' : 'success'
      });
      toast.success(`Feature ${featureId} status updated for ${currentUser.name}`);
    } catch (error) {
      console.error('Error updating feature status:', error);
      toast.error('Failed to update feature status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Supreme Feature Control</h3>
          <p className="text-gray-400">Lock or unlock specific features for individual users based on policy compliance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Selection */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 h-fit lg:sticky lg:top-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {(siteUsers || [])
              .filter(u => (u.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
              .map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                  currentUser?.id === user.id 
                    ? 'bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)]/50 text-[var(--color-supreme-gold)]' 
                    : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center font-bold text-white">
                  {(user.name || 'U')[0] || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-white">{user.name || 'Anonymous'}</p>
                  <p className="text-[10px] opacity-60 truncate text-gray-400">{user.email || 'No Email'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Management */}
        <div className="lg:col-span-2 space-y-6">
          {currentUser ? (
            <>
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-black border-4 border-white/10 shadow-xl">
                    {(currentUser.name || 'U')[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{currentUser.name || 'Anonymous'}</h4>
                    <p className="text-xs text-gray-500">{currentUser.email || 'No Email'}</p>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-500/20">
                         {currentUser.role || 'user'}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Locked Features</p>
                  <p className="text-2xl font-display font-bold text-red-500">
                    {Object.values(currentUser.lockedFeatures || {}).filter((f: any) => f.status === 'locked').length}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <Settings className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                   <h4 className="text-lg font-bold text-white">Manage Access</h4>
                </div>

                <div className="mb-6">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Lock Reason (applied to new locked features)</label>
                   <input 
                    type="text"
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    placeholder="e.g. Policy Violation Section 4.1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SUPREME_FEATURES.map(feature => {
                    const lockData = currentUser.lockedFeatures?.[feature.id];
                    const isLocked = lockData?.status === 'locked';

                    return (
                      <div 
                        key={feature.id}
                        className={`p-5 rounded-2xl border transition-all flex justify-between items-center ${
                          isLocked 
                            ? 'bg-red-500/5 border-red-500/20' 
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isLocked ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-500'}`}>
                            {isLocked ? <LockIcon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">{feature.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{feature.id}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleFeature(feature.id, lockData)}
                          disabled={isUpdating}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            isLocked 
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                          } disabled:opacity-50`}
                        >
                          {isLocked ? 'Unlock' : 'Lock'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 border-dashed p-12 text-center">
              <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                <Users className="w-12 h-12 text-gray-500" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Select a User</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Click on a user from the list to manage their Supreme Feature access and policy compliance status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MillionDealsAdmin() {
  const [gameStatus, setGameStatus] = useState<'active' | 'paused' | 'stopped'>('active');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const GAME_STATS = [
    { label: 'Active Players', value: '342', icon: Users, color: 'text-blue-500' },
    { label: 'Total Payouts', value: '$12,450', icon: DollarSign, color: 'text-green-500' },
    { label: 'Games Played', value: '1,205', icon: Gamepad2, color: 'text-purple-500' },
    { label: 'Avg Session Time', value: '4m 12s', icon: Clock, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Game Controls */}
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Game Controls</h3>
            <p className="text-gray-400">Manage Million Deals game state and scheduling</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
              gameStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              gameStatus === 'paused' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              Status: {gameStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setGameStatus('active')}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${
              gameStatus === 'active' 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Play className="w-5 h-5" /> Start / Resume
          </button>
          <button 
            onClick={() => setGameStatus('paused')}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${
              gameStatus === 'paused' 
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Pause className="w-5 h-5" /> Pause Game
          </button>
          <button 
            onClick={() => setGameStatus('stopped')}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${
              gameStatus === 'stopped' 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Square className="w-5 h-5" /> Stop Game
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Schedule Next Game</label>
            <input 
              type="datetime-local" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
            />
          </div>
          <button className="px-8 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors w-full md:w-auto">
            Schedule
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {GAME_STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment & Activity Log */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Game Payments & Activity</h3>
          <button className="text-sm font-bold text-[var(--color-supreme-gold)] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Player</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { user: 'Alex Rivera', action: 'Entry Fee (Level 1)', amount: '-$10.00', time: '2 mins ago', type: 'debit' },
                { user: 'Sarah Chen', action: 'Consolation Payout (70%)', amount: '+$70.00', time: '15 mins ago', type: 'credit' },
                { user: 'Marcus Wright', action: 'Grand Prize (4x)', amount: '+$400.00', time: '45 mins ago', type: 'credit' },
                { user: 'Elena Gomez', action: 'Entry Fee (Level 3)', amount: '-$100.00', time: '1 hour ago', type: 'debit' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10" />
                      <span className="font-bold text-white">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-400 font-medium">{row.action}</td>
                  <td className="px-8 py-4">
                    <span className={`font-bold ${row.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {row.amount}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 font-medium">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AwardsAdmin() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  
  const AWARDS_STATS = [
    { label: 'Total Prize Pool', value: '$250,000', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Active Nominees', value: '1,240', icon: Users, color: 'text-blue-500' },
    { label: 'Votes Cast', value: '45.2K', icon: Star, color: 'text-amber-500' },
    { label: 'Days Remaining', value: '12', icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {AWARDS_STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-center gap-4 mb-8 p-1 bg-white/5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'monthly' ? 'bg-[var(--color-supreme-gold)] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly Awards
          </button>
          <button 
            onClick={() => setActiveTab('yearly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'yearly' ? 'bg-[var(--color-supreme-gold)] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Yearly Awards
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 capitalize">{activeTab} Awards Control</h3>
              <p className="text-gray-400 text-sm">Manage the lifecycle and payments for {activeTab} awards.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all flex flex-col items-center gap-2 group">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Resume</span>
              </button>
              <button className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all flex flex-col items-center gap-2 group">
                <Pause className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Pause</span>
              </button>
              <button className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex flex-col items-center gap-2 group">
                <Square className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Stop</span>
              </button>
              <button className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-all flex flex-col items-center gap-2 group">
                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
              </button>
              <button className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 hover:bg-purple-500/20 transition-all flex flex-col items-center gap-2 group">
                <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Council</span>
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
            <h4 className="text-lg font-bold text-white mb-4">Current Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-400 text-sm">Phase</span>
                <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest">Voting Active</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-400 text-sm">Next Payout</span>
                <span className="text-white font-bold text-sm">April 1st, 2026</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <span className="text-gray-400 text-sm">Council Review</span>
                <span className="text-amber-500 font-bold text-sm">Pending (3)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionManagement() {
  const { settings, updateSettings } = useAdmin();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast.success('Subscription settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PlatformSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Subscription & Billing Control</h3>
          <p className="text-gray-400">Manage platform-wide subscription prices, limits, and billing cycles</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            <h4 className="text-xl font-bold text-white">General Billing</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Platform Subscriptions</p>
                <p className="text-xs text-gray-500">Enable or disable all subscription features</p>
              </div>
              <button 
                onClick={() => handleChange('platformSubscriptionEnabled', !localSettings.platformSubscriptionEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${localSettings.platformSubscriptionEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.platformSubscriptionEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Billing Cycle (Days)</label>
              <input 
                type="number"
                value={localSettings.billingCycleDays}
                onChange={(e) => handleChange('billingCycleDays', parseInt(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
          </div>
        </div>

        {/* Forex Limits */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h4 className="text-xl font-bold text-white">GMT Forex Limits</h4>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max Deposit Limit ($)</label>
              <input 
                type="number"
                value={localSettings.forexMaxDeposit}
                onChange={(e) => handleChange('forexMaxDeposit', parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min Withdrawal ($)</label>
              <input 
                type="number"
                value={localSettings.forexMinWithdrawal}
                onChange={(e) => handleChange('forexMinWithdrawal', parseFloat(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Prices */}
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <h4 className="text-xl font-bold text-white">Subscription Pricing</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Celeb Hub Access', field: 'celebHubSubPrice', icon: Star, color: 'text-yellow-400' },
            { label: 'General Platform', field: 'generalSubPrice', icon: Globe, color: 'text-blue-400' },
            { label: 'Profile Cards', field: 'profileCardSubPrice', icon: CreditCard, color: 'text-emerald-400' },
            { label: 'Monthly Awards', field: 'monthlyAwardSubPrice', icon: Award, color: 'text-purple-400' },
            { label: 'Yearly Awards', field: 'yearlyAwardSubPrice', icon: Trophy, color: 'text-amber-500' },
            { label: 'Mining Operations', field: 'miningSubPrice', icon: Pickaxe, color: 'text-orange-400' },
          ].map((item) => (
            <div key={item.field} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-white">{item.label}</p>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number"
                  step="0.01"
                  value={localSettings[item.field as keyof PlatformSettings] as number}
                  onChange={(e) => handleChange(item.field as keyof PlatformSettings, parseFloat(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--color-supreme-gold)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesControlAdmin() {
  const { featureStatuses, updateFeatureStatus } = useFeatureControl();

  const features: { id: FeatureId; label: string; description: string }[] = [
    { id: 'supreme-gmt', label: 'Supreme GMT', description: 'Global messaging and time tracking' },
    { id: 'core', label: 'Supreme Core', description: 'Core platform features' },
    { id: 'celeb-hub', label: 'Supreme Celeb Hub', description: 'Celebrity interactions and content' },
    { id: 'hall-of-fame', label: 'Hall of Fame', description: 'Top users and achievements' },
    { id: 'market', label: 'Supreme Market', description: 'Marketplace and trading' },
    { id: 'media', label: 'Supreme Media', description: 'Media sharing and viewing' },
    { id: 'discover', label: 'Supreme Discover', description: 'Discover new content and users' },
    { id: 'project-power', label: 'Project Power', description: 'Project management tools' },
    { id: 'ads', label: 'Ads', description: 'Advertisement management' },
    { id: 'streams', label: 'Supreme Stream', description: 'Live streaming features' },
    { id: 'industrial-tools', label: 'Industrial Tools', description: 'Advanced industrial toolset' },
    { id: 'supreme-coin-optimum', label: 'Supreme Coin Optimum', description: 'Coin management and optimization' },
    { id: 'hardware-mining', label: 'Supreme Hardware Mining', description: 'Advanced hardware mining operations' },
  ];

  const handleResumeAll = () => {
    features.forEach(f => updateFeatureStatus(f.id, { isPaused: false }));
    toast.success('All features resumed successfully');
  };

  const handlePauseAll = () => {
    features.forEach(f => updateFeatureStatus(f.id, { isPaused: true, reason: 'Bulk maintenance' }));
    toast.success('All features paused successfully');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Features Control Center</h3>
            <p className="text-gray-400">Manage platform features availability. Toggle on/off, schedule maintenance, or pause specific modules.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResumeAll}
              className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              Resume All
            </button>
            <button 
              onClick={handlePauseAll}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all"
            >
              Pause All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map(feature => {
            const status = featureStatuses[feature.id] || { isPaused: false, reason: '' };
            const isPaused = status.isPaused;

            return (
              <div key={feature.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 group hover:border-[var(--color-supreme-gold)]/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      isPaused ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                      {isPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{feature.label}</h4>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                    isPaused ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  )}>
                    {isPaused ? 'Paused' : 'Active'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Pause Reason / Status Message</label>
                    <input 
                      type="text"
                      placeholder="e.g., Maintenance, Scheduled Update"
                      value={status.reason || ''}
                      onChange={(e) => updateFeatureStatus(feature.id, { reason: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Auto-Resume Time</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="datetime-local"
                          value={status.unlockTime ? new Date(status.unlockTime).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateFeatureStatus(feature.id, { unlockTime: val ? new Date(val).toISOString() : undefined });
                          }}
                          className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <button 
                        onClick={() => updateFeatureStatus(feature.id, { isPaused: !isPaused })}
                        className={clsx(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border",
                          isPaused 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" 
                            : "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                        )}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        {isPaused ? 'Resume Now' : 'Pause Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RewardMechanismAdmin() {
  const { siteUsers, updateSettings, settings } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [rewardAmount, setRewardAmount] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);

  const supremeRanks = ['Silver', 'Gold', 'Diamond', 'Crowned', 'Elite', 'silver', 'gold', 'diamond', 'crowned', 'elite'];
  
  const filteredUsers = siteUsers.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                         (user.email || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const userRank = user.rank || '';
    const matchesRank = selectedRank === 'all' || userRank.toLowerCase() === selectedRank.toLowerCase();
    const isSupremeRank = supremeRanks.some(r => r.toLowerCase() === userRank.toLowerCase());
    return matchesSearch && matchesRank && isSupremeRank;
  });

  const handleRewardUser = async (user: any) => {
    setIsProcessing(true);
    try {
      // In a real app, this would call an API to update the user's balance
      // For now, we'll simulate it and show a toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Successfully rewarded ${user.name} with ${rewardAmount} SUP Coins!`, {
        description: `Notification sent to ${user.email} and ${user.mobile || user.phone || 'N/A'}`
      });
    } catch (error) {
      toast.error('Failed to reward user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRewardAll = async () => {
    if (filteredUsers.length === 0) return;
    if (!confirm(`Are you sure you want to reward all ${filteredUsers.length} filtered users?`)) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully rewarded ${filteredUsers.length} users!`);
    } catch (error) {
      toast.error('Failed to reward users');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Supreme Reward Mechanism</h3>
            <p className="text-gray-400">Reward Supreme rank holders for their platform engagement</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select 
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white outline-none focus:border-[var(--color-supreme-gold)] appearance-none"
              >
                <option value="all" className="bg-gray-900">All Supreme Ranks</option>
                <option value="silver" className="bg-gray-900">Silver</option>
                <option value="elite" className="bg-gray-900">Elite</option>
                <option value="gold" className="bg-gray-900">Gold</option>
                <option value="diamond" className="bg-gray-900">Diamond</option>
                <option value="crowned" className="bg-gray-900">Crowned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white">Reward Amount</h4>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">SUP Coins</span>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white">Target Users</h4>
            </div>
            <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
            <p className="text-xs text-gray-500 mt-1">Users matching current filters</p>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleRewardAll}
              disabled={isProcessing || filteredUsers.length === 0}
              className="w-full py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              Reward All Filtered
            </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engagement</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.uid || user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      (user.rank || '').toLowerCase() === 'crowned' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      (user.rank || '').toLowerCase() === 'diamond' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      (user.rank || '').toLowerCase() === 'gold' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      (user.rank || '').toLowerCase() === 'elite' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>
                      {user.rank || 'No Rank'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        {user.mobile || user.phone || 'No Phone'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{user.followers || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{user.following || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Following</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => handleRewardUser(user)}
                      disabled={isProcessing}
                      className="p-2 bg-white/5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all border border-white/5 flex items-center gap-2 text-xs font-bold"
                    >
                      <Award className="w-4 h-4" />
                      Reward
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 font-bold">No Supreme rank holders found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BetTrackingAdmin() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [bets, setBets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalWins: 0,
    totalLosses: 0,
    totalVolume: 0,
    winRate: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'bets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allBets: any[] = [];
      let volume = 0;
      let wins = 0;
      let losses = 0;
      const uniquePlayers = new Set();

      snapshot.forEach((doc) => {
        const data = doc.id ? { id: doc.id, ...doc.data() } : doc.data();
        allBets.push(data);
        volume += data.amount || 0;
        if (data.status === 'won') wins++;
        if (data.status === 'lost') losses++;
        uniquePlayers.add(data.userId);
      });

      setBets(allBets);
      setStats({
        totalPlayers: uniquePlayers.size,
        totalWins: wins,
        totalLosses: losses,
        totalVolume: volume,
        winRate: allBets.length > 0 ? (wins / (wins + losses)) * 100 : 0
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bets');
    });

    return () => unsubscribe();
  }, []);

  const BET_STATS = [
    { label: 'Total Players', value: stats.totalPlayers.toString(), icon: Users, color: 'text-blue-500' },
    { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Player Wins', value: stats.totalWins.toString(), icon: Trophy, color: 'text-amber-500' },
    { label: 'Player Losses', value: stats.totalLosses.toString(), icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">Bet Tracking Analysis</h3>
          <p className="text-gray-400">Monitor player performance, wins, losses, and platform volume</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {(['day', 'week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={clsx(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                timeframe === t ? "bg-[var(--color-supreme-gold)] text-black" : "text-gray-400 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BET_STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
          >
            <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5 w-fit mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
          <div className="p-8 border-b border-white/5">
            <h3 className="text-xl font-bold text-white">Recent Betting Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Player ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payout</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bets.slice(0, 10).map((bet) => (
                  <tr key={bet.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs text-purple-300">{bet.userId.substring(0, 8)}...</td>
                    <td className="px-8 py-4 font-bold text-white">${bet.amount}</td>
                    <td className="px-8 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        bet.status === 'won' ? "bg-emerald-500/10 text-emerald-500" : 
                        bet.status === 'lost' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-bold text-emerald-500">
                      {bet.payout > 0 ? `+$${bet.payout.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-500">
                      {bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Win/Loss Ratio</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              {/* Fallback visual if recharts pie is complex to setup quickly */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-emerald-500">Wins</span>
                    <span className="text-white">{stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${stats.winRate}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-red-500">Losses</span>
                    <span className="text-white">{(100 - stats.winRate).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${100 - stats.winRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 rounded-[2.5rem] border border-white/10">
            <h4 className="text-lg font-bold text-white mb-2">Platform Revenue</h4>
            <p className="text-gray-400 text-sm mb-6">Total losses collected by Supreme Account</p>
            <p className="text-4xl font-black text-[var(--color-supreme-gold)]">${(stats.totalVolume - (bets.reduce((acc, b) => acc + (b.payout || 0), 0))).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupremeMarketAdmin() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sincerityScores, setSincerityScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const qDealers = query(collection(db, 'market_dealer_profiles'), orderBy('submittedAt', 'desc'));
    const unsubscribeDealers = onSnapshot(qDealers, (snapshot) => {
      setDealers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qProducts = query(collection(db, 'products'), where('status', 'in', ['pending', 'queued', 'active']));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      items.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toDate?.()?.getTime() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setProducts(items);
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => {
      unsubscribeDealers();
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  // --- Admin God Eye Monitor Analytics ---
  const godEyeStats = React.useMemo(() => {
    if (orders.length === 0) return { bestSellingProduct: 'N/A', bestSellingDealer: 'N/A', dailySales: [] };

    // 1. Calculate Best Seller Product
    const productCounts: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(order => {
      const name = order.productName || 'Unknown Product';
      const amount = order.amount || 0;
      if (!productCounts[name]) {
        productCounts[name] = { count: 0, revenue: 0 };
      }
      productCounts[name].count += 1;
      productCounts[name].revenue += amount;
    });

    let topProduct = 'N/A';
    let maxProductCount = 0;
    Object.entries(productCounts).forEach(([name, data]) => {
      if (data.count > maxProductCount) {
        maxProductCount = data.count;
        topProduct = name;
      }
    });

    // 2. Calculate Best Seller Dealer (by transaction count)
    const dealerCounts: Record<string, { count: number; revenue: number }> = {};
    orders.forEach(order => {
      const dealer = order.dealerUid || 'Unknown Dealer';
      const amount = order.amount || 0;
      if (!dealerCounts[dealer]) {
        dealerCounts[dealer] = { count: 0, revenue: 0 };
      }
      dealerCounts[dealer].count += 1;
      dealerCounts[dealer].revenue += amount;
    });

    let topDealer = 'N/A';
    let maxDealerCount = 0;
    Object.entries(dealerCounts).forEach(([dealer, data]) => {
      if (data.count > maxDealerCount) {
        maxDealerCount = data.count;
        topDealer = dealer;
      }
    });

    // 3. Calculate Number of Goods Sold Daily and By Whom
    const dailyGroup: Record<string, { 
      date: string; 
      count: number; 
      totalRevenue: number;
      sales: { product: string; buyer: string; dealer: string; amount: number; time: string }[] 
    }> = {};

    orders.forEach(order => {
      let dateStr = 'Unknown';
      let dateObj: Date | null = null;
      if (order.createdAt) {
        if (order.createdAt.toDate) {
          dateObj = order.createdAt.toDate();
        } else if (order.createdAt.seconds) {
          dateObj = new Date(order.createdAt.seconds * 1000);
        } else {
          dateObj = new Date(order.createdAt);
        }
      }
      if (dateObj) {
        dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }

      if (!dailyGroup[dateStr]) {
        dailyGroup[dateStr] = {
          date: dateStr,
          count: 0,
          totalRevenue: 0,
          sales: []
        };
      }

      dailyGroup[dateStr].count += 1;
      dailyGroup[dateStr].totalRevenue += order.amount || 0;
      dailyGroup[dateStr].sales.push({
        product: order.productName || 'Unknown Product',
        buyer: order.buyerUid || 'Anonymous Buyer',
        dealer: order.dealerUid || 'Anonymous Dealer',
        amount: order.amount || 0,
        time: dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'
      });
    });

    // Sort dates descending
    const sortedDaily = Object.values(dailyGroup).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return {
      bestSellingProduct: topProduct !== 'N/A' ? `${topProduct} (${maxProductCount} sold)` : 'N/A',
      bestSellingDealer: topDealer !== 'N/A' ? `Dealer: ${topDealer.substring(0, 8)}... (${maxDealerCount} sold)` : 'N/A',
      dailySales: sortedDaily
    };
  }, [orders]);

  const handleApproveDealer = async (dealer: any) => {
    try {
      const score = sincerityScores[dealer.id] || 80;
      await updateDoc(doc(db, 'market_dealer_profiles', dealer.id), {
        status: 'verified',
        verifiedAt: Timestamp.now(),
        sincerityScore: score
      });
      toast.success(`Dealer ${dealer.businessName} verified with score: ${score}`);
    } catch (error) {
      toast.error('Failed to approve dealer');
    }
  };

  const handleRejectDealer = async (dealerId: string) => {
    try {
      await updateDoc(doc(db, 'market_dealer_profiles', dealerId), {
        status: 'rejected'
      });
      toast.success('Dealer application rejected');
    } catch (error) {
      toast.error('Failed to reject dealer');
    }
  };

  const handleApproveProduct = async (product: any) => {
    try {
      const approvedAt = new Date();
      const readyToListAt = new Date(approvedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
      
      await updateDoc(doc(db, 'products', product.id), {
        isVerified: true,
        status: 'active',
        approvedAt: approvedAt.toISOString(),
        readyToListAt: readyToListAt.toISOString()
      });
      toast.success('Product approved. Will be listed in 24 hours.');
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* GOD EYE Monitor Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
              <Eye className="w-7 h-7 text-yellow-500 animate-pulse" />
              GOD EYE MONITORING SYSTEM
            </h3>
            <p className="text-gray-400">Real-time marketplace telemetry, volume tracking, and seller auditing.</p>
          </div>
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">
            ● GLOBAL AUDIT LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Top Selling Product</p>
              <h4 className="text-xl font-bold text-white leading-tight">{godEyeStats.bestSellingProduct}</h4>
            </div>
            <div className="mt-4 text-xs text-yellow-500/70 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Most requested in market
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Top Market Dealer</p>
              <h4 className="text-xl font-bold text-white leading-tight">{godEyeStats.bestSellingDealer}</h4>
            </div>
            <div className="mt-4 text-xs text-yellow-500/70 font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Top transaction throughput
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Items Transacted</p>
              <h4 className="text-3xl font-display font-black text-[var(--color-supreme-gold)]">{orders.length}</h4>
            </div>
            <div className="mt-4 text-xs text-gray-500 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Cumulative order count
            </div>
          </div>
        </div>

        {/* Daily Sales Breakdown & 'Who' Detail */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              Daily Sales Audit (Numbers Sold Daily & By Who)
            </h4>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto no-scrollbar">
            {godEyeStats.dailySales.map((day, idx) => (
              <div key={idx} className="p-6 hover:bg-white/5 transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                    {day.date}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase font-black tracking-widest mr-4">Goods Sold: {day.count}</span>
                    <span className="text-sm font-bold text-[var(--color-supreme-gold)]">${day.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sub-table listing 'Who' (Buyer & Seller) for each product */}
                <div className="pl-4 border-l-2 border-yellow-500/20 space-y-3">
                  {day.sales.map((sale, sIdx) => (
                    <div key={sIdx} className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2 py-1">
                      <div className="space-y-1">
                        <p className="text-white font-bold">{sale.product}</p>
                        <p className="text-gray-400 font-medium">
                          Buyer: <span className="text-purple-300 font-mono">{sale.buyer.substring(0, 10)}...</span> • 
                          Dealer: <span className="text-cyan-300 font-mono">{sale.dealer.substring(0, 10)}...</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">{sale.time}</span>
                        <span className="font-bold text-emerald-500">${sale.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {godEyeStats.dailySales.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No orders recorded yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dealer Profiles Section */}
      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Dealer Onboarding Requests
          </h3>
          <p className="text-gray-400">Review market sincerity and business details for platform listing.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {dealers.map((dealer) => (
            <motion.div 
              key={dealer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-[var(--color-supreme-gold)]/20 transition-all group"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                      {dealer.businessName[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors">{dealer.businessName}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{dealer.businessType} • ID: {dealer.id.substring(0, 8)}</p>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      dealer.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      dealer.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {dealer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-300">{dealer.contactEmail}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-300">{dealer.contactPhone}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Market Sincerity Statement</p>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{dealer.description}"</p>
                  </div>
                </div>

                <div className="w-full lg:w-72 space-y-6">
                    {dealer.status === 'pending' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assign Sincerity Score (0-100)</label>
                                <input 
                                    type="number"
                                    min="0" max="100"
                                    value={sincerityScores[dealer.id] || ''}
                                    onChange={(e) => setSincerityScores({...sincerityScores, [dealer.id]: Number(e.target.value)})}
                                    placeholder="e.g. 85"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[var(--color-supreme-gold)]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApproveDealer(dealer)}
                                    className="flex-1 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleRejectDealer(dealer.id)}
                                    className="px-4 py-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                    {dealer.status === 'verified' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
                            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                            <p className="text-lg font-display font-black text-emerald-500 underline decoration-2">OFFICIALLY VERIFIED</p>
                            <p className="text-xs text-emerald-500/70 font-bold mt-1">Sincerity Score: {dealer.sincerityScore}</p>
                        </div>
                    )}
                </div>
              </div>
            </motion.div>
          ))}

          {dealers.length === 0 && (
            <div className="p-12 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No dealer applications found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Listings Section */}
      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Product Listing & Availability Review
          </h3>
          <p className="text-gray-400">Verify product status and manage the 24-hour activation queue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-[var(--color-supreme-gold)]/20 transition-all">
              <div className="aspect-square relative overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-xl ${
                        product.isVerified ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-amber-500/80 text-white border-amber-400'
                    }`}>
                        {product.isVerified ? 'Approved' : 'Pending Review'}
                    </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div>
                   <h4 className="font-bold text-white leading-tight mb-1">{product.name}</h4>
                   <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{product.category}</p>
                </div>
                 
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Dealer Business</p>
                        <p className="text-sm font-bold text-gray-300">{product.dealerName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-display font-bold text-[var(--color-supreme-gold)]">${product.price}</p>
                    </div>
                </div>

                {!product.isVerified ? (
                    <button
                        onClick={() => handleApproveProduct(product)}
                        className="w-full py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" /> Verify & List
                    </button>
                ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-center gap-3">
                         <div className="flex flex-col items-center">
                            <Clock className="w-5 h-5 text-emerald-500 mb-1" />
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Status</p>
                            <p className="text-[8px] text-gray-500 mt-1">Listed: {product.approvedAt ? new Date(product.approvedAt).toLocaleDateString() : 'N/A'}</p>
                         </div>
                    </div>
                )}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No products awaiting review.</p>
            </div>
          )}
        </div>
      </section>

      {/* NEW: Order & Delivery Tracking Section */}
      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Order & Delivery Performance
          </h3>
          <p className="text-gray-400">Track delivery status, monitor disputes, and identify failed deliveries.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => {
            const isOverdue = !order.userMarkedReceived && order.status !== 'delivered' && new Date() > new Date(order.deliveryDueDate);
            const isDisputed = order.status === 'disputed';
            
            return (
              <div 
                key={order.id} 
                className={clsx(
                  "bg-white/5 backdrop-blur-xl p-6 rounded-3xl border transition-all",
                  isDisputed ? "border-red-500/50 bg-red-500/5" : 
                  isOverdue ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white">{order.productName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.status === 'disputed' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      Buyer ID: {order.buyerUid?.substring(0, 8)} • Dealer ID: {order.dealerUid?.substring(0, 8)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Due Date</p>
                        <p className={`text-sm font-bold ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                          {new Date(order.deliveryDueDate).toLocaleDateString()}
                        </p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Confirmation</p>
                        <p className={`text-sm font-bold ${order.userMarkedReceived ? 'text-emerald-500' : 'text-gray-500'}`}>
                          {order.userMarkedReceived ? 'Received' : 'Pending'}
                        </p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Amount</p>
                        <p className="text-sm font-bold text-[var(--color-supreme-gold)]">${order.amount}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        {isDisputed || isOverdue ? (
                          <button 
                            onClick={async () => {
                                try {
                                    // Sanction dealer by suspending their profile
                                    const dRef = query(collection(db, 'market_dealer_profiles'), where('userId', '==', order.dealerUid));
                                    const dSnap = await getDocs(dRef);
                                    if (!dSnap.empty) {
                                        await updateDoc(doc(db, 'users', order.dealerUid), {
                                          isSuspended: true,
                                          suspensionReason: `Fraudulent Market Activity: Failed delivery for Order ${order.id.substring(0, 8)}`
                                        });
                                        toast.success('Dealer sanctioned and suspended for delivery failure.');
                                    }
                                } catch (e) {
                                    toast.error('Failed to apply sanction');
                                }
                            }}
                            className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                          >
                            Sanction Dealer
                          </button>
                        ) : null}
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No orders processed in the market yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  const { 
    miniAdmins, 
    addMiniAdmin, 
    removeMiniAdmin, 
    generateSecurityKeyForUser,
    updateMasterAdmin,
    siteUsers,
    updateUserSuspension,
    updateSellerVerification,
    settings,
    updateSettings,
    seedUsers,
    updateUserRole
  } = useAdmin();
  const { user } = useAuth();
  const { allSubscriptions, plans, updateSubscription } = useSubscription();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchParams] = useSearchParams();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddLegend, setShowAddLegend] = useState(false);
  const [newLegend, setNewLegend] = useState({ name: '', category: '', earnings: '', points: '' });
  const [broadcastType, setBroadcastType] = useState<'push' | 'email'>('push');
  const [activeChatId, setActiveChatId] = useState<number | null>(0);
  const [chatResponse, setChatResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosingTicket, setIsClosingTicket] = useState(false);
  const [tickets, setTickets] = useState([
    { id: 0, name: 'Alex Rivera', subject: 'Payment Issue', time: '2m ago', status: 'online', priority: 'high', active: true },
    { id: 1, name: 'Sarah Chen', subject: 'Account Recovery', time: '15m ago', status: 'offline', priority: 'medium', active: true },
    { id: 2, name: 'Marcus Wright', subject: 'Bug Report', time: '1h ago', status: 'away', priority: 'low', active: true },
    { id: 3, name: 'Elena Vance', subject: 'Feature Request', time: '3h ago', status: 'online', priority: 'low', active: true },
  ]);
  const [forexSubTab, setForexSubTab] = useState<'traders' | 'supreme' | 'settings'>('traders');
  const [emailRecipient, setEmailRecipient] = useState<string>('');

  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend' | 'unsuspend' | 'remove-admin';
    targetId: string;
    targetName: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', category: 'general' as MiniAdminCategory, adminId: '' });
  const [localSystemSettings, setLocalSystemSettings] = useState<PlatformSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // States for Unified Payment Tracking
  const [allUserTransactions, setAllUserTransactions] = useState<any[]>([]);
  const [allAdminTransactions, setAllAdminTransactions] = useState<any[]>([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>('');
  const [showManualTxModal, setShowManualTxModal] = useState(false);
  const [manualTxData, setManualTxData] = useState({
    userId: '',
    amount: '',
    method: 'stripe',
    type: 'deposit',
    notes: ''
  });
  const [isRecordingTx, setIsRecordingTx] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSystemSettings(settings);
    }
  }, [settings]);

  // Unified Payment Tracking Effect
  useEffect(() => {
    if (!user) return;
    try {
      // 1. User Transactions
      const qUserTx = query(collection(db, 'transactions'), limit(100));
      const unsubUserTx = onSnapshot(qUserTx, (snapshot) => {
        const txs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            origin: 'user',
            // Map payment method based on description/category/method
            derivedMethod: (() => {
              const desc = (data.description || '').toLowerCase();
              const cat = (data.category || '').toLowerCase();
              if (desc.includes('stripe') || cat.includes('stripe')) return 'stripe';
              if (desc.includes('paypal') || cat.includes('paypal')) return 'paypal';
              if (desc.includes('bitcoin') || desc.includes('btc') || cat.includes('bitcoin') || cat.includes('crypto')) return 'bitcoin';
              return 'internal';
            })()
          };
        });
        setAllUserTransactions(txs);
      }, (err) => {
        console.error("User transactions listen error:", err);
      });

      // 2. Admin Transactions
      const qAdminTx = query(collection(db, 'admin_transactions'), limit(100));
      const unsubAdminTx = onSnapshot(qAdminTx, (snapshot) => {
        const txs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            origin: 'admin',
            derivedMethod: data.method || 'internal'
          };
        });
        setAllAdminTransactions(txs);
      }, (err) => {
        console.error("Admin transactions listen error:", err);
      });

      return () => {
        unsubUserTx();
        unsubAdminTx();
      };
    } catch (e) {
      console.error("Firestore loading error:", e);
    }
  }, [user]);

  // Admin Guard
  const isMasterAdmin = user?.email === 'billworlddream1@gmail.com' || user?.email === 'supremeseller@gmail.com' || user?.email === 'sunny@gmail.com';
  const isAdminUser = user?.role === 'admin' || user?.role === 'mini-admin' || isMasterAdmin;

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      const validTabs = SIDEBAR_ITEMS.map(item => item.id);
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          console.error('Analytics API returned error:', response.status);
          // Fallback to mock data if API fails but server is up
          setAnalyticsData({
            daily: [1000, 1200, 900, 1500, 1800, 1600, 2000],
            weekly: [7000, 8500, 9000, 10000],
            monthly: [30000, 35000, 32000, 40000, 45000, 42000],
            yearly: [400000, 480000],
            bestSubscribers: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback to mock data on network error
        setAnalyticsData({
          daily: [1000, 1200, 900, 1500, 1800, 1600, 2000],
          weekly: [7000, 8500, 9000, 10000],
          monthly: [30000, 35000, 32000, 40000, 45000, 42000],
          yearly: [400000, 480000],
          bestSubscribers: []
        });
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#4a0404] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--color-supreme-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-bold">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }

  const NOTIFICATIONS = [
    { id: 1, title: 'New User Registration', message: 'A new user has just joined the platform.', time: '2m ago', type: 'user' },
    { id: 2, title: 'Large Transaction', message: 'A transaction of $5,000 was detected.', time: '15m ago', type: 'finance' },
    { id: 3, title: 'Security Alert', message: 'Multiple failed login attempts from IP 192.168.1.1', time: '1h ago', type: 'security' },
    { id: 4, title: 'System Update', message: 'The platform will undergo maintenance at 2 AM UTC.', time: '3h ago', type: 'system' },
  ];

  const handleUpdateAdminAuth = async () => {
    if (!newAdminEmail && !newAdminPass) return;
    try {
      await updateMasterAdmin(newAdminEmail || user?.email || '', newAdminPass || 'Billadad!!!!!');
      toast.success('Admin credentials updated successfully!');
      setNewAdminEmail('');
      setNewAdminPass('');
    } catch (error: any) {
      toast.error('Failed to update credentials: ' + error.message);
    }
  };

  const handleGenerateKey = async (userId: string) => {
    try {
      const key = await generateSecurityKeyForUser(userId);
      toast.success(`Security key generated: ${key}. Please save this key securely.`, {
        duration: 10000,
      });
    } catch (error: any) {
      toast.error('Failed to generate security key: ' + error.message);
    }
  };

  const handleSeedUsers = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    const toastId = toast.loading('Seeding 5,000 users/dealers... This may take a minute.');
    try {
      await seedUsers(5000);
      toast.success('Successfully seeded 5,000 users and dealers!', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to seed users: ' + error.message, { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, targetId, targetName } = confirmAction;
    
    try {
      if (type === 'approve') {
        await updateSellerVerification(targetId, 'approved');
        toast.success(`Dealer ${targetName} verified successfully!`);
      } else if (type === 'reject') {
        if (!actionReason) {
          toast.error("Please provide a reason for rejection.");
          return;
        }
        await updateSellerVerification(targetId, 'rejected', actionReason);
        toast.success(`Verification for ${targetName} rejected.`);
      } else if (type === 'suspend') {
        if (!actionReason) {
          toast.error("Please provide a reason for suspension.");
          return;
        }
        await updateUserSuspension(targetId, true, actionReason);
        toast.success(`Dealer ${targetName} suspended successfully.`);
      } else if (type === 'unsuspend') {
        await updateUserSuspension(targetId, false);
        toast.success(`Dealer ${targetName} unsuspended successfully.`);
      } else if (type === 'remove-admin') {
        await removeMiniAdmin(targetId);
        toast.success(`Mini-admin ${targetName} removed successfully.`);
      }
      setConfirmAction(null);
      setActionReason('');
    } catch (error: any) {
      toast.error(`Action failed: ${error.message}`);
    }
  };

  const handleAddMiniAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email || !newAdminData.adminId) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await addMiniAdmin({ 
        name: newAdminData.name, 
        email: newAdminData.email, 
        category: newAdminData.category, 
        adminId: newAdminData.adminId, 
        role: 'mini-admin', 
        permissions: [] 
      });
      toast.success('Mini-admin added successfully!');
      setShowAddAdminModal(false);
      setNewAdminData({ name: '', email: '', category: 'general', adminId: '' });
    } catch (error: any) {
      toast.error('Failed to add mini-admin: ' + error.message);
    }
  };

  const handleSendEmail = (email: string) => {
    setEmailRecipient(email);
    setActiveTab('email_center');
  };

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'admin_wallet', label: 'Admin Wallet', icon: Wallet },
    { id: 'analytics', label: 'User Analytics', icon: TrendingUp },
    { id: 'financial', label: 'Financial Management', icon: DollarSign },
    { id: 'revenue_management', label: 'Revenue Management', icon: Coins },
    { id: 'subscriptions', label: 'Subscription Tracking', icon: Zap },
    { id: 'subscription_management', label: 'Manage Subscriptions', icon: CreditCard },
    { id: 'earning_rates', label: 'Earning Rates', icon: Coins },
    { id: 'hall_of_fame', label: 'Hall of Fame', icon: Trophy },
    { id: 'awards', label: 'Awards Control', icon: Award },
    { id: 'million_deals', label: 'Million Deals', icon: Gamepad2 },
    { id: 'celeb_hub', label: 'Celeb Hub', icon: Star },
    { id: 'members', label: 'Members Tracking', icon: Users },
    { id: 'market_policy', label: 'Market Policy', icon: ShieldAlert },
    { id: 'project_power', label: 'Project Power', icon: Activity },
    { id: 'notifications', label: 'Push Notifications', icon: Bell },
    { id: 'rewards', label: 'Supreme Rewards', icon: Gift },
    { id: 'supreme_market', label: 'Supreme Market', icon: Briefcase },
    { id: 'forex_supreme', label: 'Forex & Supreme', icon: TrendingUp },
    { id: 'mining_management', label: 'Mining Management', icon: Pickaxe },
    { id: 'admin_management', label: 'Admin Management', icon: UserCheck },
    { id: 'security', label: 'Security & Logs', icon: Shield },
    { id: 'recent_activity', label: 'Recent Activity Log', icon: Activity },
    { id: 'audit_logs', label: 'Admin Audit Logs', icon: ClipboardList },
    { id: 'chat', label: 'Admin Chat', icon: MessageSquare },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'feature_control', label: 'Features Control Center', icon: ShieldAlert },
    { id: 'bet_tracking', label: 'Bet Tracking', icon: Trophy },
    { id: 'promote_tracking', label: 'Feature Promote', icon: Megaphone },
    { id: 'email_center', label: 'Email Center', icon: Mail },
    { id: 'reward_mechanism', label: 'Reward Mechanism', icon: Award },
    { id: 'noble_tracking', label: 'Noble Tracking', icon: Crown },
    { id: 'streak_tracking', label: 'Streak Tracking', icon: Flame },
    { id: 'appeal_analytics', label: 'Appeal Analytics', icon: Zap },
    { id: 'treasure_tracking', label: 'Treasure Tracking', icon: Briefcase },
    { id: 'connectivity_tracking', label: 'Connectivity Tracking', icon: Wifi },
    { id: 'greeting_control', label: 'Greeting & Mood Control', icon: Sliders },
    { id: 'super_shorts_violations', label: 'Super Shorts Violations', icon: ShieldAlert },
    { id: 'supreme_cmd', label: 'Supreme CMD', icon: Terminal },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'super_shorts_violations':
        return <AdminSuperShortsViolations />;
      case 'greeting_control':
        return <AdminGreetingControl />;
      case 'earning_rates':
        return <EarningRatesAdmin />;
      case 'feature_control':
        return <FeatureControlAdmin />;
      case 'bet_tracking':
        return <BetTrackingAdmin />;
      case 'reward_mechanism':
        return <RewardMechanismAdmin />;
      case 'noble_tracking':
        return <AdminNobleTracker />;
      case 'streak_tracking':
        return <AdminStreakTracker />;
      case 'promote_tracking':
        return <PromoteTrackingAdmin />;
      case 'appeal_analytics':
        return <AdminAppealAnalytics />;
      case 'treasure_tracking':
        return <AdminTreasureTracker />;
      case 'connectivity_tracking':
        return <ConnectivityMonitor />;
      case 'supreme_cmd':
        return <SupremeCMD />;
      case 'email_center':
        return <AdminEmail initialRecipient={emailRecipient || "sunny@gmail.com"} />;
      case 'admin_wallet':
        return <AdminWallet />;
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                <p className="text-xs text-gray-500">Common administrative tasks</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleSeedUsers}
                  disabled={isSeeding}
                  className="px-6 py-3 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-2xl text-sm font-bold border border-[var(--color-supreme-gold)]/20 hover:bg-[var(--color-supreme-gold)]/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Database className={`w-5 h-5 ${isSeeding ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                  {isSeeding ? 'Seeding 5,000 Users...' : 'Seed 5,000 Users/Dealers'}
                </button>
                <button 
                  onClick={() => {
                    handleSendEmail('sunny@gmail.com');
                    toast.info('Opening Email Center with Sunny Hey selected...');
                  }}
                  className="px-6 py-3 bg-amber-500 text-red-950 rounded-2xl text-sm font-bold shadow-lg hover:bg-amber-400 transition-all flex items-center gap-3"
                >
                  <Mail className="w-5 h-5" />
                  Welcome Sunny Hey
                </button>
                <button className="px-6 py-3 bg-white/5 text-white rounded-2xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Sync Data
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-[var(--color-supreme-gold)]/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                    <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
                    <p className="text-sm text-gray-500">Daily revenue performance</p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DATA}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-supreme-gold)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--color-supreme-gold)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="var(--color-supreme-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">User Engagement</h3>
                    <p className="text-sm text-gray-500">Active users vs engagement metrics</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', color: '#fff' }}
                      />
                      <Bar dataKey="users" fill="var(--color-supreme-gold)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Interactive User Growth Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <UserGrowthAnalytics />
            </motion.div>

            {/* Recent Activity Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RecentActivityLog isCompact={true} onViewAll={() => setActiveTab('recent_activity')} />
            </motion.div>
          </div>
        );
      case 'analytics':
        const growthData = analyticsData ? [
          { name: 'Daily', value: analyticsData.daily[analyticsData.daily.length - 1] },
          { name: 'Weekly', value: analyticsData.weekly[analyticsData.weekly.length - 1] },
          { name: 'Monthly', value: analyticsData.monthly[analyticsData.monthly.length - 1] },
          { name: 'Yearly', value: analyticsData.yearly[analyticsData.yearly.length - 1] },
        ] : [];

        const chartData = analyticsData ? analyticsData.monthly.map((val, i) => ({
          name: `Month ${i + 1}`,
          growth: val
        })) : [];

        return (
          <div className="space-y-8">
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {growthData.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.name} Growth</p>
                      <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-emerald-500 mt-2 font-bold">+{(Math.random() * 20).toFixed(1)}% vs prev</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-8">User Growth Trend</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                          <Area type="monotone" dataKey="growth" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-8">Growth Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData ? [
                          { name: 'Daily', val: analyticsData.daily[analyticsData.daily.length - 1] },
                          { name: 'Weekly', val: analyticsData.weekly[analyticsData.weekly.length - 1] },
                          { name: 'Monthly', val: analyticsData.monthly[analyticsData.monthly.length - 1] },
                        ] : []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                          <Bar dataKey="val" fill="var(--color-supreme-gold)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Best Subscribers List */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Best Subscribers</h3>
                    <Award className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Subscriber ID</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Paid</th>
                          <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analyticsData?.bestSubscribers.map((sub, i) => (
                          <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4 font-mono text-xs text-gray-400">#{sub.id}</td>
                            <td className="px-8 py-4 text-sm text-white font-bold">{sub.name}</td>
                            <td className="px-8 py-4 font-bold text-emerald-500">${sub.totalPaid.toLocaleString()}</td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] text-[10px] font-bold uppercase tracking-widest border border-[var(--color-supreme-gold)]/20">
                                {sub.plan}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'financial': {
        // Prepare Unified Transaction List
        const unifiedTransactions = (() => {
          const list: any[] = [];
          
          allUserTransactions.forEach(tx => {
            list.push({
              id: tx.id,
              userId: tx.userId || 'N/A',
              type: tx.type || 'unknown',
              amount: tx.amount || 0,
              description: tx.description || 'General transaction',
              category: tx.category || 'General',
              status: tx.status || 'completed',
              date: tx.date,
              method: tx.derivedMethod || 'internal',
              origin: 'user',
              raw: tx
            });
          });

          allAdminTransactions.forEach(tx => {
            list.push({
              id: tx.id,
              userId: tx.fromUid || 'Admin Pool',
              type: tx.type || 'funding',
              amount: tx.amount || 0,
              description: tx.notes || `Admin pool ${tx.type}`,
              category: 'Admin Pool',
              status: tx.status || 'completed',
              date: tx.createdAt,
              method: tx.derivedMethod || 'internal',
              origin: 'admin',
              raw: tx
            });
          });

          // Sort descending by date
          list.sort((a, b) => {
            const getMs = (val: any) => {
              if (!val) return 0;
              if (val.toDate) return val.toDate().getTime();
              if (val.seconds) return val.seconds * 1000;
              return new Date(val).getTime();
            };
            return getMs(b.date) - getMs(a.date);
          });

          return list;
        })();

        // Map method labels & icons
        const methodMeta: Record<string, { label: string; color: string; bg: string; icon: any }> = {
          stripe: { label: 'Stripe Global', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: CreditCard },
          paypal: { label: 'PayPal Direct', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: Globe },
          bitcoin: { label: 'Bitcoin network', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: Bitcoin },
          internal: { label: 'Internal Transfer', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Wallet },
        };

        // Live Method-Specific Statistics calculation
        const statsByMethod = unifiedTransactions.reduce((acc, tx) => {
          const m = tx.method;
          if (!acc[m]) acc[m] = { total: 0, count: 0, completed: 0, pending: 0 };
          acc[m].count += 1;
          acc[m].total += tx.amount;
          if (tx.status === 'completed') acc[m].completed += tx.amount;
          if (tx.status === 'pending') acc[m].pending += tx.amount;
          return acc;
        }, {} as Record<string, { total: number; count: number; completed: number; pending: number }>);

        const getMethodStats = (m: string) => {
          return statsByMethod[m] || { total: 0, count: 0, completed: 0, pending: 0 };
        };

        // Filter Transactions
        const filteredTransactions = unifiedTransactions.filter(tx => {
          const matchesMethod = paymentMethodFilter === 'all' || tx.method === paymentMethodFilter;
          const searchLower = (paymentSearchQuery || '').toLowerCase();
          const matchesSearch = 
            (tx.id || '').toLowerCase().includes(searchLower) ||
            (tx.userId || '').toLowerCase().includes(searchLower) ||
            (tx.description || '').toLowerCase().includes(searchLower) ||
            (tx.category || '').toLowerCase().includes(searchLower);
          return matchesMethod && matchesSearch;
        });

        // Date formatter helper
        const formatTxDate = (dateVal: any) => {
          if (!dateVal) return 'Processing...';
          let d: Date;
          if (dateVal.toDate) d = dateVal.toDate();
          else if (dateVal.seconds) d = new Date(dateVal.seconds * 1000);
          else d = new Date(dateVal);
          return d.toLocaleString();
        };

        // Handle quick status approval or change
        const handleUpdateTxStatus = async (tx: any, newStatus: 'completed' | 'failed') => {
          try {
            if (tx.origin === 'user') {
              const txRef = doc(db, 'transactions', tx.id);
              await updateDoc(txRef, { status: newStatus });
              
              // If it was a pending withdrawal and now failed, refund the user
              if (tx.type === 'withdraw' && newStatus === 'failed') {
                const userRef = doc(db, 'users', tx.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const currentBalance = userSnap.data().balance || 0;
                  await updateDoc(userRef, {
                    balance: currentBalance + tx.amount
                  });
                  toast.success(`Withdrawal failed. Refunded $${tx.amount.toLocaleString()} to user ${tx.userId}`);
                }
              } else {
                toast.success(`Transaction successfully marked as ${newStatus}`);
              }
            } else if (tx.origin === 'admin') {
              const txRef = doc(db, 'admin_transactions', tx.id);
              await updateDoc(txRef, { status: newStatus });
              toast.success(`Admin transaction marked as ${newStatus}`);
            }
          } catch (error: any) {
            console.error("Error updating transaction status:", error);
            toast.error("Failed to update status: " + error.message);
          }
        };

        // Handle recording a manual entry
        const handleRecordManualTx = async () => {
          if (!manualTxData.userId || !manualTxData.amount || Number(manualTxData.amount) <= 0) {
            toast.error("Please provide a valid recipient user ID and positive amount.");
            return;
          }
          setIsRecordingTx(true);
          try {
            const amountNum = Number(manualTxData.amount);
            
            // Build rich transaction document
            const txPayload: any = {
              userId: manualTxData.userId,
              type: manualTxData.type,
              amount: amountNum,
              description: `Manual Entry: ${manualTxData.notes || 'No notes'}`,
              category: 'Manual Ledger',
              status: 'completed',
              date: Timestamp.now()
            };

            // Adjust user active balance if user document exists
            const userRef = doc(db, 'users', manualTxData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const currentBal = userSnap.data().balance || 0;
              const adjust = manualTxData.type === 'deposit' ? amountNum : -amountNum;
              await updateDoc(userRef, {
                balance: currentBal + adjust
              });
              toast.success(`Adjusted balance for user ${userSnap.data().name || manualTxData.userId} by $${adjust.toLocaleString()}`);
            } else {
              toast.info("Ledger entry stored. (Note: Recipient UID not active/found; balance unadjusted)");
            }

            await addDoc(collection(db, 'transactions'), txPayload);
            toast.success("Transaction recorded successfully in live system ledger!");
            setShowManualTxModal(false);
            setManualTxData({
              userId: '',
              amount: '',
              method: 'stripe',
              type: 'deposit',
              notes: ''
            });
          } catch (error: any) {
            console.error("Manual tx record error:", error);
            toast.error("Failed to record entry: " + error.message);
          } finally {
            setIsRecordingTx(false);
          }
        };

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Payment Method Specific Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* PayPal Card */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-black p-6 rounded-3xl border border-indigo-500/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active gateway</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">PayPal Direct Volume</p>
                <p className="text-3xl font-bold text-white">${getMethodStats('paypal').total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                  <span>{getMethodStats('paypal').count} Transactions</span>
                  {getMethodStats('paypal').pending > 0 && <span className="text-yellow-500 font-bold">${getMethodStats('paypal').pending} Pending</span>}
                </div>
              </div>

              {/* Stripe Card */}
              <div className="bg-gradient-to-br from-blue-950/40 to-black p-6 rounded-3xl border border-blue-500/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active gateway</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Stripe Global Volume</p>
                <p className="text-3xl font-bold text-white">${getMethodStats('stripe').total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                  <span>{getMethodStats('stripe').count} Transactions</span>
                  {getMethodStats('stripe').pending > 0 && <span className="text-yellow-500 font-bold">${getMethodStats('stripe').pending} Pending</span>}
                </div>
              </div>

              {/* Bitcoin Card */}
              <div className="bg-gradient-to-br from-amber-950/30 to-black p-6 rounded-3xl border border-amber-500/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-amber-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                    <Bitcoin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active ledger</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bitcoin Network Volume</p>
                <p className="text-3xl font-bold text-white">${getMethodStats('bitcoin').total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                  <span>{getMethodStats('bitcoin').count} Transactions</span>
                  {getMethodStats('bitcoin').pending > 0 && <span className="text-yellow-500 font-bold">${getMethodStats('bitcoin').pending} Pending</span>}
                </div>
              </div>

              {/* Internal Transfers Card */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-black p-6 rounded-3xl border border-emerald-500/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 bg-emerald-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">No fee</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Internal Transfers Volume</p>
                <p className="text-3xl font-bold text-white">${getMethodStats('internal').total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                  <span>{getMethodStats('internal').count} Transactions</span>
                  {getMethodStats('internal').pending > 0 && <span className="text-yellow-500 font-bold">${getMethodStats('internal').pending} Pending</span>}
                </div>
              </div>
            </div>

            {/* Live Filter Controls & Manual Record Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setPaymentMethodFilter('all')}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider",
                    paymentMethodFilter === 'all' 
                      ? "bg-[var(--color-supreme-gold)] text-black" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  All Methods
                </button>
                <button
                  onClick={() => setPaymentMethodFilter('paypal')}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 uppercase tracking-wider",
                    paymentMethodFilter === 'paypal' 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" /> PayPal
                </button>
                <button
                  onClick={() => setPaymentMethodFilter('stripe')}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 uppercase tracking-wider",
                    paymentMethodFilter === 'stripe' 
                      ? "bg-blue-600 text-white" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Stripe
                </button>
                <button
                  onClick={() => setPaymentMethodFilter('bitcoin')}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 uppercase tracking-wider",
                    paymentMethodFilter === 'bitcoin' 
                      ? "bg-amber-500 text-black" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Bitcoin className="w-3.5 h-3.5" /> Bitcoin
                </button>
                <button
                  onClick={() => setPaymentMethodFilter('internal')}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 uppercase tracking-wider",
                    paymentMethodFilter === 'internal' 
                      ? "bg-emerald-500 text-black" 
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Wallet className="w-3.5 h-3.5" /> Internal
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ledger entries..."
                    value={paymentSearchQuery}
                    onChange={(e) => setPaymentSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <button 
                  onClick={() => setShowManualTxModal(true)}
                  className="px-5 py-2.5 bg-[var(--color-supreme-gold)] text-black font-bold text-xs rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[var(--color-supreme-gold)]/20 uppercase tracking-widest whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Record Ledger Entry
                </button>
              </div>
            </div>

            {/* Main Unified Live Ledger */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    Central Transaction Ledger
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Real-time status tracking for Stripe, PayPal, Bitcoin networks, and internal user-to-user transfers.</p>
                </div>
                <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-400 font-bold px-2 uppercase tracking-widest">Active Entries: {filteredTransactions.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction ID</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recipient / Target UID</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Flow Description</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gateway Method</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-20 text-gray-500 font-semibold">
                          <AlertTriangle className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
                          No matching payments found in live ledger.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const meta = methodMeta[tx.method] || { label: 'Internal', color: 'text-gray-400', bg: 'bg-white/5 border-white/5', icon: Wallet };
                        const isPending = tx.status === 'pending';
                        const isFlowWithdraw = tx.type === 'withdraw' || tx.type === 'withdrawal';
                        const isFlowDeposit = tx.type === 'deposit' || tx.type === 'funding';
                        return (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-8 py-4 font-mono text-xs text-gray-400 select-all" title="Click to select & copy">{tx.id}</td>
                            <td className="px-8 py-4">
                              <div className="max-w-[150px] truncate font-mono text-xs font-bold text-white select-all" title={tx.userId}>
                                {tx.userId}
                              </div>
                              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">{tx.origin === 'admin' ? 'Admin Pool Flow' : 'User Transaction'}</span>
                            </td>
                            <td className="px-8 py-4">
                              <p className="text-sm text-white font-medium line-clamp-1">{tx.description}</p>
                              {tx.category && <span className="text-[10px] font-bold text-gray-500">{tx.category}</span>}
                            </td>
                            <td className="px-8 py-4">
                              <span className={clsx(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider",
                                meta.color,
                                meta.bg
                              )}>
                                <meta.icon className="w-3.5 h-3.5" />
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-8 py-4 font-bold">
                              <p className={clsx(
                                "text-sm",
                                isFlowDeposit ? 'text-emerald-500' : isFlowWithdraw ? 'text-amber-500' : 'text-white'
                              )}>
                                {isFlowDeposit ? '+' : isFlowWithdraw ? '-' : ''}${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </p>
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{tx.type}</span>
                            </td>
                            <td className="px-8 py-4">
                              {isPending ? (
                                <div className="flex flex-col gap-1.5">
                                  <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest text-center w-24">
                                    PENDING
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleUpdateTxStatus(tx, 'completed')}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateTxStatus(tx, 'failed')}
                                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-wider rounded transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className={clsx(
                                  "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                                  tx.status === 'completed' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                )}>
                                  {tx.status}
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-4 text-xs text-gray-400 font-medium">{formatTxDate(tx.date)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Record Modal */}
            <AnimatePresence>
              {showManualTxModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setShowManualTxModal(false)}
                      className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                      <Coins className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                      Record central Ledger Entry
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 font-medium">Manually book Stripe, PayPal, Bitcoin, or Internal transfers to correct user balances or record physical cash/external payment actions.</p>

                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Target User UID</label>
                        <input
                          type="text"
                          value={manualTxData.userId}
                          onChange={(e) => setManualTxData({ ...manualTxData, userId: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[var(--color-supreme-gold)] outline-none"
                          placeholder="Enter active user UID (e.g., Jf83kLs0s...)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Flow Type</label>
                          <select
                            value={manualTxData.type}
                            onChange={(e) => setManualTxData({ ...manualTxData, type: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[var(--color-supreme-gold)] outline-none"
                          >
                            <option value="deposit">Deposit (In-Flow)</option>
                            <option value="withdraw">Withdrawal (Out-Flow)</option>
                            <option value="transfer">Internal Transfer</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Payment Method</label>
                          <select
                            value={manualTxData.method}
                            onChange={(e) => setManualTxData({ ...manualTxData, method: e.target.value as any })}
                            className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[var(--color-supreme-gold)] outline-none"
                          >
                            <option value="stripe">Stripe Global</option>
                            <option value="paypal">PayPal Direct</option>
                            <option value="bitcoin">Bitcoin Network</option>
                            <option value="internal">Internal Balance Transfer</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Amount ($)</label>
                        <input
                          type="number"
                          value={manualTxData.amount}
                          onChange={(e) => setManualTxData({ ...manualTxData, amount: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-xl focus:border-[var(--color-supreme-gold)] outline-none"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-widest">Reference Notes</label>
                        <textarea
                          value={manualTxData.notes}
                          onChange={(e) => setManualTxData({ ...manualTxData, notes: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[var(--color-supreme-gold)] outline-none resize-none h-20"
                          placeholder="State reason, reference txn hash, etc."
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowManualTxModal(false)}
                          className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRecordManualTx}
                          disabled={isRecordingTx}
                          className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-yellow-500 transition-colors disabled:opacity-50"
                        >
                          {isRecordingTx ? 'Processing...' : 'Commit Ledger Entry'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      }
      case 'revenue_management':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20">
                  <Coins className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Revenue Management Console</h3>
                  <p className="text-gray-400">Configure platform earnings, rank bonuses, and monetization rates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Activity Earning Rates */}
                <div className="md:col-span-3">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Activity Earning Rates (SUP Coins)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-bold text-white">Subscription Rate</h4>
                      </div>
                      <p className="text-xs text-gray-500">Coins earned when a user subscribes to a plan.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.earningRateSubscription}
                          onChange={(e) => updateSettings({ earningRateSubscription: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">COINS</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Edit2 className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-white">Posting Rate</h4>
                      </div>
                      <p className="text-xs text-gray-500">Coins earned for each post created by the user.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.earningRatePost}
                          onChange={(e) => updateSettings({ earningRatePost: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">COINS</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-bold text-white">Connection Rate</h4>
                      </div>
                      <p className="text-xs text-gray-500">Coins earned for making a new connection/follower.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.earningRateConnection}
                          onChange={(e) => updateSettings({ earningRateConnection: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">COINS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet & Monetization */}
                <div className="md:col-span-3">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Wallet & Monetization Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-bold text-white">Wallet Earnings Rate</h4>
                      </div>
                      <p className="text-xs text-gray-500">Daily interest/earning rate for funds held in the wallet.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={settings.walletEarningsRate}
                          onChange={(e) => updateSettings({ walletEarningsRate: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">% / DAY</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-white">Follower Monetization Rate</h4>
                      </div>
                      <p className="text-xs text-gray-500">Earnings per active follower per month for creators.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.001"
                          value={settings.followerMonetizationRate}
                          onChange={(e) => updateSettings({ followerMonetizationRate: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">USD / FOLLOWER</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Bonuses */}
                <div className="md:col-span-3">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Rank-Based Bonus Triggers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <h4 className="font-bold text-white">Gold Rank Bonus</h4>
                      </div>
                      <p className="text-xs text-gray-500">One-time bonus for reaching Gold rank.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.rankBonusGold}
                          onChange={(e) => updateSettings({ rankBonusGold: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <h4 className="font-bold text-white">Diamond Rank Bonus</h4>
                      </div>
                      <p className="text-xs text-gray-500">One-time bonus for reaching Diamond rank.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.rankBonusDiamond}
                          onChange={(e) => updateSettings({ rankBonusDiamond: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <h4 className="font-bold text-white">Supreme Rank Bonus</h4>
                      </div>
                      <p className="text-xs text-gray-500">One-time bonus for reaching Supreme rank.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.rankBonusSupreme}
                          onChange={(e) => updateSettings({ rankBonusSupreme: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payout Thresholds */}
                <div className="md:col-span-3">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    Payout Thresholds
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <h4 className="font-bold text-white">General Users</h4>
                      <p className="text-xs text-gray-500">Minimum balance required to request a payout.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.payoutThresholdGeneral}
                          onChange={(e) => updateSettings({ payoutThresholdGeneral: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <h4 className="font-bold text-white">Verified Creators</h4>
                      <p className="text-xs text-gray-500">Threshold for users in the Creator program.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.payoutThresholdCreator}
                          onChange={(e) => updateSettings({ payoutThresholdCreator: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                      <h4 className="font-bold text-white">Premium Members</h4>
                      <p className="text-xs text-gray-500">Lower threshold for premium subscription holders.</p>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.payoutThresholdPremium}
                          onChange={(e) => updateSettings({ payoutThresholdPremium: parseFloat(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-blue-400">Revenue Management Tip</p>
                  <p className="text-xs text-blue-400/70 mt-1">
                    These settings directly impact the platform's financial ecosystem. 
                    Ensure that payout thresholds are balanced with your current liquidity and that rank bonuses 
                    are sustainable as the user base grows.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">User View Preview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Subscribe</span>
                  <span className="font-bold text-[var(--color-supreme-gold)]">+{settings.earningRateSubscription} SUP</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Post</span>
                  <span className="font-bold text-[var(--color-supreme-gold)]">+{settings.earningRatePost} SUP</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Connect</span>
                  <span className="font-bold text-[var(--color-supreme-gold)]">+{settings.earningRateConnection} SUP</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Subs', value: '4,285', icon: Zap, color: 'text-yellow-500' },
                { label: 'Monthly MRR', value: '$84,200', icon: DollarSign, color: 'text-emerald-500' },
                { label: 'Churn Rate', value: '2.4%', icon: TrendingUp, color: 'text-red-500' },
                { label: 'New Subs', value: '+142', icon: Plus, color: 'text-blue-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                  <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color} mb-4`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8">
              <h3 className="text-xl font-bold text-white mb-8">Subscription Tier Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Free', count: 8500 },
                    { name: 'Pro', count: 3200 },
                    { name: 'Elite', count: 1085 },
                    { name: 'Supreme', count: 420 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                    <Bar dataKey="count" fill="var(--color-supreme-gold)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'hall_of_fame':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Hall of Fame Tracking</h3>
                <p className="text-gray-400">Manage top creators and legendary members</p>
              </div>
              <button 
                onClick={() => setShowAddLegend(!showAddLegend)}
                className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                {showAddLegend ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showAddLegend ? 'Cancel' : 'Add New Legend'}
              </button>
            </div>

            {showAddLegend && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 overflow-hidden shadow-2xl relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-supreme-gold)] to-transparent opacity-50" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-supreme-gold)]/10 flex items-center justify-center border border-[var(--color-supreme-gold)]/20">
                    <Trophy className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Create New Legend Entry</h4>
                    <p className="text-sm text-gray-500">Add a new member to the prestigious Hall of Fame</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={newLegend.name}
                      onChange={(e) => setNewLegend({...newLegend, name: e.target.value})}
                      placeholder="e.g. Marcus Sterling"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={newLegend.category}
                      onChange={(e) => setNewLegend({...newLegend, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Top Earner">Top Earner</option>
                      <option value="Viral Creator">Viral Creator</option>
                      <option value="Community Leader">Community Leader</option>
                      <option value="Innovation Master">Innovation Master</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Total Earnings</label>
                    <input 
                      type="text" 
                      value={newLegend.earnings}
                      onChange={(e) => setNewLegend({...newLegend, earnings: e.target.value})}
                      placeholder="e.g. $1.2M"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Fame Points</label>
                    <input 
                      type="text" 
                      value={newLegend.points}
                      onChange={(e) => setNewLegend({...newLegend, points: e.target.value})}
                      placeholder="e.g. 45,000"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Profile Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Legend Bio / Achievement Summary</label>
                    <textarea 
                      rows={3}
                      placeholder="Briefly describe why this member is a legend..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20 flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" /> Publish to Hall of Fame
                  </button>
                  <button 
                    onClick={() => setShowAddLegend(false)}
                    className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                  >
                    Discard
                  </button>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'legend-1', name: 'Marcus Sterling', category: 'Top Earner', earnings: '$1.2M', rank: 1, points: '45,000' },
                { id: 'legend-2', name: 'Elena Vance', category: 'Viral Creator', earnings: '$840K', rank: 2, points: '38,200' },
                { id: 'legend-3', name: 'Julian Thorne', category: 'Community Leader', earnings: '$620K', rank: 3, points: '32,100' },
              ].map((legend, i) => (
                <div key={legend.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6">
                    <Trophy className={`w-8 h-8 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 border-4 border-white/10" />
                  <h4 className="text-xl font-bold text-white mb-1">{legend.name}</h4>
                  <p className="text-sm text-emerald-500 font-bold uppercase tracking-widest mb-6">{legend.category}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Earnings</p>
                      <p className="text-lg font-bold text-white">{legend.earnings}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Fame Points</p>
                      <p className="text-lg font-bold text-[var(--color-supreme-gold)]">{legend.points}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all">Edit Profile</button>
                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'awards':
        return <AwardsAdmin />;
      case 'celeb_hub':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Celeb Hub Tracking</h3>
                <p className="text-gray-400">Monitor verified celebrity accounts and exclusive content</p>
              </div>
              <button className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors">
                Verify New Celeb
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <h4 className="text-lg font-bold text-white">Verified Celebrities</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Celebrity</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Followers</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Exclusive Posts</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engagement</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: 'David Beckham', handle: '@beckham', followers: '1.2M', posts: 42, engagement: '8.4%' },
                      { name: 'Rihanna', handle: '@badgalriri', followers: '5.8M', posts: 124, engagement: '12.2%' },
                      { name: 'Leo Messi', handle: '@leomessi', followers: '12.4M', posts: 86, engagement: '15.8%' },
                    ].map((celeb, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600" />
                            <div>
                              <p className="font-bold text-white flex items-center gap-1">
                                {celeb.name} <CheckCircle className="w-3 h-3 text-blue-400" />
                              </p>
                              <p className="text-xs text-gray-500">{celeb.handle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm text-white font-bold">{celeb.followers}</td>
                        <td className="px-8 py-4 text-sm text-white font-bold">{celeb.posts}</td>
                        <td className="px-8 py-4 text-sm text-emerald-500 font-bold">{celeb.engagement}</td>
                        <td className="px-8 py-4">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Edit2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'market_policy':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Market Policy Management</h3>
                <p className="text-gray-400">Manage dealer compliance and marketplace integrity</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Dealers</p>
                  <p className="text-xl font-bold text-white">{siteUsers.filter(u => u.role === 'dealer' || u.hasAcceptedMarketPolicy).length}</p>
                </div>
                <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Suspended</p>
                  <p className="text-xl font-bold text-red-500">{siteUsers.filter(u => u.isSuspended).length}</p>
                </div>
              </div>
            </div>

            {/* Policy Overview */}
            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-blue-500/20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <h4 className="text-xl font-bold text-white">Supreme Market Policy Rules</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "1. Delivery within 7-14 days (max 1 month) or suspension.",
                  "2. Goods must be readily available before listing.",
                  "3. Immediate suspension upon user complaint before purchase.",
                  "4. Wallet suspension for policy violations; products put on hold.",
                  "5. Strict verification for withdrawals to ensure no violations."
                ].map((rule, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-300">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Dealer Management Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4 className="text-lg font-bold text-white">Dealer Directory</h4>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search dealers by name or email..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dealer</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verification</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Policy Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suspension Reason</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {siteUsers
                      .filter(u => (u.role === 'dealer' || u.hasAcceptedMarketPolicy) && 
                        ((u.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                      .map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4">
                          <div>
                            <p className="font-bold text-white">{dealer.name}</p>
                            <p className="text-xs text-gray-500">{dealer.email}</p>
                            {dealer.businessName && <p className="text-[10px] text-[var(--color-supreme-gold)] font-bold uppercase mt-1">{dealer.businessName}</p>}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit ${
                              dealer.verificationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                              dealer.verificationStatus === 'pending' ? 'bg-blue-500/10 text-blue-500' : 
                              dealer.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                              {dealer.verificationStatus || 'None'}
                            </span>
                            {dealer.isVerifiedSeller && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            dealer.hasAcceptedMarketPolicy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {dealer.hasAcceptedMarketPolicy ? 'Accepted' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            dealer.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {dealer.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs text-gray-400 italic max-w-xs truncate">
                          {dealer.suspensionReason || '-'}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {dealer.verificationStatus === 'pending' && (
                              <>
                                <button 
                                  onClick={() => setConfirmAction({ type: 'approve', targetId: dealer.id, targetName: dealer.name })}
                                  className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-all"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => setConfirmAction({ type: 'reject', targetId: dealer.id, targetName: dealer.name })}
                                  className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {dealer.isSuspended ? (
                              <button 
                                onClick={() => setConfirmAction({ type: 'unsuspend', targetId: dealer.id, targetName: dealer.name })}
                                className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-all"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button 
                                onClick={() => setConfirmAction({ type: 'suspend', targetId: dealer.id, targetName: dealer.name })}
                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'subscription_management':
        return <AdminSubscriptionManager />;
      case 'members':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Members Tracking</h3>
                <p className="text-gray-400">Detailed analytics and management of platform members</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSeedUsers}
                  disabled={isSeeding}
                  className="px-4 py-2 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-xl text-xs font-bold border border-[var(--color-supreme-gold)]/20 hover:bg-[var(--color-supreme-gold)]/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Database className="w-4 h-4" />
                  {isSeeding ? 'Seeding...' : 'Seed 5,000 Users'}
                </button>
                <button className="px-4 py-2 bg-white/5 text-white rounded-xl text-xs font-bold border border-white/10">All Members</button>
                <button className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-xs font-bold border border-yellow-500/20">Pro Only</button>
                <button className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20">Elite Only</button>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm" 
                  />
                </div>
                <button className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-sm font-bold border border-white/10">Filters</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Member</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mining Points</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spent</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Member Since</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">UTDC Access</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {siteUsers
                      .filter(u => 
                        (u.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                        (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                        (u.handle || '').toLowerCase().includes((searchQuery || '').toLowerCase())
                      )
                      .slice(0, 50)
                      .map((member, i) => {
                        const creationDate = member.createdAt ? (member.createdAt as any).toDate?.() || new Date(member.createdAt as any) : null;
                        const now = new Date();
                        const diffDays = creationDate ? Math.ceil(Math.abs(now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        const hasUTDCAccess = diffDays >= 90 || member.role === 'admin' || member.role === 'mini-admin';

                        return (
                          <tr key={member.id || i} className="hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                                  alt="" 
                                  className="w-8 h-8 rounded-full border border-white/10"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-bold text-white">{member.name}</p>
                                  <p className="text-[10px] text-gray-500">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                member.rank === 'Supreme' ? 'bg-yellow-500/10 text-yellow-500' :
                                member.rank === 'Elite' ? 'bg-emerald-500/10 text-emerald-500' :
                                member.rank === 'Pro' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-white/5 text-gray-500'
                              }`}>{member.rank || 'Free'}</span>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                <span className="text-sm font-bold text-white">{member.miningPoints || 0}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-sm text-white font-bold">${member.balance?.toLocaleString() || '0'}</td>
                            <td className="px-8 py-4 text-sm text-gray-500">
                              {creationDate ? creationDate.toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-8 py-4">
                              {hasUTDCAccess ? (
                                <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                  <ShieldCheck className="w-3 h-3" /> Granted
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                  <LockIcon className="w-3 h-3" /> Locked ({Math.max(0, 90 - diffDays)}d)
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleSendEmail(member.email)}
                                  className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all tooltip"
                                  title="Send Direct Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const role = prompt("Enter new role (user, dealer, admin, mini-admin, premium-user):", member.role);
                                    if (role && role !== member.role) {
                                      updateUserRole(member.id, role as any);
                                      toast.success(`Role updated for ${member.name}`);
                                    }
                                  }}
                                  className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20"
                                >
                                  Role
                                </button>
                                <button 
                                  onClick={() => setConfirmAction({ 
                                    type: member.isSuspended ? 'unsuspend' : 'suspend', 
                                    targetId: member.id, 
                                    targetName: member.name 
                                  })}
                                  className={clsx(
                                    "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                                    member.isSuspended ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                  )}
                                >
                                  {member.isSuspended ? 'Unsuspend' : 'Suspend'}
                                </button>
                                <button className="text-[var(--color-supreme-gold)] text-xs font-bold hover:underline">Manage</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {siteUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                          No members found. Use the "Seed" button to generate mock data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'project_power':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Projects</p>
                <p className="text-3xl font-bold text-white">124</p>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[65%]" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Funding</p>
                <p className="text-3xl font-bold text-white">$2.4M</p>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[42%]" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-emerald-500">84%</p>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[84%]" />
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8">
              <h3 className="text-xl font-bold text-white mb-8">Project Funding Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DATA}>
                    <defs>
                      <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFunding)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="max-w-5xl space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Broadcast Form */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-8 relative">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-supreme-gold)]/10 flex items-center justify-center border border-[var(--color-supreme-gold)]/20">
                      <Radio className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Broadcast Management</h3>
                      <p className="text-sm text-gray-500">Reach your community via push or email</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Broadcast Type</label>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                          <button 
                            onClick={() => setBroadcastType('push')}
                            className={`flex-1 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2 ${
                              broadcastType === 'push' 
                                ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg shadow-[var(--color-supreme-gold)]/10' 
                                : 'text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            <Bell className="w-4 h-4" /> Push
                          </button>
                          <button 
                            onClick={() => setBroadcastType('email')}
                            className={`flex-1 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-2 ${
                              broadcastType === 'email' 
                                ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg shadow-[var(--color-supreme-gold)]/10' 
                                : 'text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            <Mail className="w-4 h-4" /> Email
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Target Audience</label>
                        <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all">
                          <option>All Users (152.4K)</option>
                          <option>Pro Members Only (42.1K)</option>
                          <option>Elite & Supreme Members (12.8K)</option>
                          <option>Creators Only (8.5K)</option>
                          <option>Inactive Users (30+ days) (22.3K)</option>
                        </select>
                      </div>
                    </div>
                    
                    {broadcastType === 'email' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-white/5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Sender Name</label>
                            <input type="text" placeholder="Million Deals Support" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]" />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Reply-To Address</label>
                            <input type="email" placeholder="support@milliondeals.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Email Subject</label>
                          <input type="text" placeholder="Enter a compelling subject line..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Template Selection</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Announcement', 'Newsletter', 'Promotion', 'Security'].map((tmpl) => (
                              <button key={tmpl} className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:border-[var(--color-supreme-gold)] hover:text-white transition-all">
                                {tmpl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {broadcastType === 'push' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-white/5"
                      >
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Notification Title</label>
                          <input type="text" placeholder="Short & catchy title..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]" />
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {broadcastType === 'email' ? 'Email Body (HTML Supported)' : 'Message Content'}
                      </label>
                      <textarea 
                        rows={broadcastType === 'email' ? 10 : 4} 
                        placeholder={broadcastType === 'email' ? "Write your email content here..." : "Write your message here..."} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] resize-none font-mono" 
                      />
                    </div>

                    {broadcastType === 'email' && (
                      <div className="p-6 rounded-2xl bg-[var(--color-supreme-gold)]/5 border border-[var(--color-supreme-gold)]/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Banner Image</p>
                          <p className="text-[10px] text-gray-500">Recommended: 1200x600px, Max 2MB</p>
                        </div>
                        <button className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/10">Upload</button>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-6">
                      <button className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-supreme-gold)]/20">
                        <Send className="w-5 h-5" /> {broadcastType === 'email' ? 'Send Email Broadcast' : 'Deploy Push Notification'}
                      </button>
                      <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & History */}
              <div className="space-y-8">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-6">Recent Activity</h4>
                  <div className="space-y-4">
                    {[
                      { title: 'New Game Live!', date: '2h ago', reach: '12.4K', status: 'Sent', type: 'push', ctr: '8.4%' },
                      { title: 'Weekly Digest #12', date: '1d ago', reach: '45.2K', status: 'Sent', type: 'email', ctr: '22.1%' },
                      { title: 'System Update', date: '3d ago', reach: '120K', status: 'Sent', type: 'push', ctr: '15.2%' },
                      { title: 'Elite Bonus Pack', date: '5d ago', reach: '8.2K', status: 'Sent', type: 'email', ctr: '31.5%' },
                    ].map((notif, i) => (
                      <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${notif.type === 'email' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {notif.type === 'email' ? <Mail className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm truncate w-32">{notif.title}</p>
                              <p className="text-[10px] text-gray-500">{notif.date}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500">{notif.status}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Reach</p>
                            <p className="text-sm font-bold text-white">{notif.reach}</p>
                          </div>
                          <div className="w-px h-8 bg-white/5" />
                          <div className="text-center flex-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">CTR</p>
                            <p className="text-sm font-bold text-emerald-500">{notif.ctr}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-white/5 text-gray-400 text-xs font-bold rounded-xl hover:bg-white/10 transition-all border border-white/5">
                    View Full History
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[var(--color-supreme-gold)]/20 to-amber-600/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    <h4 className="text-lg font-bold text-white">Broadcast Tips</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-xs text-gray-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5" />
                      Keep push titles under 40 characters for best visibility.
                    </li>
                    <li className="text-xs text-gray-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5" />
                      Email broadcasts perform 35% better when sent on Tuesdays.
                    </li>
                    <li className="text-xs text-gray-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5" />
                      Use emojis sparingly to avoid spam filters.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'forex_supreme':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Forex & Supreme Management</h3>
                <p className="text-gray-400">Track traders, manage balances, and configure global parameters</p>
              </div>
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                {[
                  { id: 'traders', label: 'Forex Traders', icon: TrendingUp },
                  { id: 'supreme', label: 'Supreme Users', icon: Coins },
                  { id: 'settings', label: 'Global Settings', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setForexSubTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      forexSubTab === tab.id
                        ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {forexSubTab === 'traders' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white">Forex Traders Tracking</h4>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search traders..." 
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Balance</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Demo Balance</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {siteUsers.filter(u => u.forexBalance !== undefined || u.forexDemoBalance !== undefined).map((trader) => (
                        <tr key={trader.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                                {trader.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{trader.name}</p>
                                <p className="text-[10px] text-gray-500">{trader.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <p className="text-sm font-bold text-emerald-500">${trader.forexBalance?.toLocaleString() || '0.00'}</p>
                          </td>
                          <td className="px-8 py-4">
                            <p className="text-sm font-bold text-blue-400">${trader.forexDemoBalance?.toLocaleString() || '0.00'}</p>
                          </td>
                          <td className="px-8 py-4">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Active</span>
                          </td>
                          <td className="px-8 py-4">
                            <button className="text-[var(--color-supreme-gold)] text-xs font-bold hover:underline">Adjust Balance</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {forexSubTab === 'supreme' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white">Supreme Coin Users</h4>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Supreme Balance</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Free Mining</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mining Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {siteUsers.filter(u => u.supremeBalance !== undefined).map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold text-xs">
                                {user.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{user.name}</p>
                                <p className="text-[10px] text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                              <p className="text-sm font-bold text-white">{user.supremeBalance?.toLocaleString() || '0.00'} SC</p>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-500">${user.freeMiningTotal?.toFixed(2) || '0.00'}</span>
                                <span className="text-gray-400">/ $35</span>
                              </div>
                              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${user.freeMiningTotal && user.freeMiningTotal >= 35 ? 'bg-red-500' : 'bg-[var(--color-supreme-gold)]'}`}
                                  style={{ width: `${Math.min(100, ((user.freeMiningTotal || 0) / 35) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                              user.freeMiningTotal && user.freeMiningTotal >= 35 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {user.freeMiningTotal && user.freeMiningTotal >= 35 ? 'Limit Reached' : 'Mining Active'}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <button className="text-[var(--color-supreme-gold)] text-xs font-bold hover:underline">Manage Wallet</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {forexSubTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    Forex Trading Parameters
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Minimum Deposit ($)</label>
                      <input 
                        type="number" 
                        value={settings.forexMinDeposit}
                        onChange={(e) => updateSettings({ forexMinDeposit: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Minimum Withdrawal ($)</label>
                      <input 
                        type="number" 
                        value={settings.forexMinWithdrawal}
                        onChange={(e) => updateSettings({ forexMinWithdrawal: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Default Leverage</label>
                      <select 
                        value={settings.forexDefaultLeverage}
                        onChange={(e) => updateSettings({ forexDefaultLeverage: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      >
                        <option value={50}>1:50</option>
                        <option value={100}>1:100</option>
                        <option value={200}>1:200</option>
                        <option value={500}>1:500</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">Enable Forex Trading</p>
                        <p className="text-xs text-gray-500">Allow users to access GMT Forex Optimum</p>
                      </div>
                      <button 
                        onClick={() => updateSettings({ forexTradingEnabled: !settings.forexTradingEnabled })}
                        className={`w-12 h-6 rounded-full relative transition-all ${settings.forexTradingEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.forexTradingEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                    Supreme Coin Parameters
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Supreme Fee Percentage (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.supremeFeePercentage}
                          onChange={(e) => updateSettings({ supremeFeePercentage: Number(e.target.value) })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                      </div>
                      <p className="text-[10px] text-gray-600 italic">Current fee applied to Supreme Coin transactions.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20">
                      <p className="text-sm font-bold text-white mb-2">Supreme Economy Info</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Adjusting the fee percentage affects all mining rewards and wallet transfers. 
                        A higher fee increases platform revenue but may discourage user activity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            {/* Dynamic Dashboard Statistics & Load Tracking */}
            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">IP Blocking</h3>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all">Block New IP</button>
                </div>
                <div className="space-y-4">
                  {[
                    { ip: '192.168.1.45', reason: 'Multiple failed logins', date: '2h ago' },
                    { ip: '45.22.11.9', reason: 'DDoS pattern detected', date: '5h ago' },
                    { ip: '103.4.2.1', reason: 'Bot activity', date: '1d ago' },
                  ].map((block, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-mono text-sm text-white">{block.ip}</p>
                        <p className="text-xs text-gray-500">{block.reason}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600 font-bold uppercase">{block.date}</span>
                        <button className="p-2 text-gray-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Security Logs</h3>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all">Export Logs</button>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { time: '10:42:15', event: 'Unauthorized login attempt blocked', ip: '192.168.1.45', severity: 'High' },
                  { time: '10:38:02', event: 'System backup completed successfully', ip: 'Internal', severity: 'Low' },
                  { time: '10:35:50', event: 'Firewall rules updated', ip: 'Admin (ID: 42)', severity: 'Medium' },
                  { time: '10:30:12', event: 'DDoS protection triggered', ip: 'Multiple Sources', severity: 'High' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 font-mono text-xs">
                    <span className="text-gray-500">[{log.time}]</span>
                    <span className={`px-2 py-0.5 rounded ${
                      log.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                      log.severity === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>{log.severity}</span>
                    <span className="text-white flex-1">{log.event}</span>
                    <span className="text-gray-500">{log.ip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <h3 className="text-xl font-bold text-white mb-8">Admin Security Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Update Credentials */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update Credentials</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">New Email</label>
                      <input 
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        placeholder="Enter new admin email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">New Password</label>
                      <input 
                        type="password"
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        placeholder="Enter new admin password"
                      />
                    </div>
                    <button 
                      onClick={handleUpdateAdminAuth}
                      className="w-full py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Update Admin Credentials
                    </button>
                  </div>
                </div>

                {/* Security Keys */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generate Security Keys</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Master Admin</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button 
                        onClick={() => handleGenerateKey(user?.uid || '')}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" /> Generate Key
                      </button>
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {miniAdmins.map(admin => (
                        <div key={admin.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                          <button 
                            onClick={() => handleGenerateKey(admin.adminId)}
                            className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2"
                          >
                            <Key className="w-4 h-4" /> Generate Key
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'admin_management':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Admin Management</h3>
                <p className="text-gray-400">Manage master and mini-administrators</p>
              </div>
              <button 
                onClick={() => setShowAddAdminModal(true)}
                className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Mini-Admin
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Master Admin Section */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-lg font-bold text-white mb-6">Master Admin Account</h4>
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-4 border-white/10" />
                      <div>
                        <p className="text-xl font-bold text-white">Master Admin</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Update Email</label>
                        <input 
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                          placeholder="New email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Update Password</label>
                        <input 
                          type="password"
                          value={newAdminPass}
                          onChange={(e) => setNewAdminPass(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                          placeholder="New password"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={handleUpdateAdminAuth}
                          className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" /> Save Changes
                        </button>
                        <button 
                          onClick={() => handleGenerateKey(user?.uid || '')}
                          className="px-6 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                        >
                          <Key className="w-5 h-5" /> Key
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini-Admins Section */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-lg font-bold text-white mb-6">Mini-Administrators</h4>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {miniAdmins.map(admin => (
                    <div key={admin.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                            {admin.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                          {admin.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGenerateKey(admin.adminId)}
                          className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Key className="w-4 h-4" /> Security Key
                        </button>
                        <button 
                          onClick={() => setConfirmAction({ type: 'remove-admin', targetId: admin.id!, targetName: admin.name })}
                          className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {miniAdmins.length === 0 && (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">No mini-admins configured</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'recent_activity':
        return <RecentActivityLog isCompact={false} />;
      case 'audit_logs':
        return <AdminAuditLogs />;
      case 'chat':
        return (
          <div className="h-[700px] bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden flex shadow-2xl">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Support Inbox</h3>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    {tickets.filter(t => t.active).length} Active
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {tickets.filter(t => t.active).map((chat, idx) => (
                    <motion.button 
                      key={chat.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all group relative ${
                        activeChatId === chat.id 
                          ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg shadow-[var(--color-supreme-gold)]/10' 
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full border-2 ${activeChatId === chat.id ? 'border-black/20' : 'border-white/10'} bg-white/10 flex items-center justify-center font-bold`}>
                          {chat.name[0]}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${activeChatId === chat.id ? 'border-[var(--color-supreme-gold)]' : 'border-black'} ${
                          chat.status === 'online' ? 'bg-emerald-500' : chat.status === 'away' ? 'bg-amber-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`font-bold text-sm truncate ${activeChatId === chat.id ? 'text-black' : 'text-white'}`}>{chat.name}</p>
                          <span className={`text-[10px] ${activeChatId === chat.id ? 'text-black/60' : 'text-gray-500'}`}>{chat.time}</span>
                        </div>
                        <p className={`text-xs truncate ${activeChatId === chat.id ? 'text-black/70' : 'text-gray-500'}`}>{chat.subject}</p>
                      </div>
                      {chat.priority === 'high' && activeChatId !== chat.id && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
                {tickets.filter(t => t.active).length === 0 && (
                  <div className="text-center py-12 opacity-20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-xs">No active tickets</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-black/40">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-white/10 shadow-lg flex items-center justify-center font-bold text-black border-4 border-white/10">
                    {activeChatId !== null ? tickets.find(t => t.id === activeChatId)?.name[0] : 'S'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {activeChatId !== null ? tickets.find(t => t.id === activeChatId)?.name : 'Select a Chat'}
                    </p>
                    <div className="flex items-center gap-2">
                       {activeChatId !== null && tickets.find(t => t.id === activeChatId)?.status === 'online' ? (
                         <>
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
                         </>
                       ) : (
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Offline</p>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5">
                    <UserCheck className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {isClosingTicket ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <button 
                        onClick={() => setIsClosingTicket(false)}
                        className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          if (activeChatId !== null) {
                            setTickets(prev => prev.map(t => t.id === activeChatId ? { ...t, active: false } : t));
                            toast.success('Ticket closed successfully');
                            setActiveChatId(null);
                            setIsClosingTicket(false);
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20"
                      >
                        Confirm Close
                      </button>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => setIsClosingTicket(true)}
                      className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="flex justify-center">
                  <span className="px-4 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/5">Today</span>
                </div>
                
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-sm text-gray-300 leading-relaxed">
                      Hello, I'm having trouble with my last transaction. It shows as "pending" for over 24 hours now. Can you help?
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold">10:42 AM</p>
                  </div>
                </div>

                <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)] flex-shrink-0 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="bg-[var(--color-supreme-gold)] p-4 rounded-2xl rounded-tr-none text-sm text-black font-medium leading-relaxed shadow-lg shadow-[var(--color-supreme-gold)]/10">
                      Hello Alex! I'm looking into this for you right now. It seems there was a minor delay in the blockchain confirmation. I've manually accelerated the process.
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold">10:45 AM • Read</p>
                  </div>
                </div>

                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-sm text-gray-300 leading-relaxed">
                      Oh, thank you so much! I see it now. It just updated to "completed". Great support!
                    </div>
                    <p className="text-[10px] text-gray-600 font-bold">10:46 AM</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-6 bg-white/5 border-t border-white/10">
                <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-[var(--color-supreme-gold)] transition-all">
                  <button className="p-3 text-gray-500 hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <input 
                    type="text"
                    value={chatResponse}
                    onChange={(e) => setChatResponse(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatResponse.trim() && !isSending) {
                        setIsSending(true);
                        setTimeout(() => {
                          setChatResponse('');
                          setIsSending(false);
                          toast.success('Response sent');
                        }, 500);
                      }
                    }}
                    placeholder="Type your response..."
                    className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none px-2"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!chatResponse.trim() || isSending}
                    onClick={() => {
                      setIsSending(true);
                      setTimeout(() => {
                        setChatResponse('');
                        setIsSending(false);
                        toast.success('Response sent');
                      }, 500);
                    }}
                    className="p-3 bg-[var(--color-supreme-gold)] text-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSending ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'million_deals':
        return <MillionDealsAdmin />;
      case 'ads':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Ads Manager</h3>
                <p className="text-gray-400">Control platform-wide advertising campaigns</p>
              </div>
              <button className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" /> New Campaign
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Summer Sale 2024', status: 'Active', reach: '1.2M', clicks: '45K', ctr: '3.8%' },
                { name: 'Pro Subscription Promo', status: 'Paused', reach: '840K', clicks: '12K', ctr: '1.4%' },
                { name: 'Million Deals Launch', status: 'Active', reach: '2.5M', clicks: '120K', ctr: '4.8%' },
              ].map((ad, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-[var(--color-supreme-gold)]/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="font-bold text-white">{ad.name}</h4>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${ad.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-gray-500'}`}>{ad.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Reach</p>
                      <p className="text-lg font-bold text-white">{ad.reach}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Clicks</p>
                      <p className="text-lg font-bold text-white">{ad.clicks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">CTR</p>
                      <p className="text-lg font-bold text-white">{ad.ctr}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors">Edit</button>
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors">Stats</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Content Moderation</h3>
                <p className="text-gray-400">Review flagged posts and media</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20">Flagged (12)</button>
                <button className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-xs font-bold">All Content</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div>
                      <p className="font-bold text-white text-sm">User_{i*123}</p>
                      <p className="text-xs text-gray-500">Flagged for: Inappropriate Content</p>
                    </div>
                    <span className="ml-auto text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">High Risk</span>
                  </div>
                  <div className="aspect-video bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-white/5">
                    <ImageIcon className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-sm text-gray-300 mb-6">"This is a sample post content that has been flagged by the community for review by an administrator..."</p>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold transition-all">Approve</button>
                    <button className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all">Remove</button>
                    <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings': {
        const currentSettings = localSystemSettings || settings;
        return (
          <div className="max-w-4xl space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white">System Settings</h3>
              <p className="text-gray-400">Configure core platform parameters</p>
            </div>

            {/* Payment & Payout Configuration */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Payment & Payout Configuration</h4>
                  <p className="text-sm text-gray-500">Manage how the platform handles money</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Stripe Platform Account</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={currentSettings.stripePlatformAccount}
                        onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), stripePlatformAccount: e.target.value }))}
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 italic">Configured via STRIPE_SECRET_KEY environment variable.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">PayPal Business Email</label>
                    <input 
                      type="email" 
                      placeholder="paypal@yourdomain.com"
                      value={currentSettings.paypalBusinessEmail}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), paypalBusinessEmail: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                    <p className="text-[10px] text-gray-600 italic">Used for manual payouts and platform notifications.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Bitcoin Wallet Address</label>
                    <input 
                      type="text" 
                      placeholder="bc1q..."
                      value={currentSettings.bitcoinWalletAddress}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), bitcoinWalletAddress: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                    <p className="text-[10px] text-gray-600 italic">Used for receiving platform fees via Bitcoin.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Platform Fee Percentage</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={currentSettings.platformFeePercentage}
                        onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), platformFeePercentage: Number(e.target.value) }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Tether USDT Wallet Address (TRC20)</label>
                    <input 
                      type="text" 
                      placeholder="TYfVf..."
                      value={currentSettings.usdtWalletAddress || ''}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), usdtWalletAddress: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                    <p className="text-[10px] text-gray-600 italic">Used for receiving stablecoin deposits and payouts.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Bank Wire IBAN / Coordinates</label>
                    <input 
                      type="text" 
                      placeholder="GB49 APEX..."
                      value={currentSettings.bankWireCoordinates || ''}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), bankWireCoordinates: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                    <p className="text-[10px] text-gray-600 italic">Used as the default bank account for manual clearing wire deposits.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Minimum Payout Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                      <input 
                        type="number" 
                        value={currentSettings.minimumPayoutAmount}
                        onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), minimumPayoutAmount: Number(e.target.value) }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Global Payout Limit</label>
                    <input 
                      type="text" 
                      value={currentSettings.globalPayoutLimit}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), globalPayoutLimit: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-500">Security Note</p>
                      <p className="text-xs text-emerald-500/70">All financial settings require Super Admin privileges. Changes are logged for audit purposes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
              <h4 className="text-xl font-bold text-white mb-6">General Platform Controls</h4>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { id: 'maintenanceMode', title: 'Maintenance Mode', desc: 'Temporarily disable public access to the platform', type: 'toggle', active: currentSettings.maintenanceMode },
                  { id: 'userRegistration', title: 'User Registration', desc: 'Allow new users to create accounts', type: 'toggle', active: currentSettings.userRegistration },
                  { id: 'aiFeatures', title: 'AI Features', desc: 'Enable Gemini-powered tools across the app', type: 'toggle', active: currentSettings.aiFeatures },
                  { id: 'adFrequency', title: 'Ad Frequency', desc: 'Number of posts between ad banners', type: 'input', value: currentSettings.adFrequency },
                ].map((setting, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{setting.title}</h4>
                      <p className="text-sm text-gray-500">{setting.desc}</p>
                    </div>
                    {setting.type === 'toggle' ? (
                      <button 
                        onClick={() => setLocalSystemSettings(prev => ({ ...(prev || settings), [setting.id]: !setting.active }))}
                        className={`w-12 h-6 rounded-full relative transition-all ${setting.active ? 'bg-[var(--color-supreme-gold)]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.active ? 'right-1' : 'left-1'}`} />
                      </button>
                    ) : (
                      <input 
                        type="number" 
                        value={setting.value}
                        onChange={(e) => setLocalSystemSettings(prev => ({ ...(prev || settings), [setting.id]: Number(e.target.value) }))}
                        className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm w-32 text-right focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                onClick={async () => {
                  if (isSavingSettings) return;
                  setIsSavingSettings(true);
                  try {
                    await updateSettings(currentSettings);
                    toast.success('Central system settings updated and saved successfully!');
                  } catch (error: any) {
                    toast.error('Failed to update system settings: ' + error.message);
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                disabled={isSavingSettings}
                className="px-8 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingSettings ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset system settings to template defaults?")) {
                    const defaults = {
                      stripePlatformAccount: 'billworlddream1@gmail.com',
                      paypalBusinessEmail: 'billworlddream1@gmail.com',
                      bitcoinWalletAddress: '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm',
                      platformFeePercentage: 15,
                      minimumPayoutAmount: 50,
                      maintenanceMode: false,
                      userRegistration: true,
                      aiFeatures: true,
                      adFrequency: 5,
                    };
                    setLocalSystemSettings(prev => ({ ...(prev || settings), ...defaults }));
                    toast.info("System settings restored to template defaults. Click 'Save Changes' to commit.");
                  }
                }}
                className="px-8 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        );
      }
      case 'mining_management':
        return <AdminMiningManager />;
      case 'rewards':
        return <AdminRewards />;
      case 'supreme_market':
        return <SupremeMarketAdmin />;
      default:
        return null;
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  return (
    <div className="min-h-screen bg-[#4a0404] flex relative">
      {/* Sidebar Toggle (when hidden) */}
      {isSidebarHidden && (
        <button 
          onClick={() => setIsSidebarHidden(false)}
          className="fixed left-4 top-4 z-[60] p-3 bg-[var(--color-supreme-gold)] text-black rounded-2xl shadow-2xl hover:scale-110 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div className={clsx(
        "bg-black/60 backdrop-blur-2xl border-r border-white/10 hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300 relative",
        isSidebarHidden ? "w-0 overflow-hidden border-none" : (isSidebarCollapsed ? "w-20" : "w-72")
      )}>
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center text-black shadow-lg z-50 hover:scale-110 transition-transform"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Hide Button */}
        <button 
          onClick={() => setIsSidebarHidden(true)}
          className="absolute -right-3 top-20 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg z-50 hover:scale-110 transition-transform"
          title="Hide Sidebar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={clsx("p-8", isSidebarCollapsed && "p-4 flex flex-col items-center")}>
          <div className={clsx("flex items-center gap-3 mb-8", isSidebarCollapsed && "justify-center")}>
            <div className="w-10 h-10 bg-[var(--color-supreme-gold)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            {!isSidebarCollapsed && (
              <h2 className="text-xl font-display font-bold text-white tracking-tight truncate">Supreme <span className="text-[var(--color-supreme-gold)]">Admin</span></h2>
            )}
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={clsx(
                  "w-full flex items-center gap-3 rounded-2xl font-bold transition-all",
                  isSidebarCollapsed ? "p-3 justify-center" : "px-4 py-3",
                  activeTab === item.id 
                    ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg shadow-[var(--color-supreme-gold)]/20 scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={clsx("w-5 h-5 shrink-0", activeTab === item.id ? 'text-black' : 'text-emerald-500')} />
                {!isSidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            <h2 className="font-display font-bold text-white">Supreme Admin</h2>
          </div>
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none"
          >
            {SIDEBAR_ITEMS.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className="p-4 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                  {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label} <span className="text-[var(--color-supreme-gold)]">Console</span>
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Control and monitor your platform's performance.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last 30 Days
                </button>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
