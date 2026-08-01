import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Shield, 
  ShieldAlert, 
  Users, 
  Sliders, 
  Search, 
  Filter, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Terminal, 
  Globe, 
  UserCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Info, 
  Clock, 
  ExternalLink,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ActivityLog, 
  ActivityCategory, 
  ActivitySeverity, 
  ActivityStatus, 
  subscribeToRecentActivities, 
  logRecentActivity, 
  deleteActivityLog, 
  toggleActivityResolved 
} from '../services/activityLogger';

interface RecentActivityLogProps {
  isCompact?: boolean;
  onViewAll?: () => void;
}

export default function RecentActivityLog({ isCompact = false, onViewAll }: RecentActivityLogProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Manual Log Modal State
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<ActivityCategory>('system_events');
  const [formAction, setFormAction] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formTargetUser, setFormTargetUser] = useState('');
  const [formSeverity, setFormSeverity] = useState<ActivitySeverity>('low');
  const [formStatus, setFormStatus] = useState<ActivityStatus>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToRecentActivities((fetchedLogs) => {
      setLogs(fetchedLogs);
      setLoading(false);
    }, isCompact ? 10 : 100);

    return () => unsubscribe();
  }, [isCompact]);

  const handleCreateCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAction.trim() || !formDetails.trim()) {
      toast.error('Action title and description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logRecentActivity({
        category: formCategory,
        action: formAction.trim(),
        details: formDetails.trim(),
        targetUser: formTargetUser.trim() || undefined,
        adminEmail: user?.email || 'admin@gmt.com',
        severity: formSeverity,
        status: formStatus,
        ip: '127.0.0.1'
      });

      toast.success('Activity event logged successfully.');
      setIsNewLogOpen(false);
      setFormAction('');
      setFormDetails('');
      setFormTargetUser('');
    } catch (err) {
      toast.error('Failed to write activity log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulate = async (type: 'role' | 'feature' | 'system' | 'security') => {
    const adminEmail = user?.email || 'billworlddream1@gmail.com';
    if (type === 'role') {
      const roles = ['admin', 'mini-admin', 'dealer', 'premium-user'];
      const users = ['Elena Vance (elena@gmt.com)', 'Marcus Wright (marcus@gmt.com)', 'Sarah Chen (sarah@gmt.com)', 'Alex Rivera (alex@gmt.com)'];
      const chosenRole = roles[Math.floor(Math.random() * roles.length)];
      const chosenUser = users[Math.floor(Math.random() * users.length)];
      await logRecentActivity({
        category: 'user_roles',
        action: `User Role Updated to ${chosenRole.toUpperCase()}`,
        details: `Administrator modified access permissions for ${chosenUser}. Updated system privileges to "${chosenRole}".`,
        targetUser: chosenUser,
        adminEmail,
        severity: chosenRole === 'admin' ? 'high' : 'medium',
        status: 'success'
      });
      toast.success('Simulated User Role Change Logged');
    } else if (type === 'feature') {
      const features = ['supreme-gmt', 'hardware-mining', 'forex-trader', 'celebs-hub', 'project-power'];
      const feat = features[Math.floor(Math.random() * features.length)];
      const isLock = Math.random() > 0.5;
      await logRecentActivity({
        category: 'feature_access',
        action: `Feature Access ${isLock ? 'Restricted' : 'Granted'}: ${feat}`,
        details: `${isLock ? 'Locked' : 'Unlocked'} feature module "${feat}" for targeted user account based on compliance policy verification.`,
        targetUser: 'Sarah Chen (sarah@gmt.com)',
        adminEmail,
        severity: isLock ? 'medium' : 'low',
        status: isLock ? 'warning' : 'success'
      });
      toast.success('Simulated Feature Access Modification Logged');
    } else if (type === 'system') {
      const actions = [
        { title: 'System Fee Structure Revised', details: 'Updated platform royalty split to 1.8% and modified global minimum withdrawal limit.' },
        { title: 'Emergency Maintenance Window Scheduled', details: 'Configured global system notification banner for upcoming database optimization window.' },
        { title: 'Database Index Optimization Executed', details: 'Re-indexed user activity vectors and transaction history caches for sub-second responses.' }
      ];
      const selected = actions[Math.floor(Math.random() * actions.length)];
      await logRecentActivity({
        category: 'system_events',
        action: selected.title,
        details: selected.details,
        adminEmail,
        severity: 'medium',
        status: 'info'
      });
      toast.success('Simulated Critical System Event Logged');
    } else {
      await logRecentActivity({
        category: 'security_alerts',
        action: 'Malicious Query Intercepted',
        details: 'WAF ruleset blocked suspect POST request payload containing unauthorized SQL tokens on `/api/v1/auth`.',
        adminEmail: 'automated-waf@gmt.com',
        severity: 'critical',
        status: 'error',
        ip: '45.33.22.11'
      });
      toast.success('Simulated Security Threat Logged');
    }
  };

  const handleToggleResolve = async (log: ActivityLog) => {
    try {
      await toggleActivityResolved(log.id, !!log.resolved);
      toast.success(`Event status marked as ${!log.resolved ? 'Resolved' : 'Active'}.`);
      if (selectedLog && selectedLog.id === log.id) {
        setSelectedLog(prev => prev ? { ...prev, resolved: !prev.resolved } : null);
      }
    } catch (err) {
      toast.error('Could not update event status.');
    }
  };

  const handleDelete = async (logId: string) => {
    if (window.confirm('Delete this activity log entry permanently?')) {
      try {
        await deleteActivityLog(logId);
        toast.success('Activity log removed.');
        setSelectedLog(null);
      } catch (err) {
        toast.error('Failed to delete log.');
      }
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `recent_activity_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Activity logs exported to JSON');
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const search = searchQuery.toLowerCase();
    const text = `${log.action} ${log.details} ${log.targetUser || ''} ${log.adminEmail} ${log.ip || ''}`.toLowerCase();
    const matchesSearch = !search || text.includes(search);
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'user_roles':
        return { label: 'User Roles', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Users };
      case 'feature_access':
        return { label: 'Feature Access', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Sliders };
      case 'system_events':
        return { label: 'System Event', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Activity };
      case 'security_alerts':
        return { label: 'Security Alert', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ShieldAlert };
      default:
        return { label: 'General', bg: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: Info };
    }
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className={clsx(
      "bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden text-white transition-all shadow-xl",
      isCompact ? "p-6" : "p-8 space-y-6"
    )}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20 rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Recent System & Role Activity Log
              {!isCompact && (
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase rounded-full border border-emerald-500/20">
                  Real-time Feed
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live transparency ledger tracking critical system updates, user role assignments, and feature access modifications.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isCompact && (
            <>
              <button
                onClick={() => handleSimulate('role')}
                className="px-3 py-2 bg-purple-950/30 text-purple-300 border border-purple-500/20 hover:bg-purple-900/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="Simulate Role Escalation"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                + Role Log
              </button>
              <button
                onClick={() => handleSimulate('feature')}
                className="px-3 py-2 bg-amber-950/30 text-amber-300 border border-amber-500/20 hover:bg-amber-900/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="Simulate Feature Modification"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                + Feature Log
              </button>
              <button
                onClick={() => handleSimulate('system')}
                className="px-3 py-2 bg-blue-950/30 text-blue-300 border border-blue-500/20 hover:bg-blue-900/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="Simulate System Event"
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                + System Log
              </button>
              <button
                onClick={exportJSON}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-all"
                title="Export Logs"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsNewLogOpen(true)}
                className="px-4 py-2 bg-[var(--color-supreme-gold)] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Log Custom Event
              </button>
            </>
          )}

          {isCompact && onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs font-bold text-[var(--color-supreme-gold)] hover:underline flex items-center gap-1"
            >
              Full Transparency Feed <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar (Visible when not compact or interactive) */}
      {!isCompact && (
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Pills */}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all",
                  categoryFilter === 'all' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('system_events')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'system_events' ? "bg-blue-950/60 text-blue-300 border border-blue-500/30" : "text-zinc-400 hover:text-white"
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                System Events
              </button>
              <button
                onClick={() => setCategoryFilter('user_roles')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'user_roles' ? "bg-purple-950/60 text-purple-300 border border-purple-500/30" : "text-zinc-400 hover:text-white"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                User Roles
              </button>
              <button
                onClick={() => setCategoryFilter('feature_access')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'feature_access' ? "bg-amber-950/60 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                )}
              >
                <Sliders className="w-3.5 h-3.5" />
                Feature Access
              </button>
              <button
                onClick={() => setCategoryFilter('security_alerts')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1",
                  categoryFilter === 'security_alerts' ? "bg-red-950/60 text-red-300 border border-red-500/30" : "text-zinc-400 hover:text-white"
                )}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Security
              </button>
            </div>

            {/* Severity Filter Dropdown */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[var(--color-supreme-gold)] cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="low">Severity: Low</option>
              <option value="medium">Severity: Medium</option>
              <option value="high">Severity: High</option>
              <option value="critical">Severity: Critical</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by action, user, admin email, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100 focus:outline-none focus:border-[var(--color-supreme-gold)]"
            />
          </div>
        </div>
      )}

      {/* Activity Table Feed */}
      <div className="overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RefreshCw className="w-7 h-7 text-[var(--color-supreme-gold)] animate-spin" />
            <p className="text-xs text-zinc-500 font-mono">Synchronizing activity stream...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-zinc-800/50">
            <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-400">No activity events recorded</p>
            <p className="text-xs text-zinc-600 mt-1">Try relaxing search or filter parameters.</p>
          </div>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800/80 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/40">
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Action & Details</th>
                <th className="py-3 px-4">Target / User</th>
                <th className="py-3 px-4">Executor</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredLogs.map((log) => {
                const categoryMeta = getCategoryBadge(log.category);
                const Icon = categoryMeta.icon;
                
                const timeDate = log.timestamp instanceof Timestamp 
                  ? log.timestamp.toDate() 
                  : new Date(log.timestamp);
                const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={clsx(
                      "hover:bg-zinc-800/30 transition-colors cursor-pointer group",
                      log.resolved && "opacity-60"
                    )}
                  >
                    {/* Category Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        categoryMeta.bg
                      )}>
                        <Icon className="w-3 h-3" />
                        {categoryMeta.label}
                      </span>
                    </td>

                    {/* Action & Details */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <span className={clsx(
                          "font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors block text-sm",
                          log.resolved && "line-through text-zinc-500"
                        )}>
                          {log.action}
                        </span>
                        <span className="text-zinc-400 text-xs line-clamp-1 block">
                          {log.details}
                        </span>
                      </div>
                    </td>

                    {/* Target User */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-zinc-300">
                      {log.targetUser ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{log.targetUser}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 font-mono text-[11px]">— System Wide</span>
                      )}
                    </td>

                    {/* Admin Executor */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-400 text-[11px]">
                      {log.adminEmail}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                      <div className="space-y-0.5">
                        <span className="text-white font-semibold block">{dateStr}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block">{timeStr}</span>
                      </div>
                    </td>

                    {/* Status & Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider",
                          getStatusBadge(log.status)
                        )}>
                          {log.status}
                        </span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
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
                            "p-1.5 rounded-lg border text-[10px] font-bold transition-all",
                            log.resolved ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          )}
                          title={log.resolved ? "Reopen Event" : "Mark Resolved"}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
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

      {/* Manual Entry Dialog */}
      <AnimatePresence>
        {isNewLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-lg space-y-6 text-white shadow-2xl relative"
            >
              <button 
                onClick={() => setIsNewLogOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-2xl border border-[var(--color-supreme-gold)]/20">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Log Activity Event</h4>
                  <p className="text-xs text-zinc-500">Record a system change, user role modification, or feature lock</p>
                </div>
              </div>

              <form onSubmit={handleCreateCustomLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)] cursor-pointer"
                    >
                      <option value="system_events">System Event</option>
                      <option value="user_roles">User Role Modification</option>
                      <option value="feature_access">Feature Access Control</option>
                      <option value="security_alerts">Security Alert</option>
                      <option value="financial">Financial / Royalty</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Severity</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as ActivitySeverity)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)] cursor-pointer"
                    >
                      <option value="low">Severity: Low</option>
                      <option value="medium">Severity: Medium</option>
                      <option value="high">Severity: High</option>
                      <option value="critical">Severity: Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Action Title</label>
                  <input 
                    type="text" 
                    required
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    placeholder="e.g. Promoted User to Mini-Admin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target User (Optional)</label>
                  <input 
                    type="text" 
                    value={formTargetUser}
                    onChange={(e) => setFormTargetUser(e.target.value)}
                    placeholder="e.g. Sarah Chen (sarah@gmt.com)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Event Description / Rationale</label>
                  <textarea 
                    required
                    rows={3}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="Describe specific changes or policy motives..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsNewLogOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-black uppercase bg-[var(--color-supreme-gold)] text-black hover:bg-yellow-400 transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Activity Event
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
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-xl text-white shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
                <div className="p-3.5 bg-zinc-800 rounded-2xl border border-zinc-700 text-[var(--color-supreme-gold)]">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Log ID: #{selectedLog.id}</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">{selectedLog.action}</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Category</span>
                  <p className="font-bold text-white uppercase">{selectedLog.category}</p>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Severity</span>
                  <p className="font-bold text-amber-400 uppercase">{selectedLog.severity}</p>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Target User</span>
                  <p className="font-mono text-zinc-300 truncate">{selectedLog.targetUser || 'System Wide'}</p>
                </div>
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Executor Admin</span>
                  <p className="font-mono text-zinc-300 truncate">{selectedLog.adminEmail}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Event Rationale & Metadata</span>
                <div className="p-4 bg-black/60 rounded-xl border border-zinc-800 text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedLog.details}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-800 pt-5">
                <button
                  onClick={() => handleDelete(selectedLog.id)}
                  className="px-4 py-2 bg-red-950/30 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-900/40 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Purge Log Record
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleResolve(selectedLog)}
                    className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-black hover:bg-emerald-400 transition-colors"
                  >
                    {selectedLog.resolved ? 'Reopen Incident' : 'Mark Resolved'}
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700"
                  >
                    Close
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
