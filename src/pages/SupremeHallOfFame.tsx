import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Award, Crown, Medal, TrendingUp, Search, Filter, ChevronRight, MessageSquare, Heart, Share2, Send, Image as ImageIcon, Video, Wand2, Palette, X, Clock, Key, Dice5, Zap, Lock, Unlock, Languages, ChevronDown, Globe, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { generateContent } from '../services/aiService';
import GlobalRankings from '../components/GlobalRankings';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
  'Korean', 'Russian', 'Portuguese', 'Italian', 'Arabic', 'Hindi',
  'Turkish', 'Dutch', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai'
];

// Mock Data
const mockAwards = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/1/150', category: 'Monthly Award', date: 'March 2026', description: 'Top Creator of the Month', likes: 1240, comments: 45 },
  { id: '2', name: 'Sarah Williams', avatar: 'https://picsum.photos/seed/2/150', category: '18 Months Award', date: 'Jan 2025 - Jun 2026', description: 'Consistent Excellence Award', likes: 3420, comments: 128 },
  { id: '3', name: 'Michael Chen', avatar: 'https://picsum.photos/seed/3/150', category: 'Highest Earner', date: '2026', description: 'Platform Top Earner', likes: 5600, comments: 312 },
  { id: '4', name: 'Emma Davis', avatar: 'https://picsum.photos/seed/4/150', category: 'Monthly Award', date: 'February 2026', description: 'Community Leader', likes: 890, comments: 34 },
];

const mockSubs = [
  { id: '1', name: 'David Wilson', avatar: 'https://picsum.photos/seed/5/150', plan: 'Monthly', duration: '2 Months', joined: 'Jan 2026' },
  { id: '2', name: 'Jessica Taylor', avatar: 'https://picsum.photos/seed/6/150', plan: 'Yearly', duration: '18 Months', joined: 'Sep 2024' },
  { id: '3', name: 'James Brown', avatar: 'https://picsum.photos/seed/7/150', plan: 'Yearly', duration: '36 Months', joined: 'Mar 2023' },
];

const mockTestimonies = [
  { id: '1', author: 'Alex Johnson', avatar: 'https://picsum.photos/seed/1/150', content: 'Winning the Monthly Award has been an incredible journey! Thank you to everyone who supported my content.', date: '2 hours ago', likes: 45 },
  { id: '2', author: 'Sarah Williams', avatar: 'https://picsum.photos/seed/2/150', content: '18 months of consistent growth on this platform. The tools here are unmatched. Grateful for the recognition!', date: '1 day ago', likes: 128 },
];

const mockMillionDrawWinners = [
  { id: 'w1', name: 'Marcus Sterling', avatar: 'https://picsum.photos/seed/marcus/150', totalPoints: 12500, date: 'March 2026', rank: 1 },
  { id: 'w2', name: 'Elena Vance', avatar: 'https://picsum.photos/seed/elena/150', totalPoints: 11200, date: 'March 2026', rank: 2 },
  { id: 'w3', name: 'Julian Thorne', avatar: 'https://picsum.photos/seed/julian/150', totalPoints: 9800, date: 'March 2026', rank: 3 },
];

export default function SupremeHallOfFame() {
  const [activeTab, setActiveTab] = useState('awards');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [newTestimony, setNewTestimony] = useState('');
  const [postBgColor, setPostBgColor] = useState('#ffffff');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [attachedMedia, setAttachedMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);

  // Search, Sort, and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'likes', 'comments'
  const [filterCategory, setFilterCategory] = useState('all');
  const [focusMode, setFocusMode] = useState(false);
  
  // Zoomed Profile State
  const [zoomedProfile, setZoomedProfile] = useState<any | null>(null);
  const [millionDrawWinners, setMillionDrawWinners] = useState<any[]>(mockMillionDrawWinners);
  const socketRef = useRef<any>(null);

  // Post Destination State
  const [postDestination, setPostDestination] = useState<'hall' | 'public' | 'both'>('hall');

  // Key Login & Time Lock State
  const [enteredKey, setEnteredKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [timeLockStatus, setTimeLockStatus] = useState({ isUnlocked: false, timeRemaining: 0, cycle: 192, unlockDuration: 24 });
  const [cycleStartOffsetHours, setCycleStartOffsetHours] = useState(0);

  useEffect(() => {
    let socket: any = null;
    try {
      socket = io();
      socketRef.current = socket;
      
      socket?.on?.("million-draw:state-update", (state: any) => {
        if (state.winners && state.winners.length > 0) {
          setMillionDrawWinners(state.winners.map((w: any, idx: number) => ({
            ...w,
            rank: idx + 1,
            date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          })));
        }
      });

      socket?.on?.("million-draw:winners", (winners: any) => {
        setMillionDrawWinners(winners.map((w: any, idx: number) => ({
          ...w,
          rank: idx + 1,
          date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        })));
      });

      socket?.emit?.("million-draw:get-state");
    } catch (e) {
      console.error('Socket error in SupremeHallOfFame:', e);
    }

    return () => {
      socket?.disconnect?.();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Check time lock based on global 8-day cycle
    const checkTimeLock = () => {
      const now = new Date();
      // Add offset for simulation
      const hoursSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60)) + cycleStartOffsetHours;
      
      // Global lock for all users: 7 days (168h) locked, 24h open. Total cycle = 192h.
      const cycle = 192; 
      const unlockDuration = 24;
      
      const currentHourInCycle = hoursSinceEpoch % cycle;
      const isUnlocked = currentHourInCycle < unlockDuration;
      
      let timeRemaining = 0;
      if (isUnlocked) {
        timeRemaining = unlockDuration - currentHourInCycle;
      } else {
        timeRemaining = cycle - currentHourInCycle;
      }
      
      setTimeLockStatus({ isUnlocked, timeRemaining, cycle, unlockDuration });
    };

    checkTimeLock();
    const interval = setInterval(checkTimeLock, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [cycleStartOffsetHours]);

  const handleKeySubmit = () => {
    const savedKeys = localStorage.getItem('hallOfFameKeys');
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      const keyObj = keys.find((k: any) => k.key === enteredKey);
      
      if (!keyObj) {
        setKeyError('Invalid key. Please check and try again.');
        return;
      }
      
      if (keyObj.used) {
        setKeyError('This key has already been used.');
        return;
      }
      
      if (new Date(keyObj.expiresAt) < new Date()) {
        setKeyError('This key has expired.');
        return;
      }
      
      // Valid key
      setIsKeyValid(true);
      setKeyError('');
    } else {
      setKeyError('Invalid key. Please check and try again.');
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedMedia({ type, url });
    }
  };

  const handleAiPolish = async () => {
    if (!newTestimony.trim()) return;
    setIsPolishing(true);
    try {
      const polishedText = await generateContent(
        `As an elite copywriter for a Hall of Fame, polish and enhance the following testimony. 
        Make it sound more inspiring, professional, and prestigious. Do not provide commentary, only return the polished text.
        Original testimony: "${newTestimony}"`
      );
      setNewTestimony(polishedText || newTestimony);
    } catch (error) {
      console.error("AI Polish Error", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleTranslate = async () => {
    if (!newTestimony.trim()) return;
    setIsTranslating(true);
    try {
      const translatedText = await generateContent(
        `Translate the following Hall of Fame testimony to ${targetLanguage}. Keep the tone and context. Only return the translated text: \n\n${newTestimony}`
      );
      setNewTestimony(translatedText || newTestimony);
    } catch (error) {
      console.error("Translation Error", error);
    } finally {
      setIsTranslating(false);
      setShowLanguageSelect(false);
    }
  };

  const handlePostTestimony = () => {
    if (!newTestimony.trim() && !attachedMedia) return;

    // Mark key as used
    const savedKeys = localStorage.getItem('hallOfFameKeys');
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      const updatedKeys = keys.map((k: any) => 
        k.key === enteredKey ? { ...k, used: true, usedAt: new Date().toISOString() } : k
      );
      localStorage.setItem('hallOfFameKeys', JSON.stringify(updatedKeys));
    }

    // Add to testimonies list (mocking local state update)
    const newTestimonyObj = {
      id: Date.now().toString(),
      author: user?.name || 'Anonymous Winner',
      avatar: user?.avatar || 'https://picsum.photos/seed/winner/150',
      content: newTestimony,
      date: 'Just now',
      likes: 0,
      comments: 0,
      destination: postDestination
    };

    // In a real app, we would send this to the backend
    // and if destination is 'public' or 'both', also send to CelebHub
    
    toast.success(`Testimony posted successfully to: ${postDestination === 'both' ? 'Hall of Fame & Public Feed' : postDestination === 'hall' ? 'Hall of Fame Only' : 'Public Feed Only'}`);

    // Reset state
    setNewTestimony('');
    setAttachedMedia(null);
    setIsKeyValid(false);
    setEnteredKey('');
    setPostDestination('hall');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and Sort Logic
  const filteredAwards = mockAwards
    .filter(award => 
      (filterCategory === 'all' || award.category === filterCategory) &&
      (award.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       award.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       award.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'comments') return b.comments - a.comments;
      return 0; // Default newest (mock data doesn't have exact timestamps for sorting, so we leave as is)
    });

  const filteredSubs = mockSubs
    .filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredTestimonies = mockTestimonies
    .filter(testimony => 
      testimony.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimony.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-gray-900">Hall of Fame</h2>
          <p className="text-gray-500">Loading supreme achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-900 via-amber-900 to-black p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-32 -mb-32 animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest">
                <Crown className="w-3 h-3" /> Supreme Recognition
              </div>
              <button 
                onClick={() => window.history.back()}
                className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Exit Hall of Fame"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
              Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">Fame</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Celebrating the highest achievers, longest-standing members, and top earners on the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-center px-4 border-r border-white/20">
                <div className="text-3xl font-bold text-yellow-400">124</div>
                <div className="text-xs text-gray-300 uppercase tracking-wider mt-1">Awardees</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-amber-400">$2.4M</div>
                <div className="text-xs text-gray-300 uppercase tracking-wider mt-1">Paid Out</div>
              </div>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="hidden md:flex items-center justify-center p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Exit Hall of Fame"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 w-full md:w-auto">
          {[
            { id: 'awards', label: 'Award Winners', icon: Trophy },
            { id: 'million-draw', label: 'Million Draw', icon: Dice5 },
            { id: 'subs-short', label: '1-2 Month Subs', icon: Star },
            { id: 'subs-long', label: '18-36 Month Subs', icon: Medal },
            { id: 'earners', label: 'Highest Earners', icon: TrendingUp },
            { id: 'testimonies', label: 'Testimonies', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hall of fame..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-sm font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Commented</option>
          </select>
          {activeTab === 'awards' && (
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={clsx(
                "p-2.5 rounded-xl border transition-colors",
                focusMode 
                  ? "bg-yellow-500 border-yellow-500 text-white shadow-sm" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
              title="Focus Mode"
            >
              <Award className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={clsx("min-h-[400px] transition-all duration-500 relative", focusMode && activeTab === 'awards' ? "fixed inset-0 z-50 bg-black/95 overflow-y-auto p-8" : "")}>
        {!timeLockStatus.isUnlocked && (
          <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-gray-200 shadow-lg p-8 text-center min-h-[500px]">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Hall of Fame Locked</h2>
            <p className="text-gray-600 max-w-md text-center mb-8">
              The Hall of Fame is currently locked for all users. It opens for 24 hours every 8 days.
            </p>
            <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-center shadow-xl">
              <p className="text-sm text-gray-400 mb-1">Unlocks In</p>
              <p className="text-3xl font-mono font-bold text-[var(--color-supreme-gold)]">
                {Math.floor(timeLockStatus.timeRemaining / 24)}d {timeLockStatus.timeRemaining % 24}h
              </p>
            </div>
          </div>
        )}

        <div className={clsx("transition-all duration-500", !timeLockStatus.isUnlocked ? "opacity-10 blur-sm pointer-events-none select-none" : "")}>
          {focusMode && activeTab === 'awards' && (
          <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-white">Awards Focus Mode</h2>
            <button 
              onClick={() => setFocusMode(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Exit Focus Mode
            </button>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {activeTab === 'awards' && (
            <motion.div
              key="awards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                "grid gap-6",
                focusMode ? "grid-cols-1 max-w-4xl mx-auto" : "grid-cols-1 md:grid-cols-2"
              )}
            >
              {focusMode && (
                <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                  {['all', 'Monthly Award', '18 Months Award', 'Highest Earner'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={clsx(
                        "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                        filterCategory === cat 
                          ? "bg-yellow-500 text-white" 
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      )}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredAwards.map((award) => (
                <div 
                  key={award.id} 
                  onClick={() => setZoomedProfile(award)}
                  className={clsx(
                  "rounded-2xl p-6 border transition-all group cursor-pointer",
                  focusMode 
                    ? "bg-white/5 border-white/10 hover:bg-white/10" 
                    : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                )}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img src={award.avatar} alt={award.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-yellow-100" />
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-1.5 rounded-lg shadow-sm">
                        <Trophy className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={clsx("text-xl font-bold transition-colors", focusMode ? "text-white" : "text-gray-900 group-hover:text-yellow-600")}>{award.name}</h3>
                          <p className="text-sm font-medium text-yellow-500">{award.category}</p>
                        </div>
                        <span className={clsx("text-xs px-2 py-1 rounded-md", focusMode ? "bg-white/10 text-gray-300" : "text-gray-400 bg-gray-100")}>{award.date}</span>
                      </div>
                      <p className={clsx("mt-2 text-sm", focusMode ? "text-gray-300" : "text-gray-600")}>{award.description}</p>
                      <div className={clsx("flex items-center gap-4 mt-4 pt-4 border-t", focusMode ? "border-white/10" : "border-gray-100")}>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" /> {award.likes}
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> {award.comments}
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors ml-auto"
                        >
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAwards.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No awards found matching your criteria.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'million-draw' && (
            <motion.div
              key="million-draw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {millionDrawWinners.map((winner) => (
                <div 
                  key={winner.id} 
                  onClick={() => setZoomedProfile(winner)}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                >
                  <div className={clsx(
                    "absolute top-0 left-0 w-full h-2 bg-gradient-to-r",
                    winner.rank === 1 ? "from-yellow-400 to-amber-500" :
                    winner.rank === 2 ? "from-gray-300 to-gray-400" :
                    "from-amber-600 to-amber-800"
                  )} />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src={winner.avatar || `https://picsum.photos/seed/${winner.id}/150`} alt={winner.name} className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100" />
                      <div className={clsx(
                        "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
                        winner.rank === 1 ? "bg-yellow-500" :
                        winner.rank === 2 ? "bg-gray-400" :
                        "bg-amber-700"
                      )}>
                        {winner.rank}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">{winner.name}</h3>
                      <p className="text-xs text-gray-500">{winner.date}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Points</span>
                      <span className="font-bold text-gray-900">{winner.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Prize Won</span>
                      <span className="font-bold text-green-600">
                        ${winner.rank === 1 ? '250' : winner.rank === 2 ? '200' : '150'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-600 text-xs font-bold">
                        <Zap className="w-3 h-3" /> Million Draw Champion
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" /> View Achievement
                  </button>
                </div>
              ))}
              {millionDrawWinners.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No Million Draw winners yet. The next cycle is underway!
                </div>
              )}
            </motion.div>
          )}

          {(activeTab === 'subs-short' || activeTab === 'subs-long') && (
            <motion.div
              key="subs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSubs
                .filter(sub => activeTab === 'subs-short' ? sub.duration.includes('2') : sub.duration.includes('18') || sub.duration.includes('36'))
                .map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => setZoomedProfile(sub)}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white" />
                  <div className="relative z-10">
                    <img src={sub.avatar} alt={sub.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg mb-4 group-hover:scale-105 transition-transform" />
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{sub.name}</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mt-2">
                      <Star className="w-3 h-3" /> {sub.duration} Subscriber
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Plan</div>
                        <div className="font-medium text-gray-900">{sub.plan}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Joined</div>
                        <div className="font-medium text-gray-900">{sub.joined}</div>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors text-sm">
                      View Profile Card
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'earners' && (
            <motion.div
              key="earners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-md rounded-3rem p-6 sm:p-8 border border-white/10 overflow-hidden shadow-2xl"
            >
              <GlobalRankings />
            </motion.div>
          )}

          {activeTab === 'testimonies' && (
            <motion.div
              key="testimonies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Post Field Area */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                {!isKeyValid ? (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center border-2 border-dashed border-yellow-200 rounded-2xl">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <Key className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Testimony Key</h3>
                    <p className="text-gray-500 max-w-md mb-6 text-sm">
                      Only verified award winners can post in the Supreme Hall of Fame. Please enter the key provided by the Admin.
                    </p>
                    <div className="w-full max-w-sm space-y-3">
                      <input
                        type="text"
                        value={enteredKey}
                        onChange={(e) => setEnteredKey(e.target.value.toUpperCase())}
                        placeholder="e.g. HOF-ALEX-8F92A"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono font-bold text-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none uppercase"
                      />
                      {keyError && <p className="text-red-500 text-sm font-medium">{keyError}</p>}
                      <button
                        onClick={handleKeySubmit}
                        disabled={!enteredKey}
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        Unlock Post Field
                      </button>
                    </div>
                  </div>
                ) : null}

                <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Testimony</h3>
                <div className="flex gap-4">
                  <img src={user?.avatar || `https://picsum.photos/seed/user/150`} alt="You" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div 
                      className="relative rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent transition-all"
                      style={{ backgroundColor: postBgColor }}
                    >
                      <textarea
                        value={newTestimony}
                        onChange={(e) => setNewTestimony(e.target.value)}
                        placeholder="Share your winnings and experience with the community..."
                        className="w-full h-32 p-4 bg-transparent border-none focus:ring-0 resize-none"
                        style={{ 
                          color: postBgColor !== '#ffffff' && postBgColor !== '#f9fafb' ? '#ffffff' : '#111827',
                          textShadow: postBgColor !== '#ffffff' && postBgColor !== '#f9fafb' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}
                      />
                      
                      {attachedMedia && (
                        <div className="p-4 pt-0 relative group">
                          {attachedMedia.type === 'image' ? (
                            <img src={attachedMedia.url} alt="Attached" className="max-h-48 rounded-lg object-contain bg-black/5" />
                          ) : (
                            <video src={attachedMedia.url} controls className="max-h-48 rounded-lg bg-black/5" />
                          )}
                          <button 
                            onClick={() => setAttachedMedia(null)}
                            className="absolute top-2 right-6 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleMediaUpload(e, 'image')}
                        />
                        <input 
                          type="file" 
                          ref={videoInputRef} 
                          className="hidden" 
                          accept="video/*"
                          onChange={(e) => handleMediaUpload(e, 'video')}
                        />
                        
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Upload Image"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => videoInputRef.current?.click()}
                          className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Upload Video"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-all"
                            >
                              <Languages className="w-3 h-3" /> {targetLanguage} <ChevronDown className="w-2.5 h-2.5" />
                            </button>
                            {showLanguageSelect && (
                              <div className="absolute left-0 bottom-full mb-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                                {LANGUAGES.map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => {
                                      setTargetLanguage(lang);
                                      setShowLanguageSelect(false);
                                    }}
                                    className={clsx(
                                      "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors",
                                      targetLanguage === lang ? "text-amber-600 font-bold bg-amber-50" : "text-gray-600"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={handleTranslate}
                            disabled={isTranslating || !newTestimony.trim()}
                            className={clsx(
                              "p-2 rounded-lg transition-all",
                              isTranslating ? "bg-blue-100 text-blue-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"
                            )}
                            title="Translate Testimony"
                          >
                            <Globe className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={handleAiPolish}
                            disabled={isPolishing || !newTestimony.trim()}
                            className={clsx(
                              "p-2 rounded-lg transition-all",
                              isPolishing ? "bg-amber-100 text-amber-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"
                            )}
                            title="Polish with AI"
                          >
                            <Wand2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1"
                            title="Background Color"
                          >
                            <Palette className="w-5 h-5" />
                          </button>
                          
                          {showColorPicker && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-64">
                              <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Select Background</div>
                              <div className="grid grid-cols-5 gap-2">
                                {['#ffffff', '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#1f2937', '#4b5563', '#9ca3af', '#e5e7eb'].map(color => (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      setPostBgColor(color);
                                      setShowColorPicker(false);
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <label className="text-xs text-gray-500 flex items-center justify-between">
                                  Custom Color
                                  <input 
                                    type="color" 
                                    value={postBgColor}
                                    onChange={(e) => setPostBgColor(e.target.value)}
                                    className="w-6 h-6 rounded cursor-pointer"
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button
                          onClick={() => setPostDestination('hall')}
                          className={clsx(
                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                            postDestination === 'hall' ? "bg-white text-yellow-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          Hall Only
                        </button>
                        <button
                          onClick={() => setPostDestination('public')}
                          className={clsx(
                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                            postDestination === 'public' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          Public Feed
                        </button>
                        <button
                          onClick={() => setPostDestination('both')}
                          className={clsx(
                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                            postDestination === 'both' ? "bg-white text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          Both
                        </button>
                      </div>

                      <button 
                        onClick={handlePostTestimony}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        disabled={!newTestimony.trim() && !attachedMedia}
                      >
                        <Send className="w-4 h-4" /> Post Testimony
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonies Feed */}
              <div className="space-y-4">
                {filteredTestimonies.map((testimony) => (
                  <div key={testimony.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <img src={testimony.avatar} alt={testimony.author} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900">{testimony.author}</h4>
                            <p className="text-xs text-gray-500">{testimony.date}</p>
                          </div>
                          <div className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> Verified Winner
                          </div>
                        </div>
                        <p className="text-gray-700 mt-3 leading-relaxed">{testimony.content}</p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" /> {testimony.likes}
                          </button>
                          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" /> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTestimonies.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No testimonies found matching your search.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoomed Profile Modal */}
      <AnimatePresence>
        {zoomedProfile && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setZoomedProfile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-50 to-white" />
              
              <button
                onClick={() => setZoomedProfile(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 text-center">
                <div className="relative inline-block">
                  <img 
                    src={zoomedProfile.avatar} 
                    alt={zoomedProfile.name} 
                    className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                  />
                  {zoomedProfile.category && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2 rounded-xl shadow-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-6">{zoomedProfile.name}</h2>
                
                {zoomedProfile.category ? (
                  // Award Winner Details
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-sm font-bold mt-3">
                      <Award className="w-4 h-4" /> {zoomedProfile.category}
                    </div>
                    <p className="text-gray-500 mt-2 font-medium">{zoomedProfile.date}</p>
                    <p className="text-gray-700 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                      "{zoomedProfile.description}"
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{zoomedProfile.likes}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{zoomedProfile.comments}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Comments</div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Subscriber Details
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mt-3">
                      <Star className="w-4 h-4" /> {zoomedProfile.duration} Subscriber
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Plan Type</div>
                        <div className="font-bold text-gray-900">{zoomedProfile.plan}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Member Since</div>
                        <div className="font-bold text-gray-900">{zoomedProfile.joined}</div>
                      </div>
                    </div>
                  </>
                )}

                <button className="w-full mt-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors">
                  View Full Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
      {/* Simulation Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 border-t border-gray-800 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Hall of Fame Access Simulation</p>
            <p className="text-xs text-gray-400">Global 8-Day Cycle (24h Open, 168h Locked)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 flex-1 max-w-xl">
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-400 whitespace-nowrap">Time in Cycle:</span>
            <input 
              type="range" 
              min="0" 
              max="191" 
              value={cycleStartOffsetHours % 192}
              onChange={(e) => setCycleStartOffsetHours(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <span className="text-xs font-mono text-yellow-400 w-12">{cycleStartOffsetHours % 192}h</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={clsx(
            "px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2",
            timeLockStatus.isUnlocked ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>
            {timeLockStatus.isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {timeLockStatus.isUnlocked ? 'Granted' : 'Locked'}
          </div>
          <div className="text-right min-w-[100px]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{timeLockStatus.isUnlocked ? 'Locks in' : 'Unlocks in'}</p>
            <p className="text-sm font-mono font-bold text-white">
              {Math.floor(timeLockStatus.timeRemaining / 24)}d {timeLockStatus.timeRemaining % 24}h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
