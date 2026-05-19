import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  X,
  RotateCcw, 
  RotateCw, 
  Settings,
  SkipBack,
  SkipForward,
  ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { useAds } from '../context/AdsContext';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  captions?: { label: string; src: string; srclang: string; default?: boolean }[];
}

export default function VideoPlayer({ src, poster, autoPlay = false, onNext, onPrev, captions }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const { incrementVideoPlaytime, shouldShowVideoAd, resetVideoAdTimer, getActiveAds } = useAds();
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const activeAd = useRef(getActiveAds(2)[0] || null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      activeAd.current = getActiveAds(2)[0] || { 
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
        level: 2
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
    const playPromise = videoRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
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
      if (autoPlay && !isAdPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ': // Space for play/pause
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f': // F for fullscreen
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm': // M for mute
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft': // ArrowLeft for backward skip
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright': // ArrowRight for forward skip
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup': // ArrowUp for volume up
          e.preventDefault();
          setVolume(prev => {
            const newVal = Math.min(prev + 0.1, 1);
            if (videoRef.current) videoRef.current.volume = newVal;
            setIsMuted(newVal === 0);
            return newVal;
          });
          break;
        case 'arrowdown': // ArrowDown for volume down
          e.preventDefault();
          setVolume(prev => {
            const newVal = Math.max(prev - 0.1, 0);
            if (videoRef.current) videoRef.current.volume = newVal;
            setIsMuted(newVal === 0);
            return newVal;
          });
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group overflow-hidden touch-none select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay && !isAdPlaying}
        className={clsx("w-full h-full object-contain cursor-pointer", isAdPlaying && "hidden")}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsWaiting(true)}
        onPlaying={() => setIsWaiting(false)}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label="Video Player"
        playsInline
      >
        {captions?.map((caption, idx) => (
          <track 
            key={idx}
            kind="captions"
            label={caption.label}
            src={caption.src}
            srcLang={caption.srclang}
            default={caption.default}
          />
        ))}
      </video>

      {/* Ad Overlay */}
      {isAdPlaying && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
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
          <div className="absolute bottom-8 right-8">
            {canSkipAd ? (
              <button 
                onClick={handleSkipAd}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-full border border-white/30 transition-all shadow-xl"
              >
                Skip Ad <SkipForward className="w-5 h-5" />
              </button>
            ) : (
              <div className="px-6 py-3 bg-black/50 backdrop-blur-md text-white font-bold rounded-full border border-white/10">
                You can skip to video in {adTimeLeft}
              </div>
            )}
          </div>
          <div className="absolute bottom-8 left-8">
             <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-white font-bold rounded-full transition-all shadow-xl">
                Learn More <ExternalLink className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      {/* Center Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && !isAdPlaying && !isWaiting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </div>
          </motion.div>
        )}
        {isWaiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 border-4 border-[var(--color-supreme-gold)]/30 border-t-[var(--color-supreme-gold)] rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && !isAdPlaying && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-black/40 p-4 md:p-6"
          >
            {/* Top Bar (Mobile friendly title or close could go here) */}
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            
            <div className="flex-1" onClick={togglePlay} />

            {/* Progress Bar */}
            <div className="relative w-full group/progress mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek Video"
                className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-[var(--color-supreme-gold)] hover:h-2 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:ring-offset-2 focus:ring-offset-black"
              />
              <div 
                className="absolute top-0 left-0 h-1.5 bg-[var(--color-supreme-gold)] rounded-full pointer-events-none"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={togglePlay} 
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>

                <div className="hidden md:flex items-center gap-2">
                  <button 
                    onClick={() => skip(-10)} 
                    aria-label="Skip Backward 10 Seconds"
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => skip(10)} 
                    aria-label="Skip Forward 10 Seconds"
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>

                {onPrev && (
                  <button 
                    onClick={onPrev} 
                    aria-label="Previous Video"
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>
                )}
                {onNext && (
                  <button 
                    onClick={onNext} 
                    aria-label="Next Video"
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                )}

                <div className="flex items-center gap-2 group/volume">
                  <button 
                    onClick={toggleMute} 
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume Control"
                    className="w-0 group-hover/volume:w-20 group-focus-within/volume:w-20 transition-all h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div className="text-white text-sm font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="Playback Settings"
                    aria-expanded={showSettings}
                    className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 min-w-[120px]"
                        role="menu"
                        aria-label="Settings Menu"
                      >
                        <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-1">Playback Speed</p>
                        {[0.5, 1, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => {
                              if (videoRef.current) videoRef.current.playbackRate = rate;
                              setPlaybackRate(rate);
                              setShowSettings(false);
                            }}
                            role="menuitem"
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

                <button 
                  onClick={toggleFullscreen} 
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  className="text-white hover:text-[var(--color-supreme-gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] rounded-full"
                >
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
