import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Sparkles, 
  Wallet, 
  ArrowRightLeft, 
  X, 
  Coins, 
  Trophy, 
  Crown, 
  Gem, 
  Shield, 
  ShieldCheck,
  Gift,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useSound } from '../context/SoundContext';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const MIN_TRANSFER = 1000;
const MAX_TRANSFER = 100000;
const MIN_BET = 10;
const MAX_BET = 100;

interface Reward {
  id: string;
  label: string;
  multiplier: number;
  color: string;
  icon: any;
}

const REWARDS: Reward[] = [
  { id: 'bronze', label: 'Bronze', multiplier: 1.2, color: 'text-orange-700', icon: Shield },
  { id: 'silver', label: 'Silver', multiplier: 1.5, color: 'text-slate-300', icon: ShieldCheck },
  { id: 'diamond', label: 'Diamond', multiplier: 1.1, color: 'text-cyan-400', icon: Gem },
  { id: 'gold', label: 'Gold', multiplier: 1.15, color: 'text-yellow-500', icon: Trophy },
  { id: 'clowned', label: 'Clowned', multiplier: 1.2, color: 'text-purple-500', icon: Sparkles },
  { id: 'king', label: 'King', multiplier: 1.5, color: 'text-red-500', icon: Crown },
];

export default function SupremeMysteriousBox() {
  const { boxWalletBalance, updateBoxWalletBalance, depositToBoxWallet, transferFromBoxWallet, balance } = useWallet();
  const { playSound } = useSound();

  const [betAmount, setBetAmount] = useState<number>(10);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealedRewards, setRevealedRewards] = useState<(Reward | null)[]>([]);
  const [gameState, setGameState] = useState<'ready' | 'opened' | 'resetting'>('ready');
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState<number>(MIN_TRANSFER);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  const handleTransfer = async () => {
    setIsProcessingTransfer(true);
    try {
      if (transferType === 'deposit') {
        await depositToBoxWallet(transferAmount);
      } else {
        await transferFromBoxWallet(transferAmount);
      }
      setShowTransfer(false);
      playSound('success');
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  const handleBoxClick = async (index: number) => {
    if (gameState !== 'ready' || isOpening) return;

    if (boxWalletBalance < betAmount) {
      toast.error("Insufficient Box Wallet balance!");
      setShowTransfer(true);
      playSound('notification');
      return;
    }

    setIsOpening(true);
    setSelectedBox(index);
    updateBoxWalletBalance(-betAmount, `Mysterious Box Opening: $${betAmount}`, 'bet-draw');

    // Create a new set of box contents
    // Only one box has a reward, others are null
    const winningIndex = Math.floor(Math.random() * 6);
    const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    
    const newContents = new Array(6).fill(null);
    newContents[winningIndex] = randomReward;

    setTimeout(() => {
      setRevealedRewards(newContents);
      setGameState('opened');
      setIsOpening(false);

      if (index === winningIndex) {
        handleWin(randomReward);
      } else {
        handleLoss();
      }
    }, 1500);
  };

  const handleWin = (reward: Reward) => {
    const winAmount = betAmount * reward.multiplier;
    updateBoxWalletBalance(winAmount, `Mysterious Box Win: ${reward.label} ($${winAmount.toFixed(2)})`, 'bet-payout');
    playSound('celebration');
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF1493', '#FFFFFF']
    });

    toast.success(`CONGRATULATIONS! You found the ${reward.label} reward. Win: $${winAmount.toFixed(2)}`);
  };

  const handleLoss = () => {
    playSound('error');
    
    // Bubbles on loss as requested
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#333333', '#111111', '#550000'],
      gravity: 1.5,
      ticks: 100
    });

    toast.error("SYSTEM RECLAIMED: Empty Box detected. Loss to Supreme Noble Arena.");
  };

  const resetGame = () => {
    setGameState('resetting');
    setTimeout(() => {
      setSelectedBox(null);
      setRevealedRewards([]);
      setGameState('ready');
    }, 500);
  };

  return (
    <div className="bg-[#0a0508] bg-gradient-to-br from-[#0a0508] via-[#110810] to-[#050002] min-h-[600px] rounded-[3rem] border border-fuchsia-500/10 overflow-hidden flex flex-col relative shadow-2xl">
      {/* Mystical Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-4">
          <div className="p-2 md:p-3 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
            <Gift className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-display font-black text-white tracking-tight uppercase">Supreme <span className="text-fuchsia-500">Mysterious</span> Box</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Earn Powerfully • One Win per Cycle</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Box Wallet</p>
            <p className="font-display font-black text-2xl text-[var(--color-supreme-gold)] shadow-gold tabular-nums">
              ${boxWalletBalance.toLocaleString()}
            </p>
          </div>
          <button 
            onClick={() => setShowTransfer(true)}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Game Arena */}
      <div className="flex-1 p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center gap-8 md:gap-12 relative overflow-hidden">
        
        {gameState === 'opened' && (
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetGame}
            className="absolute top-4 md:top-8 px-6 md:px-8 py-2 md:py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all z-20"
          >
            Reset Game Cycle
          </motion.button>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-5xl relative z-10">
          {[...Array(6)].map((_, i) => {
            const isRevealed = revealedRewards.length > 0;
            const reward = revealedRewards[i];
            const isSelected = selectedBox === i;
            const Icon = reward?.icon || Package;

            return (
              <motion.div
                key={i}
                whileHover={gameState === 'ready' ? { scale: 1.05 } : {}}
                whileTap={gameState === 'ready' ? { scale: 0.95 } : {}}
                onClick={() => handleBoxClick(i)}
                className={clsx(
                  "aspect-[4/5] rounded-2xl md:rounded-[2.5rem] relative transition-all duration-700 cursor-pointer overflow-hidden border-2 group",
                  gameState === 'ready' 
                    ? "bg-gradient-to-br from-amber-900/40 to-black border-amber-500/30 hover:border-amber-400 shadow-[0_0_30px_rgba(217,119,6,0.1)] hover:shadow-[0_0_40px_rgba(217,119,6,0.2)]" 
                    : isRevealed 
                      ? isSelected 
                        ? reward 
                          ? "bg-fuchsia-500/10 border-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.3)]" 
                          : "bg-red-500/5 border-red-500/20 grayscale opacity-40"
                        : reward 
                          ? "bg-amber-500/10 border-amber-500/50 scale-95 opacity-80" 
                          : "bg-black/20 border-white/5 scale-90 opacity-20"
                      : "bg-black/40 border-white/5"
                )}
              >
                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                
                {/* Visual Feedback for Box Content */}
                <div className="flex flex-col items-center justify-center h-full gap-4 relative z-10 p-4 md:p-6">
                   <AnimatePresence mode="wait">
                      {isRevealed ? (
                        <motion.div 
                          key="revealed"
                          initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                          className="flex flex-col items-center gap-2 md:gap-4"
                        >
                          {reward ? (
                            <>
                              <div className={clsx("p-4 md:p-6 rounded-full bg-white/5 shadow-2xl", reward.color)}>
                                <Icon className="w-8 h-8 md:w-12 md:h-12" />
                              </div>
                              <div className="text-center">
                                <span className={clsx("text-[10px] md:text-sm font-black uppercase tracking-widest block", reward.color)}>
                                  {reward.label}
                                </span>
                                <span className="text-lg md:text-xl font-display font-black text-white">x{reward.multiplier}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-700 flex flex-col items-center gap-2">
                               <X className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Empty</span>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="mystery"
                          animate={isOpening && isSelected ? { 
                            rotate: [0, -5, 5, -5, 5, 0],
                            scale: [1, 1.1, 1]
                          } : {}}
                          transition={{ duration: 0.5, repeat: isOpening && isSelected ? Infinity : 0 }}
                          className="flex flex-col items-center gap-2 md:gap-4"
                        >
                          <div className={clsx(
                             "p-4 md:p-8 rounded-full transition-all duration-500 relative",
                             isOpening && isSelected ? "bg-amber-500/30 text-amber-300" : "bg-gradient-to-tr from-amber-600/20 via-yellow-500/10 to-amber-400/20 text-amber-500 group-hover:scale-110 shadow-[inset_0_0_20px_rgba(217,119,6,0.2)]"
                          )}>
                             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-transparent blur-sm" />
                             <Package className="w-10 h-10 md:w-16 md:h-16 relative z-10 drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-1">Select</span>
                            <span className="text-[12px] font-display font-black text-white px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">Box {i + 1}</span>
                          </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                {/* Shimmer Effect */}
                {gameState === 'ready' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Interaction Panel */}
        <div className="w-full max-w-sm bg-black/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative z-20">
           <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Selection Stake</span>
              <span className="text-[10px] font-black text-fuchsia-500">$10 - $100</span>
           </div>

           <div className="flex items-center gap-6 mb-8">
              <button 
                onClick={() => setBetAmount(prev => Math.max(MIN_BET, prev - 10))}
                disabled={gameState !== 'ready'}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-30"
              >
                -
              </button>
              <div className="flex-1 text-center bg-black/60 py-4 rounded-2xl border border-white/5">
                 <span className="text-3xl font-display font-black text-white tabular-nums">${betAmount}</span>
              </div>
              <button 
                onClick={() => setBetAmount(prev => Math.min(MAX_BET, prev + 10))}
                disabled={gameState !== 'ready'}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-30"
              >
                +
              </button>
           </div>

           <div className="flex flex-wrap gap-2 mb-8">
              {[10, 25, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => setBetAmount(val)}
                  disabled={gameState !== 'ready'}
                  className={clsx(
                    "flex-1 py-3 rounded-xl border text-[10px] font-black tracking-widest transition-all",
                    betAmount === val 
                      ? "bg-fuchsia-500 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]" 
                      : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                  )}
                >
                  ${val}
                </button>
              ))}
           </div>

           <div className="flex flex-col items-center gap-2">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Select any box above to play</p>
           </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessingTransfer && setShowTransfer(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0d070b] border border-fuchsia-500/20 rounded-[3rem] p-8 overflow-hidden shadow-[0_0_50px_rgba(217,70,239,0.1)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
              
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-display font-black text-white">Box Wallet Transfer</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Capital Liquidity Stream</p>
                </div>
                <button onClick={() => setShowTransfer(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500">
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
                  Inbound
                </button>
                <button 
                  onClick={() => setTransferType('withdraw')}
                  className={clsx(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    transferType === 'withdraw' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  Outbound
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center mb-4 text-[10px] font-black tracking-widest uppercase text-gray-500">
                    <span>{transferType === 'deposit' ? 'Central' : 'Box'} Wallet Balance</span>
                  </div>
                  <div className="text-2xl font-display font-black text-white">
                    ${(transferType === 'deposit' ? balance : boxWalletBalance).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Transfer Amount</span>
                    <span className="text-[10px] font-black text-fuchsia-500">$1,000 - $100,000</span>
                  </div>
                  <input 
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-2xl font-display font-black text-white">${transferAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleTransfer}
                  disabled={isProcessingTransfer || (transferType === 'deposit' ? balance < transferAmount : boxWalletBalance < transferAmount)}
                  className="w-full py-5 rounded-2xl bg-fuchsia-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-fuchsia-500 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-fuchsia-500/20"
                >
                  {isProcessingTransfer ? 'Authorizing Transact...' : 'Initiate Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
