import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  MapPin, 
  Wifi, 
  Monitor, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  Shield, 
  Smartphone, 
  Tv, 
  Cpu,
  ArrowUpDown,
  History,
  Activity,
  User,
  Zap,
  Info,
  Radio
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit, 
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface ConnectivityLog {
  id: string;
  userId: string;
  ip: string;
  country: string;
  city: string;
  networkType: string;
  networkStrength: string;
  browser: string;
  browserVersion: string;
  device: string;
  os: string;
  timestamp: any;
  userAgent: string;
}

export default function ConnectivityMonitor() {
  const [logs, setLogs] = useState<ConnectivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedLog, setSelectedLog] = useState<ConnectivityLog | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'connectivity_logs'),
      orderBy('timestamp', sortOrder),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectivityLog[];
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.ip.includes(searchQuery) || 
      log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'mobile') return matchesSearch && log.device.toLowerCase().includes('mobile');
    if (filterType === 'desktop') return matchesSearch && !log.device.toLowerCase().includes('mobile');
    return matchesSearch;
  });

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile') || d.includes('iphone') || d.includes('android')) return <Smartphone className="w-4 h-4" />;
    if (d.includes('tablet') || d.includes('ipad')) return <Smartphone className="w-4 h-4 rotate-90" />;
    if (d.includes('tv')) return <Tv className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getNetworkColor = (strength: string) => {
    const s = strength.toLowerCase();
    if (s.includes('4g') || s.includes('wifi') || s.includes('ethernet')) return 'text-emerald-500';
    if (s.includes('3g')) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 gap-4">
        <Activity className="w-12 h-12 animate-pulse text-[var(--color-supreme-gold)]" />
        <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Connectivity Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
            Live Connectivity Monitor
          </h2>
          <p className="text-gray-400 text-sm">Real-time tracking of user network strength, location, and device patterns.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-white">Live Feed Active</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Locations</span>
          </div>
          <p className="text-2xl font-bold text-white">{new Set(logs.map(l => l.city)).size}</p>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Wifi className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hi-Speed Share</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.round((logs.filter(l => l.networkStrength === '4g' || l.networkStrength === 'wifi').length / logs.length) * 100) || 0}%
          </p>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary OS</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {logs.length > 0 ? (() => {
              const osCounts = logs.reduce((acc, curr) => {
                const os = curr.os.split(' ')[0] || 'Unknown';
                acc[os] = (acc[os] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const topOs = Object.entries(osCounts).sort((a, b) => b[1] - a[1])[0];
              return topOs ? `${topOs[0]} (${Math.round((topOs[1] / logs.length) * 100)}%)` : 'N/A';
            })() : 'N/A'}
          </p>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">IP Conflicts</span>
          </div>
          <p className="text-2xl font-bold text-white">{logs.filter((l, i) => logs.findIndex(ll => ll.ip === l.ip) !== i).length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by IP, City, User ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterType('all')}
            className={clsx("px-4 py-2 rounded-xl text-xs font-bold transition-all", filterType === 'all' ? 'bg-[var(--color-supreme-gold)] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('mobile')}
            className={clsx("px-4 py-2 rounded-xl text-xs font-bold transition-all", filterType === 'mobile' ? 'bg-[var(--color-supreme-gold)] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            Mobile
          </button>
          <button 
            onClick={() => setFilterType('desktop')}
            className={clsx("px-4 py-2 rounded-xl text-xs font-bold transition-all", filterType === 'desktop' ? 'bg-[var(--color-supreme-gold)] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            Desktop
          </button>
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10 flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account / ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Network Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Geo Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">System & Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.tr 
                    layout
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)]/10 flex items-center justify-center text-[var(--color-supreme-gold)] text-xs font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[120px]">{log.userId}</p>
                          <p className="text-[10px] font-mono text-gray-500">{log.ip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Wifi className={clsx("w-3.5 h-3.5", getNetworkColor(log.networkStrength))} />
                          <span className="text-xs font-bold text-white uppercase">{log.networkType}</span>
                        </div>
                        <span className={clsx("text-[10px] font-medium", getNetworkColor(log.networkStrength))}>
                          {log.networkStrength} Strength
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-white">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-xs font-bold">{log.city}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 ml-5">{log.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white">
                          {getDeviceIcon(log.device)}
                          <span className="text-xs font-medium">{log.browser}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{log.os}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono">
                          {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/10 transition-all opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
          <div className="p-4 rounded-full bg-white/5 w-fit mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {/* Log Detail Sidebar / Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/20">
                    <History className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                  </div>
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Detailed Session Analysis</h3>
                <p className="text-gray-400 text-sm font-mono tracking-tighter">LOG-ID: {selectedLog.id.substring(0, 16)}...</p>
              </div>

              <div className="p-8 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Identity & Address</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <User className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                        <span className="text-sm font-bold text-white">{selectedLog.userId}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-mono text-white">{selectedLog.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Network Health</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Wifi className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-gray-400">Type</span>
                        </div>
                        <span className="text-sm font-bold text-white uppercase">{selectedLog.networkType}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-gray-400">Signal</span>
                        </div>
                        <span className={clsx("text-sm font-bold", getNetworkColor(selectedLog.networkStrength))}>
                          {selectedLog.networkStrength.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Environment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-white">{selectedLog.browser} {selectedLog.browserVersion}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Monitor className="w-4 h-4 text-pink-400" />
                        <span className="text-sm text-white">{selectedLog.os}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        {getDeviceIcon(selectedLog.device)}
                        <span className="text-sm text-white">{selectedLog.device}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                       <Info className="w-4 h-4" />
                       <span className="text-xs uppercase tracking-widest">Analyst Note</span>
                    </div>
                    <p className="text-[11px] text-blue-200/70 leading-relaxed italic">
                      "Session originated from {selectedLog.city}, {selectedLog.country} via {selectedLog.networkType} connection. Device signature match confirmed."
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Raw User Agent</h4>
                <div className="p-4 bg-black rounded-xl border border-white/5 font-mono text-[10px] text-gray-500 break-all leading-relaxed">
                  {selectedLog.userAgent}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  );
}
