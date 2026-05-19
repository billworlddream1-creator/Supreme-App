import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, TrendingUp, ShieldCheck, Zap, RefreshCw, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { generateDiscoveryInsights, DiscoveryInsight } from '../services/geminiService';

interface SupremeAIAdvisorProps {
  category: string;
}

export default function SupremeAIAdvisor({ category }: SupremeAIAdvisorProps) {
  const [insights, setInsights] = useState<DiscoveryInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateDiscoveryInsights(category);
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setError('System calibration in progress. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [category]);

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-[var(--color-supreme-gold)]/20 bg-gradient-to-br from-white/80 via-white/50 to-[var(--color-supreme-gold)]/5 overflow-hidden relative group">
      {/* Background Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-supreme-gold)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-[var(--color-supreme-gold)]/10 rounded-2xl flex items-center justify-center border border-[var(--color-supreme-gold)]/20 animate-pulse">
                <Brain className="w-7 h-7 text-[var(--color-supreme-gold)]" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
                Supreme AI Advisor 
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold rounded-md tracking-wider border border-blue-100">Live Engine</span>
              </h3>
              <p className="text-sm text-gray-500">Real-time proprietary market intelligence for <span className="text-[var(--color-supreme-gold)] font-bold">{category}</span></p>
            </div>
          </div>

          <button 
            onClick={fetchInsights}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:border-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-gold)] transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            Recalibrate Insights
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 bg-gray-100/50 animate-pulse rounded-3xl" />
              ))
            ) : error ? (
              <div className="col-span-3 p-8 text-center bg-red-50 rounded-3xl border border-red-100">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[var(--color-supreme-gold)]/20 transition-all group/card overflow-hidden relative"
                >
                  {/* Impact Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
                      insight.impact === 'supreme' ? "bg-black text-[var(--color-supreme-gold)]" :
                      insight.impact === 'high' ? "bg-green-100 text-green-700" :
                      insight.impact === 'medium' ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {insight.impact} IMPACT
                    </span>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-xl group-hover/card:bg-[var(--color-supreme-gold)]/10 transition-colors">
                        {index === 0 && <TrendingUp className="w-5 h-5 text-green-500" />}
                        {index === 1 && <Zap className="w-5 h-5 text-amber-500" />}
                        {index === 2 && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight pr-12">{insight.title}</h4>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed italic">"{insight.insight}"</p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-400 uppercase tracking-widest">Confidence Score</span>
                        <span className="text-gray-900">{Math.round(insight.probability * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.probability * 100}%` }}
                          className="h-full bg-gradient-to-r from-[var(--color-supreme-gold)] to-amber-400 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {insight.relatedSectors.map((sector, sIdx) => (
                        <span key={sIdx} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4 flex items-center gap-3 text-[10px] text-gray-400 uppercase font-black tracking-widest border-t border-gray-100/50">
          <Sparkles className="w-4 h-4 text-[var(--color-supreme-gold)]" />
          Quantum Intelligence generated by Gemini AI Engine
        </div>
      </div>
    </div>
  );
}
