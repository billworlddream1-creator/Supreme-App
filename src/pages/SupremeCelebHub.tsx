import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Users, 
  Video, 
  MessageSquare, 
  Camera, 
  Image as ImageIcon, 
  Send, 
  Download,
  RefreshCw,
  MoreHorizontal, 
  Heart, 
  Share2, 
  Lock, 
  Globe, 
  Shield, 
  Diamond, 
  Crown,
  Search,
  Plus,
  X,
  Settings,
  UserPlus,
  Radio,
  Play,
  Award,
  TrendingUp,
  Sparkles,
  Palette,
  Wand2,
  LayoutGrid,
  Check,
  Eye,
  Pin,
  MessageCircle,
  Smile,
  ThumbsDown,
  Edit2,
  Trash2,
  Maximize2,
  Minimize2,
  Pause,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Wallet,
  Briefcase,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Target,
  BarChart3,
  ShoppingCart,
  Megaphone,
  Award as Badge,
  Trophy,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Dice5,
  Grid3X3,
  ShieldCheck,
  AlertCircle,
  Bell,
  Moon,
  Sun,
  User,
  CreditCard,
  LogOut,
  Languages,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  History,
  TrendingUp as TrendingUpIcon,
  PieChart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart,
  LineChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useUserStatus } from '../context/UserStatusContext';
import { toast } from 'sonner';
import { generateContent } from '../services/aiService';
import { collection, getDocs, query, orderBy, limit as firestoreLimit, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
  'Korean', 'Russian', 'Portuguese', 'Italian', 'Arabic', 'Hindi',
  'Turkish', 'Dutch', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai'
];

interface CelebPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    role: string;
    followers: number;
  };
  content: string;
  image?: string;
  video?: string;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  timestamp: string;
  visibility: 'public' | 'hub' | 'both';
  bgColor?: string;
  category?: string;
  transformType?: 'normal' | 'glass' | 'bold' | 'modern';
  isPinned?: boolean;
  gif?: string | null;
}

const POST_CATEGORIES = [
  'Announcement', 'Behind the Scenes', 'Lifestyle', 'Tech', 'Business', 'Event', 'Personal', 'Exclusive', 'Insight', 'Collaboration'
];

const BACKGROUND_COLORS = [
  { name: 'Default', value: 'transparent' },
  { name: 'Supreme Gold', value: '#FFFDF0' },
  { name: 'Elite Emerald', value: '#F0FDF4' },
  { name: 'Royal Azure', value: '#F0F9FF' },
  { name: 'Majestic Purple', value: '#F5F3FF' },
  { name: 'Soft Rose', value: '#FFF1F2' },
  { name: 'Midnight Slate', value: '#F8FAF8' },
  { name: 'Champagne', value: '#FEFCE8' },
  { name: 'Platinum', value: '#F9FAFB' },
  { name: 'Desert Sand', value: '#FFFBEB' },
  { name: 'Ocean Breeze', value: '#ECFEFF' },
  { name: 'Lavender Mist', value: '#FDF4FF' },
];

const mockPosts: CelebPost[] = [
  {
    id: '1',
    author: {
      name: 'Elena Vance',
      avatar: 'https://picsum.photos/seed/elena/150',
      isVerified: true,
      role: 'Elite Influencer',
      followers: 125000000
    },
    content: 'Just wrapped up an amazing keynote at the Global Tech Summit. The future of AI is brighter than ever! ✨ #TechSummit #EliteInsights',
    image: 'https://picsum.photos/seed/summit/800/600',
    likes: 1240,
    dislikes: 12,
    comments: 85,
    shares: 42,
    timestamp: '2h ago',
    visibility: 'hub',
    isPinned: true
  },
  {
    id: '2',
    author: {
      name: 'Marcus Sterling',
      avatar: 'https://picsum.photos/seed/marcus/150',
      isVerified: true,
      role: 'Venture Capitalist',
      followers: 4500000
    },
    content: 'Looking for the next big thing in sustainable energy. If you are working on something revolutionary, let\'s talk. 🚀',
    likes: 850,
    dislikes: 5,
    comments: 120,
    shares: 15,
    timestamp: '5h ago',
    visibility: 'public'
  }
];

const SUBSCRIPTION_TIERS = [
  { id: '1m', label: '1 Month', price: 100, duration: 1, savings: 0 },
  { id: '3m', label: '3 Months', price: 250, duration: 3, savings: 50 },
  { id: '6m', label: '6 Months', price: 500, duration: 6, savings: 100 },
  { id: '9m', label: '9 Months', price: 700, duration: 9, savings: 200 },
  { id: '12m', label: '12 Months', price: 850, duration: 12, savings: 350 },
];

const formatFollowers = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return count.toString();
};

interface VideoData {
  id: string;
  title: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  category: string;
  creator: string;
  creatorFollowers: number;
  url?: string;
}

interface NetworkMember {
  id: string;
  name: string;
  role: string;
  followers: number;
  isFollowing: boolean;
  engagementRate?: string;
  postsCount?: number;
}

interface ChatMessage {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  isMe: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: { name: 'Elena Vance', avatar: 'https://picsum.photos/seed/elena/150' },
    text: 'Hey! Are you coming to the gala tonight?',
    timestamp: '10:30 AM',
    isMe: false
  },
  {
    id: 'm2',
    sender: { name: 'You', avatar: 'https://picsum.photos/seed/user/150' },
    text: 'Of course! Wouldn\'t miss it for the world.',
    timestamp: '10:32 AM',
    isMe: true
  },
  {
    id: 'm3',
    sender: { name: 'Elena Vance', avatar: 'https://picsum.photos/seed/elena/150' },
    text: 'Perfect. See you there!',
    timestamp: '10:35 AM',
    isMe: false
  }
];

const MOCK_VIDEOS: VideoData[] = [
  { id: 'v1', title: 'The Future of AI in Entertainment', duration: '12:45', views: 1200000, likes: 45000, dislikes: 120, comments: 3400, category: 'Tech', creator: 'Elena Vance', creatorFollowers: 125000000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { id: 'v2', title: 'Behind the Scenes: Global Tech Summit', duration: '08:20', views: 850000, likes: 32000, dislikes: 85, comments: 2100, category: 'Event', creator: 'Marcus Sterling', creatorFollowers: 4500000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  { id: 'v3', title: 'Elite Lifestyle: Private Island Tour', duration: '15:10', views: 2400000, likes: 120000, dislikes: 450, comments: 8900, category: 'Lifestyle', creator: 'Elena Vance', creatorFollowers: 125000000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 'v4', title: 'Venture Capital Secrets 2026', duration: '22:30', views: 500000, likes: 15000, dislikes: 45, comments: 1200, category: 'Business', creator: 'Marcus Sterling', creatorFollowers: 4500000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: 'v5', title: 'Sustainable Energy Revolution', duration: '10:15', views: 1100000, likes: 28000, dislikes: 110, comments: 1800, category: 'Tech', creator: 'Marcus Sterling', creatorFollowers: 4500000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { id: 'v6', title: 'Elite Networking Masterclass', duration: '18:40', views: 300000, likes: 12000, dislikes: 30, comments: 850, category: 'Business', creator: 'Elena Vance', creatorFollowers: 125000000, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
];

const MOCK_NETWORK: NetworkMember[] = [
  { id: 'n1', name: 'Julian Thorne', role: 'Tech Leader', followers: 12500, isFollowing: false, engagementRate: '5.2%', postsCount: 142 },
  { id: 'n2', name: 'Sophia Chen', role: 'Venture Partner', followers: 8400, isFollowing: false, engagementRate: '8.7%', postsCount: 98 },
  { id: 'n3', name: 'David Miller', role: 'Creative Director', followers: 45000, isFollowing: true, engagementRate: '4.1%', postsCount: 310 },
  { id: 'n4', name: 'Isabella Ross', role: 'Marketing Guru', followers: 22000, isFollowing: false, engagementRate: '6.5%', postsCount: 215 },
  { id: 'n5', name: 'Liam Neeson', role: 'Industry Legend', followers: 150000, isFollowing: false, engagementRate: '11.3%', postsCount: 604 },
  { id: 'n6', name: 'Emma Watson', role: 'Global Icon', followers: 8500000, isFollowing: true, engagementRate: '14.2%', postsCount: 1240 },
];

export default function SupremeCelebHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserStatus } = useUserStatus();
  const { 
    balance, 
    celebHubBalance, 
    transferToCelebHub, 
    transferFromCelebHub, 
    updateCelebHubBalance 
  } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<CelebPost[]>(mockPosts);
  const [videos, setVideos] = useState<VideoData[]>(MOCK_VIDEOS);
  const [network, setNetwork] = useState<NetworkMember[]>(MOCK_NETWORK);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());
  const [newPostContent, setNewPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<'public' | 'hub' | 'both'>('hub');
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'streams' | 'network' | 'videos' | 'powerhouse' | 'powergames' | 'wallet' | 'subscriptions' | 'cards' | 'exchange'>('feed');
  const [selectedCategory, setSelectedCategory] = useState('Announcement');
  const [bgColor, setBgColor] = useState('transparent');
  const [transformType, setTransformType] = useState<'normal' | 'glass' | 'bold' | 'modern'>('normal');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTransformMenu, setShowTransformMenu] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [openPostOptions, setOpenPostOptions] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [subscribedCreators, setSubscribedCreators] = useState<Set<string>>(new Set());
  const [zoomedVideo, setZoomedVideo] = useState<VideoData | null>(null);
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('supreme_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, name: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      let updated;
      if (isFav) {
        updated = prev.filter(fId => fId !== id);
        toast.success(`Removed ${name} from favorites.`);
      } else {
        updated = [...prev, id];
        toast.success(`Added ${name} to favorites! 💖`);
      }
      localStorage.setItem('supreme_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const [selectedStatsMember, setSelectedStatsMember] = useState<NetworkMember | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeChatPartner, setActiveChatPartner] = useState({
    id: 'elena',
    name: 'Elena Vance',
    avatar: 'https://picsum.photos/seed/elena/150',
    role: 'Elite Advisor'
  });
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({
    'elena': MOCK_MESSAGES,
  });
  const [newChatMessage, setNewChatMessage] = useState('');
  const [activePowerModule, setActivePowerModule] = useState<string | null>(null);

  // Wallet & Subscription State
  const [transactions, setTransactions] = useState([
    { id: 't1', type: 'deposit', amount: 500, description: 'Bank Transfer', date: '2026-03-28 14:30', status: 'completed' },
    { id: 't2', type: 'withdraw', amount: 200, description: 'PayPal Withdrawal', date: '2026-03-27 09:15', status: 'completed' },
    { id: 't3', type: 'subscription', amount: 100, description: 'Elite Monthly Subscription', date: '2026-03-01 00:00', status: 'completed' },
  ]);
  const [currentSubscription, setCurrentSubscription] = useState({
    tier: 'Elite Monthly',
    price: 100,
    startDate: '2026-03-01',
    expiryDate: '2026-04-01',
    status: 'active',
    autoRenew: true,
    benefits: ['Free Boosted Ads', 'Exclusive Content Access', 'Priority Support']
  });
  const [earningsData, setEarningsData] = useState({
    videoSubscribers: 450,
    followers: 620,
    likes: 1850,
    projectedEarnings: {
      subscribers: 1125, // (450/800) * 2000
      followers: 1550,    // (620/800) * 2000
      likes: 1233        // (1850/3000) * 2000
    }
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'to_hub' | 'from_hub'>('to_hub');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionNote, setTransactionNote] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientList, setRecipientList] = useState<any[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [subscriptionReminder, setSubscriptionReminder] = useState<string | null>(null);
  const [hubSettings, setHubSettings] = useState({
    profileVisibility: 'both' as 'public' | 'hub' | 'both',
    gameSounds: true,
    notifications: {
      likes: true,
      comments: true,
      followers: true
    },
    theme: 'emerald' as 'emerald' | 'gold',
    darkMode: false,
    autoPlay: true,
    highQuality: true
  });
  
  // Apply Dark Mode
  useEffect(() => {
    if (hubSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [hubSettings.darkMode]);

  // Live status states & subscription
  const [dbStatuses, setDbStatuses] = useState<any[]>([]);
  const [activeStatusViewer, setActiveStatusViewer] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      setDbStatuses([]);
      return;
    }
    const statusesCollection = collection(db, 'statuses');
    const unsubscribe = onSnapshot(statusesCollection, (snapshot) => {
      const all: any[] = [];
      const now = new Date();
      snapshot.forEach((doc) => {
        const d = doc.data();
        const expiry = d.expiresAt ? (d.expiresAt.toDate ? d.expiresAt.toDate() : new Date(d.expiresAt)) : null;
        if (!expiry || expiry > now) {
          all.push({ id: doc.id, ...d });
        }
      });
      setDbStatuses(all);
    }, (error) => {
      console.warn("Notice: Unable to load statuses in CelebHub:", error?.message || error);
      setDbStatuses([]);
    });
    return () => unsubscribe();
  }, [user]);

  const primaryColor = hubSettings.theme === 'emerald' ? 'emerald-600' : 'yellow-600';
  const primaryBg = hubSettings.theme === 'emerald' ? 'bg-emerald-600' : 'bg-yellow-600';
  const primaryHoverBg = hubSettings.theme === 'emerald' ? 'hover:bg-emerald-700' : 'hover:bg-yellow-700';
  const primaryText = hubSettings.theme === 'emerald' ? 'text-emerald-600' : 'text-yellow-600';
  const primaryBorder = hubSettings.theme === 'emerald' ? 'border-emerald-500' : 'border-yellow-500';
  const primaryShadow = hubSettings.theme === 'emerald' ? 'shadow-emerald-600/20' : 'shadow-yellow-600/20';
  const primaryLightBg = hubSettings.theme === 'emerald' ? 'bg-emerald-50' : 'bg-yellow-50';
  const primaryLightBorder = hubSettings.theme === 'emerald' ? 'border-emerald-500/20' : 'border-yellow-500/20';
  const [activeGame, setActiveGame] = useState<'poker' | 'blackjack' | 'baccarat' | 'ludo' | 'draughts' | 'chess' | 'chest' | 'roller' | null>(null);
  const [gameState, setGameState] = useState<{
    playerHand: { suit: string; rank: string }[];
    dealerHand: { suit: string; rank: string }[];
    pot: number;
    bet: number;
    status: 'idle' | 'dealing' | 'playing' | 'result';
    resultMessage: string;
    chips: number;
    diceValue?: number;
  }>({
    playerHand: [],
    dealerHand: [],
    pot: 0,
    bet: 0,
    status: 'idle',
    resultMessage: '',
    chips: 50000,
    diceValue: 0
  });
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const [visibleVideosCount, setVisibleVideosCount] = useState(4);
  const [visibleNetworkCount, setVisibleNetworkCount] = useState(4);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cards, setCards] = useState([
    { id: 'c1', number: '4242', holder: user?.name || 'Supreme Member', expiry: '12/30', type: 'Diamond', color: 'bg-emerald-500' },
  ]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({
    type: 'Diamond' as 'Diamond' | 'Elite' | 'Platinum',
    holder: user?.name || '',
    color: 'bg-emerald-500'
  });

  // Infinite scroll logic for videos and network
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && !isLoadingMore) {
        if (activeTab === 'videos' && visibleVideosCount < videos.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleVideosCount(prev => Math.min(prev + 4, videos.length));
            setIsLoadingMore(false);
          }, 800);
        } else if (activeTab === 'network' && visibleNetworkCount < network.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleNetworkCount(prev => Math.min(prev + 4, network.length));
            setIsLoadingMore(false);
          }, 800);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, visibleVideosCount, visibleNetworkCount, activeTab, videos.length, network.length]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const partnerId = activeChatPartner.id;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: {
        name: user?.name || 'You',
        avatar: user?.avatar || 'https://picsum.photos/seed/user/150'
      },
      text: newChatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const currentMsgs = conversations[partnerId] || [];
    const updatedConversations = {
      ...conversations,
      [partnerId]: [...currentMsgs, newMessage]
    };
    setConversations(updatedConversations);
    setNewChatMessage('');

    // Simulate response from the celebrity
    setTimeout(() => {
      const responses = [
        `Thanks for the message! I really appreciate your support and would love to collaborate on a premium campaign soon. Let's draft a proposal together!`,
        `Hey! Loved your outreach. Let's sync up after my current stream ends. Stay tuned! 🚀`,
        `That sounds amazing! I am highly interested. Could you check out my powerhouse level to see if we can unlock joint campaigns?`,
        `Appreciate you reaching out! Let's schedule a call tomorrow to discuss premium media distribution! 🌟`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: {
          name: activeChatPartner.name,
          avatar: activeChatPartner.avatar
        },
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };

      setConversations(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), replyMessage]
      }));
    }, 1500);
  };

  const handleQuickMessage = (member: NetworkMember) => {
    setActiveChatPartner({
      id: member.id,
      name: member.name,
      avatar: `https://picsum.photos/seed/celebvideo${member.id}/150`,
      role: member.role
    });
    
    // Pre-filled message
    setNewChatMessage(`Hi ${member.name}! I really admire your profile as an elite ${member.role}. Let's collaborate! 🚀`);
    
    // Open chat tab
    setActiveTab('chat');
    
    setConversations(prev => {
      if (prev[member.id]) return prev;
      return {
        ...prev,
        [member.id]: [
          {
            id: `welcome-${member.id}`,
            sender: { 
              name: member.name, 
              avatar: `https://picsum.photos/seed/celebvideo${member.id}/150` 
            },
            text: `Hi there! Thanks for visiting my supreme profile. How can I assist you with your social outreach today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
          }
        ]
      };
    });

    toast.success(`Secure chat initiated with ${member.name}! Pre-filled message ready.`);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prevPosts => prevPosts.map(post => {
        // Randomly update 10% of posts every 5 seconds
        if (Math.random() > 0.9) {
          const type = Math.random();
          if (type > 0.6) {
            return { ...post, likes: post.likes + Math.floor(Math.random() * 3) + 1 };
          } else if (type > 0.3) {
            return { ...post, comments: post.comments + Math.floor(Math.random() * 2) };
          } else {
            return { ...post, shares: post.shares + Math.floor(Math.random() * 2) };
          }
        }
        return post;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePolish = async () => {
    if (!newPostContent.trim()) return;
    setIsPolishing(true);
    try {
      const polishedText = await generateContent(
        `As an elite social media manager for high-profile celebrities, polish and enhance the following post. 
        Make it sound more sophisticated, engaging, and exclusive while maintaining the original tone and intent. 
        Add relevant high-end emojis if appropriate. 
        Original post: "${newPostContent}"`
      );
      setNewPostContent(polishedText || newPostContent);
    } catch (error) {
      console.error("Polish Error", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleTranslate = async () => {
    if (!newPostContent.trim()) return;
    setIsTranslating(true);
    try {
      const translatedText = await generateContent(
        `Translate the following celebrity social media post to ${targetLanguage}. Keep the tone and context. Only return the translated text: \n\n${newPostContent}`
      );
      setNewPostContent(translatedText || newPostContent);
    } catch (error) {
      console.error("Translation Error", error);
    } finally {
      setIsTranslating(false);
      setShowLanguageSelect(false);
    }
  };

  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedGif(null);
        setSelectedVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVideo(reader.result as string);
        setSelectedGif(null);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const TRENDING_GIFS = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGpxxfG9C3n9u/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTjJ8O8O8O8O8O/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlHFRbmaZtBRhXG/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjP878Y8h8Y8h/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTjJ8O8O8O8O8O/giphy.gif'
  ];

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedGif) return;
    
    const newPost: CelebPost = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || 'https://picsum.photos/seed/user/150',
        isVerified: true,
        role: 'Elite Member',
        followers: Math.floor(Math.random() * 5000000) + 1000000
      },
      content: newPostContent,
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'Just now',
      visibility: postVisibility,
      bgColor: bgColor,
      category: selectedCategory,
      transformType: transformType,
      gif: selectedGif,
      image: selectedImage,
      video: selectedVideo
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setBgColor('transparent');
    setTransformType('normal');
    setSelectedGif(null);
    setSelectedImage(null);
    setSelectedVideo(null);
    setShowGifPicker(false);
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
      } else {
        next.add(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
      return next;
    });
  };

  const handleShare = (postId: string) => {
    setSharedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, shares: p.shares - 1 } : p));
      } else {
        next.add(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
      }
      return next;
    });
  };

  const handleComment = (postId: string) => {
    // Mock comment functionality: just increment the count
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
  };

  const handleVideoLike = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: v.likes + 1 } : v));
  };

  const handleVideoView = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, views: v.views + 1 } : v));
  };

  const handleFollow = (memberId: string) => {
    setNetwork(prev => prev.map(m => {
      if (m.id === memberId) {
        const isFollowing = !m.isFollowing;
        return {
          ...m,
          isFollowing,
          followers: isFollowing ? m.followers + 1 : m.followers - 1
        };
      }
      return m;
    }));
  };

  const handlePin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
  };

  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
    setOpenPostOptions(null);
  };

  const saveEditPost = () => {
    if (editingPostId) {
      setPosts(posts.map(p => p.id === editingPostId ? { ...p, content: editContent } : p));
      setEditingPostId(null);
      setEditContent('');
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    setOpenPostOptions(null);
  };

  const handleDislike = (postId: string) => {
    setDislikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, dislikes: p.dislikes - 1 } : p));
      } else {
        next.add(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, dislikes: p.dislikes + 1 } : p));
        if (likedPosts.has(postId)) {
          handleLike(postId);
        }
      }
      return next;
    });
  };

  const handleFollowUser = (userName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userName)) next.delete(userName);
      else next.add(userName);
      return next;
    });
  };

  const handleSubscribe = (creator: string) => {
    setSubscribedCreators(prev => {
      const next = new Set(prev);
      if (next.has(creator)) next.delete(creator);
      else next.add(creator);
      return next;
    });
  };

  const handleVideoDislike = (videoId: string) => {
    setDislikedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
        setVideos(videos.map(v => v.id === videoId ? { ...v, dislikes: v.dislikes - 1 } : v));
      } else {
        next.add(videoId);
        setVideos(videos.map(v => v.id === videoId ? { ...v, dislikes: v.dislikes + 1 } : v));
      }
      return next;
    });
  };

  const handleVideoComment = (videoId: string) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, comments: v.comments + 1 } : v));
  };

  useEffect(() => {
    if (showSendModal) {
      fetchRecipients();
    }
  }, [showSendModal]);

  const fetchRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      const q = query(collection(db, 'users'), orderBy('displayName'), firestoreLimit(20));
      const querySnapshot = await getDocs(q);
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          users.push({ id: doc.id, uid: doc.id, ...doc.data() });
        }
      });
      setRecipientList(users);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (amount > balance) {
      toast.error('Insufficient central wallet balance');
      return;
    }

    const success = await transferToCelebHub(amount);
    if (success) {
      setShowDepositModal(false);
      setTransactionAmount('');
      setTransactionNote('');
    }
  };

  // Fetch Cards from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'cards'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      if (cardList.length > 0) {
        setCards(cardList);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddCard = async () => {
    if (!user) return;
    if (celebHubBalance < 50) {
      toast.error('Insufficient Hub Balance to issue a card');
      return;
    }

    const cardData = {
      number: Math.floor(1000 + Math.random() * 9000).toString(),
      holder: newCardData.holder || user?.name || 'Supreme Member',
      expiry: '12/30',
      type: newCardData.type,
      color: newCardData.color,
      createdAt: Timestamp.now()
    };

    try {
      await updateCelebHubBalance(-50, `Issued Supreme ${newCardData.type} Card`, 'withdraw');
      await addDoc(collection(db, 'users', user.uid, 'cards'), cardData);
      setShowAddCardModal(false);
      toast.success('Elite Virtual Card issued successfully');
    } catch (error) {
      toast.error('Failed to issue card. Please try again.');
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0 || amount > celebHubBalance) {
      toast.error('Invalid amount or insufficient hub balance');
      return;
    }

    const success = await transferFromCelebHub(amount);
    if (success) {
      setShowWithdrawModal(false);
      setTransactionAmount('');
      setTransactionNote('');
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;

    let success = false;
    if (transferType === 'to_hub') {
      success = await transferToCelebHub(amount);
    } else {
      success = await transferFromCelebHub(amount);
    }

    if (success) {
      setShowTransferModal(false);
      setTransactionAmount('');
      toast.success(`Successfully transferred $${amount.toLocaleString()}`);
    }
  };

  const handleSend = async () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0 || amount > celebHubBalance || !recipientAddress) {
      toast.error('Invalid amount, recipient or insufficient balance');
      return;
    }

    await updateCelebHubBalance(-amount, `Sent to ${recipientAddress}`, 'withdraw');
    
    setShowSendModal(false);
    setTransactionAmount('');
    setRecipientAddress('');
    toast.success(`Sent $${amount.toLocaleString()} to ${recipientAddress}`);
  };

  const handleReceive = async () => {
    const amount = 500; // Simulated amount
    await updateCelebHubBalance(amount, 'Received via QR', 'deposit');
    toast.success(`Successfully received $${amount.toLocaleString()}`);
    setShowReceiveModal(false);
  };

  const handleSubscribeTier = (tierId: string) => {
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) return;

    if (celebHubBalance < tier.price) {
      toast.error(`Insufficient balance for ${tier.label} subscription. Please top up your wallet.`);
      return;
    }

    updateCelebHubBalance(-tier.price, `Subscription: ${tier.label}`, 'withdraw');
    const startDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + tier.duration);
    
    setCurrentSubscription({
      tier: `Elite ${tier.label}`,
      price: tier.price,
      startDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'active',
      autoRenew: true,
      benefits: ['Free Boosted Ads', 'Exclusive Content Access', 'Priority Support']
    });

    toast.success(`Successfully subscribed to Elite ${tier.label}!`);
  };

  const SUITS = ['♠', '♣', '♥', '♦'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const playSound = (type: 'win' | 'loss') => {
    if (!hubSettings.gameSounds) return;
    const winSound = new Audio();
    winSound.crossOrigin = "anonymous";
    winSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-magic-notification-ring-2359.mp3';
    winSound.load();
    
    const lossSound = new Audio();
    lossSound.crossOrigin = "anonymous";
    lossSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3';
    lossSound.load();
    
    if (type === 'win') winSound.play().catch(e => console.log('Sound play error:', e));
    else lossSound.play().catch(e => console.log('Sound play error:', e));
  };

  const getRandomCard = () => ({
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    rank: RANKS[Math.floor(Math.random() * RANKS.length)]
  });

  const startNewGame = (game: 'poker' | 'blackjack' | 'baccarat' | 'ludo' | 'draughts' | 'chess' | 'chest' | 'roller') => {
    setActiveGame(game);
    setGameState(prev => ({
      ...prev,
      status: 'dealing',
      playerHand: game === 'poker' || game === 'blackjack' || game === 'baccarat' ? [getRandomCard(), getRandomCard()] : [],
      dealerHand: game === 'poker' || game === 'blackjack' || game === 'baccarat' ? [getRandomCard(), getRandomCard()] : [],
      bet: game === 'poker' ? 1000 : game === 'blackjack' ? 500 : game === 'baccarat' ? 5000 : 250,
      resultMessage: '',
      diceValue: 0
    }));

    setTimeout(() => {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }, 1500);
  };

  const handleGameAction = (action: 'hit' | 'stand' | 'fold' | 'raise' | 'move') => {
    if (action === 'hit') {
      const newCard = getRandomCard();
      setGameState(prev => ({
        ...prev,
        playerHand: [...prev.playerHand, newCard]
      }));
    } else if (action === 'stand' || action === 'move') {
      if (action === 'move' && (activeGame === 'ludo' || activeGame === 'roller')) {
        const roll = Math.floor(Math.random() * 6) + 1;
        setGameState(prev => ({ ...prev, diceValue: roll }));
        
        setTimeout(() => {
          const isWin = Math.random() > 0.5;
          playSound(isWin ? 'win' : 'loss');
          setGameState(prev => ({
            ...prev,
            status: 'result',
            resultMessage: isWin ? 'Victory! You outplayed the opponent!' : 'Defeat. The opponent was stronger.'
          }));
        }, 1000);
        return;
      }

      const isWin = Math.random() > 0.5;
      playSound(isWin ? 'win' : 'loss');
      setGameState(prev => ({
        ...prev,
        status: 'result',
        resultMessage: isWin ? 'Victory! You outplayed the opponent!' : 'Defeat. The opponent was stronger.'
      }));
    } else if (action === 'fold') {
      setActiveGame(null);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // Keep relative order for same pin status
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-supreme-bg)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full border-4 border-[var(--color-supreme-gold)] border-t-transparent animate-spin mb-4" />
          <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-gold)] tracking-widest animate-pulse">CELEB HUB</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen pb-20 transition-colors duration-500", hubSettings.darkMode ? "bg-gray-950 text-white" : "bg-[var(--color-supreme-bg)] text-gray-900")}>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={clsx("relative w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden", hubSettings.darkMode ? "bg-gray-900 border border-white/10" : "bg-white")}
            >
              <div className={clsx("p-6 md:p-8 border-b flex items-center justify-between", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-100")}>
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-xl", hubSettings.theme === 'emerald' ? "bg-emerald-500/20" : "bg-yellow-500/20")}>
                    <Settings className={clsx("w-6 h-6", primaryText)} />
                  </div>
                  <div>
                    <h2 className={clsx("text-xl font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>Hub Settings</h2>
                    <p className="text-xs text-gray-500">Customize your elite experience</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className={clsx("p-2 rounded-full transition-colors", hubSettings.darkMode ? "hover:bg-white/10" : "hover:bg-gray-200")}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  {/* Profile Section */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Profile & Privacy</h3>
                    <div className="space-y-4">
                      <div className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div>
                          <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>Profile Visibility</h4>
                          <p className="text-xs text-gray-500">Control who can see your exclusive content</p>
                        </div>
                        <select 
                          value={hubSettings.profileVisibility}
                          onChange={(e) => setHubSettings({...hubSettings, profileVisibility: e.target.value as any})}
                          className={clsx("rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2", hubSettings.darkMode ? "bg-white/10 border-white/20 text-white focus:ring-white/20" : `bg-white border-gray-200 focus:ring-${primaryColor}/20`)}
                        >
                          <option value="public">Public Only</option>
                          <option value="hub">Hub Only</option>
                          <option value="both">Both (Public & Hub)</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Game Settings */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Game Preferences</h3>
                    <div className="space-y-4">
                      <div className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center gap-3">
                          <div className={clsx("p-2 rounded-xl", hubSettings.darkMode ? "bg-white/10" : `${primaryLightBg}`)}>
                            <Volume2 className={clsx("w-5 h-5", primaryText)} />
                          </div>
                          <div>
                            <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>Game Sound Effects</h4>
                            <p className="text-xs text-gray-500">Enable sounds for wins and losses in Power Games</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHubSettings({...hubSettings, gameSounds: !hubSettings.gameSounds})}
                          className={clsx(
                            "w-12 h-6 rounded-full transition-colors relative",
                            hubSettings.gameSounds ? primaryBg : (hubSettings.darkMode ? "bg-white/10" : "bg-gray-300")
                          )}
                        >
                          <div className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            hubSettings.gameSounds ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Notifications */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'likes', label: 'New Likes', icon: Heart },
                        { id: 'comments', label: 'New Comments', icon: MessageSquare },
                        { id: 'followers', label: 'New Followers', icon: UserPlus },
                      ].map((item) => (
                        <div key={item.id} className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                          <div className="flex items-center gap-3">
                            <item.icon className={clsx("w-4 h-4", primaryText)} />
                            <span className={clsx("text-sm font-bold", hubSettings.darkMode ? "text-gray-300" : "text-gray-700")}>{item.label}</span>
                          </div>
                          <button 
                            onClick={() => setHubSettings({
                              ...hubSettings, 
                              notifications: { ...hubSettings.notifications, [item.id]: !hubSettings.notifications[item.id as keyof typeof hubSettings.notifications] }
                            })}
                            className={clsx(
                              "w-10 h-5 rounded-full transition-colors relative",
                              hubSettings.notifications[item.id as keyof typeof hubSettings.notifications] ? primaryBg : (hubSettings.darkMode ? "bg-white/10" : "bg-gray-300")
                            )}
                          >
                            <div className={clsx(
                              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                              hubSettings.notifications[item.id as keyof typeof hubSettings.notifications] ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Experience Settings */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Experience</h3>
                    <div className="space-y-4">
                      <div className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-500/10">
                            <Play className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>Auto-play Videos</h4>
                            <p className="text-xs text-gray-500">Automatically play videos when they appear</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHubSettings({...hubSettings, autoPlay: !hubSettings.autoPlay})}
                          className={clsx(
                            "w-12 h-6 rounded-full transition-colors relative",
                            hubSettings.autoPlay ? primaryBg : (hubSettings.darkMode ? "bg-white/10" : "bg-gray-300")
                          )}
                        >
                          <div className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            hubSettings.autoPlay ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-500/10">
                            <Zap className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>High Quality Media</h4>
                            <p className="text-xs text-gray-500">Stream videos in the highest available resolution</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHubSettings({...hubSettings, highQuality: !hubSettings.highQuality})}
                          className={clsx(
                            "w-12 h-6 rounded-full transition-colors relative",
                            hubSettings.highQuality ? primaryBg : (hubSettings.darkMode ? "bg-white/10" : "bg-gray-300")
                          )}
                        >
                          <div className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            hubSettings.highQuality ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className={clsx("flex items-center justify-between p-4 rounded-2xl border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-indigo-500/10">
                            {hubSettings.darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-indigo-600" />}
                          </div>
                          <div>
                            <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>Dark Mode</h4>
                            <p className="text-xs text-gray-500">Switch between light and dark elite themes</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHubSettings({...hubSettings, darkMode: !hubSettings.darkMode})}
                          className={clsx(
                            "w-12 h-6 rounded-full transition-colors relative",
                            hubSettings.darkMode ? primaryBg : (hubSettings.darkMode ? "bg-white/10" : "bg-gray-300")
                          )}
                        >
                          <div className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            hubSettings.darkMode ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Account Section */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
                    <div className="space-y-4">
                      <div className={clsx("p-4 rounded-2xl border flex items-center justify-between", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-10 h-10 rounded-full overflow-hidden", hubSettings.darkMode ? "bg-white/10" : "bg-gray-200")}>
                            <img src={user?.avatar || 'https://picsum.photos/seed/user/150'} alt="User" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className={clsx("font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>{user?.name || 'Elite Member'}</h4>
                            <p className="text-xs text-gray-500">{user?.email || 'member@supreme.com'}</p>
                          </div>
                        </div>
                        <button className={clsx("text-xs font-bold hover:underline", primaryText)}>Edit Profile</button>
                      </div>
                      
                      <button className={clsx("w-full flex items-center justify-between p-4 rounded-2xl border transition-colors", hubSettings.darkMode ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100")}>
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5" />
                          <span className="font-bold">Logout from Hub</span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </section>

                  {/* Theme */}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Visual Theme</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setHubSettings({...hubSettings, theme: 'emerald'})}
                        className={clsx(
                          "p-4 rounded-2xl border-2 transition-all text-left",
                          hubSettings.theme === 'emerald' ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 mb-2 shadow-lg shadow-emerald-500/20" />
                        <span className="text-sm font-bold text-gray-900">Emerald Elite</span>
                        <p className="text-[10px] text-gray-500">Sophisticated emerald & white</p>
                      </button>
                      <button 
                        onClick={() => setHubSettings({...hubSettings, theme: 'gold'})}
                        className={clsx(
                          "p-4 rounded-2xl border-2 transition-all text-left",
                          hubSettings.theme === 'gold' ? "border-yellow-500 bg-yellow-50" : "border-gray-100 bg-gray-50 hover:border-yellow-200"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-yellow-500 mb-2 shadow-lg shadow-yellow-500/20" />
                        <span className="text-sm font-bold text-gray-900">Gold Supreme</span>
                        <p className="text-[10px] text-gray-500">Luxurious gold & cream</p>
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div className={clsx("p-6 md:p-8 border-t bg-gray-50/50 flex items-center justify-end gap-4", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-100")}>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className={clsx("px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95", primaryBg, primaryHoverBg, primaryShadow)}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diamond Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#b8860b_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4 md:pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 mb-8 md:mb-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <div className={clsx("p-2 rounded-xl bg-gradient-to-br shadow-lg", hubSettings.theme === 'emerald' ? "from-emerald-500 to-emerald-700 shadow-emerald-500/20" : "from-yellow-500 to-yellow-700 shadow-yellow-500/20")}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className={clsx("text-3xl md:text-4xl font-display font-bold tracking-tight", hubSettings.darkMode ? "text-white" : "text-[var(--color-supreme-text)]")}>
                Supreme <span className={primaryText}>Celeb Hub</span>
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">The exclusive ecosystem for elite influencers and industry leaders.</p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              to="/hall-of-fame"
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-sm font-bold text-xs md:text-sm",
                hubSettings.theme === 'emerald' 
                  ? "border-emerald-500/20 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100" 
                  : "border-yellow-500/20 bg-yellow-50/50 text-yellow-700 hover:bg-yellow-100"
              )}
            >
              <Trophy className={clsx("w-4 h-4", primaryText)} />
              Hall of Fame
            </Link>
            <div className={clsx("glass-panel px-4 py-2 rounded-full border flex items-center gap-2", hubSettings.theme === 'emerald' ? "border-emerald-500/20 bg-emerald-50/50" : "border-yellow-500/20 bg-yellow-50/50")}>
              <Shield className={clsx("w-4 h-4", primaryText)} />
              <span className={clsx("font-bold text-xs md:text-sm", hubSettings.theme === 'emerald' ? "text-emerald-700" : "text-yellow-700")}>Elite Access Active</span>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className={clsx("p-2.5 md:p-3 rounded-xl bg-white border border-gray-200 text-gray-500 transition-all shadow-sm", `hover:${primaryText}`, `hover:${primaryLightBorder}`)}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'feed', label: 'Hub Feed', icon: Star },
            { id: 'videos', label: 'Elite Videos', icon: Video },
            { id: 'chat', label: 'Elite Chat', icon: MessageSquare },
            { id: 'streams', label: 'Live Streams', icon: Radio },
            { id: 'network', label: 'Elite Network', icon: UserPlus },
            { id: 'powerhouse', label: 'Power House', icon: Zap },
            { id: 'powergames', label: 'Power Games', icon: LayoutGrid },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? `${primaryBg} text-white shadow-lg ${primaryShadow}`
                  : `${hubSettings.darkMode ? "bg-white/5 text-gray-400 border border-white/10" : "bg-white text-gray-500 border border-gray-200"} hover:${primaryLightBorder} hover:${primaryText}`
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'feed' && (
              <>
                {/* Create Post */}
                <div className={clsx("glass-panel p-4 md:p-6 rounded-3xl border transition-all", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm")}>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4">
                    <div className="flex items-center gap-3 sm:block">
                      <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-full border overflow-hidden shrink-0", hubSettings.darkMode ? "bg-white/10 border-white/20" : "bg-gray-100 border-gray-200")}>
                        <img src={user?.avatar || 'https://picsum.photos/seed/user/150'} alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="sm:hidden">
                        <p className={clsx("text-sm font-bold", hubSettings.darkMode ? "text-white" : "text-gray-900")}>{user?.name || 'Anonymous'}</p>
                        <p className={clsx("text-[10px] font-bold uppercase", primaryText)}>Elite Member</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={clsx("text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-lg border-none focus:ring-1 cursor-pointer", hubSettings.darkMode ? "bg-white/10 text-white focus:ring-white/20" : `${primaryLightBg} ${primaryText} focus:ring-emerald-500`)}
                        >
                          {POST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className={clsx("flex items-center gap-1 px-1.5 py-1 rounded-lg border", hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
                          <button 
                            onClick={() => setPostVisibility('hub')}
                            className={clsx("text-[10px] px-2 py-1 rounded-md transition-all font-bold", postVisibility === 'hub' ? `${primaryBg} text-white` : "text-gray-500 hover:bg-white/10")}
                          >Hub</button>
                          <button 
                            onClick={() => setPostVisibility('public')}
                            className={clsx("text-[10px] px-2 py-1 rounded-md transition-all font-bold", postVisibility === 'public' ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-white/10")}
                          >Public</button>
                          <button 
                            onClick={() => setPostVisibility('both')}
                            className={clsx("text-[10px] px-2 py-1 rounded-md transition-all font-bold", postVisibility === 'both' ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-white/10")}
                          >Both</button>
                        </div>
                      </div>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share an elite update with the hub..."
                        style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
                        className={clsx(
                          "w-full p-4 rounded-2xl border-none focus:ring-2 resize-none min-h-[100px] md:min-h-[120px] text-sm md:text-base transition-all",
                          hubSettings.darkMode ? "text-white placeholder-gray-500" : "text-gray-700 placeholder-gray-400",
                          bgColor === 'transparent' ? (hubSettings.darkMode ? "bg-white/5" : "bg-gray-50") : "",
                          transformType === 'glass' && "backdrop-blur-2xl bg-white/30 border border-white/40 shadow-xl",
                          transformType === 'bold' && `font-bold text-lg border-2 ${primaryLightBorder}`,
                          transformType === 'modern' && "font-display tracking-tight bg-transparent shadow-none border-none",
                          `focus:ring-${primaryColor}/20`
                        )}
                      />
                      {selectedGif && (
                        <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-100">
                          <img src={selectedGif} alt="Selected GIF" className="w-full max-h-60 object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => setSelectedGif(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {selectedImage && (
                        <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-100">
                          <img src={selectedImage} alt="Selected Image" className="w-full max-h-60 object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {selectedVideo && (
                        <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-100 bg-black">
                          <video src={selectedVideo} className="w-full max-h-60 object-contain" controls />
                          <button 
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 md:gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <input 
                        type="file" 
                        ref={videoInputRef} 
                        onChange={handleVideoUpload} 
                        accept="video/*" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx("p-2 rounded-lg transition-colors", selectedImage ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500")}
                        title="Add Image"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => videoInputRef.current?.click()}
                        className={clsx("p-2 rounded-lg transition-colors", selectedVideo ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500")}
                        title="Add Video"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setShowGifPicker(!showGifPicker)}
                          className={clsx("p-2 rounded-lg transition-colors", showGifPicker ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500")}
                          title="Add GIF"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                          {showGifPicker && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 w-72"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending GIFs</span>
                                <button onClick={() => setShowGifPicker(false)}><X className="w-4 h-4 text-gray-400" /></button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 no-scrollbar">
                                {TRENDING_GIFS.map((gif, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedGif(gif);
                                      setShowGifPicker(false);
                                    }}
                                    className="aspect-video rounded-lg overflow-hidden border border-gray-100 hover:border-emerald-500 transition-all"
                                  >
                                    <img src={gif} alt="GIF" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="h-6 w-px bg-gray-200 mx-1 md:mx-2" />
                      
                      {/* Color Picker Tool */}
                      <div className="relative">
                        <button 
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className={clsx(
                            "p-2 rounded-lg transition-all flex items-center gap-1", 
                            showColorPicker ? "bg-emerald-100 text-emerald-600 shadow-inner" : "hover:bg-gray-100 text-gray-500"
                          )}
                          title="Background Color"
                        >
                          <Palette className="w-5 h-5" />
                          {bgColor !== 'transparent' && (
                            <div className="w-2 h-2 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: bgColor }} />
                          )}
                        </button>
                        <AnimatePresence>
                          {showColorPicker && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-64"
                            >
                              <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Theme</span>
                                <button onClick={() => setBgColor('transparent')} className="text-[10px] font-bold text-emerald-600 hover:underline">Reset</button>
                              </div>
                              <div className="grid grid-cols-4 gap-2 p-1">
                                {BACKGROUND_COLORS.map((color) => (
                                  <button
                                    key={color.name}
                                    onClick={() => {
                                      setBgColor(color.value);
                                      setShowColorPicker(false);
                                    }}
                                    className={clsx(
                                      "w-full aspect-square rounded-xl border transition-all flex items-center justify-center group relative",
                                      bgColor === color.value ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-100 hover:border-gray-300"
                                    )}
                                    style={{ backgroundColor: color.value === 'transparent' ? '#f9fafb' : color.value }}
                                    title={color.name}
                                  >
                                    {color.value === 'transparent' && <X className="w-4 h-4 text-gray-300" />}
                                    {bgColor === color.value && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-xl">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Transform Tool */}
                      <div className="relative">
                        <button 
                          onClick={() => setShowTransformMenu(!showTransformMenu)}
                          className={clsx(
                            "p-2 rounded-lg transition-all flex items-center gap-1", 
                            showTransformMenu || transformType !== 'normal' ? "bg-emerald-100 text-emerald-600" : "hover:bg-gray-100 text-gray-500"
                          )}
                          title="Transform Style"
                        >
                          <LayoutGrid className="w-5 h-5" />
                          {transformType !== 'normal' && (
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{transformType}</span>
                          )}
                        </button>
                        <AnimatePresence>
                          {showTransformMenu && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-3 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-44"
                            >
                              <div className="flex justify-between items-center mb-2 px-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transform</span>
                                <button onClick={() => setTransformType('normal')} className="text-[10px] font-bold text-emerald-600 hover:underline">Reset</button>
                              </div>
                              <div className="flex flex-col gap-1">
                                {[
                                  { id: 'normal', icon: <Star className="w-3 h-3" />, desc: 'Standard Elite' },
                                  { id: 'glass', icon: <Sparkles className="w-3 h-3" />, desc: 'Glass Morphism' },
                                  { id: 'bold', icon: <Award className="w-3 h-3" />, desc: 'Bold Statement' },
                                  { id: 'modern', icon: <TrendingUp className="w-3 h-3" />, desc: 'Minimal Modern' }
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setTransformType(item.id as any);
                                      setShowTransformMenu(false);
                                    }}
                                    className={clsx(
                                      "px-3 py-2 rounded-xl text-xs font-bold text-left capitalize transition-all flex items-center justify-between group",
                                      transformType === item.id ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-50 text-gray-600"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={clsx(
                                        "p-1 rounded-md transition-colors",
                                        transformType === item.id ? "bg-emerald-100" : "bg-gray-100 group-hover:bg-gray-200"
                                      )}>
                                        {item.icon}
                                      </div>
                                      <div className="flex flex-col">
                                        <span>{item.id}</span>
                                        <span className="text-[9px] opacity-50 font-medium">{item.desc}</span>
                                      </div>
                                    </div>
                                    {transformType === item.id && <Check className="w-3 h-3" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Polish Tool */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button 
                            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                            className={clsx(
                              "flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold transition-all",
                              hubSettings.darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                            )}
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
                                    targetLanguage === lang ? `${primaryText} font-bold bg-emerald-50` : "text-gray-600"
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
                          disabled={isTranslating || !newPostContent.trim()}
                          className={clsx(
                            "p-2 rounded-lg transition-all",
                            isTranslating ? "bg-blue-100 text-blue-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"
                          )}
                          title="Translate Post"
                        >
                          <Globe className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handlePolish}
                          disabled={isPolishing || !newPostContent.trim()}
                          className={clsx(
                            "p-2 rounded-lg transition-all",
                            isPolishing ? "bg-emerald-100 text-emerald-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"
                          )}
                          title="Polish Post with AI"
                        >
                          <Wand2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim()}
                      className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 ml-auto"
                    >
                      {isPolishing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                      <span className="hidden sm:inline">Post</span>
                    </button>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {sortedPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx(
                        "glass-panel rounded-3xl border shadow-sm overflow-hidden transition-all relative hover:shadow-md",
                        hubSettings.darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200",
                        `hover:${primaryLightBorder}`,
                        post.transformType === 'glass' ? "backdrop-blur-2xl bg-white/30 border-white/40 shadow-xl" : "",
                        post.transformType === 'bold' && `border-4 ${primaryLightBorder} shadow-${primaryColor}/10 scale-[1.01] z-10`,
                        post.transformType === 'modern' && (hubSettings.darkMode ? "rounded-none border-x-0 border-y-white/10 shadow-none bg-transparent" : "rounded-none border-x-0 border-y-gray-100 shadow-none bg-transparent"),
                        post.isPinned && `ring-2 ring-${primaryColor}/20`
                      )}
                      style={{ backgroundColor: post.bgColor && post.bgColor !== 'transparent' ? post.bgColor : undefined }}
                    >
                      {post.isPinned && (
                        <div className={clsx("absolute top-0 right-0 p-3 flex items-center gap-1.5 rounded-bl-2xl", hubSettings.darkMode ? "bg-white/10" : "bg-emerald-500/10")}>
                          <Star className={clsx("w-3 h-3 fill-current", primaryText)} />
                          <span className={clsx("text-[10px] font-bold uppercase tracking-widest", primaryText)}>Pinned</span>
                        </div>
                      )}
                      <div className="p-4 md:p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-full border-2 p-0.5 shrink-0", hubSettings.darkMode ? "border-white/20" : `${primaryLightBorder}`)}>
                              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 truncate">
                                <h4 className={clsx("font-bold text-sm md:text-base truncate", hubSettings.darkMode ? "text-white" : "text-gray-900")}>{post.author.name}</h4>
                                {post.author.isVerified && <Shield className={clsx("w-3 h-3 fill-current shrink-0", primaryText)} />}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className={clsx("text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", primaryText)}>{post.author.role}</p>
                                {post.category && (
                                  <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap", hubSettings.darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500")}>{post.category}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  <span className="text-[10px] text-gray-500 font-bold">{formatFollowers(post.author.followers)}</span>
                                </div>
                                <button 
                                  onClick={() => handleFollowUser(post.author.name)}
                                  className={clsx(
                                    "text-[10px] font-bold hover:underline",
                                    followedUsers.has(post.author.name) ? "text-gray-500" : primaryText
                                  )}
                                >
                                  {followedUsers.has(post.author.name) ? 'Following' : 'Follow'}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 shrink-0">
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{post.timestamp}</span>
                            <button 
                              onClick={() => handlePin(post.id)}
                              className={clsx(
                                "p-1 rounded-lg transition-colors",
                                post.isPinned ? `${primaryLightBg} ${primaryText}` : (hubSettings.darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400")
                              )}
                              title={post.isPinned ? "Unpin Post" : "Pin Post"}
                            >
                              <Plus className={clsx("w-5 h-5 transition-transform", post.isPinned && "rotate-45")} />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={() => setOpenPostOptions(openPostOptions === post.id ? null : post.id)}
                                className={clsx("p-1 rounded-lg text-gray-400", hubSettings.darkMode ? "hover:bg-white/10" : "hover:bg-gray-100")}
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                              <AnimatePresence>
                                {openPostOptions === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={clsx("absolute right-0 mt-2 w-32 rounded-xl shadow-xl border z-50 overflow-hidden", hubSettings.darkMode ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-100")}
                                  >
                                    <button 
                                      onClick={() => handleEditPost(post.id, post.content)}
                                      className={clsx("w-full text-left px-4 py-2 text-sm flex items-center gap-2", hubSettings.darkMode ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50")}
                                    >
                                      <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePost(post.id)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {editingPostId === post.id ? (
                          <div className="mb-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className={clsx("w-full p-3 rounded-xl border focus:ring-2 resize-none min-h-[80px] text-sm md:text-base transition-all", hubSettings.darkMode ? "bg-white/10 border-white/20 text-white focus:ring-white/20" : `bg-white border-${primaryColor}/30 focus:ring-${primaryColor}/20 text-gray-700`)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setEditingPostId(null)}
                                className={clsx("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors", hubSettings.darkMode ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100")}
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={saveEditPost}
                                className={clsx("px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors", primaryBg, primaryHoverBg)}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={clsx(
                            "mb-4 leading-relaxed",
                            hubSettings.darkMode ? "text-gray-200" : "text-gray-700",
                            post.transformType === 'bold' ? "text-lg font-bold" : "text-sm md:text-base",
                            post.transformType === 'modern' && "font-display tracking-tight"
                          )}>{post.content}</p>
                        )}

                        {post.image && (
                          <div className={clsx("rounded-2xl overflow-hidden mb-4 border", hubSettings.darkMode ? "border-white/10" : "border-gray-100")}>
                            <img src={post.image} alt="Post content" className="w-full h-auto" />
                          </div>
                        )}

                        {post.video && (
                          <div className={clsx("rounded-2xl overflow-hidden mb-4 border bg-black", hubSettings.darkMode ? "border-white/10" : "border-gray-100")}>
                            <video src={post.video} className="w-full h-auto" controls />
                          </div>
                        )}

                        {post.gif && (
                          <div className={clsx("rounded-2xl overflow-hidden mb-4 border", hubSettings.darkMode ? "border-white/10" : "border-gray-100")}>
                            <img src={post.gif} alt="Post GIF" className="w-full h-auto" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        <div className={clsx("flex items-center justify-between pt-4 border-t", hubSettings.darkMode ? "border-white/10" : "border-gray-100")}>
                          <div className="flex items-center gap-4 md:gap-6">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={clsx(
                                "flex items-center gap-1.5 transition-colors font-bold text-xs md:text-sm",
                                likedPosts.has(post.id) ? "text-red-500" : "text-gray-500 hover:text-red-500"
                              )}
                            >
                              <Heart className={clsx("w-4 h-4 md:w-5 md:h-5", likedPosts.has(post.id) && "fill-red-500")} /> {post.likes}
                            </button>
                            <button 
                              onClick={() => handleDislike(post.id)}
                              className={clsx(
                                "flex items-center gap-1.5 transition-colors font-bold text-xs md:text-sm",
                                dislikedPosts.has(post.id) ? "text-purple-600" : "text-gray-500 hover:text-purple-600"
                              )}
                            >
                              <ThumbsDown className={clsx("w-4 h-4 md:w-5 md:h-5", dislikedPosts.has(post.id) && "fill-purple-600")} /> {post.dislikes}
                            </button>
                            <button 
                              onClick={() => handleComment(post.id)}
                              className={clsx("flex items-center gap-1.5 transition-colors font-bold text-xs md:text-sm", hubSettings.darkMode ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-emerald-600")}
                            >
                              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> {post.comments}
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold",
                              post.visibility === 'hub' ? (hubSettings.darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600") : 
                              post.visibility === 'public' ? (hubSettings.darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600") :
                              (hubSettings.darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600")
                            )}>
                              {post.visibility === 'hub' ? <Lock className="w-3 h-3" /> : 
                               post.visibility === 'public' ? <Globe className="w-3 h-3" /> :
                               <Users className="w-3 h-3" />}
                              <span className="capitalize">{post.visibility}</span>
                            </div>
                            <button 
                              onClick={() => handleShare(post.id)}
                              className={clsx(
                                "flex items-center gap-1.5 transition-colors font-bold text-xs md:text-sm",
                                sharedPosts.has(post.id) ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                              )}
                            >
                              <Share2 className={clsx("w-4 h-4 md:w-5 md:h-5", sharedPosts.has(post.id) && "fill-blue-600")} /> 
                              <span className="hidden sm:inline">Share</span> {post.shares}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'videos' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.slice(0, visibleVideosCount).map((video, i) => (
                  <motion.div 
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel rounded-3xl border border-gray-200 bg-white overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-video relative" onClick={() => { handleVideoView(video.id); setZoomedVideo(video); }}>
                      <img src={`https://picsum.photos/seed/celebvideo${video.id}/800/450`} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setZoomedVideo(video); }}
                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                        {video.duration}
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {video.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{video.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-900 font-bold">{video.creator}</span>
                            <span className="text-[10px] text-gray-500">{formatFollowers(video.creatorFollowers)} followers</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSubscribe(video.creator); }}
                            className={clsx(
                              "ml-2 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider transition-colors",
                              subscribedCreators.has(video.creator) ? "bg-gray-100 text-gray-600" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {subscribedCreators.has(video.creator) ? 'Subscribed' : 'Subscribe'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVideoLike(video.id); }}
                            className="flex items-center gap-1 text-xs text-red-500 font-bold hover:scale-110 transition-transform"
                          >
                            <Heart className="w-3 h-3 fill-red-500" /> {formatFollowers(video.likes)}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVideoDislike(video.id); }}
                            className={clsx(
                              "flex items-center gap-1 text-xs font-bold hover:scale-110 transition-transform",
                              dislikedVideos.has(video.id) ? "text-purple-600" : "text-gray-400 hover:text-purple-600"
                            )}
                          >
                            <ThumbsDown className={clsx("w-3 h-3", dislikedVideos.has(video.id) && "fill-purple-600")} /> {formatFollowers(video.dislikes)}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVideoComment(video.id); }}
                            className="flex items-center gap-1 text-xs text-gray-400 font-bold hover:text-emerald-600 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> {formatFollowers(video.comments)}
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {formatFollowers(video.views)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
                {isLoadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-emerald-500/20 shadow-lg">
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Loading More Supreme Content...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'chat' && (
              <div className="glass-panel h-[600px] rounded-3xl border border-gray-200 bg-white flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/10 shrink-0">
                      <img src={activeChatPartner.avatar} alt={activeChatPartner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Secure Chat with {activeChatPartner.name}</h3>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{activeChatPartner.role}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {(conversations[activeChatPartner.id] || []).map((msg) => (
                    <div 
                      key={msg.id} 
                      className={clsx(
                        "flex items-end gap-3",
                        msg.isMe ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                        <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Message Bubble */}
                      <div className={clsx(
                        "max-w-[70%] group",
                        msg.isMe ? "items-end" : "items-start"
                      )}>
                        <div className={clsx(
                          "p-3 rounded-2xl text-sm shadow-sm",
                          msg.isMe 
                            ? "bg-emerald-600 text-white rounded-br-none" 
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 block px-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-100 bg-white">
                  <div className="relative flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <input 
                      type="text" 
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder={`Message ${activeChatPartner.name}...`}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newChatMessage.trim()}
                      className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'streams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={`stream-${i}`} className="glass-panel rounded-3xl border border-gray-200 bg-white overflow-hidden group cursor-pointer">
                    <div className="aspect-video relative">
                      <img src={`https://picsum.photos/seed/stream${i}/600/400`} alt="Stream" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1">Elite Strategy Session #{i}</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100" />
                        <span className="text-xs text-gray-500">Marcus Sterling</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'network' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {network.slice(0, visibleNetworkCount).map((member) => {
                    const latestStatus = (() => {
                      // 1. Check database statuses first
                      const realStatus = dbStatuses.find(s => s.userId === member.id);
                      if (realStatus) return realStatus;

                      // 2. Fallbacks
                      const fallbackMap: Record<string, { mediaType: 'image' | 'video'; mediaUrl: string; caption: string }> = {
                        n1: {
                          mediaType: 'image',
                          mediaUrl: 'https://picsum.photos/seed/status_n1/400/600',
                          caption: 'Optimizing quantum neural models for the Supreme Network! 🧠💻'
                        },
                        n2: {
                          mediaType: 'video',
                          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                          caption: 'Live from the Silicon Valley Venture Gala 💎✨'
                        },
                        n3: {
                          mediaType: 'image',
                          mediaUrl: 'https://picsum.photos/seed/status_n3/400/600',
                          caption: 'New visual paradigm for the future of creative AI is here. 🎨🌟'
                        },
                        n4: {
                          mediaType: 'video',
                          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                          caption: 'Viral branding masterclass in 5 minutes! 🚀🔥'
                        },
                        n5: {
                          mediaType: 'image',
                          mediaUrl: 'https://picsum.photos/seed/status_n5/400/600',
                          caption: 'Behind the scenes on the movie set in London 🎬✈️'
                        },
                        n6: {
                          mediaType: 'video',
                          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                          caption: 'Spreading the message of sustainable living at the UN 🌍🌸'
                        }
                      };
                      return fallbackMap[member.id] || null;
                    })();

                    return (
                    <motion.div 
                      key={member.id} 
                      tabIndex={0}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={clsx(
                        "celeb-profile-card glass-panel p-4 rounded-2xl border flex items-center justify-between group relative overflow-visible",
                        selectedMemberId === member.id ? "selected" : "border-gray-200 bg-white"
                      )}
                    >
                    {/* Hover Popover showing follower count and rank tier */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-400">Supreme Rank Tier</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Celebrity:</span>
                        <span className="font-bold text-neutral-100">{member.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Followers:</span>
                        <span className="font-black text-emerald-400">{formatFollowers(member.followers)} Followers</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Current Tier:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          member.followers >= 1000000 
                            ? "bg-purple-950 text-purple-300 border border-purple-800" 
                            : member.followers >= 50000 
                            ? "bg-amber-950 text-amber-300 border border-amber-800" 
                            : member.followers >= 15000 
                            ? "bg-blue-950 text-blue-300 border border-blue-800" 
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}>
                          {member.followers >= 1000000 
                            ? "Global Star 🌟" 
                            : member.followers >= 50000 
                            ? "Elite Creator 💎" 
                            : member.followers >= 15000 
                            ? "Master Ambassador 🏆" 
                            : "Rising Affiliate 🚀"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (member.followers / (member.followers >= 1000000 ? 5000000 : member.followers >= 50000 ? 1000000 : member.followers >= 15000 ? 50000 : 15000)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-500 text-right italic">Official Network Rank Badge</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent group-hover:border-emerald-500/20 transition-all relative">
                        <img src={`https://picsum.photos/seed/member${member.id}/150`} alt={member.name} className="w-full h-full object-cover" />
                        <span 
                          id={`status-dot-${member.id}`}
                          className={clsx(
                            "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm transition-all duration-300",
                            getUserStatus(member.id).isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                          )}
                          title={getUserStatus(member.id).isOnline ? "Online" : "Offline"}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-sm group-hover:text-emerald-700 transition-colors">{member.name}</h4>
                          <span title="Verified Celebrity" className="inline-flex items-center">
                            <CheckCircle2 
                              className="w-3.5 h-3.5 text-[var(--color-supreme-gold-light)] fill-[var(--color-supreme-gold)]/20 shrink-0" 
                            />
                          </span>
                          {favorites.includes(member.id) && (
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                          )}
                          {getUserStatus(member.id).isFeatured && (
                            <span title="Featured" className="inline-flex items-center">
                              <Crown 
                                id={`featured-crown-${member.id}`}
                                className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" 
                              />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">{member.role}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-gray-400 font-medium">{formatFollowers(member.followers)} Followers</p>
                            <span className="text-gray-300 text-[10px] select-none">•</span>
                            
                            {/* Hover-expandable Stat Badge */}
                            <div className="relative group/stats inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full transition-all cursor-help">
                              <Activity className="w-2.5 h-2.5 text-emerald-650 animate-pulse" />
                              <span>Metrics</span>
                              
                              {/* Expanded Stat Tooltip Display on Hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl opacity-0 scale-95 translate-y-1 group-hover/stats:opacity-100 group-hover/stats:scale-100 group-hover/stats:translate-y-0 transition-all duration-200 z-50 flex flex-col gap-1.5 pointer-events-none">
                                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-1 flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Engagement Metrics</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-400">Total Followers:</span>
                                  <span className="font-extrabold text-neutral-100">{member.followers.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-400">Engagement Rate:</span>
                                  <span className="font-extrabold text-emerald-400">{member.engagementRate || '5.4%'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-400">Total Posts:</span>
                                  <span className="font-extrabold text-indigo-400">{member.postsCount || '150'}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
                                    style={{ width: member.engagementRate ? `${parseFloat(member.engagementRate) * 6}%` : '32%' }}
                                  />
                                </div>
                              </div>
                            </div>

                            <span className="text-gray-300 text-[10px] select-none">•</span>

                            {/* Fan Rank Badge */}
                            <div className={clsx(
                              "relative group/fanrank inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border transition-all cursor-help",
                              member.isFollowing
                                ? member.followers > 50000
                                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" // Gold
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"  // Silver
                                : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100" // Bronze
                            )}>
                              <Award className={clsx(
                                "w-2.5 h-2.5",
                                member.isFollowing
                                  ? member.followers > 50000
                                    ? "text-amber-500"
                                    : "text-slate-400"
                                  : "text-orange-600"
                              )} />
                              <span>
                                {member.isFollowing
                                  ? member.followers > 50000
                                    ? "Gold Fan"
                                    : "Silver Fan"
                                  : "Bronze Fan"}
                              </span>

                              {/* Tooltip on Hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl opacity-0 scale-95 translate-y-1 group-hover/fanrank:opacity-100 group-hover/fanrank:scale-100 group-hover/fanrank:translate-y-0 transition-all duration-200 z-50 flex flex-col gap-1.5 pointer-events-none text-left font-normal">
                                <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 border-b border-white/10 pb-1 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Fan Rank Standing</span>
                                </div>
                                <div className="text-[10px] text-gray-300 leading-normal">
                                  {member.isFollowing
                                    ? member.followers > 50000
                                      ? "You are a Gold Fan! You have premium access, direct priority messages, and star fan badges."
                                      : "You are a Silver Fan! Interact further by sending quick messages to unlock Gold standing."
                                    : "You are currently a Bronze Fan. Follow this celebrity to instantly elevate your standing to Silver!"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/* Live Status Preview Circle */}
                  {latestStatus && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStatusViewer({
                          ...latestStatus,
                          memberName: member.name,
                          memberAvatar: `https://picsum.photos/seed/member${member.id}/150`
                        });
                      }}
                      className="relative shrink-0 flex items-center justify-center cursor-pointer group/status mr-1 sm:mr-2 z-20"
                      title="View Live Status Story"
                    >
                      {/* Glowing ring animation */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-500 animate-pulse opacity-75 blur-[2px] group-hover/status:blur-[4px] transition-all" />
                      <div className="absolute inset-0.5 rounded-full bg-white dark:bg-slate-900 z-0" />
                      
                      {/* Actual preview circle */}
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/25 z-10 flex items-center justify-center">
                        {latestStatus.mediaType === 'video' ? (
                          <video 
                            src={latestStatus.mediaUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-500" 
                          />
                        ) : (
                          <img 
                            src={latestStatus.mediaUrl} 
                            alt="Status snippet" 
                            className="w-full h-full object-cover scale-110 hover:scale-125 transition-transform duration-500"
                          />
                        )}
                        
                        {/* Tiny 'LIVE' badge indicator */}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-500 border border-white dark:border-slate-900 rounded-full animate-ping" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-500 border border-white dark:border-slate-900 rounded-full" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 relative z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleQuickMessage(member); }}
                      className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-lg hover:shadow-slate-900/10"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                      <span className="hidden sm:inline">Quick Msg</span>
                    </button>

                    <button 
                      disabled={member.isFollowing}
                      onClick={(e) => { e.stopPropagation(); handleFollow(member.id); }}
                      className={clsx(
                        "px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2",
                        member.isFollowing 
                          ? "bg-emerald-600/10 text-emerald-600 cursor-not-allowed border border-emerald-600/20" 
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      )}
                    >
                      {member.isFollowing ? (
                        <>
                          <Check className="w-3 h-3" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>

                    {/* Floating Action Menu on Hover */}
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none group-hover:pointer-events-auto p-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Quick Actions</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Message Link */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickMessage(member);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                          title="Message"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-300" />
                          <span>Message</span>
                        </button>

                        {/* View Stats Link */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStatsMember(member);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider bg-indigo-600 rounded-xl transition-all shadow-md active:scale-95"
                          title="View Stats"
                        >
                          <TrendingUp className="w-3 h-3 text-indigo-300" />
                          <span>Stats</span>
                        </button>

                        {/* Add to Favorites Link */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(member.id, member.name);
                          }}
                          className={clsx(
                            "flex items-center gap-1 px-2.5 py-1.5 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95",
                            favorites.includes(member.id)
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                              : "bg-slate-800 hover:bg-slate-700 text-white"
                          )}
                          title="Add to Favorites"
                        >
                          <Heart className={clsx("w-3 h-3", favorites.includes(member.id) ? "fill-white" : "")} />
                          <span>{favorites.includes(member.id) ? 'Favorited' : 'Favorite'}</span>
                        </button>
                      </div>

                      {/* Follow status quick switch */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(member.id);
                        }}
                        className={clsx(
                          "w-full max-w-[180px] mt-1 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest border transition-all text-center",
                          member.isFollowing
                            ? "bg-transparent text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                            : "bg-white hover:bg-gray-100 text-slate-900 border-transparent"
                        )}
                      >
                        {member.isFollowing ? '✓ Following' : '+ Follow'}
                      </button>
                    </div>

                  </motion.div>
                );})}
                </div>
                {isLoadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-emerald-500/20 shadow-lg">
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Loading More Supreme Network...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'powerhouse' && (
              <div className="space-y-6 md:space-y-8 bg-[#0a0a0a] p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-500/10 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 md:w-5 h-5 text-emerald-400 animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Command Center</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                      Power <span className="text-emerald-500">House</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="glass-panel px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Power Points</span>
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 md:w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-lg md:text-xl font-bold text-white">12,450</span>
                      </div>
                    </div>
                    <div className="glass-panel px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Elite Level</span>
                      <span className="text-lg md:text-xl font-bold text-emerald-400">LVL 42</span>
                    </div>
                  </div>
                </div>

                {/* Power Meter */}
                <div className="glass-panel p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                  <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
                    <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 * (1 - 0.85)} className="text-emerald-500 transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-4xl font-bold text-white">85%</span>
                        <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Power Level</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 md:space-y-6 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg md:text-xl font-bold text-white">Daily Performance</h3>
                        <span className="text-xs md:text-sm text-emerald-400 font-bold">+12% vs Yesterday</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                          { label: 'Focus', val: '92%', color: 'emerald' },
                          { label: 'Energy', val: '78%', color: 'blue' },
                          { label: 'Wealth', val: '88%', color: 'gold' },
                          { label: 'Body', val: '82%', color: 'purple' }
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                            <span className="text-base md:text-lg font-bold text-white">{stat.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Modules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Money Power */}
                  <div 
                    onClick={() => setActivePowerModule('money')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/20">
                        <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                      </div>
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Money Power</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Manage your financial empire and investments.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Wallet Balance</span>
                        <span className="text-xs md:text-sm font-bold text-white">$42,850.00</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Active Investments</span>
                        <span className="text-xs md:text-sm font-bold text-emerald-400">12 Assets</span>
                      </div>
                    </div>
                  </div>

                  {/* Market Power - NEW */}
                  <div 
                    onClick={() => navigate('/market')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-orange-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-orange-500/20">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                      </div>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Market Power</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Manage your products and dealer dashboard.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Store Revenue</span>
                        <span className="text-xs md:text-sm font-bold text-white">$8,240.00</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Active Products</span>
                        <span className="text-xs md:text-sm font-bold text-orange-400">8 Items</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Power */}
                  <div 
                    onClick={() => setActivePowerModule('business')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-blue-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-blue-500/20">
                        <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                      </div>
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Business Power</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Scale your startups and online ventures.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Active Leads</span>
                        <span className="text-xs md:text-sm font-bold text-white">45 New</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Project Status</span>
                        <span className="text-xs md:text-sm font-bold text-blue-400">On Track</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Power */}
                  <div 
                    onClick={() => setActivePowerModule('skill')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-purple-500/20">
                        <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                      </div>
                      <Badge className="w-4 h-4 md:w-5 md:h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Skill Power</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Level up your mind with elite power lessons.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Course Progress</span>
                        <span className="text-xs md:text-sm font-bold text-white">85%</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">New Badges</span>
                        <span className="text-xs md:text-sm font-bold text-purple-400">3 Unlocked</span>
                      </div>
                    </div>
                  </div>

                  {/* Energy Power */}
                  <div 
                    onClick={() => setActivePowerModule('energy')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-red-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-red-500/20">
                        <HeartPulse className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                      </div>
                      <Activity className="w-4 h-4 md:w-5 md:h-5 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Energy Power</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Optimize your body for maximum performance.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Sleep Score</span>
                        <span className="text-xs md:text-sm font-bold text-white">92/100</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Daily Steps</span>
                        <span className="text-xs md:text-sm font-bold text-red-400">12,450</span>
                      </div>
                    </div>
                  </div>

                  {/* Power Rank */}
                  <div 
                    onClick={() => setActivePowerModule('rank')}
                    className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-yellow-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-yellow-500/20">
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                      </div>
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Power Rank</h3>
                    <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Compete with the most powerful users.</p>
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Global Rank</span>
                        <span className="text-xs md:text-sm font-bold text-white">#1,240</span>
                      </div>
                      <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-500">Weekly Gain</span>
                        <span className="text-xs md:text-sm font-bold text-yellow-400">+450 Pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Planner / Command Center */}
                <div className="glass-panel p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /> Command Center
                    </h3>
                    <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                      Optimize Schedule
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priority Missions</span>
                      {[
                        { task: 'Elite Networking Gala', time: '19:00', status: 'Pending' },
                        { task: 'Venture Capital Pitch', time: '14:30', status: 'Ready' },
                        { task: 'Product Launch Review', time: '11:00', status: 'Completed' }
                      ].map((task) => (
                        <div key={task.task} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500" />
                            <div>
                              <p className="text-xs md:text-sm font-bold text-white">{task.task}</p>
                              <p className="text-[10px] md:text-xs text-gray-500">{task.time}</p>
                            </div>
                          </div>
                          <span className={clsx(
                            "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest",
                            task.status === 'Completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-400"
                          )}>{task.status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Power Insights</span>
                      <div className="p-5 md:p-6 rounded-[20px] md:rounded-[24px] bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                          <p className="text-xs md:text-sm font-bold text-white italic leading-relaxed">"Your energy peaks at 10 AM. Schedule your most critical business decisions then for maximum impact."</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5 md:-space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-800 border border-black" />
                            ))}
                          </div>
                          <span className="text-[8px] md:text-[10px] text-gray-500 font-bold">AI Mentor & 12 others agree</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'powergames' && (
              <div className="space-y-6 md:space-y-8 bg-[#0a0a0a] p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-500/10 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LayoutGrid className="w-4 h-4 md:w-5 h-5 text-emerald-400 animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Casino & Strategy</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                      Power <span className="text-emerald-500">Games</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="glass-panel px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Chips</span>
                      <div className="flex items-center gap-2">
                        <Diamond className="w-3 h-3 md:w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-lg md:text-xl font-bold text-white">50,000</span>
                      </div>
                    </div>
                    <div className="glass-panel px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Win Rate</span>
                      <span className="text-lg md:text-xl font-bold text-emerald-400">68%</span>
                    </div>
                  </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Poker */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/20">
                          <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest">Live</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Texas Hold'em</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">High stakes poker against elite members.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Buy-in</span>
                          <span className="text-xs md:text-sm font-bold text-white">1,000 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Active Tables</span>
                          <span className="text-xs md:text-sm font-bold text-emerald-400">12</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('poker')}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Join Table
                      </button>
                    </div>
                  </div>

                  {/* Blackjack */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-blue-500/20">
                          <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Blackjack 21</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Beat the dealer in this classic card game.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">500 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Max Bet</span>
                          <span className="text-xs md:text-sm font-bold text-blue-400">10,000 Chips</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('blackjack')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Play Now
                      </button>
                    </div>
                  </div>

                  {/* Baccarat */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-purple-500/20">
                          <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                        </div>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full uppercase tracking-widest">VIP</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Baccarat</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">The game of choice for high rollers.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">5,000 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Max Bet</span>
                          <span className="text-xs md:text-sm font-bold text-purple-400">100,000 Chips</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('baccarat')}
                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Enter VIP Room
                      </button>
                    </div>
                  </div>

                  {/* Ludo */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-red-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-red-500/20">
                          <Dice5 className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Ludo Power</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Classic board game with a competitive twist.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">250 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Players</span>
                          <span className="text-xs md:text-sm font-bold text-red-400">2-4</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('ludo')}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Start Game
                      </button>
                    </div>
                  </div>

                  {/* Draughts */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/20">
                          <Grid3X3 className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Draughts</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Strategic checkers for the sharp-minded.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">500 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Difficulty</span>
                          <span className="text-xs md:text-sm font-bold text-amber-400">Advanced</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('draughts')}
                        className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Challenge
                      </button>
                    </div>
                  </div>

                  {/* Chess */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-slate-400/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-slate-400" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-500/20">
                          <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Chess Masters</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">The ultimate test of strategy and foresight.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">1,000 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Tournament</span>
                          <span className="text-xs md:text-sm font-bold text-slate-300">Active</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('chess')}
                        className="w-full py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Enter Arena
                      </button>
                    </div>
                  </div>

                  {/* Chest Games */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-yellow-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-yellow-500/20">
                          <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Chest of Fortune</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Unlock mysterious rewards and power-ups.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">2,000 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Rarity</span>
                          <span className="text-xs md:text-sm font-bold text-yellow-400">Legendary</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('chest')}
                        className="w-full py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Open Chest
                      </button>
                    </div>
                  </div>

                  {/* Roller Board */}
                  <div className="glass-panel p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <LayoutGrid className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/20">
                          <Dice5 className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Roller Board</h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">High-stakes dice rolling on the elite board.</p>
                      <div className="space-y-2 md:space-y-3 mb-6">
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Min Bet</span>
                          <span className="text-xs md:text-sm font-bold text-white">1,500 Chips</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-500">Jackpot</span>
                          <span className="text-xs md:text-sm font-bold text-emerald-400">100x</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => startNewGame('roller')}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" /> Roll Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playing Tools & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <div className="glass-panel p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 mb-6">
                      <Settings className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /> Playing Tools
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/20">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Odds Calculator</h4>
                            <p className="text-[10px] text-gray-400">Real-time probability analysis</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors">Launch</button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-500/20">
                            <Activity className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Hand History</h4>
                            <p className="text-[10px] text-gray-400">Review past games and strategies</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors">View</button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-500/20">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">Player Notes</h4>
                            <p className="text-[10px] text-gray-400">Track opponent tendencies</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors">Open</button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border-white/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 mb-6">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" /> Leaderboard
                    </h3>
                    <div className="space-y-4">
                      {[
                        { rank: 1, name: 'Elena Vance', chips: '2.5M', trend: 'up' },
                        { rank: 2, name: 'Marcus Sterling', chips: '1.8M', trend: 'up' },
                        { rank: 3, name: 'Julian Thorne', chips: '1.2M', trend: 'down' },
                        { rank: 4, name: 'Sophia Chen', chips: '950K', trend: 'up' },
                        { rank: 5, name: 'David Miller', chips: '820K', trend: 'down' },
                      ].map((player) => (
                        <div key={player.rank} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className={clsx(
                              "w-6 text-center font-bold",
                              player.rank === 1 ? "text-yellow-400" :
                              player.rank === 2 ? "text-gray-300" :
                              player.rank === 3 ? "text-amber-600" : "text-gray-500"
                            )}>#{player.rank}</span>
                            <span className="font-bold text-white">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-emerald-400">{player.chips}</span>
                            {player.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6 md:space-y-8 bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-200 shadow-xl">
                {/* Wallet Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className={clsx("w-5 h-5", primaryText)} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Supreme Wallet</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">
                      Financial <span className={primaryText}>Command</span>
                    </h2>
                  </div>
                  <div className="p-6 rounded-[24px] bg-gray-900 text-white shadow-2xl min-w-[280px]">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Celeb Hub Balance</span>
                    <span className="text-3xl font-bold">${celebHubBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          setTransferType('to_hub');
                          setShowTransferModal(true);
                        }}
                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <ArrowDownLeft className="w-3 h-3" /> From Central
                      </button>
                      <button 
                        onClick={() => {
                          setTransferType('from_hub');
                          setShowTransferModal(true);
                        }}
                        className="py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" /> To Central
                      </button>
                    </div>
                  </div>
                </div>

                {/* Balance Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Central Wallet</p>
                      <p className="text-xl font-bold text-gray-900">${balance.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Celeb Hub Balance</p>
                      <p className="text-xl font-bold text-emerald-900">${celebHubBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Diamond className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Send', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50', action: () => setShowSendModal(true) },
                    { label: 'Receive', icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => setShowReceiveModal(true) },
                    { label: 'Transfer', icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-50', action: () => {
                      setTransferType('to_hub');
                      setShowTransferModal(true);
                    }},
                    { label: 'Exchange', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', action: () => setActiveTab('exchange') },
                    { label: 'Cards', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50', action: () => setActiveTab('cards') }
                  ].map((action) => (
                    <button 
                      key={action.label} 
                      onClick={action.action}
                      className={clsx("p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all flex flex-col items-center gap-2 group", action.bg)}
                    >
                      <div className={clsx("p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform", action.color)}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Transaction History */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-400" /> Recent Activity
                    </h3>
                    <button className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "p-3 rounded-xl",
                            tx.type === 'deposit' ? "bg-emerald-50 text-emerald-600" : 
                            tx.type === 'withdraw' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {tx.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : 
                             tx.type === 'withdraw' ? <ArrowDownLeft className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{tx.description}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={clsx(
                            "text-sm font-bold",
                            tx.type === 'deposit' ? "text-emerald-600" : "text-gray-900"
                          )}>
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-6 md:space-y-8 bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-200 shadow-xl">
                {/* Expiration Reminder */}
                <AnimatePresence>
                  {subscriptionReminder && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          </div>
                          <p className="text-sm font-medium text-amber-900">{subscriptionReminder}</p>
                        </div>
                        <button 
                          onClick={() => setSubscriptionReminder(null)}
                          className="p-1 hover:bg-amber-100 rounded-full text-amber-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subscription Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className={clsx("w-5 h-5", primaryText)} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Elite Membership</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">
                      Subscription <span className={primaryText}>Management</span>
                    </h2>
                  </div>
                  <div className="p-6 rounded-[24px] bg-emerald-50 border border-emerald-100 min-w-[280px]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Current Plan</span>
                        <span className="text-xl font-bold text-emerald-900">{currentSubscription.tier}</span>
                      </div>
                      <span className="px-2 py-1 bg-emerald-600 text-white text-[8px] font-bold rounded-full uppercase tracking-widest">Active</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-emerald-600/60 uppercase">Expires On</span>
                        <span className="text-emerald-900">{currentSubscription.expiryDate}</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Analysis */}
                <div className="glass-panel p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-gray-50 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" /> Earnings Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Video Subscribers', current: earningsData.videoSubscribers, target: 800, reward: 2000, color: 'bg-blue-500' },
                      { label: 'Followers', current: earningsData.followers, target: 800, reward: 2000, color: 'bg-purple-500' },
                      { label: 'Likes', current: earningsData.likes, target: 3000, reward: 2000, color: 'bg-emerald-500' }
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-900">{stat.current.toLocaleString()} / {stat.target.toLocaleString()}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">+${stat.reward} Pot</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.current / stat.target) * 100}%` }}
                            className={clsx("h-full rounded-full", stat.color)}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Progress: {Math.round((stat.current / stat.target) * 100)}% to next payout</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Tiers */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Upgrade Your Experience</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUBSCRIPTION_TIERS.map((tier) => (
                      <div key={tier.id} className={clsx(
                        "p-6 rounded-[24px] border transition-all flex flex-col justify-between group",
                        currentSubscription.tier.includes(tier.label) 
                          ? "border-emerald-500 bg-emerald-50 shadow-lg" 
                          : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-md"
                      )}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-gray-900">{tier.label}</h4>
                            {tier.savings && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-bold rounded-full uppercase tracking-widest">
                                Save {tier.savings}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                            <span className="text-xs text-gray-500 font-medium">/ {tier.duration}</span>
                          </div>
                          <ul className="space-y-3 mb-8">
                            {['Free Boosted Ads', 'Elite Badge', 'Priority Support', 'Exclusive Events'].map((benefit) => (
                              <li key={benefit} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button 
                          onClick={() => handleSubscribeTier(tier.id)}
                          disabled={currentSubscription.tier.includes(tier.label)}
                          className={clsx(
                            "w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                            currentSubscription.tier.includes(tier.label)
                              ? "bg-emerald-100 text-emerald-700 cursor-default"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          )}
                        >
                          {currentSubscription.tier.includes(tier.label) ? 'Current Plan' : 'Subscribe Now'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="space-y-6 md:space-y-8 bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-200 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                      Virtual <span className={primaryText}>Cards</span>
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your elite spending tools</p>
                  </div>
                  <button 
                    onClick={() => setShowAddCardModal(true)}
                    className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" /> New Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Virtual Cards from State */}
                  {cards.map((card) => (
                    <div key={card.id} className="aspect-[1.586/1] rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-white relative overflow-hidden group shadow-2xl">
                      <div className={clsx("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 opacity-20 group-hover:opacity-40 transition-all duration-700", card.color)} />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Diamond className="w-6 h-6 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Supreme {card.type}</span>
                          </div>
                          <CreditCard className="w-8 h-8 opacity-20" />
                        </div>
                        <div>
                          <p className="text-2xl font-mono tracking-[0.2em] mb-4">**** **** **** {card.number}</p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Card Holder</p>
                              <p className="text-xs font-bold uppercase">{card.holder}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Expires</p>
                              <p className="text-xs font-bold">{card.expiry}</p>
                            </div>
                            <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center border border-white/20">
                              <div className="flex -space-x-2">
                                <div className="w-4 h-4 rounded-full bg-red-500/80" />
                                <div className="w-4 h-4 rounded-full bg-yellow-500/80" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Card Slot */}
                  <div 
                    onClick={() => setShowAddCardModal(true)}
                    className="aspect-[1.586/1] rounded-[32px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-gray-50 hover:border-emerald-500/20 transition-all"
                  >
                    <div className="p-4 rounded-full bg-gray-50 group-hover:bg-emerald-50 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 group-hover:text-emerald-900 transition-colors">Add Virtual Card</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                      <ShieldCheck className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 mb-1">Security First</h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Your virtual cards are protected by end-to-end encryption. You can freeze or delete them instantly from this panel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exchange' && (
              <div className="space-y-6 md:space-y-8 bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-200 shadow-xl relative">
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                    Asset <span className={primaryText}>Exchange</span>
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">Convert between elite currencies instantly</p>
                </div>

                <div className="space-y-4">
                  <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <button className="p-3 bg-white rounded-2xl shadow-xl border border-gray-200 hover:rotate-180 transition-transform duration-500 group">
                        <RefreshCw className="w-6 h-6 text-emerald-600 group-active:scale-95 transition-transform" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* From */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">From</span>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                              <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">USD</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Supreme Balance</p>
                            </div>
                          </div>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="text-4xl font-display font-bold bg-transparent border-none outline-none w-full tabular-nums text-gray-900"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Available</p>
                          <p className="text-lg font-bold text-gray-900">${celebHubBalance.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="h-px bg-gray-200 w-full" />

                      {/* To */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">To</span>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                              <Diamond className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">ELT</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Elite Points</p>
                            </div>
                          </div>
                          <p className="text-4xl font-display font-bold tabular-nums text-emerald-600">0.00</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Exchange Rate</p>
                          <p className="text-lg font-bold text-purple-600">1 USD = 120 ELT</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-bold text-lg hover:bg-gray-800 transition-all shadow-2xl active:scale-[0.98]">
                    Swap Assets
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Market Volatility', value: 'Low', color: 'text-emerald-600' },
                    { label: 'Network Fee', value: '$0.00', color: 'text-blue-600' },
                    { label: 'Processing', value: 'Instant', color: 'text-purple-600' }
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={clsx("text-xs font-bold", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Quick Access */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-50/50 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" /> Quick Access
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveTab('powerhouse')}
                  className="p-3 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Power House</span>
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="p-3 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Elite Chat</span>
                </button>
              </div>
            </div>

            {/* Elite Stats */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
              <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <Diamond className="w-5 h-5 text-emerald-600" /> Hub Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-emerald-100">
                  <span className="text-sm text-gray-500 font-medium">Hub Rank</span>
                  <span className="text-emerald-700 font-bold">#42</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-emerald-100">
                  <span className="text-sm text-gray-500 font-medium">Network Limit</span>
                  <span className="text-emerald-700 font-bold">7,000</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-white border border-emerald-100">
                  <span className="text-sm text-gray-500 font-medium">Elite Points</span>
                  <span className="text-emerald-700 font-bold">12,450</span>
                </div>
              </div>
            </div>

            {/* Trending in Hub */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Trending
              </h3>
              <div className="space-y-4">
                {['#EliteNetworking', '#SupremeInsights', '#FutureTech', '#GlobalImpact'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-600 transition-colors">{tag}</span>
                    <span className="text-xs text-gray-400">1.2k posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Elite Awards */}
            <div className="glass-panel p-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Awards
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:border-emerald-500/30 transition-all cursor-help" title={`Award ${i}`}>
                    <Star className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed Video Modal */}
      <AnimatePresence>
        {zoomedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setZoomedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-full bg-black rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setZoomedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center group/player">
                <video 
                  ref={videoRef}
                  src={zoomedVideo.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'} 
                  className="w-full h-full object-contain"
                  controls={false}
                  autoPlay
                  onPlay={() => {
                    setIsPlaying(true);
                    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
                  }}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
                
                {/* Custom Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity p-6">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mb-4 group/progress">
                    <span className="text-[10px] font-bold text-white/80 tabular-nums">{formatTime(currentTime)}</span>
                    <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                      <input 
                        type="range" 
                        min={0} 
                        max={duration || 100} 
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-100" 
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/80 tabular-nums">{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={handleTogglePlay}
                        className="text-white hover:text-emerald-400 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                      </button>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2 group/volume">
                        <button onClick={handleToggleMute} className="text-white/80 hover:text-white transition-colors">
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden flex items-center">
                          <input 
                            type="range" 
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                      
                      {/* Playback Speed Selector */}
                      <div className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
                        {[0.5, 1, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={clsx(
                              "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                              playbackRate === rate ? "bg-emerald-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/5 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                        title="Toggle Fullscreen"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 shrink-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{zoomedVideo.title}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{zoomedVideo.creator}</span>
                          <span className="text-xs text-gray-500">{formatFollowers(zoomedVideo.creatorFollowers)} followers</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSubscribe(zoomedVideo.creator)}
                        className={clsx(
                          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                          subscribedCreators.has(zoomedVideo.creator) ? "bg-gray-100 text-gray-600" : "bg-emerald-600 text-white hover:bg-emerald-700"
                        )}
                      >
                        {subscribedCreators.has(zoomedVideo.creator) ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => handleVideoLike(zoomedVideo.id)}
                      className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-6 h-6" />
                      <span className="text-xs font-bold">{formatFollowers(zoomedVideo.likes)}</span>
                    </button>
                    <div className="w-px h-8 bg-gray-200" />
                    <button 
                      onClick={() => handleVideoDislike(zoomedVideo.id)}
                      className={clsx(
                        "flex flex-col items-center gap-1 transition-colors",
                        dislikedVideos.has(zoomedVideo.id) ? "text-purple-600" : "text-gray-600 hover:text-purple-600"
                      )}
                    >
                      <ThumbsDown className={clsx("w-6 h-6", dislikedVideos.has(zoomedVideo.id) && "fill-purple-600")} />
                      <span className="text-xs font-bold">{formatFollowers(zoomedVideo.dislikes)}</span>
                    </button>
                    <div className="w-px h-8 bg-gray-200" />
                    <button 
                      onClick={() => handleVideoComment(zoomedVideo.id)}
                      className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-xs font-bold">{formatFollowers(zoomedVideo.comments)}</span>
                    </button>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex flex-col items-center gap-1 text-gray-500">
                      <Eye className="w-6 h-6" />
                      <span className="text-xs font-bold">{formatFollowers(zoomedVideo.views)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Power Module Modals */}
        {activePowerModule === 'money' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActivePowerModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Money Power</h2>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Financial Command</p>
                  </div>
                </div>
                <button onClick={() => setActivePowerModule(null)} className="p-2 hover:bg-emerald-100 rounded-full text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-gray-900 text-white shadow-xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Total Net Worth</span>
                    <span className="text-3xl font-bold">$12,450,850.00</span>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">+12.4% this month</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Liquid Capital</span>
                    <span className="text-2xl font-bold text-gray-900">$2,850,000.00</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Passive Income</span>
                    <span className="text-2xl font-bold text-emerald-600">+$42,250.00/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" /> Portfolio Breakdown
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Real Estate', value: '45%', amount: '$5.6M', color: 'bg-emerald-500' },
                        { label: 'Equities', value: '30%', amount: '$3.7M', color: 'bg-blue-500' },
                        { label: 'Crypto Assets', value: '15%', amount: '$1.8M', color: 'bg-purple-500' },
                        { label: 'Luxury Goods', value: '10%', amount: '$1.2M', color: 'bg-amber-500' },
                      ].map((asset) => (
                        <div key={asset.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-600">{asset.label}</span>
                            <span className="text-gray-900">{asset.amount} ({asset.value})</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full", asset.color)} style={{ width: asset.value }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" /> Market Performance
                    </h3>
                    <div className="h-48 w-full bg-gray-50 rounded-2xl border border-gray-100 flex items-end justify-between p-4 gap-1">
                      {[40, 60, 45, 70, 55, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05 }}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 transition-colors rounded-t-sm"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Jan</span>
                      <span>Jun</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Recent High-Value Movements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { desc: 'Commercial Property Acquisition', amount: '-$1.2M', status: 'Completed', date: '2 days ago' },
                      { desc: 'Tech IPO Dividend', amount: '+$450K', status: 'Received', date: '5 days ago' },
                    ].map((tx) => (
                      <div key={tx.desc} className="p-4 rounded-2xl border border-gray-100 hover:border-emerald-500/30 transition-all bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold text-gray-900">{tx.desc}</p>
                          <span className={clsx("text-xs font-bold", tx.amount.startsWith('+') ? "text-emerald-600" : "text-red-600")}>{tx.amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400">{tx.date}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                  Manage Portfolio
                </button>
                <button className="px-6 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                  Export Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activePowerModule === 'business' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActivePowerModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Power</h2>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Venture Command</p>
                  </div>
                </div>
                <button onClick={() => setActivePowerModule(null)} className="p-2 hover:bg-blue-100 rounded-full text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-2xl font-bold text-gray-900 block mb-1">45</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Leads</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-2xl font-bold text-gray-900 block mb-1">12</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Projects</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <span className="text-2xl font-bold text-gray-900 block mb-1">8</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partners</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-600 text-white text-center">
                    <span className="text-2xl font-bold block mb-1">92%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Success Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" /> Strategic Insights
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-widest">Market Opportunity</h4>
                        <p className="text-sm text-blue-800">Emerging tech sector in SE Asia shows 25% growth potential for your Startup Alpha venture.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <h4 className="text-xs font-bold text-amber-900 mb-1 uppercase tracking-widest">Risk Alert</h4>
                        <p className="text-sm text-amber-800">Real Estate portfolio exposure in urban centers is high. Consider diversifying into suburban logistics.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" /> Team Performance
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Engineering', efficiency: 95, color: 'bg-blue-500' },
                        { name: 'Marketing', efficiency: 82, color: 'bg-emerald-500' },
                        { name: 'Operations', efficiency: 88, color: 'bg-purple-500' },
                      ].map((team) => (
                        <div key={team.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-600">{team.name}</span>
                            <span className="text-gray-900">{team.efficiency}% Efficiency</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full", team.color)} style={{ width: `${team.efficiency}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Active Ventures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Tech Startup Alpha', progress: 75, status: 'Scaling', valuation: '$12M' },
                      { name: 'Real Estate Portfolio', progress: 40, status: 'Acquiring', valuation: '$45M' },
                      { name: 'Media Agency', progress: 90, status: 'Profitable', valuation: '$8M' }
                    ].map((venture) => (
                      <div key={venture.name} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-500/30 transition-all bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900 text-sm">{venture.name}</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{venture.status}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{venture.valuation}</span>
                        </div>
                        <div className="mt-4">
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${venture.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                  Open Business Suite
                </button>
                <button className="px-6 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                  New Venture
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activePowerModule === 'skill' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActivePowerModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Skill Power</h2>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-widest">Knowledge Base</p>
                  </div>
                </div>
                <button onClick={() => setActivePowerModule(null)} className="p-2 hover:bg-purple-100 rounded-full text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                      <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 * (1 - 0.85)} className="text-purple-500" />
                    </svg>
                    <span className="absolute text-lg font-bold text-gray-900">85%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Mastery Level</h3>
                    <p className="text-sm text-gray-500">You are in the top 5% of learners this week.</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Current Courses</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Advanced Negotiation Tactics', progress: 60, icon: <Users className="w-4 h-4 text-purple-500" /> },
                      { title: 'Venture Capital Fundamentals', progress: 30, icon: <Briefcase className="w-4 h-4 text-purple-500" /> },
                      { title: 'Public Speaking Mastery', progress: 90, icon: <Megaphone className="w-4 h-4 text-purple-500" /> }
                    ].map((course) => (
                      <div key={course.title} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="p-2 rounded-lg bg-purple-50">{course.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-gray-900">{course.title}</span>
                            <span className="text-xs font-bold text-purple-600">{course.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                  Browse Academy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activePowerModule === 'energy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActivePowerModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-100">
                    <HeartPulse className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Energy Power</h2>
                    <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Bio Optimization</p>
                  </div>
                </div>
                <button onClick={() => setActivePowerModule(null)} className="p-2 hover:bg-red-100 rounded-full text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Sleep', val: '7h 45m', score: '92/100', icon: <Star className="w-4 h-4 text-indigo-500" /> },
                    { label: 'Steps', val: '12,450', score: 'Goal Met', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
                    { label: 'HRV', val: '65ms', score: 'Optimal', icon: <Heart className="w-4 h-4 text-red-500" /> },
                    { label: 'Calories', val: '2,400', score: 'On Track', icon: <Zap className="w-4 h-4 text-orange-500" /> }
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                      <div className="mb-2">{stat.icon}</div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</span>
                      <span className="text-lg font-bold text-gray-900">{stat.val}</span>
                      <span className="text-[10px] font-medium text-gray-400 mt-1">{stat.score}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Daily Recommendation
                  </h3>
                  <p className="text-sm text-red-800">Your recovery is high today. It's an optimal day for a high-intensity workout or demanding cognitive tasks.</p>
                </div>
                <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                  Log Workout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activePowerModule === 'rank' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActivePowerModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-100">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Power Rank</h2>
                    <p className="text-xs text-yellow-600 font-bold uppercase tracking-widest">Global Leaderboard</p>
                  </div>
                </div>
                <button onClick={() => setActivePowerModule(null)} className="p-2 hover:bg-yellow-100 rounded-full text-gray-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900 text-white shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-yellow-400 overflow-hidden">
                      <img src={user?.avatar || 'https://picsum.photos/seed/user/150'} alt="You" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-1">Your Rank</span>
                      <span className="text-2xl font-bold">#1,240</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Power Points</span>
                    <span className="text-xl font-bold text-yellow-400">12,450</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Top 5 Elite</h3>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Elena Vance', points: '95,200', trend: 'up' },
                      { rank: 2, name: 'Marcus Sterling', points: '88,450', trend: 'same' },
                      { rank: 3, name: 'Julian Thorne', points: '82,100', trend: 'up' },
                      { rank: 4, name: 'Sophia Chen', points: '79,800', trend: 'down' },
                      { rank: 5, name: 'David Miller', points: '75,300', trend: 'up' }
                    ].map((leader) => (
                      <div key={leader.rank} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className={clsx(
                            "w-6 text-center font-bold",
                            leader.rank === 1 ? "text-yellow-500" :
                            leader.rank === 2 ? "text-gray-400" :
                            leader.rank === 3 ? "text-amber-700" : "text-gray-900"
                          )}>#{leader.rank}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/leader${leader.rank}/150`} alt={leader.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-gray-900">{leader.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-600">{leader.points}</span>
                          {leader.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                          {leader.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                          {leader.trend === 'same' && <div className="w-4 h-1 bg-gray-300 rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-3 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                  View Full Leaderboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="w-full max-w-5xl aspect-video bg-[#074d28] rounded-[40px] border-[12px] border-[#3d2b1f] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
            >
              {/* Table Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              {/* Header */}
              <div className="relative z-10 p-6 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Crown className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">{activeGame} Table</h2>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Elite Stakes • No Limit</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 uppercase font-bold block">Current Pot</span>
                    <span className="text-2xl font-bold text-emerald-400">${gameState.pot.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Game Area */}
              <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                {(activeGame === 'poker' || activeGame === 'blackjack' || activeGame === 'baccarat') ? (
                  <>
                    {/* Dealer Area */}
                    <div className="absolute top-12 flex flex-col items-center gap-4">
                      <div className="flex gap-4">
                        {gameState.dealerHand.map((card, i) => (
                          <motion.div
                            key={card.suit + card.rank + i}
                            initial={{ y: -200, opacity: 0, rotate: -180 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            className={clsx(
                              "w-20 h-28 md:w-24 md:h-32 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center relative border-2 border-gray-200",
                              (card.suit === '♥' || card.suit === '♦') ? "text-red-600" : "text-gray-900"
                            )}
                          >
                            <span className="absolute top-2 left-2 text-sm font-bold">{card.rank}</span>
                            <span className="text-4xl">{card.suit}</span>
                            <span className="absolute bottom-2 right-2 text-sm font-bold rotate-180">{card.rank}</span>
                          </motion.div>
                        ))}
                      </div>
                      <span className="px-4 py-1 bg-black/40 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest border border-white/10">Dealer</span>
                    </div>

                    {/* Player Area */}
                    <div className="absolute bottom-12 flex flex-col items-center gap-4">
                      <span className="px-4 py-1 bg-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30">Your Hand</span>
                      <div className="flex gap-4">
                        {gameState.playerHand.map((card, i) => (
                          <motion.div
                            key={card.suit + card.rank + i}
                            initial={{ y: 200, opacity: 0, rotate: 180 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            whileHover={{ y: -10 }}
                            className={clsx(
                              "w-20 h-28 md:w-24 md:h-32 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center relative border-2 border-gray-200 cursor-pointer",
                              (card.suit === '♥' || card.suit === '♦') ? "text-red-600" : "text-gray-900"
                            )}
                          >
                            <span className="absolute top-2 left-2 text-sm font-bold">{card.rank}</span>
                            <span className="text-4xl">{card.suit}</span>
                            <span className="absolute bottom-2 right-2 text-sm font-bold rotate-180">{card.rank}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative flex flex-col items-center gap-8">
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-white/5 border-4 border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className={clsx("border border-white/10", (Math.floor(i / 8) + i) % 2 === 0 ? "bg-white/10" : "bg-transparent")} />
                        ))}
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        {activeGame === 'ludo' && <Dice5 className="w-16 h-16 text-red-400 animate-bounce" />}
                        {activeGame === 'draughts' && <Grid3X3 className="w-16 h-16 text-amber-400" />}
                        {activeGame === 'chess' && <ShieldCheck className="w-16 h-16 text-slate-300" />}
                        {activeGame === 'chest' && <ShoppingBag className="w-16 h-16 text-yellow-400 animate-pulse" />}
                        {activeGame === 'roller' && <Dice5 className="w-16 h-16 text-emerald-400 animate-spin" />}
                        
                        {gameState.diceValue && gameState.diceValue > 0 ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5 }}
                            className="bg-white text-gray-900 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-2xl border-2 border-emerald-500"
                          >
                            {gameState.diceValue}
                          </motion.div>
                        ) : (
                          <span className="text-white font-bold uppercase tracking-widest text-sm">
                            {gameState.status === 'dealing' ? 'Preparing Board...' : 'Your Turn'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold mb-1">Opponent</span>
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold mb-1">You</span>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Center Info */}
                <AnimatePresence>
                  {gameState.resultMessage && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-3xl shadow-2xl text-center"
                    >
                      <h3 className="text-3xl font-bold text-white mb-2">{gameState.resultMessage}</h3>
                      <p className="text-emerald-400 font-bold">+$10,000 Chips</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chips Decoration */}
                <div className="absolute left-12 bottom-12 space-y-2 hidden md:block">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={`chip-red-${i}`} className="w-12 h-12 rounded-full bg-red-600 border-4 border-dashed border-white/40 shadow-lg flex items-center justify-center text-[10px] font-bold text-white">100</div>
                    ))}
                  </div>
                  <div className="flex -space-x-4 ml-4">
                    {[1, 2, 3].map(i => (
                      <div key={`chip-blue-${i}`} className="w-12 h-12 rounded-full bg-blue-600 border-4 border-dashed border-white/40 shadow-lg flex items-center justify-center text-[10px] font-bold text-white">500</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="relative z-10 p-8 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Your Bet</span>
                    <span className="text-xl font-bold text-white">${gameState.bet.toLocaleString()}</span>
                  </div>
                  <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Total Chips</span>
                    <span className="text-xl font-bold text-emerald-400">${gameState.chips.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {gameState.status === 'playing' ? (
                    <>
                      <button 
                        onClick={() => handleGameAction('fold')}
                        className="px-8 py-4 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-bold transition-all border border-red-500/30 active:scale-95"
                      >
                        Fold
                      </button>
                      {(activeGame === 'poker' || activeGame === 'blackjack' || activeGame === 'baccarat') ? (
                        <>
                          <button 
                            onClick={() => handleGameAction('hit')}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/20 active:scale-95"
                          >
                            Hit
                          </button>
                          <button 
                            onClick={() => handleGameAction('stand')}
                            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                          >
                            Stand
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleGameAction('move')}
                          className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                          {activeGame === 'chest' ? 'Open Chest' : 'Make Move'}
                        </button>
                      )}
                    </>
                  ) : gameState.status === 'result' ? (
                    <button 
                      onClick={() => startNewGame(activeGame!)}
                      className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      Play Again
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-white/40 font-bold animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin" /> {activeGame === 'chest' ? 'Unlocking...' : 'Starting Game...'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Send Modal */}
        <AnimatePresence>
          {showSendModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowSendModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Send Funds</h2>
                  </div>
                  <button onClick={() => setShowSendModal(false)} className="p-2 hover:bg-blue-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Search Recipient</label>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Search by username..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    
                    {/* Recipient List */}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {isLoadingRecipients ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      ) : recipientList.length > 0 ? (
                        recipientList.filter(r => r.displayName?.toLowerCase().includes(recipientAddress.toLowerCase()) || r.username?.toLowerCase().includes(recipientAddress.toLowerCase())).map((recipient) => (
                          <button
                            key={recipient.id}
                            onClick={() => setRecipientAddress(recipient.displayName || recipient.username)}
                            className={clsx(
                              "w-full p-2 rounded-xl flex items-center gap-3 transition-all",
                              recipientAddress === (recipient.displayName || recipient.username) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                            )}
                          >
                            <img src={recipient.avatar || `https://picsum.photos/seed/${recipient.id}/100`} className="w-8 h-8 rounded-full" alt="" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-900">{recipient.displayName || recipient.username}</p>
                              <p className="text-[10px] text-gray-400">@{recipient.username || 'user'}</p>
                            </div>
                            {recipientAddress === (recipient.displayName || recipient.username) && (
                              <Check className="w-4 h-4 text-blue-600 ml-auto" />
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="text-center py-8 text-xs text-gray-400">No users found</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
                      <span className="text-[10px] font-bold text-gray-400">Available: ${celebHubBalance.toLocaleString()}</span>
                    </div>
                    <input 
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || parseFloat(transactionAmount) > celebHubBalance || !recipientAddress}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    Send Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Receive Modal */}
        <AnimatePresence>
          {showReceiveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowReceiveModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100">
                      <Download className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Receive Funds</h2>
                  </div>
                  <button onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-emerald-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6 text-center">
                  <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
                    <div className="w-48 h-48 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative group">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user?.uid || 'supreme-wallet'}`} alt="QR Code" className="w-40 h-40" />
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Wallet Address</p>
                      <p className="text-sm font-mono font-bold text-gray-900 break-all">{user?.uid || 'UNKNOWN_ADDRESS'}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(user?.uid || '');
                        toast.success('Address copied to clipboard');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" /> Copy Address
                    </button>
                    <button 
                      onClick={handleReceive}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Fast Receive
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deposit Modal */}
        <AnimatePresence>
          {showDepositModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowDepositModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100">
                      <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Deposit Funds</h2>
                  </div>
                  <button onClick={() => setShowDepositModal(false)} className="p-2 hover:bg-emerald-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
                      <span className="text-[10px] font-bold text-gray-400">Available: ${celebHubBalance.toLocaleString()}</span>
                    </div>
                    <input 
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Note (Optional)</label>
                    <input 
                      type="text"
                      value={transactionNote}
                      onChange={(e) => setTransactionNote(e.target.value)}
                      placeholder="e.g. Bank Transfer"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Funds will be added to your Supreme Wallet immediately after confirmation. Minimum deposit is $10.00.
                    </p>
                  </div>
                  <button 
                    onClick={handleDeposit}
                    disabled={!transactionAmount || parseFloat(transactionAmount) <= 0}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdraw Modal */}
        <AnimatePresence>
          {showWithdrawModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowWithdrawModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-100">
                      <ArrowDownLeft className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-red-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
                      <span className="text-[10px] font-bold text-gray-400">Available: ${celebHubBalance.toLocaleString()}</span>
                    </div>
                    <input 
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Withdrawal Method</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none">
                      <option>Bank Account (**** 4242)</option>
                      <option>PayPal (user@example.com)</option>
                      <option>Crypto Wallet (BTC)</option>
                    </select>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Withdrawals may take 1-3 business days to process depending on your chosen method.
                    </p>
                  </div>
                  <button 
                    onClick={handleWithdraw}
                    disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || parseFloat(transactionAmount) > celebHubBalance}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transfer Modal */}
        <AnimatePresence>
          {showAddCardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowAddCardModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100">
                      <CreditCard className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Issue Virtual Card</h2>
                  </div>
                  <button onClick={() => setShowAddCardModal(false)} className="p-2 hover:bg-amber-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Card Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Diamond', 'Elite', 'Platinum'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewCardData({ ...newCardData, type })}
                          className={clsx(
                            "py-2 px-3 rounded-xl border-2 text-[10px] font-bold transition-all",
                            newCardData.type === type 
                              ? "border-amber-500 bg-amber-50 text-amber-600 shadow-sm" 
                              : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Card Holder</label>
                    <input 
                      type="text"
                      value={newCardData.holder}
                      onChange={(e) => setNewCardData({ ...newCardData, holder: e.target.value })}
                      placeholder="Enter holder name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Visual Style</label>
                    <div className="flex gap-3">
                      {[
                        { name: 'Emerald', bg: 'bg-emerald-500' },
                        { name: 'Gold', bg: 'bg-amber-500' },
                        { name: 'Purple', bg: 'bg-purple-500' },
                        { name: 'Sapphire', bg: 'bg-blue-500' },
                        { name: 'Slate', bg: 'bg-gray-700' }
                      ].map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setNewCardData({ ...newCardData, color: c.bg })}
                          className={clsx(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            newCardData.color === c.bg ? "border-gray-900 scale-110" : "border-transparent",
                            c.bg
                          )}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                      Standard issuance fee: <span className="font-bold underline">$50.00</span>. Virtual cards are ready for immediate use across the Supreme network.
                    </p>
                  </div>

                  <button 
                    onClick={handleAddCard}
                    disabled={celebHubBalance < 50}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    Issue Card ($50)
                  </button>
                  {celebHubBalance < 50 && (
                    <p className="text-center text-[10px] text-red-500 font-bold animate-pulse">Insufficient Hub Balance</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {showTransferModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowTransferModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100">
                      <RefreshCw className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Wallet Transfer</h2>
                  </div>
                  <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-purple-100 rounded-full text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">From</p>
                      <p className="text-sm font-bold text-gray-900">{transferType === 'to_hub' ? 'Central' : 'Celeb Hub'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">To</p>
                      <p className="text-sm font-bold text-gray-900">{transferType === 'to_hub' ? 'Celeb Hub' : 'Central'}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount ($)</label>
                      <span className="text-[10px] font-bold text-gray-400">
                        Max: ${transferType === 'to_hub' ? balance.toLocaleString() : celebHubBalance.toLocaleString()}
                      </span>
                    </div>
                    <input 
                      type="number"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  
                  <button 
                    onClick={handleTransfer}
                    disabled={!transactionAmount || parseFloat(transactionAmount) <= 0 || parseFloat(transactionAmount) > (transferType === 'to_hub' ? balance : celebHubBalance)}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
                  >
                    Complete Transfer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Celebrity Stats Modal */}
          {selectedStatsMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
              onClick={() => setSelectedStatsMember(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header card with background ambient glow */}
                <div className="relative p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/45 via-slate-900 to-indigo-950/45">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md">
                      <img 
                        src={`https://picsum.photos/seed/member${selectedStatsMember.id}/150`} 
                        alt={selectedStatsMember.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-1.5 text-neutral-100">
                        {selectedStatsMember.name}
                        {favorites.includes(selectedStatsMember.id) && (
                          <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        )}
                      </h3>
                      <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider">{selectedStatsMember.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedStatsMember(null)} 
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Grid of Key Performance Indicators */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Followers</span>
                      <span className="text-base font-black text-emerald-400">{selectedStatsMember.followers.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Engagement Rate</span>
                      <span className="text-base font-black text-amber-400">{selectedStatsMember.engagementRate || '5.4%'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Posts</span>
                      <span className="text-base font-black text-blue-400">{selectedStatsMember.postsCount || 150}</span>
                    </div>
                  </div>

                  {/* Monthly Impressions / Outreach Performance */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Outreach Statistics</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-black px-2 py-0.5 bg-emerald-950/50 rounded-full uppercase tracking-wider">
                        Verified Performance
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Weekly Impressions:</span>
                        <span className="font-bold text-neutral-200">
                          {((selectedStatsMember.followers * 1.5) / 4).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Profile Clickthrough:</span>
                        <span className="font-bold text-neutral-200">12.4%</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Est. Active Campaigns:</span>
                        <span className="font-bold text-neutral-200">3 Campaigns Running</span>
                      </div>
                    </div>
                  </div>

                  {/* High Fidelity Simulated Graph of Engagement */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Engagement Growth (Last 6 Months)</span>
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 h-32 flex items-end justify-between gap-3 pt-6">
                      {[35, 45, 60, 50, 75, 90].map((val, idx) => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[8px] font-mono font-bold text-emerald-400">{val}%</span>
                            <div 
                              className="w-full bg-gradient-to-t from-emerald-600/30 to-emerald-500 rounded-t h-full max-h-[80%] transition-all duration-1000"
                              style={{ height: `${val}%` }}
                            />
                            <span className="text-[8px] text-gray-500 font-bold uppercase">{months[idx]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions footer inside Modal */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedStatsMember(null);
                        handleQuickMessage(selectedStatsMember);
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-200" />
                      <span>Inquire & Message</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleFavorite(selectedStatsMember.id, selectedStatsMember.name);
                      }}
                      className={clsx(
                        "px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2",
                        favorites.includes(selectedStatsMember.id)
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-850 hover:bg-slate-800 text-gray-300"
                      )}
                    >
                      <Heart className={clsx("w-4 h-4", favorites.includes(selectedStatsMember.id) ? "fill-white text-white" : "text-gray-400")} />
                      <span>{favorites.includes(selectedStatsMember.id) ? 'Unfavorite' : 'Favorite'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Immersive Celeb Live Status Story Viewer Modal */}
          {activeStatusViewer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 backdrop-blur-lg p-0 sm:p-4"
              onClick={() => setActiveStatusViewer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md h-full sm:h-[80vh] sm:max-h-[750px] bg-slate-950 sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Visual Segment Progress bar */}
                <div className="absolute top-3 inset-x-4 z-50 flex gap-1">
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div 
                      key={activeStatusViewer.id}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      onAnimationComplete={() => setActiveStatusViewer(null)}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    />
                  </div>
                </div>

                {/* Header (Avatar & Name) */}
                <div className="absolute top-6 inset-x-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activeStatusViewer.memberAvatar} 
                      alt={activeStatusViewer.memberName} 
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1">
                        {activeStatusViewer.memberName}
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-supreme-gold-light)]" />
                      </h4>
                      <span className="text-[10px] text-gray-300 font-medium">LIVE STATUS</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveStatusViewer(null)}
                    className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Media Body */}
                <div className="flex-1 w-full h-full flex items-center justify-center bg-black relative">
                  {activeStatusViewer.mediaType === 'video' ? (
                    <video 
                      src={activeStatusViewer.mediaUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={activeStatusViewer.mediaUrl} 
                      alt="Story Media" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Bottom Caption Overlay */}
                <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-12 text-center space-y-4">
                  <p className="text-sm text-neutral-100 font-medium leading-relaxed italic px-2">
                    "{activeStatusViewer.caption}"
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        const targetMember = network.find(n => n.id === activeStatusViewer.userId) || {
                          id: activeStatusViewer.userId || 'n1',
                          name: activeStatusViewer.memberName,
                          role: 'Celebrity',
                          followers: 50000,
                          isFollowing: false,
                        } as any as NetworkMember;
                        setActiveStatusViewer(null);
                        handleQuickMessage(targetMember);
                      }}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Reply to Status</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
