import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings2, Users, DollarSign, Calendar, Play, Pause, Save, TrendingUp, Award, Search, Download, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useMonthlyAwards } from '../context/MonthlyAwardsContext';

export default function AdminMonthlyAwardManager() {
  const { settings, updateSettings, participants, getTopPerformers, concludeAndRestart } = useMonthlyAwards();
  const [editSettings, setEditSettings] = useState(settings);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    updateSettings(editSettings);
  };

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to conclude the current cycle and start a new one? This will reset all participants.')) {
      concludeAndRestart();
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top5 = getTopPerformers(5);

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Settings2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900">Program Controls</h2>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Cycle #{settings.currentCycleId}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Restart Cycle
            </button>
            <button 
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                settings.isPaused ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              )}
            >
              {settings.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {settings.isPaused ? 'Resume Program' : 'Pause Program'}
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Entry Fee ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="number" 
                value={editSettings.entryFee}
                onChange={e => setEditSettings({ ...editSettings, entryFee: parseFloat(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Target Subscribers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="number" 
                value={editSettings.targetSubscribers}
                onChange={e => setEditSettings({ ...editSettings, targetSubscribers: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={editSettings.durationDays}
                onChange={e => setEditSettings({ ...editSettings, durationDays: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                <option value={31}>31 Days</option>
                <option value={62}>62 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Participant Tracking
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search participants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Friends</th>
                  <th className="px-4 py-3">Videos</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Subs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map(p => (
                  <tr key={p.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{p.userName}</div>
                      <div className="text-[10px] text-gray-400">{p.userId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.stats.likes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{p.stats.friends}</td>
                    <td className="px-4 py-3 text-gray-600">{p.stats.videos}</td>
                    <td className="px-4 py-3 text-gray-600">{p.stats.activityHours}h</td>
                    <td className="px-4 py-3 text-gray-600">{p.stats.subscribers.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No participants found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Current Leaders
          </h3>
          <div className="space-y-4">
            {top5.map((p, idx) => (
              <div key={p.userId} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    idx === 0 ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-400"
                  )}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{p.userName}</p>
                    <p className="text-[10px] text-gray-400">{p.stats.likes.toLocaleString()} likes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-400">${settings.prizes[idx]?.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500">Projected</p>
                </div>
              </div>
            ))}
            {top5.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No leaders yet
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
