import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  FileText,
  Video,
  Award,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface PromoteRecord {
  id: string;
  userId: string;
  userEmail: string;
  supremeHandle: string;
  externalHandle: string;
  category: string;
  format: 'text' | 'video';
  userRank: string;
  createdAt: any;
  status: 'pending_reward' | 'rewarded' | 'rejected';
}

export default function PromoteTrackingAdmin() {
  const [records, setRecords] = useState<PromoteRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'promote_tracking'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: PromoteRecord[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as PromoteRecord);
      });
      setRecords(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'promote_tracking');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'rewarded' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'promote_tracking', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Record marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supremeHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.externalHandle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending_reward').length,
    rewarded: records.filter(r => r.status === 'rewarded').length,
    text: records.filter(r => r.format === 'text').length,
    video: records.filter(r => r.format === 'video').length
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Promotions', value: stats.total, icon: Megaphone, color: 'text-blue-500' },
          { label: 'Pending Rewards', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Rewarded', value: stats.rewarded, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Video Content', value: stats.video, icon: Video, color: 'text-purple-500' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Supreme Promote Tracking</h3>
            <p className="text-gray-400">Monitor and reward users for promotional content generation</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search handles or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending_reward">Pending</option>
              <option value="rewarded">Rewarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User / Handles</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category / Format</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Rank</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <Clock className="w-8 h-8 animate-spin text-purple-500" />
                      <p>Loading tracking records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <Megaphone className="w-12 h-12 opacity-20" />
                      <p>No promotion records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-white">{record.userEmail}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-purple-400">Sup: {record.supremeHandle}</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-blue-400">Ext: {record.externalHandle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        {record.format === 'text' ? (
                          <FileText className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Video className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-sm text-gray-300">{record.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">
                        {record.userRank}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {record.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        record.status === 'rewarded' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        record.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        {record.status === 'pending_reward' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(record.id, 'rewarded')}
                              className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                              title="Mark as Rewarded"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(record.id, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                              title="Reject / No Reward"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
  );
}
