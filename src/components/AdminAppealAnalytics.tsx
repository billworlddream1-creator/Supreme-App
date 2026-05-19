import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, ShieldAlert, 
  Calendar, Clock, Filter, Download, Zap, ShieldCheck
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import clsx from 'clsx';

interface AppealBilling {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  price: number;
  duration: number;
  timestamp: any;
}

export default function AdminAppealAnalytics() {
  const [billings, setBillings] = useState<AppealBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    activeSubscribers: 0,
    averageTicket: 0
  });

  useEffect(() => {
    const fetchBillings = async () => {
      try {
        const q = query(collection(db, 'appeal_billings'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppealBilling));
        setBillings(data);

        // Calculate stats
        const totalRev = data.reduce((sum, b) => sum + (b.price || 0), 0);
        const now = new Date();
        
        setStats({
          totalRevenue: totalRev,
          totalSales: data.length,
          activeSubscribers: data.filter(b => {
             const expiry = new Date(b.timestamp.toDate());
             expiry.setDate(expiry.getDate() + b.duration);
             return expiry > now;
          }).length,
          averageTicket: data.length > 0 ? totalRev / data.length : 0
        });
      } catch (error) {
        console.error("Error fetching appeal billings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillings();
  }, []);

  const planDistribution = [
    { name: '60 Days', value: billings.filter(b => b.planId === '60days').length },
    { name: '90 Days', value: billings.filter(b => b.planId === '90days').length },
    { name: '150 Days', value: billings.filter(b => b.planId === '150days').length },
    { name: '365 Days', value: billings.filter(b => b.planId === '365days').length },
  ];

  const COLORS = ['#3b82f6', '#94a3b8', '#f59e0b', '#c026d3'];

  // Group by day for simple revenue chart
  const revenueByDay = billings.reduce((acc: any, b) => {
    const date = b.timestamp?.toDate().toLocaleDateString() || 'Unknown';
    acc[date] = (acc[date] || 0) + b.price;
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenueByDay).map(([name, revenue]) => ({ name, revenue })).reverse();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Amnesty Sales', value: stats.totalSales, icon: Zap, color: 'text-amber-500' },
          { label: 'Active Shields', value: stats.activeSubscribers, icon: ShieldCheck, color: 'text-fuchsia-500' },
          { label: 'Avg. Revenue', value: `$${stats.averageTicket.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-500' }
        ].map((s, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className={clsx("p-3 rounded-2xl bg-gray-50", s.color)}>
                <s.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-xl font-black text-gray-900 leading-tight">{s.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900">Amnesty Revenue Flow</h3>
                <p className="text-xs text-gray-400 font-medium">Tracking premium appeal sales over time</p>
              </div>
              <Download className="w-5 h-5 text-gray-300 cursor-pointer hover:text-gray-900 transition-colors" />
           </div>

           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c026d3" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#c026d3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: '800', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#c026d3" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Plan Distribution */}
        <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
           <h3 className="text-lg font-black text-gray-900">Plan Adoption</h3>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-2">
              {planDistribution.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs font-bold text-gray-600">{p.name}</span>
                   </div>
                   <span className="text-xs font-black text-gray-400">{p.value} Sales</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Recent Billings Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-gray-900">Recent Amnesty Records</h3>
            <div className="flex items-center gap-2">
               <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"><Filter className="w-4 h-4" /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     <th className="px-8 py-4">Status</th>
                     <th className="px-8 py-4">User</th>
                     <th className="px-8 py-4">Plan</th>
                     <th className="px-8 py-4">Amount</th>
                     <th className="px-8 py-4">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm font-medium">
                  {billings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="group hover:bg-gray-50 transition-colors">
                       <td className="px-8 py-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                       </td>
                       <td className="px-8 py-4">
                          <div>
                             <p className="font-bold text-gray-900">{b.userName}</p>
                             <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{b.userId}</p>
                          </div>
                       </td>
                       <td className="px-8 py-4 uppercase text-[10px] font-black tracking-widest text-fuchsia-600">{b.planId}</td>
                       <td className="px-8 py-4 font-black text-gray-900">${b.price}</td>
                       <td className="px-8 py-4 text-gray-400 text-xs">
                          {b.timestamp?.toDate().toLocaleString()}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
