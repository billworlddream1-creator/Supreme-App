import React, { useRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Megaphone, Crown, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAds, Ad } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { event } from '../utils/analytics';
import { motion } from 'motion/react';

interface AdBannerProps {
  ad: Ad;
  className?: string;
}

const AD_SIZES = {
  'leaderboard': 'w-[728px] h-[90px] aspect-[728/90]',
  'banner': 'w-[468px] h-[60px] aspect-[468/60]',
  'large-rectangle': 'w-[336px] h-[280px] aspect-[336/280]',
  'medium-rectangle': 'w-[300px] h-[250px] aspect-[300/250]',
  'square': 'w-[250px] h-[250px] aspect-square',
  'skyscraper': 'w-[120px] h-[600px] aspect-[120/600]',
  'wide-skyscraper': 'w-[160px] h-[600px] aspect-[160/600]',
};

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const AdBanner: React.FC<AdBannerProps> = ({ ad, className }) => {
  const { trackClick } = useAds();
  const { user } = useAuth();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.id !== ad.id) {
        setIsMuted(true);
      }
    };
    window.addEventListener('ad-video-play', handleOtherPlay);
    return () => window.removeEventListener('ad-video-play', handleOtherPlay);
  }, [ad.id]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!newMuted) {
      window.dispatchEvent(new CustomEvent('ad-video-play', { detail: { id: ad.id } }));
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        if (!isMuted) {
          window.dispatchEvent(new CustomEvent('ad-video-play', { detail: { id: ad.id } }));
        }
      }
    }
  };

  const parsedContent = React.useMemo(() => {
    if (ad.type === 'video' || ad.type === 'image') return { text: '', color: 'white' };
    try {
      if (ad.content.startsWith('{')) {
        return JSON.parse(ad.content);
      }
    } catch (e) {}
    return { text: ad.content, color: 'white' };
  }, [ad.content, ad.type]);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [ad.content, ad.size]);

  const textBgStyle = React.useMemo(() => {
    if (ad.textBackgroundColor && ad.textBackgroundColor !== 'transparent') {
      return { backgroundColor: ad.textBackgroundColor, padding: '4px 8px', borderRadius: '4px' };
    }
    return {};
  }, [ad.textBackgroundColor]);

  const handleClick = (e: React.MouseEvent) => {
    trackClick(ad.id, user?.id);
    event({ action: 'click_ad', category: 'Ads', label: ad.type, value: ad.level });
    if (ad.url) {
      e.stopPropagation();
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (ad.type === 'video') {
    if (!ad.content) return null;
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden rounded-xl bg-black group cursor-pointer shadow-lg transition-transform hover:scale-[1.02] max-w-full border-2 border-gray-800",
          AD_SIZES[ad.size] || AD_SIZES['medium-rectangle'],
          className
        )}
      >
        {!isMediaLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-10">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        )}
        <video 
          ref={videoRef}
          src={ad.content || undefined} 
          className={cn("w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity", !isMediaLoaded && "opacity-0")}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          onLoadedData={() => setIsMediaLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-20">
          <h4 className="text-white font-bold text-sm truncate">{ad.title}</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Video Ad</span>
            {ad.url && (
              <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full font-bold">Visit Site</span>
            )}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <span className="bg-black/60 backdrop-blur-md text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-white/20">Level {ad.level} Ad</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={togglePlay}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleMute}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (ad.type === 'image') {
    if (!ad.content) return null;
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden rounded-xl bg-black group cursor-pointer shadow-lg transition-transform hover:scale-[1.02] max-w-full border-2 border-gray-800",
          AD_SIZES[ad.size] || AD_SIZES['medium-rectangle'],
          className
        )}
      >
        {!isMediaLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-10">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        )}
        <img 
          src={ad.content || undefined} 
          alt={ad.title}
          className={cn("w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity", !isMediaLoaded && "opacity-0")}
          referrerPolicy="no-referrer"
          onLoad={() => setIsMediaLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-20">
          <h4 className="text-white font-bold text-sm truncate">{ad.title}</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Image Ad</span>
            {ad.url && (
              <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full font-bold">Visit Site</span>
            )}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <span className="bg-black/60 backdrop-blur-md text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-white/20">Level {ad.level} Ad</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-xl flex flex-col items-center justify-center p-4 text-white font-bold text-center cursor-pointer shadow-lg transition-transform hover:scale-[1.02] group max-w-full border-2 border-white/10",
        ad.backgroundType === 'color' || !ad.backgroundType ? (ad.backgroundColor || 'bg-blue-500') : '',
        AD_SIZES[ad.size] || AD_SIZES['medium-rectangle'],
        className
      )}
    >
      {ad.backgroundType === 'image' && ad.backgroundUrl && (
        <>
          {!isMediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-0">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          )}
          <img 
            src={ad.backgroundUrl || undefined}
            alt="Background"
            className={cn("absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-50 transition-opacity", !isMediaLoaded && "opacity-0")}
            referrerPolicy="no-referrer"
            onLoad={() => setIsMediaLoaded(true)}
          />
        </>
      )}
      {ad.backgroundType === 'video' && ad.backgroundUrl && (
        <>
          {!isMediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse z-0">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          )}
          <video 
            ref={videoRef}
            src={ad.backgroundUrl || undefined}
            className={cn("absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-50 transition-opacity", !isMediaLoaded && "opacity-0")}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setIsMediaLoaded(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={togglePlay}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleMute}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </>
      )}
      {/* Digital Sign Post Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
      
      <div className="absolute top-2 left-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity z-20">
        <Megaphone className="w-3 h-3" />
        <span className="text-[8px] uppercase tracking-widest font-bold">Sponsored • Level {ad.level}</span>
      </div>
      
      <div className="relative z-10 space-y-2 w-full h-full flex flex-col justify-center max-h-full">
        <h4 className="text-lg md:text-xl leading-tight drop-shadow-md shrink-0 font-display tracking-tight">{ad.title}</h4>
        <div className="relative flex-1 min-h-0 overflow-hidden group/content">
          <div className={cn(
            "text-xs md:text-sm font-medium opacity-90 drop-shadow-sm h-full w-full flex items-center justify-center font-mono",
            isOverflowing && "animate-marquee-vertical"
          )}>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              ref={contentRef}
              className={cn(
                "w-full px-2",
                !isOverflowing && "line-clamp-4"
              )}
              style={{ color: parsedContent.color, ...textBgStyle }}
            >
              <span className="inline-block relative">
                {parsedContent.text.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, display: 'none' },
                      visible: { opacity: 1, display: 'inline' }
                    }}
                    transition={{ duration: 0.01 }}
                  >
                    {char}
                  </motion.span>
                ))}
                {isOverflowing && (
                  <div className="mt-8 opacity-50">
                    {parsedContent.text}
                  </div>
                )}
              </span>
            </motion.div>
          </div>
        </div>
        
        {ad.url && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <span className="inline-block bg-white text-black text-[10px] px-3 py-1 rounded-full font-bold shadow-lg">
              Visit Website
            </span>
          </div>
        )}
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
        <Crown className="w-16 h-16 md:w-24 md:h-24" />
      </div>

      <div className="absolute bottom-2 right-2 z-20">
        <span className="text-[8px] opacity-40 group-hover:opacity-100 transition-opacity font-mono">
          {ad.size.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default AdBanner;
