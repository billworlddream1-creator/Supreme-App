import React, { useState } from 'react';
import { useGreeting, GreetingMood, AITone } from '../context/GreetingContext';
import { useAuth } from '../context/AuthContext';
import SupremeGreetingHeader from './SupremeGreetingHeader';
import { 
  Sliders, Bot, Sparkles, Cake, Crown, Zap, Clock, Gift, Award, Shield,
  Radio, RotateCcw, Megaphone, CheckCircle2, AlertTriangle, Eye, RefreshCw,
  TrendingUp, Users, Activity, ChevronRight, ZapOff, Send, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminGreetingControl() {
  const { user } = useAuth();
  const {
    activeMood,
    greetingData,
    aiTone,
    setAiTone,
    metrics,
    adminForcedMood,
    setAdminForcedMood,
    adminCustomAnnouncement,
    setAdminCustomAnnouncement,
    adminForcedTone,
    setAdminForcedTone,
    resetAdminControls,
    generateAIGreeting,
    isGeneratingAI,
  } = useGreeting();

  const [announcementInput, setAnnouncementInput] = useState<string>(adminCustomAnnouncement || '');
  const [selectedUserTab, setSelectedUserTab] = useState<'global' | 'inspector' | 'analytics' | 'sandbox'>('global');

  // Helper lists
  const moods: { id: GreetingMood; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: 'birthday', label: '🎂 Birthday Celebration', icon: Cake, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30', desc: 'Triggers on user birthdate' },
    { id: 'new_user', label: '✨ New Citizen Welcome', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'New users < 24h old' },
    { id: 'subscribed', label: '👑 Subscribed Champion', icon: Crown, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Active subscribers' },
    { id: 'unsubscribed_longterm', label: '📢 Subscription Invite', icon: Zap, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', desc: 'Registered > 30d without sub' },
    { id: 'returning_inactive', label: '⏳ Inactive Homecoming', icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', desc: 'Inactive >= 7 days' },
    { id: 'reward_unjoined', label: '🎁 Reward Program Invite', icon: Gift, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', desc: 'Not enrolled in rewards' },
    { id: 'reward_joined', label: '⚡ Supreme Ambassador', icon: Award, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', desc: 'Enrolled in rewards' },
    { id: 'welcome_back', label: '🛡️ Returning Leader', icon: Shield, color: 'text-gray-300 bg-gray-500/10 border-gray-500/30', desc: 'Standard returning user' },
  ];

  const tones: { id: AITone; label: string; desc: string; emoji: string }[] = [
    { id: 'supreme', label: 'Supreme Royal', desc: 'Commanding, confident, elite', emoji: '👑' },
    { id: 'inspiring', label: 'Inspiring Vision', desc: 'Uplifting, empowering', emoji: '🌟' },
    { id: 'royal', label: 'Royal Monarch', desc: 'High-class, prestigious', emoji: '⚜️' },
    { id: 'friendly', label: 'Warm & Welcoming', desc: 'Friendly, personal', emoji: '🤗' },
    { id: 'energetic', label: 'High Momentum', desc: 'Action-oriented', emoji: '⚡' },
  ];

  const handleApplyAnnouncement = () => {
    if (!announcementInput.trim()) {
      setAdminCustomAnnouncement(null);
      toast.success("Global custom announcement cleared");
      return;
    }
    setAdminCustomAnnouncement(announcementInput.trim());
    toast.success("Global Greeting Announcement Published! 📢", {
      description: "All user greeting headers now display this announcement subtext."
    });
  };

  const handleClearAnnouncement = () => {
    setAnnouncementInput('');
    setAdminCustomAnnouncement(null);
    toast.info("Cleared custom announcement");
  };

  return (
    <div className="space-y-8">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-supreme-gold)]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[var(--color-supreme-gold)]/20 border border-[var(--color-supreme-gold)]/30 rounded-2xl text-[var(--color-supreme-gold)] shrink-0">
              <Sliders className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                  Greeting & Mood Command Center
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-mono border border-amber-500/30">
                  ADMIN CONTROL
                </span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                Globally force user greeting moods, manage AI generation tones, broadcast custom announcements, and audit trigger criteria.
              </p>
            </div>
          </div>

          {(adminForcedMood || adminCustomAnnouncement || adminForcedTone) && (
            <button
              onClick={() => {
                resetAdminControls();
                setAnnouncementInput('');
                toast.success("All Admin Greeting Overrides Cleared! Auto-evaluation restored.");
              }}
              className="px-5 py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
            >
              <RotateCcw className="w-4 h-4" /> Reset All Overrides
            </button>
          )}
        </div>
      </div>

      {/* Control Navigation Bar */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'global', label: 'Global Mood Override', icon: Radio },
          { id: 'sandbox', label: 'Live Sandbox Preview', icon: Eye },
          { id: 'analytics', label: 'Audience Mood Metrics', icon: TrendingUp },
          { id: 'inspector', label: 'User Criteria Inspector', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = selectedUserTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedUserTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--color-supreme-gold)] text-black shadow-lg shadow-[var(--color-supreme-gold)]/20 scale-[1.02]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GLOBAL MOOD OVERRIDE & ANNOUNCEMENTS */}
      {selectedUserTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mood Selector Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400" /> Force Global Greeting Mood
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Selecting a forced mood will override auto-evaluation for all users on the platform.
                </p>
              </div>

              {adminForcedMood && (
                <button
                  onClick={() => {
                    setAdminForcedMood(null);
                    toast.success("Restored Auto-Evaluation Mode");
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Auto-Evaluate
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Auto Evaluation Option */}
              <button
                onClick={() => {
                  setAdminForcedMood(null);
                  toast.success("Auto-Evaluation Mode Active", {
                    description: "Greetings will be computed based on individual user metrics."
                  });
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  adminForcedMood === null
                    ? 'bg-amber-500/10 border-amber-500 text-white ring-2 ring-amber-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">⚡ Auto-Evaluated (Default)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Dynamic criteria per user profile</p>
                  </div>
                </div>
              </button>

              {/* Specific Forced Moods */}
              {moods.map(item => {
                const Icon = item.icon;
                const isForced = adminForcedMood === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminForcedMood(item.id);
                      toast.success(`Forced Mood Set: ${item.label}`, {
                        description: `All users will now see the ${item.label} greeting header.`
                      });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isForced
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-2 ring-amber-500/30'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    {isForced && (
                      <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 bg-amber-500 text-black font-bold rounded-full">
                        FORCED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Settings: Announcements & AI Tones */}
          <div className="space-y-6">
            
            {/* Broadcast Custom Announcement */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" /> Broadcast Greeting Announcement
              </h4>
              <p className="text-xs text-gray-400">
                Replaces or enriches the subtext message across all greeting headers.
              </p>

              <textarea
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
                placeholder="Enter custom announcement subtext (e.g., Supreme VIP Gala event live now!)..."
                rows={3}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-xs font-medium text-white focus:border-amber-500 outline-none resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleApplyAnnouncement}
                  className="flex-1 py-2.5 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Banner
                </button>
                {adminCustomAnnouncement && (
                  <button
                    onClick={handleClearAnnouncement}
                    className="px-3 py-2.5 bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* AI Tone Enforcer */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" /> Default AI Tone Protocol
              </h4>
              <p className="text-xs text-gray-400">
                Select default emotional tone for synthesized AI phrases.
              </p>

              <div className="space-y-2">
                {tones.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setAdminForcedTone(t.id);
                      setAiTone(t.id);
                      toast.success(`AI Tone set to ${t.label}`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      (adminForcedTone || aiTone) === t.id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{t.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{t.label}</p>
                        <p className="text-[10px] text-gray-400">{t.desc}</p>
                      </div>
                    </div>
                    {(adminForcedTone || aiTone) === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LIVE SANDBOX PREVIEW */}
      {selectedUserTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" /> Live Header Sandbox Preview
                </h3>
                <p className="text-xs text-gray-400">
                  This preview renders the exact header component live with current admin configurations.
                </p>
              </div>

              <button
                onClick={() => generateAIGreeting()}
                disabled={isGeneratingAI}
                className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                Test AI Phrase Generation
              </button>
            </div>
          </div>

          {/* Live Component Render */}
          <SupremeGreetingHeader />

          <div className="p-6 bg-black/40 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-500 block">ACTIVE MOOD:</span>
              <span className="text-amber-400 font-bold">{activeMood.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">ADMIN MOOD OVERRIDE:</span>
              <span className="text-white font-bold">{adminForcedMood ? adminForcedMood.toUpperCase() : 'NONE (AUTO)'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">AI TONE PROTOCOL:</span>
              <span className="text-teal-400 font-bold">{(adminForcedTone || aiTone).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE MOOD METRICS */}
      {selectedUserTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Platform Audience Mood Analytics
            </h3>
            <p className="text-xs text-gray-400">
              Estimated distribution of active Supreme users matching greeting mood conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'New Citizens (<24h)', count: '1,240', pct: '18%', icon: Sparkles, color: 'text-emerald-400' },
              { label: 'Subscribed Champions', count: '3,890', pct: '56%', icon: Crown, color: 'text-amber-400' },
              { label: 'Unsubscribed (>30d)', count: '940', pct: '13%', icon: Zap, color: 'text-purple-400' },
              { label: 'Inactive Homecoming (>=7d)', count: '620', pct: '9%', icon: Clock, color: 'text-blue-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs font-mono font-bold text-gray-400">{stat.pct}</span>
                  </div>
                  <h4 className="text-2xl font-display font-bold text-white">{stat.count}</h4>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: USER CRITERIA INSPECTOR */}
      {selectedUserTab === 'inspector' && (
        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> User Criteria Inspector
            </h3>
            <p className="text-xs text-gray-400">
              Real-time evaluation metrics for current session user: <strong className="text-white">{user?.name || 'User'}</strong>
            </p>
          </div>

          <div className="p-6 bg-black/40 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">ACCOUNT AGE:</span>
              <span className="text-white font-bold text-sm">{metrics.daysSinceCreation} day(s)</span>
              <span className="text-emerald-400 block mt-1">{metrics.isNewUser ? 'Matched (<24h)' : 'Passed (>24h)'}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">INACTIVITY DURATION:</span>
              <span className="text-white font-bold text-sm">{metrics.daysSinceLastLogin} day(s)</span>
              <span className="text-blue-400 block mt-1">{metrics.isInactiveOneWeek ? 'Matched (>= 7 days)' : 'Active User'}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">SUBSCRIPTION TIER:</span>
              <span className="text-white font-bold text-sm">{metrics.isSubscribed ? 'SUBSCRIBED' : metrics.isUnsubscribedLongterm ? 'LONGTERM FREE TIER (>30d)' : 'FREE TIER'}</span>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1">REWARD PROGRAM:</span>
              <span className="text-white font-bold text-sm">{metrics.hasJoinedRewardProgram ? 'ENROLLED (AMBASSADOR)' : 'UNJOINED (INVITE)'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
