import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  PieChart as PieChartIcon,
  BarChart3,
  Search,
  ArrowUpRight,
  Target,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { clsx } from 'clsx';

interface Investment {
  id: string;
  userId: string;
  briefcaseId: string;
  amount: number;
  startDate: any;
  endDate: any;
  status: 'active' | 'completed' | 'refunded';
  rank: string;
  earned?: number;
  maturedAt?: any;
}

const COLORS = ['#CD7F32', '#C0C0C0', '#B9F2FF', '#FFD700', '#FF4500'];

const BRIEF_CASES = [
  { id: 'bronze', name: 'Bronze', color: '#CD7F32' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF' },
  { id: 'gold', name: 'Gold', color: '#FFD700' },
  { id: 'clowned', name: 'Crowned', color: '#FF4500' }
];

export default function AdminTreasureTracker() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'refunded'>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'treasureInvestments'),
      orderBy('startDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Investment[] = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() } as Investment);
      });
      setInvestments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    totalVolume: investments.reduce((acc, inv) => acc + inv.amount, 0),
    activeCapital: investments.filter(i => i.status === 'active').reduce((acc, inv) => acc + inv.amount, 0),
    totalEarned: investments.reduce((acc, inv) => acc + (inv.earned || 0), 0),
    activeCount: investments.filter(i => i.status === 'active').length,
    completedCount: investments.filter(i => i.status === 'completed').length,
    refundedCount: investments.filter(i => i.status === 'refunded').length,
  };

  const briefcaseData = BRIEF_CASES.map(bc => ({
    name: bc.name,
    value: investments.filter(i => i.briefcaseId === bc.id).length,
    capital: investments.filter(i => i.briefcaseId === bc.id).reduce((acc, inv) => acc + inv.amount, 0),
    color: bc.color
  }));

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.userId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         inv.briefcaseId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Supreme Treasure Analytics</h3>
          <p className="text-gray-400">Monitoring global Briefcase investments and ranking performance</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/10">
          {['all', 'active', 'completed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filterStatus === status 
                  ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" 
                  : "text-gray-500 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', trend: '+12%' },
          { label: 'Active Capital', value: `$${stats.activeCapital.toLocaleString()}`, icon: Briefcase, color: 'text-blue-500', trend: 'STABLE' },
          { label: 'Total ROI Payout', value: `$${stats.totalEarned.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500', trend: '+8%' },
          { label: 'Active Portfolios', value: stats.activeCount.toLocaleString(), icon: Activity, color: 'text-amber-500', trend: 'PEAK' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 group hover:border-[var(--color-supreme-gold)]/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-gray-500 border border-white/5 px-2 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-display font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Capital Distribution
              </h4>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">By Briefcase Tier</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={briefcaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="capital" radius={[8, 8, 0, 0]} fill="var(--color-supreme-gold)">
                    {briefcaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" /> Recent Activities
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filter activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)] w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Investor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Portfolio</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Growth Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvestments.slice(0, 10).map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-gray-400">ID</div>
                          <span className="text-xs font-bold text-white font-mono">{inv.userId.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-400 capitalize">{inv.briefcaseId} Tier</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-white">${inv.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={clsx(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border",
                          inv.status === 'active' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          inv.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {inv.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Charts */}
        <div className="space-y-8">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <h4 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" /> Market Share
            </h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={briefcaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {briefcaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {briefcaseData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{item.value} Portfolios</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/50 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-supreme-gold)]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[var(--color-supreme-gold)]/10 transition-all" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Growth Intelligence</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The Crowned Briefcase accounts for <span className="text-white font-black">42%</span> of total investment volume despite representing only 15% of active portfolios.
              </p>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Economic Stability</span>
                  <span className="text-green-500">OPTIMAL</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full">
                  <div className="h-full w-[85%] bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Settlement Index</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-white">Pending Maturities</span>
                </div>
                <span className="text-xs font-black text-[var(--color-supreme-gold)]">124 Today</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-white">Avg Return Cycle</span>
                </div>
                <span className="text-xs font-black text-blue-400">150 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
