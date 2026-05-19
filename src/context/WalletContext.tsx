import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  Timestamp,
  getDoc,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { stripeService } from '../services/stripe';
import { useAuth } from './AuthContext';
import { useSound } from './SoundContext';
import { getRankData } from '../constants/ranks';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'payment' | 'receive' | 'lend' | 'borrow' | 'key-generation';
  amount: number;
  date: any;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'failed';
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  accountNumber: string | null;
  isAccountActive: boolean;
  isBoosted: boolean;
  boostExpiry: string | null;
  boostMultiplier: number;
  betWalletBalance: number;
  celebHubBalance: number;
  boxWalletBalance: number;
  forexWalletBalance: number;
  forexProfitBalance: number;
  deposit: (amount: number, category?: string, method?: string) => Promise<void>;
  withdraw: (amount: number, category?: string, method?: string) => Promise<void>;
  sendPayment: (amount: number, description: string, category?: string, recipientId?: string, recipientName?: string) => Promise<boolean>;
  receivePayment: (amount: number, description: string, category?: string) => Promise<void>;
  lendMoney: (amount: number, toUser: string, category?: string) => Promise<boolean>;
  borrowMoney: (amount: number, fromUser: string, category?: string) => Promise<void>;
  toggleAccountStatus: () => Promise<void>;
  generateNewAccount: () => Promise<boolean>;
  activateBoost: (plan: any) => Promise<void>;
  calculateFollowerEarnings: (followers: number) => number;
  // Bet Wallet
  depositToBetWallet: (amount: number, fromExternal?: boolean) => Promise<void>;
  transferFromBetWallet: (amount: number) => Promise<void>;
  updateBetWalletBalance: (amount: number, description?: string, type?: string) => Promise<void>;
  // Box Wallet
  depositToBoxWallet: (amount: number) => Promise<void>;
  transferFromBoxWallet: (amount: number) => Promise<void>;
  updateBoxWalletBalance: (amount: number, description?: string, type?: string) => Promise<void>;
  // Celeb Hub Wallet
  transferToCelebHub: (amount: number) => Promise<boolean>;
  transferFromCelebHub: (amount: number) => Promise<boolean>;
  updateCelebHubBalance: (amount: number, description?: string, type?: 'deposit' | 'withdraw') => Promise<void>;
  // Forex Wallet
  depositToForexWallet: (amount: number) => Promise<void>;
  transferProfitFromForex: (amount: number) => Promise<void>;
  updateForexBalances: (liveBalanceChange: number, profitChange: number, description?: string, type?: string) => Promise<void>;
  // Stripe Connect
  stripeAccountId: string | null;
  isStripeConnected: boolean;
  linkStripeAccount: (email: string) => Promise<string | null>;
  refreshStripeStatus: () => Promise<void>;
  createStripeLoginLink: () => Promise<string | null>;
  initiateStripeTopup: (amount: number, email: string) => Promise<string | null>;
  initiateStripePayout: (amount: number) => Promise<boolean>;
  // PayPal & Crypto
  paypalEmail: string | null;
  bitcoinAddress: string | null;
  linkPaypalAccount: (email: string) => Promise<void>;
  linkBitcoinAddress: (address: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const MIN_EXTERNAL_TRANSFER = 50;
export const MAX_EXTERNAL_TRANSFER = 5000;

export const WITHDRAWAL_METHODS = {
  stripe: {
    label: 'Stripe',
    min: 50,
    processingTime: '1-3 Business Days',
    icon: 'CreditCard'
  },
  paypal: {
    label: 'PayPal',
    min: 20,
    processingTime: 'Instant - 24 Hours',
    icon: 'DollarSign'
  },
  crypto: {
    label: 'Crypto',
    min: 10,
    processingTime: '10 - 60 Minutes',
    icon: 'Bitcoin'
  },
  bitcoin: {
    label: 'Bitcoin',
    min: 10,
    processingTime: '10 - 60 Minutes',
    icon: 'Bitcoin'
  }
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [isBoosted, setIsBoosted] = useState(false);
  const [boostExpiry, setBoostExpiry] = useState<string | null>(null);
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [betWalletBalance, setBetWalletBalance] = useState(0);
  const [celebHubBalance, setCelebHubBalance] = useState(0);
  const [boxWalletBalance, setBoxWalletBalance] = useState(0);
  const [forexWalletBalance, setForexWalletBalance] = useState(0);
  const [forexProfitBalance, setForexProfitBalance] = useState(0);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState<string | null>(null);
  const [bitcoinAddress, setBitcoinAddress] = useState<string | null>(null);
  const { playPaymentRequest } = useSound();

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setTransactions([]);
      setAccountNumber(null);
      setIsAccountActive(true);
      setIsBoosted(false);
      setBoostExpiry(null);
      setStripeAccountId(null);
      setIsStripeConnected(false);
      setPaypalEmail(null);
      setBitcoinAddress(null);
      return;
    }

    // Sync state from user profile
    setBalance(user.balance || 0);
    setAccountNumber(user.accountNumber || null);
    setIsAccountActive(user.isAccountActive !== false);
    setIsBoosted(!!user.isBoosted);
    setBoostExpiry(user.boostExpiry || null);
    setBoostMultiplier(user.boostMultiplier || 1);
    setBetWalletBalance(user.betWalletBalance || 0);
    setBoxWalletBalance(user.boxWalletBalance || 0);
    setForexWalletBalance(user.forexWalletBalance || 0);
    setForexProfitBalance(user.forexProfitBalance || 0);
    setCelebHubBalance(user.celebHubBalance || 0);
    setStripeAccountId(user.stripeAccountId || null);
    setIsStripeConnected(!!user.isStripeConnected);
    setPaypalEmail(user.paypalEmail || null);
    setBitcoinAddress(user.bitcoinAddress || null);

    // Transactions Listener
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: WalletTransaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as WalletTransaction);
      });
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = useCallback(async (transaction: Omit<WalletTransaction, 'id' | 'userId' | 'date'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId: user.uid,
        date: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  }, [user]);

  const activateBoost = async (plan: any) => {
    if (!user) return;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.durationDays);
    const expiryStr = expiry.toISOString();
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isBoosted: true,
        boostExpiry: expiryStr,
        boostMultiplier: plan.multiplier,
        balance: increment(-plan.price)
      });

      await addTransaction({
        type: 'payment',
        amount: plan.price,
        description: `${plan.name} Activation (${((plan.multiplier - 1) * 100).toFixed(0)}% for ${plan.durationDays} days)`,
        category: 'Subscription',
        status: 'completed'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const deposit = async (amount: number, category: string = 'General Income', method: string = 'Stripe') => {
    if (!user) return;
    
    if (amount < MIN_EXTERNAL_TRANSFER) {
      toast.error(`Minimum deposit amount is $${MIN_EXTERNAL_TRANSFER}`);
      return;
    }
    
    if (amount > MAX_EXTERNAL_TRANSFER) {
      toast.error(`Maximum deposit amount is $${MAX_EXTERNAL_TRANSFER}`);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount)
      });

      await addTransaction({
        type: 'deposit',
        amount,
        description: `Deposit via ${method}`,
        category,
        status: 'completed'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const withdraw = async (amount: number, category: string = 'General Expense', method: string = 'Bank Account') => {
    if (!user || balance < amount) return;

    const methodKey = method.toLowerCase() as keyof typeof WITHDRAWAL_METHODS;
    const minAmount = WITHDRAWAL_METHODS[methodKey]?.min || MIN_EXTERNAL_TRANSFER;

    if (amount < minAmount) {
      toast.error(`Minimum withdrawal amount for ${method} is $${minAmount}`);
      return;
    }
    
    if (amount > MAX_EXTERNAL_TRANSFER) {
      toast.error(`Maximum withdrawal amount is $${MAX_EXTERNAL_TRANSFER}`);
      return;
    }

    const rankData = getRankData(user.rank || 'Bronze');
    const feePercent = parseFloat(rankData.feeReduction.replace('%', '')) / 100;
    const feeAmount = amount * feePercent;
    const totalDeduction = amount + feeAmount;

    if (balance < totalDeduction) {
      toast.error(`Insufficient balance to cover withdrawal plus ${rankData.feeReduction} transaction fee ($${feeAmount.toFixed(2)}).`);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-totalDeduction)
      });

      await addTransaction({
        type: 'withdraw',
        amount: totalDeduction,
        description: `Withdrawal to ${method} (Fee: $${feeAmount.toFixed(2)})`,
        category,
        status: 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const sendPayment = async (amount: number, description: string, category: string = 'Transfer', recipientId?: string, recipientName?: string) => {
    if (!user || balance < amount) return false;
    const rankData = getRankData(user.rank || 'Bronze');
    const feePercent = parseFloat(rankData.feeReduction.replace('%', '')) / 100;
    const feeAmount = amount * feePercent;
    const totalDeduction = amount + feeAmount;

    if (balance < totalDeduction) {
      toast.error(`Insufficient balance to cover payment plus ${rankData.feeReduction} transaction fee ($${feeAmount.toFixed(2)}).`);
      return false;
    }

    try {
      // Use writeBatch for atomic transfer if possible, or just sequential updates
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // Update Sender
      batch.update(doc(db, 'users', user.uid), {
        balance: increment(-totalDeduction)
      });

      // Add Sender Transaction
      const senderTxRef = doc(collection(db, 'transactions'));
      batch.set(senderTxRef, {
        userId: user.uid,
        type: 'payment',
        amount: totalDeduction,
        description: recipientName ? `Sent to ${recipientName} (Fee: $${feeAmount.toFixed(2)})` : `${description} (Fee: $${feeAmount.toFixed(2)})`,
        category,
        status: 'completed',
        date: Timestamp.now()
      });

      // Update Recipient if exists
      if (recipientId) {
        batch.update(doc(db, 'users', recipientId), {
          balance: increment(amount),
          totalEarnings: increment(amount)
        });

        // Add Recipient Transaction
        const recipientTxRef = doc(collection(db, 'transactions'));
        batch.set(recipientTxRef, {
          userId: recipientId,
          type: 'receive',
          amount: amount,
          description: `Received from ${user.name || user.email}`,
          category,
          status: 'completed',
          date: Timestamp.now()
        });
      }

      await batch.commit();
      
      playPaymentRequest();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  const calculateFollowerEarnings = (followers: number) => {
    const rankData = getRankData(user?.rank || 'Bronze');
    const multiplier = parseFloat(rankData.earningMultiplier.replace('x', ''));
    return (followers / 1000) * 0.01111 * multiplier;
  };

  const receivePayment = async (amount: number, description: string, category: string = 'Transfer') => {
    if (!user) return;
    const rankData = getRankData(user.rank || 'Bronze');
    const multiplier = parseFloat(rankData.earningMultiplier.replace('x', ''));
    
    let bonusAmount = 0;
    
    // Rank Bonus
    if (multiplier > 1) {
      bonusAmount += amount * (multiplier - 1);
    }

    // Boost Bonus
    if (isBoosted && boostMultiplier > 1) {
      bonusAmount += amount * (boostMultiplier - 1);
    }

    const finalAmount = amount + bonusAmount;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(finalAmount),
        totalEarnings: increment(finalAmount)
      });

      await addTransaction({
        type: 'receive',
        amount: finalAmount,
        description: bonusAmount > 0 ? `${description} (Includes ${rankData.label} & Boost Bonuses: +$${bonusAmount.toFixed(4)})` : description,
        category,
        status: 'completed'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const lendMoney = async (amount: number, toUser: string, category: string = 'Loan') => {
    if (!user || balance < amount) return false;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount)
      });

      await addTransaction({
        type: 'lend',
        amount,
        description: `Lent money to ${toUser}`,
        category,
        status: 'completed'
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  const borrowMoney = async (amount: number, fromUser: string, category: string = 'Loan') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount)
      });

      await addTransaction({
        type: 'borrow',
        amount,
        description: `Borrowed money from ${fromUser}`,
        category,
        status: 'completed'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleAccountStatus = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isAccountActive: !isAccountActive
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const generateNewAccount = async () => {
    if (!user) return false;
    const cost = 2.80;
    if (balance < cost) return false;
    
    const newAcc = 'SUP-' + Math.random().toString().slice(2, 12);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-cost),
        accountNumber: newAcc
      });
      
      await addTransaction({
        type: 'key-generation',
        amount: cost,
        description: 'Generated new internal account number',
        category: 'Fee',
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  const linkStripeAccount = async (email: string) => {
    try {
      const data = await stripeService.linkStripeAccount(email);
      if (data.url && data.accountId) {
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            stripeAccountId: data.accountId
          });
        }
        window.location.href = data.url;
        return data.url;
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error linking Stripe account';
      toast.error(message);
      console.error('Error linking Stripe account:', error);
      return null;
    }
  };

  const refreshStripeStatus = useCallback(async () => {
    if (!stripeAccountId) return;
    try {
      const data = await stripeService.getAccountStatus(stripeAccountId);
      if (data.payouts_enabled && data.charges_enabled) {
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            isStripeConnected: true
          });
        }
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
    }
  }, [stripeAccountId, user]);

  const createStripeLoginLink = async () => {
    if (!stripeAccountId) return null;
    try {
      const url = await stripeService.createLoginLink(stripeAccountId);
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creating login link';
      toast.error(message);
      console.error('Error creating login link:', error);
      return null;
    }
  };

  const initiateStripeTopup = async (amount: number, email: string) => {
    try {
      const data = await stripeService.createTopupSession(amount, email);
      if (data.url) {
        window.location.href = data.url;
      }
      return data.url || null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate topup';
      toast.error(message);
      console.error('Failed to initiate topup:', error);
      return null;
    }
  };

  const initiateStripePayout = async (amount: number) => {
    if (!stripeAccountId || !user) return false;
    if (balance < amount) return false;

    try {
      const success = await stripeService.requestPayout(stripeAccountId, amount);
      if (success) {
        await withdraw(amount, 'Stripe Payout', 'Stripe');
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payout';
      toast.error(message);
      console.error('Failed to initiate payout:', error);
      return false;
    }
  };

  const linkPaypalAccount = async (email: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        paypalEmail: email
      });
      setPaypalEmail(email);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const linkBitcoinAddress = async (address: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        bitcoinAddress: address
      });
      setBitcoinAddress(address);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const depositToBetWallet = async (amount: number, fromExternal: boolean = false) => {
    if (!user) return;
    
    if (!fromExternal && balance < amount) {
      toast.error('Insufficient central wallet balance');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      if (fromExternal) {
        await updateDoc(userRef, {
          betWalletBalance: increment(amount)
        });
      } else {
        await updateDoc(userRef, {
          balance: increment(-amount),
          betWalletBalance: increment(amount)
        });
      }

      await addTransaction({
        type: 'deposit',
        amount,
        description: fromExternal ? 'External deposit to Bet Wallet' : 'Transfer from Central Wallet to Bet Wallet',
        category: 'Betting',
        status: 'completed'
      });
      
      toast.success(`Successfully deposited $${amount.toFixed(2)} to Bet Wallet`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const transferFromBetWallet = async (amount: number) => {
    if (!user || betWalletBalance < amount) {
      toast.error('Insufficient Bet Wallet balance');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount),
        betWalletBalance: increment(-amount)
      });

      await addTransaction({
        type: 'receive',
        amount,
        description: 'Transfer from Bet Wallet to Central Wallet',
        category: 'Betting',
        status: 'completed'
      });
      
      toast.success(`Successfully transferred $${amount.toFixed(2)} to Central Wallet`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateBetWalletBalance = async (amount: number, description?: string, type: string = 'bet-payout') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        betWalletBalance: increment(amount)
      });

      if (description && amount !== 0) {
        await addTransaction({
          type: type as any,
          amount: Math.abs(amount),
          description,
          category: 'Betting',
          status: 'completed'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const depositToBoxWallet = async (amount: number) => {
    if (!user) return;
    
    if (balance < amount) {
      toast.error('Insufficient central wallet balance');
      return;
    }

    if (amount < 1000 || amount > 100000) {
      toast.error('Box Wallet transfer must be between $1,000 and $100,000');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount),
        boxWalletBalance: increment(amount)
      });

      await addTransaction({
        type: 'deposit',
        amount,
        description: 'Transfer from Central Wallet to Box Wallet',
        category: 'Mysterious Box',
        status: 'completed'
      });
      
      toast.success(`Successfully deposited $${amount.toFixed(2)} to Box Wallet`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const transferFromBoxWallet = async (amount: number) => {
    if (!user || boxWalletBalance < amount) {
      toast.error('Insufficient Box Wallet balance');
      return;
    }

    if (amount < 1000 || amount > 100000) {
      toast.error('Box Wallet withdrawal must be between $1,000 and $100,000');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount),
        boxWalletBalance: increment(-amount)
      });

      await addTransaction({
        type: 'receive',
        amount,
        description: 'Transfer from Box Wallet to Central Wallet',
        category: 'Mysterious Box',
        status: 'completed'
      });
      
      toast.success(`Successfully transferred $${amount.toFixed(2)} to Central Wallet`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateBoxWalletBalance = async (amount: number, description?: string, type: string = 'bet-payout') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        boxWalletBalance: increment(amount)
      });

      if (description && amount !== 0) {
        await addTransaction({
          type: type as any,
          amount: Math.abs(amount),
          description,
          category: 'Mysterious Box',
          status: 'completed'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const transferToCelebHub = async (amount: number) => {
    if (!user || balance < amount) {
      toast.error('Insufficient central wallet balance');
      return false;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount),
        celebHubBalance: increment(amount)
      });

      await addTransaction({
        type: 'payment',
        amount,
        description: 'Transfer to Celeb Hub Wallet',
        category: 'Celeb Hub',
        status: 'completed'
      });
      
      toast.success(`Successfully transferred $${amount.toFixed(2)} to Celeb Hub Wallet`);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  const transferFromCelebHub = async (amount: number) => {
    if (!user || celebHubBalance < amount) {
      toast.error('Insufficient Celeb Hub balance');
      return false;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount),
        celebHubBalance: increment(-amount)
      });

      await addTransaction({
        type: 'receive',
        amount,
        description: 'Transfer from Celeb Hub Wallet',
        category: 'Celeb Hub',
        status: 'completed'
      });
      
      toast.success(`Successfully transferred $${amount.toFixed(2)} to Central Wallet`);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  const updateCelebHubBalance = async (amount: number, description?: string, type: 'deposit' | 'withdraw' = 'deposit') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        celebHubBalance: increment(amount)
      });

      if (description && amount !== 0) {
        await addTransaction({
          type: type as any,
          amount: Math.abs(amount),
          description,
          category: 'Celeb Hub',
          status: 'completed'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const depositToForexWallet = async (amount: number) => {
    if (!user || balance < amount) {
      toast.error('Insufficient central wallet balance');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount),
        forexWalletBalance: increment(amount)
      });

      await addTransaction({
        type: 'deposit',
        amount,
        description: 'Transfer to GMT Forex Trading Account',
        category: 'Forex',
        status: 'completed'
      });
      
      toast.success(`Successfully deposited $${amount.toFixed(2)} to Forex trading account`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const transferProfitFromForex = async (amount: number) => {
    if (!user || forexProfitBalance < amount) {
      toast.error('Insufficient Forex profit balance');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(amount),
        forexProfitBalance: increment(-amount),
        forexWalletBalance: increment(-amount)
      });

      await addTransaction({
        type: 'receive',
        amount,
        description: 'Forex live profit transfer to Central Wallet',
        category: 'Forex Profit',
        status: 'completed'
      });
      
      toast.success(`Successfully transferred $${amount.toFixed(2)} profit to Central Wallet`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateForexBalances = async (liveBalanceChange: number, profitChange: number, description?: string, type: string = 'forex-trade') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        forexWalletBalance: increment(liveBalanceChange),
        forexProfitBalance: increment(profitChange)
      });

      if (description && (liveBalanceChange !== 0 || profitChange !== 0)) {
        await addTransaction({
          type: type as any,
          amount: Math.abs(profitChange || liveBalanceChange),
          description,
          category: 'Forex',
          status: 'completed'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const value = React.useMemo(() => ({
    balance,
    transactions,
    accountNumber,
    isAccountActive,
    isBoosted,
    boostExpiry,
    boostMultiplier,
    betWalletBalance,
    celebHubBalance,
    boxWalletBalance,
    forexWalletBalance,
    forexProfitBalance,
    deposit,
    withdraw,
    sendPayment,
    receivePayment,
    lendMoney,
    borrowMoney,
    toggleAccountStatus,
    generateNewAccount,
    activateBoost,
    calculateFollowerEarnings,
    depositToBetWallet,
    transferFromBetWallet,
    updateBetWalletBalance,
    depositToBoxWallet,
    transferFromBoxWallet,
    updateBoxWalletBalance,
    transferToCelebHub,
    transferFromCelebHub,
    updateCelebHubBalance,
    depositToForexWallet,
    transferProfitFromForex,
    updateForexBalances,
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
  }), [
    balance,
    transactions,
    accountNumber,
    isAccountActive,
    isBoosted,
    boostExpiry,
    boostMultiplier,
    betWalletBalance,
    celebHubBalance,
    boxWalletBalance,
    forexWalletBalance,
    forexProfitBalance,
    deposit,
    withdraw,
    sendPayment,
    receivePayment,
    lendMoney,
    borrowMoney,
    toggleAccountStatus,
    generateNewAccount,
    activateBoost,
    calculateFollowerEarnings,
    depositToBetWallet,
    transferFromBetWallet,
    updateBetWalletBalance,
    depositToBoxWallet,
    transferFromBoxWallet,
    updateBoxWalletBalance,
    transferToCelebHub,
    transferFromCelebHub,
    updateCelebHubBalance,
    depositToForexWallet,
    transferProfitFromForex,
    updateForexBalances,
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
  ]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
