import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  User, 
  Users,
  Shield,
  ShoppingBag, 
  Newspaper, 
  MessageCircle, 
  ChevronRight,
  Command,
  TrendingUp,
  Sparkles,
  Crown,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Mock Data for Search ---

const MOCK_DATA = [
  // Users
  { id: 'u1', type: 'user', title: 'Elon Musk', subtitle: '@elonmusk • Supreme Rank', image: 'https://picsum.photos/seed/elon/50', link: '/supreme-users' },
  { id: 'u2', type: 'user', title: 'Sarah Connor', subtitle: '@sarahc • Diamond Rank', image: 'https://picsum.photos/seed/sarah/50', link: '/supreme-users' },
  { id: 'u3', type: 'user', title: 'Tony Stark', subtitle: '@ironman • Elite Rank', image: 'https://picsum.photos/seed/stark/50', link: '/supreme-users' },
  { id: 'u4', type: 'user', title: 'Jeff Bezos', subtitle: '@bezos • Supreme Rank', image: 'https://picsum.photos/seed/bezos/50', link: '/supreme-users' },
  { id: 'u5', type: 'user', title: 'Alex Rivera', subtitle: '@arivera • Gold Rank', image: 'https://picsum.photos/seed/alex/50', link: '/supreme-users' },
  { id: 'u6', type: 'user', title: 'Sarah Chen', subtitle: '@schen • Platinum Rank', image: 'https://picsum.photos/seed/chen/50', link: '/supreme-users' },
  { id: 'u7', type: 'user', title: 'Marcus Thorne', subtitle: '@mthorne • Elite Rank', image: 'https://picsum.photos/seed/marcus/50', link: '/supreme-users' },
  { id: 'u8', type: 'user', title: 'Elena Vance', subtitle: '@evance • Diamond Rank', image: 'https://picsum.photos/seed/elena/50', link: '/supreme-users' },
  
  // Products
  { id: 'p1', type: 'product', title: 'Supreme Gold Watch', subtitle: '$12,500 • Luxury', image: 'https://picsum.photos/seed/watch/50', link: '/market' },
  { id: 'p2', type: 'product', title: 'Quantum Laptop Pro', subtitle: '$3,200 • Tech', image: 'https://picsum.photos/seed/laptop/50', link: '/market' },
  { id: 'p3', type: 'product', title: 'Designer Sneakers', subtitle: '$850 • Fashion', image: 'https://picsum.photos/seed/sneakers/50', link: '/market' },
  { id: 'p4', type: 'product', title: 'Cyber Truck Mini', subtitle: '$45,000 • Vehicle', image: 'https://picsum.photos/seed/truck/50', link: '/market' },
  { id: 'p5', type: 'product', title: 'Supreme Gold Card', subtitle: '$5,000 • Finance', image: 'https://picsum.photos/seed/card/50', link: '/market' },
  { id: 'p6', type: 'product', title: 'Industrial Processor', subtitle: '$1,200 • Hardware', image: 'https://picsum.photos/seed/proc/50', link: '/market' },
  { id: 'p7', type: 'product', title: 'Smart Glasses Pro', subtitle: '$1,500 • Wearable', image: 'https://picsum.photos/seed/glasses/50', link: '/market' },
  
  // News / Insight
  { id: 'n1', type: 'news', title: 'Global Markets Rally', subtitle: 'Business • 2h ago', image: 'https://picsum.photos/seed/news1/50', link: '/insight' },
  { id: 'n2', type: 'news', title: 'The Rise of Quantum Computing', subtitle: 'Tech • 6h ago', image: 'https://picsum.photos/seed/news3/50', link: '/insight' },
  { id: 'n3', type: 'news', title: 'Supreme Network Expansion', subtitle: 'Company • 1d ago', image: 'https://picsum.photos/seed/news4/50', link: '/insight' },
  { id: 'n4', type: 'news', title: 'New AI Breakthrough', subtitle: 'AI • 3h ago', image: 'https://picsum.photos/seed/news5/50', link: '/insight' },
  { id: 'n5', type: 'news', title: 'Sustainable Energy Future', subtitle: 'Energy • 12h ago', image: 'https://picsum.photos/seed/news6/50', link: '/insight' },
  { id: 'n6', type: 'news', title: 'Global Tech Summit 2026', subtitle: 'Events • 2d ago', image: 'https://picsum.photos/seed/news7/50', link: '/insight' },
  
  // Features
  { id: 'f1', type: 'feature', title: 'Supreme Mode', subtitle: 'AI Assistant & Automation', image: 'https://picsum.photos/seed/feature1/50', link: '/supreme-mode' },
  { id: 'f2', type: 'feature', title: 'Heart to Heart', subtitle: 'Mentorship & Advice', image: 'https://picsum.photos/seed/feature2/50', link: '/heart-to-heart' },
  { id: 'f3', type: 'feature', title: 'AI Tools', subtitle: 'Content Creation Suite', image: 'https://picsum.photos/seed/feature3/50', link: '/ai-tools' },
  { id: 'f4', type: 'feature', title: 'Business Tools', subtitle: 'Enterprise Management', image: 'https://picsum.photos/seed/feature4/50', link: '/business-tools' },
  { id: 'f5', type: 'feature', title: 'Wallet', subtitle: 'Financial Dashboard', image: 'https://picsum.photos/seed/feature5/50', link: '/wallet' },
  { id: 'f6', type: 'feature', title: 'Media', subtitle: 'Video & Streaming', image: 'https://picsum.photos/seed/feature6/50', link: '/media' },
  { id: 'f7', type: 'feature', title: 'Network', subtitle: 'Social Connectivity', image: 'https://picsum.photos/seed/feature7/50', link: '/network' },
  { id: 'f8', type: 'feature', title: 'Supreme Central Dashboard', subtitle: 'Full Admin Control Panel', image: 'https://picsum.photos/seed/admin/50', link: '/admin' },
  { id: 'u9', type: 'user', title: 'Insolvent Users', subtitle: 'System-wide insolvency report', image: 'https://picsum.photos/seed/blocked/50', link: '/admin' },
];

const SAMPLES = [
  { label: 'Dashboard', icon: Crown, query: 'Supreme Central Dashboard' },
  { label: 'Network', icon: Users, query: 'Insolvent Users' },
  { label: 'Market', icon: ShoppingBag, query: 'Gold Watch' },
  { label: 'Insight', icon: Newspaper, query: 'Global Markets' },
  { label: 'AI Tools', icon: Sparkles, query: 'Content Creator' },
];

export default function GlobalSearch({ iconOnly = false, className }: { iconOnly?: boolean, className?: string }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_DATA>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('supreme_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!user) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search Logic with Prioritization
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filter and sort by relevance and type priority
    const filtered = MOCK_DATA.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.subtitle.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => {
      // Priority: Exact match in title > Match in title > Match in subtitle
      const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
      const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Type priority: feature > user > product > news
      const typePriority: Record<string, number> = {
        'feature': 0,
        'user': 1,
        'product': 2,
        'news': 3
      };
      
      return (typePriority[a.type] || 99) - (typePriority[b.type] || 99);
    });

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  const addToRecent = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(item => item !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('supreme_recent_searches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('supreme_recent_searches');
  };

  const handleSelect = (item: typeof MOCK_DATA[0]) => {
    addToRecent(item.title);
    if (!user && item.link !== '/') {
      navigate('/login');
    } else {
      navigate(item.link);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'product': return <ShoppingBag className="w-4 h-4" />;
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'feature': return <Sparkles className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof MOCK_DATA>);

  const resultTypes = ['feature', 'user', 'product', 'news'];

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      {/* Trigger Button */}
      {iconOnly ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2.5 text-gray-500 hover:text-[var(--color-supreme-gold)] transition-all rounded-2xl hover:bg-[var(--color-supreme-gold)]/5 active:scale-90 border border-transparent hover:border-[var(--color-supreme-gold)]/20 shadow-sm hover:shadow-md"
          aria-label="Open global search"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-5 py-2.5 bg-gray-50/50 hover:bg-white rounded-2xl text-gray-400 transition-all group w-full border border-gray-200/50 hover:border-[var(--color-supreme-gold)]/30 hover:shadow-xl hover:shadow-gray-200/40 transform hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-[var(--color-supreme-gold)]/10 transition-colors">
            <Search className="w-4 h-4 group-hover:text-[var(--color-supreme-gold)] transition-colors" />
          </div>
          <span className="text-sm font-bold tracking-tight group-hover:text-gray-600 transition-colors">Search Supreme Central Intelligence...</span>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-gray-400 group-hover:text-[var(--color-supreme-gold)] group-hover:border-[var(--color-supreme-gold)]/30 transition-all shadow-sm">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-start justify-center p-0"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-white rounded-b-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[95vh] border-b border-x border-gray-200/50"
            >
              {/* Search Header - Moved to top edge */}
              <div className="flex items-center py-4 px-4 md:px-8 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="hidden md:flex p-2 bg-gradient-to-br from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] rounded-xl shadow-md mr-4 shrink-0">
                  <Search className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search Supreme Intelligence..."
                    className="w-full text-lg md:text-xl bg-transparent border-none outline-none placeholder-gray-300 text-[var(--color-supreme-text)] font-bold tracking-tight"
                  />
                  
                  {/* Search Samples hint */}
                  {!query && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 -bottom-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2"
                    >
                      <span className="text-[9px] font-black uppercase text-[var(--color-supreme-gold)] tracking-widest whitespace-nowrap opacity-50 shrink-0">Try searching:</span>
                      {SAMPLES.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(s.query)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[var(--color-supreme-gold)]/10 hover:text-[var(--color-supreme-gold)] rounded-lg text-[10px] font-bold text-gray-500 whitespace-nowrap transition-all border border-transparent hover:border-[var(--color-supreme-gold)]/20 shadow-sm"
                        >
                          {s.query}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-end ml-4">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all active:scale-95 border border-transparent hover:border-gray-200 shadow-sm md:shadow-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Results Area */}
              <div className={clsx(
                "flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50/30",
                !query && "pt-12"
              )}>
                {results.length > 0 ? (
                  <div className="space-y-8">
                    {resultTypes.map(type => {
                      const typeResults = groupedResults[type];
                      if (!typeResults) return null;

                      return (
                        <div key={type} className="space-y-3">
                          <h3 className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2.5">
                            <span className="p-1 bg-white rounded-md border border-gray-100 shadow-sm">
                              {getIcon(type)}
                            </span>
                            {type}s
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {typeResults.map((item) => {
                              const globalIndex = results.indexOf(item);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleSelect(item)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={clsx(
                                    "w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all text-left group relative overflow-hidden",
                                    globalIndex === selectedIndex 
                                      ? "bg-white shadow-xl shadow-gray-200/50 border border-gray-100" 
                                      : "hover:bg-white/60 border border-transparent"
                                  )}
                                >
                                  {globalIndex === selectedIndex && (
                                    <motion.div 
                                      layoutId="active-bg"
                                      className="absolute inset-0 bg-gradient-to-r from-[var(--color-supreme-gold)]/5 to-transparent pointer-events-none"
                                    />
                                  )}
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0 relative z-10">
                                    <h4 className={clsx(
                                      "font-bold text-lg truncate transition-colors",
                                      globalIndex === selectedIndex ? "text-[var(--color-supreme-gold)]" : "text-[var(--color-supreme-text)]"
                                    )}>
                                      {item.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                  <div className={clsx(
                                    "p-2 rounded-xl transition-all",
                                    globalIndex === selectedIndex ? "bg-[var(--color-supreme-gold)] text-white scale-110" : "bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100"
                                  )}>
                                    <ChevronRight className="w-5 h-5" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : query ? (
                  <div className="py-24 text-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 border border-gray-100"
                    >
                      <Search className="w-10 h-10 text-gray-200" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto font-medium">We couldn't find anything matching "{query}". Try a different search term.</p>
                  </div>
                ) : (
                  <div className="space-y-10 py-4">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 mb-4">
                          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Recent Searches</h3>
                          <button 
                            onClick={clearRecent}
                            className="text-[10px] font-bold text-[var(--color-supreme-gold)] hover:underline uppercase tracking-wider"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 px-2 justify-center">
                          {recentSearches.map(tag => (
                            <button 
                              key={tag}
                              onClick={() => setQuery(tag)}
                              className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:border-[var(--color-supreme-gold)]/30 hover:text-[var(--color-supreme-gold)] hover:shadow-md transition-all"
                            >
                              <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--color-supreme-gold)]" />
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="px-4 text-base font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        Popular Categories
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-stretch px-2 pb-6">
                        {[
                          { label: 'Market', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', path: '/market', desc: 'Shop supreme items' },
                          { label: 'Users', icon: User, color: 'text-purple-600', bg: 'bg-purple-50', path: '/supreme-users', desc: 'Connect with elite' },
                          { label: 'News', icon: Newspaper, color: 'text-green-600', bg: 'bg-green-50', path: '/insight', desc: 'Global intelligence' },
                          { label: 'AI Tools', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50', path: '/ai-tools', desc: 'Enhance productivity' },
                        ].map((cat) => (
                          <button 
                            key={cat.label}
                            onClick={() => { navigate(cat.path); setIsOpen(false); }}
                            className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-[2rem] bg-gradient-to-b from-white to-gray-50/50 border border-gray-100 hover:border-[var(--color-supreme-gold)]/50 hover:shadow-2xl hover:shadow-[var(--color-supreme-gold)]/10 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group w-full"
                          >
                            <div className={clsx("p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm border border-white/50", cat.bg, cat.color)}>
                              <cat.icon className="w-7 h-7" strokeWidth={1.5} />
                            </div>
                            <div className="text-center mt-1">
                              <span className="block font-black text-base text-gray-800 mb-1 leading-none">{cat.label}</span>
                              <span className="block text-[10px] font-bold text-gray-400 group-hover:text-gray-500 uppercase tracking-wider">{cat.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-5">Trending Now</h3>
                      <div className="flex flex-wrap gap-2 px-2 justify-center">
                        {['Supreme Mode', 'Quantum Computing', 'Elon Musk', 'Luxury Watches', 'AI Content Creator', 'Marketplace'].map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:bg-[var(--color-supreme-gold)]/5 hover:border-[var(--color-supreme-gold)]/30 hover:text-[var(--color-supreme-gold)] hover:shadow-sm transition-all"
                          >
                            <TrendingUp className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="hidden md:flex p-5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">
                <div className="flex gap-8">
                  <span className="flex items-center gap-2"><kbd className="font-sans bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm text-gray-600 font-bold">↵</kbd> SELECT</span>
                  <span className="flex items-center gap-2"><kbd className="font-sans bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm text-gray-600 font-bold">↑↓</kbd> NAVIGATE</span>
                  <span className="flex items-center gap-2"><kbd className="font-sans bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm text-gray-600 font-bold">ESC</kbd> CLOSE</span>
                </div>
                <div className="flex items-center gap-2.5 text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 px-4 py-2 rounded-full border border-[var(--color-supreme-gold)]/20">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="tracking-[0.2em]">SUPREME CENTRAL SEARCH</span>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="md:hidden p-4 bg-white border-t border-gray-100 flex justify-center">
                <div className="flex items-center gap-2 text-[var(--color-supreme-gold)] font-black text-[10px] tracking-[0.2em] uppercase">
                  <Crown className="w-4 h-4" />
                  <span>Supreme Central Intelligence</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
