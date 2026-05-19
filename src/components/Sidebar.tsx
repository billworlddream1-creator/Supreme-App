import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureControl, FeatureId } from '../context/FeatureControlContext';
import { 
  Crown, 
  Trophy,
  ChevronLeft, 
  ChevronRight, 
  Users, 
  TrendingUp,
  LogOut, 
  User,
  ShoppingBag,
  Play,
  Globe,
  Bot,
  MessageCircle,
  Radio,
  Megaphone,
  Shield,
  Sparkles,
  Heart,
  Briefcase,
  Star,
  Wallet as WalletIcon,
  CreditCard,
  Edit3,
  Satellite,
  Target,
  Lock,
  LayoutDashboard,
  Activity,
  Bitcoin,
  Cpu,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import GlobalSearch from './GlobalSearch';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
  user: any;
  logout: () => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  featureId?: FeatureId;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: Crown },
      { path: '/supreme-mode', label: 'Supreme Mode', icon: Sparkles },
      { path: '/supreme-gmt', label: 'Supreme GMT', icon: Satellite, featureId: 'supreme-gmt' },
      { path: '/heart-to-heart', label: 'Heart to Heart', icon: Heart },
    ]
  },
  {
    label: 'Subscriptions',
    items: [
      { path: '/pricing', label: 'Pricing Plans', icon: CreditCard },
    ]
  },
  {
    label: 'Community',
    items: [
      { path: '/network', label: 'Network', icon: Users, featureId: 'network' },
      { path: '/supreme-users', label: 'Supreme Users', icon: TrendingUp },
      { path: '/chat', label: 'Chat', icon: MessageCircle, featureId: 'chat' },
      { path: '/streams', label: 'Streams', icon: Radio, featureId: 'streams' },
      { path: '/media', label: 'Media', icon: Play, featureId: 'streams' },
      { path: '/celeb-hub', label: 'Celeb Hub', icon: Star, featureId: 'celeb-hub' },
      { path: '/hall-of-fame', label: 'Hall of Fame', icon: Trophy },
    ]
  },
  {
    label: 'Marketplace',
    items: [
      { path: '/market', label: 'Market', icon: ShoppingBag, featureId: 'market' },
      { path: '/dealer-dashboard', label: 'Dealer Dashboard', icon: LayoutDashboard },
      { path: '/discover', label: 'Discover', icon: Globe, featureId: 'discover' },
    ]
  },
  {
    label: 'Documentation',
    items: [
      { path: '/manual', label: 'App Manual', icon: FileText },
    ]
  },
  {
    label: 'Tools',
    items: [
      { path: '/ai-tools', label: 'AI Tools', icon: Bot, featureId: 'ai-tools' },
      { path: '/content-creator', label: 'Content Creator', icon: Edit3 },
      { path: '/business-tools', label: 'Business Tools', icon: Briefcase, featureId: 'utilities' },
      { path: '/finance-tracker', label: 'Finance Tracker', icon: Activity },
      { path: '/supreme-coin-optimum', label: 'Supreme Coin Optimum', icon: Bitcoin, featureId: 'supreme-coin-optimum' },
      { path: '/hardware-mining', label: 'Hardware Mining', icon: Cpu, featureId: 'supreme-coin-optimum' },
      { path: '/industrial-tools', label: 'Industrial Tools', icon: LayoutDashboard, featureId: 'industrial-tools' },
      { path: '/wallet', label: 'Wallet', icon: WalletIcon },
      { path: '/ads', label: 'Ads Manager', icon: Megaphone },
      { path: '/supreme-pv', label: 'Supreme PV', icon: Target },
      { path: '/supreme-treasures', label: 'Supreme Treasures', icon: Briefcase, featureId: 'core' },
      { path: '/appeal', label: 'Supreme Appeal', icon: Shield },
      { path: '/admin', label: 'Admin Dashboard', icon: Shield },
    ]
  }
];

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
  user,
  logout,
  showProfileMenu,
  setShowProfileMenu
}: SidebarProps) {
  const navigate = useNavigate();
  const { isFeaturePaused } = useFeatureControl();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed md:relative z-[200] h-[100dvh] md:h-screen glass-panel border-r border-[var(--color-supreme-glass-border)] flex flex-col bg-white/95 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isDesktopCollapsed ? "md:w-20 3xl:w-24 4xl:w-32 5xl:w-40" : "md:w-64 3xl:w-80 4xl:w-96 5xl:w-[480px]",
          "w-64"
        )}
      >
        {/* Logo Section */}
        <div className={clsx("p-6 3xl:p-10 4xl:p-14 5xl:p-20 flex items-center mb-4 transition-all duration-300", isDesktopCollapsed ? "justify-center" : "gap-3 3xl:gap-5")}>
          <div className="w-10 h-10 3xl:w-14 4xl:w-20 5xl:w-28 3xl:h-14 4xl:h-20 5xl:h-28 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20">
            <Crown className="text-white w-6 h-6 3xl:w-8 3xl:h-8 4xl:w-12 4xl:h-12 5xl:w-16 5xl:h-16" />
          </div>
          {!isDesktopCollapsed && (
            <span className="font-display font-bold text-2xl 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl tracking-widest text-[var(--color-supreme-text)] whitespace-nowrap">SUPREME</span>
          )}
        </div>

        {/* Collapse Button (Desktop Only) */}
        <button 
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-[var(--color-supreme-gold)] hover:border-[var(--color-supreme-gold)] transition-colors shadow-sm z-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]"
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Search */}
        <div className={clsx("px-3 mb-4 flex md:hidden", isDesktopCollapsed && "justify-center")}>
          <GlobalSearch iconOnly={isDesktopCollapsed} className="mt-2" />
        </div>

        {/* Auth Button for Guests */}
        {!user && (
          <div className="px-3 mb-4">
            <button
              onClick={() => navigate('/login')}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all shadow-sm",
                "bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white hover:shadow-lg hover:scale-[1.02]",
                isDesktopCollapsed && "justify-center px-0"
              )}
            >
              <User className="w-5 h-5" />
              {!isDesktopCollapsed && <span>Sign In</span>}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar pb-8">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isDesktopCollapsed && (
                <h3 className="px-4 text-[10px] 3xl:text-xs 4xl:text-lg 5xl:text-2xl font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 3xl:mb-4 4xl:mb-6 5xl:mb-8">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1 3xl:space-y-2 4xl:space-y-4 5xl:space-y-6">
                {group.items.map((item) => {
                  // Hide Ads Manager for logged-in non-dealer users (visitors can see it)
                  // Show Ads Manager to everyone, PremiumRoute will handle access
                  if (item.path === '/ads' && !user) return null;
                  
                  // Hide Admin Dashboard for non-admin users
                  if (item.path === '/admin' && (!user || (user.role !== 'admin' && user.role !== 'mini-admin'))) return null;
                  
                  // Hide Dealer Dashboard for non-dealer users
                  if (item.path === '/dealer-dashboard' && (!user || (user.role !== 'dealer' && user.role !== 'admin'))) return null;
                  
                  const isPaused = item.featureId ? isFeaturePaused(item.featureId) : false;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={(e) => {
                        if (!user && item.path !== '/') {
                          e.preventDefault();
                          navigate('/login');
                        }
                      }}
                      title={isDesktopCollapsed ? (isPaused ? `${item.label} (Locked)` : item.label) : `Navigate to ${item.label}`}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isDesktopCollapsed ? "justify-center p-3 3xl:p-4 4xl:p-6 5xl:p-8" : "gap-4 px-4 py-2.5 3xl:gap-6 3xl:px-6 3xl:py-4 4xl:gap-8 4xl:px-10 4xl:py-6 5xl:gap-12 5xl:px-16 5xl:py-10",
                          isActive 
                            ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-sm border border-[var(--color-supreme-gold)]/30" 
                            : isPaused 
                              ? "text-red-400/60 hover:text-red-400 hover:bg-red-50/50"
                              : "text-gray-500 hover:text-[var(--color-supreme-text)] hover:bg-gray-100"
                        )
                      }
                    >
                      {isPaused ? (
                        <Lock className={clsx("w-5 h-5 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 5xl:w-14 5xl:h-14 shrink-0 relative z-10", isDesktopCollapsed ? "text-red-400" : "text-red-400")} />
                      ) : (
                        <item.icon className="w-5 h-5 3xl:w-7 3xl:h-7 4xl:w-10 4xl:h-10 5xl:w-14 5xl:h-14 shrink-0 relative z-10" />
                      )}
                      {!isDesktopCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className={clsx(
                            "font-medium relative z-10 tracking-wide whitespace-nowrap text-sm 3xl:text-lg 4xl:text-2xl 5xl:text-4xl truncate",
                            isPaused && "text-gray-400"
                          )}>
                            {item.label}
                          </span>
                          {isPaused && <Lock className="w-3 h-3 3xl:w-5 3xl:h-5 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12 text-red-400 shrink-0 ml-2" />}
                        </div>
                      )}
                      
                      {/* Hover effect */}
                      {!isPaused && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-supreme-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pricing Widget */}
          {!isDesktopCollapsed && (
            <div className="px-4 mt-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-supreme-gold)]/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-[var(--color-supreme-gold)]/20 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Supreme Plans</span>
                  </div>
                  <h4 className="text-sm font-bold mb-1">General Subs</h4>
                  <p className="text-[10px] text-gray-400 mb-3">Unlock Supreme Vibes & AI Tools</p>
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        navigate('/pricing');
                      }
                    }}
                    className="w-full py-2 bg-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold-light)] text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20"
                  >
                    View All Plans
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Section (Restored on the left) */}
        <div className="p-4 3xl:p-6 4xl:p-10 5xl:p-16 border-t border-[var(--color-supreme-glass-border)] relative z-[9999]">
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={clsx(
                  "fixed mb-2 bg-white rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-gray-200 overflow-hidden z-[99999]",
                  isDesktopCollapsed ? "left-24 bottom-28 w-48" : "left-4 bottom-28 w-56"
                )}
              >
                {user ? (
                  <>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 3xl:px-6 3xl:py-5 4xl:px-10 4xl:py-8 5xl:px-16 5xl:py-12 text-sm 3xl:text-lg 4xl:text-3xl 5xl:text-5xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Edit Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 3xl:px-6 3xl:py-5 4xl:px-10 4xl:py-8 5xl:px-16 5xl:py-12 text-sm 3xl:text-lg 4xl:text-3xl 5xl:text-5xl font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 3xl:px-6 3xl:py-5 4xl:px-10 4xl:py-8 5xl:px-16 5xl:py-12 text-sm 3xl:text-lg 4xl:text-3xl 5xl:text-5xl font-medium text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/10 transition-colors"
                  >
                    <User className="w-4 h-4 3xl:w-6 3xl:h-6 4xl:w-10 4xl:h-10 5xl:w-16 5xl:h-16" /> Sign In
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
 
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowProfileMenu(!showProfileMenu);
              }
            }}
            tabIndex={0}
            role="button"
            className={clsx(
              "flex items-center rounded-xl bg-gray-50 border border-gray-200 hover:border-[var(--color-supreme-gold)]/50 transition-colors cursor-pointer group shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-supreme-gold)]",
              isDesktopCollapsed ? "p-2 3xl:p-3 4xl:p-5 5xl:p-8 justify-center" : "gap-3 p-3 3xl:gap-5 3xl:p-5 4xl:gap-8 4xl:p-8 5xl:gap-12 5xl:p-12"
            )}
          >
            <div className="w-10 h-10 3xl:w-14 4xl:w-20 5xl:w-32 3xl:h-14 4xl:h-20 5xl:h-32 shrink-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-sm 3xl:text-lg 4xl:text-3xl 5xl:text-5xl text-[var(--color-supreme-gold)]">
                  {user?.name?.charAt(0) || 'G'}
                </span>
              )}
            </div>
            {!isDesktopCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm 3xl:text-lg 4xl:text-3xl 5xl:text-5xl font-medium text-[var(--color-supreme-text)] truncate group-hover:text-[var(--color-supreme-gold)] transition-colors">
                  {user?.name || 'Guest'}
                </p>
                <p className="text-xs 3xl:text-sm 4xl:text-xl 5xl:text-3xl text-gray-500 truncate capitalize">Supreme Rank: {user?.role || 'Visitor'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
