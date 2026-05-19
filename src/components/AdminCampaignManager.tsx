import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  Trophy, Settings, Users, Heart, Clock, Target, 
  DollarSign, Save, AlertCircle, Pause, Play, 
  XCircle, RefreshCw, TrendingUp, Award
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface CampaignSettings {
  awardProgram: {
    entryFee: number;
    targetSubscribers: number;
    cycleMonths: number;
    extensionMonths: number;
    requirements: {
      likes: number;
      subscribers: number;
      hours: number;
      connections: number;
      sales: number;
    };
    status: 'active' | 'paused' | 'cancelled';
  };
  connectionCampaign: {
    rewardAmount: number;
    targetConnections: number;
    status: 'active' | 'paused';
  };
}

const INITIAL_SETTINGS: CampaignSettings = {
  awardProgram: {
    entryFee: 100,
    targetSubscribers: 100000,
    cycleMonths: 18,
    extensionMonths: 36,
    requirements: {
      likes: 200000,
      subscribers: 200000,
      hours: 2000,
      connections: 1500,
      sales: 250
    },
    status: 'active'
  },
  connectionCampaign: {
    rewardAmount: 5.00,
    targetConnections: 100,
    status: 'active'
  }
};

export default function AdminCampaignManager() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin';
  
  const [settings, setSettings] = useState<CampaignSettings>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'award' | 'connection'>('award');

  if (!isAdmin) return null;

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Campaign settings updated successfully!');
    }, 1000);
  };

  const updateAwardReq = (field: keyof CampaignSettings['awardProgram']['requirements'], value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings({
      ...settings,
      awardProgram: {
        ...settings.awardProgram,
        requirements: {
          ...settings.awardProgram.requirements,
          [field]: numValue
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Campaign & Awards Manager</h2>
              <p className="text-xs text-gray-400">Configure platform-wide reward programs</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSection('award')}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeSection === 'award' ? "bg-white text-gray-900" : "bg-white/10 text-gray-400 hover:bg-white/20"
            )}
          >
            Award Program
          </button>
          <button 
            onClick={() => setActiveSection('connection')}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeSection === 'connection' ? "bg-white text-gray-900" : "bg-white/10 text-gray-400 hover:bg-white/20"
            )}
          >
            Connection Campaign
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeSection === 'award' ? (
          <div className="space-y-8">
            {/* Program Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-3 h-3 rounded-full animate-pulse",
                  settings.awardProgram.status === 'active' ? "bg-green-500" : "bg-amber-500"
                )} />
                <div>
                  <p className="text-sm font-bold text-gray-900">Program Status: <span className="capitalize">{settings.awardProgram.status}</span></p>
                  <p className="text-[10px] text-gray-500">Current cycle: {settings.awardProgram.cycleMonths} Months</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSettings({...settings, awardProgram: {...settings.awardProgram, status: settings.awardProgram.status === 'active' ? 'paused' : 'active'}})}
                  className="p-2 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-amber-500 transition-colors"
                >
                  {settings.awardProgram.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setSettings({...settings, awardProgram: {...settings.awardProgram, status: 'cancelled'}})}
                  className="p-2 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Basic Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Entry Fee ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={settings.awardProgram.entryFee}
                    onChange={(e) => setSettings({...settings, awardProgram: {...settings.awardProgram, entryFee: parseInt(e.target.value) || 0}})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Target Platform Subs</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={settings.awardProgram.targetSubscribers}
                    onChange={(e) => setSettings({...settings, awardProgram: {...settings.awardProgram, targetSubscribers: parseInt(e.target.value) || 0}})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Cycle Duration (Months)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={settings.awardProgram.cycleMonths}
                    onChange={(e) => setSettings({...settings, awardProgram: {...settings.awardProgram, cycleMonths: parseInt(e.target.value) || 0}})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Requirements Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" /> Individual Requirements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-gray-700">Required Likes</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.awardProgram.requirements.likes}
                    onChange={(e) => updateAwardReq('likes', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-gray-700">Required Subscribers</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.awardProgram.requirements.subscribers}
                    onChange={(e) => updateAwardReq('subscribers', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-gray-700">Activity Hours</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.awardProgram.requirements.hours}
                    onChange={(e) => updateAwardReq('hours', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-gray-700">Connected People</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.awardProgram.requirements.connections}
                    onChange={(e) => updateAwardReq('connections', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-gray-700">Product Sales</span>
                  </div>
                  <input 
                    type="number" 
                    value={settings.awardProgram.requirements.sales}
                    onChange={(e) => updateAwardReq('sales', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-3 h-3 rounded-full animate-pulse",
                  settings.connectionCampaign.status === 'active' ? "bg-green-500" : "bg-amber-500"
                )} />
                <div>
                  <p className="text-sm font-bold text-gray-900">Campaign Status: <span className="capitalize">{settings.connectionCampaign.status}</span></p>
                  <p className="text-[10px] text-gray-500">Currently active for all users</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, connectionCampaign: {...settings.connectionCampaign, status: settings.connectionCampaign.status === 'active' ? 'paused' : 'active'}})}
                className="p-2 bg-white border border-gray-100 rounded-xl text-gray-600 hover:text-amber-500 transition-colors"
              >
                {settings.connectionCampaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Reward Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.connectionCampaign.rewardAmount}
                    onChange={(e) => setSettings({...settings, connectionCampaign: {...settings.connectionCampaign, rewardAmount: parseFloat(e.target.value) || 0}})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Target Connections</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    value={settings.connectionCampaign.targetConnections}
                    onChange={(e) => setSettings({...settings, connectionCampaign: {...settings.connectionCampaign, targetConnections: parseInt(e.target.value) || 0}})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-900">Campaign Logic</p>
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Users will earn <span className="font-bold">${settings.connectionCampaign.rewardAmount}</span> for every <span className="font-bold">{settings.connectionCampaign.targetConnections}</span> friends they connect to the platform. This is calculated automatically in the Supreme Connectors widget.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Reward Systems Control</span>
        </div>
        <p className="text-[10px] text-gray-400">Last updated: Just now</p>
      </div>
    </div>
  );
}
