import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { Play, Mic, Video, Film, ThumbsUp, ThumbsDown, MessageSquare, UserPlus, Maximize, X, Eye, UserCheck, Shuffle, ChevronLeft, ChevronRight, Wand2, Sparkles, Search, Download, Crown, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
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

  const isSubscribed = activeVideo ? subscriptions.includes(activeVideo.author) : false;

  const streamingSub = getSubscription('streaming');
  const generalSub = getSubscription('general');
  const activeSub = streamingSub || generalSub;
  const currentPlan = activeSub ? plans.find(p => p.id === activeSub.planId) : null;
  
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

      {/* Cinematic View Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex flex-col">
                    <h3 className="text-white font-bold truncate pr-4">{activeVideo.title}</h3>
                    <span className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded w-fit mt-1">{activeVideo.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player Area */}
            <div className="flex-1 flex items-center justify-center relative w-full max-w-7xl mx-auto p-4 md:p-12 mt-12 md:mt-0">
              
              {/* Prev Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevVideo(); }}
                className="absolute left-2 md:left-4 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                disabled={displayedVideos.findIndex(v => v.id === activeVideo?.id) === 0}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group z-10">
                <VideoPlayer 
                  src={activeVideo.url} 
                  poster={activeVideo.thumbnail}
                  autoPlay 
                  onNext={handleNextVideo}
                  onPrev={handlePrevVideo}
                />
              </div>

              {/* Next Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextVideo(); }}
                className="absolute right-2 md:right-4 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                disabled={displayedVideos.findIndex(v => v.id === activeVideo?.id) === displayedVideos.length - 1}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Interaction Bar */}
            <div className="bg-gray-900/80 backdrop-blur-md border-t border-white/10 p-4 md:p-6 3xl:p-10 4xl:p-16 5xl:p-24 pb-safe">
              <div className="max-w-6xl 3xl:max-w-[1800px] 4xl:max-w-[2400px] 5xl:max-w-[3600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 3xl:gap-10 4xl:gap-16 5xl:gap-24">
                
                {/* Author Info */}
                <div className="flex items-center gap-4 3xl:gap-8 4xl:gap-12 5xl:gap-16">
                  <img src={activeVideo.avatar} alt={activeVideo.author} className="w-12 h-12 3xl:w-20 3xl:h-20 4xl:w-32 4xl:h-32 5xl:w-48 5xl:h-48 rounded-full object-cover border-2 border-[var(--color-supreme-gold)]" />
                  <div>
                    <h4 className="text-white font-bold text-lg 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl flex items-center gap-2 3xl:gap-4">
                      {activeVideo.author}
                      <span className="text-[10px] 3xl:text-sm 4xl:text-xl 5xl:text-3xl bg-white/10 px-2 py-0.5 3xl:px-4 3xl:py-2 rounded-full font-mono text-[var(--color-supreme-gold)]">{activeVideo.mediaId}</span>
                    </h4>
                    <p className="text-gray-400 text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl">{formatNumber(allVideos.find(v => v.id === activeVideo.id)?.followers || activeVideo.followers)} subscribers</p>
                  </div>
                  <button 
                    onClick={() => handleRestrictedAction(handleFollowCreator)}
                    className={clsx(
                      "ml-4 px-6 py-2 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-6 5xl:px-24 5xl:py-10 rounded-full font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl transition-all flex items-center gap-2 3xl:gap-4",
                      isFollowing 
                        ? "bg-white/20 text-white border border-white/20" 
                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                    )}
                  >
                    {isFollowing ? <><UserCheck className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Subscribed</> : <><UserPlus className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Subscribe</>}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4 3xl:gap-6 4xl:gap-10 5xl:gap-14 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  <div className="flex items-center bg-white/10 rounded-full p-1 3xl:p-2 4xl:p-4 5xl:p-6 backdrop-blur-md">
                    <button 
                      onClick={() => handleRestrictedAction(handleLikeVideo)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 rounded-full transition-colors",
                        isLiked ? "text-[var(--color-supreme-gold)] bg-white/10" : "text-white hover:bg-white/10"
                      )}
                    >
                      <ThumbsUp className={clsx("w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20", isLiked && "fill-current")} />
                      <span className="font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl">{formatNumber(allVideos.find(v => v.id === activeVideo.id)?.likes || activeVideo.likes)}</span>
                    </button>
                    <div className="w-px h-6 3xl:h-10 4xl:h-16 5xl:h-24 bg-white/20 mx-1 3xl:mx-2" />
                    <button 
                      onClick={() => handleRestrictedAction(() => { setIsDisliked(!isDisliked); setIsLiked(false); })}
                      className={clsx(
                        "px-4 py-2 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 rounded-full transition-colors",
                        isDisliked ? "text-red-400 bg-white/10" : "text-white hover:bg-white/10"
                      )}
                    >
                      <ThumbsDown className={clsx("w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20", isDisliked && "fill-current")} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowComments(!showComments)}
                    className={clsx(
                      "flex items-center gap-2 px-6 py-2.5 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-6 5xl:px-24 5xl:py-10 rounded-full transition-all backdrop-blur-md whitespace-nowrap font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl",
                      showComments 
                        ? "bg-[var(--color-supreme-gold)] text-white shadow-lg shadow-[var(--color-supreme-gold)]/20" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <MessageSquare className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                    Comment ({formatNumber(activeVideo.comments + activeComments.length - 3)})
                  </button>

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
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-6 5xl:px-24 5xl:py-10 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all backdrop-blur-md whitespace-nowrap font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl shadow-lg shadow-green-600/20"
                    >
                      <Download className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                      Download ({maxDownloads === Infinity ? '∞' : maxDownloads - dailyDownloads.count} left)
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (maxDownloads === 0) {
                          alert("Downloads are only available for Royal rank or Paid subscribers.");
                        } else {
                          alert(`You have reached your daily download limit of ${maxDownloads}.`);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 3xl:px-10 3xl:py-4 4xl:px-16 4xl:py-6 5xl:px-24 5xl:py-10 bg-gray-600 text-gray-300 rounded-full transition-all backdrop-blur-md whitespace-nowrap font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl cursor-not-allowed opacity-70"
                    >
                      <Download className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                      Download Limit Reached
                    </button>
                  )}

                  <button className="flex items-center gap-2 px-4 py-2.5 3xl:px-8 3xl:py-4 4xl:px-12 4xl:py-6 5xl:px-20 5xl:py-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md whitespace-nowrap ml-auto md:ml-0 font-bold text-sm 3xl:text-xl 4xl:text-3xl 5xl:text-5xl">
                    <Maximize className="w-5 h-5 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-20 5xl:h-20" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Comments Panel */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="max-w-6xl mx-auto mt-6 overflow-hidden"
                  >
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                        Comments <span className="text-gray-500 text-sm font-normal">({activeComments.length})</span>
                      </h5>
                      
                      <div className="flex gap-4 mb-8">
                        <img src={user?.avatar || 'https://i.pravatar.cc/150?u=me'} alt="Me" className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Add a comment..."
                            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] transition-all"
                          />
                          <button 
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                            className="px-6 py-2 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors disabled:opacity-50"
                          >
                            Post
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
                        {activeComments.map(comment => (
                          <motion.div 
                            key={comment.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-4 group/comment"
                          >
                            <div className="relative">
                              <img src={comment.avatar} alt={comment.user} className="w-10 h-10 3xl:w-16 3xl:h-16 rounded-full object-cover border border-white/10" />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover/comment:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-black text-xs 3xl:text-lg tracking-tight hover:text-[var(--color-supreme-gold)] cursor-pointer transition-colors">{comment.user}</span>
                                    <span className="text-[10px] 3xl:text-sm text-gray-500 font-medium">{comment.time}</span>
                                  </div>
                                  <button className="text-gray-500 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-gray-300 text-sm 3xl:text-xl leading-relaxed font-medium">{comment.text}</p>
                              </div>
                              <div className="flex items-center gap-6 mt-3 px-2">
                                <button 
                                  onClick={() => handleLikeComment(comment.id)}
                                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-[10px] 3xl:text-sm font-black uppercase tracking-widest transition-all active:scale-110"
                                >
                                  <ThumbsUp className={clsx("w-3.5 h-3.5 3xl:w-5 3xl:h-5", comment.likes > 0 && "fill-red-400 text-red-400")} />
                                  {comment.likes || 0}
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 text-[10px] 3xl:text-sm font-black uppercase tracking-widest transition-colors">
                                  <MessageSquare className="w-3.5 h-3.5 3xl:w-5 3xl:h-5" />
                                  Reply
                                </button>
                                <button className="text-gray-500 hover:text-white text-[10px] 3xl:text-sm font-black uppercase tracking-widest transition-colors">
                                  Report
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
    </div>
    </FeatureLoader>
  );
}
