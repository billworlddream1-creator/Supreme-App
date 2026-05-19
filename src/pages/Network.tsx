import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageCircle, Heart, Share2, MoreHorizontal, Crown, 
  CheckCircle, Image as ImageIcon, Video, Sparkles, Send, 
  Loader2, Wand2, Palette, X, ThumbsDown, UserPlus, Pin, 
  Trash2, Edit2, Smile, Play, Bell, Check, Search, Plus, 
  Globe, Shield, LayoutGrid, Filter, UserMinus, UserCheck, Clock,
  Twitter, Linkedin, Facebook, Link, Film, Languages, ChevronDown, AlertTriangle
} from 'lucide-react';
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
    ...Array.from({ length: 499 }, (_, i) => `hsl(${Math.floor(i * (360 / 499))}, 85%, 92%)`)
];

const postCategories = [
    'News', 'Sports', 'Football', 'Events', 'Accident', 'Church', 'Quotes', 
    'Preaching', 'Praying', 'Playing', 'Educational', 'Seminar', 'Violence', 'War', 'Other'
];

export default function Network() {
  const { user, profile } = useAuth();
  const { getActiveAds } = useAds();
  const level1Ads = getActiveAds(1);
  const navigate = useNavigate();
  const { 
    friends, friendRequests, sentRequests, communities, joinedCommunities,
    addFriend, sendFriendRequest, removeFriend, acceptFriendRequest, rejectFriendRequest,
    createCommunity, joinCommunity, leaveCommunity, searchCommunities, searchUsers,
    allUsers, getFriendLimit
  } = useNetwork();

  const [posts, setPosts] = useState(initialPosts);
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
  const [activeTab, setActiveTab] = useState<'feed' | 'communities' | 'connections' | 'discover' | 'notifications'>('feed');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  
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
      <div className="mb-6 -mx-4 sm:mx-0 overflow-x-auto no-scrollbar pb-2 pt-4">
        <div className="flex gap-4 min-w-max px-4 sm:px-1">
          {storyUsers.map((user, index) => (
            <div 
              key={user.id} 
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center gap-2 cursor-pointer group w-16 sm:w-20"
            >
              <div className="relative">
                <div className={clsx(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-transform group-hover:scale-105 duration-300",
                  user.isAdd ? "border-2 border-dashed border-gray-300" :
                  user.hasUnseen ? "bg-gradient-to-tr from-yellow-400 to-[var(--color-supreme-gold)]" : "border-2 border-gray-200"
                )}>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                {user.isAdd && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate w-full text-center">
                {user.name}
              </span>
            </div>
          ))}
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
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Library</span>
                                      <button onClick={() => setShowLibraryPicker(false)}><X className="w-4 h-4 text-gray-400" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 no-scrollbar">
                                      {LIBRARY_VIDEOS.map((video, idx) => (
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
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                <Twitter className="w-4 h-4 text-blue-400" />
                                Share on Twitter
                              </button>
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                <Linkedin className="w-4 h-4 text-blue-700" />
                                Share on LinkedIn
                              </button>
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Share on Facebook
                              </button>
                              <button 
                                onClick={() => {
                                  toast.success(`Successfully shared to your groups!`);
                                  setActiveSharePostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Users className="w-4 h-4 text-purple-600" />
                                Share to Groups
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://supreme-network.com/post/${post.id}`);
                                  setActiveSharePostId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Link className="w-4 h-4 text-gray-500" />
                                Copy Link
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
          ) : (
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

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && storyUsers[activeStoryIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md"
          >
            <div className="relative w-full h-full sm:w-[400px] sm:h-[80vh] sm:max-h-[800px] bg-gray-900 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 flex gap-1 p-4 z-20">
                <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 5, ease: 'linear' }}
                    onAnimationComplete={() => {
                      if (activeStoryIndex < storyUsers.length - 1) {
                        setActiveStoryIndex(activeStoryIndex + 1);
                      } else {
                        setActiveStoryIndex(null);
                      }
                    }}
                    className="h-full bg-white" 
                  />
                </div>
              </div>
              
              {/* Header */}
              <div className="absolute top-6 left-0 right-0 p-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={storyUsers[activeStoryIndex].avatar} alt={storyUsers[activeStoryIndex].name} className="w-10 h-10 rounded-full border-2 border-[var(--color-supreme-gold)] object-cover" />
                  <div>
                    <span className="text-white font-bold text-sm drop-shadow-md">{storyUsers[activeStoryIndex].name}</span>
                    <p className="text-white/80 text-xs drop-shadow-md">2h ago</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveStoryIndex(null)} 
                  className="p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Content (Image) */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <img 
                  src={storyUsers[activeStoryIndex].storyImage} 
                  alt="Story" 
                  className="w-full h-full object-cover" 
                />
                
                {/* Navigation Overlays */}
                <div 
                  className="absolute top-0 bottom-0 left-0 w-1/3 z-10 cursor-pointer" 
                  onClick={() => activeStoryIndex > 0 ? setActiveStoryIndex(activeStoryIndex - 1) : setActiveStoryIndex(null)} 
                />
                <div 
                  className="absolute top-0 bottom-0 right-0 w-2/3 z-10 cursor-pointer" 
                  onClick={() => activeStoryIndex < storyUsers.length - 1 ? setActiveStoryIndex(activeStoryIndex + 1) : setActiveStoryIndex(null)} 
                />
              </div>

              {/* Footer / Reply Area */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder={`Reply to ${storyUsers[activeStoryIndex].name}...`}
                      className="w-full bg-black/40 border border-white/20 text-white placeholder-white/60 rounded-full py-3 px-5 pr-12 focus:outline-none focus:border-white/50 backdrop-blur-md transition-all"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-3 text-white/80 hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
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
    </div>
    </FeatureLoader>
  );
}
