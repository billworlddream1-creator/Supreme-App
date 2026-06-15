import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { Play, Mic, Video, Film, ThumbsUp, ThumbsDown, MessageSquare, UserPlus, Maximize, X, Eye, UserCheck, Shuffle, ChevronLeft, ChevronRight, Wand2, Sparkles, Search, Download, Crown, MoreHorizontal, Share2, Tv, Repeat, Minimize2, Check, RefreshCw, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import FeatureLoader from '../components/FeatureLoader';
import VideoPlayer from '../components/VideoPlayer';
import SupremeVibes from '../components/SupremeVibes';
import CreatorStudio from '../components/CreatorStudio';
import CardSkeleton from '../components/CardSkeleton';
import AdBanner from '../components/AdBanner';
import { useSubscription } from '../context/SubscriptionContext';
import { useAds } from '../context/AdsContext';

type MediaVideo = {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  followers: number;
  author: string;
  avatar: string;
  category: string;
  mediaId: string;
};

const CATEGORIES = ['All', 'Trending', 'Music', 'Gaming', 'News', 'Sports', 'Learning', 'Comedy', 'Movies', 'Tech'];

const generateVideos = (count: number): MediaVideo[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `vid-${i}`,
    url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video
    thumbnail: `https://picsum.photos/seed/supremevid${i}/640/360`,
    title: `Supreme Media Exclusive #${i + 1}`,
    views: Math.floor(Math.random() * 1000000) + 1000,
    likes: Math.floor(Math.random() * 50000) + 100,
    dislikes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 5000),
    followers: Math.floor(Math.random() * 100000) + 500,
    author: `Creator ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?u=supremevid${i}`,
    category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1], // Random category excluding 'All'
    mediaId: `MID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  }));
};

const ALL_VIDEOS = generateVideos(200);

export default function Media() {
  const { user } = useAuth();
  const { subscriptions, toggleSubscription } = useNetwork();
  const { getSubscription, plans } = useSubscription();
  const { getActiveAds } = useAds();
  const navigate = useNavigate();
  
  const level1Ads = getActiveAds(1);
  
  const [activeTab, setActiveTab] = useState<'tube' | 'vibes' | 'studio'>('tube');
  const [allVideos, setAllVideos] = useState<MediaVideo[]>(ALL_VIDEOS);
  const [displayedVideos, setDisplayedVideos] = useState<MediaVideo[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  // YouTube-style playback playing tools and states
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState(false);
  const [videoQuality, setVideoQuality] = useState<'1080p' | '720p' | '480p' | '360p' | 'Auto'>('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [activeVideo, setActiveVideo] = useState<MediaVideo | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeComments, setActiveComments] = useState<{id: number, user: string, text: string, time: string, avatar: string, likes: number}[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [showShareToFeedModal, setShowShareToFeedModal] = useState(false);
  const [shareCaptionText, setShareCaptionText] = useState('');
  const [shareCategory, setShareCategory] = useState('News');

  const isSubscribed = activeVideo ? subscriptions.includes(activeVideo.author) : false;

  const streamingSub = getSubscription('streaming');
  const generalSub = getSubscription('general');
  const activeSub = streamingSub || generalSub;
  const currentPlan = activeSub ? plans.find(p => p.id === activeSub.planId) : null;

  const handleShareToFeed = () => {
    if (!activeVideo) return;
    
    // Get stored posts
    const saved = localStorage.getItem('supreme_posts');
    let postsList: any[] = [];
    if (saved) {
      try {
        postsList = JSON.parse(saved);
      } catch (_) {
        postsList = [];
      }
    }
    
    const newPost = {
      id: Date.now(),
      author: user?.name || 'Supreme Member',
      handle: user?.email ? `@${user.email.split('@')[0]}` : '@suprememember',
      avatar: 'https://picsum.photos/seed/me/150',
      content: shareCaptionText,
      images: [],
      video: activeVideo.url, // Share the internal video URL
      likes: 0,
      dislikes: 0,
      comments: 0,
      shares: 0,
      time: 'Just now',
      bgColor: 'transparent',
      transformType: 'normal',
      category: shareCategory,
      privacy: 'public',
      authorFollowers: 1200,
      authorRank: 'Member',
      authorRankColor: 'text-orange-700',
      isPinned: false,
      gif: null,
      type: 'video'
    };
    
    localStorage.setItem('supreme_posts', JSON.stringify([newPost, ...postsList]));
    setShowShareToFeedModal(false);
    toast.success("🚀 Shared video to Supreme Network Feed! View it on the Network Feed.");
  };
  
  const getDailyDownloads = () => {
    if (!user) return { count: 0, date: new Date().toDateString() };
    const stored = localStorage.getItem(`dailyDownloads_${user.uid}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === new Date().toDateString()) {
        return parsed;
      }
    }
    return { count: 0, date: new Date().toDateString() };
  };

  const incrementDailyDownloads = () => {
    if (!user) return;
    const current = getDailyDownloads();
    localStorage.setItem(`dailyDownloads_${user.uid}`, JSON.stringify({
      count: current.count + 1,
      date: new Date().toDateString()
    }));
  };

  const isPaidUser = !!activeSub;
  const isRoyal = user?.rank?.toLowerCase() === 'royal';
  const isAdmin = user?.role === 'admin' || user?.role === 'mini-admin';
  
  const dailyDownloads = getDailyDownloads();
  const maxDownloads = isAdmin ? Infinity : (isPaidUser ? 3 : (isRoyal ? 1 : 0));
  const canDownload = maxDownloads > dailyDownloads.count;

  const handleRestrictedAction = (action: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action();
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadingMore(true);
        setTimeout(() => {
          setPage((prev) => prev + 1);
          setLoadingMore(false);
        }, 800);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [page]);

  // Filter and Pagination Logic
  useEffect(() => {
    let filtered = allVideos;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) || 
        v.author.toLowerCase().includes(query) ||
        v.mediaId.toLowerCase().includes(query)
      );
    }

    setDisplayedVideos(filtered.slice(0, page * 12));
    if (isInitialLoading) {
      setTimeout(() => setIsInitialLoading(false), 1500);
    }
  }, [page, selectedCategory, searchQuery, allVideos]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      // Randomize the "ALL_VIDEOS" order temporarily or just pick random ones
      // For this demo, let's just shuffle the currently displayed set and maybe add some new ones
      const shuffled = [...displayedVideos].sort(() => Math.random() - 0.5);
      setDisplayedVideos(shuffled);
      setIsShuffling(false);
    }, 500);
  };

  const handleNextVideo = () => {
    if (!activeVideo) return;
    const currentIndex = displayedVideos.findIndex(v => v.id === activeVideo.id);
    if (currentIndex < displayedVideos.length - 1) {
      openCinematicView(displayedVideos[currentIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    if (!activeVideo) return;
    const currentIndex = displayedVideos.findIndex(v => v.id === activeVideo.id);
    if (currentIndex > 0) {
      openCinematicView(displayedVideos[currentIndex - 1]);
    }
  };

  const openCinematicView = (video: MediaVideo, openComments = false) => {
    // Increment views in real-time
    setAllVideos(prev => prev.map(v => v.id === video.id ? { ...v, views: v.views + 1 } : v));
    
    setActiveVideo(video);
    setIsFollowing(subscriptions.includes(video.author));
    setIsLiked(false);
    setIsDisliked(false);
    setShowComments(openComments);
    setActiveComments([
      { id: 1, user: 'Supreme Fan', text: 'This is absolutely incredible! The quality is top-notch.', time: '2m ago', avatar: 'https://i.pravatar.cc/150?u=1', likes: 12 },
      { id: 2, user: 'Tech Guru', text: 'Amazing production value. Can\'t wait for the next one.', time: '1h ago', avatar: 'https://i.pravatar.cc/150?u=2', likes: 8 },
      { id: 3, user: 'Media Enthusiast', text: 'The Supreme Network is really changing the game.', time: '3h ago', avatar: 'https://i.pravatar.cc/150?u=3', likes: 5 },
    ]);
  };

  const handleLikeVideo = () => {
    if (!activeVideo) return;
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    
    setAllVideos(prev => prev.map(v => {
      if (v.id === activeVideo.id) {
        return { ...v, likes: isLiked ? v.likes - 1 : v.likes + 1 };
      }
      return v;
    }));
  };

  const handleFollowCreator = () => {
    if (!activeVideo) return;
    toggleSubscription(activeVideo.author);
    setIsFollowing(!isFollowing);
    
    setAllVideos(prev => prev.map(v => {
      if (v.author === activeVideo.author) {
        return { ...v, followers: isFollowing ? v.followers - 1 : v.followers + 1 };
      }
      return v;
    }));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: user?.name || 'Me',
      text: commentText,
      time: 'Just now',
      avatar: user?.avatar || 'https://i.pravatar.cc/150?u=me',
      likes: 0
    };
    setActiveComments([newComment, ...activeComments]);
    setCommentText('');
  };

  const handleLikeComment = (id: number) => {
    setActiveComments(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <FeatureLoader text="Video Tube">
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Supreme Media</h1>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('tube')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300",
              activeTab === 'tube' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Film className="w-4 h-4" /> Video Tube
          </button>
          <button
            onClick={() => setActiveTab('vibes')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300",
              activeTab === 'vibes' ? "bg-[var(--color-supreme-gold)] text-white shadow-md" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Sparkles className="w-4 h-4" /> Supreme Vibes
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300",
              activeTab === 'studio' ? "bg-white text-[var(--color-supreme-text)] shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Wand2 className="w-4 h-4" /> Creator Studio
          </button>
        </div>
      </div>
      
      {activeTab === 'vibes' && <SupremeVibes />}
      {activeTab === 'studio' && <CreatorStudio />}
      
      {activeTab === 'tube' && (
        <>
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Upload Video', 
                icon: Video, 
                iconColor: 'text-red-500', 
                bgColor: 'bg-red-500/10',
                hoverBorder: 'group-hover:border-red-500/50',
                hoverShadow: 'group-hover:shadow-red-500/10'
              },
          { 
            title: 'Go Live', 
            icon: Play, 
            iconColor: 'text-green-500', 
            bgColor: 'bg-green-500/10',
            hoverBorder: 'group-hover:border-green-500/50',
            hoverShadow: 'group-hover:shadow-green-500/10'
          },
          { 
            title: 'Podcast', 
            icon: Mic, 
            iconColor: 'text-purple-500', 
            bgColor: 'bg-purple-500/10',
            hoverBorder: 'group-hover:border-purple-500/50',
            hoverShadow: 'group-hover:shadow-purple-500/10'
          },
        ].map((item) => (
          <div 
            key={item.title} 
            onClick={() => handleRestrictedAction(() => {
              if (item.title === 'Upload Video') setActiveTab('studio');
              else if (item.title === 'Go Live') setShowGoLiveModal(true);
              else if (item.title === 'Podcast') setShowPodcastModal(true);
            })}
            title={`Start a new ${item.title.toLowerCase()} session`}
            className={clsx(
              "glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4",
              "bg-white/80 border border-gray-200 shadow-sm cursor-pointer group",
              "transition-all duration-300 ease-out",
              "hover:scale-105 hover:shadow-xl hover:bg-white",
              item.hoverBorder,
              item.hoverShadow
            )}
          >
            <div className={clsx(
              "p-4 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
              item.bgColor,
              item.iconColor
            )}>
              <item.icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-[var(--color-supreme-text)] text-xl group-hover:text-gray-900 transition-colors">
              {item.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Video Grid */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
              <Film className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Trending Now
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos or authors..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="flex-1 md:flex-none overflow-x-auto pb-2 md:pb-0 hide-scrollbar mask-gradient-right">
               <div className="flex gap-2">
                 {CATEGORIES.map(cat => (
                   <button
                     key={cat}
                     onClick={() => { setSelectedCategory(cat); setPage(1); }}
                     className={clsx(
                       "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                       selectedCategory === cat
                         ? "bg-[var(--color-supreme-gold)] text-white shadow-md"
                         : "bg-white/50 hover:bg-white text-gray-600 hover:text-[var(--color-supreme-text)] border border-transparent hover:border-gray-200"
                     )}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>
             
             <button
               onClick={handleShuffle}
               disabled={isShuffling}
               className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-[var(--color-supreme-text)] rounded-full font-bold text-sm transition-all border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md active:scale-95 shrink-0"
             >
               <Shuffle className={clsx("w-4 h-4", isShuffling && "animate-spin")} />
               <span className="hidden sm:inline">Shuffle</span>
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 5xl:grid-cols-8 gap-6 3xl:gap-8 4xl:gap-12 5xl:gap-16">
          {isInitialLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} type="video" />
            ))
          ) : (
            displayedVideos.map((video, index) => {
              const showAd = index > 0 && index % 8 === 0 && level1Ads.length > 0;
              const ad = showAd ? level1Ads[Math.floor((index / 8) % level1Ads.length)] : null;

              return (
                <React.Fragment key={video.id}>
                  {showAd && ad && (
                    <div className="col-span-full my-4">
                      <AdBanner ad={ad} className="w-full h-auto" />
                    </div>
                  )}
                  <motion.div 
                    layoutId={`video-${video.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel rounded-2xl 3xl:rounded-3xl overflow-hidden group cursor-pointer bg-white/80 border border-gray-200 shadow-sm hover:shadow-lg hover:border-[var(--color-supreme-gold)]/50 transition-all flex flex-col relative"
                    onMouseEnter={() => setHoveredVideoId(video.id)}
                    onMouseLeave={() => setHoveredVideoId(null)}
                    onClick={() => openCinematicView(video)}
                  >
                <div className="relative aspect-video overflow-hidden bg-gray-900">
                  {hoveredVideoId === video.id ? (
                    <video 
                      src={video.url} 
                      autoPlay 
                      muted 
                      loop 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute top-2 left-2 3xl:top-4 3xl:left-4 bg-black/50 backdrop-blur-md text-white text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-bold px-2 py-1 3xl:px-4 3xl:py-2 rounded-md z-10">
                      {video.category}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-4 3xl:gap-8 z-10">
                    <div className="w-12 h-12 3xl:w-20 3xl:h-20 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-14 4xl:h-14 5xl:w-20 5xl:h-20 text-white ml-1" />
                    </div>
                    <div className="flex flex-col gap-2 3xl:gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestrictedAction(() => {
                            toggleSubscription(video.author);
                            setAllVideos(prev => prev.map(v => v.author === video.author ? { ...v, followers: subscriptions.includes(video.author) ? v.followers - 1 : v.followers + 1 } : v));
                          });
                        }}
                        className={clsx(
                          "text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-bold px-2 py-1 3xl:px-4 3xl:py-2 rounded-md shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-all duration-300",
                          subscriptions.includes(video.author) ? "bg-white/20 backdrop-blur-md text-white" : "bg-red-600 text-white"
                        )}
                      >
                        {subscriptions.includes(video.author) ? 'Subscribed' : 'Subscribe'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openCinematicView(video, true);
                        }}
                        className="bg-white/20 backdrop-blur-md text-white text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-bold px-2 py-1 3xl:px-4 3xl:py-2 rounded-md shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-transform duration-300 delay-75 hover:bg-white/30"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 3xl:top-4 3xl:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openCinematicView(video);
                      }}
                      className="p-1.5 3xl:p-3 4xl:p-5 5xl:p-8 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-md text-white transition-colors"
                      title="Cinematic View"
                    >
                      <Maximize className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 3xl:bottom-4 3xl:right-4 bg-black/70 text-white text-xs 3xl:text-base 4xl:text-2xl 5xl:text-4xl font-bold px-2 py-1 3xl:px-4 3xl:py-2 rounded-md backdrop-blur-sm z-10">
                    12:34
                  </div>
                </div>
                <div className="p-4 3xl:p-8 4xl:p-12 5xl:p-16 flex gap-3 3xl:gap-6 flex-1">
                  <img src={video.avatar} alt={video.author} className="w-10 h-10 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-36 5xl:h-36 rounded-full object-cover border border-gray-200" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-supreme-text)] text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl line-clamp-2 group-hover:text-[var(--color-supreme-gold)] transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 3xl:mt-3">
                      <p className="text-gray-500 text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl truncate">{video.author}</p>
                      <p className="text-[var(--color-supreme-gold)] text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-mono ml-2">{video.mediaId}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1 3xl:mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestrictedAction(() => {
                            toggleSubscription(video.author);
                            setAllVideos(prev => prev.map(v => v.author === video.author ? { ...v, followers: subscriptions.includes(video.author) ? v.followers - 1 : v.followers + 1 } : v));
                          });
                        }}
                        className={clsx(
                          "text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity",
                          subscriptions.includes(video.author) ? "text-gray-400" : "text-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-gold-light)]"
                        )}
                      >
                        {subscriptions.includes(video.author) ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 3xl:gap-4 text-gray-400 text-xs 3xl:text-lg 4xl:text-2xl 5xl:text-4xl mt-1 3xl:mt-3">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" /> {formatNumber(video.views)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12" /> {formatNumber(video.likes)}</span>
                      <span>•</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })
      )}
    </div>

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="py-12 flex flex-col items-center justify-center">
          {loadingMore && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-[var(--color-supreme-gold)]/10 border-t-[var(--color-supreme-gold)] rounded-full animate-spin" />
                <Crown className="w-4 h-4 text-[var(--color-supreme-gold)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.2em] animate-pulse">Loading Supreme Flow</p>
            </div>
          )}
          {!loadingMore && displayedVideos.length === 0 && (
             <p className="text-gray-500 font-medium">No videos found in this category.</p>
          )}
        </div>
      </div>
      </>
      )}

      {/* YouTube Style Media Player & Feed Hub */}
      <AnimatePresence>
        {activeVideo && !isMiniPlayerActive && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-[100] bg-[#0f0f0f] text-[#f1f1f1] flex flex-col overflow-y-auto select-none"
          >
            {/* YouTube App Top Utility Bar */}
            <div className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setIsMiniPlayerActive(true);
                    toast.success("Minimized to floating Youtube player!");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-neutral-300 rounded-full transition-all animate-pulse"
                  title="Minimize Video to Mini-Player"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Minimize Layer</span>
                </button>
                <div className="h-4 w-px bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-xs text-[#ff0000] font-black tracking-[0.15em] uppercase">
                  <Play className="w-3.5 h-3.5 fill-[#ff0000] text-[#ff0000]" />
                  <span>Supreme Tube</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
                  Active ID: {activeVideo.mediaId}
                </span>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 bg-zinc-850 hover:bg-red-600/20 hover:text-red-500 rounded-full transition-all text-neutral-400"
                  title="Close Video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Player Workspace Grid */}
            <div className={clsx(
              "w-full transition-all duration-300",
              isTheaterMode ? "max-w-full" : "max-w-7xl mx-auto px-4 md:px-6 py-6"
            )}>
              {/* Theater Mode layout spans full width at the top */}
              {isTheaterMode && (
                <div className="w-full bg-black aspect-video lg:max-h-[70vh] mb-6 flex items-center justify-center relative shadow-2xl">
                  <div className="w-full h-full max-w-6xl">
                    <VideoPlayer 
                      src={activeVideo.url} 
                      poster={activeVideo.thumbnail}
                      autoPlay 
                      loop={isLooping}
                      onNext={handleNextVideo}
                      onPrev={handlePrevVideo}
                      onEnded={isLooping ? undefined : (isAutoplay ? handleNextVideo : undefined)}
                    />
                  </div>
                </div>
              )}

              {/* Multi-column Grid */}
              <div className={clsx(
                "grid grid-cols-1 lg:grid-cols-3 gap-6",
                isTheaterMode && "max-w-7xl mx-auto px-4 md:px-6 pb-12"
              )}>
                {/* Left/Main Column - Video details and comments */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Standard Mode Player resides inside this column */}
                  {!isTheaterMode && (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-850 relative group">
                      <VideoPlayer 
                        src={activeVideo.url} 
                        poster={activeVideo.thumbnail}
                        autoPlay 
                        loop={isLooping}
                        onNext={handleNextVideo}
                        onPrev={handlePrevVideo}
                        onEnded={isLooping ? undefined : (isAutoplay ? handleNextVideo : undefined)}
                      />
                    </div>
                  )}

                  {/* Playback & Interaction Controls Panel */}
                  <div className="space-y-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/40 backdrop-blur-md">
                    {/* Video Title */}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100 font-display">
                        {activeVideo.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-red-950 font-black tracking-widest text-[#ff3333] px-2 py-0.5 rounded text-[10px] uppercase border border-red-900">
                          Exclusive Private Stream
                        </span>
                        <span className="text-zinc-400 font-semibold">•</span>
                        <span className="text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                          {activeVideo.category}
                        </span>
                      </div>
                    </div>

                    {/* YouTube Active Playing Tools Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-widest">
                        <span>Tools Panel</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff0000] animate-pulse" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* Autoplay Tool */}
                        <button 
                          onClick={() => {
                            setIsAutoplay(!isAutoplay);
                            toast.info(`Autoplay ${!isAutoplay ? "Enabled" : "Disabled"}`);
                          }}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            isAutoplay 
                              ? "bg-red-950/40 border-red-800/60 text-red-100" 
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 text-zinc-400"
                          )}
                          title="Toggle Autoplay Next Video"
                        >
                          <RefreshCw className={clsx("w-3.5 h-3.5", isAutoplay && "animate-spin")} />
                          <span>Autoplay: {isAutoplay ? "ON" : "OFF"}</span>
                        </button>

                        {/* Loop Tool */}
                        <button 
                          onClick={() => {
                            setIsLooping(!isLooping);
                            toast.info(`Repeat Mode ${!isLooping ? "Activated" : "Deactivated"}`);
                          }}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            isLooping 
                              ? "bg-amber-950/40 border-amber-800/60 text-amber-100" 
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 text-zinc-400"
                          )}
                          title="Toggle Video Looping"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Loop: {isLooping ? "ON" : "OFF"}</span>
                        </button>

                        {/* Theater Mode Tool */}
                        <button 
                          onClick={() => {
                            setIsTheaterMode(!isTheaterMode);
                            toast.info(`Switched to ${!isTheaterMode ? "Theater" : "Standard"} Layout`);
                          }}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            isTheaterMode 
                              ? "bg-blue-950/40 border-blue-900/60 text-blue-100" 
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 text-zinc-400"
                          )}
                          title="Toggle Theater Mode Size"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>{isTheaterMode ? "Default View" : "Theater Mode"}</span>
                        </button>

                        {/* Quality Selector */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-bold text-neutral-305 text-white rounded-lg transition-all"
                            title="Adjust Playback Stream Quality"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Quality: {videoQuality}</span>
                          </button>

                          <AnimatePresence>
                            {showQualityMenu && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute bottom-full right-0 mb-2 bg-zinc-950 border border-zinc-800 p-1.5 rounded-xl shadow-2xl min-w-[140px] z-20 shadow-neutral-950"
                              >
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 py-1 border-b border-zinc-900 mb-1">
                                  Stream Resolution
                                </p>
                                {['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
                                  <button
                                    key={q}
                                    onClick={() => {
                                      setVideoQuality(q as any);
                                      setShowQualityMenu(false);
                                      toast.promise(
                                        new Promise(resolve => setTimeout(resolve, 800)),
                                        {
                                          loading: 'Recalculating network buffer...',
                                          success: `Streaming resolution updated to ${q === 'Auto' ? 'Optimized Auto' : q}`,
                                          error: 'Failed to adjust resolution',
                                        }
                                      );
                                    }}
                                    className={clsx(
                                      "w-full text-left px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-between",
                                      videoQuality === q ? "bg-red-650 bg-red-600 text-white font-black" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                    )}
                                  >
                                    <span>{q}</span>
                                    {videoQuality === q && <Check className="w-3 h-3" />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Action Row (YouTube style Layout) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-zinc-800/85">
                      
                      {/* Creator Channel branding */}
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={activeVideo.avatar} 
                          alt={activeVideo.author} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md shadow-amber-500/10" 
                        />
                        <div className="min-w-0">
                          <h4 className="text-white font-heavy text-base truncate flex items-center gap-1.5">
                            <span>{activeVideo.author}</span>
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          </h4>
                          <span className="text-xs text-zinc-400 font-medium">
                            {formatNumber(allVideos.find(v => v.id === activeVideo.id)?.followers || activeVideo.followers)} subscribers
                          </span>
                        </div>
                        <button 
                          onClick={() => handleRestrictedAction(handleFollowCreator)}
                          className={clsx(
                            "ml-3 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all",
                            isFollowing 
                              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700/80" 
                              : "bg-[#f1f1f1] text-[#0f0f0f] hover:bg-neutral-200"
                          )}
                        >
                          {isFollowing ? 'Subscribed' : 'Subscribe'}
                        </button>
                      </div>

                      {/* YouTube Interaction Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Likes/Dislikes Group */}
                        <div className="flex items-center bg-zinc-805 bg-zinc-800 hover:bg-zinc-750 rounded-full py-1 px-1 border border-zinc-750">
                          <button 
                            onClick={() => handleRestrictedAction(handleLikeVideo)}
                            className={clsx(
                              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all",
                              isLiked ? "text-amber-400 bg-zinc-900" : "text-white hover:bg-zinc-700/50"
                            )}
                          >
                            <ThumbsUp className={clsx("w-4 h-4", isLiked && "fill-current")} />
                            <span>{formatNumber(allVideos.find(v => v.id === activeVideo.id)?.likes || activeVideo.likes)}</span>
                          </button>
                          <div className="w-px h-4 bg-zinc-700" />
                          <button 
                            onClick={() => handleRestrictedAction(() => { setIsDisliked(!isDisliked); setIsLiked(false); })}
                            className={clsx(
                              "px-3.5 py-1.5 rounded-full text-xs font-black transition-all",
                              isDisliked ? "text-red-400 bg-zinc-900" : "text-white hover:bg-zinc-700/50"
                            )}
                            title="Dislike video"
                          >
                            <ThumbsDown className={clsx("w-4 h-4", isDisliked && "fill-current")} />
                          </button>
                        </div>

                        {/* Share to Supreme Feed */}
                        <button 
                          onClick={() => {
                            setShareCaptionText(`Check out this exclusive media content: "${activeVideo.title}"! Shared directly from Supreme Media Tube.`);
                            setShowShareToFeedModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-full transition-all text-xs font-black border border-zinc-750"
                          title="Share video to Supreme Feed"
                        >
                          <Share2 className="w-4 h-4 text-emerald-400" />
                          <span>Share</span>
                        </button>

                        {/* Premium Downloads */}
                        {canDownload ? (
                          <button 
                            onClick={() => {
                              incrementDailyDownloads();
                              // Simulate download
                              const link = document.createElement('a');
                              link.href = activeVideo.url;
                              link.download = `${activeVideo.title.replace(/\s+/g, '_')}_downloaded_from_supreme.mp4`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast.success("Streaming node download initialized!");
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-emerald-850 hover:bg-[#10b981]/15 text-white rounded-full transition-all text-xs font-black border border-zinc-750"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                            <span>Download ({maxDownloads === Infinity ? '∞' : maxDownloads - dailyDownloads.count} left)</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (maxDownloads === 0) {
                                toast.error("Downloads are only available for Royal rank or Paid subscribers.");
                              } else {
                                toast.error(`You have reached your daily download limit of ${maxDownloads}.`);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-zinc-500 rounded-full cursor-not-allowed opacity-60 text-xs font-black border border-zinc-850"
                          >
                            <Download className="w-4 h-4" />
                            <span>Limit Reached</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* YouTube Styled Description Card */}
                  <div 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="bg-zinc-900 hover:bg-zinc-850 p-4 rounded-xl border border-zinc-800/60 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4 text-xs font-black text-neutral-200 font-mono">
                        <span>{formatNumber(activeVideo.views)} views</span>
                        <span>•</span>
                        <span>2 hours ago</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">#SupremeExclusive</span>
                      </div>
                      <span className="text-xs text-red-400 font-bold hover:underline">
                        {isDescriptionExpanded ? "Show Less" : "Show More"}
                      </span>
                    </div>

                    <div className={clsx(
                      "text-xs text-zinc-300 leading-relaxed font-semibold transition-all duration-300",
                      isDescriptionExpanded ? "block animate-fadeIn" : "line-clamp-2"
                    )}>
                      <p className="mb-2">
                        Welcome to this supreme private showcase by {activeVideo.author}. This video content is licensed exclusively on the Supreme network.
                      </p>
                      <p className="mb-2">
                        We leverage super high-definition transcoding pipelines to deliver lightning-fast buffer-less rendering. Feel free to use the Custom playback playing tools to toggle Autoplay, persistent Looping playback, and cinematic Theater modes!
                      </p>
                      <div className="border-t border-zinc-800 mt-3 pt-3 flex flex-col gap-1.5 text-[11px] text-zinc-400">
                        <span className="font-heavy text-neutral-300 uppercase tracking-widest">Metadata Checklist</span>
                        <span>Category: {activeVideo.category}</span>
                        <span>Stream ID: {activeVideo.mediaId}</span>
                        <span>Encoder Profile: Supreme High-Efficiency Transcoder (AV1 v2)</span>
                        <span>License: Supreme Registered Digital Asset Copyright © 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-2xl backdrop-blur-md">
                    <h5 className="text-white text-base font-black mb-4 flex items-center gap-2">
                      <span>Comments</span> 
                      <span className="text-zinc-500 text-xs font-semibold">({activeComments.length})</span>
                    </h5>
                    
                    <div className="flex gap-3 mb-6">
                      <img 
                        src={user?.avatar || 'https://i.pravatar.cc/150?u=me'} 
                        alt="Me" 
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800" 
                      />
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                          placeholder="Add a public comment..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-xs font-semibold transition-all"
                        />
                        <button 
                          onClick={handleAddComment}
                          disabled={!commentText.trim()}
                          className="px-5 py-2 bg-red-600 hover:bg-red-705 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                      {activeComments.map(comment => (
                        <motion.div 
                          key={comment.id} 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex gap-3 group/comment border-b border-zinc-850/40 pb-3"
                        >
                          <img 
                            src={comment.avatar} 
                            alt={comment.user} 
                            className="w-9 h-9 rounded-full object-cover border border-zinc-800" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-neutral-200 font-bold text-xs hover:text-[var(--color-supreme-gold)] cursor-pointer transition-colors">
                                {comment.user}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium">
                                {comment.time}
                              </span>
                            </div>
                            <p className="text-zinc-350 text-xs font-semibold leading-relaxed">
                              {comment.text}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <button 
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center gap-1 text-zinc-500 hover:text-red-400 text-[10px] uppercase font-bold transition-all"
                              >
                                <ThumbsUp className={clsx("w-3 h-3", comment.likes > 0 && "fill-red-400 text-red-300")} />
                                <span>{comment.likes || 0}</span>
                              </button>
                              <button className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-[10px] uppercase font-bold">
                                <MessageSquare className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Recommended Videos ("Up Next") Sidebar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-red-500" />
                      <span>Recommended Up Next</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                      Auto Queue
                    </span>
                  </div>

                  <div className="space-y-3 lg:max-h-[120vh] overflow-y-auto pr-1">
                    {/* Filter out of allVideos list */}
                    {allVideos
                      .filter(v => v.id !== activeVideo.id)
                      .slice(0, 16)
                      .map((video, idx) => (
                        <motion.div
                          key={video.id}
                          className="flex gap-3 bg-zinc-900/10 hover:bg-zinc-850 hover:bg-neutral-900 p-2 rounded-xl border border-transparent hover:border-zinc-800 shadow-sm cursor-pointer transition-all duration-200 group"
                          onClick={() => {
                            toast.success(`Loading: "${video.title}"`);
                            openCinematicView(video);
                          }}
                        >
                          {/* Mini Thumbnail */}
                          <div className="relative w-32 sm:w-36 aspect-video rounded-lg overflow-hidden bg-black shrink-0 shadow">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-black text-white">
                              {12 + (idx % 3)}:{20 + (idx % 25)}
                            </div>
                            <div className="absolute top-1 left-1 bg-red-650 bg-red-600 px-1.5 py-0.5 rounded text-[7px] font-black tracking-wider text-white uppercase">
                              {video.category}
                            </div>
                          </div>

                          {/* Text Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h4 className="font-heavy text-neutral-100 text-xs line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                                {video.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-semibold truncate mt-1">
                                {video.author}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase mt-1">
                              <span>{formatNumber(video.views)} views</span>
                              <span>•</span>
                              <span>{idx + 1}d ago</span>
                            </div>
                          </div>
                        </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Picture-In-Picture Mini Player overlay */}
      <AnimatePresence>
        {activeVideo && isMiniPlayerActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, x: 50, y: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 aspect-video bg-neutral-950 border border-zinc-800 rounded-2xl shadow-2xl z-[90] overflow-hidden flex flex-col group/mini"
            layoutId="mini-player-container animate-fadeIn"
          >
            <div className="relative w-full h-full bg-black">
              <video 
                src={activeVideo.url} 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button 
                  onClick={() => setIsMiniPlayerActive(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all hover:scale-110 shadow-lg"
                  title="Expand to Fullscreen Player"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => {
                    setActiveVideo(null);
                    setIsMiniPlayerActive(false);
                    toast.info("Playback terminated.");
                  }}
                  className="p-2 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all hover:scale-110 shadow-lg"
                  title="Close Playback"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-neutral-100 truncate pointer-events-none border border-zinc-850">
                Playing: {activeVideo.title}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Go Live Modal */}
      <AnimatePresence>
        {showGoLiveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowGoLiveModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-supreme-bg)] border border-[var(--color-supreme-glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                  <Play className="w-6 h-6 text-green-500" /> Go Live
                </h3>
                <button onClick={() => setShowGoLiveModal(false)} className="text-gray-500 hover:text-[var(--color-supreme-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stream Title</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]" placeholder="What are you streaming about?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] bg-white">
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-800">Camera and microphone ready</span>
                </div>
                <button 
                  onClick={() => {
                    navigate('/streams');
                  }}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                >
                  Start Streaming
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Podcast Modal */}
      <AnimatePresence>
        {showPodcastModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPodcastModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-supreme-bg)] border border-[var(--color-supreme-glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                  <Mic className="w-6 h-6 text-purple-500" /> Start Podcast
                </h3>
                <button onClick={() => setShowPodcastModal(false)} className="text-gray-500 hover:text-[var(--color-supreme-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Episode Title</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]" placeholder="Enter episode title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invite Guests (Emails or Usernames)</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]" placeholder="e.g., @elonmusk, john@example.com" />
                </div>
                <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-800">Microphone ready. Audio-only mode.</span>
                </div>
                <button 
                  onClick={() => {
                    navigate('/streams');
                  }}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                >
                  Start Recording
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share to Supreme Feed Modal */}
      <AnimatePresence>
        {showShareToFeedModal && activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowShareToFeedModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-850 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white overflow-hidden relative"
            >
              {/* Premium Subtle Border Glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-supreme-gold)] via-amber-400 to-amber-600" />
              
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg sm:text-xl font-bold font-sans tracking-tight flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Broadcast to Network Feed
                </h3>
                <button 
                  onClick={() => setShowShareToFeedModal(false)} 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Embedded Video details card */}
                <div className="flex gap-3 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800">
                  <div className="w-24 aspect-video bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={activeVideo.thumbnail} alt={activeVideo.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[var(--color-supreme-gold)] font-mono uppercase tracking-wider mb-0.5">{activeVideo.category}</p>
                    <h4 className="text-sm font-bold truncate text-neutral-100">{activeVideo.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">by @{activeVideo.author}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">My Commentary / Caption</label>
                  <textarea 
                    value={shareCaptionText}
                    onChange={(e) => setShareCaptionText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-950 text-white placeholder-neutral-550 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[var(--color-supreme-gold)] transition-colors text-sm no-scrollbar resize-none"
                    placeholder="Tell your friends what this is about..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 font-mono">Stream Category</label>
                    <select 
                      value={shareCategory} 
                      onChange={(e) => setShareCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none text-xs text-neutral-200"
                    >
                      <option value="News">News</option>
                      <option value="Trending">Trending</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Music">Music</option>
                      <option value="Tech">Tech</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Movies">Movies</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <p className="text-[11px] text-neutral-500 mb-1.5 italic">✓ Policy Verified Option</p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-[10px] text-emerald-400 font-medium">
                      🔒 Secured Internal Asset Sharing
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowShareToFeedModal(false)}
                    className="flex-1 py-3 bg-neutral-800 text-neutral-300 hover:text-white font-bold rounded-xl hover:bg-neutral-700 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleShareToFeed}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-[var(--color-supreme-gold)] text-amber-950 font-bold rounded-xl hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-supreme-gold)]/10"
                  >
                    <Share2 className="w-4 h-4 text-amber-950" /> Publish Post
                  </button>
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
