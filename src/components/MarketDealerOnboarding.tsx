import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, X, CheckCircle2, AlertCircle, Clock, 
  Package, MessageSquare, Wallet, Truck, Building2, 
  Mail, Phone, MapPin, FileText, Send, Loader2,
  CheckCircle, History
} from 'lucide-react';
import { db, collection, addDoc, query, where, getDocs, onSnapshot } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface MarketDealerOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const policies = [
  {
    icon: Truck,
    title: "Delivery Commitment",
    description: "A dealer must agree to ship or deliver products/services within 7-14 days of purchase or face indefinite suspension."
  },
  {
    icon: Package,
    title: "Availability Guarantee",
    description: "A dealer must list products/services that are readily available for users."
  },
  {
    icon: AlertCircle,
    title: "Pre-Purchase Integrity",
    description: "Any valid pre-purchase complaints will result in immediate suspension without notice."
  },
  {
    icon: Wallet,
    title: "Financial Security",
    description: "Proceeds go to dealer wallet. Violations lead to wallet suspension and 'On Hold' product status."
  },
  {
    icon: MessageSquare,
    title: "Tracking & Updates",
    description: "Dealers must provide tracking and keep buyers updated on shipment movement."
  }
];

export default function MarketDealerOnboarding({ isOpen, onClose, onSuccess }: MarketDealerOnboardingProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'policy' | 'details' | 'pending'>('policy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Retail',
    contactEmail: user?.email || '',
    contactPhone: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    if (user && isOpen) {
        const q = query(collection(db, 'market_dealer_profiles'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setExistingProfile({ id: snapshot.docs[0].id, ...data });
                if (data.status === 'pending') {
                    setStep('pending');
                } else if (data.status === 'verified') {
                    onSuccess(); // If already verified, close and success
                }
            }
        });
        return () => unsubscribe();
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'market_dealer_profiles'), {
        userId: user.uid,
        userName: user.name || profile?.name,
        ...formData,
        status: 'pending',
        submittedAt: serverTimestamp(),
        sincerityScore: 0
      });
      
      toast.success('Dealer application submitted successfully!');
      setStep('pending');
    } catch (error) {
      console.error('Error submitting dealer application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWaitProgress = () => {
    if (!existingProfile?.submittedAt) return 0;
    const submittedAt = existingProfile.submittedAt.toDate();
    const elapsed = Date.now() - submittedAt.getTime();
    const total = 24 * 60 * 60 * 1000;
    return Math.min(Math.round((elapsed / total) * 100), 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className={`p-8 bg-gradient-to-br transition-colors duration-500 relative ${
                step === 'pending' ? 'from-indigo-600 to-purple-600' : 'from-[var(--color-supreme-gold)] to-yellow-600'
            } text-white`}>
              {step === 'pending' ? <History className="w-12 h-12 mb-4 animate-spin-slow" /> : <ShieldCheck className="w-12 h-12 mb-4 opacity-90" />}
              <h2 className="text-3xl font-display font-bold mb-2">
                {step === 'policy' && 'Market Dealer Policy'}
                {step === 'details' && 'Dealer Verification Details'}
                {step === 'pending' && 'Application Under Review'}
              </h2>
              <p className="text-white/80 text-sm font-medium">
                {step === 'policy' && 'Step 1: Terms of Service'}
                {step === 'details' && 'Step 2: Business Information'}
                {step === 'pending' && 'Verification Pulse'}
              </p>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {step === 'policy' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 font-medium">
                      All market listers and dealers must abide by these 5 core policies before products will be approved.
                    </p>
                  </div>
                  <div className="space-y-6">
                    {policies.map((policy, index) => (
                      <div key={index} className="flex gap-4 group">
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all border border-gray-100">
                          <policy.icon className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                            <span className="text-[var(--color-supreme-gold)]">0{index + 1}.</span> {policy.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{policy.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'details' && (
                <form id="dealer-details-form" onSubmit={handleSubmit} className="space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Business Name
                            </label>
                            <input 
                                required
                                value={formData.businessName}
                                onChange={e => setFormData({...formData, businessName: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[var(--color-supreme-gold)]/20 focus:bg-white transition-all outline-none font-bold"
                                placeholder="Legal or Brand Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3" /> Niche/Type
                            </label>
                            <select 
                                value={formData.businessType}
                                onChange={e => setFormData({...formData, businessType: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold"
                            >
                                <option>Retail</option>
                                <option>Wholesale</option>
                                <option>Services</option>
                                <option>Luxury Goods</option>
                                <option>Electronics</option>
                            </select>
                        </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Business Email
                            </label>
                            <input 
                                required
                                type="email"
                                value={formData.contactEmail}
                                onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Mobile Number
                            </label>
                            <input 
                                required
                                value={formData.contactPhone}
                                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                   </div>

                   <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Physical/Hub Address
                        </label>
                        <input 
                            required
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold"
                            placeholder="Street, City, Country"
                        />
                   </div>

                   <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Goods Availability Description
                        </label>
                        <textarea 
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold resize-none"
                            placeholder="Describe your sincerity and the reliability of your stock..."
                        />
                   </div>
                </form>
              )}

              {step === 'pending' && (
                <div className="py-10 text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                            <Clock className="w-12 h-12 text-indigo-500 animate-pulse" />
                        </div>
                        <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
                            <circle 
                                cx="64" cy="64" r="60" 
                                fill="none" stroke="currentColor" strokeWidth="4"
                                className="text-indigo-500"
                                strokeDasharray={377}
                                strokeDashoffset={377 - (377 * getWaitProgress() / 100)}
                                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                            />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-gray-900 uppercase">Verification in Progress</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">
                            Your market sincerity details have been submitted. Admin verification usually takes up to <span className="text-indigo-600 font-bold">24 hours</span> to ensure platform integrity.
                        </p>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-left">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Live Status Track</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-green-500 rounded-full"><CheckCircle className="w-4 h-4 text-white" /></div>
                                <p className="text-sm font-bold text-gray-700">Terms Accepted & Details Submitted</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`p-1 ${existingProfile?.verifiedAt ? 'bg-green-500' : 'bg-gray-200'} rounded-full`}>
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <p className={`text-sm font-bold ${existingProfile?.verifiedAt ? 'text-gray-700' : 'text-gray-400'}`}>Admin Confirmation of Goods</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`p-1 ${getWaitProgress() >= 100 ? 'bg-green-500' : 'bg-gray-200'} rounded-full`}>
                                    <Send className="w-4 h-4 text-white" />
                                </div>
                                <p className={`text-sm font-bold ${getWaitProgress() >= 100 ? 'text-gray-700' : 'text-gray-400'}`}>Official Market Listing Activation</p>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              {step === 'policy' && (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => setStep('details')}
                    className="flex-[2] py-4 bg-[var(--color-supreme-gold)] text-white font-bold rounded-2xl hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-lg active:scale-95"
                  >
                    Accept & Continue
                  </button>
                </>
              )}
              
              {step === 'details' && (
                 <>
                  <button
                    onClick={() => setStep('policy')}
                    className="flex-1 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="dealer-details-form"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Application
                  </button>
                </>
              )}

              {step === 'pending' && (
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg"
                >
                    Acknowledge & Close
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
