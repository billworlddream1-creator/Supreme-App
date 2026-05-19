import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Coins, 
  Trophy, 
  History, 
  Download, 
  Gamepad2, 
  Sparkles, 
  ArrowUpRight, 
  Lock,
  Wallet,
  ShoppingBag,
  Gem,
  Palmtree,
  Ship,
  Home,
  Star,
  ShieldCheck,
  ArrowRightLeft,
  X,
  CreditCard,
  Plus,
  Palette,
  Layout,
  Shield
} from 'lucide-react';

// Limits for Noble Spin wallet transfers
const MIN_TRANSFER = 1000;
const MAX_TRANSFER = 1_000_000;
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

interface NobleAsset {
  id: string;
  name: string;
  type: 'Real Estate' | 'Transport' | 'Luxury' | 'Empire';
  price: number;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Ethereal';
}

const NOBLE_ASSETS: NobleAsset[] = [
  { 
    id: 'penthouse', 
    name: 'Diamond Penthouse', 
    type: 'Real Estate', 
    price: 500_000_000, 
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    rarity: 'Rare'
  },
  { 
    id: 'yacht', 
    name: 'Giga Yacht "Aurelius"', 
    type: 'Transport', 
    price: 350_000_000, 
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=800',
    rarity: 'Rare'
  },
  { 
    id: 'island', 
    name: 'Sanctuary Island', 
    type: 'Real Estate', 
    price: 1_200_000_000, 
    image: 'https://images.unsplash.com/photo-1548391350-968f58dedaed?auto=format&fit=crop&q=80&w=800',
    rarity: 'Epic'
  },
  { 
    id: 'jet', 
    name: 'Golden Falcon Jet', 
    type: 'Transport', 
    price: 150_000_000, 
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=800',
    rarity: 'Common'
  },
  { 
    id: 'stadium', 
    name: 'Supreme Arena', 
    type: 'Empire', 
    price: 2_500_000_000, 
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    rarity: 'Legendary'
  },
  { 
    id: 'martian_colony', 
    name: 'Noble Martian Outpost', 
    type: 'Empire', 
    price: 10_000_000_000, 
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800',
    rarity: 'Ethereal'
  },
];

// New Prize Segments based on logos and requested logic
const NOBLE_SPIN_PRIZES = [
  // 1. Bronze (1.50% Winning -> 1.5X)
  { logo: 'bronze', label: '1.5X', type: 'multiplier', value: 1.5, color: 'from-orange-800 to-orange-900', icon: 'Shield' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  
  // 2. Silver (2% Winning -> 2X)
  { logo: 'silver', label: '2X', type: 'multiplier', value: 2, color: 'from-slate-400 to-slate-500', icon: 'ShieldCheck' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },

  // 3. Diamond (3% Winning -> 3X)
  { logo: 'diamond', label: '3X', type: 'multiplier', value: 3, color: 'from-cyan-400 to-cyan-500', icon: 'Gem' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },

  // 4. Gold (5% Winning -> 5X)
  { logo: 'gold', label: '5X', type: 'multiplier', value: 5, color: 'from-yellow-500 to-amber-600', icon: 'Trophy' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },

  // 5. Crowned (10% Winning -> 10X)
  { logo: 'crowned', label: '10X', type: 'multiplier', value: 10, color: 'from-purple-500 to-indigo-600', icon: 'Crown' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
  { label: '0X', type: 'multiplier', value: 0, color: 'from-gray-900 to-black', icon: 'X' },
];

const NOBLE_WHEEL_THEMES = [
  { name: 'Supreme Gold', color: '#b8860b' },
  { name: 'Deep Pink', color: '#ff1493' },
  { name: 'Royal Ruby', color: '#9b111e' },
  { name: 'Emerald Empire', color: '#046307' },
  { name: 'Midnight Blue', color: '#003366' },
  { name: 'Vantablack', color: '#050505' },
];

export default function NobleSpin() {
  const { betWalletBalance, updateBetWalletBalance, depositToBetWallet, transferFromBetWallet, balance } = useWallet();
  const { user, profile, updateUser } = useAuth();
  const { playSound } = useSound();
  
  const [betAmount, setBetAmount] = useState<number>(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<{ amount: number; type: string; label: string } | null>(null);
  const [showAssets, setShowAssets] = useState(false);
  const [activeTab, setActiveTab] = useState<'spin' | 'assets' | 'history'>('spin');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState<number>(MIN_TRANSFER);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  const [wheelTheme, setWheelTheme] = useState(NOBLE_WHEEL_THEMES[0]);
  const [showThemePicker, setShowThemePicker] = useState(false);
  
  const segmentsAmount = NOBLE_SPIN_PRIZES.length;
  const segmentAngle = 360 / segmentsAmount;

  const [telemetry, setTelemetry] = useState({
    currentSector: 'STANDBY',
    targetSector: 'PENDING',
    velocity: 0,
    timeRemaining: 0,
    status: 'READY'
  });

  const analyzerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);

  useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = Date.now();
      startRotationRef.current = rotation;
      // Note: newRotation in spinWheel will be targetRotationRef.current
      
      const updateTelemetry = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, 59 - elapsed);
        
        // Use a more accurate way to find current rotation during animation
        // Since we use CSS/Framer Motion for rotation, we approximate current angle
        // Framer Motion uses a cubic-bezier ease-out. For telemetry we simplify or use a ref.
        // For visual masterpiece, we'll calculate based on the ease-out curve [0.12, 0, 0.39, 0]
        // But simpler: we use a ref for rotation in the loop if we were controlling it.
        // Instead, let's just use the current visual rotation from the wheel div if possible or calculate it.
        
        // Progress (0 to 1)
        const p = Math.min(1, elapsed / 59);
        // Approximation of ease-out [0.12, 0, 0.39, 0] is tricky without math.
        // Let's just use a high-precision progress-based rotation for telemetry.
        const currentTotalRotation = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * (1 - Math.pow(1 - p, 4));
        
        const currentAngle = currentTotalRotation % 360;
        const sectorIndex = Math.floor(((360 - currentAngle + 360) % 360) / segmentAngle);
        const currentPrize = NOBLE_SPIN_PRIZES[sectorIndex];
        
        setTelemetry({
          currentSector: currentPrize?.logo?.toUpperCase() || (currentPrize?.value === 0 ? 'LOSS ZONE' : currentPrize?.label),
          targetSector: telemetry.targetSector, // updated in spinWheel
          velocity: Number(Math.max(0, (1 - p) * 100).toFixed(2)),
          timeRemaining: Number(remaining.toFixed(3)),
          status: remaining > 10 ? 'ANALYZING TRAJECTORY' : remaining > 0 ? 'FINAL DECELERATION' : 'TARGET LOCKED'
        });

        if (remaining > 0) {
          analyzerRef.current = requestAnimationFrame(updateTelemetry);
        }
      };
      
      analyzerRef.current = requestAnimationFrame(updateTelemetry);
    } else {
      if (analyzerRef.current) cancelAnimationFrame(analyzerRef.current);
      setTelemetry(prev => ({ ...prev, status: 'STANDBY', timeRemaining: 0, velocity: 0 }));
    }
    return () => {
      if (analyzerRef.current) cancelAnimationFrame(analyzerRef.current);
    };
  }, [isSpinning]);

  const handleTransfer = async () => {
    if (transferAmount < MIN_TRANSFER || transferAmount > MAX_TRANSFER) {
      toast.error(`Transfer amount must be between $${MIN_TRANSFER.toLocaleString()} and $${MAX_TRANSFER.toLocaleString()}`);
      return;
    }

    setIsProcessingTransfer(true);
    try {
      if (transferType === 'deposit') {
        if (balance < transferAmount) {
          toast.error("Insufficient balance in Central Wallet!");
          return;
        }
        await depositToBetWallet(transferAmount);
        toast.success(`Successfully deposited $${transferAmount.toLocaleString()} to Noble Wallet`);
      } else {
        if (betWalletBalance < transferAmount) {
          toast.error("Insufficient balance in Noble Wallet!");
          return;
        }
        await transferFromBetWallet(transferAmount);
        toast.success(`Successfully withdrawn $${transferAmount.toLocaleString()} to Central Wallet`);
      }
      setShowTransfer(false);
      playSound('success');
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    const totalLiquidity = betWalletBalance + balance;
    if (totalLiquidity < betAmount) {
      toast.error(`Strict Betting Violation: Your total liquidity ($${totalLiquidity.toLocaleString()}) is below the required $${betAmount.toLocaleString()} bet.`);
      playSound('error');
      return;
    }

    if (betWalletBalance < betAmount) {
      toast.error(`Insufficient Noble Wallet balance! Please transfer at least $${(betAmount - betWalletBalance).toLocaleString()} from your Central Wallet first.`);
      setShowTransfer(true);
      playSound('notification');
      return;
    }

    setIsSpinning(true);
    setLastWin(null);
    updateBetWalletBalance(-betAmount, `Noble Spin Bet: $${betAmount}`, 'bet-draw');

    const segments = NOBLE_SPIN_PRIZES.length;
    const extraSpins = 50 + Math.floor(Math.random() * 50); // 50-100 extra full rotations for a long spin
    const targetSegment = Math.floor(Math.random() * segments);
    
    // We want the wheel to align with the pointer (usually at top, 0 deg)
    // The segments are distributed clockwise. 
    // Target angle = (segments - targetSegment) * segmentAngle + current rotation base
    const newRotation = rotation + (extraSpins * 360) + (segments - targetSegment) * segmentAngle - (rotation % 360);
    
    targetRotationRef.current = newRotation;
    setRotation(newRotation);
    
    setTelemetry(prev => ({
      ...prev,
      targetSector: NOBLE_SPIN_PRIZES[targetSegment].logo?.toUpperCase() || (NOBLE_SPIN_PRIZES[targetSegment].value === 0 ? 'LOSS ZONE' : NOBLE_SPIN_PRIZES[targetSegment].label)
    }));

    setTimeout(() => {
      const prize = NOBLE_SPIN_PRIZES[targetSegment];
      handleWin(prize);
      setIsSpinning(false);
    }, 59000); // Extended duration (59s)
  };

  const handleWin = async (prize: typeof NOBLE_SPIN_PRIZES[0]) => {
    if (prize.type === 'multiplier') {
      const winAmount = betAmount * prize.value;
      if (winAmount > 0) {
        updateBetWalletBalance(winAmount, `Noble Spin Win: ${prize.logo || prize.label} ($${winAmount.toLocaleString()})`, 'bet-payout');
        setLastWin({ amount: winAmount, type: 'cash', label: prize.label });
        
        // Winning Celebration (Confetti & Sounds)
        playSound(winAmount > betAmount * 5 ? 'celebration' : 'success');
        
        const end = Date.now() + 3 * 1000;
        const colors = [wheelTheme.color, '#ffffff', '#ffd700'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());

        toast.success(`YOU WON! Multiplier: ${prize.label} Payout: $${winAmount.toLocaleString()}`);
      } else {
        // Losing "Bubbles" & Error Sound
        playSound('error');
        
        // Loss "Red Bubbles" Effect
        const scalar = 2;
        const lossBubble = confetti.shapeFromText({ text: '🔴', scalar });

        confetti({
          shapes: [lossBubble],
          particleCount: 15,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#8b0000'],
          gravity: 1.2,
          ticks: 200
        });

        toast.error("NO WINNING: 0X. Loss recorded to Supreme ledger.");
      }
    }
  };

  const buyAsset = async (asset: NobleAsset) => {
    if (betWalletBalance < asset.price) {
      toast.error("Insufficient balance to purchase this asset!");
      return;
    }

    if (profile?.nobleAssets?.includes(asset.id)) {
      toast.error("You already own this asset!");
      return;
    }

    try {
      updateBetWalletBalance(-asset.price, `Purchased Noble Asset: ${asset.name}`, 'payment');
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          nobleAssets: arrayUnion(asset.id)
        });
      }
      playSound('purchase');
      toast.success(`Congratulations! You now own the ${asset.name}.`);
    } catch (error) {
      console.error("Asset purchase failed:", error);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-8 h-8" />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8" />;
      case 'Trophy': return <Trophy className="w-8 h-8" />;
      case 'Gem': return <Gem className="w-8 h-8" />;
      case 'Crown': return <Crown className="w-8 h-8" />;
      case 'X': return <X className="w-6 h-6 text-red-500/50" />;
      default: return null;
    }
  };

  return (
    <div 
      className="bg-[#1a000e] bg-gradient-to-br from-[#1a000e] via-[#0a0a0a] to-[#050002] min-h-[600px] rounded-[3rem] border border-pink-500/10 overflow-hidden flex flex-col relative"
      style={{ '--wheel-accent': wheelTheme.color } as any}
    >
      {/* Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 blur-[120px] rounded-full pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: `${wheelTheme.color}15` }}
      />

      {/* Header */}
      <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 md:p-3 rounded-2xl bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] border border-[var(--color-supreme-gold)]/20 shadow-lg">
            <Crown className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-display font-black text-white tracking-tight">Noble <span style={{ color: wheelTheme.color }}>Spin</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Logo Rewards & Loss Safeguard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Button */}
          <button 
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            <Palette className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Theme</span>
          </button>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Bet Wallet Balance</span>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[var(--color-supreme-gold)]" />
              <span className="text-xl font-display font-black text-white">${betWalletBalance.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowTransfer(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--color-supreme-gold)] transition-all shadow-xl active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </button>
          
          <button 
            onClick={() => setActiveTab(activeTab === 'assets' ? 'spin' : 'assets')}
            className={clsx(
              "p-4 rounded-2xl border transition-all relative group",
              activeTab === 'assets' ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)] text-black" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
              {profile?.nobleAssets?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex px-8 gap-2 border-b border-white/5">
        {(['spin', 'assets', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all",
              activeTab === tab ? "text-white" : "border-transparent text-gray-500 hover:text-white"
            )}
            style={{ 
              borderColor: activeTab === tab ? wheelTheme.color : 'transparent',
              backgroundColor: activeTab === tab ? `${wheelTheme.color}15` : 'transparent'
            }}
          >
            {tab}
          </button>
        ))}

        {/* Theme Picker Popover */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-8 mt-2 p-4 bg-[#151515] border border-white/10 rounded-3xl shadow-2xl z-50 min-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-4 px-2">
                <Layout className="w-4 h-4 text-gray-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Select Arena Aura</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {NOBLE_WHEEL_THEMES.map((theme) => (
                  <button 
                    key={theme.name}
                    onClick={() => {
                      setWheelTheme(theme);
                      setShowThemePicker(false);
                      toast.success(`Aura shifted to ${theme.name}`);
                    }}
                    className={clsx(
                      "w-10 h-10 rounded-full border-4 transition-all hover:scale-110",
                      wheelTheme.name === theme.name ? "border-white" : "border-white/5"
                    )}
                    style={{ backgroundColor: theme.color }}
                    title={theme.name}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'spin' && (
            <motion.div 
              key="spin-tab"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col lg:flex-row items-center justify-center gap-12"
            >
              {/* Digital Analyzer - The Masterpiece Panel */}
              <div className="w-full lg:w-72 order-2 lg:order-1 flex flex-col gap-4">
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--wheel-accent)] to-transparent opacity-50" />
                   
                   <div className="relative z-10 space-y-6 font-mono">
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Noble Telemetry</div>
                        <div className={clsx(
                          "w-2 h-2 rounded-full animate-pulse",
                          isSpinning ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500"
                        )} />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase tracking-tighter">Precision Chrono</div>
                        <div className="text-3xl font-black tabular-nums tracking-tighter text-white">
                          {Number(telemetry.timeRemaining).toFixed(3)}s
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div className="space-y-1">
                          <div className="text-[8px] text-gray-600 uppercase tracking-tighter">Velocity</div>
                          <div className="text-sm font-bold text-[var(--wheel-accent)]">
                            {Number(telemetry.velocity).toFixed(2)}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[8px] text-gray-600 uppercase tracking-tighter">Current</div>
                          <div className="text-sm font-bold text-white truncate">
                            {telemetry.currentSector}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/5 pt-4">
                         <div className="text-[8px] text-gray-600 uppercase tracking-tighter">Master Analysis</div>
                         <div className="text-[10px] font-black uppercase text-white/80 animate-pulse">
                           {telemetry.status}
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-[var(--wheel-accent)] shadow-[0_0_10px_var(--wheel-accent)]"
                              initial={{ width: "0%" }}
                              animate={{ width: isSpinning ? "100%" : "0%" }}
                              transition={{ duration: 59, ease: "linear" }}
                            />
                         </div>
                      </div>

                      {isSpinning && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pt-2"
                        >
                          <div className="text-[8px] text-gray-600 uppercase tracking-tighter mb-1">Target Predictor</div>
                          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                            <span className="text-[9px] text-white/50 tracking-widest font-black uppercase">Calculated</span>
                            <span className="text-[10px] text-[var(--wheel-accent)] font-black tracking-tighter drop-shadow-[0_0_5px_var(--wheel-accent)]">
                              {telemetry.timeRemaining < 30 ? telemetry.targetSector : '????'}
                            </span>
                          </div>
                        </motion.div>
                      )}
                   </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-[var(--wheel-accent)]/10 rounded-xl">
                    <History className="w-4 h-4 text-[var(--wheel-accent)]" />
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest font-black">System Status</div>
                    <div className="text-[10px] text-white font-bold uppercase tracking-tight">Encryption Active</div>
                  </div>
                </div>
              </div>

              {/* The Wheel */}
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] group order-1 lg:order-2">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 drop-shadow-2xl">
                  <div className="w-10 h-10 bg-white rotate-45 border-r-[var(--color-supreme-gold)] border-b-[var(--color-supreme-gold)] border-4" />
                </div>

                {/* Outer Ring */}
                <div 
                  className="absolute inset-0 rounded-full border-[10px] shadow-[0_0_50px_rgba(255,255,255,0.05)] transition-colors duration-1000"
                  style={{ borderColor: `${wheelTheme.color}30` }}
                />

                {/* Inner Wheel */}
                <motion.div 
                  className="w-full h-full rounded-full overflow-hidden relative border-8 border-white/5 bg-[#111] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
                  animate={{ 
                    rotate: rotation,
                    scale: isSpinning ? 0.98 : 1
                  }}
                  transition={{ 
                    rotate: { duration: 59, ease: [0.12, 0, 0.39, 0] },
                    scale: { duration: 0.3 }
                  }}
                >
                  {NOBLE_SPIN_PRIZES.map((prize, i) => (
                    <div 
                      key={i}
                      className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-center"
                      style={{ 
                        transform: `rotate(${i * segmentAngle}deg)`,
                        clipPath: `polygon(0 50%, 100% 18%, 100% 82%, 0 50%)`
                      }}
                    >
                      <div className={clsx(
                        "absolute inset-0 bg-gradient-to-r transition-colors duration-500",
                        prize.value === 0 ? "opacity-20 bg-black" : "opacity-90",
                        prize.color
                      )} />
                      <div className="relative rotate-90 translate-x-[90%] text-white flex flex-col items-center gap-2">
                         {prize.icon && (
                           <div className={clsx(
                             "transition-all duration-300",
                             prize.value > 0 ? "scale-100 opacity-100" : "scale-75 opacity-40"
                           )}>
                             {getIcon(prize.icon)}
                           </div>
                         )}
                         <span className="text-[10px] font-black tracking-tighter drop-shadow-md">
                           {prize.label}
                         </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Wheel Center */}
                  <div 
                    className="absolute inset-0 m-auto w-20 h-20 md:w-32 md:h-32 bg-[#050505] rounded-full border-4 shadow-2xl z-20 flex items-center justify-center transition-colors duration-1000"
                    style={{ borderColor: `${wheelTheme.color}40` }}
                  >
                    <Crown 
                      className="w-8 h-8 md:w-12 md:h-12 transition-colors duration-1000"
                      style={{ color: wheelTheme.color, filter: `drop-shadow(0 0 15px ${wheelTheme.color}50)` }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Controls */}
              <div className="w-full max-w-xl space-y-8">
                {/* Win Display */}
                <div className="h-16 flex items-center justify-center">
                  <AnimatePresence>
                    {lastWin && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="text-center"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: wheelTheme.color }}>Recent Aura Shift</p>
                        <h4 className="text-4xl font-display font-black text-white">
                          {lastWin.label}
                        </h4>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
                   {/* Primary Bet Display */}
                   <div className="flex flex-col justify-center space-y-2">
                      <div className="flex items-center gap-2">
                        <Coins className="w-3 h-3" style={{ color: wheelTheme.color }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Active Stake</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-display font-black text-white tabular-nums tracking-tighter">
                          ${betAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Chips</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1 px-[1px]">
                         <motion.div 
                           className="h-full rounded-full"
                           initial={{ width: "0%" }}
                           animate={{ width: `${Math.min(100, (betAmount / 1000000) * 100)}%` }}
                           style={{ backgroundColor: wheelTheme.color, boxShadow: `0 0 10px ${wheelTheme.color}` }}
                         />
                      </div>
                   </div>

                  {/* Bet Selection Area */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Adjust Capital</span>
                      <span className="text-[10px] font-black text-gray-400">$1k - $1M</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors group-focus-within:scale-110" style={{ color: wheelTheme.color }}>$</div>
                      <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(1000, Math.min(1000000, Number(e.target.value))))}
                        disabled={isSpinning}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white font-display font-bold focus:outline-none transition-all text-xl"
                        style={{ borderColor: isSpinning ? 'transparent' : `${wheelTheme.color}30` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Presets */}
                   <div className="space-y-4">
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 px-1 italic">Quick Asset Deployment</span>
                     <div className="flex flex-wrap gap-2">
                       {[1000, 5000, 10000, 50000, 100000, 1000000].map(val => (
                         <button 
                           key={val}
                           onClick={() => setBetAmount(val)}
                           disabled={isSpinning}
                           className={clsx(
                             "flex-1 min-w-[60px] py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tighter",
                             betAmount === val 
                               ? "text-white shadow-lg" 
                               : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                           )}
                           style={{ 
                             borderColor: betAmount === val ? wheelTheme.color : 'rgba(255,255,255,0.05)',
                             backgroundColor: betAmount === val ? `${wheelTheme.color}40` : '',
                             boxShadow: betAmount === val ? `0 0 15px ${wheelTheme.color}20` : 'none'
                           }}
                         >
                           {val >= 1000000 ? `${val/1000000}M` : `${val/1000}K`}
                         </button>
                       ))}
                    </div>
                   </div>

                  {/* Spin Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={spinWheel}
                      disabled={isSpinning || betWalletBalance < betAmount}
                      className={clsx(
                        "w-full py-5 rounded-[2rem] font-display font-black text-xl uppercase tracking-tighter transition-all relative overflow-hidden group active:scale-[0.98]",
                        isSpinning || betWalletBalance < betAmount 
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5" 
                          : "text-black shadow-2xl hover:scale-[1.02]"
                      )}
                      style={{ 
                        backgroundColor: isSpinning || betWalletBalance < betAmount ? 'transparent' : wheelTheme.color,
                        boxShadow: isSpinning ? 'none' : `0 0 30px ${wheelTheme.color}30`
                      }}
                    >
                      {isSpinning ? (
                        <span className="flex items-center justify-center gap-3">
                          <Sparkles className="w-6 h-6 animate-spin" />
                          Spinning...
                        </span>
                      ) : "Confirm Spin"}
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-8 pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Provably Fair</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Noble Security</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assets' && (
            <motion.div 
              key="assets-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {NOBLE_ASSETS.map((asset) => {
                  const isOwned = profile?.nobleAssets?.includes(asset.id);
                  return (
                    <div 
                      key={asset.id}
                      className="group relative bg-[#151515] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-[var(--color-supreme-gold)]/40 transition-all duration-500"
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          src={asset.image} 
                          alt={asset.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent" />
                        <div className="absolute top-4 right-4">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            asset.rarity === 'Ethereal' ? "bg-purple-500/20 border-purple-500/50 text-purple-400" :
                            asset.rarity === 'Legendary' ? "bg-amber-500/20 border-amber-500/50 text-amber-400" :
                            asset.rarity === 'Epic' ? "bg-pink-500/20 border-pink-500/50 text-pink-400" :
                            "bg-white/5 border-white/10 text-gray-400"
                          )}>
                            {asset.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{asset.type}</p>
                          <h4 className="text-xl font-bold text-white group-hover:text-[var(--color-supreme-gold)] transition-colors">{asset.name}</h4>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Valuation</span>
                            <span className="text-lg font-display font-black text-white">${asset.price.toLocaleString()}</span>
                          </div>
                          
                          {isOwned ? (
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-500">
                              <Star className="w-4 h-4 fill-emerald-500" />
                              <span className="text-[10px] font-black uppercase">Owned</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => buyAsset(asset)}
                              className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--color-supreme-gold)] transition-all"
                            >
                              Acquire
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
               key="history-tab"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="py-20 text-center"
            >
              <History className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Transaction Ledger</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">History of Noble Spins and Asset Acquisitions will be synchronized with your global ledger.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-8 h-8 rounded-full border-2 border-[#111]" alt="User" />
             ))}
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span className="text-white">12,842</span> Nobles active in the arena
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <Bitcoin className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold text-gray-300">Crypto Backed</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-300">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransfer && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#151515] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowTransfer(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8 space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-display font-black text-white">Noble Transfer</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Move Capital Between Wallets</p>
                </div>

                {/* Mode Selector */}
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => setTransferType('deposit')}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      transferType === 'deposit' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                  >
                    Deposit Capital
                  </button>
                  <button 
                    onClick={() => setTransferType('withdraw')}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      transferType === 'withdraw' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                  >
                    Withdraw to Central
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Central Balance</p>
                      <p className="text-base font-display font-black text-white">${balance.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Noble Balance</p>
                      <p className="text-base font-display font-black text-white">${betWalletBalance.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount to {transferType}</label>
                      <span className="text-[9px] font-bold text-gray-600">$1k - $1M Limit</span>
                    </div>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-supreme-gold)] font-bold">$</span>
                       <input 
                         type="number"
                         value={transferAmount}
                         onChange={(e) => setTransferAmount(Number(e.target.value))}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white font-display font-bold focus:outline-none focus:border-[var(--color-supreme-gold)]/50"
                       />
                    </div>
                    <div className="flex gap-2">
                       {[1000, 10000, 100000, 1000000].map(val => (
                         <button 
                           key={val}
                           onClick={() => setTransferAmount(val)}
                           className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black hover:bg-white/10 transition-colors"
                         >
                           ${val >= 1000000 ? '1M' : val/1000 + 'k'}
                         </button>
                       ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleTransfer}
                    disabled={isProcessingTransfer}
                    className="w-full py-5 bg-[var(--color-supreme-gold)] text-black font-display font-black uppercase tracking-tighter text-lg rounded-[1.5rem] shadow-2xl shadow-[var(--color-supreme-gold)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessingTransfer ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm {transferType === 'deposit' ? 'Inflow' : 'Return'}
                        <ArrowUpRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5">
                   <div className="flex items-center justify-center gap-2 text-gray-600">
                     <Lock className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em]">Institutional Grade Transfer Protocols</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bitcoin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11.75 8a2.5 2.5 0 1 0-2.5 2.5" />
      <path d="M11.75 18a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M8.5 8H13a3 3 0 0 1 0 6H8.5" />
      <path d="M8.5 14h5a3 3 0 0 1 0 6H8.5" />
      <path d="M9 14h5" />
      <path d="M11 22v-2" />
      <path d="M11 6V4" />
      <path d="M14 22v-2" />
      <path d="M14 6V4" />
    </svg>
  );
}
