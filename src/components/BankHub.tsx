import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  ThumbsUp, 
  Users, 
  MessageSquare, 
  Activity, 
  Calendar,
  BarChart3,
  Eye,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Mock Data
const SUBSCRIBED_VIDEOS = [
  { id: '1', title: 'The Future of AI in Entertainment', channel: 'Elena Vance', date: '2026-03-20T14:30:00Z', duration: '12:45' },
  { id: '2', title: 'Venture Capital Secrets 2026', channel: 'Marcus Sterling', date: '2026-03-18T09:15:00Z', duration: '22:30' },
  { id: '3', title: 'Elite Networking Masterclass', channel: 'Julian Thorne', date: '2026-03-15T16:45:00Z', duration: '18:40' },
  { id: '4', title: 'Sustainable Energy Revolution', channel: 'Sophia Chen', date: '2026-03-10T11:20:00Z', duration: '10:15' },
];

const POST_STATS = {
  totalLikes: 12450,
  totalFollowers: 8420,
  totalComments: 3240,
  recentPosts: [
    { id: 'p1', content: 'Just wrapped up an amazing keynote...', likes: 1240, comments: 85, date: '2026-03-22' },
    { id: 'p2', content: 'Looking for the next big thing...', likes: 850, comments: 120, date: '2026-03-19' },
    { id: 'p3', content: 'Excited to announce our new partnership...', likes: 2100, comments: 340, date: '2026-03-14' },
  ]
};

const ACTIVITY_FOOTPRINTS = [
  { id: 'a1', action: 'Watched Video', target: 'The Future of AI...', time: '2 hours ago', icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'a2', action: 'Liked Post', target: 'Marcus Sterling\'s update', time: '5 hours ago', icon: ThumbsUp, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'a3', action: 'Followed User', target: 'Sophia Chen', time: '1 day ago', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'a4', action: 'Commented', target: 'Elite Networking...', time: '2 days ago', icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'a5', action: 'Joined Group', target: 'Tech Innovators', time: '3 days ago', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
];

const MONTHLY_ANALYTICS = [
  { name: 'Week 1', engagement: 400, views: 2400, interactions: 240 },
  { name: 'Week 2', engagement: 300, views: 1398, interactions: 221 },
  { name: 'Week 3', engagement: 200, views: 9800, interactions: 229 },
  { name: 'Week 4', engagement: 278, views: 3908, interactions: 200 },
];

export default function BankHub() {
  const [currentMonth, setCurrentMonth] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    setCurrentMonth(monthNames[now.getMonth()]);

    // Calculate days left in the month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diffTime = Math.abs(lastDay.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDaysLeft(diffDays);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Disclaimer / Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900">Monthly Activity Report</h4>
          <p className="text-sm text-amber-700 mt-1">
            This information is only visible for the current month ({currentMonth}) and will disappear from view in {daysLeft} days. 
            Bank Hub houses all your activities and engagement on the platform for analysis.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subscribed Videos</p>
            <p className="text-2xl font-display font-bold text-gray-900">{SUBSCRIBED_VIDEOS.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Post Likes</p>
            <p className="text-2xl font-display font-bold text-gray-900">{POST_STATS.totalLikes.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Followers</p>
            <p className="text-2xl font-display font-bold text-gray-900">{POST_STATS.totalFollowers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Engagement Analysis</h3>
              <p className="text-sm text-gray-500">Your activity trends this month</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_ANALYTICS}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscribed Videos */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Subscribed Videos</h3>
              <p className="text-sm text-gray-500">Videos you've saved this month</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4">
            {SUBSCRIBED_VIDEOS.map((video) => (
              <div key={video.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                  <Video className="w-5 h-5 text-gray-400" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded font-bold">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{video.title}</p>
                  <p className="text-xs text-gray-500">{video.channel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-gray-900">{new Date(video.date).toLocaleDateString()}</p>
                  <p className="text-[10px] text-gray-500">{new Date(video.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Post Stats & Comments */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Post Performance</h3>
              <p className="text-sm text-gray-500">Likes, followers, and comments</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4">
            {POST_STATS.recentPosts.map((post) => (
              <div key={post.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-700 font-medium mb-3">"{post.content}"</p>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                    <ThumbsUp className="w-3 h-3" /> {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    <MessageSquare className="w-3 h-3" /> {post.comments.toLocaleString()}
                  </span>
                  <span className="ml-auto text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Footprints */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Activity Footprints</h3>
              <p className="text-sm text-gray-500">Your recent actions on the platform</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {ACTIVITY_FOOTPRINTS.map((activity, index) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.bg} ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{activity.action}</span>
                    <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{activity.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
