import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useFeatureControl, FeatureId } from '../context/FeatureControlContext';
import { Search, Crown, Trophy, TrendingUp, Users, ShoppingBag, Play, Globe, Bot, MessageCircle, Radio, Settings, LayoutDashboard, Plus, X, GripVertical, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Heart, Clock, UserPlus, Package, FileText, Video, Rocket, Sparkles, ShieldCheck as Shield, Zap, CheckCircle2 as CheckCircle, Star, Satellite, Lock, Bitcoin, Activity, Pickaxe, Megaphone, Target, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';
import TaskManager from '../components/TaskManager';
import UserActivities from '../components/UserActivities';
import Gamification from '../components/Gamification';
import SupremeUsersWidget from '../components/SupremeUsersWidget';
import PromotionalMarquee from '../components/PromotionalMarquee';
import EarningsProgram from '../components/EarningsProgram';
import SupremeConnectors from '../components/SupremeConnectors';
import SupremeDeals from '../components/SupremeDeals';
import ConnectorAnalysis from '../components/ConnectorAnalysis';
import AwardCampaign from '../components/AwardCampaign';
import AdminSubscriptionManager from '../components/AdminSubscriptionManager';
import AdminCampaignManager from '../components/AdminCampaignManager';
import AdminAwardTracker from '../components/AdminAwardTracker';
import AdminEarningsManager from '../components/AdminEarningsManager';
import MonthlyAwardCampaign from '../components/MonthlyAwardCampaign';
import ProfileCard, { ProfileCardData } from '../components/ProfileCard';
import ActivityFlashScreen from '../components/ActivityFlashScreen';
import DailyAnalyticsDashboard from '../components/DailyAnalyticsDashboard';
import RandomProjectPowerWidget from '../components/RandomProjectPowerWidget';

import DigitalTools from '../components/DigitalTools';

import { useAds } from '../context/AdsContext';
import { useMining, COINS } from '../context/MiningContext';
import { useAdmin } from '../context/AdminContext';

import SupremeGreetingHeader from '../components/SupremeGreetingHeader';
import AdBanner from '../components/AdBanner';

import JoinAwardsWidget from '../components/JoinAwardsWidget';

// --- Widget Components ---

const MiningStatusWidget = () => {
  const { activeMiner, timeRemaining } = useMining();
  const activeCoin = COINS.find(c => c.id === activeMiner);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Link 
      to="/supreme-coin-optimum"
      className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 hover:border-[var(--color-supreme-gold)]/30 transition-all group block"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]">
            <Bitcoin className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Optimum Miner</h3>
        </div>
        {activeMiner ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold animate-pulse">
            <Activity className="w-3 h-3" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
            <Clock className="w-3 h-3" /> Inactive
          </span>
        )}
      </div>

      {activeCoin ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: activeCoin.color }}
              >
                {activeCoin.id}
              </div>
              <span className="font-bold text-gray-900">{activeCoin.name}</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-gray-400">Time Remaining</div>
              <div className="text-sm font-mono font-bold text-gray-900">
                {timeRemaining !== null ? formatTime(timeRemaining) : '0h 0m 0s'}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--color-supreme-gold)]"
              initial={{ width: 0 }}
              animate={{ width: `${(timeRemaining || 0) / (6 * 60 * 60 * 1000) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500 mb-3">No active mining session</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold group-hover:bg-[var(--color-supreme-gold)] transition-colors">
            <Pickaxe className="w-3.5 h-3.5" /> Start Mining
          </div>
        </div>
      )}
    </Link>
  );
};

const ForexStatusWidget = () => {
  const [data, setData] = useState<{
    demoBalance: number;
    liveBalance: number;
    activeTrades: number;
    totalPnL: number;
    mode: 'demo' | 'live';
  }>({
    demoBalance: 10000,
    liveBalance: 0,
    activeTrades: 0,
    totalPnL: 0,
    mode: 'demo'
  });

  useEffect(() => {
    const loadForexData = () => {
      try {
        const demoBal = parseFloat(localStorage.getItem('gmt_forex_demo_balance') || '10000');
        const liveBal = parseFloat(localStorage.getItem('gmt_forex_live_balance') || '0');
        const tradesStr = localStorage.getItem('gmt_forex_trades');
        const trades = tradesStr ? JSON.parse(tradesStr) : [];
        const active = trades.filter((t: any) => t.status === 'open').length;
        
        // Calculate total PnL from active trades
        const pnl = trades.reduce((acc: number, t: any) => acc + (t.status === 'open' ? t.pnl : 0), 0);

        setData({
          demoBalance: demoBal,
          liveBalance: liveBal,
          activeTrades: active,
          totalPnL: pnl,
          mode: 'demo' // Default to demo for widget
        });
      } catch (e) {
        console.error('Failed to load forex data for widget:', e);
      }
    };

    loadForexData();
    const interval = setInterval(loadForexData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Link 
      to="/supreme-gmt"
      className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 hover:border-[#ffd700]/30 transition-all group block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd700]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ffd700]/10 text-[#ffd700]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Forex Optimum</h3>
        </div>
        <div className="flex items-center gap-2">
          {data.activeTrades > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black animate-pulse border border-green-100">
              {data.activeTrades} ACTIVE
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase">
            Demo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-2xl font-black text-[var(--color-supreme-text)]">
            ${data.demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Floating PnL</p>
          <p className={clsx(
            "text-lg font-black",
            data.totalPnL >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {data.totalPnL >= 0 ? '+' : ''}${data.totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
        <div className="flex -space-x-2">
          {['EUR/USD', 'GBP/USD', 'USD/JPY'].map((pair, i) => (
            <div key={pair} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">
              {pair.split('/')[0][0]}
            </div>
          ))}
        </div>
        <div className="text-[10px] font-black text-[var(--color-supreme-gold)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          OPEN TERMINAL <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
};

const AdsWidget = () => {
  const { getDashboardAds } = useAds();
  const ads = getDashboardAds();

  if (ads.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Featured Ads</h3>
        <span className="text-xs text-gray-400">Expires in 24h</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ads.map(ad => (
          <AdBanner key={ad.id} ad={ad} className="w-full h-auto" />
        ))}
      </div>
    </div>
  );
};

const StatsWidget = () => {
  const stats = [
    { label: 'Rank', value: 'Elite', icon: Crown, color: 'text-[var(--color-supreme-gold)]' },
    { label: 'Network', value: '1.2k', icon: Users, color: 'text-blue-600' },
    { label: 'Sales', value: '$4.5k', icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Views', value: '8.9k', icon: Play, color: 'text-red-600' },
    { label: 'Total Post Likes', value: '15.4k', icon: Heart, color: 'text-pink-500' },
    { label: 'Total Subscribers', value: '3.2k', icon: Users, color: 'text-indigo-500' },
    { label: 'Daily Hours Spent', value: '4.5h', icon: Clock, color: 'text-teal-500' },
    { label: 'Connected Friends', value: '842', icon: UserPlus, color: 'text-orange-500' },
    { label: 'Daily Goods Sold', value: '12', icon: Package, color: 'text-amber-600' },
    { label: 'Daily Posts', value: '45', icon: FileText, color: 'text-cyan-600' },
    { label: 'Daily Videos Uploaded', value: '12', icon: Video, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 4xl:grid-cols-8 5xl:grid-cols-10 gap-3 md:gap-6 3xl:gap-8 4xl:gap-12 5xl:gap-16">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-panel p-4 md:p-6 3xl:p-10 4xl:p-14 5xl:p-20 rounded-2xl 3xl:rounded-3xl border border-gray-200 hover:border-[var(--color-supreme-gold)]/30 transition-all duration-300 group bg-white/80"
        >
          <div className="flex justify-between items-start mb-2 md:mb-4 3xl:mb-6 4xl:mb-10 5xl:mb-14">
            <div className={clsx("p-2 md:p-3 3xl:p-5 4xl:p-8 5xl:p-12 rounded-xl 3xl:rounded-2xl bg-gray-50 group-hover:bg-[var(--color-supreme-gold)]/10 transition-colors", stat.color)}>
              <stat.icon className="w-5 h-5 md:w-6 h-6 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
            </div>
            {stat.label === 'Rank' && <Crown className="w-3 h-3 md:w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16 text-[var(--color-supreme-gold)] opacity-50" />}
          </div>
          <h3 className="text-xl md:text-3xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-display font-bold text-[var(--color-supreme-text)] mb-0.5 md:mb-1 3xl:mb-2 4xl:mb-4 5xl:mb-6">{stat.value}</h3>
          <p className="text-[10px] md:text-sm 3xl:text-lg 4xl:text-2xl 5xl:text-4xl text-gray-500 font-medium tracking-wide uppercase">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

const QuickAccessWidget = () => {
  const { isFeaturePaused } = useFeatureControl();
  const features: { title: string; desc: string; icon: any; path: string; featureId: FeatureId }[] = [
    { title: 'Supreme GMT', desc: 'Global Monitoring Technology', icon: Satellite, path: '/supreme-gmt', featureId: 'supreme-gmt' },
    { title: 'Supreme Core', desc: 'Heart of Supreme', icon: Heart, path: '/supreme-core', featureId: 'core' },
    { title: 'Celeb Hub', desc: 'Elite influencer ecosystem', icon: Star, path: '/celeb-hub', featureId: 'celeb-hub' },
    { title: 'Hall of Fame', desc: 'Celebrate elite achievements', icon: Trophy, path: '/hall-of-fame', featureId: 'core' },
    { title: 'Supreme Nobles', desc: 'Elite royal hierarchy', icon: Crown, path: '/supreme-nobles', featureId: 'core' },
    { title: 'Supreme Network', desc: 'Connect with elite professionals', icon: Users, path: '/network', featureId: 'network' },
    { title: 'Supreme Market', desc: 'Discover luxury products', icon: ShoppingBag, path: '/market', featureId: 'market' },
    { title: 'Supreme Media', desc: 'Create and monetize content', icon: Play, path: '/media', featureId: 'streams' }, // Mapping media to streams for control
    { title: 'Supreme Discover', desc: 'Explore global opportunities', icon: Globe, path: '/discover', featureId: 'discover' },
    { title: 'Supreme AI Tools', desc: 'Boost productivity with AI', icon: Bot, path: '/ai-tools', featureId: 'ai-tools' },
    { title: 'Project Power', desc: 'Build, fund, and manage projects', icon: Rocket, path: '/project-power', featureId: 'project-power' },
    { title: 'Supreme Chat', desc: 'Secure encrypted messaging', icon: MessageCircle, path: '/chat', featureId: 'chat' },
    { title: 'Supreme Streams', desc: 'Live events and broadcasts', icon: Radio, path: '/streams', featureId: 'streams' },
    { title: 'Industrial Tools', desc: 'Manage your industrial operations', icon: LayoutDashboard, path: '/industrial-tools', featureId: 'industrial-tools' },
    { title: 'Supreme Utilities', desc: 'Calculator, Calendar, and Notes', icon: Settings, path: '/business-tools', featureId: 'utilities' },
    { title: 'Supreme Coin Optimum', desc: 'Optimum Miner Cloud Tool', icon: Bitcoin, path: '/supreme-coin-optimum', featureId: 'supreme-coin-optimum' },
    { title: 'Supreme Treasures', desc: 'Elite investment hub', icon: Briefcase, path: '/supreme-treasures', featureId: 'core' },
    { title: 'Ads Manager', desc: 'Promote your brand with AI', icon: Megaphone, path: '/ads', featureId: 'market' },
    { title: 'Supreme PV', desc: 'Our vision for global prosperity', icon: Target, path: '/supreme-pv', featureId: 'core' },
  ];

  const MotionLink = motion(Link);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 4xl:grid-cols-4 5xl:grid-cols-5 gap-4 md:gap-6 3xl:gap-8 4xl:gap-12 5xl:gap-16">
      {features.map((feature, index) => {
        const isPaused = isFeaturePaused(feature.featureId);
        return (
          <MotionLink
            key={feature.title}
            to={feature.path}
            title={isPaused ? `${feature.title} is currently locked` : `Go to ${feature.title}`}
            className={clsx(
              "glass-panel p-4 md:p-6 3xl:p-10 4xl:p-14 5xl:p-20 rounded-2xl 3xl:rounded-3xl border transition-all duration-300 group cursor-pointer flex items-center gap-3 md:gap-4 3xl:gap-6 4xl:gap-10 5xl:gap-14 bg-white/80",
              isPaused 
                ? "border-red-200 opacity-80 grayscale-[0.5]" 
                : "border-gray-200 hover:border-[var(--color-supreme-gold)]/30 hover:bg-white"
            )}
          >
            <div className={clsx(
              "p-3 md:p-4 3xl:p-6 4xl:p-10 5xl:p-14 rounded-xl 3xl:rounded-2xl border transition-colors shadow-sm shrink-0",
              isPaused 
                ? "bg-red-50 border-red-100" 
                : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200 group-hover:border-[var(--color-supreme-gold)]/50"
            )}>
              {isPaused ? (
                <Lock className="w-5 h-5 md:w-6 h-6 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 text-red-500" />
              ) : (
                <feature.icon className="w-5 h-5 md:w-6 h-6 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24 text-gray-500 group-hover:text-[var(--color-supreme-gold)] transition-colors" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className={clsx(
                  "text-base md:text-lg 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-bold transition-colors truncate",
                  isPaused ? "text-gray-400" : "text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)]"
                )}>
                  {feature.title}
                </h4>
                {isPaused && <Lock className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12 text-red-400" />}
              </div>
              <p className="text-xs md:text-sm 3xl:text-lg 4xl:text-2xl 5xl:text-4xl text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-1">
                {isPaused ? "Currently unavailable" : feature.desc}
              </p>
            </div>
          </MotionLink>
        );
      })}
    </div>
  );
};

const AdsManagerWidget = () => {
  const { ads } = useAds();
  const activeAds = ads.filter(ad => new Date(ad.expiresAt) > new Date()).length;

  return (
    <Link 
      to="/ads"
      className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 hover:border-purple-500/30 transition-all group block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Ads Manager</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase border border-purple-100">
          {activeAds} Campaigns
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4 relative z-10">Promote your brand across the Supreme ecosystem with AI-powered tools.</p>
      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
        Manage Campaigns <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};

const SupremePVWidget = () => {
  return (
    <Link 
      to="/supreme-pv"
      className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 hover:border-[var(--color-supreme-gold)]/30 transition-all group block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-supreme-gold)]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 rounded-xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Supreme PV</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4 relative z-10">Explore our vision for global prosperity and 1 billion users.</p>
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-supreme-gold)] group-hover:translate-x-1 transition-transform">
        View Vision <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};

const ProfileCardWidget = () => {
  const [currentCard, setCurrentCard] = useState<ProfileCardData | null>(null);

  useEffect(() => {
    const loadRandomCard = () => {
      // Mock some cards
      const mockCards: ProfileCardData[] = [
        {
          id: 'mock-1',
          userId: 'u1',
          userName: 'Alex Johnson',
          avatar: 'https://picsum.photos/seed/user1/150',
          description: 'Digital creator and entrepreneur. Always looking for new opportunities and collaborations.',
          mobileNumber: '+1 555 0101',
          externalLinks: ['https://alexj.com', 'https://twitter.com/alexj'],
          chatId: 'CHAT-A1B2C3',
          networkId: 'NET-A1B2C3',
          marketId: 'MKT-A1B2C3',
          mediaId: 'MID-A1B2C3',
          vibesId: 'VIBE-A1B2C3',
          adsId: 'ADS-A1B2C3'
        },
        {
          id: 'mock-2',
          userId: 'u2',
          userName: 'Sarah Williams',
          avatar: 'https://picsum.photos/seed/user2/150',
          description: 'Marketing expert helping brands scale. Let\'s connect and grow together.',
          mobileNumber: '+44 7700 900077',
          externalLinks: ['https://sarahw.agency'],
          chatId: 'CHAT-X9Y8Z7',
          networkId: 'NET-X9Y8Z7',
          marketId: 'MKT-X9Y8Z7',
          mediaId: 'MID-X9Y8Z7',
          vibesId: 'VIBE-X9Y8Z7',
          adsId: 'ADS-X9Y8Z7'
        }
      ];

      // Check if current user has a card
      const userCardStr = localStorage.getItem(`profile_card_${localStorage.getItem('supreme_user') ? JSON.parse(localStorage.getItem('supreme_user')!).id : ''}`);
      if (userCardStr) {
        mockCards.push(JSON.parse(userCardStr));
      }

      const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)];
      setCurrentCard(randomCard);
    };

    loadRandomCard();
    // Update every 10 minutes (600000 ms)
    const interval = setInterval(loadRandomCard, 600000);
    return () => clearInterval(interval);
  }, []);

  if (!currentCard) return null;

  return (
    <div className="flex justify-center w-full my-6">
      <ProfileCard data={currentCard} />
    </div>
  );
};

const UpgradePremiumWidget = () => {
  const { isSubscribed } = useSubscription();
  const hasPremium = isSubscribed('general');

  if (hasPremium) {
    return (
      <div className="glass-panel p-6 3xl:p-10 4xl:p-14 5xl:p-20 rounded-2xl 3xl:rounded-3xl border border-[var(--color-supreme-gold)]/30 bg-gradient-to-br from-[var(--color-supreme-gold)]/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 3xl:p-8 4xl:p-12 5xl:p-16 opacity-10">
          <Crown className="w-24 h-24 3xl:w-40 3xl:h-40 4xl:w-64 4xl:h-64 5xl:w-96 5xl:h-96 text-[var(--color-supreme-gold)]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 3xl:gap-10 4xl:gap-16 5xl:gap-24">
          <div className="flex items-center gap-4 3xl:gap-6 4xl:gap-10 5xl:gap-14">
            <div className="p-3 3xl:p-5 4xl:p-8 5xl:p-12 rounded-xl 3xl:rounded-2xl bg-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/20">
              <Shield className="w-8 h-8 3xl:w-12 3xl:h-12 4xl:w-20 4xl:h-20 5xl:w-32 5xl:h-32 text-white" />
            </div>
            <div>
              <h3 className="text-xl 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2 3xl:gap-4">
                Supreme Elite Member <Crown className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-16 5xl:h-16 text-[var(--color-supreme-gold)]" />
              </h3>
              <p className="text-gray-500 3xl:text-xl 4xl:text-3xl 5xl:text-5xl">You have full access to all premium features and exclusive tools.</p>
            </div>
          </div>
          <Link 
            to="/pricing" 
            className="px-6 py-2.5 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-6 5xl:px-24 5xl:py-10 rounded-xl 3xl:rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold 3xl:text-xl 4xl:text-3xl 5xl:text-5xl hover:border-[var(--color-supreme-gold)]/50 transition-all flex items-center gap-2 3xl:gap-4"
          >
            Manage Subscription <ArrowRight className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 3xl:p-14 4xl:p-20 5xl:p-32 rounded-3xl 3xl:rounded-[3rem] border border-[var(--color-supreme-gold)]/30 bg-gradient-to-br from-white via-white to-[var(--color-supreme-gold)]/10 relative overflow-hidden group">
      {/* Background Decorative Elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 3xl:w-80 3xl:h-80 4xl:w-[500px] 4xl:h-[500px] 5xl:w-[800px] 5xl:h-[800px] bg-[var(--color-supreme-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-supreme-gold)]/10 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 3xl:w-80 3xl:h-80 4xl:w-[500px] 4xl:h-[500px] 5xl:w-[800px] 5xl:h-[800px] bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 3xl:gap-14 4xl:gap-20 5xl:gap-32">
        <div className="flex-1 space-y-4 3xl:space-y-8 4xl:space-y-12 5xl:space-y-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 3xl:px-5 3xl:py-2 4xl:px-8 4xl:py-4 5xl:px-12 5xl:py-6 rounded-full bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)] text-xs 3xl:text-base 4xl:text-2xl 5xl:text-4xl font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" /> Limited Time Offer
          </div>
          <h2 className="text-3xl md:text-4xl 3xl:text-6xl 4xl:text-8xl 5xl:text-[10rem] font-display font-bold text-[var(--color-supreme-text)] leading-tight">
            Elevate Your Experience to <span className="text-[var(--color-supreme-gold)]">Supreme Premium</span>
          </h2>
          <p className="text-gray-600 text-lg 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl max-w-xl 3xl:max-w-3xl 4xl:max-w-5xl 5xl:max-w-7xl">
            Unlock exclusive AI tools, unlimited networking, and premium marketplace features designed for elite professionals.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16 pt-2">
            {[
              { icon: Bot, text: 'Unlimited AI Credits' },
              { icon: Globe, text: 'Global Network Access' },
              { icon: Zap, text: 'Priority Support' },
              { icon: CheckCircle, text: 'Exclusive Insights' }
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 3xl:gap-4 4xl:gap-6 5xl:gap-10 text-gray-700 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-medium">
                <item.icon className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 text-[var(--color-supreme-gold)]" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16 min-w-[280px] 3xl:min-w-[400px] 4xl:min-w-[600px] 5xl:min-w-[900px]">
          <div className="text-center mb-2">
            <span className="text-gray-400 line-through text-lg 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl">$49.99</span>
            <div className="flex items-baseline justify-center gap-1 3xl:gap-2">
              <span className="text-5xl 3xl:text-7xl 4xl:text-9xl 5xl:text-[12rem] font-display font-bold text-[var(--color-supreme-text)]">$25</span>
              <span className="text-gray-500 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl font-medium">/month</span>
            </div>
          </div>
          
          <Link 
            to="/pricing" 
            className="w-full py-4 3xl:py-6 4xl:py-10 5xl:py-16 rounded-2xl 3xl:rounded-3xl bg-[var(--color-supreme-gold)] text-white font-bold text-lg 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl shadow-xl shadow-[var(--color-supreme-gold)]/20 hover:bg-[var(--color-supreme-gold-light)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 3xl:gap-5 group"
          >
            Upgrade Now <ArrowRight className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl text-gray-400 font-medium">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
};

const DigitalToolsWidget = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]">
          <Settings className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Supreme Utilities</h3>
      </div>
      <DigitalTools />
    </div>
  );
};

const TaskRemindersWidget = () => {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    const loadReminders = () => {
      try {
        const saved = localStorage.getItem('supreme-tasks');
        if (saved) {
          const tasks = JSON.parse(saved);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          const filtered = tasks.filter((task: any) => {
            if (task.completed || !task.dueDate) return false;
            const due = new Date(task.dueDate);
            due.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 1; // Today or Overdue or Tomorrow
          });
          setReminders(filtered);
        }
      } catch (e) {
        console.error('Failed to load reminders:', e);
      }
    };

    loadReminders();
    const interval = setInterval(loadReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (reminders.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-amber-900">Task Reminders</h3>
      </div>
      <div className="space-y-3">
        {reminders.map(task => {
          const due = new Date(task.dueDate);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          due.setHours(0, 0, 0, 0);
          const isOverdue = due < now;
          
          return (
            <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 truncate">{task.title}</p>
                <p className={clsx("text-xs font-medium", isOverdue ? "text-red-500" : "text-amber-600")}>
                  {isOverdue ? "Overdue" : "Due Today"} • {task.dueDate}
                </p>
              </div>
              <div className="p-2 text-amber-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Dashboard Logic ---

type WidgetId = 'stats' | 'quickAccess' | 'tasks' | 'gamification' | 'activities' | 'supremeUsers' | 'ads' | 'earnings' | 'connectors' | 'deals' | 'connectorAnalysis' | 'awardCampaign' | 'monthlyAwardCampaign' | 'adminSubs' | 'adminCampaigns' | 'adminAwardTracker' | 'adminEarnings' | 'profileCard' | 'dailyAnalytics' | 'projectPower' | 'joinAwards' | 'upgradePremium' | 'digitalTools' | 'taskReminders' | 'miningStatus' | 'forexStatus' | 'adsManager' | 'supremePV';
type SectionId = 'header' | 'main' | 'side';

interface LayoutState {
  header: WidgetId[];
  main: WidgetId[];
  side: WidgetId[];
  hidden: WidgetId[];
}

const WIDGET_LABELS: Record<WidgetId, string> = {
  stats: 'Statistics Overview',
  quickAccess: 'Quick Access',
  tasks: 'Task Manager',
  gamification: 'Achievements & Rank',
  activities: 'Activity Feed',
  supremeUsers: 'Supreme Users',
  ads: 'Featured Ads',
  earnings: 'Earnings Program',
  connectors: 'Supreme Connectors',
  deals: 'Supreme Deals',
  connectorAnalysis: 'Connector Analysis',
  awardCampaign: 'Award Campaign',
  monthlyAwardCampaign: 'Monthly Award Program',
  adminSubs: 'Admin: Subscription Manager',
  adminCampaigns: 'Admin: Campaign Manager',
  adminAwardTracker: 'Admin: Award Tracker',
  adminEarnings: 'Admin: Earnings Manager',
  profileCard: 'Featured Profile Card',
  dailyAnalytics: 'Daily Performance Analysis',
  projectPower: 'Project Power Spotlight',
  joinAwards: 'Join Awards Program',
  upgradePremium: 'Upgrade to Premium',
  digitalTools: 'Supreme Utilities',
  taskReminders: 'Task Reminders',
  miningStatus: 'Mining Status',
  forexStatus: 'Forex Trading Status',
  adsManager: 'Ads Manager',
  supremePV: 'Supreme PV'
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<LayoutState>({
    header: [],
    main: [],
    side: [],
    hidden: []
  });

  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'mini-admin';
      setLayout({
        header: ['upgradePremium', 'stats', 'profileCard', 'taskReminders', 'miningStatus', 'forexStatus'],
        main: isAdmin 
          ? ['joinAwards', 'dailyAnalytics', 'adminSubs', 'adminCampaigns', 'adminAwardTracker', 'adminEarnings', 'earnings', 'monthlyAwardCampaign', 'awardCampaign', 'connectors', 'connectorAnalysis', 'deals', 'ads', 'adsManager', 'supremePV', 'quickAccess', 'digitalTools', 'tasks']
          : ['joinAwards', 'earnings', 'monthlyAwardCampaign', 'awardCampaign', 'connectors', 'connectorAnalysis', 'deals', 'ads', 'adsManager', 'supremePV', 'quickAccess', 'digitalTools', 'tasks'],
        side: ['projectPower', 'gamification', 'supremeUsers', 'activities'],
        hidden: []
      });
    } else {
      setLayout({
        header: ['upgradePremium', 'miningStatus', 'forexStatus'],
        main: ['quickAccess'],
        side: ['projectPower', 'supremeUsers'],
        hidden: []
      });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const moveWidget = (id: WidgetId, direction: 'up' | 'down' | 'left' | 'right' | 'remove') => {
    setLayout(prev => {
      const newLayout = { ...prev };
      let currentSection: SectionId | undefined;
      let currentIndex = -1;

      // Find current position
      (['header', 'main', 'side'] as SectionId[]).forEach(section => {
        if (newLayout[section] && Array.isArray(newLayout[section])) {
          const idx = newLayout[section].indexOf(id);
          if (idx !== -1) {
            currentSection = section;
            currentIndex = idx;
          }
        }
      });

      if (!currentSection || currentIndex === -1) return prev;

      if (direction === 'remove') {
        newLayout[currentSection].splice(currentIndex, 1);
        newLayout.hidden.push(id);
        return newLayout;
      }

      if (direction === 'up') {
        if (currentIndex > 0) {
          // Swap with previous
          [newLayout[currentSection][currentIndex], newLayout[currentSection][currentIndex - 1]] = 
          [newLayout[currentSection][currentIndex - 1], newLayout[currentSection][currentIndex]];
        }
      } else if (direction === 'down') {
        if (currentIndex < newLayout[currentSection].length - 1) {
          // Swap with next
          [newLayout[currentSection][currentIndex], newLayout[currentSection][currentIndex + 1]] = 
          [newLayout[currentSection][currentIndex + 1], newLayout[currentSection][currentIndex]];
        }
      } else if (direction === 'left') {
        // Move between columns: Side -> Main -> Header (optional)
        // For simplicity: Side -> Main
        if (currentSection === 'side') {
          newLayout.side.splice(currentIndex, 1);
          newLayout.main.push(id);
        } else if (currentSection === 'main') {
           newLayout.main.splice(currentIndex, 1);
           newLayout.header.push(id);
        }
      } else if (direction === 'right') {
        // Header -> Main -> Side
        if (currentSection === 'header') {
            newLayout.header.splice(currentIndex, 1);
            newLayout.main.unshift(id);
        } else if (currentSection === 'main') {
          newLayout.main.splice(currentIndex, 1);
          newLayout.side.unshift(id);
        }
      }

      return newLayout;
    });
  };

  const restoreWidget = (id: WidgetId) => {
    setLayout(prev => ({
      ...prev,
      hidden: prev.hidden.filter(w => w !== id),
      main: [...prev.main, id] // Default restore to main
    }));
  };

  const renderWidget = (id: WidgetId, section: SectionId) => {
    let content;
    switch (id) {
      case 'stats': content = <StatsWidget />; break;
      case 'quickAccess': content = <QuickAccessWidget />; break;
      case 'tasks': content = <TaskManager />; break;
      case 'gamification': content = <Gamification />; break;
      case 'activities': content = <UserActivities />; break;
      case 'supremeUsers': content = <SupremeUsersWidget />; break;
      case 'ads': content = <AdsWidget />; break;
      case 'earnings': content = <EarningsProgram />; break;
      case 'connectors': content = <SupremeConnectors />; break;
      case 'deals': content = <SupremeDeals />; break;
      case 'connectorAnalysis': content = <ConnectorAnalysis />; break;
      case 'awardCampaign': content = <AwardCampaign />; break;
      case 'monthlyAwardCampaign': content = <MonthlyAwardCampaign />; break;
      case 'adminSubs': content = <AdminSubscriptionManager />; break;
      case 'adminCampaigns': content = <AdminCampaignManager />; break;
      case 'adminAwardTracker': content = <AdminAwardTracker />; break;
      case 'adminEarnings': content = <AdminEarningsManager />; break;
      case 'profileCard': content = <ProfileCardWidget />; break;
      case 'dailyAnalytics': content = <DailyAnalyticsDashboard />; break;
      case 'projectPower': content = <RandomProjectPowerWidget />; break;
      case 'joinAwards': content = <JoinAwardsWidget />; break;
      case 'upgradePremium': content = <UpgradePremiumWidget />; break;
      case 'digitalTools': content = <DigitalToolsWidget />; break;
      case 'taskReminders': content = <TaskRemindersWidget />; break;
      case 'miningStatus': content = <MiningStatusWidget />; break;
      case 'forexStatus': content = <ForexStatusWidget />; break;
      case 'adsManager': content = <AdsManagerWidget />; break;
      case 'supremePV': content = <SupremePVWidget />; break;
      default: content = null;
    }

    return (
      <div key={id} className="relative group mb-6 last:mb-0">
        {isEditing && (
          <div className="absolute -top-3 -right-2 z-20 flex gap-1 bg-white rounded-full shadow-md border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
             {section !== 'header' && (
                <button onClick={() => moveWidget(id, 'left')} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Left/Up Section">
                  <ArrowLeft className="w-4 h-4" />
                </button>
             )}
             <button onClick={() => moveWidget(id, 'up')} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Up">
               <ArrowUp className="w-4 h-4" />
             </button>
             <button onClick={() => moveWidget(id, 'down')} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Down">
               <ArrowDown className="w-4 h-4" />
             </button>
             {section !== 'side' && (
                <button onClick={() => moveWidget(id, 'right')} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Right/Down Section">
                  <ArrowRight className="w-4 h-4" />
                </button>
             )}
             <div className="w-px h-4 bg-gray-200 mx-1 self-center" />
             <button onClick={() => moveWidget(id, 'remove')} className="p-1 hover:bg-red-50 text-red-500 rounded-full" title="Remove Widget">
               <X className="w-4 h-4" />
             </button>
          </div>
        )}
        
        <div className={clsx(
            "transition-all duration-200 rounded-2xl",
            isEditing && "ring-2 ring-dashed ring-gray-300 hover:ring-[var(--color-supreme-gold)] bg-gray-50/50 p-4 cursor-move"
        )}>
            {isEditing && (
                <div className="absolute top-2 left-2 text-gray-400 opacity-50">
                    <GripVertical className="w-5 h-5" />
                </div>
            )}
            <div className={clsx(isEditing && "pointer-events-none opacity-80 blur-[0.5px]")}>
                {content}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 relative pb-20">
      {/* Promotional Injections */}
      <PromotionalMarquee />

      {/* Supreme Greeting Header */}
      <SupremeGreetingHeader />

      {/* Dashboard Quick Actions Bar */}
      {user && (
        <div className="flex justify-end items-center gap-3">
          <button 
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Save layout changes" : "Customize your dashboard layout"}
              className={clsx(
                  "px-4 py-2 rounded-xl shadow-sm transition-all border flex items-center gap-2 font-bold text-xs",
                  isEditing 
                      ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)] shadow-amber-500/20" 
                      : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
              )}
          >
              {isEditing ? (
                  <>
                      <LayoutDashboard className="w-4 h-4" /> Save Layout
                  </>
              ) : (
                  <>
                      <Settings className="w-4 h-4 text-amber-500" /> Customize Dashboard Widgets
                  </>
              )}
          </button>
        </div>
      )}

      {/* Hidden Widgets Bar (Only visible when editing) */}
      <AnimatePresence>
        {isEditing && layout.hidden.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6"
            >
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Hidden Widgets</h3>
                <div className="flex flex-wrap gap-2">
                    {layout.hidden.map(id => (
                        <button
                            key={id}
                            onClick={() => restoreWidget(id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-[var(--color-supreme-gold)] hover:text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> {WIDGET_LABELS[id]}
                        </button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Grid */}
      <div className="space-y-8">
        {/* Header Zone */}
        <AnimatePresence>
            {layout.header.length > 0 && (
                <motion.div layout className="space-y-6">
                    {layout.header.map(id => renderWidget(id, 'header'))}
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6 min-h-[200px]">
                <AnimatePresence>
                    {layout.main.map(id => renderWidget(id, 'main'))}
                    {layout.main.length === 0 && isEditing && (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                            Main Column Empty
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Side Column */}
            <div className="space-y-6 min-h-[200px]">
                <AnimatePresence>
                    {layout.side.map(id => renderWidget(id, 'side'))}
                    {layout.side.length === 0 && isEditing && (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                            Side Column Empty
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
