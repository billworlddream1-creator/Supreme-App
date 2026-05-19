import React from 'react';
import { useAds } from '../context/AdsContext';
import { motion } from 'motion/react';
import { Zap, Sparkles, Star } from 'lucide-react';
import clsx from 'clsx';

export default function PromotionalMarquee() {
  const { promotionalInjections } = useAds();
  const activeInjections = promotionalInjections.filter(i => i.isActive);

  if (activeInjections.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-red-950/50 border-y border-amber-500/20 py-2 relative group">
      <div className="flex whitespace-nowrap">
        {activeInjections.map((injection) => (
          <motion.div
            key={injection.id}
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
              duration: injection.speed,
              repeat: Infinity,
              ease: "linear"
            }}
            className={clsx(
              "inline-flex items-center gap-4 px-8 py-1 rounded-full mx-4 shadow-lg border border-white/10",
              injection.color
            )}
          >
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white font-display font-bold text-sm tracking-wide uppercase">
              {injection.message}
            </span>
            <Sparkles className="w-4 h-4 text-white/50" />
          </motion.div>
        ))}
      </div>
      
      {/* Overlay for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-red-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-red-950 to-transparent z-10" />
    </div>
  );
}
