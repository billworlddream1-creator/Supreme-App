import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Play, 
  Eye, 
  MessageSquare, 
  Share2, 
  Zap, 
  Trophy, 
  Target,
  Wallet,
  ArrowRightCircle
} from 'lucide-react';

const EWSP = () => {
  const earningWays = [
    {
      title: "Subscriber Rewards",
      description: "Earn based on your growing community and influence.",
      example: "1,000 Subscribers = $1.11111",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      title: "Content Engagement",
      description: "Get paid for likes, comments, and shares on your vibes and media.",
      example: "10,000 Likes = $5.50",
      icon: MessageSquare,
      color: "text-pink-400",
      bgColor: "bg-pink-400/10"
    },
    {
      title: "Video Views",
      description: "Monetize your video content through high-quality views.",
      example: "1,000 Views = $0.85",
      icon: Play,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10"
    },
    {
      title: "Mining Operations",
      description: "Participate in Supreme Coin mining for passive earnings.",
      example: "Daily Mining = Variable based on Hashrate",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10"
    },
    {
      title: "GMT Forex Trading",
      description: "Profit from successful trades in the integrated Forex market.",
      example: "Up to 85% profit per successful trade",
      icon: TrendingUp,
      color: "text-indigo-400",
      bgColor: "bg-indigo-400/10"
    },
    {
      title: "Referral Program",
      description: "Invite others to join the Supreme platform and earn commissions.",
      example: "10% of referral's first subscription",
      icon: Share2,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    }
  ];

  const thresholds = [
    { label: "Minimum Payout", value: "$50.00", icon: Wallet },
    { label: "Processing Time", value: "24-48 Hours", icon: Target },
    { label: "Payment Methods", value: "Bank, Crypto, Supreme Wallet", icon: DollarSign }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-[var(--color-supreme-gold)] tracking-tight uppercase">
          EWSP: Earning Ways of Supreme Platform
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Discover all the ways you can monetize your presence and activities on the Supreme platform. 
          Analyze your potential and start building your digital wealth today.
        </p>
      </div>

      {/* Earning Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {earningWays.map((way, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 hover:border-[var(--color-supreme-gold)]/30 transition-all group"
          >
            <div className={`w-12 h-12 ${way.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <way.icon className={`w-6 h-6 ${way.color}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${way.color}`}>{way.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{way.description}</p>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Earning Example</p>
              <p className="text-white font-mono font-bold">{way.example}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cash Out Thresholds */}
      <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 p-8 rounded-[2.5rem] border border-amber-500/20">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-[var(--color-supreme-gold)]" />
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Supreme Cash Out Thresholds</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {thresholds.map((item, i) => (
            <div key={i} className="bg-black/40 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl">
                <item.icon className="w-6 h-6 text-[var(--color-supreme-gold)]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{item.label}</p>
                <p className="text-xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
        <h3 className="text-2xl font-bold text-emerald-400 mb-6 uppercase tracking-tight">Earning Analysis & Strategy</h3>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-emerald-500/20 rounded-full">
              <ArrowRightCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Consistency is Key</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Users who post daily vibes and engage with at least 50 other users see a 300% increase in their engagement earnings. 
                The platform rewards active participation and community building.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-blue-500/20 rounded-full">
              <ArrowRightCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">High-Value Content</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Video content currently has the highest CPM (Cost Per Mille) on the platform. 
                Uploading original 4K media can significantly boost your view-based revenue compared to standard vibes.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="mt-1 p-1 bg-purple-500/20 rounded-full">
              <ArrowRightCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Network Multiplication</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                By reaching the 'Royal' rank, your earning multipliers increase by 1.5x across all activities. 
                Focus on rank progression to maximize your long-term earning potential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center p-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <p className="text-xs text-gray-500 italic">
          * All earnings are subject to verification and compliance with Supreme Community Guidelines. 
          Rates may fluctuate based on platform performance and advertiser demand.
        </p>
      </div>
    </motion.div>
  );
};

export default EWSP;
