/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
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

  render() {
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

import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader2, Crown, Lock, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { WalletProvider } from './context/WalletContext';
import { AdsProvider } from './context/AdsContext';
import { SecurityProvider } from './context/SecurityContext';
import { SoundProvider } from './context/SoundContext';
import { NetworkProvider } from './context/NetworkContext';
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

export default function App() {
  return (
    <GlobalErrorBoundary>
      <SoundProvider>
        <AuthProvider>
          <AuthLoader>
          <FeatureControlProvider>
            <NetworkProvider>
            <NotificationProvider>
              <ActivityFlashProvider>
                <AdminProvider>
                  <SubscriptionProvider>
                    <WalletProvider>
                      <MiningProvider>
                        <MonthlyAwardsProvider>
                          <AdsProvider>
                            <SecurityProvider>
                              <HashRouter>
                                <AnalyticsTracker />
                                <BirthdayGreeting />
                                <T10RewardTrigger />
                                <Suspense fallback={<PageLoader />}>
                                  <Routes>
                                    <Route path="/" element={<Layout />}>
                                      <Route path="login" element={<Login />} />
                                      <Route index element={<Home />} />
                                      <Route path="network" element={<ProtectedRoute><FeatureProtectedRoute featureId="network"><Network /></FeatureProtectedRoute></ProtectedRoute>} />
                                      <Route path="market" element={<FeatureProtectedRoute featureId="market"><Market /></FeatureProtectedRoute>} />
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
                                      <Route path="manual" element={<AppManual />} />
                                    </Route>
                                  </Routes>
                                </Suspense>
                              </HashRouter>
                            </SecurityProvider>
                          </AdsProvider>
                        </MonthlyAwardsProvider>
                      </MiningProvider>
                    </WalletProvider>
                  </SubscriptionProvider>
                </AdminProvider>
              </ActivityFlashProvider>
            </NotificationProvider>
          </NetworkProvider>
          </FeatureControlProvider>
        </AuthLoader>
      </AuthProvider>
    </SoundProvider>
    </GlobalErrorBoundary>
  );
}
