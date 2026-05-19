import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  CreditCard, Wallet, ArrowRightLeft, BarChart2, 
  Clock, Settings, ChevronDown, ShieldCheck,
  Trophy, AlertCircle, History, Zap, Cpu,
  RefreshCcw, Users, UserPlus, Star, BookOpen, Info,
  Plus, Check
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer, YAxis, 
  XAxis, Tooltip, AreaChart, Area, CartesianGrid, Cell, Bar,
  ReferenceArea, ReferenceLine
} from 'recharts';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useSound } from '../context/SoundContext';
import { useAdmin } from '../context/AdminContext';
import { useWallet } from '../context/WalletContext';

interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  time: Date;
  status: 'open' | 'closed';
  takeProfit?: number;
  isPaused?: boolean;
  duration?: number;
  remainingTime?: number;
  isBotTrade?: boolean;
  mode: 'demo' | 'live';
}

interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

const FOREX_PAIRS = [
  { id: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0854, change: '+0.12%' },
  { id: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2632, change: '-0.05%' },
  { id: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 150.45, change: '+0.25%' },
  { id: 'XAU/USD', name: 'Gold / US Dollar', price: 2155.80, change: '+0.45%' },
  { id: 'XAG/USD', name: 'Silver / US Dollar', price: 24.32, change: '+1.12%' },
  { id: 'BTC/USD', name: 'Bitcoin / US Dollar', price: 68420.00, change: '+2.45%' },
  { id: 'ETH/USD', name: 'Ethereum / US Dollar', price: 3845.50, change: '+1.85%' },
  { id: 'OIL', name: 'Crude Oil', price: 82.45, change: '-0.65%' },
  { id: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6543, change: '-0.15%' },
  { id: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.3521, change: '+0.08%' },
];

const MASTER_TRADERS = [
  { id: '1', name: 'Alex "The Bull" Rivera', winRate: '89%', profit: '+$12,450', followers: 1240, avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: '2', name: 'Sarah Jenkins', winRate: '92%', profit: '+$28,100', followers: 3500, avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '3', name: 'Marco Silva', winRate: '85%', profit: '+$8,900', followers: 890, avatar: 'https://i.pravatar.cc/150?u=marco' },
];

interface GMTForexOptimumProps {
  onShowSubscriptions?: () => void;
  onShowTransfer?: () => void;
}

export default function GMTForexOptimum({ onShowSubscriptions, onShowTransfer }: GMTForexOptimumProps) {
  const { playSound } = useSound();
  const { settings } = useAdmin();
  const { 
    forexWalletBalance, 
    forexProfitBalance, 
    depositToForexWallet, 
    transferProfitFromForex, 
    updateForexBalances,
    balance: centralBalance
  } = useWallet();
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [demoBalance, setDemoBalance] = useState(() => {
    const saved = localStorage.getItem('gmt_forex_demo_balance');
    return saved ? parseFloat(saved) : 10000;
  });

  useEffect(() => {
    localStorage.setItem('gmt_forex_demo_balance', demoBalance.toString());
  }, [demoBalance]);
  const [selectedPair, setSelectedPair] = useState(FOREX_PAIRS[0]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [tradeDuration, setTradeDuration] = useState('15m');
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('gmt_forex_trades');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({ ...t, time: new Date(t.time) }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('gmt_forex_trades', JSON.stringify(trades));
  }, [trades]);
  const [demoProfit, setDemoProfit] = useState(() => {
    const saved = localStorage.getItem('gmt_forex_demo_profit');
    return saved ? parseFloat(saved) : 0;
  });
  const [demoLoss, setDemoLoss] = useState(() => {
    const saved = localStorage.getItem('gmt_forex_demo_loss');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('gmt_forex_demo_profit', demoProfit.toString());
    localStorage.setItem('gmt_forex_demo_loss', demoLoss.toString());
  }, [demoProfit, demoLoss]);
  const [activeTraders, setActiveTraders] = useState(15420);
  const [showCopyTrading, setShowCopyTrading] = useState(false);
  const [bottomTab, setBottomTab] = useState<'market' | 'copy' | 'analysis' | 'guide'>('market');
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [depositMethod, setDepositMethod] = useState<'wallet' | 'card' | 'crypto'>('wallet');
  const [chartData, setChartData] = useState<{time: string, price: number, ma: number}[]>([]);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [globalCountdown, setGlobalCountdown] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell'>('Neutral');
  const [botLog, setBotLog] = useState<{ id: string, msg: string, time: string, type: 'info' | 'success' | 'warning' }[]>([]);

  const currentBalance = mode === 'demo' ? demoBalance : forexWalletBalance;

  // AI Robot Logic
  useEffect(() => {
    if (!isBotEnabled) return;

    const botInterval = setInterval(() => {
      // Periodic scanning log
      const scanTypes: ('info' | 'warning')[] = ['info', 'warning', 'info'];
      const scanType = scanTypes[Math.floor(Math.random() * scanTypes.length)];
      
      setBotLog(prev => [
        { 
          id: Math.random().toString(), 
          msg: scanType === 'info' ? `AI Scanning ${selectedPair.id} for micro-patterns...` : `Neural Network: High volatility detected on ${selectedPair.id}`, 
          time: new Date().toLocaleTimeString(), 
          type: scanType 
        },
        ...prev.slice(0, 15)
      ]);

      // Execution logic
      if (analysis === 'Strong Buy' || analysis === 'Strong Sell') {
        const type = analysis === 'Strong Buy' ? 'buy' : 'sell';
        
        // Check if we already have an open bot trade for this pair
        const hasOpenBotTrade = trades.some(t => t.pair === selectedPair.id && t.status === 'open' && t.isBotTrade);
        
        if (!hasOpenBotTrade) {
          const amount = 50 + (Math.random() * 150); // Bot uses between $50 and $200
          
          if (amount <= currentBalance) {
            setBotLog(prev => [
              { 
                id: Math.random().toString(), 
                msg: `AI Protocol: Executing ${type.toUpperCase()} position for $${amount.toFixed(2)}`, 
                time: new Date().toLocaleTimeString(), 
                type: 'success' 
              },
              ...prev.slice(0, 15)
            ]);

            handleTrade(type, { amount, isBot: true }); 
          } else {
            setBotLog(prev => [
              { 
                id: Math.random().toString(), 
                msg: `AI Halt: Insufficient balance for protocol on ${selectedPair.id}`, 
                time: new Date().toLocaleTimeString(), 
                type: 'warning' 
              },
              ...prev.slice(0, 15)
            ]);
          }
        }
      }
    }, 8000); // Check every 8s

    return () => clearInterval(botInterval);
  }, [isBotEnabled, analysis, selectedPair.id, trades, currentBalance]);

  // Simulate active traders fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTraders(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Global Countdown Logic
  useEffect(() => {
    if (globalCountdown === null) return;
    if (globalCountdown <= 0) {
      setGlobalCountdown(null);
      return;
    }
    const timer = setInterval(() => {
      setGlobalCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [globalCountdown]);

  // Initialize chart data
  useEffect(() => {
    const initialPrice = selectedPair.price;
    const initialData = Array.from({ length: 40 }, (_, i) => {
      const price = initialPrice + (Math.random() * (initialPrice * 0.002) - (initialPrice * 0.001));
      return {
        time: new Date(Date.now() - (40 - i) * 2000).toLocaleTimeString(),
        price,
        ma: price // placeholder
      };
    });
    
    // Calculate simple moving average
    for (let i = 5; i < initialData.length; i++) {
      const subset = initialData.slice(i - 5, i);
      const avg = subset.reduce((sum, item) => sum + item.price, 0) / 5;
      initialData[i].ma = avg;
    }
    
    setChartData(initialData);

    const initialCandles = Array.from({ length: 20 }, (_, i) => {
      const base = initialPrice + (Math.random() * (initialPrice * 0.002) - (initialPrice * 0.001));
      const open = base + (Math.random() * (initialPrice * 0.001) - (initialPrice * 0.0005));
      const close = base + (Math.random() * (initialPrice * 0.001) - (initialPrice * 0.0005));
      return {
        time: new Date(Date.now() - (20 - i) * 5000).toLocaleTimeString(),
        open,
        close,
        high: Math.max(open, close) + (initialPrice * 0.0005),
        low: Math.min(open, close) - (initialPrice * 0.0005),
      };
    });
    setCandleData(initialCandles);
  }, [selectedPair.id]);

  // Simulate price updates and trade logic
  useEffect(() => {
    const interval = setInterval(() => {
      const volatility = 0.0005;
      const change = 1 + (Math.random() * volatility * 2 - volatility);
      const newGlobalPrice = selectedPair.price * (1 + (Math.random() * 0.001 - 0.0005)); // Use a local variation for simulation
      
      // Update chart data
      setChartData(prev => {
        const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : selectedPair.price;
        const simulatedPrice = lastPrice * change;
        
        const nextItem = {
          time: new Date().toLocaleTimeString(),
          price: simulatedPrice,
          ma: simulatedPrice // temp
        };
        
        const newData = [...prev.slice(1), nextItem];
        
        // Calculate Moving Average
        const maPeriod = 7;
        const subset = newData.slice(newData.length - maPeriod);
        const ma = subset.reduce((sum, item) => sum + item.price, 0) / subset.length;
        newData[newData.length - 1].ma = ma;

        // Perform Trading Analysis
        const last = newData[newData.length - 1];
        const prevItem = newData[newData.length - 2];
        if (last.price > (ma * 1.0002) && last.price > prevItem.price) setAnalysis('Strong Buy');
        else if (last.price < (ma * 0.9998) && last.price < prevItem.price) setAnalysis('Strong Sell');
        else if (last.price > ma) setAnalysis('Buy');
        else if (last.price < ma) setAnalysis('Sell');
        else setAnalysis('Neutral');
        
        return newData;
      });

      const currentSimulatedPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : selectedPair.price;
      const newClose = currentSimulatedPrice;

      // Update candle data
      setCandleData(prev => {
        const lastCandle = prev[prev.length - 1];
        const newHigh = Math.max(lastCandle.high, newClose);
        const newLow = Math.min(lastCandle.low, newClose);
        
        // Every 10 seconds, start a new candle
        if (Date.now() % 10000 < 2000) {
          return [...prev.slice(1), {
            time: new Date().toLocaleTimeString(),
            open: lastCandle.close,
            close: newClose,
            high: Math.max(lastCandle.close, newClose) + 0.0002,
            low: Math.min(lastCandle.close, newClose) - 0.0002,
          }];
        }
        
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...lastCandle,
          close: newClose,
          high: newHigh,
          low: newLow
        };
        return updated;
      });

      setTrades(prev => prev.map(trade => {
        if (trade.status === 'closed') return trade;
        
        // Handle remaining time
        let newRemainingTime = trade.remainingTime;
        if (newRemainingTime !== undefined && !trade.isPaused) {
          newRemainingTime -= 2; // interval is 2s
          if (newRemainingTime <= 0) {
            // Auto close on time expiry
            return { ...trade, status: 'closed', remainingTime: 0 };
          }
        }

        if (trade.isPaused) return { ...trade, remainingTime: newRemainingTime };

        const isLive = trade.mode === 'live';
        const volatility = 0.0005;
        let change;
        
        if (isLive) {
          // Supreme Forex Difficulty Enhancement (55% bias against user)
          const random = Math.random();
          const moveAgainst = random < 0.55;
          
          if (trade.type === 'buy') {
            // To be "harder", price is more likely to go down for a BUY
            change = moveAgainst 
              ? 1 - (Math.random() * volatility) 
              : 1 + (Math.random() * volatility);
          } else {
            // To be "harder", price is more likely to go up for a SELL
            change = moveAgainst 
              ? 1 + (Math.random() * volatility) 
              : 1 - (Math.random() * volatility);
          }
        } else {
          change = 1 + (Math.random() * volatility * 2 - volatility);
        }
        
        const newPrice = trade.currentPrice * change;
        
        const isProfit = trade.type === 'buy' ? newPrice > trade.entryPrice : newPrice < trade.entryPrice;
        
        // Fixed Time Trade (Binary Options) style PnL
        const pnl = isProfit ? trade.amount * 0.82 : -trade.amount;

        // Auto close on Take Profit (still supported if user set it)
        if (trade.takeProfit) {
          const hitTP = trade.type === 'buy' ? newPrice >= trade.takeProfit : newPrice <= trade.takeProfit;
          if (hitTP) {
            return { ...trade, currentPrice: newPrice, pnl, status: 'closed', remainingTime: newRemainingTime };
          }
        }

        return { ...trade, currentPrice: newPrice, pnl, remainingTime: newRemainingTime };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Effect to handle balance updates for auto-closed trades
  useEffect(() => {
    const closedTrades = trades.filter(t => t.status === 'closed' && (t as any).processed !== true);
    if (closedTrades.length > 0) {
      closedTrades.forEach(trade => {
        const returnAmount = trade.amount + trade.pnl;
        if (trade.mode === 'demo') {
          setDemoBalance(b => b + returnAmount);
          if (trade.pnl > 0) setDemoProfit(p => p + trade.pnl);
          else if (trade.pnl < 0) setDemoLoss(l => l + Math.abs(trade.pnl));
        } else {
          // Update via WalletContext
          updateForexBalances(returnAmount, trade.pnl > 0 ? trade.pnl : 0, `Trade ${trade.id} closed automatically`, 'payout');
        }
        
        // Sound alerts
        if (trade.pnl > 0) {
          playSound('success');
        } else if (trade.pnl < 0) {
          playSound('error');
        } else {
          playSound('notification');
        }

        (trade as any).processed = true;
        toast.success(`Trade ${trade.id} closed automatically. PnL: $${trade.pnl.toFixed(2)} (${trade.mode.toUpperCase()})`);
      });
    }
  }, [trades, playSound]);

  const resetDemoBalance = () => {
    setDemoBalance(10000);
    setDemoProfit(0);
    setDemoLoss(0);
    setTrades(prev => prev.filter(t => t.mode !== 'demo'));
    toast.success('Demo account reset successfully');
    playSound('success');
  };

  const handleTrade = (type: 'buy' | 'sell', options?: { amount: number, duration?: string, takeProfit?: string, isBot?: boolean }) => {
    const amount = options?.amount ?? parseFloat(tradeAmount);
    if (isNaN(amount) || amount < 1 || amount > 1000) {
      if (!options?.isBot) toast.error('Trade amount must be between $1 and $1000');
      return;
    }
    if (amount > currentBalance) {
      if (!options?.isBot) toast.error('Insufficient funds');
      return;
    }

    if (mode === 'demo') {
      setDemoBalance(prev => prev - amount);
    } else {
      updateForexBalances(-amount, 0, `Trade ${selectedPair.id} Opened`, 'investment');
    }

    const durationMap: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400
    };

    const activeDuration = options?.duration ?? tradeDuration;
    const activeTP = options?.takeProfit ?? takeProfit;
    const tpValue = parseFloat(activeTP);
    
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      pair: selectedPair.id,
      type,
      amount,
      entryPrice: selectedPair.price,
      currentPrice: selectedPair.price,
      pnl: 0,
      time: new Date(),
      status: 'open',
      takeProfit: isNaN(tpValue) ? undefined : tpValue,
      duration: durationMap[activeDuration],
      remainingTime: durationMap[activeDuration],
      isBotTrade: options?.isBot ?? isBotEnabled,
      isPaused: false,
      mode
    };

    setTrades(prev => [newTrade, ...prev]);
    setGlobalCountdown(durationMap[activeDuration]);
    if (!options?.isBot) {
      setTradeAmount('');
      setTakeProfit('');
    }
    playSound('success');
    toast.success(`${type.toUpperCase()} order placed for ${selectedPair.id}${options?.isBot || isBotEnabled ? ' (Bot Managed)' : ''}`);
  };

  const togglePauseTrade = (id: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id === id && trade.status === 'open') {
        const newPausedState = !trade.isPaused;
        toast.info(`Trade ${id} ${newPausedState ? 'paused' : 'resumed'}`);
        return { ...trade, isPaused: newPausedState };
      }
      return trade;
    }));
  };

  const closeTrade = (id: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id === id && trade.status === 'open') {
        const returnAmount = trade.amount + trade.pnl;
        if (trade.mode === 'demo') {
          setDemoBalance(b => b + returnAmount);
          if (trade.pnl > 0) setDemoProfit(p => p + trade.pnl);
          else if (trade.pnl < 0) setDemoLoss(l => l + Math.abs(trade.pnl));
        } else {
          // Update via WalletContext
          updateForexBalances(returnAmount, trade.pnl > 0 ? trade.pnl : 0, `Trade ${trade.id} manually closed`, 'payout');
        }

        // Sound alerts
        if (trade.pnl > 0) {
          playSound('success');
        } else if (trade.pnl < 0) {
          playSound('error');
        } else {
          playSound('notification');
        }

        toast.success(`Trade closed. PnL: $${trade.pnl.toFixed(2)} (${trade.mode.toUpperCase()})`);
        return { ...trade, status: 'closed' };
      }
      return trade;
    }));
  };

  const handleCopyTrade = (traderName: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Connecting to ${traderName}'s trade stream...`,
        success: () => {
          playSound('success');
          return `Now copying trades from ${traderName}`;
        },
        error: 'Connection failed'
      }
    );
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount < (settings.forexMinWithdrawal || 50)) {
      toast.error(`Minimum withdrawal amount is $${settings.forexMinWithdrawal || 50}`);
      return;
    }
    
    // Transfer is now contingent on profit
    if (amount > forexProfitBalance) {
      toast.error('Insufficient Forex profit', {
        description: `Only traded live profits can be transferred to the central wallet. Current available profit: $${forexProfitBalance.toFixed(2)}`
      });
      return;
    }

    setIsProcessing(true);
    try {
      await transferProfitFromForex(amount);
      setShowWithdrawModal(false);
      playSound('success');
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < (settings.forexMinDeposit || 100)) {
      toast.error(`Minimum deposit amount is $${settings.forexMinDeposit || 100}`);
      return;
    }

    if (depositMethod === 'wallet') {
      if (centralBalance < amount) {
        toast.error('Insufficient central wallet balance');
        return;
      }
      
      setIsProcessing(true);
      try {
        await depositToForexWallet(amount);
        setShowDepositModal(false);
        setDepositAmount('100');
        playSound('success');
      } catch (error) {
        console.error('Deposit error:', error);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle other deposit methods (Card, Crypto)
    const bonus = amount >= 500 ? amount * 0.5 : (amount >= 100 ? amount * 0.2 : 0);
    const totalAmount = amount + bonus;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Processing deposit via ${depositMethod === 'card' ? 'Visa/Mastercard' : 'Cryptocurrency'}...`,
        success: () => {
          updateForexBalances(totalAmount, 0, `External Deposit via ${depositMethod}`, 'deposit');
          setShowDepositModal(false);
          setDepositAmount('100');
          playSound('success');
          return `Successfully deposited $${amount.toFixed(2)}${bonus > 0 ? ` + $${bonus.toFixed(2)} Bonus` : ''}`;
        },
        error: 'Deposit failed'
      }
    );
  };

  const currentProfit = mode === 'demo' ? demoProfit : forexProfitBalance;
  const currentLoss = mode === 'demo' ? demoLoss : 0; // Simplified for live mode tracking via profit balance

  // Calculate Trading Statistics
  const stats = useMemo(() => {
    const modeTrades = trades.filter(t => t.mode === mode && t.status === 'closed');
    const openTradesCount = trades.filter(t => t.mode === mode && t.status === 'open').length;
    const total = modeTrades.length;
    const wins = modeTrades.filter(t => t.pnl > 0).length;
    const losses = modeTrades.filter(t => t.pnl < 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const profitFactor = currentLoss > 0 ? currentProfit / currentLoss : currentProfit > 0 ? 100 : 0;
    
    const bestTrade = modeTrades.reduce((max, t) => Math.max(max, t.pnl), 0);
    const worstTrade = modeTrades.reduce((min, t) => Math.min(min, t.pnl), 0);
    
    const avgTrade = total > 0 ? (currentProfit - currentLoss) / total : 0;

    // Time-based Analysis
    const now = new Date();
    const getStatsForPeriod = (days: number) => {
      const periodMs = days * 24 * 60 * 60 * 1000;
      const periodTrades = modeTrades.filter(t => (now.getTime() - t.time.getTime()) <= periodMs);
      const profit = periodTrades.reduce((sum, t) => sum + (t.pnl > 0 ? t.pnl : 0), 0);
      const loss = periodTrades.reduce((sum, t) => sum + (t.pnl < 0 ? Math.abs(t.pnl) : 0), 0);
      return { profit, loss };
    };

    const daily = getStatsForPeriod(1);
    const weekly = getStatsForPeriod(7);
    const monthly = getStatsForPeriod(30);
    const yearly = getStatsForPeriod(365);

    // Distribution
    const buyTrades = modeTrades.filter(t => t.type === 'buy');
    const sellTrades = modeTrades.filter(t => t.type === 'sell');
    const buyWinRate = buyTrades.length > 0 ? (buyTrades.filter(t => t.pnl > 0).length / buyTrades.length) * 100 : 0;
    const sellWinRate = sellTrades.length > 0 ? (sellTrades.filter(t => t.pnl > 0).length / sellTrades.length) * 100 : 0;

    // Generate PnL History for Chart
    let runningPnL = 0;
    const pnlHistory = modeTrades.slice().reverse().map((t, i) => {
      runningPnL += t.pnl;
      return {
        trade: i + 1,
        pnl: runningPnL,
        amount: t.pnl
      };
    });

    return {
      total,
      wins,
      losses,
      winRate,
      profitFactor,
      bestTrade,
      worstTrade,
      avgTrade,
      buyWinRate,
      sellWinRate,
      pnlHistory,
      openTradesCount,
      daily,
      weekly,
      monthly,
      yearly
    };
  }, [trades, mode, currentProfit, currentLoss]);

  if (!settings.forexTradingEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1a0b2e] rounded-3xl p-8 text-center border border-[#ffd700]/20">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Forex Trading Suspended</h2>
        <p className="text-gray-400 max-w-md">
          The Forex trading platform is currently under maintenance or disabled by the administrator. 
          Please check back later or contact support for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#1a0b2e] p-6 rounded-3xl min-h-screen">
      {/* Header & Account Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-[#001f3f] p-4 sm:p-6 rounded-3xl shadow-2xl border border-blue-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between lg:justify-start w-full lg:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffd700]/10 rounded-xl border border-[#ffd700]/20">
              <Zap className="w-6 h-6 text-[#ffd700] animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                GMT <span className="text-[#ffd700]">Forex</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-blue-200/60 text-[8px] font-black uppercase tracking-[0.2em]">Optimum System</p>
              </div>
            </div>
          </div>
          
          <div className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-[#1a0b2e]/80 backdrop-blur-md rounded-xl border border-[#ffd700]/10">
            <Users className="w-3 h-3 text-[#ffd700]" />
            <span className="text-[10px] font-black text-white">{activeTraders.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto relative z-10">
          {globalCountdown !== null && (
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <p className="text-[8px] text-amber-500/60 font-black uppercase tracking-widest">Session</p>
                <p className="text-xs font-black text-amber-500 font-mono">
                  {Math.floor(globalCountdown / 3600).toString().padStart(2, '0')}:
                  {Math.floor((globalCountdown % 3600) / 60).toString().padStart(2, '0')}:
                  {(globalCountdown % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          <div className="flex bg-[#1a0b2e] p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setMode('demo')}
              className={clsx(
                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                mode === 'demo' ? "bg-[#ffd700] text-[#1a0b2e] shadow-lg shadow-[#ffd700]/20" : "text-amber-200/40 hover:text-amber-200"
              )}
            >
              Demo
            </button>
            <button
              onClick={() => setMode('live')}
              className={clsx(
                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                mode === 'live' ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-lg shadow-amber-600/20" : "text-amber-200/40 hover:text-amber-200"
              )}
            >
              Live
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 bg-[#1a0b2e]/50 p-4 sm:p-0 rounded-2xl sm:bg-transparent">
            <div className="text-left sm:text-right">
              <p className="text-[8px] text-amber-200/50 font-black uppercase tracking-widest">Available Balance</p>
              <p className="text-xl sm:text-2xl font-black text-[#ffd700] tracking-tighter">
                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-2">
              {mode === 'demo' && (
                <button
                  onClick={resetDemoBalance}
                  className="p-3 bg-[#ffd700]/10 text-[#ffd700] rounded-xl hover:bg-[#ffd700]/20 transition-all border border-[#ffd700]/30"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              )}
              
              {mode === 'live' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/30"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="p-3 bg-[#ffd700]/10 text-[#ffd700] rounded-xl hover:bg-[#ffd700]/20 transition-all border border-[#ffd700]/30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart & Pairs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#2d1b4d] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#ffd700]/10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">{mode.toUpperCase()} Profit</span>
                </div>
              </div>
              <p className="text-base sm:text-xl font-black text-white">${currentProfit.toFixed(2)}</p>
            </div>
            <div className="bg-[#2d1b4d] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#ffd700]/10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">{mode.toUpperCase()} Loss</span>
                </div>
              </div>
              <p className="text-base sm:text-xl font-black text-white">${currentLoss.toFixed(2)}</p>
            </div>
            <div className="bg-[#2d1b4d] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#ffd700]/10 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">Net {mode.toUpperCase()} PnL</span>
              </div>
              <p className={clsx(
                "text-base sm:text-xl font-black",
                (currentProfit - currentLoss) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                ${(currentProfit - currentLoss).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Chart Area (Stimulated) */}
          <div className="bg-[#2d1b4d] p-4 sm:p-8 rounded-[40px] shadow-2xl border border-white/5 h-[400px] sm:h-[550px] flex flex-col relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffd700]/5 blur-[120px] rounded-full -mr-48 -mt-48" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#1a0b2e] rounded-2xl border border-[#ffd700]/20 shadow-lg">
                  <h3 className="text-xl sm:text-2xl font-black text-[#ffd700] tracking-tighter">{selectedPair.id}</h3>
                </div>
                <div className="flex flex-col">
                  <span className={clsx(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit",
                    selectedPair.change.startsWith('+') ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  )}>
                    {selectedPair.change}
                  </span>
                  <span className="text-[10px] text-purple-300/40 font-bold mt-1">Live Market Price</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <div className={clsx(
                  "px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all duration-500",
                  analysis.includes('Buy') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                  analysis.includes('Sell') ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                  "bg-white/5 text-white/40 border-white/10"
                )}>
                  <Activity className={clsx("w-3 h-3", analysis !== 'Neutral' && "animate-pulse")} />
                  Analysis: {analysis}
                </div>
                <div className="flex gap-1 bg-[#1a0b2e] p-1.5 rounded-xl border border-white/5 shrink-0">
                  <button 
                    onClick={() => setChartType('area')}
                    className={clsx(
                      "px-4 py-2 text-[10px] font-black rounded-lg transition-all",
                      chartType === 'area' ? "bg-[#ffd700] text-[#1a0b2e] shadow-lg" : "text-amber-200/40 hover:text-[#ffd700]"
                    )}
                  >
                    AREA
                  </button>
                  <button 
                    onClick={() => setChartType('candlestick')}
                    className={clsx(
                      "px-4 py-2 text-[10px] font-black rounded-lg transition-all",
                      chartType === 'candlestick' ? "bg-[#ffd700] text-[#1a0b2e] shadow-lg" : "text-amber-200/40 hover:text-[#ffd700]"
                    )}
                  >
                    CANDLE
                  </button>
                </div>
                <div className="flex gap-1 bg-[#1a0b2e] p-1.5 rounded-xl border border-white/5 shrink-0">
                  {['1M', '5M', '15M', '1H'].map(tf => (
                    <button key={tf} className="px-3 py-2 text-[10px] font-black text-amber-200/40 hover:text-[#ffd700] hover:bg-[#ffd700]/10 rounded-lg transition-all">
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-black/20 rounded-[32px] border border-white/5 relative overflow-hidden p-4">
              {/* Desktop Overlay Trading Buttons */}
              <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-6 z-20">
                <button
                  onClick={() => handleTrade('buy')}
                  className="flex flex-col items-center justify-center w-24 h-24 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-[32px] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 backdrop-blur-md border border-emerald-400/50 group/btn"
                >
                  <TrendingUp className="w-8 h-8 mb-1 group-hover/btn:scale-110 transition-transform" />
                  <span className="font-black text-xs uppercase tracking-widest">CALL</span>
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  className="flex flex-col items-center justify-center w-24 h-24 bg-red-500/90 hover:bg-red-500 text-white rounded-[32px] transition-all shadow-2xl shadow-red-500/20 active:scale-95 backdrop-blur-md border border-red-400/50 group/btn"
                >
                  <TrendingDown className="w-8 h-8 mb-1 group-hover/btn:scale-110 transition-transform" />
                  <span className="font-black text-xs uppercase tracking-widest">PUT</span>
                </button>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a0b2e', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      itemStyle={{ color: '#ffd700', fontWeight: '900' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#ffd700" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={1500}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ma" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                      animationDuration={1500}
                    />
                    {chartData.length > 0 && (
                      <>
                        <ReferenceArea 
                          y1={chartData[chartData.length-1].price * 1.0005} 
                          y2={chartData[chartData.length-1].price * 1.0015} 
                          fill="rgba(239, 68, 68, 0.05)" 
                          label={{ value: 'SELL ZONE', fill: '#ef4444', fontSize: 10, position: 'insideTopRight', fontWeight: '900' }} 
                        />
                        <ReferenceArea 
                          y1={chartData[chartData.length-1].price * 0.9985} 
                          y2={chartData[chartData.length-1].price * 0.9995} 
                          fill="rgba(16, 185, 129, 0.05)" 
                          label={{ value: 'BUY ZONE', fill: '#10b981', fontSize: 10, position: 'insideBottomRight', fontWeight: '900' }} 
                        />
                      </>
                    )}
                  </AreaChart>
                ) : (
                  <LineChart data={candleData}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1a0b2e] border border-[#ffd700]/20 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                              <p className="text-[10px] font-black text-amber-200/40 uppercase mb-3 tracking-widest">{data.time}</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                <span className="text-[10px] text-amber-200/60 font-bold">OPEN</span>
                                <span className="text-[10px] font-black text-white">{data.open.toFixed(4)}</span>
                                <span className="text-[10px] text-amber-200/60 font-bold">CLOSE</span>
                                <span className="text-[10px] font-black text-white">{data.close.toFixed(4)}</span>
                                <span className="text-[10px] text-amber-200/60 font-bold">HIGH</span>
                                <span className="text-[10px] font-black text-emerald-400">{data.high.toFixed(4)}</span>
                                <span className="text-[10px] text-amber-200/60 font-bold">LOW</span>
                                <span className="text-[10px] font-black text-red-400">{data.low.toFixed(4)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line dataKey="high" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                    <Line dataKey="low" stroke="#ef4444" dot={false} strokeWidth={1.5} />
                    <Line dataKey="close" stroke="#ffd700" strokeWidth={3} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
              
              {/* Analysis Overlay */}
              <div className="absolute top-4 left-4 bg-[#1a0b2e]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl z-10 min-w-[160px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Market Intel</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/40 uppercase">Signal</span>
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        analysis.includes('Buy') ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                        analysis.includes('Sell') ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                        "bg-gray-500"
                      )} />
                      <span className={clsx(
                        "text-xs font-black",
                        analysis.includes('Buy') ? "text-emerald-400" :
                        analysis.includes('Sell') ? "text-red-400" :
                        "text-white"
                      )}>
                        {analysis.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/40 uppercase">Sentiment</span>
                    <span className="text-[10px] font-black text-[#ffd700]">{(Math.random() * 40 + 60).toFixed(1)}% BULLISH</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-white font-black uppercase tracking-widest">Live Feed</p>
              </div>
            </div>
          </div>

          {/* Mobile Trading Controls */}
          <div className="sm:hidden grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade('buy')}
              className="flex flex-col items-center justify-center py-6 bg-emerald-500 text-white rounded-3xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <TrendingUp className="w-8 h-8 mb-2" />
              <span className="font-black text-sm uppercase tracking-widest">CALL (UP)</span>
            </button>
            <button
              onClick={() => handleTrade('sell')}
              className="flex flex-col items-center justify-center py-6 bg-red-500 text-white rounded-3xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
            >
              <TrendingDown className="w-8 h-8 mb-2" />
              <span className="font-black text-sm uppercase tracking-widest">PUT (DOWN)</span>
            </button>
          </div>

          {/* Market Pairs & Copy Trading Tabs */}
          <div className="bg-[#2d1b4d] p-4 sm:p-8 rounded-[40px] shadow-2xl border border-white/5">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 no-scrollbar gap-8">
              <div className="flex gap-6 sm:gap-10 min-w-max">
                {['market', 'copy', 'analysis', 'guide'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setBottomTab(tab as any)}
                    className={clsx(
                       "text-sm sm:text-lg font-black uppercase tracking-[0.2em] transition-all relative py-2",
                       bottomTab === tab ? "text-[#ffd700]" : "text-purple-300/30 hover:text-purple-300/60"
                    )}
                  >
                    {tab}
                    {bottomTab === tab && (
                      <motion.div 
                        layoutId="activeBottomTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffd700] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {bottomTab === 'market' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FOREX_PAIRS.map(pair => (
                  <button
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={clsx(
                      "p-5 rounded-3xl border transition-all relative overflow-hidden group flex items-center justify-between",
                      selectedPair.id === pair.id 
                        ? "border-[#ffd700] bg-[#ffd700]/10 shadow-2xl shadow-[#ffd700]/10" 
                        : "border-white/5 bg-black/20 hover:border-white/20 hover:bg-black/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#ffd700]/30 transition-all">
                        <TrendingUp className={clsx(
                          "w-5 h-5",
                          pair.change.startsWith('+') ? "text-emerald-400" : "text-red-400"
                        )} />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-white group-hover:text-[#ffd700] transition-colors">{pair.id}</div>
                        <div className="text-[10px] text-purple-300/40 font-bold uppercase tracking-widest">Forex Pair</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white font-mono">{pair.price.toFixed(4)}</div>
                      <span className={clsx(
                        "text-[10px] font-black px-2 py-0.5 rounded-lg",
                        pair.change.startsWith('+') ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {pair.change}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : bottomTab === 'copy' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MASTER_TRADERS.map(trader => (
                  <div key={trader.id} className="bg-black/20 p-6 rounded-[32px] border border-white/5 hover:border-[#ffd700]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img src={trader.avatar} alt={trader.name} className="w-14 h-14 rounded-2xl border-2 border-white/10 group-hover:border-[#ffd700]/50 transition-all object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#1a0b2e] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">{trader.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 text-[#ffd700] fill-[#ffd700]" />)}
                          </div>
                          <span className="text-[10px] font-black text-purple-300/40 uppercase tracking-widest">Elite</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-purple-300/40 font-black uppercase tracking-widest mb-1">Win Rate</p>
                        <p className="text-sm font-black text-emerald-400">{trader.winRate}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-purple-300/40 font-black uppercase tracking-widest mb-1">Followers</p>
                        <p className="text-sm font-black text-[#ffd700]">{trader.followers}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopyTrade(trader.name)}
                      className="w-full py-4 bg-[#ffd700]/10 hover:bg-[#ffd700] text-[#ffd700] hover:text-[#1a0b2e] border border-[#ffd700]/30 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                      <UserPlus className="w-4 h-4" />
                      Copy Strategy
                    </button>
                  </div>
                ))}
              </div>
            ) : bottomTab === 'analysis' ? (
              <div className="space-y-8">
                {/* Supreme Traders Global Analysis */}
                <div className="bg-gradient-to-br from-[#ffd700]/10 via-transparent to-transparent p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-32 h-32 text-[#ffd700]" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-[#ffd700]/20 rounded-2xl border border-[#ffd700]/30">
                        <BarChart2 className="w-6 h-6 text-[#ffd700]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Supreme Analytics</h3>
                        <p className="text-sm text-purple-300/40 font-bold">Real-time market sentiment & execution</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-purple-300/40 font-black uppercase tracking-widest mb-2">Total Open Trades</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{(activeTraders * 0.15 + stats.openTradesCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-[10px] text-emerald-400 font-black uppercase">Live Execution</p>
                        </div>
                      </div>
                      <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-purple-300/40 font-black uppercase tracking-widest mb-2">Supreme Profit (24h)</p>
                        <p className="text-3xl font-black text-[#ffd700] tracking-tighter">${(activeTraders * 12.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <p className="text-[10px] text-emerald-400 font-black uppercase">+12.4% Growth</p>
                        </div>
                      </div>
                      <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-purple-300/40 font-black uppercase tracking-widest mb-2">Success Rate</p>
                        <p className="text-3xl font-black text-white tracking-tighter">94.2%</p>
                        <div className="flex items-center gap-2 mt-2">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <p className="text-[10px] text-blue-400 font-black uppercase">Verified System</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 p-8 rounded-[40px] border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Trading Guide</h3>
                    <p className="text-sm text-purple-300/40 font-bold">Master the GMT Forex Optimum system</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: 'Market Selection', desc: 'Choose high volatility pairs for maximum yield potential.' },
                    { title: 'Analysis Tools', desc: 'Use AI analysis to confirm trend direction before execution.' },
                    { title: 'Risk Management', desc: 'Never trade more than 5% of your balance on a single session.' },
                    { title: 'Copy Trading', desc: 'Follow master traders to automate your profit generation.' }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
                      <h4 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{item.title}</h4>
                      <p className="text-xs text-purple-300/60 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Trading Panel */}
        <div className="space-y-6">
          {/* Order Entry */}
          <div className="bg-[#2d1b4d] p-6 rounded-2xl shadow-xl border border-[#ffd700]/10">
            <h3 className="text-lg font-black text-[#ffd700] mb-4 uppercase tracking-widest">Place Order</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-3">Amount (USD)</label>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffd700] font-black">$</span>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-[#1a0b2e] border border-[#ffd700]/20 rounded-xl focus:ring-2 focus:ring-[#ffd700] focus:border-transparent font-black text-white placeholder-amber-200/20"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTradeAmount(amt.toString())}
                      className="py-2 text-[9px] sm:text-[10px] font-black bg-[#1a0b2e] text-amber-200/60 rounded-lg border border-[#ffd700]/10 hover:border-[#ffd700] hover:text-[#ffd700] transition-all"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Target"
                    className="w-full px-4 py-3 bg-[#1a0b2e] border border-[#ffd700]/20 rounded-xl focus:ring-2 focus:ring-[#ffd700] focus:border-transparent text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-2">Duration</label>
                  <div className="relative">
                    <select
                      value={tradeDuration}
                      onChange={(e) => setTradeDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a0b2e] border border-[#ffd700]/20 rounded-xl focus:ring-2 focus:ring-[#ffd700] focus:border-transparent text-sm font-bold text-white appearance-none"
                    >
                      {['1m', '5m', '15m', '1h', '4h', '1d'].map(d => (
                        <option key={d} value={d} className="bg-[#1a0b2e]">{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-200/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#ffd700]/5 rounded-xl border border-[#ffd700]/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a0b2e] rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Expected Payout</span>
                    <span className="text-[8px] text-amber-200/40 font-bold uppercase">Fixed Return Rate</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-green-400">82%</span>
                  <span className="text-[10px] text-amber-200/40 block">+${(parseFloat(tradeAmount) * 0.82 || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#ffd700]/5 rounded-xl border border-[#ffd700]/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a0b2e] rounded-lg">
                    <Cpu className="w-4 h-4 text-[#ffd700]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Bot Trading</span>
                    <span className="text-[8px] text-amber-200/40 font-bold uppercase">AI Auto-Execution</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsBotEnabled(!isBotEnabled)}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-all relative p-1",
                    isBotEnabled ? "bg-gradient-to-r from-amber-400 to-yellow-600" : "bg-gray-700"
                  )}
                >
                  <div className={clsx(
                    "w-4 h-4 rounded-full bg-white shadow-lg transition-all transform",
                    isBotEnabled ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Bot Activity Log */}
              <AnimatePresence>
                {isBotEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-[#120524] rounded-2xl border border-[#ffd700]/10 overflow-hidden shadow-inner"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-[#ffd700]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#ffd700] animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest text-[#ffd700]/60">AI Activity Matrix</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
                        <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Active</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 h-32 overflow-y-auto no-scrollbar scroll-smooth">
                      {botLog.length === 0 ? (
                        <div className="text-[9px] text-amber-200/20 text-center py-10 font-black italic tracking-widest flex flex-col items-center gap-2 uppercase">
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                          Booting Neural Systems...
                        </div>
                      ) : (
                        botLog.map(log => (
                          <motion.div 
                            key={log.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-start gap-4"
                          >
                            <span className={clsx(
                               "text-[9px] font-black flex-1 leading-[1.3] uppercase tracking-wide",
                               log.type === 'info' ? 'text-cyan-400 opacity-80' : 
                               log.type === 'success' ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]' : 
                               'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]'
                            )}>
                               <span className="inline-block w-1 h-1 rounded-full bg-current mr-2 mb-0.5" />
                               {log.msg}
                            </span>
                            <span className="text-[8px] font-black text-[#ffd700]/20 whitespace-nowrap mt-0.5">{log.time}</span>
                          </motion.div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[8px] font-black text-purple-300/20 uppercase tracking-[0.2em]">Robot Status: Optimized</span>
                       <span className="text-[8px] font-black text-emerald-400/50 uppercase">7.4ms Latency</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleTrade('buy')}
                  className="group flex flex-col items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95"
                >
                  <TrendingUp className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-sm">UP</span>
                  <span className="text-[10px] font-bold opacity-70">{selectedPair.price.toFixed(4)}</span>
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  className="group flex flex-col items-center justify-center p-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  <TrendingDown className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-sm">DOWN</span>
                  <span className="text-[10px] font-bold opacity-70">{selectedPair.price.toFixed(4)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Trades */}
          <div className="bg-[#2d1b4d] p-6 rounded-2xl shadow-xl border border-[#ffd700]/10 flex-1">
            <h3 className="text-lg font-black text-[#ffd700] mb-6 flex items-center justify-between uppercase tracking-widest">
              Active Trades
              <span className="text-[10px] bg-[#ffd700]/10 text-[#ffd700] px-3 py-1 rounded-full border border-[#ffd700]/20">
                {trades.filter(t => t.status === 'open').length} Open
              </span>
            </h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {trades.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-amber-200/10 mx-auto mb-3" />
                  <p className="text-amber-200/30 text-xs font-bold uppercase tracking-widest">No active trades</p>
                </div>
              ) : (
                <AnimatePresence>
                  {trades.map(trade => (
                    <motion.div 
                      key={trade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={clsx(
                        "p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden",
                        trade.status === 'closed' ? "bg-[#1a0b2e]/40 border-white/5 opacity-50" : "bg-[#1a0b2e] border-[#ffd700]/20 shadow-lg"
                      )}
                    >
                      {/* Countdown Progress Bar */}
                      {trade.status === 'open' && trade.duration && trade.remainingTime !== undefined && (
                        <div className="absolute bottom-0 left-0 h-1 bg-[#ffd700]/20 w-full">
                          <motion.div 
                            className="h-full bg-[#ffd700]"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(trade.remainingTime / trade.duration) * 100}%` }}
                            transition={{ duration: 2, ease: "linear" }}
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={clsx(
                            "text-[8px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg",
                            trade.type === 'buy' ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                          )}>
                            {trade.type === 'buy' ? 'UP' : 'DOWN'}
                          </span>
                          <span className="font-black text-white text-xs sm:text-base">{trade.pair}</span>
                          {trade.isBotTrade && (
                            <span className="text-[8px] bg-[#ffd700]/10 text-[#ffd700] px-2 py-0.5 rounded-full font-black uppercase border border-[#ffd700]/20">Bot</span>
                          )}
                        </div>
                        {trade.status === 'open' && (
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => togglePauseTrade(trade.id)}
                              className="p-1.5 sm:p-2 bg-[#ffd700]/5 text-[#ffd700] hover:bg-[#ffd700]/10 border border-[#ffd700]/20 rounded-lg transition-all"
                            >
                              {trade.isPaused ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => closeTrade(trade.id)}
                              className="px-2 py-1 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-black text-amber-200/40 hover:text-white border border-white/10 rounded-lg transition-all"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div>
                          <p className="text-amber-200/30 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">Amount</p>
                          <p className="font-black text-white text-xs sm:text-sm">${trade.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-amber-200/30 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">Time</p>
                          <p className={clsx(
                            "font-black text-xs sm:text-sm font-mono",
                            trade.remainingTime !== undefined && trade.remainingTime < 10 ? "text-red-400 animate-pulse" : "text-[#ffd700]"
                          )}>
                            {trade.remainingTime !== undefined ? (
                              `${Math.floor(trade.remainingTime / 60)}:${(trade.remainingTime % 60).toString().padStart(2, '0')}`
                            ) : '∞'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-200/30 text-[7px] sm:text-[8px] font-bold uppercase mb-0.5 sm:mb-1">PnL</p>
                          <p className={clsx(
                            "font-black text-xs sm:text-sm",
                            trade.pnl > 0 ? "text-green-400" : trade.pnl < 0 ? "text-red-400" : "text-white"
                          )}>
                            {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {trade.takeProfit && (
                        <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8px] sm:text-[9px] text-amber-200/30 font-black uppercase tracking-widest">Target</span>
                          <span className="text-[10px] sm:text-xs font-black text-amber-200/60 font-mono">{trade.takeProfit.toFixed(4)}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2d1b4d] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#ffd700]/20"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-[#ffd700] uppercase tracking-widest">Deposit Funds</h2>
              <button onClick={() => setShowDepositModal(false)} className="text-amber-200/40 hover:text-[#ffd700] transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-3">Amount (USD) - Min $100</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffd700] font-black">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full pl-10 pr-4 py-4 bg-[#1a0b2e] border border-[#ffd700]/20 rounded-xl focus:ring-2 focus:ring-[#ffd700] focus:border-transparent font-black text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(amt.toString())}
                      className="py-2 bg-[#1a0b2e] border border-[#ffd700]/10 rounded-lg text-[10px] font-black text-amber-200/60 hover:border-[#ffd700] hover:text-[#ffd700] transition-all"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-4">Payment Method</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setDepositMethod('wallet')}
                    className={clsx(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                      depositMethod === 'wallet' ? "border-[#ffd700] bg-[#ffd700]/10" : "border-[#ffd700]/10 bg-[#1a0b2e] hover:border-[#ffd700]/30"
                    )}
                  >
                    <Wallet className={clsx("w-6 h-6 mb-2 transition-transform group-hover:scale-110", depositMethod === 'wallet' ? "text-[#ffd700]" : "text-amber-200/20")} />
                    <span className="text-[10px] font-black text-white text-center">Central Wallet</span>
                    <span className="text-[8px] text-amber-200/40 font-bold mt-1">${centralBalance.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => setDepositMethod('card')}
                    className={clsx(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                      depositMethod === 'card' ? "border-[#635BFF] bg-[#635BFF]/10" : "border-[#ffd700]/10 bg-[#1a0b2e] hover:border-[#635BFF]/30"
                    )}
                  >
                    <CreditCard className={clsx("w-6 h-6 mb-2 transition-transform group-hover:scale-110", depositMethod === 'card' ? "text-[#635BFF]" : "text-amber-200/20")} />
                    <span className="text-[10px] font-black text-white text-center">Visa / MC</span>
                  </button>
                  <button
                    onClick={() => setDepositMethod('crypto')}
                    className={clsx(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                      depositMethod === 'crypto' ? "border-emerald-500 bg-emerald-500/10" : "border-[#ffd700]/10 bg-[#1a0b2e] hover:border-emerald-500/30"
                    )}
                  >
                    <DollarSign className={clsx("w-6 h-6 mb-2 transition-transform group-hover:scale-110", depositMethod === 'crypto' ? "text-emerald-500" : "text-amber-200/20")} />
                    <span className="text-[10px] font-black text-white text-center">Crypto</span>
                  </button>
                </div>
              </div>

              {parseFloat(depositAmount) >= 100 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-400">Deposit Bonus Applied!</p>
                    <p className="text-[10px] text-green-400/70">
                      You will receive an extra <span className="font-black text-white">${(parseFloat(depositAmount) >= 500 ? parseFloat(depositAmount) * 0.5 : parseFloat(depositAmount) * 0.2).toFixed(2)}</span> ({parseFloat(depositAmount) >= 500 ? '50%' : '20%'})
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleDeposit}
                className="w-full py-5 bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-[#1a0b2e] rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
              >
                <ShieldCheck className="w-6 h-6" />
                Confirm Deposit
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2d1b4d] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-500/20"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-[#ffd700] uppercase tracking-widest">Profit Transfer</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-amber-200/40 hover:text-[#ffd700] transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-amber-200/40 uppercase tracking-[0.2em] mb-3">Amount (USD) - Available Profit: ${forexProfitBalance.toFixed(2)}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffd700] font-black">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="50.00"
                    className="w-full pl-10 pr-4 py-4 bg-[#1a0b2e] border border-[#ffd700]/20 rounded-xl focus:ring-2 focus:ring-[#ffd700] focus:border-transparent font-black text-white"
                  />
                </div>
                <p className="text-[9px] text-amber-200/30 mt-2">Only traded live profits can be transitioned to your Supreme Central Wallet.</p>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleWithdraw}
                className="w-full py-5 bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-[#1a0b2e] rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <ArrowRightLeft className="w-6 h-6" />
                {isProcessing ? 'Processing Transfer...' : 'Confirm Profit Transfer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
