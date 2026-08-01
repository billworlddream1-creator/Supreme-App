import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  Play, 
  Globe, 
  Bot, 
  MessageCircle, 
  Radio, 
  Megaphone,
  Menu,
  X,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  LogOut,
  User,
  TrendingUp,
  Newspaper,
  Sparkles,
  Shield,
  Heart,
  Briefcase,
  Star,
  Wallet as WalletIcon,
  CreditCard,
  Edit3,
  Satellite,
  Lock as LockIcon,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useSound } from '../context/SoundContext';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { event } from '../utils/analytics';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import Chatbot from './Chatbot';
import MobileSimulator from './MobileSimulator';

export default function Layout() {
  useGlobalShortcuts();
  const { playSound } = useSound();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const isInsideIframe = window.self !== window.top;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isPendingSecurityVerification, confirmSecurityKey, recordFailedAttempt } = useAuth();
  const { userSubscriptions } = useSubscription();
  const [securityKeyInput, setSecurityKeyInput] = useState('');
  const [securityError, setSecurityError] = useState('');

  const handleSecurityKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    const isValid = await confirmSecurityKey(securityKeyInput);
    if (!isValid) {
      setSecurityError('Invalid or Expired Security Key');
      recordFailedAttempt();
    }
  };

  const activeSubs = userSubscriptions.filter(s => s.isActive);

  const isFirstRender = React.useRef(true);
  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setShowProfileMenu(false);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      playSound('notification');
    } catch (err) {
      console.warn("Navigation sound failed", err);
    }
  }, [location.pathname, playSound]);

  const handleLogout = () => {
    event({ action: 'logout', category: 'Auth' });
    logout();
    navigate('/login');
  };

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isSearchBarCollapsed, setIsSearchBarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-supreme-bg)] text-[var(--color-supreme-text)] overflow-hidden font-sans">
      <Toaster theme="light" position="top-right" richColors />
      {/* Security Key Prompt Overlay */}
      <AnimatePresence>
        {isPendingSecurityVerification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20"
            >
              <div className="p-8 bg-red-900 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <Shield className="w-10 h-10 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-display font-black text-white tracking-tight mb-2">SECURITY VERIFICATION</h2>
                  <p className="text-amber-500/70 text-sm font-bold uppercase tracking-widest">Account Protection Active</p>
                </div>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSecurityKeySubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Enter Security Key</label>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={securityKeyInput}
                        onChange={(e) => setSecurityKeyInput(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-mono font-bold tracking-widest focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        required
                      />
                    </div>
                    {securityError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-red-600 text-xs font-bold mt-2"
                      >
                        <AlertTriangle className="w-4 h-4" /> {securityError}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full py-4 bg-amber-500 text-red-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5 active:scale-95"
                    >
                      Verify Identity
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const success = await confirmSecurityKey('EASY');
                        if (success) {
                          setSecurityKeyInput('');
                          setSecurityError('');
                        }
                      }}
                      className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-emerald-500/20"
                    >
                      Bypass Key (Easy Login)
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full py-3 bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      Cancel & Logout
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This account is protected by a secondary security key. If you lost your key, please contact support or use your recovery options.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 glass-panel px-4 py-3 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20 transform -rotate-3">
            <Crown className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-display font-black text-xl tracking-tighter text-[var(--color-supreme-text)] leading-none">SUPREME</span>
            <span className="text-[8px] font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.3em] leading-none">Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <GlobalSearch iconOnly />
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </>
          )}
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)} 
            className="p-2.5 rounded-2xl bg-gray-100/80 text-[var(--color-supreme-text)] hover:bg-gray-200 transition-all active:scale-95 border border-gray-200/50"
            title={isMobileOpen ? "Close menu" : "Open menu"}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full z-50 glass-panel border-t border-[var(--color-supreme-glass-border)] bg-white/95 px-6 py-3 flex justify-between items-center safe-area-bottom">
        {[
          { path: '/', icon: Crown, label: 'Home' },
          { path: '/network', icon: Users, label: 'Network' },
          { path: '/market', icon: ShoppingBag, label: 'Market' },
          { path: '/wallet', icon: WalletIcon, label: 'Wallet' },
          { path: '/profile', icon: User, label: 'Profile' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => {
              if (!user && item.path !== '/') {
                e.preventDefault();
                navigate('/login');
              }
            }}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-[var(--color-supreme-gold)] scale-110" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
        user={user}
        logout={logout}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Main Content */}
      <div className={clsx(
        "flex-1 relative z-0 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 via-white to-white transition-all duration-500"
      )}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-multiply"></div>
        
        {/* Global Floating Controls (Responsive) */}
        <div className="absolute top-0 left-0 right-0 z-[100] pointer-events-none">
          {/* Standalone User Control Panel - Floating Top Right */}
          <div className="fixed top-4 right-4 md:top-6 md:right-8 lg:right-12 pointer-events-auto">
             <AnimatePresence>
               {!isHeaderCollapsed && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: -20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: -20 }}
                   className="flex items-center gap-4 md:gap-5 px-3 py-2 md:px-5 md:py-3 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] md:rounded-[2.5rem] border border-gray-100/50 ring-1 ring-black/[0.03]"
                 >
                   <NotificationCenter />
                   <div className="w-px h-5 md:h-6 bg-gray-200" />
                   {user ? (
                     <button 
                       onClick={() => navigate('/profile')}
                       className="group relative flex items-center gap-2 md:gap-3 pr-1"
                     >
                       <div className="text-right hidden sm:block">
                         <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mb-0.5 whitespace-nowrap">{user.name || 'User'}</p>
                         <p className="text-[8px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-[0.2em] leading-none">Online</p>
                       </div>
                       <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 group-active:scale-95 transition-all">
                         <img 
                           src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
                           alt={user.name || 'User'} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                     </button>
                   ) : (
                     <button
                       onClick={() => navigate('/login')}
                       className="px-4 py-2 md:px-6 md:py-2.5 bg-gray-900 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-black transition-all shadow-lg"
                     >
                       Access
                     </button>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Central Search Bar - Independent Floating Panel (Desktop Only for now to avoid mobile clutter) */}
          {user && (
            <div className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 pointer-events-auto z-[90]">
              <AnimatePresence initial={false}>
                {!isHeaderCollapsed && !isSearchBarCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: -20 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -20 }}
                    className="relative group w-full"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-supreme-gold)]/20 to-amber-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                    <GlobalSearch className="relative shadow-2xl shadow-gray-200/40 border-gray-100/50" />
                    
                    <button 
                      onClick={() => setIsSearchBarCollapsed(true)}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-100 text-gray-400 hover:text-[var(--color-supreme-gold)] transition-all shadow-sm hover:shadow-md"
                      title="Hide Search"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Re-expand Search Button */}
              <AnimatePresence>
                {isSearchBarCollapsed && !isHeaderCollapsed && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => setIsSearchBarCollapsed(false)}
                    className="mx-auto flex items-center justify-center p-3 bg-white shadow-xl border border-gray-100 rounded-2xl text-[var(--color-supreme-gold)] hover:scale-110 transition-all"
                  >
                     <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Header Layout Toggle / Slide Button */}
          <div className="fixed left-1/2 -translate-x-1/2 top-1 pointer-events-auto z-[110]">
             <button
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className={clsx(
                  "flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-2xl border transition-all hover:scale-110 active:scale-90",
                  isHeaderCollapsed 
                    ? "bg-[var(--color-supreme-gold)] text-white border-white/20" 
                    : "bg-white/20 backdrop-blur-md text-gray-500 border-white/30 hover:bg-white hover:text-[var(--color-supreme-gold)]"
                )}
              >
                {isHeaderCollapsed ? (
                  <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
                ) : (
                  <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />
                )}
              </button>
          </div>
        </div>

        {/* Scrollable Content inside main area */}
        <main 
          className={clsx(
            "flex-1 overflow-y-auto relative z-10 pb-24 md:pb-0 transition-all duration-500",
            !isHeaderCollapsed ? "pt-24 md:pt-28" : "pt-0"
          )}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-4 md:p-8 lg:p-10 3xl:p-16 4xl:p-24 5xl:p-32 max-w-7xl 3xl:max-w-[1800px] 4xl:max-w-[2400px] 5xl:max-w-[3600px] mx-auto min-h-screen"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Chatbot */}
        <Chatbot />

        {/* Floating Desktop Mobile Preview Studio FAB */}
        {!isInsideIframe && (
          <div className="fixed bottom-6 right-24 z-40 hidden md:flex items-center">
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-900 rounded-full shadow-[0_15px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.5)] border border-amber-400/30 font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer group"
              title="Open Mobile Sandbox Preview"
            >
              <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Mobile Preview</span>
            </button>
          </div>
        )}
        <MobileSimulator 
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          initialPath={location.pathname + location.search + location.hash}
        />
      </div>
    </div>
  );
}
