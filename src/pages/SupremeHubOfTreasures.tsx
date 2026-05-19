import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Wallet,
  Info,
  ChevronRight,
  Target,
  Trophy,
  Zap,
  ArrowUpRight,
  Layers,
  History,
  X,
  TrendingDown,
  Activity,
  ZapOff
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { clsx } from 'clsx';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp, 
  doc, 
  updateDoc, 
  increment,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';

interface BriefcaseType {
  id: string;
  name: string;
  price: number;
  rank: string;
  durationMonths: number;
  targets: {
    count: number;
    returnPercent: number;
  }[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const BRIEF_CASES: BriefcaseType[] = [
  {
    id: 'bronze',
    name: "Briefcase of Bronze",
    price: 100,
    rank: 'Bronze',
    durationMonths: 5,
    targets: [
      { count: 5000, returnPercent: 2.50 },
      { count: 7000, returnPercent: 5.00 }
    ],
    color: 'text-[#CD7F32]',
    bgColor: 'bg-[#CD7F32]/10',
    borderColor: 'border-[#CD7F32]/20'
  },
  {
    id: 'silver',
    name: "Briefcase of Silver",
    price: 150,
    rank: 'Silver',
    durationMonths: 5,
    targets: [
      { count: 7000, returnPercent: 2.70 },
      { count: 10000, returnPercent: 6.50 }
    ],
    color: 'text-[#C0C0C0]',
    bgColor: 'bg-[#C0C0C0]/10',
    borderColor: 'border-[#C0C0C0]/20'
  },
  {
    id: 'diamond',
    name: "Briefcase of Diamond",
    price: 200,
    rank: 'Diamond',
    durationMonths: 5,
    targets: [
      { count: 9000, returnPercent: 2.80 },
      { count: 12000, returnPercent: 7.00 }
    ],
    color: 'text-[#B9F2FF]',
    bgColor: 'bg-[#B9F2FF]/10',
    borderColor: 'border-[#B9F2FF]/20'
  },
  {
    id: 'gold',
    name: "Briefcase of Gold",
    price: 250,
    rank: 'Gold',
    durationMonths: 5,
    targets: [
      { count: 11000, returnPercent: 2.90 },
      { count: 14000, returnPercent: 8.00 }
    ],
    color: 'text-[#FFD700]',
    bgColor: 'bg-[#FFD700]/10',
    borderColor: 'border-[#FFD700]/20'
  },
  {
    id: 'clowned',
    name: "Briefcase of Clowned",
    price: 500,
    rank: 'Crowned',
    durationMonths: 5,
    targets: [
      { count: 17000, returnPercent: 3.00 },
      { count: 20000, returnPercent: 10.00 }
    ],
    color: 'text-[#FF4500]',
    bgColor: 'bg-[#FF4500]/10',
    borderColor: 'border-[#FF4500]/20'
  }
];

interface Investment {
  id: string;
  briefcaseId: string;
  amount: number;
  startDate: any;
  endDate: any;
  status: 'active' | 'completed' | 'refunded';
  currentRankCount: number;
}

export default function SupremeHubOfTreasures() {
  const { user } = useAuth();
  const { balance, withdraw, deposit } = useWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isInvesting, setIsInvesting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjections, setShowProjections] = useState(false);
  const [selectedBriefcaseForProjection, setSelectedBriefcaseForProjection] = useState<BriefcaseType | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'analysis'>('available');

  const calculateRemainingTime = (endDate: any) => {
    if (!endDate) return 'N/A';
    const now = Date.now();
    const end = endDate instanceof Timestamp ? endDate.toMillis() : new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Matured';
    
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    return `${months}m ${days}d`;
  };

  const getProgressToTarget = (rank: string, target: number) => {
    const current = rankCounts[rank] || 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  // Real or mock ranking counts
  const [rankCounts, setRankCounts] = useState<Record<string, number>>({
    Bronze: 4200,
    Silver: 6100,
    Diamond: 8500,
    Gold: 9800,
    Crowned: 15200
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'treasureInvestments'),
      where('userId', '==', user.uid),
      orderBy('startDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Investment[] = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() } as Investment);
      });
      setInvestments(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
      setIsLoading(false);
    });

    // Also simulate rank count updates or fetch them
    // For now we use the initial mock counts or increment slightly
    const interval = setInterval(() => {
      setRankCounts(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          next[k] += Math.floor(Math.random() * 5);
        });
        return next;
      });
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const handleInvest = async (briefcase: BriefcaseType) => {
    if (!user) return;
    if (balance < briefcase.price) {
      toast.error("Insufficient balance for this investment");
      return;
    }

    setIsInvesting(briefcase.id);
    try {
      const startDate = Timestamp.now();
      const endDate = Timestamp.fromMillis(startDate.toMillis() + briefcase.durationMonths * 30 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'treasureInvestments'), {
        userId: user.uid,
        briefcaseId: briefcase.id,
        amount: briefcase.price,
        startDate,
        endDate,
        status: 'active',
        rank: briefcase.rank,
        initialRankCount: rankCounts[briefcase.rank] || 0
      });

      await withdraw(briefcase.price, 'Supreme Treasure Investment', 'Treasure Hub');
      toast.success(`Briefcase of ${briefcase.name.split(' ').pop()} activated successfully!`);
    } catch (error) {
      console.error('Investment error:', error);
      toast.error("Failed to process investment");
    } finally {
      setIsInvesting(null);
    }
  };

  useEffect(() => {
    if (!user || investments.length === 0) return;

    const checkSettlements = async () => {
      const now = Date.now();
      const matured = investments.filter(inv => inv.status === 'active' && inv.endDate.toMillis() <= now);

      for (const inv of matured) {
        const box = BRIEF_CASES.find(b => b.id === inv.briefcaseId);
        if (!box) continue;

        const currentCount = rankCounts[box.rank] || 0;
        // Sort targets by count descending to find the highest met target
        const sortedTargets = [...box.targets].sort((a, b) => b.count - a.count);
        const metTarget = sortedTargets.find(t => currentCount >= t.count);

        let returnAmount = inv.amount;
        let earned = 0;

        if (metTarget) {
          earned = inv.amount * (metTarget.returnPercent / 100);
          returnAmount += earned;
        }

        try {
          await updateMetStatus(inv.id, metTarget ? 'completed' : 'refunded', earned);
          await deposit(returnAmount, `Treasure Hub Maturity: ${box.name}`, 'Treasure Hub');
          toast.success(`Investment Matured! ${box.name}: $${returnAmount.toFixed(2)} credited.`);
        } catch (error) {
          console.error('Settlement error:', error);
        }
      }
    };

    checkSettlements();
  }, [user, investments, rankCounts]);

  const updateMetStatus = async (id: string, status: string, earned: number) => {
    try {
      await updateDoc(doc(db, 'treasureInvestments', id), {
        status,
        earned,
        maturedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `treasureInvestments/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360],
            borderRadius: ["20%", "50%", "20%"]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-black border-4 border-[var(--color-supreme-gold)] flex items-center justify-center mb-6"
        >
          <Briefcase className="w-8 h-8 text-[var(--color-supreme-gold)]" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-display font-black text-black uppercase tracking-widest">Accessing Vaults</h2>
          <div className="flex items-center gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-[var(--color-supreme-gold)] rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <section className="relative h-64 bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-50"
            alt="Treasure Background"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[var(--color-supreme-gold)]/20 border border-[var(--color-supreme-gold)]/30 backdrop-blur-md">
                <Briefcase className="w-8 h-8 text-[var(--color-supreme-gold)]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-white">
                Supreme Hub of <span className="text-[var(--color-supreme-gold)]">Treasures</span>
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Strategic investment portfolios powered by platform-wide growth and ranking intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-30">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Explorer */}
          <div className="flex-1 space-y-8">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm w-fit">
              {[
                { id: 'available', label: 'Briefcase Vault', icon: Layers },
                { id: 'active', label: 'My Portfolio', icon: Target },
                { id: 'analysis', label: 'Strategic Analysis', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-black text-[var(--color-supreme-gold)] shadow-xl" 
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'available' && (
                <motion.div
                  key="available"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {BRIEF_CASES.map((box, idx) => (
                    <motion.div
                      key={box.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={clsx(
                        "group relative p-6 sm:p-8 rounded-[2.5rem] border bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                        box.borderColor
                      )}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent -mr-16 -mt-16 rounded-full opacity-50" />
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className={clsx("p-4 rounded-2xl shadow-inner", box.bgColor, box.color)}>
                          <Briefcase className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entry Capital</div>
                          <div className="text-2xl sm:text-3xl font-display font-black text-gray-900">${box.price}</div>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2 truncate">{box.name}</h3>
                      <p className="text-sm text-gray-500 mb-8 font-medium">Rank Dependency: {box.rank} Tier</p>

                      <div className="space-y-4 mb-8">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" /> Growth Targets & Returns
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {box.targets.map((target, tIdx) => (
                            <div key={tIdx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:border-black/5 transition-all">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900">{target.count.toLocaleString()} {box.rank}s</span>
                                <span className={clsx("text-xs font-bold", box.color)}>Maturity Boost</span>
                              </div>
                              <div className="text-right font-display font-black text-lg sm:text-xl text-black">
                                +{target.returnPercent}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold">{box.durationMonths} Months</span>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedBriefcaseForProjection(box);
                              setShowProjections(true);
                            }}
                            className="text-[10px] font-black text-blue-500 hover:text-blue-700 underline underline-offset-4"
                          >
                            VIEW PROJECTION
                          </button>
                        </div>
                        <button
                          onClick={() => handleInvest(box)}
                          disabled={isInvesting === box.id}
                          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[var(--color-supreme-gold)] hover:text-black transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                        >
                          {isInvesting === box.id ? 'Processing...' : 'Activate'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {investments.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-300 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <History className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Portfolios</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">You haven't activated any Treasure Briefcases yet. Start investing to see them here.</p>
                      <button 
                        onClick={() => setActiveTab('available')}
                        className="mt-8 px-8 py-3 bg-black text-white rounded-2xl font-bold text-sm tracking-wider hover:bg-[var(--color-supreme-gold)] hover:text-black transition-all"
                      >
                        Explore Vault
                      </button>
                    </div>
                  ) : (
                    investments.map(inv => {
                      const box = BRIEF_CASES.find(b => b.id === inv.briefcaseId);
                      if (!box) return null;

                      return (
                        <div key={inv.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                          <div className={clsx("w-20 h-20 rounded-2xl flex items-center justify-center shrink-0", box.bgColor, box.color)}>
                            <Briefcase className="w-10 h-10" />
                          </div>
                          
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-2xl font-display font-bold text-gray-900 group-hover:text-[var(--color-supreme-gold)] transition-colors">{box.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">Invested: ${inv.amount}</p>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{calculateRemainingTime(inv.endDate)} LEFT</span>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              {box.targets.map((target, tIdx) => {
                                const progress = getProgressToTarget(box.rank, target.count);
                                const isMet = progress === 100;
                                return (
                                  <div key={tIdx} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                      <span className={clsx(isMet ? "text-green-600" : "text-gray-500")}>
                                        Target: {target.count.toLocaleString()} {box.rank}s {isMet && '✓'}
                                      </span>
                                      <span className="text-[var(--color-supreme-gold)]">+{target.returnPercent}% Return</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className={clsx(
                                          "h-full rounded-full transition-all duration-300",
                                          isMet ? "bg-green-500" : "bg-black"
                                        )}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="md:w-48 text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Maturity Status</div>
                            <div className="text-sm font-bold text-blue-600 uppercase mb-4">{inv.status}</div>
                            <button 
                              onClick={() => {
                                setSelectedBriefcaseForProjection(box);
                                setShowProjections(true);
                              }}
                              className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black hover:bg-[var(--color-supreme-gold)] hover:text-black transition-all"
                            >
                              TRACK DETAILS
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-blue-500" /> Strategic Return Matrix
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                          <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-900 mb-2">Principal Security</h4>
                        <p className="text-sm text-blue-700/70 leading-relaxed">
                          The 'Bounce Back' mechanism ensures your $ capital is returned to your central wallet if targets aren't met within 5 months.
                        </p>
                      </div>

                      <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <h4 className="text-lg font-bold text-green-900 mb-2">Rank Correlation</h4>
                        <p className="text-sm text-green-700/70 leading-relaxed">
                          Your returns are directly tethered to the growth of the Supreme ecosystem's specific membership tiers.
                        </p>
                      </div>

                      <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                          <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <h4 className="text-lg font-bold text-amber-900 mb-2">Duration Index</h4>
                        <p className="text-sm text-amber-700/70 leading-relaxed">
                          All portfolios operate on a fixed 5-month maturity cycle with instant settlement upon term end.
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 p-8 bg-black rounded-[2.5rem] text-white">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.3em]">Institutional Grade Intelligence</div>
                          <h4 className="text-3xl font-display font-bold">Performance Analytics active</h4>
                          <p className="text-gray-400 max-w-md">Our AI monitors global membership trends 24/7 to provide high-probability entry points for your capital.</p>
                        </div>
                        <button 
                          onClick={() => setShowProjections(true)}
                          className="px-8 py-4 bg-[var(--color-supreme-gold)] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          View Detailed Projections
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Projections Modal */}
                  <AnimatePresence>
                    {showProjections && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowProjections(false)}
                          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-display font-black text-black">Strategic Growth Intelligence</h3>
                              <p className="text-sm text-gray-500">Tiered probability analysis and membership momentum tracking</p>
                            </div>
                            <button 
                              onClick={() => setShowProjections(false)}
                              className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
                            >
                              <X className="w-6 h-6 text-black" />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Momentum Chart */}
                              <div className="lg:col-span-2 space-y-6">
                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                      </div>
                                      <h4 className="font-bold text-gray-900">Platform Momentum</h4>
                                    </div>
                                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">
                                      Real-Time Tracking
                                    </div>
                                  </div>
                                  <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={[
                                        { day: 'Mon', members: 12000 },
                                        { day: 'Tue', members: 13500 },
                                        { day: 'Wed', members: 14200 },
                                        { day: 'Thu', members: 15800 },
                                        { day: 'Fri', members: 17500 },
                                        { day: 'Sat', members: 19000 },
                                        { day: 'Sun', members: 21000 },
                                      ]}>
                                        <defs>
                                          <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip 
                                          contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '1rem', color: '#fff' }}
                                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                                        />
                                        <Area type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem]">
                                    <TrendingUp className="w-5 h-5 text-green-500 mb-3" />
                                    <div className="text-2xl font-black text-green-900">+14.2%</div>
                                    <div className="text-xs font-bold text-green-700/60 uppercase">Weekly Growth</div>
                                  </div>
                                  <div className="p-6 bg-purple-50 border border-purple-100 rounded-[2rem]">
                                    <Target className="w-5 h-5 text-purple-500 mb-3" />
                                    <div className="text-2xl font-black text-purple-900">92%</div>
                                    <div className="text-xs font-bold text-purple-700/60 uppercase">Target Probability</div>
                                  </div>
                                </div>
                              </div>

                              {/* Tier Potential */}
                              <div className="space-y-6">
                                <div className="bg-black p-8 rounded-[2.5rem] text-white">
                                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-[var(--color-supreme-gold)]" /> ROI Potential By Tier
                                  </h4>
                                  <div className="space-y-4">
                                    {BRIEF_CASES.map((bc) => (
                                      <div key={bc.id} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                          <span>{bc.name}</span>
                                          <span className="text-[var(--color-supreme-gold)]">{bc.targets[1].returnPercent}% MAX</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(bc.targets[1].returnPercent / 10) * 100}%` }}
                                            className="h-full bg-[var(--color-supreme-gold)] rounded-full"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2.5rem]">
                                  <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <h5 className="font-bold text-amber-900">Analyst Note</h5>
                                  </div>
                                  <p className="text-xs text-amber-800/80 leading-relaxed italic">
                                    "Historical data indicates a 98.4% success rate for Bronze and Silver tiers within the 5-month window based on current ecosystem expansion velocities."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Supreme Investment Intelligence Group</p>
                            <button 
                              onClick={() => setShowProjections(false)}
                              className="px-12 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--color-supreme-gold)] hover:text-black transition-all"
                            >
                              Close Intelligence Report
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-500" /> Market Mechanics
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">1</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Portfolio Activation</h5>
                          <p className="text-sm text-gray-500 leading-relaxed">Capital is deducted from your central wallet and locked in a secure smart-contract for exactly 150 days.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">2</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Global Verification</h5>
                          <p className="text-sm text-gray-500 leading-relaxed">Every 24 hours, the system verifies the total count of authenticated members within your portfolio's target rank.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">3</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Maturity Settlement</h5>
                          <p className="text-sm text-gray-500 leading-relaxed">If targets are hit, principal + interest is credited. If not, only principal is returned. No losses are possible.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Status & Ranking */}
          <div className="lg:w-96 space-y-6">
            <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-gray-200">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-6">Global Ranking Pulse</h3>
              <div className="space-y-6">
                {Object.entries(rankCounts).map(([rank, count]) => {
                  const briefcase = BRIEF_CASES.find(b => b.rank === rank);
                  const isMet = briefcase && briefcase.targets.some(t => count >= t.count);
                  
                  return (
                    <div key={rank} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-2 h-2 rounded-full",
                            isMet ? "bg-green-500" : "bg-blue-500 animate-pulse"
                          )} />
                          <span className="text-sm font-bold text-gray-700">{rank}</span>
                        </div>
                        <span className="text-sm font-mono font-black text-gray-900">{count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((count / 20000) * 100, 100)}%` }}
                          className={clsx(
                            "h-full rounded-full transition-all duration-300",
                            isMet ? "bg-green-500" : "bg-black"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-tighter">
                    Rank metrics are audited platform-wide every 15 minutes. High growth detected in Crowned tier.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] bg-black text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                  <h3 className="text-lg font-bold">Investable Capital</h3>
                </div>
                <div className="text-4xl font-display font-black mb-6">${balance.toLocaleString()}</div>
                <button 
                  onClick={() => setActiveTab('available')}
                  className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--color-supreme-gold)] transition-all flex items-center justify-center gap-2"
                >
                  Acquire Portfolio <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Security Index</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 italic">
                  "Treasures are insured up to $10,000 per user by the Supreme Strategic Stability Fund."
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-purple-600">
                  <ArrowUpRight className="w-4 h-4" /> LEARN ABOUT INSURANCE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Footer Stats */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full shadow-2xl flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Pool</div>
            <div className="text-sm font-black text-gray-900">$14.2M</div>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Matured Today</div>
            <div className="text-sm font-black text-gray-900">1,242 Users</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showProjections && selectedBriefcaseForProjection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProjections(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className={clsx("p-3 sm:p-4 rounded-xl sm:rounded-2xl", selectedBriefcaseForProjection.bgColor, selectedBriefcaseForProjection.color)}>
                      <Briefcase className="w-6 h-6 sm:w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-3xl font-display font-black text-gray-900 leading-tight">{selectedBriefcaseForProjection.name}</h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 font-medium">5-Month Strategic Return Projection</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProjections(false)}
                    className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="h-[200px] sm:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: 'Month 0', value: selectedBriefcaseForProjection.price },
                          { month: 'Month 1', value: selectedBriefcaseForProjection.price * 1.05 },
                          { month: 'Month 2', value: selectedBriefcaseForProjection.price * 1.12 },
                          { month: 'Month 3', value: selectedBriefcaseForProjection.price * 1.25 },
                          { month: 'Month 4', value: selectedBriefcaseForProjection.price * 1.40 },
                          { month: 'Month 5', value: selectedBriefcaseForProjection.price * (1 + (selectedBriefcaseForProjection.targets[1].returnPercent / 100)) }
                        ]}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} tickFormatter={(v) => `$${v}`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Potential Return</div>
                      <div className="text-3xl sm:text-4xl font-display font-black text-gray-900">${(selectedBriefcaseForProjection.price * (1 + selectedBriefcaseForProjection.targets[1].returnPercent / 100)).toFixed(2)}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> ROI: {selectedBriefcaseForProjection.targets[1].returnPercent}%
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Requirements</h4>
                      {selectedBriefcaseForProjection.targets.map((target, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900">{target.count.toLocaleString()} {selectedBriefcaseForProjection.rank}s</div>
                            <div className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase">Required Network</div>
                          </div>
                          <div className="text-base sm:text-lg font-black text-black">+{target.returnPercent}%</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        handleInvest(selectedBriefcaseForProjection);
                        setShowProjections(false);
                      }}
                      className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--color-supreme-gold)] hover:text-black transition-all shadow-xl shadow-black/10"
                    >
                      Commit Investment
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-3 p-5 sm:p-6 bg-amber-50 rounded-2xl sm:rounded-3xl border border-amber-100">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Principal Guaranteed</h4>
                    <p className="text-[10px] sm:text-xs text-amber-800/70 leading-relaxed font-medium">
                      If targets are not met within the 5-month maturity window, your initial capital of ${selectedBriefcaseForProjection.price} is returned 100% to your central wallet.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
