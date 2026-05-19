import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Pickaxe, TrendingUp, Settings, Plus, Trash2, Save, 
  History, Activity, Cpu, Coins, ArrowUpRight, Clock
} from 'lucide-react';
import { useMining } from '../context/MiningContext';
import { clsx } from 'clsx';

export default function AdminMiningManager() {
  const { 
    coins, exchangeRates, miningRigs, miningActivities,
    updateExchangeRate, updateRigRate, addCoin, removeCoin 
  } = useMining();

  const [activeTab, setActiveTab] = useState<'rates' | 'rigs' | 'coins' | 'activities'>('activities');
  const [newCoin, setNewCoin] = useState({ id: '', name: '', color: '#000000', rate: 0 });

  const handleAddCoin = () => {
    if (!newCoin.id || !newCoin.name || newCoin.rate <= 0) return;
    addCoin({ id: newCoin.id, name: newCoin.name, color: newCoin.color }, newCoin.rate);
    setNewCoin({ id: '', name: '', color: '#000000', rate: 0 });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 text-white rounded-xl">
              <Pickaxe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mining Administration</h2>
              <p className="text-sm text-gray-500">Manage coins, rates, and track activities</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: 'activities', label: 'Activities', icon: History },
            { id: 'rates', label: 'Exchange Rates', icon: TrendingUp },
            { id: 'rigs', label: 'Rig Rates', icon: Cpu },
            { id: 'coins', label: 'Manage Coins', icon: Coins },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Recent Mining Activities</h3>
              <span className="text-xs font-medium text-gray-400">{miningActivities.length} total records</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pl-2">User/Coin</th>
                    <th className="pb-3">Rig</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Started</th>
                    <th className="pb-3">Mined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {miningActivities.map(activity => (
                    <tr key={activity.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                            style={{ backgroundColor: coins.find(c => c.id === activity.coinId)?.color }}
                          >
                            {activity.coinId}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{activity.coinId}</div>
                            <div className="text-[10px] text-gray-400 font-mono">ID: {activity.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">
                          {activity.rigId}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            activity.status === 'active' ? "bg-green-500 animate-pulse" : 
                            activity.status === 'completed' ? "bg-blue-500" : "bg-gray-400"
                          )} />
                          <span className={clsx(
                            "text-xs font-bold capitalize",
                            activity.status === 'active' ? "text-green-600" : 
                            activity.status === 'completed' ? "text-blue-600" : "text-gray-500"
                          )}>
                            {activity.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-gray-600 font-medium">{formatTime(activity.startTime)}</div>
                        {activity.endTime && (
                          <div className="text-[10px] text-gray-400">End: {formatTime(activity.endTime)}</div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="font-mono font-bold text-gray-900 text-sm">
                          {activity.amountMined.toFixed(12)}
                        </div>
                        <div className="text-[10px] text-green-600 font-bold">
                          ≈ ${(activity.amountMined * (exchangeRates[activity.coinId] || 0)).toFixed(4)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {miningActivities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <History className="w-12 h-12 mb-2 opacity-20" />
                          <p className="font-medium">No mining activities recorded yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coins.map(coin => (
              <div key={coin.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[8px]"
                    style={{ backgroundColor: coin.color }}
                  >
                    {coin.id}
                  </div>
                  <span className="font-bold text-gray-900">{coin.name}</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    defaultValue={exchangeRates[coin.id]}
                    onBlur={(e) => updateExchangeRate(coin.id, parseFloat(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rigs' && (
          <div className="space-y-4">
            {miningRigs.map(rig => (
              <div key={rig.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white", rig.color)}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{rig.name}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{rig.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Mining Rate</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.001"
                        defaultValue={rig.rate}
                        onBlur={(e) => updateRigRate(rig.id, parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-900"
                      />
                      <span className="text-xs text-gray-400 font-bold">/s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coins' && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-3xl text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Add New Coin
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="ID (e.g. BTC)"
                  value={newCoin.id}
                  onChange={e => setNewCoin({ ...newCoin, id: e.target.value.toUpperCase() })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-white/30"
                />
                <input
                  type="text"
                  placeholder="Name (e.g. Bitcoin)"
                  value={newCoin.name}
                  onChange={e => setNewCoin({ ...newCoin, name: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-white/30"
                />
                <input
                  type="number"
                  placeholder="Rate in USD"
                  value={newCoin.rate || ''}
                  onChange={e => setNewCoin({ ...newCoin, rate: parseFloat(e.target.value) })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  onClick={handleAddCoin}
                  className="bg-white text-gray-900 rounded-xl px-4 py-2 text-sm font-black hover:bg-gray-100 transition-colors"
                >
                  Add Coin
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coins.map(coin => (
                <div key={coin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: coin.color }}
                    >
                      {coin.id}
                    </div>
                    <span className="font-bold text-gray-900">{coin.name}</span>
                  </div>
                  <button
                    onClick={() => removeCoin(coin.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
