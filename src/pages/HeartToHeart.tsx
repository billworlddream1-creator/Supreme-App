import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Video, 
  Radio, 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  ArrowRight, 
  Handshake, 
  ShieldCheck,
  Clock,
  Star,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import FeatureLoader from '../components/FeatureLoader';
import { clsx } from 'clsx';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';

// Heart to Heart Page - Connecting hearts, solving problems

const categories = [
  "Cooking Advice",
  "Technical Support",
  "Relationship Advice",
  "Make Money Online",
  "Wisdom & Problem Solving",
  "Dating & Hookups",
  "Interview Prep",
  "Online Influencer Tips",
  "Visa Application",
  "International Visa Interview",
  "Others"
];

const LeanOnMeLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
    <div className="relative flex items-center justify-center">
      <Heart className="w-24 h-24 text-red-500 animate-pulse" fill="currentColor" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-32 h-32 text-red-200 animate-spin" strokeWidth={1} />
      </div>
    </div>
    <h2 className="mt-8 text-2xl font-display font-bold text-gray-800 tracking-widest animate-pulse">
      LEAN ON ME
    </h2>
    <p className="mt-2 text-gray-500 italic">Connecting hearts, solving problems...</p>
  </div>
);

export default function HeartToHeart() {
  const { user } = useAuth();
  const { balance, deposit, withdraw, lendMoney, transactions } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'advice' | 'wallet' | 'lend' | 'sessions'>('advice');
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showExpertsModal, setShowExpertsModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    type: 'chat',
    duration: 30,
    date: new Date().toISOString().split('T')[0],
    time: '10:00'
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [mentorForm, setMentorForm] = useState({ category: categories[0], rate: '', bio: '', experience: '' });
  const [expertSearch, setExpertSearch] = useState('');
  const [expertCategory, setExpertCategory] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('booking:notification', (data: any) => {
      // If the user is a mentor, show the notification
      // In a real app, we'd check if the booking is for THIS mentor
      setNotifications(prev => [{ ...data, id: Date.now(), read: false }, ...prev]);
      
      toast.success(`New Booking Request!`, {
        description: `${data.userName} booked a ${data.type} session for ${data.date} at ${data.time}.`,
        duration: 8000,
        icon: <Calendar className="w-5 h-5 text-red-500" />,
        action: {
          label: 'View',
          onClick: () => {
            setActiveTab('sessions');
            setShowNotifications(true);
          }
        }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LeanOnMeLoader />;

  return (
    <FeatureLoader text="Heart to Heart">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-pink-600 p-8 md:p-12 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold">
                <Heart className="w-4 h-4" /> Heart to Heart
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Get Expert Advice & <br /> Support from the Community
              </h1>
              <p className="text-red-50 text-lg">
                Connect with people who can solve your problems. From technical faults to relationship advice, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => setShowMentorModal(true)}
                  className={clsx(
                    "px-8 py-3 font-bold rounded-xl transition-all shadow-lg shadow-red-900/20",
                    isMentor ? "bg-green-500 text-white" : "bg-white text-red-600 hover:bg-red-50"
                  )}
                >
                  {isMentor ? "Mentor Profile Active" : "Become a Mentor"}
                </button>
                <button 
                  onClick={() => setShowExpertsModal(true)}
                  className="px-8 py-3 bg-red-700/30 text-white font-bold rounded-xl hover:bg-red-700/40 transition-colors border border-white/20 backdrop-blur-md"
                >
                  Browse Experts
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center animate-pulse">
                <Heart className="w-32 h-32 text-white/50" fill="currentColor" />
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-red-400/20 rounded-full blur-2xl" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('advice')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'advice' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <MessageCircle className="w-5 h-5" /> Advice & Support
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all relative",
              activeTab === 'sessions' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Calendar className="w-5 h-5" /> My Sessions
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-white border-2 border-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'wallet' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Wallet className="w-5 h-5" /> My Wallet
          </button>
          <button
            onClick={() => setActiveTab('lend')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              activeTab === 'lend' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Handshake className="w-5 h-5" /> Lending Hub
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 text-gray-400 hover:text-red-500 transition-colors relative"
            >
              <Bot className="w-6 h-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm italic">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={clsx(
                            "p-3 rounded-xl border transition-all cursor-pointer",
                            n.read ? "bg-gray-50 border-transparent" : "bg-red-50 border-red-100"
                          )}
                          onClick={() => {
                            setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                            setActiveTab('sessions');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{n.userName}</p>
                              <p className="text-[10px] text-gray-500">{n.type.toUpperCase()} Session</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            Booked for {n.date} at {n.time}.
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'advice' && (
              <motion.div
                key="advice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for advice, mentors, or problems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white shadow-sm"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button 
                      onClick={() => setSelectedCategory('All')}
                      className={clsx(
                        "px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all",
                        selectedCategory === 'All' ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                      )}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={clsx(
                          "px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all",
                          selectedCategory === cat ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="group glass-panel bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/advice${i}/600/400`} 
                          alt="Mentor" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-red-600 shadow-sm">
                          {categories[i % categories.length]}
                        </div>
                        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold shadow-lg">
                          $25 / session
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://picsum.photos/seed/user${i}/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                          <div>
                            <h3 className="font-bold text-gray-800">Expert Mentor {i}</h3>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-gray-400 ml-1">(48 reviews)</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 line-clamp-2">
                          I will help you {categories[i % categories.length].toLowerCase()} with proven strategies.
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30-45 mins</span>
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Expert</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button 
                            onClick={() => {
                              setSelectedExpert({
                                id: i,
                                name: `Expert Mentor ${i}`,
                                category: categories[i % categories.length],
                                rate: 25,
                                image: `https://picsum.photos/seed/user${i}/100`
                              });
                              setShowBookingModal(true);
                            }}
                            className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                          >
                            Book Now
                          </button>
                          <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-display font-bold text-gray-900">Upcoming Sessions</h2>
                  <button className="text-sm font-bold text-red-500 hover:text-red-600">View History</button>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No sessions booked yet</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Browse our experts and book your first session to get personalized advice.</p>
                    <button 
                      onClick={() => setActiveTab('advice')}
                      className="mt-6 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                      Browse Experts
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map((booking, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <img src={booking.expert.image} className="w-12 h-12 rounded-full border-2 border-gray-100" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="font-bold text-gray-900">{booking.expert.name}</h4>
                              <p className="text-xs text-gray-500">{booking.expert.category}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Confirmed
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Date</p>
                            <p className="text-sm font-bold text-gray-900">{booking.date}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Time</p>
                            <p className="text-sm font-bold text-gray-900">{booking.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex-1 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                            {booking.type === 'video' ? <Video className="w-4 h-4" /> : booking.type === 'audio' ? <Radio className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                            Join Session
                          </button>
                          <button 
                            onClick={() => setBookings(bookings.filter((_, i) => i !== idx))}
                            className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Wallet Balance Card */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-8 rounded-3xl bg-gray-900 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm font-bold mb-1 uppercase tracking-widest">Total Balance</p>
                          <h2 className="text-5xl font-display font-bold">${balance.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                          <Wallet className="w-6 h-6 text-red-400" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => deposit(500)}
                          className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Deposit
                        </button>
                        <button 
                          onClick={() => withdraw(100)}
                          className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10 backdrop-blur-md flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight className="w-5 h-5" /> Withdraw
                        </button>
                      </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl" />
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex flex-col items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-bold text-gray-600">Send Money</span>
                      </button>
                      <button className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-blue-500" />
                        <span className="text-xs font-bold text-gray-600">Exchange</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                    <button className="text-sm font-bold text-red-500 hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {transactions.length > 0 ? (
                      transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-red-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={clsx(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              tx.type === 'deposit' || tx.type === 'receive' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            )}>
                              {tx.type === 'deposit' || tx.type === 'receive' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{tx.description}</p>
                              <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()} • {tx.status}</p>
                            </div>
                          </div>
                          <div className={clsx(
                            "text-lg font-bold",
                            tx.type === 'deposit' || tx.type === 'receive' ? "text-green-600" : "text-red-600"
                          )}>
                            {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Activity className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">No transactions yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'lend' && (
              <motion.div
                key="lend"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl space-y-6">
                    <h2 className="text-2xl font-bold">Lend Money</h2>
                    <p className="text-blue-100">Help others in the community and earn interest on your loans. All loans are protected by our security system.</p>
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-xs text-blue-200 font-bold mb-1 uppercase">Available to Lend</p>
                        <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
                      </div>
                      <button className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
                        Create Lending Offer
                      </button>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-xl space-y-6">
                    <h2 className="text-2xl font-bold">Borrow Money</h2>
                    <p className="text-green-100">Need a quick boost? Borrow from trusted community members with flexible repayment terms.</p>
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-xs text-green-200 font-bold mb-1 uppercase">Your Credit Score</p>
                        <p className="text-3xl font-bold">785 / 850</p>
                      </div>
                      <button className="w-full py-4 bg-white text-green-600 font-bold rounded-2xl hover:bg-green-50 transition-colors shadow-lg">
                        Request a Loan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Active Lending Market</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img src={`https://picsum.photos/seed/lender${i}/100`} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                            <div>
                              <h3 className="font-bold text-gray-800">Lender {i}</h3>
                              <p className="text-xs text-gray-400">Verified Lender</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                            {i * 2 + 3}% Interest
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Max Amount</p>
                            <p className="font-bold text-gray-800">${(i * 1000).toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Term</p>
                            <p className="font-bold text-gray-800">{i * 3} Months</p>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                          Apply for Loan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Integration Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 text-center group cursor-pointer hover:border-red-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Live Advice</h4>
            <p className="text-xs text-gray-400">Join live advice streams</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 text-center group cursor-pointer hover:border-red-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Video Tutorials</h4>
            <p className="text-xs text-gray-400">Watch expert guides</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 text-center group cursor-pointer hover:border-red-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">AI Problem Solver</h4>
            <p className="text-xs text-gray-400">Get instant AI help</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 text-center group cursor-pointer hover:border-red-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-800">Post Problem</h4>
            <p className="text-xs text-gray-400">Ask the community</p>
          </div>
        </div>
      </div>

      {/* Become a Mentor Modal */}
      <AnimatePresence>
        {showMentorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-500 to-pink-600 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6" /> Become a Mentor
                </h2>
                <button onClick={() => setShowMentorModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Primary Expertise</label>
                  <select 
                    value={mentorForm.category}
                    onChange={(e) => setMentorForm({ ...mentorForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Session Rate ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 25" 
                    value={mentorForm.rate}
                    onChange={(e) => setMentorForm({ ...mentorForm, rate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio</label>
                  <textarea 
                    placeholder="Tell us about your experience and how you can help others..." 
                    value={mentorForm.bio}
                    onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5" 
                    value={mentorForm.experience}
                    onChange={(e) => setMentorForm({ ...mentorForm, experience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                <button onClick={() => setShowMentorModal(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => {
                  setShowMentorModal(false);
                  setIsMentor(true);
                  setMentorForm({ category: categories[0], rate: '', bio: '', experience: '' });
                  toast.success("Congratulations!", {
                    description: "You are now an active mentor. You will receive notifications for new bookings."
                  });
                }} className="px-6 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Submit Application</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Browse Experts Modal */}
      <AnimatePresence>
        {showExpertsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-500 to-pink-600 text-white shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Search className="w-6 h-6" /> Browse Experts
                </h2>
                <button onClick={() => setShowExpertsModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-100 shrink-0 bg-gray-50 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search experts by name or skill..." 
                    value={expertSearch}
                    onChange={(e) => setExpertSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" 
                  />
                </div>
                <select 
                  value={expertCategory}
                  onChange={(e) => setExpertCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium text-gray-700"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const cat = categories[i % categories.length];
                    const name = `Dr. Expert ${i + 1}`;
                    
                    // Simple filter logic
                    if (expertSearch && !name.toLowerCase().includes(expertSearch.toLowerCase()) && !cat.toLowerCase().includes(expertSearch.toLowerCase())) return null;
                    if (expertCategory && cat !== expertCategory) return null;

                    return (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start">
                        <img src={`https://picsum.photos/seed/expert${i}/150`} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900">{name}</h3>
                              <p className="text-sm text-red-500 font-medium">{cat}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-bold text-yellow-700">4.{9 - (i % 5)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">Experienced professional helping individuals navigate complex challenges in {cat.toLowerCase()}.</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-bold text-gray-900">${20 + (i * 5)}/hr</span>
                            <button 
                              onClick={() => {
                                setSelectedExpert({
                                  id: i,
                                  name: name,
                                  category: cat,
                                  rate: 20 + (i * 5),
                                  image: `https://picsum.photos/seed/expert${i}/150`
                                });
                                setShowBookingModal(true);
                              }}
                              className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                              Book Session
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              {bookingSuccess ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-bold text-gray-900">Booking Confirmed!</h2>
                    <p className="text-gray-500">Your session with <span className="font-bold text-gray-900">{selectedExpert?.name}</span> has been scheduled successfully.</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Date:</span>
                      <span className="font-bold text-gray-900">{bookingForm.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time:</span>
                      <span className="font-bold text-gray-900">{bookingForm.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="font-bold text-gray-900 capitalize">{bookingForm.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingSuccess(false);
                    }}
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <div className="flex items-center gap-4">
                      <img src={selectedExpert?.image} className="w-12 h-12 rounded-full border-2 border-white/20" referrerPolicy="no-referrer" />
                      <div>
                        <h2 className="text-xl font-bold">{selectedExpert?.name}</h2>
                        <p className="text-xs text-gray-400">{selectedExpert?.category}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Session Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Session Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'chat', icon: MessageCircle, label: 'Chat' },
                          { id: 'video', icon: Video, label: 'Video' },
                          { id: 'audio', icon: Radio, label: 'Audio' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setBookingForm({ ...bookingForm, type: t.id })}
                            className={clsx(
                              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                              bookingForm.type === t.id ? "border-red-500 bg-red-50 text-red-600" : "border-gray-100 hover:border-gray-200 text-gray-500"
                            )}
                          >
                            <t.icon className="w-6 h-6" />
                            <span className="text-xs font-bold">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Duration</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[30, 60, 90].map(d => (
                          <button
                            key={d}
                            onClick={() => setBookingForm({ ...bookingForm, duration: d })}
                            className={clsx(
                              "py-3 rounded-xl border-2 font-bold transition-all",
                              bookingForm.duration === d ? "border-red-500 bg-red-50 text-red-600" : "border-gray-100 hover:border-gray-200 text-gray-500"
                            )}
                          >
                            {d} mins
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Date</label>
                        <input 
                          type="date" 
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Time</label>
                        <select 
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-700"
                        >
                          {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-6 bg-gray-900 rounded-3xl text-white space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Total Cost</span>
                        <span className="text-2xl font-display font-bold text-red-400">
                          ${(selectedExpert?.rate * (bookingForm.duration / 60)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 border-t border-white/10 pt-4">
                        <span>Your Balance: ${balance.toLocaleString()}</span>
                        <span className={clsx(
                          "font-bold",
                          balance >= (selectedExpert?.rate * (bookingForm.duration / 60)) ? "text-green-400" : "text-red-400"
                        )}>
                          {balance >= (selectedExpert?.rate * (bookingForm.duration / 60)) ? 'Funds Available' : 'Insufficient Funds'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50 border-t border-gray-100">
                    <button 
                      disabled={isBooking || balance < (selectedExpert?.rate * (bookingForm.duration / 60))}
                      onClick={() => {
                        setIsBooking(true);
                        setTimeout(() => {
                          setIsBooking(false);
                          setBookingSuccess(true);
                          setBookings([...bookings, {
                            expert: selectedExpert,
                            ...bookingForm
                          }]);
                          // Emit socket event for notification
                          if (socket) {
                            socket.emit('booking:new', {
                              userName: user?.name || 'A user',
                              expertName: selectedExpert?.name,
                              ...bookingForm
                            });
                          }
                        }, 2000);
                      }}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeatureLoader>
  );
}

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
