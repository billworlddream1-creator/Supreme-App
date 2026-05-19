import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useActivityFlash } from '../context/ActivityFlashContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Radio, CheckCircle, UserPlus, Users, Trophy, ShoppingBag, TrendingUp, FileText, Edit3, Heart, X, ThumbsUp, ClipboardCheck } from 'lucide-react';
import { clsx } from 'clsx';

const MOCK_NAMES = ['Alex Johnson', 'Sarah Williams', 'Michael Chen', 'Emma Davis', 'James Wilson', 'Olivia Martinez', 'William Taylor'];
const MOCK_CITIES = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia', 'Paris, France', 'Dubai, UAE'];
const MOCK_PRODUCTS = ['Luxury Watch', 'Supreme AI Subscription', 'Designer Handbag', 'Premium Consulting', 'Digital Art NFT'];
const MOCK_TASKS = ['Market Analysis', 'Client Presentation', 'Code Review', 'Product Launch Plan', 'System Optimization'];

const generateMockActivity = () => {
  const typeIndex = Math.floor(Math.random() * 11) + 1; // Increased to 11 for the new type
  const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const name2 = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const avatar = `https://picsum.photos/seed/${name.replace(' ', '')}/150`;
  const city = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];
  const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
  const task = MOCK_TASKS[Math.floor(Math.random() * MOCK_TASKS.length)];
  const price = `$${(Math.floor(Math.random() * 900) + 100).toLocaleString()}`;
  const connectors = Math.floor(Math.random() * 500) + 10;

  switch (typeIndex) {
    case 1:
      return { type: 1, name, avatar, text: 'just posted: "Supreme Milestone: Innovation meets excellence. Our latest breakthrough is setting new industry standards."', icon: Edit3, color: 'text-blue-500', bgColor: 'bg-blue-50' };
    case 2:
      return { type: 2, name, avatar, text: 'is on Live Stream right now!', icon: Radio, color: 'text-red-500', bgColor: 'bg-red-50' };
    case 3:
      return { type: 3, name, avatar, text: 'just published a new article.', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50' };
    case 4:
      return { type: 4, name, avatar, text: 'just got approved for payment.', icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' };
    case 5:
      return { type: 5, name, avatar, text: 'just joined Supreme platform.', icon: UserPlus, color: 'text-purple-500', bgColor: 'bg-purple-50' };
    case 6:
      return { type: 6, name, avatar, text: `just connected with ${name2}`, subtext: `${connectors} new connectors`, icon: Users, color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
    case 7:
      return { type: 7, name, avatar, text: `is Supreme Top Earner`, subtext: city, icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    case 8:
      return { type: 8, name, avatar, text: `is Supreme Top Connector`, icon: Sparkles, color: 'text-[var(--color-supreme-gold)]', bgColor: 'bg-amber-50' };
    case 9:
      return { type: 9, name, avatar, text: `just listed a product: ${product}`, subtext: `Price: ${price}`, icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-50' };
    case 10:
      return { type: 10, name, avatar, text: `Top Selling Product: ${product}`, subtext: `Listed by ${name}`, icon: TrendingUp, color: 'text-rose-500', bgColor: 'bg-rose-50' };
    case 11:
      return { type: 11, name, avatar, text: `just completed a task: ${task}`, icon: ClipboardCheck, color: 'text-cyan-500', bgColor: 'bg-cyan-50' };
    default:
      return { type: 1, name, avatar, text: 'just posted an update.', icon: Edit3, color: 'text-blue-500', bgColor: 'bg-blue-50' };
  }
};

export default function ActivityFlashScreen() {
  const { settings } = useActivityFlash();
  const { user } = useAuth();
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Use refs to track cycle state without triggering re-renders that clear the timeout
  const flashCountRef = React.useRef(0);
  const isPausedRef = React.useRef(false);
  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!settings.isEnabled) {
      setIsVisible(false);
      return;
    }

    let isMounted = true;

    const runCycle = () => {
      if (!isMounted) return;

      if (isPausedRef.current) {
        // Wait for pause duration
        timeoutIdRef.current = setTimeout(() => {
          if (!isMounted) return;
          isPausedRef.current = false;
          flashCountRef.current = 0;
          runCycle();
        }, settings.pauseDuration * 1000);
      } else {
        // Show flash
        setCurrentActivity(generateMockActivity());
        setHasLiked(false);
        setIsVisible(true);

        // Hide after flashDuration
        timeoutIdRef.current = setTimeout(() => {
          if (!isMounted) return;
          setIsVisible(false);
          
          flashCountRef.current += 1;
          
          if (flashCountRef.current >= settings.flashCountBeforePause) {
            isPausedRef.current = true;
            // Wait a small gap for exit animation before pause starts
            timeoutIdRef.current = setTimeout(runCycle, 500);
          } else {
            // Wait a small gap before next flash (e.g., 1 second)
            timeoutIdRef.current = setTimeout(runCycle, 1000);
          }
        }, settings.flashDuration * 1000);
      }
    };

    // Start the cycle
    runCycle();

    return () => {
      isMounted = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [settings]); // Only re-run if settings change

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleLike = () => {
    setHasLiked(true);
    // In a real app, this would send a request to the backend
  };

  if (!settings.isEnabled || !user) return null;

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'top-left': return 'top-24 left-8';
      case 'bottom-right': return 'bottom-8 right-8';
      case 'bottom-left': return 'bottom-8 left-8';
      default: return 'top-24 right-8';
    }
  };

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'light': return 'bg-white border-gray-200 shadow-xl';
      case 'dark': return 'bg-gray-900 border-gray-800 text-white shadow-2xl';
      case 'gold': return 'bg-[var(--color-supreme-gold)] border-amber-400 text-black shadow-2xl';
      default: return 'bg-white/95 backdrop-blur-2xl border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)]';
    }
  };

  const getInitialX = () => {
    if (settings.position.includes('left')) return -100;
    return 100;
  };

  return (
    <AnimatePresence>
      {isVisible && currentActivity && (
        <motion.div
          initial={{ opacity: 0, x: getInitialX(), y: settings.position.includes('top') ? -20 : 20, scale: 0.8, rotate: settings.position.includes('left') ? -5 : 5 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, x: getInitialX(), scale: 0.8, filter: 'blur(10px)' }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className={clsx(
            "fixed z-[100] rounded-3xl p-5 flex items-center gap-5 overflow-hidden group transition-all duration-500",
            "w-[288px] h-[96px] sm:w-[500px] sm:h-[160px]", // 3 inches width, 1 inch height for mobile (~96px/inch)
            getPositionClasses(),
            getThemeClasses()
          )}
        >
          {/* Progress Bar Background */}
          <div className={clsx("absolute bottom-0 left-0 w-full h-1", settings.theme === 'dark' ? 'bg-white/10' : 'bg-gray-100/50')}>
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: settings.flashDuration, ease: 'linear' }}
              className={clsx("h-full", currentActivity.color.replace('text-', 'bg-'))}
            />
          </div>

          {/* Decorative background glow */}
          <div className={clsx("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500", currentActivity.bgColor)}></div>
          
          <div className="relative shrink-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <img 
                src={currentActivity.avatar} 
                alt={currentActivity.name} 
                className={clsx(
                  "w-24 h-24 rounded-2xl object-cover border-2 shadow-xl",
                  settings.theme === 'dark' ? 'border-gray-700' : 'border-white'
                )}
              />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={clsx(
                  "absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border",
                  settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
                  currentActivity.color
                )}
              >
                <currentActivity.icon className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
          
          <div className="flex-1 min-w-0 z-10 flex flex-col justify-center h-full">
            <div className="flex items-center justify-between mb-1">
              <h4 className={clsx(
                "text-xl font-display font-black truncate",
                settings.theme === 'dark' ? 'text-white' : 'text-[var(--color-supreme-text)]'
              )}>
                {currentActivity.name}
              </h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike}
                  className={clsx(
                    "p-2 rounded-full transition-all hover:scale-110 active:scale-95",
                    hasLiked ? "text-pink-500 bg-pink-50" : clsx("hover:text-pink-500 hover:bg-pink-50", settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                  )}
                >
                  <Heart className={clsx("w-4 h-4", hasLiked && "fill-current")} />
                </button>
                <button 
                  onClick={handleDismiss}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all",
                    settings.theme === 'dark' ? 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <X className="w-3 h-3" /> Close
                </button>
              </div>
            </div>
            
            <p className={clsx(
              "text-sm line-clamp-2 leading-relaxed font-medium",
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {currentActivity.text}
            </p>
            
            {currentActivity.subtext && (
              <div className="flex items-center gap-2 mt-2">
                <span className={clsx("w-1.5 h-1.5 rounded-full", currentActivity.color.replace('text-', 'bg-'))}></span>
                <p className={clsx(
                  "text-[10px] font-black uppercase tracking-[0.1em] truncate",
                  settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                )}>
                  {currentActivity.subtext}
                </p>
              </div>
            )}

            {/* Feedback Interaction */}
            <AnimatePresence>
              {hasLiked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full"
                >
                  <ThumbsUp className="w-3 h-3" /> You liked this
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

