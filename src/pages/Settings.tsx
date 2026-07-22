import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Bell, 
  Shield, 
  Coins, 
  Sparkles, 
  Trash2, 
  Save, 
  Check, 
  Flame, 
  HelpCircle,
  Video,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { toast } from 'sonner';

interface PrivacySettings {
  profileVisibility: 'everyone' | 'friends' | 'only_me';
  showHoldings: 'everyone' | 'friends' | 'only_me';
  showOnlineStatus: 'everyone' | 'friends' | 'only_me';
  showStreak: 'everyone' | 'friends' | 'only_me';
}

interface ChatSettings {
  allowDMs: 'everyone' | 'friends' | 'no_one';
  typingIndicators: boolean;
  readReceipts: boolean;
  messagePreviews: boolean;
}

interface GeneralSettings {
  autoPlayMedia: boolean;
  streakReminders: boolean;
  highPerformanceMode: boolean;
  compactSidebar: boolean;
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { settings: soundSettings, updateSettings: updateSoundSettings, playSound } = useSound();
  const [activeTab, setActiveTab] = useState<'sound' | 'chat' | 'privacy' | 'general'>('sound');
  const [isSaving, setIsSaving] = useState(false);

  // Sound settings local states
  const [localSoundSettings, setLocalSoundSettings] = useState(soundSettings);

  // Privacy settings local states
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('supreme_privacy_settings');
    return saved ? JSON.parse(saved) : {
      profileVisibility: 'everyone',
      showHoldings: 'friends',
      showOnlineStatus: 'everyone',
      showStreak: 'everyone',
    };
  });

  // Chat settings local states
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    const saved = localStorage.getItem('supreme_chat_settings');
    return saved ? JSON.parse(saved) : {
      allowDMs: 'everyone',
      typingIndicators: true,
      readReceipts: true,
      messagePreviews: true,
    };
  });

  // General settings local states
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    const saved = localStorage.getItem('supreme_general_settings');
    return saved ? JSON.parse(saved) : {
      autoPlayMedia: true,
      streakReminders: user?.streakRemindersEnabled ?? true,
      highPerformanceMode: false,
      compactSidebar: false,
    };
  });

  // Keep local sound settings up to date with context
  useEffect(() => {
    setLocalSoundSettings(soundSettings);
  }, [soundSettings]);

  // Sync user profile field
  useEffect(() => {
    if (user) {
      setGeneralSettings(prev => ({
        ...prev,
        streakReminders: user.streakRemindersEnabled ?? true
      }));
    }
  }, [user]);

  const handleSoundToggle = (key: keyof typeof soundSettings) => {
    const updatedValue = !localSoundSettings[key];
    setLocalSoundSettings(prev => ({
      ...prev,
      [key]: updatedValue
    }));
    updateSoundSettings({ [key]: updatedValue });
    playSound('click');
    toast.success(`Sound option updated: ${key}`);
  };

  const handleVoiceChange = (voice: 'male' | 'female') => {
    setLocalSoundSettings(prev => ({
      ...prev,
      voiceType: voice
    }));
    updateSoundSettings({ voiceType: voice });
    playSound('click');
    toast.success(`Voice notification assistant set to: ${voice}`);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    localStorage.setItem('supreme_privacy_settings', JSON.stringify(updated));
    playSound('click');
  };

  const handleChatChange = (key: keyof ChatSettings, value: any) => {
    const updated = { ...chatSettings, [key]: value };
    setChatSettings(updated);
    localStorage.setItem('supreme_chat_settings', JSON.stringify(updated));
    playSound('click');
  };

  const handleGeneralChange = (key: keyof GeneralSettings, value: any) => {
    const updated = { ...generalSettings, [key]: value };
    setGeneralSettings(updated);
    localStorage.setItem('supreme_general_settings', JSON.stringify(updated));
    playSound('click');
  };

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    playSound('purchase');
    
    try {
      // If user logged in, persist to database
      if (user) {
        await updateProfile({
          streakRemindersEnabled: generalSettings.streakReminders,
          // We can also store other configuration blocks under a generic config field if needed,
          // but for instant feedback, we write them to the profile model
        });
      }
      
      // Delay slightly for visual feel
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("All setting profiles synchronized successfully!");
    } catch (e: any) {
      toast.error(`Synchronization failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to restore default application settings?")) {
      // Sound defaults
      updateSoundSettings({
        intruderAlert: true,
        newUserSignup: true,
        paymentRequest: true,
        failedLogin: true,
        voiceType: 'female',
      });

      // Privacy defaults
      const defPrivacy: PrivacySettings = {
        profileVisibility: 'everyone',
        showHoldings: 'friends',
        showOnlineStatus: 'everyone',
        showStreak: 'everyone',
      };
      setPrivacySettings(defPrivacy);
      localStorage.setItem('supreme_privacy_settings', JSON.stringify(defPrivacy));

      // Chat defaults
      const defChat: ChatSettings = {
        allowDMs: 'everyone',
        typingIndicators: true,
        readReceipts: true,
        messagePreviews: true,
      };
      setChatSettings(defChat);
      localStorage.setItem('supreme_chat_settings', JSON.stringify(defChat));

      // General defaults
      const defGeneral: GeneralSettings = {
        autoPlayMedia: true,
        streakReminders: true,
        highPerformanceMode: false,
        compactSidebar: false,
      };
      setGeneralSettings(defGeneral);
      localStorage.setItem('supreme_general_settings', JSON.stringify(defGeneral));

      toast.info("Settings restored to factory defaults");
      playSound('achievement');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Settings Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-black rounded-[2.5rem] border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] text-[10px] font-black uppercase tracking-widest border border-[var(--color-supreme-gold)]/20">
              Supreme Command Console
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              CENTRAL HUB
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-3 flex items-center gap-3">
            Central Application Settings
            <SettingsIcon className="w-8 h-8 text-[var(--color-supreme-gold)] animate-spin-slow" />
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Fine-tune audio controls, restrict direct messaging pathways, govern profile activity visibilities, and authorize system automation tools.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button 
            onClick={handleResetSettings}
            className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-2xl border border-red-500/20 transition-all flex items-center gap-2.5"
          >
            <Trash2 className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white hover:brightness-110 disabled:opacity-50 font-bold text-sm rounded-2xl transition-all flex items-center gap-2.5 shadow-lg shadow-[var(--color-supreme-gold)]/20"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Syncing...' : 'Save & Sync'}
          </button>
        </div>
      </div>

      {/* Main Settings Navigation and Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-4 h-fit space-y-1.5 backdrop-blur-xl">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider px-3 mb-3">Settings Categories</p>
          
          {[
            { id: 'sound', label: 'Sound Systems', desc: 'Audio Alerts & Vol', icon: Volume2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/10' },
            { id: 'chat', label: 'Chat Activities', desc: 'DMs & Typing States', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/10' },
            { id: 'privacy', label: 'Profile Privacy', desc: 'Who sees your activity', icon: Eye, color: 'text-purple-400 bg-purple-500/10 border-purple-500/10' },
            { id: 'general', label: 'General & Core', desc: 'Autoplay, compact rails', icon: Shield, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playSound('click');
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 group relative overflow-hidden ${
                  isSelected 
                    ? "bg-gradient-to-r from-gray-900 to-black border-white/15 text-white" 
                    : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--color-supreme-gold)]" />
                )}
                <div className={`p-2.5 rounded-xl border shrink-0 ${tab.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider">{tab.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{tab.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Setting Panels Container */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* 1. SOUND SYSTEM SETTINGS */}
            {activeTab === 'sound' && (
              <motion.div
                key="sound"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-2xl">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Audio Alerts &amp; Sound Systems</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Control live notifications and assistant sounds.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'intruderAlert', label: 'Intruder Alerts', desc: 'Wailing alarm sound effect when failed logins or illegal system interventions occur.' },
                    { key: 'newUserSignup', label: 'New Signups Chime', desc: 'Play positive sound effects whenever a new member registers on the system.' },
                    { key: 'paymentRequest', label: 'Cash Register Ring', desc: 'Chime a payment notification whenever commercial deals or coin transfers clear.' },
                    { key: 'failedLogin', label: 'Error Error Buzzer', desc: 'Buzz a sharp warning tone on typing mistakes or security access blocks.' }
                  ].map((item) => (
                    <div 
                      key={item.key}
                      onClick={() => handleSoundToggle(item.key as any)}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-4 cursor-pointer group"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[var(--color-supreme-gold)] transition-colors">{item.label}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative shrink-0 transition-all ${
                        localSoundSettings[item.key as keyof typeof soundSettings] ? 'bg-emerald-500' : 'bg-white/10'
                      }`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          localSoundSettings[item.key as keyof typeof soundSettings] ? 'right-1' : 'left-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assistant voice gender */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">Supreme Assistant Vocalizer</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Choose standard gender vocalizer for real-time speech synthesis guidance.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    {['male', 'female'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => handleVoiceChange(gender as any)}
                        className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${
                          localSoundSettings.voiceType === gender 
                            ? "bg-[var(--color-supreme-gold)] text-black border-transparent font-black shadow-lg" 
                            : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {gender === 'female' ? '🌸 Female Voice' : '⚡ Male Voice'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live audio preview button */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Test Supreme Speakers</p>
                      <p className="text-[10px] text-gray-500">Play an instant supreme sound indicator to test system sound card.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => playSound('achievement')}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Test Audio
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. CHAT ACTIVITIES */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Chat Activity Controls</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Regulate direct messages, typing statuses, and receipts.</p>
                  </div>
                </div>

                {/* Direct Messages permission */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">Who can initiate Direct Messages?</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Control direct messaging entrypoints to block spam bots or external entities.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'everyone', label: 'Everyone', desc: 'Open DMs' },
                      { val: 'friends', label: 'Friends Only', desc: 'Requires Mutual' },
                      { val: 'no_one', label: 'No One', desc: 'Completely Block' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleChatChange('allowDMs', opt.val)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          chatSettings.allowDMs === opt.val
                            ? "bg-blue-500/10 border-blue-500/40 text-blue-400 font-bold"
                            : "bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/15"
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                        <span className="text-[9px] opacity-70 font-mono">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  {[
                    { key: 'typingIndicators', label: 'Real-Time Typing Indicators', desc: 'Display "typing..." bubble inside private rooms when drafting responses.' },
                    { key: 'readReceipts', label: 'Read Receipts Confirmation', desc: 'Allow contacts to confirm when you have viewed their private messages.' },
                    { key: 'messagePreviews', label: 'Notification Message Previews', desc: 'Show body texts inside push notifications banners and system popups.' }
                  ].map((item) => (
                    <div 
                      key={item.key}
                      onClick={() => handleChatChange(item.key as any, !chatSettings[item.key as keyof ChatSettings])}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">{item.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative shrink-0 transition-all ${
                        chatSettings[item.key as keyof ChatSettings] ? 'bg-emerald-500' : 'bg-white/10'
                      }`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          chatSettings[item.key as keyof ChatSettings] ? 'right-1' : 'left-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. PROFILE PRIVACY */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/15 rounded-2xl">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Profile Privacy &amp; Visibility</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Govern who sees what of your profile activities and holdings.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'profileVisibility', label: 'Overall Profile Visibility', desc: 'Hide or show your entire profile page from search or external engines.' },
                    { key: 'showHoldings', label: 'Show Financial Wallet Holdings / Coins', desc: 'Publish or hide your token holdings, balances, and supreme coin assets.' },
                    { key: 'showOnlineStatus', label: 'Publish Real-Time Online Status', desc: 'Indicate an active green dot indicator to friends or public visitors.' },
                    { key: 'showStreak', label: 'Show Streak Milestones', desc: 'Display your continuous daily active login streak counter publicly.' }
                  ].map((item) => (
                    <div key={item.key} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">{item.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {[
                          { val: 'everyone', label: 'Everyone', desc: 'Open Public' },
                          { val: 'friends', label: 'Friends', desc: 'Followers' },
                          { val: 'only_me', label: 'Only Me', desc: 'Private Lock' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => handlePrivacyChange(item.key as keyof PrivacySettings, opt.val)}
                            className={`py-2 px-3 rounded-xl border text-center transition-all ${
                              privacySettings[item.key as keyof PrivacySettings] === opt.val
                                ? "bg-purple-500/10 border-purple-500/40 text-purple-400 font-bold"
                                : "bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
                            }`}
                          >
                            <p className="text-[10px] font-black uppercase tracking-wider">{opt.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. GENERAL & CORE SETTINGS */}
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-2xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">General &amp; Core Platform Customizations</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Tweak automation behaviors, indicators, and rendering pipelines.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'autoPlayMedia', label: 'Autoplay Live Streams & Videos', desc: 'Automatically execute video players when scrolling past media or active live rooms.' },
                    { key: 'streakReminders', label: 'Streak Restoration Reminders', desc: 'Receive custom popup alert warnings when your daily login streak has less than 3 hours remaining.' },
                    { key: 'highPerformanceMode', label: 'High Performance Mode', desc: 'Decrease canvas animations and backdrop blur parameters to preserve mobile battery lifespan.' },
                    { key: 'compactSidebar', label: 'Compact Sidebar Navigation', desc: 'Collapse primary sidebar tabs to standard slim graphic icon layouts by default.' }
                  ].map((item) => (
                    <div 
                      key={item.key}
                      onClick={() => handleGeneralChange(item.key as any, !generalSettings[item.key as keyof GeneralSettings])}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">{item.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative shrink-0 transition-all ${
                        generalSettings[item.key as keyof GeneralSettings] ? 'bg-emerald-500' : 'bg-white/10'
                      }`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          generalSettings[item.key as keyof GeneralSettings] ? 'right-1' : 'left-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Storage & cache metrics */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">Local Cache Storage Allocation</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Clearing local cache removes offline databases and chat drafts.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-400">12.4 MB allocated</span>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('supreme_sound_settings');
                        localStorage.removeItem('supreme_privacy_settings');
                        localStorage.removeItem('supreme_chat_settings');
                        localStorage.removeItem('supreme_general_settings');
                        toast.info("Offline storage caches cleared successfully!");
                        window.location.reload();
                      }}
                      className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
