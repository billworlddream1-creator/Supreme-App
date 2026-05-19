import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Clock, 
  ChevronDown, Filter, Download, Crown
} from 'lucide-react';
import clsx from 'clsx';

interface AnalyticsData {
  daily: number[];
  weekly: number[];
  monthly: number[];
  yearly: number[];
  bestSubscribers: Array<{
    id: string;
    name: string;
    totalPaid: number;
    plan: string;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const chartData = data[timeframe].map((val, i) => ({
    name: timeframe === 'daily' ? `Day ${i+1}` : 
          timeframe === 'weekly' ? `Week ${i+1}` : 
          timeframe === 'monthly' ? `Month ${i+1}` : `Year ${i+2024}`,
    users: val
  }));

  const stats = [
    { label: 'Total Users', value: '145,230', change: '+12.5%', icon: Users },
    { label: 'Avg. Retention', value: '68%', change: '+2.1%', icon: TrendingUp },
    { label: 'Session Time', value: '12m 45s', change: '-5.2%', icon: Clock },
    { label: 'Best Plan', value: 'Supreme', change: 'Gold', icon: Crown },
  ];

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-red-900/30 rounded-2xl border border-amber-500/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={clsx(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-red-200/50 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="p-6 bg-red-900/30 rounded-3xl border border-amber-500/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-amber-500">User Growth Analysis</h3>
            <p className="text-sm text-red-200/50">Tracking active users over time</p>
          </div>
          <div className="flex items-center gap-2 bg-red-950/50 p-1 rounded-xl border border-amber-500/10">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                  timeframe === t ? "bg-amber-500 text-red-950 shadow-sm" : "text-red-200/50 hover:text-amber-500"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#450a0a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#991b1b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#991b1b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#450a0a', border: '1px solid #f59e0b33', borderRadius: '12px' }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Subscribers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-red-900/30 rounded-3xl border border-amber-500/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-500">Best Subscribers</h3>
            <button className="text-xs font-bold text-amber-500/50 hover:text-amber-500 flex items-center gap-1">
              View All <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {data.bestSubscribers.map((sub, i) => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-red-950/30 rounded-2xl border border-amber-500/5 hover:border-amber-500/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-amber-100">{sub.name}</p>
                    <p className="text-xs text-red-200/40 uppercase font-bold tracking-widest">{sub.plan} Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">${sub.totalPaid.toLocaleString()}</p>
                  <p className="text-[10px] text-red-200/30 font-bold uppercase">Total Spent</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-red-900/30 rounded-3xl border border-amber-500/10">
          <h3 className="text-xl font-bold text-amber-500 mb-6">Subscription Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Free', value: 4500 },
                { name: 'Gold', value: 2100 },
                { name: 'Elite', value: 1200 },
                { name: 'Diamond', value: 800 },
                { name: 'Supreme', value: 450 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#450a0a" vertical={false} />
                <XAxis dataKey="name" stroke="#991b1b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#991b1b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#450a0a' }}
                  contentStyle={{ backgroundColor: '#450a0a', border: '1px solid #f59e0b33', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
