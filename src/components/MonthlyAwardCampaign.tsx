import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, Clock, Users, Heart, DollarSign, Info, CheckCircle2, Timer, ChevronRight, Video, Star, AlertCircle, CreditCard, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useMonthlyAwards } from '../context/MonthlyAwardsContext';
import { useAuth } from '../context/AuthContext';
import { stripeService } from '../services/stripe';

export default function MonthlyAwardCampaign() {
  const { user } = useAuth();
  const { settings, isEnrolled, enroll, daysRemaining, currentSubscribers, getTopPerformers } = useMonthlyAwards();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('stripe');

  const topPerformers = getTopPerformers(5);
  const userRank = topPerformers.findIndex(p => p.userId === user?.id) + 1;

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      if (paymentMethod === 'stripe') {
        const data = await stripeService.createCheckoutSession('price_monthly_10', `${window.location.origin}/?award_joined=monthly`);
        if (data.url) window.location.href = data.url;
      } else {
        await enroll();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll in monthly awards';
      toast.error(message);
      console.error('Enroll error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const requirements = [
    { label: 'Connected Friends', icon: Users, color: 'text-blue-500' },
    { label: 'Likes Received', icon: Heart, color: 'text-red-500' },
    { label: 'Videos Uploaded', icon: Video, color: 'text-purple-500' },
    { label: 'Activity Hours', icon: Clock, color: 'text-teal-500' },
    { label: 'Video Subscribers', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Trophy className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900">Monthly Awards Program</h2>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Cycle #{settings.currentCycleId}
            </span>
          </div>
          <p className="text-sm text-gray-500">Reward your engagement and activities every month</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-900 text-white px-4 py-2 rounded-2xl">
          <Timer className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Time Remaining</p>
            <p className="text-sm font-bold">{daysRemaining} Days</p>
          </div>
        </div>
      </div>

      {/* Program Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-1">Program Goal</p>
          <h3 className="text-2xl font-display font-bold text-gray-900">{currentSubscribers.toLocaleString()} / {settings.targetSubscribers.toLocaleString()}</h3>
          <p className="text-xs text-indigo-700 mt-1">Subscribers needed to conclude in {settings.durationDays} days</p>
          <div className="w-full bg-indigo-200/50 rounded-full h-2 mt-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentSubscribers / settings.targetSubscribers) * 100, 100)}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Your Status</p>
          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Enrolled</span>
              </div>
              <p className="text-sm text-amber-700">Current Rank: <span className="font-bold">{userRank > 0 ? `#${userRank}` : 'Unranked'}</span></p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-amber-700 font-medium">Not enrolled yet</p>
              <p className="text-xs text-amber-600">Join now for only ${settings.entryFee}</p>
            </div>
          )}
        </div>
      </div>

      {/* Prize Tiers */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" /> Monthly Prize Tiers (Top 5)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {settings.prizes.map((prize) => (
            <div key={prize.rank} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all">
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm",
                prize.rank === 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-400"
              )}>
                <span className="text-sm font-bold">#{prize.rank}</span>
              </div>
              <p className="text-lg font-display font-bold text-gray-900">${prize.amount.toLocaleString()}</p>
              <div className="mt-2 space-y-1">
                 <p className="text-[8px] text-gray-500 uppercase font-bold">Requirements</p>
                 <p className="text-[9px] text-gray-600">{prize.requirements.friends} Friends</p>
                 <p className="text-[9px] text-gray-600">{prize.requirements.likes.toLocaleString()} Likes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Requirements Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
            <tr>
              <th className="px-4 py-3">Metric</th>
              {settings.prizes.map(p => <th key={p.rank} className="px-4 py-3 text-center">#{p.rank}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requirements.map((req, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <req.icon className={clsx("w-3 h-3", req.color)} />
                  {req.label}
                </td>
                {settings.prizes.map(p => {
                  let val = 0;
                  if (req.label.includes('Friends')) val = p.requirements.friends;
                  if (req.label.includes('Likes')) val = p.requirements.likes;
                  if (req.label.includes('Videos')) val = p.requirements.videos;
                  if (req.label.includes('Activity')) val = p.requirements.activityHours;
                  if (req.label.includes('Subscribers')) val = p.requirements.subscribers;
                  return (
                    <td key={p.rank} className="px-4 py-3 text-center text-gray-600">
                      {val.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rules & Info */}
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900">Program Rules</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>Entry fee is ${settings.entryFee} per month.</li>
              <li>Duration is {settings.durationDays} days. If {settings.targetSubscribers} subscribers aren't reached, it extends to 62 days.</li>
              <li>Top 5 performers based on engagement metrics will be rewarded.</li>
              <li>Prizes are paid directly to your Supreme Wallet upon conclusion.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!isEnrolled ? (
        <div className="space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
            <button 
              onClick={() => setPaymentMethod('stripe')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                paymentMethod === 'stripe' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <CreditCard className="w-4 h-4" /> Pay with Stripe
            </button>
            <button 
              onClick={() => setPaymentMethod('wallet')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                paymentMethod === 'wallet' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Wallet className="w-4 h-4" /> Pay with Wallet
            </button>
          </div>

          <button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isEnrolling ? 'Processing...' : `Join Monthly Awards - $${settings.entryFee}.00`}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">You are enrolled in this month's program</span>
        </div>
      )}
    </div>
  );
}
