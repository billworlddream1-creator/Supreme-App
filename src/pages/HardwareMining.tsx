import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Zap, ShoppingCart, CheckCircle2, ShieldCheck, Info, 
  TrendingUp, Server, Monitor, HardDrive, ArrowRight, Wallet, CreditCard, X
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useMining, MINING_RIGS, COINS } from '../context/MiningContext';
import { useWallet } from '../context/WalletContext';

export default function HardwareMining() {
  const { 
    miningRigs, 
    ownedHardware, 
    purchaseHardware, 
    isHardwareOwned,
    selectedRigs,
    updateRig
  } = useMining();
  const { balance: walletBalance, withdraw } = useWallet();

  const [activeTab, setActiveTab] = useState<'gpu' | 'asic'>('gpu');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedRigId, setSelectedRigId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  const hardwareRigs = miningRigs.filter(r => r.type === activeTab);
  const selectedRig = miningRigs.find(r => r.id === selectedRigId);

  const handlePurchase = async () => {
    if (!selectedRig || !selectedRig.purchasePrice) return;

    setIsProcessing(true);
    try {
      if (paymentMethod === 'wallet') {
        if (walletBalance < selectedRig.purchasePrice) {
          toast.error('Insufficient wallet balance');
          return;
        }
        withdraw(selectedRig.purchasePrice, 'Hardware Purchase', `Purchased ${selectedRig.name}`);
      }
      
      await purchaseHardware(selectedRig.id, paymentMethod);
      setShowPurchaseModal(false);
      setSelectedRigId(null);
    } catch (error) {
      toast.error('Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl backdrop-blur-sm border border-emerald-500/30">
              <Cpu className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Hardware Mining Center</h1>
          </div>
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
            Own your mining power. Unlike cloud mining, hardware rigs are a one-time purchase and provide permanent mining capabilities without monthly subscriptions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('gpu')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all",
            activeTab === 'gpu' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Monitor className="w-4 h-4" />
          GPU Miners
        </button>
        <button
          onClick={() => setActiveTab('asic')}
          className={clsx(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all",
            activeTab === 'asic' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <HardDrive className="w-4 h-4" />
          ASIC Miners
        </button>
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hardwareRigs.map((rig) => {
          const isOwned = isHardwareOwned(rig.id);
          
          return (
            <motion.div
              key={rig.id}
              layout
              className={clsx(
                "group relative bg-white rounded-3xl border-2 p-6 transition-all duration-300",
                isOwned ? "border-emerald-100 shadow-emerald-500/5" : "border-gray-100 hover:border-gray-200 shadow-xl"
              )}
            >
              {isOwned && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    Owned
                  </div>
                </div>
              )}

              <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                <img 
                  src={rig.machineImage} 
                  alt={rig.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-black text-white">{rig.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest">
                      {rig.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hash Rate</p>
                    <p className="text-lg font-black text-gray-900">{rig.rate} <span className="text-xs text-gray-500">USD/s</span></p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-lg font-black text-emerald-600">High</p>
                  </div>
                </div>

                {!isOwned ? (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</p>
                      <p className="text-2xl font-black text-gray-900">${rig.purchasePrice}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRigId(rig.id);
                        setShowPurchaseModal(true);
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Equip to Coin</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COINS.slice(0, 4).map(coin => {
                        const isEquipped = selectedRigs[coin.id] === rig.id;
                        return (
                          <button
                            key={coin.id}
                            onClick={() => updateRig(coin.id, rig.id)}
                            className={clsx(
                              "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                              isEquipped 
                                ? "bg-emerald-500 text-white border-emerald-500" 
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                            )}
                          >
                            {coin.id} {isEquipped ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Why Hardware Mining?</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">No Recurring Costs</h4>
                <p className="text-sm text-gray-500">Pay once, mine forever. No monthly subscription fees for hardware rigs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Higher Efficiency</h4>
                <p className="text-sm text-gray-500">ASIC miners are specifically designed for high-performance hashing.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Resale Value</h4>
                <p className="text-sm text-gray-500">Hardware rigs maintain value and can be upgraded as technology evolves.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl">
                <Info className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Mining Tips</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <p className="text-sm text-emerald-100">GPU miners are versatile and can mine multiple algorithms efficiently.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <p className="text-sm text-emerald-100">ASIC miners provide the highest hash rates for specific coins like BTC.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <p className="text-sm text-emerald-100">Keep an eye on the market rates to switch your hardware to the most profitable coin.</p>
              </li>
            </ul>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Pro Tip</p>
              <p className="text-sm text-emerald-50 text-italic">"Combine cloud mining for flexibility with hardware mining for long-term stability."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedRig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Confirm Purchase</h3>
                <button 
                  onClick={() => setShowPurchaseModal(false)} 
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 group"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Exit</span>
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img src={selectedRig.machineImage} alt={selectedRig.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedRig.name}</h4>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{selectedRig.type} Miner</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xl font-black text-gray-900">${selectedRig.purchasePrice}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={clsx(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm",
                        paymentMethod === 'wallet' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      <Wallet className="w-4 h-4" />
                      Wallet
                    </button>
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={clsx(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm",
                        paymentMethod === 'stripe' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Complete Purchase</>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                One-time payment. Permanent ownership.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
