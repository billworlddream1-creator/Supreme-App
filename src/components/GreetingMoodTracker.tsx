import React, { useState } from 'react';
import { useGreeting, GreetingMood, AITone } from '../context/GreetingContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, Cake, Sparkles, Crown, Zap, Clock, Gift, Award, Shield, 
  RotateCcw, Calendar, CheckCircle2, AlertCircle, Bot, RefreshCw, 
  History, Eye, Sliders, ChevronRight, UserCheck, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function GreetingMoodTracker() {
  const { user } = useAuth();
  const {
    activeMood,
    greetingData,
    overrideMood,
    setOverrideMood,
    aiTone,
    setAiTone,
    isGeneratingAI,
    customAiPhrase,
    generateAIGreeting,
    resetAIGreeting,
    isTrackerOpen,
    setIsTrackerOpen,
    historyLogs,
    updateUserBirthday,
    toggleRewardProgram,
    metrics,
  } = useGreeting();

  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'ai' | 'birthday' | 'history'>('overview');
  const [birthdayInput, setBirthdayInput] = useState<string>(user?.birthday || '');
  const [isSavingBirthday, setIsSavingBirthday] = useState<boolean>(false);

  if (!isTrackerOpen) return null;

  const handleSaveBirthday = async () => {
    if (!birthdayInput) {
      toast.error("Please select a valid date");
      return;
    }
    setIsSavingBirthday(true);
    try {
      await updateUserBirthday(birthdayInput);
      toast.success("Birthday updated successfully! 🎂", {
        description: `Your birthday is set to ${birthdayInput}. The birthday greeting will activate on your birthday!`
      });
    } catch (err) {
      toast.error("Failed to update birthday");
    } finally {
      setIsSavingBirthday(false);
    }
  };

  const handleToggleReward = async () => {
    const nextState = !metrics.hasJoinedRewardProgram;
    await toggleRewardProgram(nextState);
    toast.success(nextState ? "Joined Reward Program! 🏆" : "Left Reward Program", {
      description: nextState 
        ? "Your greeting mood updated to Ambassador Potential!" 
        : "Your greeting mood updated to Reward Invitation."
    });
  };

  const allMoods: { mood: GreetingMood; label: string; desc: string; icon: React.ElementType; color: string }[] = [
    {
      mood: 'birthday',
      label: '🎂 Birthday Celebration',
      desc: "Triggers on the user's birthday date.",
      icon: Cake,
      color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    },
    {
      mood: 'new_user',
      label: '✨ New Citizen Welcome',
      desc: 'Triggers within 24 hours of account registration.',
      icon: Sparkles,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      mood: 'subscribed',
      label: '👑 Subscribed Champion',
      desc: 'Triggers when user has an active subscription plan.',
      icon: Crown,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      mood: 'unsubscribed_longterm',
      label: '📢 Subscription Invitation',
      desc: 'Triggers when user has registered > 30 days without subscribing.',
      icon: Zap,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
    {
      mood: 'returning_inactive',
      label: '⏳ Inactive Homecoming',
      desc: 'Triggers when user has not logged in for 1 week or more.',
      icon: Clock,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      mood: 'reward_unjoined',
      label: '🎁 Reward Program Invite',
      desc: 'Triggers when user has not joined the official reward program.',
      icon: Gift,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
    },
    {
      mood: 'reward_joined',
      label: '⚡ Ambassador Potential',
      desc: 'Triggers when user has joined the official reward program.',
      icon: Award,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
    },
    {
      mood: 'welcome_back',
      label: '🛡️ Standard Welcome Back',
      desc: 'Default returning active user greeting.',
      icon: Shield,
      color: 'bg-zinc-500/10 text-zinc-700 border-zinc-200',
    },
  ];

  const tones: { id: AITone; label: string; desc: string; emoji: string }[] = [
    { id: 'supreme', label: 'Supreme Royal', desc: 'Commanding, confident, elite', emoji: '👑' },
    { id: 'inspiring', label: 'Inspiring Vision', desc: 'Uplifting, empowering, motivational', emoji: '🌟' },
    { id: 'royal', label: 'Royal Monarch', desc: 'High-class, prestigious, grand', emoji: '⚜️' },
    { id: 'friendly', label: 'Warm & Welcoming', desc: 'Friendly, accessible, personal', emoji: '🤗' },
    { id: 'energetic', label: 'High Momentum', desc: 'Energetic, fast-paced, action-oriented', emoji: '⚡' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black p-5 md:p-6 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">
                    Supreme Greeting & Mood Console
                  </h2>
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-amber-500/30">
                    LIVE TRACKER
                  </span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                  Dynamic mood analysis, criteria tracking, AI generation & manual simulator
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsTrackerOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 md:px-6 overflow-x-auto no-scrollbar gap-2 py-2">
            {[
              { id: 'overview', label: 'Current Mood', icon: Eye },
              { id: 'simulator', label: 'Mood Simulator', icon: Sliders },
              { id: 'ai', label: 'AI Synthesizer', icon: Bot },
              { id: 'birthday', label: 'Birthday Setup', icon: Cake },
              { id: 'history', label: 'History Log', icon: History },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="p-5 md:p-8 overflow-y-auto flex-1 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Active Banner Preview */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${greetingData.badgeColor}`}>
                          {greetingData.badgeLabel}
                        </span>
                        {overrideMood && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
                            Manual Preview Active
                          </span>
                        )}
                        {customAiPhrase && (
                          <span className="bg-teal-100 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> AI Customized
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-display font-bold text-gray-900">
                        {greetingData.headline}
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed max-w-2xl">
                        "{greetingData.subtext}"
                      </p>
                    </div>

                    {overrideMood && (
                      <button
                        onClick={() => setOverrideMood(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-md shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Auto-Evaluate
                      </button>
                    )}
                  </div>
                </div>

                {/* Trigger Criteria Evaluation Matrix */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" /> Live Trigger Evaluation Matrix
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Birthday Criteria */}
                    <div className={`p-4 rounded-2xl border transition-all ${metrics.isBirthdayToday ? 'bg-pink-50 border-pink-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${metrics.isBirthdayToday ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Cake className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">1. Birthday Match</p>
                            <p className="text-xs text-gray-500">
                              {user?.birthday ? `Set to: ${user.birthday}` : 'No Birthday Set'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${metrics.isBirthdayToday ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-600'}`}>
                          {metrics.isBirthdayToday ? 'MATCHED 🎉' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* New User Criteria */}
                    <div className={`p-4 rounded-2xl border transition-all ${metrics.isNewUser ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${metrics.isNewUser ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">2. Registration &lt; 24h</p>
                            <p className="text-xs text-gray-500">
                              Account age: {metrics.daysSinceCreation} day(s)
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${metrics.isNewUser ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                          {metrics.isNewUser ? 'MATCHED ✨' : 'Passed (>24h)'}
                        </span>
                      </div>
                    </div>

                    {/* Inactive 1 week Criteria */}
                    <div className={`p-4 rounded-2xl border transition-all ${metrics.isInactiveOneWeek ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${metrics.isInactiveOneWeek ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">3. Inactive &gt;= 1 Week</p>
                            <p className="text-xs text-gray-500">
                              Days since last login: {metrics.daysSinceLastLogin} day(s)
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${metrics.isInactiveOneWeek ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                          {metrics.isInactiveOneWeek ? 'MATCHED ⏳' : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Subscription Criteria */}
                    <div className={`p-4 rounded-2xl border transition-all ${metrics.isSubscribed ? 'bg-amber-50 border-amber-300' : metrics.isUnsubscribedLongterm ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${metrics.isSubscribed ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">4. Subscription Status</p>
                            <p className="text-xs text-gray-500">
                              {metrics.isSubscribed ? 'Active Plan' : metrics.isUnsubscribedLongterm ? 'Unsubscribed (> 30 days old)' : 'Free tier'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${metrics.isSubscribed ? 'bg-amber-200 text-amber-800' : metrics.isUnsubscribedLongterm ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
                          {metrics.isSubscribed ? 'SUBSCRIBED 💎' : metrics.isUnsubscribedLongterm ? 'UNSUBSCRIBED (>30d)' : 'Free Tier'}
                        </span>
                      </div>
                    </div>

                    {/* Reward Program Criteria */}
                    <div className={`p-4 rounded-2xl border transition-all col-span-1 md:col-span-2 ${metrics.hasJoinedRewardProgram ? 'bg-orange-50 border-orange-300' : 'bg-rose-50 border-rose-300'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${metrics.hasJoinedRewardProgram ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'}`}>
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">5. Reward Program Enrollment</p>
                            <p className="text-xs text-gray-500">
                              {metrics.hasJoinedRewardProgram ? 'Enrolled - Ambassador Potential Greeting Active' : 'Not Enrolled - Invitation Greeting Active'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleToggleReward}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            metrics.hasJoinedRewardProgram
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-rose-500 text-white hover:bg-rose-600'
                          }`}
                        >
                          {metrics.hasJoinedRewardProgram ? 'Switch to Unjoined' : 'Switch to Joined'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR TAB */}
            {activeTab === 'simulator' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Manual Mood Simulator</h4>
                    <p className="text-xs text-gray-500">Click any greeting mood to force preview it on your dashboard.</p>
                  </div>

                  {overrideMood && (
                    <button
                      onClick={() => setOverrideMood(null)}
                      className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Auto-Evaluate
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allMoods.map(item => {
                    const Icon = item.icon;
                    const isSelected = activeMood === item.mood;
                    return (
                      <button
                        key={item.mood}
                        onClick={() => {
                          setOverrideMood(item.mood);
                          toast.success(`Previewing ${item.label}`, {
                            description: 'Top header updated to this greeting mood.'
                          });
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs">
                          <span className={`font-semibold ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>
                            {isSelected ? 'ACTIVE PREVIEW' : 'Click to Test'}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-gray-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI SYNTHESIZER TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-amber-500" /> AI Greeting Mood Synthesizer
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Generate dynamic, customized inspirational subtexts according to the time of day and chosen mood tone.
                  </p>
                </div>

                {/* Tone Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                    Select Emotional Tone
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {tones.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setAiTone(t.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          aiTone === t.id
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                        }`}
                      >
                        <span className="text-lg">{t.emoji}</span>
                        <p className="text-xs font-bold mt-1">{t.label}</p>
                        <p className={`text-[10px] mt-0.5 ${aiTone === t.id ? 'text-amber-100' : 'text-gray-500'}`}>
                          {t.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button & Result */}
                <div className="p-6 bg-gray-900 text-white rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-amber-400">
                      CURRENT AI SUBTEXT
                    </span>
                    {customAiPhrase && (
                      <button
                        onClick={resetAIGreeting}
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        Reset to Default Subtext
                      </button>
                    )}
                  </div>

                  <p className="text-lg font-medium text-gray-100 leading-relaxed italic">
                    "{greetingData.subtext}"
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => generateAIGreeting()}
                      disabled={isGeneratingAI}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-bold rounded-xl hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing AI Greeting...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" /> Synthesize AI Greeting Phrase
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BIRTHDAY SETUP TAB */}
            {activeTab === 'birthday' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Cake className="w-5 h-5 text-pink-500" /> Birthday Date Setup
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Set or update your birthdate so Supreme can trigger your personalized birthday greeting on your special day!
                  </p>
                </div>

                <div className="p-6 bg-pink-50/50 border border-pink-200 rounded-2xl space-y-4">
                  <label className="text-xs font-bold text-gray-700 block">
                    Your Date of Birth (YYYY-MM-DD)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={birthdayInput}
                      onChange={(e) => setBirthdayInput(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                    />

                    <button
                      onClick={handleSaveBirthday}
                      disabled={isSavingBirthday}
                      className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all shadow-md shadow-pink-500/20 text-sm disabled:opacity-50"
                    >
                      {isSavingBirthday ? "Saving..." : "Save Birthday"}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        setBirthdayInput(todayStr);
                        updateUserBirthday(todayStr);
                        setOverrideMood('birthday');
                        toast.success("Test Birthday Triggered! 🎉", {
                          description: "Birthday date set to today and birthday mood preview activated!"
                        });
                      }}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Set Birthday to Today & Test Celebration Greeting
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY LOG TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Greeting Mood History Logs</h4>
                  <p className="text-xs text-gray-500">Track all evaluated greeting mood triggers and time history.</p>
                </div>

                {historyLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                    No historical logs recorded yet in this session.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {historyLogs.map(log => (
                      <div key={log.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {log.mood.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{log.timestamp}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1">{log.headline}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{log.triggerReason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Supreme Greeting Engine v2.0 • Real-time Context Analytics</span>
            <button
              onClick={() => setIsTrackerOpen(false)}
              className="px-5 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              Close Console
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
