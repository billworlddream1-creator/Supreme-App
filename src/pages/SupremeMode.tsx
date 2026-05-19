import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Play, Video, ThumbsUp, ThumbsDown, MessageSquare, UserPlus, 
  Maximize, X, Eye, UserCheck, Shuffle, ChevronLeft, ChevronRight, 
  Sparkles, Plus, Radio, FileText, Image as ImageIcon, Loader2, 
  Mic, Camera, StopCircle, RefreshCw, Wand2, CheckCircle2, Pin, 
  Settings, Languages, Globe, ChevronDown, Music, Volume2, 
  Type, Layers, Trash2, Save, Download, Ghost, Filter, Wind
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { generateContent } from '../services/aiService';

import CardSkeleton from '../components/CardSkeleton';

type SupremePost = {
  id: string;
  type: 'video' | 'image' | 'text';
  isPinned?: boolean;
  url?: string; // for video or image
  content?: string; // for text postcard
  thumbnail?: string;
  title: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  followers: number;
  author: string;
  avatar: string;
  category: string;
};

const CATEGORIES = ['All', 'Inspirations', 'Teaching', 'Preaching', 'Testimony', 'Gospel insight', 'Gospel events', 'Bible words', 'Sermon'];
const POST_TYPES = ['All', 'Pinned', 'Video', 'Image', 'Text'];

const generatePosts = (count: number): SupremePost[] => {
  return Array.from({ length: count }).map((_, i) => {
    const rand = Math.random();
    let type: 'video' | 'image' | 'text' = 'video';
    if (rand < 0.4) type = 'video';
    else if (rand < 0.7) type = 'image';
    else type = 'text';

    return {
      id: `post-${i}`,
      type,
      isPinned: i < 5, // Pin first 5 posts for demo
      url: type === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : (type === 'image' ? `https://picsum.photos/seed/gospel${i}/800/600` : undefined),
      content: type === 'text' ? `Deep revelation and inspiration for the soul. May this word bless you today. #Gospel #Faith #${i}` : undefined,
      thumbnail: `https://picsum.photos/seed/gospelthumb${i}/640/360`,
      title: type === 'video' ? `Powerful Sermon Part ${i + 1}` : (type === 'image' ? `Visual Inspiration #${i + 1}` : `Daily Word #${i + 1}`),
      views: Math.floor(Math.random() * 500000) + 1000,
      likes: Math.floor(Math.random() * 20000) + 100,
      dislikes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 2000),
      followers: Math.floor(Math.random() * 50000) + 500,
      author: `Minister ${i + 1}`,
      avatar: `https://i.pravatar.cc/150?u=gospel${i}`,
      category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
    };
  });
};

const ALL_POSTS = generatePosts(200);

export default function SupremeMode() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [userPosts, setUserPosts] = useState<SupremePost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<SupremePost[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isShuffling, setIsShuffling] = useState(false);

  const [activePost, setActivePost] = useState<SupremePost | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);

  // AI Generator Modal
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenType, setAiGenType] = useState<'text' | 'video'>('text');

  const handleGenerateContent = async () => {
    setIsAIProcessing(true);
    try {
      const response = await generateContent(`Generate a gospel ${aiGenType} based on: ${aiPrompt}. Include scriptures and inspiring words.`);
      if (response) {
        setPostContent(response);
        setPostTitle(aiPrompt.slice(0, 50));
        setShowAIModal(false);
        setShowCreateModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Video Settings State
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [videoQuality, setVideoQuality] = useState('Auto');

  // Post Creation State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState(CATEGORIES[1]);
  const [postContent, setPostContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<'video' | 'image' | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  
  // Effects State
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [textEffect, setTextEffect] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 
    'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Italian', 'Dutch', 'Turkish'
  ];
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAudioClick = () => {
    audioInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('video/')) {
        // Duration Validation
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration; // in seconds
          
          // RE-UPLOAD BUG FIX: Some formats like recorded webm might show Infinity duration
          // We also lower the minimum to allow shorter downloaded snippets if needed
          const minSecs = 1; // Lowered from 60s for better flexibility
          const maxSecs = 4 * 60 * 60;

          if (duration !== Infinity && !isNaN(duration)) {
            if (duration < minSecs) {
              toast.error("Revelation too short! (Min 1 second)");
              return;
            }
            if (duration > maxSecs) {
              toast.error("Revelation too long! (Max 4 hours)");
              return;
            }
          }
          
          setUploadedMediaUrl(url);
          setUploadedMediaType('video');
          toast.success(`Divine Video Received: ${file.name}`);
        };
        video.src = url;
      } else if (file.type.startsWith('image/')) {
        setUploadedMediaUrl(url);
        setUploadedMediaType('image');
        toast.success(`Divine Image Received: ${file.name}`);
      }
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
      toast.success(`Divine Sound Received: ${file.name}`);
    }
  };

  const handleSaveDraft = () => {
    toast.success("Divine Draft Saved to Cloud Vault");
    setShowCreateModal(false);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // Check available devices first to avoid "Requested device not found" errors
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      if (!hasVideo && !hasAudio) {
        toast.error("No camera or microphone detected. Please connect a device.");
        return;
      }

      const constraints = {
        video: hasVideo,
        audio: hasAudio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success(hasAudio ? "Recording started with Audio" : "Recording started (No Audio)");
    } catch (err: any) {
      console.error("Error accessing media devices:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error("Camera/Mic permission denied. Please enable them in your browser.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error("Requested media device not found. Please check your connections.");
      } else {
        toast.error("Divine Studio Error: Could not initialize recording devices.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAIAction = async (type: 'suggest' | 'grammar' | 'engagement') => {
    setIsAIProcessing(true);
    try {
      let prompt = "";
      if (type === 'suggest') {
        prompt = `Suggest a short, powerful gospel post content about: ${postTitle || 'faith and hope'}. Keep it under 150 words.`;
      } else if (type === 'grammar') {
        prompt = `Check and fix the grammar of this gospel post: "${postContent}". Return only the corrected text.`;
      } else if (type === 'engagement') {
        prompt = `Rewrite this gospel post to be more engaging and inspiring for social media: "${postContent}". Keep the same meaning but make it more impactful.`;
      }

      const responseText = await generateContent(prompt);

      if (responseText) {
        setPostContent(responseText);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!postContent.trim()) return;
    setIsTranslating(true);
    try {
      const translatedText = await generateContent(
        `Translate the following gospel text to ${targetLanguage}. Keep the spiritual tone and context. Only return the translated text: \n\n${postContent}`
      );
      setPostContent(translatedText || postContent);
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setIsTranslating(false);
      setShowLanguageSelect(false);
    }
  };

  const handleRestrictedAction = (action: () => void) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action();
  };

  // Simulate initial "God mode" loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialLoading) return;
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
  }, [page, isInitialLoading]);

  // Filter and Pagination Logic
  useEffect(() => {
    let filtered = [...userPosts, ...ALL_POSTS];
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedType !== 'All') {
      if (selectedType === 'Pinned') {
        filtered = filtered.filter(p => p.isPinned);
      } else {
        filtered = filtered.filter(p => p.type.toLowerCase() === selectedType.toLowerCase());
      }
    }
    
    // Sort pinned posts to the top if "All" or "Pinned" is selected
    if (selectedType === 'All') {
      filtered = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    }

    setDisplayedPosts(filtered.slice(0, page * 12));
    
    if (isInitialLoading) {
      const timer = setTimeout(() => setIsInitialLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [page, selectedCategory, selectedType, isInitialLoading]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...displayedPosts].sort(() => Math.random() - 0.5);
      setDisplayedPosts(shuffled);
      setIsShuffling(false);
    }, 500);
  };

  const handleNextPost = () => {
    if (!activePost) return;
    const currentIndex = displayedPosts.findIndex(p => p.id === activePost.id);
    if (currentIndex < displayedPosts.length - 1) {
      openCinematicView(displayedPosts[currentIndex + 1]);
    }
  };

  const handlePrevPost = () => {
    if (!activePost) return;
    const currentIndex = displayedPosts.findIndex(p => p.id === activePost.id);
    if (currentIndex > 0) {
      openCinematicView(displayedPosts[currentIndex - 1]);
    }
  };

  const openCinematicView = (post: SupremePost) => {
    setActivePost(post);
    setIsSubscribed(false);
    setIsLiked(false);
    setIsDisliked(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-supreme-gold)]/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <div className="w-64 h-64 rounded-full border border-[var(--color-supreme-gold)]/20 border-dashed" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <div className="w-48 h-48 rounded-full border border-[var(--color-supreme-gold)]/30 border-dashed" />
          </motion.div>
          <Loader2 className="w-40 h-40 text-[var(--color-supreme-gold)] animate-spin" strokeWidth={1} />
          <span className="absolute font-display font-bold text-[var(--color-supreme-gold)] text-lg tracking-widest animate-pulse">GOD MODE</span>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[var(--color-supreme-gold)]/60 font-medium tracking-widest text-xs uppercase">Initializing Divine Connection</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-[var(--color-supreme-gold)]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)] flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[var(--color-supreme-gold)]" />
          Supreme Mode
        </h1>
        <p className="text-gray-500 max-w-xl text-sm">
          A sanctuary for gospel activities, deep revelations, and divine inspiration from across the globe.
        </p>
      </div>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Create / Upload', 
            desc: 'Share videos (max 5hrs) or postcards',
            icon: Plus, 
            iconColor: 'text-blue-500', 
            bgColor: 'bg-blue-500/10',
            action: () => setShowCreateModal(true)
          },
          { 
            title: 'AI Generator', 
            desc: 'Generate gospel text or videos',
            icon: Sparkles, 
            iconColor: 'text-purple-500', 
            bgColor: 'bg-purple-500/10',
            action: () => setShowAIModal(true)
          },
          { 
            title: 'Stream Tools', 
            desc: 'Go live with gospel activities',
            icon: Radio, 
            iconColor: 'text-red-500', 
            bgColor: 'bg-red-500/10',
            action: () => setShowStreamModal(true)
          },
        ].map((item) => (
          <div 
            key={item.title} 
            onClick={() => handleRestrictedAction(item.action)}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4 bg-white/80 border border-gray-200 shadow-sm cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-[var(--color-supreme-gold)]/30"
          >
            <div className={clsx("p-4 rounded-full transition-transform duration-300 group-hover:scale-110", item.bgColor, item.iconColor)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-supreme-text)] text-lg group-hover:text-[var(--color-supreme-gold)] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div>
        <div className="flex flex-col gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full">
             <div className="flex-1 overflow-x-auto pb-2 hide-scrollbar mask-gradient-right">
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
          </div>

          {/* Type Filter & Shuffle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {POST_TYPES.map(type => {
                const Icon = type === 'Video' ? Video : (type === 'Image' ? ImageIcon : (type === 'Text' ? FileText : (type === 'Pinned' ? Pin : Sparkles)));
                return (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setPage(1); }}
                    className={clsx(
                      "px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",
                      selectedType === type
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                        : "bg-white/50 hover:bg-white text-gray-500 border-gray-200"
                    )}
                  >
                    <Icon className={clsx("w-3 h-3", selectedType === type ? "text-[var(--color-supreme-gold)]" : "text-gray-400")} />
                    {type}
                  </button>
                );
              })}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isInitialLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} type="post" />
            ))
          ) : (
            displayedPosts.map((post) => (
              <motion.div 
                key={post.id}
                layoutId={`post-${post.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className={clsx(
                  "glass-panel rounded-2xl overflow-hidden group cursor-pointer bg-white/80 border shadow-sm hover:shadow-xl transition-all flex flex-col relative",
                  post.isPinned ? "border-[var(--color-supreme-gold)] ring-1 ring-[var(--color-supreme-gold)]/20" : "border-gray-200 hover:border-[var(--color-supreme-gold)]/50"
                )}
                onClick={() => openCinematicView(post)}
              >
                {post.isPinned && (
                  <div className="absolute top-3 left-3 z-10 bg-[var(--color-supreme-gold)] text-white px-2 py-1 rounded-md shadow-lg flex items-center gap-1.5">
                    <Pin className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black tracking-tighter uppercase">Featured</span>
                  </div>
                )}
                <div className="relative aspect-video overflow-hidden bg-gray-900 flex items-center justify-center">
                  {post.type === 'video' ? (
                    <>
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                    </>
                  ) : post.type === 'image' ? (
                    <>
                      <img src={post.url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white to-gray-100 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-supreme-gold)]/30" />
                      <FileText className="w-8 h-8 text-[var(--color-supreme-gold)]/20 absolute -right-2 -bottom-2 transform rotate-12" />
                      <p className="text-gray-700 font-serif text-sm line-clamp-4 italic leading-relaxed relative z-10">
                        "{post.content}"
                      </p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      {post.type === 'video' ? <Video className="w-3 h-3" /> : (post.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />)}
                      {post.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex gap-3">
                    <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--color-supreme-text)] text-sm line-clamp-2 group-hover:text-[var(--color-supreme-gold)] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-[10px] mt-0.5 truncate">{post.author}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-gray-400 text-[10px]">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatNumber(post.views)}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {formatNumber(post.likes)}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRestrictedAction(() => {}); }}
                      className="px-3 py-1 bg-[var(--color-supreme-gold)]/10 hover:bg-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)] hover:text-white rounded-full text-[10px] font-bold transition-all"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Infinite Scroll Loader */}
        <div ref={loaderRef} className="py-12 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
          {!loadingMore && displayedPosts.length === 0 && (
             <p className="text-gray-500 font-medium">No revelations found in this category.</p>
          )}
        </div>
      </div>

      {/* Cinematic View Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActivePost(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex flex-col max-w-[200px] sm:max-w-md">
                    <h3 className="text-white font-bold truncate pr-4 text-sm sm:text-base">{activePost.title}</h3>
                    <span className="text-white/60 text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 rounded w-fit mt-1">{activePost.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setActivePost(null)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-all backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 group"
                title="Exit Fullscreen"
              >
                <span className="text-xs font-bold hidden sm:inline">EXIT</span>
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center relative w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-12 mt-16 md:mt-0">
              
              {/* Prev Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevPost(); }}
                className="absolute left-2 md:left-4 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 hidden sm:flex"
                disabled={displayedPosts.findIndex(p => p.id === activePost?.id) === 0}
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <div className="w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group z-10 flex items-center justify-center">
                {activePost.type === 'video' ? (
                  <>
                    <video 
                      src={activePost.url} 
                      poster={activePost.thumbnail}
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    />
                    {/* Video Settings Overlay */}
                    <div className="absolute top-4 right-4 z-30">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowVideoSettings(!showVideoSettings); }}
                        className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      
                      <AnimatePresence>
                        {showVideoSettings && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                          >
                            <div className="p-3 border-b border-white/10">
                              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Playback Quality</h4>
                            </div>
                            <div className="p-1">
                              {['Auto', '1080p', '720p', '480p'].map((quality) => (
                                <button
                                  key={quality}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoQuality(quality);
                                    setShowVideoSettings(false);
                                  }}
                                  className={clsx(
                                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between",
                                    videoQuality === quality ? "bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)] font-bold" : "text-gray-300 hover:bg-white/10 hover:text-white"
                                  )}
                                >
                                  {quality}
                                  {videoQuality === quality && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                    <img src={activePost.url} alt={activePost.title} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                    <img src={activePost.url} alt={activePost.title} className="relative z-10 max-w-full max-h-full object-contain shadow-2xl" />
                    <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-6 sm:p-12 md:p-24">
                       <div className="relative max-w-4xl">
                         <div className="absolute -top-12 -left-12 text-[var(--color-supreme-gold)]/20 text-9xl font-serif select-none">“</div>
                         <p className="text-white font-serif text-xl sm:text-3xl md:text-5xl text-center leading-tight text-shadow-xl relative z-10">
                           {activePost.content}
                         </p>
                         <div className="absolute -bottom-12 -right-12 text-[var(--color-supreme-gold)]/20 text-9xl font-serif select-none transform rotate-180">“</div>
                         <div className="mt-12 flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-[var(--color-supreme-gold)]/50" />
                            <span className="text-[var(--color-supreme-gold)] font-display tracking-widest text-sm uppercase font-bold">Divine Revelation</span>
                            <div className="h-px w-12 bg-[var(--color-supreme-gold)]/50" />
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextPost(); }}
                className="absolute right-2 md:right-4 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 hidden sm:flex"
                disabled={displayedPosts.findIndex(p => p.id === activePost?.id) === displayedPosts.length - 1}
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Interaction Bar */}
            <div className="bg-gray-900/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 pb-safe">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                
                {/* Author Info */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img src={activePost.avatar} alt={activePost.author} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[var(--color-supreme-gold)]" />
                    <div>
                      <h4 className="text-white font-bold text-sm sm:text-lg">{activePost.author}</h4>
                      <p className="text-gray-400 text-[10px] sm:text-sm">{formatNumber(activePost.followers)} followers</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRestrictedAction(() => setIsSubscribed(!isSubscribed))}
                    className={clsx(
                      "px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2",
                      isSubscribed 
                        ? "bg-white/10 text-white hover:bg-white/20" 
                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20"
                    )}
                  >
                    {isSubscribed ? <><UserCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Subscribed</> : <><UserPlus className="w-3 h-3 sm:w-4 sm:h-4" /> Subscribe</>}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center bg-white/10 rounded-full p-1 backdrop-blur-md">
                    <button 
                      onClick={() => handleRestrictedAction(() => { setIsLiked(!isLiked); setIsDisliked(false); })}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors",
                        isLiked ? "text-[var(--color-supreme-gold)] bg-white/10" : "text-white hover:bg-white/10"
                      )}
                    >
                      <ThumbsUp className={clsx("w-4 h-4 sm:w-5 sm:h-5", isLiked && "fill-current")} />
                      <span className="font-bold text-xs sm:text-sm">{formatNumber(activePost.likes + (isLiked ? 1 : 0))}</span>
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <button 
                      onClick={() => handleRestrictedAction(() => { setIsDisliked(!isDisliked); setIsLiked(false); })}
                      className={clsx(
                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors",
                        isDisliked ? "text-red-400 bg-white/10" : "text-white hover:bg-white/10"
                      )}
                    >
                      <ThumbsDown className={clsx("w-4 h-4 sm:w-5 sm:h-5", isDisliked && "fill-current")} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-bold text-xs sm:text-sm">{formatNumber(activePost.comments)}</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md">
                      <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-bold text-xs sm:text-sm hidden sm:inline">Fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Upload Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 md:p-4"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white md:rounded-[2.5rem] w-full max-w-6xl h-full md:h-[90vh] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Studio Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-supreme-gold)] rounded-2xl shadow-lg shadow-yellow-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display text-gray-900 tracking-tight">Supreme Divine Studio</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Studio Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSaveDraft}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all text-gray-600"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white lg:border-r border-gray-100">
                  {/* Media Preview / Recording Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Workflow</label>
                      <div className="text-[10px] font-black text-[var(--color-supreme-gold)] px-2 py-0.5 bg-[var(--color-supreme-gold)]/10 rounded uppercase">
                        {isRecording ? 'Recording Live' : (uploadedMediaUrl || recordedVideoUrl ? 'Preview Ready' : 'Awaiting Input')}
                      </div>
                    </div>

                    <div className="relative aspect-video bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-gray-100">
                      {isRecording ? (
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                      ) : (uploadedMediaUrl || recordedVideoUrl) ? (
                        <div className="relative w-full h-full">
                          {uploadedMediaType === 'image' && !recordedVideoUrl ? (
                            <img src={uploadedMediaUrl!} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <video 
                              src={uploadedMediaUrl || recordedVideoUrl || ''} 
                              controls 
                              autoPlay
                              muted
                              loop
                              className="w-full h-full object-contain" 
                            />
                          )}
                          <button 
                            onClick={() => { setUploadedMediaUrl(null); setRecordedVideoUrl(null); }}
                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                          <div className="w-24 h-24 mb-6 relative">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 border-4 border-dashed border-[var(--color-supreme-gold)]/20 rounded-full"
                            />
                            <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                            </div>
                          </div>
                          <h4 className="text-xl font-black text-gray-900 mb-2">No Revelation Loaded</h4>
                          <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">Upload a video (1m - 4h) or record instantly using our divine studio camera.</p>
                          
                          <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <button 
                              onClick={handleUploadClick}
                              className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-900/20 flex items-center gap-2"
                            >
                              <ImageIcon className="w-4 h-4" /> Upload Media
                            </button>
                            <button 
                              onClick={startRecording}
                              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-900/20 flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4" /> Start Studio
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {isRecording && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
                             <span className="text-xs font-black text-white uppercase tracking-widest">On Air</span>
                          </div>
                          <div className="w-px h-4 bg-white/20" />
                          <button 
                            onClick={stopRecording}
                            className="p-2 bg-white text-red-600 rounded-xl hover:scale-110 transition-all font-black text-[10px]"
                          >
                            STOP RECORDING
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="video/*,image/*" />
                    <input type="file" ref={audioInputRef} className="hidden" onChange={handleAudioChange} accept="audio/*" />
                  </div>

                  {/* Revelation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Divine Title</label>
                        <input 
                          type="text" 
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-[var(--color-supreme-gold)] outline-none transition-all text-sm font-bold" 
                          placeholder="What is this revelation called?" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Spiritual Category</label>
                        <select 
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value)}
                          className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-[var(--color-supreme-gold)] outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                          {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Divine Verse / Content</label>
                        <button 
                          onClick={() => handleAIAction('suggest')}
                          className="text-[10px] font-black text-purple-600 uppercase hover:underline"
                        >
                          Get AI Verse
                        </button>
                      </div>
                      <textarea 
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-[var(--color-supreme-gold)] outline-none transition-all min-h-[148px] resize-none text-sm font-medium"
                        placeholder="Write or paste your revelation here..."
                      />
                    </div>
                  </div>
                </div>

                {/* Studio Control Sidebar */}
                <div className="w-full lg:w-96 bg-gray-50/50 overflow-y-auto p-6 space-y-8">
                  {/* Effects Hub */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Divine Effects Hub</label>
                    <div className="space-y-6">
                      {/* Video Effects */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase">
                          <Filter className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                          Visual Filters
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['None', 'Sepia', 'Cinema', 'Glow', 'Warm', 'Cold'].map(fx => (
                            <button 
                              key={fx}
                              onClick={() => {
                                setActiveEffects(prev => prev.includes(fx) ? prev.filter(f => f !== fx) : [...prev, fx]);
                                toast(`Filter Applied: ${fx}`);
                              }}
                              className={clsx(
                                "py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                                activeEffects.includes(fx) ? "border-[var(--color-supreme-gold)] bg-white text-[var(--color-supreme-gold)]" : "border-transparent bg-white text-gray-400 hover:border-gray-200"
                              )}
                            >
                              {fx}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Effects */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase">
                          <Type className="w-4 h-4 text-blue-500" />
                          Text Typo
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['Serif Divine', 'Bold Prophet', 'Italic Spirit', 'Modern Grace'].map(fx => (
                            <button 
                              key={fx}
                              onClick={() => {
                                setTextEffect(fx);
                                toast(`Typo Sync: ${fx}`);
                              }}
                              className={clsx(
                                "py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                                textEffect === fx ? "border-blue-500 bg-white text-blue-600" : "border-transparent bg-white text-gray-400 hover:border-blue-100"
                              )}
                            >
                              {fx}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sound Studio */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase">
                            <Music className="w-4 h-4 text-purple-500" />
                            Audio Studio
                          </div>
                          <button 
                            onClick={handleAudioClick}
                            className="p-1.5 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 transition-all hover:text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {uploadedAudioUrl ? (
                          <div className="p-4 bg-white rounded-2xl border border-purple-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                              <Volume2 className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-gray-900 uppercase">Custom Sound</p>
                              <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <motion.div 
                                  animate={{ width: ['0%', '100%'] }} 
                                  transition={{ duration: 2, repeat: Infinity }} 
                                  className="h-full bg-purple-500" 
                                />
                              </div>
                            </div>
                            <button onClick={() => setUploadedAudioUrl(null)} className="p-1 hover:bg-red-50 rounded text-red-400">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {['Heavens', 'Wind', 'Bell', 'Choir'].map(fx => (
                              <button 
                                key={fx}
                                onClick={() => toast(`Sound FX: ${fx}`)}
                                className="py-3 px-2 rounded-xl text-[10px] font-black uppercase bg-white text-gray-400 border-2 border-transparent hover:border-purple-200 transition-all flex items-center justify-center gap-2"
                              >
                                {fx === 'Heavens' ? <Sparkles className="w-3 h-3" /> : (fx === 'Wind' ? <Wind className="w-3 h-3" /> : <Music className="w-3 h-3" />)}
                                {fx}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission Footer */}
                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <button 
                      onClick={() => {
                        if (!uploadedMediaUrl && !recordedVideoUrl && !postContent) {
                          toast.error("Please provide a divine revelation first.");
                          return;
                        }
                        
                        const newPost: SupremePost = {
                          id: `user-post-${Date.now()}`,
                          type: uploadedMediaType === 'image' ? 'image' : (uploadedMediaUrl || recordedVideoUrl ? 'video' : 'text'),
                          title: postTitle || "Untitled Revelation",
                          content: postContent,
                          url: uploadedMediaUrl || recordedVideoUrl || undefined,
                          thumbnail: uploadedMediaUrl || recordedVideoUrl || undefined,
                          author: user?.name || user?.email || "Divine Creator",
                          avatar: "https://i.pravatar.cc/150?u=creator",
                          views: 0,
                          likes: 0,
                          dislikes: 0,
                          comments: 0,
                          followers: 0,
                          category: postCategory,
                          isPinned: false
                        };

                        setUserPosts(prev => [newPost, ...prev]);
                        toast.success("Revelation broadcasting to all nations...");
                        setShowCreateModal(false);
                      }}
                      className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                    >
                      <Download className="w-5 h-5" />
                      Publish Revelation
                    </button>
                    <button 
                      onClick={handleSaveDraft}
                      className="w-full py-4 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-600 font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                    >
                      <Save className="w-5 h-5" />
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display text-gray-900 leading-none">AI Gospel Generator</h3>
                    <p className="text-[10px] text-purple-500/60 uppercase font-black tracking-widest mt-1">Gospel Insight Engine</p>
                  </div>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Content Type</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => setAiGenType('text')}
                      className={clsx(
                        "p-4 border-2 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all",
                        aiGenType === 'text' ? "border-purple-600 bg-purple-50 text-purple-700 shadow-lg" : "border-gray-100 text-gray-400 hover:border-purple-200"
                      )}
                    >
                      <FileText className="w-5 h-5" />
                      Postcard
                    </button>
                    <button 
                      onClick={() => setAiGenType('video')}
                      className={clsx(
                        "p-4 border-2 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all",
                        aiGenType === 'video' ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg" : "border-gray-100 text-gray-400 hover:border-indigo-200"
                      )}
                    >
                      <Video className="w-5 h-5" />
                      Sermon
                    </button>
                  </div>
                  
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Topic / Scripture</label>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-purple-500 outline-none transition-all min-h-[120px] resize-none text-sm font-medium placeholder-gray-300" 
                    placeholder="Enter a topic like 'Persistence in Prayer' or a specific verse..." 
                  />
                </div>
                
                <button 
                  onClick={handleGenerateContent}
                  disabled={isAIProcessing || !aiPrompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-900/10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {isAIProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Revelation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stream Tools Modal */}
      <AnimatePresence>
        {showStreamModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Radio className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-display uppercase tracking-wider">Supreme Stream Tools</h3>
                      <p className="text-red-100 text-xs font-bold opacity-80">Divine Live Broadcast Center</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStreamModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => {
                      toast.success("Initializing Heavenly Live Stream...");
                      setShowStreamModal(false);
                    }}
                    className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center text-center group cursor-pointer hover:bg-red-100 transition-all"
                  >
                    <div className="p-4 bg-red-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm uppercase mb-1">Start Live Stream</h4>
                    <p className="text-[10px] text-red-600 font-bold">Connect with your followers live</p>
                  </div>
                  <div 
                    onClick={() => toast("Opening Divine Encoder Settings...")}
                    className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center group cursor-pointer hover:bg-blue-100 transition-all"
                  >
                    <div className="p-4 bg-blue-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm uppercase mb-1">Encoder Settings</h4>
                    <p className="text-[10px] text-blue-600 font-bold">RTMP / OBS Configuration</p>
                  </div>
                  <div 
                    onClick={() => toast("Calibrating Spiritual Interaction Engine...")}
                    className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center text-center group cursor-pointer hover:bg-emerald-100 transition-all"
                  >
                    <div className="p-4 bg-emerald-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm uppercase mb-1">Stream Chat Overlay</h4>
                    <p className="text-[10px] text-emerald-600 font-bold">Manage interaction in real-time</p>
                  </div>
                  <div 
                    onClick={() => toast("Syncing Multicast Divine Signal...")}
                    className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col items-center text-center group cursor-pointer hover:bg-purple-100 transition-all"
                  >
                    <div className="p-4 bg-purple-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm uppercase mb-1">Multicast Engine</h4>
                    <p className="text-[10px] text-purple-600 font-bold">Stream to multiple platforms</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Upcoming Divine Broadcasts</h5>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Live soon</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span className="text-xs font-bold text-red-500">Global Worship Event</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Today 8:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
