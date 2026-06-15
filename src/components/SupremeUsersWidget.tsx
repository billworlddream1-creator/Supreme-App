import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Crown, TrendingUp, Eye, MessageCircle, Megaphone, ShoppingBag, Radio, Users, Play, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

// --- Types ---

interface ActivityStats {
  engagement: number; // 0-100
  visitors: number;
}

interface UserActivities {
  chat: ActivityStats;
  ads: ActivityStats;
  market: ActivityStats;
  stream: ActivityStats;
  network: ActivityStats;
  media: ActivityStats;
}

interface SupremeUser {
  id: string;
  name: string;
  avatar: string;
  rank: 'Crowned' | 'Gold' | 'Diamond' | 'Silver' | 'Elite' | 'Royal';
  rankScore: number;
  activities: UserActivities;
  bio: string;
  phone: string;
  email: string;
  links: string[];
}

// --- Mock Data ---

const RANKS = ['Crowned', 'Gold', 'Diamond', 'Silver', 'Elite', 'Royal'] as const;
const NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Parker', 'Sage'];

const generateMockUsers = (count: number, startIndex: number): SupremeUser[] => {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const rankIndex = Math.min(Math.floor(index / 5), RANKS.length - 1);
    const rank = RANKS[rankIndex];
    const name = `${NAMES[index % NAMES.length]} ${index}`;
    
    return {
      id: `user-${index}`,
      name,
      avatar: `https://picsum.photos/seed/supreme${index}/150`,
      rank,
      rankScore: 10000 - index * 10 - Math.random() * 5,
      bio: `Passionate creator and entrepreneur. Always looking for new opportunities and collaborations on the Supreme platform.`,
      phone: `+1 555 ${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      links: [`supreme.com/${name.toLowerCase().replace(' ', '')}`],
      activities: {
        chat: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        ads: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        market: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        stream: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        network: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
        media: { engagement: Math.floor(Math.random() * 100), visitors: Math.floor(Math.random() * 5000) },
      }
    };
  });
};

const ActivityIcon = React.memo(({ type, engagement }: { type: keyof UserActivities, engagement: number }) => {
  const Icon = {
    chat: MessageCircle,
    ads: Megaphone,
    market: ShoppingBag,
    stream: Radio,
    network: Users,
    media: Play
  }[type];

  const color = {
    chat: 'text-blue-500',
    ads: 'text-purple-500',
    market: 'text-green-500',
    stream: 'text-red-500',
    network: 'text-indigo-500',
    media: 'text-pink-500'
  }[type];

  return (
    <div className="flex flex-col items-center gap-1" title={`${type}: ${engagement}%`}>
      <Icon className={clsx("w-3 h-3", color)} />
      <div className="h-1 w-6 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={clsx("h-full rounded-full", color.replace('text-', 'bg-'))} 
          style={{ width: `${engagement}%` }}
        />
      </div>
    </div>
  );
});

const UserItem = React.memo(({ user, onClick }: { user: SupremeUser, onClick: (user: SupremeUser) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onClick(user)}
    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-[var(--color-supreme-gold)]/30 transition-all group cursor-pointer"
    title="Click to zoom profile"
  >
    <div className="relative shrink-0">
      <img 
        src={user.avatar || null} 
        alt={user.name} 
        className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:scale-110 transition-transform" 
        loading="lazy"
        decoding="async"
      />
      {user.rank === 'Crowned' && (
        <div className="absolute -top-1 -right-1 bg-[var(--color-supreme-gold)] text-white p-0.5 rounded-full border border-white">
          <Crown className="w-2 h-2 fill-current" />
        </div>
      )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-sm text-[var(--color-supreme-text)] truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">{user.name}</h4>
        <span className={clsx(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
          user.rank === 'Crowned' ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "bg-gray-100 text-gray-500"
        )}>
          {user.rank}
        </span>
      </div>
      
      <div className="flex items-center gap-3 mt-2">
        <ActivityIcon type="chat" engagement={user.activities.chat.engagement} />
        <ActivityIcon type="market" engagement={user.activities.market.engagement} />
        <ActivityIcon type="media" engagement={user.activities.media.engagement} />
        <div className="ml-auto text-[10px] text-gray-400 font-medium flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {Math.floor((user.activities.chat.visitors + user.activities.market.visitors + user.activities.media.visitors) / 1000)}k
        </div>
      </div>
    </div>
  </motion.div>
));

export default function SupremeUsersWidget() {
  const [users, setUsers] = useState<SupremeUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [zoomedUser, setZoomedUser] = useState<SupremeUser | null>(null);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreUsers();
        }
      },
      { threshold: 1.0, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const loadMoreUsers = useCallback(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setUsers(prev => {
        const startIndex = prev.length;
        const newUsers = generateMockUsers(5, startIndex);
        return [...prev, ...newUsers];
      });
      setPage(prev => prev + 1);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-[var(--color-supreme-text)] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Top Users
        </h3>
        <Link to="/supreme-users" className="text-xs font-bold text-[var(--color-supreme-gold)] hover:underline">
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[300px] max-h-[400px]">
        {users.map((user) => (
          <UserItem key={user.id} user={user} onClick={setZoomedUser} />
        ))}
        
        <div ref={observerTarget} className="py-2 flex justify-center h-8">
          {loading && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setZoomedUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative"
          >
            <button 
              onClick={() => setZoomedUser(null)} 
              className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors z-10"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="p-8 text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 overflow-hidden shadow-xl border-4 border-white mb-6">
                <img src={zoomedUser.avatar || null} alt={zoomedUser.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--color-supreme-text)] mb-2">{zoomedUser.name}</h2>
              <div className="flex items-center justify-center gap-3 text-gray-500 font-medium text-lg mb-4">
                <TrendingUp className="w-5 h-5" />
                <span>Score: {Math.floor(zoomedUser.rankScore).toLocaleString()}</span>
              </div>
              <span className={clsx(
                "text-sm font-bold px-4 py-1 rounded-full inline-block mb-6",
                zoomedUser.rank === 'Crowned' ? "bg-[var(--color-supreme-gold)] text-white" :
                zoomedUser.rank === 'Gold' ? "bg-yellow-100 text-yellow-700" :
                zoomedUser.rank === 'Diamond' ? "bg-cyan-100 text-cyan-700" :
                zoomedUser.rank === 'Silver' ? "bg-slate-100 text-slate-700" :
                zoomedUser.rank === 'Elite' ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-600"
              )}>
                {zoomedUser.rank}
              </span>

              <div className="flex gap-2 mb-6">
                <button className="flex-1 py-2.5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-yellow-600 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                  Add Friend
                </button>
                <Link to={`/chat?id=${zoomedUser.id}`} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-gray-200">
                  <MessageCircle className="w-4 h-4" /> Chat
                </Link>
              </div>

              <div className="text-left mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{zoomedUser.bio}</p>
              </div>

              <div className="text-left mb-6 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact & Links</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{zoomedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{zoomedUser.email}</span>
                </div>
                {zoomedUser.links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[var(--color-supreme-gold)]">
                    <LinkIcon className="w-4 h-4" />
                    <a href={`https://${link}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{link}</a>
                  </div>
                ))}
              </div>

              <div className="text-left">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Activity Engagement</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Chat</div>
                    <div className="font-bold text-gray-800">{zoomedUser.activities.chat.engagement}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Market</div>
                    <div className="font-bold text-gray-800">{zoomedUser.activities.market.engagement}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Play className="w-3 h-3" /> Media</div>
                    <div className="font-bold text-gray-800">{zoomedUser.activities.media.engagement}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Network</div>
                    <div className="font-bold text-gray-800">{zoomedUser.activities.network.engagement}%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
