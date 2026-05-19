import React, { useState, useEffect } from 'react';
import { Globe, MapPin, TrendingUp, Search, Filter, Compass, BarChart2, Users, Briefcase, Zap, ArrowRight, X, Clock, Sparkles, Activity, Shield, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import FeatureLoader from '../components/FeatureLoader';
import { useAds } from '../context/AdsContext';
import AdBanner from '../components/AdBanner';
import SupremeAIAdvisor from '../components/SupremeAIAdvisor';
import SupremeTechShowcase from '../components/SupremeTechShowcase';

const CATEGORIES = ['All', 'Technology', 'Real Estate', 'Finance', 'Lifestyle', 'Art & Culture', 'Energy', 'Healthcare'];

const DISCOVER_TOOLS = [
  { id: 'trend', name: 'Trend Analyzer', icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Analyze global market trends in real-time.' },
  { id: 'market', name: 'Market Explorer', icon: Compass, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Discover emerging markets and opportunities.' },
  { id: 'network', name: 'Global Network Map', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Visualize connections across the globe.' },
  { id: 'invest', name: 'Investment Radar', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Find high-yield investment opportunities.' },
];

const PLACES = [
  { city: 'Dubai', country: 'UAE', trend: '+24%', category: 'Real Estate', image: 'https://picsum.photos/seed/dubai/400/300' },
  { city: 'New York', country: 'USA', trend: '+18%', category: 'Finance', image: 'https://picsum.photos/seed/nyc/400/300' },
  { city: 'Tokyo', country: 'Japan', trend: '+15%', category: 'Technology', image: 'https://picsum.photos/seed/tokyo/400/300' },
  { city: 'London', country: 'UK', trend: '+12%', category: 'Finance', image: 'https://picsum.photos/seed/london/400/300' },
  { city: 'Paris', country: 'France', trend: '+10%', category: 'Art & Culture', image: 'https://picsum.photos/seed/paris/400/300' },
  { city: 'Singapore', country: 'Singapore', trend: '+20%', category: 'Technology', image: 'https://picsum.photos/seed/singapore/400/300' },
];

const TREND_DATA = [
  { name: 'Jan', tech: 4000, realEstate: 2400, finance: 2400 },
  { name: 'Feb', tech: 3000, realEstate: 1398, finance: 2210 },
  { name: 'Mar', tech: 2000, realEstate: 9800, finance: 2290 },
  { name: 'Apr', tech: 2780, realEstate: 3908, finance: 2000 },
  { name: 'May', tech: 1890, realEstate: 4800, finance: 2181 },
  { name: 'Jun', tech: 2390, realEstate: 3800, finance: 2500 },
  { name: 'Jul', tech: 3490, realEstate: 4300, finance: 2100 },
];

const RADAR_DATA = [
  { subject: 'Technology', A: 120, B: 110, fullMark: 150 },
  { subject: 'Real Estate', A: 98, B: 130, fullMark: 150 },
  { subject: 'Finance', A: 86, B: 130, fullMark: 150 },
  { subject: 'Healthcare', A: 99, B: 100, fullMark: 150 },
  { subject: 'Energy', A: 85, B: 90, fullMark: 150 },
  { subject: 'Consumer', A: 65, B: 85, fullMark: 150 },
];

export default function Discover() {
  const { getActiveAds } = useAds();
  const level1Ads = getActiveAds(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const filteredPlaces = PLACES.filter(place => {
    const matchesSearch = place.city.toLowerCase().includes(searchQuery.toLowerCase()) || place.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || place.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Social Pulse Mock Data
  const [pulseData, setPulseData] = useState([
    { user: 'S***8', activity: 'Discovered London Market', time: '2m ago', type: 'discovery' },
    { user: 'B***1', activity: 'Invested in Tokyo Tech', time: '5m ago', type: 'investment' },
    { user: 'A***4', activity: 'Analyzed Dubai Real Estate', time: '8m ago', type: 'analysis' },
    { user: 'K***2', activity: 'Shared NYC Insights', time: '12m ago', type: 'social' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseData(prev => {
        const newPulse = [...prev];
        newPulse.pop();
        const users = ['J***9', 'M***3', 'L***7', 'P***5', 'R***2'];
        const activities = ['Discovered Paris Art', 'Invested in Singapore Tech', 'Analyzed Energy Trends', 'Shared London Real Estate Insights'];
        const types = ['discovery', 'investment', 'analysis', 'social'];
        newPulse.unshift({
          user: users[Math.floor(Math.random() * users.length)],
          activity: activities[Math.floor(Math.random() * activities.length)],
          time: 'Just now',
          type: types[Math.floor(Math.random() * types.length)]
        });
        return newPulse;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FeatureLoader text="Discovering">
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">Supreme Discover</h1>
          <p className="text-gray-500 mt-1">Explore global trends, tools, and opportunities.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search cities, countries..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden glass-panel border border-gray-200 group hover:shadow-[0_0_50px_rgba(184,134,11,0.15)] transition-all duration-500 shadow-md">
        <img 
          src="https://picsum.photos/seed/world/1200/600" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="flex items-center gap-2 text-[var(--color-supreme-gold)] font-bold mb-3 text-sm tracking-wider uppercase">
            <Globe className="w-4 h-4" /> Global Insights
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Explore the World</h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-6">Discover trending cities, innovative startups, and global opportunities tailored for Supreme members.</p>
          <button 
            onClick={() => setActiveTool('explore')}
            className="bg-[var(--color-supreme-gold)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-colors w-fit flex items-center gap-2 shadow-lg"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Advisor Integration */}
      <SupremeAIAdvisor category={activeCategory === 'All' ? 'Global Markets' : activeCategory} />

      {/* Supreme Tech Showcase */}
      <section className="py-8">
        <SupremeTechShowcase />
      </section>

      {/* Discovery Tools Section */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Discovery Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISCOVER_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveTool(tool.id)}
              className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white/80 hover:border-[var(--color-supreme-gold)]/30 transition-all hover:shadow-md cursor-pointer group"
            >
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", tool.bg, tool.color)}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ads Section */}
      {level1Ads.length > 0 && (
        <div className="py-4">
          <AdBanner ad={level1Ads[Math.floor(Math.random() * level1Ads.length)]} className="w-full h-auto" />
        </div>
      )}

      {/* Social Pulse Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Trending Locations
            </h2>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
              {CATEGORIES.slice(0, 5).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                    activeCategory === category 
                      ? "bg-[var(--color-supreme-text)] text-white shadow-md" 
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-supreme-gold)]/50 hover:text-[var(--color-supreme-gold)]"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPlaces.slice(0, 4).map((place, index) => (
              <motion.div 
                key={place.city} 
                layoutId={`place-${place.city}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPlace(place)}
                className="glass-panel rounded-2xl overflow-hidden group hover:border-[var(--color-supreme-gold)]/50 transition-all cursor-pointer bg-white/80 border border-gray-200 shadow-sm hover:shadow-lg flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={place.image} alt={place.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[var(--color-supreme-gold)] shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {place.trend}
                  </div>
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {place.category}
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 font-medium italic">
                    <MapPin className="w-3 h-3 text-[var(--color-supreme-gold)]" /> {place.country}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-supreme-text)] group-hover:text-[var(--color-supreme-gold)] transition-colors">{place.city}</h3>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i + index}`} alt="User" />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[8px] font-bold text-white">
                        +12
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Supreme Members Interested</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Social Insight Pulse
          </h2>
          <div className="glass-panel p-6 rounded-3xl border border-gray-100 bg-white/50 space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {pulseData.map((item, idx) => (
                  <motion.div
                    key={`${item.user}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 transition-colors shadow-sm"
                  >
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      item.type === 'discovery' ? "bg-amber-100 text-amber-600" :
                      item.type === 'investment' ? "bg-green-100 text-green-600" :
                      item.type === 'analysis' ? "bg-blue-100 text-blue-600" :
                      "bg-purple-100 text-purple-600"
                    )}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-gray-900">{item.user}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">{item.activity}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-2">
              <button className="w-full py-3 bg-gray-900 border border-gray-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                Join Discovery Network <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--color-supreme-text)] to-black text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-20 h-20 text-white" />
            </div>
            <h4 className="text-xs font-bold text-[var(--color-supreme-gold)] uppercase tracking-[0.2em] mb-4">Discovery Status</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">Monthly Targets</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="w-[78%] h-full bg-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-gray-400">Networking Growth</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="w-[42%] h-full bg-[var(--color-supreme-gold)] rounded-full" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[var(--color-supreme-gold)] uppercase">
              <Shield className="w-3 h-3" /> Professional Verified
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              layoutId={`place-${selectedPlace.city}`}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-72">
                <img src={selectedPlace.image} alt={selectedPlace.city} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-bold text-[var(--color-supreme-text)]">{selectedPlace.city}</h2>
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <MapPin className="w-4 h-4 text-[var(--color-supreme-gold)]" /> {selectedPlace.country}
                  </div>
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 h-full scrollbar-thin scrollbar-thumb-gray-200">
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-green-100">
                        <TrendingUp className="w-5 h-5" /> {selectedPlace.trend} Growth
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-blue-100">
                        <Briefcase className="w-5 h-5" /> {selectedPlace.category} Hub
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Market Analysis
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedPlace.city} is rapidly emerging as a global powerhouse in the {selectedPlace.category} sector. 
                        With a staggering {selectedPlace.trend} growth rate, it offers unprecedented opportunities for Supreme members 
                        looking to expand their network and investments. The local ecosystem is characterized by high liquidity and 
                        a favorable regulatory environment for international expansion.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Opportunity Index</p>
                        <p className="text-xl font-bold text-[var(--color-supreme-text)]">A+ / Supreme</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Market Saturation</p>
                        <p className="text-xl font-bold text-[var(--color-supreme-text)]">22% (Low)</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-gray-900 uppercase">Growth Vectors</h4>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={TREND_DATA.slice(0, 5)}>
                            <defs>
                              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-supreme-gold)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-supreme-gold)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="tech" stroke="var(--color-supreme-gold)" fillOpacity={1} fill="url(#colorTrend)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center italic">Projected 12-month sector performance</p>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Quick Actions</h4>
                       <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                         Request Business Intro
                       </button>
                       <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                         Download Market Report
                       </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button className="w-full bg-[var(--color-supreme-gold)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-colors shadow-lg flex items-center justify-center gap-3 group">
                    <span className="text-lg">Full Strategic Analysis</span>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveTool(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                  {activeTool === 'trend' && <><BarChart2 className="w-6 h-6 text-blue-500" /> Trend Analysis</>}
                  {activeTool === 'invest' && <><Briefcase className="w-6 h-6 text-orange-500" /> Investment Radar</>}
                  {(activeTool === 'explore' || activeTool === 'market' || activeTool === 'network') && <><Globe className="w-6 h-6 text-purple-500" /> Global Start Explore</>}
                </h2>
                <button 
                  onClick={() => setActiveTool(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1">
                {activeTool === 'trend' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Real-time analysis of global market sectors. Track performance and identify emerging trends before they peak.</p>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TREND_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Line type="monotone" dataKey="tech" name="Technology" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="realEstate" name="Real Estate" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="finance" name="Finance" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {activeTool === 'invest' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Multi-dimensional analysis of investment sectors based on yield potential, risk, and market saturation.</p>
                    <div className="h-80 w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                          <Radar name="Current Market" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
                          <Radar name="Projected Growth" dataKey="B" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                          <RechartsTooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {(activeTool === 'explore' || activeTool === 'market' || activeTool === 'network') && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Your gateway to global opportunities. Select a region to begin your exploration journey.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa'].map((region, i) => (
                        <div key={region} className="p-4 rounded-2xl border border-gray-200 hover:border-[var(--color-supreme-gold)] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[var(--color-supreme-gold)]/10 group-hover:text-[var(--color-supreme-gold)] transition-colors">
                              <Globe className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-gray-900">{region}</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-supreme-gold)] transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </FeatureLoader>
  );
}
