import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  DollarSign, Users, Heart, Clock, UserPlus, ShoppingBag, 
  Save, RefreshCw, TrendingUp, Settings, AlertCircle,
  BarChart3, ArrowUpRight, CreditCard, Smartphone
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface EarningRate {
  id: string;
  label: string;
  target: number;
  rate: number;
  icon: React.ElementType;
  color: string;
}

const INITIAL_RATES: EarningRate[] = [
  { id: 'subscribers', label: 'Subscribers', target: 1000, rate: 1.1111, icon: Users, color: 'text-blue-500 bg-blue-50' },
  { id: 'likes', label: 'Likes', target: 1000, rate: 0.11111, icon: Heart, color: 'text-red-500 bg-red-50' },
  { id: 'hoursWeekly', label: 'Weekly Activity Hours', target: 10, rate: 0.1111, icon: Clock, color: 'text-purple-500 bg-purple-50' },
  { id: 'friends', label: 'Connected Friends', target: 100, rate: 5.00, icon: UserPlus, color: 'text-green-500 bg-green-50' },
  { id: 'productsSold', label: 'Products/Services Sold', target: 25, rate: 0.11111, icon: ShoppingBag, color: 'text-orange-500 bg-orange-50' },
  { id: 'subscriptionsMade', label: 'Subscriptions Made', target: 1, rate: 0.11111, icon: CreditCard, color: 'text-teal-500 bg-teal-50' },
  { id: 'dailyPosts', label: 'Daily Posts', target: 50, rate: 0.00111, icon: Smartphone, color: 'text-indigo-500 bg-indigo-50' },
  { id: 'dailyVideos', label: 'Daily Videos', target: 25, rate: 0.00111, icon: BarChart3, color: 'text-pink-500 bg-pink-50' }
];

export default function AdminEarningsManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin';
  
  const [rates, setRates] = useState<EarningRate[]>(INITIAL_RATES);
  const [isSaving, setIsSaving] = useState(false);
  const [payoutThreshold, setPayoutThreshold] = useState(50.00);

  if (!isAdmin) return null;

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Earning rates updated successfully!');
    }, 1000);
  };

  const updateRate = (id: string, field: 'target' | 'rate', value: string) => {
    const numValue = parseFloat(value) || 0;
    setRates(rates.map(r => r.id === id ? { ...r, [field]: numValue } : r));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Earnings Program Manager</h2>
              <p className="text-xs text-gray-400">Manage payout rates and targets for all earners</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Rates
          </button>
        </div>

        {/* Global Config */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Minimum Payout ($)</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <input 
                type="number" 
                value={payoutThreshold}
                onChange={(e) => setPayoutThreshold(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-xl font-bold text-white outline-none w-full"
              />
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Earners</p>
            <p className="text-2xl font-bold">12,402</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Platform Payouts (MTD)</p>
            <p className="text-2xl font-bold text-amber-400">$45.2K</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
            <Settings className="w-4 h-4 text-gray-400" /> Earning Rate Configuration
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
            <AlertCircle className="w-3 h-3" /> Rates are per target reached
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rates.map((rate) => {
            const Icon = rate.icon;
            return (
              <div key={rate.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-xl", rate.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{rate.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Target Amount</label>
                    <input 
                      type="number" 
                      value={rate.target}
                      onChange={(e) => updateRate(rate.id, 'target', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Earning Rate ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        type="number" 
                        step="0.00001"
                        value={rate.rate}
                        onChange={(e) => updateRate(rate.id, 'rate', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-200/50">
                  <p className="text-[10px] text-gray-500 italic">
                    Earners get <span className="font-bold text-gray-900">${rate.rate.toFixed(4)}</span> for every <span className="font-bold text-gray-900">{rate.target.toLocaleString()}</span> {rate.label.toLowerCase()}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                    <TrendingUp className="w-3 h-3" /> Live
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Section */}
        <div className="p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Earnings Impact Analysis</h4>
                <p className="text-xs text-gray-400">Current rates project a 15% increase in user engagement this quarter.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-gray-900 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group">
              View Detailed Earner Report
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
