/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public override state: GlobalErrorBoundaryState = { hasError: false };

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global Error Caught:", error, errorInfo);
    if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
       const key = 'vite_dynamic_import_error_reloaded';
       if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, 'true');
          window.location.reload();
       }
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-[var(--color-supreme-bg)] p-8">
          <h2 className="text-2xl font-bold mb-4">Application Updated</h2>
          <p className="text-gray-600 mb-6 max-w-md">The application has received a new update. Please refresh the page to load the latest version.</p>
          <button 
            onClick={() => {
              sessionStorage.removeItem('vite_dynamic_import_error_reloaded');
              window.location.reload();
            }} 
            className="px-6 py-3 bg-[var(--color-supreme-gold)] text-white font-bold rounded-xl"
          >
            Refresh Layout
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader2, Crown, Lock, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { GreetingProvider } from './context/GreetingContext';
import GreetingMoodTracker from './components/GreetingMoodTracker';
import { WalletProvider } from './context/WalletContext';
import { AdsProvider } from './context/AdsContext';
import { SecurityProvider } from './context/SecurityContext';
import { SoundProvider } from './context/SoundContext';
import { NetworkProvider } from './context/NetworkContext';
import { UserStatusProvider } from './context/UserStatusContext';
import { MonthlyAwardsProvider } from './context/MonthlyAwardsContext';
import { NotificationProvider } from './context/NotificationContext';
import { ActivityFlashProvider } from './context/ActivityFlashContext';
import { FeatureControlProvider, useFeatureControl, FeatureId } from './context/FeatureControlContext';
import { MiningProvider } from './context/MiningContext';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import AnalyticsTracker from './components/AnalyticsTracker';
import BirthdayGreeting from './components/BirthdayGreeting';
import T10RewardTrigger from './components/T10RewardTrigger';
import DailyBonus from './components/DailyBonus';
import StreakAnalysisArea from './components/StreakAnalysisArea';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Network = lazy(() => import('./pages/Network'));
const Market = lazy(() => import('./pages/Market'));
const Media = lazy(() => import('./pages/Media'));
const Discover = lazy(() => import('./pages/Discover'));
const ProjectPower = lazy(() => import('./pages/ProjectPower'));
const AITools = lazy(() => import('./pages/AITools'));
const Chat = lazy(() => import('./pages/Chat'));
const Streams = lazy(() => import('./pages/Streams'));
const AdsManager = lazy(() => import('./pages/AdsManager'));
const SupremePV = lazy(() => import('./pages/SupremePV'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const SupremeUsers = lazy(() => import('./pages/SupremeUsers'));
const SupremeInsight = lazy(() => import('./pages/SupremeInsight'));
const SupremeMode = lazy(() => import('./pages/SupremeMode'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const HeartToHeart = lazy(() => import('./pages/HeartToHeart'));
const BusinessTools = lazy(() => import('./pages/BusinessTools'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Pricing = lazy(() => import('./pages/Pricing'));
const IndustrialTools = lazy(() => import('./pages/IndustrialTools'));
const ContentCreator = lazy(() => import('./pages/ContentCreator'));
const SupremeCore = lazy(() => import('./pages/SupremeCore'));
const SupremeCelebHub = lazy(() => import('./pages/SupremeCelebHub'));
const SupremeGMT = lazy(() => import('./pages/SupremeGMT'));
const SupremeHallOfFame = lazy(() => import('./pages/SupremeHallOfFame'));
const SupremeNobles = lazy(() => import('./pages/SupremeNobles'));
const DealerDashboard = lazy(() => import('./pages/DealerDashboard'));
const FinanceTracker = lazy(() => import('./pages/FinanceTracker'));
const SupremeCoinOptimum = lazy(() => import('./pages/SupremeCoinOptimum'));
const HardwareMining = lazy(() => import('./pages/HardwareMining'));
const SupremeHubOfTreasures = lazy(() => import('./pages/SupremeHubOfTreasures'));
const Appeal = lazy(() => import('./pages/Appeal'));
const AppManual = lazy(() => import('./pages/AppManual'));
const Settings = lazy(() => import('./pages/Settings'));
const SuperShort = lazy(() => import('./pages/SuperShort'));
const SuperSoundsPromote = lazy(() => import('./pages/SuperSoundsPromote'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen w-full bg-[var(--color-supreme-bg)]">
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-8 h-8 text-[var(--color-supreme-gold)] animate-bounce" />
      </div>
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-32 h-32 text-[var(--color-supreme-gold)] animate-spin" strokeWidth={1} />
        <span className="absolute font-display font-bold text-[var(--color-supreme-gold)] text-sm tracking-widest animate-pulse">SUPREME</span>
      </div>
    </div>
  </div>
);

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Premium Route Wrapper
function PremiumRoute({ children, feature }: { children: React.ReactNode, feature: string }) {
  const { user } = useAuth();
  const { checkAccess } = useSubscription();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { hasAccess, message } = checkAccess(feature as any);
  
  if (!hasAccess) {
    return <Navigate to="/pricing" state={{ message }} replace />;
  }

  return <>{children}</>;
}

// Feature Protected Route Wrapper
function FeatureProtectedRoute({ children, featureId }: { children: React.ReactNode, featureId: FeatureId }) {
  const { isFeaturePaused, getFeatureStatus } = useFeatureControl();
  const { profile } = useAuth();
  const status = getFeatureStatus(featureId);
  const isPaused = isFeaturePaused(featureId);

  // Map FeatureId to Supreme Feature ID for per-user blocking
  const featureIdMap: Record<string, string> = {
    'market': 'FT-MKT-101',
    'chat': 'FT-CHT-202',
    'network': 'FT-NET-303',
    'ai-tools': 'FT-AIT-404',
    'supreme-gmt': 'FT-GMT-505',
    'streams': 'FT-SCR-606',
    'hall-of-fame': 'FT-HLF-707',
    'utilities': 'FT-UTL-808',
    'supreme-coin-optimum': 'FT-COI-909',
    'hardware-mining': 'FT-HRD-010',
    'media': 'FT-MED-111'
  };

  const supremeId = featureIdMap[featureId];
  const userLockedData = supremeId ? profile?.lockedFeatures?.[supremeId] : null;

  if (isPaused || userLockedData) {
    const isUserLocked = !!userLockedData;
    const reason = isUserLocked ? userLockedData.reason : status.reason;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-red-100 shadow-xl max-w-2xl mx-auto my-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative p-6 bg-red-50 rounded-2xl border border-red-200">
            <Lock className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
          {isUserLocked ? "Feature Restricted" : "Feature Locked"}
        </h2>
        
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 w-full">
          <div className="flex items-center gap-2 text-red-600 font-bold mb-2 justify-center">
            <AlertCircle className="w-5 h-5" />
            {isUserLocked ? "Restriction Notice" : "Reason for Pause"}
          </div>
          <p className="text-red-800 text-lg italic">"{reason || 'This feature is currently undergoing maintenance.'}"</p>
        </div>

        {isUserLocked && (
          <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 w-full mb-8">
            <h4 className="font-bold text-orange-900 mb-2">Supreme Appeal Protocol Required</h4>
            <p className="text-sm text-orange-700 leading-relaxed">
              You have been restricted from using this feature. To regain access, you must complete the 7-day Supreme Appeal policy mastery course.
            </p>
            <a 
              href="#/appeal" 
              className="inline-flex items-center gap-2 mt-4 text-[var(--color-supreme-gold)] font-bold hover:underline"
            >
              Go to Supreme Appeal <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {status.unlockTime && !isUserLocked && (
          <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl border border-gray-200 w-full">
            <div className="flex items-center gap-2 text-gray-600 font-bold">
              <Clock className="w-5 h-5" />
              Estimated Unlock Time
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--color-supreme-gold)]">
              {new Date(status.unlockTime).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Access will be restored automatically.
            </div>
          </div>
        )}

        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// Dealer Route Wrapper
function DealerRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (profile?.role !== 'dealer' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Admin Route Wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (profile?.role !== 'admin' && profile?.name !== 'Master Admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Auth Loader Wrapper
function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <PageLoader />;
  return <>{children}</>;
}

// Security Session Timeout Warning Modal
function SessionTimeoutWarner() {
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Default session duration: 15 minutes (900 seconds)
  const SESSION_DURATION_MS = 15 * 60 * 1000;
  const WARNING_THRESHOLD_SEC = 100;

  // Ref to track the expiration timestamp and throttle activity events
  const expiresAtRef = React.useRef<number>(0);
  const lastActivityRef = React.useRef<number>(0);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('supreme_session_expires_at');
      setTimeLeft(null);
      setShowWarning(false);
      return;
    }

    const saved = localStorage.getItem('supreme_session_expires_at');
    expiresAtRef.current = saved ? parseInt(saved) : Date.now() + SESSION_DURATION_MS;
    if (!saved) {
      localStorage.setItem('supreme_session_expires_at', expiresAtRef.current.toString());
    }

    // Automatically extend session expiration on user activity
    const handleActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once every 5 seconds to reduce local storage overhead
      if (now - lastActivityRef.current > 5000) {
        const newExpiresAt = now + SESSION_DURATION_MS;
        expiresAtRef.current = newExpiresAt;
        localStorage.setItem('supreme_session_expires_at', newExpiresAt.toString());
        lastActivityRef.current = now;
        setShowWarning(false);
      }
    };

    // Add activity event listeners on the document level
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach(evt => {
      document.addEventListener(evt, handleActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = expiresAtRef.current - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      if (remainingSec <= WARNING_THRESHOLD_SEC && remainingSec > 0) {
        setShowWarning(true);
      } else if (remainingSec <= 0) {
        clearInterval(interval);
        setShowWarning(false);
        localStorage.removeItem('supreme_session_expires_at');
        logout();
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach(evt => {
        document.removeEventListener(evt, handleActivity);
      });
    };
  }, [user, logout]);

  const handleExtend = () => {
    const newExpiresAt = Date.now() + SESSION_DURATION_MS;
    expiresAtRef.current = newExpiresAt;
    localStorage.setItem('supreme_session_expires_at', newExpiresAt.toString());
    setTimeLeft(15 * 60);
    setShowWarning(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('supreme_session_expires_at');
    setShowWarning(false);
    await logout();
  };

  if (!showWarning || timeLeft === null) return null;

  return (
    <div 
      id="session-timeout-modal-container"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div 
        id="session-timeout-modal-content"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 id="session-timeout-title" className="font-display font-bold text-lg text-amber-500">
              Session Expiration Warning
            </h3>
            <p className="text-xs text-zinc-400">Security Inactivity Protocol</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          For your security, your authenticated session is about to expire. You will be automatically logged out in{' '}
          <span id="session-timeout-countdown" className="font-mono font-bold text-amber-500 text-lg">
            {timeLeft}
          </span>{' '}
          seconds if no action is taken.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="session-timeout-extend-button"
            onClick={handleExtend}
            className="flex-1 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/10"
          >
            Extend Session
          </button>
          <button
            id="session-timeout-logout-button"
            onClick={handleLogout}
            className="flex-1 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl border border-zinc-700 transition-all"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}

// 1. Feature Idle Monitoring: Redirection to home dashboard after 1000s idle, warning for 800s
function FeatureIdleMonitor() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState<number>(800);

  const IDLE_THRESHOLD = 1000; // seconds
  const WARNING_DURATION = 800; // seconds

  const lastHoverRef = React.useRef<number>(Date.now());

  const isFeaturePage = location.pathname !== '/' && location.pathname !== '/login';

  useEffect(() => {
    if (!user || !isFeaturePage) {
      setShowWarning(false);
      return;
    }

    lastHoverRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_DURATION);

    const handleHover = () => {
      lastHoverRef.current = Date.now();
      if (showWarning) {
        setShowWarning(false);
        setCountdown(WARNING_DURATION);
      }
    };

    // Listen to mousemove / mouseover/ mouseenter to capture user hovering/activity on the feature
    window.addEventListener('mousemove', handleHover, { passive: true });
    window.addEventListener('mouseover', handleHover, { passive: true });
    window.addEventListener('mouseenter', handleHover, { passive: true });

    const interval = setInterval(() => {
      const secondsIdle = (Date.now() - lastHoverRef.current) / 1000;

      if (secondsIdle >= IDLE_THRESHOLD) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil(WARNING_DURATION - (secondsIdle - IDLE_THRESHOLD)));
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setShowWarning(false);
          navigate('/');
        }
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleHover);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mouseenter', handleHover);
    };
  }, [user, isFeaturePage, showWarning, navigate]);

  const handleKeepExploring = () => {
    lastHoverRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_DURATION);
  };

  if (!showWarning) return null;

  return (
    <div 
      id="feature-idle-modal-container"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div 
        id="feature-idle-modal-content"
        className="relative w-full max-w-md bg-zinc-950 border border-amber-500/30 text-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <AlertCircle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 id="feature-idle-title" className="font-display font-bold text-lg text-amber-400">
              Feature Idle Warning
            </h3>
            <p className="text-xs text-zinc-400">Supreme Security Protocol</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          This feature has been idle for <span className="font-bold text-amber-400">1,000</span> seconds without mouse hovering. You will be redirected back to the home dashboard in{' '}
          <span id="feature-idle-countdown" className="font-mono font-bold text-amber-400 text-lg">
            {countdown}
          </span>{' '}
          seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="feature-idle-extend-button"
            onClick={handleKeepExploring}
            className="flex-1 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/10"
          >
            Keep Exploring
          </button>
          <button
            id="feature-idle-home-button"
            onClick={() => navigate('/')}
            className="flex-1 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl border border-zinc-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Dashboard Idle Monitoring: Logs the user off after 10,000s idle, warning for 8,000s
function DashboardIdleMonitor() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState<number>(8000);

  const IDLE_THRESHOLD = 10000; // seconds
  const WARNING_DURATION = 8000; // seconds

  const lastActivityRef = React.useRef<number>(Date.now());

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_DURATION);

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (showWarning) {
        setShowWarning(false);
        setCountdown(WARNING_DURATION);
      }
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'mouseover', 'mouseenter'];
    activityEvents.forEach(evt => {
      document.addEventListener(evt, handleActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const secondsIdle = (Date.now() - lastActivityRef.current) / 1000;

      if (secondsIdle >= IDLE_THRESHOLD) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil(WARNING_DURATION - (secondsIdle - IDLE_THRESHOLD)));
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setShowWarning(false);
          logout();
        }
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach(evt => {
        document.removeEventListener(evt, handleActivity);
      });
    };
  }, [user, showWarning, logout]);

  const handleContinue = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_DURATION);
  };

  if (!showWarning) return null;

  return (
    <div 
      id="dashboard-idle-modal-container"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
    >
      <div 
        id="dashboard-idle-modal-content"
        className="relative w-full max-w-md bg-zinc-950 border border-red-500/30 text-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 id="dashboard-idle-title" className="font-display font-bold text-lg text-red-400">
              Dashboard Idle Preservation
            </h3>
            <p className="text-xs text-zinc-400">Extreme Security Protocol</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
          Your dashboard session has been idle for <span className="font-bold text-red-400">10,000</span> seconds. You will be automatically logged off for safety preservation in{' '}
          <span id="dashboard-idle-countdown" className="font-mono font-bold text-red-400 text-lg">
            {countdown}
          </span>{' '}
          seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="dashboard-idle-extend-button"
            onClick={handleContinue}
            className="flex-1 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md shadow-red-500/10"
          >
            Resume Session
          </button>
          <button
            id="dashboard-idle-logout-button"
            onClick={logout}
            className="flex-1 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl border border-zinc-700 transition-all"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <SoundProvider>
        <AuthProvider>
          <AuthLoader>
          <FeatureControlProvider>
            <NetworkProvider>
            <UserStatusProvider>
            <NotificationProvider>
              <ActivityFlashProvider>
                <AdminProvider>
                  <SubscriptionProvider>
                    <GreetingProvider>
                      <WalletProvider>
                        <MiningProvider>
                          <MonthlyAwardsProvider>
                            <AdsProvider>
                              <SecurityProvider>
                                <HashRouter>
                                  <AnalyticsTracker />
                                  <BirthdayGreeting />
                                  <GreetingMoodTracker />
                                  <T10RewardTrigger />
                                <DailyBonus />
                                <StreakAnalysisArea mode="popup" />
                                <SessionTimeoutWarner />
                                <FeatureIdleMonitor />
                                <DashboardIdleMonitor />
                                <Suspense fallback={<PageLoader />}>
                                  <Routes>
                                    <Route path="/" element={<Layout />}>
                                      <Route path="login" element={<Login />} />
                                      <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
                                      <Route path="network" element={<ProtectedRoute><FeatureProtectedRoute featureId="network"><Network /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="market" element={<ProtectedRoute><FeatureProtectedRoute featureId="market"><Market /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="dealer-dashboard" element={<ProtectedRoute><DealerRoute><DealerDashboard /></DealerRoute></ProtectedRoute>} />
                                      <Route path="media" element={<PremiumRoute feature="media"><FeatureProtectedRoute featureId="media"><Media /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="discover" element={<ProtectedRoute><FeatureProtectedRoute featureId="discover"><Discover /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="project-power" element={<ProtectedRoute><FeatureProtectedRoute featureId="project-power"><ProjectPower /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="ai-tools" element={<ProtectedRoute><FeatureProtectedRoute featureId="ai-tools"><AITools /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                                      <Route path="streams" element={<PremiumRoute feature="streaming"><FeatureProtectedRoute featureId="streams"><Streams /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="ads" element={<ProtectedRoute><FeatureProtectedRoute featureId="ads"><AdsManager /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="supreme-pv" element={<ProtectedRoute><SupremePV /></ProtectedRoute>} />
                                      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                      <Route path="supreme-users" element={<PremiumRoute feature="general"><SupremeUsers /></PremiumRoute>} />
                                      <Route path="insight" element={<PremiumRoute feature="supreme-insight"><SupremeInsight /></PremiumRoute>} />
                                      <Route path="supreme-mode" element={<PremiumRoute feature="supreme-mode"><SupremeMode /></PremiumRoute>} />
                                      <Route path="admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
                                      <Route path="heart-to-heart" element={<ProtectedRoute><HeartToHeart /></ProtectedRoute>} />
                                      <Route path="business-tools" element={<ProtectedRoute><FeatureProtectedRoute featureId="utilities"><BusinessTools /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="finance-tracker" element={<ProtectedRoute><FinanceTracker /></ProtectedRoute>} />
                                      <Route path="supreme-coin-optimum" element={<ProtectedRoute><FeatureProtectedRoute featureId="supreme-coin-optimum"><SupremeCoinOptimum /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="hardware-mining" element={<ProtectedRoute><FeatureProtectedRoute featureId="supreme-coin-optimum"><HardwareMining /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="content-creator" element={<ProtectedRoute><ContentCreator /></ProtectedRoute>} />
                                      <Route path="supreme-core" element={<PremiumRoute feature="general"><FeatureProtectedRoute featureId="core"><SupremeCore /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                                      <Route path="pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
                                      <Route path="industrial-tools" element={<ProtectedRoute><FeatureProtectedRoute featureId="industrial-tools"><IndustrialTools /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="celeb-hub" element={<PremiumRoute feature="general"><FeatureProtectedRoute featureId="celeb-hub"><SupremeCelebHub /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="supreme-gmt" element={<PremiumRoute feature="general"><FeatureProtectedRoute featureId="supreme-gmt"><SupremeGMT /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="hall-of-fame" element={<PremiumRoute feature="general"><FeatureProtectedRoute featureId="hall-of-fame"><SupremeHallOfFame /></FeatureProtectedRoute></PremiumRoute>} />
                                      <Route path="supreme-nobles" element={<ProtectedRoute><SupremeNobles /></ProtectedRoute>} />
                                      <Route path="supreme-treasures" element={<ProtectedRoute><SupremeHubOfTreasures /></ProtectedRoute>} />
                                      <Route path="appeal" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />
                                      <Route path="manual" element={<ProtectedRoute><AppManual /></ProtectedRoute>} />
                                      <Route path="super-short" element={<ProtectedRoute><SuperShort /></ProtectedRoute>} />
                                      <Route path="super-sounds-promote" element={<ProtectedRoute><SuperSoundsPromote /></ProtectedRoute>} />
                                      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                    </Route>
                                  </Routes>
                                </Suspense>
                              </HashRouter>
                            </SecurityProvider>
                          </AdsProvider>
                        </MonthlyAwardsProvider>
                      </MiningProvider>
                    </WalletProvider>
                  </GreetingProvider>
                </SubscriptionProvider>
                </AdminProvider>
              </ActivityFlashProvider>
            </NotificationProvider>
            </UserStatusProvider>
          </NetworkProvider>
          </FeatureControlProvider>
        </AuthLoader>
      </AuthProvider>
    </SoundProvider>
    </GlobalErrorBoundary>
  );
}
