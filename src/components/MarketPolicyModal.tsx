import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, CheckCircle2, AlertCircle, Clock, Package, MessageSquare, Wallet, Truck } from 'lucide-react';

interface MarketPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const policies = [
  {
    icon: Truck,
    title: "Delivery Commitment",
    description: "A dealer must agree to ship or deliver product/products/service/services within 7-14 days of purchase or their account will be suspended indefinitely."
  },
  {
    icon: Package,
    title: "Availability Guarantee",
    description: "A dealer must list product/products/service/services readily available for users."
  },
  {
    icon: AlertCircle,
    title: "Pre-Purchase Integrity",
    description: "Any complaint of product/products/services/service by the user/users before purchase, the dealer's account will be suspended without notice."
  },
  {
    icon: Wallet,
    title: "Financial Security",
    description: "Every purchase goes directly to the dealer's wallet. Violation of any policy results in wallet suspension and product tagging as 'On Hold' or 'Not Available'."
  },
  {
    icon: MessageSquare,
    title: "Tracking & Updates",
    description: "When a product/service is purchased, the dealer must keep track of the goods and keep the buyer/buyers updated on the movement."
  }
];

export default function MarketPolicyModal({ isOpen, onClose, onAccept }: MarketPolicyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl 3xl:max-w-5xl 4xl:max-w-7xl 5xl:max-w-[2000px] rounded-[2.5rem] 3xl:rounded-[5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 3xl:p-20 bg-gradient-to-br from-[var(--color-supreme-gold)] to-yellow-600 text-white relative">
              <ShieldCheck className="w-12 h-12 3xl:w-32 3xl:h-32 mb-4 3xl:mb-10 opacity-90" />
              <h2 className="text-3xl 3xl:text-7xl 4xl:text-9xl 5xl:text-[10rem] font-display font-bold mb-2 3xl:mb-6">Supreme Market Policy</h2>
              <p className="text-white/80 text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl font-medium">Lister & Dealer Terms of Service</p>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 3xl:top-12 3xl:right-12 p-2 3xl:p-6 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 3xl:p-20 space-y-6 3xl:space-y-16">
              <div className="bg-yellow-50 border border-yellow-200 p-4 3xl:p-12 rounded-2xl 3xl:rounded-[40px] flex items-start gap-3 3xl:gap-8 mb-4 3xl:mb-12">
                <AlertCircle className="w-5 h-5 3xl:w-12 3xl:h-12 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-yellow-800 font-medium">
                  All market listers and dealers must abide by these 5 core policies before products will be approved on the platform.
                </p>
              </div>

              <div className="space-y-6 3xl:space-y-16">
                {policies.map((policy, index) => (
                  <div key={index} className="flex gap-4 3xl:gap-12 group">
                    <div className="shrink-0 w-12 h-12 3xl:w-32 3xl:h-32 rounded-2xl 3xl:rounded-[40px] bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all border border-gray-100">
                      <policy.icon className="w-6 h-6 3xl:w-16 3xl:h-16 4xl:w-24 4xl:h-24 5xl:w-32 5xl:h-32 text-[var(--color-supreme-gold)]" />
                    </div>
                    <div className="space-y-1 3xl:space-y-4">
                      <h3 className="font-bold text-[var(--color-supreme-text)] 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl flex items-center gap-2 3xl:gap-6">
                        <span className="text-[var(--color-supreme-gold)]">0{index + 1}.</span> {policy.title}
                      </h3>
                      <p className="text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl text-gray-500 leading-relaxed">
                        {policy.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 3xl:pt-16 border-t border-gray-100">
                <div className="flex items-center gap-3 3xl:gap-8 p-4 3xl:p-12 bg-gray-50 rounded-2xl 3xl:rounded-[40px]">
                  <CheckCircle2 className="w-5 h-5 3xl:w-12 3xl:h-12 text-green-500" />
                  <p className="text-xs 3xl:text-2xl 4xl:text-4xl 5xl:text-6xl text-gray-500 font-medium">
                    By clicking "Accept & Continue", you agree to all the terms listed above. Failure to comply will result in immediate and indefinite account suspension.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 3xl:p-20 bg-gray-50 border-t border-gray-100 flex gap-4 3xl:gap-12">
              <button
                onClick={onClose}
                className="flex-1 py-4 3xl:py-10 bg-white text-gray-700 font-bold rounded-2xl 3xl:rounded-[40px] border border-gray-200 hover:bg-gray-100 transition-colors 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-[2] py-4 3xl:py-10 bg-[var(--color-supreme-gold)] text-white font-bold rounded-2xl 3xl:rounded-[40px] hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-lg shadow-yellow-600/20 active:scale-95 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl"
              >
                Accept & Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
