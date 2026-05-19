import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Trophy, Award, BarChart3, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { clsx } from 'clsx';

const MOCK_TREND_DATA = [
  { day: 'Mon', connections: 120 },
  { day: 'Tue', connections: 180 },
  { day: 'Wed', connections: 150 },
  { day: 'Thu', connections: 280 },
  { day: 'Fri', connections: 320 },
  { day: 'Sat', connections: 450 },
  { day: 'Sun', connections: 390 },
];

const TOP_WEEKLY_CONNECTORS = [
  { id: '1', name: 'Alex Johnson', connections: 1245, growth: '+15%', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Williams', connections: 982, growth: '+12%', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Michael Chen', connections: 840, growth: '+8%', avatar: 'https://i.pravatar.cc/150?u=3' },
];

export default function ConnectorAnalysis() {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Connector Analysis
          </h3>
          <p className="text-xs text-gray-500 mt-1">Weekly platform network growth & top performers</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">+24% Growth</span>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_TREND_DATA}>
            <defs>
              <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-supreme-gold)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-supreme-gold)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#111827' }}
            />
            <Area 
              type="monotone" 
              dataKey="connections" 
              stroke="var(--color-supreme-gold)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorConnections)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Weekly Top Connectors</h4>
          <span className="text-[10px] text-gray-400">Updated 1h ago</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {TOP_WEEKLY_CONNECTORS.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" />
                  <div className={clsx(
                    "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm",
                    index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                  )}>
                    {index === 0 ? <Trophy className="w-3 h-3" /> : index + 1}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{user.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{user.connections.toLocaleString()} Connections</span>
                    <span className="text-[10px] font-bold text-green-600 flex items-center">
                      <ArrowUpRight className="w-2 h-2" /> {user.growth}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900">Rank #{index + 1}</p>
                <p className="text-[10px] text-gray-400">Elite Connector</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Analysis */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Active Campaign Analysis</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-amber-700 font-bold uppercase">Campaign ROI</p>
            <p className="text-lg font-display font-bold text-gray-900">$5.00 <span className="text-[10px] text-gray-400">/ 100 refs</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-amber-700 font-bold uppercase">Avg. Conversion</p>
            <p className="text-lg font-display font-bold text-gray-900">18.4%</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-amber-200/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-amber-800">Campaign Reach</span>
            <span className="text-[10px] font-bold text-amber-800">72,450 Users</span>
          </div>
          <div className="w-full bg-amber-200/30 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }} />
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group">
        View Full Leaderboard
        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
