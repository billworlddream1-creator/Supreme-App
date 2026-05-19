import React, { useState } from 'react';
// Supreme Insight Page - Intel and Analysis
// Force build update v3
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  Play, 
  TrendingUp, 
  DollarSign, 
  Trophy, 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  X, 
  Activity,
  BarChart3,
  Clock,
  MoreHorizontal,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';

// --- Types ---

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  views: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  duration: string;
  author: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: 'Business' | 'Politics' | 'Tech' | 'Global';
  source: string;
  timestamp: string;
}

interface RichPerson {
  rank: number;
  name: string;
  netWorth: string;
  source: string;
  image: string;
  change: number; // Percentage change
}

interface Company {
  rank: number;
  name: string;
  ticker: string;
  marketCap: string;
  change: number;
}

interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'Live' | 'FT' | 'HT';
  time: string;
  analysis: string;
}

interface Influencer {
  rank: number;
  name: string;
  category: string;
  followers: string;
  image: string;
}

// --- Mock Data ---

const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'The Future of AI in Global Markets',
    thumbnail: 'https://picsum.photos/seed/video1/640/360',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: '1.2M',
    likes: 45000,
    dislikes: 1200,
    duration: '12:45',
    author: 'Tech Supreme',
    comments: [
      { id: 'c1', user: 'Alex M.', avatar: 'https://picsum.photos/seed/u1/50', text: 'Incredible insights!', timestamp: '2h ago' },
      { id: 'c2', user: 'Sarah K.', avatar: 'https://picsum.photos/seed/u2/50', text: 'The market analysis is spot on.', timestamp: '5h ago' }
    ]
  },
  {
    id: 'v2',
    title: 'Exclusive: Inside the Billionaire Mindset',
    thumbnail: 'https://picsum.photos/seed/video2/640/360',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: '890K',
    likes: 32000,
    dislikes: 800,
    duration: '18:20',
    author: 'Wealth Daily',
    comments: []
  },
  {
    id: 'v3',
    title: 'Top 10 Emerging Technologies of 2025',
    thumbnail: 'https://picsum.photos/seed/video3/640/360',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: '2.5M',
    likes: 120000,
    dislikes: 1500,
    duration: '10:15',
    author: 'Future Watch',
    comments: []
  }
];

const NEWS: NewsItem[] = [
  { id: 'n1', title: 'Global Markets Rally as Tech Sector Booms', summary: 'Major indices hit record highs driven by AI advancements.', image: 'https://picsum.photos/seed/news1/400/250', category: 'Business', source: 'Supreme Finance', timestamp: '2h ago' },
  { id: 'n2', title: 'New Energy Policies Reshape Geopolitics', summary: 'Nations pivot to sustainable sources, altering alliances.', image: 'https://picsum.photos/seed/news2/400/250', category: 'Global', source: 'World Intel', timestamp: '4h ago' },
  { id: 'n3', title: 'The Rise of Quantum Computing', summary: 'Breakthroughs in quantum processors promise a new era.', image: 'https://picsum.photos/seed/news3/400/250', category: 'Tech', source: 'Tech Daily', timestamp: '6h ago' },
];

const RICH_LIST: RichPerson[] = [
  { rank: 1, name: 'Elon Musk', netWorth: '$245.8B', source: 'Tesla, SpaceX', image: 'https://picsum.photos/seed/elon/100', change: 2.5 },
  { rank: 2, name: 'Bernard Arnault', netWorth: '$198.2B', source: 'LVMH', image: 'https://picsum.photos/seed/bernard/100', change: -0.8 },
  { rank: 3, name: 'Jeff Bezos', netWorth: '$185.5B', source: 'Amazon', image: 'https://picsum.photos/seed/jeff/100', change: 1.2 },
];

const COMPANIES: Company[] = [
  { rank: 1, name: 'Apple Inc.', ticker: 'AAPL', marketCap: '$3.4T', change: 1.5 },
  { rank: 2, name: 'Microsoft', ticker: 'MSFT', marketCap: '$3.2T', change: 0.8 },
  { rank: 3, name: 'NVIDIA', ticker: 'NVDA', marketCap: '$2.9T', change: 3.2 },
  { rank: 4, name: 'Alphabet', ticker: 'GOOGL', marketCap: '$2.1T', change: -0.5 },
  { rank: 5, name: 'Amazon', ticker: 'AMZN', marketCap: '$1.9T', change: 1.1 },
];

const MATCHES: Match[] = [
  { id: 'm1', league: 'Premier League', homeTeam: 'Man City', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, status: 'Live', time: '78\'', analysis: 'City dominating possession (65%). Arsenal relying on counters.' },
  { id: 'm2', league: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 1, awayScore: 1, status: 'HT', time: '45\'', analysis: 'Tight game. Vinicius Jr. looking dangerous on the wing.' },
  { id: 'm3', league: 'Serie A', homeTeam: 'Juventus', awayTeam: 'AC Milan', homeScore: 0, awayScore: 2, status: 'FT', time: 'Full Time', analysis: 'Milan secures a comfortable away victory with tactical discipline.' },
];

const INFLUENCERS: Influencer[] = [
  { rank: 1, name: 'Cristiano Ronaldo', category: 'Sports', followers: '620M', image: 'https://picsum.photos/seed/cr7/100' },
  { rank: 2, name: 'Lionel Messi', category: 'Sports', followers: '500M', image: 'https://picsum.photos/seed/messi/100' },
  { rank: 3, name: 'Selena Gomez', category: 'Entertainment', followers: '430M', image: 'https://picsum.photos/seed/selena/100' },
];

const INVESTMENT_DATA = [
  { month: 'Jan', value: 45000, growth: 12 },
  { month: 'Feb', value: 52000, growth: 15 },
  { month: 'Mar', value: 48000, growth: 8 },
  { month: 'Apr', value: 61000, growth: 22 },
  { month: 'May', value: 59000, growth: 18 },
  { month: 'Jun', value: 75000, growth: 35 },
  { month: 'Jul', value: 82000, growth: 42 },
  { month: 'Aug', value: 78000, growth: 38 },
  { month: 'Sep', value: 95000, growth: 55 },
  { month: 'Oct', value: 110000, growth: 68 },
  { month: 'Nov', value: 105000, growth: 62 },
  { month: 'Dec', value: 125000, growth: 85 },
];

// --- Components ---

const VideoPlayerModal = ({ video, onClose }: { video: Video, onClose: () => void }) => {
  const [likes, setLikes] = useState(video.likes);
  const [dislikes, setDislikes] = useState(video.dislikes);
  const [comments, setComments] = useState(video.comments);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => setLikes(prev => prev + 1);
  const handleDislike = () => setDislikes(prev => prev + 1);
  
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://picsum.photos/seed/me/50',
      text: newComment,
      timestamp: 'Just now'
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          <div className="relative aspect-video bg-black">
            <video 
              src={video.url} 
              controls 
              autoPlay 
              className="w-full h-full"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 bg-[#1a1a1a] text-white flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{video.views} views</span>
                <span>{video.author}</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <ThumbsUp className="w-5 h-5" /> {likes.toLocaleString()}
                </button>
                <button onClick={handleDislike} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <ThumbsDown className="w-5 h-5" /> {dislikes.toLocaleString()}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="w-full md:w-96 bg-[#121212] border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white">Comments ({comments.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-white">{comment.user}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handlePostComment} className="p-4 border-t border-white/10">
            <div className="relative">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-[#2a2a2a] text-white rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)]"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function SupremeInsight() {
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'sports' | 'entertainment'>('overview');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <FeatureLoader text="Supreme Insight">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-[var(--color-supreme-text)] tracking-tight">
            Supreme Insight
          </h1>
          <p className="text-gray-500 text-lg">Deep intel, live analysis, and global trends.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          {(['overview', 'business', 'sports', 'entertainment'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab 
                  ? "bg-[var(--color-supreme-gold)] text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Feed) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Featured Videos */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-[var(--color-supreme-text)]">Trending Intel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEOS.map((video) => (
                <motion.div 
                  key={video.id}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer shadow-md bg-black"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-white font-bold line-clamp-2 mb-1">{video.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <span>{video.author}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                      <span className="ml-auto bg-black/50 px-2 py-0.5 rounded text-[10px]">{video.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* News Feed */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-[var(--color-supreme-text)]">Deep Intel</h2>
            </div>
            <div className="space-y-4">
              {NEWS.map((news) => (
                <div key={news.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 transition-colors shadow-sm cursor-pointer group">
                  <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--color-supreme-gold)] uppercase tracking-wider">{news.category}</span>
                      <span className="text-xs text-gray-400">• {news.timestamp}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--color-supreme-gold)] transition-colors">{news.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{news.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-8">
          
          {/* Investment Growth Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Investment Growth
              </h3>
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +85% YTD
              </div>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={INVESTMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#999' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#999' }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#b8860b" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#b8860b', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 pb-4 flex justify-between items-center text-[10px] text-gray-400 font-medium">
              <span>Jan 2025</span>
              <span>Dec 2025</span>
            </div>
          </div>

          {/* Live Matches */}
          {(activeTab === 'overview' || activeTab === 'sports') && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" /> Live Scores
                </h3>
                <span className="text-xs font-bold text-red-500 animate-pulse">● LIVE</span>
              </div>
              <div className="divide-y divide-gray-100">
                {MATCHES.map((match) => (
                  <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{match.league}</span>
                      <span className={clsx("font-bold", match.status === 'Live' ? "text-red-500" : "text-gray-700")}>{match.time}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex-1">
                        <div className="flex justify-between font-bold text-gray-900 mb-1">
                          <span>{match.homeTeam}</span>
                          <span>{match.homeScore}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>{match.awayTeam}</span>
                          <span>{match.awayScore}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <span className="font-bold text-blue-700">Analysis:</span> {match.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Companies */}
          {(activeTab === 'overview' || activeTab === 'business') && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" /> Top Performing Companies
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {COMPANIES.map((company) => (
                  <div key={company.rank} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-gray-400 text-sm">{company.rank}</span>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{company.name}</div>
                        <div className="text-xs text-gray-500">{company.ticker}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-sm">{company.marketCap}</div>
                      <div className={clsx("text-xs font-medium", company.change >= 0 ? "text-green-600" : "text-red-600")}>
                        {company.change >= 0 ? '+' : ''}{company.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rich List */}
          {(activeTab === 'overview' || activeTab === 'business') && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--color-supreme-gold)]" /> World's Richest
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {RICH_LIST.map((person) => (
                  <div key={person.rank} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={person.image} alt={person.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{person.name}</div>
                        <div className="text-xs text-gray-500">{person.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--color-supreme-gold)] text-sm">{person.netWorth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Influencers */}
          {(activeTab === 'overview' || activeTab === 'entertainment') && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600" /> Top Influencers
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {INFLUENCERS.map((person) => (
                  <div key={person.rank} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={person.image} alt={person.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{person.name}</div>
                        <div className="text-xs text-gray-500">{person.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-sm">{person.followers}</div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
    </FeatureLoader>
  );
}
