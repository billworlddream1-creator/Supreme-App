import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Wallet, X, Crown, ShieldCheck, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useWallet } from '../context/WalletContext';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onSelectMethod: (method: 'stripe' | 'wallet') => void;
}

export default function SubscriptionPaymentModal({ isOpen, onClose, plan, onSelectMethod }: SubscriptionPaymentModalProps) {
  const { balance } = useWallet();
  const hasEnoughBalance = (balance || 0) >= plan?.price;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--color-supreme-gold)]/20 rounded-xl">
                  <Crown className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                </div>
                <h3 className="text-xl font-display font-bold tracking-tight">Supreme Checkout</h3>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Plan Selected</p>
                <h4 className="text-2xl font-bold font-display">{plan?.name}</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">${plan?.price}</span>
                  <span className="text-gray-400 text-sm">/{plan?.durationMonths === 1 ? 'month' : `${plan?.durationMonths} months`}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="p-6 space-y-4 bg-gray-50/50">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Select Payment Method</p>
              
              {/* Wallet Option */}
              <button
                onClick={() => hasEnoughBalance && onSelectMethod('wallet')}
                disabled={!hasEnoughBalance}
                className={clsx(
                  "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                  hasEnoughBalance 
                    ? "border-emerald-100 bg-white hover:border-emerald-500 hover:shadow-lg" 
                    : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "p-3 rounded-xl transition-colors",
                    hasEnoughBalance ? "bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white" : "bg-gray-200"
                  )}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">Supreme Wallet</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      Balance: <span className={clsx("font-bold", hasEnoughBalance ? "text-emerald-600" : "text-red-500")}>${balance?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {hasEnoughBalance ? (
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Check className="w-4 h-4 text-transparent group-hover:text-white" />
                  </div>
                ) : (
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">Insufficient Funds</span>
                )}
              </button>

              {/* Stripe Option */}
              <button
                onClick={() => onSelectMethod('stripe')}
                className="w-full p-5 rounded-2xl border-2 border-blue-100 bg-white hover:border-blue-500 hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">Secure Card / Apple Pay</div>
                    <div className="text-xs text-gray-500">Processed securely via Stripe</div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Check className="w-4 h-4 text-transparent group-hover:text-white" />
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End-to-End Encrypted Transaction</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
