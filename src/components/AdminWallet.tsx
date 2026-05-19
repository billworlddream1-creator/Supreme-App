import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Bitcoin, 
  Send, 
  History, 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building,
  DollarSign,
  ChevronRight,
  Globe
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import clsx from 'clsx';

interface AdminWalletData {
  id: string;
  adminUid: string;
  adminName: string;
  balance: number;
  isKeySet: boolean;
  securityKey?: string;
  role: string;
  status: 'active' | 'suspended';
}

interface AdminTransaction {
  id: string;
  fromUid: string;
  toUid: string;
  targetType: 'admin' | 'user' | 'external';
  amount: number;
  type: 'funding' | 'reward' | 'transfer' | 'withdrawal';
  method: 'stripe' | 'bitcoin' | 'paypal' | 'internal';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: any;
}

export default function AdminWallet() {
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<AdminWalletData | null>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [securityKeyInput, setSecurityKeyInput] = useState('');
  const [transferData, setTransferData] = useState({ targetId: '', amount: 0, notes: '', targetType: 'user' as 'user' | 'admin' });
  const [fundData, setFundData] = useState({ amount: 0, method: 'stripe' as 'stripe' | 'bitcoin' | 'paypal' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ amount: 0, method: 'stripe' as 'stripe' | 'bitcoin' | 'paypal', account: '' });

  const handleWithdraw = async () => {
    if (withdrawData.amount <= 0 || !withdrawData.account) {
      toast.error('Valid amount and target account required');
      return;
    }
    if (withdrawData.amount > wallet!.balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!verifyKey()) return;

    setIsVerifying(true);
    // Simulate external withdrawal
    setTimeout(async () => {
      try {
        await addDoc(collection(db, 'admin_transactions'), {
          fromUid: user!.uid,
          toUid: withdrawData.account,
          targetType: 'external',
          amount: withdrawData.amount,
          type: 'withdrawal',
          method: withdrawData.method,
          status: 'completed',
          notes: `Withdrawal to ${withdrawData.method} account: ${withdrawData.account}`,
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'admin_wallets', wallet!.id), {
          balance: wallet!.balance - withdrawData.amount,
          updatedAt: serverTimestamp()
        });

        toast.success(`Withdrawal of $${withdrawData.amount} processed successfully!`);
        setShowWithdrawModal(false);
        setSecurityKeyInput('');
      } catch (error) {
        toast.error('Withdrawal failed');
      } finally {
        setIsVerifying(false);
      }
    }, 2000);
  };

  const isAdminMaster = user?.email === 'billworlddream1@gmail.com' || user?.email === 'supremeseller@gmail.com' || user?.email === 'sunny@gmail.com';

  useEffect(() => {
    if (!user) return;

    // Fetch Wallet by doc ID (user.uid)
    const walletRef = doc(db, 'admin_wallets', user.uid);
    const unsubscribeWallet = onSnapshot(walletRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Create wallet with user.uid as ID if not exists
        setDoc(walletRef, {
          adminUid: user.uid,
          adminName: profile?.name || user.email || 'Admin',
          balance: 0,
          isKeySet: false,
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp()
        }).then(() => {
          // Snapshot will trigger again
        }).catch(err => {
          console.error("Error creating wallet:", err);
          setLoading(false);
        });
      } else {
        setWallet({ id: snapshot.id, ...snapshot.data() } as AdminWalletData);
        setLoading(false);
      }
    }, (error) => {
      console.error("Wallet snapshot error:", error);
      toast.error(`Cloud connection failed (UID: ${user.uid.substring(0, 8)}). Please check your permissions.`);
      setLoading(false);
    });

    // Fetch Transactions - keeping the query for history
    const qTx = query(
      collection(db, 'admin_transactions'),
      where('fromUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribeTx = onSnapshot(qTx, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AdminTransaction[]);
    }, (error) => {
      console.error("Transactions snapshot error:", error);
    });

    // Fetch all admins for transfers (if master)
    if (isAdminMaster) {
      const qAdmins = query(collection(db, 'users'), where('role', '==', 'mini-admin'));
      onSnapshot(qAdmins, (snapshot) => {
        setAllAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }

    return () => {
      unsubscribeWallet();
      unsubscribeTx();
    };
  }, [user]);

  const handleSetKey = async () => {
    if (securityKeyInput.length < 4) {
      toast.error('Security key must be at least 4 characters');
      return;
    }
    try {
      await updateDoc(doc(db, 'admin_wallets', wallet!.id), {
        securityKey: securityKeyInput,
        isKeySet: true,
        updatedAt: serverTimestamp()
      });
      setShowKeyModal(false);
      toast.success('Security key set successfully!');
    } catch (error) {
      toast.error('Failed to set security key');
    }
  };

  const verifyKey = () => {
    if (securityKeyInput === wallet?.securityKey) {
      return true;
    }
    toast.error('Incorrect security key');
    return false;
  };

  const handleFund = async () => {
    if (fundData.amount <= 0) return;
    
    setIsVerifying(true);
    // Simulate payment processing
    setTimeout(async () => {
      try {
        const txRef = await addDoc(collection(db, 'admin_transactions'), {
          fromUid: user!.uid,
          toUid: user!.uid,
          targetType: 'external',
          amount: fundData.amount,
          type: 'funding',
          method: fundData.method,
          status: 'completed',
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'admin_wallets', wallet!.id), {
          balance: wallet!.balance + fundData.amount,
          updatedAt: serverTimestamp()
        });

        toast.success(`Wallet funded with $${fundData.amount} via ${fundData.method}`);
        setShowFundModal(false);
      } catch (error) {
        toast.error('Funding failed');
      } finally {
        setIsVerifying(false);
      }
    }, 1500);
  };

  const handleTransfer = async () => {
    if (transferData.amount <= 0 || !transferData.targetId) {
      toast.error('Valid amount and recipient required');
      return;
    }
    if (transferData.amount > wallet!.balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!verifyKey()) return;

    setIsVerifying(true);
    try {
      // Create Transaction for Sender
      await addDoc(collection(db, 'admin_transactions'), {
        fromUid: user!.uid,
        toUid: transferData.targetId,
        targetType: transferData.targetType,
        amount: transferData.amount,
        type: transferData.targetType === 'admin' ? 'transfer' : 'reward',
        method: 'internal',
        status: 'completed',
        notes: transferData.notes,
        createdAt: serverTimestamp()
      });

      // Update Admin Wallet (From)
      await updateDoc(doc(db, 'admin_wallets', wallet!.id), {
        balance: wallet!.balance - transferData.amount,
        updatedAt: serverTimestamp()
      });

      // Update Target (Admin or User)
      if (transferData.targetType === 'admin') {
        const targetWalletRef = doc(db, 'admin_wallets', transferData.targetId);
        const twSnap = await getDoc(targetWalletRef);
        if (twSnap.exists()) {
          await updateDoc(targetWalletRef, {
            balance: (twSnap.data().balance || 0) + transferData.amount,
            updatedAt: serverTimestamp()
          });
        } else {
          // Create the wallet if it doesn't exist yet
          await setDoc(targetWalletRef, {
            adminUid: transferData.targetId,
            adminName: 'Admin',
            balance: transferData.amount,
            isKeySet: false,
            role: 'mini-admin',
            status: 'active',
            updatedAt: serverTimestamp()
          });
        }
        
        // Also create receiving tx for target
        await addDoc(collection(db, 'admin_transactions'), {
          fromUid: user!.uid,
          toUid: transferData.targetId,
          targetType: 'admin',
          amount: transferData.amount,
          type: 'transfer',
          method: 'internal',
          status: 'completed',
          notes: `Internal transfer from Master Admin: ${transferData.notes}`,
          createdAt: serverTimestamp()
        });
      } else {
        // User update - using transaction for atomicity
        const userRef = doc(db, 'users', transferData.targetId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().walletBalance || userSnap.data().balance || 0;
          await updateDoc(userRef, {
            walletBalance: currentBalance + transferData.amount
          });
          
          // Add notification for the user
          await addDoc(collection(db, 'notifications'), {
            userId: transferData.targetId,
            title: 'Reward Received!',
            message: `You have received a reward of $${transferData.amount} from Supreme Admin.`,
            type: 'reward',
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }

      toast.success('Funds successfully disbursed!');
      setShowTransferModal(false);
      setSecurityKeyInput('');
      setTransferData({ targetId: '', amount: 0, notes: '', targetType: 'user' });
    } catch (error) {
      console.error(error);
      toast.error('Transaction failed. Check console for details.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-[var(--color-supreme-gold)] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-bold animate-pulse">Connecting to Supreme Cloud...</p>
    </div>
  );

  if (!wallet) return (
    <div className="p-12 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Wallet Not Initialized</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto font-medium">
        We couldn't retrieve your admin wallet. <br/>
        <span className="text-xs opacity-60">UID: {user?.uid || 'N/A'} • Email: {user?.email || 'N/A'}</span>
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-[var(--color-supreme-gold)] text-black font-bold rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-[var(--color-supreme-gold)]/20"
      >
        Refresh Connection
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Wallet Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl bg-[var(--color-supreme-gold)] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Wallet className="w-5 h-5 text-[var(--color-supreme-gold)]" />
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Supreme Admin Wallet</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight">
              ${wallet.balance.toLocaleString()}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Active Pool</span>
              {isAdminMaster && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">Master Authority</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowFundModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" /> Fund Wallet
            </button>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" /> Withdraw
            </button>
            <button 
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" /> Payout / Transfer
            </button>
            {!wallet.isKeySet ? (
              <button 
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Lock className="w-4 h-4" /> Set Security Key
              </button>
            ) : (
              <div className="px-6 py-3 bg-emerald-500/10 text-emerald-500 font-bold rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                <Shield className="w-4 h-4" /> SECURED
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[var(--color-supreme-gold)]" />
                Transaction History
              </h3>
              <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">View All</button>
            </div>

            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-gray-600">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium tracking-tight">No recent transactions to display.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={clsx(
                        "p-3 rounded-xl",
                        tx.type === 'funding' ? "bg-emerald-500/10 text-emerald-500" : tx.type === 'withdrawal' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {tx.type === 'funding' ? <ArrowUpRight className="w-5 h-5" /> : tx.type === 'withdrawal' ? <ArrowDownLeft className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white uppercase text-[10px] tracking-widest">{tx.type}</p>
                          <span className="w-1 h-1 bg-gray-600 rounded-full" />
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{tx.method}</p>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5 line-clamp-1">{tx.notes || (tx.type === 'funding' ? 'Wallet Deposit' : 'Platform Payout')}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{tx.createdAt?.toDate?.()?.toLocaleString() || 'Processing...'}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={clsx(
                        "text-lg font-black tracking-tight",
                        tx.type === 'funding' ? "text-emerald-500" : tx.type === 'withdrawal' ? "text-amber-500" : "text-white"
                      )}>
                         {tx.type === 'funding' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                      <span className={clsx(
                        "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                        tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-gray-500"
                      )}>{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info/Quick Links */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">Payment Methods</h3>
            <div className="space-y-3">
              {[
                { name: 'Stripe Global', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Instant Payouts' },
                { name: 'PayPal Direct', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Merchant Portal' },
                { name: 'Bitcoin Network', icon: Bitcoin, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Secure Cold Storage' }
              ].map((method) => (
                <div key={method.name} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className={clsx("p-2 rounded-lg", method.bg, method.color)}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{method.name}</p>
                    <p className="text-[10px] text-gray-500 tracking-tight">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--color-supreme-gold)]/20 to-transparent p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/20">
            <AlertCircle className="w-6 h-6 text-[var(--color-supreme-gold)] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Security Note</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Every transaction requires your personal security key. Never share this key with anyone, including other admins.
            </p>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-white/10 p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h3>
              <p className="text-gray-400 text-sm mb-6">Transfer your admin wallet funds to an external account.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount to Withdraw ($)</label>
                  <input 
                    type="number" 
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData({...withdrawData, amount: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-xl focus:border-[var(--color-supreme-gold)] outline-none" 
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Withdrawal Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'stripe', icon: CreditCard, label: 'Bank' },
                      { id: 'paypal', icon: Globe, label: 'PayPal' },
                      { id: 'bitcoin', icon: Bitcoin, label: 'BTC' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setWithdrawData({...withdrawData, method: m.id as any})}
                        className={clsx(
                          "p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all",
                          withdrawData.method === m.id ? "bg-white text-black" : "bg-white/5 border-white/10 text-white"
                        )}
                      >
                        <m.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Account / Wallet Details</label>
                    <input 
                      type="text" 
                      value={withdrawData.account}
                      onChange={(e) => setWithdrawData({...withdrawData, account: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-supreme-gold)] outline-none" 
                      placeholder="Account number or BTC address..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Security Key</label>
                    <input 
                      type="password" 
                      value={securityKeyInput}
                      onChange={(e) => setSecurityKeyInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-supreme-gold)] outline-none" 
                      placeholder="••••"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleWithdraw}
                    disabled={isVerifying}
                    className="flex-1 py-4 bg-amber-500 text-black font-bold rounded-2xl shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isVerifying ? 'Processing...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fund Modal */}
      <AnimatePresence>
        {showFundModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-white/10 p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Fund Admin Wallet</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount to Add ($)</label>
                  <input 
                    type="number" 
                    value={fundData.amount}
                    onChange={(e) => setFundData({...fundData, amount: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-xl focus:border-[var(--color-supreme-gold)] outline-none" 
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'stripe', icon: CreditCard, label: 'Card' },
                      { id: 'paypal', icon: Globe, label: 'PayPal' },
                      { id: 'bitcoin', icon: Bitcoin, label: 'BTC' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setFundData({...fundData, method: m.id as any})}
                        className={clsx(
                          "p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all",
                          fundData.method === m.id ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)] text-black" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                      >
                        <m.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowFundModal(false)}
                    className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFund}
                    disabled={isVerifying}
                    className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl shadow-xl shadow-[var(--color-supreme-gold)]/20 disabled:opacity-50"
                  >
                    {isVerifying ? 'Processing...' : 'Complete Payment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Initiate Payout</h3>
              <p className="text-gray-400 text-sm mb-6">Send funds to users or other administrators from the central pool.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Recipient Type</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTransferData({...transferData, targetType: 'user'})}
                      className={clsx("flex-1 py-3 rounded-xl font-bold text-sm", transferData.targetType === 'user' ? "bg-white text-black" : "bg-white/5 text-gray-400")}
                    >Users</button>
                    {isAdminMaster && (
                      <button 
                        onClick={() => setTransferData({...transferData, targetType: 'admin'})}
                        className={clsx("flex-1 py-3 rounded-xl font-bold text-sm", transferData.targetType === 'admin' ? "bg-white text-black" : "bg-white/5 text-gray-400")}
                      >Mini Admins</button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Recipient ID / Email</label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={transferData.targetId}
                      onChange={(e) => setTransferData({...transferData, targetId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-supreme-gold)] outline-none" 
                      placeholder="Enter UID or select from list..."
                    />
                    
                    {transferData.targetType === 'admin' && allAdmins.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                        {allAdmins.map(admin => (
                          <button
                            key={admin.id}
                            onClick={() => setTransferData({...transferData, targetId: admin.id})}
                            className={clsx(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                              transferData.targetId === admin.id ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)] text-black" : "bg-white/5 border-white/10 text-white"
                            )}
                          >
                            {admin.name || admin.email}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount ($)</label>
                    <input 
                      type="number" 
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-[var(--color-supreme-gold)] outline-none" 
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Security Key</label>
                    <input 
                      type="password" 
                      value={securityKeyInput}
                      onChange={(e) => setSecurityKeyInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-supreme-gold)] outline-none" 
                      placeholder="••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Reference Notes</label>
                  <textarea 
                    value={transferData.notes}
                    onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[var(--color-supreme-gold)] outline-none resize-none h-24" 
                    placeholder="Purpose of this payout..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTransfer}
                    disabled={isVerifying}
                    className="flex-1 py-4 bg-white text-black font-bold rounded-2xl shadow-xl disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Authorize Payout'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-white/10 p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[var(--color-supreme-gold)]/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Set Security Key</h3>
                <p className="text-gray-400 text-sm mb-8 font-medium">Create a strong alphanumeric key to authorize all wallet transactions.</p>
                
                <div className="w-full space-y-4">
                  <input 
                    type="password" 
                    value={securityKeyInput}
                    onChange={(e) => setSecurityKeyInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-center text-2xl tracking-[1em] focus:border-[var(--color-supreme-gold)] outline-none" 
                    placeholder="••••"
                  />
                  <div className="flex gap-3 pt-4 w-full">
                    <button 
                      onClick={() => setShowKeyModal(false)}
                      className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl"
                    >
                      Skip
                    </button>
                    <button 
                      onClick={handleSetKey}
                      className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-black font-bold rounded-2xl shadow-xl shadow-[var(--color-supreme-gold)]/20"
                    >
                      Lock Wallet
                    </button>
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
