import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { 
  Rocket, Users, DollarSign, LayoutDashboard, Bot, Globe, 
  Plus, Search, Filter, ChevronRight, CheckCircle2, Clock, 
  Target, Briefcase, FileText, Video, MessageSquare, TrendingUp,
  Sparkles, Zap, PieChart, BarChart3, Activity, Loader2,
  Star, ArrowRight, Mail, Link, File, Calendar, MoreVertical, PlayCircle, Pause, Play, XCircle,
  TrendingDown, X, CreditCard, Wallet, Lock, ShieldCheck, ArrowLeft, Send, Download,
  CheckSquare, Paperclip, PhoneCall, Mic, MicOff, VideoOff, MonitorUp,
  Megaphone, UserPlus, Brain, HelpCircle, Trophy, Timer, Share2, UserCheck, Puzzle, FastForward,
  Gift, Coins, Trash2, UserMinus, Crown, Layers, Cpu, Gamepad2, Leaf, AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSound } from '../context/SoundContext';

interface Project {
  id: number;
  name: string;
  category: string;
  raisedAmount: number;
  fundingGoal: number;
  withdrawalThreshold?: number;
  team: number;
  location: string;
  stage: string;
  popularity: number;
  image: string;
  createdAt: string;
  description: string;
  teamMembers?: any[];
  activity?: any[];
  transferHistory?: { id: string, amount: number, type: 'withdrawal' | 'funding', date: string }[];
}

type TabId = 'dashboard' | 'create' | 'team' | 'funding' | 'ai' | 'discover' | 'riddles' | 'games' | 'million-deals' | 'million-draw' | 'admin';

export default function ProjectPower() {
  const { profile } = useAuth();
  const { deposit } = useWallet();
  const [activeTab, setActiveTab] = useState<TabId>('discover');
  const [isLoading, setIsLoading] = useState(true);
  const [supremeEarnings, setSupremeEarnings] = useState(() => {
    const saved = localStorage.getItem('supreme_project_earnings');
    return saved ? parseFloat(saved) : 0;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('supreme_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { 
        id: 1, 
        name: 'EcoTrack Mobile App', 
        category: 'Tech', 
        raisedAmount: 42500, 
        fundingGoal: 50000, 
        team: 4, 
        location: 'Global', 
        stage: 'Seed', 
        popularity: 95, 
        image: 'https://picsum.photos/seed/eco/600/400', 
        createdAt: '2024-03-01',
        description: 'A comprehensive mobile application designed to help individuals and businesses track their carbon footprint in real-time.',
        teamMembers: [
          { id: 1, name: 'Alex Rivera', role: 'Founder & CEO', avatar: 'https://i.pravatar.cc/150?u=alex', status: 'online' },
          { id: 2, name: 'Sarah Chen', role: 'Lead Developer', avatar: 'https://i.pravatar.cc/150?u=sarah', status: 'in-meeting' },
          { id: 3, name: 'Marcus Wright', role: 'UX Designer', avatar: 'https://i.pravatar.cc/150?u=marcus', status: 'offline' },
        ],
        activity: [
          { id: 1, user: 'Alex Rivera', action: 'updated the pitch deck', time: '2 hours ago' },
          { id: 2, user: 'Sarah Chen', action: 'pushed 4 commits to main', time: '5 hours ago' },
          { id: 3, user: 'Marcus Wright', action: 'shared new wireframes', time: 'Yesterday' },
        ]
      },
      { 
        id: 2, 
        name: 'NextGen AI Assistant', 
        category: 'AI Tools', 
        raisedAmount: 120000, 
        fundingGoal: 100000, 
        team: 8, 
        location: 'USA', 
        stage: 'Series A', 
        popularity: 98, 
        image: 'https://picsum.photos/seed/ai/600/400', 
        createdAt: '2024-03-05',
        description: 'The next generation of AI assistants, capable of complex reasoning and multi-modal interactions.',
        teamMembers: [
          { id: 4, name: 'Dr. Emily Watson', role: 'AI Research Lead', avatar: 'https://i.pravatar.cc/150?u=emily', status: 'online' },
          { id: 5, name: 'James Kim', role: 'Backend Engineer', avatar: 'https://i.pravatar.cc/150?u=james', status: 'online' },
        ],
        activity: [
          { id: 1, user: 'Dr. Emily Watson', action: 'published new research paper', time: '1 day ago' },
          { id: 2, user: 'James Kim', action: 'optimized database queries', time: '3 days ago' },
        ]
      },
      { id: 3, name: 'Urban Farm Initiative', category: 'Community', raisedAmount: 11250, fundingGoal: 25000, team: 12, location: 'UK', stage: 'Pre-Seed', popularity: 75, image: 'https://picsum.photos/seed/farm/600/400', createdAt: '2024-02-20', description: 'Bringing sustainable farming to urban environments through community-led initiatives.' },
      { id: 4, name: 'Indie Game: Neon Nights', category: 'Gaming', raisedAmount: 1500, fundingGoal: 10000, team: 2, location: 'Japan', stage: 'Pre-Seed', popularity: 60, image: 'https://picsum.photos/seed/neon/600/400', createdAt: '2024-03-10', description: 'A fast-paced cyberpunk action game with a unique neon aesthetic.' },
      { id: 5, name: 'Quantum Compute API', category: 'Deep Tech', raisedAmount: 1500000, fundingGoal: 500000, team: 15, location: 'Switzerland', stage: 'Series B', popularity: 99, image: 'https://picsum.photos/seed/quantum/600/400', createdAt: '2024-01-15', description: 'Providing accessible APIs for quantum computing resources.' },
      { id: 6, name: 'Sustainable Packaging', category: 'Green', raisedAmount: 69000, fundingGoal: 75000, team: 6, location: 'Canada', stage: 'Seed', popularity: 88, image: 'https://picsum.photos/seed/package/600/400', createdAt: '2024-03-12', description: 'Eco-friendly packaging solutions for modern e-commerce.' },
    ];
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0]);

  useEffect(() => {
    localStorage.setItem('supreme_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('supreme_project_earnings', supremeEarnings.toString());
  }, [supremeEarnings]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Project', icon: Rocket },
    { id: 'team', label: 'Power Team', icon: Users },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'discover', label: 'Discover', icon: Globe },
    { id: 'riddles', label: 'Riddle Game', icon: Brain },
    { id: 'games', label: 'Supreme Games', icon: Trophy },
    { id: 'million-deals', label: 'Million Deals', icon: Coins },
    { id: 'million-draw', label: 'Million Draw', icon: Gift },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full border-t-4 border-[var(--color-supreme-gold)] opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-[var(--color-supreme-gold)] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-[var(--color-supreme-gold)]" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-text)] mb-2">Initializing Project Power</h2>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading modules...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden border border-[var(--color-supreme-gold)]/20 shadow-[0_0_30px_rgba(184,134,11,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-supreme-gold)]/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-supreme-gold)]/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[var(--color-supreme-gold)]/20 rounded-2xl backdrop-blur-md border border-[var(--color-supreme-gold)]/30">
              <Rocket className="w-8 h-8 text-[var(--color-supreme-gold)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-200">Project Power</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
            Turn ideas into powerful projects. Build, manage, fund, and promote your vision globally with our all-in-one platform.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-supreme-gold)]/20"
            >
              <Plus className="w-5 h-5" /> Start a Project
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className="px-6 py-3 bg-white/5 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/30 rounded-xl font-bold hover:bg-[var(--color-supreme-gold)]/10 transition-colors flex items-center gap-2 backdrop-blur-md"
            >
              <Globe className="w-5 h-5" /> Explore Projects
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" 
                : "text-gray-500 hover:text-[var(--color-supreme-text)] hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'discover' && (
              <DiscoverProjects 
                projects={projects} 
                onSelectProject={(p) => {
                  setSelectedProject(p);
                  setActiveTab('dashboard');
                }} 
              />
            )}
            {activeTab === 'create' && (
              <ProjectCreator 
                onLaunch={(newProject) => {
                  setProjects(prev => [newProject, ...prev]);
                  setSelectedProject(newProject);
                  setActiveTab('dashboard');
                }} 
              />
            )}
            {activeTab === 'dashboard' && <ProjectDashboard project={selectedProject} />}
            {activeTab === 'team' && <PowerTeam project={selectedProject} />}
            {activeTab === 'funding' && (
              <PowerFunding 
                project={selectedProject} 
                onFund={(amount) => {
                  if (selectedProject) {
                    const supremeCut = amount * 0.1;
                    const projectAmount = amount * 0.9;
                    const newHistory: any = [
                      { id: Math.random().toString(36).substr(2, 9), amount: projectAmount, type: 'funding', date: new Date().toISOString() },
                      ...(selectedProject.transferHistory || [])
                    ].slice(0, 50);
                    const updatedProject = { 
                      ...selectedProject, 
                      raisedAmount: selectedProject.raisedAmount + projectAmount,
                      transferHistory: newHistory
                    };
                    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
                    setSelectedProject(updatedProject);
                    setSupremeEarnings(prev => prev + supremeCut);
                    toast.success(`Funded! $${projectAmount.toLocaleString()} added to project. $${supremeCut.toLocaleString()} Supreme fee applied.`);
                  }
                }}
                onWithdraw={async (amount) => {
                  if (selectedProject && selectedProject.raisedAmount >= amount) {
                    const newHistory: any = [
                      { id: Math.random().toString(36).substr(2, 9), amount: amount, type: 'withdrawal', date: new Date().toISOString() },
                      ...(selectedProject.transferHistory || [])
                    ].slice(0, 50);
                    const updatedProject = { 
                      ...selectedProject, 
                      raisedAmount: selectedProject.raisedAmount - amount,
                      transferHistory: newHistory
                    };
                    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
                    setSelectedProject(updatedProject);
                    await deposit(amount, 'Project Power', `Withdrawal from ${selectedProject.name}`);
                    toast.success(`Successfully withdrawn $${amount.toLocaleString()} to central wallet.`);
                  } else {
                    toast.error('Insufficient project funds');
                  }
                }}
              />
            )}
            {activeTab === 'ai' && <AIAssistant project={selectedProject} />}
            {activeTab === 'riddles' && <RiddleGame />}
            {activeTab === 'games' && <SupremeGames />}
            {activeTab === 'million-deals' && <MillionDeals />}
            {activeTab === 'million-draw' && <MillionDraw />}
            {activeTab === 'admin' && <AdminDashboard supremeEarnings={supremeEarnings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SupremeGames() {
  const [activeGameTab, setActiveGameTab] = useState<'lobby' | 'chess' | 'cards' | 'draft' | 'wallet'>('lobby');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchmakingGame, setMatchmakingGame] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(1000);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isStakePaused, setIsStakePaused] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStakeOption, setSelectedStakeOption] = useState<number | null>(null);
  const [stakingHistory, setStakingHistory] = useState<{game: string, amount: number, time: string}[]>([]);
  const [selectedGameForPreview, setSelectedGameForPreview] = useState<any>(null);

  const stakeOptions = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  const handleStake = (amount: number, game: string = 'Chess') => {
    if (isStakePaused) {
      toast.error("Staking is currently paused by the Council.");
      return;
    }
    if (isPracticeMode) {
      toast.info("You are in Practice Mode. No real stakes will be placed.");
      return;
    }
    if (walletBalance >= amount) {
      setWalletBalance(prev => prev - amount);
      setStakedAmount(prev => prev + amount);
      setIsStaking(true);
      setStakingHistory(prev => [{game, amount, time: 'Just now'}, ...prev]);
    } else {
      toast.error("Insufficient balance in your Supreme Wallet.");
    }
  };

  const handleWithdraw = (amount: number) => {
    if (stakedAmount >= amount) {
      setStakedAmount(prev => prev - amount);
      setWalletBalance(prev => prev + amount);
      if (stakedAmount - amount === 0) setIsStaking(false);
    }
  };

  const handleCancelStake = () => {
    if (stakedAmount > 0) {
      setWalletBalance(prev => prev + stakedAmount);
      setStakedAmount(0);
      setIsStaking(false);
      setStakingHistory(prev => [{game: 'Stake Cancelled', amount: stakedAmount, time: 'Just now'}, ...prev]);
    }
  };

  const handleTogglePauseStake = () => {
    setIsStakePaused(!isStakePaused);
  };

  const enterArena = (gameId: string) => {
    setMatchmakingGame(gameId);
    setIsMatchmaking(true);
    setTimeout(() => {
      setIsMatchmaking(false);
      setActiveGameTab(gameId as any);
      setMatchmakingGame(null);
    }, 3000);
  };

  const enterFreeMode = (gameId: string) => {
    setIsPracticeMode(true);
    enterArena(gameId);
  };

  if (isMatchmaking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-black rounded-3xl border border-[var(--color-supreme-gold)]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-supreme-gold)_0%,_transparent_70%)] opacity-5"></div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full border-4 border-[var(--color-supreme-gold)] border-t-transparent animate-spin mb-8"
        />
        <h2 className="text-3xl font-display font-bold text-[var(--color-supreme-gold)] mb-2 uppercase tracking-widest">Matchmaking</h2>
        <p className="text-gray-400 animate-pulse">Finding elite opponents for {matchmakingGame?.replace('chess', 'Supreme Chess').replace('cards', 'Elite Cards').replace('draft', 'Pro Draft')}...</p>
        
        <div className="mt-12 flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header & Wallet Info */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-xl text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-supreme-gold)] mb-1">Supreme Gaming Zone</h2>
            <p className="text-gray-400 text-sm">Stake, Play, and Conquer your territory.</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => setIsPracticeMode(!isPracticeMode)}
                className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                  isPracticeMode 
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                    : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                )}
              >
                {isPracticeMode ? 'Practice Mode: ON' : 'Practice Mode: OFF'}
              </button>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Wallet Balance</p>
            <div className="flex items-center gap-2 justify-end">
              <Wallet className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              <span className="text-2xl font-bold">${walletBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
          {isStaking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"
            />
          )}
          <div className="text-center relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Staked</p>
            <div className={clsx(
              "flex items-center gap-2 justify-center text-2xl font-bold transition-colors",
              isStaking ? "text-green-600" : "text-gray-400"
            )}>
              <Lock className={clsx("w-5 h-5", isStaking && "animate-bounce")} />
              <span>${stakedAmount.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveGameTab('wallet')}
            className="px-6 py-3 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-xl font-bold hover:bg-[var(--color-supreme-gold)]/20 transition-all flex items-center gap-2 relative z-10"
          >
            <Plus className="w-4 h-4" /> Fund Wallet
          </button>
        </div>
      </div>

      {/* Live Matches Ticker */}
      <div className="bg-gray-900 text-white py-2 px-4 rounded-xl mb-8 overflow-hidden relative">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-2 text-xs font-bold text-[var(--color-supreme-gold)] uppercase tracking-widest">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Matches
          </span>
          {[
            "Grandmaster X vs. Shadow (Chess) - $500 Pot",
            "Elite Player vs. Dealer (Cards) - $1,200 Pot",
            "Team Alpha vs. Team Beta (Draft) - $10,000 Prize",
            "User123 just won $250 in Supreme Poker",
            "New Tournament starting in 15 minutes",
          ].map((match, i) => (
            <span key={i} className="text-xs text-gray-400 font-medium border-l border-gray-700 pl-4">
              {match}
            </span>
          ))}
        </div>
      </div>

      {/* Game Navigation */}
      <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto hide-scrollbar">
        {[
          { id: 'lobby', label: 'Game Lobby', icon: LayoutDashboard },
          { id: 'chess', label: 'Supreme Chess', icon: Trophy },
          { id: 'cards', label: 'Elite Cards', icon: CreditCard },
          { id: 'draft', label: 'Pro Draft', icon: Target },
          { id: 'wallet', label: 'Wallet & Staking', icon: Wallet },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGameTab(tab.id as any)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
              activeGameTab === tab.id 
                ? "bg-[var(--color-supreme-gold)] text-black shadow-md" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGameTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeGameTab === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'chess', title: 'Supreme Chess', desc: 'The ultimate strategy game. Challenge masters.', icon: Trophy, players: 1240, minStake: 10, preview: 'https://picsum.photos/seed/chess/800/450' },
                  { id: 'cards', title: 'Elite Cards', desc: 'Poker, Blackjack, and more. Play with high rollers.', icon: CreditCard, players: 850, minStake: 50, preview: 'https://picsum.photos/seed/cards/800/450' },
                  { id: 'draft', title: 'Pro Draft', desc: 'Build your dream team and compete in leagues.', icon: Target, players: 2100, minStake: 25, preview: 'https://picsum.photos/seed/draft/800/450' },
                ].map(game => (
                  <div key={game.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                    <div 
                      onClick={() => setSelectedGameForPreview(game)}
                      className="cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[var(--color-supreme-gold)]/10 transition-colors">
                        <game.icon className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
                      <p className="text-sm text-gray-500 mb-6">{game.desc}</p>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <Users className="w-4 h-4" /> {game.players} Online
                        </div>
                        <div className="text-xs font-bold text-[var(--color-supreme-gold)]">
                          Min Stake: ${game.minStake}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto space-y-2">
                      <button 
                        onClick={() => enterArena(game.id)}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Enter Arena
                      </button>
                      <button 
                        onClick={() => enterFreeMode(game.id)}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
                      >
                        Practice Free Mode
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeGameTab === 'chess' && (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                {isPracticeMode && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2 text-blue-600 text-sm font-bold">
                    <Brain className="w-4 h-4" /> Practice Mode Active: No stakes will be deducted.
                  </div>
                )}
                <Trophy className="w-16 h-16 text-[var(--color-supreme-gold)] mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Supreme Chess Arena</h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-8">
                  Welcome to the grandmaster's court. Stake your claim and outsmart your opponents in real-time matches.
                </p>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase mb-4">Select Staking Amount</p>
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {stakeOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSelectedStakeOption(opt)}
                          className={clsx(
                            "py-2 rounded-lg text-xs font-bold transition-all border",
                            selectedStakeOption === opt 
                              ? "bg-[var(--color-supreme-gold)] text-black border-[var(--color-supreme-gold)]" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-[var(--color-supreme-gold)]"
                          )}
                        >
                          ${opt}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => selectedStakeOption && handleStake(selectedStakeOption, 'Chess')}
                      disabled={!selectedStakeOption}
                      className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Stake & Play
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold hover:border-[var(--color-supreme-gold)] transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Invite Opponent
                  </button>
                </div>
              </div>
            )}

            {activeGameTab === 'cards' && (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                {isPracticeMode && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2 text-blue-600 text-sm font-bold">
                    <Brain className="w-4 h-4" /> Practice Mode Active: No stakes will be deducted.
                  </div>
                )}
                <CreditCard className="w-16 h-16 text-[var(--color-supreme-gold)] mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Elite Card Room</h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-8">
                  High stakes, high rewards. Join the table for Poker, Blackjack, and exclusive Supreme Card games.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { name: 'Supreme Poker', desc: "Texas Hold'em with a luxury twist.", players: 12, tables: 4 },
                    { name: 'Elite Blackjack', desc: 'Beat the dealer and win big.', players: 8, tables: 2 },
                    { name: 'Supreme Baccarat', desc: 'The game of kings and high rollers.', players: 5, tables: 1 },
                    { name: 'Power Roulette', desc: 'Spin the wheel of fortune.', players: 24, tables: 3 }
                  ].map((game, i) => (
                    <div key={game.name} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-left hover:border-[var(--color-supreme-gold)]/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{game.name}</h4>
                          <p className="text-xs text-gray-500">{game.desc}</p>
                        </div>
                        <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase">
                          {game.players} Active
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(j => (
                            <img key={j} src={`https://picsum.photos/seed/u${j+i}/32`} className="w-6 h-6 rounded-full border-2 border-white" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">+{game.players - 3} others</span>
                      </div>
                      <button className="w-full py-2 bg-black text-white rounded-lg text-sm font-bold group-hover:bg-[var(--color-supreme-gold)] group-hover:text-black transition-all">
                        Join Table ({game.tables} Available)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeGameTab === 'draft' && (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                {isPracticeMode && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2 text-blue-600 text-sm font-bold">
                    <Brain className="w-4 h-4" /> Practice Mode Active: No stakes will be deducted.
                  </div>
                )}
                <Target className="w-16 h-16 text-[var(--color-supreme-gold)] mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Pro Draft League</h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-8">
                  Build your ultimate team, manage your roster, and compete in the Supreme Draft League for massive prizes.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-700">Active Season</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Live</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                      <span>League</span>
                      <span>Prize Pool</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                      <span className="font-bold text-sm">Supreme Masters</span>
                      <span className="font-bold text-sm text-[var(--color-supreme-gold)]">$50,000</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 bg-[var(--color-supreme-gold)] text-black rounded-xl font-bold">Enter Draft</button>
                </div>
              </div>
            )}

            {activeGameTab === 'wallet' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Supreme Game Wallet
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Available Funds</p>
                      <p className="text-3xl font-display font-bold text-gray-900">${walletBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Staked in Games</p>
                      <p className="text-3xl font-display font-bold text-green-600">${stakedAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" /> Deposit Funds
                    </button>
                    <button className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold hover:border-gray-900 transition-colors flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" /> Withdraw to Main Account
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" /> Staking Council Controls
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Manage your active stakes with supreme authority. Pause or cancel your commitments at any time.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleTogglePauseStake}
                      className={clsx(
                        "py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2",
                        isStakePaused 
                          ? "bg-orange-50 border-orange-200 text-orange-600" 
                          : "bg-white border-gray-100 text-gray-900 hover:border-orange-200"
                      )}
                    >
                      {isStakePaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      {isStakePaused ? 'Resume Staking' : 'Pause Staking'}
                    </button>
                    <button 
                      onClick={handleCancelStake}
                      disabled={stakedAmount === 0}
                      className="py-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" /> Cancel All Stakes
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Staking History</h4>
                  <div className="space-y-3">
                    {stakingHistory.length > 0 ? (
                      stakingHistory.map((tx, i) => (
                        <div key={tx.time + i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-l-4 border-green-500">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Stake ({tx.game})</p>
                              <p className="text-[10px] text-gray-400">{tx.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">-${tx.amount}</p>
                            <p className="text-[10px] text-gray-400">Locked</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-400 py-4">No active stakes.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Wallet Transactions</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'Deposit', amount: 500, date: 'Today', status: 'Completed' },
                      { type: 'Stake (Chess)', amount: -50, date: 'Yesterday', status: 'Active' },
                      { type: 'Win (Cards)', amount: 120, date: '2 days ago', status: 'Completed' },
                    ].map((tx, i) => (
                      <div key={tx.type + i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          )}>
                            {tx.amount > 0 ? <Plus className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{tx.type}</p>
                            <p className="text-[10px] text-gray-400">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={clsx("text-sm font-bold", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </p>
                          <p className="text-[10px] text-gray-400">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Game Preview Modal */}
      <AnimatePresence>
        {selectedGameForPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedGameForPreview(null)}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>

              <div className="aspect-video bg-gray-900 relative">
                <img 
                  src={selectedGameForPreview.preview} 
                  alt={selectedGameForPreview.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/30 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase tracking-widest">4K Ultra HD</span>
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase tracking-widest">Live Preview</span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">{selectedGameForPreview.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <Users className="w-4 h-4" /> {selectedGameForPreview.players} Active Players
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-supreme-gold)]">
                        <Trophy className="w-4 h-4" /> Pro League Available
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entry Fee</p>
                    <p className="text-xl font-bold text-gray-900">From ${selectedGameForPreview.minStake}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  {selectedGameForPreview.desc} Experience the most advanced {selectedGameForPreview.title.toLowerCase()} platform with real-time physics, global matchmaking, and secure staking. Join the elite community of players today.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      enterArena(selectedGameForPreview.id);
                      setSelectedGameForPreview(null);
                    }}
                    className="py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Enter Arena Now
                  </button>
                  <button 
                    onClick={() => {
                      enterFreeMode(selectedGameForPreview.id);
                      setSelectedGameForPreview(null);
                    }}
                    className="py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:border-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Brain className="w-5 h-5 text-blue-500" /> Try Free Mode
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 border border-[var(--color-supreme-gold)]/20 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--color-supreme-gold)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Invite Opponent</h3>
                <p className="text-gray-500 text-sm mt-2">Challenge users in your territory or across the globe.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by username or ID..." 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase ml-2">Suggested Opponents</p>
                  {[
                    { name: 'Grandmaster_X', territory: 'Your Territory', rank: 'Diamond' },
                    { name: 'StrategyPro', territory: 'Your Territory', rank: 'Platinum' },
                    { name: 'ChessKing', territory: 'Elite Zone', rank: 'Gold' },
                    { name: 'QueenGambit', territory: 'Tech Hub', rank: 'Diamond' },
                  ].map((user, i) => (
                    <div key={user.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-500">{user.territory} • {user.rank}</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectDetailsView({ project, onBack }: { project: any, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');

  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Invite sent to ${inviteEmail} as ${inviteRole}`);
    setIsInviting(false);
    setInviteEmail('');
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Member Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden border border-[var(--color-supreme-gold)]/20"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-4">
                  <img src={selectedMember.avatar} className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl" alt="" />
                  <div className={clsx(
                    "absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white",
                    selectedMember.status === 'online' ? "bg-green-500" : "bg-gray-400"
                  )}></div>
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900">{selectedMember.name}</h3>
                <p className="text-[var(--color-supreme-gold)] font-bold uppercase tracking-widest text-sm">{selectedMember.role}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Projects</p>
                  <p className="text-xl font-bold text-gray-900">12</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Impact</p>
                  <p className="text-xl font-bold text-gray-900">98%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rank</p>
                  <p className="text-xl font-bold text-gray-900">Elite</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Recent Project Activity
                </h4>
                <div className="space-y-3">
                  {[
                    'Merged 4 pull requests in Core API',
                    'Updated project documentation',
                    'Resolved 2 critical security vulnerabilities'
                  ].map((act, i) => (
                    <div key={act} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5 shrink-0"></div>
                      {act}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Send Message
                </button>
                <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="relative h-64">
        <img src={project.image} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-colors border border-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[var(--color-supreme-gold)] text-black text-xs font-bold rounded-full uppercase tracking-wider">{project.category}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">{project.stage}</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white">{project.name}</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg">
              Back Project
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-white/30 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 flex px-8">
        {['Overview', 'Team', 'Funding', 'Activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={clsx(
              "px-6 py-4 text-sm font-bold transition-all relative",
              activeTab === tab.toLowerCase() ? "text-[var(--color-supreme-gold)]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-supreme-gold)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Project</h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Raised</p>
                  <p className="text-xl font-bold text-gray-900">${project.raisedAmount?.toLocaleString() || project.raised}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Goal</p>
                  <p className="text-xl font-bold text-gray-900">${project.fundingGoal?.toLocaleString() || project.goal}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Backers</p>
                  <p className="text-xl font-bold text-gray-900">342</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Project Stats</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-bold text-gray-900">{project.location || 'Global'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Team Size</span>
                    <span className="text-sm font-bold text-gray-900">{project.team || 1} members</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Popularity</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-gray-900">{project.popularity || 100}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Power Team</h3>
                <p className="text-sm text-gray-500">The brilliant minds behind {project.name}</p>
              </div>
              <button 
                onClick={() => setIsInviting(true)}
                className="px-4 py-2 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[var(--color-supreme-gold-light)] transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Invite Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.teamMembers?.map((member: any) => (
                <div key={member.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img src={member.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                      <div className={clsx(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                        member.status === 'online' ? "bg-green-500" : member.status === 'in-meeting' ? "bg-blue-500" : "bg-gray-400"
                      )}></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-400 uppercase">Contribution</span>
                      <span className="text-[var(--color-supreme-gold)]">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-supreme-gold)] h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                      <Activity className="w-3 h-3" /> 12 actions this week
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[var(--color-supreme-gold)] transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!project.teamMembers && (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No team members listed yet.</p>
                </div>
              )}
            </div>

            {isInviting && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--color-supreme-gold)]/20"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900">Invite Team Member</h3>
                      <p className="text-sm text-gray-500">Send an invitation to join the project team.</p>
                    </div>
                    <button onClick={() => setIsInviting(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@example.com" 
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select 
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none appearance-none transition-all"
                        >
                          <option>Developer</option>
                          <option>Designer</option>
                          <option>Marketing</option>
                          <option>Product Manager</option>
                          <option>Legal</option>
                          <option>Investor</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        type="submit"
                        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
                      >
                        Send Invitation <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Funding Progress</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-4xl font-display font-bold text-gray-900">${project.raisedAmount?.toLocaleString() || project.raised}</p>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Raised of ${project.fundingGoal?.toLocaleString() || project.goal} Goal</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">
                          {Math.round(((project.raisedAmount || parseInt(project.raised?.replace(/[^0-9.]/g, '') || '0')) / (project.fundingGoal || parseInt(project.goal?.replace(/[^0-9.]/g, '') || '1'))) * 100)}%
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Funded</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.round(((project.raisedAmount || parseInt(project.raised?.replace(/[^0-9.]/g, '') || '0')) / (project.fundingGoal || parseInt(project.goal?.replace(/[^0-9.]/g, '') || '1'))) * 100), 100)}%` }}
                        className="bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-400 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Funding Sources</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Angel Investors', amount: '$150k', percent: 60, color: 'bg-blue-500' },
                      { name: 'Crowdfunding', amount: '$65k', percent: 25, color: 'bg-green-500' },
                      { name: 'Venture Capital', amount: '$25k', percent: 15, color: 'bg-purple-500' },
                    ].map(source => (
                      <div key={source.name} className="flex items-center gap-4">
                        <div className={clsx("w-3 h-3 rounded-full", source.color)}></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm font-bold mb-1">
                            <span className="text-gray-700">{source.name}</span>
                            <span className="text-gray-900">{source.amount}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full", source.color)} style={{ width: `${source.percent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black p-6 rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-xl text-white">
                  <h4 className="font-bold text-[var(--color-supreme-gold)] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Investor Perks
                  </h4>
                  <div className="space-y-4">
                    {[
                      { level: 'Bronze', min: '$100', perk: 'Early access + Badge' },
                      { level: 'Silver', min: '$500', perk: 'Limited edition kit' },
                      { level: 'Gold', min: '$2,500', perk: 'Dinner with founders' },
                    ].map(perk => (
                      <div key={perk.level} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold">{perk.level}</span>
                          <span className="text-xs font-bold text-[var(--color-supreme-gold)]">Min {perk.min}</span>
                        </div>
                        <p className="text-xs text-gray-400">{perk.perk}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors">
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {project.activity?.map((item: any) => (
                <div key={item.id} className="flex gap-4 relative">
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-100"></div>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-supreme-gold)]/10 flex items-center justify-center shrink-0 border border-[var(--color-supreme-gold)]/20">
                    <Activity className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">{item.user}</span> {item.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
              {!project.activity && (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No recent activity recorded.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BoostProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleBoost = () => {
    if (!selectedTier) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  const tiers = [
    { id: 'bronze', name: 'Bronze Boost', duration: '24 Hours', multiplier: '2x Visibility', price: '$49', icon: Activity, color: 'from-orange-400 to-orange-600' },
    { id: 'silver', name: 'Silver Boost', duration: '3 Days', multiplier: '5x Visibility', price: '$129', icon: Zap, color: 'from-gray-300 to-gray-500' },
    { id: 'supreme', name: 'Supreme Boost', duration: '7 Days', multiplier: '10x Visibility + Leaderboard', price: '$299', icon: Crown, color: 'from-[var(--color-supreme-gold)] to-yellow-600' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Rocket className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-2">Power Boost</h2>
              <p className="text-gray-400 max-w-md">Accelerate your project's growth by reaching thousands of active investors and supreme connectors.</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Boost Activated!</h3>
                <p className="text-gray-500">Your project is now being featured across the Supreme Network.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tiers.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={clsx(
                        "relative p-6 rounded-2xl border-2 text-left transition-all flex flex-col h-full",
                        selectedTier === tier.id 
                          ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/5 shadow-md scale-[1.02]" 
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {tier.id === 'supreme' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-[var(--color-supreme-gold)] text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                          Most Popular
                        </div>
                      )}
                      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white bg-gradient-to-br", tier.color)}>
                        <tier.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{tier.name}</h4>
                      <div className="text-2xl font-display font-bold text-gray-900 mb-4">{tier.price}</div>
                      
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {tier.duration}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <TrendingUp className="w-3.5 h-3.5 text-[var(--color-supreme-gold)]" /> {tier.multiplier}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Supreme Guarantee</p>
                    <p className="text-xs text-gray-500 mt-1">If your project doesn't receive at least a 20% increase in views within the boost period, we'll extend it for free.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleBoost}
                disabled={!selectedTier || isProcessing}
                className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><Rocket className="w-5 h-5" /> Activate Boost</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DiscoverProjects({ projects, onSelectProject }: { projects: Project[], onSelectProject: (p: Project) => void }) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  const featuredProject = {
    name: 'Aura: The Next-Gen Smart Ring',
    category: 'Wearables',
    funding: '240%',
    goal: '$100k',
    raised: '$240k',
    daysLeft: 5,
    author: 'Aura Tech',
    image: 'https://picsum.photos/seed/ring/1200/600',
    description: 'Experience the future of health tracking with a sleek, titanium smart ring that monitors your vitals 24/7 with unprecedented accuracy.'
  };

  const leaderboard = [
    { name: 'Quantum Compute API', raised: '$1.5M', growth: '+45%', avatar: 'https://picsum.photos/seed/quantum/100' },
    { name: 'NextGen AI Assistant', raised: '$120k', growth: '+22%', avatar: 'https://picsum.photos/seed/ai/100' },
    { name: 'Aura Tech', raised: '$240k', growth: '+18%', avatar: 'https://picsum.photos/seed/ring/100' },
    { name: 'EcoTrack', raised: '$42.5k', growth: '+12%', avatar: 'https://picsum.photos/seed/eco/100' },
  ];

  const supremeConnectors = [
    { name: 'Sarah Jenkins', connections: 142, points: 15400, avatar: 'https://i.pravatar.cc/150?u=sarahj' },
    { name: 'Michael Chen', connections: 98, points: 12100, avatar: 'https://i.pravatar.cc/150?u=michaelc' },
    { name: 'Elena Rodriguez', connections: 85, points: 9800, avatar: 'https://i.pravatar.cc/150?u=elenar' },
    { name: 'David Smith', connections: 72, points: 8500, avatar: 'https://i.pravatar.cc/150?u=davids' },
  ];

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesCountry = selectedCountry === 'All' || p.location === selectedCountry;
      const matchesStage = selectedStage === 'All' || p.stage === selectedStage;
      return matchesSearch && matchesCategory && matchesCountry && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === 'Popularity') return b.popularity - a.popularity;
      if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'Most Funded') return b.raisedAmount - a.raisedAmount;
      if (sortBy === 'Ending Soon') return a.id - b.id; // Mock sorting
      return 0;
    });

  const categories = ['All', 'Tech', 'Business', 'Gaming', 'AI Tools', 'Green', 'Deep Tech', 'Community'];
  const countries = ['All', 'Global', 'USA', 'UK', 'Japan', 'Switzerland', 'Canada'];
  const stages = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B'];
  const sortOptions = ['Popularity', 'Newest', 'Most Funded', 'Ending Soon'];

  return (
    <div className="space-y-8">
      {selectedProject ? (
        <ProjectDetailsView project={selectedProject} onBack={() => setSelectedProject(null)} />
      ) : (
        <>
          {/* Leaderboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Trending Leaderboard
                  </h3>
                  <button className="text-sm font-bold text-[var(--color-supreme-gold)] hover:underline">View Full Rankings</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leaderboard.map((item, i) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-[var(--color-supreme-gold)]/30 transition-all">
                      <div className="relative">
                        <img src={item.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white" />
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-[var(--color-supreme-gold)] text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {i + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--color-supreme-gold)]">{item.raised}</span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 rounded">{item.growth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supreme Connectors Leaderboard */}
              <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-3xl border border-[var(--color-supreme-gold)]/30 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Supreme Connectors
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Zap className="w-3 h-3 text-[var(--color-supreme-gold)]" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Referrers</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {supremeConnectors.map((item, i) => (
                    <div key={item.name} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all">
                      <div className="relative">
                        <img src={item.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white/10" />
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                          {i + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--color-supreme-gold)]">{item.connections} Connects</span>
                          <span className="text-[10px] font-bold text-gray-400">{item.points.toLocaleString()} Pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-600 p-6 rounded-3xl shadow-lg text-black flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h4 className="font-display font-bold text-xl mb-1">Power Boost</h4>
                <p className="text-sm font-medium opacity-90 mb-4">Get featured on the leaderboard and reach 10x more investors.</p>
                <button 
                  onClick={() => setIsBoostModalOpen(true)}
                  className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" /> Boost Project
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search trending startups, innovations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {[
                  { name: 'All', icon: Layers },
                  { name: 'Tech', icon: Cpu },
                  { name: 'Gaming', icon: Gamepad2 },
                  { name: 'AI Tools', icon: Brain },
                  { name: 'Green', icon: Leaf }
                ].map(filter => (
                  <button 
                    key={filter.name} 
                    onClick={() => setSelectedCategory(filter.name)}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2",
                      selectedCategory === filter.name 
                        ? "bg-[var(--color-supreme-gold)] text-black border-[var(--color-supreme-gold)] shadow-md translate-y-[-1px]" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-[var(--color-supreme-gold)]/10 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30"
                    )}
                  >
                    <filter.icon className={clsx("w-4 h-4", selectedCategory === filter.name ? "text-black" : "text-gray-400")} />
                    {filter.name}
                  </button>
                ))}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 border transition-all",
                    showFilters 
                      ? "bg-[var(--color-supreme-gold)] text-black border-[var(--color-supreme-gold)] shadow-md translate-y-[-1px]" 
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-[var(--color-supreme-gold)]/10 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30"
                  )}
                >
                  <Filter className={clsx("w-4 h-4", showFilters ? "text-black" : "text-gray-400")} /> Filters
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 pt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                      <select 
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                      >
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Funding Stage</label>
                      <select 
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Sort By</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
                      >
                        {sortOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Featured Project */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer" onClick={() => setSelectedProject(featuredProject)}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto overflow-hidden">
                <img src={featuredProject.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-[var(--color-supreme-gold)] text-black text-xs font-bold rounded-full shadow-lg">FEATURED</span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-[var(--color-supreme-gold)] uppercase tracking-wider">{featuredProject.category}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">By {featuredProject.author}</span>
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 mb-4 group-hover:text-[var(--color-supreme-gold)] transition-colors">{featuredProject.name}</h3>
                <p className="text-gray-600 mb-6 line-clamp-2">{featuredProject.description}</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{featuredProject.funding}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">Funded</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{featuredProject.raised}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">Raised</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{featuredProject.daysLeft}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">Days Left</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                  <div className="bg-[var(--color-supreme-gold)] h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
                <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                  View Project Details <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => {
              const fundingPercent = Math.round((project.raisedAmount / project.fundingGoal) * 100);
              return (
                <div 
                  key={project.id} 
                  onClick={() => onSelectProject(project)}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[var(--color-supreme-gold)]/30 transition-all group cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors line-clamp-1">{project.name}</h3>
                      {project.popularity > 90 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                          <TrendingUp className="w-3 h-3" /> TRENDING
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">A revolutionary project aiming to change the landscape of {project.category.toLowerCase()} with innovative solutions.</p>
                    
                    <div className="space-y-4 mt-auto">
                      {/* Funding Details Section */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase">Funding Details</span>
                          <span className="text-sm font-bold text-[var(--color-supreme-gold)]">{fundingPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(fundingPercent, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-400 h-full rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                          </motion.div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Raised</p>
                            <p className="text-sm font-bold text-gray-900">${project.raisedAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Goal</p>
                            <p className="text-sm font-bold text-gray-900">${project.fundingGoal.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1" title="Team Size"><Users className="w-4 h-4 text-gray-400" /> {project.team}</span>
                          <span className="flex items-center gap-1" title="Location"><Globe className="w-4 h-4 text-gray-400" /> {project.location}</span>
                        </div>
                        <button className="text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 p-2 rounded-xl group-hover:bg-[var(--color-supreme-gold)] group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <BoostProjectModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />
    </div>
  );
}

function ProjectCreator({ onLaunch }: { onLaunch: (p: Project) => void }) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tech & Software');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [withdrawThreshold, setWithdrawThreshold] = useState('');
  const [timeline, setTimeline] = useState('');

  const allowedRanks = ['Silver', 'Gold', 'Diamond', 'Crowned', 'silver', 'gold', 'diamond', 'crowned', 'Official', 'elite', 'royal'];
  const isEligible = profile && allowedRanks.includes(profile.rank);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEligible) {
      toast.error("Access Denied: You must reach Silver rank or higher to publish a project for funding.");
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name,
      category,
      description,
      fundingGoal: parseInt(budget) || 50000,
      withdrawalThreshold: parseInt(withdrawThreshold) || parseInt(budget) || 50000,
      raisedAmount: 0,
      team: 1,
      location: 'Global',
      stage: 'Pre-Seed',
      popularity: 0,
      image: `https://picsum.photos/seed/${name}/600/400`,
      createdAt: new Date().toISOString().split('T')[0],
      teamMembers: [
        { id: 1, name: 'You', role: 'Founder', avatar: 'https://i.pravatar.cc/150?u=you', status: 'online' }
      ]
    };
    onLaunch(newProject);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Launch New Project</h2>
        <p className="text-gray-500">Fill in the details below to start your journey.</p>
        
        {!isEligible && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Ranking Requirement Not Met</p>
              <p className="text-xs text-amber-700 mt-1">
                To maintain high quality standards, only users with rank <span className="font-bold">Silver, Gold, Diamond, or Crowned</span> can publish projects for funding. Your current rank is <span className="font-bold">{profile?.rank || 'Bronze'}</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={clsx("space-y-6", !isEligible && "opacity-50 pointer-events-none")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., NextGen AI App" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none"
            >
              <option>Tech & Software</option>
              <option>Business & Startup</option>
              <option>Education</option>
              <option>Gaming</option>
              <option>Media & Entertainment</option>
              <option>Community</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Description</label>
          <textarea 
            rows={4} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project's mission and vision..." 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none resize-none"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Funding Goal ($)</label>
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="50000" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Withdrawal Threshold ($)</label>
            <input 
              type="number" 
              value={withdrawThreshold}
              onChange={(e) => setWithdrawThreshold(e.target.value)}
              placeholder="Target amount for withdrawals" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
            />
            <p className="text-[10px] text-gray-400">Funds cannot be withdrawn to central wallet until this amount is raised.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Timeline (Months)</label>
            <input 
              type="number" 
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="6" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" 
              required
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">
            Save Draft
          </button>
          <button type="submit" className="px-8 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg shadow-[var(--color-supreme-gold)]/20 flex items-center gap-2">
            <Rocket className="w-5 h-5" /> Launch Project
          </button>
        </div>
      </form>
    </div>
  );
}

function ProjectDashboard({ project }: { project: Project | null }) {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <Rocket className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Project Selected</h3>
        <p className="text-gray-500 max-w-sm">Select a project from the Discover tab or create a new one to view your dashboard.</p>
      </div>
    );
  }

  const fundingPercent = Math.round((project.raisedAmount / project.fundingGoal) * 100);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">{project.name} Dashboard</h2>
        <p className="text-gray-500">Managing {project.category} project launched on {project.createdAt}</p>
      </div>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Funding Progress', value: `${fundingPercent}%`, icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50', trend: `${fundingPercent > 0 ? '+' : ''}${fundingPercent}%`, isPositive: true },
          { label: 'Raised Amount', value: `$${(project.raisedAmount / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: 'Live', isPositive: true },
          { label: 'Tasks Completed', value: '142', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+28', isPositive: true },
          { label: 'Team Activity', value: 'High', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+5%', isPositive: true },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={clsx("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg", stat.isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50")}>
                {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-gray-900">{stat.value}</h3>
            <div className="absolute -bottom-4 -right-4 opacity-5">
              <stat.icon className="w-24 h-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview Chart (Mocked) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Financial Overview
              </h3>
              <p className="text-sm text-gray-500">Revenue vs Expenses over the last 6 months</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]">
              <option>Last 6 Months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-2 sm:gap-6 justify-between px-2">
            {[
              { month: 'Jan', rev: 40, exp: 30 },
              { month: 'Feb', rev: 55, exp: 45 },
              { month: 'Mar', rev: 45, exp: 35 },
              { month: 'Apr', rev: 70, exp: 50 },
              { month: 'May', rev: 65, exp: 55 },
              { month: 'Jun', rev: 90, exp: 60 },
            ].map((data, i) => (
              <div key={data.month} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="w-full flex justify-center gap-1 sm:gap-2 h-48 items-end relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Rev: ${data.rev}k | Exp: ${data.exp}k
                  </div>
                  <div className="w-full max-w-[20px] bg-gray-200 rounded-t-md relative group-hover:bg-gray-300 transition-colors" style={{ height: `${data.exp}%` }}></div>
                  <div className="w-full max-w-[20px] bg-[var(--color-supreme-gold)] rounded-t-md relative group-hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-[0_0_10px_rgba(184,134,11,0.2)]" style={{ height: `${data.rev}%` }}></div>
                </div>
                <span className="text-xs font-bold text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <div className="w-3 h-3 rounded-full bg-[var(--color-supreme-gold)]"></div> Revenue
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div> Expenses
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Timeline
            </h3>
            <button className="text-sm font-bold text-[var(--color-supreme-gold)] hover:underline">View All</button>
          </div>
          
          <div className="space-y-0 flex-1">
            {[
              { title: 'MVP Development', date: 'Oct 15', status: 'completed', desc: 'Core features implemented.' },
              { title: 'Seed Funding Closed', date: 'Nov 02', status: 'completed', desc: 'Raised $500k from angels.' },
              { title: 'Beta Launch', date: 'Today', status: 'active', desc: 'Inviting first 1000 users.' },
              { title: 'Public Release', date: 'Dec 01', status: 'pending', desc: 'Global marketing push.' },
            ].map((milestone, i) => (
              <div key={milestone.title} className="flex gap-4 relative pb-6 last:pb-0">
                {i !== 3 && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100" />}
                <div className="relative z-10 flex flex-col items-center mt-1">
                  <div className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white",
                    milestone.status === 'completed' ? "border-green-500 text-green-500" : 
                    milestone.status === 'active' ? "border-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)] shadow-[0_0_10px_rgba(184,134,11,0.3)]" : "border-gray-300 text-transparent"
                  )}>
                    {milestone.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    {milestone.status === 'active' && <div className="w-2 h-2 rounded-full bg-[var(--color-supreme-gold)] animate-pulse" />}
                  </div>
                </div>
                <div className={clsx("flex-1", milestone.status === 'pending' ? "opacity-50" : "")}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900">{milestone.title}</p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{milestone.date}</span>
                  </div>
                  <p className="text-sm text-gray-500">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Department Health
          </h3>
          <div className="space-y-6">
            {[
              { name: 'Development', val: 85, color: 'bg-blue-500' },
              { name: 'Marketing', val: 40, color: 'bg-purple-500' },
              { name: 'Design', val: 95, color: 'bg-pink-500' },
              { name: 'Funding', val: 92, color: 'bg-green-500' },
            ].map(dept => (
              <div key={dept.name}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-700">{dept.name}</span>
                  <span className="text-gray-900">{dept.val}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.val}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={clsx("h-2.5 rounded-full", dept.color)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-lg text-white">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--color-supreme-gold)]">
            <Zap className="w-5 h-5" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left group">
              <FileText className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">Generate Report</p>
              <p className="text-xs text-gray-400 mt-1">Weekly summary</p>
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left group">
              <Users className="w-6 h-6 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">Team Meeting</p>
              <p className="text-xs text-gray-400 mt-1">Start video call</p>
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left group">
              <DollarSign className="w-6 h-6 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">Request Funds</p>
              <p className="text-xs text-gray-400 mt-1">Open new round</p>
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left group">
              <Bot className="w-6 h-6 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">AI Analysis</p>
              <p className="text-xs text-gray-400 mt-1">Check project health</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerTeam({ project }: { project: Project | null }) {
  const roles = ['Developer', 'Designer', 'Marketer', 'Investor', 'Writer', 'Video Editor', 'Business Partner'];
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(roles[0]);
  const { receivePayment } = useWallet();
  const { playNewUserSignup } = useSound();
  const [activeTab, setActiveTab] = useState<'members' | 'tasks' | 'chat' | 'files' | 'meeting'>('members');
  const [chatMessage, setChatMessage] = useState('');
  const [claimedRewards, setClaimedRewards] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('project-power-claimed-rewards');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Project Selected</h3>
        <p className="text-gray-500 max-w-sm">Select a project from the Discover tab or create a new one to manage your team.</p>
      </div>
    );
  }

  useEffect(() => {
    localStorage.setItem('project-power-claimed-rewards', JSON.stringify(Array.from(claimedRewards)));
  }, [claimedRewards]);
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const teamMembers = [
    { id: 1, name: 'Alex Rivera', role: 'Lead Developer', status: 'online', avatar: 'https://picsum.photos/seed/team1/100' },
    { id: 2, name: 'Sam Chen', role: 'UI/UX Designer', status: 'offline', avatar: 'https://picsum.photos/seed/team2/100' },
    { id: 3, name: 'Jordan Lee', role: 'Marketing Head', status: 'in-meeting', avatar: 'https://picsum.photos/seed/team3/100' },
    { id: 4, name: 'Casey Smith', role: 'Investor', status: 'online', avatar: 'https://picsum.photos/seed/team4/100' },
  ];

  const [taskList, setTaskList] = useState(() => {
    const saved = localStorage.getItem('project-power-tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Implement Stripe Checkout', assignee: 'Alex Rivera', status: 'in-progress', due: 'Tomorrow', reward: 50 },
      { id: 2, title: 'Design Landing Page', assignee: 'Sam Chen', status: 'completed', due: 'Yesterday', reward: 30 },
      { id: 3, title: 'Launch Ad Campaign', assignee: 'Jordan Lee', status: 'todo', due: 'Next Week', reward: 100 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('project-power-tasks', JSON.stringify(taskList));
  }, [taskList]);

  const handleToggleTask = (taskId: number) => {
    let rewardToClaim: { id: number, amount: number, title: string } | null = null;

    setTaskList(prev => {
      return prev.map(task => {
        if (task.id === taskId) {
          const isNowCompleted = task.status !== 'completed';
          const newStatus = isNowCompleted ? 'completed' : 'todo';
          
          if (isNowCompleted && task.reward && !claimedRewards.has(task.id)) {
            rewardToClaim = { id: task.id, amount: task.reward, title: task.title };
          }
          
          return { ...task, status: newStatus };
        }
        return task;
      });
    });

    if (rewardToClaim) {
      handleClaimReward(rewardToClaim.id, rewardToClaim.amount, rewardToClaim.title);
    }
  };

  const handleClaimReward = (taskId: number, amount: number, taskTitle?: string) => {
    if (claimedRewards.has(taskId)) return;
    const title = taskTitle || taskList.find(t => t.id === taskId)?.title || 'Task';
    receivePayment(amount, `Task Completion Reward: ${title}`);
    setClaimedRewards(prev => new Set(prev).add(taskId));
    playNewUserSignup();
  };

  const files = [
    { id: 1, name: 'Q3_Pitch_Deck.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Casey Smith', date: '2 hours ago' },
    { id: 2, name: 'Financial_Model_v2.xlsx', type: 'excel', size: '1.1 MB', uploadedBy: 'Alex Rivera', date: 'Yesterday' },
    { id: 3, name: 'Brand_Assets.zip', type: 'archive', size: '15.6 MB', uploadedBy: 'Sam Chen', date: '3 days ago' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6 flex flex-col h-[800px]">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {[
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'chat', icon: MessageSquare, label: 'Team Chat' },
            { id: 'files', icon: Paperclip, label: 'Files' },
            { id: 'meeting', icon: Video, label: 'Meeting Room' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-[var(--color-supreme-gold)] text-black shadow-md" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col">
          {activeTab === 'members' && (
            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Active Team Members
                </h3>
                <button 
                  onClick={() => setShowInvite(!showInvite)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors",
                    showInvite 
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                      : "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/20"
                  )}
                >
                  {showInvite ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                  {showInvite ? 'Cancel' : 'Invite Member'}
                </button>
              </div>

              <AnimatePresence>
                {showInvite && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleInvite} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="email" 
                          required
                          placeholder="Email address" 
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-sm"
                        />
                      </div>
                      <select 
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full sm:w-40 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-sm cursor-pointer"
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button type="submit" className="px-6 py-2.5 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors text-sm whitespace-nowrap shadow-md">
                        Send Invite
                      </button>
                    </form>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 px-2">
                      <Link className="w-3 h-3" /> Or share this link: <span className="text-[var(--color-supreme-gold)] font-mono bg-[var(--color-supreme-gold)]/10 px-2 py-0.5 rounded cursor-pointer hover:bg-[var(--color-supreme-gold)]/20 transition-colors">supreme.net/join/proj-xyz</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 hover:shadow-sm transition-all group bg-white">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className={clsx(
                          "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
                          member.status === 'online' ? "bg-green-500" : 
                          member.status === 'in-meeting' ? "bg-red-500" : "bg-gray-300"
                        )}></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{member.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setActiveTab('chat')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => setActiveTab('meeting')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Video Call">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors" title="More">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Task Board
                </h3>
                <button className="px-4 py-2 bg-[var(--color-supreme-gold)] text-black rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> New Task
                </button>
              </div>
              <div className="space-y-3 flex-1">
                {taskList.map(task => (
                  <div key={task.id} className="p-4 border border-gray-100 rounded-2xl hover:border-[var(--color-supreme-gold)]/30 transition-colors bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-start gap-3 flex-1">
                      <button 
                        onClick={() => handleToggleTask(task.id)}
                        className={clsx(
                        "mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                        task.status === 'completed' ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-[var(--color-supreme-gold)]"
                      )}>
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={clsx("font-bold text-sm", task.status === 'completed' ? "text-gray-400 line-through" : "text-gray-900")}>{task.title}</p>
                          {task.reward && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <Coins className="w-3 h-3" /> ${task.reward}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.assignee}</span>
                          <span className={clsx(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded",
                            task.due === 'Yesterday' ? "bg-red-50 text-red-600" : "bg-gray-100"
                          )}><Clock className="w-3 h-3" /> {task.due}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.status === 'completed' && task.reward && !claimedRewards.has(task.id) && (
                        <motion.button
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={() => handleClaimReward(task.id, task.reward!)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Gift className="w-3.5 h-3.5" /> Claim Reward
                        </motion.button>
                      )}
                      {claimedRewards.has(task.id) && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                        </span>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col bg-gray-50">
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-supreme-gold)]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Project General</h3>
                    <p className="text-xs text-gray-500">4 members online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('meeting')} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveTab('meeting')} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="text-center text-xs text-gray-400 my-4">Today</div>
                <div className="flex gap-3">
                  <img src={teamMembers[0].avatar} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-gray-900">{teamMembers[0].name}</span>
                      <span className="text-xs text-gray-400">10:23 AM</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-700 mt-1 shadow-sm inline-block">
                      Hey team, I've just pushed the latest updates for the Stripe integration. Can someone review?
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)] flex items-center justify-center text-black font-bold text-xs">Me</div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400">10:25 AM</span>
                      <span className="font-bold text-sm text-gray-900">You</span>
                    </div>
                    <div className="bg-[var(--color-supreme-gold)] p-3 rounded-2xl rounded-tr-none text-sm text-black mt-1 shadow-sm inline-block">
                      Looking at it now. Looks solid! I'll test it in the staging environment.
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-[var(--color-supreme-gold)] focus:ring-2 focus:ring-[var(--color-supreme-gold)]/20 rounded-xl outline-none text-sm transition-all"
                  />
                  <button className="p-2.5 bg-[var(--color-supreme-gold)] text-black rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Shared Files
                </h3>
                <button className="px-4 py-2 bg-[var(--color-supreme-gold)] text-black rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Upload File
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map(file => (
                  <div key={file.id} className="p-4 border border-gray-100 rounded-2xl hover:border-[var(--color-supreme-gold)]/30 transition-colors bg-gray-50 flex items-start gap-3 group cursor-pointer">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <File className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{file.size} • Uploaded by {file.uploadedBy}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-[var(--color-supreme-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'meeting' && (
            <div className="flex-1 bg-gray-900 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
              <div className="flex-1 p-6 relative z-10 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center mb-6 border border-[var(--color-supreme-gold)]/30 shadow-[0_0_30px_rgba(184,134,11,0.2)]">
                  <Video className="w-10 h-10 text-[var(--color-supreme-gold)]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Project Power Room</h2>
                <p className="text-gray-400 mb-8 max-w-md">Join the virtual meeting room to collaborate with your team in real-time. 2 members are currently waiting.</p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-[0_0_20px_rgba(184,134,11,0.3)]">
                    Join Meeting
                  </button>
                  <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                    Copy Link
                  </button>
                </div>
              </div>
              <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10 relative z-10 flex justify-center gap-4">
                <button className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"><Mic className="w-5 h-5" /></button>
                <button className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"><MonitorUp className="w-5 h-5" /></button>
                <button className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"><PhoneCall className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Open Roles
          </h3>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button key={role} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-[var(--color-supreme-gold)]/10 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)]/30 transition-all flex items-center gap-1">
                <Plus className="w-3 h-3" /> {role}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Workspace Area */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black p-1 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--color-supreme-gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="bg-gray-900 rounded-[1.4rem] p-6 relative z-10 h-full flex flex-col border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-xl font-bold text-white">Workspace</h3>
              </div>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
              <div className="bg-black/50 rounded-xl p-3 border border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Files</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-[var(--color-supreme-gold)] cursor-pointer transition-colors">
                    <FileText className="w-4 h-4 text-blue-400" /> Q3_Pitch_Deck.pdf
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-[var(--color-supreme-gold)] cursor-pointer transition-colors">
                    <File className="w-4 h-4 text-green-400" /> Financial_Model.xlsx
                  </div>
                </div>
              </div>
              
              <div className="bg-black/50 rounded-xl p-3 border border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Up Next</p>
                <div className="flex items-start gap-3">
                  <div className="bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)] rounded-lg p-2 text-center min-w-[50px]">
                    <p className="text-xs font-bold uppercase">Oct</p>
                    <p className="text-lg font-bold leading-none">24</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Design Sync</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 2:00 PM (In 30m)</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 bg-[var(--color-supreme-gold)] text-black rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:shadow-[0_0_30px_rgba(184,134,11,0.5)] flex items-center justify-center gap-2 group/btn mt-auto">
              Enter Workspace <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Funding Details Summary */}
        <div className="bg-gradient-to-br from-[var(--color-supreme-gold)]/10 to-transparent p-6 rounded-3xl border border-[var(--color-supreme-gold)]/20 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <DollarSign className="w-24 h-24 text-[var(--color-supreme-gold)]" />
           </div>
           <div className="relative z-10">
             <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
               <Wallet className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Funding Status
             </h3>
             <div className="mb-4">
               <span className="text-3xl font-display font-bold text-gray-900">$75,000</span>
               <span className="text-sm text-gray-500 ml-2">raised of $100k goal</span>
             </div>
             <div className="w-full bg-white/50 rounded-full h-2 mb-4 overflow-hidden border border-white">
                <div className="bg-[var(--color-supreme-gold)] h-2 rounded-full" style={{ width: '75%' }}></div>
             </div>
             <div className="flex justify-between text-sm">
               <span className="font-bold text-gray-700">342 Backers</span>
               <span className="font-bold text-[var(--color-supreme-gold)]">14 Days Left</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PowerFunding({ project, onFund, onWithdraw }: { 
  project: Project | null, 
  onFund: (amount: number) => void,
  onWithdraw: (amount: number) => Promise<void>
}) {
  const { balance: centralBalance, withdraw: withdrawFromCentral } = useWallet();
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [fundMethod, setFundMethod] = useState<'stripe' | 'wallet'>('stripe');

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <DollarSign className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Project Selected</h3>
        <p className="text-gray-500 max-w-sm">Select a project from the Discover tab or create a new one to manage funding.</p>
      </div>
    );
  }

  const fundingPercent = Math.round((project.raisedAmount / project.fundingGoal) * 100);
  const dashOffset = 440 - (440 * Math.min(fundingPercent, 100)) / 100;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsProcessing(true);

    if (fundMethod === 'wallet') {
      const numAmount = parseFloat(amount);
      if (centralBalance < numAmount) {
        toast.error('Insufficient central wallet balance');
        setIsProcessing(false);
        return;
      }

      setTimeout(async () => {
        try {
          await withdrawFromCentral(numAmount, 'Project Power', `Backed ${project.name}`);
          setIsProcessing(false);
          setPaymentSuccess(true);
          onFund(numAmount);
          setAmount('');
          setTimeout(() => setPaymentSuccess(false), 3000);
        } catch (error) {
          setIsProcessing(false);
          toast.error('Payment failed');
        }
      }, 1500);
    } else {
      // Direct Stripe payment
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        onFund(parseFloat(amount));
        setAmount('');
        setTimeout(() => setPaymentSuccess(false), 3000);
      }, 2000);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const threshold = project.withdrawalThreshold || project.fundingGoal;
    if (project.raisedAmount < threshold) {
      toast.error(`Withdrawal locked: Must raise at least $${threshold.toLocaleString()} first.`);
      return;
    }

    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (numAmount > project.raisedAmount) {
      toast.error('Insufficient project funds');
      return;
    }

    setIsProcessing(true);
    await onWithdraw(numAmount);
    setIsProcessing(false);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Wallet & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Wallet Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-[var(--color-supreme-gold)]/30 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/10 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Project Wallet Balance</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-200">
                  ${project.raisedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <Wallet className="w-8 h-8 text-[var(--color-supreme-gold)]" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 relative z-10">
              <button 
                onClick={() => {
                  const threshold = project.withdrawalThreshold || project.fundingGoal;
                  if (project.raisedAmount < threshold) {
                    toast.error(`Withdrawal locked: This project must reach its target of $${threshold.toLocaleString()} before funds can be transferred.`);
                    return;
                  }
                  setShowWithdrawModal(true);
                }}
                className={clsx(
                  "px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg",
                  project.raisedAmount >= (project.withdrawalThreshold || project.fundingGoal)
                    ? "bg-[var(--color-supreme-gold)] text-black hover:bg-[var(--color-supreme-gold-light)] shadow-[var(--color-supreme-gold)]/20"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                )}
              >
                {project.raisedAmount >= (project.withdrawalThreshold || project.fundingGoal) ? (
                  <Download className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Withdraw to Central Wallet
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('transaction-history');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Transactions
              </button>
            </div>
          </div>

          {/* Funding Overview */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Funding Overview
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" className="stroke-gray-100" strokeWidth="12" fill="none" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="80" cy="80" r="70" 
                    className="stroke-[var(--color-supreme-gold)]" 
                    strokeWidth="12" fill="none" 
                    strokeDasharray="440" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-display font-bold text-gray-900">{fundingPercent}%</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Funded</p>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Raised</p>
                    <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">${project.raisedAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase">Goal</p>
                    <p className="text-2xl font-bold text-gray-900">${project.fundingGoal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold">Backers</p>
                    <p className="text-lg font-bold text-blue-900">342</p>
                  </div>
                  <div className="flex-1 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs text-purple-600 font-bold">Days Left</p>
                    <p className="text-lg font-bold text-purple-900">14</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div id="transaction-history" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Transaction History
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase">Recent Transfers</span>
            </h3>
            
            <div className="space-y-3">
              {!project.transferHistory || project.transferHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-gray-500 font-medium">No transactions recorded yet.</p>
                </div>
              ) : (
                project.transferHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "p-3 rounded-xl",
                        tx.type === 'funding' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {tx.type === 'funding' ? <TrendingUp className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 uppercase tracking-tight">{tx.type === 'funding' ? 'Funding Deposit' : 'Central Wallet Withdrawal'}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={clsx(
                        "text-lg font-bold",
                        tx.type === 'funding' ? "text-green-600" : "text-blue-600"
                      )}>
                        {tx.type === 'funding' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{tx.id}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Payment Area */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Back this Project
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <Lock className="w-3 h-3" /> Secure
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-6">
            <button 
              onClick={() => setFundMethod('stripe')}
              className={clsx(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                fundMethod === 'stripe' ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Stripe
            </button>
            <button 
              onClick={() => setFundMethod('wallet')}
              className={clsx(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                fundMethod === 'wallet' ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Central Wallet
            </button>
          </div>

          <AnimatePresence mode="wait">
            {paymentSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center flex-1 text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
                <p className="text-gray-500 text-sm">Thank you for backing this project. Your funds have been added to the project wallet.</p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handlePayment} 
                className="space-y-4 flex-1 flex flex-col"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number" 
                      required
                      min="5"
                      placeholder="100.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Card Information</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-[var(--color-supreme-gold)] focus-within:border-transparent transition-all">
                    <div className="relative border-b border-gray-200">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="Card number" 
                        className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-sm"
                      />
                    </div>
                    <div className="flex">
                      <input 
                        type="text" 
                        required
                        placeholder="MM / YY" 
                        className="w-1/2 px-4 py-3 bg-transparent border-r border-gray-200 outline-none text-sm"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="CVC" 
                        className="w-1/2 px-4 py-3 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Name on card</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-sm"
                  />
                </div>

                <div className="mt-auto pt-6">
                  {fundMethod === 'wallet' && (
                    <div className="mb-4 p-4 bg-[var(--color-supreme-gold)]/5 rounded-xl border border-[var(--color-supreme-gold)]/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Wallet Balance</span>
                        <span className="text-sm font-bold text-gray-900">${centralBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={clsx(
                      "w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
                      fundMethod === 'wallet' 
                        ? "bg-[var(--color-supreme-gold)] text-black hover:bg-[var(--color-supreme-gold-light)] shadow-lg shadow-[var(--color-supreme-gold)]/20" 
                        : "bg-gray-900 text-white hover:bg-black"
                    )}
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <>
                        {fundMethod === 'wallet' ? <Wallet className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        {fundMethod === 'wallet' ? 'Pay from Wallet' : `Pay ${amount ? `$${amount}` : ''} with Stripe`}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    {fundMethod === 'wallet' ? 'Secure Instant Transfer' : <>Powered by <span className="font-bold text-gray-600">Stripe</span></>}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowWithdrawModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-supreme-gold)]/10 blur-[50px] rounded-full -mr-10 -mt-10"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">Withdraw Funds</h3>
                    <p className="text-sm text-gray-500">Transfer project earnings to your central wallet.</p>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">Project Balance</span>
                    <span className="text-xs font-bold text-[var(--color-supreme-gold)]">Available</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${project.raisedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Withdrawal Threshold</span>
                      <span className="text-xs font-bold text-gray-900">${(project.withdrawalThreshold || project.fundingGoal).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Amount to Withdraw</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="number" 
                        required
                        min="1"
                        max={project.raisedAmount}
                        placeholder="0.00" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-12 pr-20 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-xl font-bold"
                      />
                      <button 
                        type="button"
                        onClick={() => setWithdrawAmount(project.raisedAmount.toString())}
                        className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] text-xs font-bold rounded-lg hover:bg-[var(--color-supreme-gold)]/20 transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[100, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt.toString())}
                        className="py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-gold)] transition-all"
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isProcessing || !withdrawAmount}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-black/10"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                          Complete Withdrawal
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RiddleGame = () => {
  const { playSound } = useSound();
  const [activeSubTab, setActiveSubTab] = useState<'riddles' | 'puzzles'>('riddles');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'waiting'>('idle');
  const [currentRiddle, setCurrentRiddle] = useState<any>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [stats, setStats] = useState({
    wins: 0,
    fails: 0,
    consecutiveWins: 0,
    totalPlays: 0,
    lastPlayTime: 0,
    earnings: 0,
    puzzleWins: 0,
    puzzleFails: 0,
    puzzleConsecutiveWins: 0
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [puzzleTimeLeft, setPuzzleTimeLeft] = useState<number | null>(null);
  const [isPushed, setIsPushed] = useState(false);
  const [pushTimer, setPushTimer] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Social media');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Hard');
  const [showFriends, setShowFriends] = useState(false);
  const [riddleTimer, setRiddleTimer] = useState<number | null>(null);
  const [puzzleTimer, setPuzzleTimer] = useState<number | null>(null);
  const [skipsLeft, setSkipsLeft] = useState(2);

  const RIDDLES = [
    { category: 'Social media', difficulty: 'Hard', q: "I have millions of faces but no eyes. I have millions of voices but no mouth. What am I?", a: "Social Media Profile" },
    { category: 'Social media', difficulty: 'Harder', q: "I'm a bird that doesn't fly, but I carry news across the sky. I'm limited in my speech, but far and wide I reach. What am I?", a: "Twitter" },
    { category: 'Earthly', difficulty: 'Hard', q: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", a: "Map" },
    { category: 'Earthly', difficulty: 'Harder', q: "I'm tall when I'm young, and I'm short when I'm old. I tremble in the wind, but I'm not cold. What am I?", a: "Candle" },
    { category: 'Planet', difficulty: 'Hard', q: "I'm the red one in the sky, named after a god of war. I have two moons to keep me company. What am I?", a: "Mars" },
    { category: 'Planet', difficulty: 'Hardest', q: "I spin on my side, a giant of ice. I have rings that are thin, and moons that are nice. What am I?", a: "Uranus" },
    { category: 'Internet', difficulty: 'Hard', q: "I'm a web without a spider, a net without a fish. I connect the whole world with just a single wish. What am I?", a: "Internet" },
    { category: 'Internet', difficulty: 'Harder', q: "I'm a key that opens no locks, but I can take you anywhere. I'm a link that binds no chains, but I can share what's rare. What am I?", a: "URL" },
    { category: 'Human', difficulty: 'Hard', q: "I have one eye but cannot see. I'm sharp and thin, and I help you be. What am I?", a: "Needle" },
    { category: 'Human', difficulty: 'Hardest', q: "I'm the only thing that gets larger the more you take away from it. What am I?", a: "Hole" }
  ];

  const PUZZLES = [
    { category: 'Logic', difficulty: 'Hard', q: "Unscramble: O G L I C", a: "LOGIC" },
    { category: 'Logic', difficulty: 'Harder', q: "What comes next in the sequence: 2, 4, 8, 16, ...?", a: "32" },
    { category: 'Visual', difficulty: 'Hard', q: "How many squares are in a 3x3 grid?", a: "14" },
    { category: 'Visual', difficulty: 'Harder', q: "If you rotate a 6 upside down, what number do you get?", a: "9" },
    { category: 'Math', difficulty: 'Hard', q: "12 + 15 * 2 = ?", a: "42" },
    { category: 'Math', difficulty: 'Hardest', q: "Square root of 144?", a: "12" }
  ];

  const FRIENDS = [
    { id: '1', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/user1/150' },
    { id: '2', name: 'Sarah Williams', avatar: 'https://picsum.photos/seed/user2/150' },
    { id: '3', name: 'Marcus Sterling', avatar: 'https://picsum.photos/seed/user3/150' },
    { id: '4', name: 'Elena Vance', avatar: 'https://picsum.photos/seed/user4/150' }
  ];

  const LEADERBOARD = [
    { name: 'Riddle Master', score: 45, wins: 20, avatar: 'https://picsum.photos/seed/m1/150' },
    { name: 'Brainy Alex', score: 38, wins: 15, avatar: 'https://picsum.photos/seed/m2/150' },
    { name: 'Logic Queen', score: 32, wins: 12, avatar: 'https://picsum.photos/seed/m3/150' },
    { name: 'Puzzle King', score: 28, wins: 10, avatar: 'https://picsum.photos/seed/m4/150' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('riddle_stats');
    if (saved) setStats(JSON.parse(saved));

    const checkTime = () => {
      const now = Date.now();
      
      // Riddle Cooldown
      const lastRiddle = parseInt(localStorage.getItem('riddle_last_play') || '0');
      const riddleDiff = now - lastRiddle;
      const twoHours = 2 * 60 * 60 * 1000;

      if (lastRiddle > 0 && riddleDiff < twoHours) {
        if (activeSubTab === 'riddles') setGameState('waiting');
        setTimeLeft(Math.ceil((twoHours - riddleDiff) / 1000));
      } else {
        if (activeSubTab === 'riddles' && gameState === 'waiting') setGameState('idle');
        setTimeLeft(null);
      }

      // Puzzle Cooldown
      const lastPuzzle = parseInt(localStorage.getItem('puzzle_last_play') || '0');
      const puzzleDiff = now - lastPuzzle;
      if (lastPuzzle > 0 && puzzleDiff < twoHours) {
        if (activeSubTab === 'puzzles') setGameState('waiting');
        setPuzzleTimeLeft(Math.ceil((twoHours - puzzleDiff) / 1000));
      } else {
        if (activeSubTab === 'puzzles' && gameState === 'waiting') setGameState('idle');
        setPuzzleTimeLeft(null);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [activeSubTab, gameState]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      if (activeSubTab === 'riddles') setGameState('idle');
      setTimeLeft(null);
      saveStats({ ...stats, consecutiveWins: 0 });
      pickNewItem('riddles');
      playSound('notification');
    }
  }, [timeLeft, activeSubTab]);

  useEffect(() => {
    if (puzzleTimeLeft && puzzleTimeLeft > 0) {
      const timer = setTimeout(() => setPuzzleTimeLeft(puzzleTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (puzzleTimeLeft === 0) {
      if (activeSubTab === 'puzzles') setGameState('idle');
      setPuzzleTimeLeft(null);
      saveStats({ ...stats, puzzleConsecutiveWins: 0 });
      pickNewItem('puzzles');
      playSound('notification');
    }
  }, [puzzleTimeLeft, activeSubTab]);

  useEffect(() => {
    if (pushTimer && pushTimer > 0) {
      const timer = setTimeout(() => setPushTimer(pushTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (pushTimer === 0) {
      handleFail();
      setPushTimer(null);
      setIsPushed(false);
    }
  }, [pushTimer]);

  useEffect(() => {
    if (gameState === 'playing' && (riddleTimer !== null || puzzleTimer !== null)) {
      const currentTimer = activeSubTab === 'riddles' ? riddleTimer : puzzleTimer;
      if (currentTimer !== null && currentTimer > 0) {
        const timer = setTimeout(() => {
          if (activeSubTab === 'riddles') setRiddleTimer(currentTimer - 1);
          else setPuzzleTimer(currentTimer - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (currentTimer === 0) {
        handleFail();
      }
    }
  }, [riddleTimer, puzzleTimer, gameState, activeSubTab]);

  const saveStats = (newStats: any) => {
    setStats(newStats);
    localStorage.setItem('riddle_stats', JSON.stringify(newStats));
  };

  const pickNewItem = (type: 'riddles' | 'puzzles') => {
    const pool = type === 'riddles' ? RIDDLES : PUZZLES;
    const filtered = pool.filter(r => r.category === (type === 'riddles' ? selectedCategory : 'Logic') || r.category === 'Math' || r.category === 'Visual');
    if (filtered.length === 0) return;
    
    const currentItem = type === 'riddles' ? currentRiddle : currentPuzzle;
    let random = filtered[Math.floor(Math.random() * filtered.length)];
    if (filtered.length > 1 && currentItem && random.q === currentItem.q) {
      const others = filtered.filter(r => r.q !== currentItem.q);
      random = others[Math.floor(Math.random() * others.length)];
    }
    
    if (type === 'riddles') setCurrentRiddle(random);
    else setCurrentPuzzle(random);
  };

  const startNewGame = () => {
    pickNewItem(activeSubTab);
    setGameState('playing');
    if (activeSubTab === 'riddles') setRiddleTimer(120);
    else setPuzzleTimer(120);
    setUserAnswer('');
    setFeedback(null);
    setIsPushed(false);
    setPushTimer(null);
  };

  const handleWin = () => {
    const isRiddle = activeSubTab === 'riddles';
    const newWins = isRiddle ? stats.wins + 1 : stats.puzzleWins + 1;
    const newConsecutive = isRiddle ? stats.consecutiveWins + 1 : stats.puzzleConsecutiveWins + 1;
    const newTotal = stats.totalPlays + 1;
    
    let newEarnings = stats.earnings || 0;
    if (newWins % 5 === 0) {
      newEarnings += 0.01111;
    }
    
    setFeedback({ type: 'success', msg: `Correct! Your ${activeSubTab === 'riddles' ? 'intellectual' : 'puzzle-solving'} power is growing.` });
    playSound('correct');
    if (isRiddle) setRiddleTimer(null);
    else setPuzzleTimer(null);
    
    if (newConsecutive >= 20) {
      setGameState('waiting');
      playSound('error'); // Cooldown start
      localStorage.setItem(isRiddle ? 'riddle_last_play' : 'puzzle_last_play', Date.now().toString());
      
      const updatedStats = isRiddle 
        ? { ...stats, wins: newWins, consecutiveWins: 0, totalPlays: newTotal, earnings: newEarnings }
        : { ...stats, puzzleWins: newWins, puzzleConsecutiveWins: 0, totalPlays: newTotal, earnings: newEarnings };
      
      saveStats(updatedStats);
      pickNewItem(activeSubTab);
      toast.success(`Congratulations! You reached 20 ${activeSubTab} wins in a row. Take a 2-hour break!`);
    } else {
      const updatedStats = isRiddle 
        ? { ...stats, wins: newWins, consecutiveWins: newConsecutive, totalPlays: newTotal, earnings: newEarnings }
        : { ...stats, puzzleWins: newWins, puzzleConsecutiveWins: newConsecutive, totalPlays: newTotal, earnings: newEarnings };
      
      saveStats(updatedStats);
      setTimeout(startNewGame, 1000);
    }
  };

  const handleFail = () => {
    const isRiddle = activeSubTab === 'riddles';
    const newFails = isRiddle ? stats.fails + 1 : stats.puzzleFails + 1;
    const newTotal = stats.totalPlays + 1;
    
    const currentItem = isRiddle ? currentRiddle : currentPuzzle;
    setFeedback({ type: 'error', msg: `Incorrect. The answer was: ${currentItem.a}` });
    playSound('wrong');
    if (isRiddle) setRiddleTimer(null);
    else setPuzzleTimer(null);
    
    if (newFails >= 5) {
      setGameState('waiting');
      playSound('error'); // Cooldown start
      localStorage.setItem(isRiddle ? 'riddle_last_play' : 'puzzle_last_play', Date.now().toString());
      
      const updatedStats = isRiddle
        ? { ...stats, fails: 0, consecutiveWins: 0, totalPlays: newTotal }
        : { ...stats, puzzleFails: 0, puzzleConsecutiveWins: 0, totalPlays: newTotal };
        
      saveStats(updatedStats);
      pickNewItem(activeSubTab);
      toast.error(`You failed 5 ${activeSubTab} times. Please try again in 2 hours.`);
    } else {
      const updatedStats = isRiddle
        ? { ...stats, fails: newFails, consecutiveWins: 0, totalPlays: newTotal }
        : { ...stats, puzzleFails: newFails, puzzleConsecutiveWins: 0, totalPlays: newTotal };
        
      saveStats(updatedStats);
      setTimeout(startNewGame, 1000);
    }
  };

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft(prev => prev - 1);
      setFeedback({ type: 'success', msg: 'Riddle skipped. You have ' + (skipsLeft - 1) + ' skips left.' });
      setTimeout(startNewGame, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentItem = activeSubTab === 'riddles' ? currentRiddle : currentPuzzle;
    if (userAnswer.toLowerCase().trim() === currentItem.a.toLowerCase().trim()) {
      handleWin();
    } else {
      handleFail();
    }
  };

  const pushToFriend = () => {
    setShowFriends(true);
  };

  const selectFriend = (friend: any) => {
    setIsPushed(true);
    setPushTimer(120); // 2 minutes
    setShowFriends(false);
    setFeedback({ type: 'success', msg: `Riddle pushed to ${friend.name}. They have 2 minutes to solve it!` });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-display font-bold">Powerful Riddle Game</h2>
          </div>
          <p className="text-white/80 text-lg max-w-xl mb-6">
            Test your intellectual power. Solve challenging riddles across various categories. Play every 2 hours to sharpen your mind.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{activeSubTab === 'riddles' ? 'Riddle' : 'Puzzle'} Wins</p>
              <p className="text-xl font-bold">{activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins}</p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Skips Left</p>
              <p className="text-xl font-bold">{skipsLeft}</p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Consecutive</p>
              <p className="text-xl font-bold">{activeSubTab === 'riddles' ? stats.consecutiveWins : stats.puzzleConsecutiveWins}/20</p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Fails</p>
              <p className="text-xl font-bold text-red-200">{activeSubTab === 'riddles' ? stats.fails : stats.puzzleFails}/5</p>
            </div>
            {gameState === 'waiting' && (activeSubTab === 'riddles' ? timeLeft : puzzleTimeLeft) && (
              <div className="px-4 py-2 bg-amber-500/40 rounded-xl backdrop-blur-md border border-amber-500/30 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Next Play In</p>
                  <p className="text-xl font-bold">{formatTime(activeSubTab === 'riddles' ? timeLeft! : puzzleTimeLeft!)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'riddles', label: 'Riddles', icon: Brain },
          { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              if (gameState !== 'playing') setGameState('idle');
            }}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
              activeSubTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
            {gameState === 'idle' && (
              <div className="space-y-6 max-w-md">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeSubTab === 'riddles' ? <HelpCircle className="w-10 h-10 text-indigo-600" /> : <Puzzle className="w-10 h-10 text-indigo-600" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ready to test your {activeSubTab === 'riddles' ? 'wit' : 'logic'}?</h3>
                <p className="text-gray-500">
                  {activeSubTab === 'riddles' 
                    ? "Select your category and difficulty to begin the riddle challenge." 
                    : "Solve complex puzzles to earn intellectual rewards."}
                </p>
                
                {activeSubTab === 'riddles' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Category</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {['Social media', 'Earthly', 'Planet', 'Internet', 'Human'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Difficulty</label>
                      <select 
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {['Hard', 'Harder', 'Hardest'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button 
                  onClick={startNewGame}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                >
                  Start {activeSubTab === 'riddles' ? 'Game' : 'Puzzle'} <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {gameState === 'playing' && (activeSubTab === 'riddles' ? currentRiddle : currentPuzzle) && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase border border-indigo-100">
                    {(activeSubTab === 'riddles' ? currentRiddle : currentPuzzle).category} • {(activeSubTab === 'riddles' ? currentRiddle : currentPuzzle).difficulty}
                  </span>
                  <div className="flex items-center gap-4">
                    {(activeSubTab === 'riddles' ? riddleTimer : puzzleTimer) !== null && (
                      <div className={clsx(
                        "flex items-center gap-2 font-bold",
                        (activeSubTab === 'riddles' ? riddleTimer! : puzzleTimer!) < 30 ? "text-red-500 animate-pulse" : "text-indigo-600"
                      )}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(activeSubTab === 'riddles' ? riddleTimer! : puzzleTimer!)}</span>
                      </div>
                    )}
                    {isPushed && pushTimer && (
                      <div className="flex items-center gap-2 text-amber-600 font-bold">
                        <Timer className="w-4 h-4 animate-pulse" />
                        <span>Friend Solving: {formatTime(pushTimer)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="py-12 px-6 bg-gray-50 rounded-3xl border border-gray-100 relative">
                  {activeSubTab === 'riddles' ? <HelpCircle className="absolute top-4 left-4 w-8 h-8 text-indigo-200" /> : <Puzzle className="absolute top-4 left-4 w-8 h-8 text-indigo-200" />}
                  <p className="text-2xl font-display font-bold text-gray-800 leading-relaxed italic">
                    "{(activeSubTab === 'riddles' ? currentRiddle : currentPuzzle).q}"
                  </p>
                </div>

                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={clsx(
                      "p-4 rounded-2xl font-bold flex items-center gap-3 justify-center",
                      feedback.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}
                  >
                    {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {feedback.msg}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={isPushed}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-center text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      disabled={!userAnswer.trim() || isPushed}
                      className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                    {activeSubTab === 'riddles' && (
                      <button 
                        type="button"
                        onClick={handleSkip}
                        disabled={skipsLeft === 0 || isPushed}
                        className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <FastForward className="w-5 h-5" /> Skip ({skipsLeft})
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={pushToFriend}
                      disabled={isPushed}
                      className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Share2 className="w-5 h-5" /> Push to Friend
                    </button>
                  </div>
                </form>
              </div>
            )}

            {gameState === 'waiting' && (
              <div className="space-y-6 max-w-md">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeSubTab === 'riddles' ? 'Riddle' : 'Puzzle'} Game Paused</h3>
                <p className="text-gray-500">The {activeSubTab} game is currently recharging its intellectual power. Please come back in a bit.</p>
                {(activeSubTab === 'riddles' ? timeLeft : puzzleTimeLeft) && (
                  <div className="text-4xl font-display font-bold text-indigo-600">
                    {formatTime(activeSubTab === 'riddles' ? timeLeft! : puzzleTimeLeft!)}
                  </div>
                )}
                <button 
                  disabled
                  className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl cursor-not-allowed"
                >
                  Game Locked
                </button>
              </div>
            )}
          </div>

          {/* Analysis Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="text-indigo-600" /> {activeSubTab === 'riddles' ? 'Riddle' : 'Puzzle'} Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {stats.totalPlays > 0 ? Math.round(((activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins) / stats.totalPlays) * 100) : 0}%
                </p>
                <div className="w-full h-1.5 bg-indigo-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${stats.totalPlays > 0 ? ((activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins) / stats.totalPlays) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Total Power</p>
                <p className="text-2xl font-bold text-purple-900">{(activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins) * 10} IQ</p>
                <p className="text-[10px] text-purple-400 mt-1">+10 per win</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Rank Status</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {(activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins) > 50 ? 'Genius' : (activeSubTab === 'riddles' ? stats.wins : stats.puzzleWins) > 20 ? 'Scholar' : 'Novice'}
                </p>
                <p className="text-[10px] text-emerald-400 mt-1">Based on total wins</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Earnings</p>
                <p className="text-2xl font-bold text-amber-900">${(stats.earnings || 0).toFixed(5)}</p>
                <p className="text-[10px] text-amber-400 mt-1">$0.01111 per 5 wins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Leaderboard */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="text-amber-500 w-5 h-5" /> Riddle Masters
            </h3>
            <div className="space-y-4">
              {LEADERBOARD.map((user, i) => (
                <div key={user.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{user.wins} Wins in a row</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{user.score} IQ</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              View Full Leaderboard
            </button>
          </div>

          {/* Browse Friends (Modal Trigger) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Intellectual Circle
            </h3>
            <p className="text-sm text-indigo-600/70 mb-4">Connect with friends to help solve the hardest riddles.</p>
            <div className="flex -space-x-2 mb-4">
              {FRIENDS.map((f, i) => (
                <img key={f.name} src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full border-2 border-white" referrerPolicy="no-referrer" />
              ))}
              <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">+12</div>
            </div>
            <button 
              onClick={() => setShowFriends(true)}
              className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Browse Friends
            </button>
          </div>
        </div>
      </div>

      {/* Friends Modal */}
      <AnimatePresence>
        {showFriends && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFriends(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Select a Friend</h3>
                <button onClick={() => setShowFriends(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                {FRIENDS.map(friend => (
                  <button 
                    key={friend.id}
                    onClick={() => selectFriend(friend)}
                    className="w-full p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl flex items-center gap-4 transition-all group"
                  >
                    <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{friend.name}</p>
                      <p className="text-xs text-gray-500">Online • Ready to help</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-gray-300 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function AIAssistant({ project }: { project: Project | null }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello! I'm your Project Power AI Assistant. How can I help you build ${project?.name || 'your project'} today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const tools = [
    { id: 'idea', name: 'Idea Generator', desc: 'Brainstorm unique project concepts', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'business', name: 'Business Plan Creator', desc: 'Generate comprehensive business plans', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'market', name: 'Market Analysis', desc: 'Analyze competitors and market trends', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'roadmap', name: 'Project Roadmap', desc: 'Create detailed timelines and milestones', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'pitch', name: 'Pitch Deck Generator', desc: 'Design compelling presentations for investors', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'legal', name: 'Legal Doc Assistant', desc: 'Draft NDAs, Terms, and Privacy Policies', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'marketing', name: 'Marketing Strategist', desc: 'Plan your go-to-market and social strategy', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'hiring', name: 'Talent Scout', desc: 'Find the best collaborators for your project', icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: "I've analyzed your request. Based on current market trends, I recommend focusing on user retention first. Would you like me to draft a strategy for that?" }]);
      setIsTyping(false);
    }, 1500);
  };

  const renderToolContent = () => {
    switch(activeTool) {
      case 'idea':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles className="text-amber-500" /> Idea Generator</h3>
            <p className="text-gray-500 mb-6">Input your interests and let AI brainstorm the next big thing.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Industry (e.g., EdTech, Health)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" />
              <input type="text" placeholder="Target Audience (e.g., Students, Seniors)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none" />
              <button className="w-full py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-colors flex items-center justify-center gap-2">
                <Bot className="w-5 h-5" /> Generate Ideas
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'AI-Powered Study Buddy', desc: 'Personalized learning paths for university students.' },
                { title: 'SkillSwap Platform', desc: 'Peer-to-peer skill exchange network.' }
              ].map((idea, i) => (
                <div key={idea.title} className="p-4 border border-[var(--color-supreme-gold)]/30 bg-[var(--color-supreme-gold)]/5 rounded-xl hover:bg-[var(--color-supreme-gold)]/10 transition-colors cursor-pointer">
                  <h4 className="font-bold text-gray-900">{idea.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{idea.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'business':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><FileText className="text-blue-500" /> Business Plan Creator</h3>
            <p className="text-gray-500 mb-6">Generate a structured, investor-ready business plan.</p>
            <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
              {['Executive Summary', 'Market Analysis', 'Financials', 'Operations'].map((tab, i) => (
                <button key={tab} className={clsx("px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap", i === 0 ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100")}>{tab}</button>
              ))}
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[200px]">
              <p className="text-sm text-gray-500 italic mb-4">Click generate to let AI write your Executive Summary based on your project details.</p>
              <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" /> Auto-Generate Section
              </button>
            </div>
          </div>
        );
      case 'market':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><TrendingUp className="text-green-500" /> Market Analysis</h3>
            <p className="text-gray-500 mb-6">Real-time data and competitor insights.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-green-600 font-bold uppercase">TAM (Total Addressable Market)</p>
                <p className="text-2xl font-bold text-green-900 mt-1">$4.2B</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase">CAGR (5 Years)</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">12.5%</p>
              </div>
            </div>
            <h4 className="font-bold text-gray-900 mb-3">Top Competitors</h4>
            <div className="space-y-2">
              {['Competitor A', 'Competitor B', 'Competitor C'].map((comp, i) => (
                <div key={comp} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">{comp}</span>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">Market Share: {30 - i * 10}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'roadmap':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Target className="text-purple-500" /> Project Roadmap</h3>
            <p className="text-gray-500 mb-6">AI-generated milestones and timelines.</p>
            <div className="relative border-l-2 border-purple-200 ml-3 space-y-6">
              {[
                { m: 'Month 1', t: 'MVP Development & Core Features' },
                { m: 'Month 2', t: 'Beta Testing & User Feedback' },
                { m: 'Month 3', t: 'Public Launch & Marketing Push' }
              ].map((item, i) => (
                <div key={item.m} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-purple-500 border-4 border-white"></div>
                  <h4 className="font-bold text-gray-900">{item.m}</h4>
                  <p className="text-sm text-gray-600">{item.t}</p>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-3 bg-purple-50 text-purple-600 font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 border border-purple-200">
              <Plus className="w-5 h-5" /> Add Custom Milestone
            </button>
          </div>
        );
      case 'pitch':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Zap className="text-rose-500" /> Pitch Deck Generator</h3>
            <p className="text-gray-500 mb-6">Design compelling presentations for investors.</p>
            <div className="flex gap-4 h-64">
              <div className="w-1/3 space-y-2 overflow-y-auto hide-scrollbar pr-2">
                {['Title Slide', 'The Problem', 'Our Solution', 'Market Size', 'Business Model'].map((slide, i) => (
                  <div key={slide} className={clsx("p-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors", i === 0 ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-rose-300")}>
                    {i + 1}. {slide}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center p-6 text-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-50 rounded-xl"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Project Name</h2>
                  <p className="text-rose-200">The future of our industry.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Tools Area */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {activeTool ? (
          <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTool(null)} 
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--color-supreme-gold)] mb-6 transition-colors bg-gray-50 hover:bg-[var(--color-supreme-gold)]/10 px-3 py-1.5 rounded-lg w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tools
            </button>
            {renderToolContent()}
          </div>
        ) : (
          <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
            <h3 className="text-xl font-bold text-gray-900 mb-6">AI Power Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map((tool, i) => (
                <div 
                  key={tool.id} 
                  onClick={() => setActiveTool(tool.id)}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--color-supreme-gold)]/30 transition-all cursor-pointer group"
                >
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm", tool.bg, tool.color)}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[var(--color-supreme-gold)] transition-colors">{tool.name}</h3>
                  <p className="text-sm text-gray-500">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-1 shadow-xl flex flex-col border border-[var(--color-supreme-gold)]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="bg-black/40 rounded-[1.4rem] p-5 flex-1 flex flex-col relative z-10 backdrop-blur-xl border border-white/5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl border border-[var(--color-supreme-gold)]/30 shadow-[0_0_10px_rgba(184,134,11,0.2)]">
              <Bot className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-[var(--color-supreme-gold)] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 mb-4 pr-2">
            {messages.map((msg, i) => (
              <div key={i + msg.content} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-gray-800 border border-gray-700" : "bg-[var(--color-supreme-gold)]"
                )}>
                  {msg.role === 'user' ? <Users className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-black" />}
                </div>
                <div className={clsx(
                  "p-3 text-sm rounded-2xl max-w-[85%]",
                  msg.role === 'user' 
                    ? "bg-gray-800 text-white rounded-tr-none border border-gray-700" 
                    : "bg-[var(--color-supreme-gold)]/10 text-gray-200 rounded-tl-none border border-[var(--color-supreme-gold)]/20"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div className="bg-[var(--color-supreme-gold)]/10 rounded-2xl rounded-tl-none p-4 border border-[var(--color-supreme-gold)]/20 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[var(--color-supreme-gold)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
              {['Review my pitch', 'Suggest marketing channels', 'Calculate TAM'].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => setChatInput(prompt)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI for help..." 
                className="w-full pl-4 pr-12 py-3.5 bg-black border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-[var(--color-supreme-gold)] outline-none text-sm transition-all"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


function MillionDeals() {
  const { balance, sendPayment, receivePayment } = useWallet();
  const { playSound } = useSound();
  const [gameState, setGameState] = useState<'lobby' | 'category_selection' | 'playing' | 'result' | 'level_up' | 'game_over'>('lobby');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, totalTime: 0 });
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', message: string } | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [payout, setPayout] = useState<number>(0);

  const categories = [
    { id: 'maths', name: 'Maths', icon: PieChart, color: 'blue' },
    { id: 'english', name: 'English', icon: FileText, color: 'green' },
    { id: 'science', name: 'Science', icon: Zap, color: 'yellow' },
    { id: 'engineering', name: 'Engineering', icon: Target, color: 'red' },
    { id: 'physics', name: 'Physics', icon: Activity, color: 'purple' },
    { id: 'medicine', name: 'Medicine', icon: Activity, color: 'pink' },
    { id: 'brain', name: 'Brain', icon: Brain, color: 'indigo' },
    { id: 'biology', name: 'Biology', icon: Activity, color: 'emerald' },
    { id: 'general', name: 'General', icon: Globe, color: 'orange' },
    { id: 'geography', name: 'Geography', icon: Globe, color: 'cyan' },
    { id: 'history', name: 'History', icon: Clock, color: 'amber' },
  ];

  const levels = [
    { id: 1, name: 'Rich Journey', pointsPerQuestion: 50, questionsToPass: 20, targetPoints: 1000 },
    { id: 2, name: 'Wealthy Home', pointsPerQuestion: 75, questionsToPass: 20, targetPoints: 1500 },
    { id: 3, name: 'Stars Journey', pointsPerQuestion: 100, questionsToPass: 20, targetPoints: 2000 },
    { id: 4, name: 'Home of Honour', pointsPerQuestion: 250, questionsToPass: 20, targetPoints: 5000 },
  ];

  const generateQuestion = (category: string, level: number) => {
    if (category === 'maths') {
      const ops = ['+', '-', '*', '/', '**', 'sqrt'];
      // Level 1: +, -
      // Level 2: +, -, *
      // Level 3: +, -, *, /
      // Level 4: +, -, *, /, **, sqrt
      let availableOps = ['+', '-'];
      if (level >= 2) availableOps.push('*');
      if (level >= 3) availableOps.push('/');
      if (level >= 4) availableOps.push('**', 'sqrt');

      const op = availableOps[Math.floor(Math.random() * availableOps.length)];
      let num1, num2, question, correctAnswer;

      if (op === '+') {
        num1 = Math.floor(Math.random() * (50 * level)) + 5;
        num2 = Math.floor(Math.random() * (50 * level)) + 5;
        question = `${num1} + ${num2} = ?`;
        correctAnswer = num1 + num2;
      } else if (op === '-') {
        num1 = Math.floor(Math.random() * (70 * level)) + 20;
        num2 = Math.floor(Math.random() * num1);
        question = `${num1} - ${num2} = ?`;
        correctAnswer = num1 - num2;
      } else if (op === '*') {
        num1 = Math.floor(Math.random() * (10 * level)) + 2;
        num2 = Math.floor(Math.random() * (10 * level)) + 2;
        question = `${num1} × ${num2} = ?`;
        correctAnswer = num1 * num2;
      } else if (op === '/') {
        num2 = Math.floor(Math.random() * (5 * level)) + 2;
        correctAnswer = Math.floor(Math.random() * (10 * level)) + 2;
        num1 = num2 * correctAnswer;
        question = `${num1} ÷ ${num2} = ?`;
      } else if (op === '**') {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = level >= 4 ? 3 : 2;
        question = `${num1} to the power of ${num2} = ?`;
        correctAnswer = Math.pow(num1, num2);
      } else { // sqrt
        correctAnswer = Math.floor(Math.random() * 15) + 2;
        num1 = correctAnswer * correctAnswer;
        question = `Square root of ${num1} = ?`;
      }

      const optionsSet = new Set([correctAnswer]);
      while (optionsSet.size < 4) {
        const offset = Math.floor(Math.random() * 30) - 15;
        if (offset !== 0 && correctAnswer + offset >= 0) optionsSet.add(correctAnswer + offset);
      }
      const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

      return { text: question, options, correctAnswer };
    }

    const questionPool: Record<string, any[]> = {
      english: [
        { q: "Which of these is a synonym for 'Abundant'?", a: "Plentiful", o: ["Scarce", "Rare", "Limited"] },
        { q: "Identify the correctly spelled word:", a: "Accommodate", o: ["Acomodate", "Accomodate", "Acommodate"] },
        { q: "What is the antonym of 'Benevolent'?", a: "Malevolent", o: ["Kind", "Generous", "Friendly"] },
        { q: "Which part of speech is the word 'Quickly'?", a: "Adverb", o: ["Adjective", "Noun", "Verb"] },
        { q: "Complete the proverb: 'A stitch in time saves ___'", a: "Nine", o: ["Seven", "Ten", "Five"] },
        { q: "What is a group of lions called?", a: "A pride", o: ["A pack", "A herd", "A flock"] },
        { q: "Which of these is an onomatopoeia?", a: "Buzz", o: ["Run", "Happy", "Large"] },
        { q: "What is the plural of 'Cactus'?", a: "Cacti", o: ["Cactuses", "Cactis", "Cactum"] },
        { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", o: ["Charles Dickens", "Mark Twain", "Jane Austen"] },
        { q: "What is the comparative form of 'Good'?", a: "Better", o: ["Best", "Gooder", "More good"] },
        { q: "Which word is a palindrome?", a: "Racecar", o: ["Running", "Speed", "Fast"] },
        { q: "What is the meaning of 'Ebullient'?", a: "Cheerful and full of energy", o: ["Sad and depressed", "Angry and violent", "Tired and sleepy"] },
        { q: "Which of these is a metaphor?", a: "The world is a stage", o: ["As brave as a lion", "The wind whispered", "Bang!"] },
        { q: "What is the past participle of 'Drink'?", a: "Drunk", o: ["Drank", "Drinked", "Drunken"] },
        { q: "Which word means 'to study or examine closely'?", a: "Peruse", o: ["Ignore", "Glance", "Forget"] },
        { q: "What is the superlative form of 'Far'?", a: "Farthest", o: ["Farther", "Farest", "Most far"] },
        { q: "Which of these is a collective noun for crows?", a: "A murder", o: ["A flock", "A swarm", "A colony"] },
        { q: "What is the meaning of the idiom 'Piece of cake'?", a: "Something very easy", o: ["Something delicious", "A difficult task", "A small portion"] },
        { q: "Which word is an adjective in: 'The blue sky is beautiful'?", a: "Blue", o: ["Sky", "Is", "The"] },
        { q: "What is the feminine of 'Wizard'?", a: "Witch", o: ["Wizarded", "Witcher", "Enchantress"] },
        { q: "Which of these is a conjunction?", a: "Because", o: ["Quickly", "Beautiful", "Running"] },
        { q: "What is the meaning of 'Ephemeral'?", a: "Lasting for a very short time", o: ["Eternal", "Strong", "Beautiful"] },
        { q: "Identify the figure of speech: 'The stars danced playfully'", a: "Personification", o: ["Simile", "Metaphor", "Hyperbole"] },
        { q: "What is the plural of 'Criterion'?", a: "Criteria", o: ["Criterions", "Criterias", "Criterium"] },
        { q: "Who is the author of '1984'?", a: "George Orwell", o: ["Aldous Huxley", "Ray Bradbury", "J.R.R. Tolkien"] },
      ],
      science: [
        { q: "What is the chemical symbol for Gold?", a: "Au", o: ["Ag", "Gd", "Go"] },
        { q: "Which planet is known as the Red Planet?", a: "Mars", o: ["Venus", "Jupiter", "Saturn"] },
        { q: "What is the powerhouse of the cell?", a: "Mitochondria", o: ["Nucleus", "Ribosome", "Golgi Body"] },
        { q: "At what temperature does water boil in Celsius?", a: "100°C", o: ["90°C", "110°C", "120°C"] },
        { q: "What gas do plants absorb during photosynthesis?", a: "Carbon Dioxide", o: ["Oxygen", "Nitrogen", "Hydrogen"] },
        { q: "Which is the hardest natural substance on Earth?", a: "Diamond", o: ["Gold", "Iron", "Graphite"] },
        { q: "What is the center of an atom called?", a: "Nucleus", o: ["Proton", "Neutron", "Electron"] },
        { q: "How many planets are in our solar system?", a: "8", o: ["7", "9", "10"] },
        { q: "What is the study of plants called?", a: "Botany", o: ["Zoology", "Geology", "Biology"] },
        { q: "Which organ in the human body produces insulin?", a: "Pancreas", o: ["Liver", "Kidney", "Heart"] },
        { q: "What is the most abundant gas in Earth's atmosphere?", a: "Nitrogen", o: ["Oxygen", "Carbon Dioxide", "Argon"] },
        { q: "Which planet has the most moons?", a: "Saturn", o: ["Jupiter", "Mars", "Earth"] },
        { q: "What is the speed of sound in air?", a: "343 m/s", o: ["150 m/s", "1000 m/s", "500 m/s"] },
        { q: "What is the study of the stars called?", a: "Astronomy", o: ["Astrology", "Geology", "Meteorology"] },
        { q: "Which part of the plant is responsible for reproduction?", a: "Flower", o: ["Leaf", "Stem", "Root"] },
        { q: "What is the chemical formula for table salt?", a: "NaCl", o: ["H2O", "CO2", "KCl"] },
        { q: "Which planet is the largest in our solar system?", a: "Jupiter", o: ["Saturn", "Neptune", "Uranus"] },
        { q: "What is the process of a solid turning directly into a gas?", a: "Sublimation", o: ["Evaporation", "Condensation", "Melting"] },
        { q: "Who proposed the theory of evolution?", a: "Charles Darwin", o: ["Isaac Newton", "Albert Einstein", "Marie Curie"] },
        { q: "What is the unit of electrical current?", a: "Ampere", o: ["Volt", "Ohm", "Watt"] },
        { q: "Which gas is known as 'Laughing Gas'?", a: "Nitrous Oxide", o: ["Carbon Monoxide", "Nitrogen Dioxide", "Sulfur Dioxide"] },
        { q: "What is the main component of the sun?", a: "Hydrogen", o: ["Helium", "Oxygen", "Carbon"] },
        { q: "Which vitamin is produced when skin is exposed to sunlight?", a: "Vitamin D", o: ["Vitamin A", "Vitamin C", "Vitamin E"] },
        { q: "What is the study of fossils called?", a: "Paleontology", o: ["Archaeology", "Geology", "Biology"] },
        { q: "Which part of the brain controls balance and coordination?", a: "Cerebellum", o: ["Cerebrum", "Brainstem", "Thalamus"] },
      ],
      engineering: [
        { q: "What does 'CAD' stand for in engineering?", a: "Computer-Aided Design", o: ["Computer-Aided Drafting", "Centralized Asset Design", "Control and Design"] },
        { q: "Which material is known for its high strength-to-weight ratio?", a: "Titanium", o: ["Iron", "Lead", "Copper"] },
        { q: "What is the unit of electrical resistance?", a: "Ohm", o: ["Volt", "Ampere", "Watt"] },
        { q: "In thermodynamics, what is the measure of disorder?", a: "Entropy", o: ["Enthalpy", "Energy", "Equilibrium"] },
        { q: "What type of bridge uses cables to support the deck?", a: "Suspension", o: ["Arch", "Beam", "Truss"] },
        { q: "What does 'BIM' stand for?", a: "Building Information Modeling", o: ["Basic Internal Module", "Building Intelligent Management", "Basic Infrastructure Model"] },
        { q: "Which engineer is credited with inventing the steam engine?", a: "James Watt", o: ["Thomas Edison", "Nikola Tesla", "Henry Ford"] },
        { q: "What is the main component of steel?", a: "Iron", o: ["Copper", "Aluminum", "Zinc"] },
        { q: "What does 'HVAC' stand for?", a: "Heating, Ventilation, and Air Conditioning", o: ["High Voltage Alternating Current", "Heat Volume and Cooling", "Home Ventilation and Control"] },
        { q: "Which type of gear has teeth cut at an angle?", a: "Helical", o: ["Spur", "Bevel", "Worm"] },
        { q: "What is the purpose of a flywheel?", a: "Store rotational energy", o: ["Increase friction", "Cool the engine", "Reduce weight"] },
        { q: "Which law states that stress is proportional to strain?", a: "Hooke's Law", o: ["Newton's Law", "Ohm's Law", "Pascal's Law"] },
        { q: "What does 'CNC' stand for?", a: "Computer Numerical Control", o: ["Central Network Control", "Computerized Network Center", "Centralized Numerical Code"] },
        { q: "Which metal is the best conductor of electricity?", a: "Silver", o: ["Copper", "Gold", "Aluminum"] },
        { q: "What is the main function of a transformer?", a: "Change voltage levels", o: ["Store electricity", "Convert AC to DC", "Increase current"] },
        { q: "What does 'PLC' stand for in industrial automation?", a: "Programmable Logic Controller", o: ["Power Line Connection", "Process Level Control", "Programmable Link Center"] },
        { q: "Which type of stress occurs when a material is pulled apart?", a: "Tensile", o: ["Compressive", "Shear", "Torsional"] },
        { q: "What is the term for a material that returns to its original shape after deformation?", a: "Elastic", o: ["Plastic", "Brittle", "Ductile"] },
        { q: "Which fluid property describes its resistance to flow?", a: "Viscosity", o: ["Density", "Pressure", "Surface Tension"] },
        { q: "What is the primary purpose of a heat exchanger?", a: "Transfer heat between two fluids", o: ["Generate electricity", "Store thermal energy", "Cool the environment"] },
        { q: "Which type of turbine is used in hydroelectric power plants?", a: "Kaplan or Francis", o: ["Steam", "Gas", "Wind"] },
        { q: "What does 'SCADA' stand for?", a: "Supervisory Control and Data Acquisition", o: ["System Control and Design Analysis", "Standardized Computer and Data Access", "Secure Control and Data Automation"] },
        { q: "Which material property is the measure of its resistance to indentation?", a: "Hardness", o: ["Toughness", "Strength", "Stiffness"] },
        { q: "What is the main advantage of using AC over DC for long-distance power transmission?", a: "Easier to change voltage levels", o: ["Lower resistance", "Higher efficiency", "Safer to handle"] },
        { q: "Which type of engine uses spark plugs to ignite the fuel-air mixture?", a: "Gasoline", o: ["Diesel", "Jet", "Steam"] },
      ],
      physics: [
        { q: "What is Newton's First Law also known as?", a: "Law of Inertia", o: ["Law of Acceleration", "Law of Action-Reaction", "Law of Gravity"] },
        { q: "What is the speed of light in a vacuum?", a: "299,792,458 m/s", o: ["300,000 m/s", "150,000,000 m/s", "1,000,000 m/s"] },
        { q: "Who developed the theory of General Relativity?", a: "Albert Einstein", o: ["Isaac Newton", "Niels Bohr", "Stephen Hawking"] },
        { q: "What is the unit of force?", a: "Newton", o: ["Joule", "Pascal", "Watt"] },
        { q: "Which particle in an atom has a negative charge?", a: "Electron", o: ["Proton", "Neutron", "Positron"] },
        { q: "What is the acceleration due to gravity on Earth?", a: "9.8 m/s²", o: ["8.9 m/s²", "10.2 m/s²", "7.5 m/s²"] },
        { q: "What is the unit of frequency?", a: "Hertz", o: ["Decibel", "Ohm", "Ampere"] },
        { q: "Which color of light has the longest wavelength?", a: "Red", o: ["Blue", "Violet", "Green"] },
        { q: "What is the process of a liquid turning into a gas?", a: "Evaporation", o: ["Condensation", "Sublimation", "Freezing"] },
        { q: "What is the first law of thermodynamics?", a: "Conservation of Energy", o: ["Entropy", "Absolute Zero", "Action-Reaction"] },
        { q: "What is the unit of power?", a: "Watt", o: ["Joule", "Volt", "Ampere"] },
        { q: "Which lens is thicker in the middle than at the edges?", a: "Convex", o: ["Concave", "Flat", "Cylindrical"] },
        { q: "What is the study of light called?", a: "Optics", o: ["Acoustics", "Mechanics", "Thermodynamics"] },
        { q: "What is the unit of electric current?", a: "Ampere", o: ["Volt", "Ohm", "Watt"] },
        { q: "What is the force that opposes motion between two surfaces?", a: "Friction", o: ["Gravity", "Inertia", "Momentum"] },
        { q: "What is the unit of energy?", a: "Joule", o: ["Newton", "Watt", "Pascal"] },
        { q: "Which law states that for every action, there is an equal and opposite reaction?", a: "Newton's Third Law", o: ["Newton's Second Law", "Law of Gravity", "Ohm's Law"] },
        { q: "What is the term for the bending of light as it passes from one medium to another?", a: "Refraction", o: ["Reflection", "Diffraction", "Dispersion"] },
        { q: "What is the unit of magnetic flux density?", a: "Tesla", o: ["Weber", "Henry", "Farad"] },
        { q: "Which state of matter has a definite volume but no definite shape?", a: "Liquid", o: ["Solid", "Gas", "Plasma"] },
        { q: "What is the term for the amount of matter in an object?", a: "Mass", o: ["Weight", "Volume", "Density"] },
        { q: "Who is known for the discovery of radioactivity?", a: "Marie Curie", o: ["Albert Einstein", "Isaac Newton", "Ernest Rutherford"] },
        { q: "What is the unit of pressure?", a: "Pascal", o: ["Newton", "Joule", "Watt"] },
        { q: "Which type of wave requires a medium to travel through?", a: "Mechanical", o: ["Electromagnetic", "Light", "Radio"] },
        { q: "What is the term for the energy an object possesses due to its motion?", a: "Kinetic Energy", o: ["Potential Energy", "Thermal Energy", "Chemical Energy"] },
      ],
      medicine: [
        { q: "What is the normal human body temperature in Celsius?", a: "37°C", o: ["35°C", "39°C", "40°C"] },
        { q: "Which organ filters blood in the human body?", a: "Kidneys", o: ["Heart", "Lungs", "Stomach"] },
        { q: "What is the largest bone in the human body?", a: "Femur", o: ["Skull", "Humerus", "Tibia"] },
        { q: "Which vitamin is primarily obtained from sunlight?", a: "Vitamin D", o: ["Vitamin A", "Vitamin C", "Vitamin B12"] },
        { q: "What is the medical term for high blood pressure?", a: "Hypertension", o: ["Hypotension", "Hyperglycemia", "Hypoglycemia"] },
        { q: "What is the main function of red blood cells?", a: "Carry oxygen", o: ["Fight infection", "Clot blood", "Produce hormones"] },
        { q: "Which part of the eye is sensitive to light?", a: "Retina", o: ["Cornea", "Iris", "Lens"] },
        { q: "What is the smallest bone in the human body?", a: "Stapes", o: ["Incus", "Malleus", "Patella"] },
        { q: "What is the common name for the trachea?", a: "Windpipe", o: ["Throat", "Esophagus", "Voice box"] },
        { q: "Which antibiotic was the first to be discovered?", a: "Penicillin", o: ["Amoxicillin", "Tetracycline", "Streptomycin"] },
        { q: "What is the study of the heart called?", a: "Cardiology", o: ["Neurology", "Dermatology", "Oncology"] },
        { q: "How many ribs are in the human body?", a: "24", o: ["12", "20", "30"] },
        { q: "Which organ produces bile?", a: "Liver", o: ["Gallbladder", "Pancreas", "Stomach"] },
        { q: "What is the medical term for the kneecap?", a: "Patella", o: ["Scapula", "Clavicle", "Tibia"] },
        { q: "Which type of blood vessel carries blood away from the heart?", a: "Artery", o: ["Vein", "Capillary", "Venule"] },
        { q: "What is the largest organ in the human body?", a: "Skin", o: ["Liver", "Brain", "Lungs"] },
        { q: "Which part of the brain controls breathing and heart rate?", a: "Brainstem", o: ["Cerebrum", "Cerebellum", "Thalamus"] },
        { q: "What is the medical term for a heart attack?", a: "Myocardial Infarction", o: ["Stroke", "Cardiac Arrest", "Angina"] },
        { q: "Which vitamin is essential for blood clotting?", a: "Vitamin K", o: ["Vitamin C", "Vitamin A", "Vitamin E"] },
        { q: "What is the main function of white blood cells?", a: "Fight infection", o: ["Carry oxygen", "Clot blood", "Transport nutrients"] },
        { q: "Which organ is responsible for detoxifying the blood?", a: "Liver", o: ["Kidney", "Spleen", "Pancreas"] },
        { q: "What is the medical term for the collarbone?", a: "Clavicle", o: ["Scapula", "Sternum", "Humerus"] },
        { q: "Which hormone regulates blood sugar levels?", a: "Insulin", o: ["Adrenaline", "Estrogen", "Testosterone"] },
        { q: "What is the study of skin called?", a: "Dermatology", o: ["Neurology", "Oncology", "Pediatrics"] },
        { q: "How many teeth does an average adult human have?", a: "32", o: ["28", "30", "34"] },
      ],
      brain: [
        { q: "Which part of the brain is responsible for balance?", a: "Cerebellum", o: ["Cerebrum", "Brainstem", "Thalamus"] },
        { q: "What is the basic functional unit of the nervous system?", a: "Neuron", o: ["Synapse", "Axon", "Dendrite"] },
        { q: "Which lobe of the brain is associated with vision?", a: "Occipital", o: ["Frontal", "Parietal", "Temporal"] },
        { q: "What chemical messenger transmits signals between neurons?", a: "Neurotransmitter", o: ["Hormone", "Enzyme", "Protein"] },
        { q: "The 'fight or flight' response is controlled by which system?", a: "Sympathetic", o: ["Parasympathetic", "Central", "Somatic"] },
        { q: "What is the outer layer of the brain called?", a: "Cerebral Cortex", o: ["Meninges", "Medulla", "Pons"] },
        { q: "Which part of the brain connects the two hemispheres?", a: "Corpus Callosum", o: ["Hippocampus", "Amygdala", "Hypothalamus"] },
        { q: "What is the study of the nervous system called?", a: "Neuroscience", o: ["Psychology", "Biology", "Physiology"] },
        { q: "Which part of the brain is responsible for memory?", a: "Hippocampus", o: ["Amygdala", "Thalamus", "Hypothalamus"] },
        { q: "What is the gap between two neurons called?", a: "Synapse", o: ["Axon", "Dendrite", "Node"] },
        { q: "Which part of the brain controls involuntary actions like breathing?", a: "Medulla Oblongata", o: ["Cerebellum", "Cerebrum", "Thalamus"] },
        { q: "What is the protective covering of the brain called?", a: "Meninges", o: ["Skull", "Cortex", "Scalp"] },
        { q: "Which hemisphere is typically associated with logic and math?", a: "Left", o: ["Right", "Both", "Neither"] },
        { q: "What is the master gland of the brain?", a: "Pituitary", o: ["Pineal", "Adrenal", "Thyroid"] },
        { q: "Which part of the brain is responsible for emotions?", a: "Amygdala", o: ["Hippocampus", "Thalamus", "Pons"] },
        { q: "What is the main function of the frontal lobe?", a: "Decision making and planning", o: ["Vision", "Hearing", "Balance"] },
        { q: "Which part of the brain regulates body temperature?", a: "Hypothalamus", o: ["Thalamus", "Pituitary", "Pineal"] },
        { q: "What is the term for the brain's ability to reorganize itself?", a: "Neuroplasticity", o: ["Neurogenesis", "Synaptic Pruning", "Myelination"] },
        { q: "Which neurotransmitter is often associated with pleasure and reward?", a: "Dopamine", o: ["Serotonin", "GABA", "Acetylcholine"] },
        { q: "What is the largest part of the human brain?", a: "Cerebrum", o: ["Cerebellum", "Brainstem", "Medulla"] },
        { q: "Which part of the brain acts as a relay station for sensory information?", a: "Thalamus", o: ["Hypothalamus", "Amygdala", "Hippocampus"] },
        { q: "What is the term for a sudden disruption of blood flow to the brain?", a: "Stroke", o: ["Seizure", "Concussion", "Aneurysm"] },
        { q: "Which part of the brain is involved in language production?", a: "Broca's area", o: ["Wernicke's area", "Visual cortex", "Motor cortex"] },
        { q: "What is the main function of the parietal lobe?", a: "Processing sensory information", o: ["Vision", "Hearing", "Memory"] },
        { q: "Which neurotransmitter is involved in sleep and mood regulation?", a: "Serotonin", o: ["Dopamine", "Adrenaline", "Glutamate"] },
      ],
      biology: [
        { q: "Who is known as the father of genetics?", a: "Gregor Mendel", o: ["Charles Darwin", "Louis Pasteur", "Robert Hooke"] },
        { q: "What is the process by which plants make their food?", a: "Photosynthesis", o: ["Respiration", "Transpiration", "Digestion"] },
        { q: "How many chambers does a human heart have?", a: "4", o: ["2", "3", "5"] },
        { q: "What is the genetic material of most organisms?", a: "DNA", o: ["RNA", "Protein", "Lipid"] },
        { q: "Which blood type is known as the universal donor?", a: "O negative", o: ["AB positive", "A negative", "B positive"] },
        { q: "What is the largest organ in the human body?", a: "Skin", o: ["Liver", "Heart", "Lungs"] },
        { q: "What are the building blocks of proteins?", a: "Amino acids", o: ["Nucleotides", "Fatty acids", "Sugars"] },
        { q: "Which organelle is responsible for protein synthesis?", a: "Ribosome", o: ["Mitochondria", "Nucleus", "Vacuole"] },
        { q: "What is the study of fungi called?", a: "Mycology", o: ["Botany", "Zoology", "Phycology"] },
        { q: "Which gas is released by plants during photosynthesis?", a: "Oxygen", o: ["Carbon Dioxide", "Nitrogen", "Hydrogen"] },
        { q: "What is the basic unit of life?", a: "Cell", o: ["Atom", "Molecule", "Organ"] },
        { q: "Which part of the cell contains the genetic information?", a: "Nucleus", o: ["Cytoplasm", "Cell Membrane", "Ribosome"] },
        { q: "What is the process of cell division called?", a: "Mitosis", o: ["Meiosis", "Fusion", "Fission"] },
        { q: "Which animal is known as the king of the jungle?", a: "Lion", o: ["Tiger", "Elephant", "Leopard"] },
        { q: "What is the study of animals called?", a: "Zoology", o: ["Botany", "Biology", "Ecology"] },
        { q: "What is the term for the variety of life in a particular habitat?", a: "Biodiversity", o: ["Ecosystem", "Community", "Population"] },
        { q: "Which organ in the human body is responsible for pumping blood?", a: "Heart", o: ["Lungs", "Liver", "Kidneys"] },
        { q: "What is the process of a caterpillar turning into a butterfly?", a: "Metamorphosis", o: ["Evolution", "Growth", "Mutation"] },
        { q: "Which type of cell does not have a nucleus?", a: "Prokaryotic", o: ["Eukaryotic", "Animal", "Plant"] },
        { q: "What is the term for an organism that makes its own food?", a: "Autotroph", o: ["Heterotroph", "Decomposer", "Parasite"] },
        { q: "Which part of the human skeleton protects the brain?", a: "Skull", o: ["Ribcage", "Pelvis", "Spine"] },
        { q: "What is the study of the environment and living things called?", a: "Ecology", o: ["Biology", "Geology", "Meteorology"] },
        { q: "Which bird is known for its ability to mimic human speech?", a: "Parrot", o: ["Eagle", "Owl", "Penguin"] },
        { q: "What is the term for the natural home or environment of an organism?", a: "Habitat", o: ["Niche", "Biome", "Territory"] },
        { q: "Which gas do humans exhale as a waste product?", a: "Carbon Dioxide", o: ["Oxygen", "Nitrogen", "Hydrogen"] },
      ],
      general: [
        { q: "Which is the largest ocean on Earth?", a: "Pacific Ocean", o: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] },
        { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", o: ["Vincent van Gogh", "Pablo Picasso", "Claude Monet"] },
        { q: "What is the capital city of France?", a: "Paris", o: ["London", "Berlin", "Rome"] },
        { q: "Which country is known as the Land of the Rising Sun?", a: "Japan", o: ["China", "South Korea", "Thailand"] },
        { q: "What is the smallest country in the world?", a: "Vatican City", o: ["Monaco", "Nauru", "Tuvalu"] },
        { q: "Which is the longest river in the world?", a: "Nile", o: ["Amazon", "Yangtze", "Mississippi"] },
        { q: "Who was the first person to walk on the moon?", a: "Neil Armstrong", o: ["Buzz Aldrin", "Yuri Gagarin", "John Glenn"] },
        { q: "What is the currency of the United Kingdom?", a: "Pound Sterling", o: ["Euro", "Dollar", "Yen"] },
        { q: "Which is the largest continent by land area?", a: "Asia", o: ["Africa", "North America", "Europe"] },
        { q: "Who invented the telephone?", a: "Alexander Graham Bell", o: ["Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"] },
        { q: "What is the capital of Japan?", a: "Tokyo", o: ["Osaka", "Kyoto", "Nagoya"] },
        { q: "Which planet is closest to the sun?", a: "Mercury", o: ["Venus", "Earth", "Mars"] },
        { q: "Who wrote the play 'Hamlet'?", a: "William Shakespeare", o: ["Christopher Marlowe", "Ben Jonson", "John Webster"] },
        { q: "What is the largest desert in the world?", a: "Sahara", o: ["Gobi", "Kalahari", "Arabian"] },
        { q: "Which element has the chemical symbol 'O'?", a: "Oxygen", o: ["Gold", "Silver", "Iron"] },
        { q: "What is the capital of Australia?", a: "Canberra", o: ["Sydney", "Melbourne", "Brisbane"] },
        { q: "Who was the first President of the United States?", a: "George Washington", o: ["Thomas Jefferson", "Abraham Lincoln", "John Adams"] },
        { q: "Which is the tallest mountain in the world?", a: "Mount Everest", o: ["K2", "Kangchenjunga", "Lhotse"] },
        { q: "What is the main ingredient in guacamole?", a: "Avocado", o: ["Tomato", "Onion", "Pepper"] },
        { q: "Which country gifted the Statue of Liberty to the USA?", a: "France", o: ["Germany", "Italy", "Spain"] },
        { q: "What is the capital of Canada?", a: "Ottawa", o: ["Toronto", "Vancouver", "Montreal"] },
        { q: "Who discovered penicillin?", a: "Alexander Fleming", o: ["Louis Pasteur", "Marie Curie", "Robert Koch"] },
        { q: "Which is the largest animal in the world?", a: "Blue Whale", o: ["Elephant", "Giraffe", "Colossal Squid"] },
        { q: "What is the capital of Italy?", a: "Rome", o: ["Milan", "Venice", "Florence"] },
        { q: "Who is the author of the 'Harry Potter' series?", a: "J.K. Rowling", o: ["J.R.R. Tolkien", "George R.R. Martin", "C.S. Lewis"] },
      ],
      geography: [
        { q: "Which is the largest country by land area?", a: "Russia", o: ["Canada", "China", "USA"] },
        { q: "What is the longest river in the world?", a: "Nile", o: ["Amazon", "Yangtze", "Mississippi"] },
        { q: "Which continent is the Sahara Desert located in?", a: "Africa", o: ["Asia", "Australia", "South America"] },
        { q: "What is the capital of Italy?", a: "Rome", o: ["Milan", "Venice", "Florence"] },
        { q: "Which ocean lies between Africa and Australia?", a: "Indian Ocean", o: ["Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"] },
        { q: "What is the smallest continent by land area?", a: "Australia", o: ["Europe", "Antarctica", "South America"] },
        { q: "Which country has the largest population?", a: "India", o: ["China", "USA", "Indonesia"] },
        { q: "What is the capital of Spain?", a: "Madrid", o: ["Barcelona", "Seville", "Valencia"] },
        { q: "Which mountain range separates Europe and Asia?", a: "Ural Mountains", o: ["Alps", "Himalayas", "Andes"] },
        { q: "What is the capital of Brazil?", a: "Brasília", o: ["Rio de Janeiro", "São Paulo", "Salvador"] },
        { q: "Which country is also a continent?", a: "Australia", o: ["Greenland", "Antarctica", "Madagascar"] },
        { q: "What is the capital of Egypt?", a: "Cairo", o: ["Alexandria", "Giza", "Luxor"] },
        { q: "Which is the largest lake in the world by surface area?", a: "Caspian Sea", o: ["Lake Superior", "Lake Victoria", "Lake Baikal"] },
        { q: "What is the capital of Russia?", a: "Moscow", o: ["Saint Petersburg", "Novosibirsk", "Yekaterinburg"] },
        { q: "Which island country is located off the southeast coast of Africa?", a: "Madagascar", o: ["Mauritius", "Seychelles", "Comoros"] },
        { q: "What is the capital of Germany?", a: "Berlin", o: ["Munich", "Hamburg", "Frankfurt"] },
        { q: "Which canal connects the Atlantic and Pacific Oceans?", a: "Panama Canal", o: ["Suez Canal", "Erie Canal", "Kiel Canal"] },
        { q: "What is the capital of Argentina?", a: "Buenos Aires", o: ["Córdoba", "Rosario", "Mendoza"] },
        { q: "Which country is known as the Land of the Midnight Sun?", a: "Norway", o: ["Sweden", "Finland", "Iceland"] },
        { q: "What is the capital of Greece?", a: "Athens", o: ["Thessaloniki", "Patras", "Heraklion"] },
        { q: "Which river flows through London?", a: "Thames", o: ["Seine", "Danube", "Rhine"] },
        { q: "What is the capital of South Korea?", a: "Seoul", o: ["Busan", "Incheon", "Daegu"] },
        { q: "Which desert is the driest place on Earth?", a: "Atacama Desert", o: ["Sahara", "Gobi", "Kalahari"] },
        { q: "What is the capital of Mexico?", a: "Mexico City", o: ["Guadalajara", "Monterrey", "Puebla"] },
        { q: "Which sea separates Europe from Africa?", a: "Mediterranean Sea", o: ["Red Sea", "Black Sea", "Caspian Sea"] },
      ],
      history: [
        { q: "Who was the first President of the United States?", a: "George Washington", o: ["Thomas Jefferson", "Abraham Lincoln", "John Adams"] },
        { q: "In which year did World War II end?", a: "1945", o: ["1918", "1939", "1963"] },
        { q: "Who was the first woman to win a Nobel Prize?", a: "Marie Curie", o: ["Mother Teresa", "Rosa Parks", "Florence Nightingale"] },
        { q: "Which ancient civilization built the pyramids?", a: "Egyptians", o: ["Romans", "Greeks", "Mayans"] },
        { q: "Who was the leader of the Soviet Union during WWII?", a: "Joseph Stalin", o: ["Vladimir Lenin", "Leon Trotsky", "Nikita Khrushchev"] },
        { q: "In which year did the Titanic sink?", a: "1912", o: ["1905", "1920", "1898"] },
        { q: "Who was the first man to step on the moon?", a: "Neil Armstrong", o: ["Buzz Aldrin", "Yuri Gagarin", "John Glenn"] },
        { q: "Which empire was ruled by Julius Caesar?", a: "Roman Empire", o: ["Greek Empire", "Persian Empire", "Ottoman Empire"] },
        { q: "Who wrote the Declaration of Independence?", a: "Thomas Jefferson", o: ["Benjamin Franklin", "John Adams", "George Washington"] },
        { q: "In which year did the French Revolution begin?", a: "1789", o: ["1776", "1812", "1848"] },
        { q: "Who was the first female Prime Minister of the UK?", a: "Margaret Thatcher", o: ["Theresa May", "Angela Merkel", "Indira Gandhi"] },
        { q: "Which explorer is credited with discovering the Americas in 1492?", a: "Christopher Columbus", o: ["Vasco da Gama", "Ferdinand Magellan", "Amerigo Vespucci"] },
        { q: "Who was the King of Macedonia who conquered the Persian Empire?", a: "Alexander the Great", o: ["Julius Caesar", "Napoleon Bonaparte", "Genghis Khan"] },
        { q: "In which year did the Berlin Wall fall?", a: "1989", o: ["1961", "1975", "1991"] },
        { q: "Who was the primary author of the US Constitution?", a: "James Madison", o: ["Alexander Hamilton", "John Jay", "Thomas Jefferson"] },
        { q: "Which war was fought between the North and South in the US?", a: "American Civil War", o: ["Revolutionary War", "War of 1812", "WWI"] },
        { q: "Who was the first Emperor of China?", a: "Qin Shi Huang", o: ["Kublai Khan", "Sun Yat-sen", "Mao Zedong"] },
        { q: "In which year did the Russian Revolution take place?", a: "1917", o: ["1905", "1945", "1991"] },
        { q: "Who was the nurse known as 'The Lady with the Lamp'?", a: "Florence Nightingale", o: ["Clara Barton", "Mary Seacole", "Mother Teresa"] },
        { q: "Which document was signed in 1215 to limit the power of the English King?", a: "Magna Carta", o: ["Bill of Rights", "Declaration of Independence", "Constitution"] },
        { q: "Who was the leader of the Indian independence movement against British rule?", a: "Mahatma Gandhi", o: ["Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"] },
        { q: "In which year did the US enter WWI?", a: "1917", o: ["1914", "1941", "1939"] },
        { q: "Who was the Queen of England for 63 years until 1901?", a: "Queen Victoria", o: ["Queen Elizabeth I", "Queen Mary", "Queen Anne"] },
        { q: "Which city was the first to be hit by an atomic bomb?", a: "Hiroshima", o: ["Nagasaki", "Tokyo", "Kyoto"] },
        { q: "Who was the South African leader who fought against apartheid?", a: "Nelson Mandela", o: ["Desmond Tutu", "Steve Biko", "Thabo Mbeki"] },
      ],
    };

    const pool = questionPool[category] || questionPool['english'];
    const selected = pool[Math.floor(Math.random() * pool.length)];
    
    const options = [selected.a, ...selected.o].sort(() => Math.random() - 0.5);

    return {
      text: selected.q,
      options,
      correctAnswer: selected.a
    };
  };

  const startLevel = (category: string) => {
    setSelectedCategory(category);
    setGameState('playing');
    setQuestionsAnswered(0);
    setLevelScore(0);
    nextQuestion(category);
  };

  const nextQuestion = (category: string) => {
    const q = generateQuestion(category, currentLevel);
    setCurrentQuestion(q);
    setTimeLeft(30);
    setFeedback(null);
  };

  const handleAnswer = (answer: any) => {
    if (feedback) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    const levelInfo = levels[currentLevel - 1];

    if (isCorrect) {
      setScore(prev => prev + levelInfo.pointsPerQuestion);
      setLevelScore(prev => prev + levelInfo.pointsPerQuestion);
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setFeedback({ type: 'correct', message: `Correct! +${levelInfo.pointsPerQuestion} Points` });
      playSound('correct');
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setFeedback({ type: 'wrong', message: `Wrong! The correct answer was ${currentQuestion.correctAnswer}` });
      playSound('wrong');
    }

    setTimeout(() => {
      const nextCount = questionsAnswered + 1;
      setQuestionsAnswered(nextCount);

      if (nextCount >= levelInfo.questionsToPass) {
        const finalLevelScore = levelScore + (isCorrect ? levelInfo.pointsPerQuestion : 0);
        if (finalLevelScore >= levelInfo.targetPoints) {
          if (currentLevel < 4) {
            setGameState('level_up');
          } else {
            const winAmount = investmentAmount * 4;
            setPayout(winAmount);
            receivePayment(winAmount, `Million Deals Grand Prize (4x)`, 'gaming');
            setGameState('result');
          }
        } else {
          let loseAmount = 0;
          if (currentLevel < 4) {
            loseAmount = investmentAmount * 0.5;
            receivePayment(loseAmount, `Million Deals Consolation (50%)`, 'gaming');
          } else {
            loseAmount = investmentAmount * 0.7;
            receivePayment(loseAmount, `Million Deals Consolation (70%)`, 'gaming');
          }
          setPayout(loseAmount);
          setGameState('game_over');
        }
      } else {
        nextQuestion(selectedCategory!);
      }
    }, 1500);
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0 && !isPaused && !feedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !feedback) {
      handleAnswer(null); // Time's up
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isPaused, feedback]);

  const resetGame = () => {
    setGameState('lobby');
    setCurrentLevel(1);
    setScore(0);
    setLevelScore(0);
    setQuestionsAnswered(0);
    setSelectedCategory(null);
    setStats({ correct: 0, wrong: 0, totalTime: 0 });
    setError(null);
    setPayout(0);
  };

  const handleStartGame = () => {
    if (balance < investmentAmount) {
      setError("Insufficient balance to play at this level.");
      return;
    }
    const success = sendPayment(investmentAmount, `Million Deals Entry - $${investmentAmount}`, 'gaming');
    if (success) {
      setError(null);
      setGameState('category_selection');
    } else {
      setError("Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Game Header */}
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/10 blur-[80px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[var(--color-supreme-gold)]/20 rounded-2xl border border-[var(--color-supreme-gold)]/30">
              <Coins className="w-10 h-10 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Million Deals</h2>
              <p className="text-[var(--color-supreme-gold)] font-bold uppercase tracking-widest text-xs">
                {levels[currentLevel - 1].name} • Level {currentLevel}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">{score.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-2xl font-bold text-white">{questionsAnswered}/{levels[currentLevel - 1].questionsToPass}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl text-center space-y-8"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-4xl font-display font-bold text-gray-900">Welcome to Million Deals</h3>
              <p className="text-gray-500 text-lg">
                The ultimate test of knowledge and speed. Conquer four levels of increasing difficulty to reach the Home of Honour.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {levels.map((level) => (
                <div 
                  key={level.id}
                  className={clsx(
                    "p-6 rounded-3xl border-2 transition-all",
                    currentLevel >= level.id 
                      ? "bg-gray-50 border-[var(--color-supreme-gold)]/30" 
                      : "bg-gray-100 border-transparent opacity-50"
                  )}
                >
                  <Trophy className={clsx("w-8 h-8 mx-auto mb-4", currentLevel >= level.id ? "text-[var(--color-supreme-gold)]" : "text-gray-400")} />
                  <h4 className="font-bold text-gray-900">{level.name}</h4>
                  <p className="text-xs text-gray-500 mt-2">{level.pointsPerQuestion} Pts / Question</p>
                  <p className="text-xs font-bold text-[var(--color-supreme-gold)] mt-1">Target: {level.targetPoints} Pts</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-200">
              <h4 className="text-xl font-bold text-gray-900">Select Investment Amount</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {[10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    className={clsx(
                      "px-6 py-3 rounded-xl font-bold transition-all",
                      investmentAmount === amount
                        ? "bg-[var(--color-supreme-gold)] text-black shadow-lg scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              {error && <p className="text-red-500 font-bold">{error}</p>}
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h5 className="font-bold text-emerald-900">The Good (Rewards)</h5>
                </div>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>4x Multiplier:</strong> Win all 4 levels to quadruple your investment.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Safety Nets:</strong> Lose early? Get 50% back. Lose on the final level? Get 70% back.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Skill-Based:</strong> Your knowledge and speed determine your success.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h5 className="font-bold text-red-900">The Risks</h5>
                </div>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Financial Loss:</strong> You will lose up to 50% of your investment if you fail.</li>
                  <li className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Time Pressure:</strong> 30 seconds per question can cause panic and mistakes.</li>
                  <li className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Overconfidence:</strong> High stakes require broad knowledge. Don't invest more than you can afford to lose.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all shadow-xl shadow-black/20 flex items-center gap-3 mx-auto"
            >
              <Play className="w-6 h-6 fill-current" /> Invest & Play
            </button>
          </motion.div>
        )}

        {gameState === 'category_selection' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setGameState('lobby')}
                className="flex items-center gap-2 text-gray-500 hover:text-black font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <div className="text-center flex-1 pr-24">
                <h3 className="text-3xl font-display font-bold text-gray-900">Choose Your Category</h3>
                <p className="text-gray-500">Pick a subject you're most confident in to begin.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => startLevel(cat.id)}
                  className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[var(--color-supreme-gold)]/30 transition-all text-center space-y-4"
                >
                  <div className={clsx(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    `bg-${cat.color}-50 text-${cat.color}-600`
                  )}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900">{cat.name}</h4>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Question Card */}
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                <motion.div 
                  className="h-full bg-[var(--color-supreme-gold)]"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                        resetGame();
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                    title="Quit Game"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    <Puzzle className="w-4 h-4" /> Question {questionsAnswered + 1}
                  </div>
                </div>
                <div className={clsx(
                  "flex items-center gap-2 font-mono text-2xl font-bold",
                  timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gray-900"
                )}>
                  <Timer className="w-6 h-6" /> {timeLeft}s
                </div>
              </div>

              <div className="text-center space-y-12">
                <h3 className="text-4xl font-display font-bold text-gray-900 leading-tight">
                  {currentQuestion.text}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option: any, idx: number) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={!!feedback}
                      className={clsx(
                        "p-6 rounded-2xl border-2 text-xl font-bold transition-all flex items-center justify-between group",
                        feedback 
                          ? option === currentQuestion.correctAnswer
                            ? "bg-green-50 border-green-500 text-green-700"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                          : "bg-white border-gray-100 text-gray-700 hover:border-[var(--color-supreme-gold)] hover:bg-gray-50"
                      )}
                    >
                      <span>{option}</span>
                      <div className={clsx(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        feedback && option === currentQuestion.correctAnswer
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-200 group-hover:border-[var(--color-supreme-gold)]"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "absolute inset-x-0 bottom-0 p-6 text-center font-bold text-white",
                    feedback.type === 'correct' ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  {feedback.message}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'level_up' && (
          <motion.div
            key="level_up"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black p-12 rounded-[3rem] border border-[var(--color-supreme-gold)]/30 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12 text-[var(--color-supreme-gold)]" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Level Complete!</h3>
              <p className="text-gray-400 text-lg">
                You've conquered the {levels[currentLevel - 1].name}. Get ready for the next challenge.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Level Score</span>
                <span className="text-white font-bold">{levelScore} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Accuracy</span>
                <span className="text-[var(--color-supreme-gold)] font-bold">
                  {Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)}%
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentLevel(prev => prev + 1);
                setGameState('category_selection');
              }}
              className="px-12 py-5 bg-[var(--color-supreme-gold)] text-black rounded-2xl font-bold text-xl hover:bg-yellow-500 transition-all flex items-center gap-3 mx-auto"
            >
              Next Level: {levels[currentLevel].name} <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {gameState === 'game_over' && (
          <motion.div
            key="game_over"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3rem] border border-red-100 shadow-2xl text-center space-y-8"
          >
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-display font-bold text-gray-900">Journey Failed</h3>
              <p className="text-gray-500 text-lg">
                You didn't reach the target points to advance. Every great journey has setbacks.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-sm mx-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Final Score</span>
                <span className="text-gray-900 font-bold">{score} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Questions Correct</span>
                <span className="text-red-500 font-bold">{stats.correct}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-500 font-bold">Consolation Payout</span>
                <span className="text-green-600 font-bold text-xl">+${payout.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all flex items-center gap-3 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" /> Start Over
            </button>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black to-gray-900 p-12 rounded-[3rem] border border-[var(--color-supreme-gold)] shadow-2xl text-center space-y-8"
          >
            <div className="w-32 h-32 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center mx-auto relative">
              <Trophy className="w-16 h-16 text-[var(--color-supreme-gold)]" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-[var(--color-supreme-gold)]"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-200">
                Home of Honour Reached!
              </h3>
              <p className="text-gray-400 text-xl">
                You have completed the Million Deals journey. Your name shall be etched in the halls of power.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Points</p>
                <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">{score.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)}%
                </p>
              </div>
              <div className="bg-[var(--color-supreme-gold)]/20 p-6 rounded-2xl border border-[var(--color-supreme-gold)]/50">
                <p className="text-[var(--color-supreme-gold)] text-sm mb-1 font-bold">Grand Prize</p>
                <p className="text-3xl font-bold text-[var(--color-supreme-gold)]">+${payout.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-[var(--color-supreme-gold)] text-black rounded-xl font-bold hover:bg-yellow-500 transition-all flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> Play Again
              </button>
              <button
                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" /> Share Achievement
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Section (Visible during result or level up) */}
      {(gameState === 'result' || gameState === 'level_up' || gameState === 'game_over') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Performance Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Correct Answers</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(stats.correct / (stats.correct + stats.wrong)) * 100}%` }} />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.correct}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Wrong Answers</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(stats.wrong / (stats.correct + stats.wrong)) * 100}%` }} />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.wrong}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Average Speed</p>
              <p className="text-lg font-bold text-gray-900">4.2s / Question</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Best Category</p>
              <p className="text-lg font-bold text-blue-600">{selectedCategory?.toUpperCase() || 'N/A'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MillionDraw() {
  const { user } = useAuth();
  const { balance, withdraw } = useWallet();
  const { playSound } = useSound();
  const socketRef = useRef<any>(null);

  const [gameState, setGameState] = useState<'lobby' | 'category_selection' | 'playing' | 'result' | 'level_up' | 'game_over' | 'locked' | 'subscribe'>('lobby');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [drawsMade, setDrawsMade] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentDraw, setCurrentDraw] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: 'win' | 'loss', message: string } | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  // Server-synced state
  const [serverState, setServerState] = useState<any>({
    subscribers: [],
    isUnlocked: false,
    unlockTime: null,
    scores: {},
    currentCycleDay: 0,
    winners: [],
  });

  const [isWithinPlayWindow, setIsWithinPlayWindow] = useState(false);
  const [timeToNextWindow, setTimeToNextWindow] = useState<string>('');
  const [isUserOut, setIsUserOut] = useState(false);

  const [alerts, setAlerts] = useState<{ id: string, message: string }[]>([]);

  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on("million-draw:state-update", (state: any) => {
      setServerState(state);
      
      // Check if user is out or disqualified
      if (user?.id && (state.scores[user.id]?.isOut || state.scores[user.id]?.disqualified)) {
        setIsUserOut(true);
      }
    });

    socketRef.current.on("million-draw:alert", (alert: { message: string }) => {
      const id = Math.random().toString(36).substr(2, 9);
      setAlerts(prev => [...prev, { id, message: alert.message }]);
      playSound('notification');
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 5000);
    });

    socketRef.current.on("million-draw:unlocked", () => {
      playSound('success');
    });

    socketRef.current.on("million-draw:semi-finalists", (finalists: any) => {
      if (finalists.some((f: any) => f.id === user?.id)) {
        playSound('achievement');
      }
    });

    socketRef.current.on("million-draw:winners", (winners: any) => {
      playSound('celebration');
    });

    socketRef.current.emit("million-draw:get-state");

    return () => {
      socketRef.current.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    const checkWindow = () => {
      const now = new Date();
      const hour = now.getUTCHours();
      const day = serverState.currentCycleDay;

      let isOpen = false;
      let nextWindow = "";

      if (day >= 1 && day <= 5) {
        // Accumulation: Open all day
        isOpen = true;
      } else if (day === 6) {
        // Quarter-finals: 2 PM - 3 PM UTC
        if (hour === 14) isOpen = true;
        else if (hour < 14) nextWindow = "Quarter-finals at 2:00 PM UTC";
        else nextWindow = "Quarter-finals ended";
      } else if (day === 7) {
        // Semi-finals: 12 PM - 1 PM, 4 PM - 5 PM
        // Finals: 9 PM - 10 PM
        if (hour === 12 || hour === 16 || hour === 21) isOpen = true;
        else if (hour < 12) nextWindow = "Semi-finals 1 at 12:00 PM UTC";
        else if (hour < 16) nextWindow = "Semi-finals 2 at 4:00 PM UTC";
        else if (hour < 21) nextWindow = "Grand Finale at 9:00 PM UTC";
        else nextWindow = "Tournament Completed";
      }

      setIsWithinPlayWindow(isOpen);
      setTimeToNextWindow(nextWindow);

      if (isOpen && gameState === 'locked') {
        setGameState('lobby');
        playSound('notification');
      }
    };

    const timer = setInterval(checkWindow, 1000);
    return () => clearInterval(timer);
  }, [serverState.currentCycleDay, gameState]);

  const isSubscribed = user?.id ? serverState.subscribers.includes(user.id) : false;
  const canPlay = serverState.isUnlocked && isSubscribed && isWithinPlayWindow;

  const handleSubscribe = () => {
    if (balance >= 5) {
      withdraw(5);
      socketRef.current.emit("million-draw:subscribe", { 
        userId: user?.id, 
        name: user?.name 
      });
      playSound('purchase');
    } else {
      playSound('error');
    }
  };

  const categories = [
    { id: 'luck', name: 'Pure Luck', icon: Sparkles, color: 'blue' },
    { id: 'strategy', name: 'Strategy', icon: Target, color: 'green' },
    { id: 'fortune', name: 'Fortune', icon: Coins, color: 'yellow' },
    { id: 'destiny', name: 'Destiny', icon: Globe, color: 'red' },
  ];

  const levels = [
    { id: 1, name: 'Rich Journey', pointsPerDraw: 50, drawsToPass: 20, targetPoints: 1000 },
    { id: 2, name: 'Wealthy Home', pointsPerDraw: 75, drawsToPass: 20, targetPoints: 1500 },
    { id: 3, name: 'Stars Journey', pointsPerDraw: 100, drawsToPass: 20, targetPoints: 2000 },
    { id: 4, name: 'Home of Honour', pointsPerDraw: 250, drawsToPass: 20, targetPoints: 5000 },
  ];

  const generateDraw = (level: number) => {
    const levelInfo = levels[level - 1];
    const basePoints = levelInfo.pointsPerDraw;
    
    const options = [
      { type: 'jackpot', points: Math.round(basePoints * 2), label: 'JACKPOT!' },
      { type: 'standard', points: Math.round(basePoints * 1.2), label: 'BIG WIN!' },
      { type: 'low', points: Math.round(basePoints * 0.8), label: 'SMALL WIN' },
      { type: 'bust', points: 0, label: 'BUST!' },
    ].sort(() => Math.random() - 0.5);

    return { options };
  };

  const startLevel = (category: string) => {
    setSelectedCategory(category);
    setGameState('playing');
    setDrawsMade(0);
    setLevelScore(0);
    nextDraw();
  };

  const nextDraw = () => {
    setCurrentDraw(generateDraw(currentLevel));
    setFeedback(null);
  };

  const handleDraw = (option: any) => {
    if (feedback) return;

    const points = option.points;
    const levelInfo = levels[currentLevel - 1];

    setScore(prev => prev + points);
    setLevelScore(prev => prev + points);
    
    if (points > 0) {
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      setFeedback({ type: 'win', message: `${option.label} +${points} Points` });
      playSound('correct');
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      setFeedback({ type: 'loss', message: `BUST! 0 Points` });
      playSound('wrong');
    }

    setTimeout(() => {
      const nextCount = drawsMade + 1;
      setDrawsMade(nextCount);

      if (nextCount >= levelInfo.drawsToPass) {
        if (levelScore + points >= levelInfo.targetPoints) {
          if (currentLevel < 4) {
            setGameState('level_up');
          } else {
            setGameState('result');
            socketRef.current.emit("million-draw:submit-score", { 
              userId: user?.id, 
              name: user?.name || 'Anonymous', 
              score: score + points,
              isOut: false,
              levelFailed: 0
            });
          }
        } else {
          setGameState('game_over');
          socketRef.current.emit("million-draw:submit-score", { 
            userId: user?.id, 
            name: user?.name || 'Anonymous', 
            score: score + points,
            isOut: true,
            levelFailed: currentLevel
          });
        }
      } else {
        nextDraw();
      }
    }, 1000);
  };

  const resetGame = () => {
    setGameState('lobby');
    setCurrentLevel(1);
    setScore(0);
    setLevelScore(0);
    setDrawsMade(0);
    setSelectedCategory(null);
    setStats({ wins: 0, losses: 0 });
  };

  const userScoreData = user?.id ? serverState.scores[user.id] : null;
  const isOut = userScoreData?.isOut || userScoreData?.disqualified || isUserOut;
  const hasPlayedToday = userScoreData?.dailyScores?.length >= serverState.currentCycleDay;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      {/* Alerts */}
      <div className="fixed top-24 right-8 z-50 space-y-4 pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-black/90 backdrop-blur-md border border-[var(--color-supreme-gold)]/30 p-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto min-w-[300px]"
            >
              <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl">
                <Megaphone className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              </div>
              <p className="text-white text-sm font-bold">{alert.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Header */}
      <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/10 blur-[80px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[var(--color-supreme-gold)]/20 rounded-2xl border border-[var(--color-supreme-gold)]/30">
              <Gift className="w-10 h-10 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Million Draw</h2>
              <p className="text-[var(--color-supreme-gold)] font-bold uppercase tracking-widest text-xs">
                {serverState.isUnlocked ? `Day ${serverState.currentCycleDay} • ${serverState.currentStage.replace('-', ' ')} • ${isWithinPlayWindow ? 'LIVE' : 'LOCKED'}` : 'Waiting for Subscribers'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">{userScoreData?.totalPoints || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className={clsx("text-2xl font-bold", isOut ? "text-red-500" : "text-green-500")}>
                {isOut ? 'OUT' : 'ACTIVE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis & Rules Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Tournament Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Stage</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{serverState.currentStage?.replace('-', ' ') || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Status</p>
              <p className={clsx(
                "text-lg font-bold",
                isOut ? "text-red-500" : "text-green-500"
              )}>
                {isOut ? 'Locked Out' : 'Active'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-gray-900 text-sm">Rules & Regulations</h5>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5 shrink-0" />
                <span>Highest 10 point earners after 5 days qualify for Quarter-finals.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5 shrink-0" />
                <span>Quarter-finals target: 15,000 - 25,000 points. Nearest selected if target not met.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5 shrink-0" />
                <span>Semi-finals: Top 5 players. Played twice (12 PM & 4 PM UTC).</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-supreme-gold)] mt-1.5 shrink-0" />
                <span>Finals: Top 3 players. Target 5,000 - 7,000 points for selection.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span className="text-red-600 font-medium">Failure or lockout at any level (1-4) results in automatic disqualification. Points are still recorded.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 shadow-2xl text-white space-y-6">
          <h4 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Schedule (UTC)
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-xs">Day 1-5</span>
              <span className="text-sm font-bold">Accumulation</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-xs">Day 6 (2-3 PM)</span>
              <span className="text-sm font-bold text-[var(--color-supreme-gold)]">Quarter-Finals</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-xs">Day 7 (12-1 PM)</span>
              <span className="text-sm font-bold">Semi-Finals 1</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-xs">Day 7 (4-5 PM)</span>
              <span className="text-sm font-bold">Semi-Finals 2</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-gray-400 text-xs">Day 7 (9-10 PM)</span>
              <span className="text-sm font-bold text-green-400">Grand Finals</span>
            </div>
          </div>
          <div className="pt-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time to Next Event</p>
              <p className="text-lg font-bold text-[var(--color-supreme-gold)]">{timeToNextWindow || 'Live Now!'}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!serverState.isUnlocked && (
          <motion.div
            key="unlocking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl text-center space-y-8"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-4xl font-display font-bold text-gray-900">Unlock Million Draw</h3>
              <p className="text-gray-500 text-lg">
                The game is currently locked. We need 250 subscribers at $5 each to unlock the 7-day tournament draw.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Progress</span>
                <span className="text-[var(--color-supreme-gold)] font-bold">{Math.round((serverState.subscribers.length / 250) * 100)}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(serverState.subscribers.length / 250) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                {250 - serverState.subscribers.length} more subscribers needed to start the draw.
              </p>
            </div>

            {!isSubscribed ? (
              <button
                onClick={handleSubscribe}
                className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all shadow-xl shadow-black/20 flex items-center gap-3 mx-auto"
              >
                <CreditCard className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Subscribe for $5
              </button>
            ) : (
              <div className="flex items-center gap-2 justify-center text-green-600 font-bold">
                <CheckCircle2 className="w-6 h-6" /> You are subscribed! Waiting for others...
              </div>
            )}
          </motion.div>
        )}

        {serverState.isUnlocked && !isWithinPlayWindow && (
          <motion.div
            key="locked-window"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl text-center space-y-8"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-display font-bold text-gray-900">Game Locked</h3>
              <p className="text-gray-500 text-lg">
                The draw is only available for one hour each day.
              </p>
              <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold inline-block">
                {timeToNextWindow}
              </div>
            </div>
          </motion.div>
        )}

        {serverState.isUnlocked && isWithinPlayWindow && gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl text-center space-y-8"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-4xl font-display font-bold text-gray-900">Tournament Day {serverState.currentCycleDay}</h3>
              <p className="text-gray-500 text-lg">
                {serverState.currentCycleDay <= 5 ? 'Daily Play Stage' : serverState.currentCycleDay === 6 ? 'Semi-Finals Stage' : 'Finals Stage'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {levels.map((level) => (
                <div 
                  key={level.id}
                  className={clsx(
                    "p-6 rounded-3xl border-2 transition-all",
                    currentLevel >= level.id 
                      ? "bg-gray-50 border-[var(--color-supreme-gold)]/30" 
                      : "bg-gray-100 border-transparent opacity-50"
                  )}
                >
                  <Trophy className={clsx("w-8 h-8 mx-auto mb-4", currentLevel >= level.id ? "text-[var(--color-supreme-gold)]" : "text-gray-400")} />
                  <h4 className="font-bold text-gray-900">{level.name}</h4>
                  <p className="text-xs text-gray-500 mt-2">Target: {level.targetPoints} Pts</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (isOut) {
                  playSound('error');
                  return;
                }
                if (hasPlayedToday) {
                  playSound('error');
                  return;
                }
                setGameState('category_selection');
              }}
              disabled={isOut || hasPlayedToday}
              className={clsx(
                "px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3 mx-auto",
                (isOut || hasPlayedToday) 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-black text-white hover:bg-gray-900 shadow-black/20"
              )}
            >
              <Sparkles className="w-6 h-6 text-[var(--color-supreme-gold)]" /> 
              {isOut ? 'You are Out for this Cycle' : hasPlayedToday ? 'Already Played Today' : 'Start Drawing'}
            </button>
          </motion.div>
        )}

        {gameState === 'category_selection' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setGameState('lobby')}
                className="flex items-center gap-2 text-gray-500 hover:text-black font-bold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <div className="text-center flex-1 pr-24">
                <h3 className="text-3xl font-display font-bold text-gray-900">Choose Your Destiny</h3>
                <p className="text-gray-500">Select a path to begin your lucky draw journey.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => startLevel(cat.id)}
                  className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[var(--color-supreme-gold)]/30 transition-all text-center space-y-4"
                >
                  <div className={clsx(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    `bg-${cat.color}-50 text-${cat.color}-600`
                  )}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900">{cat.name}</h4>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentDraw && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-12">
              <div className="space-y-4">
                <h3 className="text-4xl font-display font-bold text-gray-900">Pick a Box</h3>
                <p className="text-gray-500">Each box contains a hidden reward. Choose wisely!</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentDraw.options.map((option: any, idx: number) => (
                  <motion.button
                    key={option.points + '-' + idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDraw(option)}
                    disabled={!!feedback}
                    className={clsx(
                      "aspect-square rounded-3xl border-4 flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden group",
                      feedback
                        ? option.points > 0
                          ? "bg-green-50 border-green-500"
                          : "bg-red-50 border-red-500"
                        : "bg-gray-50 border-gray-100 hover:border-[var(--color-supreme-gold)] hover:bg-white"
                    )}
                  >
                    {feedback ? (
                      <>
                        <div className={clsx(
                          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                          option.points > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )}>
                          {option.points > 0 ? <Trophy className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Result</p>
                          <p className={clsx("text-xl font-bold", option.points > 0 ? "text-green-600" : "text-red-600")}>
                            {option.points} Pts
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-inner flex items-center justify-center group-hover:bg-[var(--color-supreme-gold)]/10 transition-colors">
                          <Gift className="w-8 h-8 text-gray-400 group-hover:text-[var(--color-supreme-gold)]" />
                        </div>
                        <span className="font-bold text-gray-400">Box {idx + 1}</span>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "p-6 rounded-2xl font-bold text-white text-xl",
                    feedback.type === 'win' ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  {feedback.message}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'level_up' && (
          <motion.div
            key="level_up"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black p-12 rounded-[3rem] border border-[var(--color-supreme-gold)]/30 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12 text-[var(--color-supreme-gold)]" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Level Complete!</h3>
              <p className="text-gray-400 text-lg">
                Your fortune is strong! You've conquered the {levels[currentLevel - 1].name}.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Level Score</span>
                <span className="text-white font-bold">{levelScore} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Wins</span>
                <span className="text-green-400 font-bold">{stats.wins}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentLevel(prev => prev + 1);
                setGameState('category_selection');
              }}
              className="px-12 py-5 bg-[var(--color-supreme-gold)] text-black rounded-2xl font-bold text-xl hover:bg-yellow-500 transition-all flex items-center gap-3 mx-auto"
            >
              Next Level: {levels[currentLevel].name} <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {gameState === 'game_over' && (
          <motion.div
            key="game_over"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3rem] border border-red-100 shadow-2xl text-center space-y-8"
          >
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-display font-bold text-gray-900">Fortune Faded</h3>
              <p className="text-gray-500 text-lg">
                You didn't reach the target points this time. Luck is a fickle friend.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Final Score</span>
                <span className="text-gray-900 font-bold">{score} Pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Wins</span>
                <span className="text-green-500 font-bold">{stats.wins}</span>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-900 transition-all flex items-center gap-3 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" /> Try Again
            </button>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black to-gray-900 p-12 rounded-[3rem] border border-[var(--color-supreme-gold)] shadow-2xl text-center space-y-8"
          >
            <div className="w-32 h-32 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center mx-auto relative">
              <Trophy className="w-16 h-16 text-[var(--color-supreme-gold)]" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-[var(--color-supreme-gold)]"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-200">
                Fortune Master!
              </h3>
              <p className="text-gray-400 text-xl">
                You have completed the Million Draw journey. Your luck is legendary.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Points</p>
                <p className="text-2xl font-bold text-[var(--color-supreme-gold)]">{score.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Wins</p>
                <p className="text-2xl font-bold text-white">{stats.wins}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-[var(--color-supreme-gold)] text-black rounded-xl font-bold hover:bg-yellow-500 transition-all flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> Play Again
              </button>
              <button
                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" /> Share Fortune
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis and Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Leaderboard
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Performers</span>
          </div>

          <div className="space-y-4">
            {Object.entries(serverState.scores)
              .sort(([, a]: any, [, b]: any) => b.totalPoints - a.totalPoints)
              .slice(0, 10)
              .map(([id, data]: any, idx) => (
                <div 
                  key={id}
                  className={clsx(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    id === user?.id ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)]/30" : "bg-gray-50 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{data.name}</p>
                      <p className="text-xs text-gray-500">
                        {data.qualifiedFinal ? 'Finalist' : data.qualifiedSemi ? 'Semi-Finalist' : 'Daily Player'}
                        {data.isOut && ' • OUT'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-supreme-gold)]">{data.totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Points</p>
                  </div>
                </div>
              ))}
            
            {Object.keys(serverState.scores).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No scores recorded yet for this cycle.</p>
              </div>
            )}
          </div>
        </div>

        {/* Winners & Prizes */}
        <div className="bg-black p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Winners Circle
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { rank: 1, prize: 250, points: '5,000+' },
              { rank: 2, prize: 200, points: '3,000+' },
              { rank: 3, prize: 150, points: '2,000+' },
            ].map((p) => (
              <div key={p.rank} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                    p.rank === 1 ? "bg-[var(--color-supreme-gold)] text-black" : "bg-white/10 text-white"
                  )}>
                    {p.rank}
                  </div>
                  <div>
                    <p className="font-bold text-white">Prize: ${p.prize}</p>
                    <p className="text-xs text-gray-400">Target: {p.points} Pts</p>
                  </div>
                </div>
                {serverState.winners[p.rank - 1] && (
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-supreme-gold)]">{serverState.winners[p.rank - 1].name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Winner</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-white font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Rules Analysis
            </h4>
            <div className="space-y-2 text-[10px] text-gray-400 leading-relaxed">
              <p>• <span className="text-white">Selection:</span> Top 10 after Day 5 enter Quarter-finals (Day 6, 2-3 PM). Top 5 enter Semi-finals (Day 7, 12-1 PM & 4-5 PM). Top 3 enter Finals (Day 7, 9-10 PM).</p>
              <p>• <span className="text-white">Thresholds:</span> Quarter-finals (15k-25k), Semi-finals (5k-7k), Finals (5k, 3k, 2k). Nearest points selected if targets not met.</p>
              <p>• <span className="text-white">Disqualification:</span> Failure at any level (1-4) or missing the time window results in automatic lockout. Points are still recorded for final calculations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ supremeEarnings }: { supremeEarnings: number }) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'billworlddream1@gmail.com';
  const [serverState, setServerState] = useState<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit("million-draw:get-state");
    socketRef.current.on("million-draw:state-update", (state: any) => {
      setServerState(state);
    });
    return () => socketRef.current.disconnect();
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Lock className="w-16 h-16 text-red-500 opacity-20" />
        <h3 className="text-2xl font-display font-bold text-gray-900">Access Denied</h3>
        <p className="text-gray-500">You do not have administrative privileges.</p>
      </div>
    );
  }

  if (!serverState) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-supreme-gold)]" /></div>;

  const handleUpdateState = (updates: any) => {
    socketRef.current.emit("million-draw:admin-update-state", updates);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire Million Draw cycle? All scores and subscribers will be cleared.")) {
      socketRef.current.emit("million-draw:admin-reset");
    }
  };

  const handleDisqualify = (userId: string, name: string) => {
    const reason = window.prompt(`Reason for disqualifying ${name}:`, "Administrative decision");
    if (reason) {
      socketRef.current.emit("million-draw:admin-disqualify", { userId, reason });
    }
  };

  const handlePayWinner = (winnerId: string) => {
    socketRef.current.emit("million-draw:admin-pay-winner", winnerId);
  };

  const stages = ["accumulation", "waiting-quarter", "quarter-finals", "waiting-finals", "semi-finals-1", "semi-finals-2", "finals", "completed"];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Admin Control Center</h2>
          <p className="text-gray-500">Manage Million Draw tournament and track activities</p>
        </div>
        <button 
          onClick={handleReset}
          className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
        >
          <Trash2 className="w-5 h-5" /> Reset Tournament
        </button>
      </div>

      {/* Project Power Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-black to-gray-900 p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/30 shadow-xl text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Supreme Earnings</p>
              <h3 className="text-3xl font-display font-bold text-[var(--color-supreme-gold)]">
                ${supremeEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-[var(--color-supreme-gold)]/20 rounded-2xl border border-[var(--color-supreme-gold)]/30">
              <DollarSign className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>10% Platform Fee Active</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Project Funding Volume</p>
              <h3 className="text-3xl font-display font-bold text-gray-900">
                ${(supremeEarnings / 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <PieChart className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Total volume processed</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Projects</p>
              <h3 className="text-3xl font-display font-bold text-gray-900">
                24
              </h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
              <Rocket className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>Across all categories</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cycle Controls */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Cycle Controls
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Cycle Day</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <button
                    key={day}
                    onClick={() => handleUpdateState({ currentCycleDay: day })}
                    className={clsx(
                      "w-10 h-10 rounded-xl font-bold transition-all",
                      serverState.currentCycleDay === day ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Stage</label>
              <select 
                value={serverState.currentStage}
                onChange={(e) => handleUpdateState({ currentStage: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-900">Tournament Status</span>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  serverState.isUnlocked ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                )}>
                  {serverState.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Subscribers: {serverState.subscribers.length} / 250
              </p>
            </div>
          </div>
        </div>

        {/* Qualification Tracker */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Qualification Tracker
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(serverState.scores).filter((s: any) => s.qualifiedQuarter).length}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Quarter-Finalists</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(serverState.scores).filter((s: any) => s.qualifiedSemi).length}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Semi-Finalists</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(serverState.scores).filter((s: any) => s.qualifiedFinal).length}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Finalists</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase">Player</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase">Points</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                  <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(serverState.scores).map(([id, data]: [string, any]) => (
                  <tr key={id} className="group">
                    <td className="py-4">
                      <p className="font-bold text-gray-900">{data.name}</p>
                      <p className="text-[10px] text-gray-400">{id.slice(0, 8)}...</p>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-[var(--color-supreme-gold)]">{data.totalPoints.toLocaleString()}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {data.qualifiedQuarter && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[8px] font-bold uppercase">Quarter</span>}
                        {data.qualifiedSemi && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[8px] font-bold uppercase">Semi</span>}
                        {data.qualifiedFinal && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[8px] font-bold uppercase">Final</span>}
                        {data.disqualified && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[8px] font-bold uppercase">OUT</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      {!data.disqualified && (
                        <button 
                          onClick={() => handleDisqualify(id, data.name)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Disqualify Player"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Winners & Payments */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" /> Winner Payments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serverState.winners.map((winner: any) => (
            <div key={winner.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                  {winner.rank}
                </div>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                  winner.paid ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                )}>
                  {winner.paid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{winner.name}</p>
                <p className="text-xs text-gray-500">Points: {winner.score.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  ${winner.rank === 1 ? '250' : winner.rank === 2 ? '200' : '150'}
                </span>
                {!winner.paid && (
                  <button 
                    onClick={() => handlePayWinner(winner.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Mark Paid
                  </button>
                )}
              </div>
              {winner.paidAt && (
                <p className="text-[10px] text-gray-400 italic">
                  Paid on {new Date(winner.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          {serverState.winners.length === 0 && (
            <div className="md:col-span-3 text-center py-12 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No winners selected yet for this cycle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
