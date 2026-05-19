import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Trophy, Users, Search, Filter, ShieldCheck, Star, Shield, TrendingUp, ChevronRight, User, AlertCircle, TrendingDown, DollarSign, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface NobleUser {
  uid: string;
  name: string;
  handle: string;
  email: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other' | '';
  rank: string;
  totalEarnings: number;
  nobleTitle: string;
  isNoble: boolean;
}

const AdminNobleTracker: React.FC = () => {
  const [nobles, setNobles] = useState<NobleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'kings' | 'queens' | 'princes'>('all');

  useEffect(() => {
    const fetchNoblesData = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('totalEarnings', '>=', 50000),
          orderBy('totalEarnings', 'desc')
        );
        
        const userSnapshot = await getDocs(q);
        
        const nobleUsers: NobleUser[] = userSnapshot.docs.map(doc => {
          const userData = doc.data();
          const earnings = userData.totalEarnings || 0;
          const rank = (userData.rank || 'Bronze').toLowerCase();
          const gender = userData.gender || '';
          const isNobleRank = rank === 'crowned' || rank === 'clowned' || rank === 'royal';

          let title = 'Member';
          let isNoble = false;

          if (earnings >= 100000) {
            if (gender === 'female') {
              title = isNobleRank ? 'Noble Queen' : 'Non-Noble Queen';
            } else {
              title = isNobleRank ? 'Noble King' : 'Non-Noble King';
            }
            isNoble = isNobleRank;
          } else if (earnings >= 50000) {
            if (gender === 'female') {
              title = isNobleRank ? 'Crowned Princess' : 'Non-Crowned Princess';
            } else {
              title = isNobleRank ? 'Crowned Prince' : 'Non-Crowned Prince';
            }
            isNoble = isNobleRank;
          }

          return {
            uid: userData.uid || doc.id,
            name: userData.name || 'Anonymous',
            handle: userData.handle || `@${(userData.uid || doc.id).substring(0, 5)}`,
            email: userData.email || '',
            avatar: userData.avatar,
            gender: gender as any,
            rank: userData.rank || 'Bronze',
            totalEarnings: earnings,
            nobleTitle: title,
            isNoble
          };
        });

        setNobles(nobleUsers);
      } catch (error) {
        console.error('Error fetching Admin Noble Data:', error);
        toast.error('Failed to load noble data');
      } finally {
        setLoading(false);
      }
    };

    fetchNoblesData();
  }, []);

  const filteredNobles = nobles.filter(noble => {
    const matchesSearch = 
      noble.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      noble.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      noble.nobleTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'kings') matchesTab = noble.nobleTitle.toLowerCase().includes('king');
    if (activeTab === 'queens') matchesTab = noble.nobleTitle.toLowerCase().includes('queen');
    if (activeTab === 'princes') matchesTab = noble.nobleTitle.toLowerCase().includes('prince') || noble.nobleTitle.toLowerCase().includes('princess');

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: nobles.length,
    noblesCount: nobles.filter(n => n.isNoble).length,
    totalRoyalEarnings: nobles.reduce((acc, n) => acc + n.totalEarnings, 0)
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Royal Candidates', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Noble Verified', value: stats.noblesCount, icon: ShieldCheck, color: 'text-[var(--color-supreme-gold)]' },
          { label: 'Royal Wealth Pool', value: `$${stats.totalRoyalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tracker Container */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="w-7 h-7 text-[var(--color-supreme-gold)]" /> Supreme Noble Tracking
            </h3>
            <p className="text-gray-400 text-sm mt-1">Monitor high-earning royalty and their platform achievements</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
              />
            </div>
            
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto">
              {(['all', 'kings', 'queens', 'princes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-[var(--color-supreme-gold)] text-black" : "text-gray-500 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Noble Member</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank Instance</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Earnings</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Auth Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-t-[var(--color-supreme-gold)] border-white/10 rounded-full animate-spin" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Auditing Royal Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNobles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                    No noble records matches your inquiry
                  </td>
                </tr>
              ) : (
                filteredNobles.map((noble, index) => (
                  <tr key={noble.uid || `noble-${index}`} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={noble.avatar || `https://ui-avatars.com/api/?name=${noble.name}&background=random`} 
                            className="w-12 h-12 rounded-2xl border-2 border-white/5 object-cover" 
                          />
                          {noble.isNoble && (
                            <div className="absolute -top-1 -right-1 p-1 bg-[var(--color-supreme-gold)] rounded-lg shadow-lg">
                              <Crown className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base leading-none mb-1">{noble.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{noble.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        noble.isNoble 
                          ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)]" 
                          : "bg-white/5 border-white/10 text-gray-400"
                      )}>
                        {noble.nobleTitle}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-supreme-gold)] shadow-[0_0_8px_var(--color-supreme-gold)] animate-pulse" />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{noble.rank}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-display font-black text-white">${noble.totalEarnings.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Verified Yield</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Access</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-[var(--color-supreme-gold)] hover:bg-white/10 transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Audit Message */}
      <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-500/80 leading-relaxed font-medium">
            <span className="font-black">Admin Notice:</span> Noble status is automatically computed based on verified 'receive' transaction volume and platform tier achievements (Crowned Rank). Manual adjustments are restricted unless approved by the Supreme Council.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNobleTracker;
