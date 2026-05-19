import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, ChevronRight, CreditCard, Wallet, CheckCircle2, Sparkles, Crown, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useMonthlyAwards } from '../context/MonthlyAwardsContext';
import { useWallet } from '../context/WalletContext';
import { stripeService } from '../services/stripe';

export default function JoinAwardsWidget() {
  const { isEnrolled: isMonthlyEnrolled, enroll: enrollMonthly } = useMonthlyAwards();
  const { balance } = useWallet();
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('stripe');

  // Mock state for the $100 award since it doesn't have a context yet (it's just a component state in AwardCampaign)
  const [isSupremeEnrolled, setIsSupremeEnrolled] = useState(false);

  const handleJoin = async (type: 'monthly' | 'supreme') => {
    setIsJoining(type);
    try {
      if (paymentMethod === 'stripe') {
        const priceId = type === 'monthly' ? 'price_monthly_10' : 'price_supreme_100';
        await stripeService.createCheckoutSession(priceId, `${window.location.origin}/?award_joined=${type}`);
      } else {
        if (type === 'monthly') {
          const success = await enrollMonthly();
          if (!success) toast.error('Insufficient wallet balance');
        } else {
          // Mock supreme enrollment via wallet
          if (balance >= 100) {
            setIsSupremeEnrolled(true);
            toast.success('Successfully joined Supreme Award Program!');
          } else {
            toast.error('Insufficient wallet balance');
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to join ${type} awards`;
      toast.error(message);
      console.error('Join error:', error);
    } finally {
      setIsJoining(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Award Card - $10 */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm group"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Star className="w-24 h-24 text-indigo-600" />
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900">Monthly Awards</h3>
              <p className="text-sm text-gray-500">Boost your monthly earnings</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-gray-900">$10</span>
            <span className="text-gray-500 font-medium">/ month</span>
          </div>

          <ul className="space-y-3">
            {[
              'Top 5 performers rewarded',
              'Real-time leaderboard',
              'Direct wallet payouts',
              'Exclusive badges'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-4 space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setPaymentMethod('stripe')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  paymentMethod === 'stripe' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <CreditCard className="w-3.5 h-3.5" /> Stripe
              </button>
              <button 
                onClick={() => setPaymentMethod('wallet')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  paymentMethod === 'wallet' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Wallet className="w-3.5 h-3.5" /> Wallet
              </button>
            </div>

            {isMonthlyEnrolled ? (
              <div className="w-full py-4 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-green-100">
                <CheckCircle2 className="w-5 h-5" /> Enrolled
              </div>
            ) : (
              <button 
                onClick={() => handleJoin('monthly')}
                disabled={isJoining !== null}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isJoining === 'monthly' ? 'Processing...' : `Join Now - $10.00`}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Supreme Award Card - $100 */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm group"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Crown className="w-24 h-24 text-amber-600" />
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900">Supreme Award</h3>
              <p className="text-sm text-gray-500">The ultimate 18-month challenge</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-gray-900">$100</span>
            <span className="text-gray-500 font-medium">/ one-time</span>
          </div>

          <ul className="space-y-3">
            {[
              'Grand Prize: $1,000,000',
              'Top 18 performers rewarded',
              'Lifestyle rewards (Mansions/Cars)',
              'Elite status & networking'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-4 space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setPaymentMethod('stripe')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  paymentMethod === 'stripe' ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <CreditCard className="w-3.5 h-3.5" /> Stripe
              </button>
              <button 
                onClick={() => setPaymentMethod('wallet')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  paymentMethod === 'wallet' ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Wallet className="w-3.5 h-3.5" /> Wallet
              </button>
            </div>

            {isSupremeEnrolled ? (
              <div className="w-full py-4 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-green-100">
                <CheckCircle2 className="w-5 h-5" /> Enrolled
              </div>
            ) : (
              <button 
                onClick={() => handleJoin('supreme')}
                disabled={isJoining !== null}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isJoining === 'supreme' ? 'Processing...' : `Join Now - $100.00`}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
