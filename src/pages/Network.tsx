import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageCircle, Heart, Share2, MoreHorizontal, Crown, 
  CheckCircle, Image as ImageIcon, Video, Sparkles, Send, 
  Loader2, Wand2, Palette, X, ThumbsDown, UserPlus, Pin, 
  Trash2, Edit2, Smile, Play, Bell, Check, Search, Plus, 
  Globe, Shield, LayoutGrid, Filter, UserMinus, UserCheck, Clock,
  Twitter, Linkedin, Facebook, Link, Film, Languages, ChevronDown, AlertTriangle,
  Music, Tv, Megaphone, Coins, CreditCard, Calendar, ArrowUpRight, CheckCircle2, History, TrendingUp, HelpCircle, FileText, ShoppingBag, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import FeatureLoader from '../components/FeatureLoader';
import VideoPlayer from '../components/VideoPlayer';
import AdBanner from '../components/AdBanner';
import { useNetwork, COMMUNITY_CATEGORIES, Community, Friend } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdsContext';
import { event } from '../utils/analytics';
import { t10Service } from '../services/t10Service';
import { generateContent } from '../services/aiService';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
  'Korean', 'Russian', 'Portuguese', 'Italian', 'Arabic', 'Hindi',
  'Turkish', 'Dutch', 'Swedish', 'Indonesian', 'Vietnamese', 'Thai'
];

const initialPosts = [
  {
    id: 4,
    author: 'You',
    handle: '@me',
    avatar: 'https://picsum.photos/seed/me/150',
    content: 'Just uploaded this amazing video from my library! The quality is incredible. 🎥✨ #SupremeNetwork #Video',
    images: [] as string[],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' as string | null,
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
    time: 'Just now',
    bgColor: 'transparent',
    transformType: 'normal',
    category: 'Entertainment',
    authorFollowers: 1500,
    authorRank: 'Bronze',
    authorRankColor: 'text-orange-700',
    isPinned: false,
    privacy: 'public',
    type: 'video'
  },
  {
    id: 1,
    author: 'Elon Musk',
    handle: '@elonmusk',
    avatar: 'https://picsum.photos/seed/elon/150',
    content: 'Supreme Satellite: Global connectivity, redefined. The future of the decentralized web is here. #Supreme #Innovation',
    images: ['https://picsum.photos/seed/space/800/400'],
    video: null as string | null,
    likes: 1200000,
    dislikes: 5000,
    comments: 45000,
    shares: 120000,
    time: '2h ago',
    bgColor: 'transparent',
    transformType: 'normal',
    category: 'Tech',
    authorFollowers: 180000000,
    authorRank: 'Crowned',
    authorRankColor: 'text-[var(--color-supreme-gold)]',
    isPinned: false,
    privacy: 'public',
    type: 'image'
  },
  {
    id: 2,
    author: 'Supreme Official',
    handle: '@supreme_app',
    avatar: 'https://picsum.photos/seed/supreme/150',
    content: 'The Supreme Network: Where luxury meets logic. Experience the next evolution of digital interaction.',
    images: [] as string[],
    video: null as string | null,
    likes: 500000,
    dislikes: 1000,
    comments: 12000,
    shares: 50000,
    time: '5h ago',
    bgColor: 'transparent',
    transformType: 'normal',
    category: 'News',
    authorFollowers: 5000000,
    authorRank: 'Official',
    authorRankColor: 'text-blue-600',
    isPinned: true,
    privacy: 'public',
    type: 'text'
  },
  {
    id: 3,
    author: 'Tech Insider',
    handle: '@techinsider',
    avatar: 'https://picsum.photos/seed/tech/150',
    content: 'Supreme AI: Transforming vision into reality. Our generative tools are setting a new standard for creative intelligence.',
    images: [] as string[],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' as string | null,
    likes: 230000,
    dislikes: 200,
    comments: 5000,
    shares: 15000,
    time: '1d ago',
    bgColor: 'transparent',
    transformType: 'normal',
    category: 'Educational',
    authorFollowers: 12000000,
    authorRank: 'Diamond',
    authorRankColor: 'text-cyan-600',
    isPinned: false,
    privacy: 'public',
    type: 'video'
  }
];

const storyUsers = [
  { id: 1, name: 'You', avatar: 'https://picsum.photos/seed/me/150', isAdd: true, storyImage: 'https://picsum.photos/seed/storyme/800/1200' },
  { id: 2, name: 'Elon Musk', avatar: 'https://picsum.photos/seed/elon/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storyelon/800/1200' },
  { id: 3, name: 'Sarah Connor', avatar: 'https://picsum.photos/seed/sarah/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storysarah/800/1200' },
  { id: 4, name: 'James Bond', avatar: 'https://picsum.photos/seed/bond/150', hasUnseen: false, storyImage: 'https://picsum.photos/seed/storybond/800/1200' },
  { id: 5, name: 'Tech Insider', avatar: 'https://picsum.photos/seed/tech/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storytech/800/1200' },
  { id: 6, name: 'Supreme Official', avatar: 'https://picsum.photos/seed/supreme/150', hasUnseen: false, storyImage: 'https://picsum.photos/seed/storysupreme/800/1200' },
  { id: 7, name: 'Alice', avatar: 'https://picsum.photos/seed/alice/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storyalice/800/1200' },
  { id: 8, name: 'Bob', avatar: 'https://picsum.photos/seed/bob/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storybob/800/1200' },
  { id: 9, name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/150', hasUnseen: false, storyImage: 'https://picsum.photos/seed/storycharlie/800/1200' },
  { id: 10, name: 'Diana', avatar: 'https://picsum.photos/seed/diana/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storydiana/800/1200' },
  { id: 11, name: 'Eve', avatar: 'https://picsum.photos/seed/eve/150', hasUnseen: false, storyImage: 'https://picsum.photos/seed/storyeve/800/1200' },
  { id: 12, name: 'Frank', avatar: 'https://picsum.photos/seed/frank/150', hasUnseen: true, storyImage: 'https://picsum.photos/seed/storyfrank/800/1200' },
];

const initialNotifications = [
    {
        id: 1,
        type: 'like',
        user: 'Sarah Connor',
        avatar: 'https://picsum.photos/seed/sarah/150',
        content: 'liked your post about Supreme AI.',
        time: '10m ago',
        read: false
    },
    {
        id: 2,
        type: 'follow',
        user: 'James Bond',
        avatar: 'https://picsum.photos/seed/bond/150',
        content: 'started following you.',
        time: '1h ago',
        read: false
    },
    {
        id: 3,
        type: 'comment',
        user: 'Tony Stark',
        avatar: 'https://picsum.photos/seed/stark/150',
        content: 'commented: "This is revolutionary!"',
        time: '2h ago',
        read: true
    },
    {
        id: 4,
        type: 'mention',
        user: 'Lara Croft',
        avatar: 'https://picsum.photos/seed/lara/150',
        content: 'mentioned you in a post.',
        time: '5h ago',
        read: true
    }
];

const suggestedUsers = [
  {
    id: 1,
    name: 'Sarah Connor',
    handle: '@sarahc',
    avatar: 'https://picsum.photos/seed/sarah/150',
    rank: 'Diamond',
    rankColor: 'text-cyan-600',
    bgGradient: 'from-cyan-500/10 to-blue-500/10'
  },
  {
    id: 2,
    name: 'James Bond',
    handle: '@007',
    avatar: 'https://picsum.photos/seed/bond/150',
    rank: 'Silver',
    rankColor: 'text-slate-500',
    bgGradient: 'from-slate-400/10 to-gray-400/10'
  },
  {
    id: 3,
    name: 'Tony Stark',
    handle: '@ironman',
    avatar: 'https://picsum.photos/seed/stark/150',
    rank: 'Crowned',
    rankColor: 'text-[var(--color-supreme-gold)]',
    bgGradient: 'from-[var(--color-supreme-gold)]/10 to-yellow-500/10'
  },
  {
    id: 4,
    name: 'Lara Croft',
    handle: '@tombraider',
    avatar: 'https://picsum.photos/seed/lara/150',
    rank: 'Gold',
    rankColor: 'text-yellow-600',
    bgGradient: 'from-yellow-400/10 to-orange-400/10'
  }
];

const backgroundColors = [
    'transparent',
    ...Array.from({ length: 1200 }, (_, i) => {
      const h = Math.floor(i * (360 / 1200));
      const s = 65 + (i % 26); // Saturation spread of over 1000 variations
      const l = 80 + (i % 16); // Lightness spread of over 1000 variations
      return `hsl(${h}, ${s}%, ${l}%)`;
    })
];

const postCategories = [
    'News', 'Sports', 'Football', 'Events', 'Accident', 'Church', 'Quotes', 
    'Preaching', 'Praying', 'Playing', 'Educational', 'Seminar', 'Violence', 'War', 'Other'
];

const StatusCountdown: React.FC<{ createdAt: string; expiresAt: string; showDetailed?: boolean; isAd?: boolean }> = ({ 
  createdAt, 
  expiresAt, 
  showDetailed = false,
  isAd = false
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  
  const total = expires - created;
  const remaining = Math.max(0, expires - now);
  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  
  const diffHrs = Math.floor(remaining / (1000 * 60 * 60));
  const diffMins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((remaining % (1000 * 60)) / 1000);

  if (remaining <= 0) {
    return (
      <span className="text-red-500 font-bold text-[10px] font-mono flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
        Expired
      </span>
    );
  }

  if (showDetailed) {
    return (
      <div className="bg-black/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-4 text-white shadow-xl min-w-[200px]">
        <div className="space-y-0.5">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            {isAd ? '📢 Ad Campaign Time Left' : '⏱️ Status Remaining'}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-base font-black text-[var(--color-supreme-gold)]">
              {String(diffHrs).padStart(2, '0')}h {String(diffMins).padStart(2, '0')}m {String(diffSecs).padStart(2, '0')}s
            </span>
          </div>
        </div>
        {/* SVG Progress Ring */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="transparent" />
            <circle 
              cx="20" 
              cy="20" 
              r="16" 
              stroke={isAd ? '#F59E0B' : '#EAB308'} 
              strokeWidth="3" 
              fill="transparent" 
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - percentage / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[8px] font-mono font-bold text-gray-200">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded-full backdrop-blur-sm font-mono border border-white/10 shadow-sm shrink-0">
      <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
      <span>{diffHrs}h {diffMins}m left</span>
    </div>
  );
};

const getStatusPrice = (mode: 'normal' | 'ad', upgrade: string, adDuration: string) => {
  if (mode === 'ad') {
    switch (adDuration) {
      case '1_week': return 2.00;
      case '2_weeks': return 3.00;
      case '3_weeks': return 3.50;
      case '1_month': return 5.00;
      default: return 2.00;
    }
  } else {
    switch (upgrade) {
      case '50h': return 0.00;
      case '90h': return 1.00;
      case '120h': return 2.00;
      case '150h': return 4.00;
      case '200h': return 6.00;
      case '250h': return 10.00;
      case '500h': return 18.00;
      default: return 0.00;
    }
  }
};

const getStatusHours = (mode: 'normal' | 'ad', upgrade: string, adDuration: string) => {
  if (mode === 'ad') {
    switch (adDuration) {
      case '1_week': return 168;
      case '2_weeks': return 336;
      case '3_weeks': return 504;
      case '1_month': return 720;
      default: return 168;
    }
  } else {
    switch (upgrade) {
      case '50h': return 50;
      case '90h': return 90;
      case '120h': return 120;
      case '150h': return 150;
      case '200h': return 200;
      case '250h': return 250;
      case '500h': return 500;
      default: return 50;
    }
  }
};

export default function Network() {
  const { user, profile, updateUser } = useAuth();
  const { getActiveAds } = useAds();
  const level1Ads = getActiveAds(1);
  const navigate = useNavigate();
  const { 
    friends, friendRequests, sentRequests, communities, joinedCommunities,
    addFriend, sendFriendRequest, removeFriend, acceptFriendRequest, rejectFriendRequest,
    createCommunity, joinCommunity, leaveCommunity, searchCommunities, searchUsers,
    allUsers, getFriendLimit
  } = useNetwork();

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('supreme_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {
        return initialPosts;
      }
    }
    return initialPosts;
  });

  useEffect(() => {
    localStorage.setItem('supreme_posts', JSON.stringify(posts));
  }, [posts]);

  const [localAllUsers, setLocalAllUsers] = useState(allUsers);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<number>>(new Set());
  const [postText, setPostText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = postText.match(urlRegex);
    if (urls) {
      const allValid = urls.every(url => {
        try {
          new URL(url);
          return true;
        } catch (_) {
          return false;
        }
      });
      setIsUrlValid(allValid);
    } else {
      setIsUrlValid(null);
    }
  }, [postText]);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  const [bgColor, setBgColor] = useState('transparent');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('News');
  const [activeMenuPostId, setActiveMenuPostId] = useState<number | null>(null);
  const [activeSharePostId, setActiveSharePostId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [showRankAnalysis, setShowRankAnalysis] = useState(false);
  const [selectedTransform, setSelectedTransform] = useState<'normal' | 'grass' | 'transparent' | 'virtual' | 'hack'>('normal');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [activeTab, setActiveTab] = useState<'feed' | 'communities' | 'connections' | 'discover' | 'notifications' | 'status-hub'>('feed');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Profile Status / Stories State and Logic
  const [dbStatuses, setDbStatuses] = useState<any[]>([]);
  const [showCreateStatusModal, setShowCreateStatusModal] = useState(false);
  const [statusMediaType, setStatusMediaType] = useState<'image' | 'video' | 'music'>('image');
  const [statusMediaUrl, setStatusMediaUrl] = useState<string | null>(null);
  const [statusCaption, setStatusCaption] = useState('');
  const [isPostingStatus, setIsPostingStatus] = useState(false);

  // Status Upgrades & Promotion Advanced state
  const [statusMode, setStatusMode] = useState<'normal' | 'ad'>('normal');
  const [adDurationOption, setAdDurationOption] = useState<'1_week' | '2_weeks' | '3_weeks' | '1_month'>('1_week');
  const [disappearanceBooster, setDisappearanceBooster] = useState<'50h' | '90h' | '120h' | '150h' | '200h' | '250h' | '500h'>('50h');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe' | 'bitcoin'>('wallet');
  const [stripeCardNumber, setStripeCardNumber] = useState('');
  const [stripeCardExpiry, setStripeCardExpiry] = useState('');
  const [stripeCardCvc, setStripeCardCvc] = useState('');
  const [stripeCardName, setStripeCardName] = useState('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [statusTransactions, setStatusTransactions] = useState<any[]>([]);

  // Custom high-fidelity multi-segment story viewer
  const [activeStoryUserIndex, setActiveStoryUserIndex] = useState<number | null>(null);
  const [activeStoryItemIndex, setActiveStoryItemIndex] = useState<number>(0);
  const [mediaProgress, setMediaProgress] = useState(0);

  // Group real-time statuses from Firebase by user
  const groupedStories = React.useMemo(() => {
    const groups: Record<string, {
      userId: string;
      userName: string;
      userAvatar: string;
      statuses: any[];
    }> = {};

    // 1. Group real database statuses
    dbStatuses.forEach(status => {
      if (!groups[status.userId]) {
        groups[status.userId] = {
          userId: status.userId,
          userName: status.userName || 'User',
          userAvatar: status.userAvatar || 'https://picsum.photos/seed/user/150',
          statuses: []
        };
      }
      groups[status.userId].statuses.push(status);
    });

    // Convert to array
    const realStories = Object.values(groups);

    // 2. Fallback stories (keep UI rich with defaults if no live statuses exist)
    const fallbackStories = storyUsers.map(su => {
      return {
        userId: `fallback-${su.id}`,
        userName: su.name,
        userAvatar: su.avatar,
        statuses: [
          {
            id: `fallback-status-${su.id}`,
            userId: `fallback-${su.id}`,
            userName: su.name,
            userAvatar: su.avatar,
            mediaType: 'image' as const,
            mediaUrl: su.storyImage,
            caption: 'Luxury & Logic combined ✨',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 50 * 3600 * 1000).toISOString()
          }
        ]
      };
    }).filter(fs => !realStories.some(rs => rs.userName === fs.userName));

    return [...realStories, ...fallbackStories];
  }, [dbStatuses]);

  // Real-time listener for short-lived user statuses
  useEffect(() => {
    const statusesCollection = collection(db, 'statuses');
    const unsubscribe = onSnapshot(statusesCollection, (snapshot) => {
      const all: any[] = [];
      const now = new Date();
      snapshot.forEach((doc) => {
        const d = doc.data();
        const expiry = d.expiresAt ? (d.expiresAt.toDate ? d.expiresAt.toDate() : new Date(d.expiresAt)) : null;
        // Only include statuses that have not expired yet
        if (!expiry || expiry > now) {
          all.push({ id: doc.id, ...d });
        }
      });
      // Sort by createdAt ascending
      all.sort((a, b) => {
        const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return tA - tB;
      });
      setDbStatuses(all);
    }, (error) => {
      console.error("Error loading statuses:", error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for status transactions
  useEffect(() => {
    if (!user) return;
    const transactionsCollection = collection(db, 'status_transactions');
    const q = query(transactionsCollection, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
      setStatusTransactions(list);
    }, (error) => {
      console.error("Error loading status transactions:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('audio');
      media.src = url;
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };
      media.onerror = () => {
        resolve(0);
      };
    });
  };

  const handleStatusFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check media limit of 1 minute (60 seconds) for videos & music
    if (statusMediaType === 'video' || statusMediaType === 'music') {
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      if ((statusMediaType === 'video' && !isVideo) || (statusMediaType === 'music' && !isAudio)) {
        toast.error(`Invalid file type. Please upload a ${statusMediaType} file.`);
        return;
      }

      // Check duration
      const duration = await getMediaDuration(file);
      if (duration > 60) {
        toast.error('🚫 Status Limit: Videos and Music are limited to a maximum of 1 minute (60 seconds) duration.');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Please upload an image file.');
        return;
      }
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setStatusMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [paymentPhase, setPaymentPhase] = useState<string>('');

  const handlePostStatus = async () => {
    if (!statusMediaUrl) {
      toast.error('Please upload or select media for your status!');
      return;
    }
    
    const price = getStatusPrice(statusMode, disappearanceBooster, adDurationOption);
    const hours = getStatusHours(statusMode, disappearanceBooster, adDurationOption);

    if (price > 0) {
      if (paymentMethod === 'wallet') {
        if (!profile || profile.balance < price) {
          toast.error(`🚫 Insufficient Wallet Balance: You need $${price.toFixed(2)} to perform this upload, but your balance is $${(profile?.balance || 0).toFixed(2)}.`);
          return;
        }
      } else if (paymentMethod === 'stripe') {
        if (!stripeCardNumber || !stripeCardExpiry || !stripeCardCvc || !stripeCardName) {
          toast.error('🚫 Missing Card Info: Please fill out all credit card details.');
          return;
        }
      }
    }

    setIsPostingStatus(true);
    try {
      if (price > 0) {
        setPaymentPhase('🔒 Securing payment channel...');
        await new Promise(r => setTimeout(r, 600));
        setPaymentPhase('📡 Authorizing ledger credentials...');
        await new Promise(r => setTimeout(r, 600));
        setPaymentPhase('🏦 Completing bank authorization...');
        await new Promise(r => setTimeout(r, 600));
        
        if (paymentMethod === 'wallet') {
          await updateUser({ balance: (profile?.balance || 0) - price });
        }
      }

      setPaymentPhase('🚀 Uploading status assets...');
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);

      // 1. Create status in Firestore
      const statusData = {
        userId: user?.uid || 'anonymous',
        userName: profile?.name || 'Anonymous User',
        userAvatar: profile?.avatar || 'https://picsum.photos/seed/user/150',
        mediaType: statusMode === 'ad' ? 'video' : statusMediaType,
        mediaUrl: statusMediaUrl,
        caption: statusCaption,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        duration: statusMediaType === 'image' ? 5 : 60,
        isAd: statusMode === 'ad',
        pricePaid: price,
        campaignType: statusMode === 'ad' ? 'sponsored' : 'standard_boost',
        boostHours: hours
      };

      const docRef = await addDoc(collection(db, 'statuses'), statusData);

      // 2. Create transaction record if it's a paid transaction
      if (price > 0) {
        const transData = {
          userId: user?.uid || 'anonymous',
          userName: profile?.name || 'Anonymous User',
          type: statusMode === 'ad' ? 'advertisement' : 'hourly_boost',
          campaignDuration: statusMode === 'ad' ? adDurationOption : disappearanceBooster,
          hours: hours,
          price: price,
          paymentMethod: paymentMethod,
          createdAt: createdAt.toISOString(),
          status: 'completed',
          statusDocId: docRef.id,
          receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDetails: paymentMethod === 'stripe' ? {
            cardBrand: 'Visa',
            last4: stripeCardNumber.slice(-4) || '4242',
            cardholderName: stripeCardName
          } : paymentMethod === 'bitcoin' ? {
            btcAddress: 'bc1qxy2kg369dn53pyavg0...',
            confirmations: 6
          } : {
            walletSource: 'Central Wallet'
          }
        };

        const txRef = await addDoc(collection(db, 'status_transactions'), transData);
        
        // Show receipt dialog
        setSelectedReceipt({ id: txRef.id, ...transData });
      }

      toast.success(
        statusMode === 'ad'
          ? `Ad campaign activated successfully! Active for ${hours / 24} days.`
          : `Status posted successfully! Active for ${hours} hours.`
      );
      
      setShowCreateStatusModal(false);
      setStatusMediaUrl(null);
      setStatusCaption('');
      // Reset card details
      setStripeCardNumber('');
      setStripeCardExpiry('');
      setStripeCardCvc('');
      setStripeCardName('');
    } catch (error) {
      console.error('Error posting status:', error);
      toast.error('Failed to post status. Please try again.');
    } finally {
      setIsPostingStatus(false);
      setPaymentPhase('');
    }
  };

  // Auto-advance logic for image statuses
  useEffect(() => {
    if (activeStoryUserIndex === null) return;
    const activeUserStory = groupedStories[activeStoryUserIndex];
    if (!activeUserStory) return;
    const activeStoryItem = activeUserStory.statuses[activeStoryItemIndex];
    if (!activeStoryItem) return;

    if (activeStoryItem.mediaType === 'image') {
      const interval = setInterval(() => {
        setMediaProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            // Advance
            if (activeStoryItemIndex < activeUserStory.statuses.length - 1) {
              setActiveStoryItemIndex(activeStoryItemIndex + 1);
            } else if (activeStoryUserIndex < groupedStories.length - 1) {
              setActiveStoryUserIndex(activeStoryUserIndex + 1);
              setActiveStoryItemIndex(0);
            } else {
              setActiveStoryUserIndex(null);
            }
            return 0;
          }
          return prev + 2; // increments by 2% every 100ms = 5 seconds total
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [activeStoryUserIndex, activeStoryItemIndex, groupedStories, dbStatuses]);

  const handleMediaTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const el = e.currentTarget;
    if (el.duration) {
      setMediaProgress((el.currentTime / el.duration) * 100);
    }
  };

  const handleMediaEnded = () => {
    setMediaProgress(100);
    if (activeStoryUserIndex !== null) {
      const activeUserStory = groupedStories[activeStoryUserIndex];
      if (activeUserStory && activeStoryItemIndex < activeUserStory.statuses.length - 1) {
        setActiveStoryItemIndex(activeStoryItemIndex + 1);
        setMediaProgress(0);
      } else if (activeStoryUserIndex < groupedStories.length - 1) {
        setActiveStoryUserIndex(activeStoryUserIndex + 1);
        setActiveStoryItemIndex(0);
        setMediaProgress(0);
      } else {
        setActiveStoryUserIndex(null);
      }
    }
  };
  
  // Media upload state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isValidatingLink, setIsValidatingLink] = useState(false);
  const [validatedLink, setValidatedLink] = useState<{url: string, domain: string} | null>(null);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = postText.match(urlRegex);
    if (urls && urls.length > 0) {
      const url = urls[0];
      if (url !== validatedLink?.url) {
        setIsValidatingLink(true);
        // Simulate validation
        setTimeout(() => {
          try {
            const domain = new URL(url).hostname;
            setValidatedLink({ url, domain });
          } catch (e) {
            setValidatedLink(null);
          }
          setIsValidatingLink(false);
        }, 800);
      }
    } else {
      setValidatedLink(null);
    }
  }, [postText, validatedLink]);

  const LIBRARY_VIDEOS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
  ];

  const INTERNAL_CLIPS = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://www.w3schools.com/html/movie.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
  ];

  const [activeLibraryTab, setActiveLibraryTab] = useState<'videos' | 'clips'>('videos');

  // Community state
  const [communitySearch, setCommunitySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>('All');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'Tech' as any,
    isPrivate: false
  });

  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [subscribedAuthors, setSubscribedAuthors] = useState<Set<string>>(new Set());

  // Infinite scroll logic for feed
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight && !isLoadingMore && visiblePostsCount < posts.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisiblePostsCount(prev => Math.min(prev + 5, posts.length));
          setIsLoadingMore(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, visiblePostsCount, posts.length]);

  const handleSubscribe = (author: string) => {
    setSubscribedAuthors(prev => {
      const next = new Set(prev);
      if (next.has(author)) next.delete(author);
      else next.add(author);
      return next;
    });
  };

  const handleAiEnhance = async () => {
    if (!postText.trim()) return;
    setIsAiLoading(true);
    try {
        const enhancedText = await generateContent(
            `As an elite social media manager, polish and enhance this post to be more engaging, professional, and elite. Do not explain the changes or provide commentary, only return the polished text: "${postText}"`
        );
        setPostText(enhancedText || postText);
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsAiLoading(false);
        setShowAiTools(false);
    }
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    try {
        const generatedText = await generateContent(
            `Write a short, engaging social media post for a luxury tech platform about innovation or success. Include hashtags.`
        );
        setPostText(generatedText || '');
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsAiLoading(false);
        setShowAiTools(false);
    }
  };

  const handleTranslate = async () => {
    if (!postText.trim()) return;
    setIsTranslating(true);
    try {
        const translatedText = await generateContent(
            `Translate the following social media post to ${targetLanguage}. Keep the tone and context. Only return the translated text: \n\n${postText}`
        );
        setPostText(translatedText || postText);
    } catch (error) {
        console.error("Translation Error", error);
    } finally {
        setIsTranslating(false);
        setShowLanguageSelect(false);
    }
  };

  const validateUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    if (urls) {
        for (const url of urls) {
            try {
                new URL(url);
            } catch (_) {
                return false;
            }
        }
    }
    return true;
  };

  const handlePolish = async () => {
    if (!postText.trim()) return;
    setIsAiLoading(true);
    try {
        const polishedText = await generateContent(
            `Fix any sentence or word errors in the following text, making it polished and professional. Do not explain the changes or provide commentary, only return the polished text: "${postText}"`
        );
        setPostText(polishedText || postText);
    } catch (error) {
        console.error("Polish Error", error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);

  const TRENDING_GIFS = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMGpxxfG9C3n9u/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTjJ8O8O8O8O8O/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlHFRbmaZtBRhXG/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjP878Y8h8Y8h/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTjJ8O8O8O8O8O/giphy.gif'
  ];

  const handlePost = async () => {
    if (!postText.trim() && selectedImages.length === 0 && !selectedVideo && !selectedGif) return;
    
    // Check for unauthorized external streaming video domains or formats
    const hasExternalVideoUrl = (text: string) => {
      const externalVideoKeywords = [
        'youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'tiktok.com', 
        'dailymotion.com', 'metacafe.com', 'facebook.com/watch', 'instagram.com/reel'
      ];
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex);
      if (urls) {
        for (const url of urls) {
          const lowerUrl = url.toLowerCase();
          // Exclude safe internal media hosts
          if (
            lowerUrl.includes('commondatastorage.googleapis.com') || 
            lowerUrl.includes('w3schools.com') || 
            lowerUrl.startsWith('blob:') || 
            lowerUrl.startsWith('data:')
          ) {
            continue;
          }
          if (
            externalVideoKeywords.some(kw => lowerUrl.includes(kw)) ||
            lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mov') || lowerUrl.endsWith('.webm')
          ) {
            return true;
          }
        }
      }
      return false;
    };

    if (hasExternalVideoUrl(postText)) {
      toast.error("🚫 Policy Restriction: External streaming or video URLs (YouTube, TikTok, Vimeo, Twitch) are blocked. You can only attach local video files, choose from the built-in Library, or share internal clips directly from Supreme Vibes & Media Tube!");
      return;
    }

    if (postText.trim() && !validateUrl(postText)) {
        toast.error("Please enter a valid URL (starting with http:// or https://)");
        return;
    }

    setIsAiLoading(true);
    try {
        if (postText.trim()) {
            const safetyCheck = await generateContent(
                `Analyze the following text for offensive, inappropriate, hate speech, or pornographic content. Reply with exactly "SAFE" if it is acceptable for a general audience social network, or "UNSAFE" if it contains offensive, hate speech, or pornographic content. Text: "${postText}"`
            );
            
            if (safetyCheck.toUpperCase().includes("UNSAFE")) {
                toast.error("Your post contains content that violates our community guidelines (offensive or inappropriate). Please revise it.");
                setIsAiLoading(false);
                return;
            }
        }
    } catch (error) {
        console.error("AI Safety Check Error", error);
    }

    const isAdmin = profile?.role === 'admin' || profile?.name === 'Master Admin';

    const newPost = {
        id: posts.length + 1,
        author: profile?.name || 'Me',
        handle: profile?.handle || `@${(profile?.name || 'me').toLowerCase().replace(/\s+/g, '')}`,
        avatar: profile?.avatar || 'https://picsum.photos/seed/me/150',
        content: postText,
        images: selectedImages,
        video: selectedVideo,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        time: 'Just now',
        bgColor: bgColor,
        transformType: selectedTransform,
        category: selectedCategory,
        privacy: privacy,
        authorFollowers: profile?.followers || 0,
        authorRank: isAdmin ? 'Official' : (profile?.rank || 'Bronze'),
        authorRankColor: isAdmin ? 'text-blue-600' : (profile?.rankColor || 'text-orange-700'),
        isPinned: false,
        gif: selectedGif,
        type: selectedVideo ? 'video' : (selectedImages.length > 0 ? 'image' : (selectedGif ? 'gif' : 'text'))
    };

    setPosts([newPost, ...posts]);
    if (user) {
      t10Service.trackActivity(user.uid, 'post');
    }
    event({ action: 'create_post', category: 'Network', label: newPost.type });
    setPostText('');
    setBgColor('transparent');
    setSelectedTransform('normal');
    setShowColorPicker(false);
    setSelectedCategory('News');
    setPrivacy('public');
    setShowEmojiPicker(false);
    setSelectedImages([]);
    setSelectedVideo(null);
    setSelectedGif(null);
    setIsAiLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages: string[] = [];
      let loadedCount = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
            setSelectedVideo(null); // Clear video if image is selected
            setSelectedGif(null); // Clear GIF if image is selected
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVideo(reader.result as string);
        setSelectedImages([]); // Clear image if video is selected
        setSelectedGif(null); // Clear GIF if video is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setPostText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeletePost = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));
    setActiveMenuPostId(null);
  };

  const handlePinPost = (id: number) => {
    setPosts(posts.map(post => 
        post.id === id ? { ...post, isPinned: !post.isPinned } : post
    ));
    setActiveMenuPostId(null);
  };

  const handleEditPost = (post: any) => {
    setPostText(post.content);
    setBgColor(post.bgColor || 'transparent');
    setSelectedCategory(post.category || 'News');
    setActiveMenuPostId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAllRead = () => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: (p.likes as number) - 1 } : p));
      } else {
        next.add(postId);
        if (user) {
          t10Service.trackActivity(user.uid, 'like');
        }
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: (p.likes as number) + 1 } : p));
      }
      return next;
    });
  };

  const handleComment = (postId: number) => {
    if (user) {
      t10Service.trackActivity(user.uid, 'comment');
    }
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: (p.comments as number) + 1 } : p));
    toast.info('Comment functionality would open here. Count updated!');
  };

  const handleShare = (postId: number) => {
    setSharedPosts(prev => {
      const next = new Set(prev);
      if (!next.has(postId)) {
        next.add(postId);
        if (user) {
          t10Service.trackActivity(user.uid, 'share');
        }
        setPosts(posts.map(p => p.id === postId ? { ...p, shares: (p.shares as number) + 1 } : p));
      }
      return next;
    });
    toast.success('Post shared successfully!');
  };

  const handleLocalFollow = (userId: string) => {
    const isFollowing = sentRequests.includes(userId) || friends.some(f => f.id === userId);
    
    setLocalAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, followers: (u.followers || 0) + (isFollowing ? -1 : 1) };
      }
      return u;
    }));

    if (isFollowing) {
        // Logic to unfollow/remove connection would go here
        // For now we just toggle the count for demo
    } else {
        const user = localAllUsers.find(u => u.id === userId);
        if (user) sendFriendRequest(user);
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return num.toString();
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <FeatureLoader text="Network Zone">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Stories / Active Users Bar - Moved to Top */}
      <div className="mb-6 -mx-4 sm:mx-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2 pt-4">
        <div className="flex gap-4 min-w-max px-4 sm:px-1 items-center">
          {/* Add Status Circle */}
          <div 
            onClick={() => setShowCreateStatusModal(true)}
            className="flex flex-col items-center gap-2 cursor-pointer group w-16 sm:w-20 shrink-0 animate-fade-in snap-start"
          >
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-transform group-hover:scale-105 duration-300 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
                <img 
                  src={profile?.avatar || 'https://picsum.photos/seed/me/150'} 
                  alt="You" 
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700 truncate w-full text-center">
              Add Status
            </span>
          </div>

          {/* Render Active Status Stories */}
          {groupedStories.map((story, index) => {
            const hasReal = !story.userId.startsWith('fallback-');
            
            // Calculate remaining progress ring
            let activeStatusPercent = 100;
            let isUserAd = false;
            let timeStr = "";
            
            if (hasReal && story.statuses && story.statuses.length > 0) {
              const latestStatus = story.statuses[story.statuses.length - 1];
              isUserAd = story.statuses.some(s => s.isAd);
              const created = new Date(latestStatus.createdAt).getTime();
              const expires = new Date(latestStatus.expiresAt).getTime();
              const now = Date.now();
              const total = expires - created;
              const remaining = Math.max(0, expires - now);
              
              activeStatusPercent = total > 0 ? (remaining / total) * 100 : 100;
              
              const diffHrs = Math.floor(remaining / (1000 * 60 * 60));
              const diffMins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
              if (diffHrs > 0) {
                timeStr = `${diffHrs}h remaining`;
              } else {
                timeStr = `${diffMins}m remaining`;
              }
            } else {
              timeStr = "50h remaining";
            }

            return (
              <div 
                key={story.userId} 
                onClick={() => {
                  setActiveStoryUserIndex(index);
                  setActiveStoryItemIndex(0);
                  setMediaProgress(0);
                }}
                className="flex flex-col items-center gap-2 cursor-pointer group w-16 sm:w-20 shrink-0 relative snap-start"
                title={`${story.userName} (${timeStr})`}
              >
                <div className="relative">
                  {hasReal ? (
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[3px] transition-transform group-hover:scale-105 duration-300 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="46%" stroke="#E5E7EB" strokeWidth="2" fill="transparent" />
                        <circle 
                          cx="50%" 
                          cy="50%" 
                          r="46%" 
                          stroke={isUserAd ? '#F59E0B' : '#EAB308'} 
                          strokeWidth="3" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 30}
                          strokeDashoffset={2 * Math.PI * 30 * (1 - activeStatusPercent / 100)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <img 
                        src={story.userAvatar} 
                        alt={story.userName} 
                        className="w-[84%] h-[84%] rounded-full object-cover border border-white z-10"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-transform group-hover:scale-105 duration-300 border-2 border-gray-200">
                      <img 
                        src={story.userAvatar} 
                        alt={story.userName} 
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    </div>
                  )}

                  {hasReal && (
                    <span className={clsx(
                      "absolute -top-1 -right-1 font-black text-[8px] px-1.5 py-0.5 rounded-full border border-white shadow uppercase tracking-wider animate-pulse",
                      isUserAd ? "bg-amber-500 text-white" : "bg-yellow-400 text-black"
                    )}>
                      {isUserAd ? 'AD' : 'LIVE'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-700 truncate w-full text-center">
                    {story.userName}
                  </span>
                  {hasReal && (
                    <span className="text-[8px] font-mono text-gray-400 font-bold tracking-tight">
                      {Math.round(activeStatusPercent)}% left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-supreme-text)]">Supreme Network</h1>
        
        <div className="flex bg-white/50 p-1 rounded-full border border-gray-200 overflow-x-auto no-scrollbar max-w-full w-full sm:w-auto">
            <button
                onClick={() => setActiveTab('feed')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === 'feed' 
                        ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <Users className="w-4 h-4" /> Feed
            </button>
            <button
                onClick={() => setActiveTab('communities')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === 'communities' 
                        ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <Globe className="w-4 h-4" /> Communities
            </button>
            <button
                onClick={() => setActiveTab('connections')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === 'connections' 
                        ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <UserCheck className="w-4 h-4" /> Connections
            </button>
            <button
                onClick={() => setActiveTab('discover')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === 'discover' 
                        ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <Search className="w-4 h-4" /> Discover
            </button>
            <button
                onClick={() => setActiveTab('notifications')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 relative whitespace-nowrap",
                    activeTab === 'notifications' 
                        ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <Bell className="w-4 h-4" /> Notifications
                {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>
            <button
                onClick={() => setActiveTab('status-hub')}
                className={clsx(
                    "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === 'status-hub' 
                        ? "bg-[var(--color-supreme-gold)] text-black font-extrabold shadow-md" 
                        : "text-gray-500 hover:text-[var(--color-supreme-text)]"
                )}
            >
                <Tv className="w-4 h-4 text-amber-500 animate-pulse" /> Status Hub 🚀
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6 gap-8 3xl:gap-12 4xl:gap-16 5xl:gap-24">
        {/* Main Content */}
        <div className="lg:col-span-2 3xl:col-span-3 4xl:col-span-4 5xl:col-span-5 space-y-6 3xl:space-y-10 4xl:space-y-16 5xl:space-y-24">
          
          {activeTab === 'feed' ? (
            <>
              {/* Create Post Section */}
              <div className={clsx(
                  "glass-panel p-4 sm:p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border shadow-sm transition-colors duration-300 mb-8",
                  selectedTransform === 'grass' && "bg-green-50/90 border-green-200 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                  selectedTransform === 'transparent' && "bg-white/10 backdrop-blur-xl border-white/20 text-white",
                  selectedTransform === 'virtual' && "bg-blue-900/80 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] text-blue-50",
                  selectedTransform === 'hack' && "bg-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] font-mono text-green-400",
                  (!selectedTransform || selectedTransform === 'normal') && "bg-white/80 border-gray-200"
              )} style={{ backgroundColor: bgColor === 'transparent' ? undefined : bgColor }}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16">
                   <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                     <img src={profile?.avatar || 'https://picsum.photos/seed/me/150'} alt="Me" className="w-10 h-10 sm:w-12 sm:h-12 3xl:w-20 3xl:h-20 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48 rounded-full object-cover border-2 border-white shadow-sm" />
                     <div className="flex flex-col sm:items-center">
                       <p className={clsx("font-bold text-sm 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl", selectedTransform === 'transparent' || selectedTransform === 'virtual' || selectedTransform === 'hack' ? "text-white" : "text-gray-900")}>
                         {profile?.name || 'Me'}
                       </p>
                       <div className="flex items-center gap-2">
                         <div className={clsx(
                           "flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold uppercase tracking-wider",
                           (profile?.role === 'admin' || profile?.name === 'Master Admin') ? 'text-blue-600' : (profile?.rankColor || 'text-orange-700')
                         )}>
                           <Crown className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" />
                           <span>{(profile?.role === 'admin' || profile?.name === 'Master Admin') ? 'Official' : (profile?.rank || 'Bronze')}</span>
                         </div>
                         <p className={clsx("text-[10px] 3xl:text-lg 4xl:text-2xl 5xl:text-4xl uppercase font-bold tracking-wider sm:hidden", selectedTransform === 'transparent' || selectedTransform === 'virtual' || selectedTransform === 'hack' ? "text-gray-300" : "text-gray-500")}>{privacy}</p>
                       </div>
                     </div>
                   </div>
                   <div className="flex-1 flex flex-col gap-3 3xl:gap-6 relative">
                     {isUrlValid !== null && (
                       <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 z-10">
                         {isUrlValid ? (
                           <>
                             <Link className="w-3 h-3 text-green-400" />
                             <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Valid Link</span>
                           </>
                         ) : (
                           <>
                             <AlertTriangle className="w-3 h-3 text-red-400" />
                             <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Invalid Link</span>
                           </>
                         )}
                       </div>
                     )}
                     <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's on your mind? Share your latest milestone..."
                        className={clsx(
                            "w-full bg-transparent border focus:ring-2 focus:ring-[var(--color-supreme-gold)] text-base sm:text-lg 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl resize-none min-h-[80px] sm:min-h-[100px] 3xl:min-h-[150px] 4xl:min-h-[200px] 5xl:min-h-[300px] p-3 3xl:p-6 focus:outline-none rounded-xl 3xl:rounded-2xl transition-all",
                            selectedTransform === 'hack' ? "border-green-500/30 text-green-400 placeholder-green-700" :
                            selectedTransform === 'virtual' ? "border-blue-400/30 text-blue-50 placeholder-blue-300" :
                            selectedTransform === 'transparent' ? "border-white/20 text-white placeholder-gray-300" :
                            selectedTransform === 'grass' ? "border-green-200 text-green-900 placeholder-green-600" :
                            "border-gray-100 text-[var(--color-supreme-text)] placeholder-gray-400"
                        )}
                        style={{ backgroundColor: bgColor === 'transparent' ? 'transparent' : 'rgba(255,255,255,0.1)' }}
                     />
                     
                     {/* Category & Privacy Selector */}
                     <div className="flex flex-wrap items-center gap-2 sm:gap-4 3xl:gap-8 mb-1">
                        <div className="flex items-center gap-2 3xl:gap-4">
                            <span className="hidden sm:inline text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl rounded-lg 3xl:rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-[var(--color-supreme-gold)] block p-1.5 sm:p-2 3xl:p-4 outline-none shadow-sm cursor-pointer transition-all"
                            >
                                {postCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 3xl:gap-4">
                            <span className="hidden sm:inline text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-500 uppercase tracking-wider">Privacy:</span>
                            <div className="flex bg-gray-100 p-1 3xl:p-2 rounded-lg 3xl:rounded-xl border border-gray-200">
                                <button 
                                    onClick={() => setPrivacy('public')}
                                    className={clsx(
                                        "p-1 sm:p-1.5 3xl:p-3 4xl:p-5 5xl:p-8 rounded-md 3xl:rounded-lg transition-all flex items-center gap-1.5 3xl:gap-3 text-[10px] sm:text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold",
                                        privacy === 'public' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                    title="Public"
                                >
                                    <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                                    <span className="hidden md:inline">Public</span>
                                </button>
                                <button 
                                    onClick={() => setPrivacy('friends')}
                                    className={clsx(
                                        "p-1 sm:p-1.5 3xl:p-3 4xl:p-5 5xl:p-8 rounded-md 3xl:rounded-lg transition-all flex items-center gap-1.5 3xl:gap-3 text-[10px] sm:text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold",
                                        privacy === 'friends' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                    title="Connections Only"
                                >
                                    <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                                    <span className="hidden md:inline">Connections</span>
                                </button>
                                <button 
                                    onClick={() => setPrivacy('private')}
                                    className={clsx(
                                        "p-1 sm:p-1.5 3xl:p-3 4xl:p-5 5xl:p-8 rounded-md 3xl:rounded-lg transition-all flex items-center gap-1.5 3xl:gap-3 text-[10px] sm:text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold",
                                        privacy === 'private' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                    title="Private"
                                >
                                    <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                                    <span className="hidden md:inline">Private</span>
                                </button>
                            </div>
                        </div>
                     </div>
                     
                     {/* AI Tools Panel */}
                     <AnimatePresence>
                        {showAiTools && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-2"
                            >
                                <div className="bg-[var(--color-supreme-gold)]/5 rounded-xl p-2 flex gap-2 overflow-x-auto hide-scrollbar">
                                    <button 
                                        onClick={handleAiEnhance}
                                        disabled={isAiLoading || !postText.trim()}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-[10px] sm:text-xs font-bold text-[var(--color-supreme-text)] hover:text-[var(--color-supreme-gold)] shadow-sm border border-gray-100 whitespace-nowrap disabled:opacity-50 transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3" /> Enhance Writing
                                    </button>
                                    <button 
                                        onClick={handleAiGenerate}
                                        disabled={isAiLoading}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-[10px] sm:text-xs font-bold text-[var(--color-supreme-text)] hover:text-[var(--color-supreme-gold)] shadow-sm border border-gray-100 whitespace-nowrap disabled:opacity-50 transition-colors"
                                    >
                                        <Sparkles className="w-3 h-3" /> Generate Idea
                                    </button>
                                    <div className="w-px h-6 bg-gray-200 mx-1" />
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-[10px] sm:text-xs font-bold text-[var(--color-supreme-text)] hover:text-[var(--color-supreme-gold)] shadow-sm border border-gray-100 whitespace-nowrap transition-colors"
                                            >
                                                <Languages className="w-3 h-3" /> To {targetLanguage} <ChevronDown className="w-3 h-3" />
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
                                                                targetLanguage === lang ? "text-[var(--color-supreme-gold)] font-bold bg-[var(--color-supreme-gold)]/5" : "text-gray-600"
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
                                            disabled={isTranslating || !postText.trim()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-supreme-gold)] rounded-lg text-[10px] sm:text-xs font-bold text-white hover:bg-[var(--color-supreme-gold)]/90 shadow-sm whitespace-nowrap disabled:opacity-50 transition-colors"
                                        >
                                            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                                            Translate
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
    
                     {/* Color Picker Panel */}
                     <AnimatePresence>
                        {showColorPicker && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-2"
                            >
                                <div className="bg-white/50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Background</span>
                                        <button onClick={() => setShowColorPicker(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                            <X className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-10 gap-1 max-h-24 sm:max-h-32 overflow-y-auto p-1 hide-scrollbar">
                                        {backgroundColors.map((color, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setBgColor(color)}
                                                className={clsx(
                                                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110",
                                                    bgColor === color ? "ring-2 ring-[var(--color-supreme-gold)] ring-offset-1" : ""
                                                )}
                                                style={{ backgroundColor: color === 'transparent' ? 'white' : color }}
                                                title={color}
                                            >
                                                {color === 'transparent' && (
                                                    <div className="w-full h-full relative overflow-hidden rounded-full">
                                                        <div className="absolute inset-0 border-r border-red-500 transform rotate-45 scale-150 origin-center opacity-50"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
    
                     {/* Emoji Picker Panel */}
                     <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-2"
                            >
                                <div className="relative z-20">
                                    <button onClick={() => setShowEmojiPicker(false)} className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 z-50">
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={250} />
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
    
                     {/* Media Previews */}
                     <AnimatePresence>
                        {isValidatingLink && (
                          <div className="flex items-center gap-2 text-xs text-blue-500 mb-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Validating link...
                          </div>
                        )}
                        {validatedLink && !isValidatingLink && (
                          <div className="flex items-center gap-2 text-xs text-emerald-500 mb-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <Link className="w-3 h-3" />
                            Link verified: {validatedLink.domain}
                            <CheckCircle className="w-3 h-3 ml-auto" />
                          </div>
                        )}
                        {(selectedImages.length > 0 || selectedVideo || selectedGif) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative mb-2 rounded-xl overflow-hidden border border-gray-200 bg-black/5"
                            >
                                {selectedImages.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto p-2 no-scrollbar">
                                    {selectedImages.map((img, idx) => (
                                      <div key={idx} className="relative shrink-0">
                                        <img src={img} alt="Preview" className="h-32 sm:h-48 rounded-lg object-cover" />
                                        <button 
                                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {selectedVideo && (
                                    <div className="relative">
                                      <video src={selectedVideo} controls className="w-full max-h-48 sm:max-h-64 object-contain" />
                                      <button 
                                          onClick={() => setSelectedVideo(null)}
                                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                      >
                                          <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                )}
                                {selectedGif && (
                                    <div className="relative">
                                      <img src={selectedGif} alt="GIF Preview" className="w-full max-h-48 sm:max-h-64 object-contain" referrerPolicy="no-referrer" />
                                      <button 
                                          onClick={() => setSelectedGif(null)}
                                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                      >
                                          <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                     </AnimatePresence>
    
                     <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                className="hidden" 
                                ref={imageInputRef} 
                                onChange={handleImageUpload} 
                            />
                            <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                ref={videoInputRef} 
                                onChange={handleVideoUpload} 
                            />
                            <button 
                                onClick={() => imageInputRef.current?.click()}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[var(--color-supreme-gold)] transition-colors"
                                title="Add Image"
                            >
                                <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[var(--color-supreme-gold)] transition-colors"
                                title="Add Video"
                            >
                                <Video className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <div className="relative">
                              <button 
                                  onClick={() => setShowLibraryPicker(!showLibraryPicker)}
                                  className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${showLibraryPicker ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                  title="Add from Library"
                              >
                                  <Film className="w-4 sm:w-5 h-4 sm:h-5" />
                              </button>
                              <AnimatePresence>
                                {showLibraryPicker && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 w-72 sm:w-80"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supreme Platform Media</span>
                                      <button onClick={() => setShowLibraryPicker(false)}><X className="w-4 h-4 text-gray-400" /></button>
                                    </div>
                                    
                                    {/* Tab select buttons */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg gap-1 mb-2">
                                      <button 
                                        type="button"
                                        onClick={() => setActiveLibraryTab('videos')}
                                        className={`flex-1 text-center py-1 rounded-md text-[10px] font-semibold transition-all ${activeLibraryTab === 'videos' ? 'bg-white text-[var(--color-supreme-gold)] shadow-sm' : 'text-gray-550 hover:text-gray-800'}`}
                                      >
                                        🎬 Media Tube
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setActiveLibraryTab('clips')}
                                        className={`flex-1 text-center py-1 rounded-md text-[10px] font-semibold transition-all ${activeLibraryTab === 'clips' ? 'bg-white text-[var(--color-supreme-gold)] shadow-sm' : 'text-gray-550 hover:text-gray-800'}`}
                                      >
                                        ⚡ Supreme Vibes
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 no-scrollbar">
                                      {(activeLibraryTab === 'videos' ? LIBRARY_VIDEOS : INTERNAL_CLIPS).map((video, idx) => (
                                        <button
                                          key={video}
                                          onClick={() => {
                                            setSelectedVideo(video);
                                            setSelectedImages([]);
                                            setSelectedGif(null);
                                            setShowLibraryPicker(false);
                                          }}
                                          className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-100 hover:border-[var(--color-supreme-gold)] transition-all relative group"
                                        >
                                          <video src={video} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button 
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${showColorPicker ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                title="Background Color"
                            >
                                <Palette className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${showEmojiPicker ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                title="Add Emoji"
                            >
                                <Smile className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <div className="relative">
                              <button 
                                  onClick={() => setShowGifPicker(!showGifPicker)}
                                  className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${showGifPicker ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                  title="Add GIF"
                              >
                                  <LayoutGrid className="w-4 sm:w-5 h-4 sm:h-5" />
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
                                          key={gif}
                                          onClick={() => {
                                            setSelectedGif(gif);
                                            setSelectedImages([]);
                                            setSelectedVideo(null);
                                            setShowGifPicker(false);
                                          }}
                                          className="aspect-video rounded-lg overflow-hidden border border-gray-100 hover:border-[var(--color-supreme-gold)] transition-all"
                                        >
                                          <img src={gif} alt="GIF" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button 
                                onClick={() => setShowAiTools(!showAiTools)}
                                className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${showAiTools ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                title="AI Tools"
                            >
                                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button 
                                onClick={handlePolish}
                                disabled={isAiLoading || !postText.trim()}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[var(--color-supreme-gold)] transition-colors disabled:opacity-50"
                                title="Polish Tool (Fix Errors)"
                            >
                                <Wand2 className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button 
                                onClick={() => setShowTransformModal(true)}
                                className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTransform !== 'normal' ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10' : 'text-gray-500 hover:text-[var(--color-supreme-gold)]'}`}
                                title="Transform Tool (Card Style)"
                            >
                                <LayoutGrid className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                        </div>
                        <button 
                            onClick={handlePost}
                            disabled={(!postText.trim() && selectedImages.length === 0 && !selectedVideo) || isAiLoading}
                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[var(--color-supreme-text)] text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                        >
                            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Post
                        </button>
                     </div>
                   </div>
                </div>
              </div>
    
              {posts
                .filter(post => {
                    if (post.handle === '@me') return true;
                    if (!post.privacy || post.privacy === 'public') return true;
                    if (post.privacy === 'friends') return friends.some(f => f.handle === post.handle);
                    if (post.privacy === 'private') return false;
                    return true;
                })
                .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
                .slice(0, visiblePostsCount)
                .map((post, index) => {
                  const showAd = index > 0 && index % 7 === 0 && level1Ads.length > 0;
                  const ad = showAd ? level1Ads[Math.floor((index / 7) % level1Ads.length)] : null;

                  return (
                    <React.Fragment key={post.id}>
                      {showAd && ad && (
                        <div className="my-6">
                          <AdBanner ad={ad} className="w-full h-auto" />
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={clsx(
                            "glass-panel p-6 rounded-2xl border transition-all relative mb-6",
                            post.isPinned ? "border-[var(--color-supreme-gold)] shadow-[0_0_15px_rgba(184,134,11,0.1)]" : "border-gray-200 hover:border-gray-300",
                            post.transformType === 'grass' && "bg-green-50/90 border-green-200 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                            post.transformType === 'transparent' && "bg-white/10 backdrop-blur-xl border-white/20 text-white",
                            post.transformType === 'virtual' && "bg-blue-900/80 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] text-blue-50",
                            post.transformType === 'hack' && "bg-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] font-mono text-green-400",
                            (!post.transformType || post.transformType === 'normal') && "bg-white/80"
                        )}
                        style={{ backgroundColor: post.bgColor && post.bgColor !== 'transparent' ? post.bgColor : undefined }}
                      >
                  {post.isPinned && (
                      <div className="absolute -top-3 left-6 bg-[var(--color-supreme-gold)] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Pin className="w-3 h-3 fill-current" /> PINNED
                      </div>
                  )}
    
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className={clsx(
                                "font-bold flex items-center gap-2",
                                post.transformType === 'hack' ? "text-green-400" :
                                post.transformType === 'virtual' ? "text-blue-50" :
                                post.transformType === 'transparent' ? "text-white" :
                                post.transformType === 'grass' ? "text-green-900" :
                                "text-[var(--color-supreme-text)]"
                            )}>
                            {post.author}
                            {post.handle === '@supreme_app' && <span className="text-[var(--color-supreme-gold)] text-xs">★</span>}
                            </h3>
                            <button className="text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/10 p-1 rounded-full transition-colors" title="Follow">
                                <UserPlus className="w-3 h-3" />
                            </button>
                            {post.type === 'video' && (
                                <button 
                                    onClick={() => handleSubscribe(post.author)}
                                    className={clsx(
                                        "ml-2 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider transition-colors",
                                        subscribedAuthors.has(post.author) ? "bg-gray-100 text-gray-600" : "bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold)]/90"
                                    )}
                                >
                                    {subscribedAuthors.has(post.author) ? 'Subscribed' : 'Subscribe'}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={clsx(
                                "text-sm",
                                post.transformType === 'hack' ? "text-green-600" :
                                post.transformType === 'virtual' ? "text-blue-200" :
                                post.transformType === 'transparent' ? "text-gray-300" :
                                post.transformType === 'grass' ? "text-green-700" :
                                "text-gray-500"
                            )}>{post.handle} • {post.time}</p>
                            <div className="flex items-center gap-1 text-gray-400" title={post.privacy || 'public'}>
                                {(!post.privacy || post.privacy === 'public') && <Globe className="w-3 h-3" />}
                                {post.privacy === 'friends' && <Users className="w-3 h-3" />}
                                {post.privacy === 'private' && <Shield className="w-3 h-3" />}
                            </div>
                            {post.authorFollowers !== undefined && (
                                 <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {formatNumber(post.authorFollowers)}
                                 </span>
                            )}
                            {(post.author === 'Master Admin' || post.authorRank) && (
                                <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 flex items-center gap-1", post.author === 'Master Admin' ? 'text-blue-600' : post.authorRankColor)}>
                                    <Crown className="w-3 h-3" /> {post.author === 'Master Admin' ? 'Official' : post.authorRank}
                                </span>
                            )}
                            {post.category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-text)] font-bold border border-[var(--color-supreme-gold)]/20">
                                    {post.category}
                                </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                            className="text-gray-400 hover:text-[var(--color-supreme-text)] p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        <AnimatePresence>
                            {activeMenuPostId === post.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                                >
                                    <button 
                                        onClick={() => handlePinPost(post.id)}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <Pin className="w-4 h-4" /> {post.isPinned ? 'Unpin Post' : 'Pin Post'}
                                    </button>
                                    <button 
                                        onClick={() => handleEditPost(post)}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit Post
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePost(post.id)}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Post
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  </div>
    
                  <p className={clsx(
                      "mb-4 leading-relaxed",
                      post.transformType === 'hack' ? "text-green-400" :
                      post.transformType === 'virtual' ? "text-blue-50" :
                      post.transformType === 'transparent' ? "text-white" :
                      post.transformType === 'grass' ? "text-green-900" :
                      "text-gray-700"
                  )}>{post.content}</p>
    
                  {post.images && post.images.length > 0 && post.type !== 'video' && (
                    <div className={`mb-4 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} rounded-xl overflow-hidden border border-gray-100 shadow-sm`}>
                      {post.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="Post content" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" style={{ maxHeight: post.images.length === 1 ? '500px' : '250px' }} />
                      ))}
                    </div>
                  )}

                  {(post.video || (post.images && post.images.length > 0 && post.type === 'video')) && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="w-full aspect-video">
                          <VideoPlayer src={post.video || post.images[0]} />
                        </div>
                    </div>
                  )}
    
                  <div className={clsx(
                      "flex items-center justify-between pt-4 border-t",
                      post.transformType === 'hack' ? "border-green-500/30 text-green-600" :
                      post.transformType === 'virtual' ? "border-blue-400/30 text-blue-200" :
                      post.transformType === 'transparent' ? "border-white/20 text-gray-300" :
                      post.transformType === 'grass' ? "border-green-200 text-green-700" :
                      "border-gray-100 text-gray-500"
                  )}>
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={clsx(
                        "flex items-center gap-2 transition-colors group",
                        likedPosts.has(post.id) ? "text-red-500" : "hover:text-red-500"
                      )}
                    >
                      <Heart className={clsx("w-5 h-5 group-hover:fill-current", likedPosts.has(post.id) && "fill-current")} />
                      <span className="text-sm">{formatNumber(post.likes)}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-700 transition-colors group">
                      <ThumbsDown className="w-5 h-5 group-hover:fill-current" />
                      <span className="text-sm">{formatNumber(post.dislikes || 0)}</span>
                    </button>
                    <button 
                      onClick={() => handleComment(post.id)}
                      className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{formatNumber(post.comments)}</span>
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => {
                          setActiveSharePostId(activeSharePostId === post.id ? null : post.id);
                          if (activeSharePostId !== post.id) handleShare(post.id);
                        }}
                        className={clsx(
                            "flex items-center gap-2 transition-colors",
                            sharedPosts.has(post.id) ? "text-green-500" : "hover:text-green-500"
                        )}
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm">{formatNumber(post.shares)}</span>
                      </button>
                      
                      <AnimatePresence>
                        {activeSharePostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                          >
                            <div className="p-2 space-y-1">
                               <button 
                                 onClick={() => {
                                   const text = encodeURIComponent(`"${post.content}" - Read more on Supreme Platform: https://supreme-network.com/post/${post.id}`);
                                   window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                                   setActiveSharePostId(null);
                                   toast.success("Ready to publish! Opened Twitter/X sharing screen.");
                                 }}
                                 className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                               >
                                 <Twitter className="w-4 h-4 text-blue-400" />
                                 Share on Twitter/X
                               </button>
                              <button 
                                onClick={() => {
                                  const url = encodeURIComponent(`https://supreme-network.com/post/${post.id}`);
                                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                                  setActiveSharePostId(null);
                                  toast.success("Ready to share! Opened LinkedIn sharing tab.");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <Linkedin className="w-4 h-4 text-blue-700" />
                                Share on LinkedIn
                              </button>
                               <button 
                                 onClick={() => {
                                   const url = encodeURIComponent(`https://supreme-network.com/post/${post.id}`);
                                   window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                   setActiveSharePostId(null);
                                   toast.success("Ready to share! Opened Facebook sharer.");
                                 }}
                                 className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                               >
                                 <Facebook className="w-4 h-4 text-blue-600" />
                                 Share on Facebook
                               </button>
                              <button 
                                onClick={() => {
                                  toast.success(`Broadcasting postcard internally to all groups!`);
                                  setActiveSharePostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <Users className="w-4 h-4 text-purple-600" />
                                Share to Groups
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`"${post.content}"\nRead more at: https://supreme-network.com/post/${post.id}`);
                                  window.open(`https://www.instagram.com`, '_blank');
                                  setActiveSharePostId(null);
                                  toast.success("Caption copied to Clipboard! Opening Instagram.");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <svg className="w-4 h-4 text-pink-500 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                                </svg>
                                Share on Instagram
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://supreme-network.com/post/${post.id}`);
                                  window.open(`https://www.tiktok.com`, '_blank');
                                  setActiveSharePostId(null);
                                  toast.success("Post URL copied! Directing to TikTok.");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24">
                                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.15 2.29 1.95 3.75 2.22l.01 3.92c-1.12-.02-2.22-.31-3.23-.84-.91-.49-1.72-1.2-2.35-2.05-.02 2.61.01 5.22-.01 7.83-.05 1.76-.63 3.49-1.69 4.88-1.55 2.05-4.08 3.22-6.64 3.02-2.35-.15-4.52-1.51-5.69-3.58-1-.18-11.08-2.63-1.08-4.71.05-1.92.83-3.76 2.19-5.11 1.53-1.56 3.71-2.4 5.88-2.29l-.02 3.96c-1.18-.08-2.38.36-3.18 1.2-.77.85-1.11 2.03-.92 3.18.2 1.25 1.09 2.3 2.29 2.76 1.05.41 2.27.27 3.19-.4.91-.71 1.39-1.85 1.34-3.01V.02z" />
                                </svg>
                                Share on TikTok
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://supreme-network.com/post/${post.id}`);
                                  setActiveSharePostId(null);
                                  toast.success("Post URL copied directly to clipboard!");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <Link className="w-4 h-4 text-gray-500" />
                                Copy Post Link
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
                </React.Fragment>
                );
              })}
               {isLoadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-[var(--color-supreme-gold)]/20 shadow-lg">
                    <Loader2 className="w-5 h-5 text-[var(--color-supreme-gold)] animate-spin" />
                    <span className="text-sm font-bold text-[var(--color-supreme-text)] uppercase tracking-widest">Loading More Supreme Feed...</span>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'communities' ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search communities..."
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowCreateCommunity(true)}
                  className="w-full md:w-auto px-6 py-3 bg-[var(--color-supreme-text)] text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" /> Create Community
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCommunityCategory('All')}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
                    selectedCommunityCategory === 'All'
                      ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  )}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setSelectedCommunityCategory('My Communities')}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
                    selectedCommunityCategory === 'My Communities'
                      ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  )}
                >
                  My Communities
                </button>
                {COMMUNITY_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCommunityCategory(cat)}
                    className={clsx(
                      "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all",
                      selectedCommunityCategory === cat
                        ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 4xl:grid-cols-4 5xl:grid-cols-5 gap-6 3xl:gap-10 4xl:gap-16 5xl:gap-24">
                {searchCommunities(communitySearch)
                  .filter(c => 
                    selectedCommunityCategory === 'All' ? true :
                    selectedCommunityCategory === 'My Communities' ? joinedCommunities.includes(c.id) :
                    c.category === selectedCommunityCategory
                  )
                  .map(community => (
                    <motion.div
                      key={community.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-panel p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border border-gray-200 bg-white/80 hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16 mb-4 3xl:mb-8">
                        <img src={community.avatar} alt={community.name} className="w-16 h-16 3xl:w-24 3xl:h-24 4xl:w-36 4xl:h-36 5xl:w-56 5xl:h-56 rounded-2xl 3xl:rounded-3xl object-cover border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-[var(--color-supreme-text)] truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">
                            {community.name}
                          </h3>
                          <span className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl px-2 py-0.5 3xl:px-4 3xl:py-2 rounded-full bg-gray-100 text-gray-500 font-bold border border-gray-200">
                            {community.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl text-gray-600 mb-6 3xl:mb-10 line-clamp-2 h-10 3xl:h-16 4xl:h-24 5xl:h-36">{community.description}</p>
                      <div className="flex items-center justify-between pt-4 3xl:pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-2 3xl:gap-4 text-gray-500">
                          <Users className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                          <span className="text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl font-bold">{community.membersCount} members</span>
                        </div>
                        {joinedCommunities.includes(community.id) ? (
                          <button 
                            onClick={() => leaveCommunity(community.id)}
                            className="px-4 py-2 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 rounded-xl 3xl:rounded-2xl border border-red-200 text-red-500 text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold hover:bg-red-50 transition-colors"
                          >
                            Leave
                          </button>
                        ) : (
                          <button 
                            onClick={() => joinCommunity(community.id)}
                            className="px-4 py-2 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 rounded-xl 3xl:rounded-2xl bg-[var(--color-supreme-gold)] text-white text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Create Community Modal */}
              <AnimatePresence>
                {showCreateCommunity && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-text)]">Create Community</h2>
                        <button onClick={() => setShowCreateCommunity(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X className="w-6 h-6 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Community Name</label>
                          <input 
                            type="text"
                            value={newCommunity.name}
                            onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                            placeholder="e.g. Supreme Developers"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
                          <textarea 
                            value={newCommunity.description}
                            onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                            placeholder="What is this community about?"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none h-24 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                            <select 
                              value={newCommunity.category}
                              onChange={(e) => setNewCommunity({...newCommunity, category: e.target.value as any})}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                            >
                              {COMMUNITY_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Privacy</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setNewCommunity({...newCommunity, isPrivate: false})}
                                className={clsx(
                                  "flex-1 py-3 rounded-xl border font-bold text-xs transition-all",
                                  !newCommunity.isPrivate ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)]" : "bg-gray-50 text-gray-500 border-gray-200"
                                )}
                              >
                                Public
                              </button>
                              <button 
                                onClick={() => setNewCommunity({...newCommunity, isPrivate: true})}
                                className={clsx(
                                  "flex-1 py-3 rounded-xl border font-bold text-xs transition-all",
                                  newCommunity.isPrivate ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)]" : "bg-gray-50 text-gray-500 border-gray-200"
                                )}
                              >
                                Private
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                        <button 
                          onClick={() => setShowCreateCommunity(false)}
                          className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            if (!newCommunity.name.trim()) return;
                            createCommunity({
                              ...newCommunity,
                              avatar: `https://picsum.photos/seed/${newCommunity.name}/150`,
                              createdBy: user?.id || 'me'
                            });
                            setShowCreateCommunity(false);
                            setNewCommunity({ name: '', description: '', category: 'Tech', isPrivate: false });
                          }}
                          className="flex-1 py-3 rounded-xl bg-[var(--color-supreme-text)] text-white font-bold hover:bg-black transition-colors shadow-lg"
                        >
                          Create
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : activeTab === 'connections' ? (
            <div className="space-y-6">
              {friendRequests.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Connection Requests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendRequests.map(request => (
                      <div key={request.id} className="glass-panel p-4 rounded-2xl border border-[var(--color-supreme-gold)]/30 bg-white/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-[var(--color-supreme-text)]">{request.name}</p>
                            <p className="text-xs text-gray-500">{request.handle}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => acceptFriendRequest(request.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => rejectFriendRequest(request.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-[var(--color-supreme-text)]">My Connections</h2>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search connections..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)]/50 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{friends.length} / {getFriendLimit()}</span>
                      <button onClick={() => setShowRankAnalysis(true)} className="text-[10px] font-bold text-[var(--color-supreme-gold)] hover:underline uppercase tracking-widest whitespace-nowrap">Rank Privileges</button>
                    </div>
                  </div>
                </div>
                {friends.length === 0 ? (
                  <div className="glass-panel p-12 rounded-2xl border border-gray-200 bg-white/50 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">You haven't added any connections yet.</p>
                    <button 
                      onClick={() => setActiveTab('feed')}
                      className="mt-4 text-[var(--color-supreme-gold)] font-bold hover:underline"
                    >
                      Find people to connect with
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.filter(f => 
                      f.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                      f.handle.toLowerCase().includes(userSearch.toLowerCase())
                    ).map(friend => (
                      <div key={friend.id} className="glass-panel p-4 rounded-2xl border border-gray-200 bg-white/80 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className={clsx(
                              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                              friend.isOnline !== false ? "bg-green-500" : "bg-gray-400"
                            )}></div>
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors">{friend.name}</p>
                            <p className="text-xs text-gray-500">{friend.handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate('/chat', { state: { userId: friend.id, userName: friend.name, userAvatar: friend.avatar } })}
                            className="p-2 text-gray-400 hover:text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/10 rounded-lg transition-all"
                            title="Message"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => removeFriend(friend.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove Connection"
                          >
                            <UserMinus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'discover' ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-supreme-text)]">Discover People</h2>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[var(--color-supreme-gold)]/50 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localAllUsers.filter(u => 
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                  u.handle.toLowerCase().includes(userSearch.toLowerCase())
                ).map(user => {
                  const isFriend = friends.some(f => f.id === user.id);
                  const isPending = sentRequests.includes(user.id);
                  const isIncoming = friendRequests.some(r => r.id === user.id);

                  return (
                    <div key={user.id} className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white/80 flex flex-col items-center text-center group hover:border-[var(--color-supreme-gold)]/30 transition-all">
                      <div className="relative mb-4">
                        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                          <CheckCircle className="w-5 h-5 text-blue-500 fill-current text-white" />
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-[var(--color-supreme-text)] text-lg mb-1">{user.name}</h4>
                      <p className="text-sm text-gray-500 mb-1">{user.handle}</p>
                      <p className="text-[10px] text-gray-400 mb-3 font-bold uppercase tracking-wider">{formatNumber(user.followers || 0)} Followers</p>
                      
                      <div className={clsx("flex items-center gap-1 mb-4 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase tracking-wider", user.rankColor)}>
                        <Crown className="w-3 h-3" /> {user.rank}
                      </div>

                      <div className="w-full flex gap-2">
                        {isFriend ? (
                          <button 
                            onClick={() => navigate('/chat', { state: { userId: user.id } })}
                            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" /> Message
                          </button>
                        ) : isPending ? (
                          <button 
                            disabled
                            className="flex-1 py-2 bg-gray-100 text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                          >
                            <Clock className="w-4 h-4" /> Pending
                          </button>
                        ) : isIncoming ? (
                          <button 
                            onClick={() => acceptFriendRequest(user.id)}
                            className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleLocalFollow(user.id)}
                            className="flex-1 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl font-bold text-xs hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center justify-center gap-2 shadow-sm"
                          >
                            <UserPlus className="w-4 h-4" /> Connect
                          </button>
                        )}
                        <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--color-supreme-text)]">Notifications</h2>
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-sm text-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-text)] font-medium flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" /> Mark all as read
                    </button>
                </div>
                {notifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={clsx(
                            "p-4 rounded-xl flex items-start gap-4 transition-colors",
                            notification.read ? "bg-white/50" : "bg-white border-l-4 border-[var(--color-supreme-gold)] shadow-sm"
                        )}
                    >
                        <div className="relative">
                            <img src={notification.avatar} alt={notification.user} className="w-10 h-10 rounded-full object-cover" />
                            <div className={clsx(
                                "absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[10px]",
                                notification.type === 'like' ? "bg-red-500" :
                                notification.type === 'comment' ? "bg-blue-500" :
                                notification.type === 'follow' ? "bg-green-500" : "bg-purple-500"
                            )}>
                                {notification.type === 'like' && <Heart className="w-2 h-2 fill-current" />}
                                {notification.type === 'comment' && <MessageCircle className="w-2 h-2 fill-current" />}
                                {notification.type === 'follow' && <UserPlus className="w-2 h-2" />}
                                {notification.type === 'mention' && <Users className="w-2 h-2" />}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-[var(--color-supreme-text)]">
                                <span className="font-bold">{notification.user}</span> {notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                            <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full mt-2"></div>
                        )}
                    </motion.div>
                ))}
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in text-[var(--color-supreme-text)] pb-12">
              {/* Header section with glow */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent border border-[var(--color-supreme-gold)]/20 p-6 md:p-8 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-supreme-gold)]/10 rounded-full blur-3xl" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
                  <div>
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Tv className="w-6 h-6 text-amber-500 animate-pulse" /> Supreme Status Hub
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 max-w-xl">
                      Manage, upgrade, and analyze your profile status durations and video ad campaigns. Boost your organic reach by up to 500 hours or launch sponsored campaigns starting at just $2!
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setStatusMode('normal');
                      setShowCreateStatusModal(true);
                    }}
                    className="px-6 py-3 bg-[var(--color-supreme-text)] hover:bg-black text-white rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" /> Post Upgraded Status
                  </button>
                </div>
              </div>

              {/* Bento Grid Analytics segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Ads & Boosts</span>
                    <span className="p-2 bg-amber-50 rounded-lg text-amber-600"><Megaphone className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-mono font-black text-gray-900">
                      {dbStatuses.filter(s => s.userId === user?.uid).length}
                    </span>
                    <span className="text-xs text-green-500 font-bold block mt-1">● Live Campaigns</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Investment Ledger</span>
                    <span className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Coins className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-mono font-black text-gray-900">
                      ${statusTransactions.reduce((acc, t) => acc + (t.price || 0), 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold block mt-1">Total spend tracked</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Central Wallet</span>
                    <span className="p-2 bg-green-50 rounded-lg text-green-600"><CreditCard className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-mono font-black text-gray-900">${(profile?.balance || 0).toFixed(2)}</span>
                    <span className="text-xs text-green-600 font-bold block mt-1">Secure & Funded</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reach Index</span>
                    <span className="p-2 bg-purple-50 rounded-lg text-purple-600"><TrendingUp className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-mono font-black text-gray-900">
                      {Math.round(statusTransactions.reduce((acc, t) => acc + (t.price || 0), 0) * 140 + 120)}
                    </span>
                    <span className="text-xs text-green-500 font-bold block mt-1">↑ 22.4% vs last week</span>
                  </div>
                </div>
              </div>

              {/* Main Content splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Calculator & Live analytics charts */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Campaign Chart */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Campaign Analytics
                    </h3>
                    <p className="text-gray-500 text-xs mb-6">Real-time telemetry showing estimated views and engagement clicks per transaction</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={statusTransactions.length > 0 
                            ? statusTransactions.map((t) => ({
                                name: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                "Investment ($)": t.price,
                                "Estimated Views": Math.round(t.price * 140) + 120,
                                "Engagement Clicks": Math.round(t.price * 18) + 15
                              })).reverse()
                            : [
                                { name: 'Jul 5', "Investment ($)": 0, "Estimated Views": 120, "Engagement Clicks": 22 },
                                { name: 'Jul 6', "Investment ($)": 1.00, "Estimated Views": 240, "Engagement Clicks": 45 },
                                { name: 'Jul 7', "Investment ($)": 4.00, "Estimated Views": 680, "Engagement Clicks": 110 },
                                { name: 'Jul 8', "Investment ($)": 2.00, "Estimated Views": 410, "Engagement Clicks": 78 },
                                { name: 'Jul 9', "Investment ($)": 6.00, "Estimated Views": 950, "Engagement Clicks": 185 },
                                { name: 'Jul 10', "Investment ($)": 10.00, "Estimated Views": 1580, "Engagement Clicks": 310 },
                                { name: 'Jul 11', "Investment ($)": 18.00, "Estimated Views": 2890, "Engagement Clicks": 540 },
                              ]
                          } 
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EAB308" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ background: '#030712', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Area type="monotone" dataKey="Estimated Views" stroke="#EAB308" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                          <Area type="monotone" dataKey="Engagement Clicks" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Calculator Widget */}
                  <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-gray-800 p-6 text-white shadow-xl">
                    <h3 className="font-display font-black text-lg flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-amber-500 animate-pulse" /> Advertising Campaign Planner
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">Simulate estimated metrics and purchase slots for video advertisements on the network.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">1. Select Campaign Duration</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: '1_week', label: '1 Week', price: 2.00, reach: '3k - 5k' },
                              { id: '2_weeks', label: '2 Weeks', price: 3.00, reach: '7k - 10k' },
                              { id: '3_weeks', label: '3 Weeks', price: 3.50, reach: '12k - 16k' },
                              { id: '1_month', label: '1 Month', price: 5.00, reach: '20k - 25k' }
                            ].map(item => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setStatusMode('ad');
                                  setAdDurationOption(item.id as any);
                                }}
                                className={clsx(
                                  "p-3 rounded-xl border text-left transition-all",
                                  statusMode === 'ad' && adDurationOption === item.id
                                    ? "bg-amber-500/20 border-amber-500 text-white shadow-lg"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                )}
                              >
                                <span className="block text-xs font-bold">{item.label}</span>
                                <span className="block text-lg font-mono font-black text-amber-400 mt-1">${item.price.toFixed(2)}</span>
                                <span className="block text-[9px] text-gray-400 font-medium mt-0.5">Est. Reach: {item.reach}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Estimated Performance</span>
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Campaign Cost:</span>
                              <span className="font-mono font-black text-amber-400 text-sm">
                                ${statusMode === 'ad' ? getStatusPrice('ad', disappearanceBooster, adDurationOption).toFixed(2) : '$0.00'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Guaranteed Placements:</span>
                              <span className="text-white font-bold">Premium Story Rows & Feeds</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Hourly Duration:</span>
                              <span className="font-mono text-white">
                                {statusMode === 'ad' ? getStatusHours('ad', disappearanceBooster, adDurationOption) : 0} Hours (Full-Coverage)
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setStatusMode('ad');
                            setStatusMediaType('video');
                            setShowCreateStatusModal(true);
                          }}
                          className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition-all tracking-wider uppercase text-center flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Megaphone className="w-4 h-4" /> Deploy Video Ad Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - active promotions lists & transaction history ledger */}
                <div className="space-y-6">
                  {/* Active Promotions list */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-md mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Your Live Statuses
                    </h3>
                    
                    {dbStatuses.filter(s => s.userId === user?.uid).length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <Tv className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No active custom statuses found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dbStatuses.filter(s => s.userId === user?.uid).map(status => (
                          <div key={status.id} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                              {status.mediaType === 'image' ? (
                                <img src={status.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                              ) : status.mediaType === 'video' ? (
                                <video src={status.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-[var(--color-supreme-gold)]"><Music className="w-4 h-4" /></div>
                              )}
                              {status.isAd && (
                                <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-[7px] font-black px-1 rounded-tl-md">AD</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-bold text-gray-900 truncate">{status.caption || 'No caption'}</span>
                              <span className="block text-[9px] font-mono text-gray-400 mt-0.5">Disappears in {status.boostHours || 50}h</span>
                            </div>
                            <StatusCountdown createdAt={status.createdAt} expiresAt={status.expiresAt} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transaction history Ledger */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-md mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Receipts & Invoices
                    </h3>

                    {statusTransactions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No transactions recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                        {statusTransactions.map(tx => (
                          <div 
                            key={tx.id} 
                            onClick={() => setSelectedReceipt(tx)}
                            className="p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-900 capitalize">
                                  {tx.type === 'advertisement' ? '📢 sponsored ad' : '🚀 hourly boost'}
                                </span>
                              </div>
                              <span className="block text-[9px] font-mono text-gray-400 mt-0.5">
                                {new Date(tx.createdAt).toLocaleDateString()} • {tx.receiptNumber || 'REC-892102'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-mono font-black text-gray-900">-${tx.price?.toFixed(2)}</span>
                              <span className="text-[8px] text-[var(--color-supreme-gold)] font-bold uppercase tracking-wider">view receipt</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Elite Members */}
        <div className="space-y-6 3xl:space-y-10 4xl:space-y-16 5xl:space-y-24">
          <div className="glass-panel p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border border-gray-200 bg-white/80 sticky top-6 3xl:top-10 4xl:top-16 5xl:top-24">
            <div className="flex items-center justify-between mb-6 3xl:mb-10">
              <h2 className="font-display font-bold text-xl 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-[var(--color-supreme-text)]">Elite Members</h2>
              <Users className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20 text-[var(--color-supreme-gold)]" />
            </div>
            
            <div className="space-y-4 3xl:space-y-8">
              {suggestedUsers.map((user, index) => {
                const isFriend = friends.some(f => f.id === user.id.toString());
                const isPending = sentRequests.includes(user.id.toString());
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`flex items-center gap-3 3xl:gap-6 p-3 3xl:p-6 rounded-xl 3xl:rounded-2xl bg-gradient-to-r ${user.bgGradient} border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group`}
                  >
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 3xl:w-20 3xl:h-20 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 3xl:p-1 shadow-sm">
                        <CheckCircle className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16 text-blue-500 fill-current text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--color-supreme-text)] text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">
                        {user.name}
                      </h4>
                      <p className="text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl text-gray-500 truncate">{user.handle} • {formatNumber(localAllUsers.find(u => u.id === user.id.toString())?.followers || 0)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 3xl:gap-3">
                      <div className={`flex items-center gap-1 3xl:gap-2 ${user.rankColor}`}>
                        <Crown className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" />
                        <span className="text-[8px] 3xl:text-xs 4xl:text-lg 5xl:text-2xl font-bold uppercase tracking-wider">{user.rank}</span>
                      </div>
                      {!isFriend && !isPending && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocalFollow(user.id.toString());
                          }}
                          className="p-1.5 3xl:p-3 4xl:p-5 5xl:p-8 bg-[var(--color-supreme-gold)] text-white rounded-lg 3xl:rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm"
                          title="Connect"
                        >
                          <UserPlus className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" />
                        </button>
                      )}
                      {!isFriend && isPending && (
                        <span className="text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl bg-gray-100 text-gray-500 px-2 py-1 3xl:px-4 3xl:py-2 rounded-md 3xl:rounded-lg font-bold uppercase">
                          Pending
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button className="w-full mt-6 3xl:mt-10 py-3 3xl:py-6 4xl:py-10 5xl:py-16 rounded-xl 3xl:rounded-2xl border border-gray-200 text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--color-supreme-text)] transition-colors">
              View All Members
            </button>
          </div>

          <div className="glass-panel p-6 3xl:p-10 4xl:p-16 5xl:p-24 rounded-2xl 3xl:rounded-3xl border border-gray-200 bg-[var(--color-supreme-gold)]/5">
            <h3 className="font-bold text-[var(--color-supreme-text)] 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl mb-2 3xl:mb-4">Upgrade to General Subs</h3>
            <p className="text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl text-gray-600 mb-4 3xl:mb-8">Unlock exclusive networking features, Supreme Vibes, and verified status.</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full py-2 3xl:py-4 4xl:py-6 5xl:py-10 bg-[var(--color-supreme-text)] text-white rounded-lg 3xl:rounded-xl font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl hover:bg-black transition-colors shadow-lg"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
      {/* Transform Modal */}
      <AnimatePresence>
        {showTransformModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md sm:max-w-lg md:max-w-2xl 3xl:max-w-5xl 4xl:max-w-7xl 5xl:max-w-[2000px] rounded-[2.5rem] 3xl:rounded-[60px] p-6 sm:p-8 3xl:p-24 border border-[var(--color-supreme-gold)]/20 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowTransformModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-supreme-gold)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Transform Post</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">Select a visual style for your postcard.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 3xl:gap-8">
                {[
                  { id: 'normal', label: 'Normal View', icon: Globe, color: 'bg-gray-100 text-gray-600', desc: 'Standard social feed look' },
                  { id: 'grass', label: 'Grass View', icon: Sparkles, color: 'bg-green-100 text-green-600', desc: 'Fresh organic aesthetic' },
                  { id: 'transparent', label: 'Transparent', icon: Loader2, color: 'bg-blue-50 text-blue-600', desc: 'Clean glassmorphism' },
                  { id: 'virtual', label: 'Virtual Style', icon: MessageCircle, color: 'bg-indigo-100 text-indigo-600', desc: 'Deep space interface' },
                  { id: 'hack', label: 'Hack Zone', icon: Shield, color: 'bg-black text-green-500', desc: 'Cyberpunk terminal' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedTransform(style.id as any);
                      setShowTransformModal(false);
                    }}
                    className={clsx(
                      "p-3 sm:p-4 3xl:p-10 rounded-2xl 3xl:rounded-[40px] border-2 transition-all text-left flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 3xl:gap-6 group",
                      selectedTransform === style.id 
                        ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 shadow-lg shadow-[var(--color-supreme-gold)]/10" 
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 3xl:w-20 3xl:h-20 rounded-lg 3xl:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0", style.color)}>
                      <style.icon className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-10 3xl:h-10" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm sm:text-base 3xl:text-3xl font-bold block">{style.label}</span>
                      <span className="text-[10px] sm:text-xs 3xl:text-xl text-gray-400 font-medium">{style.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Profile Status Viewer Modal */}
      <AnimatePresence>
        {activeStoryUserIndex !== null && groupedStories[activeStoryUserIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md"
          >
            {(() => {
              const activeUserStory = groupedStories[activeStoryUserIndex];
              const activeStoryItem = activeUserStory.statuses[activeStoryItemIndex];
              if (!activeStoryItem) return null;

              return (
                <div className="relative w-full h-full sm:w-[400px] sm:h-[85vh] sm:max-h-[820px] bg-gray-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/5 animate-fade-in">
                  {/* Multi-segment Progress Bar */}
                  <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-20">
                    {activeUserStory.statuses.map((_, idx) => (
                      <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-100 ease-linear"
                          style={{ 
                            width: idx < activeStoryItemIndex ? '100%' : 
                                   idx === activeStoryItemIndex ? `${mediaProgress}%` : '0%' 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Header */}
                  <div className="absolute top-8 left-0 right-0 px-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={activeUserStory.userAvatar} 
                        alt={activeUserStory.userName} 
                        className="w-10 h-10 rounded-full border-2 border-[var(--color-supreme-gold)] object-cover bg-gray-800" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold text-sm drop-shadow-md block">{activeUserStory.userName}</span>
                          {activeStoryItem.isAd && (
                            <span className="bg-amber-400 text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border border-black shadow-md uppercase tracking-wider animate-pulse">
                              AD
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-[10px] font-mono tracking-tighter drop-shadow-md">
                          {activeStoryItem.mediaType.toUpperCase()} STATUS
                        </p>
                      </div>
                    </div>
                    {/* Visual countdown telemetry overlay */}
                    <div className="flex items-center gap-2">
                      <StatusCountdown createdAt={activeStoryItem.createdAt} expiresAt={activeStoryItem.expiresAt} isAd={activeStoryItem.isAd} />
                      <button 
                        onClick={() => setActiveStoryUserIndex(null)} 
                        className="p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all border border-white/5"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Floating detailed progress ring card */}
                  <div className="absolute top-20 right-4 z-20 pointer-events-none">
                    <StatusCountdown createdAt={activeStoryItem.createdAt} expiresAt={activeStoryItem.expiresAt} showDetailed={true} isAd={activeStoryItem.isAd} />
                  </div>

                  {/* Story Content Viewport */}
                  <div className="flex-1 relative bg-black flex items-center justify-center">
                    {activeStoryItem.mediaType === 'image' && (
                      <img 
                        src={activeStoryItem.mediaUrl} 
                        alt="Status Image" 
                        className="w-full h-full object-cover" 
                      />
                    )}

                    {activeStoryItem.mediaType === 'video' && (
                      <video 
                        src={activeStoryItem.mediaUrl} 
                        autoPlay 
                        playsInline 
                        controls={false}
                        onTimeUpdate={handleMediaTimeUpdate}
                        onEnded={handleMediaEnded}
                        className="w-full h-full object-contain" 
                      />
                    )}

                    {activeStoryItem.mediaType === 'music' && (
                      <div className="flex flex-col items-center justify-center text-center p-8 w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white relative">
                        {/* Spinning vinyl record disk visualizer */}
                        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-black border-4 border-gray-800 flex items-center justify-center shadow-2xl overflow-hidden animate-[spin_8s_linear_infinite]">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/90 to-black" />
                          <div className="w-14 h-14 rounded-full bg-[var(--color-supreme-gold)] flex items-center justify-center z-10 border-4 border-black font-black text-[9px] text-black">
                            SUPREME
                          </div>
                        </div>

                        <div className="mt-8 space-y-2 z-10">
                          <div className="p-3 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20 rounded-full w-fit mx-auto mb-2 animate-bounce">
                            <Music className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-sm text-white tracking-wide">Ambient Audio Status</h4>
                          <p className="text-[10px] text-gray-500 font-medium font-mono uppercase tracking-widest">Disappears in 50 hrs</p>
                        </div>

                        <audio 
                          src={activeStoryItem.mediaUrl} 
                          autoPlay 
                          onTimeUpdate={handleMediaTimeUpdate}
                          onEnded={handleMediaEnded}
                        />
                      </div>
                    )}
                    
                    {/* Caption Overlay */}
                    {activeStoryItem.caption && (
                      <div className="absolute bottom-24 left-0 right-0 px-6 py-4 bg-black/70 backdrop-blur-md text-white text-center text-xs font-semibold border-t border-b border-white/5 z-20">
                        {activeStoryItem.caption}
                      </div>
                    )}

                    {/* Left/Right Tap Area Triggers */}
                    <div 
                      className="absolute top-0 bottom-0 left-0 w-1/3 z-10 cursor-pointer" 
                      onClick={() => {
                        if (activeStoryItemIndex > 0) {
                          setActiveStoryItemIndex(activeStoryItemIndex - 1);
                          setMediaProgress(0);
                        } else if (activeStoryUserIndex > 0) {
                          setActiveStoryUserIndex(activeStoryUserIndex - 1);
                          setActiveStoryItemIndex(groupedStories[activeStoryUserIndex - 1].statuses.length - 1);
                          setMediaProgress(0);
                        } else {
                          setActiveStoryUserIndex(null);
                        }
                      }} 
                    />
                    <div 
                      className="absolute top-0 bottom-0 right-0 w-2/3 z-10 cursor-pointer" 
                      onClick={() => {
                        if (activeStoryItemIndex < activeUserStory.statuses.length - 1) {
                          setActiveStoryItemIndex(activeStoryItemIndex + 1);
                          setMediaProgress(0);
                        } else if (activeStoryUserIndex < groupedStories.length - 1) {
                          setActiveStoryUserIndex(activeStoryUserIndex + 1);
                          setActiveStoryItemIndex(0);
                          setMediaProgress(0);
                        } else {
                          setActiveStoryUserIndex(null);
                        }
                      }} 
                    />
                  </div>

                  {/* Footer reply input */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder={`Reply to ${activeUserStory.userName}...`}
                          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-full py-2.5 px-5 pr-12 text-xs focus:outline-none focus:border-white/30 backdrop-blur-md transition-all"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button className="p-2.5 text-white/50 hover:text-red-500 transition-colors bg-white/5 rounded-full border border-white/5">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Profile Status Upload Modal */}
      <AnimatePresence>
        {showCreateStatusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100 p-5 sm:p-6 space-y-5 sm:space-y-6 animate-fade-in"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Post Status Update</h3>
                  <p className="text-xs text-gray-400">Post dynamic statuses or premium ad campaigns</p>
                </div>
                <button 
                  onClick={() => setShowCreateStatusModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Status Mode Selection (Normal status vs Sponsored Ad) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Campaign Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusMode('normal');
                      setStatusMediaType('image');
                    }}
                    className={clsx(
                      "p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all text-xs font-bold",
                      statusMode === 'normal'
                        ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 text-yellow-600 font-extrabold shadow-sm"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <Plus className="w-4 h-4" /> Organic Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusMode('ad');
                      setStatusMediaType('video');
                      setStatusMediaUrl(null);
                    }}
                    className={clsx(
                      "p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all text-xs font-bold",
                      statusMode === 'ad'
                        ? "border-amber-500 bg-amber-500/5 text-amber-600 font-extrabold shadow-sm"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <Megaphone className="w-4 h-4" /> Sponsored Video Ad
                  </button>
                </div>
              </div>

              {/* MediaType Switch Tab Panel (Disabled if Ad Mode, which forces video) */}
              {statusMode === 'normal' ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Media Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'image', label: 'Image', icon: ImageIcon, desc: 'No size limit' },
                      { id: 'video', label: 'Video', icon: Video, desc: 'Max 1 minute' },
                      { id: 'music', label: 'Music/Audio', icon: Music, desc: 'Max 1 minute' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setStatusMediaType(type.id as any);
                          setStatusMediaUrl(null);
                        }}
                        className={clsx(
                          "p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all",
                          statusMediaType === type.id 
                            ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 text-yellow-600 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <type.icon className="w-5 h-5" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] block font-bold">{type.label}</span>
                          <span className="text-[8px] text-gray-400 font-medium block">{type.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex gap-2.5">
                  <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wide">Sponsored Ad Policy</span>
                    <span className="block text-[9px] text-amber-700 leading-relaxed mt-0.5">
                      Advertising campaigns only support video uploads of 1 to 5 minutes maximum. Choose duration budgets below.
                    </span>
                  </div>
                </div>
              )}

              {/* Disappearance Upgrades and Budgets */}
              {statusMode === 'normal' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upgrade Hours Display</label>
                    <span className="text-[10px] font-mono text-gray-500 font-bold">Standard is 50 hours</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                    {[
                      { id: '50h', label: '50 Hrs', price: 0 },
                      { id: '90h', label: '90 Hrs', price: 1.00 },
                      { id: '120h', label: '120 Hrs', price: 2.00 },
                      { id: '150h', label: '150 Hrs', price: 4.00 },
                      { id: '200h', label: '200 Hrs', price: 6.00 },
                      { id: '250h', label: '250 Hrs', price: 10.00 },
                      { id: '500h', label: '500 Hrs', price: 18.00 }
                    ].map(upgrade => (
                      <button
                        key={upgrade.id}
                        type="button"
                        onClick={() => setDisappearanceBooster(upgrade.id as any)}
                        className={clsx(
                          "p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center",
                          disappearanceBooster === upgrade.id
                            ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 text-yellow-600 font-extrabold"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-[9px] font-bold">{upgrade.label}</span>
                        <span className="text-[8px] font-mono font-medium text-gray-400 mt-0.5">
                          {upgrade.price === 0 ? 'FREE' : `$${upgrade.price.toFixed(0)}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Ad Campaign Duration</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: '1_week', label: '1 Week', price: 2.00 },
                      { id: '2_weeks', label: '2 Weeks', price: 3.00 },
                      { id: '3_weeks', label: '3 Weeks', price: 3.50 },
                      { id: '1_month', label: '1 Month', price: 5.00 }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdDurationOption(opt.id as any)}
                        className={clsx(
                          "p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center",
                          adDurationOption === opt.id
                            ? "border-amber-500 bg-amber-500/5 text-amber-600 font-extrabold"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-[9px] font-bold whitespace-nowrap">{opt.label}</span>
                        <span className="text-[8px] font-mono font-black text-amber-600 mt-0.5">${opt.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status File Drag/Drop Picker Area */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Media File</label>
                {!statusMediaUrl ? (
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-yellow-400/50 hover:bg-yellow-50/10 transition-all text-center">
                    <div className="p-2.5 bg-gray-50 rounded-full border border-gray-100 text-gray-400">
                      {statusMediaType === 'image' && <ImageIcon className="w-5 h-5 text-yellow-500" />}
                      {statusMediaType === 'video' && <Video className="w-5 h-5 text-yellow-500" />}
                      {statusMediaType === 'music' && <Music className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Click to upload status file</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Supports drag & drop or browse</p>
                    </div>
                    <input 
                      type="file" 
                      accept={
                        statusMediaType === 'image' ? 'image/*' :
                        statusMediaType === 'video' ? 'video/*' : 'audio/*'
                      }
                      onChange={handleStatusFileChange}
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                    {statusMediaType === 'image' && (
                      <img src={statusMediaUrl} className="w-full h-full object-cover" />
                    )}
                    {statusMediaType === 'video' && (
                      <video src={statusMediaUrl} controls className="w-full h-full object-cover" />
                    )}
                    {statusMediaType === 'music' && (
                      <div className="flex flex-col items-center gap-2 p-4">
                        <Music className="w-6 h-6 text-yellow-500 animate-pulse" />
                        <span className="text-[10px] text-gray-500 font-medium font-mono">Audio file loaded</span>
                        <audio src={statusMediaUrl} controls className="w-full h-12" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setStatusMediaUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white shadow transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Caption Overlay */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Caption Overlay</label>
                <input 
                  type="text"
                  value={statusCaption}
                  onChange={(e) => setStatusCaption(e.target.value)}
                  placeholder="e.g. Living the supreme life 🥂"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-supreme-gold)]"
                />
              </div>

              {/* Dynamic Live Status Card Preview */}
              {statusMediaUrl && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Live Render Card Preview</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {statusMediaType === 'image' && (
                      <img src={statusMediaUrl} className="w-full h-full object-cover" />
                    )}
                    {statusMediaType === 'video' && (
                      <video src={statusMediaUrl} className="w-full h-full object-cover" muted />
                    )}
                    {statusMediaType === 'music' && (
                      <div className="flex flex-col items-center justify-center text-center p-3 w-full h-full bg-gradient-to-br from-slate-950 to-indigo-950">
                        <Music className="w-6 h-6 text-yellow-500 animate-bounce" />
                        <span className="text-[10px] text-gray-400 font-mono mt-1">Audio Player Status</span>
                      </div>
                    )}
                    
                    {/* Live countdown progress ring overlay on preview! */}
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-yellow-500 animate-spin" />
                      <span className="text-[8px] font-mono text-white font-bold uppercase tracking-wider">
                        {statusMode === 'ad' ? getStatusHours('ad', disappearanceBooster, adDurationOption) : getStatusHours('normal', disappearanceBooster, adDurationOption)}h remaining
                      </span>
                    </div>

                    {statusCaption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-[9px] text-center text-white truncate font-semibold">
                        {statusCaption}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method Option Selector (Only visible if upgrade costs money) */}
              {getStatusPrice(statusMode, disappearanceBooster, adDurationOption) > 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">Payment Breakdown</span>
                    <span className="text-xs font-mono font-black text-amber-600">
                      Total: ${getStatusPrice(statusMode, disappearanceBooster, adDurationOption).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'wallet', label: 'Wallet', icon: CreditCard },
                      { id: 'stripe', label: 'Stripe', icon: DollarSign },
                      { id: 'bitcoin', label: 'Bitcoin', icon: Coins }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={clsx(
                          "p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                          paymentMethod === pm.id
                            ? "border-[var(--color-supreme-text)] bg-gray-900 text-white font-bold"
                            : "border-gray-200 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <pm.icon className="w-4 h-4" />
                        <span className="text-[9px] block uppercase font-bold">{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment option specific fields */}
                  {paymentMethod === 'wallet' && (
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Central Balance: ${(profile?.balance || 0).toFixed(2)}</span>
                      {profile?.balance < getStatusPrice(statusMode, disappearanceBooster, adDurationOption) ? (
                        <span className="text-red-500 font-bold font-mono">Insufficient balance</span>
                      ) : (
                        <span className="text-green-600 font-bold">✓ Balance sufficient</span>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'stripe' && (
                    <div className="space-y-1">
                      <input 
                        type="text"
                        value={stripeCardNumber}
                        onChange={(e) => setStripeCardNumber(e.target.value)}
                        placeholder="Card Number: 4242 •••• •••• 4242"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black"
                      />
                    </div>
                  )}

                  {paymentMethod === 'bitcoin' && (
                    <div className="text-[9px] text-gray-500 bg-white p-2 rounded-xl border border-gray-200 font-mono flex flex-col gap-1">
                      <span className="font-bold text-gray-700">SEND BTC TO ADDRESS:</span>
                      <span className="text-[8px] text-amber-600 font-bold select-all truncate">bc1qxy2kg3ut6g3ut6g3ut6g3ut6g3ut6g3ut6</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-2">
                {paymentPhase && (
                  <div className="text-center py-1.5 px-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-[10px] font-mono font-bold animate-pulse">
                    {paymentPhase}
                  </div>
                )}
                
                <button
                  onClick={handlePostStatus}
                  disabled={
                    isPostingStatus || 
                    !statusMediaUrl || 
                    (paymentMethod === 'wallet' && getStatusPrice(statusMode, disappearanceBooster, adDurationOption) > (profile?.balance || 0))
                  }
                  className="w-full py-4 bg-[var(--color-supreme-text)] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-xs tracking-wider uppercase"
                >
                  {isPostingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Securing Transaction...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post {statusMode === 'ad' ? 'Premium Ad Campaign' : 'Upgraded Status'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Rank Privileges Analysis Modal */}
      <AnimatePresence>
        {showRankAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Rank Privileges Analysis
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Understanding your network limits and benefits</p>
                </div>
                <button 
                  onClick={() => setShowRankAnalysis(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[var(--color-supreme-gold)]/10 to-yellow-500/10 border border-[var(--color-supreme-gold)]/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Current Rank</p>
                    <p className="text-2xl font-bold text-[var(--color-supreme-text)] capitalize">{user?.rank || 'Unranked'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Friend Limit</p>
                    <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">{getFriendLimit().toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Rank Progression</h3>
                  
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-600">Rank</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Friend Limit</th>
                          <th className="px-4 py-3 font-bold text-gray-600">Increase</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className={user?.rank === 'royal' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-purple-600">Royal</td>
                          <td className="px-4 py-3 font-medium">1,000</td>
                          <td className="px-4 py-3 text-gray-500">-</td>
                        </tr>
                        <tr className={user?.rank === 'elite' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-blue-600">Elite</td>
                          <td className="px-4 py-3 font-medium">1,500</td>
                          <td className="px-4 py-3 text-green-600 font-medium">+500</td>
                        </tr>
                        <tr className={user?.rank === 'silver' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-slate-500">Silver</td>
                          <td className="px-4 py-3 font-medium">2,500</td>
                          <td className="px-4 py-3 text-green-600 font-medium">+1,000</td>
                        </tr>
                        <tr className={user?.rank === 'diamond' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-cyan-500">Diamond</td>
                          <td className="px-4 py-3 font-medium">4,000</td>
                          <td className="px-4 py-3 text-green-600 font-medium">+1,500</td>
                        </tr>
                        <tr className={user?.rank === 'gold' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-yellow-500">Gold</td>
                          <td className="px-4 py-3 font-medium">5,000</td>
                          <td className="px-4 py-3 text-green-600 font-medium">+1,000</td>
                        </tr>
                        <tr className={user?.rank === 'crowned' ? 'bg-[var(--color-supreme-gold)]/5' : ''}>
                          <td className="px-4 py-3 font-bold text-[var(--color-supreme-gold)]">Crowned</td>
                          <td className="px-4 py-3 font-medium">7,000</td>
                          <td className="px-4 py-3 text-green-600 font-medium">+2,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Unlimited Engagement</h4>
                    <p className="text-xs text-blue-800/80 leading-relaxed">
                      Regardless of your rank, you have <strong>unlimited</strong> access to likes, dislikes, comments, subscriptions, and followers. However, your earnings potential is tiered to your subscription level.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
                  <Sparkles className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Additive Growth</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      When you upgrade your rank (e.g., from Royal to Elite), your friend limit increases additively (+500), not multiplicatively. This ensures a fair and balanced network growth for all users.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Thermal Receipt Invoice Modal */}
      <AnimatePresence>
        {selectedReceipt !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#FAFAFA] text-slate-800 font-mono text-xs p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-200/80 relative"
            >
              {/* Decorative sprocket holes for a real thermal checkout receipt feel */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 -ml-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10" />
                ))}
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 -mr-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10" />
                ))}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* Store Header */}
              <div className="text-center space-y-1.5 border-b border-dashed border-slate-300 pb-4">
                <h2 className="text-xs font-bold text-slate-900 tracking-wider">★ SUPREME VIBES NETWORK ★</h2>
                <p className="text-[8px] text-slate-400">ZONE: STATUS-PAYMENT-LEDGER-V1</p>
                <p className="text-[10px] text-slate-600 font-black">INVOICE TRANSACTION RECEIPT</p>
              </div>

              {/* Meta information */}
              <div className="py-4 space-y-1.5 border-b border-dashed border-slate-300 text-[9px] text-slate-600">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.receiptNumber || 'REC-892102'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span className="font-bold text-slate-900">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>OPERATOR:</span>
                  <span className="font-bold text-slate-900">supreme-wallet-processor</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENT EMAIL:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{user?.email}</span>
                </div>
              </div>

              {/* Line items */}
              <div className="py-4 space-y-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-slate-900 font-bold text-[10px]">
                  <span>ITEM DESCRIPTION</span>
                  <span>TOTAL</span>
                </div>
                <div className="flex justify-between items-start text-slate-700 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="block font-bold">
                      {selectedReceipt.type === 'advertisement' ? '📢 Sponsored Video Ad Space' : '🚀 Hourly Status Boost'}
                    </span>
                    <span className="block text-[8px] text-slate-400">
                      {selectedReceipt.type === 'advertisement' 
                        ? `Duration: ${selectedReceipt.adDuration || '1 week'}` 
                        : `Boost: +${selectedReceipt.boostHours || 50} Hours`}
                    </span>
                    <span className="block text-[8px] text-slate-400">Expires: {new Date(selectedReceipt.expiresAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">${selectedReceipt.price?.toFixed(2)}</span>
                </div>
              </div>

              {/* Totals calculations */}
              <div className="py-4 space-y-1.5 border-b border-dashed border-slate-300 text-[10px]">
                <div className="flex justify-between text-slate-600">
                  <span>SUBTOTAL:</span>
                  <span>${selectedReceipt.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>NETWORK PROMO DISCOUNT (0%):</span>
                  <span>-$0.00</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-[11px] pt-1">
                  <span>AMOUNT CHARGED:</span>
                  <span className="font-mono">${selectedReceipt.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                  <span>METHOD:</span>
                  <span className="uppercase font-bold">{selectedReceipt.paymentMethod || 'wallet'}</span>
                </div>
              </div>

              {/* QR Code and verification hash */}
              <div className="py-4 text-center space-y-2">
                <p className="text-[7px] text-slate-400 uppercase tracking-widest">Secure Verification QR Code</p>
                <div className="w-20 h-20 mx-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <QRCodeSVG 
                    value={`https://supremevibes.network/verify/tx/${selectedReceipt.id}`}
                    size={72}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-[7px] font-mono text-slate-400 truncate tracking-tighter">REF-HASH: {selectedReceipt.id}</p>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 space-y-1 text-[8px] text-slate-400 border-t border-dashed border-slate-300">
                <p className="font-bold text-slate-800">★★★★★ THANK YOU FOR FLYING HIGH ★★★★★</p>
                <p>Verify ledger status at supremevibes.network/ledger</p>
              </div>

              {/* Print Receipt Button */}
              <button 
                onClick={() => {
                  toast.success("🖨 Transmitting print job to local thermal device successfully!");
                }}
                className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-[9px] tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </FeatureLoader>
  );
}
