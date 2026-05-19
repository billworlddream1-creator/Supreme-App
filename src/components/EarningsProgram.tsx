import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DollarSign, Users, Heart, Clock, UserPlus, ShoppingBag, CreditCard, TrendingUp, AlertCircle, CheckCircle, Smartphone, Globe, BarChart3, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

// International Standard Tiers for Ad Revenue (CPM - Cost Per Mille)
const AD_TIERS = {
  TIER_1: { name: 'Tier 1 (High)', cpm: 3.00, countries: ['USA', 'UK', 'Canada', 'Australia', 'Germany'] },
  TIER_2: { name: 'Tier 2 (Medium)', cpm: 1.50, countries: ['Brazil', 'Mexico', 'South Africa', 'Thailand'] },
  TIER_3: { name: 'Tier 3 (Standard)', cpm: 0.50, countries: ['Others'] }
};

// Mock data for the user's current progress
const MOCK_PROGRESS = {
  subscribers: 845,
  likes: 720,
  hoursWeekly: 7.5,
  friends: 85,
  productsSold: 120,
  subscriptionsMade: 3,
  dailyPosts: 45,
  dailyVideos: 12,
  adImpressions: 12540, // New: Total ad impressions on user content
  userTier: 'TIER_1' // New: User's geographic tier
};

const EARNING_RATES = {
  subscribers: { target: 1000, rate: 1.1111, label: 'Subscribers' },
  likes: { target: 1000, rate: 0.11111, label: 'Likes' },
  hoursWeekly: { target: 10, rate: 0.1111, label: 'Hours Weekly' },
  friends: { target: 100, rate: 5.00, label: 'Friends' },
  productsSold: { target: 25, rate: 0.11111, label: 'Products Sold/Week' },
  subscriptionsMade: { target: 1, rate: 0.11111, label: 'Subscriptions Made' },
  dailyPosts: { target: 50, rate: 0.00111, label: 'Daily Posts' },
  dailyVideos: { target: 25, rate: 0.00111, label: 'Daily Videos' }
};

import { useWallet } from '../context/WalletContext';

export default function EarningsProgram() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBoosted } = useWallet();
  
  // Check if user is eligible (paid user or dealer)
  // Assuming 'premium-user' and 'dealer' are the paid tiers based on context
  const isEligible = user?.role === 'premium-user' || user?.role === 'dealer';

  const calculateEarnings = () => {
    let total = 0;
    total += Math.floor(MOCK_PROGRESS.subscribers / EARNING_RATES.subscribers.target) * EARNING_RATES.subscribers.rate;
    total += Math.floor(MOCK_PROGRESS.likes / EARNING_RATES.likes.target) * EARNING_RATES.likes.rate;
    total += Math.floor(MOCK_PROGRESS.hoursWeekly / EARNING_RATES.hoursWeekly.target) * EARNING_RATES.hoursWeekly.rate;
    total += Math.floor(MOCK_PROGRESS.friends / EARNING_RATES.friends.target) * EARNING_RATES.friends.rate;
    total += Math.floor(MOCK_PROGRESS.productsSold / EARNING_RATES.productsSold.target) * EARNING_RATES.productsSold.rate;
    total += Math.floor(MOCK_PROGRESS.subscriptionsMade / EARNING_RATES.subscriptionsMade.target) * EARNING_RATES.subscriptionsMade.rate;
    total += Math.floor(MOCK_PROGRESS.dailyPosts / EARNING_RATES.dailyPosts.target) * EARNING_RATES.dailyPosts.rate;
    total += Math.floor(MOCK_PROGRESS.dailyVideos / EARNING_RATES.dailyVideos.target) * EARNING_RATES.dailyVideos.rate;
    
    // Add Tiered Ad Revenue
    const tier = AD_TIERS[MOCK_PROGRESS.userTier as keyof typeof AD_TIERS];
    total += (MOCK_PROGRESS.adImpressions / 1000) * tier.cpm;
    
    // Apply 5% Boost if active
    if (isBoosted) {
      total *= 1.05;
    }
    
    return total;
  };

  const calculateProjected = () => {
    let total = 0;
    total += (MOCK_PROGRESS.subscribers / EARNING_RATES.subscribers.target) * EARNING_RATES.subscribers.rate;
    total += (MOCK_PROGRESS.likes / EARNING_RATES.likes.target) * EARNING_RATES.likes.rate;
    total += (MOCK_PROGRESS.hoursWeekly / EARNING_RATES.hoursWeekly.target) * EARNING_RATES.hoursWeekly.rate;
    total += (MOCK_PROGRESS.friends / EARNING_RATES.friends.target) * EARNING_RATES.friends.rate;
    total += (MOCK_PROGRESS.productsSold / EARNING_RATES.productsSold.target) * EARNING_RATES.productsSold.rate;
    total += (MOCK_PROGRESS.subscriptionsMade / EARNING_RATES.subscriptionsMade.target) * EARNING_RATES.subscriptionsMade.rate;
    total += (MOCK_PROGRESS.dailyPosts / EARNING_RATES.dailyPosts.target) * EARNING_RATES.dailyPosts.rate;
    total += (MOCK_PROGRESS.dailyVideos / EARNING_RATES.dailyVideos.target) * EARNING_RATES.dailyVideos.rate;
    
    // Projected Ad Revenue (assuming 20% growth)
    const tier = AD_TIERS[MOCK_PROGRESS.userTier as keyof typeof AD_TIERS];
    total += ((MOCK_PROGRESS.adImpressions * 1.2) / 1000) * tier.cpm;

    // Apply 5% Boost if active
    if (isBoosted) {
      total *= 1.05;
    }
    
    return total;
  };

  const PAYOUT_THRESHOLD = 50.00;
  const currentEarnings = calculateEarnings();
  const projectedEarnings = calculateProjected();
  const payoutProgress = Math.min((currentEarnings / PAYOUT_THRESHOLD) * 100, 100);
  const canWithdraw = currentEarnings >= PAYOUT_THRESHOLD;

  const renderProgressCard = (
    title: string, 
    current: number, 
    target: number, 
    rate: number, 
    icon: React.ElementType, 
    colorClass: string
  ) => {
    const progress = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;
    const Icon = icon;

    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-xl", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">${rate.toFixed(5)} per {target}</p>
            </div>
          </div>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <span className="text-xs font-bold text-gray-400">{Math.round(progress)}%</span>
          )}
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx("h-full rounded-full", isCompleted ? "bg-green-500" : "bg-[var(--color-supreme-gold)]")}
          />
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-900">{current.toLocaleString()}</span>
          <span className="text-gray-400">{target.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  if (!isEligible) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--color-supreme-gold)]/20 rounded-full flex items-center justify-center border border-[var(--color-supreme-gold)]/30">
            <DollarSign className="w-8 h-8 text-[var(--color-supreme-gold)]" />
          </div>
          <h2 className="text-2xl font-display font-bold">Supreme Earning Program</h2>
          <p className="text-gray-400 max-w-md">
            Unlock the ability to earn money from your engagement, subscribers, and sales. 
            This feature is exclusively available for Premium Users and Dealers.
          </p>
          <button 
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 mt-4"
          >
            Upgrade to Premium
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Earning Program Analysis
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track your progress and maximize your platform earnings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings Summary */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Current Earnings</p>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-4xl font-display font-bold text-[var(--color-supreme-gold)]">
                ${currentEarnings.toFixed(5)}
              </h3>
              {isBoosted && (
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-[10px] font-bold border border-amber-500/30 mb-1">
                  <Zap className="w-3 h-3 fill-current" /> 5% BOOST ACTIVE
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Projected Earnings (Prorated)</span>
                <div className="text-right">
                  <span className="font-bold text-white block">${projectedEarnings.toFixed(5)}</span>
                  {isBoosted && <span className="text-[10px] text-amber-400 font-bold">Includes 5% Boost</span>}
                </div>
              </div>

              {/* Payout Threshold Progress */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payout Progress</span>
                  <span className="text-xs font-bold text-[var(--color-supreme-gold)]">{Math.round(payoutProgress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${payoutProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={clsx("h-full rounded-full", canWithdraw ? "bg-green-500" : "bg-[var(--color-supreme-gold)]")}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">${currentEarnings.toFixed(2)}</span>
                  <span className="text-gray-400">Target: ${PAYOUT_THRESHOLD.toFixed(2)}</span>
                </div>
                
                <button 
                  disabled={!canWithdraw}
                  className={clsx(
                    "w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                    canWithdraw 
                      ? "bg-[var(--color-supreme-gold)] text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20" 
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <CreditCard className="w-4 h-4" />
                  Withdraw via Stripe or Mobile App
                </button>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  Minimum payout threshold is <span className="text-blue-400 font-bold">$50.00</span>. Withdrawals are processed securely via Stripe or directly to your connected Mobile App.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--color-supreme-gold)]/10 rounded-full blur-3xl" />
        </div>

        {/* Progress Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderProgressCard('Subscribers', MOCK_PROGRESS.subscribers, EARNING_RATES.subscribers.target, EARNING_RATES.subscribers.rate, Users, 'bg-blue-50 text-blue-600')}
            {renderProgressCard('Platform Likes', MOCK_PROGRESS.likes, EARNING_RATES.likes.target, EARNING_RATES.likes.rate, Heart, 'bg-red-50 text-red-600')}
            {renderProgressCard('Weekly Hours', MOCK_PROGRESS.hoursWeekly, EARNING_RATES.hoursWeekly.target, EARNING_RATES.hoursWeekly.rate, Clock, 'bg-purple-50 text-purple-600')}
            {renderProgressCard('Friends', MOCK_PROGRESS.friends, EARNING_RATES.friends.target, EARNING_RATES.friends.rate, UserPlus, 'bg-green-50 text-green-600')}
            {renderProgressCard('Products Sold', MOCK_PROGRESS.productsSold, EARNING_RATES.productsSold.target, EARNING_RATES.productsSold.rate, ShoppingBag, 'bg-orange-50 text-orange-600')}
            {renderProgressCard('Subscriptions', MOCK_PROGRESS.subscriptionsMade, EARNING_RATES.subscriptionsMade.target, EARNING_RATES.subscriptionsMade.rate, CreditCard, 'bg-teal-50 text-teal-600')}
            {renderProgressCard('Daily Posts', MOCK_PROGRESS.dailyPosts, EARNING_RATES.dailyPosts.target, EARNING_RATES.dailyPosts.rate, Smartphone, 'bg-indigo-50 text-indigo-600')}
            {renderProgressCard('Daily Videos', MOCK_PROGRESS.dailyVideos, EARNING_RATES.dailyVideos.target, EARNING_RATES.dailyVideos.rate, BarChart3, 'bg-pink-50 text-pink-600')}
          </div>

          {/* Tiered Ad Revenue Analysis */}
          <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Tiered Ad Revenue</h3>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase">
                {AD_TIERS[MOCK_PROGRESS.userTier as keyof typeof AD_TIERS].name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Impressions</p>
                <p className="text-xl font-display font-bold text-gray-900">{MOCK_PROGRESS.adImpressions.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-bold">
                  <TrendingUp className="w-3 h-3" /> +12% this week
                </div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tier CPM Rate</p>
                <p className="text-xl font-display font-bold text-gray-900">${AD_TIERS[MOCK_PROGRESS.userTier as keyof typeof AD_TIERS].cpm.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Per 1,000 impressions</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Total Ad Earnings</p>
                  <p className="text-[10px] text-gray-400">Calculated based on international standards</p>
                </div>
              </div>
              <p className="text-lg font-display font-bold text-amber-600">
                ${((MOCK_PROGRESS.adImpressions / 1000) * AD_TIERS[MOCK_PROGRESS.userTier as keyof typeof AD_TIERS].cpm).toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
