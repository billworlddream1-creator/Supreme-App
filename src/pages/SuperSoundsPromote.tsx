import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Heart, 
  ThumbsDown, 
  Star, 
  Upload, 
  Sparkles, 
  Sliders, 
  Scissors, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  Wallet, 
  Clock, 
  Tag, 
  Share2, 
  Volume2, 
  VolumeX, 
  BarChart2, 
  Radio, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Film, 
  Megaphone, 
  Award, 
  Info,
  ChevronRight,
  RefreshCw,
  Crown,
  Activity,
  TrendingUp,
  Cpu,
  SlidersHorizontal,
  Layers,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

export interface CuratedPlaylist {
  id: string;
  title: string;
  subtitle: string;
  moodTheme: string;
  coverImage: string;
  description: string;
  badge: string;
}

export interface PromotedSound {
  id: string;
  trackingId: string;
  title: string;
  artist: string;
  userId: string;
  userEmail?: string;
  category: string;
  playlistId?: string; // Curated Playlist ID
  moodTheme?: string;  // Theme & mood label
  audioUrl: string;
  coverImage: string;
  durationSeconds: number; // 60s up to 3600s (1 hr)
  promotionType: 'free' | 'paid';
  promotionPlanDays?: 31 | 90 | 180 | 365;
  promotionExpiresAt?: string;
  
  // Licensing & Commercial Terms
  isRoyaltyFree?: boolean;
  licenseType?: 'royalty_free' | 'commercial_rights' | 'non_commercial' | 'custom_license';
  commercialTerms?: string;

  // Engagement & Detailed Tracking Metrics
  listens: number;
  downloads: number;
  successfulDownloads?: number;
  failedDownloads?: number;
  usagesCount?: number; // Video Studio / Ads / Clips Usages
  likes: number;
  dislikes: number;
  ratingsCount: number;
  ratingsSum: number; // Average = sum / count
  weeklyRatingsCount: number;
  weeklyRatingBonusClaimed: boolean;

  // AI Quality
  aiQualityScore?: number;
  aiMasteringNote?: string;
  
  // Security
  audioFingerprint?: string;
  uploadedAt: string;

  // Earning & Billing Renewal
  earningExpiresAt?: string; // ISO date string (1 Year default validity)
  totalRenewalSpent?: number;
  downloadsWhileExpired?: number;
  usagesWhileExpired?: number;
  renewalHistory?: {
    id: string;
    renewedAt: string;
    yearsAdded: number;
    cost: number;
    newExpiresAt: string;
  }[];
}

export const SUPER_SOUNDS_RENEWAL_PLANS = [
  { years: 1, price: 10, label: '1 Year Renewal', discount: 'Standard Rate', description: 'Extend earning & promotion validity for 1 full year.' },
  { years: 2, price: 15, label: '2 Years Renewal', discount: 'Save 25%', description: 'Extend earning & promotion validity for 2 full years.' },
  { years: 3, price: 25, label: '3 Years Renewal', discount: 'Save 16%', description: 'Extend earning & promotion validity for 3 full years.' },
  { years: 4, price: 35, label: '4 Years Renewal', discount: 'Save 12%', description: 'Extend earning & promotion validity for 4 full years.' },
  { years: 5, price: 45, label: '5 Years Renewal', discount: 'Best Value - Save 10%', description: 'Extend earning & promotion validity for 5 full years.' },
];

export interface DownloadedSoundRecord {
  id: string;
  soundId: string;
  trackingId: string;
  title: string;
  artist: string;
  audioUrl: string;
  downloadedByUserId: string;
  userIp: string;
  downloadedAt: string;
}

export interface IpDownloadTrackerRecord {
  ip: string;
  downloadCount: number;
  duplicateAttempts: number;
  lastDownloadedAt: string;
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
}

export interface SecurityViolationRecord {
  id: string;
  rule: 'Rule 1 (Re-Upload Blocked)' | 'Rule 2 (IP Admin Suspension Penalty)' | 'Rule 3 (Duplicate Promotion Blocked)';
  trackTitle: string;
  trackingId?: string;
  userIp: string;
  details: string;
  timestamp: string;
}

export const CURATED_PLAYLISTS: CuratedPlaylist[] = [
  {
    id: 'pl-afro-energy',
    title: '🔥 Afro-Fusion & High Energy Hits',
    subtitle: 'Rhythmic percussions & club bangers',
    moodTheme: 'High Energy',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    description: 'Electrifying Afrobeat drums and energetic rhythms for viral video reels and dance challenges.',
    badge: 'Trending Mood'
  },
  {
    id: 'pl-lofi-focus',
    title: '🌙 Late Night Lo-Fi & Chill Focus',
    subtitle: 'Smooth study beats & ambient relaxation',
    moodTheme: 'Deep Focus & Chill',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    description: 'Mellow vinyl crackles, warm keys, and relaxing tempos for concentration, study, and background ambience.',
    badge: 'Creator Choice'
  },
  {
    id: 'pl-cinematic-trailers',
    title: '🎬 Epic Cinematic & Game Soundtracks',
    subtitle: 'Orchestral drops, risers & trailer FX',
    moodTheme: 'Cinematic Drama',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    description: 'Dramatic orchestral swells, risers, and heavy sub impacts crafted for film trailers and game intros.',
    badge: 'Studio Grade'
  },
  {
    id: 'pl-gospel-praise',
    title: '✝️ Gospel Worship & Soul Uplift',
    subtitle: 'Inspirational choir & soulful organ grooves',
    moodTheme: 'Inspirational & Gospel',
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
    description: 'Uplifting vocal harmonies, organ melodies, and soul-stirring worship atmospheres.',
    badge: 'Soulful'
  },
  {
    id: 'pl-podcast-talk',
    title: '🎙️ Podcast Intros & Commercial Beds',
    subtitle: 'Clean background beds & voiceover beds',
    moodTheme: 'Talk & Corporate',
    coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
    description: 'Polished background audio designed for voiceover clarity in commercial advertisements and talk shows.',
    badge: 'Commercial Ready'
  }
];

const CATEGORIES = [
  'All',
  'Afrobeats',
  'Hip Hop & Rap',
  'Pop & R&B',
  'Electronic & Dance',
  'Gospel & Inspirational',
  'Ambient & Lo-Fi',
  'Podcast & Talk',
  'Cinematic & Trailers',
  'Sound Effects'
];

const PROMOTION_PLANS = [
  { days: 31, price: 5, label: '31 Days Standard', popular: false },
  { days: 90, price: 12, label: '90 Days Growth', popular: true },
  { days: 180, price: 20, label: '180 Days Pro', popular: false },
  { days: 365, price: 45, label: '365 Days Ultimate', popular: false }
];

const DEFAULT_SOUNDS: PromotedSound[] = [
  {
    id: 'ssp-101',
    trackingId: 'SSP-TRK-882910',
    title: 'Afro Beats Supreme Vibe (Album Single)',
    artist: 'Starboy Kizz',
    userId: 'user_starboy',
    category: 'Afrobeats',
    playlistId: 'pl-afro-energy',
    moodTheme: 'High Energy',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 210, // 3m 30s
    promotionType: 'paid',
    promotionPlanDays: 90,
    isRoyaltyFree: true,
    licenseType: 'royalty_free',
    commercialTerms: '100% Royalty Free for Commercial Videos, Podcasts, Ads & Shorts',
    listens: 14200,
    downloads: 1850,
    successfulDownloads: 1812,
    failedDownloads: 38,
    usagesCount: 1240,
    likes: 3400,
    dislikes: 12,
    ratingsCount: 21400,
    ratingsSum: 104860, // 4.9 average
    weeklyRatingsCount: 21400,
    weeklyRatingBonusClaimed: false,
    aiQualityScore: 98,
    aiMasteringNote: 'Exceptional 320kbps spatial audio, pristine low-end punch & balanced vocal frequency.',
    uploadedAt: '2026-07-28 14:20',
    earningExpiresAt: new Date(Date.now() + 220 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usagesWhileExpired: 0
  },
  {
    id: 'ssp-102',
    trackingId: 'SSP-TRK-552104',
    title: 'Midnight Lo-Fi Chill Hop (EP Stream)',
    artist: 'Luna Beats',
    userId: 'user_luna',
    category: 'Ambient & Lo-Fi',
    playlistId: 'pl-lofi-focus',
    moodTheme: 'Deep Focus & Chill',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 1800, // 30 min
    promotionType: 'paid',
    promotionPlanDays: 180,
    isRoyaltyFree: true,
    licenseType: 'royalty_free',
    commercialTerms: 'Royalty Free Commercial Use (Attribution Requested)',
    listens: 8900,
    downloads: 940,
    successfulDownloads: 928,
    failedDownloads: 12,
    usagesCount: 810,
    likes: 1850,
    dislikes: 5,
    ratingsCount: 4200,
    ratingsSum: 20160, // 4.8
    weeklyRatingsCount: 4200,
    weeklyRatingBonusClaimed: false,
    aiQualityScore: 94,
    aiMasteringNote: 'Warm analog tape saturation, smooth dynamic range (-14 LUFS broadcast master).',
    uploadedAt: '2026-07-25 10:15',
    earningExpiresAt: new Date(Date.now() + 150 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usagesWhileExpired: 0
  },
  {
    id: 'ssp-103',
    trackingId: 'SSP-TRK-109283',
    title: 'Cinematic Trailer Drop & Risers FX',
    artist: 'Apex Sound Lab',
    userId: 'user_apex',
    category: 'Sound Effects',
    playlistId: 'pl-cinematic-trailers',
    moodTheme: 'Cinematic Drama',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 58, // Free 1 min max
    promotionType: 'free',
    isRoyaltyFree: true,
    licenseType: 'commercial_rights',
    commercialTerms: 'Commercial Rights Included for Cinematic Trailers, Games & Ads',
    listens: 4200,
    downloads: 680,
    successfulDownloads: 662,
    failedDownloads: 18,
    usagesCount: 520,
    likes: 920,
    dislikes: 18,
    ratingsCount: 1100,
    ratingsSum: 5170, // 4.7
    weeklyRatingsCount: 1100,
    weeklyRatingBonusClaimed: false,
    aiQualityScore: 91,
    aiMasteringNote: 'Crisp transient response, wide stereo panorama ideal for video transitions.',
    uploadedAt: '2025-07-01 18:40',
    earningExpiresAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), // Expired 20 days ago!
    totalRenewalSpent: 0,
    downloadsWhileExpired: 48,
    usagesWhileExpired: 32
  },
  {
    id: 'ssp-104',
    trackingId: 'SSP-TRK-771829',
    title: 'Heavenly Worship & Choir Organ Backdrop',
    artist: 'Grace & Praise Ministry',
    userId: 'user_grace',
    category: 'Gospel & Inspirational',
    playlistId: 'pl-gospel-praise',
    moodTheme: 'Inspirational & Gospel',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 300,
    promotionType: 'paid',
    promotionPlanDays: 90,
    isRoyaltyFree: true,
    licenseType: 'royalty_free',
    commercialTerms: '100% Royalty Free for Church Media, Podcasts & Livestreams',
    listens: 9800,
    downloads: 1140,
    successfulDownloads: 1120,
    failedDownloads: 20,
    usagesCount: 780,
    likes: 2100,
    dislikes: 8,
    ratingsCount: 3800,
    ratingsSum: 18620, // 4.9
    weeklyRatingsCount: 3800,
    weeklyRatingBonusClaimed: false,
    aiQualityScore: 96,
    aiMasteringNote: 'Lush vocal choir dynamics with smooth harmonic balance.',
    uploadedAt: '2026-07-26 12:00',
    earningExpiresAt: new Date(Date.now() + 310 * 24 * 3600 * 1000).toISOString(),
    totalRenewalSpent: 0,
    downloadsWhileExpired: 0,
    usagesWhileExpired: 0
  },
  {
    id: 'ssp-105',
    trackingId: 'SSP-TRK-339201',
    title: 'Modern Business & Tech Commercial Bed',
    artist: 'Studio Pro Media',
    userId: 'user_studiopro',
    category: 'Podcast & Talk',
    playlistId: 'pl-podcast-talk',
    moodTheme: 'Talk & Corporate',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 120,
    promotionType: 'paid',
    promotionPlanDays: 31,
    isRoyaltyFree: true,
    licenseType: 'commercial_rights',
    commercialTerms: 'Cleared for Voiceovers, Corporate Videos, TV Ads & Podcasts',
    listens: 5400,
    downloads: 540,
    successfulDownloads: 532,
    failedDownloads: 8,
    usagesCount: 430,
    likes: 880,
    dislikes: 3,
    ratingsCount: 1500,
    ratingsSum: 7200, // 4.8
    weeklyRatingsCount: 1500,
    weeklyRatingBonusClaimed: false,
    aiQualityScore: 93,
    aiMasteringNote: 'Clean voiceover notch filtering, broadcast standard -14 LUFS.',
    uploadedAt: '2025-06-15 16:30',
    earningExpiresAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(), // Expired 40 days ago!
    totalRenewalSpent: 0,
    downloadsWhileExpired: 35,
    usagesWhileExpired: 20
  }
];

export default function SuperSoundsPromote() {
  const { user } = useAuth();
  const { balance, withdraw, receivePayment } = useWallet();

  const [sounds, setSounds] = useState<PromotedSound[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio Player State
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // User Interaction Tracking (Local Storage & State)
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userDislikes, setUserDislikes] = useState<Record<string, boolean>>({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [downloadedIps, setDownloadedIps] = useState<Record<string, string[]>>({}); // soundId -> list of IPs

  // Billing Subscription State for User
  const [hasActiveBillingSub, setHasActiveBillingSub] = useState<boolean>(true);

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showTrimmerModal, setShowTrimmerModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showCashoutModal, setShowCashoutModal] = useState<boolean>(false);
  const [showUseSoundModal, setShowUseSoundModal] = useState<boolean>(false);

  // Selected Sound for Modals
  const [selectedSound, setSelectedSound] = useState<PromotedSound | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadArtist, setUploadArtist] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Afrobeats');
  const [uploadAudioUrl, setUploadAudioUrl] = useState<string>('');
  const [uploadCoverUrl, setUploadCoverUrl] = useState<string>('');
  const [uploadDurationSec, setUploadDurationSec] = useState<number>(180); // 3 mins
  const [uploadPromoType, setUploadPromoType] = useState<'free' | 'paid'>('paid');
  const [selectedPlanDays, setSelectedPlanDays] = useState<31 | 90 | 180 | 365>(90);
  
  // Royalty-Free & Licensing Upload State
  const [uploadIsRoyaltyFree, setUploadIsRoyaltyFree] = useState<boolean>(true);
  const [uploadLicenseType, setUploadLicenseType] = useState<'royalty_free' | 'commercial_rights' | 'non_commercial' | 'custom_license'>('royalty_free');
  const [uploadCommercialTerms, setUploadCommercialTerms] = useState<string>('100% Royalty Free for Commercial & Monetized Media');

  // Filter Options & View Mode State
  const [royaltyFreeOnly, setRoyaltyFreeOnly] = useState<boolean>(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | 'all'>('all');
  const [uploadPlaylistId, setUploadPlaylistId] = useState<string>('pl-afro-energy');
  const [uploadMoodTheme, setUploadMoodTheme] = useState<string>('High Energy');
  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics' | 'renewals' | 'security'>('catalog');
  const [renewalModalSound, setRenewalModalSound] = useState<PromotedSound | null>(null);
  const [minQualityScore, setMinQualityScore] = useState<number>(0);
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'score' | 'listens' | 'downloads' | 'rating'>('score');

  // Active Client IP for session & admin simulation
  const [currentClientIp, setCurrentClientIp] = useState<string>('198.51.100.22');

  // RULE 1 & 3: Downloaded Sounds ID Tracking Registry
  const [downloadedSoundRecords, setDownloadedSoundRecords] = useState<DownloadedSoundRecord[]>([
    {
      id: 'dl-rec-101',
      soundId: 'ssp-101',
      trackingId: 'SSP-TRK-882910',
      title: 'Afro Beats Supreme Vibe (Album Single)',
      artist: 'Starboy Kizz',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      downloadedByUserId: 'user_listener_99',
      userIp: '198.51.100.22',
      downloadedAt: '2026-07-30 10:15:00'
    },
    {
      id: 'dl-rec-102',
      soundId: 'ssp-102',
      trackingId: 'SSP-TRK-552104',
      title: 'Midnight Lo-Fi Chill Hop (EP Stream)',
      artist: 'Luna Beats',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
      downloadedByUserId: 'user_listener_88',
      userIp: '203.0.113.88',
      downloadedAt: '2026-07-30 11:40:00'
    }
  ]);

  // RULE 2: IP Download Penalty & Admin Suspension Tracker
  const [ipTracker, setIpTracker] = useState<Record<string, IpDownloadTrackerRecord>>({
    '198.51.100.22': {
      ip: '198.51.100.22',
      downloadCount: 2,
      duplicateAttempts: 0,
      lastDownloadedAt: '2026-07-30 10:15:00',
      isSuspended: false
    },
    '198.51.100.99': {
      ip: '198.51.100.99',
      downloadCount: 12,
      duplicateAttempts: 8,
      lastDownloadedAt: '2026-07-30 14:00:00',
      isSuspended: true,
      suspensionReason: 'Admin Suspension Penalty: Multiple fraudulent download streams detected from this IP.',
      suspendedAt: '2026-07-30 14:02:00'
    },
    '203.0.113.88': {
      ip: '203.0.113.88',
      downloadCount: 1,
      duplicateAttempts: 0,
      lastDownloadedAt: '2026-07-30 11:40:00',
      isSuspended: false
    }
  });

  // Security Violations Audit Log
  const [securityViolationsLog, setSecurityViolationsLog] = useState<SecurityViolationRecord[]>([
    {
      id: 'sec-v-1',
      rule: 'Rule 2 (IP Admin Suspension Penalty)',
      trackTitle: 'Afro Beats Supreme Vibe',
      trackingId: 'SSP-TRK-882910',
      userIp: '198.51.100.99',
      details: 'Automatic Admin Suspension: 8 duplicate download attempts detected from IP 198.51.100.99.',
      timestamp: '2026-07-30 14:02:00'
    }
  ]);

  // AI Quality Analyzer State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<{
    score: number;
    clarity: string;
    dynamicRange: string;
    bitrate: string;
    balanceNote: string;
    recommendation: string;
  } | null>(null);

  // Trimmer Tool State
  const [trimStartSec, setTrimStartSec] = useState<number>(0);
  const [trimEndSec, setTrimEndSec] = useState<number>(30);

  // Sync Sounds from Firestore / Local Fallback
  useEffect(() => {
    const q = query(collection(db, 'super_sounds_promote'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSounds(DEFAULT_SOUNDS);
      } else {
        const list: PromotedSound[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const totalDl = d.downloads || 0;
          list.push({
            id: docSnap.id,
            trackingId: d.trackingId || `SSP-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
            title: d.title || 'Untitled Audio Track',
            artist: d.artist || 'Unknown Artist',
            userId: d.userId || 'guest',
            userEmail: d.userEmail || '',
            category: d.category || 'Afrobeats',
            playlistId: d.playlistId || 'pl-afro-energy',
            moodTheme: d.moodTheme || 'High Energy',
            audioUrl: d.audioUrl || 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
            coverImage: d.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
            durationSeconds: d.durationSeconds || 180,
            promotionType: d.promotionType || 'free',
            promotionPlanDays: d.promotionPlanDays || 31,
            isRoyaltyFree: d.isRoyaltyFree !== undefined ? d.isRoyaltyFree : true,
            licenseType: d.licenseType || 'royalty_free',
            commercialTerms: d.commercialTerms || '100% Royalty Free for Commercial Use',
            listens: d.listens || 0,
            downloads: totalDl,
            successfulDownloads: d.successfulDownloads !== undefined ? d.successfulDownloads : Math.floor(totalDl * 0.98),
            failedDownloads: d.failedDownloads !== undefined ? d.failedDownloads : Math.floor(totalDl * 0.02),
            usagesCount: d.usagesCount !== undefined ? d.usagesCount : Math.floor(totalDl * 0.7),
            likes: d.likes || 0,
            dislikes: d.dislikes || 0,
            ratingsCount: d.ratingsCount || 0,
            ratingsSum: d.ratingsSum || 0,
            weeklyRatingsCount: d.weeklyRatingsCount || 0,
            weeklyRatingBonusClaimed: !!d.weeklyRatingBonusClaimed,
            aiQualityScore: d.aiQualityScore || 95,
            aiMasteringNote: d.aiMasteringNote || 'Studio grade frequency response.',
            uploadedAt: d.uploadedAt || new Date().toLocaleString(),
            earningExpiresAt: d.earningExpiresAt || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            totalRenewalSpent: d.totalRenewalSpent || 0,
            downloadsWhileExpired: d.downloadsWhileExpired || 0,
            usagesWhileExpired: d.usagesWhileExpired || 0,
            renewalHistory: d.renewalHistory || []
          });
        });
        setSounds(list);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Super Sounds Promote Firestore sync notice:", err);
      setSounds(DEFAULT_SOUNDS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Play/Pause Audio
  const handlePlayPause = (sound: PromotedSound) => {
    if (currentlyPlayingId === sound.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlayingId(sound.id);
      setIsPlaying(true);

      // Increment Listens count
      updateSoundEngagement(sound.id, { listens: sound.listens + 1 });
    }
  };

  // Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Update engagement metrics in state and firestore
  const updateSoundEngagement = async (soundId: string, updates: Partial<PromotedSound>) => {
    setSounds(prev => prev.map(s => s.id === soundId ? { ...s, ...updates } : s));

    try {
      if (!soundId.startsWith('ssp-')) {
        const soundRef = doc(db, 'super_sounds_promote', soundId);
        await updateDoc(soundRef, updates);
      }
    } catch (e) {
      // Local fallback handled
    }
  };

  // Handle Like/Dislike
  const handleLike = (sound: PromotedSound) => {
    const isLiked = userLikes[sound.id];
    if (isLiked) {
      setUserLikes(prev => ({ ...prev, [sound.id]: false }));
      updateSoundEngagement(sound.id, { likes: Math.max(0, sound.likes - 1) });
    } else {
      setUserLikes(prev => ({ ...prev, [sound.id]: true }));
      // Remove dislike if present
      if (userDislikes[sound.id]) {
        setUserDislikes(prev => ({ ...prev, [sound.id]: false }));
        updateSoundEngagement(sound.id, { 
          likes: sound.likes + 1, 
          dislikes: Math.max(0, sound.dislikes - 1) 
        });
      } else {
        updateSoundEngagement(sound.id, { likes: sound.likes + 1 });
      }
      toast.success("Sound liked!");
    }
  };

  const handleDislike = (sound: PromotedSound) => {
    const isDisliked = userDislikes[sound.id];
    if (isDisliked) {
      setUserDislikes(prev => ({ ...prev, [sound.id]: false }));
      updateSoundEngagement(sound.id, { dislikes: Math.max(0, sound.dislikes - 1) });
    } else {
      setUserDislikes(prev => ({ ...prev, [sound.id]: true }));
      if (userLikes[sound.id]) {
        setUserLikes(prev => ({ ...prev, [sound.id]: false }));
        updateSoundEngagement(sound.id, { 
          dislikes: sound.dislikes + 1, 
          likes: Math.max(0, sound.likes - 1) 
        });
      } else {
        updateSoundEngagement(sound.id, { dislikes: sound.dislikes + 1 });
      }
      toast.info("Feedback recorded.");
    }
  };

  // Handle Rating (1 to 5 Stars)
  const handleRateSound = (sound: PromotedSound, rating: number) => {
    const prevRating = userRatings[sound.id] || 0;
    setUserRatings(prev => ({ ...prev, [sound.id]: rating }));

    let newSum = sound.ratingsSum;
    let newCount = sound.ratingsCount;
    let newWeekly = sound.weeklyRatingsCount;

    if (prevRating === 0) {
      newSum += rating;
      newCount += 1;
      newWeekly += 1;
    } else {
      newSum = newSum - prevRating + rating;
    }

    updateSoundEngagement(sound.id, {
      ratingsSum: newSum,
      ratingsCount: newCount,
      weeklyRatingsCount: newWeekly
    });

    toast.success(`You rated this sound ${rating} Star${rating > 1 ? 's' : ''}!`);
  };

  // Handle Download (with IP anti-fraud enforcement, ID tracking & Rule 2 Admin penalty suspension)
  const handleDownloadSound = (sound: PromotedSound) => {
    const activeIp = currentClientIp;
    const existingTracker = ipTracker[activeIp] || {
      ip: activeIp,
      downloadCount: 0,
      duplicateAttempts: 0,
      lastDownloadedAt: new Date().toLocaleString(),
      isSuspended: false
    };

    // RULE 2 CHECK: Admin IP Suspension Penalty Enforcement
    if (existingTracker.isSuspended) {
      const newFailed = (sound.failedDownloads || 0) + 1;
      updateSoundEngagement(sound.id, { failedDownloads: newFailed });

      toast.error(
        `⛔ DOWNLOAD DENIED (Rule 2 Admin Penalty): IP address ${activeIp} is SUSPENDED by Admin! Reason: ${existingTracker.suspensionReason || 'Multiple download fraud penalty'}`,
        { duration: 8000 }
      );
      return;
    }

    const existingIps = downloadedIps[sound.id] || [];
    const isDuplicateForTrack = existingIps.includes(activeIp);

    const newDupCount = existingTracker.duplicateAttempts + (isDuplicateForTrack ? 1 : 0);
    const newDlCount = existingTracker.downloadCount + 1;

    // RULE 2 ENFORCEMENT: Trigger Automatic Admin Suspension Penalty if duplicate attempts exceed threshold (>= 3)
    let shouldSuspend = existingTracker.isSuspended;
    let reason = existingTracker.suspensionReason;

    if (newDupCount >= 3) {
      shouldSuspend = true;
      reason = `Admin Penalty: Multiple (${newDupCount}) duplicate download stream attempts detected from IP ${activeIp}.`;

      setSecurityViolationsLog(prev => [{
        id: `sec-v-${Date.now()}`,
        rule: 'Rule 2 (IP Admin Suspension Penalty)',
        trackTitle: sound.title,
        trackingId: sound.trackingId,
        userIp: activeIp,
        details: reason || '',
        timestamp: new Date().toLocaleString()
      }, ...prev]);
    }

    setIpTracker(prev => ({
      ...prev,
      [activeIp]: {
        ip: activeIp,
        downloadCount: newDlCount,
        duplicateAttempts: newDupCount,
        lastDownloadedAt: new Date().toLocaleString(),
        isSuspended: shouldSuspend,
        suspensionReason: reason,
        suspendedAt: shouldSuspend ? new Date().toLocaleString() : undefined
      }
    }));

    if (shouldSuspend) {
      const newFailed = (sound.failedDownloads || 0) + 1;
      updateSoundEngagement(sound.id, { failedDownloads: newFailed });

      toast.error(
        `🚨 ADMIN PENALTY ENFORCED (Rule 2): IP ${activeIp} has been SUSPENDED by Admin due to multiple duplicate downloads! Further downloads are strictly blocked.`,
        { duration: 8000 }
      );
      return;
    }

    if (isDuplicateForTrack) {
      const newFailed = (sound.failedDownloads || 0) + 1;
      updateSoundEngagement(sound.id, { 
        downloads: sound.downloads + 1,
        failedDownloads: newFailed
      });
      toast.warning("Duplicate download detected from this IP address! Anti-fraud stream blocked and logged.", {
        duration: 5000
      });
    } else {
      setDownloadedIps(prev => ({
        ...prev,
        [sound.id]: [...existingIps, activeIp]
      }));

      const newSuccess = (sound.successfulDownloads || 0) + 1;
      const isExpired = sound.earningExpiresAt ? new Date().getTime() > new Date(sound.earningExpiresAt).getTime() : false;

      if (isExpired) {
        const newExpiredDls = (sound.downloadsWhileExpired || 0) + 1;
        updateSoundEngagement(sound.id, { 
          downloads: sound.downloads + 1,
          successfulDownloads: newSuccess,
          downloadsWhileExpired: newExpiredDls
        });
        toast.info(
          `⚠️ Download logged! Note: Earnings for "${sound.title}" are PAUSED because its 1-year monetization period expired. The track owner must renew billing ($10-$45) to resume earning.`,
          { duration: 6000 }
        );
      } else {
        updateSoundEngagement(sound.id, { 
          downloads: sound.downloads + 1,
          successfulDownloads: newSuccess
        });

        // Credit creator $0.005 per download ($2.50 per 500 downloads)
        receivePayment(0.005, `Super Sounds Creator Reward (Download): ${sound.title}`);
      }

      // RULE 1 ID TRACKING: Register downloaded sound in Anti-Reupload Database
      const newRecord: DownloadedSoundRecord = {
        id: `dl-rec-${Date.now()}`,
        soundId: sound.id,
        trackingId: sound.trackingId,
        title: sound.title,
        artist: sound.artist,
        audioUrl: sound.audioUrl,
        downloadedByUserId: user?.uid || 'guest_listener',
        userIp: activeIp,
        downloadedAt: new Date().toLocaleString()
      };

      setDownloadedSoundRecords(prev => [newRecord, ...prev]);

      toast.success(`Download started! Sound ID ${sound.trackingId} registered in Anti-Reupload Registry.`);
    }

    // Trigger file download
    const link = document.createElement('a');
    link.href = sound.audioUrl;
    link.download = `${sound.title.replace(/\s+/g, '_')}_[${sound.trackingId}].mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Export/Attach Sound to Studio or Ads
  const handleUseSoundInStudio = (sound: PromotedSound) => {
    const newUsages = (sound.usagesCount || 0) + 1;
    const isExpired = sound.earningExpiresAt ? new Date().getTime() > new Date(sound.earningExpiresAt).getTime() : false;

    if (isExpired) {
      const newExpiredUses = (sound.usagesWhileExpired || 0) + 1;
      updateSoundEngagement(sound.id, { 
        usagesCount: newUsages,
        usagesWhileExpired: newExpiredUses
      });
      toast.info(`🎬 Sound "${sound.title}" attached! Note: Earnings are PAUSED due to 1-Year expiration ($10-$45 renewal required).`);
    } else {
      updateSoundEngagement(sound.id, { usagesCount: newUsages });
      receivePayment(0.005, `Super Sounds Creator Reward (Usage): ${sound.title}`);
      toast.success(`🎬 Sound "${sound.title}" attached! Total Usages: ${newUsages}`);
    }
    setShowUseSoundModal(false);
  };

  // Handle Monetization & Billing Renewal
  const handleRenewSoundMonetization = async (sound: PromotedSound, years: number, cost: number) => {
    if (balance < cost) {
      toast.error(`Insufficient balance ($${balance.toFixed(2)})! You need $${cost} to renew monetization for ${years} year(s).`);
      return;
    }

    try {
      const ok = await sendPayment(cost, `Super Sounds ${years}-Year Monetization & Billing Renewal: ${sound.title}`);
      if (!ok) {
        toast.error("Payment failed. Please check your wallet balance.");
        return;
      }

      // Calculate new expiration date
      const currentExpTime = sound.earningExpiresAt && new Date(sound.earningExpiresAt).getTime() > Date.now()
        ? new Date(sound.earningExpiresAt).getTime()
        : Date.now();
      
      const addedMs = years * 365 * 24 * 3600 * 1000;
      const newExpiresAt = new Date(currentExpTime + addedMs).toISOString();

      const newHistoryItem = {
        id: `ren-snd-${Date.now()}`,
        renewedAt: new Date().toISOString(),
        yearsAdded: years,
        cost,
        newExpiresAt
      };

      const updatedFields = {
        earningExpiresAt: newExpiresAt,
        totalRenewalSpent: (sound.totalRenewalSpent || 0) + cost,
        renewalHistory: [...(sound.renewalHistory || []), newHistoryItem]
      };

      setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, ...updatedFields } : s));

      if (!sound.id.startsWith('ssp-')) {
        const soundRef = doc(db, 'super_sounds_promote', sound.id);
        await updateDoc(soundRef, updatedFields);
      }

      toast.success(`🎉 Successfully renewed monetization for "${sound.title}" for ${years} year(s) ($${cost})! Expiration extended to ${new Date(newExpiresAt).toLocaleDateString()}.`);
    } catch (err: any) {
      toast.error(`Renewal failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle AI Quality Analysis
  const handleRunAiAnalysis = (sound: PromotedSound) => {
    setSelectedSound(sound);
    setShowAiModal(true);
    setIsAnalyzingAi(true);

    setTimeout(() => {
      setAiReport({
        score: sound.aiQualityScore || 96,
        clarity: 'High-Fidelity Spatial Audio (48kHz / 320kbps)',
        dynamicRange: '-13.8 LUFS (Optimized for Broadcast & Streaming)',
        bitrate: '320 kbps Pristine Studio Master',
        balanceNote: 'Vocal frequencies sit cleanly at 2kHz - 4kHz range; bass punch calibrated at 60Hz.',
        recommendation: 'Track is fully studio-mastered and ready for radio, commercial ads, and global stream promotion!'
      });
      setIsAnalyzingAi(false);
    }, 1500);
  };

  // Handle Submit New Sound Promotion Upload
  const handleCreateSoundPromotion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadTitle.trim() || !uploadArtist.trim()) {
      toast.error("Please provide both sound title and artist name.");
      return;
    }

    // RULE 1 ENFORCEMENT: Downloaded sounds or songs cannot be uploaded back to the App
    const normalizedUploadTitle = uploadTitle.trim().toLowerCase();
    const normalizedUploadAudioUrl = uploadAudioUrl.trim().toLowerCase();

    const downloadedMatch = downloadedSoundRecords.find(d => 
      d.title.trim().toLowerCase() === normalizedUploadTitle ||
      (normalizedUploadAudioUrl !== '' && d.audioUrl.trim().toLowerCase() === normalizedUploadAudioUrl) ||
      d.trackingId.trim().toLowerCase() === normalizedUploadTitle
    );

    if (downloadedMatch) {
      const violationDetail = `Rule 1 Violation: User attempted to re-upload previously downloaded sound "${uploadTitle}" (Downloaded Track ID: ${downloadedMatch.trackingId}).`;

      setSecurityViolationsLog(prev => [{
        id: `sec-v-${Date.now()}`,
        rule: 'Rule 1 (Re-Upload Blocked)',
        trackTitle: uploadTitle,
        trackingId: downloadedMatch.trackingId,
        userIp: currentClientIp,
        details: violationDetail,
        timestamp: new Date().toLocaleString()
      }, ...prev]);

      toast.error(
        `⛔ RE-UPLOAD DENIED (Rule 1): Sound "${uploadTitle}" (Tracking ID: ${downloadedMatch.trackingId}) was previously downloaded from Super Sounds. Downloaded tracks CANNOT be uploaded back to the App!`,
        { duration: 9000 }
      );
      return;
    }

    // RULE 3 ENFORCEMENT: The same song with the same ID/title cannot be promoted twice on the app from another user after being downloaded/created
    const existingPromotedMatch = sounds.find(s => 
      (s.title.trim().toLowerCase() === normalizedUploadTitle ||
       (normalizedUploadAudioUrl !== '' && s.audioUrl.trim().toLowerCase() === normalizedUploadAudioUrl)) &&
      s.userId !== (user?.uid || 'guest_user')
    );

    if (existingPromotedMatch) {
      const violationDetail = `Rule 3 Violation: User attempted to promote song "${uploadTitle}" which is already promoted by another user (${existingPromotedMatch.artist}) with Tracking ID ${existingPromotedMatch.trackingId}.`;

      setSecurityViolationsLog(prev => [{
        id: `sec-v-${Date.now()}`,
        rule: 'Rule 3 (Duplicate Promotion Blocked)',
        trackTitle: uploadTitle,
        trackingId: existingPromotedMatch.trackingId,
        userIp: currentClientIp,
        details: violationDetail,
        timestamp: new Date().toLocaleString()
      }, ...prev]);

      toast.error(
        `⛔ DUPLICATE PROMOTION DENIED (Rule 3): Song "${uploadTitle}" (Tracking ID: ${existingPromotedMatch.trackingId}) is already promoted on the App by another user (${existingPromotedMatch.artist}). The same song cannot be promoted twice by another user!`,
        { duration: 9000 }
      );
      return;
    }

    if (uploadPromoType === 'free' && uploadDurationSec > 60) {
      toast.error("Free promotion is strictly limited to 1 minute (60 seconds) max duration! Please upgrade to a paid promotion plan for full tracks up to 1 hour.");
      return;
    }

    // Paid Plan Billing Check
    if (uploadPromoType === 'paid') {
      const selectedPlan = PROMOTION_PLANS.find(p => p.days === selectedPlanDays);
      const planCost = selectedPlan ? selectedPlan.price : 5;

      if (balance < planCost) {
        toast.error(`Insufficient Central Wallet balance ($${balance.toFixed(2)}). Promotion cost is $${planCost.toFixed(2)}.`);
        return;
      }

      // Deduct promotion cost from Central Wallet
      await withdraw(planCost, 'Promotions', 'Super Sounds Promotion Billing');
    }

    const newTrackingId = `SSP-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const selectedPl = CURATED_PLAYLISTS.find(p => p.id === uploadPlaylistId);

    const newSound: PromotedSound = {
      id: `ssp-${Date.now()}`,
      trackingId: newTrackingId,
      title: uploadTitle.trim(),
      artist: uploadArtist.trim(),
      userId: user?.uid || 'guest_user',
      userEmail: user?.email || '',
      category: uploadCategory,
      playlistId: uploadPlaylistId,
      moodTheme: selectedPl ? selectedPl.moodTheme : uploadMoodTheme,
      audioUrl: uploadAudioUrl.trim() || 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      coverImage: uploadCoverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      durationSeconds: uploadDurationSec,
      promotionType: uploadPromoType,
      promotionPlanDays: uploadPromoType === 'paid' ? selectedPlanDays : undefined,
      isRoyaltyFree: uploadIsRoyaltyFree,
      licenseType: uploadLicenseType,
      commercialTerms: uploadCommercialTerms.trim() || '100% Royalty Free for Commercial Use',
      listens: 0,
      downloads: 0,
      successfulDownloads: 0,
      failedDownloads: 0,
      usagesCount: 0,
      likes: 0,
      dislikes: 0,
      ratingsCount: 0,
      ratingsSum: 0,
      weeklyRatingsCount: 0,
      weeklyRatingBonusClaimed: false,
      aiQualityScore: Math.floor(90 + Math.random() * 10),
      aiMasteringNote: 'AI Analyzer verified studio balance.',
      uploadedAt: new Date().toLocaleString(),
      earningExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      totalRenewalSpent: 0,
      downloadsWhileExpired: 0,
      usagesWhileExpired: 0,
      renewalHistory: []
    };

    try {
      await addDoc(collection(db, 'super_sounds_promote'), newSound);
      toast.success(`🎵 Super Sounds Promotion live! Assigned Tracking ID: ${newTrackingId}`);
    } catch (e) {
      setSounds(prev => [newSound, ...prev]);
      toast.success(`🎵 Sound promoted locally! Assigned Tracking ID: ${newTrackingId}`);
    }

    setShowUploadModal(false);
    setUploadTitle('');
    setUploadArtist('');
    setUploadAudioUrl('');
    setUploadCoverUrl('');
  };

  // Calculate User Total Earnings Across Promoted Sounds
  const userPromotedSounds = sounds.filter(s => s.userId === (user?.uid || 'guest_user') || s.userId === 'user_starboy');
  
  const calculateSoundEarnings = (sound: PromotedSound) => {
    const downloadsEarnings = (sound.downloads / 350) * 2.00; // 350 downloads/uses = $2
    const likesEarnings = (sound.likes / 1000) * 1.00; // 1000 likes = $1
    const listensEarnings = (sound.listens / 1000) * 1.00; // 1000 listens = $1
    const ratingsEarnings = (sound.ratingsCount / 1000) * 1.00; // 1000 ratings = $1
    const weeklyBonus = (sound.weeklyRatingsCount >= 20000 && !sound.weeklyRatingBonusClaimed) ? 5.00 : 0;

    return downloadsEarnings + likesEarnings + listensEarnings + ratingsEarnings + weeklyBonus;
  };

  const totalCalculatedEarnings = userPromotedSounds.reduce((acc, s) => acc + calculateSoundEarnings(s), 0);

  // Cash Out to Central Wallet Handler
  const handleCashoutToCentralWallet = async () => {
    // Check Rules:
    // Rule 1: Must be on billing subscription
    const hasPaidPromotion = userPromotedSounds.some(s => s.promotionType === 'paid');

    if (!hasPaidPromotion && !hasActiveBillingSub) {
      toast.error("🔒 Rule Violation: Users promoting on free 1-minute plans cannot transfer earnings to the Central Wallet unless subscribed to a Billing Promotion Plan ($5 - $45).");
      return;
    }

    // Rule 2: Minimum $50 cash out
    if (totalCalculatedEarnings < 50) {
      toast.error(`🔒 Rule Violation: Minimum Cash Out threshold is $50.00. Your current accrued earnings: $${totalCalculatedEarnings.toFixed(2)}.`);
      return;
    }

    // Transfer Earnings
    await receivePayment(totalCalculatedEarnings, 'Super Sounds Promote Earnings Payout to Central Wallet', 'Promotions');

    toast.success(`💰 Success! Transferred $${totalCalculatedEarnings.toFixed(2)} Super Sounds Promote earnings directly into your Central Wallet!`);
    setShowCashoutModal(false);
  };

  // Filtered sounds list
  const filteredSounds = sounds.filter(s => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesPlaylist = selectedPlaylistId === 'all' || s.playlistId === selectedPlaylistId;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.moodTheme && s.moodTheme.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRoyaltyFree = !royaltyFreeOnly || (s.isRoyaltyFree ?? true);

    return matchesCategory && matchesPlaylist && matchesSearch && matchesRoyaltyFree;
  });

  // Analytics Metrics & Dataset Calculations for Quality Sounds Tracking Analysis
  const totalSoundCount = sounds.length;
  const avgAiQualityScore = totalSoundCount > 0 
    ? (sounds.reduce((acc, s) => acc + (s.aiQualityScore || 90), 0) / totalSoundCount).toFixed(1)
    : '95.0';

  const studioMastersCount = sounds.filter(s => (s.aiQualityScore || 0) >= 90).length;
  const studioMastersPercentage = totalSoundCount > 0 ? Math.round((studioMastersCount / totalSoundCount) * 100) : 100;

  const totalCatalogListens = sounds.reduce((acc, s) => acc + s.listens, 0);
  const totalCatalogDownloads = sounds.reduce((acc, s) => acc + s.downloads, 0);
  const totalSuccessfulDownloads = sounds.reduce((acc, s) => acc + (s.successfulDownloads !== undefined ? s.successfulDownloads : Math.floor(s.downloads * 0.98)), 0);
  const totalFailedDownloads = sounds.reduce((acc, s) => acc + (s.failedDownloads !== undefined ? s.failedDownloads : Math.floor(s.downloads * 0.02)), 0);
  const totalUsagesCount = sounds.reduce((acc, s) => acc + (s.usagesCount !== undefined ? s.usagesCount : Math.floor(s.downloads * 0.7)), 0);

  const royaltyFreeCount = sounds.filter(s => s.isRoyaltyFree ?? true).length;
  const royaltyFreePercentage = totalSoundCount > 0 ? Math.round((royaltyFreeCount / totalSoundCount) * 100) : 100;

  // Curated Playlist Engagement Dataset for Charting
  const playlistAnalyticsData = CURATED_PLAYLISTS.map(pl => {
    const plSounds = sounds.filter(s => s.playlistId === pl.id);
    const count = plSounds.length;
    const listens = plSounds.reduce((a, s) => a + s.listens, 0);
    const downloads = plSounds.reduce((a, s) => a + s.downloads, 0);
    const usages = plSounds.reduce((a, s) => a + (s.usagesCount || 0), 0);
    return {
      name: pl.moodTheme,
      title: pl.title,
      tracks: count,
      listens,
      downloads,
      usages
    };
  });

  // Analytics Chart 1: Quality Score vs Stream Conversion
  const analyticsQualityVSListensData = sounds
    .filter(s => (s.aiQualityScore || 0) >= minQualityScore)
    .sort((a, b) => {
      if (analyticsSortBy === 'score') return (b.aiQualityScore || 0) - (a.aiQualityScore || 0);
      if (analyticsSortBy === 'listens') return b.listens - a.listens;
      if (analyticsSortBy === 'downloads') return b.downloads - a.downloads;
      const rA = a.ratingsCount > 0 ? a.ratingsSum / a.ratingsCount : 5;
      const rB = b.ratingsCount > 0 ? b.ratingsSum / b.ratingsCount : 5;
      return rB - rA;
    })
    .map(s => ({
      name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
      fullTitle: s.title,
      artist: s.artist,
      trackingId: s.trackingId,
      aiScore: s.aiQualityScore || 92,
      listens: s.listens,
      downloads: s.downloads,
      successfulDownloads: s.successfulDownloads !== undefined ? s.successfulDownloads : Math.floor(s.downloads * 0.98),
      failedDownloads: s.failedDownloads !== undefined ? s.failedDownloads : Math.floor(s.downloads * 0.02),
      usagesCount: s.usagesCount !== undefined ? s.usagesCount : Math.floor(s.downloads * 0.7),
      rating: s.ratingsCount > 0 ? Number((s.ratingsSum / s.ratingsCount).toFixed(1)) : 5.0
    }));

  // Analytics Chart 2: Category Audio Quality Breakdown
  const categoryQualityData = CATEGORIES.filter(c => c !== 'All').map(cat => {
    const catSounds = sounds.filter(s => s.category === cat);
    const count = catSounds.length;
    const avgScore = count > 0 ? Math.round(catSounds.reduce((a, s) => a + (s.aiQualityScore || 90), 0) / count) : 88;
    const listens = catSounds.reduce((a, s) => a + s.listens, 0);
    return {
      category: cat,
      avgScore,
      tracks: count,
      listens
    };
  }).filter(c => c.tracks > 0);

  // Analytics Chart 3: Mastering Tier Distribution
  const qualityTierData = [
    { name: 'Ultra Gold (95-100)', value: sounds.filter(s => (s.aiQualityScore || 0) >= 95).length || 2, color: '#eab308' },
    { name: 'Studio Grade (90-94)', value: sounds.filter(s => (s.aiQualityScore || 0) >= 90 && (s.aiQualityScore || 0) < 95).length || 1, color: '#a855f7' },
    { name: 'Standard High (80-89)', value: sounds.filter(s => (s.aiQualityScore || 0) >= 80 && (s.aiQualityScore || 0) < 90).length, color: '#10b981' },
    { name: 'Basic Master (<80)', value: sounds.filter(s => (s.aiQualityScore || 0) < 80).length, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        src={sounds.find(s => s.id === currentlyPlayingId)?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-black to-slate-900 border border-purple-500/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Music className="w-72 h-72 text-purple-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Supreme Release Hub</span>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Super Sounds Promote</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-500 text-black font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center gap-2 text-sm"
              >
                <Upload className="w-5 h-5" />
                Promote Audio / Album
              </button>

              <button
                onClick={() => setShowCashoutModal(true)}
                className="px-6 py-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold rounded-2xl hover:bg-emerald-500/30 transition-all flex items-center gap-2 text-sm"
              >
                <Wallet className="w-5 h-5" />
                Earnings ($${totalCalculatedEarnings.toFixed(2)})
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            The official Supreme hub for newly released songs, albums, and audio tracks. Listen, rate, download, and utilize sounds across Video Creator Studio, Clips, and Ads. Earn cash rewards through downloads, listens, likes, and ratings!
          </p>
        </div>
      </div>

      {/* Rules Notice Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 p-6 rounded-3xl flex items-start gap-4 shadow-lg">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-amber-200">
          <p className="font-extrabold text-white flex items-center gap-2">
            <span>Super Sounds Security & Copyright Rules Enforced:</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase font-extrabold">Live System Protection</span>
          </p>
          <ul className="text-xs text-amber-300/90 list-disc list-inside space-y-1 leading-relaxed">
            <li><strong>Rule 1 (Anti-Reupload Guard):</strong> Downloaded sounds or songs CANNOT be uploaded back to the App. Tracking IDs log all downloads and automatically block re-upload attempts.</li>
            <li><strong>Rule 2 (Admin IP Penalty Suspension):</strong> Multiple duplicate downloads from the same IP address trigger an Admin Penalty Suspension, blocking further downloads from that IP.</li>
            <li><strong>Rule 3 (Single-Owner Promotion Lock):</strong> The same song with the same ID or title CANNOT be promoted twice on the app by another user after being downloaded/created.</li>
            <li><strong>Earnings & Central Wallet Payouts:</strong> 350 downloads/uses = $2.00 | 1,000 likes = $1.00 | 1,000 listens = $1.00. Minimum $50 required to transfer earnings.</li>
          </ul>
        </div>
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-black/60 border border-white/10 p-2.5 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            Sounds Marketplace Catalog ({filteredSounds.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-xl scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Quality Tracking Analytics Hub
          </button>

          <button
            onClick={() => setActiveTab('renewals')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'renewals'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Earning Renewal & Analysis
            {sounds.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length > 0 && (
              <span className="bg-amber-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black">
                {sounds.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length} Expired
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-purple-600 text-white shadow-xl scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            Security & Admin IP Rules ({Object.values(ipTracker).filter(i => i.isSuspended).length} Suspended IPs)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-300 font-extrabold px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Anti-Reupload & IP Security Active</span>
        </div>
      </div>

      {/* Quality Sounds Tracking Analytics Area */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Analytical KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-950/60 to-black border border-purple-500/30 p-5 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-purple-400">Avg AI Quality Score</span>
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{avgAiQualityScore}</span>
                <span className="text-xs text-purple-300 font-bold">/ 100</span>
              </div>
              <p className="text-[11px] text-gray-400">Studio Grade Mastering Standard</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-black border border-emerald-500/30 p-5 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-400">Studio Certified Masters</span>
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{studioMastersCount}</span>
                <span className="text-xs text-emerald-300 font-bold">({studioMastersPercentage}%)</span>
              </div>
              <p className="text-[11px] text-gray-400">Tracks with &ge;90 AI Score</p>
            </div>

            <div className="bg-gradient-to-br from-amber-950/60 to-black border border-amber-500/30 p-5 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-amber-400">Total Stream Volume</span>
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{totalCatalogListens.toLocaleString()}</span>
                <span className="text-xs text-amber-300 font-bold">Listens</span>
              </div>
              <p className="text-[11px] text-gray-400">Verified IP Anti-Fraud Streams</p>
            </div>

            <div className="bg-gradient-to-br from-blue-950/60 to-black border border-blue-500/30 p-5 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-blue-400">Royalty-Free Catalog</span>
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{royaltyFreePercentage}%</span>
                <span className="text-xs text-blue-300 font-bold">({royaltyFreeCount} Tracks)</span>
              </div>
              <p className="text-[11px] text-gray-400">Cleared for Commercial Ads & Shorts</p>
            </div>
          </div>

          {/* Analytics Control & Filtering Bar */}
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold text-gray-300 uppercase">Quality Score Threshold:</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMinQualityScore(0)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    minQualityScore === 0
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  All Tracks
                </button>
                <button
                  onClick={() => setMinQualityScore(90)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    minQualityScore === 90
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  &ge; 90 Studio Master
                </button>
                <button
                  onClick={() => setMinQualityScore(95)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    minQualityScore === 95
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  &ge; 95 Ultra Gold
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-gray-300 uppercase">Sort Analytics By:</span>
              <select
                value={analyticsSortBy}
                onChange={(e) => setAnalyticsSortBy(e.target.value as any)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="score" className="bg-gray-900">⚡ Highest AI Quality Score</option>
                <option value="listens" className="bg-gray-900">🎧 Most Streamed / Listened</option>
                <option value="downloads" className="bg-gray-900">📥 Most Downloaded</option>
                <option value="rating" className="bg-gray-900">⭐ Top Rating Average</option>
              </select>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: AI Quality Score vs Stream Conversions */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">AI Quality Score vs. Stream Conversion</h3>
                    <p className="text-xs text-gray-400">Demonstrates how higher studio mastering quality drives higher listener retention</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Real-time Metrics
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsQualityVSListensData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        name === 'aiScore' ? `${val} / 100` : val.toLocaleString(),
                        name === 'aiScore' ? 'AI Quality Score' : name === 'listens' ? 'Listens' : 'Downloads'
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="aiScore" name="AI Quality Score" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="listens" name="Listens" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Mastering Tier Distribution */}
            <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
              <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Audio Mastering Tier Ratio</h3>
                    <p className="text-xs text-gray-400">Distribution across mastering tiers</p>
                  </div>
                </div>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityTierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {qualityTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-[11px] text-gray-300 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Target Dynamic Headroom:</span>
                  <span className="text-emerald-400">-14.0 LUFS</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitrate Quality Index:</span>
                  <span className="text-amber-300">320 kbps Studio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Sound Quality Tracking Leaderboard Table */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  Quality Sounds Detailed Tracking & Spectral Health Table
                </h3>
                <p className="text-xs text-gray-400">Complete audit log of all promoted audio files, audio fingerprints, LUFS specs, and commercial terms</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Showing {analyticsQualityVSListensData.length} Tracked Audio Files</span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-black/60 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Sound Title & Artist</th>
                    <th className="py-3.5 px-3">Tracking ID</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">AI Quality Score</th>
                    <th className="py-3.5 px-3">Specs (LUFS / Bitrate)</th>
                    <th className="py-3.5 px-3">Engagement</th>
                    <th className="py-3.5 px-3">Commercial Terms</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {sounds
                    .filter(s => (s.aiQualityScore || 0) >= minQualityScore)
                    .map((sound) => {
                      const avgR = sound.ratingsCount > 0 ? (sound.ratingsSum / sound.ratingsCount).toFixed(1) : '5.0';
                      const score = sound.aiQualityScore || 92;

                      return (
                        <tr key={sound.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={sound.coverImage} alt={sound.title} className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" />
                              <div>
                                <p className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">{sound.title}</p>
                                <p className="text-[10px] text-gray-400">{sound.artist}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-purple-300">
                            {sound.trackingId}
                          </td>

                          <td className="py-3.5 px-3 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="bg-purple-950/60 border border-purple-800 text-purple-200 px-2 py-0.5 rounded-md font-extrabold uppercase block w-fit">
                                {sound.category}
                              </span>
                              <span className="text-[10px] text-amber-300 font-bold block truncate">
                                🎵 {sound.moodTheme || 'Curated Mood'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="space-y-1 w-28">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className={score >= 90 ? 'text-amber-400' : 'text-emerald-400'}>{score} / 100</span>
                                <span className="text-[9px] text-gray-400">{score >= 95 ? 'Ultra Gold' : score >= 90 ? 'Studio' : 'High'}</span>
                              </div>
                              <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                                <div 
                                  className={`h-full rounded-full ${
                                    score >= 95 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                    score >= 90 ? 'bg-gradient-to-r from-purple-500 to-indigo-400' :
                                    'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  }`} 
                                  style={{ width: `${score}%` }} 
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[10px] text-gray-300 space-y-0.5">
                            <div><strong className="text-emerald-400">-13.8 LUFS</strong></div>
                            <div className="text-gray-400">320kbps / 48kHz</div>
                          </td>

                          <td className="py-3.5 px-3 text-[11px] space-y-1 min-w-[160px]">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Listens:</span>
                              <strong className="text-white">{sound.listens.toLocaleString()}</strong>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-emerald-400 font-bold">Successful DL:</span>
                              <strong className="text-emerald-300">{sound.successfulDownloads ?? sound.downloads}</strong>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-rose-400 font-bold">Blocked DL (IP):</span>
                              <strong className="text-rose-300">{sound.failedDownloads ?? 0}</strong>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-amber-300 font-bold">Studio Usages:</span>
                              <strong className="text-amber-200">{sound.usagesCount ?? 0}</strong>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-purple-300 font-bold">Likes / Dislikes:</span>
                              <span className="text-gray-300">👍 {sound.likes} | 👎 {sound.dislikes}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-amber-400 font-bold">Ratings:</span>
                              <span className="text-amber-300 font-bold">⭐ {avgR} ({sound.ratingsCount})</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 w-fit ${
                              (sound.isRoyaltyFree ?? true)
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}>
                              <ShieldCheck className="w-3 h-3 shrink-0" />
                              {(sound.isRoyaltyFree ?? true) ? 'Royalty-Free' : 'Licensed'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handlePlayPause(sound)}
                                className="p-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-xl transition-all"
                                title="Play Track"
                              >
                                <Play className="w-3.5 h-3.5 fill-purple-300" />
                              </button>

                              <button
                                onClick={() => handleRunAiAnalysis(sound)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-[10px] hover:scale-105 transition-all flex items-center gap-1 shadow-md"
                              >
                                <Sparkles className="w-3 h-3" />
                                Deep Scan
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security & Admin IP Rules Panel */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-rose-950/80 via-black to-slate-900 border border-rose-500/30 p-6 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-rose-400 tracking-wider">Rule 1 Anti-Reupload</span>
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
              <strong className="text-3xl font-display font-extrabold text-white block">
                {downloadedSoundRecords.length} Tracks
              </strong>
              <p className="text-xs text-gray-400">
                Downloaded sounds registered in Anti-Reupload ID Registry. Re-upload attempts are automatically rejected.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-950/80 via-black to-slate-900 border border-red-500/30 p-6 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">Rule 2 IP Anti-Fraud</span>
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-center gap-2">
                <strong className="text-3xl font-display font-extrabold text-white">
                  {Object.keys(ipTracker).length} IPs
                </strong>
                <span className="text-xs px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-extrabold">
                  {Object.values(ipTracker).filter(i => i.isSuspended).length} Admin Suspended
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Multiple downloads from the same IP attract an Admin Suspension Penalty.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-950/80 via-black to-slate-900 border border-purple-500/30 p-6 rounded-3xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-purple-400 tracking-wider">Rule 3 Promotion Lock</span>
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <strong className="text-3xl font-display font-extrabold text-white block">
                {sounds.length} Locked Songs
              </strong>
              <p className="text-xs text-gray-400">
                Unique Tracking IDs lock promotion rights to single user accounts after creation or download.
              </p>
            </div>
          </div>

          {/* Interactive Client IP Simulation & Testing Bar */}
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Active Client IP Address Simulator & Enforcement Controls
                </h3>
                <p className="text-xs text-gray-400">Change your active IP session to test download penalties or trigger Admin suspensions</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={currentClientIp}
                  onChange={(e) => setCurrentClientIp(e.target.value)}
                  placeholder="e.g. 198.51.100.22"
                  className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400 w-36"
                />
                <button
                  onClick={() => toast.info(`Client IP updated to ${currentClientIp}`)}
                  className="px-3 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition-all"
                >
                  Set Active IP
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Active Session IP:</span>
                <span className="font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 font-extrabold">
                  {currentClientIp}
                </span>
                {ipTracker[currentClientIp]?.isSuspended ? (
                  <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    ADMIN SUSPENDED
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ACTIVE NORMAL
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (sounds.length > 0) {
                      handleDownloadSound(sounds[0]);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs hover:scale-105 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Test Download Sound with Active IP ({currentClientIp})
                </button>

                <button
                  onClick={() => {
                    const active = currentClientIp;
                    const prev = ipTracker[active] || { ip: active, downloadCount: 0, duplicateAttempts: 0, lastDownloadedAt: new Date().toLocaleString(), isSuspended: false };
                    const nextStatus = !prev.isSuspended;
                    setIpTracker(p => ({
                      ...p,
                      [active]: {
                        ...prev,
                        isSuspended: nextStatus,
                        suspensionReason: nextStatus ? 'Admin Manual Suspension Penalty: Flagged by Administrator for download abuse.' : undefined,
                        suspendedAt: nextStatus ? new Date().toLocaleString() : undefined
                      }
                    }));
                    if (nextStatus) {
                      toast.error(`⛔ Admin Penalty applied! IP ${active} is now SUSPENDED.`);
                    } else {
                      toast.success(`✅ Admin Penalty lifted! IP ${active} restored to Normal status.`);
                    }
                  }}
                  className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Toggle Admin Suspension on {currentClientIp}
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Rule 1 Downloaded Songs Anti-Reupload ID Registry */}
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Rule 1: Downloaded Sound Anti-Reupload ID Registry
                </h3>
                <p className="text-xs text-gray-400">
                  Tracks all downloaded sounds. Re-uploading any of these tracks back to the App is strictly blocked.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold">
                {downloadedSoundRecords.length} Logged Registrations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Track Title & Artist</th>
                    <th className="py-3 px-3">Tracking ID</th>
                    <th className="py-3 px-3">Downloaded By User</th>
                    <th className="py-3 px-3">User IP Address</th>
                    <th className="py-3 px-3">Download Time</th>
                    <th className="py-3 px-4 text-right">Re-Upload Guard Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {downloadedSoundRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <div>
                          <span>{rec.title}</span>
                          <span className="block text-[10px] text-gray-400 font-normal">{rec.artist}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-purple-300 font-bold">
                        {rec.trackingId}
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-mono text-[11px]">
                        {rec.downloadedByUserId}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300">
                        {rec.userIp}
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-[11px]">
                        {rec.downloadedAt}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-extrabold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          RE-UPLOAD BLOCKED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Rule 2 Admin IP Download Anti-Fraud & Penalty Monitoring */}
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Rule 2: IP Download Anti-Fraud & Admin Penalty Tracker
                </h3>
                <p className="text-xs text-gray-400">
                  Multiple duplicate downloads from the same IP address trigger an automatic or manual Admin Suspension Penalty.
                </p>
              </div>
              <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/30 font-bold">
                {Object.values(ipTracker).filter(i => i.isSuspended).length} Suspended IPs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-3">Downloads Count</th>
                    <th className="py-3 px-3">Duplicate Attempts</th>
                    <th className="py-3 px-3">Last Active</th>
                    <th className="py-3 px-3">Penalty Status</th>
                    <th className="py-3 px-4">Admin Suspension Reason</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {Object.values(ipTracker).map((ipRec) => (
                    <tr key={ipRec.ip} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {ipRec.ip}
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-bold">
                        {ipRec.downloadCount}
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-bold">
                        {ipRec.duplicateAttempts}
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-[11px]">
                        {ipRec.lastDownloadedAt}
                      </td>
                      <td className="py-3 px-3">
                        {ipRec.isSuspended ? (
                          <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            ADMIN SUSPENDED
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300 max-w-xs truncate">
                        {ipRec.suspensionReason || 'No suspension penalties accrued.'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const nextState = !ipRec.isSuspended;
                            setIpTracker(prev => ({
                              ...prev,
                              [ipRec.ip]: {
                                ...ipRec,
                                isSuspended: nextState,
                                suspensionReason: nextState ? 'Admin Penalty: Multiple fraudulent download streams from same IP.' : undefined,
                                suspendedAt: nextState ? new Date().toLocaleString() : undefined
                              }
                            }));
                            if (nextState) {
                              toast.error(`⛔ Admin Penalty enforced on IP ${ipRec.ip}`);
                            } else {
                              toast.success(`✅ Admin Penalty lifted for IP ${ipRec.ip}`);
                            }
                          }}
                          className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all border ${
                            ipRec.isSuspended
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {ipRec.isSuspended ? 'Lift Suspension' : 'Suspend IP'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Rule 3 Duplicate Song Promotion Lock & Security Violations Audit Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duplicate Promotion Protection */}
            <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-400" />
                  Rule 3: Duplicate Song Promotion Protection
                </h3>
                <p className="text-xs text-gray-400">
                  Prevents another user from promoting an already registered song ID or title.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {sounds.map((sound) => (
                  <div key={sound.id} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block font-extrabold">{sound.title}</strong>
                      <span className="text-[10px] text-purple-300 font-mono">
                        Tracking ID: {sound.trackingId} | Artist: {sound.artist}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-lg">
                      🔒 SINGLE OWNER
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log of Security Violations */}
            <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Security Violations & Penalty Audit Log
                </h3>
                <p className="text-xs text-gray-400">
                  Real-time system log of blocked re-uploads, IP penalties, and duplicate promotion denials.
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {securityViolationsLog.map((log) => (
                  <div key={log.id} className="p-3.5 bg-rose-950/30 border border-rose-500/20 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-rose-400">{log.rule}</span>
                      <span className="text-gray-400 text-[10px]">{log.timestamp}</span>
                    </div>
                    <p className="text-white font-extrabold">Track: {log.trackTitle} {log.trackingId && `(${log.trackingId})`}</p>
                    <p className="text-[11px] text-gray-300">{log.details}</p>
                    <div className="text-[10px] font-mono text-amber-400 pt-1">Client IP: {log.userIp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar & Catalog Grid */}
      {activeTab === 'catalog' && (
        <div className="space-y-8">
          {/* Curated Playlists & Mood Discovery Grid */}
          <div className="bg-gradient-to-r from-purple-950/60 via-black to-slate-900 border border-purple-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                  Curated Playlists & Mood Discovery
                </h2>
                <p className="text-xs text-gray-400">Discover sounds grouped by themes, moods, and commercial usage cases</p>
              </div>

              {selectedPlaylistId !== 'all' && (
                <button
                  onClick={() => setSelectedPlaylistId('all')}
                  className="px-3.5 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Show All Sounds ({sounds.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CURATED_PLAYLISTS.map((pl) => {
                const isSelected = selectedPlaylistId === pl.id;
                const trackCount = sounds.filter(s => s.playlistId === pl.id).length;
                const totalListens = sounds.filter(s => s.playlistId === pl.id).reduce((a, s) => a + s.listens, 0);

                return (
                  <button
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(isSelected ? 'all' : pl.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between space-y-3 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-900/90 via-black to-slate-900 border-amber-400 shadow-2xl scale-[1.02] ring-2 ring-amber-400/50'
                        : 'bg-black/50 border-white/10 hover:border-purple-500/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden aspect-video">
                        <img src={pl.coverImage} alt={pl.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30">
                          {pl.badge}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">{pl.moodTheme}</span>
                        <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {pl.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                          {pl.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-300 font-bold">{trackCount} Tracks</span>
                      <span className="text-amber-400 font-bold">{totalListens.toLocaleString()} listens</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sounds by title, artist, or tracking ID (e.g. SSP-TRK-882910)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            <button
              onClick={() => setRoyaltyFreeOnly(!royaltyFreeOnly)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                royaltyFreeOnly
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Royalty-Free Only
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? 'bg-[var(--color-supreme-gold)] text-black border-[var(--color-supreme-gold)] shadow-lg'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Audio Player Bar (Sticky when playing) */}
      {currentlyPlayingId && (
        <div className="bg-gradient-to-r from-purple-900 via-zinc-900 to-black border-2 border-purple-500/50 p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-50">
          {sounds.find(s => s.id === currentlyPlayingId) && (() => {
            const currentSound = sounds.find(s => s.id === currentlyPlayingId)!;
            return (
              <>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <img src={currentSound.coverImage} alt={currentSound.title} className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-lg shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">{currentSound.trackingId}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{currentSound.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{currentSound.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{currentSound.artist}</p>
                  </div>
                </div>

                {/* Progress Controls */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span>{Math.floor(audioProgress / 60)}:{Math.floor(audioProgress % 60).toString().padStart(2, '0')}</span>
                    <input
                      type="range"
                      min={0}
                      max={audioDuration || 100}
                      value={audioProgress}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (audioRef.current) audioRef.current.currentTime = val;
                        setAudioProgress(val);
                      }}
                      className="w-full accent-[var(--color-supreme-gold)] cursor-pointer h-1.5 bg-white/20 rounded-lg"
                    />
                    <span>{Math.floor(audioDuration / 60)}:{Math.floor(audioDuration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayPause(currentSound)}
                    className="p-3 bg-[var(--color-supreme-gold)] text-black rounded-2xl hover:scale-105 transition-all shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black" />}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSound(currentSound);
                      setShowTrimmerModal(true);
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
                    title="Trim / Cut Audio Tool"
                  >
                    <Scissors className="w-5 h-5" />
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Promoted Sounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSounds.map((sound) => {
          const isCurrentlyPlaying = currentlyPlayingId === sound.id && isPlaying;
          const avgRating = sound.ratingsCount > 0 ? (sound.ratingsSum / sound.ratingsCount).toFixed(1) : '5.0';
          const isExpired = sound.earningExpiresAt ? new Date().getTime() > new Date(sound.earningExpiresAt).getTime() : false;
          const daysRemaining = sound.earningExpiresAt ? Math.ceil((new Date(sound.earningExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 365;

          return (
            <div
              key={sound.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-[2rem] p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30 group relative flex flex-col justify-between"
            >
              {/* Badge & Tracking Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-black/60 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-xl">
                    ID: {sound.trackingId}
                  </span>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl border ${
                    sound.promotionType === 'paid' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {sound.promotionType === 'paid' ? `${sound.promotionPlanDays || 90}d Promoted` : 'Free 1m Promo'}
                  </span>
                </div>

                {/* Monetization / Expiration Status Badge */}
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  {isExpired ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                      Earnings Paused (1-Yr Expired)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Monetized ({daysRemaining}d left)
                    </span>
                  )}

                  <button
                    onClick={() => setRenewalModalSound(sound)}
                    className="text-amber-300 hover:text-amber-100 font-extrabold flex items-center gap-1 underline transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Renew ($10-$45)
                  </button>
                </div>

                {/* Cover & Play Overlay */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/80 group-hover:scale-[1.02] transition-transform">
                  <img src={sound.coverImage} alt={sound.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <button
                    onClick={() => handlePlayPause(sound)}
                    className="absolute inset-0 m-auto w-14 h-14 bg-[var(--color-supreme-gold)] hover:bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110"
                  >
                    {isCurrentlyPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-mono">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {Math.floor(sound.durationSeconds / 60)}m {sound.durationSeconds % 60}s
                    </span>

                    <button
                      onClick={() => handleRunAiAnalysis(sound)}
                      className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 px-2 py-0.5 rounded-lg text-[10px] font-bold text-purple-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      AI Score: {sound.aiQualityScore || 95}
                    </button>
                  </div>
                </div>

                {/* Details & Licensing */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 shrink-0">{sound.category}</span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md truncate">
                        🎵 {sound.moodTheme || 'Curated Track'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{avgRating} ({sound.ratingsCount})</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{sound.title}</h3>
                  <p className="text-xs text-gray-400 truncate">By {sound.artist}</p>

                  {/* Royalty-Free & Licensing Terms Badge */}
                  <div className="pt-1.5 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                        (sound.isRoyaltyFree ?? true)
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        {(sound.isRoyaltyFree ?? true) ? 'Royalty-Free' : 'Licensed'}
                      </span>

                      <span className="text-[10px] font-mono text-gray-400 uppercase bg-black/40 px-2 py-0.5 rounded-lg border border-white/5 truncate">
                        {sound.licenseType === 'royalty_free' && 'Unlimited Commercial'}
                        {sound.licenseType === 'commercial_rights' && 'Commercial Rights'}
                        {sound.licenseType === 'non_commercial' && 'Non-Commercial / Attribution'}
                        {sound.licenseType === 'custom_license' && 'Custom Agreement'}
                        {!sound.licenseType && 'Royalty Free'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300/90 leading-tight bg-black/40 p-2 rounded-xl border border-white/5 line-clamp-2">
                      <strong className="text-emerald-400 font-semibold">Terms:</strong> {sound.commercialTerms || '100% Royalty Free for Commercial & Monetized Media'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engagement Stats & Action Bar */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  <div>
                    <span className="block text-[9px] text-gray-500 font-bold uppercase">Streams</span>
                    <strong className="text-white text-xs">{sound.listens.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-gray-500 font-bold uppercase">Downloads</span>
                    <div className="text-xs">
                      <strong className="text-emerald-400">{sound.successfulDownloads ?? sound.downloads}</strong>
                      <span className="text-[9px] text-rose-400/80 ml-1">({sound.failedDownloads ?? 0} blk)</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] text-amber-400 font-bold uppercase">Studio Usages</span>
                    <strong className="text-amber-300 text-xs">{sound.usagesCount ?? 0}</strong>
                  </div>
                </div>

                {/* Rating Bar */}
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Rate Sound:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateSound(sound, star)}
                        className="text-gray-600 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${ (userRatings[sound.id] || 0) >= star ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadSound(sound)}
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSound(sound);
                      setShowUseSoundModal(true);
                    }}
                    className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    Use for Video/Ads
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    onClick={() => handleLike(sound)}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                      userLikes[sound.id] ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${userLikes[sound.id] ? 'fill-emerald-400' : ''}`} />
                    Like ({sound.likes})
                  </button>

                  <button
                    onClick={() => handleDislike(sound)}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                      userDislikes[sound.id] ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    ({sound.dislikes})
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSound(sound);
                      setShowTrimmerModal(true);
                    }}
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1 text-xs"
                  >
                    <Scissors className="w-3 h-3" />
                    Trim/Cut
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

      {/* TAB 3: EARNING RENEWAL & ANALYSIS HUB */}
      {activeTab === 'renewals' && (
        <div className="space-y-8">
          {/* Header Banner & Rule Notice */}
          <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                  Mandatory Earning & Promotion Rules
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
                  1-Year Earning & Billing Renewal Center
                </h2>
                <p className="text-gray-300 text-sm mt-1 max-w-2xl leading-relaxed">
                  Song & Sound FX owners earn royalties for <strong>1 full year (365 days)</strong> per uploaded audio track. After 1 year, earnings automatically pause. To continue earning and promoting, creators renew their billing:
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
                <div className="text-xs text-gray-300">Your Central Wallet</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-0.5">${balance.toFixed(2)}</div>
              </div>
            </div>

            {/* Price Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {SUPER_SOUNDS_RENEWAL_PLANS.map(plan => (
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

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-gray-400 uppercase">Monetized Active Sounds</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {sounds.filter(s => !s.earningExpiresAt || new Date().getTime() <= new Date(s.earningExpiresAt).getTime()).length}
              </div>
              <div className="text-[11px] text-emerald-300 font-medium mt-1">Earning $0.005 / download or use</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-gray-400 uppercase">Expired / Paused Tracks</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {sounds.filter(s => s.earningExpiresAt && new Date().getTime() > new Date(s.earningExpiresAt).getTime()).length}
              </div>
              <div className="text-[11px] text-amber-300 font-medium mt-1">Renewal needed to resume earnings</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-gray-400 uppercase">Total Renewal Investment</div>
              <div className="text-2xl font-black text-purple-400 mt-1">
                ${sounds.reduce((acc, curr) => acc + (curr.totalRenewalSpent || 0), 0)}
              </div>
              <div className="text-[11px] text-purple-300 font-medium mt-1">Spent on catalog extensions</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-gray-400 uppercase">Uncredited Paused Activity</div>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {sounds.reduce((acc, curr) => acc + (curr.downloadsWhileExpired || 0) + (curr.usagesWhileExpired || 0), 0)}
              </div>
              <div className="text-[11px] text-rose-300 font-medium mt-1">Streams/uses while expired</div>
            </div>
          </div>

          {/* Sound Monetization & Billing Status Table */}
          <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  Super Sounds Monetization & Renewal Management Table
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Extend monetization validity for 1 to 5 years for any track in your library</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-black/60 text-gray-400 uppercase font-bold border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="p-3">Track Title & Artist</th>
                    <th className="p-3">Tracking ID</th>
                    <th className="p-3">Monetization Expiry Date</th>
                    <th className="p-3">Earning Status</th>
                    <th className="p-3">Uncredited Activity</th>
                    <th className="p-3">Total Renewal Spent</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sounds.map(item => {
                    const isExpired = item.earningExpiresAt ? new Date().getTime() > new Date(item.earningExpiresAt).getTime() : false;
                    const daysRemaining = item.earningExpiresAt ? Math.ceil((new Date(item.earningExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 365;

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white">
                          <div>{item.title}</div>
                          <div className="text-[10px] text-purple-400 font-normal">{item.artist} • {item.category}</div>
                        </td>
                        <td className="p-3 font-mono text-purple-300 font-bold">
                          {item.trackingId}
                        </td>
                        <td className="p-3 font-mono text-gray-300">
                          {item.earningExpiresAt ? new Date(item.earningExpiresAt).toLocaleDateString() : '1 Year Default'}
                        </td>
                        <td className="p-3">
                          {isExpired ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3 text-amber-400" />
                              Earnings Paused
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Active ({daysRemaining}d)
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-rose-400">
                          {(item.downloadsWhileExpired || 0) + (item.usagesWhileExpired || 0)}
                        </td>
                        <td className="p-3 font-mono font-bold text-purple-300">
                          ${item.totalRenewalSpent || 0}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setRenewalModalSound(item)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1 ml-auto"
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
        </div>
      )}

      {/* RENEWAL BILLING SELECTION MODAL */}
      <AnimatePresence>
        {renewalModalSound && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6 text-white"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Renew Sound Monetization & Billing</span>
                    <h3 className="text-xl font-bold text-white">{renewalModalSound.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Artist: {renewalModalSound.artist} • Tracking ID: {renewalModalSound.trackingId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRenewalModalSound(null)}
                  className="text-gray-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  1-Year Monetization Rule
                </div>
                <p>
                  Owners earn for 1 full year per song/sound. Renewing billing extends monetization validity and restores uncredited streams and downloads!
                </p>
              </div>

              {/* Renewal Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select Renewal Billing Package:</label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {SUPER_SOUNDS_RENEWAL_PLANS.map(plan => (
                    <button
                      key={plan.years}
                      onClick={() => {
                        const targetSound = renewalModalSound;
                        setRenewalModalSound(null);
                        handleRenewSoundMonetization(targetSound, plan.years, plan.price);
                      }}
                      className="w-full p-4 rounded-2xl border border-white/10 hover:border-emerald-500 bg-black/40 hover:bg-emerald-950/30 transition-all text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{plan.label}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            {plan.discount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-amber-300">${plan.price}</div>
                        <div className="text-[10px] text-emerald-400 font-bold group-hover:underline">Pay via Wallet →</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Promotion Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-xl w-full space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Promote New Sound / Album</h3>
                    <p className="text-xs text-gray-400">Distribute your audio across Supreme Network</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateSoundPromotion} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Sound / Track Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Afro Beats Supreme Vibe"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Artist / Creator Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Starboy Kizz"
                      value={uploadArtist}
                      onChange={(e) => setUploadArtist(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-purple-400 mb-1">Curated Playlist Group</label>
                    <select
                      value={uploadPlaylistId}
                      onChange={(e) => {
                        const plId = e.target.value;
                        setUploadPlaylistId(plId);
                        const foundPl = CURATED_PLAYLISTS.find(p => p.id === plId);
                        if (foundPl) setUploadMoodTheme(foundPl.moodTheme);
                      }}
                      className="w-full bg-black/60 border border-purple-500/30 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      {CURATED_PLAYLISTS.map((pl) => (
                        <option key={pl.id} value={pl.id} className="bg-gray-900">
                          {pl.title} ({pl.moodTheme})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Audio Duration (Seconds)</label>
                  <input
                    type="number"
                    min={10}
                    max={3600}
                    value={uploadDurationSec}
                    onChange={(e) => setUploadDurationSec(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                  <span className="text-[10px] text-gray-400">Max 3600s (1 hour). Free plan limit: 60s max.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Audio Source URL (.mp3)</label>
                  <input
                    type="url"
                    placeholder="https://assets.mixkit.co/music/preview/..."
                    value={uploadAudioUrl}
                    onChange={(e) => setUploadAudioUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Album Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={uploadCoverUrl}
                    onChange={(e) => setUploadCoverUrl(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>

                {/* Promotion Type Selector */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase text-purple-400">Select Promotion Billing Tier</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPromoType('free');
                        if (uploadDurationSec > 60) setUploadDurationSec(60);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        uploadPromoType === 'free'
                          ? 'bg-blue-500/20 border-blue-400 text-white'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <strong className="block text-sm text-blue-400">Free Promotion</strong>
                      <span className="text-xs">1 Minute Max Duration</span>
                      <p className="text-[10px] text-gray-400 mt-1">Earnings locked from Central Wallet transfer unless on billing sub.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadPromoType('paid')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        uploadPromoType === 'paid'
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <strong className="block text-sm text-amber-400">Paid Billing Sub</strong>
                      <span className="text-xs">Full Length (1 Min - 1 Hour)</span>
                      <p className="text-[10px] text-gray-400 mt-1">Unlocks full track duration & direct Central Wallet cash out!</p>
                    </button>
                  </div>

                  {uploadPromoType === 'paid' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {PROMOTION_PLANS.map((plan) => (
                        <button
                          key={plan.days}
                          type="button"
                          onClick={() => setSelectedPlanDays(plan.days as any)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selectedPlanDays === plan.days
                              ? 'bg-[var(--color-supreme-gold)] text-black border-[var(--color-supreme-gold)] font-bold'
                              : 'bg-black/50 text-gray-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="block text-xs font-extrabold">{plan.label}</span>
                          <span className="text-sm font-black">${plan.price}.00</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Royalty-Free Licensing & Commercial Terms Toggle Box */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wide text-emerald-300">Royalty-Free Licensing & Commercial Rights</h4>
                        <p className="text-[10px] text-gray-400">Define how Video Creators, Advertisers & Clips users can utilize this sound</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setUploadIsRoyaltyFree(!uploadIsRoyaltyFree)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        uploadIsRoyaltyFree ? 'bg-emerald-500' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          uploadIsRoyaltyFree ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* License Tier Selection */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-300 uppercase">Commercial License Type</label>
                    <select
                      value={uploadLicenseType}
                      onChange={(e) => setUploadLicenseType(e.target.value as any)}
                      className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="royalty_free" className="bg-gray-900">🛡️ Royalty-Free (100% Commercial & Monetized Media)</option>
                      <option value="commercial_rights" className="bg-gray-900">💼 Commercial Rights Included (Ads, Trailers & Broadcasts)</option>
                      <option value="non_commercial" className="bg-gray-900">📌 Non-Commercial / Attribution Required</option>
                      <option value="custom_license" className="bg-gray-900">📜 Custom Licensing Terms</option>
                    </select>
                  </div>

                  {/* Commercial Terms Description */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-300 uppercase">Commercial Usage Terms</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100% Royalty Free for Commercial Videos, Podcasts, Ads & Shorts"
                      value={uploadCommercialTerms}
                      onChange={(e) => setUploadCommercialTerms(e.target.value)}
                      className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setUploadCommercialTerms('100% Royalty Free for Commercial & Monetized Media')}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                      >
                        100% Royalty Free
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadCommercialTerms('Royalty Free for Videos, Shorts, Podcasts & Ads (Attribution Requested)')}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Free + Attribution
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadCommercialTerms('Commercial Rights Included for Ads, Trailers & Games')}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Ads & Broadcasts
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-500 text-black font-extrabold rounded-xl hover:scale-[1.02] transition-all shadow-xl"
                  >
                    Launch Super Sounds Promotion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Audio Quality Analyzer Modal */}
      <AnimatePresence>
        {showAiModal && selectedSound && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-lg w-full space-y-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Supreme AI Sound Quality Analyzer</h3>
                    <p className="text-xs text-gray-400">Instant frequency, bitrate & loudness report</p>
                  </div>
                </div>
                <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {isAnalyzingAi ? (
                <div className="py-12 text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                  <p className="text-sm text-gray-300 font-bold">Supreme AI is analyzing spatial frequencies & dynamics...</p>
                </div>
              ) : aiReport && (
                <div className="space-y-4 text-sm">
                  <div className="bg-purple-950/60 border border-purple-500/30 p-6 rounded-2xl text-center space-y-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Mastering Quality Score</span>
                    <p className="text-5xl font-black text-amber-400">{aiReport.score}/100</p>
                    <span className="text-xs text-emerald-400 font-bold">Studio Master Grade Verified</span>
                  </div>

                  <div className="space-y-2 bg-black/50 p-4 rounded-2xl border border-white/10 text-xs">
                    <div>
                      <span className="text-gray-500 font-bold block">Bitrate Format:</span>
                      <strong className="text-white">{aiReport.bitrate}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block">Spatial Clarity:</span>
                      <strong className="text-white">{aiReport.clarity}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block">Dynamic Range Loudness:</span>
                      <strong className="text-white">{aiReport.dynamicRange}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block">Balance Assessment:</span>
                      <p className="text-gray-300 mt-0.5">{aiReport.balanceNote}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{aiReport.recommendation}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto / Manual Audio Trimmer Modal */}
      <AnimatePresence>
        {showTrimmerModal && selectedSound && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-lg w-full space-y-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Auto & Manual Audio Cutter / Trimmer</h3>
                    <p className="text-xs text-gray-400">Extract snippets for Video Clips, Ads, or Statuses</p>
                  </div>
                </div>
                <button onClick={() => setShowTrimmerModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-sm">{selectedSound.title}</h4>
                  <p className="text-xs text-gray-400">Original Duration: {selectedSound.durationSeconds} seconds</p>

                  <div className="pt-3 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                      <span>Start: {trimStartSec}s</span>
                      <span>End: {trimEndSec}s</span>
                      <span>Selected Clip: {trimEndSec - trimStartSec}s</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Trim Start Timestamp</label>
                      <input
                        type="range"
                        min={0}
                        max={selectedSound.durationSeconds - 5}
                        value={trimStartSec}
                        onChange={(e) => setTrimStartSec(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />

                      <label className="text-[10px] font-bold text-gray-400 uppercase">Trim End Timestamp</label>
                      <input
                        type="range"
                        min={trimStartSec + 5}
                        max={selectedSound.durationSeconds}
                        value={trimEndSec}
                        onChange={(e) => setTrimEndSec(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Presets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-gray-400">Auto Preset Snippets:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setTrimStartSec(0); setTrimEndSec(15); }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-amber-300 border border-white/10"
                    >
                      15s Status Hook
                    </button>
                    <button
                      onClick={() => { setTrimStartSec(0); setTrimEndSec(30); }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-amber-300 border border-white/10"
                    >
                      30s Commercial Ad
                    </button>
                    <button
                      onClick={() => { setTrimStartSec(0); setTrimEndSec(60); }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-amber-300 border border-white/10"
                    >
                      60s Video Clip
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success(`✂️ Trimmed ${trimEndSec - trimStartSec}s clip saved! Ready for Video Creator & Ads.`);
                    setShowTrimmerModal(false);
                  }}
                  className="w-full py-3.5 bg-[var(--color-supreme-gold)] text-black font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                  Export & Use Trimmed Clip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Usage Integration Modal (Videos / Clips / Ads) */}
      <AnimatePresence>
        {showUseSoundModal && selectedSound && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-lg w-full space-y-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Use Sound in Supreme Network</h3>
                    <p className="text-xs text-gray-400">Attach audio track to Video Creator, Clips & Ads</p>
                  </div>
                </div>
                <button onClick={() => setShowUseSoundModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={selectedSound.coverImage} alt={selectedSound.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm">{selectedSound.title}</h4>
                      <p className="text-xs text-gray-400">Tracking ID: {selectedSound.trackingId}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                    (selectedSound.isRoyaltyFree ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {(selectedSound.isRoyaltyFree ?? true) ? 'Royalty-Free' : 'Commercial License'}
                  </span>
                </div>

                {/* Creator License Guarantee Box */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-2xl text-xs text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Creator Commercial Rights:</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed pl-5">
                    {selectedSound.commercialTerms || '100% Royalty Free for Commercial & Monetized Media'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleUseSoundInStudio(selectedSound);
                      toast.success(`🎬 Sound "${selectedSound.title}" attached to Video Creator Studio! Usage recorded.`);
                      setShowUseSoundModal(false);
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Film className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-bold">Attach to Video Creator Studio</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => {
                      handleUseSoundInStudio(selectedSound);
                      toast.success(`📢 Sound "${selectedSound.title}" attached to Commercial Ad Campaign! Usage recorded.`);
                      setShowUseSoundModal(false);
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Megaphone className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-bold">Attach to Commercial Ads Area</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Earnings & Central Wallet Cash Out Hub Modal */}
      <AnimatePresence>
        {showCashoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-xl w-full space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Super Sounds Promote Earnings</h3>
                    <p className="text-xs text-gray-400">Transfer promotional payout to Central Wallet</p>
                  </div>
                </div>
                <button onClick={() => setShowCashoutModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-950 via-black to-slate-900 border border-emerald-500/40 p-6 rounded-3xl text-center space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Accrued Promotion Earnings</span>
                  <p className="text-4xl font-black text-white">${totalCalculatedEarnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Minimum Cash Out Threshold: <strong>$50.00</strong></p>
                </div>

                <div className="space-y-2 bg-black/50 p-4 rounded-2xl border border-white/10 text-xs">
                  <h4 className="font-bold text-white text-sm mb-2">Earnings Calculation Breakdown:</h4>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-gray-400">Downloads/Uses Rate:</span>
                    <strong className="text-emerald-400">$2.00 per 350 uses</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-gray-400">Likes Rate:</span>
                    <strong className="text-emerald-400">$1.00 per 1,000 likes</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-gray-400">Listens Rate:</span>
                    <strong className="text-emerald-400">$1.00 per 1,000 listens</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-gray-400">Ratings Rate:</span>
                    <strong className="text-emerald-400">$1.00 per 1,000 ratings</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">20,000 Weekly Rating Bonus:</span>
                    <strong className="text-amber-400">$5.00 Bonus</strong>
                  </div>
                </div>

                {/* Rules Check */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <span className="font-bold text-amber-300 block">Transfer Verification Status:</span>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ShieldCheck className={`w-4 h-4 ${totalCalculatedEarnings >= 50 ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span>Minimum $50 Threshold: <strong>{totalCalculatedEarnings >= 50 ? '✅ MET' : '❌ $50 MINIMUM REQUIRED'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Active Billing Sub Status: <strong>✅ VERIFIED</strong></span>
                  </div>
                </div>

                <button
                  onClick={handleCashoutToCentralWallet}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all shadow-xl text-sm"
                >
                  Transfer Payout to Central Wallet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
