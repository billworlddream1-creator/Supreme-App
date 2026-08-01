import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  Ban, 
  Globe, 
  Copy, 
  Music, 
  Plus, 
  CheckCircle2, 
  Info, 
  FileText, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

export interface EarningViolationRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  violationType: 'IP-based' | 'Re-upload' | 'Bot Manipulation';
  shortId?: string;
  shortTitle?: string;
  ipAddress?: string;
  downloadCountOnIp?: number;
  details: string;
  isEarningsSuspended: boolean;
  status: 'Flagged' | 'Under Investigation' | 'Earnings Suspended' | 'Dismissed';
  detectedAt: string;
}

const DEFAULT_VIOLATIONS: EarningViolationRecord[] = [
  {
    id: 'viol-ip-101',
    userId: 'user_8832941',
    userName: 'SonicSplicer',
    userEmail: 'sonicsplicer@gmail.com',
    violationType: 'IP-based',
    ipAddress: '198.51.100.42',
    downloadCountOnIp: 148,
    details: 'Multiple rapid downloads (148 downloads) originating from single IP 198.51.100.42 within 12 minutes to artificially boost earnings.',
    isEarningsSuspended: true,
    status: 'Earnings Suspended',
    detectedAt: '2026-07-30 09:14'
  },
  {
    id: 'viol-reup-202',
    userId: 'user_4492104',
    userName: 'AudioCopycat_X',
    userEmail: 'copycat_x@gmail.com',
    violationType: 'Re-upload',
    shortId: 'short-1',
    shortTitle: 'Supreme Status Chime (Re-upload)',
    details: 'Downloaded "Supreme Status Chime" from creator "Supreme Sound Lab" and re-uploaded back to Super Shorts under a modified title.',
    isEarningsSuspended: false,
    status: 'Flagged',
    detectedAt: '2026-07-30 08:30'
  },
  {
    id: 'viol-ip-103',
    userId: 'user_9921054',
    userName: 'ChimeMaster_Bot',
    userEmail: 'chimemaster@yahoo.com',
    violationType: 'IP-based',
    ipAddress: '203.0.113.195',
    downloadCountOnIp: 210,
    details: 'Automated curl script detected downloading 210 status clips from same IP address. Earnings calculation blocked.',
    isEarningsSuspended: true,
    status: 'Earnings Suspended',
    detectedAt: '2026-07-29 22:45'
  },
  {
    id: 'viol-reup-204',
    userId: 'user_3310892',
    userName: 'BeatStealer_99',
    userEmail: 'beatstealer@outlook.com',
    violationType: 'Re-upload',
    shortId: 'short-4',
    shortTitle: 'Lo-Fi Chill Beat (Stolen Audio)',
    details: 'Fingerprint match 99.4% identical to original track short-4 by BeatMaker_Pro. Unauthorised re-upload for earning exploit.',
    isEarningsSuspended: false,
    status: 'Under Investigation',
    detectedAt: '2026-07-29 18:20'
  }
];

export default function AdminSuperShortsViolations() {
  const [violations, setViolations] = useState<EarningViolationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUserId, setNewUserId] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newType, setNewType] = useState<'IP-based' | 'Re-upload'>('IP-based');
  const [newIpAddress, setNewIpAddress] = useState<string>('192.168.1.1');
  const [newDetails, setNewDetails] = useState<string>('');
  const [autoSuspend, setAutoSuspend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Firestore Sync
  useEffect(() => {
    const q = query(collection(db, 'super_shorts_earning_violations'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setViolations(DEFAULT_VIOLATIONS);
      } else {
        const list: EarningViolationRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId || 'Unknown User',
            userName: d.userName || 'Anonymous Creator',
            userEmail: d.userEmail || '',
            violationType: d.violationType || 'IP-based',
            shortId: d.shortId || '',
            shortTitle: d.shortTitle || '',
            ipAddress: d.ipAddress || '',
            downloadCountOnIp: d.downloadCountOnIp || 0,
            details: d.details || 'No details provided.',
            isEarningsSuspended: !!d.isEarningsSuspended,
            status: d.status || 'Flagged',
            detectedAt: d.detectedAt || new Date().toLocaleString()
          });
        });
        setViolations(list);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Firestore Violations Sync Notice:", err);
      setViolations(DEFAULT_VIOLATIONS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle Earning Suspension for a user
  const handleToggleSuspension = async (record: EarningViolationRecord) => {
    const nextState = !record.isEarningsSuspended;
    const actionText = nextState ? "SUSPEND Super Shorts Earnings" : "RESTORE Super Shorts Earnings";

    if (!window.confirm(`Are you sure you want to ${actionText} for User ID "${record.userId}" (${record.userName})?`)) {
      return;
    }

    try {
      // 1. Update User Document in 'users'
      const userRef = doc(db, 'users', record.userId);
      await updateDoc(userRef, {
        superShortsEarningsSuspended: nextState,
        superShortsSuspensionReason: nextState ? record.details : '',
        superShortsSuspendedAt: nextState ? serverTimestamp() : null
      }).catch(() => {
        console.warn("User doc update skipped or fallback");
      });

      // 2. Update Violation Record in 'super_shorts_earning_violations'
      if (!record.id.startsWith('viol-')) {
        const violRef = doc(db, 'super_shorts_earning_violations', record.id);
        await updateDoc(violRef, {
          isEarningsSuspended: nextState,
          status: nextState ? 'Earnings Suspended' : 'Under Investigation'
        });
      }

      // Local state update
      setViolations(prev => prev.map(v => v.id === record.id ? {
        ...v,
        isEarningsSuspended: nextState,
        status: nextState ? 'Earnings Suspended' : 'Under Investigation'
      } : v));

      toast.success(
        nextState 
          ? `🚫 Super Shorts earnings SUSPENDED for User ID ${record.userId}`
          : `✅ Super Shorts earnings RESTORED for User ID ${record.userId}`
      );
    } catch (e: any) {
      toast.error(`Action updated locally: ${e.message || 'Updated'}`);
    }
  };

  // Dismiss a violation
  const handleDismissViolation = async (id: string) => {
    try {
      if (!id.startsWith('viol-')) {
        const ref = doc(db, 'super_shorts_earning_violations', id);
        await updateDoc(ref, { status: 'Dismissed', isEarningsSuspended: false });
      }
      setViolations(prev => prev.map(v => v.id === id ? { ...v, status: 'Dismissed', isEarningsSuspended: false } : v));
      toast.info("Violation record dismissed.");
    } catch (e) {
      toast.info("Dismissed.");
    }
  };

  // Submit Manual Entry
  const handleAddManualViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) {
      toast.error("Please enter a User ID.");
      return;
    }
    if (!newDetails.trim()) {
      toast.error("Please describe the violation details.");
      return;
    }

    setIsSubmitting(true);
    const newRecord = {
      userId: newUserId.trim(),
      userName: newUserName.trim() || `User_${newUserId.trim().substring(0, 6)}`,
      violationType: newType,
      ipAddress: newType === 'IP-based' ? newIpAddress : undefined,
      details: newDetails.trim(),
      isEarningsSuspended: autoSuspend,
      status: autoSuspend ? ('Earnings Suspended' as const) : ('Flagged' as const),
      detectedAt: new Date().toLocaleString()
    };

    try {
      await addDoc(collection(db, 'super_shorts_earning_violations'), newRecord);
      
      if (autoSuspend) {
        const userRef = doc(db, 'users', newUserId.trim());
        await updateDoc(userRef, {
          superShortsEarningsSuspended: true,
          superShortsSuspensionReason: newDetails.trim()
        }).catch(() => {});
      }

      toast.success("Earning violation entry recorded and logged successfully!");
      setShowAddModal(false);
      setNewUserId('');
      setNewUserName('');
      setNewDetails('');
    } catch (e) {
      const localRecord: EarningViolationRecord = {
        id: `local-viol-${Date.now()}`,
        ...newRecord
      };
      setViolations(prev => [localRecord, ...prev]);
      toast.success("Violation logged locally!");
      setShowAddModal(false);
      setNewUserId('');
      setNewUserName('');
      setNewDetails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      v.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.ipAddress && v.ipAddress.includes(searchQuery)) ||
      v.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || v.violationType === typeFilter;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Suspended' && v.isEarningsSuspended) ||
      (statusFilter === 'Active' && !v.isEarningsSuspended);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const totalViolations = violations.length;
  const ipViolations = violations.filter(v => v.violationType === 'IP-based').length;
  const reuploadViolations = violations.filter(v => v.violationType === 'Re-upload').length;
  const suspendedCount = violations.filter(v => v.isEarningsSuspended).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-black to-slate-900 border border-red-500/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-64 h-64 text-red-500" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">Super Shorts Integrity System</span>
                <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">Earning Violations Management</h2>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-extrabold rounded-xl hover:bg-yellow-400 transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              Log Manual Earning Violation
            </button>
          </div>

          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            Monitor and enforce platform anti-fraud rules for <strong>Super Shorts</strong>. Multiple downloads originating from the same IP address or downloading and re-uploading app audio are automatically detected and flagged. Manage user earning suspensions below.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Flagged</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalViolations}</p>
          <p className="text-xs text-gray-500 mt-1">Recorded violation entries</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IP-Based Fraud</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-400">{ipViolations}</p>
          <p className="text-xs text-gray-500 mt-1">Multi-download same IP exploits</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Re-upload Fraud</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Copy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">{reuploadViolations}</p>
          <p className="text-xs text-gray-500 mt-1">App sound re-downloads & uploads</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Earning Suspended</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-rose-500">{suspendedCount}</p>
          <p className="text-xs text-rose-400/80 mt-1">Users blocked from earning</p>
        </div>
      </div>

      {/* Rules Notice Box */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-start gap-4">
        <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-amber-300">
          <p className="font-bold">Super Shorts Earning Policy Enforcement Rules:</p>
          <ul className="text-xs text-amber-300/80 list-disc list-inside space-y-1 leading-relaxed">
            <li><strong>IP Address Violation:</strong> Multiple downloads originating from the same IP address are ignored for payout calculations ($2.50 / 500 uses) and flagged as IP fraud.</li>
            <li><strong>Re-Upload Violation:</strong> Downloading audio from Super Shorts to re-upload back to the app is forbidden and ineligible for earnings.</li>
            <li><strong>Earning Suspension:</strong> When suspended by admin, the user cannot accrue or request payout for any Super Shorts downloads.</li>
          </ul>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search User ID, Name, IP address, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-8 py-3 text-xs font-bold text-white outline-none focus:border-[var(--color-supreme-gold)] appearance-none"
            >
              <option value="All" className="bg-gray-900">All Violation Types</option>
              <option value="IP-based" className="bg-gray-900">IP-Based Fraud</option>
              <option value="Re-upload" className="bg-gray-900">App Re-upload</option>
            </select>
          </div>

          <div className="relative flex-1 md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[var(--color-supreme-gold)] appearance-none"
            >
              <option value="All" className="bg-gray-900">All Statuses</option>
              <option value="Suspended" className="bg-gray-900">Earnings Suspended</option>
              <option value="Active" className="bg-gray-900">Earnings Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Detected Violations & Earning Suspension Controls ({filteredViolations.length})
          </h3>
        </div>

        {filteredViolations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-white font-bold text-base">No Earning Violations Found</p>
            <p className="text-xs">No records matched your search and filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {filteredViolations.map((viol) => (
              <div key={viol.id} className="p-6 hover:bg-white/[0.02] transition-colors space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User & Type Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                        viol.violationType === 'IP-based' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {viol.violationType === 'IP-based' ? 'IP-Based Fraud' : 'App Re-Upload'}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                        viol.isEarningsSuspended 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {viol.isEarningsSuspended ? 'Earnings Suspended' : 'Earnings Active'}
                      </span>

                      <span className="text-xs text-gray-500 font-mono">{viol.detectedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white">{viol.userName}</h4>
                      <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
                        ID: {viol.userId}
                      </span>
                      {viol.userEmail && (
                        <span className="text-xs text-gray-400">({viol.userEmail})</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-xs">
                      {viol.details}
                    </p>

                    {viol.ipAddress && (
                      <div className="text-xs text-blue-400 font-mono flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        Flagged IP: <strong>{viol.ipAddress}</strong>
                        {viol.downloadCountOnIp ? ` (${viol.downloadCountOnIp} downloads recorded)` : ''}
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col justify-end gap-2 shrink-0 min-w-[200px]">
                    <button
                      onClick={() => handleToggleSuspension(viol)}
                      className={`px-4 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                        viol.isEarningsSuspended
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                          : 'bg-rose-600 text-white hover:bg-rose-500'
                      }`}
                    >
                      {viol.isEarningsSuspended ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Restore Super Shorts Earnings
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          Trigger Manual Earning Suspension
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDismissViolation(viol.id)}
                      className="px-4 py-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      Dismiss Entry
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add Violation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Log Manual Earning Violation</h3>
                    <p className="text-xs text-gray-400">Flag user ID for IP fraud or app re-upload</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddManualViolation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">User ID (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. user_8832941"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Creator Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AudioCreator_99"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Violation Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    >
                      <option value="IP-based">IP-Based Fraud</option>
                      <option value="Re-upload">App Re-upload</option>
                    </select>
                  </div>

                  {newType === 'IP-based' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1">IP Address</label>
                      <input
                        type="text"
                        value={newIpAddress}
                        onChange={(e) => setNewIpAddress(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Violation Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe specific details (e.g., 50 downloads in 2 minutes from IP or downloaded short-1 and uploaded back)..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={autoSuspend}
                    onChange={(e) => setAutoSuspend(e.target.checked)}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-rose-300">
                    Immediately Suspend Super Shorts Earnings for this User ID
                  </span>
                </label>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[var(--color-supreme-gold)] text-black font-extrabold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Logging...' : 'Submit Violation Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
