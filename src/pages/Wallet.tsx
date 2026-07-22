/** Wallet Page Component */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Plus, 
  History, 
  TrendingUp, 
  CreditCard,
  DollarSign,
  ShieldCheck,
  Users,
  Search,
  Loader2,
  ChevronRight,
  Clock,
  PieChart,
  ArrowDown,
  ArrowUp,
  Tag,
  Key,
  RefreshCw,
  AlertTriangle,
  Info,
  Bitcoin,
  Landmark,
  Trophy,
  Check,
  Coins,
  Zap,
  Edit2,
  X,
  Printer,
  Flame,
  Gift,
  ShieldAlert,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useWallet, MIN_EXTERNAL_TRANSFER, MAX_EXTERNAL_TRANSFER, WITHDRAWAL_METHODS } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { SUPREME_FEATURES, SupremeFeature } from '../constants/featureIds';
import { clsx } from 'clsx';
import FeatureLoader from '../components/FeatureLoader';
import { stripeService } from '../services/stripe';
import { useSearchParams } from 'react-router-dom';
import { getRankData, RANK_BENEFITS } from '../constants/ranks';
import { toast } from 'sonner';
import StreakAnalysisArea from '../components/StreakAnalysisArea';
import { BOOST_PLANS, BoostPlan } from '../constants/boosts';
import { collection, query, getDocs, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import TopEarners from '../components/TopEarners';
import GlobalRankings from '../components/GlobalRankings';

const INCOME_CATEGORIES = ['Salary', 'Investment', 'Gift', 'Business', 'Other Income'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other Expense'];

export default function Wallet() {
  const { 
    balance, 
    transactions, 
    deposit, 
    withdraw, 
    sendPayment, 
    receivePayment, 
    accountNumber, 
    isAccountActive, 
    toggleAccountStatus, 
    generateNewAccount,
    isBoosted,
    boostExpiry,
    activateBoost,
    calculateFollowerEarnings,
    stripeAccountId,
    isStripeConnected,
    linkStripeAccount,
    refreshStripeStatus,
    createStripeLoginLink,
    initiateStripeTopup,
    initiateStripePayout,
    paypalEmail,
    bitcoinAddress,
    linkPaypalAccount,
    linkBitcoinAddress
  } = useWallet();
  const { user, generateSecurityKey, updateUser } = useAuth();
  const { settings } = useAdmin();
  const [searchParams] = useSearchParams();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showKeyGen, setShowKeyGen] = useState(false);
  const [showAccountGen, setShowAccountGen] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedBoostPlan, setSelectedBoostPlan] = useState<BoostPlan>(BOOST_PLANS[0]);
  const [showPaypalLink, setShowPaypalLink] = useState(false);
  const [showRankingId, setShowRankingId] = useState(false);
  const [isUpdatingRankingId, setIsUpdatingRankingId] = useState(false);
  const [showBitcoinLink, setShowBitcoinLink] = useState(false);
  const [newPaypalEmail, setNewPaypalEmail] = useState('');
  const [newBitcoinAddress, setNewBitcoinAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'crypto' | 'usdt' | 'bank'>('stripe');

  const [keyTimeLeft, setKeyTimeLeft] = useState<string>('');

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [recipient, setRecipient] = useState<{ id: string, name: string, email: string, avatar?: string } | null>(null);
  const [userSearchText, setUserSearchText] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getStreakWindowStart = () => {
    const userId = user?.uid || 'guest';
    let start = user?.streakWindowStart || localStorage.getItem(`streak_window_start_${userId}`);
    if (!start) {
      start = getTodayStr();
      localStorage.setItem(`streak_window_start_${userId}`, start);
    }
    return start;
  };

  const startStr = getStreakWindowStart();
  const getDaysElapsed = () => {
    const start = new Date(startStr);
    const today = new Date(getTodayStr());
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysElapsed = getDaysElapsed();
  const isStreakWindowExpired = daysElapsed >= 365;

  const [activeSection, setActiveSection] = useState<'overview' | 'transactions' | 'leaderboard'>('overview');
  const [trendTab, setTrendTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('all');
  const [txStartDate, setTxStartDate] = useState<string>('');
  const [txEndDate, setTxEndDate] = useState<string>('');
  const [txSortBy, setTxSortBy] = useState<'date' | 'amount'>('date');
  const [txSortOrder, setTxSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bank House State
  const [earnings, setEarnings] = useState({
    daily: 12.50,
    weekly: 87.50,
    monthly: 350.00,
    yearly: 4200.00,
    unclaimed: 145.50
  });

  // Cards State
  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expMonth: 12, expYear: 2028, isDefault: true }
  ]);

  const trendData = useMemo(() => {
    const daily = [
      { name: 'Mon', amount: 45.50 },
      { name: 'Tue', amount: 52.20 },
      { name: 'Wed', amount: 38.80 },
      { name: 'Thu', amount: 65.40 },
      { name: 'Fri', amount: 48.90 },
      { name: 'Sat', amount: 72.10 },
      { name: 'Sun', amount: 55.30 },
    ];

    const weekly = [
      { name: 'Week 1', amount: 280.50 },
      { name: 'Week 2', amount: 310.20 },
      { name: 'Week 3', amount: 295.80 },
      { name: 'Week 4', amount: 350.00 },
    ];

    const monthly = [
      { name: 'Jan', amount: 1200.50 },
      { name: 'Feb', amount: 1150.20 },
      { name: 'Mar', amount: 1350.80 },
      { name: 'Apr', amount: 1420.00 },
      { name: 'May', amount: 1280.90 },
      { name: 'Jun', amount: 1550.10 },
    ];

    return { daily, weekly, monthly };
  }, []);

  const realTrendData = useMemo(() => {
    const now = new Date();
    const earnings = transactions.filter(tx => tx.type === 'receive' || tx.type === 'deposit');
    
    const daily = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const amount = earnings
        .filter(tx => {
          const txDate = new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date);
          return txDate.toDateString() === d.toDateString();
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { name: dayName, amount };
    });

    const weekly = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date();
      start.setDate(now.getDate() - (3 - i) * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const amount = earnings
        .filter(tx => {
          const txDate = new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date);
          return txDate >= start && txDate < end;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { name: `W${i + 1}`, amount };
    });

    const monthly = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - (5 - i));
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const amount = earnings
        .filter(tx => {
          const txDate = new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date);
          return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { name: monthName, amount };
    });

    const hasData = daily.some(d => d.amount > 0) || weekly.some(w => w.amount > 0) || monthly.some(m => m.amount > 0);
    
    if (!hasData && transactions.length === 0) {
       return trendData;
    }

    return { daily, weekly, monthly };
  }, [transactions, trendData]);
  const [autoDeductSubs, setAutoDeductSubs] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  React.useEffect(() => {
    const stripeStatus = searchParams.get('stripe');
    const boostStatus = searchParams.get('boost');

    if (stripeStatus === 'success') {
      refreshStripeStatus();
      toast.success('Stripe account linked successfully!');
    } else if (stripeStatus === 'refresh') {
      toast.error('Stripe onboarding was interrupted. Please try again.');
    }

    if (boostStatus === 'success') {
      const planId = searchParams.get('planId');
      const plan = BOOST_PLANS.find(p => p.id === planId) || BOOST_PLANS[0];
      activateBoost(plan);
      toast.success(`Earning Boost activated successfully! You now earn ${((plan.multiplier - 1) * 100).toFixed(0)}% more on all activities.`);
    }

    const depositStatus = searchParams.get('deposit');
    const depositAmount = searchParams.get('amount');
    if (depositStatus === 'success' && depositAmount) {
      deposit(parseFloat(depositAmount), 'Stripe Deposit');
      toast.success(`Successfully deposited $${depositAmount} to your wallet!`);
    }

    if (stripeAccountId && !isStripeConnected) {
      refreshStripeStatus();
    }
  }, [searchParams, stripeAccountId, isStripeConnected, refreshStripeStatus]);

  // Recipient Search Effect
  React.useEffect(() => {
    if (!showSend) {
      setAvailableUsers([]);
      setUserSearchText('');
      setRecipient(null);
      return;
    }

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        let q;
        if (userSearchText.length > 2) {
          q = query(
            collection(db, 'users'),
            where('name', '>=', userSearchText),
            where('name', '<=', userSearchText + '\uf8ff'),
            limit(10)
          );
        } else {
          q = query(collection(db, 'users'), limit(5));
        }

        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((u: any) => u.uid !== user?.uid); // Don't show self
        
        setAvailableUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearchText, showSend, user?.uid]);

  const handleActivateBoost = async () => {
    if (paymentMethod === 'stripe') {
      try {
        await stripeService.createCheckoutSession(
          `price_${selectedBoostPlan.id}`,
          `${window.location.origin}/wallet?boost=success&planId=${selectedBoostPlan.id}`
        );
      } catch (error) {
        toast.error('Failed to initiate Stripe checkout for boost');
      }
    } else {
      // Mock activation for other methods
      if (balance >= selectedBoostPlan.price) {
        activateBoost(selectedBoostPlan);
        setShowBoostModal(false);
        toast.success(`${selectedBoostPlan.name} activated successfully!`);
      } else {
        toast.error(`Insufficient balance for ${selectedBoostPlan.name}. Please deposit funds first.`);
      }
    }
  };

  React.useEffect(() => {
    if (user?.keyExpiresAt) {
      const interval = setInterval(() => {
        const diff = new Date(user.keyExpiresAt!).getTime() - Date.now();
        if (diff <= 0) {
          setKeyTimeLeft('Expired');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setKeyTimeLeft(`${days}d ${hours}h ${mins}m`);
        }
      }, 60000);
      
      // Initial call
      const diff = new Date(user.keyExpiresAt!).getTime() - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setKeyTimeLeft(`${days}d ${hours}h ${mins}m`);

      return () => clearInterval(interval);
    }
  }, [user?.keyExpiresAt]);

  const handleGenerateKey = () => {
    if (balance < 2.5) {
      toast.error('Insufficient balance. Generating a new key costs $2.50');
      return;
    }
    
    // Deduct $2.50
    const success = sendPayment(2.5, 'Security Key Generation Fee', 'Security');
    if (success) {
      generateSecurityKey();
      setShowKeyGen(false);
      toast.success('New 16-character security key generated successfully!');
    }
  };

  const handleGenerateAccount = () => {
    const success = generateNewAccount();
    if (success) {
      setShowAccountGen(false);
      toast.success('New internal account number generated successfully!');
    } else {
      toast.error('Insufficient balance. Generating a new account number costs $2.80');
    }
  };

  const handleClaimEarnings = () => {
    if (earnings.unclaimed > 0) {
      receivePayment(earnings.unclaimed, 'Bank House Earnings Payout', 'Earning');
      toast.success(`Successfully added $${earnings.unclaimed.toFixed(2)} to your central wallet!`);
      setEarnings(prev => ({ ...prev, unclaimed: 0 }));
    }
  };

  const handleLinkPaypal = async () => {
    if (!newPaypalEmail) return;
    await linkPaypalAccount(newPaypalEmail);
    setShowPaypalLink(false);
    setNewPaypalEmail('');
    toast.success('PayPal account linked successfully!');
  };

  const handleLinkBitcoin = async () => {
    if (!newBitcoinAddress) return;
    await linkBitcoinAddress(newBitcoinAddress);
    setShowBitcoinLink(false);
    setNewBitcoinAddress('');
    toast.success('Bitcoin address linked successfully!');
  };

  const handleUnlinkPaypal = async () => {
    if (window.confirm('Are you sure you want to unlink your PayPal account?')) {
      await linkPaypalAccount('');
      toast.info('PayPal account unlinked.');
    }
  };

  const handleUnlinkBitcoin = async () => {
    if (window.confirm('Are you sure you want to unlink your Bitcoin address?')) {
      await linkBitcoinAddress('');
      toast.info('Bitcoin address unlinked.');
    }
  };

  const rankPrefixes: Record<string, string> = {
    'Elite': 'ELT',
    'Silver': 'SLV',
    'Diamond': 'DMD',
    'Gold': 'GLD',
    'Crowned': 'CRW',
    'Clowned': 'CLW',
    'Bronze': 'BRZ',
    'Pro': 'PRO',
    'Royal': 'RYL',
    'elite': 'ELT',
    'royal': 'RYL',
    'crowned': 'CRW',
    'gold': 'GLD',
    'diamond': 'DMD',
    'silver': 'SLV'
  };

  const currentRankPrefix = rankPrefixes[user?.rank || 'Bronze'] || 'BRZ';
  const canUpdateRankingId = !user?.rankingId || !user.rankingId.startsWith(currentRankPrefix);

  const handleUpdateRankingId = async () => {
    if (!user) return;
    setIsUpdatingRankingId(true);
    try {
      const prefix = rankPrefixes[user.rank] || 'BRZ';
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
      const newId = `${prefix}-${randomPart.substring(0, 4)}-${randomPart.substring(4, 8)}`;
      
      await updateUser({ rankingId: newId });
      toast.success(`Ranking ID updated to ${newId}!`);
    } catch (error) {
      toast.error('Failed to update Ranking ID');
    } finally {
      setIsUpdatingRankingId(false);
    }
  };

  // Financial Summary Calculations
  const summary = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow')
      .reduce((acc, tx) => acc + tx.amount, 0);
    
    const expenses = transactions
      .filter(tx => tx.type === 'withdraw' || tx.type === 'payment' || tx.type === 'lend')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const categoryBreakdown = transactions.reduce((acc: Record<string, { income: number; expense: number }>, tx) => {
      if (!acc[tx.category]) {
        acc[tx.category] = { income: 0, expense: 0 };
      }
      if (tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow') {
        acc[tx.category].income += tx.amount;
      } else {
        acc[tx.category].expense += tx.amount;
      }
      return acc;
    }, {});

    return { income, expenses, categoryBreakdown };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(txSearch.toLowerCase());
        const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter;
        const matchesCategory = txCategoryFilter === 'all' || tx.category === txCategoryFilter;
        
        const txDate = new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date);
        const matchesStartDate = !txStartDate || txDate >= new Date(txStartDate);
        const matchesEndDate = !txEndDate || txDate <= new Date(txEndDate + 'T23:59:59');
        
        return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        if (txSortBy === 'date') {
          const dateA = new Date(a.date?.seconds ? a.date.seconds * 1000 : a.date).getTime();
          const dateB = new Date(b.date?.seconds ? b.date.seconds * 1000 : b.date).getTime();
          return txSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
          return txSortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [transactions, txSearch, txTypeFilter, txCategoryFilter, txSortBy, txSortOrder, txStartDate, txEndDate]);

  // Transpile refresh trigger: Official Transaction Printing Logic enabled.

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
      if (paymentMethod === 'stripe') {
        try {
          if (user?.email) {
            await initiateStripeTopup(val, user.email);
            setShowDeposit(false);
            setAmount('');
          } else {
            toast.error('User email not found. Please log in again.');
          }
        } catch (error) {
          console.error('Stripe topup error:', error);
          toast.error('Failed to initiate Stripe deposit.');
        }
      } else if (paymentMethod === 'paypal') {
        if (!paypalEmail) {
          toast.error('Please link your PayPal account in the main wallet screen first.');
          return;
        }
        toast.info(`Redirecting to PayPal for ${paypalEmail}...`);
        // Mock deposit for demo
        deposit(val, category || 'General Income', 'PayPal');
        setAmount('');
        setShowDeposit(false);
      } else if (paymentMethod === 'crypto') {
        if (!bitcoinAddress) {
          toast.error('Please link your Bitcoin address in the main wallet screen first.');
          return;
        }
        toast.info(`Generating Crypto Payment Address for ${bitcoinAddress}...`);
        // Mock deposit for demo
        deposit(val, category || 'General Income', 'Bitcoin');
        setAmount('');
        setShowDeposit(false);
      } else if (paymentMethod === 'usdt') {
        toast.info(`Initializing secure stablecoin settlement for USDT...`);
        deposit(val, category || 'General Income', 'USDT');
        setAmount('');
        setShowDeposit(false);
      } else if (paymentMethod === 'bank') {
        toast.success(`Bank Wire Transfer Initiated! Ref Code: TX-BANK-${user?.uid ? user.uid.substring(0, 6).toUpperCase() : 'SUPREME'}`);
        deposit(val, category || 'General Income', 'Bank Wire');
        setAmount('');
        setShowDeposit(false);
      }
    }
  };

  const handleLinkStripe = async () => {
    if (!user?.email) {
      toast.error('User email not found. Please log in again.');
      return;
    }
    try {
      await linkStripeAccount(user.email);
    } catch (error) {
      console.error('Stripe link error:', error);
      toast.error('Failed to initiate Stripe account linking');
    }
  };

  const handleViewStripeDashboard = async () => {
    try {
      const url = await createStripeLoginLink();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Stripe dashboard error:', error);
      toast.error('Failed to open Stripe dashboard.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0 && val <= balance) {
      if (paymentMethod === 'stripe') {
        if (!isStripeConnected) {
          toast.error('Please link your Stripe account first to withdraw via Stripe.');
          return;
        }
        try {
          await initiateStripePayout(val);
          setShowWithdraw(false);
          setAmount('');
        } catch (error) {
          console.error('Stripe payout error:', error);
          toast.error('Failed to process Stripe withdrawal');
        }
      } else if (paymentMethod === 'paypal') {
        if (!paypalEmail) {
          toast.error('Please link your PayPal account in the main wallet screen first.');
          return;
        }
        toast.info(`Processing PayPal withdrawal to ${paypalEmail}...`);
        withdraw(val, category || 'General Expense', 'PayPal');
        setAmount('');
        setCategory('');
        setShowWithdraw(false);
      } else if (paymentMethod === 'crypto') {
        if (!bitcoinAddress) {
          toast.error('Please link your Bitcoin address in the main wallet screen first.');
          return;
        }
        toast.info(`Processing Crypto withdrawal to ${bitcoinAddress}...`);
        withdraw(val, category || 'General Expense', 'Bitcoin');
        setAmount('');
        setCategory('');
        setShowWithdraw(false);
      } else if (paymentMethod === 'usdt') {
        if (!bitcoinAddress) {
          toast.error('Please link your cryptocurrency address in the main wallet screen first to receive USDT.');
          return;
        }
        toast.info(`Processing USDT Stablecoin withdrawal to ${bitcoinAddress}...`);
        withdraw(val, category || 'General Expense', 'USDT');
        setAmount('');
        setCategory('');
        setShowWithdraw(false);
      } else if (paymentMethod === 'bank') {
        toast.info(`Processing Direct Bank Wire / Local Payout transfer...`);
        withdraw(val, category || 'General Expense', 'Bank Wire');
        setAmount('');
        setCategory('');
        setShowWithdraw(false);
      }
    }
  };

  const handlePrintTransactions = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions found matching your current filters to print.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to generate your Supreme Statement.');
      return;
    }

    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(tx => tx.type === 'withdraw' || tx.type === 'payment' || tx.type === 'lend' || tx.type === 'key-generation')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const sortedTxs = [...filteredTransactions].sort((a, b) => {
      const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
      const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
      return dateB - dateA;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supreme Statement - ${user?.name || 'User'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
            
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              padding: 50px; 
              color: #0c0c0c;
              line-height: 1.5;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 4px solid #d4af37; 
              padding-bottom: 30px; 
              margin-bottom: 40px; 
            }
            .logo-area {
              display: flex;
              flex-direction: column;
            }
            .logo { 
              font-size: 28px; 
              font-weight: 800; 
              letter-spacing: -0.02em;
              color: #000;
            }
            .logo span { color: #d4af37; }
            .statement-tag {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #888;
              margin-top: 4px;
            }
            .user-info { text-align: right; font-size: 13px; color: #444; }
            .user-info strong { color: #000; font-size: 16px; }
            
            .summary { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 24px; 
              margin-bottom: 40px; 
            }
            .summary-card { 
              background: #fbfbfb; 
              padding: 24px; 
              border-radius: 20px; 
              border: 1px solid #eee; 
            }
            .summary-card h4 { 
              margin: 0 0 8px 0; 
              color: #888; 
              font-size: 10px; 
              text-transform: uppercase; 
              letter-spacing: 0.15em; 
              font-weight: 800;
            }
            .summary-card p { 
              margin: 0; 
              font-size: 24px; 
              font-weight: 700; 
              letter-spacing: -0.01em;
            }
            
            table { 
              width: 100%; 
              border-collapse: separate; 
              border-spacing: 0;
            }
            th { 
              text-align: left; 
              background: #f4f4f4; 
              padding: 16px; 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 0.1em;
              color: #666; 
              font-weight: 800;
              border-bottom: 2px solid #ddd;
            }
            td { 
              padding: 16px; 
              border-bottom: 1px solid #eee; 
              font-size: 14px; 
              color: #333;
            }
            .amount { font-family: 'JetBrains Mono', monospace; font-weight: 600; text-align: right; }
            .income { color: #059669; }
            .expense { color: #dc2626; }
            
            .status-pill {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              background: #eee;
              color: #666;
            }
            .status-completed { background: #ecfdf5; color: #059669; }
            
            .footer { 
              margin-top: 80px; 
              text-align: center; 
              color: #aaa; 
              font-size: 11px; 
              border-top: 1px solid #eee; 
              padding-top: 30px; 
            }
            
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <div class="logo">SUPREME <span>WALLET</span></div>
              <div class="statement-tag">Official Transaction Log</div>
            </div>
            <div class="user-info">
              <strong>${user?.name || 'Anonymous User'}</strong><br/>
              ${user?.email || ''}<br/>
              Account ID: ${accountNumber || 'UNASSIGNED'}<br/>
              Rank: ${user?.rank || 'Bronze'}
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <h4>Closing Balance</h4>
              <p>$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="summary-card">
              <h4>Total Inflow</h4>
              <p class="income">+$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="summary-card">
              <h4>Total Outflow</h4>
              <p class="expense">-$${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="15%">Date</th>
                <th width="40%">Description</th>
                <th width="15%">Category</th>
                <th width="10%">Status</th>
                <th width="20%" style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTxs.map(tx => `
                <tr>
                  <td>${new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date).toLocaleDateString()}</td>
                  <td style="font-weight: 600;">${tx.description}</td>
                  <td>${tx.category}</td>
                  <td><span class="status-pill ${tx.status === 'completed' ? 'status-completed' : ''}">${tx.status}</span></td>
                  <td class="amount ${tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? 'income' : 'expense'}">
                    ${tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Statement generated on ${new Date().toLocaleString()} &bull; Transaction IDs verified via Supreme Blockchain Protocol &bull; All rights reserved.
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0 && val <= balance) {
      if (!recipient && !description) {
        toast.error('Please select a recipient or provide a description');
        return;
      }
      sendPayment(val, description || `Payment to ${recipient?.name || 'User'}`, category || 'Transfer', recipient?.id, recipient?.name);
      setAmount('');
      setDescription('');
      setCategory('');
      setRecipient(null);
      setUserSearchText('');
      setShowSend(false);
      toast.success('Funds sent successfully!');
    }
  };

  return (
    <FeatureLoader text="Supreme Wallet">
      <div className="min-h-screen bg-[#050505] p-4 md:p-8 relative overflow-hidden">
        {/* Cosmic space scenery: Galaxy, Starfield, and Golden Moon light */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Soft space vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,5,40,0.4)_0%,rgba(4,1,10,0.95)_100%)] opacity-95" />

          {/* Sovereign Crescent Moon (Pieces of crescent flash moon light) */}
          <div className="absolute top-24 right-[8%] w-60 h-60 hidden lg:block select-none pointer-events-none z-10">
            {/* Ambient Moon Glow behind pieces */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_70%)] blur-2xl rounded-full" />
            
            {/* Core Crescent Arc Layer 1 */}
            <motion.div
              animate={{
                opacity: [0.4, 0.95, 0.4],
                scale: [0.98, 1.02, 0.98],
                rotate: [15, 18, 15]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-8 w-36 h-36 rounded-full bg-transparent shadow-[16px_16px_0_0_rgba(252,211,77,0.9)] filter blur-[0.5px] drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            />

            {/* Core Crescent Arc Layer 2 - Shifter offset piece creating layered structure */}
            <motion.div
              animate={{
                opacity: [0.8, 0.3, 0.8],
                scale: [1.02, 0.98, 1.02],
                rotate: [10, 14, 10]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-8 right-8 w-36 h-36 rounded-full bg-transparent shadow-[12px_12px_0_0_rgba(245,158,11,0.7)] filter blur-[1px] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            />

            {/* Core Crescent Arc Layer 3 - Ultra thin flash flare piece */}
            <motion.div
              animate={{
                opacity: [0.1, 0.8, 0.1],
                scale: [0.95, 1.05, 0.95],
                rotate: [20, 15, 20]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-10 right-10 w-32 h-32 rounded-full bg-transparent shadow-[18px_18px_0_0_rgba(255,255,255,0.95)] filter blur-[0.2px] drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            />

            {/* Shard Piece 1 - Flashing auxiliary crescent fragment */}
            <motion.div
              animate={{
                opacity: [0.2, 0.7, 0.2],
                rotate: [-20, -10, -20],
                scale: [0.85, 0.9, 0.85]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-20 w-24 h-24 rounded-full bg-transparent shadow-[8px_8px_0_0_rgba(251,191,36,0.6)] drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
            />

            {/* Shard Piece 2 - Micro gold flare edge */}
            <motion.div
              animate={{
                opacity: [0.1, 0.9, 0.1],
                rotate: [45, 50, 45],
                scale: [1.1, 1.15, 1.1]
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-12 right-4 w-28 h-28 rounded-full bg-transparent shadow-[6px_6px_0_0_rgba(255,255,255,0.8)] blur-[0.5px]"
            />

            {/* Orbital Golden Rays / Corona Arcs (Pieces of glowing orbital rings) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-t border-r border-[var(--color-supreme-gold)]/15 rounded-full filter blur-[0.5px]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border-b border-l border-amber-500/10 rounded-full border-dashed"
            />
          </div>

          {/* Moonlight glow beam */}
          <div className="absolute top-0 right-[2%] w-[40vw] h-[60vh] bg-gradient-to-b from-amber-500/5 via-yellow-500/2 to-transparent blur-[60px] transform -rotate-12 hidden lg:block pointer-events-none" />

          {/* Floating Galaxy Nebulas */}
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 30, 0],
              y: [0, 20, 0],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[-15%] w-[800px] h-[800px] bg-purple-900/15 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{
              scale: [1, 1.25, 1],
              x: [0, -40, 0],
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[-15%] w-[700px] h-[700px] bg-pink-700/10 rounded-full blur-[140px]"
          />
          <motion.div 
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -15, 0],
              opacity: [0.12, 0.22, 0.12]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[50%] left-[25%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[110px]"
          />

          {/* Twinkling Star Field (42 stars of different settings) */}
          {[...Array(42)].map((_, i) => (
            <motion.div
              key={`main-star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                height: i % 4 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                top: `${(i * 9.7 + 5) % 96}%`,
                left: `${(i * 12.3 + i * 2 + 3) % 98}%`,
                boxShadow: i % 4 === 0 ? '0 0 10px rgba(255, 255, 255, 0.9), 0 0 4px rgba(251, 191, 36, 0.4)' : 'none'
              }}
              animate={{ 
                opacity: [0.15, 1, 0.15],
                scale: i % 5 === 0 ? [0.6, 1.3, 0.6] : [0.8, 1.1, 0.8]
              }}
              transition={{
                duration: 2.5 + (i % 5),
                repeat: Infinity,
                delay: (i * 0.13) % 4,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Animated Shooting Stars */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`shooting-star-${i}`}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-amber-200"
              style={{
                width: '90px',
                top: `${15 + i * 30}%`,
                left: `${10 + i * 25}%`,
                rotate: '-35deg',
                opacity: 0,
              }}
              animate={{
                x: [-100, 350],
                y: [-70, 245],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 12 + i * 15,
                delay: i * 6,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Ethereal Floating Space Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`float-dust-${i}`}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full blur-[1px]"
              style={{
                top: `${(i * 14.7 + 25) % 90}%`,
                left: `${(i * 19.3 + 12) % 92}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                opacity: [0.1, 0.6, 0.1]
              }}
              transition={{
                duration: 8 + (i % 6),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                Supreme <span className="text-[var(--color-supreme-gold)]">Wallet</span>
              </h1>
              <p className="text-gray-500 mt-1 font-medium">Manage your elite assets and global transactions.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="hidden sm:flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Secure & Encrypted</span>
              </div>
              <button 
                onClick={() => setShowKeyGen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Security Key
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
            <button
              onClick={() => setActiveSection('overview')}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeSection === 'overview' ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('transactions')}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeSection === 'transactions' ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveSection('leaderboard')}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeSection === 'leaderboard' ? "bg-[var(--color-supreme-gold)] text-black shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              Leaderboard
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeSection === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Security Key Prompt for New Users */}
        {!user?.securityKey && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Generate Your Security Key</h3>
                <p className="text-sm text-gray-500">New users must generate a security key for account protection and verification.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowKeyGen(true)}
              className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              Generate Now
            </button>
          </motion.div>
        )}

          {/* Main Balance Card & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] text-white shadow-2xl border border-white/10 group"
              >
                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Available Balance</p>
                      <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                        <span className="text-[var(--color-supreme-gold)]">$</span>{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h2>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
                      <WalletIcon className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => { setShowDeposit(true); setCategory(INCOME_CATEGORIES[0]); }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-[#d4af37] transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20"
                    >
                      <Plus className="w-5 h-5" /> Deposit
                    </button>
                    <button 
                      onClick={() => { setShowWithdraw(true); setCategory(EXPENSE_CATEGORIES[0]); }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md"
                    >
                      <ArrowUpRight className="w-5 h-5" /> Withdraw
                    </button>
                    <button 
                      onClick={() => { setShowSend(true); setCategory('Transfer'); }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" /> Send
                    </button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full blur-[100px] group-hover:bg-[var(--color-supreme-gold)]/10 transition-all duration-700" />
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-700" />
              </motion.div>

              {/* Supreme Ranking ID Section */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                      <Trophy className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Supreme Ranking ID</h3>
                      <p className="text-xs text-gray-500 mt-1">Used for generating exclusive gift cards.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Show ID</span>
                    <button 
                      onClick={() => setShowRankingId(!showRankingId)}
                      className={clsx(
                        "w-12 h-6 rounded-full transition-all relative",
                        showRankingId ? "bg-purple-600" : "bg-white/10"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        showRankingId ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Tag className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono text-lg font-black tracking-widest">
                      {showRankingId ? (user?.rankingId || 'NOT-GENERATED') : '••••-••••-••••-••••'}
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateRankingId}
                    disabled={!canUpdateRankingId || isUpdatingRankingId}
                    className={clsx(
                      "px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                      canUpdateRankingId && !isUpdatingRankingId
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/20"
                        : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                    )}
                  >
                    <RefreshCw className={clsx("w-5 h-5", isUpdatingRankingId && "animate-spin")} />
                    {isUpdatingRankingId ? 'Updating...' : 'Update ID'}
                  </button>
                </div>
                
                {!canUpdateRankingId && user?.rankingId && (
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
                    Your ID is already up to date with your {user.rank} rank.
                  </p>
                )}
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-4 hover:border-[var(--color-supreme-gold)]/30 transition-all group">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <ArrowDown className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Total Income</p>
                    <p className="text-2xl font-bold text-white tracking-tight">${summary.income.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-4 hover:border-red-500/30 transition-all group">
                  <div className="p-4 bg-red-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <ArrowUp className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Total Expenses</p>
                    <p className="text-2xl font-bold text-white tracking-tight">${summary.expenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Earning Trends Chart */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-emerald-500" /> Earning Trends
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Visual representation of your platform revenue.</p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                    {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTrendTab(tab)}
                        className={clsx(
                          "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          trendTab === tab ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realTrendData[trendTab]}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-supreme-gold)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-supreme-gold)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          border: '1px solid #333', 
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#fff'
                        }}
                        itemStyle={{ color: 'var(--color-supreme-gold)' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="var(--color-supreme-gold)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Earning Rates Section */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="w-6 h-6 text-[var(--color-supreme-gold)]" /> How to Earn Supreme Coins
                  </h3>
                  <div className="px-3 py-1 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--color-supreme-gold)]/20">
                    Active Rates
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[var(--color-supreme-gold)]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-yellow-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-yellow-500" />
                      </div>
                      <h4 className="font-bold text-white">Subscribe</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Earn coins for every subscription plan you join.</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-[var(--color-supreme-gold)]">+{settings.earningRateSubscription}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SUP / Sub</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <Edit2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <h4 className="font-bold text-white">Post Content</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Get rewarded for sharing high-quality posts.</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-[var(--color-supreme-gold)]">+{settings.earningRatePost}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SUP / Post</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h4 className="font-bold text-white">Connect</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Earn coins for building your network.</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-[var(--color-supreme-gold)]">+{settings.earningRateConnection}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SUP / Link</span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Category Breakdown Chart */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Financial Breakdown
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Income vs Expenses by category.</p>
                </div>
              </div>

              <div className="h-[400px] w-full">
                {Object.keys(summary.categoryBreakdown).length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
                    <p className="text-sm text-gray-500">No transaction data to visualize.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(summary.categoryBreakdown).map(([name, data]) => ({
                        name,
                        income: data.income,
                        expense: data.expense
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          border: '1px solid #333', 
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#fff'
                        }}
                        cursor={{ fill: 'white', opacity: 0.05 }}
                      />
                      <Bar 
                        dataKey="income" 
                        fill="var(--color-supreme-gold)" 
                        radius={[4, 4, 0, 0]} 
                        name="Income"
                        animationDuration={1500}
                      />
                      <Bar 
                        dataKey="expense" 
                        fill="#ef4444" 
                        radius={[4, 4, 0, 0]} 
                        name="Expense"
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {Object.entries(summary.categoryBreakdown).map(([cat, data]) => (
                  <div key={cat} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                        <Tag className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 truncate">{cat}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-emerald-500 uppercase tracking-widest">In</span>
                        <span className="text-white">${data.income.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-red-500 uppercase tracking-widest">Out</span>
                        <span className="text-white">${data.expense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Account Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 shadow-xl text-white group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <WalletIcon className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Internal Account
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">For platform transactions.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isAccountActive}
                        onChange={toggleAccountStatus}
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Account Number</p>
                  <p className={clsx("text-lg font-mono font-bold tracking-[0.2em]", isAccountActive ? "text-white" : "text-gray-500 line-through")}>
                    {accountNumber || 'Generating...'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAccountGen(true)}
                  className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> New Account ($2.80)
                </button>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/10 shadow-xl text-white group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Stripe Connect
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Link your real bank account.</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
                  <p className="text-lg font-bold text-white">
                    {isStripeConnected ? 'Connected' : stripeAccountId ? 'Pending Verification' : 'Not Connected'}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={handleLinkStripe}
                    className="flex-1 py-3 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {isStripeConnected ? 'Update Stripe' : 'Link Stripe'}
                  </button>
                  {isStripeConnected && (
                    <button 
                      onClick={handleViewStripeDashboard}
                      className="px-4 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                      title="Stripe Dashboard"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* PayPal Section */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/10 shadow-xl text-white group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-blue-500" /> PayPal
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Link your PayPal for fast payouts.</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
                  <p className="text-lg font-bold text-white">
                    {paypalEmail ? 'Connected' : 'Not Connected'}
                  </p>
                  {paypalEmail && <p className="text-xs text-gray-500 mt-1 truncate">{paypalEmail}</p>}
                </div>
                
                <div className="mt-6">
                  {showPaypalLink ? (
                    <div className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="PayPal Email Address"
                        value={newPaypalEmail}
                        onChange={(e) => setNewPaypalEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleLinkPaypal}
                          className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setShowPaypalLink(false)}
                          className="px-4 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowPaypalLink(true)}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> {paypalEmail ? 'Update' : 'Link PayPal'}
                      </button>
                      {paypalEmail && (
                        <button 
                          onClick={handleUnlinkPaypal}
                          className="px-4 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                          title="Unlink PayPal"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bitcoin Section */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/10 shadow-xl text-white group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Bitcoin className="w-6 h-6 text-orange-500" /> Bitcoin
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Link your BTC wallet for crypto transactions.</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
                  <p className="text-lg font-bold text-white">
                    {bitcoinAddress ? 'Connected' : 'Not Connected'}
                  </p>
                  {bitcoinAddress && <p className="text-xs text-gray-500 mt-1 truncate">{bitcoinAddress}</p>}
                </div>
                
                <div className="mt-6">
                  {showBitcoinLink ? (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Bitcoin Wallet Address"
                        value={newBitcoinAddress}
                        onChange={(e) => setNewBitcoinAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleLinkBitcoin}
                          className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 transition-all shadow-lg"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setShowBitcoinLink(false)}
                          className="px-4 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowBitcoinLink(true)}
                        className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> {bitcoinAddress ? 'Update' : 'Link BTC'}
                      </button>
                      {bitcoinAddress && (
                        <button 
                          onClick={handleUnlinkBitcoin}
                          className="px-4 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                          title="Unlink BTC"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supreme Feature IDs Section */}
            <div className="p-8 my-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0f1a] to-[#05080f] border border-blue-500/20 shadow-xl text-white group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-7 h-7 text-blue-500" /> Supreme Feature IDs
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Unique identifiers for engagement control and policy compliance.</p>
                        </div>
                        <a 
                            href="#/appeal"
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            Open Appeal Center <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from(new Set(SUPREME_FEATURES.map(f => f.category))).map(cat => (
                            <div key={cat} className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {cat}
                                </h4>
                                <div className="space-y-2">
                                    {SUPREME_FEATURES.filter(f => f.category === cat).map(feature => (
                                        <div 
                                            key={feature.id} 
                                            className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all flex justify-between items-center group/feature"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-200">{feature.name}</span>
                                                <span className="text-[9px] font-mono text-gray-500 mt-0.5 tracking-tighter uppercase">{feature.category}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-1 rounded border border-white/10 text-blue-400 group-hover/feature:border-blue-500/50 transition-all">
                                                    {feature.id}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl">
                        <div className="flex gap-4">
                            <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-blue-200">How to use Feature IDs?</p>
                                <p className="text-xs text-blue-300/80 leading-relaxed">
                                    Feature IDs are unique identifiers used by Supreme Admin to manage user engagement. If a feature is restricted for policy violation, use the ID above in the Appeal Center to request unlocking. These IDs also help track and report specific activity issues.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Key Section */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a0a0a] to-[#0a0000] border border-red-500/20 shadow-xl text-white group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-red-500 flex items-center gap-2">
                    <Key className="w-6 h-6" /> Account Security Key
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">Your 16-character key for account control and verification.</p>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{keyTimeLeft}</span>
                </div>
              </div>

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group-hover:border-white/10 transition-all">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.2em] mb-2">Current Active Key</p>
                  <p className="text-2xl font-mono font-bold tracking-[0.3em] text-red-500">
                    {user?.securityKey || 'XXXX-XXXX-XXXX-XXXX'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowKeyGen(true)}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" /> Generate New Key
                </button>
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generating a new key costs <span className="text-red-500 font-bold">$2.50</span>. 
                  The old key will expire immediately upon generation. This key is required for every login to ensure your account remains under your absolute control.
                </p>
              </div>
            </div>

            {/* Earning Boost & Follower Earnings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 shadow-xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-[var(--color-supreme-gold)]" /> Earning Boost
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Increase all your earnings by 5% across the platform.</p>
                    </div>
                    {isBoosted ? (
                      <div className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-md flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Active</span>
                      </div>
                    ) : (
                      <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Inactive</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/10 transition-all">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Current Multiplier</p>
                      <p className="text-3xl font-display font-bold text-white">
                        {isBoosted ? '1.05x' : '1.00x'}
                      </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/10 transition-all">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Subscription Status</p>
                      {isBoosted ? (
                        <div>
                          <p className="text-sm font-bold text-white">Yearly Plan</p>
                          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expires: {new Date(boostExpiry!).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">$100.00 / Year</p>
                          <button 
                            onClick={() => setShowBoostModal(true)}
                            className="py-1.5 px-4 bg-[var(--color-supreme-gold)] text-black text-xs font-bold rounded-lg hover:bg-white transition-all shadow-lg"
                          >
                            Boost Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-[var(--color-supreme-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-supreme-gold)]/10 transition-all duration-700" />
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/10 shadow-xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <Users className="w-7 h-7 text-[var(--color-supreme-gold)]" /> Follower Earnings
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Earn passively from your growing audience.</p>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Passive</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/10 transition-all">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Current Rate</p>
                      <p className="text-2xl font-display font-bold text-white">
                        $0.01111 <span className="text-sm font-sans font-normal text-gray-500">/ 1,000 Followers</span>
                      </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md group-hover:border-white/10 transition-all">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Your Estimated Earnings</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-white">
                            ${(calculateFollowerEarnings(user?.followers || 0)).toFixed(5)}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">Based on {user?.followers || 0} followers</p>
                        </div>
                        <button 
                          onClick={() => receivePayment(calculateFollowerEarnings(user?.followers || 0), 'Follower Earning Payout', 'Earning')}
                          disabled={!user?.followers || user.followers < 1000}
                          className="py-1.5 px-4 bg-[var(--color-supreme-gold)] text-black text-xs font-bold rounded-lg hover:bg-white transition-all shadow-lg disabled:opacity-50"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
              </div>
            </div>


            {/* Bank House & Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank House */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Landmark className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Bank House
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Analysis of your platform earnings.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Daily</p>
                    <p className="text-lg font-bold text-white">${earnings.daily.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Weekly</p>
                    <p className="text-lg font-bold text-white">${earnings.weekly.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly</p>
                    <p className="text-lg font-bold text-white">${earnings.monthly.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Yearly</p>
                    <p className="text-lg font-bold text-white">${earnings.yearly.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Unclaimed</p>
                    <p className="text-2xl font-bold text-emerald-500">${earnings.unclaimed.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={handleClaimEarnings}
                    disabled={earnings.unclaimed <= 0}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Add to Wallet
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Saved Cards
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Manage your payment methods.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddCard(true)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  {savedCards.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No cards saved yet.</p>
                  ) : (
                    savedCards.map(card => (
                      <div key={card.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-[var(--color-supreme-gold)] rounded flex items-center justify-center text-black text-[10px] font-bold italic">
                            {card.brand}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">•••• {card.last4}</p>
                            <p className="text-[10px] text-gray-500">Expires {card.expMonth}/{card.expYear}</p>
                          </div>
                        </div>
                        {card.isDefault && (
                          <span className="text-[10px] font-bold text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 px-2 py-1 rounded-md uppercase tracking-widest">Default</span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <p className="text-sm font-bold text-white">Auto-Deduct Subs</p>
                    <p className="text-[10px] text-gray-500 mt-1">Charge default card when subs expire.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={autoDeductSubs}
                      onChange={() => setAutoDeductSubs(!autoDeductSubs)}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-supreme-gold)]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Supreme Feature IDs Section */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Supreme Feature IDs
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Chat ID', value: user?.chatId },
                  { label: 'Network ID', value: user?.networkId },
                  { label: 'Marketplace ID', value: user?.marketId },
                  { label: 'Media ID', value: user?.mediaId },
                  { label: 'Vibes ID', value: user?.vibesId },
                  { label: 'Ads ID', value: user?.adsId },
                  { label: 'Stream ID', value: user?.streamId }
                ].map((idInfo, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{idInfo.label}</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{idInfo.value || 'Not Generated'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rank Privileges Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 shadow-xl text-white group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Rank Perks
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Your elite status benefits.</p>
                  </div>
                  <div className="px-3 py-1 bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/20 rounded-full">
                    <span className="text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-widest">{user?.rank || 'Bronze'}</span>
                  </div>
                </div>

                {(() => {
                  const currentRank = user?.rank || 'Bronze';
                  const rankData = getRankData(currentRank);
                  const rankList = Object.keys(RANK_BENEFITS);
                  const currentIndex = rankList.findIndex(r => r.toLowerCase() === currentRank.toLowerCase());
                  const nextRank = rankList[currentIndex + 1];
                  
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Fee Rate</p>
                          <p className="text-xl font-bold text-white">{rankData.feeReduction}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Earnings</p>
                          <p className="text-xl font-bold text-white">{rankData.earningMultiplier}</p>
                        </div>
                      </div>

                      {nextRank && nextRank !== 'Official' && (
                        <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Next: {nextRank}</p>
                            {(() => {
                              const nextRankData = RANK_BENEFITS[nextRank];
                              const reqs = nextRankData.requirements;
                              const balanceProgress = Math.min(100, (balance / reqs.minBalance) * 100) || 0;
                              const txProgress = Math.min(100, (transactions.length / reqs.minTransactions) * 100) || 0;
                              const followerProgress = Math.min(100, ((user?.followers || 0) / reqs.minFollowers) * 100) || 0;
                              const totalProgress = (balanceProgress + txProgress + followerProgress) / 3;
                              return <span className="text-xs font-bold text-amber-500">{totalProgress.toFixed(0)}%</span>;
                            })()}
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            {(() => {
                              const nextRankData = RANK_BENEFITS[nextRank];
                              const reqs = nextRankData.requirements;
                              const balanceProgress = Math.min(100, (balance / reqs.minBalance) * 100) || 0;
                              const txProgress = Math.min(100, (transactions.length / reqs.minTransactions) * 100) || 0;
                              const followerProgress = Math.min(100, ((user?.followers || 0) / reqs.minFollowers) * 100) || 0;
                              const totalProgress = (balanceProgress + txProgress + followerProgress) / 3;
                              return (
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${totalProgress}%` }}
                                  className="h-full bg-amber-500"
                                />
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => window.location.href = '/profile?tab=rank'}
                        className="w-full py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 text-sm"
                      >
                        View Rank Requirements
                      </button>
                    </div>
                  );
                })()}
              </div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--color-supreme-gold)]/5 rounded-full blur-3xl" />
            </motion.div>

            {/* Boost Status Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                "p-8 rounded-[2.5rem] border shadow-xl text-white group relative overflow-hidden",
                isBoosted 
                  ? "bg-gradient-to-br from-emerald-900 to-black border-emerald-500/20" 
                  : "bg-gradient-to-br from-gray-900 to-black border-white/10"
              )}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Zap className={clsx("w-6 h-6", isBoosted ? "text-emerald-400" : "text-gray-500")} /> Earning Boost
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Multiply your platform revenue.</p>
                  </div>
                  {isBoosted && (
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                  )}
                </div>

                {isBoosted ? (
                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Active Multiplier</p>
                      <p className="text-4xl font-bold text-emerald-400">
                        {user?.boostMultiplier ? user.boostMultiplier.toFixed(1) : '1.5'}x
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Expires In</p>
                          <p className="text-sm font-bold text-white">
                            {boostExpiry ? (() => {
                              const diff = new Date(boostExpiry).getTime() - Date.now();
                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                              return `${days}d ${hours}h`;
                            })() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowBoostModal(true)}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all border border-emerald-500/20"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-400 mb-6">No active boost. You're missing out on up to 2x earnings!</p>
                      <button 
                        onClick={() => setShowBoostModal(true)}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-[var(--color-supreme-gold)] transition-all shadow-xl"
                      >
                        Activate Boost
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {isBoosted && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />}
            </motion.div>

            {/* Daily Streak & Login Rewards Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.15 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#1c1917] via-[#0a0a0a] to-[#0c0a09] border border-amber-500/20 shadow-xl text-white relative overflow-hidden group"
            >
              <div className="relative z-10">
                {!isStreakWindowExpired ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                          <Flame className="w-6 h-6 text-amber-500 animate-pulse" /> Daily Streak
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Earn free Supreme Coins every 24 hours.</p>
                      </div>
                      <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest whitespace-nowrap">
                          {(() => {
                            const userId = user?.uid || 'guest';
                            const localStreak = parseInt(localStorage.getItem(`daily_streak_${userId}`) || '0', 10);
                            return user?.dailyStreak !== undefined ? user.dailyStreak : localStreak;
                          })()} Day Streak
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Streak Summary Info box */}
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Availability Status</p>
                          <p className="text-xs font-bold text-white">
                            {(() => {
                              const today = new Date();
                              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                              const userId = user?.uid || 'guest';
                              const localLastClaimed = localStorage.getItem(`daily_last_claimed_${userId}`) || '';
                              const isClaimed = user?.lastDailyBonusClaimed === todayStr || localLastClaimed === todayStr;
                              return isClaimed ? 'Claimed for Today' : 'Bonus Available Today!';
                            })()}
                          </p>
                        </div>
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shrink-0">
                          <Gift className="w-5 h-5 ml-0" />
                        </div>
                      </div>

                      {/* Actions buttons to dispatch Custom Events code */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-daily-bonus', { detail: { tab: 'claim' } }));
                          }}
                          className="py-3 px-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all font-display text-xs text-center uppercase tracking-wider shadow-lg shadow-amber-500/15 cursor-pointer"
                        >
                          {(() => {
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            const userId = user?.uid || 'guest';
                            const localLastClaimed = localStorage.getItem(`daily_last_claimed_${userId}`) || '';
                            const isClaimed = user?.lastDailyBonusClaimed === todayStr || localLastClaimed === todayStr;
                            return isClaimed ? 'View Board' : 'Claim Reward';
                          })()}
                        </button>
                        <button
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-daily-bonus', { detail: { tab: 'history' } }));
                          }}
                          className="py-3 px-4 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 text-xs text-center uppercase tracking-wider font-display flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 shrink-0" />
                          Claims Log
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center gap-2.5 text-red-400 mb-2">
                      <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-black uppercase tracking-wider text-red-400">Claiming Window Closed</h3>
                        <p className="text-[10px] text-neutral-400">365-Day Daily Login Streak Allowance Complete</p>
                      </div>
                    </div>
                    <div className="p-4 bg-red-500/[0.02] border border-red-500/10 rounded-2xl text-[11px] text-neutral-400 leading-relaxed">
                      Your eligibility for daily bonus claiming has permanently completed under system regulations. Detailed progression and analytics remain visible for audit purposes below.
                    </div>
                  </div>
                )}

                {/* Access & Session Analytics Area */}
                <div className="mt-4">
                  <StreakAnalysisArea />
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            </motion.div>

            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Recent Activity
                </h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrintTransactions}
                    className="p-2 transition-colors border border-white/10 rounded-lg hover:bg-white/10 group"
                    title="Print Statement"
                  >
                    <Printer className="w-4 h-4 text-gray-500 group-hover:text-[var(--color-supreme-gold)]" />
                  </button>
                  <button 
                    onClick={() => setActiveSection('transactions')}
                    className="text-[10px] font-bold text-[var(--color-supreme-gold)] hover:underline uppercase tracking-[0.2em]"
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                      <History className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-gray-500 font-medium">No transactions yet.</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={clsx(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                          tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded-md font-bold uppercase border border-white/5">{tx.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={clsx(
                          "text-base font-bold",
                          tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? "text-emerald-500" : "text-red-500"
                        )}>
                          {tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
        ) : activeSection === 'transactions' ? (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <History className="w-7 h-7 text-[var(--color-supreme-gold)]" /> Transaction History
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={handlePrintTransactions}
                      className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Detailed Statement
                    </button>
                    <div className="relative flex-1 md:w-64">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-45" />
                      <input 
                        type="text" 
                        placeholder="Search transactions..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                      />
                    </div>
                    <select 
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    >
                      <option value="all" className="bg-[#0a0a0a]">All Types</option>
                      <option value="deposit" className="bg-[#0a0a0a]">Deposits</option>
                      <option value="withdraw" className="bg-[#0a0a0a]">Withdrawals</option>
                      <option value="payment" className="bg-[#0a0a0a]">Payments</option>
                      <option value="receive" className="bg-[#0a0a0a]">Received</option>
                      <option value="bet-payout" className="bg-[#0a0a0a]">Bet Payouts</option>
                      <option value="lend" className="bg-[#0a0a0a]">Lent</option>
                      <option value="borrow" className="bg-[#0a0a0a]">Borrowed</option>
                    </select>
                    <select 
                      value={txCategoryFilter}
                      onChange={(e) => setTxCategoryFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                    >
                      <option value="all" className="bg-[#0a0a0a]">All Categories</option>
                      {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, 'Transfer', 'Fee', 'Subscription', 'Earning', 'Loan', 'Betting'].map(cat => (
                        <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={txStartDate}
                        onChange={(e) => setTxStartDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                      <span className="text-gray-500 text-xs">-</span>
                      <input 
                        type="date" 
                        value={txEndDate}
                        onChange={(e) => setTxEndDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-[var(--color-supreme-gold)]"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                      <button 
                        onClick={() => {
                          if (txSortBy === 'date') setTxSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else setTxSortBy('date');
                        }}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          txSortBy === 'date' ? "bg-[var(--color-supreme-gold)] text-black" : "text-gray-500 hover:text-white"
                        )}
                      >
                        Date {txSortBy === 'date' && (txSortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                      <button 
                        onClick={() => {
                          if (txSortBy === 'amount') setTxSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else setTxSortBy('amount');
                        }}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          txSortBy === 'amount' ? "bg-[var(--color-supreme-gold)] text-black" : "text-gray-500 hover:text-white"
                        )}
                      >
                        Amount {txSortBy === 'amount' && (txSortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <History className="w-12 h-12 text-gray-700" />
                      </div>
                      <p className="text-gray-500 font-medium">No transactions found matching your filters.</p>
                      <button 
                        onClick={() => { setTxSearch(''); setTxTypeFilter('all'); setTxCategoryFilter('all'); setTxStartDate(''); setTxEndDate(''); }}
                        className="mt-4 text-[var(--color-supreme-gold)] font-bold hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                          <div className="flex items-center gap-6 min-w-0">
                            <div className={clsx(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                              tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-lg font-bold text-white truncate">{tx.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(tx.date?.seconds ? tx.date.seconds * 1000 : tx.date).toLocaleString()}
                                </span>
                                <span className="text-[10px] px-3 py-1 bg-white/5 text-gray-400 rounded-full font-bold uppercase border border-white/5 tracking-widest">{tx.category}</span>
                                <span className={clsx(
                                  "text-[10px] px-3 py-1 rounded-full font-bold uppercase border tracking-widest",
                                  tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>{tx.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={clsx(
                              "text-2xl font-bold tracking-tight",
                              tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? "text-emerald-500" : "text-red-500"
                            )}>
                              {tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'borrow' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-widest">ID: {tx.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlobalRankings />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {(showDeposit || showWithdraw || showSend || showKeyGen || showAccountGen || showBoostModal || showAddCard) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => { setShowDeposit(false); setShowWithdraw(false); setShowSend(false); setShowKeyGen(false); setShowAccountGen(false); setShowBoostModal(false); setShowAddCard(false); }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
              >
                {showAddCard ? (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Add New Card
                      </h3>
                      <button onClick={() => setShowAddCard(false)} className="text-gray-500 hover:text-white transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setSavedCards([...savedCards, { id: Date.now().toString(), last4: '1234', brand: 'Mastercard', expMonth: 10, expYear: 2026, isDefault: false }]);
                      setShowAddCard(false);
                      toast.success('Card added successfully!');
                    }} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none font-medium text-white placeholder:text-gray-700" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none font-medium text-white placeholder:text-gray-700" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">CVC</label>
                          <input type="text" placeholder="123" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none font-medium text-white placeholder:text-gray-700" required />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-4 mt-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--color-supreme-gold)]/10">
                        Save Card
                      </button>
                    </form>
                  </div>
                ) : showBoostModal ? (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--color-supreme-gold)]/20 rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/10">
                          <Zap className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">Earning Boost Plans</h3>
                          <p className="text-xs text-gray-500 font-medium">Amplify your platform earnings instantly</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowBoostModal(false)} 
                        className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">Exit</span>
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {BOOST_PLANS.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedBoostPlan(plan)}
                            className={clsx(
                              "relative overflow-hidden p-6 rounded-3xl border transition-all text-left group",
                              selectedBoostPlan.id === plan.id 
                                ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 ring-1 ring-[var(--color-supreme-gold)]/50" 
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <div className={clsx("absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 blur-2xl rounded-full", plan.color)} />
                            
                            <div className="flex justify-between items-start mb-4">
                              <div className={clsx("p-3 rounded-2xl bg-gradient-to-br shadow-lg", plan.color)}>
                                <Zap className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-white">${plan.price}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plan.durationDays} Days</p>
                              </div>
                            </div>
                            
                            <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">{plan.description}</p>
                            
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <span className="text-[10px] font-bold text-emerald-500">+{((plan.multiplier - 1) * 100).toFixed(0)}% EARNINGS</span>
                              </div>
                              {selectedBoostPlan.id === plan.id && (
                                <div className="ml-auto w-6 h-6 bg-[var(--color-supreme-gold)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-supreme-gold)]/20">
                                  <Check className="w-4 h-4 text-black" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Rank Synergy Info */}
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Rank Synergy Bonus</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Current Rank</p>
                              <p className="text-lg font-bold text-white">{user?.rank || 'Bronze'}</p>
                              <p className="text-xs text-amber-500 font-bold">{getRankData(user?.rank || 'Bronze').earningMultiplier} Base Rate</p>
                            </div>
                            <div className="flex items-center justify-center">
                              <Plus className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Total Multiplier</p>
                              <p className="text-lg font-bold text-emerald-500">
                                {(parseFloat(getRankData(user?.rank || 'Bronze').earningMultiplier) * selectedBoostPlan.multiplier).toFixed(2)}x
                              </p>
                              <p className="text-xs text-gray-500">Combined earning power</p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Payment Method</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
                          <button type="button" onClick={() => setPaymentMethod('stripe')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'stripe' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/5" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                            <CreditCard className="w-5 h-5" /> Stripe
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('paypal')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'paypal' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/5" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                            <DollarSign className="w-5 h-5" /> PayPal
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('crypto')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'crypto' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/5" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                            <Bitcoin className="w-5 h-5" /> Bitcoin
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('usdt')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'usdt' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/5" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                            <Coins className="w-5 h-5" /> USDT
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('bank')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all col-span-2 sm:col-span-1", paymentMethod === 'bank' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] shadow-lg shadow-[var(--color-supreme-gold)]/5" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                            <Landmark className="w-5 h-5" /> Bank Wire
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => setShowBoostModal(false)}
                          className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleActivateBoost}
                          className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--color-supreme-gold)]/20"
                        >
                          Activate {selectedBoostPlan.name}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : showAccountGen ? (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Generate New Account
                      </h3>
                      <button onClick={() => setShowAccountGen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    <div className="space-y-8 text-center">
                      <div className="w-24 h-24 bg-[var(--color-supreme-gold)]/5 rounded-full flex items-center justify-center mx-auto border border-[var(--color-supreme-gold)]/10">
                        <WalletIcon className="w-10 h-10 text-[var(--color-supreme-gold)]" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-white">Confirm Generation</h4>
                        <p className="text-sm text-gray-500">
                          This action will deduct <span className="text-[var(--color-supreme-gold)] font-bold">$2.80</span> from your balance.
                        </p>
                      </div>
                      <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20 text-left">
                        <p className="text-xs text-red-400 font-medium leading-relaxed flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                          Your old internal account number will become invalid forever. Any pending internal transfers to the old number will fail.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setShowAccountGen(false)}
                          className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleGenerateAccount}
                          className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl hover:bg-white transition-all shadow-xl shadow-[var(--color-supreme-gold)]/20"
                        >
                          Confirm ($2.80)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : showKeyGen ? (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="w-6 h-6 text-amber-500" /> Generate Security Key
                      </h3>
                      <button onClick={() => setShowKeyGen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    <div className="space-y-8 text-center">
                      <div className="w-24 h-24 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
                        <RefreshCw className="w-10 h-10 text-amber-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-white">Confirm Key Generation</h4>
                        <p className="text-sm text-gray-500">
                          This action will deduct <span className="text-amber-500 font-bold">$2.50</span> from your balance and invalidate your current key.
                        </p>
                      </div>
                      <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-left">
                        <p className="text-xs text-amber-400 font-medium leading-relaxed flex items-start gap-3">
                          <Info className="w-5 h-5 shrink-0 text-amber-500" />
                          Your new 16-character key will be generated instantly and will be valid for 30 days.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setShowKeyGen(false)}
                          className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleGenerateKey}
                          className="flex-1 py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
                        >
                          Confirm ($2.50)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {showDeposit ? <Plus className="w-6 h-6 text-emerald-500" /> : showWithdraw ? <ArrowUpRight className="w-6 h-6 text-red-500" /> : <Send className="w-6 h-6 text-blue-500" />}
                        {showDeposit ? 'Deposit Funds' : showWithdraw ? 'Withdraw Funds' : 'Send Payment'}
                      </h3>
                      <button onClick={() => { setShowDeposit(false); setShowWithdraw(false); setShowSend(false); }} className="text-gray-500 hover:text-white transition-colors">
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    
                    <form onSubmit={showDeposit ? handleDeposit : showWithdraw ? handleWithdraw : handleSend} className="space-y-8">
                      {showSend && (
                        <div className="space-y-4">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Select Recipient</label>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5">
                              <Users className="w-full h-full" />
                            </div>
                            <input 
                              type="text"
                              placeholder="Search users by name..."
                              value={recipient ? recipient.name : userSearchText}
                              onChange={(e) => {
                                if (recipient) setRecipient(null);
                                setUserSearchText(e.target.value);
                              }}
                              className="w-full pl-14 pr-12 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-white placeholder:text-gray-800"
                            />
                            {isLoadingUsers && (
                              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                              </div>
                            )}
                            {recipient && (
                              <button 
                                type="button"
                                onClick={() => { setRecipient(null); setUserSearchText(''); }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          {/* User List Menu */}
                          <AnimatePresence>
                            {(userSearchText.length > 0 || isLoadingUsers) && !recipient && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute w-[calc(100%-4rem)] md:w-[calc(100%-4rem)] bg-[#111] border border-white/10 rounded-2xl p-2 max-h-60 overflow-y-auto custom-scrollbar shadow-2xl z-[100] mt-1"
                              >
                                {isLoadingUsers ? (
                                  <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
                                     <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                     <p className="text-[10px] font-bold uppercase tracking-widest">Searching experts...</p>
                                  </div>
                                ) : availableUsers.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-1">
                                    {availableUsers.map((u, idx) => (
                                      <button
                                        key={u.uid || u.id || `user-${idx}`}
                                        type="button"
                                        onClick={() => {
                                          setRecipient({ id: u.uid || u.id, name: u.name, email: u.email, avatar: u.avatar });
                                          setUserSearchText(u.name);
                                          setDescription(`Payment to ${u.name}`);
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group text-left w-full"
                                      >
                                        <img 
                                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                                          alt="" 
                                          className="w-10 h-10 rounded-full border border-white/10" 
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col">
                                            <p className="font-bold text-white text-sm group-hover:text-blue-500 transition-colors truncate">{u.name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">Bal: ${u.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                          </div>
                                          <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-8 text-center text-gray-500">
                                    <p className="text-xs font-bold uppercase tracking-widest">No match found</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {recipient && (
                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                              <img 
                                src={recipient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=random`} 
                                alt="" 
                                className="w-8 h-8 rounded-full border border-white/10" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-white tracking-widest uppercase">Verified Recipient</p>
                                <p className="text-sm font-bold text-blue-500">{recipient.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {(showDeposit || showWithdraw) && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Payment Method</label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3 mb-4">
                            <button type="button" onClick={() => setPaymentMethod('stripe')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'stripe' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                              <CreditCard className="w-5 h-5" /> Stripe
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('paypal')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'paypal' ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                              <DollarSign className="w-5 h-5" /> PayPal
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('crypto')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'crypto' ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                              <Bitcoin className="w-5 h-5" /> Bitcoin
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('usdt')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all", paymentMethod === 'usdt' ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                              <Coins className="w-5 h-5" /> USDT
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('bank')} className={clsx("p-3 rounded-2xl border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 transition-all col-span-2 sm:col-span-1", paymentMethod === 'bank' ? "border-violet-500 bg-violet-500/10 text-violet-400" : "border-white/10 text-gray-500 hover:bg-white/5")}>
                              <Landmark className="w-5 h-5" /> Bank Wire
                            </button>
                          </div>

                          {showWithdraw && (
                            <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/5 rounded-lg">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Processing Time</p>
                                    <p className="text-xs font-bold text-white">{WITHDRAWAL_METHODS[paymentMethod as keyof typeof WITHDRAWAL_METHODS]?.processingTime || '1-3 Business Days'}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Minimum</p>
                                  <p className="text-xs font-bold text-[var(--color-supreme-gold)]">${WITHDRAWAL_METHODS[paymentMethod as keyof typeof WITHDRAWAL_METHODS]?.min || 50}</p>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                <p className="text-[10px] text-amber-200/60 leading-relaxed italic">
                                  * Withdrawals are subject to verification. Ensure your linked account details are correct to avoid delays.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(showDeposit || showWithdraw) && paymentMethod === 'stripe' && (
                        <div className={clsx("p-5 rounded-2xl border flex items-start gap-4", isStripeConnected ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                          {isStripeConnected ? <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />}
                          <p className={clsx("text-xs font-medium leading-relaxed", isStripeConnected ? "text-blue-400" : "text-amber-400")}>
                            {isStripeConnected ? `Connected to Stripe (${stripeAccountId})` : 'Please link your Stripe account in the main wallet screen first.'}
                          </p>
                        </div>
                      )}

                      {(showDeposit || showWithdraw) && paymentMethod === 'paypal' && (
                        <div className={clsx("p-5 rounded-2xl border flex items-start gap-4", paypalEmail ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                          {paypalEmail ? <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />}
                          <p className={clsx("text-xs font-medium leading-relaxed", paypalEmail ? "text-blue-400" : "text-amber-400")}>
                            {paypalEmail ? `Connected to PayPal (${paypalEmail})` : 'Please link your PayPal account in the main wallet screen first.'}
                          </p>
                        </div>
                      )}

                      {(showDeposit || showWithdraw) && paymentMethod === 'crypto' && (
                        <div className="space-y-4">
                          <div className={clsx("p-5 rounded-2xl border flex items-start gap-4", bitcoinAddress ? "bg-orange-500/10 border-orange-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                            {bitcoinAddress ? <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />}
                            <p className={clsx("text-xs font-medium leading-relaxed", bitcoinAddress ? "text-orange-400" : "text-amber-400")}>
                              {bitcoinAddress ? `Connected to Bitcoin (${bitcoinAddress.substring(0, 10)}...)` : 'Please link your Bitcoin address in the main wallet screen first.'}
                            </p>
                          </div>
                          
                          {showDeposit && (
                            <div className="p-5 rounded-2xl border bg-black/40 border-orange-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
                                  <Bitcoin className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
                                  <span>Platform Deposit Wallet</span>
                                </div>
                                <span className="text-[9px] bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/25 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                  Instant Mobile Scan
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                Scan the generated QR code using any crypto wallet on your mobile device (supports Coinbase, Binance, Trust Wallet, MetaMask, etc.) or copy the deposit address below:
                              </p>

                              {/* Interactive QR Code Card */}
                              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                                  <QRCodeSVG
                                    id="btc-qr-code"
                                    value={`bitcoin:${settings.bitcoinWalletAddress || '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm'}`}
                                    size={130}
                                    level="H"
                                    includeMargin={true}
                                  />
                                </div>
                                <div className="flex-1 space-y-3.5 w-full text-center sm:text-left">
                                  <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Blockchain Network</span>
                                    <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                      <span className="w-2 h-2 bg-orange-500 rounded-full" />
                                      Bitcoin (BTC Mainnet)
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Official Wallet Address</span>
                                    <div className="flex items-center gap-2 bg-black/50 border border-white/5 px-3 py-2.5 rounded-xl">
                                      <span className="font-mono text-[11px] text-orange-300 select-all break-all flex-1 text-left">
                                        {settings.bitcoinWalletAddress || '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(settings.bitcoinWalletAddress || '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm');
                                          toast.success('Platform Bitcoin address copied!');
                                        }}
                                        className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                        title="Copy Address"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(settings.bitcoinWalletAddress || '151nvA1dL4FhKzzKye5o48quApNFnXS3Qm');
                                    toast.success('Platform Bitcoin address copied to clipboard!');
                                  }}
                                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
                                >
                                  Copy Wallet Address
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const svgElement = document.getElementById('btc-qr-code') as unknown as SVGElement;
                                    if (svgElement) {
                                      const svgString = new XMLSerializer().serializeToString(svgElement);
                                      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                                      const blobURL = window.URL.createObjectURL(svgBlob);
                                      const image = new Image();
                                      image.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = 300;
                                        canvas.height = 300;
                                        const context = canvas.getContext('2d');
                                        if (context) {
                                          context.fillStyle = '#ffffff';
                                          context.fillRect(0, 0, 300, 300);
                                          context.drawImage(image, 25, 25, 250, 250);
                                          const png = canvas.toDataURL('image/png');
                                          const downloadLink = document.createElement('a');
                                          downloadLink.href = png;
                                          downloadLink.download = 'bitcoin_deposit_qr.png';
                                          document.body.appendChild(downloadLink);
                                          downloadLink.click();
                                          document.body.removeChild(downloadLink);
                                          toast.success('QR Code saved to downloads folder!');
                                        }
                                      };
                                      image.src = blobURL;
                                    } else {
                                      toast.error('Could not locate QR code SVG');
                                    }
                                  }}
                                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <QrCode className="w-3.5 h-3.5" /> Download QR Code
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {(showDeposit || showWithdraw) && paymentMethod === 'usdt' && (
                        <div className="space-y-4">
                          <div className="p-5 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 flex items-start gap-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-400">Secure USDT Gateway Active</p>
                              <p className="text-[10px] text-gray-400 leading-relaxed">
                                Universal stablecoin settlement enabled. Supports TRC20, ERC20, and Polygon networks. Fast execution with minimal gas.
                              </p>
                            </div>
                          </div>
                          
                          {showDeposit && (
                            <div className="p-5 rounded-2xl border bg-black/40 border-emerald-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                  <Coins className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                                  <span>Official Platform USDT Wallet</span>
                                </div>
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/25 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                  Low Fee TRC20
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                Scan the QR code with your mobile crypto app or copy the address. Ensure you choose the correct blockchain network to prevent transaction loss.
                              </p>

                              {/* Interactive QR Code Card */}
                              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                                  <QRCodeSVG
                                    id="usdt-qr-code"
                                    value={settings.usdtWalletAddress || "TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk"}
                                    size={130}
                                    level="H"
                                    includeMargin={true}
                                  />
                                </div>
                                <div className="flex-1 space-y-3.5 w-full text-center sm:text-left">
                                  <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Blockchain Network</span>
                                    <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                      Tether USD (TRC20 / Tron Network)
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Official Wallet Address</span>
                                    <div className="flex items-center gap-2 bg-black/50 border border-white/5 px-3 py-2.5 rounded-xl">
                                      <span className="font-mono text-[11px] text-emerald-300 select-all break-all flex-1 text-left">
                                        {settings.usdtWalletAddress || "TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk"}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(settings.usdtWalletAddress || "TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk");
                                          toast.success('Platform USDT address copied!');
                                        }}
                                        className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                        title="Copy Address"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(settings.usdtWalletAddress || "TYfVfKzQo3qF2p5fKk8fKk8fKk8fKk8fKk");
                                    toast.success('Platform USDT address copied to clipboard!');
                                  }}
                                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                                >
                                  Copy USDT Address
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const svgElement = document.getElementById('usdt-qr-code') as unknown as SVGElement;
                                    if (svgElement) {
                                      const svgString = new XMLSerializer().serializeToString(svgElement);
                                      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                                      const blobURL = window.URL.createObjectURL(svgBlob);
                                      const image = new Image();
                                      image.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = 300;
                                        canvas.height = 300;
                                        const context = canvas.getContext('2d');
                                        if (context) {
                                          context.fillStyle = '#ffffff';
                                          context.fillRect(0, 0, 300, 300);
                                          context.drawImage(image, 25, 25, 250, 250);
                                          const png = canvas.toDataURL('image/png');
                                          const downloadLink = document.createElement('a');
                                          downloadLink.href = png;
                                          downloadLink.download = 'usdt_deposit_qr.png';
                                          document.body.appendChild(downloadLink);
                                          downloadLink.click();
                                          document.body.removeChild(downloadLink);
                                          toast.success('USDT QR Code saved to downloads!');
                                        }
                                      };
                                      image.src = blobURL;
                                    } else {
                                      toast.error('Could not locate QR code SVG');
                                    }
                                  }}
                                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <QrCode className="w-3.5 h-3.5" /> Download QR Code
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {(showDeposit || showWithdraw) && paymentMethod === 'bank' && (
                        <div className="space-y-4">
                          <div className="p-5 rounded-2xl border bg-violet-500/10 border-violet-500/20 flex items-start gap-4">
                            <Landmark className="w-6 h-6 text-violet-400 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-violet-400">Direct Bank Wire / Local Transfer</p>
                              <p className="text-[10px] text-gray-400 leading-relaxed">
                                High-volume local and international bank clearing. Supports SEPA (Europe), ACH (US), and SWIFT (Global). Zero platform fees.
                              </p>
                            </div>
                          </div>
                          
                          {showDeposit && (
                            <div className="p-5 rounded-2xl border bg-black/40 border-violet-500/20 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Bank Wire Coordinates</span>
                                <span className="text-[9px] bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/25 font-bold uppercase tracking-widest">
                                  Manual Clearing
                                </span>
                              </div>
                              
                              <p className="text-[11px] text-gray-400 leading-relaxed">
                                Complete your bank transfer using the official coordinates below. You <strong className="text-violet-300">MUST</strong> include your unique reference code in the payment details to authorize and map funds automatically.
                              </p>

                              <div className="space-y-2 text-xs">
                                {[
                                  { label: 'Beneficiary Bank', val: 'Apex Global Clearing Group' },
                                  { label: 'Beneficiary Name', val: 'Supreme Holdings Ltd.' },
                                  { label: 'SWIFT / BIC', val: 'APEXUS33XXX' },
                                  { label: 'IBAN / Account Number', val: settings.bankWireCoordinates || 'GB49 APEX 6016 1331 4452 90' },
                                  { label: 'Routing / Sort Code', val: '60-16-13' },
                                  { label: 'Mandatory Reference Code', val: `TX-BANK-${user?.uid ? user.uid.substring(0, 6).toUpperCase() : 'SUPREME'}` }
                                ].map((field, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white/5 border border-white/5 font-medium text-white">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{field.label}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className={clsx("font-mono text-[11px] select-all font-bold", field.label.includes('Reference') ? "text-violet-300 underline underline-offset-4" : "text-white")}>
                                        {field.val}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(field.val);
                                          toast.success(`${field.label} copied!`);
                                        }}
                                        className="text-gray-500 hover:text-white transition-colors p-0.5"
                                        title={`Copy ${field.label}`}
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Amount (USD)</label>
                          {showDeposit ? (
                            <span className="text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-widest">
                              Min: ${MIN_EXTERNAL_TRANSFER} | Max: ${MAX_EXTERNAL_TRANSFER.toLocaleString()}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Available</span>
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 w-6 h-6" />
                          <input 
                            type="number" 
                            required 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none text-3xl font-bold text-white placeholder:text-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none font-bold text-white appearance-none cursor-pointer"
                        >
                          {(showDeposit ? INCOME_CATEGORIES : showWithdraw ? EXPENSE_CATEGORIES : ['Transfer', ...EXPENSE_CATEGORIES]).map(cat => (
                            <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                          ))}
                        </select>
                      </div>

                      {showSend && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Description</label>
                          <input 
                            type="text" 
                            required 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this for?"
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--color-supreme-gold)] focus:border-transparent outline-none font-medium text-white placeholder:text-gray-800"
                          />
                        </div>
                      )}

                        {showSend && (
                          <div className="flex gap-4">
                            <button 
                              type="button"
                              onClick={() => {
                                setCategory('Council');
                                toast.info('Council category selected');
                              }}
                              className={clsx(
                                "flex-1 py-5 bg-white/5 border text-[var(--color-supreme-gold)] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] group",
                                category === 'Council' ? "border-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10" : "border-white/10 hover:bg-white/10"
                              )}
                            >
                              <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" /> 
                              <span>Council</span>
                            </button>
                            <button 
                              type="submit"
                              className="flex-[1.8] py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-sm"
                            >
                              Confirm Transfer
                            </button>
                          </div>
                        )}
                        {!showSend && (
                          <button 
                            type="submit"
                            className={clsx(
                              "py-5 rounded-2xl text-black font-bold text-xl shadow-2xl transition-all w-full",
                              showDeposit ? "bg-emerald-500 hover:bg-white shadow-emerald-500/20" : "bg-red-500 hover:bg-white shadow-red-500/20"
                            )}
                          >
                            Confirm {showDeposit ? 'Deposit' : 'Withdrawal'}
                          </button>
                        )}
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </FeatureLoader>
);
}
