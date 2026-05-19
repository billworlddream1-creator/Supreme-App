import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, TrendingUp, Star, X, CheckCircle2, ShieldCheck, Zap, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '../context/WalletContext';

const ALL_MOCK_DEALS = [
  { 
    id: '1', 
    title: 'Premium Design Assets Bundle', 
    price: 49.99, 
    seller: 'Alex Johnson', 
    role: 'dealer', 
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', 
    rating: 4.9,
    reviews: 124,
    description: 'A comprehensive collection of high-quality design assets including icons, illustrations, and UI kits. Perfect for modern web and mobile projects.',
    features: ['500+ Vector Icons', '20+ UI Templates', 'Commercial License', 'Lifetime Updates']
  },
  { 
    id: '2', 
    title: '1-on-1 Marketing Consultation', 
    price: 149.00, 
    seller: 'Sarah Williams', 
    role: 'premium-user', 
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 
    rating: 5.0,
    reviews: 86,
    description: 'Get personalized marketing strategies tailored to your business goals. 60-minute intensive session covering SEO, social media, and brand positioning.',
    features: ['Custom Strategy Plan', 'Competitor Analysis', 'Recording Included', 'Follow-up Email']
  },
  { 
    id: '3', 
    title: 'Custom Web Development', 
    price: 999.00, 
    seller: 'Michael Chen', 
    role: 'dealer', 
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', 
    rating: 4.8,
    reviews: 42,
    description: 'Full-stack web development services using modern technologies like React, Node.js, and Tailwind CSS. Fast, responsive, and SEO-friendly.',
    features: ['Responsive Design', 'CMS Integration', 'E-commerce Ready', '3 Months Support']
  },
  { 
    id: '4', 
    title: 'SEO Optimization Package', 
    price: 299.00, 
    seller: 'Emma Davis', 
    role: 'premium-user', 
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 
    rating: 4.7,
    reviews: 215,
    description: 'Boost your search engine rankings with our comprehensive SEO package. Includes keyword research, on-page optimization, and backlink strategy.',
    features: ['Keyword Research', 'Technical SEO Audit', 'Content Strategy', 'Monthly Reports']
  },
  { 
    id: '5', 
    title: 'Professional Video Editing', 
    price: 199.00, 
    seller: 'David Kim', 
    role: 'dealer', 
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80', 
    rating: 4.9,
    reviews: 156,
    description: 'High-end video editing for YouTube, commercials, and social media. Includes color grading, sound design, and motion graphics.',
    features: ['4K Render', 'Color Grading', 'Sound Mixing', '2 Revisions']
  },
  { 
    id: '6', 
    title: 'Social Media Management', 
    price: 399.00, 
    seller: 'Jessica Taylor', 
    role: 'premium-user', 
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', 
    rating: 4.6,
    reviews: 92,
    description: 'Full-service social media management for 3 platforms. We handle content creation, posting, and community engagement.',
    features: ['15 Posts/Month', 'Community Management', 'Analytics Report', 'Strategy Call']
  },
  { 
    id: '7', 
    title: 'Copywriting Masterclass', 
    price: 89.00, 
    seller: 'Robert Fox', 
    role: 'dealer', 
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?w=800&q=80', 
    rating: 4.8,
    reviews: 310,
    description: 'Learn the secrets of high-converting copywriting. Over 10 hours of video content, templates, and real-world examples.',
    features: ['10+ Hours Video', 'Swipe File', 'Private Community', 'Certificate']
  },
  { 
    id: '8', 
    title: 'Brand Identity Design', 
    price: 599.00, 
    seller: 'Lisa Wong', 
    role: 'premium-user', 
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', 
    rating: 5.0,
    reviews: 64,
    description: 'Complete brand identity package including logo design, color palette, typography, and brand guidelines document.',
    features: ['3 Logo Concepts', 'Brand Guidelines', 'Social Media Kit', 'Source Files']
  }
];

// Helper to get deterministic random deals based on a 10-minute window
const getDealsForCurrentWindow = () => {
  const windowId = Math.floor(Date.now() / (10 * 60 * 1000));
  const shuffled = [...ALL_MOCK_DEALS].sort((a, b) => {
    const hashA = (parseInt(a.id) * windowId) % 100;
    const hashB = (parseInt(b.id) * windowId) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, 4);
};

export default function SupremeDeals() {
  const { user } = useAuth();
  const { isBoosted } = useWallet();
  const [selectedDeal, setSelectedDeal] = useState<typeof ALL_MOCK_DEALS[0] | null>(null);
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [currentDeals, setCurrentDeals] = useState(getDealsForCurrentWindow());
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);

  useEffect(() => {
    const updateDealsAndTimer = () => {
      setCurrentDeals(getDealsForCurrentWindow());
      
      // Calculate time until next 10-minute window
      const now = Date.now();
      const windowSize = 10 * 60 * 1000;
      const nextWindow = Math.ceil(now / windowSize) * windowSize;
      setTimeUntilRefresh(Math.max(0, Math.floor((nextWindow - now) / 1000)));
    };

    updateDealsAndTimer();
    const interval = setInterval(updateDealsAndTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  
  // Mock data matching the EarningsProgram progress
  const productsSoldThisWeek = 120; 
  const targetSales = 25;
  const baseEarningRate = 0.11111;
  const earningRate = isBoosted ? baseEarningRate * 1.05 : baseEarningRate;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Supreme Deals
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">Exclusive products & services from the community</p>
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
              <Clock className="w-3 h-3" /> Refreshes in {formatTime(timeUntilRefresh)}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowAllDeals(true)}
          className="text-sm font-bold text-[var(--color-supreme-gold)] hover:text-amber-600 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Earnings Integration Banner */}
      {(user?.role === 'dealer' || user?.role === 'premium-user') && (
        <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-2">
                Seller Earnings Progress
                {isBoosted && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">5% BOOST</span>}
              </p>
              <p className="text-xs text-gray-400">Sell {targetSales} products this week to earn <span className="text-[var(--color-supreme-gold)] font-bold">${earningRate.toFixed(4)}</span></p>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[var(--color-supreme-gold)]">{productsSoldThisWeek} Sold</span>
              <span className="text-gray-500">{targetSales} Target</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-[var(--color-supreme-gold)] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((productsSoldThisWeek / targetSales) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentDeals.map((deal) => (
          <div key={deal.id} className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all bg-gray-50">
            <div className="h-32 overflow-hidden relative">
              <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider">
                {deal.role === 'dealer' ? 'Dealer' : 'Premium'}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-1">{deal.title}</h4>
                <p className="text-xs text-gray-500 mt-1">by {deal.seller}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-display font-bold text-[var(--color-supreme-gold)]">${deal.price.toFixed(2)}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {deal.rating}
                </div>
              </div>
              <button 
                onClick={() => setSelectedDeal(deal)}
                className="w-full py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                View Deal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {(selectedDeal || showAllDeals) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedDeal(null); setShowAllDeals(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col relative"
            >
              {selectedDeal ? (
                <>
                  <button 
                    onClick={() => setSelectedDeal(null)}
                    className="absolute top-4 right-4 z-50 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/20"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="relative h-72 shrink-0">
                    <img src={selectedDeal.image} alt={selectedDeal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 bg-[var(--color-supreme-gold)] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {selectedDeal.role === 'dealer' ? 'Official Dealer' : 'Premium Seller'}
                        </span>
                        <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg border border-white/20 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          High Demand
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                      <div className="flex-1">
                        <h2 className="text-3xl font-display font-bold text-gray-900 leading-tight">{selectedDeal.title}</h2>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                              {selectedDeal.seller.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-600">Sold by <span className="font-bold text-gray-900">{selectedDeal.seller}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-amber-900">{selectedDeal.rating}</span>
                            <span className="text-xs text-amber-700/70">({selectedDeal.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[160px]">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Price</p>
                        <p className="text-4xl font-display font-bold text-[var(--color-supreme-gold)]">${selectedDeal.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-gray-400" /> Description
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-base">{selectedDeal.description}</p>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" /> What's Included
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedDeal.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                          <h3 className="font-bold text-gray-900">Seller Trust & Metrics</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Identity</span>
                              <span className="font-bold text-gray-900">Verified</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Response Time</span>
                              <span className="font-bold text-gray-900">&lt; 1 hour</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-purple-500" /> Total Sales</span>
                              <span className="font-bold text-gray-900">1,240+</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerHTML;
                              btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</span>';
                              setTimeout(() => {
                                btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Purchased Successfully</span>';
                                btn.classList.replace('bg-[var(--color-supreme-gold)]', 'bg-green-500');
                                btn.classList.replace('hover:bg-[var(--color-supreme-gold-light)]', 'hover:bg-green-600');
                                setTimeout(() => {
                                  btn.innerHTML = originalText;
                                  btn.classList.replace('bg-green-500', 'bg-[var(--color-supreme-gold)]');
                                  btn.classList.replace('hover:bg-green-600', 'hover:bg-[var(--color-supreme-gold-light)]');
                                }, 3000);
                              }, 1500);
                            }}
                            className="w-full py-4 bg-[var(--color-supreme-gold)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--color-supreme-gold)]/20 hover:bg-[var(--color-supreme-gold-light)] transition-all flex items-center justify-center gap-2"
                          >
                            Purchase Now <ArrowRight className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerText;
                              btn.innerText = 'Opening Chat...';
                              setTimeout(() => {
                                btn.innerText = 'Message Sent!';
                                btn.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-200');
                                setTimeout(() => {
                                  btn.innerText = originalText;
                                  btn.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200');
                                }, 3000);
                              }, 1000);
                            }}
                            className="w-full py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-5 h-5" /> Contact Seller
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[var(--color-supreme-gold)]" /> All Supreme Deals
                    </h2>
                    <button onClick={() => setShowAllDeals(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {ALL_MOCK_DEALS.map(deal => (
                      <div key={deal.id} className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all bg-white">
                        <div className="h-40 overflow-hidden relative">
                          <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-4 space-y-3">
                          <h4 className="font-bold text-gray-900">{deal.title}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-display font-bold text-[var(--color-supreme-gold)]">${deal.price.toFixed(2)}</span>
                            <button 
                              onClick={() => setSelectedDeal(deal)}
                              className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
