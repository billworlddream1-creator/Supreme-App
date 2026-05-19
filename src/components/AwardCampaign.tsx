import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Clock, Users, Heart, ShoppingBag, DollarSign, Info, AlertCircle, CheckCircle2, Timer, TrendingUp, ChevronRight, Home, Car, Banknote, Sparkles, CreditCard, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { stripeService } from '../services/stripe';

const PRIZES = [
  { rank: 1, amount: 1000000, label: 'Grand Prize' },
  { rank: 2, amount: 800000, label: 'Runner Up' },
  { rank: 3, amount: 600000, label: 'Third Place' },
  { rank: 4, amount: 400000, label: 'Fourth Place' },
  { rank: 5, amount: 200000, label: 'Fifth Place' },
];

// Remaining 13 prizes (6-18) are calculated based on effort/rank
const REMAINING_PRIZES_COUNT = 13;

const REQUIREMENTS = [
  { id: 'likes', label: 'Likes', target: 200000, icon: Heart, color: 'text-red-500' },
  { id: 'subscribers', label: 'Subscribers', target: 200000, icon: Users, color: 'text-blue-500' },
  { id: 'hours', label: 'Activity Hours', target: 2000, icon: Clock, color: 'text-purple-500' },
  { id: 'connections', label: 'Connected People', target: 1500, icon: Target, color: 'text-green-500' },
  { id: 'sales', label: 'Products/Services Sold', target: 250, icon: ShoppingBag, color: 'text-orange-500' },
];

const LIFESTYLE_REWARDS = [
  { id: 'mansion-1', type: 'mansion', title: 'Elite Estate', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', icon: Home },
  { id: 'car-1', type: 'car', title: 'Supercar Fleet', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', icon: Car },
  { id: 'cash-1', type: 'dollars', title: 'Cash Reserves', image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80', icon: Banknote },
  { id: 'mansion-2', type: 'mansion', title: 'Coastal Villa', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', icon: Home },
  { id: 'car-2', type: 'car', title: 'Luxury GT', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80', icon: Car },
  { id: 'cash-2', type: 'dollars', title: 'Wealth Growth', image: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=800&q=80', icon: Banknote },
];

export default function AwardCampaign() {
  const { user } = useAuth();
  const { balance, sendPayment } = useWallet();
  const [isJoined, setIsJoined] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('stripe');
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoin = async () => {
    setIsJoining(true);
    try {
      if (paymentMethod === 'stripe') {
        await stripeService.createCheckoutSession('price_supreme_100', `${window.location.origin}/?award_joined=supreme`);
      } else {
        const success = sendPayment(100, 'Supreme Award Program Entry Fee', 'Awards');
        if (success) {
          setIsJoined(true);
          toast.success('Successfully joined Supreme Award Program!');
        } else {
          toast.error('Insufficient wallet balance');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join award program';
      toast.error(message);
      console.error('Join error:', error);
    } finally {
      setIsJoining(false);
    }
  };
  
  // Mock platform data
  const platformSubs = 64200;
  const platformTarget = 100000;
  const monthsElapsed = 8;
  const totalMonths = platformSubs >= platformTarget ? 18 : 36;
  const monthsRemaining = totalMonths - monthsElapsed;

  // Mock user progress
  const userProgress = {
    likes: 45000,
    subscribers: 12000,
    hours: 450,
    connections: 120,
    sales: 15
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900">Supreme Connector Award</h2>
          </div>
          <p className="text-sm text-gray-500">The ultimate 18-36 month engagement challenge</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-2xl">
          <Timer className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Remaining</p>
            <p className="text-sm font-bold">{monthsRemaining} Months</p>
          </div>
        </div>
      </div>

      {/* Platform Goal Section */}
      <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Platform Goal</p>
              <h3 className="text-2xl font-display font-bold text-gray-900">{platformSubs.toLocaleString()} / {platformTarget.toLocaleString()}</h3>
              <p className="text-xs text-amber-700 mt-1">Total platform subscribers needed to conclude in 18 months</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-amber-600">{Math.round((platformSubs/platformTarget)*100)}%</span>
            </div>
          </div>
          <div className="w-full bg-amber-200/50 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(platformSubs/platformTarget)*100}%` }}
              className="h-full bg-amber-500 rounded-full"
            />
          </div>
          {platformSubs < platformTarget && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-200/30 p-2 rounded-xl border border-amber-200/50">
              <AlertCircle className="w-4 h-4" />
              <span>Target not reached: Campaign extended to 36 months.</span>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Prize Analysis Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" /> Prize Pool Analysis (Top 18)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRIZES.map((prize) => (
            <div key={prize.rank} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center group hover:border-amber-500/30 transition-all">
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm",
                prize.rank === 1 ? "bg-amber-500 text-white" : "bg-white text-gray-400"
              )}>
                <span className="text-sm font-bold">#{prize.rank}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{prize.label}</p>
              <p className="text-lg font-display font-bold text-gray-900">${(prize.amount/1000).toLocaleString()}K</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold">Ranks #6 to #18</p>
              <p className="text-[10px] text-gray-400">Rewarded based on best effort & engagement</p>
            </div>
          </div>
          <p className="text-sm font-bold text-amber-500">Effort-Based Rewards</p>
        </div>
      </div>

      {/* Personal Requirements */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> Your Award Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUIREMENTS.map((req) => {
            const progress = Math.min((userProgress[req.id as keyof typeof userProgress] / req.target) * 100, 100);
            const Icon = req.icon;
            return (
              <div key={req.id} className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-xl bg-gray-50", req.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{req.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={clsx("h-full rounded-full", req.color.replace('text', 'bg'))} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-900">{userProgress[req.id as keyof typeof userProgress].toLocaleString()}</span>
                  <span className="text-gray-400">Target: {req.target.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Explanation */}
      <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" /> Program Details & Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 leading-relaxed">
          <div className="space-y-3">
            <p><span className="font-bold text-gray-900">Cycle:</span> Every 18 months, users are rewarded for their engagement and activities if requirements are met.</p>
            <p><span className="font-bold text-gray-900">Extension:</span> If the platform target of 100,000 subscribers is not reached within 18 months, the campaign extends to 36 months.</p>
            <p><span className="font-bold text-gray-900">Fallback:</span> If full requirements aren't met by the deadline, the top 18 performers based on effort will still be rewarded.</p>
          </div>
          <div className="space-y-3">
            <p><span className="font-bold text-gray-900">Entry Fee:</span> A one-time payment of <span className="text-amber-600 font-bold">$100</span> is required to enter the award program.</p>
            <p><span className="font-bold text-gray-900">Expiration:</span> Your entry remains valid for the duration of the current cycle (18-36 months).</p>
            <p><span className="font-bold text-gray-900">Selection:</span> Winners are chosen from the top 18 highest performers based on a combined analysis of all 5 metrics.</p>
          </div>
        </div>
      </div>

      {/* Lifestyle Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> The Supreme Lifestyle
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ultimate Rewards Preview</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIFESTYLE_REWARDS.map((reward) => (
            <motion.div 
              key={reward.id}
              whileHover={{ y: -5 }}
              className="group relative h-48 rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <img 
                src={reward.image} 
                alt={reward.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                    <reward.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">{reward.title}</span>
                </div>
                <div className="px-2 py-1 bg-amber-500 rounded-full">
                  <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Premium Reward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {!isJoined ? (
        <div className="space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
            <button 
              onClick={() => setPaymentMethod('stripe')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                paymentMethod === 'stripe' ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <CreditCard className="w-4 h-4" /> Pay with Stripe
            </button>
            <button 
              onClick={() => setPaymentMethod('wallet')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                paymentMethod === 'wallet' ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Wallet className="w-4 h-4" /> Pay with Wallet
            </button>
          </div>

          <button 
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isJoining ? 'Processing...' : `Join Award Program - $100.00`}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">You are enrolled in the Supreme Award Program</span>
        </div>
      )}
    </div>
  );
}
