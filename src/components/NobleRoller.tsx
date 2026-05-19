import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Coins, 
  Trophy, 
  History, 
  Gamepad2, 
  Sparkles, 
  Lock,
  Wallet,
  Gem,
  ShieldCheck,
  ArrowRightLeft,
  X,
  Plus,
  Palette,
  Layout,
  Shield,
  Star,
  Users,
  CircleDollarSign
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Limits for Noble Roller wallet transfers
const MIN_TRANSFER = 1000;
const MAX_TRANSFER = 1_000_000;

interface RollerSymbol {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: any;
}

const ROLLER_SYMBOLS: RollerSymbol[] = [
  { id: 'bronze', label: 'Bronze', value: 1.5, color: 'text-amber-900/80', icon: Shield },
  { id: 'silver', label: 'Silver', value: 2, color: 'text-amber-200/90', icon: ShieldCheck },
  { id: 'diamond', label: 'Diamond', value: 3, color: 'text-yellow-400', icon: Gem },
  { id: 'gold', label: 'Gold', value: 5, color: 'text-yellow-500', icon: Trophy },
  { id: 'crowned', label: 'Crowned', value: 10, color: 'text-amber-500', icon: Crown },
  { id: 'king', label: 'King', value: 17, color: 'text-amber-600', icon: CircleDollarSign },
];

export default function NobleRoller() {
  const { betWalletBalance, updateBetWalletBalance, depositToBetWallet, transferFromBetWallet, balance } = useWallet();
  const { playSound } = useSound();
  
  const [betAmount, setBetAmount] = useState<number>(1000);
  const [isRolling, setIsRolling] = useState(false);
  const [reels, setReels] = useState<number[]>([0, 1, 2, 3]);
  const [lastWin, setLastWin] = useState<{ amount: number; label: string } | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState<number>(MIN_TRANSFER);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  
  const [telemetry, setTelemetry] = useState({
    status: 'READY',
    timeRemaining: 0,
    scanIntensity: 0,
    predictedMatch: 'NULL'
  });

  const analyzerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const targetSymbolsRef = useRef<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (isRolling) {
      startTimeRef.current = Date.now();
      const updateTelemetry = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, 59 - elapsed);
        const intensity = Math.min(100, (elapsed / 59) * 100);

        setTelemetry({
          status: remaining > 20 ? 'TRAJECTORY SCANNING' : remaining > 5 ? 'STABILIZING REELS' : 'FINALIZING ALIGNMENT',
          timeRemaining: Number(remaining.toFixed(3)),
          scanIntensity: Number(intensity.toFixed(1)),
          predictedMatch: remaining < 30 ? (targetSymbolsRef.current.every(s => s === targetSymbolsRef.current[0]) ? ROLLER_SYMBOLS[targetSymbolsRef.current[0]].label : 'DIVERGENT') : 'CALCULATING'
        });

        if (remaining > 0) {
          analyzerRef.current = requestAnimationFrame(updateTelemetry);
        }
      };
      analyzerRef.current = requestAnimationFrame(updateTelemetry);
    } else {
      if (analyzerRef.current) cancelAnimationFrame(analyzerRef.current);
      setTelemetry(prev => ({ ...prev, status: 'STANDBY', timeRemaining: 0, scanIntensity: 0 }));
    }
    return () => {
      if (analyzerRef.current) cancelAnimationFrame(analyzerRef.current);
    };
  }, [isRolling]);

  // Rolling Animation Refs
  const rollingIntervals = useRef<(number | null)[]>([null, null, null, null]);

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

  const startRoll = () => {
    if (isRolling) return;
    
    const totalLiquidity = betWalletBalance + balance;
    if (totalLiquidity < betAmount) {
      toast.error(`Strict Betting Violation: Your total liquidity ($${totalLiquidity.toLocaleString()}) is below the required $${betAmount.toLocaleString()} bet.`);
      playSound('error');
      return;
    }

    if (betWalletBalance < betAmount) {
      toast.error(`Insufficient Noble Wallet balance! Please transfer funds from your Central Wallet.`);
      setShowTransfer(true);
      playSound('notification');
      return;
    }

    setIsRolling(true);
    setLastWin(null);
    updateBetWalletBalance(-betAmount, `Noble Roller Bet: $${betAmount}`, 'bet-draw');
    playSound('achievement');

    // Predetermine results
    const results = [
      Math.floor(Math.random() * ROLLER_SYMBOLS.length),
      Math.floor(Math.random() * ROLLER_SYMBOLS.length),
      Math.floor(Math.random() * ROLLER_SYMBOLS.length),
      Math.floor(Math.random() * ROLLER_SYMBOLS.length),
    ];
    targetSymbolsRef.current = results;

    // Start rolling animations
    reels.forEach((_, i) => {
      rollingIntervals.current[i] = window.setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          next[i] = Math.floor(Math.random() * ROLLER_SYMBOLS.length);
          return next;
        });
      }, 80 + (i * 30));
    });

    const isWin = results.every(val => val === results[0]);
    const winSymbol = isWin ? ROLLER_SYMBOLS[results[0]] : null;

    // Sequential stop mapping for 59s duration
    const stopTimes = [50000, 53000, 56000, 59000];

    reels.forEach((_, i) => {
      setTimeout(() => {
        if (rollingIntervals.current[i]) {
          clearInterval(rollingIntervals.current[i]!);
          rollingIntervals.current[i] = null;
        }
        setReels(prev => {
          const next = [...prev];
          next[i] = results[i];
          return next;
        });
        playSound('notification');
        
        if (i === 3) {
          setTimeout(() => {
            setIsRolling(false);
            if (winSymbol) {
              handleWin(winSymbol);
            } else {
              handleLoss();
            }
          }, 800);
        }
      }, stopTimes[i]);
    });
  };

  const handleWin = (symbol: RollerSymbol) => {
    const winAmount = betAmount * symbol.value;
    updateBetWalletBalance(winAmount, `Noble Roller Win: ${symbol.label} ($${winAmount.toLocaleString()})`, 'bet-payout');
    setLastWin({ amount: winAmount, label: symbol.label });
    playSound('celebration');
    
    // Confetti
    const end = Date.now() + 3 * 1000;
    const colors = ['#ffd700', '#ffffff', '#ff1493'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    toast.success(`CONGRATULATIONS! 4X ${symbol.label} MATCH! Payout: $${winAmount.toLocaleString()}`);
  };

  const handleLoss = () => {
    playSound('error');
    // Loss "Red Bubbles" Effect
    const lossBubble = confetti.shapeFromText({ text: '🔴', scalar: 2 });
    confetti({
      shapes: [lossBubble],
      particleCount: 15,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#8b0000'],
      gravity: 1.2,
      ticks: 200
    });
    toast.error("NO MATCH: All 4 must be identical. Loss to Supreme.");
  };

  return (
    <div className="bg-[#1a000e] bg-gradient-to-br from-[#1a000e] via-[#0a0a0a] to-[#050002] min-h-[600px] rounded-[3rem] border border-pink-500/10 overflow-hidden flex flex-col relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 blur-[120px] rounded-full pointer-events-none bg-pink-500/5" />

      {/* Header */}
      <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 md:p-3 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-lg">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-display font-black text-white tracking-tight">Supreme <span className="text-pink-500">Roller</span></h2>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Quad-Match Digital Lottery</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Noble Wallet</p>
            <p className="text-2xl font-display font-black text-[var(--color-supreme-gold)]">
              ${betWalletBalance.toLocaleString()}
            </p>
          </div>
          <button 
            onClick={() => setShowTransfer(true)}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Roller Arena */}
      <div className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 relative overflow-hidden">
        {/* Digital Telemetry Panel */}
        <div className="w-full lg:w-72 flex flex-col gap-4 relative z-20 order-2 lg:order-1">
          <div className="bg-black/60 border border-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-xl relative overflow-hidden font-mono">
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Roller Analysis</span>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  isRolling ? "bg-pink-500 animate-pulse shadow-[0_0_10px_#ec4899]" : "bg-green-500"
                )} />
              </div>

              <div className="space-y-1">
                <div className="text-[8px] text-gray-600 uppercase">Synchronized Time</div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                  {telemetry.timeRemaining.toFixed(3)}s
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="space-y-1">
                  <div className="text-[8px] text-gray-600 uppercase">Intensity</div>
                  <div className="text-sm font-bold text-pink-500">{telemetry.scanIntensity}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] text-gray-600 uppercase">Prediction</div>
                  <div className="text-sm font-bold text-white truncate">{telemetry.predictedMatch}</div>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="text-[8px] text-gray-600 uppercase">Trajectory Status</div>
                <div className="text-[10px] font-black text-white/90 animate-pulse uppercase">
                  {telemetry.status}
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899]"
                    initial={{ width: "0%" }}
                    animate={{ width: isRolling ? "100%" : "0%" }}
                    transition={{ duration: 59, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
             <div className="p-2 bg-pink-500/10 rounded-xl">
               <History className="w-4 h-4 text-pink-500" />
             </div>
             <div>
               <div className="text-[8px] text-gray-500 uppercase font-black">Reel Encryption</div>
               <div className="text-[10px] text-white font-bold uppercase">Supreme Secured</div>
             </div>
          </div>
        </div>

        {/* The 4 Reels */}
        <div className="flex-1 flex flex-col items-center gap-6 md:gap-12 relative z-10 w-full max-w-2xl order-1 lg:order-2">
          <div className="grid grid-cols-4 gap-2 md:gap-6 w-full">
            {reels.map((symbolIndex, i) => {
              const symbol = ROLLER_SYMBOLS[symbolIndex];
              const Icon = symbol.icon;
              return (
                <motion.div 
                  key={i}
                  animate={isRolling && rollingIntervals.current[i] !== null ? { 
                    y: [0, -10, 0],
                  } : {}}
                  transition={{ duration: 0.05, repeat: Infinity }}
                  className={clsx(
                    "aspect-square rounded-2xl md:rounded-[2rem] bg-black/60 border-2 flex flex-col items-center justify-center gap-2 md:gap-3 backdrop-blur-3xl relative overflow-hidden transition-all duration-500",
                    isRolling ? "border-white/10" : "border-pink-500/30"
                  )}
                >
                  <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                  
                  <motion.div 
                    animate={isRolling ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.1, repeat: Infinity }}
                    className={clsx("w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20 transition-all duration-300", symbol.color)}
                  >
                    <Icon className="w-full h-full drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
                  </motion.div>
                  
                  {isRolling && rollingIntervals.current[i] && (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10 animate-pulse" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Controls Panel */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Left: Global Bet Display */}
             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Coins className="w-4 h-4 text-pink-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Capital Active</span>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl md:text-5xl font-display font-black text-white tabular-nums tracking-tighter">
                     ${betAmount.toLocaleString()}
                   </span>
                   <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Chips</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden p-[1px]">
                   <motion.div 
                     className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899] rounded-full"
                     initial={{ width: "0%" }}
                     animate={{ width: `${(betAmount / 1000000) * 100}%` }}
                   />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {[1000, 10000, 50000, 100000, 500000, 1000000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setBetAmount(val)}
                      disabled={isRolling}
                      className={clsx(
                        "flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all border",
                        betAmount === val 
                          ? "bg-pink-500/20 border-pink-500 text-white" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                      )}
                    >
                      {val >= 1000000 ? '1M' : `${val/1000}K`}
                    </button>
                  ))}
                </div>
             </div>

             {/* Right: Interaction */}
             <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Manual Precision</span>
                    <span className="text-[10px] font-black text-gray-600">$1k - $1M</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-pink-500">$</div>
                    <input 
                      type="number" 
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1000, Math.min(1000000, Number(e.target.value))))}
                      disabled={isRolling}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white font-display font-bold focus:outline-none focus:border-pink-500/50 transition-all text-xl"
                    />
                  </div>
                </div>

                <button 
                  onClick={startRoll}
                  disabled={isRolling || betAmount > betWalletBalance}
                  className={clsx(
                    "w-full py-6 rounded-[2rem] font-display font-black text-xl uppercase tracking-tighter transition-all relative overflow-hidden group active:scale-[0.98]",
                    isRolling || betWalletBalance < betAmount 
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5" 
                      : "bg-pink-500 text-white shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:scale-[1.02]"
                  )}
                >
                  {isRolling ? (
                    <span className="flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6 animate-spin" />
                      Rolling Trajectory...
                    </span>
                  ) : "Initiate Noble Roll"}
                  
                  {!isRolling && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal (Shared Logic) */}
      <AnimatePresence>
        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessingTransfer && setShowTransfer(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[3rem] p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
              
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-black text-white">Noble Transfer</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Capital Management Interface</p>
                </div>
                <button 
                  onClick={() => setShowTransfer(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                <button 
                  onClick={() => setTransferType('deposit')}
                  className={clsx(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    transferType === 'deposit' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Deposit
                </button>
                <button 
                  onClick={() => setTransferType('withdraw')}
                  className={clsx(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    transferType === 'withdraw' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Withdraw
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                    <span>Source</span>
                    <span>Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{transferType === 'deposit' ? 'Central Wallet' : 'Noble Wallet'}</span>
                    <span className="text-white font-black">${(transferType === 'deposit' ? balance : betWalletBalance).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Min $1k | Max $1M</span>
                  </div>
                  <input 
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xl font-display font-black text-white focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                <button 
                  onClick={handleTransfer}
                  disabled={isProcessingTransfer}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-pink-500 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isProcessingTransfer ? 'Authorizing...' : 'Authorize Transaction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
