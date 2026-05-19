import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Users, Heart, Clock, Target, ShoppingBag, 
  BarChart3, Search, Filter, ArrowUpRight, Award,
  TrendingUp, Medal, Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface Performer {
  id: string;
  name: string;
  avatar: string;
  metrics: {
    likes: number;
    subscribers: number;
    hours: number;
    connections: number;
    sales: number;
  };
  effortScore: number; // Calculated 0-100
}

const generateMockPerformers = (): Performer[] => {
  return Array.from({ length: 18 }, (_, i) => ({
    id: `u-${i + 1}`,
    name: [
      'Alex Johnson', 'Sarah Williams', 'Michael Chen', 'Emma Davis', 
      'David Miller', 'Sofia Rodriguez', 'James Wilson', 'Olivia Brown',
      'Liam Taylor', 'Isabella Moore', 'Noah Anderson', 'Mia Thomas',
      'Ethan Jackson', 'Ava White', 'Lucas Harris', 'Charlotte Martin',
      'Mason Thompson', 'Amelia Garcia'
    ][i] || `User ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?u=${i + 1}`,
    metrics: {
      likes: Math.floor(Math.random() * 210000),
      subscribers: Math.floor(Math.random() * 210000),
      hours: Math.floor(Math.random() * 2100),
      connections: Math.floor(Math.random() * 1600),
      sales: Math.floor(Math.random() * 300),
    },
    effortScore: 0 // Will calculate below
  })).map(p => {
    // Calculate effort score based on % of targets reached
    const targets = { likes: 200000, subscribers: 200000, hours: 2000, connections: 1500, sales: 250 };
    const score = (
      (p.metrics.likes / targets.likes) +
      (p.metrics.subscribers / targets.subscribers) +
      (p.metrics.hours / targets.hours) +
      (p.metrics.connections / targets.connections) +
      (p.metrics.sales / targets.sales)
    ) / 5 * 100;
    return { ...p, effortScore: Math.min(score, 100) };
  }).sort((a, b) => b.effortScore - a.effortScore);
};

const MOCK_PERFORMERS = generateMockPerformers();

export default function AdminAwardTracker() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin';
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdmin) return null;

  const filteredPerformers = MOCK_PERFORMERS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-amber-500 bg-amber-50 border-amber-100';
    if (index === 1) return 'text-gray-400 bg-gray-50 border-gray-100';
    if (index === 2) return 'text-amber-700 bg-amber-50 border-amber-100';
    if (index < 5) return 'text-blue-500 bg-blue-50 border-blue-100';
    return 'text-gray-500 bg-gray-50 border-gray-100';
  };

  const getPrizeAmount = (index: number) => {
    const prizes = [1000000, 800000, 600000, 400000, 200000];
    return prizes[index] || 0;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Award Program Tracker</h2>
              <p className="text-xs text-gray-400">Monitoring Top 18 Performers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pool</p>
              <p className="text-lg font-bold text-amber-500">$3,000,000+</p>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Effort</p>
            </div>
            <p className="text-2xl font-bold">78.4%</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-blue-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qualified</p>
            </div>
            <p className="text-2xl font-bold">12 / 18</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3 h-3 text-amber-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Score</p>
            </div>
            <p className="text-2xl font-bold">98.2%</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-purple-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cycle Progress</p>
            </div>
            <p className="text-2xl font-bold">44%</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search performers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900">
              <Filter className="w-4 h-4" /> Filter Metrics
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performer</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Effort Score</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Metrics</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Est. Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPerformers.map((p, index) => (
                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shadow-sm",
                      getRankColor(index)
                    )}>
                      {index < 3 ? <Medal className="w-4 h-4" /> : index + 1}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{p.name}</p>
                        <p className="text-[10px] text-gray-400">Elite Connector</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="space-y-1.5 w-32">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-900">{p.effortScore.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            p.effortScore > 90 ? "bg-green-500" : p.effortScore > 70 ? "bg-amber-500" : "bg-blue-500"
                          )} 
                          style={{ width: `${p.effortScore}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-3">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-900">{(p.metrics.likes / 1000).toFixed(0)}K</p>
                        <p className="text-[8px] text-gray-400 uppercase">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-900">{(p.metrics.subscribers / 1000).toFixed(0)}K</p>
                        <p className="text-[8px] text-gray-400 uppercase">Subs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-900">{p.metrics.connections}</p>
                        <p className="text-[8px] text-gray-400 uppercase">Refs</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    {index < 5 ? (
                      <div>
                        <p className="text-sm font-bold text-green-600">${(getPrizeAmount(index) / 1000).toLocaleString()}K</p>
                        <p className="text-[10px] text-gray-400">Guaranteed</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-amber-600">Effort Bonus</p>
                        <p className="text-[10px] text-gray-400">Pending</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Analysis */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <BarChart3 className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Performance Analysis</h4>
              <p className="text-xs text-gray-500">Top 18 performers are currently averaging 82% of target requirements.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 group">
            Export Full Performance Report
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
