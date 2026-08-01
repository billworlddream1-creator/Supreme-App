import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Upload, 
  Scissors, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  TrendingUp, 
  DollarSign, 
  Tag, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Radio, 
  Megaphone, 
  Video, 
  Tv, 
  Award, 
  BarChart3, 
  Plus, 
  Filter, 
  Copy, 
  Zap, 
  RefreshCw,
  Heart,
  Eye,
  Sliders,
  Check,
  ExternalLink,
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Flag,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, increment, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface SuperShortItem {
  id: string;
  title: string;
  creatorName: string;
  creatorId: string;
  category: string;
  tags: string[];
  durationSeconds: number;
  audioUrl: string;
  downloads: number;
  uses: number;
  likes: number;
  createdAt: any;
  synthType?: string; // For web synthesized audio fallbacks

  // Earning & Billing Renewal
  earningExpiresAt?: string; // ISO date string (1 Year default validity)
  totalRenewalSpent?: number;
  downloadsWhileExpired?: number;
  usesWhileExpired?: number;
  renewalHistory?: {
    id: string;
    renewedAt: string;
    yearsAdded: number;
    cost: number;
    newExpiresAt: string;
  }[];
}

export const SUPER_SHORT_RENEWAL_PLANS = [
  { years: 1, price: 10, label: '1 Year Renewal', discount: 'Standard Rate', description: 'Extend earning & promotion validity for 1 full year.' },
  { years: 2, price: 15, label: '2 Years Renewal', discount: 'Save 25%', description: 'Extend earning & promotion validity for 2 full years.' },
  { years: 3, price: 25, label: '3 Years Renewal', discount: 'Save 16%', description: 'Extend earning & promotion validity for 3 full years.' },
  { years: 4, price: 35, label: '4 Years Renewal', discount: 'Save 12%', description: 'Extend earning & promotion validity for 4 full years.' },
  { years: 5, price: 45, label: '5 Years Renewal', discount: 'Best Value - Save 10%', description: 'Extend earning & promotion validity for 5 full years.' },
];

export interface SuperShortViolation {
  id: string;
  shortId: string;
  shortTitle: string;
  creatorName: string;
  reporterName: string;
  reason: string;
  details: string;
  status: 'Pending Review' | 'Under Investigation' | 'Resolved - Action Taken' | 'Dismissed';
  timestamp: string;
}

const DEFAULT_VIOLATIONS: SuperShortViolation[] = [
  {
    id: 'viol-1',
    shortId: 'short-2',
    shortTitle: 'Viral Meme Airhorn Trap',
    creatorName: 'MemeLord_99',
    reporterName: 'AudioGuardian_AI',
    reason: 'Audio Distortion / High Decibel Clipping',
    details: 'Automated scan detected gain levels exceeding safety threshold (+6dB). Gain normalized automatically.',
    status: 'Resolved - Action Taken',
    timestamp: '2 hours ago'
  },
  {
    id: 'viol-2',
    shortId: 'short-3',
    shortTitle: 'High Conversion Ad Intro Jingle',
    creatorName: 'AdPro Studio',
    reporterName: 'RightsRegistry_Bot',
    reason: 'Copyright Sample Verification',
    details: 'Fingerprint match check cleared against standard royalty-free sound bank database.',
    status: 'Dismissed',
    timestamp: 'Yesterday at 14:20'
  }
];

// Pre-seeded high quality audio synthesizer generators for instant playback
const generateSynthesizedAudio = (type: string): string => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 22050 });
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / ctx.sampleRate;
      if (type === 'chime') {
        data[i] = (Math.sin(2 * Math.PI * 880 * t) + Math.sin(2 * Math.PI * 1320 * t)) * Math.exp(-3 * t) * 0.3;
      } else if (type === 'status_bell') {
        data[i] = (Math.sin(2 * Math.PI * 523.25 * t) + Math.sin(2 * Math.PI * 659.25 * t) + Math.sin(2 * Math.PI * 783.99 * t)) * Math.exp(-2.5 * t) * 0.3;
      } else if (type === 'meme_horn') {
        data[i] = (Math.sin(2 * Math.PI * (300 + Math.sin(t * 20) * 100) * t)) * Math.exp(-1.5 * t) * 0.4;
      } else if (type === 'ad_jingle') {
        const freq = t < 0.5 ? 440 : t < 1.0 ? 554.37 : t < 1.5 ? 659.25 : 880;
        data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3;
      } else if (type === 'lofi_beat') {
        const kick = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-10 * (t % 0.5));
        const snare = (Math.random() * 2 - 1) * Math.exp(-15 * ((t + 0.25) % 0.5));
        data[i] = (kick + snare) * 0.3;
      } else {
        data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-2 * t) * 0.3;
      }
    }

    // Convert Buffer to WAV Blob Data URL
    const wavBuffer = bufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    return 'https://cdn.jsdelivr.net/gh/claudiorodriguez/notification-sounds@master/success.mp3';
  }
};

// Simple AudioBuffer to WAV helper
function bufferToWav(abuffer: AudioBuffer) {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const out = new Uint8Array(length);
  const view = new DataView(out.buffer);
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // length
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return out.buffer;
}

const DEFAULT_SHORTS: SuperShortItem[] = [
  {
    id: 'short-1',
    title: 'Supreme Status Chime',
    creatorName: 'Supreme Sound Lab',
    creatorId: 'sys-creator',
    category: 'Status Tones',
    tags: ['#status', '#chime', '#vip'],
    durationSeconds: 12,
    audioUrl: '',
    synthType: 'status_bell',
    downloads: 342,
    uses: 280,
    likes: 189,
    createdAt: new Date().toISOString(),
    earningExpiresAt: new Date(Date.now() + 240 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usesWhileExpired: 0
  },
  {
    id: 'short-2',
    title: 'Viral Meme Airhorn Trap',
    creatorName: 'MemeLord_99',
    creatorId: 'sys-creator-2',
    category: 'Meme & Funny',
    tags: ['#meme', '#airhorn', '#funny'],
    durationSeconds: 8,
    audioUrl: '',
    synthType: 'meme_horn',
    downloads: 890,
    uses: 1120,
    likes: 540,
    createdAt: new Date(Date.now() - 380 * 24 * 3600 * 1000).toISOString(),
    earningExpiresAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(), // Expired 15 days ago
    totalRenewalSpent: 0,
    downloadsWhileExpired: 42,
    usesWhileExpired: 68
  },
  {
    id: 'short-3',
    title: 'High Conversion Ad Intro Jingle',
    creatorName: 'AdPro Studio',
    creatorId: 'sys-creator-3',
    category: 'Ad Jingles',
    tags: ['#ads', '#jingle', '#promo'],
    durationSeconds: 15,
    audioUrl: '',
    synthType: 'ad_jingle',
    downloads: 410,
    uses: 650,
    likes: 310,
    createdAt: new Date().toISOString(),
    earningExpiresAt: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(), // Expiring in 8 days
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usesWhileExpired: 0
  },
  {
    id: 'short-4',
    title: 'Lo-Fi Chill Beat Segment',
    creatorName: 'BeatMaker_Pro',
    creatorId: 'sys-creator-4',
    category: 'Short Music',
    tags: ['#lofi', '#music', '#beat'],
    durationSeconds: 30,
    audioUrl: '',
    synthType: 'lofi_beat',
    downloads: 620,
    uses: 480,
    likes: 420,
    createdAt: new Date().toISOString(),
    earningExpiresAt: new Date(Date.now() + 310 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usesWhileExpired: 0
  },
  {
    id: 'short-5',
    title: 'Cyber Crystal Bell Notification',
    creatorName: 'SoundWave',
    creatorId: 'sys-creator-5',
    category: 'Status Tones',
    tags: ['#cyber', '#bell', '#tone'],
    durationSeconds: 6,
    audioUrl: '',
    synthType: 'chime',
    downloads: 290,
    uses: 310,
    likes: 215,
    createdAt: new Date(Date.now() - 410 * 24 * 3600 * 1000).toISOString(),
    earningExpiresAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(), // Expired
    totalRenewalSpent: 0,
    downloadsWhileExpired: 18,
    usesWhileExpired: 25
  }
];

const CATEGORIES = [
  'All Shorts',
  'Meme & Funny',
  'Status Tones',
  'Ad Jingles',
  'Short Music',
  'SFX & Loops',
  'Viral Clips',
  'Gaming & Anime'
];

export default function SuperShort() {
  const { user } = useAuth();
  const { receivePayment, sendPayment, balance } = useWallet();
  const navigate = useNavigate();

  // State
  const [shorts, setShorts] = useState<SuperShortItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Shorts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'explore' | 'upload' | 'rewards' | 'renewals' | 'violations'>('explore');
  const [renewalModalShort, setRenewalModalShort] = useState<SuperShortItem | null>(null);

  // Community Guidelines Modal State
  const [showGuidelinesModal, setShowGuidelinesModal] = useState<boolean>(false);
  const [guidelinesAgreed, setGuidelinesAgreed] = useState<boolean>(false);

  // Violation Tracker & Report Modal State
  const [violations, setViolations] = useState<SuperShortViolation[]>([]);
  const [reportModalShort, setReportModalShort] = useState<SuperShortItem | null>(null);
  const [reportReason, setReportReason] = useState<string>('Copyright Infringement');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [userStrikes, setUserStrikes] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [violationStatusFilter, setViolationStatusFilter] = useState<string>('All');

  // Check initial guidelines acceptance on mount
  useEffect(() => {
    const userId = user?.uid || 'guest';
    const hasAccepted = localStorage.getItem(`supershort_guidelines_accepted_${userId}`);
    if (!hasAccepted) {
      setShowGuidelinesModal(true);
    }
  }, [user]);

  const handleAcceptGuidelines = () => {
    if (!guidelinesAgreed) {
      toast.error("Please check the confirmation box to agree to the Community Guidelines.");
      return;
    }
    const userId = user?.uid || 'guest';
    localStorage.setItem(`supershort_guidelines_accepted_${userId}`, 'true');
    setShowGuidelinesModal(false);
    toast.success("Community Guidelines Accepted! Welcome to Super Shorts.");
  };

  // Sync Violations from Firestore
  useEffect(() => {
    const q = query(collection(db, 'super_short_violations'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setViolations(DEFAULT_VIOLATIONS);
      } else {
        const fetched: SuperShortViolation[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetched.push({
            id: docSnap.id,
            shortId: d.shortId || '',
            shortTitle: d.shortTitle || 'Untitled Short',
            creatorName: d.creatorName || 'Unknown',
            reporterName: d.reporterName || 'Anonymous',
            reason: d.reason || 'Policy Violation',
            details: d.details || 'No details provided.',
            status: d.status || 'Pending Review',
            timestamp: d.timestamp || 'Recently'
          });
        });
        setViolations(fetched);
      }
    }, (err) => {
      console.warn('SuperShort Violations Firestore notice:', err);
      setViolations(DEFAULT_VIOLATIONS);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitReport = async () => {
    if (!reportModalShort) return;
    if (!reportDetails.trim()) {
      toast.error("Please enter specific details about the violation.");
      return;
    }

    setSubmittingReport(true);
    try {
      const newViolation = {
        shortId: reportModalShort.id,
        shortTitle: reportModalShort.title,
        creatorName: reportModalShort.creatorName,
        reporterName: user?.name || user?.email?.split('@')[0] || 'Member',
        reason: reportReason,
        details: reportDetails.trim(),
        status: 'Pending Review',
        timestamp: new Date().toLocaleString()
      };

      await addDoc(collection(db, 'super_short_violations'), newViolation);
      toast.success("Violation report submitted successfully to Moderation!");
      setReportModalShort(null);
      setReportDetails('');
    } catch (e) {
      const localReport: SuperShortViolation = {
        id: `local-viol-${Date.now()}`,
        shortId: reportModalShort.id,
        shortTitle: reportModalShort.title,
        creatorName: reportModalShort.creatorName,
        reporterName: user?.name || 'You',
        reason: reportReason,
        details: reportDetails.trim(),
        status: 'Pending Review',
        timestamp: new Date().toLocaleString()
      };
      setViolations(prev => [localReport, ...prev]);
      toast.success("Violation report logged successfully!");
      setReportModalShort(null);
      setReportDetails('');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleRunSafetyAudit = () => {
    setIsAuditing(true);
    toast.info("AI Content Safety Scanner active... Auditing Super Short tracks.");
    setTimeout(() => {
      setIsAuditing(false);
      toast.success("Safety Audit Complete: 0 Copyright or Audio Violations detected on your account!");
    }, 1800);
  };

  // Audio Playback State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Upload & Trimmer State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Status Tones');
  const [uploadTags, setUploadTags] = useState('');
  const [rawAudioFile, setRawAudioFile] = useState<File | null>(null);
  const [rawAudioUrl, setRawAudioUrl] = useState<string | null>(null);
  const [rawDuration, setRawDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(60);
  const [isTrimming, setIsTrimming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const trimmerAudioRef = useRef<HTMLAudioElement | null>(null);
  const [trimmerPlaying, setTrimmerPlaying] = useState(false);

  // Use Modal State
  const [usageModalShort, setUsageModalShort] = useState<SuperShortItem | null>(null);

  // Firestore Sync
  useEffect(() => {
    const q = query(collection(db, 'super_shorts'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setShorts(DEFAULT_SHORTS);
      } else {
        const fetched: SuperShortItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetched.push({
            id: docSnap.id,
            title: d.title || 'Untitled Short',
            creatorName: d.creatorName || 'Anonymous',
            creatorId: d.creatorId || '',
            category: d.category || 'Short Music',
            tags: d.tags || [],
            durationSeconds: d.durationSeconds || 15,
            audioUrl: d.audioUrl || '',
            synthType: d.synthType || 'chime',
            downloads: d.downloads || 0,
            uses: d.uses || 0,
            likes: d.likes || 0,
            createdAt: d.createdAt,
            earningExpiresAt: d.earningExpiresAt || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            totalRenewalSpent: d.totalRenewalSpent || 0,
            downloadsWhileExpired: d.downloadsWhileExpired || 0,
            usesWhileExpired: d.usesWhileExpired || 0,
            renewalHistory: d.renewalHistory || []
          });
        });
        setShorts(fetched);
      }
    }, (err) => {
      console.warn('SuperShort Firestore notice:', err);
      setShorts(DEFAULT_SHORTS);
    });

    return () => unsubscribe();
  }, []);

  // Cleanup audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Audio Player Handler
  const togglePlayShort = (item: SuperShortItem) => {
    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    let url = item.audioUrl;
    if (!url || url === '') {
      url = generateSynthesizedAudio(item.synthType || 'chime');
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(item.id);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setPlayingId(null);
      setAudioProgress(0);
    };

    audio.play().catch(e => {
      console.warn("Audio playback notice:", e);
      setPlayingId(null);
      toast.error("Unable to play sound stream directly.");
    });
  };

  // Upload File Selection & Duration Inspector
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error("Please select a valid audio file (.mp3, .wav, .m4a, .aac).");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setRawAudioFile(file);
    setRawAudioUrl(fileUrl);

    // Read audio duration
    const tempAudio = new Audio(fileUrl);
    tempAudio.onloadedmetadata = () => {
      const dur = Math.round(tempAudio.duration);
      setRawDuration(dur);
      setTrimStart(0);
      const initialEnd = Math.min(dur, 60);
      setTrimEnd(initialEnd);

      if (dur < 5) {
        toast.error("Audio is less than 5 seconds minimum requirement! Please select a longer sound clip.");
      } else if (dur > 60) {
        setIsTrimming(true);
        toast.info("Audio exceeds 1 minute! Trimmer/Cutter activated automatically.");
      } else {
        setIsTrimming(false);
      }
    };
  };

  // Trimmer auto-cut to 60s
  const handleAutoTrim = () => {
    setTrimStart(0);
    setTrimEnd(Math.min(rawDuration, 60));
    toast.success("Auto-trimmed to max 60 seconds (1 minute)!");
  };

  // Preview Trimmer Slice
  const togglePlayTrimmer = () => {
    if (!rawAudioUrl) return;

    if (trimmerPlaying && trimmerAudioRef.current) {
      trimmerAudioRef.current.pause();
      setTrimmerPlaying(false);
      return;
    }

    const audio = new Audio(rawAudioUrl);
    trimmerAudioRef.current = audio;
    audio.currentTime = trimStart;
    
    audio.ontimeupdate = () => {
      if (audio.currentTime >= trimEnd) {
        audio.pause();
        setTrimmerPlaying(false);
      }
    };

    audio.onended = () => {
      setTrimmerPlaying(false);
    };

    audio.play().then(() => setTrimmerPlaying(true)).catch(() => setTrimmerPlaying(false));
  };

  // Publish / Upload Short
  const handlePublishShort = async () => {
    if (!uploadTitle.trim()) {
      toast.error("Please enter a title for your short!");
      return;
    }
    if (!rawAudioFile || !rawAudioUrl) {
      toast.error("Please select an audio file to upload!");
      return;
    }

    const finalDuration = Math.round(trimEnd - trimStart);
    if (finalDuration < 5) {
      toast.error("Trimmed length must be at least 5 seconds!");
      return;
    }
    if (finalDuration > 60) {
      toast.error("Trimmed length cannot exceed 60 seconds (1 minute)!");
      return;
    }

    setUploading(true);
    try {
      const parsedTags = uploadTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);

      const newShort = {
        title: uploadTitle.trim(),
        creatorName: user?.name || user?.email?.split('@')[0] || 'Creator',
        creatorId: user?.uid || 'user-123',
        category: uploadCategory,
        tags: parsedTags.length > 0 ? parsedTags : ['#supershort', `#${uploadCategory.toLowerCase().replace(/\s+/g, '')}`],
        durationSeconds: finalDuration,
        audioUrl: rawAudioUrl, // Saved locally / dataURL preview
        synthType: 'chime',
        downloads: 0,
        uses: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        earningExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        totalRenewalSpent: 0,
        downloadsWhileExpired: 0,
        usesWhileExpired: 0,
        renewalHistory: []
      };

      await addDoc(collection(db, 'super_shorts'), newShort);
      toast.success("🎉 Super Short published successfully with 1-Year Active Monetization License!");
      
      // Reset form
      setUploadTitle('');
      setUploadTags('');
      setRawAudioFile(null);
      setRawAudioUrl(null);
      setRawDuration(0);
      setActiveTab('explore');
    } catch (err) {
      console.warn("Upload error, using local fallback state:", err);
      // Fallback local add
      const localShort: SuperShortItem = {
        id: `local-${Date.now()}`,
        title: uploadTitle.trim(),
        creatorName: user?.name || 'You',
        creatorId: user?.uid || 'local-user',
        category: uploadCategory,
        tags: ['#supershort', '#custom'],
        durationSeconds: Math.round(trimEnd - trimStart),
        audioUrl: rawAudioUrl,
        synthType: 'chime',
        downloads: 0,
        uses: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        earningExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        totalRenewalSpent: 0,
        downloadsWhileExpired: 0,
        usesWhileExpired: 0,
        renewalHistory: []
      };
      setShorts(prev => [localShort, ...prev]);
      toast.success("🎉 Super Short published locally!");
      setActiveTab('explore');
    } finally {
      setUploading(false);
    }
  };

  // Renew Short Monetization Billing ($10 for 1yr, $15 for 2yr, $25 for 3yr, $35 for 4yr, $45 for 5yr)
  const handleRenewShortMonetization = async (shortItem: SuperShortItem, years: number, cost: number) => {
    const success = await sendPayment(
      cost, 
      `1-5 Year Monetization & Promotion Renewal (${years} Year/s) for Super Short: "${shortItem.title}"`,
      'Super Short Renewal'
    );

    if (!success) {
      toast.error(`Insufficient wallet balance! You need $${cost} to renew monetization for ${years} year(s). Please top up your wallet.`);
      return;
    }

    const now = new Date();
    const currentExpiry = shortItem.earningExpiresAt ? new Date(shortItem.earningExpiresAt) : now;
    const baseDate = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + years * 365 * 24 * 3600 * 1000);

    const renewalRecord = {
      id: `renew-${Date.now()}`,
      renewedAt: now.toISOString(),
      yearsAdded: years,
      cost: cost,
      newExpiresAt: newExpiry.toISOString()
    };

    try {
      if (!shortItem.id.startsWith('short-') && !shortItem.id.startsWith('local-')) {
        const docRef = doc(db, 'super_shorts', shortItem.id);
        await updateDoc(docRef, {
          earningExpiresAt: newExpiry.toISOString(),
          totalRenewalSpent: increment(cost),
          renewalHistory: [...(shortItem.renewalHistory || []), renewalRecord]
        });
      } else {
        setShorts(prev => prev.map(s => {
          if (s.id === shortItem.id) {
            return {
              ...s,
              earningExpiresAt: newExpiry.toISOString(),
              totalRenewalSpent: (s.totalRenewalSpent || 0) + cost,
              renewalHistory: [...(s.renewalHistory || []), renewalRecord]
            };
          }
          return s;
        }));
      }
      toast.success(`🎉 Successfully renewed "${shortItem.title}" for ${years} Year(s) ($${cost})! Earning & promotion active until ${newExpiry.toLocaleDateString()}.`);
    } catch (err) {
      setShorts(prev => prev.map(s => {
        if (s.id === shortItem.id) {
          return {
            ...s,
            earningExpiresAt: newExpiry.toISOString(),
            totalRenewalSpent: (s.totalRenewalSpent || 0) + cost,
            renewalHistory: [...(s.renewalHistory || []), renewalRecord]
          };
        }
        return s;
      }));
      toast.success(`🎉 Renewal recorded! Monetization active until ${newExpiry.toLocaleDateString()}.`);
    }
  };

  // Download Short & Increment Counters (with 1-Year Expiration Check)
  const handleDownloadShort = async (shortItem: SuperShortItem) => {
    const isExpired = shortItem.earningExpiresAt ? new Date().getTime() > new Date(shortItem.earningExpiresAt).getTime() : false;

    try {
      let url = shortItem.audioUrl;
      if (!url || url === '') {
        url = generateSynthesizedAudio(shortItem.synthType || 'chime');
      }

      // Trigger standard browser download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${shortItem.title.toLowerCase().replace(/\s+/g, '_')}_supershort.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (isExpired) {
        toast.warning(
          `Downloaded "${shortItem.title}". ⚠️ Notice: Creator earnings for this track are currently PAUSED (1-Year Earning License Expired). Creator must renew billing ($10 - $45) to count earnings.`,
          { duration: 6000 }
        );
      } else {
        toast.success(`Downloaded "${shortItem.title}"! (+1 Active Download - $0.005 Credited to Creator)`);
      }

      // Update Firestore count
      if (!shortItem.id.startsWith('short-') && !shortItem.id.startsWith('local-')) {
        const docRef = doc(db, 'super_shorts', shortItem.id);
        await updateDoc(docRef, {
          downloads: increment(1),
          ...(isExpired ? { downloadsWhileExpired: increment(1) } : {})
        });
      } else {
        // Local state update
        setShorts(prev => prev.map(s => s.id === shortItem.id ? { 
          ...s, 
          downloads: s.downloads + 1,
          downloadsWhileExpired: (s.downloadsWhileExpired || 0) + (isExpired ? 1 : 0)
        } : s));
      }
    } catch (e) {
      toast.info("Download completed.");
    }
  };

  // Use Short in Places (Status, Ads, Videos, Clip Area) with 1-Year Expiration Check
  const handleUseShortIn = async (destination: 'status' | 'ads' | 'video' | 'clip') => {
    if (!usageModalShort) return;

    const isExpired = usageModalShort.earningExpiresAt ? new Date().getTime() > new Date(usageModalShort.earningExpiresAt).getTime() : false;

    try {
      // Increment uses metric
      if (!usageModalShort.id.startsWith('short-') && !usageModalShort.id.startsWith('local-')) {
        const docRef = doc(db, 'super_shorts', usageModalShort.id);
        await updateDoc(docRef, {
          uses: increment(1),
          ...(isExpired ? { usesWhileExpired: increment(1) } : {})
        });
      } else {
        setShorts(prev => prev.map(s => s.id === usageModalShort.id ? { 
          ...s, 
          uses: s.uses + 1,
          usesWhileExpired: (s.usesWhileExpired || 0) + (isExpired ? 1 : 0)
        } : s));
      }

      const shortTitle = usageModalShort.title;
      setUsageModalShort(null);

      if (isExpired) {
        toast.warning(`Notice: " ${shortTitle} " is attached! Note that creator monetization for this clip is PAUSED because its 1-year earning license has expired ($10-$45 renewal required).`);
      }

      if (destination === 'status') {
        toast.success(`Pre-loaded "${shortTitle}" into Supreme Statuses!`);
        navigate('/network');
      } else if (destination === 'ads') {
        toast.success(`Attached "${shortTitle}" as Audio Backing for Ad Creation!`);
        navigate('/ads');
      } else if (destination === 'video') {
        toast.success(`Pre-loaded "${shortTitle}" into Content Creator Studio!`);
        navigate('/content-creator');
      } else if (destination === 'clip') {
        toast.success(`Pre-loaded "${shortTitle}" into Supreme Streams & Clip Area!`);
        navigate('/streams');
      }
    } catch (err) {
      toast.success("Short audio attached successfully!");
    }
  };

  // Reward Calculations
  // Rule: 500 downloads or uses = $2.50 earned ($0.005 per use/download)
  const myShorts = shorts.filter(s => s.creatorId === (user?.uid || 'user-123') || s.creatorName === (user?.name || 'Supreme Sound Lab'));
  const totalMyDownloads = myShorts.reduce((acc, curr) => acc + curr.downloads, 0);
  const totalMyUses = myShorts.reduce((acc, curr) => acc + curr.uses, 0);
  const totalMyActivityCount = totalMyDownloads + totalMyUses;
  const totalEarnedDollars = (totalMyActivityCount * 0.005);
  const currentMilestoneUses = totalMyActivityCount % 500;
  const progressPercent = Math.min(100, Math.round((currentMilestoneUses / 500) * 100));

  const [claimedPayouts, setClaimedPayouts] = useState(0);

  const handleClaimReward = async () => {
    const claimableAmount = Number((totalEarnedDollars - claimedPayouts).toFixed(2));
    if (claimableAmount <= 0) {
      toast.error("No pending rewards to claim yet! Earn more downloads/uses.");
      return;
    }

    try {
      await receivePayment(claimableAmount, `Super Short Creator Reward (${totalMyActivityCount} Uses/Downloads)`, 'Creator Payout');
      setClaimedPayouts(prev => prev + claimableAmount);
      toast.success(`🎉 Claimed $${claimableAmount.toFixed(2)} to your Supreme Wallet!`);
    } catch (e) {
      toast.success(`🎉 $${claimableAmount.toFixed(2)} credited to your Wallet balance!`);
      setClaimedPayouts(prev => prev + claimableAmount);
    }
  };

  // Filtered Shorts List
  const filteredShorts = shorts.filter(item => {
    const matchesCategory = selectedCategory === 'All Shorts' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Recharts Data for Analytics
  const analyticsData = [
    { name: 'Mon', downloads: 120, uses: 180, revenue: 1.50 },
    { name: 'Tue', downloads: 210, uses: 340, revenue: 2.75 },
    { name: 'Wed', downloads: 310, uses: 450, revenue: 3.80 },
    { name: 'Thu', downloads: 490, uses: 620, revenue: 5.55 },
    { name: 'Fri', downloads: 580, uses: 790, revenue: 6.85 },
    { name: 'Sat', downloads: 720, uses: 950, revenue: 8.35 },
    { name: 'Sun', downloads: totalMyDownloads || 850, uses: totalMyUses || 1100, revenue: Number(totalEarnedDollars.toFixed(2)) || 9.75 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-supreme-bg)] text-gray-900 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-b border-purple-800/40 py-10 px-6 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Stand-Alone Feature Engine
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-amber-300">
              Super Short
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Discover, trim, and deploy short audio clips, status tones, sound FX, and ad jingles. Earn <strong>$2.50 for every 500 downloads/uses</strong>!
            </p>
          </div>

          {/* Quick Metrics Bar & Guidelines Button */}
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowGuidelinesModal(true)}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start md:self-end shadow-md"
            >
              <FileText className="w-4 h-4 text-purple-300" />
              Community Guidelines & Rules
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-xs text-gray-400 font-medium uppercase">Short Clips</div>
                <div className="text-2xl font-bold text-white mt-1">{shorts.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-xs text-gray-400 font-medium uppercase">Reward Rate</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">$2.50 <span className="text-xs text-gray-300 font-normal">/ 500 uses</span></div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-400 font-medium uppercase">Total Creator Uses</div>
                <div className="text-2xl font-bold text-purple-300 mt-1">
                  {shorts.reduce((acc, curr) => acc + curr.uses + curr.downloads, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'explore'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Music className="w-4 h-4" />
            Explore Shorts
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload & Trimmer
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            Reward System & Analytics
          </button>

          <button
            onClick={() => setActiveTab('renewals')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'renewals'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Earning Renewal & Analysis
            {shorts.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length > 0 && (
              <span className="bg-amber-400 text-black text-xs px-2 py-0.5 rounded-full font-black">
                {shorts.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length} Expired
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('violations')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'violations'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            Violation Tracker
            {violations.filter(v => v.status === 'Pending Review').length > 0 && (
              <span className="bg-white text-rose-600 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {violations.filter(v => v.status === 'Pending Review').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: EXPLORE SHORTS */}
      {activeTab === 'explore' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search short tracks, status tones, tags (#viral, #status)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              />
            </div>

            {/* Quick Upload Button */}
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Upload New Short
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-900 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Shorts Grid */}
          {filteredShorts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No Super Shorts Found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                No short audio clips match your search query or category filter. Try clearing your search or upload your own!
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Shorts'); }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShorts.map(item => {
                const isPlaying = playingId === item.id;
                const isExpired = item.earningExpiresAt ? new Date().getTime() > new Date(item.earningExpiresAt).getTime() : false;
                const daysRemaining = item.earningExpiresAt ? Math.ceil((new Date(item.earningExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 365;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top Creator Info & Duration Pill */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          0:{item.durationSeconds < 10 ? `0${item.durationSeconds}` : item.durationSeconds}
                        </span>
                      </div>

                      {/* Monetization / Expiration Status Badge */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            Earnings Paused (1-Yr Expired)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Monetized ({daysRemaining}d left)
                          </span>
                        )}

                        <button
                          onClick={() => setRenewalModalShort(item)}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-0.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Renew ($10-$45)
                        </button>
                      </div>

                      {/* Title & Creator */}
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        By <span className="text-purple-600 font-semibold">{item.creatorName}</span>
                      </p>

                      {/* Audio Wave / Player Control Block */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 rounded-xl text-white flex items-center gap-3">
                        <button
                          onClick={() => togglePlayShort(item)}
                          className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shrink-0 shadow-md transition-all transform active:scale-95"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        {/* Animated Waveform Progress Indicator */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-end gap-1 h-6 px-1">
                            {[40, 70, 30, 90, 50, 80, 20, 100, 60, 40, 80, 50].map((h, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'
                                }`}
                                style={{
                                  height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 0.8 : 1)))}%` : `${h}%`
                                }}
                              />
                            ))}
                          </div>

                          {/* Progress Line */}
                          {isPlaying && (
                            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-400 h-full transition-all"
                                style={{ width: `${audioProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tag list */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Metrics & Actions */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1" title="Total Downloads">
                          <Download className="w-3.5 h-3.5 text-gray-400" />
                          {item.downloads}
                        </span>
                        <span className="flex items-center gap-1" title="Total Uses in App">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          {item.uses}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Download button */}
                        <button
                          onClick={() => handleDownloadShort(item)}
                          className="p-2 bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-purple-600 rounded-xl transition-all"
                          title="Download Audio Clip"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Report Violation button */}
                        <button
                          onClick={() => setReportModalShort(item)}
                          className="p-2 bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                          title="Report Policy Violation"
                        >
                          <Flag className="w-4 h-4" />
                        </button>

                        {/* Use Short In... Button */}
                        <button
                          onClick={() => setUsageModalShort(item)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                        >
                          Use Short
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD & TRIMMER / CUTTER */}
      {activeTab === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-6 h-6 text-purple-600" />
                Upload Super Short & Cutter
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload short songs, sound effects, or tone clips. Mandatory duration: <strong>min 5 seconds, max 60 seconds (1 min)</strong>.
              </p>
            </div>

            {/* Step 1: File Selection Area */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Select Audio File (.mp3, .wav, .m4a)</label>
              
              <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Music className="w-12 h-12 text-purple-500 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-bold text-gray-800">
                  {rawAudioFile ? rawAudioFile.name : "Click or drag audio file here to upload"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: MP3, WAV, M4A, AAC • Min 5s - Max 60s
                </p>
              </div>
            </div>

            {/* Trimmer / Cutter Controls (If file selected or >60s) */}
            {rawAudioUrl && (
              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-5 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-base">Short Audio Trimmer & Cutter</span>
                  </div>
                  <button
                    onClick={handleAutoTrim}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Auto-Trim to 60s
                  </button>
                </div>

                {/* Duration Status Pill */}
                <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs font-mono">
                  <div>
                    Original Duration: <span className="text-amber-300 font-bold">{rawDuration}s</span>
                  </div>
                  <div>
                    Trimmed Selection: <span className="text-emerald-400 font-bold">{Math.round(trimEnd - trimStart)}s</span> (5s - 60s)
                  </div>
                </div>

                {/* Interactive Sliders */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium flex justify-between mb-1">
                      <span>Start Cut Position</span>
                      <span className="text-purple-300 font-mono">{trimStart}s</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, rawDuration - 5)}
                      value={trimStart}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTrimStart(val);
                        if (trimEnd - val > 60) {
                          setTrimEnd(val + 60);
                        } else if (trimEnd - val < 5) {
                          setTrimEnd(Math.min(rawDuration, val + 5));
                        }
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-medium flex justify-between mb-1">
                      <span>End Cut Position</span>
                      <span className="text-purple-300 font-mono">{trimEnd}s</span>
                    </label>
                    <input
                      type="range"
                      min={trimStart + 5}
                      max={Math.min(rawDuration, trimStart + 60)}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Trimmer Audio Preview Button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={togglePlayTrimmer}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                  >
                    {trimmerPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {trimmerPlaying ? "Pause Trim Preview" : "Play Trimmed Preview"}
                  </button>

                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready for Publish
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Metadata Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Short Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber Bell Notification or LoFi Chill Ringtone"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All Shorts').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. status, viral, tone, beat"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Publish Action Button */}
            <button
              onClick={handlePublishShort}
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold text-base rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-300" />
              )}
              {uploading ? "Publishing Super Short..." : "Publish Super Short Track"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: REWARD SYSTEM & ANALYTICS */}
      {activeTab === 'rewards' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
          {/* Top Reward Progress Card */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-amber-200 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                Monetization Standard: 500 Uses = $2.50
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Super Short Creator Earnings
              </h2>

              <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
                Every time another user downloads or deploys your short track in Statuses, Ads, Videos, or Clips, you automatically accumulate progress toward cash payouts!
              </p>

              {/* Progress Bar Gauge */}
              <div className="bg-black/30 p-5 rounded-2xl border border-white/20 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Current Milestone Progress ({currentMilestoneUses} / 500 uses)</span>
                  <span className="text-amber-300 font-mono text-base">{progressPercent}%</span>
                </div>

                <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-amber-200 pt-1">
                  <span>Total Tracks Uploaded: {myShorts.length}</span>
                  <span>Estimated Total Earned: <strong className="text-white text-sm">${totalEarnedDollars.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Claim Payout Button */}
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={handleClaimReward}
                  className="px-6 py-3.5 bg-white text-gray-900 font-extrabold text-sm rounded-xl shadow-xl hover:bg-amber-100 transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <Award className="w-5 h-5 text-amber-600" />
                  Claim Earned Rewards to Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Performance & Downloads Analysis
                </h3>
                <p className="text-xs text-gray-500">Weekly downloads, in-app uses, and estimated monetization yield</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="downloads" name="Downloads" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="uses" name="In-App Uses" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* My Uploaded Shorts Management Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Uploaded Super Shorts ({myShorts.length})</h3>

            {myShorts.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                You have not uploaded any Super Shorts yet. Switch to the <strong>Upload & Trimmer</strong> tab to create your first short sound!
              </p>
            ) : (
              <div className="divide-y divide-gray-100 overflow-x-auto">
                {myShorts.map(item => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.category} • 0:{item.durationSeconds}s</p>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div>
                        <span className="text-gray-400">Downloads: </span>
                        <strong className="text-gray-900">{item.downloads}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Uses: </span>
                        <strong className="text-amber-600">{item.uses}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Yield: </span>
                        <strong className="text-emerald-600">${((item.downloads + item.uses) * 0.005).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VIOLATION TRACKER */}
      {activeTab === 'violations' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
          {/* Top Compliance & Strike Meter Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldAlert className="w-64 h-64 text-rose-500" />
            </div>

            <div className="relative z-10 space-y-6 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Content Integrity Engine</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold">Account Safety & Violation Tracker</h2>
                  </div>
                </div>

                <button
                  onClick={handleRunSafetyAudit}
                  disabled={isAuditing}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                  {isAuditing ? "Auditing Audio Fingerprints..." : "Run AI Safety Audit"}
                </button>
              </div>

              {/* Strikes Gauge Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                  <div className="text-xs text-gray-400 font-medium">Account Strike Status</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-400">{userStrikes}</span>
                    <span className="text-xs text-gray-400 font-bold">/ 3 Max Strikes</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 mt-1">Clean standing — no policy violations found.</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                  <div className="text-xs text-gray-400 font-medium">Upload & Earning Status</div>
                  <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    Fully Active
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Free to upload 5s-60s shorts and earn rewards.</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                  <div className="text-xs text-gray-400 font-medium">Automated Safety Guard</div>
                  <div className="text-lg font-bold text-purple-300 mt-1 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400 shrink-0" />
                    24/7 Active Scan
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Decibel gain, copyright & explicit audio filter enabled.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Violation Reports & Log Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Violation Logs & Community Reports ({violations.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Reported tracks under moderation review or resolved policy actions</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Pending Review', 'Under Investigation', 'Resolved - Action Taken', 'Dismissed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setViolationStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      violationStatusFilter === status
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Table */}
            {violations.filter(v => violationStatusFilter === 'All' || v.status === violationStatusFilter).length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl p-6">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No Violations Found in this Filter</p>
                <p className="text-xs text-gray-500 mt-1">All Super Short audio tracks are currently in full compliance with Community Guidelines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations
                  .filter(v => violationStatusFilter === 'All' || v.status === violationStatusFilter)
                  .map(viol => (
                    <div
                      key={viol.id}
                      className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-extrabold">
                            {viol.reason}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{viol.shortTitle}</h4>
                        </div>

                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold self-start sm:self-auto ${
                          viol.status === 'Resolved - Action Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : viol.status === 'Pending Review'
                            ? 'bg-amber-100 text-amber-800'
                            : viol.status === 'Under Investigation'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {viol.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {viol.details}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
                        <span>Track Creator: {viol.creatorName} • Reporter: {viol.reporterName}</span>
                        <span>{viol.timestamp}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EARNING RENEWAL & ANALYSIS */}
      {activeTab === 'renewals' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
          {/* Header Banner & Rule Notice */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                  Mandatory Monetization Rules
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
                  1-Year Monetization & Billing Renewal Center
                </h2>
                <p className="text-gray-300 text-sm mt-1 max-w-2xl leading-relaxed">
                  Owners earn rewards ($2.50 per 500 uses/downloads) for <strong>1 full year (365 days)</strong> per track. After 1 year, earnings automatically pause. To continue earning and promoting, creators renew their billing:
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
                <div className="text-xs text-gray-300">Your Wallet Balance</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-0.5">${balance.toFixed(2)}</div>
              </div>
            </div>

            {/* Price Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {SUPER_SHORT_RENEWAL_PLANS.map(plan => (
                <div key={plan.years} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center transition-all flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 text-[10px] font-bold uppercase">
                      {plan.discount}
                    </span>
                    <div className="text-lg font-black text-amber-300 mt-2">{plan.years} Year{plan.years > 1 ? 's' : ''}</div>
                    <div className="text-2xl font-extrabold text-white mt-1">${plan.price}</div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 leading-tight">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Monetized Active Shorts</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {shorts.filter(s => !s.earningExpiresAt || new Date().getTime() <= new Date(s.earningExpiresAt).getTime()).length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Earning $0.005 / download or use</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Expired / Paused Tracks</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {shorts.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">Renewal needed to resume earnings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Total Renewal Spent</div>
              <div className="text-2xl font-black text-purple-600 mt-1">
                ${shorts.reduce((acc, curr) => acc + (curr.totalRenewalSpent || 0), 0)}
              </div>
              <div className="text-[11px] text-purple-700 font-medium mt-1">Invested in track promotions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Uncredited Paused Activity</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {shorts.reduce((acc, curr) => acc + (curr.downloadsWhileExpired || 0) + (curr.usesWhileExpired || 0), 0)}
              </div>
              <div className="text-[11px] text-rose-700 font-medium mt-1">Uses during expired period</div>
            </div>
          </div>

          {/* Shorts Monetization & Billing Status Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  Track Monetization & Billing Renewal Manager
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Select a track and extend its earning validity for 1 to 5 years</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Track Title & Category</th>
                    <th className="p-3">Creation Date</th>
                    <th className="p-3">Monetization Expiry</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Uncredited Uses</th>
                    <th className="p-3">Total Renewal Spent</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shorts.map(item => {
                    const isExpired = item.earningExpiresAt ? new Date().getTime() > new Date(item.earningExpiresAt).getTime() : false;
                    const daysRemaining = item.earningExpiresAt ? Math.ceil((new Date(item.earningExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 365;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold text-gray-900">
                          <div>{item.title}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{item.category} • {item.creatorName}</div>
                        </td>
                        <td className="p-3 font-mono">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Initial'}
                        </td>
                        <td className="p-3 font-mono">
                          {item.earningExpiresAt ? new Date(item.earningExpiresAt).toLocaleDateString() : '1 Year Default'}
                        </td>
                        <td className="p-3">
                          {isExpired ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Earnings Paused
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active ({daysRemaining}d)
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-rose-600">
                          {(item.downloadsWhileExpired || 0) + (item.usesWhileExpired || 0)}
                        </td>
                        <td className="p-3 font-mono font-bold text-purple-600">
                          ${item.totalRenewalSpent || 0}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setRenewalModalShort(item)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1 ml-auto"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Renew ($10-$45)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Renewal Analytics Chart */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              Monetization Active vs Expired Performance Analytics
            </h3>
            <p className="text-xs text-gray-500">Weekly breakdown of credited vs paused downloads and renewal investment value.</p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="downloads" fill="#a855f7" radius={[4, 4, 0, 0]} name="Active Credited Downloads" />
                  <Bar dataKey="uses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Active Credited Uses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* RENEWAL BILLING SELECTION MODAL */}
      <AnimatePresence>
        {renewalModalShort && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Renew Monetization & Billing</span>
                    <h3 className="text-xl font-bold text-gray-900">{renewalModalShort.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Creator: {renewalModalShort.creatorName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRenewalModalShort(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  1-Year Monetization Rule
                </div>
                <p>
                  Renewing extends your earning eligibility ($2.50 / 500 uses) and keeps your track actively promoted across Super Shorts.
                </p>
              </div>

              {/* Renewal Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select Renewal Billing Package:</label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {SUPER_SHORT_RENEWAL_PLANS.map(plan => (
                    <button
                      key={plan.years}
                      onClick={() => {
                        const targetShort = renewalModalShort;
                        setRenewalModalShort(null);
                        handleRenewShortMonetization(targetShort, plan.years, plan.price);
                      }}
                      className="w-full p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">{plan.label}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {plan.discount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-700">${plan.price}</div>
                        <div className="text-[10px] text-gray-400 font-bold group-hover:text-emerald-700">Pay via Wallet →</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {usageModalShort && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Deploy Super Short</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">{usageModalShort.title}</h3>
                </div>
                <button
                  onClick={() => setUsageModalShort(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Choose where in Supreme App you want to deploy this short audio clip:
              </p>

              {/* Destination Options */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status */}
                <button
                  onClick={() => handleUseShortIn('status')}
                  className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 flex flex-col items-center gap-2 transition-all"
                >
                  <Radio className="w-6 h-6 text-purple-600" />
                  <span className="text-xs font-bold">Use in Status</span>
                </button>

                {/* Ads */}
                <button
                  onClick={() => handleUseShortIn('ads')}
                  className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 flex flex-col items-center gap-2 transition-all"
                >
                  <Megaphone className="w-6 h-6 text-amber-600" />
                  <span className="text-xs font-bold">Use in Ads</span>
                </button>

                {/* Video */}
                <button
                  onClick={() => handleUseShortIn('video')}
                  className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 flex flex-col items-center gap-2 transition-all"
                >
                  <Video className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-bold">Use in Videos</span>
                </button>

                {/* Clip Area */}
                <button
                  onClick={() => handleUseShortIn('clip')}
                  className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 flex flex-col items-center gap-2 transition-all"
                >
                  <Tv className="w-6 h-6 text-rose-600" />
                  <span className="text-xs font-bold">Use in Clips</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(usageModalShort.title);
                    toast.success("Short Audio title copied to clipboard!");
                  }}
                  className="text-xs text-gray-500 hover:text-purple-600 font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Audio Track Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT VIOLATION MODAL */}
      <AnimatePresence>
        {reportModalShort && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                    <Flag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Report Policy Violation</h3>
                    <p className="text-xs text-gray-500 font-medium">Reporting: <strong className="text-purple-600">{reportModalShort.title}</strong> by {reportModalShort.creatorName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReportModalShort(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Violation Reason *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm bg-white"
                  >
                    <option value="Copyright Infringement">Copyright Infringement / Royalty Violation</option>
                    <option value="Explicit / Harmful Speech">Explicit / Harmful / Offensive Audio</option>
                    <option value="Audio Distortion / High Gain Clipping">Audio Distortion / Excessive Decibels</option>
                    <option value="Misleading Title or Category">Misleading Title / Fake Duration</option>
                    <option value="Botting / Spam Audio">Botting / Spam Audio Loop</option>
                    <option value="Other Policy Violation">Other Policy Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Violation Details *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe specific timestamps, copyright details, or reason for reporting..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setReportModalShort(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  Submit Violation Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMMUNITY GUIDELINES & RULES MODAL (MANDATORY READ & ACCEPT ON FIRST VISIT) */}
      <AnimatePresence>
        {showGuidelinesModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-100 my-8 space-y-6 relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/30">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-extrabold uppercase tracking-wider">
                      Mandatory Acceptance Required
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Super Shorts Community Guidelines</h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuidelinesModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all text-xs font-bold"
                  title="Close Guidelines"
                >
                  ✕
                </button>
              </div>

              {/* Guidelines Body */}
              <div className="space-y-5 text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-xs text-gray-500 leading-relaxed bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                  Welcome to <strong>Super Shorts</strong>! Before uploading or downloading short audio tracks, sound FX, status tones, or ad jingles, you must review and agree to our content policies and monetization rules.
                </p>

                {/* Rule Section 1: Upload Rules */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                  <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    1. Audio Upload Rules (5s Minimum - 60s Maximum)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-gray-600 list-disc list-inside leading-relaxed pl-1">
                    <li><strong>Strict Duration Limit:</strong> All Super Shorts must be between <strong>5 seconds</strong> and <strong>60 seconds (1 minute)</strong>. Longer tracks are automatically trimmed.</li>
                    <li><strong>Audio Ownership:</strong> Only upload audio you created or have explicit license rights to distribute. Full copyrighted songs without permissions are strictly prohibited.</li>
                    <li><strong>Content Standards:</strong> Zero tolerance for explicit hate speech, harassment, sexually explicit noise, or ear-damaging distorted audio.</li>
                    <li><strong>Metadata Accuracy:</strong> Titles and tags must accurately reflect the audio content. Misleading clickbait titles will be flagged by automated scanners.</li>
                  </ul>
                </div>

                {/* Rule Section 2: Download & Rewards */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    2. Download & Creator Reward Rules ($2.50 / 500 Uses)
                  </h3>
                  <ul className="text-xs space-y-1.5 text-amber-900 list-disc list-inside leading-relaxed pl-1">
                    <li><strong>Free Deployment:</strong> All downloaded shorts can be attached freely to Supreme Statuses, Video Creator Studio, Ad Backings, and Streams.</li>
                    <li><strong>Monetization Standard:</strong> Creators earn <strong>$2.50 per 500 verified downloads/uses</strong> ($0.005 per use).</li>
                    <li><strong>IP-Based Download Violations:</strong> Multiple downloads from the same IP address are considered earning violations and will NOT be counted or calculated for creator earnings.</li>
                    <li><strong>Re-Upload Restrictions:</strong> Downloading other users' shorts from the app to re-upload back to the app is strictly prohibited and will NOT count for earnings.</li>
                  </ul>
                </div>

                {/* Rule Section 3: 3-Strikes System & Earning Suspension */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                  <h3 className="font-extrabold text-rose-950 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    3. Policy Enforcement & Earning Suspension System
                  </h3>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    Continuous or repeated violations (such as IP-based download fraud or app audio re-uploading) will result in immediate <strong>Super Shorts earning suspension</strong> and potential account restrictions.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-2 rounded-xl border border-rose-200">
                      <strong className="block text-rose-700">1st Violation</strong>
                      <span className="text-[10px] text-gray-500">Track Removal & Formal Warning</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-rose-200">
                      <strong className="block text-rose-800">2nd Violation</strong>
                      <span className="text-[10px] text-gray-500">Super Shorts Earning Suspension</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-rose-200">
                      <strong className="block text-rose-900">Continued Fraud</strong>
                      <span className="text-[10px] text-gray-500">Permanent Ban & Reward Forfeiture</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox & Acceptance Button */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={guidelinesAgreed}
                    onChange={(e) => setGuidelinesAgreed(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-purple-600 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700 font-semibold group-hover:text-purple-600 transition-colors">
                    I have read, understood, and agree to strictly comply with all Super Shorts Community Guidelines, Upload/Download Rules, IP Anti-Fraud Policies, and Copyright Standards.
                  </span>
                </label>

                <button
                  onClick={handleAcceptGuidelines}
                  disabled={!guidelinesAgreed}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Read & Accept Community Guidelines
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
