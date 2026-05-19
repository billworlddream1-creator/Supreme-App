import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Award,
  Gem,
  Medal,
  ShieldCheck,
  Trophy,
  MessageCircle, 
  Megaphone, 
  ShoppingBag, 
  Radio, 
  Users, 
  Play, 
  TrendingUp, 
  Eye, 
  Settings, 
  X,
  Lock as LockIcon,
  Filter,
  UserPlus,
  UserCheck,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Globe,
  Clock,
  Check,
  UserMinus,
  Users2,
  Activity as ActivityIcon,
  MessageSquare,
  History,
  ChevronRight,
  Plus,
  Printer,
  BookOpen,
  Scale,
  Shield,
  DollarSign,
  FileText,
  Heart,
  Target
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { useNetwork, Friend } from '../context/NetworkContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import FeatureLoader from '../components/FeatureLoader';
import AdBanner from '../components/AdBanner';
import CreateProfileCard from '../components/CreateProfileCard';
import BankHub from '../components/BankHub';
import UTDC from '../components/UTDC';
import T10Engagers from '../components/T10Engagers';
import SupremeFP from '../components/SupremeFP';
import PrintSet from '../components/PrintSet';
import UsageGuideline from '../components/UsageGuideline';
import CommunityGuideline from '../components/CommunityGuideline';
import TermsOfService from '../components/TermsOfService';
import PrivacyPolicy from '../components/PrivacyPolicy';
import EWSP from '../components/EWSP';
import SupremePV from '../components/SupremePV';

// --- Types ---

interface ActivityStats {
  engagement: number; // 0-100
  visitors: number;
}

interface UserActivities {
  chat: ActivityStats;
  ads: ActivityStats;
  market: ActivityStats;
  stream: ActivityStats;
  network: ActivityStats;
  media: ActivityStats;
}

interface SupremeUser {
  id: string;
  name: string;
  avatar: string;
  rank: 'Crowned' | 'Gold' | 'Diamond' | 'Silver' | 'Elite' | 'Royal';
  rankScore: number;
  activities: UserActivities;
  isVisible: {
    chat: boolean;
    ads: boolean;
    market: boolean;
    stream: boolean;
    network: boolean;
    media: boolean;
  };
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
}

// --- Mock Data Generator ---

const RANKS = ['Crowned', 'Gold', 'Diamond', 'Silver', 'Elite', 'Royal'] as const;
const NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Parker', 'Sage'];

const generateMockUsers = (count: number, startIndex: number): SupremeUser[] => {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const rankIndex = Math.min(Math.floor(index / 5), RANKS.length - 1);
    const rank = RANKS[rankIndex];
    
    return {
      id: `mock-supreme-${index}`,
      name: `${NAMES[index % NAMES.length]} ${index}`,
      avatar: `https://picsum.photos/seed/supreme${index}/150`,
      rank,
      rankScore: 10000 - index * 10 - Math.random() * 5,
      activities: {
        chat: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        ads: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        market: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        stream: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        network: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        media: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
      },
      isVisible: {
        chat: Math.random() > 0.1,
        ads: Math.random() > 0.1,
        market: Math.random() > 0.1,
        stream: Math.random() > 0.1,
        network: Math.random() > 0.1,
        media: Math.random() > 0.1,
      },
      socialLinks: {
        twitter: Math.random() > 0.3 ? `https://twitter.com/${NAMES[index % NAMES.length]}` : undefined,
        linkedin: Math.random() > 0.3 ? `https://linkedin.com/in/${NAMES[index % NAMES.length]}` : undefined,
        facebook: Math.random() > 0.3 ? `https://facebook.com/${NAMES[index % NAMES.length]}` : undefined,
        website: Math.random() > 0.3 ? `https://example.com/${NAMES[index % NAMES.length]}` : undefined,
      }
    };
  });
};

// --- Components ---

const RankBadge = ({ rank, showName = true }: { rank: SupremeUser['rank'], showName?: boolean }) => {
  const config = {
    Crowned: { icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    Gold: { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    Diamond: { icon: Gem, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    Silver: { icon: Medal, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
    Elite: { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    Royal: { icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  };

  const { icon: Icon, color, bg, border } = config[rank] || config.Elite;

  return (
    <div className={clsx(
      "flex items-center gap-1.5 px-2 py-0.5 3xl:px-4 3xl:py-2 4xl:px-6 4xl:py-4 5xl:px-10 5xl:py-8 rounded-lg 3xl:rounded-2xl border text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-black uppercase tracking-tighter shadow-sm",
      bg, color, border
    )}>
      <Icon className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12 fill-current" />
      {showName && rank}
    </div>
  );
};

const AdCard = ({ ad }: { ad: any }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <AdBanner ad={ad} className="max-w-full" />
    </div>
  );
};

const ActivityBar = React.memo(({ 
  icon: Icon, 
  label, 
  stats, 
  color, 
  visible 
}: { 
  icon: any, 
  label: string, 
  stats: ActivityStats, 
  color: string,
  visible: boolean 
}) => {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 3xl:gap-6 text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl">
      <div className={clsx("p-2 3xl:p-4 4xl:p-6 5xl:p-10 rounded-lg 3xl:rounded-2xl bg-gray-50", color)}>
        <Icon className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1 3xl:mb-3">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl text-gray-500 flex items-center gap-1 3xl:gap-2">
            <Eye className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" /> {stats.visitors.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 3xl:h-3 4xl:h-5 5xl:h-8 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={clsx("h-full rounded-full", color.replace('text-', 'bg-'))} 
            style={{ width: `${stats.engagement}%` }}
          />
        </div>
      </div>
      <span className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold text-gray-600 w-8 3xl:w-12 4xl:w-20 5xl:w-32 text-right">{stats.engagement}%</span>
    </div>
  );
});

const UserCard = React.memo(({ 
  user, 
  index, 
  onClick,
  isFollowed,
  onToggleFollow
}: { 
  user: SupremeUser, 
  index: number, 
  onClick: (user: SupremeUser) => void,
  isFollowed: boolean,
  onToggleFollow: (e: React.MouseEvent) => void
}) => {
  const { sendFriendRequest, friends } = useNetwork();
  const navigate = useNavigate();
  const isFriend = friends.some(f => f.id === user.id);

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFriend) return;
    
    const friendData: Friend = {
      id: user.id,
      name: user.name,
      handle: `@${user.name.toLowerCase().replace(/\s/g, '')}`,
      avatar: user.avatar,
      rank: user.rank,
      rankColor: user.rank === 'Crowned' ? 'text-[var(--color-supreme-gold)]' : 
                 user.rank === 'Gold' ? 'text-yellow-600' :
                 user.rank === 'Diamond' ? 'text-cyan-600' :
                 user.rank === 'Silver' ? 'text-slate-500' :
                 user.rank === 'Elite' ? 'text-blue-500' : 'text-gray-500'
    };
    sendFriendRequest(friendData);
    toast.success(`Connection request sent to ${user.name}`);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/chat', { state: { userId: user.id, userName: user.name, userAvatar: user.avatar } });
  };

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={() => onClick(user)}
    className="glass-panel p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border border-gray-200 bg-white/80 hover:border-[var(--color-supreme-gold)]/30 transition-all hover:shadow-md cursor-pointer group"
    title="Click to zoom profile"
  >
    <div className="flex items-center gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16 mb-6 3xl:mb-10">
      <div className="w-16 h-16 3xl:w-24 3xl:h-24 4xl:w-36 4xl:h-36 5xl:w-56 5xl:h-56 rounded-full bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform">
        <img src={user.avatar} alt={user.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 3xl:gap-4 flex-wrap">
          <h3 className="text-xl 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors">{user.name}</h3>
          <RankBadge rank={user.rank} />
          <button
            onClick={onToggleFollow}
            className={clsx(
              "ml-auto px-3 py-1 3xl:px-6 3xl:py-2 4xl:px-10 4xl:py-4 5xl:px-16 5xl:py-8 rounded-full text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold transition-colors",
              isFollowed 
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                : "bg-[var(--color-supreme-gold)] text-white hover:bg-amber-600 shadow-sm"
            )}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>
        <div className="flex items-center gap-2 3xl:gap-4 text-gray-500 font-medium text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl mt-1 3xl:mt-3">
          <TrendingUp className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
          <span>Score: {Math.floor(user.rankScore).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3 3xl:gap-6 mt-3 3xl:mt-6">
          {user.socialLinks.twitter && (
            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
            </a>
          )}
          {user.socialLinks.linkedin && (
            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-blue-700 transition-colors">
              <Linkedin className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
            </a>
          )}
          {user.socialLinks.facebook && (
            <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-blue-600 transition-colors">
              <Facebook className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
            </a>
          )}
          {user.socialLinks.website && (
            <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-600 transition-colors">
              <Globe className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
            </a>
          )}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 3xl:gap-6 mb-6 3xl:mb-10">
      <button 
        onClick={handleConnect}
        disabled={isFriend}
        className={clsx(
          "flex items-center justify-center gap-2 py-2 3xl:py-4 4xl:py-6 5xl:py-10 rounded-xl 3xl:rounded-2xl text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold transition-all",
          isFriend 
            ? "bg-green-50 text-green-600 border border-green-100 cursor-default" 
            : "bg-[var(--color-supreme-text)] text-white hover:bg-black shadow-sm"
        )}
      >
        {isFriend ? <UserCheck className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> : <UserPlus className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />}
        {isFriend ? 'Connected' : 'Connect'}
      </button>
      <button 
        onClick={handleMessage}
        className="flex items-center justify-center gap-2 py-2 3xl:py-4 4xl:py-6 5xl:py-10 rounded-xl 3xl:rounded-2xl text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
      >
        <MessageCircle className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Message
      </button>
    </div>

    <div className="space-y-4 3xl:space-y-8">
      <h4 className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold text-gray-400 uppercase tracking-wider">Engagement Analysis</h4>
      <ActivityBar icon={MessageCircle} label="Chat" stats={user.activities.chat} color="text-blue-500" visible={user.isVisible.chat} />
      <ActivityBar icon={Megaphone} label="Ads" stats={user.activities.ads} color="text-purple-500" visible={user.isVisible.ads} />
      <ActivityBar icon={ShoppingBag} label="Market" stats={user.activities.market} color="text-green-500" visible={user.isVisible.market} />
      <ActivityBar icon={Radio} label="Stream" stats={user.activities.stream} color="text-red-500" visible={user.isVisible.stream} />
      <ActivityBar icon={Users} label="Network" stats={user.activities.network} color="text-indigo-500" visible={user.isVisible.network} />
      <ActivityBar icon={Play} label="Media" stats={user.activities.media} color="text-pink-500" visible={user.isVisible.media} />
    </div>
  </motion.div>
  );
});

export default function SupremeUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    friends, 
    friendRequests, 
    acceptFriendRequest, 
    rejectFriendRequest,
    communities,
    joinedCommunities,
    myCommunityRequests,
    cancelCommunityRequest,
    leaveCommunity
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<'global' | 'yfyg' | 'bank_hub' | 'utdc' | 't10' | 'supreme_fp' | 'ewsp' | 'supreme_pv' | 'print_set' | 'usage_guideline' | 'community_guideline' | 'terms_of_service' | 'privacy_policy'>('global');
  const [yfygSubTab, setYfygSubTab] = useState<'friends' | 'groups'>('friends');

  const { profile } = useAuth();

  // Tenure check for UTDC
  const getTenureInMonths = () => {
    if (!profile?.createdAt) return 0;
    try {
      const created = profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
      const now = new Date();
      const diff = now.getTime() - created.getTime();
      return diff / (1000 * 60 * 60 * 24 * 30.44); // Approx months
    } catch (e) {
      return 0;
    }
  };

  const hasUTDCAccess = getTenureInMonths() >= 3;

  // Group Requests
  const uniqueCommunityRequests = Array.from(new Set(myCommunityRequests || []));

  // Joined Groups
  const uniqueJoinedCommunities = Array.from(new Set(joinedCommunities || []));

  // Friend Requests
  const uniqueFriendRequests = (friendRequests || []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  
  const [users, setUsers] = useState<SupremeUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [zoomedUser, setZoomedUser] = useState<SupremeUser | null>(null);
  const [zoomedUserPosts, setZoomedUserPosts] = useState<any[]>([]);
  const [isZoomedPostsLoading, setIsZoomedPostsLoading] = useState(false);

  useEffect(() => {
    if (zoomedUser?.id) {
      setIsZoomedPostsLoading(true);
      const q = query(
        collection(db, 'posts'),
        where('authorUid', '==', zoomedUser.id),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        setZoomedUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsZoomedPostsLoading(false);
      }, (error) => {
        console.error('Error fetching zoomed user posts:', error);
        setIsZoomedPostsLoading(false);
      });
    } else {
      setZoomedUserPosts([]);
    }
  }, [zoomedUser?.id]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const observerTarget = useRef(null);

  // User's own visibility settings (local state for demo)
  const [mySettings, setMySettings] = useState({
    chat: true,
    ads: true,
    market: true,
    stream: true,
    network: true,
    media: true,
    ghostMode: false,
    showLocation: false,
    showRankScore: true,
    allowDirectInquiry: true,
  });

  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'Finance',
    yieldTarget: 5.5,
    profitSharing: 20,
    isPrivate: false,
  });

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreUsers();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const loadMoreUsers = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setUsers(prev => {
        const startIndex = prev.length;
        const newUsers = generateMockUsers(10, startIndex);
        return [...prev, ...newUsers];
      });
      setPage(prev => prev + 1);
      setLoading(false);
    }, 800);
  };

  const toggleSetting = (key: keyof typeof mySettings) => {
    setMySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const suggestExpert = () => {
    const experts = users.filter(u => u.rank === 'Crowned' || u.rank === 'Royal' || u.rank === 'Diamond');
    if (experts.length > 0) {
      const randomExpert = experts[Math.floor(Math.random() * experts.length)];
      setZoomedUser(randomExpert);
    } else if (users.length > 0) {
      setZoomedUser(users[0]);
    }
  };

  const { getActiveAds } = useAds();
  const activeAds = getActiveAds();

  // Mock storyline data
  const mockStoryline = [
    { id: '1', type: 'post', content: 'Just reached a new milestone in the Supreme GMT!', time: '2h ago' },
    { id: '2', type: 'achievement', content: 'Earned the "Elite Trader" badge in Marketplace.', time: '5h ago' },
    { id: '3', type: 'media', content: 'Uploaded a new exclusive video to Supreme Media.', time: '1d ago' },
  ];

  const mockGroupActivities = [
    { id: '1', user: 'Alex', action: 'joined the discussion', time: '10m ago' },
    { id: '2', user: 'Jordan', action: 'shared a new resource', time: '1h ago' },
    { id: '3', user: 'Taylor', action: 'started a live stream', time: '3h ago' },
  ];

  const hasAccessToUTDC = useMemo(() => {
    if (!user?.createdAt) return false;
    const creationDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 90 || user.role === 'admin' || user.role === 'mini-admin';
  }, [user]);

  return (
    <FeatureLoader text="Supreme Members">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)] tracking-tight">
            Supreme Users
          </h1>
          <p className="text-gray-500">Global rankings and engagement analysis</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={suggestExpert}
            className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl font-medium hover:bg-purple-100 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Suggest Expert
          </button>
          <button 
            onClick={() => setShowCreateCard(true)}
            className="px-4 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg"
          >
            Create Profile Card
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Settings className="w-4 h-4" /> Visibility Settings
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('global')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap",
            activeTab === 'global' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Global Rankings
          {activeTab === 'global' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('yfyg')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative flex items-center gap-2 whitespace-nowrap",
            activeTab === 'yfyg' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          YFYG
          <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">
            {friends.length + joinedCommunities.length}
          </span>
          {activeTab === 'yfyg' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bank_hub')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap",
            activeTab === 'bank_hub' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Bank Hub
          {activeTab === 'bank_hub' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('utdc')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'utdc' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          UTDC (Support)
          {!hasAccessToUTDC && <LockIcon className="w-3 h-3 text-red-500" />}
          {activeTab === 'utdc' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('t10')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap",
            activeTab === 't10' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          T10 (Top 10)
          {activeTab === 't10' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('supreme_fp')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap",
            activeTab === 'supreme_fp' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Supreme FP
          {activeTab === 'supreme_fp' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ewsp')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'ewsp' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <DollarSign className={`w-4 h-4 ${activeTab === 'ewsp' ? 'text-[var(--color-supreme-gold)]' : 'text-gray-400'}`} />
          EWSP
          {activeTab === 'ewsp' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('supreme_pv')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'supreme_pv' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Target className="w-4 h-4" />
          Supreme PV
          {activeTab === 'supreme_pv' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('print_set')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'print_set' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Printer className="w-4 h-4" />
          Print Set
          {activeTab === 'print_set' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('usage_guideline')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'usage_guideline' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Usage Guidelines
          {activeTab === 'usage_guideline' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('community_guideline')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'community_guideline' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="w-4 h-4" />
          Community Guidelines
          {activeTab === 'community_guideline' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('terms_of_service')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'terms_of_service' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Scale className="w-4 h-4" />
          Terms of Service
          {activeTab === 'terms_of_service' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('privacy_policy')}
          className={clsx(
            "px-6 py-3 font-bold text-sm transition-all relative whitespace-nowrap flex items-center gap-2",
            activeTab === 'privacy_policy' ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Shield className="w-4 h-4" />
          Privacy Policy
          {activeTab === 'privacy_policy' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-supreme-gold)]" />
          )}
        </button>
      </div>

      {activeTab === 'global' ? (
        <>
          {/* Settings Modal */}
          <AnimatePresence>
            {showSettings && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-supreme-text)]">Supreme Privacy</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Visibility & Engagement Control</p>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="p-2 transition-all bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 3xl:p-8 space-y-3 3xl:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Ghost Mode Toggle */}
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between mb-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                          <Eye className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <p className="font-bold text-indigo-950 text-sm">Global Ghost Mode</p>
                          <p className="text-[10px] text-indigo-700/70 font-medium">Instantly hide all your metrics from everyone</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('ghostMode')}
                        className={clsx(
                          "w-12 h-6 rounded-full transition-all relative",
                          mySettings.ghostMode ? "bg-indigo-600" : "bg-gray-300"
                        )}
                      >
                        <div className={clsx(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                          mySettings.ghostMode ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                    {Object.entries(mySettings).filter(([key]) => !['ghostMode', 'showLocation', 'showRankScore', 'allowDirectInquiry'].includes(key)).map(([key, value]) => (
                      <div key={key} className={clsx(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        mySettings.ghostMode ? "bg-gray-50/50 border-gray-100 opacity-50 pointer-events-none" : "bg-white border-gray-100 hover:border-[var(--color-supreme-gold)]/30 hover:shadow-sm"
                      )}>
                        <div className="flex items-center gap-3">
                          <ActivityIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-xs capitalize text-gray-700">{key} Privacy</span>
                        </div>
                        <button
                          onClick={() => toggleSetting(key as any)}
                          className={clsx(
                            "w-10 h-5 rounded-full transition-colors relative",
                            value ? "bg-[var(--color-supreme-gold)]" : "bg-gray-200"
                          )}
                        >
                          <div className={clsx(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                            value ? "left-5.5" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Advanced Controls</p>
                      
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="text-xs font-bold text-gray-600">Show Geographic Location</span>
                        <button onClick={() => toggleSetting('showLocation')} className={clsx("w-8 h-4 rounded-full relative transition-all", mySettings.showLocation ? "bg-blue-500" : "bg-gray-300")}>
                          <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", mySettings.showLocation ? "left-4.5" : "left-0.5")} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="text-xs font-bold text-gray-600">Global Rank Visibility</span>
                        <button onClick={() => toggleSetting('showRankScore')} className={clsx("w-8 h-4 rounded-full relative transition-all", mySettings.showRankScore ? "bg-emerald-500" : "bg-gray-300")}>
                          <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", mySettings.showRankScore ? "left-4.5" : "left-0.5")} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="text-xs font-bold text-gray-600">Allow UTDC Direct Inquiry</span>
                        <button onClick={() => toggleSetting('allowDirectInquiry')} className={clsx("w-8 h-4 rounded-full relative transition-all", mySettings.allowDirectInquiry ? "bg-amber-500" : "bg-gray-300")}>
                          <div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", mySettings.allowDirectInquiry ? "left-4.5" : "left-0.5")} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="w-full py-3 bg-[var(--color-supreme-text)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                    >
                      Apply Secure Settings
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            {/* Create Group Modal (YFYG Enhanced) */}
            {showCreateGroup && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
                >
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-900 to-indigo-800">
                    <div>
                      <h3 className="text-2xl font-display font-black text-white tracking-tight">Create Supreme Group</h3>
                      <p className="text-indigo-200/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Yield For Your Group (YFYG) Activation</p>
                    </div>
                    <button onClick={() => setShowCreateGroup(false)} className="p-2 transition-all bg-white/10 rounded-xl text-white hover:bg-white/20">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Group Identity</label>
                        <input
                          type="text"
                          placeholder="Supreme Alpha Network..."
                          value={newGroupData.name}
                          onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Mission Statement</label>
                        <textarea
                          placeholder="The goal of this group is to..."
                          rows={3}
                          value={newGroupData.description}
                          onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Sector</label>
                          <select 
                            value={newGroupData.category}
                            onChange={(e) => setNewGroupData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          >
                            <option>Finance</option>
                            <option>Tech</option>
                            <option>Marketing</option>
                            <option>Trading</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Privacy</label>
                          <button 
                            onClick={() => setNewGroupData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                            className={clsx(
                              "w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                              newGroupData.isPrivate ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}
                          >
                            {newGroupData.isPrivate ? <LockIcon className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {newGroupData.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* YFYG Settings */}
                    <div className="space-y-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-600/20">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <h4 className="font-display font-black text-indigo-900 tracking-tight">YFYG Configuration</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-bold text-indigo-700/70 uppercase tracking-widest">Target Yield (ROI)</label>
                            <span className="text-sm font-black text-indigo-900">{newGroupData.yieldTarget}%</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            step="0.5"
                            value={newGroupData.yieldTarget}
                            onChange={(e) => setNewGroupData(prev => ({ ...prev, yieldTarget: parseFloat(e.target.value) }))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-bold text-indigo-700/70 uppercase tracking-widest">Profit Sharing</label>
                            <span className="text-sm font-black text-indigo-900">{newGroupData.profitSharing}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="80"
                            step="5"
                            value={newGroupData.profitSharing}
                            onChange={(e) => setNewGroupData(prev => ({ ...prev, profitSharing: parseInt(e.target.value) }))}
                            className="w-full accent-[var(--color-supreme-gold)]"
                          />
                          <p className="text-[9px] text-gray-400 text-center font-medium italic">Amount distributed back to active members monthly</p>
                        </div>

                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-gray-600">YFYG Smart Contract Escrow Active</span>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold text-gray-600">Community Reward Tier 1 Eligibility</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                    <button 
                      onClick={() => setShowCreateGroup(false)}
                      className="flex-1 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-all"
                    >
                      Discard Draft
                    </button>
                    <button 
                      onClick={() => {
                        toast.success(`Supreme Group "${newGroupData.name}" initialized with YFYG!`);
                        setShowCreateGroup(false);
                      }}
                      className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 transform hover:-translate-y-0.5"
                    >
                      Deploy Group Contract
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6 gap-6 3xl:gap-8 4xl:gap-12 5xl:gap-16">
            {/* Current User Card (Pinned) */}
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "glass-panel p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border-2 shadow-lg relative overflow-hidden transition-all duration-500",
                  mySettings.ghostMode 
                    ? "border-indigo-500/50 bg-indigo-950/5 grayscale" 
                    : "border-[var(--color-supreme-gold)]/30 bg-gradient-to-br from-white to-[var(--color-supreme-gold)]/5"
                )}
              >
                {mySettings.ghostMode && (
                  <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
                    <div className="rotate-[-35deg] border-4 border-indigo-500/30 px-8 py-2 rounded-2xl">
                      <span className="text-4xl font-black text-indigo-500/30 tracking-[0.5em] uppercase">GHOST</span>
                    </div>
                  </div>
                )}

                <div className="absolute top-0 right-0 p-2 3xl:p-4 4xl:p-6 5xl:p-10 bg-[var(--color-supreme-gold)] text-white rounded-bl-xl 3xl:rounded-bl-3xl text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold tracking-wider z-10">
                  {mySettings.ghostMode ? 'STEALTH' : 'YOU'}
                </div>
                
                <div className="flex items-center gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16 mb-6 3xl:mb-10 relative z-10">
                  <div className="w-16 h-16 3xl:w-24 3xl:h-24 4xl:w-36 4xl:h-36 5xl:w-56 5xl:h-56 rounded-full p-1 bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-200">
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 3xl:gap-4">
                      <h3 className="text-xl 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-bold text-[var(--color-supreme-text)]">{user.name}</h3>
                      {mySettings.showRankScore && <RankBadge rank="Royal" />}
                    </div>
                    <div className="flex items-center gap-2 3xl:gap-4 text-[var(--color-supreme-gold)] font-medium mt-1 3xl:mt-3">
                      <TrendingUp className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                      <span className="3xl:text-xl 4xl:text-3xl 5xl:text-5xl">{mySettings.ghostMode ? 'Invisibility Active' : 'Elite Status'}</span>
                    </div>
                    {mySettings.showLocation && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mt-2 uppercase tracking-widest">
                        <Globe className="w-3 h-3" /> Paris, France
                      </div>
                    )}
                    <div className="flex items-center gap-3 3xl:gap-6 mt-3 3xl:mt-6">
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /></a>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /></a>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /></a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 3xl:space-y-8 relative z-10">
                  <h4 className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold text-gray-400 uppercase tracking-wider">Engagement Analysis</h4>
                  <ActivityBar 
                    icon={MessageCircle} 
                    label="Chat" 
                    stats={{ engagement: 85, visitors: 1240 }} 
                    color="text-blue-500" 
                    visible={!mySettings.ghostMode && mySettings.chat} 
                  />
                  <ActivityBar 
                    icon={Megaphone} 
                    label="Ads" 
                    stats={{ engagement: 62, visitors: 890 }} 
                    color="text-purple-500" 
                    visible={!mySettings.ghostMode && mySettings.ads} 
                  />
                  <ActivityBar 
                    icon={ShoppingBag} 
                    label="Market" 
                    stats={{ engagement: 45, visitors: 2100 }} 
                    color="text-green-500" 
                    visible={!mySettings.ghostMode && mySettings.market} 
                  />
                  <ActivityBar 
                    icon={Radio} 
                    label="Stream" 
                    stats={{ engagement: 92, visitors: 5600 }} 
                    color="text-red-500" 
                    visible={!mySettings.ghostMode && mySettings.stream} 
                  />
                  <ActivityBar 
                    icon={Users} 
                    label="Network" 
                    stats={{ engagement: 78, visitors: 3400 }} 
                    color="text-indigo-500" 
                    visible={!mySettings.ghostMode && mySettings.network} 
                  />
                  <ActivityBar 
                    icon={Play} 
                    label="Media" 
                    stats={{ engagement: 55, visitors: 1800 }} 
                    color="text-pink-500" 
                    visible={!mySettings.ghostMode && mySettings.media} 
                  />
                </div>
              </motion.div>
            )}

            {/* Other Users with Ads injected every 10 */}
            {users.map((u, i) => (
              <React.Fragment key={u.id}>
                <UserCard 
                  user={u} 
                  index={i} 
                  onClick={setZoomedUser} 
                  isFollowed={followedUsers.has(u.id)}
                  onToggleFollow={(e) => {
                    e.stopPropagation();
                    toggleFollow(u.id);
                  }}
                />
                {(i + 1) % 10 === 0 && activeAds.length > 0 && (
                  <AdCard key={`ad-${u.id}-${i}`} ad={activeAds[Math.floor(Math.random() * activeAds.length)]} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Infinite Scroll Loader */}
          <div ref={observerTarget} className="py-8 flex justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'yfyg' ? (
        <div className="space-y-8">
          {/* YFYG Sub Tabs */}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setYfygSubTab('friends')}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                yfygSubTab === 'friends' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Friends
            </button>
            <button
              onClick={() => setYfygSubTab('groups')}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                yfygSubTab === 'groups' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Groups
            </button>
          </div>

          {yfygSubTab === 'friends' ? (
            <div className="space-y-8">
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Friend Requests
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uniqueFriendRequests.map((req) => (
                      <motion.div
                        key={`friend-req-${req.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                      >
                        <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{req.name}</p>
                          <p className="text-xs text-gray-500">{req.handle}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(req.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(req.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Friends List */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-500" />
                  Your Friends
                </h3>
                {friends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friends.map((friend) => (
                      <motion.div
                        key={friend.id}
                        layout
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        {/* Profile Header */}
                        <div className="p-6 pb-4 flex items-start gap-4">
                          <div className="relative">
                            <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                            {friend.isOnline && (
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 truncate">{friend.name}</h4>
                              <span className={clsx("text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-50", friend.rankColor)}>
                                {friend.rank}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{friend.handle}</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Users2 className="w-3 h-3" /> {friend.followers?.toLocaleString() || 0}</span>
                              <span className="flex items-center gap-1"><ActivityIcon className="w-3 h-3" /> 85% Perf.</span>
                            </div>
                          </div>
                        </div>

                        {/* Storyline / Recent Activity */}
                        <div className="px-6 py-4 bg-gray-50/50 border-y border-gray-50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <History className="w-3 h-3" /> Storyline
                          </p>
                          <div className="space-y-3">
                            {mockStoryline.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
                                  <span className="text-[9px] text-gray-400 font-medium">{item.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex gap-2">
                          <button
                            onClick={() => navigate('/chat', { state: { userId: friend.id, userName: friend.name, userAvatar: friend.avatar } })}
                            className="flex-1 py-2 bg-[var(--color-supreme-text)] text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" /> Chat
                          </button>
                          <button
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                            title="View Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">You haven't added any friends yet.</p>
                    <button 
                      onClick={() => setActiveTab('global')}
                      className="mt-4 text-sm font-bold text-[var(--color-supreme-gold)] hover:underline"
                    >
                      Browse Supreme Users
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group Requests */}
              {myCommunityRequests.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Group Requests (Pending)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCommunityRequests.map((reqId) => {
                      const group = communities.find(c => c.id === reqId);
                      if (!group) return null;
                      return (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                        >
                          <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-2xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.category}</p>
                          </div>
                          <button
                            onClick={() => cancelCommunityRequest(group.id)}
                            className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Cancel Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Joined Groups */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-indigo-500" />
                    Your Groups
                  </h3>
                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="px-4 py-2 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-xl text-xs font-black uppercase tracking-widest border border-[var(--color-supreme-gold)]/20 flex items-center gap-2 hover:bg-[var(--color-supreme-gold)] hover:text-white transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create Group (YFYG)
                  </button>
                </div>
                {uniqueJoinedCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uniqueJoinedCommunities.map((groupId) => {
                      const group = communities.find(c => c.id === groupId);
                      if (!group) return null;
                      return (
                        <motion.div
                          key={`group-${group.id}`}
                          layout
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Group Header */}
                          <div className="p-6 pb-4 flex items-start gap-4">
                            <img src={group.avatar} alt={group.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{group.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{group.category}</p>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Users2 className="w-3 h-3" /> {group.membersCount} Members</span>
                                <span className="flex items-center gap-1"><ActivityIcon className="w-3 h-3" /> Active</span>
                              </div>
                            </div>
                          </div>

                          {/* Group Storyline / Activities */}
                          <div className="px-6 py-4 bg-gray-50/50 border-y border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <History className="w-3 h-3" /> Group Activities
                            </p>
                            <div className="space-y-3">
                              {mockGroupActivities.map((activity) => (
                                <div key={`${group.id}-${activity.id}`} className="flex gap-3">
                                  <div className="w-1 h-1 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-600">
                                      <span className="font-bold text-gray-900">{activity.user}</span> {activity.action}
                                    </p>
                                    <span className="text-[9px] text-gray-400 font-medium">{activity.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-4 flex gap-2">
                            <button
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                            >
                              Enter Group
                            </button>
                            <button
                              onClick={() => leaveCommunity(group.id)}
                              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                              title="Leave Group"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Users2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">You haven't joined any groups yet.</p>
                    <button 
                      className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
                    >
                      Explore Communities
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      ) : activeTab === 'bank_hub' ? (
        <BankHub />
      ) : activeTab === 'utdc' ? (
        hasUTDCAccess ? (
          <UTDC />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500 text-center max-w-md px-6 mb-8">
              Supreme UTDC is an elite feature reserved for users who have been part of the platform for at least 3 months.
              Your account current tenure: <span className="font-bold text-[var(--color-supreme-gold)]">{Math.floor(getTenureInMonths() * 10) / 10} months</span>.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('global')}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Go Back
              </button>
              <button 
                className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold opacity-50 cursor-not-allowed"
                disabled
              >
                Unlock in {Math.ceil(3 - getTenureInMonths())} months
              </button>
            </div>
          </div>
        )
      ) : activeTab === 't10' ? (
        <T10Engagers />
      ) : activeTab === 'supreme_fp' ? (
        <SupremeFP />
      ) : activeTab === 'ewsp' ? (
        <EWSP />
      ) : activeTab === 'supreme_pv' ? (
        <SupremePV />
      ) : activeTab === 'print_set' ? (
        <PrintSet />
      ) : activeTab === 'usage_guideline' ? (
        <UsageGuideline />
      ) : activeTab === 'community_guideline' ? (
        <CommunityGuideline />
      ) : activeTab === 'terms_of_service' ? (
        <TermsOfService />
      ) : activeTab === 'privacy_policy' ? (
        <PrivacyPolicy />
      ) : null}

      <AnimatePresence>
        {showCreateCard && (
          <CreateProfileCard isOpen={showCreateCard} onClose={() => setShowCreateCard(false)} />
        )}
      </AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setZoomedUser(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
            >
              <button 
                onClick={() => setZoomedUser(null)} 
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors z-10"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-100 overflow-hidden shadow-xl border-4 border-white shrink-0">
                    <img src={zoomedUser.avatar} alt={zoomedUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-supreme-text)]">{zoomedUser.name}</h2>
                      <RankBadge rank={zoomedUser.rank} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(zoomedUser.id);
                        }}
                        className={clsx(
                          "ml-0 md:ml-4 px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
                          followedUsers.has(zoomedUser.id)
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                            : "bg-[var(--color-supreme-gold)] text-white hover:bg-amber-600 shadow-sm"
                        )}
                      >
                        {followedUsers.has(zoomedUser.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-500 font-medium text-lg mb-3">
                      <TrendingUp className="w-5 h-5" />
                      <span>Score: {Math.floor(zoomedUser.rankScore).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                      {zoomedUser.socialLinks.twitter && (
                        <a href={zoomedUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-50 transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {zoomedUser.socialLinks.linkedin && (
                        <a href={zoomedUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {zoomedUser.socialLinks.facebook && (
                        <a href={zoomedUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {zoomedUser.socialLinks.website && (
                        <a href={zoomedUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Engagement Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActivityBar icon={MessageCircle} label="Chat" stats={zoomedUser.activities.chat} color="text-blue-500" visible={zoomedUser.isVisible.chat} />
                    <ActivityBar icon={Megaphone} label="Ads" stats={zoomedUser.activities.ads} color="text-purple-500" visible={zoomedUser.isVisible.ads} />
                    <ActivityBar icon={ShoppingBag} label="Market" stats={zoomedUser.activities.market} color="text-green-500" visible={zoomedUser.isVisible.market} />
                    <ActivityBar icon={Radio} label="Stream" stats={zoomedUser.activities.stream} color="text-red-500" visible={zoomedUser.isVisible.stream} />
                    <ActivityBar icon={Users} label="Network" stats={zoomedUser.activities.network} color="text-indigo-500" visible={zoomedUser.isVisible.network} />
                    <ActivityBar icon={Play} label="Media" stats={zoomedUser.activities.media} color="text-pink-500" visible={zoomedUser.isVisible.media} />
                  </div>

                  <div className="pt-6">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center justify-between">
                      <span>User Posts</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{zoomedUserPosts.length}</span>
                    </h4>
                    
                    {isZoomedPostsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-[var(--color-supreme-gold)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : zoomedUserPosts.length > 0 ? (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {zoomedUserPosts.map(post => (
                          <div key={post.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{post.category || 'General'}</span>
                              <span className="text-[10px] text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed mb-3 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                <Heart className="w-3 h-3" /> {post.likes || 0}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                <MessageCircle className="w-3 h-3" /> {post.comments || 0}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No public posts found for this user.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </FeatureLoader>
  );
}
