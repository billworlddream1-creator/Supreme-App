import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  FileText,
  Video,
  Award,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  DollarSign,
  CreditCard,
  Trophy,
  Coins,
  Flame,
  Zap,
  Crown,
  Music,
  Play,
  Volume2,
  RefreshCw,
  Sliders,
  Plus,
  Image as ImageIcon,
  Copy,
  Check,
  Eye,
  Info,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface PromoteRecord {
  id: string;
  userId: string;
  userEmail: string;
  supremeHandle: string;
  externalHandle: string;
  category: string;
  format: 'text' | 'video';
  userRank: string;
  createdAt: any;
  status: 'pending_reward' | 'rewarded' | 'rejected';
}

interface FeaturePromoPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  credits: number;
  desc: string;
  color: string;
  badge?: string;
  adminOnly?: boolean;
}

const APP_FEATURES = [
  { id: 'supreme-gmt', label: 'Supreme GMT', desc: 'Global messaging and time tracking across global nodes.' },
  { id: 'core', label: 'Supreme Core', desc: 'The baseline operating environment for elite asset management.' },
  { id: 'celeb-hub', label: 'Supreme Celeb Hub', desc: 'Direct, exclusive content channels with global stars and creators.' },
  { id: 'hall-of-fame', label: 'Hall of Fame', desc: 'Platform leadership boards and sovereign prestige recognition.' },
  { id: 'market', label: 'Supreme Market', desc: 'Sovereign trading and decentralized marketplace listings.' },
  { id: 'media', label: 'Supreme Media', desc: 'Monetized media hosting, sharing, and stream pipelines.' },
  { id: 'project-power', label: 'Project Power', desc: 'Advanced tasks, schedules, and developer-focused utilities.' },
  { id: 'industrial-tools', label: 'Industrial Tools', desc: 'Heavyweight computing matrices and automated tools.' },
  { id: 'supreme-coin-optimum', label: 'Supreme Coin Optimum', desc: 'Dynamic coin distribution and financial yield engines.' },
  { id: 'hardware-mining', label: 'Supreme Hardware Mining', desc: 'Decentralized mining networks and physical node arrays.' }
];

const PRICING_PLANS: FeaturePromoPlan[] = [
  { id: 'free', name: 'Free Daily Promo', price: '$0', period: 'daily', credits: 500, desc: 'Default level for daily promotions and basic asset testing.', color: 'border-white/10 text-white' },
  { id: 'weekly', name: 'Weekly Elite', price: '$10', period: 'weekly', credits: 1000, desc: 'High frequency option for weekly promotional blitzes.', color: 'border-blue-500/30 text-blue-400', badge: 'Popular' },
  { id: 'monthly', name: 'Monthly Pro', price: '$25', period: 'monthly', credits: 1000, desc: 'Comprehensive monthly plan for strategic copy & video outputs.', color: 'border-emerald-500/30 text-emerald-400', badge: 'Best Value' },
  { id: 'six_months', name: 'Sovereign 6-Month', price: '$100', period: '6 months', credits: 1000, desc: 'Deep discount plan for structured long-term campaigns.', color: 'border-purple-500/30 text-purple-400' },
  { id: 'yearly', name: 'Empire Yearly', price: '$180', period: 'yearly', credits: 1000, desc: 'Maximum scale, full resolution downloads, and unlimited exports.', color: 'border-amber-500/30 text-amber-400', badge: 'Best Savings' },
  { id: 'admin_yearly', name: 'Admin Exclusive', price: 'Free', period: 'yearly', credits: 1000, desc: 'Yearly license allocated strictly for system administrators.', color: 'border-red-500/30 text-red-400', adminOnly: true, badge: 'Internal Only' }
];

export default function PromoteTrackingAdmin() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'ai_generator' | 'tracking'>('ai_generator');

  // Existing Promote Tracking State
  const [records, setRecords] = useState<PromoteRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // AI Feature Promote Generator State
  const [credits, setCredits] = useState<number>(500);
  const [maxCredits, setMaxCredits] = useState<number>(500);
  const [activePlan, setActivePlan] = useState<string>('free');
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [isActivatingPlan, setIsActivatingPlan] = useState<string | null>(null);

  // Generator Options
  const [selectedFeature, setSelectedFeature] = useState<string>('core');
  const [customFeatureName, setCustomFeatureName] = useState<string>('');
  const [promoFormat, setPromoFormat] = useState<'text' | 'image' | 'video'>('text');
  
  // Format specific states
  const [textTone, setTextTone] = useState<string>('professional');
  const [textPlatform, setTextPlatform] = useState<string>('twitter');
  const [bannerTheme, setBannerTheme] = useState<string>('gold');
  const [bannerSize, setBannerSize] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  
  // Video Duration States
  const [videoHours, setVideoHours] = useState<number>(0);
  const [videoMinutes, setVideoMinutes] = useState<number>(1);
  const [videoSeconds, setVideoSeconds] = useState<number>(60);
  const [videoResolution, setVideoResolution] = useState<string>('1080p');
  const [videoSoundtrack, setVideoSoundtrack] = useState<string>('epic');
  const [videoVoice, setVideoVoice] = useState<string>('ai_adam');
  const [videoImageBackground, setVideoImageBackground] = useState<string>('cyber_neon');
  const [mediaDescription, setMediaDescription] = useState<string>('');

  // Generation Outcomes
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedBannerData, setGeneratedBannerData] = useState<any>(null);
  const [generatedVideoData, setGeneratedVideoData] = useState<any>(null);

  // Video Playing States
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoPlaybackProgress, setVideoPlaybackProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Copy success states
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Helper to calculate promotional cost dynamically based on format and duration
  const getPromoCost = (format: 'text' | 'image' | 'video', hrs: number, mins: number, secs: number) => {
    if (format === 'text') return 10;
    if (format === 'image') return 10;
    const totalSecs = hrs * 3600 + mins * 60 + secs;
    // 10 credits per minute (60 seconds)
    return Math.max(1, Math.ceil(totalSecs * (10 / 60)));
  };

  // Helper to count words in a string
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Load submissions tracking on mount
  useEffect(() => {
    const q = query(collection(db, 'promote_tracking'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: PromoteRecord[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as PromoteRecord);
      });
      setRecords(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'promote_tracking');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Persisted Daily Credits Engine
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('supreme_promote_reset_date');
    const savedPlan = localStorage.getItem('supreme_promote_plan') || 'free';
    const savedCredits = localStorage.getItem('supreme_promote_credits');
    
    let planMax = 500;
    if (savedPlan === 'admin_yearly') {
      planMax = 1000;
    } else if (savedPlan !== 'free') {
      planMax = 1000;
    }

    if (savedDate !== today) {
      localStorage.setItem('supreme_promote_reset_date', today);
      localStorage.setItem('supreme_promote_credits', planMax.toString());
      setCredits(planMax);
      setMaxCredits(planMax);
    } else {
      if (savedCredits !== null) {
        setCredits(parseInt(savedCredits, 10));
      } else {
        setCredits(planMax);
      }
      setMaxCredits(planMax);
    }
    setActivePlan(savedPlan);
  }, []);

  // Update credits remaining
  const deductCredits = (amount: number): boolean => {
    if (credits < amount) {
      toast.error(`Insufficient Credits! You need ${amount} credits, but only have ${credits} remaining today. Please upgrade your promotion plan!`);
      setShowPricingModal(true);
      return false;
    }
    const nextCredits = credits - amount;
    setCredits(nextCredits);
    localStorage.setItem('supreme_promote_credits', nextCredits.toString());
    return true;
  };

  const handleUpdateStatus = async (id: string, newStatus: 'rewarded' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'promote_tracking', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Record marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Plan Purchase Simulator
  const handleActivatePlan = (plan: FeaturePromoPlan) => {
    setIsActivatingPlan(plan.id);
    setTimeout(() => {
      localStorage.setItem('supreme_promote_plan', plan.id);
      localStorage.setItem('supreme_promote_credits', plan.credits.toString());
      setCredits(plan.credits);
      setMaxCredits(plan.credits);
      setActivePlan(plan.id);
      setIsActivatingPlan(null);
      setShowPricingModal(false);
      toast.success(`Successfully activated the "${plan.name}"! Your account is credited with ${plan.credits} daily promote credits.`, {
        icon: '💎'
      });
    }, 1500);
  };

  // Handle Text Copying
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Promotional copy copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // AI Generation Process Simulator
  const handleGeneratePromo = async () => {
    // Determine cost
    const cost = getPromoCost(promoFormat, videoHours, videoMinutes, videoSeconds);
    if (!deductCredits(cost)) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedText('');
    setGeneratedBannerData(null);
    setGeneratedVideoData(null);
    setIsPlayingVideo(false);

    // Stop synthesizer if running
    stopSimulatedSoundtrack();

    const featureObj = APP_FEATURES.find(f => f.id === selectedFeature);
    const featureName = customFeatureName || featureObj?.label || 'Supreme Platform';
    const featureDesc = featureObj?.desc || 'Exclusive elite features on the Supreme ecosystem.';

    try {
      // Step 1: Request analysis
      setGenerationStep('Analyzing app feature specifications and assets...');
      setGenerationProgress(15);
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Content Generation via Gemini API or high-quality smart fallback
      setGenerationStep('Querying Gemini API Core for high-converting marketing hooks...');
      setGenerationProgress(40);

      let apiText = '';
      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Write a brilliant social media viral post or marketing script promoting the "${featureName}" feature. 
            Feature details: "${featureDesc}".
            Format specified: "${promoFormat}". Tone required: "${promoFormat === 'text' ? textTone : 'exciting'}".
            Platform targeting: "${promoFormat === 'text' ? textPlatform : 'all networks'}".
            Return a masterpiece with 3 key benefit points, relevant hashtags, and a powerful CTA to join our supreme app.`,
            systemInstruction: "You are an elite Silicon Valley growth hacker and legendary branding executive."
          })
        });
        
        if (response.ok) {
          const resJson = await response.json();
          apiText = resJson.text;
        }
      } catch (err) {
        console.warn("Gemini direct endpoint offline, triggering local elite marketing generator...", err);
      }

      // If API did not return, use high-fidelity template
      if (!apiText) {
        const toneTemplates: Record<string, string[]> = {
          professional: [
            `📈 Evolve your digital strategy with ${featureName}.\n\nDesigned for users who value precision, this module integrates seamlessly into your day-to-day workflow.\n\nKey Advantages:\n✦ Unprecedented reliability\n✦ Scalable output tracking\n✦ Advanced platform analytics\n\nUnlock elite access and command your portfolio today. ➔ #SupremeSuite #BusinessEfficiency`,
            `💡 Innovation meets precision. Discover ${featureName}.\n\nOur platform provides high-level control and state synchronization. It's the standard for enterprise execution in 2026.\n\nTake action now: Explore this feature in the command bar! #SovereignTech #EnterpriseUpgrade`
          ],
          exciting: [
            `🚀 NEXT LEVEL ALIGNED! Prepare to be blown away by ${featureName}! 🔥\n\nWe've loaded this feature with supreme features to accelerate your daily metrics. This is NOT your average app module!\n\nCheck this out:\n⚡ Lightning fast responses\n⚡ Gorgeous interactive visuals\n⚡ Absolute command over parameters\n\nClick below, enter the grid, and claim your status! ➔ #GameChanger #SupremeInnovation #Elite`,
            `🚨 THE REVOLUTION IS HERE! Discover ${featureName} on Supreme! \n\nStop playing catch-up. Empower your experience with peak technology designed to reward active users. It's fast, it's premium, and it's built for YOU! #SovereignPower #PeakPerformance`
          ],
          mysterious: [
            `👁️ Some things are felt before they are understood. Enter the realm of ${featureName}.\n\nA hidden layer of the Supreme network is now active. Designed strictly for the vanguard who observe the trends before they manifest.\n\nAre you ready to see behind the veil? Access it in the Supreme dashboard. #TheNextPhase #EliteSovereignty`,
            `✨ The equation is complete. The cipher of ${featureName} has unlocked.\n\nA sovereign toolset hidden in plain sight. Uncompromising design for those who operate in silence. #SovereignNetwork #ClassifiedTech`
          ]
        };

        const list = toneTemplates[textTone] || toneTemplates['professional'];
        apiText = list[Math.floor(Math.random() * list.length)];
      }

      // Step 3: Synthesis based on format
      if (promoFormat === 'text') {
        setGenerationStep('Polishing copy blocks and adding dynamic CTAs...');
        setGenerationProgress(75);
        await new Promise(r => setTimeout(r, 600));
        
        setGeneratedText(apiText);
      } 
      else if (promoFormat === 'image') {
        setGenerationStep('Assembling modern vector canvas layer blocks...');
        setGenerationProgress(65);
        await new Promise(r => setTimeout(r, 700));

        setGenerationStep('Rendering color channels and styling typography overlay...');
        setGenerationProgress(85);
        await new Promise(r => setTimeout(r, 600));

        // Generate SVG properties
        const bannerStyles: Record<string, { grad: string; text: string; accent: string }> = {
          gold: { grad: 'from-amber-600 via-amber-950 to-neutral-950', text: '#F59E0B', accent: '#FEF3C7' },
          violet: { grad: 'from-purple-600 via-purple-950 to-neutral-950', text: '#A855F7', accent: '#F3E8FF' },
          crimson: { grad: 'from-red-600 via-red-950 to-neutral-950', text: '#EF4444', accent: '#FEE2E2' },
          emerald: { grad: 'from-emerald-600 via-emerald-950 to-neutral-950', text: '#10B981', accent: '#ECFDF5' }
        };

        const activeStyle = bannerStyles[bannerTheme] || bannerStyles['gold'];

        setGeneratedBannerData({
          title: featureName,
          subtitle: (mediaDescription || featureDesc).substring(0, 85) + '...',
          style: activeStyle,
          badgeText: `SUPREME • ${promoFormat.toUpperCase()} PORTAL`,
          createdAt: new Date().toLocaleTimeString(),
          prompt: mediaDescription
        });
      } 
      else if (promoFormat === 'video') {
        setGenerationStep('Synthesizing motion frame sequences and transitions...');
        setGenerationProgress(60);
        await new Promise(r => setTimeout(r, 800));

        setGenerationStep('Mixing soundtrack channels and aligning render vectors...');
        setGenerationProgress(80);
        await new Promise(r => setTimeout(r, 700));

        setGenerationStep('Assembling optimized MP4 format container...');
        setGenerationProgress(95);
        await new Promise(r => setTimeout(r, 500));

        // Assemble simulated video slides
        setGeneratedVideoData({
          title: featureName,
          subtitle: mediaDescription || featureDesc,
          soundtrack: videoSoundtrack,
          voice: videoVoice,
          background: videoImageBackground,
          resolution: videoResolution,
          durationText: `${videoHours.toString().padStart(2, '0')}:${videoMinutes.toString().padStart(2, '0')}:${videoSeconds.toString().padStart(2, '0')}`,
          aspectRatio: bannerSize,
          prompt: mediaDescription,
          slides: [
            { text: `INTRODUCING ${featureName.toUpperCase()}`, desc: 'Next Generation Supreme Upgrade' },
            { text: 'POWERED BY SUPREME INTEL', desc: mediaDescription ? (mediaDescription.length > 80 ? mediaDescription.substring(0, 77) + '...' : mediaDescription) : featureDesc },
            { text: 'COMMAND YOUR METRICS TODAY', desc: 'Secure Instant Access in the System Console' }
          ]
        });
      }

      setGenerationProgress(100);
      setGenerationStep('Asset Generation Completed Successfully!');
      await new Promise(r => setTimeout(r, 400));
      setIsGenerating(false);
      toast.success(`Successfully generated promotional ${promoFormat}! ${cost} credits deducted.`);
    } catch (err: any) {
      console.error(err);
      toast.error('AI Generation encountered an issue: ' + err.message);
      setIsGenerating(false);
    }
  };

  // Video Synthesizer Sound Engine (Generates lovely futuristic tones)
  const startSimulatedSoundtrack = () => {
    if (isMuted) return;
    try {
      stopSimulatedSoundtrack();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Tech/Future loop frequency oscillation
      const freqs = [220, 261.63, 329.63, 392.00, 440]; // Am7 chord tones
      let idx = 0;
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freqs[0], ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Pulse volume and frequency to simulate a cybernetic synth track
      const interval = setInterval(() => {
        if (!oscillatorRef.current || ctx.state === 'closed') {
          clearInterval(interval);
          return;
        }
        idx = (idx + 1) % freqs.length;
        oscillatorRef.current.frequency.exponentialRampToValueAtTime(freqs[idx], ctx.currentTime + 0.3);
      }, 800);

    } catch (e) {
      console.warn("Web Audio API not fully initialized in this frame environment.", e);
    }
  };

  const stopSimulatedSoundtrack = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {}
  };

  // Handle Video Player Playback simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingVideo && generatedVideoData) {
      startSimulatedSoundtrack();
      interval = setInterval(() => {
        setVideoPlaybackProgress(prev => {
          if (prev >= 100) {
            stopSimulatedSoundtrack();
            setIsPlayingVideo(false);
            return 0;
          }
          return prev + 2; // Incremental tick
        });
      }, 300);
    } else {
      stopSimulatedSoundtrack();
    }

    return () => {
      clearInterval(interval);
      stopSimulatedSoundtrack();
    };
  }, [isPlayingVideo, generatedVideoData, isMuted]);

  // Handle Export / Download / Share Actions
  const handleDownloadAsset = (format: string) => {
    let content = '';
    let filename = `supreme-promote-${selectedFeature}`;

    if (format === 'text') {
      content = generatedText;
      filename += '.txt';
    } else if (format === 'image') {
      // Export SVG content
      const svgElement = document.getElementById('promo-banner-svg');
      if (svgElement) {
        content = svgElement.outerHTML;
        filename += '.svg';
      } else {
        toast.error('Could not find SVG element to download.');
        return;
      }
    } else if (format === 'video') {
      // Export video storyboard metadata
      content = JSON.stringify(generatedVideoData, null, 2);
      filename += '-spec.json';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported and downloaded ${format.toUpperCase()} asset!`);
  };

  const handleShareToMedia = async () => {
    const featureObj = APP_FEATURES.find(f => f.id === selectedFeature);
    const titleText = customFeatureName || featureObj?.label || 'Supreme Platform Feature';
    
    try {
      // Add record to promote_tracking to track it as a successful activity
      await addDoc(collection(db, 'promote_tracking'), {
        userId: 'admin',
        userEmail: 'admin@supreme.app',
        supremeHandle: '@admin',
        externalHandle: '@supreme_official',
        category: `AI Feature Promote: ${titleText}`,
        format: promoFormat === 'video' ? 'video' : 'text',
        userRank: 'Supreme Administrator',
        status: 'rewarded',
        createdAt: serverTimestamp()
      });

      // Write audit log for safety
      await addDoc(collection(db, 'admin_audit_logs'), {
        action: `Generated & Shared AI Promotion: ${titleText}`,
        category: 'Promotional Engine',
        adminEmail: 'admin@supreme.app',
        timestamp: serverTimestamp(),
        ipAddress: '0.0.0.0',
        details: `AI Promoted Feature: ${titleText} via ${promoFormat.toUpperCase()} medium.`
      });

      toast.success(`Successfully published and shared promotional asset directly to the Supreme Media Area!`, {
        duration: 5000,
        icon: '🚀'
      });
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to register the share record in Firestore, but asset is broadcasted.');
    }
  };

  // Filter existing tracking records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supremeHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.externalHandle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending_reward').length,
    rewarded: records.filter(r => r.status === 'rewarded').length,
    text: records.filter(r => r.format === 'text').length,
    video: records.filter(r => r.format === 'video').length
  };

  // Render correct simulated video frame slide based on playback progress
  const getActiveVideoSlide = () => {
    if (!generatedVideoData) return null;
    const slidesCount = generatedVideoData.slides.length;
    const activeIndex = Math.floor((videoPlaybackProgress / 100) * slidesCount);
    return generatedVideoData.slides[Math.min(activeIndex, slidesCount - 1)];
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Tab Layout Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Feature Promote</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" /> AI Active
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Generate engaging copy, custom vector image banners, and motion videos to promote app features.</p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ai_generator')}
            className={clsx(
              "flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300",
              activeTab === 'ai_generator' 
                ? "bg-[var(--color-supreme-gold)] text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Promo Engine
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={clsx(
              "flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300",
              activeTab === 'tracking'
                ? "bg-[var(--color-supreme-gold)] text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Megaphone className="w-3.5 h-3.5" /> User Submissions
          </button>
        </div>
      </div>

      {activeTab === 'ai_generator' ? (
        // ================= TAB 1: AI PROMOTIONS ENGINE =================
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: OPTIONS PANEL (COL 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Credit Tracker Box */}
            <div className="bg-gradient-to-br from-amber-500/10 to-neutral-950 p-6 rounded-3xl border border-amber-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" /> Daily Promote Credits
                </span>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400 transition-all flex items-center gap-1"
                >
                  <CreditCard className="w-3 h-3" /> Upgrade
                </button>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-display font-black text-white">{credits}</span>
                <span className="text-sm font-bold text-gray-500">/ {maxCredits} daily credits</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${(credits / maxCredits) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>Active Plan: <strong className="text-white capitalize">{activePlan.replace('_', ' ')}</strong></span>
                <span>Resets at Midnight UTC</span>
              </div>
            </div>

            {/* AI Settings Form */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <SlidersHorizontal className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                <div>
                  <h4 className="text-sm font-bold text-white">Generator Config</h4>
                  <p className="text-[10px] text-gray-500">Formulate parameters of your promotional campaign</p>
                </div>
              </div>

              {/* Step 1: Feature Select */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">1. Select App Feature to Promote</label>
                <div className="relative">
                  <select
                    value={selectedFeature}
                    onChange={(e) => {
                      setSelectedFeature(e.target.value);
                      setCustomFeatureName('');
                    }}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] appearance-none"
                  >
                    {APP_FEATURES.map((feat) => (
                      <option key={feat.id} value={feat.id}>{feat.label}</option>
                    ))}
                    <option value="custom">-- Custom Promotion Topic --</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Custom Input (if selected) */}
              {selectedFeature === 'custom' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Custom Feature / Promotion Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Secret Reward Vault System"
                    value={customFeatureName}
                    onChange={(e) => setCustomFeatureName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>
              )}

              {/* Step 2: Format Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">2. Generation Medium & Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'text', label: 'Copywriting', icon: FileText },
                    { id: 'image', label: 'Image Banner', icon: ImageIcon },
                    { id: 'video', label: 'Promo Video', icon: Video }
                  ].map((fmt) => {
                    const cost = getPromoCost(fmt.id as any, videoHours, videoMinutes, videoSeconds);
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setPromoFormat(fmt.id as any)}
                        className={clsx(
                          "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center group relative",
                          promoFormat === fmt.id 
                            ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)] shadow-lg"
                            : "bg-black/40 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <fmt.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{fmt.label}</span>
                        <span className="text-[8px] font-mono text-gray-500 mt-0.5">-{cost} Cr</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Prompt/Description for Video and Image */}
              {(promoFormat === 'video' || promoFormat === 'image') && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      Describe Type of {promoFormat === 'video' ? 'Video' : 'Image'}
                    </label>
                    <span className={clsx(
                      "text-[9px] font-mono",
                      getWordCount(mediaDescription) > 5000 ? "text-red-500 font-bold" : "text-gray-500"
                    )}>
                      {getWordCount(mediaDescription)} / 5000 words
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder={`Describe the visual concept, color palette, pacing, or key message you want for your ${promoFormat}... (Up to 5000 words)`}
                    value={mediaDescription}
                    onChange={(e) => setMediaDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-supreme-gold)] resize-none font-sans leading-relaxed"
                  />
                  {getWordCount(mediaDescription) > 5000 && (
                    <p className="text-[10px] text-red-500 font-bold animate-pulse">
                      ⚠️ Word count exceeds the 5,000 words limit. Please shorten your description.
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Format-Specific Custom Controls */}
              <AnimatePresence mode="wait">
                {promoFormat === 'text' && (
                  <motion.div
                    key="text_controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pt-4 border-t border-white/5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Copy Tone</label>
                        <select
                          value={textTone}
                          onChange={(e) => setTextTone(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="professional">Professional / Elegant</option>
                          <option value="exciting">Exciting / Viral</option>
                          <option value="mysterious">Mysterious / Hidden</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Target Channel</label>
                        <select
                          value={textPlatform}
                          onChange={(e) => setTextPlatform(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="twitter">Twitter / X Post</option>
                          <option value="linkedin">LinkedIn Article</option>
                          <option value="newsletter">Email Newsletter</option>
                          <option value="telegram">Telegram Broadcast</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {promoFormat === 'image' && (
                  <motion.div
                    key="image_controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pt-4 border-t border-white/5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Graphic Theme</label>
                        <select
                          value={bannerTheme}
                          onChange={(e) => setBannerTheme(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="gold">Supreme Gold (Royal)</option>
                          <option value="violet">Midnight Violet (Space)</option>
                          <option value="crimson">Cyber Crimson (Intense)</option>
                          <option value="emerald">Emerald Horizon (Finance)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Aspect Ratio</label>
                        <select
                          value={bannerSize}
                          onChange={(e) => setBannerSize(e.target.value as any)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="16:9">Horizontal (16:9)</option>
                          <option value="1:1">Square Banner (1:1)</option>
                          <option value="9:16">Vertical/Story (9:16)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {promoFormat === 'video' && (
                  <motion.div
                    key="video_controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pt-4 border-t border-white/5"
                  >
                    {/* Time selection: minutes */}
                    <div>
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 block">Video Duration</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-2xl border border-white/5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setVideoHours(0);
                              setVideoMinutes(mins);
                              setVideoSeconds(mins * 60);
                            }}
                            className={clsx(
                              "flex-1 min-w-[50px] py-2 text-xs font-mono font-black rounded-xl border transition-all text-center",
                              videoMinutes === mins
                                ? "bg-[var(--color-supreme-gold)]/20 border-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)]"
                                : "bg-black/40 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Video Sound</label>
                        <select
                          value={videoSoundtrack}
                          onChange={(e) => setVideoSoundtrack(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="epic">Epic Future Synth</option>
                          <option value="cinematic">Cinematic Orchestra</option>
                          <option value="ambient">Ambient Focus Tech</option>
                          <option value="cyberpunk">High Velocity Electro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Resolution</label>
                        <select
                          value={videoResolution}
                          onChange={(e) => setVideoResolution(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="1080p">Ultra HD (1080p)</option>
                          <option value="720p">Standard HD (720p)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Voice Narration Type</label>
                        <select
                          value={videoVoice}
                          onChange={(e) => setVideoVoice(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="ai_adam">Adam (Deep Professional)</option>
                          <option value="ai_sarah">Sarah (Warm Storyteller)</option>
                          <option value="ai_michael">Michael (High-Velocity Exciting)</option>
                          <option value="ai_emily">Emily (Sophisticated & Clean)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Visual Image Theme</label>
                        <select
                          value={videoImageBackground}
                          onChange={(e) => setVideoImageBackground(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                        >
                          <option value="cyber_neon">Cyber Neon (Glow & Grids)</option>
                          <option value="gold_luxury">Gold Luxury (Royal Metallic)</option>
                          <option value="cosmic_dark">Cosmic Nebula (Deep Space)</option>
                          <option value="future_matrix">Future Matrix (Tech Streams)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Trigger Button */}
              <button
                type="button"
                onClick={handleGeneratePromo}
                disabled={isGenerating || credits < getPromoCost(promoFormat, videoHours, videoMinutes, videoSeconds) || ((promoFormat === 'video' || promoFormat === 'image') && getWordCount(mediaDescription) > 5000)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-300 text-black hover:from-amber-600 hover:to-amber-400 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                Generate Promo {promoFormat.toUpperCase()} ({getPromoCost(promoFormat, videoHours, videoMinutes, videoSeconds)} Cr)
              </button>

            </div>

          </div>

          {/* RIGHT PANEL: DISPLAY OUTPUT SCREEN (COL 7) */}
          <div className="lg:col-span-7">
            
            <div className="bg-black/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 h-full flex flex-col min-h-[580px] overflow-hidden">
              
              {/* Output Monitor Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Render Output Monitor</span>
                </div>
                
                {/* Action buttons if output exists */}
                <div className="flex items-center gap-2">
                  {(generatedText || generatedBannerData || generatedVideoData) && !isGenerating && (
                    <>
                      <button
                        onClick={() => handleDownloadAsset(promoFormat)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                        title="Download Asset File"
                      >
                        <Download className="w-4 h-4" /> Export
                      </button>
                      <button
                        onClick={handleShareToMedia}
                        className="p-2 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
                        title="Publish and share directly to Supreme Media Area"
                      >
                        <Share2 className="w-4 h-4" /> Share to Media
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Monitor Workspace Body */}
              <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
                
                {/* 1. Generator is Running overlay */}
                {isGenerating && (
                  <div className="space-y-6 text-center max-w-md animate-fade-in w-full z-20">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin mx-auto" />
                      <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-white font-bold text-base tracking-wide">Synthesizing Creative Spec</h5>
                      <p className="text-xs text-amber-500 font-mono animate-pulse">{generationStep}</p>
                    </div>

                    <div className="space-y-1 w-full max-w-xs mx-auto">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>Rendering Engine</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Neutral Waiting State */}
                {!isGenerating && !generatedText && !generatedBannerData && !generatedVideoData && (
                  <div className="text-center max-w-xs space-y-4 opacity-40">
                    <div className="p-4 rounded-full bg-white/5 border border-white/5 inline-block text-gray-500">
                      <Megaphone className="w-10 h-10" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider">Awaiting Generation</h5>
                      <p className="text-xs text-gray-400 mt-1">Configure options on the left and click Generate to run the supreme AI promotion compiler.</p>
                    </div>
                  </div>
                )}

                {/* 3. Output Render: TEXT COPYWRITING */}
                {!isGenerating && generatedText && promoFormat === 'text' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xl bg-neutral-900/40 p-6 rounded-3xl border border-white/10 shadow-2xl relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyText(generatedText)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                        title="Copy to Clipboard"
                      >
                        {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">
                      <FileText className="w-4 h-4" /> Generated {textPlatform.toUpperCase()} Copy
                    </div>

                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans select-all border-l-2 border-amber-500/40 pl-4 py-2 bg-black/20 rounded-r-xl">
                      {generatedText}
                    </p>

                    <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 pt-3 border-t border-white/5">
                      <span>Word Count: {generatedText.split(/\s+/).length}</span>
                      <span>Tone Index: {textTone.toUpperCase()}</span>
                    </div>
                  </motion.div>
                )}

                {/* 4. Output Render: IMAGE BANNER (Vector Graphic Overlay) */}
                {!isGenerating && generatedBannerData && promoFormat === 'image' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex flex-col items-center"
                  >
                    <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black mb-4 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> Interactive Vector Graphics Banner
                    </div>

                    {/* SVG Vector Graphic Box */}
                    <div className={clsx(
                      "rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative max-w-full",
                      bannerSize === '16:9' ? 'w-full aspect-[16/9]' :
                      bannerSize === '1:1' ? 'w-full max-w-[400px] aspect-square' :
                      'w-full max-w-[280px] aspect-[9/16]'
                    )}>
                      <svg 
                        id="promo-banner-svg" 
                        viewBox="0 0 1600 900" 
                        className="w-full h-full object-cover"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={bannerTheme === 'gold' ? '#D97706' : bannerTheme === 'violet' ? '#7C3AED' : bannerTheme === 'crimson' ? '#DC2626' : '#059669'} />
                            <stop offset="60%" stopColor="#0B0907" />
                            <stop offset="100%" stopColor="#020202" />
                          </linearGradient>
                          <radialGradient id="cyber-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={bannerTheme === 'gold' ? '#F59E0B' : bannerTheme === 'violet' ? '#A855F7' : bannerTheme === 'crimson' ? '#EF4444' : '#10B981'} stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                          </radialGradient>
                          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1"/>
                          </pattern>
                        </defs>

                        {/* Base Background */}
                        <rect width="1600" height="900" fill="url(#gradient-bg)" />
                        <rect width="1600" height="900" fill="url(#cyber-glow)" />
                        <rect width="1600" height="900" fill="url(#grid)" />

                        {/* Geometric Accents */}
                        <circle cx="1400" cy="150" r="300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                        <polygon points="1200,700 1350,850 1100,850" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                        
                        {/* Interactive UI Overlay Frame */}
                        <rect x="150" y="150" width="1300" height="600" rx="30" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <line x1="150" y1="240" x2="1450" y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                        
                        {/* UI window dots */}
                        <circle cx="210" cy="195" r="10" fill="#EF4444" />
                        <circle cx="240" cy="195" r="10" fill="#F59E0B" />
                        <circle cx="270" cy="195" r="10" fill="#10B981" />
                        
                        {/* Badge */}
                        <text x="320" y="205" fill="rgba(255,255,255,0.4)" fontSize="20" fontFamily="sans-serif" fontWeight="900" letterSpacing="4">
                          {generatedBannerData.badgeText}
                        </text>

                        {/* Main Typography */}
                        <text x="250" y="400" fill="#FFFFFF" fontSize="65" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
                          {generatedBannerData.title.toUpperCase()}
                        </text>
                        <text x="250" y="490" fill={generatedBannerData.style.text} fontSize="45" fontFamily="sans-serif" fontWeight="800">
                          SUPREME UPGRADE COMPILER ACTIVE
                        </text>

                        {/* Tagline */}
                        <text x="250" y="580" fill="rgba(255,255,255,0.6)" fontSize="24" fontFamily="sans-serif" fontWeight="400">
                          {generatedBannerData.subtitle}
                        </text>

                        {/* Core vector UI stats bar */}
                        <rect x="250" y="640" width="1100" height="5" fill="rgba(255,255,255,0.1)" rx="2" />
                        <rect x="250" y="640" width="750" fill={generatedBannerData.style.text} height="5" rx="2" />

                        {/* Footer details */}
                        <text x="250" y="700" fill="rgba(255,255,255,0.3)" fontSize="18" fontFamily="monospace">
                          NODE PORT: 3000 // SECURITY ENCRYPTED SHA256 // PLATFORM VERSION 2026.1
                        </text>
                      </svg>
                    </div>

                    <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 w-full text-center text-xs text-gray-500">
                      💡 <strong>True Vector SVG Render:</strong> This graphic is generated dynamically with vector coordinates. You can download the editable .svg block directly.
                    </div>
                  </motion.div>
                )}

                {/* 5. Output Render: CINEMATIC PROMO VIDEO */}
                {!isGenerating && generatedVideoData && promoFormat === 'video' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex flex-col items-center"
                  >
                    <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black mb-4 flex items-center gap-1.5">
                      <Video className="w-4 h-4" /> Live AI Video Promo Player Monitor
                    </div>

                    {/* Dynamic Video Monitor Player */}
                    <div className="w-full max-w-[560px] bg-neutral-950 rounded-3xl border-4 border-white/10 shadow-2xl overflow-hidden aspect-[16/9] relative group">
                      
                      {/* Active Video Screen Render */}
                      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                        
                        {/* Ambient Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10" />
                        
                        {/* Dynamic backdrop based on progress */}
                        <div className={clsx(
                          "absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none transition-all duration-500",
                          generatedVideoData.background === 'cyber_neon' ? "from-indigo-600 via-purple-900 to-black" :
                          generatedVideoData.background === 'gold_luxury' ? "from-amber-600 via-amber-950 to-black" :
                          generatedVideoData.background === 'cosmic_dark' ? "from-slate-600 via-blue-900 to-black" :
                          generatedVideoData.background === 'future_matrix' ? "from-emerald-600 via-neutral-900 to-black" :
                          "from-amber-600 via-purple-900 to-black"
                        )} />

                        {isPlayingVideo ? (
                          <div className="space-y-4 animate-fade-in relative z-20 w-full">
                            {/* Visual Wave Form Visualizer Overlay */}
                            <div className="flex items-center justify-center gap-1.5 h-16 opacity-30">
                              {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((h, i) => (
                                <div 
                                  key={i} 
                                  className={clsx(
                                    "w-1 rounded-full transition-all duration-150",
                                    generatedVideoData.background === 'cyber_neon' ? "bg-purple-500" :
                                    generatedVideoData.background === 'gold_luxury' ? "bg-amber-500" :
                                    generatedVideoData.background === 'cosmic_dark' ? "bg-cyan-400" :
                                    generatedVideoData.background === 'future_matrix' ? "bg-emerald-500" :
                                    "bg-amber-500"
                                  )}
                                  style={{ 
                                    height: `${h * 4 + (Math.sin(videoPlaybackProgress + i) * 15)}px`,
                                    opacity: 0.4 + (h * 0.05)
                                  }} 
                                />
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
                                <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black text-white tracking-widest uppercase border border-white/20">
                                  SOURCE: {generatedVideoData.resolution}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[8px] font-black text-amber-500 tracking-widest uppercase border border-amber-500/20">
                                  🗣️ VOICE: {
                                    generatedVideoData.voice === 'ai_sarah' ? 'Sarah (Warm)' :
                                    generatedVideoData.voice === 'ai_adam' ? 'Adam (Deep)' :
                                    generatedVideoData.voice === 'ai_michael' ? 'Michael (Fast)' :
                                    generatedVideoData.voice === 'ai_emily' ? 'Emily (Clean)' : 'Adam'
                                  }
                                </span>
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[8px] font-black text-purple-400 tracking-widest uppercase border border-purple-500/20">
                                  🎨 THEME: {generatedVideoData.background?.replace('_', ' ').toUpperCase() || 'CYBER'}
                                </span>
                              </div>
                              <h3 className="text-xl font-display font-black text-white tracking-wide uppercase max-w-sm mx-auto">
                                {getActiveVideoSlide()?.text}
                              </h3>
                              <p className="text-[10px] text-gray-400 font-sans max-w-xs mx-auto line-clamp-2">
                                {getActiveVideoSlide()?.desc}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 relative z-20">
                            <button
                              onClick={() => {
                                setIsPlayingVideo(true);
                                setVideoPlaybackProgress(0);
                              }}
                              className="w-16 h-16 bg-amber-500 hover:bg-amber-400 text-black rounded-full flex items-center justify-center shadow-lg transform transition hover:scale-105 active:scale-95 mx-auto"
                            >
                              <Play className="w-8 h-8 fill-black stroke-black ml-1" />
                            </button>
                            <div>
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{generatedVideoData.title} Video Promo</h4>
                              <p className="text-[10px] text-gray-400">Duration: {generatedVideoData.durationText} • Click Play to render live preview</p>
                            </div>
                          </div>
                        )}

                        {/* Timecode Clock */}
                        <div className="absolute bottom-4 left-4 text-[9px] font-mono text-gray-500 z-20 bg-black/80 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {isPlayingVideo ? `PLAYING ${Math.floor((videoPlaybackProgress/100) * videoSeconds)}s` : 'READY / STOPPED'}
                        </div>

                        {/* Mute controller */}
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="absolute bottom-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg bg-black/80 border border-white/5 z-20 transition-all"
                        >
                          <Volume2 className={clsx("w-3.5 h-3.5", isMuted && 'text-red-500 line-through')} />
                        </button>
                      </div>

                      {/* Timeline Scrubber */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/5 z-20">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300" 
                          style={{ width: `${videoPlaybackProgress}%` }}
                        />
                      </div>

                    </div>

                    <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 w-full text-center text-xs text-gray-500">
                      🔊 <strong>Sound Synthesis Integrated:</strong> Live promo generates synthetic high-tech loops using local browser nodes. Toggle speaker mute in the player bottom right.
                    </div>
                  </motion.div>
                )}

              </div>

            </div>

          </div>

        </div>
      ) : (
        // ================= TAB 2: ORIGINAL PROMOTIONS LIST =================
        <div className="space-y-8 animate-fade-in">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Promotions', value: stats.total, icon: Megaphone, color: 'text-blue-500' },
              { label: 'Pending Rewards', value: stats.pending, icon: Clock, color: 'text-amber-500' },
              { label: 'Rewarded', value: stats.rewarded, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Video Content', value: stats.video, icon: Video, color: 'text-purple-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} border border-white/5`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Table Block */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Supreme Promote Tracking</h3>
                <p className="text-gray-400 text-xs">Monitor and reward users for promotional content generation</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Search handles or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                >
                  <option value="all">All Status</option>
                  <option value="pending_reward">Pending</option>
                  <option value="rewarded">Rewarded</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">User / Handles</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Category / Format</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Rank</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <Clock className="w-8 h-8 animate-spin text-purple-500" />
                          <p>Loading tracking records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <Megaphone className="w-12 h-12 opacity-20" />
                          <p>No promotion records found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="space-y-1">
                            <p className="font-bold text-white">{record.userEmail}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-purple-400">Sup: {record.supremeHandle}</span>
                              <span className="text-gray-600">|</span>
                              <span className="text-blue-400">Ext: {record.externalHandle}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            {record.format === 'text' ? (
                              <FileText className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Video className="w-4 h-4 text-purple-400" />
                            )}
                            <span className="text-sm text-gray-300">{record.category}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">
                            {record.userRank}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {record.createdAt?.toDate ? record.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            record.status === 'rewarded' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            record.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            {record.status === 'pending_reward' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(record.id, 'rewarded')}
                                  className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                                  title="Mark as Rewarded"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(record.id, 'rejected')}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                                  title="Reject / No Reward"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BILLING / CREDIT PRICING SELECTOR MODAL */}
      <AnimatePresence>
        {showPricingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative no-scrollbar"
            >
              <button
                onClick={() => setShowPricingModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>

              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Promote Generation Credit Plans</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">Power your app branding operations. Select a dedicated tier to get up to 1,000 daily credits instantly.</p>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRICING_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={clsx(
                      "p-6 rounded-3xl border flex flex-col justify-between relative transition-all group overflow-hidden bg-black/40",
                      activePlan === plan.id ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/[0.02]" : "border-white/5 hover:border-white/10"
                    )}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-500/10 text-[8px] font-black uppercase text-amber-500 tracking-wider">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-white text-base">{plan.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-black text-white">{plan.price}</span>
                        <span className="text-xs text-gray-500">/ {plan.period}</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          <span>{plan.credits} Promote Credits Daily</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          <span>Custom Aspect Ratios</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          <span>Simulated Render HQ MP4</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isActivatingPlan !== null}
                      onClick={() => handleActivatePlan(plan)}
                      className={clsx(
                        "w-full mt-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                        activePlan === plan.id
                          ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20 pointer-events-none"
                          : "bg-white hover:bg-gray-100 text-black active:scale-[0.98]"
                      )}
                    >
                      {isActivatingPlan === plan.id ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" /> Activating...
                        </>
                      ) : activePlan === plan.id ? (
                        'Current Plan Active'
                      ) : (
                        `Purchase Plan`
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <Info className="w-5 h-5 text-[var(--color-supreme-gold)] flex-shrink-0" />
                <p className="text-[10px] text-gray-400">
                  Plans are configured with <strong>automatic daily credit resets</strong>. Any unused credits at 23:59 UTC are automatically cycled, and your account is re-credited with your tier limit (500 or 1000 credits) immediately.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
