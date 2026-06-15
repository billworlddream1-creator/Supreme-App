import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, MessageCircle, Share2, ThumbsDown, Plus, Check, Volume2, VolumeX, Play, ExternalLink, X, Settings, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAds } from '../context/AdsContext';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const MOCK_VIBES = Array.from({ length: 15 }).map((_, i) => ({
  id: `vibe-${i}`,
  type: 'vibe',
  url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  author: `Creator_${i + 1}`,
  avatar: `https://i.pravatar.cc/150?u=vibe${i}`,
  mediaId: `MID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  description: `This is an amazing Supreme Vibe #${i + 1}! #supreme #vibes #trending`,
  likes: Math.floor(Math.random() * 100000),
  comments: Math.floor(Math.random() * 5000),
  shares: Math.floor(Math.random() * 2000),
}));

const MOCK_ADS = Array.from({ length: 3 }).map((_, i) => ({
  id: `ad-${i}`,
  type: 'ad',
  url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  author: `Sponsored_Brand_${i + 1}`,
  avatar: `https://picsum.photos/seed/brand${i}/150`,
  mediaId: `MID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  description: `Check out our new products! Exclusive deals for Supreme users. #ad #sponsored`,
  likes: Math.floor(Math.random() * 5000),
  comments: Math.floor(Math.random() * 100),
  shares: Math.floor(Math.random() * 50),
  link: 'https://example.com'
}));

// Inject ads every 5 vibes
const generateFeed = () => {
  const feed = [];
  let adIndex = 0;
  MOCK_VIBES.forEach((vibe, index) => {
    feed.push(vibe);
    if ((index + 1) % 5 === 0 && MOCK_ADS[adIndex]) {
      feed.push(MOCK_ADS[adIndex]);
      adIndex++;
    }
  });
  return feed;
};

const INITIAL_FEED = generateFeed();

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const VibePlayer = ({ item, isActive, isMuted, toggleMute }: { key?: string | number, item: any, isActive: boolean, isMuted: boolean, toggleMute: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { subscriptions, toggleSubscription } = useNetwork();
  const { user } = useAuth();
  const { getSubscription, plans } = useSubscription();
  const { incrementVideoPlaytime, shouldShowVideoAd, resetVideoAdTimer, getActiveAds } = useAds();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [shareCategory, setShareCategory] = useState('Trending');

  const handleShareToFeed = () => {
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
      author: user?.name || 'Supreme Vibes Fan',
      handle: user?.email ? `@${user.email.split('@')[0]}` : '@suprememember',
      avatar: 'https://picsum.photos/seed/me/150',
      content: shareCaption,
      images: [],
      video: item.url, // Share the vibes internal video URL
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
    setShowShareModal(false);
    toast.success("🚀 Shared vibe clip to Supreme Feed successfully! Check it out in the Network Feed.");
  };

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

  // Ad overlay state
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const activeAd = useRef(getActiveAds()[0] || null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isAdPlaying) {
      interval = setInterval(() => {
        incrementVideoPlaytime(1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAdPlaying, incrementVideoPlaytime]);

  useEffect(() => {
    if (shouldShowVideoAd && isPlaying && !isAdPlaying) {
      setIsAdPlaying(true);
      videoRef.current?.pause();
      setIsPlaying(false);
      setCanSkipAd(false);
      setAdTimeLeft(5);
      activeAd.current = getActiveAds()[0] || { 
        id: 'default-ad', 
        title: 'Supreme Sponsored Ad', 
        content: 'Check out the latest from Supreme Network.', 
        type: 'video', 
        backgroundColor: '#B8860B',
        userId: 'system',
        size: 'medium-rectangle',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        subscriptionId: 'system',
        clicks: 0,
        revenue: 0,
        status: 'active',
        level: 1
      };
    }
  }, [shouldShowVideoAd, isPlaying, isAdPlaying, getActiveAds]);

  const handleAdTimeUpdate = () => {
    if (adVideoRef.current) {
      const current = adVideoRef.current.currentTime;
      if (current >= 5 && !canSkipAd) {
        setCanSkipAd(true);
      } else if (!canSkipAd) {
        setAdTimeLeft(Math.ceil(5 - current));
      }
    }
  };

  const handleSkipAd = () => {
    setIsAdPlaying(false);
    resetVideoAdTimer();
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const isSubscribed = subscriptions.includes(item.author);

  useEffect(() => {
    if (isActive && !isAdPlaying) {
      const playPromise = videoRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      if (videoRef.current && !isAdPlaying) videoRef.current.currentTime = 0;
    }
  }, [isActive, isAdPlaying]);

  const togglePlay = () => {
    if (isAdPlaying) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
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
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="relative w-full h-full snap-start bg-black flex items-center justify-center overflow-hidden group">
      <video
        ref={videoRef}
        src={item.url}
        loop
        muted={isMuted}
        playsInline
        className={clsx("w-full h-full object-cover cursor-pointer", isAdPlaying && "hidden")}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      {/* Ad Overlay */}
      {isAdPlaying && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video
            ref={adVideoRef}
            src={activeAd.current?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
            autoPlay
            className="w-full h-full object-contain"
            onTimeUpdate={handleAdTimeUpdate}
            onEnded={handleSkipAd}
            playsInline
          />
          <div className="absolute top-4 left-4 bg-[var(--color-supreme-gold)] text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
            Sponsored • {activeAd.current?.title}
          </div>
          <div className="absolute bottom-24 right-4">
            {canSkipAd ? (
              <button 
                onClick={handleSkipAd}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-full border border-white/30 transition-all shadow-xl text-sm"
              >
                Skip Ad <Play className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-4 py-2 bg-black/50 backdrop-blur-md text-white font-bold rounded-full border border-white/10 text-sm">
                Skip in {adTimeLeft}
              </div>
            )}
          </div>
          <div className="absolute bottom-24 left-4">
             <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-white font-bold rounded-full transition-all shadow-xl text-sm">
                Learn More <ExternalLink className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}

      {!isPlaying && !isAdPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Ad Badge */}
      {item.type === 'ad' && (
        <div className="absolute top-6 left-4 bg-[var(--color-supreme-gold)] text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg">
          Sponsored
        </div>
      )}

      {/* Mute Toggle & Settings */}
      <div className="absolute top-6 right-4 flex flex-col gap-4 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="absolute top-0 right-full mr-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 min-w-[120px]"
              >
                <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-1">Speed</p>
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                      setPlaybackRate(rate);
                      setShowSettings(false);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      playbackRate === rate ? "bg-[var(--color-supreme-gold)] text-white" : "text-white hover:bg-white/10"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <div className="relative group/avatar cursor-pointer">
          <img src={item.avatar} alt={item.author} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSubscription(item.author); }}
            className={clsx(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-md",
              isSubscribed ? "bg-gray-200 text-gray-800" : "bg-[var(--color-supreme-gold)] text-white"
            )}
          >
            {isSubscribed ? <Check className="w-3 h-3" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        <button onClick={() => { setIsLiked(!isLiked); setIsDisliked(false); }} className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/40 group-hover/btn:bg-black/60 backdrop-blur-md rounded-full transition-colors">
            <Heart className={clsx("w-6 h-6 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(item.likes + (isLiked ? 1 : 0))}</span>
        </button>

        <button onClick={() => { setIsDisliked(!isDisliked); setIsLiked(false); }} className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/40 group-hover/btn:bg-black/60 backdrop-blur-md rounded-full transition-colors">
            <ThumbsDown className={clsx("w-6 h-6 transition-colors", isDisliked ? "fill-gray-400 text-gray-400" : "text-white")} />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Dislike</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1 group/btn">
          <div className="p-3 bg-black/40 group-hover/btn:bg-black/60 backdrop-blur-md rounded-full transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(item.comments)}</span>
        </button>

        <button 
          onClick={() => {
            if (canDownload) {
              incrementDailyDownloads();
              const link = document.createElement('a');
              link.href = item.url;
              link.download = `supreme_vibe_${item.id}.mp4`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              if (maxDownloads === 0) {
                alert("Downloads are only available for Royal rank or Paid subscribers.");
              } else {
                alert(`You have reached your daily download limit of ${maxDownloads}.`);
              }
            }
          }} 
          className="flex flex-col items-center gap-1 group/btn"
        >
          <div className={clsx("p-3 backdrop-blur-md rounded-full transition-colors", canDownload ? "bg-black/40 group-hover/btn:bg-black/60" : "bg-gray-800/40 opacity-50 cursor-not-allowed")}>
            <Download className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">
            {canDownload ? (maxDownloads === Infinity ? '∞' : maxDownloads - dailyDownloads.count) : '0'}
          </span>
        </button>

        <button 
          onClick={() => {
            setShareCaption(`Look at this amazing Supreme Vibes clip from @${item.author}! Shared with the Supreme Network.`);
            setShowShareModal(true);
          }}
          className="flex flex-col items-center gap-1 group/btn"
          title="Share to Supreme Feed"
        >
          <div className="p-3 bg-black/40 group-hover/btn:bg-black/60 backdrop-blur-md rounded-full transition-colors">
            <Share2 className="w-6 h-6 text-white text-[var(--color-supreme-gold)]" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">{formatNumber(item.shares)}</span>
        </button>
      </div>

      {/* Bottom Info & Progress */}
      <div className="absolute bottom-4 left-4 right-20 z-10">
        <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md flex items-center gap-2">
          @{item.author}
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-[var(--color-supreme-gold)] backdrop-blur-md border border-white/10">{item.mediaId}</span>
        </h3>
        <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md mb-3">{item.description}</p>
        
        {/* Progress Bar */}
        {!isAdPlaying && (
          <div className="relative w-full group/progress mb-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-[var(--color-supreme-gold)] hover:h-1.5 transition-all"
            />
            <div 
              className="absolute top-0 left-0 h-1 bg-[var(--color-supreme-gold)] rounded-full pointer-events-none group-hover/progress:h-1.5 transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        )}

        {item.type === 'ad' && item.link && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
          >
            Learn More <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Comments Drawer (Simplified) */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-white rounded-t-2xl z-20 flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h4 className="font-bold text-gray-900">Comments ({formatNumber(item.comments)})</h4>
            <button onClick={() => setShowComments(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center text-gray-500">
            Comments section coming soon...
          </div>
        </div>
      )}

      {/* Share to Feed Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-35 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-white"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl overflow-hidden relative text-left"
            >
              {/* Premium Top Border Indicator */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600" />
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-neutral-100">
                  <Share2 className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Share Vibe to Feed
                </h4>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-neutral-850 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 text-left">
                  <p className="text-[10px] text-[var(--color-supreme-gold)] font-mono uppercase tracking-widest mb-0.5">Vibe ID: {item.mediaId}</p>
                  <h5 className="text-xs font-bold text-neutral-200 truncate">@{item.author} Video Clip</h5>
                  <p className="text-[10px] text-neutral-400 line-clamp-1">{item.description}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-mono">My Commentary</label>
                  <textarea
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-950 text-white placeholder-neutral-550 border border-neutral-800 rounded-xl focus:outline-none focus:border-[var(--color-supreme-gold)] text-xs resize-none"
                    placeholder="Reflections on this awesome clip..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 font-mono">Platform Category</label>
                  <select 
                    value={shareCategory}
                    onChange={(e) => setShareCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-neutral-200 outline-none"
                  >
                    <option value="Trending">Trending</option>
                    <option value="News">News</option>
                    <option value="Tech">Tech</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleShareToFeed}
                    className="flex-1 py-2 bg-[var(--color-supreme-gold)] text-amber-950 font-bold rounded-lg hover:opacity-95 shadow-md"
                  >
                    Share Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SupremeVibes() {
  const { getActiveAds } = useAds();
  const level1Ads = getActiveAds(1);
  const [feed, setFeed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vibes = [...MOCK_VIBES];
    const newFeed: any[] = [];
    let adIndex = 0;
    
    vibes.forEach((vibe, index) => {
      newFeed.push(vibe);
      if ((index + 1) % 7 === 0 && level1Ads.length > 0) {
        const ad = level1Ads[adIndex % level1Ads.length];
        newFeed.push({
          ...ad,
          id: `ad-${ad.id}-${index}`,
          type: 'ad',
          url: ad.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          author: ad.title,
          avatar: `https://picsum.photos/seed/${ad.id}/150`,
          mediaId: `AD-${ad.id}`,
          description: ad.content,
          likes: 0,
          comments: 0,
          shares: 0,
          link: ad.url
        });
        adIndex++;
      }
    });

    if (!searchQuery.trim()) {
      setFeed(newFeed);
      return;
    }
    const lowerQ = searchQuery.toLowerCase();
    const filtered = newFeed.filter(item => 
      item.author.toLowerCase().includes(lowerQ) || 
      item.description.toLowerCase().includes(lowerQ) ||
      (item.mediaId && item.mediaId.toLowerCase().includes(lowerQ))
    );
    setFeed(filtered);
  }, [searchQuery, level1Ads]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-16rem)] py-4">
      <div className={clsx(
        "relative w-full transition-all duration-500 ease-in-out bg-black overflow-hidden shadow-2xl",
        "h-[calc(100vh-18rem)] min-h-[500px]",
        "md:max-w-[400px] md:h-[750px] md:rounded-[3rem] md:border-[12px] md:border-gray-900 md:ring-4 md:ring-gray-800"
      )}>
        {/* Phone Notch (Desktop Only) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-30" />
        
        {/* Search Bar */}
        <div className="absolute top-6 left-4 right-16 z-20 md:top-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input 
              type="text" 
              placeholder="Search Vibes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/20 text-white placeholder-white/70 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] backdrop-blur-md transition-all"
            />
          </div>
        </div>

        {/* Feed Container */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          {feed.length > 0 ? (
            feed.map((item, index) => (
              <VibePlayer 
                key={`${item.id}-${index}`} 
                item={item} 
                isActive={index === activeIndex} 
                isMuted={isMuted}
                toggleMute={() => setIsMuted(!isMuted)}
              />
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p>No vibes found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Home Indicator (Desktop Only) */}
        <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full z-30" />
      </div>
      
      {/* Desktop Helper Text */}
      <p className="hidden md:block mt-6 text-gray-400 text-xs font-medium uppercase tracking-widest">
        Scroll to explore more vibes
      </p>
    </div>
  );
}
