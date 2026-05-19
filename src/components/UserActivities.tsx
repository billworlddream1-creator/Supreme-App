import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  MessageCircle, 
  ShoppingBag, 
  TrendingUp, 
  Award, 
  Zap,
  Clock,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Types ---

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'purchase' | 'rank_up' | 'achievement';
  title: string;
  description: string;
  timestamp: number;
  points?: number;
  icon: any;
  color: string;
}

// --- Mock Data ---

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'post', title: 'New Post', description: 'Shared thoughts on AI trends', timestamp: Date.now() - 1000 * 60 * 5, points: 10, icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
  { id: '2', type: 'purchase', title: 'Market Purchase', description: 'Bought "Supreme Gold Watch"', timestamp: Date.now() - 1000 * 60 * 60 * 2, points: 50, icon: ShoppingBag, color: 'text-green-500 bg-green-50' },
  { id: '3', type: 'rank_up', title: 'Rank Up', description: 'Reached "Elite" status', timestamp: Date.now() - 1000 * 60 * 60 * 24, points: 100, icon: TrendingUp, color: 'text-[var(--color-supreme-gold)] bg-yellow-50' },
  { id: '4', type: 'achievement', title: 'Achievement Unlocked', description: 'Early Adopter Badge', timestamp: Date.now() - 1000 * 60 * 60 * 48, points: 25, icon: Award, color: 'text-purple-500 bg-purple-50' },
  { id: '5', type: 'comment', title: 'Commented', description: 'Replied to Elon Musk', timestamp: Date.now() - 1000 * 60 * 60 * 50, points: 5, icon: MessageCircle, color: 'text-gray-500 bg-gray-50' },
];

const ActivityListItem = React.memo(({ item, index, formatTime }: { item: ActivityItem, index: number, formatTime: (t: number) => string }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.05 }}
    className="flex gap-3 group"
  >
    <div className="relative">
      <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100", item.color)}>
        <item.icon className="w-5 h-5" />
      </div>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-gray-100 group-hover:bg-gray-200 transition-colors last:hidden" />
    </div>
    
    <div className="flex-1 pb-4 border-b border-gray-50 last:border-0">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-[var(--color-supreme-text)]">{item.title}</h4>
        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {formatTime(item.timestamp)}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      {item.points && (
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-[var(--color-supreme-gold)] text-[10px] font-bold border border-yellow-100">
          <Zap className="w-3 h-3 fill-current" /> +{item.points} XP
        </div>
      )}
    </div>
  </motion.div>
));

export default function UserActivities() {
  const [activities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [filter, setFilter] = useState<'all' | 'posts' | 'market' | 'achievements'>('all');

  const filteredActivities = useMemo(() => activities.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'posts') return item.type === 'post' || item.type === 'comment';
    if (filter === 'market') return item.type === 'purchase';
    if (filter === 'achievements') return item.type === 'rank_up' || item.type === 'achievement';
    return true;
  }), [activities, filter]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-[var(--color-supreme-text)] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Activity Feed
        </h3>
        <div className="flex gap-2">
          {(['all', 'posts', 'market', 'achievements'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "p-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                filter === f 
                  ? "bg-[var(--color-supreme-text)] text-white" 
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              )}
              title={f}
            >
              {f === 'all' && <Filter className="w-3 h-3" />}
              {f === 'posts' && <MessageCircle className="w-3 h-3" />}
              {f === 'market' && <ShoppingBag className="w-3 h-3" />}
              {f === 'achievements' && <Award className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((item, index) => (
            <ActivityListItem key={item.id} item={item} index={index} formatTime={formatTime} />
          ))}
        </AnimatePresence>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No activities found.
          </div>
        )}
      </div>
    </div>
  );
}
