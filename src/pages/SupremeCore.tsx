import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, Users, Clock, DollarSign, Activity, Trophy, BarChart2, Share2, TrendingUp, Megaphone, ShoppingBag, Radio, Rocket, Wifi, MapPin, Calendar, Mail, Phone, Plus, ZoomIn, X, PanelLeftClose, PanelLeftOpen, MessageCircle, Smile, Image as FileImage, Download, Paperclip, Send, MessageSquare, Settings, Crown, Shield, Award, Lock, Leaf, Brain, Gamepad2, Wand2, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const RANK_ACCESS_RULES: Record<string, { cycleDays: number, accessHours: number }> = {
  'Royal': { cycleDays: 7, accessHours: 24 },
  'Elite': { cycleDays: 6, accessHours: 24 },
  'Silver': { cycleDays: 5, accessHours: 24 },
  'Diamond': { cycleDays: 4, accessHours: 24 },
  'Gold': { cycleDays: 3, accessHours: 25 },
  'Crowned': { cycleDays: 2, accessHours: 31 },
};

interface CoreUserData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  phone: string;
  email: string;
  location: string;
  joinedDate: string;
  earnings: string;
  topEngagement: string;
  postCount: number;
  likesCount: string;
  videoCount: number;
  subsMade: number;
  subscribersCount: string;
  awardsCount: number;
  role?: string;
}

const generateMockUser = (id: string, name: string, role: string): CoreUserData => ({
  id,
  name,
  avatar: `https://picsum.photos/seed/${id}/150`,
  bio: `Passionate creator and entrepreneur. Always looking for new opportunities and collaborations.`,
  phone: '+1 555 0101',
  email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  location: 'New York, USA',
  joinedDate: 'March 2023',
  earnings: '$12,450',
  topEngagement: 'Supreme Media',
  postCount: 145,
  likesCount: '12.5k',
  videoCount: 34,
  subsMade: 12,
  subscribersCount: '4.2k',
  awardsCount: 5,
  role
});

const mockUsers = [
  generateMockUser('1', 'Alex Johnson', 'Top Earner'),
  generateMockUser('2', 'Sarah Williams', 'Top Engager'),
  generateMockUser('3', 'Michael Chen', 'Award Winner'),
  generateMockUser('4', 'Emma Davis', 'Top Connector'),
  generateMockUser('5', 'David Wilson', 'Ad Creator'),
  generateMockUser('6', 'Jessica Taylor', 'Top Streamer'),
];

const SupremeCoreProfileCard = ({ user, onChatClick, onFriendClick }: { user: CoreUserData, onChatClick: () => void, onFriendClick: () => void }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const CardContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[var(--color-supreme-gold)] object-cover shadow-md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-[var(--color-supreme-gold)] font-medium">{user.role || 'Supreme Member'}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {user.joinedDate}</span>
          </div>
        </div>
        {!isZoomed && (
          <button onClick={() => setIsZoomed(true)} className="p-2 text-gray-400 hover:text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/10 rounded-full transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{user.bio}</p>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex justify-between" title="Total earnings on the platform"><span className="text-gray-500">Earnings:</span> <span className="font-bold text-[var(--color-supreme-green)]">{user.earnings}</span></div>
        <div className="flex justify-between" title="Most engaged feature"><span className="text-gray-500">Top Eng.:</span> <span className="font-bold text-gray-900 truncate ml-1">{user.topEngagement}</span></div>
        <div className="flex justify-between" title="Total posts created"><span className="text-gray-500">Posts:</span> <span className="font-bold text-gray-900">{user.postCount}</span></div>
        <div className="flex justify-between" title="Total likes received"><span className="text-gray-500">Likes:</span> <span className="font-bold text-pink-600">{user.likesCount}</span></div>
        <div className="flex justify-between" title="Total videos uploaded"><span className="text-gray-500">Videos:</span> <span className="font-bold text-gray-900">{user.videoCount}</span></div>
        <div className="flex justify-between" title="Total subscribers"><span className="text-gray-500">Subscribers:</span> <span className="font-bold text-[var(--color-supreme-gold)]">{user.subscribersCount}</span></div>
        <div className="flex justify-between" title="Total subscriptions made"><span className="text-gray-500">Subs Made:</span> <span className="font-bold text-gray-900">{user.subsMade}</span></div>
        <div className="flex justify-between" title="Total awards received"><span className="text-gray-500">Awards:</span> <span className="font-bold text-yellow-600">{user.awardsCount}</span></div>
      </div>

      {isZoomed && (
        <div className="mb-4 space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {user.phone}</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {user.email}</div>
          <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-gray-400" /> <a href="#" className="text-[var(--color-supreme-gold)] hover:underline">supreme.com/{user.name.toLowerCase().replace(' ', '')}</a></div>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button onClick={onFriendClick} className="flex-1 py-2.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Friend
        </button>
        <button onClick={onChatClick} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-gray-200">
          <MessageCircle className="w-4 h-4" /> Chat
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Normal Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-[var(--color-supreme-gold)]/50 transition-all duration-300 h-full flex flex-col">
        <CardContent />
      </div>

      {/* Zoomed Modal */}
      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <CardContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const LoadingAnimation = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
      <motion.div 
        className="absolute inset-0 border-4 border-red-500 rounded-full"
        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-8 text-2xl font-bold font-display text-gray-800 tracking-wider"
    >
      Heart of Supreme
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-2 text-gray-500"
    >
      Loading Supreme Core...
    </motion.p>
  </div>
);

const SupremeCore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-users');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRole, setFilterRole] = useState('all');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<CoreUserData | null>(null);

  // Settings state
  const [blockFriendRequests, setBlockFriendRequests] = useState(false);
  const [blockChatRequests, setBlockChatRequests] = useState(false);
  const [enableSounds, setEnableSounds] = useState(true);

  // Access Simulation State
  const [simulatedRank, setSimulatedRank] = useState('Royal');
  const [cycleStartOffsetHours, setCycleStartOffsetHours] = useState(0);

  const currentRule = RANK_ACCESS_RULES[simulatedRank];
  const cycleHours = currentRule.cycleDays * 24;
  const currentCycleHour = cycleStartOffsetHours % cycleHours;
  const hasAccess = currentCycleHour < currentRule.accessHours;
  const hoursRemainingInState = hasAccess 
    ? currentRule.accessHours - currentCycleHour 
    : cycleHours - currentCycleHour;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const playSound = () => {
    if (!enableSounds) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const handleFriendClick = (user: CoreUserData) => {
    playSound();
    if (blockFriendRequests) {
      toast.error("Friend requests are currently blocked by your settings.");
      return;
    }
    // Handle friend request logic here
    console.log(`Friend request sent to ${user.name}`);
  };

  const openChat = (user?: CoreUserData) => {
    playSound();
    if (user && blockChatRequests) {
      toast.error("Chat requests are currently blocked by your settings.");
      return;
    }
    setActiveChatUser(user || null);
    setIsChatOpen(true);
  };

  const tabs = [
    { id: 'all-users', label: 'All Supreme Users', icon: Users },
    { id: 'recent-users', label: 'Recent Users', icon: Clock },
    { id: 'top-earners', label: 'Top Earners', icon: DollarSign },
    { id: 'top-engagers', label: 'Top Engagers', icon: Activity },
    { id: 'award-winners', label: 'Award Winners', icon: Trophy },
    { id: 'site-analysis', label: 'Site Analysis', icon: BarChart2 },
    { id: 'top-connectors', label: 'Top Connectors', icon: Share2 },
    { id: 'top-features', label: 'Top Features', icon: TrendingUp },
    { id: 'best-ads', label: 'Best Ads Creators', icon: Megaphone },
    { id: 'top-goods', label: 'Top Selling Goods', icon: ShoppingBag },
    { id: 'top-streamers', label: 'Top Streamers', icon: Radio },
    { id: 'rank-program', label: 'Rank Program', icon: Crown },
    { id: 'core-availability', label: 'Access & Timing', icon: Lock },
    { id: 'projects', label: 'Project Power', icon: Rocket },
    { id: 'online-status', label: 'Online/Offline', icon: Wifi },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'all-users':
      case 'recent-users':
      case 'top-earners':
      case 'top-engagers':
      case 'award-winners':
      case 'top-connectors':
      case 'best-ads':
      case 'top-goods':
      case 'top-streamers':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-2 focus:ring-[var(--color-supreme-gold)]/20 outline-none transition-all text-sm bg-gray-50"
                >
                  <option value="all">All Roles</option>
                  <option value="earner">Top Earners</option>
                  <option value="engager">Top Engagers</option>
                  <option value="connector">Top Connectors</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-2 focus:ring-[var(--color-supreme-gold)]/20 outline-none transition-all text-sm bg-gray-50"
                >
                  <option value="newest">Newest First</option>
                  <option value="earnings">Highest Earnings</option>
                  <option value="posts">Most Posts</option>
                  <option value="likes">Most Likes</option>
                </select>
                <div className="relative flex-1 sm:w-64">
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)] focus:ring-2 focus:ring-[var(--color-supreme-gold)]/20 outline-none transition-all text-sm"
                  />
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockUsers
                .filter(user => {
                  if (filterRole !== 'all' && !user.role?.toLowerCase().includes(filterRole)) return false;
                  if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })
                .sort((a, b) => {
                  if (sortBy === 'earnings') return parseInt(b.earnings.replace(/\D/g, '')) - parseInt(a.earnings.replace(/\D/g, ''));
                  if (sortBy === 'posts') return b.postCount - a.postCount;
                  if (sortBy === 'likes') return parseFloat(b.likesCount) - parseFloat(a.likesCount);
                  return 0; // newest
                })
                .map(user => (
                <SupremeCoreProfileCard 
                  key={user.id} 
                  user={user} 
                  onChatClick={() => openChat(user)} 
                  onFriendClick={() => handleFriendClick(user)}
                />
              ))}
            </div>
          </div>
        );
      case 'site-analysis':
      case 'top-features':
      case 'online-status':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Total Online Users</p>
                    <h4 className="text-2xl font-bold text-gray-900">12,450</h4>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-50 text-green-600"><Clock className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Avg. Time Spent</p>
                    <h4 className="text-2xl font-bold text-gray-900">4.5 hrs</h4>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600"><Activity className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Top Feature</p>
                    <h4 className="text-2xl font-bold text-gray-900">Supreme Media</h4>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div></div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center min-h-[400px] flex flex-col items-center justify-center">
              <BarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Detailed Analytics Dashboard</h3>
              <p className="text-gray-500">Comprehensive charts and performance metrics will be displayed here.</p>
            </div>
          </div>
        );
      case 'rank-program':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Supreme Rank Program</h2>
                  <p className="text-gray-500">Achieve greatness and unlock exclusive bonuses.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Royal', color: 'bg-purple-600', bonus: '5.00%', subs: 15, icon: Crown },
                  { name: 'Elite', color: 'bg-indigo-600', bonus: '4.50%', subs: 12, icon: Shield },
                  { name: 'Crowned', color: 'bg-yellow-500', bonus: '3.80%', subs: 10, icon: Trophy },
                  { name: 'Gold', color: 'bg-amber-400', bonus: '2.50%', subs: 7, icon: Award },
                  { name: 'Diamond', color: 'bg-blue-400', bonus: '2.00%', subs: 5, icon: Activity },
                  { name: 'Silver', color: 'bg-gray-400', bonus: '1.80%', subs: 4, icon: TrendingUp },
                ].map((rank) => (
                  <div key={rank.name} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={clsx("p-2 rounded-lg text-white", rank.color)}>
                        <rank.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{rank.name} Rank</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bonus:</span>
                        <span className="font-bold text-green-600">+{rank.bonus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Required Subs:</span>
                        <span className="font-bold text-gray-900">{rank.subs}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Top Rankers</p>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <img key={i} src={`https://picsum.photos/seed/ranker${rank.name}${i}/50`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Ranker" />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +12
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Rank Achievers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockUsers.slice(0, 4).map((user, i) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] font-bold text-purple-600 uppercase">Reached Royal Rank</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'core-availability':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Supreme Core Availability</h2>
                  <p className="text-gray-500">Timing and analysis of core access based on user ranking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(RANK_ACCESS_RULES).map(([rank, rule]) => {
                  const cycleHours = rule.cycleDays * 24;
                  const availabilityPercentage = ((rule.accessHours / cycleHours) * 100).toFixed(1);
                  const hoursPerMonth = ((rule.accessHours / rule.cycleDays) * 30).toFixed(0);

                  return (
                    <div key={rank} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-gray-900">{rank} Rank</h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                          {availabilityPercentage}% Uptime
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Access Window</span>
                            <span className="font-bold text-gray-900">{rule.accessHours} Hours</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (rule.accessHours / cycleHours) * 100)}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Cooldown Period</span>
                            <span className="font-bold text-gray-900">{cycleHours - rule.accessHours} Hours</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.min(100, ((cycleHours - rule.accessHours) / cycleHours) * 100)}%` }}></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Cycle Length</p>
                            <p className="font-bold text-gray-900">{rule.cycleDays} Days</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Hours / Month</p>
                            <p className="font-bold text-gray-900">~{hoursPerMonth} hrs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        P{i}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Project Alpha {i}</h4>
                        <p className="text-sm text-gray-500">By Alex Johnson</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">A revolutionary new initiative to connect creators globally and provide them with the tools they need to succeed.</p>
                  
                  <div className="space-y-4 mt-auto">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Funding Progress</span>
                        <span className="font-bold text-purple-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs">Raised Amount</p>
                        <p className="font-bold text-gray-900">$75,000</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs">Goal Amount</p>
                        <p className="font-bold text-gray-900">$100,000</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs">Deadline</p>
                        <p className="font-bold text-gray-900">Dec 31, 2026</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs">Duration</p>
                        <p className="font-bold text-gray-900">12 Months</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                Supreme Core Settings
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900">Block Friend Requests</h3>
                    <p className="text-sm text-gray-500">Prevent others from sending you friend requests.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={blockFriendRequests}
                      onChange={(e) => setBlockFriendRequests(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-supreme-gold)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900">Block Chat Requests</h3>
                    <p className="text-sm text-gray-500">Prevent others from initiating chats with you.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={blockChatRequests}
                      onChange={(e) => setBlockChatRequests(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-supreme-gold)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900">Enable Interaction Sounds</h3>
                    <p className="text-sm text-gray-500">Play a sound when clicking Friend or Chat buttons.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={enableSounds}
                      onChange={(e) => setEnableSounds(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-supreme-gold)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 relative">
      <AnimatePresence>
        {isLoading && <LoadingAnimation />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30 transition-all"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                Supreme Core
              </h1>
              <p className="text-gray-500 mt-1 text-sm">The heart of all activities on the Supreme platform.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/hall-of-fame"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all hover:-translate-y-0.5"
            >
              <Trophy className="w-5 h-5" />
              Hall of Fame
            </Link>
            <button 
              onClick={() => openChat()}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold shadow-sm hover:bg-yellow-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Global Chat
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <AnimatePresence initial={false}>
            {isSidebarVisible && (
              <motion.div 
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{ width: 256, opacity: 1, marginRight: 32 }}
                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24 w-64">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          activeTab === tab.id
                            ? "bg-purple-50 text-purple-700 font-bold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <tab.icon className={clsx("w-5 h-5", activeTab === tab.id ? "text-purple-600" : "text-gray-400")} />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setIsSidebarVisible(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                    >
                      <PanelLeftClose className="w-5 h-5 text-gray-400" />
                      Hide Sidebar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 relative">
            {!hasAccess && activeTab !== 'core-availability' && (
              <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-gray-200 shadow-lg p-8 text-center min-h-[500px]">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Supreme Core Locked</h2>
                <p className="text-gray-600 max-w-md text-center mb-8">
                  Your current rank (<strong>{simulatedRank}</strong>) grants you access for {currentRule.accessHours} hours every {currentRule.cycleDays} days. 
                  The core is currently locked.
                </p>
                <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-center shadow-xl">
                  <p className="text-sm text-gray-400 mb-1">Unlocks In</p>
                  <p className="text-3xl font-mono font-bold text-[var(--color-supreme-gold)]">
                    {Math.floor(hoursRemainingInState / 24)}d {hoursRemainingInState % 24}h
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('core-availability')}
                  className="mt-8 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  View Access Timing Analysis
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={!hasAccess && activeTab !== 'core-availability' ? 'opacity-20 pointer-events-none blur-sm transition-all' : ''}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Simulation Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-[200] flex flex-wrap items-center justify-center gap-6 border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">Simulate Rank:</span>
          <select 
            value={simulatedRank}
            onChange={(e) => setSimulatedRank(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm outline-none focus:border-[var(--color-supreme-gold)] text-white"
          >
            {Object.keys(RANK_ACCESS_RULES).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">Time in Cycle:</span>
          <input 
            type="range" 
            min="0" 
            max={RANK_ACCESS_RULES[simulatedRank].cycleDays * 24} 
            value={cycleStartOffsetHours}
            onChange={(e) => setCycleStartOffsetHours(Number(e.target.value))}
            className="w-48 accent-[var(--color-supreme-gold)]"
          />
          <span className="text-sm font-mono w-16 text-gray-300">{cycleStartOffsetHours}h</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400">Status:</span>
          {hasAccess ? (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-md border border-green-500/30">
              ACCESS GRANTED ({hoursRemainingInState}h left)
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-md border border-red-500/30">
              LOCKED ({hoursRemainingInState}h until open)
            </span>
          )}
        </div>
      </div>

      {/* Floating Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col h-[500px]"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                {activeChatUser ? (
                  <img src={activeChatUser.avatar} alt={activeChatUser.name} className="w-8 h-8 rounded-full border border-white/50 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/50">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    {activeChatUser ? activeChatUser.name : 'Supreme Global Chat'}
                  </h4>
                  <p className="text-[10px] text-white/80">
                    {activeChatUser ? 'Online' : '1,245 members online'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              <div className="text-center text-xs text-gray-400 my-2">Today</div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  <img src="https://picsum.photos/seed/chat1/100" alt="User" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700 max-w-[80%]">
                  Hey! Welcome to the Supreme Core. Let me know if you want to collaborate.
                </div>
              </div>

              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)] shrink-0 flex items-center justify-center text-white font-bold text-xs">
                  ME
                </div>
                <div className="bg-[var(--color-supreme-gold)]/10 p-3 rounded-2xl rounded-tr-none border border-[var(--color-supreme-gold)]/20 text-sm text-gray-800 max-w-[80%]">
                  Thanks! I'm looking forward to connecting with top creators here.
                </div>
              </div>
            </div>

            {/* Chat Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3 px-1 text-gray-400">
                <button className="hover:text-[var(--color-supreme-gold)] transition-colors" title="Emoji">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="hover:text-[var(--color-supreme-gold)] transition-colors" title="GIF">
                  <FileImage className="w-5 h-5" />
                </button>
                <button className="hover:text-[var(--color-supreme-gold)] transition-colors" title="Download/File">
                  <Download className="w-5 h-5" />
                </button>
                <button className="hover:text-[var(--color-supreme-gold)] transition-colors" title="Attach">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 transition-all" 
                />
                <button className="p-2.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupremeCore;
