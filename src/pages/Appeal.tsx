import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Lock,
  MessageCircle,
  Clock,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPREME_FEATURES, SupremeFeature } from '../constants/featureIds';
import { POLICY_QUESTIONS, PolicyQuestion } from '../constants/policyQuestions';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import { useWallet } from '../context/WalletContext';
import { CreditCard, Zap, ShieldCheck as ShieldCheckIcon, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const APPEAL_PLANS = [
  { id: '60days', name: 'Standard Appeal', duration: 60, price: 25, color: 'bg-blue-500' },
  { id: '90days', name: 'Silver Appeal', duration: 90, price: 45, color: 'bg-slate-400' },
  { id: '150days', name: 'Gold Appeal', duration: 150, price: 70, color: 'bg-amber-500' },
  { id: '365days', name: 'Infinite Appeal', duration: 365, price: 100, color: 'bg-fuchsia-600' }
];

export default function Appeal() {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const { balance, sendPayment } = useWallet();
  const navigate = useNavigate();
  const [selectedFeatureId, setSelectedFeatureId] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<PolicyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFeature, setSearchFeature] = useState('');
  const [showIdHelp, setShowIdHelp] = useState(false);

  // If Auth is still loading, show a dedicated loading state to prevent blank screen
  if (authLoading) {
    return (
      <FeatureLoader text="Authenticating Supreme Appeal">
        <div className="min-h-screen" />
      </FeatureLoader>
    );
  }

  // If no profile, we can't show appeals
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Session Required</h2>
        <p className="text-gray-500 mt-2">Please log in to access the Supreme Appeal protocol.</p>
      </div>
    );
  }

  const lockedFeaturesList = profile?.lockedFeatures ? Object.entries(profile.lockedFeatures) : [];
  
  const getFeatureName = (id: string) => {
    return SUPREME_FEATURES.find(f => f.id === id)?.name || id;
  };

  const startDailyAppeal = (featureId: string) => {
    const feature = profile?.lockedFeatures?.[featureId];
    if (!feature) return;

    // Check if already answered today
    if (feature.lastAppealDate === new Date().toDateString()) {
      toast.info("You have already completed today's appeal session. Come back tomorrow!");
      return;
    }

    setSelectedFeatureId(featureId);
    
    // Pick 7 random unique questions
    const shuffled = [...POLICY_QUESTIONS].sort(() => 0.5 - Math.random());
    setCurrentQuestions(shuffled.slice(0, 7));
    setAnswers({});
    setShowQuiz(true);
  };

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAppeal = async () => {
    if (Object.keys(answers).length < 7) {
      toast.error("Please answer all 7 questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      let isAllCorrect = true;
      currentQuestions.forEach(q => {
        if (answers[q.id] !== q.correctAnswer) {
          isAllCorrect = false;
        }
      });

      const currentLocked = { ...profile?.lockedFeatures };
      const feature = { ...currentLocked[selectedFeatureId] };

      if (isAllCorrect) {
        const nextDay = (feature.appealDay || 0) + 1;
        feature.appealDay = nextDay;
        feature.lastAppealDate = new Date().toDateString();
        feature.status = 'appealing';
        
        if (nextDay >= 7) {
          // Final day complete - unlock!
          delete currentLocked[selectedFeatureId];
          toast.success(`Success! "${getFeatureName(selectedFeatureId)}" has been unlocked after 7 days of perfect policy attendance.`);
        } else {
          currentLocked[selectedFeatureId] = feature;
          toast.success(`Day ${nextDay} of 7 complete. Well done! Come back tomorrow for the next session.`);
        }
      } else {
        // Incorrect answer - RESET
        feature.appealDay = 0;
        feature.lastAppealDate = new Date().toDateString();
        currentLocked[selectedFeatureId] = feature;
        toast.error("One or more answers were incorrect. Supreme policy requires total mastery. Your 7-day progress has been reset to Day 0.");
      }

      await updateProfile({ lockedFeatures: currentLocked });
      setShowQuiz(false);
    } catch (error) {
      toast.error("Failed to update appeal status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const purchaseAmnesty = async (plan: typeof APPEAL_PLANS[0]) => {
    if (!profile) return;
    
    if (balance < plan.price) {
      toast.error("Insufficient Funds: Treasury balance too low for this high-tier amnesty.");
      return;
    }

    const toastId = toast.loading(`Initiating ${plan.name} amnesty protocol...`);
    
    try {
      setIsSubmitting(true);
      
      // 1. Process internal payment
      const success = await sendPayment(
        plan.price, 
        `Supreme Amnesty Shield: ${plan.name} (${plan.duration} Days)`,
        'Amnesty Subscription'
      );

      if (!success) {
        throw new Error("Payment transaction declined by Treasury.");
      }

      // 2. Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.duration);

        // 3. Update profile
        await updateProfile({
          appealSubscription: {
            plan: plan.id as any,
            expiresAt: expiresAt.toISOString(),
            purchasedAt: new Date().toISOString()
          }
        });

        // 4. Record transaction for analytics
        await addDoc(collection(db, 'appeal_billings'), {
          userId: profile.uid,
          userName: profile.name,
          planId: plan.id,
          price: plan.price,
          duration: plan.duration,
          timestamp: serverTimestamp()
        });

        toast.success(`Success! ${plan.name} activated until ${expiresAt.toLocaleDateString()}. Your status is now protected.`, { id: toastId });
      } catch (error: any) {
        toast.error(error.message || "Transaction Failed: Treasury connection interrupted.", { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
  };

  const isSubscriptionActive = profile?.appealSubscription && new Date(profile.appealSubscription.expiresAt) > new Date();

  const categories = [...new Set(SUPREME_FEATURES.map(f => f.category))];

  return (
    <FeatureLoader text="Supreme Appeal Protocol">
    <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--color-supreme-gold)]/10 transition-all duration-1000" />
                <div className="relative z-10 space-y-3">
                    <h1 className="text-3xl md:text-5xl font-display font-black text-[var(--color-supreme-text)] tracking-tight">
                        Supreme <span className="text-[var(--color-supreme-gold)]">Appeal</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium max-w-xl">
                        A dedicated platform to solicit for feature restoration through policy mastery and proven dedication to Supreme standards.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4 px-6 py-4 bg-red-50 rounded-3xl border border-red-100 self-start md:self-auto">
                    <div className="p-2 bg-red-500 rounded-xl animate-pulse">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm text-red-600 leading-none">RESTRICTED</span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">
                            {lockedFeaturesList.length} Total Features
                        </span>
                    </div>
                </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Locked Features & Guidelines */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Appeals / Locked Features */}
          <div className="glass-panel p-8 rounded-[40px] space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Your Feature Restrictions
            </h2>

            {lockedFeaturesList.length === 0 ? (
              <div className="text-center py-12 px-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-emerald-900">Good Standing</h3>
                <p className="text-emerald-700">You currently have no restricted features. Always follow Supreme policy!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lockedFeaturesList.map(([id, data]) => (
                  <div key={id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm gap-4 relative overflow-hidden group">
                    {isSubscriptionActive && (
                        <div className="absolute top-0 right-0 py-1 px-3 bg-fuchsia-100 text-fuchsia-600 text-[8px] font-black uppercase tracking-widest z-10 rounded-bl-xl border-l border-b border-fuchsia-200">
                          Immunity Active
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-supreme-text)]">{getFeatureName(id)}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono font-bold tracking-tight uppercase">{id}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Locked on: {new Date(data.lockedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 min-w-[150px]">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: isSubscriptionActive ? '100%' : `${((data.appealDay || 0) / 7) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isSubscriptionActive ? 'Shielded: 100%' : `Progress: Day ${data.appealDay || 0} / 7`}
                      </span>
                    </div>

                    {isSubscriptionActive ? (
                        <button 
                          onClick={async () => {
                            const currentLocked = { ...profile?.lockedFeatures };
                            delete currentLocked[id];
                            await updateProfile({ lockedFeatures: currentLocked });
                            toast.success(`Instant Restoration: "${getFeatureName(id)}" unlocked via Supreme Amnesty Shield.`);
                          }}
                          className="px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-xl hover:bg-fuchsia-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,38,211,0.3)]"
                        >
                          <Zap className="w-4 h-4" />
                          Instant Unlock
                        </button>
                    ) : (
                        <button 
                          onClick={() => startDailyAppeal(id)}
                          className="px-6 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-supreme-gold-light)] transition-all flex items-center justify-center gap-2"
                        >
                          {data.appealDay === 0 ? 'Start Appeal' : 'Continue Appeal'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy Guidelines Info */}
          <div className="bg-black text-white p-8 rounded-[40px] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert className="w-64 h-64" />
            </div>
            
            <h2 className="text-xl font-bold font-display italic tracking-wider uppercase text-[var(--color-supreme-gold)]">
              Appeal Rules & Guidelines
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {[
                { title: 'The 7-Day Protocol', desc: 'You must answer 7 questions correctly each day for 7 consecutive days.' },
                { title: 'Failure Consequence', desc: 'Incorrect answers or missing a day resets your progress to Day 0 immediately.' },
                { title: 'Supreme Authority', desc: 'Admin reserves the right to override appeal progress for severe violations.' },
                { title: 'Full Access', desc: 'Upon completion, the feature is instantly unlocked and access is restored.' }
              ].map((rule, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-supreme-gold)]/20 text-[var(--color-supreme-gold)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-gray-200">{rule.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Section (New) */}
          <div className="glass-panel p-8 rounded-[40px] space-y-8 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuchsia-500/10 blur-[80px] rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[var(--color-supreme-text)] flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-fuchsia-500" /> Supreme Amnesty Shield
                    </h2>
                    <p className="text-sm text-gray-500 font-medium italic">Instant feature restoration and protection from policy locks.</p>
                </div>
                {isSubscriptionActive && (
                    <div className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <ShieldCheckIcon className="w-3 h-3" /> Expires: {new Date(profile.appealSubscription!.expiresAt).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {APPEAL_PLANS.map((plan) => (
                    <button
                        key={plan.id}
                        disabled={isSubmitting}
                        onClick={() => purchaseAmnesty(plan)}
                        className={clsx(
                            "p-6 rounded-[32px] border transition-all hover:scale-105 active:scale-95 space-y-4 text-left group relative overflow-hidden",
                            profile?.appealSubscription?.plan === plan.id 
                                ? "bg-black border-black text-white" 
                                : "bg-white border-gray-100 hover:border-fuchsia-200 shadow-sm"
                        )}
                    >
                        {profile?.appealSubscription?.plan === plan.id && (
                             <div className="absolute top-0 right-0 p-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                             </div>
                        )}
                        <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-white", plan.color)}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">{plan.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{plan.duration} Days Freedom</p>
                        </div>
                        <div className="pt-2">
                            <span className="text-2xl font-display font-black group-hover:text-fuchsia-600 transition-colors">${plan.price}</span>
                            <span className="text-[10px] text-gray-400 font-bold ml-1">/Term</span>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Search Feature IDs */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[40px] space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" /> Feature Directory
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search feature ID or name..."
                value={searchFeature}
                onChange={(e) => setSearchFeature(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-supreme-gold)]/30 transition-all text-sm"
              />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => {
                const features = SUPREME_FEATURES.filter(f => f.category === cat && 
                  (f.name.toLowerCase().includes(searchFeature.toLowerCase()) || 
                   f.id.toLowerCase().includes(searchFeature.toLowerCase())));
                
                if (features.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{cat}</h4>
                    <div className="space-y-1.5">
                      {features.map(f => (
                        <div key={f.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default group">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700">{f.name}</span>
                            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100 text-gray-400 group-hover:text-[var(--color-supreme-gold)] transition-colors">{f.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowIdHelp(!showIdHelp)}
              className="w-full text-center text-xs text-gray-400 hover:text-[var(--color-supreme-gold)] transition-colors flex items-center justify-center gap-1"
            >
              How do I use these IDs? <ChevronDown className={clsx("w-3 h-3 transition-transform", showIdHelp ? "rotate-180" : "")} />
            </button>
            
            <AnimatePresence>
              {showIdHelp && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-xs text-gray-500 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100 overflow-hidden"
                >
                  Feature IDs are unique identifiers used to control access. If a feature is locked against you for policy violations, you will need to refer to its ID within the Appeal area to begin your 7-day master quiz. Administrators also use these IDs to respond to user reports.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-600 p-8 rounded-[40px] text-white shadow-xl">
            <MessageCircle className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Need direct help?</h3>
            <p className="text-sm text-white/80 mb-6">If you believe your restriction is a technical error, contact the Supreme Admin Team directly.</p>
            <button 
              onClick={() => navigate('/chat')}
              className="w-full py-3 bg-white text-[var(--color-supreme-gold)] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Daily Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col"
            >
              {/* Quiz Header */}
              <div className="bg-gray-50 px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-supreme-gold)] rounded-2xl text-white">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Daily Policy Mastery - Day {(profile?.lockedFeatures?.[selectedFeatureId]?.appealDay || 0) + 1}</h3>
                    <p className="text-sm text-gray-500">Perfect score required to advance progress.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm("Closing the quiz will count as a reset attempt if you've already started. Are you sure?")) {
                      setShowQuiz(false);
                    }
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <RotateCcw className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Quiz content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {currentQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 leading-tight">{q.question}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswerChange(q.id, i)}
                          className={clsx(
                            "p-4 text-left text-sm font-medium rounded-2xl border transition-all",
                            answers[q.id] === i 
                              ? "bg-[var(--color-supreme-gold)]/10 border-[var(--color-supreme-gold)] text-[var(--color-supreme-gold)]" 
                              : "bg-gray-50 border-transparent hover:border-gray-200 text-gray-600"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                              answers[q.id] === i ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]" : "border-gray-300"
                            )}>
                              {answers[q.id] === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            {opt}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Footer */}
              <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500 font-bold">
                  {Object.keys(answers).length} of 7 questions answered
                </div>
                <button 
                  onClick={submitAppeal}
                  disabled={isSubmitting || Object.keys(answers).length < 7}
                  className="px-10 py-4 bg-black text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? 'Verifying...' : 'Submit Appeal Session'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
    </div>
    </FeatureLoader>
  );
}
