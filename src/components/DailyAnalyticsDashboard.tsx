import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, MessageSquare, Eye, Video, Zap, Megaphone, 
  FileText, ShoppingBag, UserPlus, Globe, Users, Clock, 
  Radio, Award, ChevronRight, BarChart3
} from 'lucide-react';
import { clsx } from 'clsx';

interface AnalyticsItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  owner?: {
    name: string;
    avatar: string;
  };
  trend?: string;
}

const AnalyticsItem = ({ title, value, subtitle, icon: Icon, color, owner, trend }: AnalyticsItemProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={clsx("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
    </div>
    
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-display font-bold text-gray-900">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>

    {owner && (
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
        <img src={owner.avatar} alt={owner.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate">{owner.name}</p>
          <p className="text-[10px] text-gray-400">Owner/Creator</p>
        </div>
      </div>
    )}
  </motion.div>
);

export default function DailyAnalyticsDashboard() {
  // Mock data for analytics
  const analyticsData = {
    highestCommented: {
      title: "Highest Commented",
      value: "1,240 Comments",
      subtitle: "Video: 'Future of AI'",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
      owner: { name: "Sarah Chen", avatar: "https://picsum.photos/seed/sarah/100" }
    },
    highestWatched: {
      title: "Most Watched",
      value: "45.2K Views",
      subtitle: "Video: 'Supreme Lifestyle'",
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
      owner: { name: "James Wilson", avatar: "https://picsum.photos/seed/james/100" }
    },
    aiCreated: {
      title: "AI Content Created",
      value: "842",
      subtitle: "Videos, Ads & Text",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
      trend: "+12% today"
    },
    adsCreated: {
      title: "Ads Created",
      value: "156",
      subtitle: "Active Campaigns",
      icon: Megaphone,
      color: "bg-indigo-100 text-indigo-600",
      owner: { name: "Marketing Pro", avatar: "https://picsum.photos/seed/marketing/100" }
    },
    postsPerDay: {
      title: "Daily Posts",
      value: "3,420",
      subtitle: "Community Updates",
      icon: FileText,
      color: "bg-emerald-100 text-emerald-600",
      trend: "+5.4%"
    },
    videosUploaded: {
      title: "Videos Uploaded",
      value: "215",
      subtitle: "New Content",
      icon: Video,
      color: "bg-rose-100 text-rose-600",
      trend: "+8.1%"
    },
    goodsSold: {
      title: "Goods & Services Sold",
      value: "1,120",
      subtitle: "Total Transactions",
      icon: ShoppingBag,
      color: "bg-cyan-100 text-cyan-600",
      trend: "+15.2%"
    },
    bestSelling: {
      title: "Best Selling",
      value: "Supreme AI Pro",
      subtitle: "420 sales today",
      icon: Award,
      color: "bg-yellow-100 text-yellow-600"
    },
    newSignups: {
      title: "New Sign Ups",
      value: "450",
      subtitle: "New Members",
      icon: UserPlus,
      color: "bg-pink-100 text-pink-600",
      trend: "+22%"
    },
    visitors: {
      title: "Daily Visitors",
      value: "12.5K",
      subtitle: "Unique Sessions",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
      trend: "+3.2%"
    },
    onlineUsers: {
      title: "Online Users",
      value: "1,842",
      subtitle: "Currently Active",
      icon: Users,
      color: "bg-green-100 text-green-600"
    },
    highestEngager: {
      title: "Top Activity Engager",
      value: "8.5 Hours",
      subtitle: "Daily Activity",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
      owner: { name: "Emma Davis", avatar: "https://picsum.photos/seed/emma/100" }
    },
    streamEngagers: {
      title: "Live Stream Stats",
      value: "2,450",
      subtitle: "Engagers / 120 Hours",
      icon: Radio,
      color: "bg-red-100 text-red-600",
      owner: { name: "Stream Master", avatar: "https://picsum.photos/seed/stream/100" }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Daily Performance Analysis</h2>
            <p className="text-sm text-gray-500">Real-time insights into platform activity and engagement</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-all">
          View Full Report <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnalyticsItem {...analyticsData.highestCommented} />
        <AnalyticsItem {...analyticsData.highestWatched} />
        <AnalyticsItem {...analyticsData.aiCreated} />
        <AnalyticsItem {...analyticsData.adsCreated} />
        <AnalyticsItem {...analyticsData.postsPerDay} />
        <AnalyticsItem {...analyticsData.videosUploaded} />
        <AnalyticsItem {...analyticsData.goodsSold} />
        <AnalyticsItem {...analyticsData.bestSelling} />
        <AnalyticsItem {...analyticsData.newSignups} />
        <AnalyticsItem {...analyticsData.visitors} />
        <AnalyticsItem {...analyticsData.onlineUsers} />
        <AnalyticsItem {...analyticsData.highestEngager} />
        <AnalyticsItem {...analyticsData.streamEngagers} />
      </div>

      {/* Summary Analysis Card */}
      <div className="bg-gray-900 rounded-[2rem] p-8 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-display font-bold mb-4">Daily Growth Summary</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Today's platform performance shows a significant upward trend in AI content generation 
              and user engagement. The "Supreme AI Pro" subscription remains the top-selling service, 
              driving 420 new sales in the last 24 hours.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold">8.4%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Retention Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-900/20">
              <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-sm font-medium opacity-80">Total Revenue Today</p>
              <p className="text-3xl font-display font-bold">$12,450.00</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Users className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-sm font-medium opacity-80">Active Sessions</p>
              <p className="text-3xl font-display font-bold">4,210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
