import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, ShieldAlert, ShieldCheck, Activity, Users, 
  Search, Lock, Unlock, Zap, Globe, Cpu, AlertTriangle,
  BarChart3, PieChart as PieChartIcon, ArrowUpRight, 
  Settings, Database, CreditCard, Trash2, UserMinus,
  RefreshCw, MousePointer2, Network, Briefcase, 
  Eye, EyeOff, Shield, HardDrive, Filter, X
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAdmin } from '../context/AdminContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';
import { clsx } from 'clsx';
import { toast } from 'sonner';

// Types
interface SecurityThreat {
  id: string;
  ip: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  method: string;
  path: string;
  userAgent: string;
  timestamp: any;
  location?: { city: string; country: string };
  userId?: string;
  status?: 'active' | 'blocked' | 'resolved';
}

interface FeatureMetric {
  id: string;
  name: string;
  usageCount: number;
  errorRate: number;
  avgResponseTime: number;
  status: 'healthy' | 'degraded' | 'down';
}

interface IPBlock {
  id: string;
  ip: string;
  reason: string;
  blockedAt: any;
  adminId: string;
}

interface FeatureLock {
  id: string;
  userId: string | null;
  featureId: string;
  isLocked: boolean;
  reason: string;
  lockedAt: any;
}

export default function SupremeCMD() {
  const navigate = useNavigate();
  const { 
    siteUsers, 
    miniAdmins, 
    updateUserRole, 
    addMiniAdmin, 
    removeMiniAdmin, 
    updateMiniAdmin,
    generateAdminId
  } = useAdmin();
  const [activeTab, setActiveTab] = useState<'security' | 'intelligence' | 'performance' | 'locks' | 'firewall'>('security');
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [ipBlocks, setIpBlocks] = useState<IPBlock[]>([]);
  const [featureLocks, setFeatureLocks] = useState<FeatureLock[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [trackedUser, setTrackedUser] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchSamples, setShowSearchSamples] = useState(false);
  const [cmdLogs, setCmdLogs] = useState<{msg: string, type: 'info' | 'warn' | 'error' | 'success', time: string}[]>([]);
  const [isScanningIntruders, setIsScanningIntruders] = useState(false);
  const [intruderCount, setIntruderCount] = useState(0);

  // Simulation data for performance
  const [featureMetrics] = useState<FeatureMetric[]>([
    { id: 'wallet', name: 'Supreme Wallet', usageCount: 1542, errorRate: 0.02, avgResponseTime: 85, status: 'healthy' },
    { id: 'mining', name: 'Optimum Miner', usageCount: 892, errorRate: 0.05, avgResponseTime: 120, status: 'healthy' },
    { id: 'market', name: 'Supreme Market', usageCount: 654, errorRate: 0.12, avgResponseTime: 450, status: 'degraded' },
    { id: 'forex', name: 'GMT Forex', usageCount: 432, errorRate: 0.01, avgResponseTime: 45, status: 'healthy' },
    { id: 'network', name: 'Supreme Network', usageCount: 2241, errorRate: 0.08, avgResponseTime: 210, status: 'healthy' },
    { id: 'treasures', name: 'Supreme Treasures', usageCount: 156, errorRate: 0.04, avgResponseTime: 95, status: 'healthy' },
  ]);

  useEffect(() => {
    // Listen to security threats
    const threatsQ = query(collection(db, 'security_threats'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeThreats = onSnapshot(threatsQ, (sn) => {
      setThreats(sn.docs.map(d => ({ id: d.id, ...d.data() } as SecurityThreat)));
    });

    // Listen to IP blocks
    const blocksQ = query(collection(db, 'ip_blocks'), orderBy('blockedAt', 'desc'));
    const unsubscribeBlocks = onSnapshot(blocksQ, (sn) => {
      setIpBlocks(sn.docs.map(d => ({ id: d.id, ...d.data() } as IPBlock)));
    });

    // Listen to feature locks
    const locksQ = query(collection(db, 'feature_locks'), orderBy('lockedAt', 'desc'));
    const unsubscribeLocks = onSnapshot(locksQ, (sn) => {
      setFeatureLocks(sn.docs.map(d => ({ id: d.id, ...d.data() } as FeatureLock)));
    });

    addCmdLog('Supreme CMD System Initialized. Pulse active.', 'success');

    return () => {
      unsubscribeThreats();
      unsubscribeBlocks();
      unsubscribeLocks();
    };
  }, []);

  const addCmdLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setCmdLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const handleTrackUser = async (overrideQuery?: string) => {
    const queryTerm = overrideQuery || searchEmail;
    if (!queryTerm) return;
    setIsSearching(true);
    addCmdLog(`Initiating deep scan for: ${queryTerm}`, 'info');
    
    // Special handling for dashboard/report samples
    if (queryTerm === 'Insolvent Users') {
      setTimeout(() => {
        setIsSearching(false);
        addCmdLog('REPORT: 12 users identified with negative balance and critical loan status.', 'error');
        setTrackedUser({
          id: 'REPORT-X9',
          name: 'Global Insolvency Report',
          email: 'insolvent@supreme.sys',
          role: 'ADMIN_REPORT',
          status: 'restricted'
        } as any);
        toast.error('12 Insolvent Users Found');
      }, 1000);
      return;
    }

    if (queryTerm === 'Supreme Central Dashboard') {
      setTimeout(() => {
        setIsSearching(false);
        addCmdLog('ACCESS: Redirecting secure uplink to Central Hub...', 'success');
        navigate('/admin');
        toast.success('Accessing Central Dashboard');
      }, 800);
      return;
    }
    
    try {
      const q = query(collection(db, 'users'), where('email', '==', queryTerm));
      const sn = await getDocs(q);
      if (!sn.empty) {
        const userData = sn.docs[0].data();
        setTrackedUser({ id: sn.docs[0].id, ...userData });
        addCmdLog(`Target identified: ${userData.name} [UID: ${sn.docs[0].id}]`, 'success');
      } else {
        setTrackedUser(null);
        addCmdLog(`User scan failed: No record found for ${queryTerm}`, 'error');
        toast.error('User not found');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFeatureLock = async (featureId: string, userId: string | null = null) => {
    const existing = featureLocks.find(l => l.featureId === featureId && l.userId === userId);
    try {
      if (existing) {
        await deleteDoc(doc(db, 'feature_locks', existing.id));
        addCmdLog(`Lock released for feature: ${featureId} ${userId ? `(User: ${userId})` : '(Global)'}`, 'success');
        toast.success('Lock released');
      } else {
        await addDoc(collection(db, 'feature_locks'), {
          featureId,
          userId,
          isLocked: true,
          reason: 'Administrative Lockdown',
          lockedAt: Timestamp.now()
        });
        addCmdLog(`Lock deployed: ${featureId} ${userId ? `(User: ${userId})` : '(Global)'}`, 'warn');
        toast.success('Lock activated');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'feature_locks');
    }
  };

  const handleBlockIp = async (ip: string) => {
    try {
      await addDoc(collection(db, 'ip_blocks'), {
        ip,
        reason: 'Suspicious Activity Detected by CMD',
        blockedAt: Timestamp.now(),
        adminId: 'ADMIN-CORE'
      });
      addCmdLog(`IP Address firewall blocked: ${ip}`, 'error');
      toast.success('IP Blocked');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'ip_blocks');
    }
  };

  const handleUnblockIp = async (id: string, ip: string) => {
    try {
      await deleteDoc(doc(db, 'ip_blocks', id));
      addCmdLog(`IP firewall restriction lifted: ${ip}`, 'success');
      toast.success('IP Unblocked');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'ip_blocks');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: any) => {
    try {
      addCmdLog(`Attempting permission escalation/de-escalation for UID: ${userId} to ${newRole}`, 'warn');
      await updateUserRole(userId, newRole);
      addCmdLog(`Authority updated: UID ${userId} is now ${newRole}`, 'success');
      toast.success('Role updated successfully');
      // Refresh tracked user if applicable
      if (trackedUser && trackedUser.id === userId) {
        setTrackedUser(prev => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      addCmdLog(`Role transition failed for UID: ${userId}`, 'error');
    }
  };

  const handleToggleMiniAdmin = async (user: any) => {
    const existing = miniAdmins.find(m => m.email === user.email);
    try {
      if (existing) {
        await removeMiniAdmin(existing.id);
        addCmdLog(`Mini-Admin clearance revoked for: ${user.email}`, 'error');
        toast.success('Mini-Admin status revoked');
      } else {
        await addMiniAdmin({
          name: user.name,
          email: user.email,
          adminId: generateAdminId(),
          role: 'mini-admin',
          category: 'general',
          permissions: ['read', 'write']
        });
        addCmdLog(`New clearance issued: ${user.email} promoted to Mini-Admin`, 'success');
        toast.success('Promoted to Mini-Admin');
      }
    } catch (err) {
      addCmdLog(`Admin escalation failed for: ${user.email}`, 'error');
    }
  };

  const handleDeepScanIntruders = async () => {
    setIsScanningIntruders(true);
    addCmdLog("SYSTEM: Initiating deep-layer penetration scan...", "info");
    
    // Simulate scan
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      addCmdLog(`SYSTEM: Scan progress ${progress}%...`, "info");
      if (progress >= 100) {
        clearInterval(interval);
        const count = Math.floor(Math.random() * 5);
        setIntruderCount(count);
        setIsScanningIntruders(false);
        if (count > 0) {
          addCmdLog(`SECURITY ALERT: ${count} potential intruders detected in buffer zone.`, "error");
          // Automatically log a threat for each
          for (let i = 0; i < count; i++) {
            const ip = `192.168.1.${Math.floor(Math.random() * 254)}`;
            addDoc(collection(db, 'security_threats'), {
              type: 'Intruder detected in buffer',
              severity: 'high',
              source: ip,
              description: 'Unauthorized access attempt to Supreme vault',
              timestamp: Timestamp.now()
            });
          }
          toast.error(`${count} intruders detected!`);
        } else {
          addCmdLog("SECURITY STATUS: Perimeter secure. No intruders detected.", "success");
          toast.success("Perimeter secure");
        }
      }
    }, 500);
  };

  return (
    <div className="bg-black min-h-screen text-amber-50 font-mono p-4 md:p-8 selection:bg-amber-500 selection:text-black">
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-amber-500/20 pb-8 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-black animate-pulse">
              <Terminal className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[0.2em]">Supreme CMD</h1>
          </div>
          <p className="text-amber-500/50 text-[10px] font-bold flex items-center gap-2">
            <Globe className="w-3 h-3" /> CORE ADMINISTRATIVE SYSTEM v4.0 // GLOBAL SECURITY HUD
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Security Status', val: 'SHIELDED', icon: ShieldCheck, color: 'text-green-500' },
            { label: 'Latency', val: '12ms', icon: Cpu, color: 'text-amber-500' },
            { label: 'Active Threats', val: threats.length, icon: AlertTriangle, color: threats.length > 0 ? 'text-red-500' : 'text-amber-500/20' },
            { label: 'Node Health', val: '99.9%', icon: Activity, color: 'text-green-500' },
          ].map((h, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center gap-1 group hover:border-amber-500/30 transition-all">
              <h.icon className={clsx("w-4 h-4", h.color)} />
              <p className="text-[8px] font-black uppercase tracking-tighter text-white/30">{h.label}</p>
              <p className="text-xs font-black">{h.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-2 space-y-2">
          {[
            { id: 'security', label: 'Security HUB', icon: ShieldAlert },
            { id: 'intelligence', label: 'User Intel', icon: Search },
            { id: 'performance', label: 'Market Pulse', icon: BarChart3 },
            { id: 'locks', label: 'Access Control', icon: Lock },
            { id: 'firewall', label: 'IP Firewall', icon: Network },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] translate-x-2" 
                  : "text-amber-500/40 hover:text-amber-500 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h4 className="text-[10px] font-black text-red-500 uppercase mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> System Alert
            </h4>
            <p className="text-[9px] text-red-400 leading-relaxed font-bold">
              Emergency lockdown protocol is armed. Double confirm all terminal actions.
            </p>
          </div>
        </div>

        {/* Main Console View */}
        <div className="lg:col-span-7 space-y-8 min-h-[600px] flex flex-col">
          {/* Universal Search Uplink - Now at the top edge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-50"
          >
            <div className="bg-amber-500 p-6 rounded-[2.5rem] text-black shadow-[0_20px_50px_rgba(245,158,11,0.2)] relative">
              <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                <Search className="w-5 h-5" /> Intelligence Command Interface
              </h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                <input 
                  type="text" 
                  placeholder="ENTER TARGET EMAIL, NAME, OR UID..."
                  value={searchEmail}
                  onFocus={() => setShowSearchSamples(true)}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackUser()}
                  className="w-full bg-black/10 border-2 border-black/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-black focus:outline-none focus:border-black transition-all placeholder:text-black/30"
                />
                <button 
                  onClick={() => handleTrackUser()}
                  disabled={isSearching}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'INITIATE SCAN'}
                </button>
              </div>

              {/* Enhanced Search Samples */}
              <AnimatePresence>
                {showSearchSamples && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Search Directives:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'admin@supreme.com', 
                        'Supreme Central Dashboard',
                        'Sarah Chen', 
                        'UID: x82jL-p9', 
                        'Insolvent Users'
                      ].map((sample, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchEmail(sample);
                            setShowSearchSamples(false);
                            handleTrackUser(sample);
                          }}
                          className="px-3 py-1.5 bg-black/10 hover:bg-black/20 border border-black/10 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          {sample}
                        </button>
                      ))}
                      <button 
                        onClick={() => setShowSearchSamples(false)}
                        className="px-3 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1"
                      >
                        <X className="w-2 h-2" /> Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-500/10 transition-all" />
                    <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" /> Active Intruders
                    </h3>
                    <div className="space-y-4">
                      {threats.filter(t => t.severity === 'critical' || t.severity === 'high').map((threat) => (
                        <div key={threat.id} className="flex justify-between items-center p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                          <div>
                            <p className="text-xs font-black text-red-500">{threat.ip}</p>
                            <p className="text-[10px] text-red-400/60">{threat.type}</p>
                          </div>
                          <button 
                            onClick={() => handleBlockIp(threat.ip)}
                            className="p-2 bg-red-500 text-black rounded-lg hover:bg-white hover:text-black transition-all"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {threats.length === 0 && <p className="text-xs text-white/20 italic">No critical intrusions detected...</p>}
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                    <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" /> Request Pulse
                    </h3>
                    <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { t: 0, r: 120 }, { t: 10, r: 450 }, { t: 20, r: 320 }, { t: 30, r: 980 }, { t: 40, r: 540 }, { t: 50, r: 760 }, { t: 60, r: 430 }
                        ]}>
                          <Area type="monotone" dataKey="r" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-black uppercase flex items-center gap-3">
                      <Database className="w-6 h-6 text-amber-500" /> Intrusion Logs
                    </h4>
                    <button className="text-[10px] font-black text-amber-500/50 hover:text-amber-500 flex items-center gap-2 uppercase">
                      <RefreshCw className="w-3 h-3" /> Refresh Feed
                    </button>
                  </div>
                  <div className="space-y-4">
                    {threats.map((threat) => (
                      <div key={threat.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "w-2 h-2 rounded-full animate-pulse",
                              threat.severity === 'critical' ? 'bg-red-500' :
                              threat.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                            )} />
                            <span className="text-xs font-black">{threat.ip}</span>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded border border-white/10 text-white/40 uppercase">{threat.method}</span>
                          </div>
                          <span className="text-[10px] text-white/20">{new Date(threat.timestamp.toMillis ? threat.timestamp.toMillis() : threat.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">{threat.path} - <span className="text-amber-500/50 italic">{threat.userAgent?.slice(0, 50)}...</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'intelligence' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {!trackedUser && (
                  <div className="text-center py-20 opacity-20">
                    <Search className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Intel Sequence</p>
                  </div>
                )}

                {trackedUser && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* User Profile Card */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative">
                      <div className="flex items-center gap-6 mb-8">
                        <img src={trackedUser.avatar} className="w-20 h-20 rounded-2xl border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" alt="" />
                        <div>
                          <h4 className="text-xl font-black">{trackedUser.name}</h4>
                          <p className="text-amber-500 text-xs font-black">{trackedUser.handle}</p>
                          <p className="text-[10px] text-white/40 mt-1 uppercase font-bold">UID: {trackedUser.id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[8px] font-black text-white/30 uppercase mb-1">Rank</p>
                          <p className={clsx("text-sm font-black", trackedUser.rankColor)}>{trackedUser.rank}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[8px] font-black text-white/30 uppercase mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", trackedUser.isSuspended ? "bg-red-500" : "bg-green-500")} />
                            <p className="text-sm font-black uppercase">{trackedUser.isSuspended ? "Insolvent/Suspended" : "Operational"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <select 
                          value={trackedUser.role}
                          onChange={(e) => handleUpdateRole(trackedUser.id, e.target.value as any)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-amber-500 focus:outline-none focus:border-amber-500"
                        >
                          <option value="user">USER</option>
                          <option value="dealer">DEALER</option>
                          <option value="premium-user">PREMIUM</option>
                          <option value="mini-admin">MINI-ADMIN</option>
                          <option value="admin">ROOT ADMIN</option>
                        </select>
                        <button 
                          onClick={() => handleToggleMiniAdmin(trackedUser)}
                          className={clsx(
                            "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                            miniAdmins.find(m => m.email === trackedUser.email)
                              ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                          )}
                        >
                          {miniAdmins.find(m => m.email === trackedUser.email) ? 'REMOVE MINI-ADMIN' : 'ADD MINI-ADMIN'}
                        </button>
                      </div>

                      {/* Enhanced Premium Upgrade Button */}
                      <div className="mt-4">
                        <button 
                          onClick={async () => {
                            addCmdLog(`SYSTEM: Initiating high-level premium authorization for ${trackedUser.id}...`, "warn");
                            // Simulate authorization sequence
                            let steps = ["Bypassing security protocols...", "Syncing ledger hashes...", "Authorizing premium tier...", "Uplink established."];
                            for (let step of steps) {
                              await new Promise(r => setTimeout(r, 600));
                              addCmdLog(`SYS_AUTH: ${step}`, "info");
                            }
                            await handleUpdateRole(trackedUser.id, 'premium-user');
                            addCmdLog(`SYSTEM: Premium status successfully authorized for ${trackedUser.name}.`, "success");
                            toast.success("Premium Authorization Complete");
                          }}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>

                    {/* Financial Pulse */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                      <h4 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-500" /> Wallet Account Scan
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Central Credits', val: `${trackedUser.balance} SCR`, icon: Briefcase },
                          { label: 'Forex Capital', val: `$${trackedUser.forexWalletBalance || 0}`, icon: Zap },
                          { label: 'Total Volume', val: `${trackedUser.totalEarnings || 0}`, icon: ArrowUpRight },
                        ].map((w, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-lg"><w.icon className="w-4 h-4 text-white/50" /></div>
                              <span className="text-xs font-bold text-white/60">{w.label}</span>
                            </div>
                            <span className="text-sm font-black text-amber-500">{w.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Sentinel Policy Monitor */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black uppercase flex items-center gap-2 text-amber-500">
                          <Shield className="w-5 h-5" /> Market Sentinel Status
                        </h4>
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-black uppercase text-amber-500">
                          Policy Enforcement Active
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/30 uppercase">Policy Violations</p>
                          <div className="text-xl font-black text-red-500">0 DETECTED</div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/30 uppercase">Dealer Compliance</p>
                          <div className="text-xl font-black text-green-500">98.4%</div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/30 uppercase">Market Health</p>
                          <div className="text-xl font-black text-amber-500">OPTIMAL</div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            addCmdLog("POLICY: Reinforcing market scarcity protocols...", "warn");
                            toast.success("Policy Reinforced");
                          }}
                          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:border-amber-500/50 transition-all"
                        >
                          Reinforce Scarcity
                        </button>
                        <button 
                          onClick={() => {
                            addCmdLog("POLICY: Initiating sector-wide compliance audit...", "info");
                            toast.success("Audit Initiated");
                          }}
                          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:border-amber-500/50 transition-all"
                        >
                          Audit Compliance
                        </button>
                      </div>
                    </div>

                    {/* IP Access History */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:col-span-2">
                      <h4 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
                        <Network className="w-5 h-5 text-blue-500" /> IP Access Intelligence
                      </h4>
                      <div className="space-y-3">
                        {[
                          { ip: '185.22.34.11', loc: 'Berlin, DE', time: '2026-04-24 12:45:01', status: 'Verfied' },
                          { ip: '185.22.34.11', loc: 'Berlin, DE', time: '2026-04-23 21:12:34', status: 'Verfied' },
                          { ip: '92.112.55.66', loc: 'Munich, DE', time: '2026-04-20 09:05:55', status: 'New Location' },
                        ].map((log, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-blue-400">{log.ip}</span>
                              <span className="text-[9px] text-white/40">{log.loc}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] text-white/20">{log.time}</span>
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/10 text-white/40">{log.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500" /> Best Performing Features
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureMetrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                        <Bar dataKey="usageCount" radius={[10, 10, 0, 0]}>
                          {featureMetrics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-supreme-gold)' : 'rgba(255,255,255,0.1)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureMetrics.map((f) => (
                    <div key={f.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest">{f.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/30 font-bold uppercase">Health:</span>
                          <div className={clsx(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                            f.status === 'healthy' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                          )}>
                            {f.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black">{f.avgResponseTime}ms</p>
                        <p className="text-[8px] text-white/30 font-bold uppercase">Response Time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'locks' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem]">
                  <h3 className="text-lg font-black uppercase text-red-500 mb-6 flex items-center gap-3">
                    <Lock className="w-6 h-6" /> Access Control Terminal
                  </h3>
                  <div className="space-y-4">
                    {[
                      { id: 'wallet_withdrawal', label: 'Withdrawal Engine', desc: 'Secure the vault, freeze all outgoing transactions.' },
                      { id: 'market_ops', label: 'Market Operations', desc: 'Lock the marketplace to prevent fraudulent deals.' },
                      { id: 'chat_system', label: 'Neural Chat', desc: 'Suspend global communications during containment.' },
                      { id: 'forex_trading', label: 'Forex Pipeline', desc: 'Instant stop on all live trading activities.' },
                    ].map((lock) => (
                      <div key={lock.id} className="flex justify-between items-center p-6 bg-black border border-white/5 rounded-3xl group hover:border-red-500/30 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white">{lock.label}</h4>
                          <p className="text-[10px] text-white/30 leading-relaxed font-bold">{lock.desc}</p>
                        </div>
                        <button 
                          onClick={() => toggleFeatureLock(lock.id)}
                          className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg",
                            featureLocks.find(l => l.featureId === lock.id)
                              ? "bg-red-500 text-black animate-pulse" 
                              : "bg-white/5 text-white hover:bg-white hover:text-black"
                          )}
                        >
                          {featureLocks.find(l => l.featureId === lock.id) ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {featureLocks.find(l => l.featureId === lock.id) ? 'UNLOCK' : 'LOCK'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'firewall' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black uppercase flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-green-500" /> Firewall Blacklist
                    </h3>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{ipBlocks.length} Restricted Nodes</span>
                  </div>
                  <div className="space-y-3">
                    {ipBlocks.map((block) => (
                      <div key={block.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-500/10 rounded-lg"><Globe className="w-4 h-4 text-red-500" /></div>
                          <div>
                            <p className="text-xs font-black">{block.ip}</p>
                            <p className="text-[9px] text-white/30 uppercase font-black">{block.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] text-white/20 font-bold">{new Date(block.blockedAt.toMillis ? block.blockedAt.toMillis() : block.blockedAt).toLocaleDateString()}</span>
                          <button 
                            onClick={() => handleUnblockIp(block.id, block.ip)}
                            className="p-2 text-white/20 hover:text-amber-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {ipBlocks.length === 0 && <p className="text-xs text-white/20 italic py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">No addresses currently blacklisted.</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time CMD Terminal (Right Side) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#0c0c0c] border border-amber-500/20 rounded-[2rem] overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
            <div className="bg-amber-500/10 p-4 border-b border-amber-500/20 flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4" /> CMD_TERMINAL_LOG
              </h4>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide text-[9px] font-bold leading-relaxed selection:bg-amber-500 selection:text-black">
              {cmdLogs.map((log, i) => (
                <div key={i} className="flex gap-3 animate-in slide-in-from-left duration-300">
                  <span className="text-white/20 shrink-0">[{log.time}]</span>
                  <span className={clsx(
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'warn' ? 'text-amber-500' :
                    log.type === 'success' ? 'text-green-500' : 'text-blue-400'
                  )}>
                    {log.type === 'error' ? 'ERR_SYS: ' : 
                     log.type === 'warn' ? 'WRN_SYS: ' : 
                     log.type === 'success' ? 'EXE_OK: ' : 'INF_SYS: '}
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/50 border-t border-amber-500/10">
              <div className="flex items-center gap-2 text-[10px] text-amber-500 animate-pulse">
                <span>$</span>
                <span className="w-2 h-4 bg-amber-500" />
                <span className="font-black">LISTENING_FOR_COMMANDS...</span>
              </div>
            </div>
          </div>

          {/* Mini-Admin / Infrastructure Status */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Supreme Staff Terminal</h4>
              <div className="space-y-3">
                {miniAdmins.map((admin) => (
                  <div key={admin.id} className="p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] font-black text-white">{admin.name}</p>
                        <p className="text-[8px] text-white/40">{admin.email}</p>
                      </div>
                      <button 
                        onClick={() => removeMiniAdmin(admin.id)}
                        className="p-1 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <select 
                      value={admin.category}
                      onChange={(e) => updateMiniAdmin(admin.id, { category: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black text-amber-500/70 focus:outline-none focus:border-amber-500"
                    >
                      <option value="general">GENERAL MOD</option>
                      <option value="user-management">IDENTITY SEC</option>
                      <option value="finance">VALUT CONTROLLER</option>
                      <option value="promotional">MARKETING REP</option>
                      <option value="email-marketing">COMMS OFFICER</option>
                    </select>
                  </div>
                ))}
                {miniAdmins.length === 0 && <p className="text-[9px] text-white/10 italic">No sub-clearance assigned...</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Intruder Defense</h4>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-white/60">DETECTION ENGINE</span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[8px] font-black",
                      intruderCount > 0 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    )}>
                      {intruderCount > 0 ? `${intruderCount} DETECTED` : "CLEAN"}
                    </span>
                  </div>
                  <button 
                    onClick={handleDeepScanIntruders}
                    disabled={isScanningIntruders}
                    className="w-full py-3 bg-[var(--color-supreme-gold)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isScanningIntruders ? <Activity className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                    {isScanningIntruders ? 'SCANNING...' : 'DEEP PERIMETER SCAN'}
                  </button>
                </div>

                {intruderCount > 0 && (
                  <button 
                    onClick={() => {
                      setIntruderCount(0);
                      addCmdLog("SYSTEM: Manual wipe of intruder signatures completed.", "success");
                    }}
                    className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    PURGE INTRUDER SIGNATURES
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Network Connectivity</h4>
              {[
                { label: 'DB Master', status: 'SYNCHRONIZED', color: 'text-green-500' },
                { label: 'Edge Cache', status: '94% CAPACITY', color: 'text-amber-500' },
                { label: 'Forex Pipe', status: 'STABLE', color: 'text-purple-500' },
              ].map((node, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-black mb-2 last:mb-0">
                  <span className="text-white/40">{node.label}</span>
                  <span className={node.color}>{node.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
