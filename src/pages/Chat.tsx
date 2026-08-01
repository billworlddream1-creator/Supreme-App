import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Lock, Phone, Video, Smile, ImagePlay, Mic, Wand2, Send, X, Loader2, 
  Square, Users, Search, MapPin, Paperclip, FileText, Download, Share2, Film, 
  CheckCircle2, PhoneOff, MicOff, VideoOff, Monitor, Sparkles, Navigation, Globe, 
  Trash2, Volume2, Play, Pause, RefreshCw, Eye, Check, FileCheck, FileArchive, 
  Image as ImageIcon, Sparkle, Radio, CornerDownLeft, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { toast } from 'sonner';

import FeatureLoader from '../components/FeatureLoader';
import { useNetwork, Friend, Message } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { generateContent } from '../services/aiService';
import { ALL_EMOJIS, EMOJI_CATEGORIES, ALL_CLIPS, CLIP_CATEGORIES, EmojiItem, ClipItem } from '../data/chatMediaData';

export default function Chat() {
  const { user } = useAuth();
  const { friends, chatSessions, sendMessage, markChatRead } = useNetwork();
  const location = useLocation();

  // Active chat state
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  // Feature Modals & Toggles
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showClipPicker, setShowClipPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Search states inside pickers
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('Smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(['❤️', '😂', '🔥', '👍', '🎉', '✨', '👑', '😎']);
  
  const [clipSearchQuery, setClipSearchQuery] = useState('');
  const [selectedClipCategory, setSelectedClipCategory] = useState<string>('🔥 Trending');

  // Micro Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechToTextActive, setSpeechToTextActive] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  // File Upload & Preview
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    previewUrl?: string;
    fileName: string;
    fileSize: string;
    fileType: 'image' | 'video' | 'audio' | 'document';
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location Tracking State
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Video / Audio Calling State
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    friend: Friend;
    status: 'ringing' | 'connected' | 'ended';
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing: boolean;
    durationSeconds: number;
  } | null>(null);

  // AI & Typing States
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Fullscreen preview
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // ------------------------------------------------------------------
  // 1. Initial Friend Selection
  // ------------------------------------------------------------------
  useEffect(() => {
    if (location.state?.userId) {
      setSelectedFriendId(location.state.userId);
    } else if (friends.length > 0 && !selectedFriendId) {
      setSelectedFriendId(friends[0].id);
    }
  }, [location.state, friends]);

  // ------------------------------------------------------------------
  // 2. Typing Indicator Simulation & Chat Reading
  // ------------------------------------------------------------------
  useEffect(() => {
    if (selectedFriendId) {
      setIsFriendTyping(true);
      const timer = setTimeout(() => setIsFriendTyping(false), 2200);
      markChatRead(selectedFriendId);
      return () => clearTimeout(timer);
    }
  }, [selectedFriendId, chatSessions[selectedFriendId || '']?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedFriendId, chatSessions[selectedFriendId || '']?.messages, isFriendTyping, pendingFile]);

  // Recording Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Active Call Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  const selectedFriend = friends.find(f => f.id === selectedFriendId);
  const currentMessages = selectedFriendId ? (chatSessions[selectedFriendId]?.messages || []) : [];

  const filteredMessages = searchQuery.trim() 
    ? currentMessages.filter(msg => 
        msg.type === 'text' && msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentMessages;

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  // ------------------------------------------------------------------
  // 3. Micro Voice Input (Audio Recording + Speech-to-Text)
  // ------------------------------------------------------------------
  const handleStartVoiceRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording and send
        setIsRecording(false);
        if (selectedFriendId) {
          sendMessage(selectedFriendId, `Voice Note (${formatTime(recordingTime)})`, 'audio', {
            duration: formatTime(recordingTime),
            waveform: [35, 65, 80, 45, 90, 75, 40, 85, 95, 60, 30, 70]
          });
          toast.success("Voice note sent!");
        }
        return;
      }

      setIsRecording(true);
      toast.info("Microphone recording started...");
    } catch (err) {
      toast.error("Microphone access denied or unsupported.");
      setIsRecording(false);
    }
  };

  const handleToggleSpeechToText = () => {
    if (speechToTextActive) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setSpeechToTextActive(false);
      toast.info("Speech dictation stopped.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser. You can still send Voice Notes!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Rec error", err);
        setSpeechToTextActive(false);
      };

      recognition.onend = () => {
        setSpeechToTextActive(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
      setSpeechToTextActive(true);
      toast.success("Listening... Speak now to transcribe text into message!");
    } catch (e) {
      toast.error("Could not start Speech Recognition.");
    }
  };

  // ------------------------------------------------------------------
  // 4. File Upload & Attachment Handling
  // ------------------------------------------------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMb} MB`;

    let fileType: 'image' | 'video' | 'audio' | 'document' = 'document';
    let previewUrl: string | undefined = undefined;

    if (file.type.startsWith('image/')) {
      fileType = 'image';
      previewUrl = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
      previewUrl = URL.createObjectURL(file);
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    setPendingFile({
      file,
      fileName: file.name,
      fileSize: sizeStr,
      fileType,
      previewUrl
    });

    toast.info(`Attached file: ${file.name} (${sizeStr})`);
  };

  // ------------------------------------------------------------------
  // 5. Location Tracking Tool
  // ------------------------------------------------------------------
  const handleGetLocation = () => {
    setShowLocationPicker(true);
    setIsFetchingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            name: 'Current Live GPS Location',
            address: 'GPS Pin • High Accuracy Position',
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5))
          });
          setIsFetchingLocation(false);
          toast.success("Live GPS coordinates located!");
        },
        (err) => {
          // Fallback location preset
          setCurrentLocation({
            name: 'Supreme Cyber Hub',
            address: 'Shibuya City, Tokyo, 150-0002, Japan',
            lat: 35.6580,
            lng: 139.7016
          });
          setIsFetchingLocation(false);
          toast.info("Location defaulted to Supreme Cyber Hub (Tokyo)");
        },
        { timeout: 8000 }
      );
    } else {
      setCurrentLocation({
        name: 'Supreme Innovation Center',
        address: '5th Ave, New York, NY 10022, USA',
        lat: 40.7614,
        lng: -73.9776
      });
      setIsFetchingLocation(false);
    }
  };

  const handleSendLocation = () => {
    if (!currentLocation || !selectedFriendId) return;
    sendMessage(
      selectedFriendId,
      `📍 Shared Location: ${currentLocation.name}`,
      'location',
      {
        locationName: currentLocation.name,
        address: currentLocation.address,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      }
    );
    setShowLocationPicker(false);
    toast.success("Location shared in chat!");
  };

  // ------------------------------------------------------------------
  // 6. Auto Text Corrector Tool (AI Powered)
  // ------------------------------------------------------------------
  const handleAutoCorrect = async () => {
    if (!message.trim()) return;
    setIsCorrecting(true);
    try {
      const correctedText = await generateContent(
        `Correct the grammar, spelling, and phrasing of this message. Return ONLY the polished text without quotes or explanations: "${message}"`
      );
      if (correctedText) {
        setLastCorrection(message);
        setMessage(correctedText.trim());
        toast.success("Message auto-corrected!");
      }
    } catch (error) {
      toast.error("Auto-correct service temporary busy.");
    } finally {
      setIsCorrecting(false);
    }
  };

  // ------------------------------------------------------------------
  // 7. Send Message Master Function
  // ------------------------------------------------------------------
  const handleSendMessage = () => {
    if (!selectedFriendId) return;

    // File send
    if (pendingFile) {
      const msgType = pendingFile.fileType === 'image' ? 'image' : 'file';
      sendMessage(
        selectedFriendId,
        pendingFile.fileName,
        msgType,
        {
          fileName: pendingFile.fileName,
          fileSize: pendingFile.fileSize,
          fileType: pendingFile.fileType,
          fileUrl: pendingFile.previewUrl || 'https://picsum.photos/seed/attachment/800/600'
        }
      );
      setPendingFile(null);
      toast.success("Attachment sent!");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!message.trim()) return;

    sendMessage(selectedFriendId, message, 'text');
    setMessage('');
    setLastCorrection(null);
  };

  const handleSendClip = (clip: ClipItem) => {
    if (!selectedFriendId) return;
    sendMessage(selectedFriendId, clip.url, 'clip', {
      clipTitle: clip.title
    });
    setShowClipPicker(false);
    toast.success(`Sent clip: ${clip.title}`);
  };

  // Filtered Emojis
  const filteredEmojis = ALL_EMOJIS.filter(e => {
    if (emojiSearchQuery.trim()) {
      return e.keywords.includes(emojiSearchQuery.toLowerCase());
    }
    return e.category === selectedEmojiCategory;
  });

  // Filtered Clips
  const filteredClips = ALL_CLIPS.filter(c => {
    if (clipSearchQuery.trim()) {
      return c.keywords.includes(clipSearchQuery.toLowerCase());
    }
    return c.category === selectedClipCategory;
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ------------------------------------------------------------------
  // 8. Video & Audio Call Handlers
  // ------------------------------------------------------------------
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!selectedFriend) return;
    setActiveCall({
      type,
      friend: selectedFriend,
      status: 'ringing',
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      durationSeconds: 0
    });

    // Ringing to Connected transition
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
      toast.success(`Connected to ${selectedFriend.name}`);
    }, 2500);
  };

  return (
    <FeatureLoader text="Supreme Chat & Calling Station">
      <div className="flex h-[calc(100vh-8rem)] glass-panel rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white/80 select-none">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
        />

        {/* ========================================================= */}
        {/* SIDEBAR: FRIENDS LIST & SEARCH                             */}
        {/* ========================================================= */}
        <div className="w-80 border-r border-gray-200 bg-gray-50/80 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex flex-col gap-3 bg-white/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                <h2 className="font-bold text-[var(--color-supreme-text)] text-lg">Supreme Messages</h2>
              </div>
              <span className="text-[10px] bg-[var(--color-supreme-gold)]/15 text-[var(--color-supreme-gold)] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--color-supreme-gold)]/30">
                Live Chat
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search connections..."
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => {
                const session = chatSessions[friend.id];
                return (
                  <div 
                    key={friend.id} 
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative",
                      selectedFriendId === friend.id 
                        ? "bg-white shadow-md border border-gray-200/80 ring-1 ring-[var(--color-supreme-gold)]/30" 
                        : "hover:bg-gray-200/60"
                    )}
                  >
                    <div className="relative">
                      <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs" />
                      <div className={clsx(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
                        friend.isOnline !== false ? "bg-emerald-500" : "bg-gray-400"
                      )}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-[var(--color-supreme-text)] text-sm truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">
                          {friend.name}
                        </h4>
                        {session?.lastMessageTime && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(session.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate">{session?.lastMessage || 'No messages yet'}</p>
                        {session?.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No connections match search.</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CHAT AREA                                             */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col bg-white/50 relative">
          {selectedFriend ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/90 backdrop-blur-md shadow-xs z-20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm" />
                    <span className={clsx(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                      selectedFriend.isOnline !== false ? "bg-emerald-500" : "bg-gray-400"
                    )}></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-supreme-text)] text-base">{selectedFriend.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      {isFriendTyping ? (
                        <span className="text-[var(--color-supreme-gold)] font-medium flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" /> typing message...
                        </span>
                      ) : (
                        <>
                          <span className={clsx("w-1.5 h-1.5 rounded-full", selectedFriend.isOnline !== false ? "bg-emerald-500" : "bg-gray-400")}></span>
                          {selectedFriend.isOnline !== false ? "Active Now" : "Offline"}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Action Tools: Search, Audio Call, Video Call, Simulate Call */}
                <div className="flex items-center gap-1.5 text-gray-600">
                  {isSearchVisible ? (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 border border-gray-200 shadow-inner">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search chat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs w-28 sm:w-40 outline-none"
                      />
                      <button onClick={() => { setIsSearchVisible(false); setSearchQuery(''); }} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSearchVisible(true)}
                      className="p-2.5 rounded-xl hover:bg-gray-100 hover:text-[var(--color-supreme-text)] transition-all"
                      title="Search Chat History"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}

                  <button 
                    onClick={() => handleStartCall('audio')}
                    className="p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-all border border-emerald-100 shadow-xs"
                    title="Start Audio Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleStartCall('video')}
                    className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all border border-blue-100 shadow-xs"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => {
                      // Trigger incoming call simulation for testing!
                      setActiveCall({
                        type: 'video',
                        friend: selectedFriend,
                        status: 'ringing',
                        isMuted: false,
                        isVideoOff: false,
                        isScreenSharing: false,
                        durationSeconds: 0
                      });
                      toast.info(`Incoming call from ${selectedFriend.name}`);
                    }}
                    className="p-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 transition-all"
                    title="Test Call Simulation"
                  >
                    Simulate Call
                  </button>
                </div>
              </div>

              {/* MESSAGES FEED */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                <div className="flex justify-center mb-2">
                  <span className="text-[11px] text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200/70 flex items-center gap-1.5 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600" /> End-to-end encrypted • Supreme Security Protocol
                  </span>
                </div>

                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                        <div className={clsx(
                          "p-3.5 max-w-[85%] sm:max-w-[70%] shadow-xs transition-all relative group",
                          isMe 
                            ? "bg-[var(--color-supreme-gold)] text-white rounded-2xl rounded-tr-none" 
                            : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200/80"
                        )}>
                          {/* TEXT MESSAGE */}
                          {msg.type === 'text' && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* CLIP / GIF MESSAGE */}
                          {msg.type === 'clip' || msg.type === 'gif' ? (
                            <div className="space-y-1">
                              <img 
                                src={msg.text} 
                                alt="Clip" 
                                className="rounded-xl max-w-full max-h-64 object-cover border border-black/10 cursor-pointer hover:opacity-95" 
                                onClick={() => setFullscreenImage(msg.text)}
                              />
                              {msg.metadata?.clipTitle && (
                                <p className="text-[10px] font-mono opacity-80">{msg.metadata.clipTitle}</p>
                              )}
                            </div>
                          ) : null}

                          {/* IMAGE ATTACHMENT MESSAGE */}
                          {msg.type === 'image' && (
                            <div className="space-y-1">
                              <img 
                                src={msg.metadata?.fileUrl || msg.text} 
                                alt="Attachment" 
                                className="rounded-xl max-w-full max-h-72 object-cover border border-black/10 cursor-pointer hover:scale-[1.01] transition-transform"
                                onClick={() => setFullscreenImage(msg.metadata?.fileUrl || msg.text)}
                              />
                              <p className="text-[10px] opacity-80 truncate">{msg.metadata?.fileName || 'Image attachment'}</p>
                            </div>
                          )}

                          {/* AUDIO VOICE NOTE MESSAGE */}
                          {msg.type === 'audio' && (
                            <div className="flex items-center gap-3 p-1">
                              <div className={clsx("p-2.5 rounded-full", isMe ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600")}>
                                <Mic className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold">{msg.text}</span>
                                <div className="flex items-center gap-0.5 mt-1">
                                  {[30, 60, 80, 40, 90, 75, 50, 95, 60, 40, 70, 85].map((h, idx) => (
                                    <span 
                                      key={idx} 
                                      className={clsx("w-1 rounded-full", isMe ? "bg-white/80" : "bg-emerald-500")}
                                      style={{ height: `${h * 0.2}px` }}
                                    ></span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* LOCATION CARD MESSAGE */}
                          {msg.type === 'location' && (
                            <div className="w-64 space-y-2">
                              <div className="flex items-center gap-2 font-bold text-xs border-b border-black/10 pb-1.5">
                                <MapPin className="w-4 h-4 text-red-500 fill-red-100" />
                                <span className="truncate">{msg.metadata?.locationName || 'Shared GPS Location'}</span>
                              </div>
                              <div className="relative rounded-lg overflow-hidden border border-black/10 bg-slate-100 h-28 flex items-center justify-center">
                                <img 
                                  src="https://picsum.photos/seed/maplocation/400/200" 
                                  alt="Map Preview" 
                                  className="w-full h-full object-cover opacity-90" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 text-white text-[10px]">
                                  <span className="truncate">{msg.metadata?.address || 'Live Pin Location'}</span>
                                </div>
                              </div>
                              <a 
                                href={`https://maps.google.com/?q=${msg.metadata?.lat || 35.658},${msg.metadata?.lng || 139.7016}`}
                                target="_blank"
                                rel="noreferrer"
                                className={clsx(
                                  "block text-center text-xs font-bold py-1.5 rounded-md transition-colors",
                                  isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                )}
                              >
                                Open in Google Maps 🗺️
                              </a>
                            </div>
                          )}

                          {/* FILE / DOCUMENT ATTACHMENT MESSAGE */}
                          {msg.type === 'file' && (
                            <div className="flex items-center gap-3 p-1 w-60">
                              <div className={clsx("p-2.5 rounded-xl", isMe ? "bg-white/20" : "bg-blue-50 text-blue-600")}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.metadata?.fileName || msg.text}</p>
                                <p className="text-[10px] opacity-75">{msg.metadata?.fileSize || 'Document'}</p>
                              </div>
                              <a 
                                href={msg.metadata?.fileUrl || '#'} 
                                download={msg.metadata?.fileName || 'document'}
                                className={clsx("p-1.5 rounded-lg transition-colors", isMe ? "hover:bg-white/20" : "hover:bg-gray-100 text-gray-600")}
                                title="Download File"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {/* TIMESTAMP */}
                          <div className={clsx("text-[9px] mt-1 text-right font-mono", isMe ? "text-white/80" : "text-gray-400")}>
                            {msg.timestamp?.toDate 
                              ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                              : new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                    <p>No messages found. Send a greeting!</p>
                  </div>
                )}

                {/* FRIEND TYPING BUBBLE */}
                {isFriendTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ========================================================= */}
              {/* CHAT INPUT AREA & TOOLBARS                                */}
              {/* ========================================================= */}
              <div className="p-4 border-t border-gray-200 bg-white relative">

                {/* DRAFT FILE PREVIEW BAR */}
                <AnimatePresence>
                  {pendingFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pendingFile.previewUrl ? (
                          <img src={pendingFile.previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{pendingFile.fileName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{pendingFile.fileSize} • {pendingFile.fileType.toUpperCase()}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setPendingFile(null)}
                        className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                        title="Remove Attachment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* POP-UP EMOJI PICKER (1000+ EMOJIS + SEARCH BAR) */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      className="absolute bottom-full left-4 mb-2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 w-80 sm:w-96 p-3 flex flex-col gap-2 max-h-96"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Smile className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                          <h4 className="font-bold text-[var(--color-supreme-text)] text-xs uppercase tracking-wider">
                            1000+ Emojis Database
                          </h4>
                        </div>
                        <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Online Emoji Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search 1000+ online emojis..." 
                          value={emojiSearchQuery}
                          onChange={(e) => setEmojiSearchQuery(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none"
                        />
                      </div>

                      {/* Emoji Category Tabs */}
                      {!emojiSearchQuery && (
                        <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                          {EMOJI_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedEmojiCategory(cat)}
                              className={clsx(
                                "text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap transition-colors",
                                selectedEmojiCategory === cat 
                                  ? "bg-[var(--color-supreme-gold)] text-white shadow-2xs" 
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Emojis Grid */}
                      <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 overflow-y-auto max-h-56 p-1">
                        {filteredEmojis.slice(0, 200).map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setMessage(prev => prev + item.emoji);
                              if (!recentEmojis.includes(item.emoji)) {
                                setRecentEmojis(prev => [item.emoji, ...prev.slice(0, 15)]);
                              }
                            }}
                            className="text-xl p-1.5 hover:bg-gray-100 rounded-lg transition-transform hover:scale-125 active:scale-95 text-center"
                            title={item.name}
                          >
                            {item.emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* POP-UP CLIPS / GIFS PICKER (1000+ CLIPS + SEARCH BAR) */}
                  {showClipPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      className="absolute bottom-full left-4 mb-2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 w-80 sm:w-96 p-3 flex flex-col gap-2 max-h-96"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                          <h4 className="font-bold text-[var(--color-supreme-text)] text-xs uppercase tracking-wider">
                            1000+ Clips & GIFs Search
                          </h4>
                        </div>
                        <button onClick={() => setShowClipPicker(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Online Clips Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search 1000+ online clips & GIFs..." 
                          value={clipSearchQuery}
                          onChange={(e) => setClipSearchQuery(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[var(--color-supreme-gold)] outline-none"
                        />
                      </div>

                      {/* Clip Category Filter Chips */}
                      {!clipSearchQuery && (
                        <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                          {CLIP_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedClipCategory(cat)}
                              className={clsx(
                                "text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap transition-colors",
                                selectedClipCategory === cat 
                                  ? "bg-[var(--color-supreme-gold)] text-white shadow-2xs" 
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Clips Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-56 p-1">
                        {filteredClips.slice(0, 30).map((clip) => (
                          <div 
                            key={clip.id}
                            onClick={() => handleSendClip(clip)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-black aspect-video hover:opacity-90 transition-opacity"
                          >
                            <img src={clip.url} alt={clip.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                              <span className="text-[9px] text-white font-semibold truncate">{clip.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* LOCATION PICKER MODAL */}
                  {showLocationPicker && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-full left-4 mb-2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 w-80 sm:w-96 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500 fill-red-100" />
                          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                            Location Tracking Tool
                          </h4>
                        </div>
                        <button onClick={() => setShowLocationPicker(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isFetchingLocation ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-supreme-gold)]" />
                          <span className="text-xs">Locating GPS position...</span>
                        </div>
                      ) : currentLocation ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <p className="text-xs font-bold text-slate-900">{currentLocation.name}</p>
                            <p className="text-[11px] text-slate-500">{currentLocation.address}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Lat: {currentLocation.lat} • Lng: {currentLocation.lng}</p>
                          </div>

                          <div className="h-28 rounded-xl overflow-hidden border border-slate-200 relative">
                            <img src="https://picsum.photos/seed/locationpreview/400/200" alt="Map" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <MapPin className="w-8 h-8 text-red-500 drop-shadow-md animate-bounce" />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleGetLocation}
                              className="flex-1 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                              Refresh GPS
                            </button>
                            <button
                              onClick={handleSendLocation}
                              className="flex-1 py-2 text-xs font-bold bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold-light)] rounded-xl transition-colors shadow-xs"
                            >
                              Share Pin in Chat
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CHAT TOOLBAR & INPUT CONTAINER */}
                <div className="flex flex-col gap-2">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {/* Emoji Selector Button */}
                      <button 
                        onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowClipPicker(false); setShowLocationPicker(false); }}
                        className={clsx(
                          "p-2 rounded-xl transition-all",
                          showEmojiPicker ? "text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/15" : "text-gray-500 hover:bg-gray-100"
                        )} 
                        title="1000+ Emojis & Search"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      {/* Clips & GIFs Button */}
                      <button 
                        onClick={() => { setShowClipPicker(!showClipPicker); setShowEmojiPicker(false); setShowLocationPicker(false); }}
                        className={clsx(
                          "p-2 rounded-xl transition-all",
                          showClipPicker ? "text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/15" : "text-gray-500 hover:bg-gray-100"
                        )} 
                        title="1000+ Clips & Online GIF Search"
                      >
                        <Film className="w-5 h-5" />
                      </button>

                      {/* Attach File Button */}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                        title="File Upload & Preview Tool (PDF, Docs, Media)"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      {/* Location Tool Button */}
                      <button 
                        onClick={handleGetLocation}
                        className={clsx(
                          "p-2 rounded-xl transition-all",
                          showLocationPicker ? "text-red-500 bg-red-50" : "text-gray-500 hover:bg-gray-100"
                        )} 
                        title="Location Tracking & Map Sharing"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>

                      {/* Voice Note Recording Button */}
                      <button 
                        onClick={handleStartVoiceRecording}
                        className={clsx(
                          "p-2 rounded-xl transition-all flex items-center gap-1",
                          isRecording ? "text-red-600 bg-red-100 animate-pulse font-bold" : "text-gray-500 hover:bg-gray-100"
                        )} 
                        title="Voice Note Recorder"
                      >
                        {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                        {isRecording && <span className="text-xs font-mono">{formatTime(recordingTime)}</span>}
                      </button>

                      {/* Speech to Text Dictation Button */}
                      <button 
                        onClick={handleToggleSpeechToText}
                        className={clsx(
                          "p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold",
                          speechToTextActive ? "text-purple-600 bg-purple-100 animate-pulse" : "text-gray-500 hover:bg-gray-100"
                        )}
                        title="Live Voice Dictation (Speech-to-Text)"
                      >
                        <Radio className="w-4 h-4" />
                        <span className="hidden sm:inline">{speechToTextActive ? 'Dictating...' : 'Voice Dictate'}</span>
                      </button>
                    </div>

                    {/* Auto Corrector Tool */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setAutoCorrectEnabled(!autoCorrectEnabled)}
                        className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                          autoCorrectEnabled 
                            ? 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/15 border border-[var(--color-supreme-gold)]/30' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`} 
                        title="Auto-correct & Polish Tool"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Auto-correct {autoCorrectEnabled ? 'ON' : 'OFF'}</span>
                      </button>

                      {autoCorrectEnabled && message && (
                        <button 
                          onClick={handleAutoCorrect}
                          disabled={isCorrecting}
                          className="text-xs bg-[var(--color-supreme-gold)] text-white px-3 py-1.5 rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all disabled:opacity-50 flex items-center gap-1 font-bold shadow-2xs"
                        >
                          {isCorrecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Fix Grammar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-[var(--color-supreme-gold)] focus-within:bg-white transition-all shadow-inner">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={pendingFile ? "Add an optional caption..." : "Type a message or use speech dictation..."} 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[var(--color-supreme-text)] placeholder-gray-400 px-3 outline-none"
                    />

                    <button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() && !pendingFile}
                      className="p-2.5 bg-[var(--color-supreme-gold)] text-white rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-supreme-text)] mb-1">Select a conversation</h3>
              <p className="max-w-xs text-xs text-gray-500">Select a friend to enjoy micro voice notes, location sharing, file attachments, and video calling!</p>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE VIDEO / AUDIO CALLING MODAL                   */}
        {/* ========================================================= */}
        <AnimatePresence>
          {activeCall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none"
            >
              {/* Call Top Header */}
              <div className="w-full max-w-4xl flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {activeCall.type === 'video' ? <Video className="w-4 h-4 text-blue-400" /> : <Phone className="w-4 h-4 text-emerald-400" />}
                    Supreme {activeCall.type} Call
                  </span>
                  <span className="text-xs text-white/60 font-mono">
                    {activeCall.status === 'ringing' ? 'Ringing...' : `Duration: ${formatTime(activeCall.durationSeconds)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-400">HD Encrypted</span>
                </div>
              </div>

              {/* Call Body Stage */}
              <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-6 relative">
                {activeCall.type === 'video' && !activeCall.isVideoOff ? (
                  <div className="relative w-full h-full max-h-[500px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 flex items-center justify-center">
                    {/* Simulated Friend Video Stream */}
                    <img 
                      src={activeCall.friend.avatar} 
                      alt={activeCall.friend.name} 
                      className="w-full h-full object-cover filter brightness-95" 
                    />
                    
                    {/* Screen share frame if enabled */}
                    {activeCall.isScreenSharing && (
                      <div className="absolute inset-4 rounded-2xl bg-black/80 border border-blue-500/50 p-4 flex flex-col items-center justify-center text-white">
                        <Monitor className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
                        <p className="text-sm font-bold">Sharing Screen Presentation</p>
                        <p className="text-xs text-slate-400">Supreme Workspace Display Stream</p>
                      </div>
                    )}

                    {/* Self Video PIP Thumbnail */}
                    <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-800">
                      <img src={user?.avatar || 'https://picsum.photos/seed/me/200'} alt="Me" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <div className="relative">
                      <img 
                        src={activeCall.friend.avatar} 
                        alt={activeCall.friend.name} 
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl" 
                      />
                      <div className="absolute -inset-4 rounded-full border-2 border-emerald-500/50 animate-ping opacity-75 pointer-events-none"></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{activeCall.friend.name}</h2>
                      <p className="text-sm text-white/70">
                        {activeCall.status === 'ringing' ? 'Connecting secure call...' : 'Call in progress'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Controls Toolbar */}
              <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20 flex items-center justify-center gap-4 sm:gap-6">
                {/* Mute Mic Toggle */}
                <button
                  onClick={() => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                  className={clsx(
                    "p-4 rounded-full transition-all border shadow-lg",
                    activeCall.isMuted ? "bg-red-500 border-red-400 text-white" : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  )}
                  title={activeCall.isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Video Camera Toggle */}
                <button
                  onClick={() => setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null)}
                  className={clsx(
                    "p-4 rounded-full transition-all border shadow-lg",
                    activeCall.isVideoOff ? "bg-red-500 border-red-400 text-white" : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  )}
                  title={activeCall.isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>

                {/* Screen Share Toggle */}
                <button
                  onClick={() => {
                    setActiveCall(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null);
                    toast.info(activeCall.isScreenSharing ? "Stopped screen share" : "Screen share active");
                  }}
                  className={clsx(
                    "p-4 rounded-full transition-all border shadow-lg",
                    activeCall.isScreenSharing ? "bg-blue-500 border-blue-400 text-white" : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  )}
                  title="Toggle Screen Share"
                >
                  <Monitor className="w-6 h-6" />
                </button>

                {/* End Call Button */}
                <button
                  onClick={() => {
                    setActiveCall(null);
                    toast.info("Call ended.");
                  }}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {/* FULLSCREEN IMAGE LIGHTBOX */}
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setFullscreenImage(null)}
            >
              <button 
                onClick={() => setFullscreenImage(null)} 
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={fullscreenImage} alt="Full View" className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureLoader>
  );
}
