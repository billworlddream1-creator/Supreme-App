import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Satellite, 
  MapPin, 
  CloudSun, 
  Radio, 
  Network, 
  Smartphone, 
  Wind, 
  Globe, 
  Rocket, 
  Radar,
  Newspaper,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Search,
  Camera,
  Eye,
  Layers,
  Target,
  Settings as SettingsIcon,
  Volume2,
  AlertTriangle,
  Cpu,
  Database,
  Wifi,
  Server,
  X,
  Users,
  Star,
  LayoutGrid,
  Zap as ZapIcon,
  ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';

const tools = [
  {
    id: 'satellite-activities',
    title: 'Satellite Activities',
    desc: 'Monitor real-time orbital operations and maneuvers.',
    icon: Satellite,
    color: 'text-[var(--color-supreme-gold)]',
    bg: 'bg-[var(--color-supreme-gold)]',
    details: 'Live feed of global satellite deployments, maintenance schedules, and orbital adjustments.'
  },
  {
    id: 'satellite-tracking',
    title: 'Satellite Tracking',
    desc: 'Precise real-time location and trajectory mapping.',
    icon: MapPin,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400',
    details: 'Track over 5,000 active satellites with sub-meter accuracy. Includes TLE data and visibility windows.'
  },
  {
    id: 'weather-forecast',
    title: 'Weather Forecast',
    desc: 'Hyper-local atmospheric conditions and predictions.',
    icon: CloudSun,
    color: 'text-[var(--color-supreme-gold)]',
    bg: 'bg-[var(--color-supreme-gold)]',
    details: 'Advanced meteorological modeling using satellite imagery and ground-based sensor networks.'
  },
  {
    id: 'satellite-signals',
    title: 'Signals of Satellites',
    desc: 'Analyze frequency spectrum and signal strength.',
    icon: Radio,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400',
    details: 'Monitor L-band, S-band, and X-band transmissions. Decrypt signal metadata and telemetry.'
  },
  {
    id: 'mass-network-tracking',
    title: 'Mass Network Tracking',
    desc: 'Visualize global data flows and network health.',
    icon: Network,
    color: 'text-[var(--color-supreme-gold)]',
    bg: 'bg-[var(--color-supreme-gold)]',
    details: 'Real-time mapping of backbone infrastructure, undersea cables, and satellite mesh networks.'
  },
  {
    id: 'sensor-tools',
    title: 'Sensors & Local Tracking',
    desc: 'Detect nearby mobile devices and local cameras.',
    icon: Smartphone,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400',
    details: 'Scan for Bluetooth, Wi-Fi, and RF signatures. Identify hidden surveillance equipment in your vicinity.'
  },
  {
    id: 'spiritual-scanner',
    title: 'Spiritual Scanner',
    desc: 'Atmospheric resonance and energy field mapping.',
    icon: Wind,
    color: 'text-[var(--color-supreme-gold)]',
    bg: 'bg-[var(--color-supreme-gold)]',
    details: 'Detect subtle electromagnetic fluctuations and atmospheric ionization patterns.'
  },
  {
    id: 'deep-net-scanners',
    title: 'Deep Net Scanners',
    desc: 'Information retrieval from unindexed networks.',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400',
    details: 'Access non-public data repositories and encrypted information nodes across the global web.'
  },
  {
    id: 'space-scanners',
    title: 'Space Scanners',
    desc: 'Deep space exploration and celestial monitoring.',
    icon: Rocket,
    color: 'text-[var(--color-supreme-gold)]',
    bg: 'bg-[var(--color-supreme-gold)]',
    details: 'Monitor asteroid trajectories, solar flares, and deep space signals from the Supreme Observatory.'
  },
  {
    id: 'object-range-detector',
    title: 'Object Range Detector',
    desc: 'Precision distance measurement and object ID.',
    icon: Radar,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400',
    details: 'LIDAR and RADAR based range finding for objects within a 50km radius.'
  }
];

export default function SupremeGMT() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useSound();

  // Interactive states
  const [targetLocked, setTargetLocked] = useState(false);
  const [activeLayer, setActiveLayer] = useState('Standard');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const { user } = useAuth();
  const rank = user?.rank || 'silver'; // Default to silver
  
  const [isLocked, setIsLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lockHours, setLockHours] = useState(0);
  const [unlockHours, setUnlockHours] = useState(0);

  useEffect(() => {
    const calculateAccess = () => {
      if (!user) return;
      
      let lHours = 0;
      let uHours = 0;
      
      switch (rank) {
        case 'royal':
          lHours = 5;
          uHours = 1;
          break;
        case 'elite':
          lHours = 4;
          uHours = 1;
          break;
        case 'silver':
          lHours = 3.5;
          uHours = 1;
          break;
        case 'diamond':
          lHours = 2.5;
          uHours = 1;
          break;
        case 'gold':
          lHours = 2;
          uHours = 2;
          break;
        case 'crowned':
          lHours = 1.5;
          uHours = 2.5;
          break;
        default:
          lHours = 3.5;
          uHours = 1;
      }
      
      setLockHours(lHours);
      setUnlockHours(uHours);
      
      const cycleHours = lHours + uHours;
      const cycleMs = cycleHours * 60 * 60 * 1000;
      const lockMs = lHours * 60 * 60 * 1000;
      
      const createdAtMs = new Date(user.createdAt).getTime();
      const nowMs = Date.now();
      
      const timeSinceStart = nowMs - createdAtMs;
      const currentCycleTime = timeSinceStart % cycleMs;
      
      const currentlyLocked = currentCycleTime < lockMs;
      setIsLocked(currentlyLocked);
      
      if (currentlyLocked) {
        setTimeRemaining(lockMs - currentCycleTime);
      } else {
        setTimeRemaining(cycleMs - currentCycleTime);
      }
    };

    calculateAccess();
    const interval = setInterval(calculateAccess, 1000);
    return () => clearInterval(interval);
  }, [user, rank]);

  useEffect(() => {
    if (isLocked && selectedTool) {
      handleClose();
    }
  }, [isLocked, selectedTool]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTool = tools.find(t => t.id === selectedTool);

  useEffect(() => {
    if (selectedTool) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedTool]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleClose = () => {
    setSelectedTool(null);
    setIsLoading(false);
    setTargetLocked(false);
    setActiveLayer('Standard');
    setIsScanning(false);
    setScanProgress(0);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-[var(--color-bet-purple-dark)] p-10 md:p-16 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-supreme-gold)]/5 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 animate-pulse" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--color-supreme-gold)] text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Shield className="w-4 h-4" /> Global Monitoring Technology
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none">
              Supreme <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] via-white to-emerald-400">GMT</span>
            </h1>
            <p className="text-purple-200/60 text-xl leading-relaxed">
              The ultimate global surveillance and monitoring suite. Access real-time data from orbital assets, local sensors, and deep networks.
            </p>
          </div>
          
          <div className="flex flex-col gap-8 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-black uppercase tracking-widest text-sm"
              >
                <SettingsIcon className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                GMT Settings
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/insight" 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="p-3 rounded-xl bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)]">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-[var(--color-supreme-gold)] transition-colors">Supreme Insight</h4>
                  <p className="text-[10px] text-purple-200/40 font-bold">Exclusive news & analysis</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-200/20 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/supreme-core" 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Supreme Core</h4>
                  <p className="text-[10px] text-purple-200/40 font-bold">System infrastructure</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-200/20 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/supreme-mode" 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                  <ZapIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-purple-400 transition-colors">Supreme Mode</h4>
                  <p className="text-[10px] text-purple-200/40 font-bold">Advanced system states</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-200/20 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/supreme-users" 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Supreme Users</h4>
                  <p className="text-[10px] text-purple-200/40 font-bold">Community management</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-200/20 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/celeb-hub" 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-rose-400 transition-colors">Celeb Hub</h4>
                  <p className="text-[10px] text-purple-200/40 font-bold">Elite interactions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-200/20 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
      </div>
    </div>

      {/* Access Status Banner */}
      <div className={clsx(
        "rounded-[32px] p-8 border flex flex-col lg:flex-row items-center justify-between gap-8 transition-all shadow-xl",
        isLocked 
          ? "bg-red-500/5 border-red-500/20" 
          : "bg-emerald-500/5 border-emerald-500/20"
      )}>
        <div className="flex items-start gap-6">
          <div className={clsx(
            "p-4 rounded-2xl shrink-0 border",
            isLocked ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          )}>
            {isLocked ? <AlertTriangle className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
          </div>
          <div>
            <h3 className={clsx(
              "text-2xl font-black mb-2 uppercase tracking-tight",
              isLocked ? "text-red-400" : "text-emerald-400"
            )}>
              {isLocked ? "GMT Access Locked" : "GMT Access Active"}
            </h3>
            <p className={clsx(
              "text-base mb-4 leading-relaxed",
              isLocked ? "text-red-200/60" : "text-emerald-200/60"
            )}>
              Your current rank is <strong className="uppercase text-white">{rank}</strong>. 
              {isLocked 
                ? ` Features unlock every ${lockHours} hours and remain active for ${unlockHours} hour(s).` 
                : ` Features are active for ${unlockHours} hour(s) and lock for ${lockHours} hours.`}
            </p>
            <div className="text-[11px] text-purple-200/40 bg-white/5 px-4 py-3 rounded-xl border border-white/5 inline-block leading-relaxed">
              <strong className="text-[var(--color-supreme-gold)] uppercase tracking-widest mr-2">Rank Analysis:</strong> 
              {rank === 'royal' && " Royal rank provides 1 hour of access every 5 hours. Maintain consistent platform activity to optimize usage."}
              {rank === 'elite' && " Elite rank provides 1 hour of access every 4 hours. A balanced tier for regular monitoring."}
              {rank === 'silver' && " Silver rank provides 1 hour of access every 3.5 hours. Good for frequent check-ins."}
              {rank === 'diamond' && " Diamond rank provides 1 hour of access every 2.5 hours. High-frequency access for dedicated users."}
              {rank === 'gold' && " Gold rank provides 2 hours of access every 2 hours. Extended monitoring capabilities."}
              {rank === 'crowned' && " Crowned rank provides 2.5 hours of access every 1.5 hours. Maximum uptime for supreme surveillance."}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-center bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl min-w-[180px] backdrop-blur-md">
          <div className="text-[10px] font-black text-purple-200/40 uppercase tracking-[0.2em] mb-2">
            {isLocked ? "Unlocks In" : "Locks In"}
          </div>
          <div className={clsx(
            "text-3xl font-mono font-black tracking-tighter",
            isLocked ? "text-red-400" : "text-emerald-400"
          )}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            layoutId={tool.id}
            onClick={() => {
              if (!isLocked) {
                setSelectedTool(tool.id);
              }
            }}
            className={clsx(
              "relative p-8 rounded-[32px] border transition-all overflow-hidden group",
              isLocked 
                ? "bg-white/5 border-white/5 opacity-60 cursor-not-allowed grayscale" 
                : "bg-white/5 border-white/10 hover:border-[var(--color-supreme-gold)]/50 cursor-pointer shadow-xl hover:shadow-[var(--color-supreme-gold)]/10",
              selectedTool === tool.id && "ring-2 ring-[var(--color-supreme-gold)]"
            )}
          >
            {isLocked && (
              <div className="absolute top-6 right-6 p-2 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div className={clsx(
              "p-5 rounded-2xl mb-6 w-fit transition-all duration-500 border shadow-inner", 
              !isLocked && "group-hover:scale-110 group-hover:rotate-3", 
              isLocked ? "bg-white/5 border-white/5 text-purple-200/20" : `${tool.bg.replace('bg-', 'bg-opacity-20 bg-')} ${tool.color} border-white/10`
            )}>
              <tool.icon className="w-8 h-8" />
            </div>
            <h3 className={clsx(
              "text-2xl font-black mb-3 transition-colors uppercase tracking-tight", 
              isLocked ? "text-purple-200/20" : "text-white group-hover:text-[var(--color-supreme-gold)]"
            )}>
              {tool.title}
            </h3>
            <p className="text-purple-200/40 text-sm leading-relaxed font-medium">{tool.desc}</p>
            
            {!isLocked && (
              <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Launch Tool <ChevronRight className="w-4 h-4" />
              </div>
            )}

            {/* Decorative background element */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
              <tool.icon className="w-32 h-32" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tool Modal / Detail View */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={selectedTool}
              className="relative w-full max-w-5xl bg-[var(--color-bet-purple-dark)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] max-h-[800px] border border-white/10"
            >
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white z-30 backdrop-blur-md border border-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-[var(--color-bet-purple-dark)] flex flex-col items-center justify-center text-white overflow-hidden"
                  >
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'radial-gradient(circle, var(--color-supreme-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    
                    {/* Scanning Line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-[var(--color-supreme-gold)]/50 shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-10">
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="w-40 h-40 rounded-full border-2 border-dashed border-[var(--color-supreme-gold)]/30"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-3 rounded-full border border-emerald-500/20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Radar className="w-16 h-16 text-[var(--color-supreme-gold)] animate-pulse" />
                        </div>
                      </div>

                      <div className="text-center space-y-4">
                        <motion.h2 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] via-white to-emerald-400 uppercase"
                        >
                          GMT INTEL
                        </motion.h2>
                        <div className="flex items-center justify-center gap-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              className="w-2 h-2 rounded-full bg-[var(--color-supreme-gold)]"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] font-black text-[var(--color-supreme-gold)]/60 uppercase tracking-[0.2em] mt-6">
                          Establishing Secure Satellite Link...
                        </p>
                      </div>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-[var(--color-supreme-gold)]/30" />
                    <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-[var(--color-supreme-gold)]/30" />
                    <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-[var(--color-supreme-gold)]/30" />
                    <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-[var(--color-supreme-gold)]/30" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col lg:flex-row w-full h-full bg-[var(--color-bet-purple-dark)]"
                  >
                    {/* Tool Sidebar/Preview */}
                    <div className={clsx(
                      "w-full lg:w-1/3 p-10 lg:p-16 flex flex-col items-center justify-center text-center relative shrink-0 border-b lg:border-b-0 lg:border-r border-white/10",
                      "bg-gradient-to-b from-white/5 to-transparent"
                    )}>
                      <button 
                        onClick={handleClose}
                        className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black text-purple-200/60 hover:text-[var(--color-supreme-gold)] transition-all border border-white/5 z-10 uppercase tracking-widest"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to GMT
                      </button>
                      {(() => {
                        const tool = tools.find(t => t.id === selectedTool);
                        if (!tool) return null;
                        return (
                          <>
                            <div className={clsx("p-8 rounded-3xl mb-8 shadow-2xl mt-12 lg:mt-0 border border-white/10", tool.bg.replace('bg-', 'bg-opacity-20 bg-'), tool.color)}>
                              <tool.icon className="w-16 h-16" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">{tool.title}</h2>
                            <p className="text-purple-200/40 text-base leading-relaxed font-medium">{tool.desc}</p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Tool Content/Simulation */}
                    <div className="flex-1 p-10 lg:p-16 overflow-y-auto custom-scrollbar">
                      <div className="space-y-12 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                            <Activity className="w-4 h-4" /> Live Simulation
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-purple-200/40 uppercase tracking-[0.2em]">
                            <Zap className="w-4 h-4 text-[var(--color-supreme-gold)]" /> High Precision Mode Active
                          </div>
                        </div>

                        <p className="text-purple-200/60 text-lg leading-relaxed font-medium">
                          {currentTool?.details}
                        </p>

                        {/* State Data Field */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                            <div className="text-[10px] text-purple-200/40 uppercase font-black tracking-widest mb-2">System State</div>
                            <div className="text-sm font-black text-emerald-400 flex items-center gap-2 uppercase">
                              <Activity className="w-4 h-4" /> Nominal
                            </div>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                            <div className="text-[10px] text-purple-200/40 uppercase font-black tracking-widest mb-2">Data Stream</div>
                            <div className="text-sm font-black text-emerald-400 uppercase">Active</div>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                            <div className="text-[10px] text-purple-200/40 uppercase font-black tracking-widest mb-2">Latency</div>
                            <div className="text-sm font-black text-white">14ms</div>
                          </div>
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                            <div className="text-[10px] text-purple-200/40 uppercase font-black tracking-widest mb-2">Security</div>
                            <div className="text-sm font-black text-emerald-400 uppercase">Encrypted</div>
                          </div>
                        </div>

                        {/* Deep Net Security Alert */}
                        {selectedTool === 'deep-net-scanners' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-6 shadow-2xl"
                          >
                            <div className="p-3 rounded-xl bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20">
                              <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="font-black text-red-400 text-base uppercase tracking-tight">Security Alert: Deep Net Breach Detected</h4>
                              <p className="text-sm text-red-200/60 font-medium">An unauthorized attempt to access your scanner node has been blocked. Enhancing firewall protocols.</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Visualization Area */}
                        <div className="aspect-video rounded-[32px] bg-black/40 relative overflow-hidden border border-white/10 shadow-2xl">
                          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                          
                          {/* Scan Progress Bar */}
                          {isScanning && (
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-50">
                              <div 
                                className="h-full bg-[var(--color-supreme-gold)] shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all duration-100 ease-linear"
                                style={{ width: `${scanProgress}%` }}
                              />
                            </div>
                          )}

                          {/* Target Lock Overlay */}
                          {targetLocked && (
                            <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                              <div className="w-48 h-48 border-2 border-red-500 rounded-full animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]" />
                              <div className="absolute w-64 h-px bg-red-500/50" />
                              <div className="absolute h-64 w-px bg-red-500/50" />
                              <div className="absolute top-8 right-8 text-red-500 font-mono text-xs font-black animate-pulse tracking-[0.2em]">
                                TARGET LOCKED
                              </div>
                            </div>
                          )}
                          
                          {/* Space Scanners 3D Visualization */}
                          {selectedTool === 'space-scanners' ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative w-80 h-80">
                                {/* Planet */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-green-900 shadow-[0_0_70px_rgba(16,185,129,0.4)] animate-pulse" />
                                {/* Atmosphere Glow */}
                                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20 blur-md" />
                                
                                {/* Orbiting Objects */}
                                {[1, 2, 3].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0"
                                  >
                                    <div 
                                      className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white]"
                                      style={{ top: `${20 * i}%`, left: '-15px' }}
                                    />
                                  </motion.div>
                                ))}
                                
                                {/* Scanner Beam */}
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 origin-center"
                                >
                                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 border-l border-emerald-500/40 rounded-full -translate-x-1/2 -translate-y-1/2 origin-center" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }} />
                                </motion.div>
                              </div>
                            </div>
                          ) : selectedTool === 'mass-network-tracking' ? (
                            <div className="absolute inset-0 p-10">
                              <div className="grid grid-cols-6 gap-6 h-full">
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0.1 }}
                                    animate={{ 
                                      opacity: [0.1, 0.5, 0.1],
                                      scale: [1, 1.1, 1]
                                    }}
                                    transition={{ 
                                      duration: 2 + Math.random() * 3, 
                                      repeat: Infinity,
                                      delay: Math.random() * 2
                                    }}
                                    className="relative"
                                  >
                                    <div className="w-full h-full rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                                      <Cpu className="w-6 h-6 text-emerald-400/40" />
                                    </div>
                                    {/* Connection Lines */}
                                    {i % 3 === 0 && (
                                      <div className="absolute top-1/2 left-full w-12 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-full border border-emerald-500/20 rounded-full animate-ping opacity-20" />
                                <div className="absolute w-full h-px bg-emerald-500/10 top-1/2" />
                                <div className="absolute h-full w-px bg-emerald-500/10 left-1/2" />
                              </div>

                              {/* Mock Data Points */}
                              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[var(--color-supreme-gold)] rounded-full animate-pulse delay-700 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                            </>
                          )}
                          
                          <div className="absolute bottom-6 left-6 space-y-2">
                            <div className="text-[11px] font-mono text-emerald-400 font-black tracking-widest">LAT: 34.0522 N</div>
                            <div className="text-[11px] font-mono text-emerald-400 font-black tracking-widest">LNG: 118.2437 W</div>
                          </div>

                          <div className="absolute top-6 right-6 flex gap-3">
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-lg">Tracking</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <button 
                            onClick={() => setTargetLocked(!targetLocked)}
                            className={clsx(
                              "flex items-center justify-center gap-3 p-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl text-sm",
                              targetLocked 
                                ? "bg-red-500 text-white shadow-red-500/30" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                            )}
                          >
                            <Target className={clsx("w-6 h-6", targetLocked && "animate-pulse")} /> 
                            {targetLocked ? "Target Locked" : "Lock Target"}
                          </button>
                          <button 
                            onClick={() => {
                              const layers = ['Standard', 'Thermal', 'Electromagnetic', 'Topographic'];
                              const currentIndex = layers.indexOf(activeLayer);
                              setActiveLayer(layers[(currentIndex + 1) % layers.length]);
                            }}
                            className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 shadow-xl text-sm"
                          >
                            <Layers className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Layer: {activeLayer}
                          </button>
                          <button 
                            onClick={() => {
                              setIsScanning(true);
                              setScanProgress(0);
                            }}
                            disabled={isScanning}
                            className={clsx(
                              "flex items-center justify-center gap-3 p-5 rounded-2xl font-black uppercase tracking-widest transition-all text-sm",
                              isScanning 
                                ? "bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)] cursor-not-allowed border border-[var(--color-supreme-gold)]/30" 
                                : "bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold-light)] shadow-2xl shadow-yellow-900/20"
                            )}
                          >
                            <Search className={clsx("w-6 h-6", isScanning && "animate-spin")} /> 
                            {isScanning ? `Scanning... ${scanProgress}%` : "Run Deep Scan"}
                          </button>
                        </div>

                        <div className="p-6 rounded-2xl bg-[var(--color-supreme-gold)]/5 border border-[var(--color-supreme-gold)]/20 flex gap-5 shadow-xl">
                          <Shield className="w-6 h-6 text-[var(--color-supreme-gold)] shrink-0" />
                          <p className="text-xs text-purple-200/60 leading-relaxed font-medium">
                            <strong className="text-[var(--color-supreme-gold)] uppercase tracking-widest mr-2">Security Notice:</strong> All data retrieved through Supreme GMT is encrypted and logged for security purposes. Unauthorized distribution of surveillance data is strictly prohibited.
                          </p>
                        </div>

                        {/* Quick Navigation to other Supreme Features */}
                        <div className="pt-10 border-t border-white/10">
                          <h4 className="text-[10px] font-black text-purple-200/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5" /> Quick Navigation
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link to="/insight" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-[var(--color-supreme-gold)]/10 hover:border-[var(--color-supreme-gold)]/20 transition-all group">
                              <Newspaper className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                              <span className="text-[10px] font-black text-purple-200/60 group-hover:text-[var(--color-supreme-gold)] uppercase tracking-widest">Insight</span>
                            </Link>
                            <Link to="/supreme-core" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                              <Cpu className="w-5 h-5 text-blue-400" />
                              <span className="text-[10px] font-black text-purple-200/60 group-hover:text-blue-400 uppercase tracking-widest">Core</span>
                            </Link>
                            <Link to="/supreme-mode" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all group">
                              <ZapIcon className="w-5 h-5 text-purple-400" />
                              <span className="text-[10px] font-black text-purple-200/60 group-hover:text-purple-400 uppercase tracking-widest">Mode</span>
                            </Link>
                            <Link to="/supreme-users" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group">
                              <Users className="w-5 h-5 text-emerald-400" />
                              <span className="text-[10px] font-black text-purple-200/60 group-hover:text-emerald-400 uppercase tracking-widest">Users</span>
                            </Link>
                          </div>
                        </div>

                        <div className="pt-10 flex justify-end">
                          <button 
                            onClick={handleClose}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-[var(--color-supreme-gold)] text-white font-black uppercase tracking-widest hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-2xl shadow-yellow-900/20 text-sm"
                          >
                            <ArrowLeft className="w-5 h-5" /> Back to GMT Dashboard
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[var(--color-bet-purple-dark)] rounded-[40px] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                  <SettingsIcon className="w-6 h-6 text-[var(--color-supreme-gold)]" /> GMT Settings
                </h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-purple-200/40 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-purple-200/40 flex items-center gap-3 uppercase tracking-[0.2em]">
                    <Volume2 className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Voice Assistant Voice
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateSettings({ voiceType: 'female' })}
                      className={clsx(
                        "p-6 rounded-2xl border-2 transition-all text-center group",
                        settings.voiceType === 'female' 
                          ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" 
                          : "border-white/5 bg-white/5 hover:border-white/10 text-purple-200/40"
                      )}
                    >
                      <div className="font-black mb-1 uppercase tracking-widest">Female</div>
                      <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Default</div>
                    </button>
                    <button
                      onClick={() => updateSettings({ voiceType: 'male' })}
                      className={clsx(
                        "p-6 rounded-2xl border-2 transition-all text-center group",
                        settings.voiceType === 'male' 
                          ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" 
                          : "border-white/5 bg-white/5 hover:border-white/10 text-purple-200/40"
                      )}
                    >
                      <div className="font-black mb-1 uppercase tracking-widest">Male</div>
                      <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Deep Voice</div>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-supreme-gold)]/5 border border-[var(--color-supreme-gold)]/20 flex gap-4 shadow-xl">
                  <Shield className="w-6 h-6 text-[var(--color-supreme-gold)] shrink-0" />
                  <p className="text-xs text-purple-200/60 leading-relaxed font-medium">
                    Settings are saved locally to your device. Voice changes apply to all Supreme GMT audio feedback.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-white/5 border-t border-white/10">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 rounded-2xl bg-[var(--color-supreme-gold)] text-white font-black uppercase tracking-widest hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-2xl shadow-yellow-900/20"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
