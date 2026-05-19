import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, Plus, Trash2, Search, Award, Clock, Activity, BarChart3, RefreshCw, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

// Mock data for award winners
const mockAwardWinners = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', award: 'Monthly Award', date: 'March 2026' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', award: '18 Months Award', date: 'Jan 2025 - Jun 2026' },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', award: 'Highest Earner', date: '2026' },
];

interface HallOfFameKey {
  id: string;
  key: string;
  userId: string;
  userName: string;
  userEmail: string;
  award: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

export default function AdminHallOfFameKeys() {
  const [keys, setKeys] = useState<HallOfFameKey[]>([]);
  const [selectedWinner, setSelectedWinner] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('manage'); // manage, analysis

  // Hourly Analysis State
  const [hourlyStats, setHourlyStats] = useState<{hour: string, generated: number, used: number}[]>([]);

  useEffect(() => {
    // Load keys from localStorage
    const savedKeys = localStorage.getItem('hallOfFameKeys');
    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    } else {
      // Mock initial keys
      const initialKeys = [
        {
          id: '1',
          key: 'HOF-ALEX-8F92A',
          userId: '1',
          userName: 'Alex Johnson',
          userEmail: 'alex@example.com',
          award: 'Monthly Award',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        }
      ];
      setKeys(initialKeys);
      localStorage.setItem('hallOfFameKeys', JSON.stringify(initialKeys));
    }

    // Generate mock hourly stats
    const stats = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      stats.push({
        hour: `${d.getHours()}:00`,
        generated: Math.floor(Math.random() * 5),
        used: Math.floor(Math.random() * 3)
      });
    }
    setHourlyStats(stats);
  }, []);

  const generateKey = () => {
    if (!selectedWinner) return;
    
    const winner = mockAwardWinners.find(w => w.id === selectedWinner);
    if (!winner) return;

    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newKey: HallOfFameKey = {
      id: Date.now().toString(),
      key: `HOF-${winner.name.split(' ')[0].toUpperCase()}-${randomStr}`,
      userId: winner.id,
      userName: winner.name,
      userEmail: winner.email,
      award: winner.award,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
      used: false
    };

    const updatedKeys = [newKey, ...keys];
    setKeys(updatedKeys);
    localStorage.setItem('hallOfFameKeys', JSON.stringify(updatedKeys));
    setSelectedWinner('');
  };

  const revokeKey = (id: string) => {
    const updatedKeys = keys.filter(k => k.id !== id);
    setKeys(updatedKeys);
    localStorage.setItem('hallOfFameKeys', JSON.stringify(updatedKeys));
  };

  const filteredKeys = keys.filter(k => 
    k.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.award.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hall of Fame Keys</h2>
          <p className="text-gray-500">Manage testimony posting keys for award winners</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('manage')}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'manage' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Manage Keys
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'analysis' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Hourly Analysis
          </button>
        </div>
      </div>

      {activeTab === 'manage' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate Key Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-500" />
                Generate New Key
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Award Winner</label>
                  <select
                    value={selectedWinner}
                    onChange={(e) => setSelectedWinner(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="">-- Select Winner --</option>
                    {mockAwardWinners.map(winner => (
                      <option key={winner.id} value={winner.id}>
                        {winner.name} ({winner.award})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={generateKey}
                  disabled={!selectedWinner}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Generate Key
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Key Rules
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Keys can only be generated for verified award winners.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Each key is single-use for posting one testimony.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  Keys expire 7 days after generation if not used.
                </li>
              </ul>
            </div>
          </div>

          {/* Keys List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Active & Used Keys</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none w-64"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-medium">Key</th>
                      <th className="p-4 font-medium">Winner</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Created</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredKeys.map(key => (
                      <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                            {key.key}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{key.userName}</div>
                          <div className="text-xs text-gray-500">{key.award}</div>
                        </td>
                        <td className="p-4">
                          {key.used ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" /> Used
                            </span>
                          ) : new Date(key.expiresAt) < new Date() ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                              <XCircle className="w-3 h-3" /> Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                              <Clock className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => revokeKey(key.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Revoke Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredKeys.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No keys found. Generate one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hourly Analysis Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Key className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +12%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{keys.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Keys Generated</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +5%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{keys.filter(k => k.used).length}</div>
              <div className="text-sm text-gray-500 mt-1">Keys Used (Testimonies Posted)</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {keys.length > 0 ? Math.round((keys.filter(k => k.used).length / keys.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Usage Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Hourly Key Activity (Last 24 Hours)
              </h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-64 flex items-end gap-2">
              {hourlyStats.map((stat, i) => {
                const maxVal = Math.max(...hourlyStats.map(s => Math.max(s.generated, s.used, 1)));
                const genHeight = (stat.generated / maxVal) * 100;
                const usedHeight = (stat.used / maxVal) * 100;
                
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {stat.hour}<br/>
                      Gen: {stat.generated} | Used: {stat.used}
                    </div>
                    
                    <div className="w-full flex justify-center gap-1 items-end h-full">
                      <div 
                        className="w-1/2 bg-blue-400 rounded-t-sm transition-all duration-500" 
                        style={{ height: `${genHeight}%`, minHeight: stat.generated > 0 ? '4px' : '0' }}
                      />
                      <div 
                        className="w-1/2 bg-green-400 rounded-t-sm transition-all duration-500" 
                        style={{ height: `${usedHeight}%`, minHeight: stat.used > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left w-full text-center">
                      {i % 3 === 0 ? stat.hour : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-sm text-gray-600">Keys Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-gray-600">Keys Used</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
