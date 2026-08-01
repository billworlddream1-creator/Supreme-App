import React, { useState } from 'react';
import { useGreeting } from '../context/GreetingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Cake, Sparkles, Crown, Zap, Clock, Gift, Award, Shield, 
  Sliders, ArrowRight, Sun, Sunset, Moon, Sunrise, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SupremeGreetingHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    activeMood,
    greetingData,
    setIsTrackerOpen,
    overrideMood,
    generateAIGreeting,
    isGeneratingAI,
  } = useGreeting();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Pick Lucide icon according to badgeIcon name
  const renderIcon = () => {
    switch (greetingData.badgeIcon) {
      case 'Cake': return <Cake className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Crown': return <Crown className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'Clock': return <Clock className="w-3.5 h-3.5" />;
      case 'Gift': return <Gift className="w-3.5 h-3.5" />;
      case 'Award': return <Award className="w-3.5 h-3.5" />;
      default: return <Shield className="w-3.5 h-3.5" />;
    }
  };

  // Time of day visual icon
  const renderTimeIcon = () => {
    switch (greetingData.timeOfDay) {
      case 'morning': return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      case 'afternoon': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'evening': return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      case 'night': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const timeOfDayLabel = 
    greetingData.timeOfDay === 'morning' ? 'Good Morning' :
    greetingData.timeOfDay === 'afternoon' ? 'Good Afternoon' :
    greetingData.timeOfDay === 'evening' ? 'Good Evening' : 'Good Night';

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-zinc-900 to-black p-4 sm:p-5 text-white shadow-lg border border-white/10 transition-all">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left Side: Headline, Badges, & Subtext */}
        <div className="space-y-1.5 max-w-3xl flex-1">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time of Day Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-gray-200 border border-white/10 backdrop-blur-sm">
              {renderTimeIcon()}
              <span>{timeOfDayLabel}</span>
            </div>

            {/* Active Mood Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r ${greetingData.badgeColor} shadow-sm`}>
              {renderIcon()}
              <span>{greetingData.badgeLabel}</span>
            </div>

            {overrideMood && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PREVIEW OVERRIDE
              </span>
            )}
          </div>

          {/* Animated Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={greetingData.headline}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug"
            >
              {greetingData.headline}
            </motion.h1>
          </AnimatePresence>

          {/* Animated Subtext Message (Collapsible or Concise) */}
          {!isCollapsed && (
            <AnimatePresence mode="wait">
              <motion.p
                key={greetingData.subtext}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-gray-300 text-xs sm:text-sm leading-relaxed font-normal"
              >
                {greetingData.subtext}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        {/* Right Side: Action Buttons & Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          
          {/* Primary Action Button */}
          <button
            onClick={() => navigate(greetingData.actionRoute)}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-amber-500 text-gray-950 font-bold rounded-xl hover:opacity-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 text-xs whitespace-nowrap group"
          >
            <span>{greetingData.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* AI Refresh Button */}
          <button
            onClick={() => generateAIGreeting()}
            disabled={isGeneratingAI}
            title="Refresh AI Greeting Phrase"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center text-xs disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Admin Mood Console Button */}
          <button
            onClick={() => setIsTrackerOpen(true)}
            title="Open Greeting Mood Console"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-gray-200 hover:text-white transition-all flex items-center justify-center text-xs shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Banner Subtext" : "Compact Banner"}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center text-xs shrink-0"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

        </div>

      </div>
    </div>
  );
}
