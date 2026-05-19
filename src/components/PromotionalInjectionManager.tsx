import React, { useState } from 'react';
import { useAds, PromotionalInjection } from '../context/AdsContext';
import { 
  Plus, Trash2, Power, Zap, 
  Palette, Gauge, MessageSquare, 
  Eye, EyeOff, LayoutTemplate
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export default function PromotionalInjectionManager() {
  const { promotionalInjections, addPromotionalInjection, toggleInjection, removeInjection } = useAds();
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('bg-amber-500');
  const [speed, setSpeed] = useState(15);

  const colors = [
    'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-indigo-500'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addPromotionalInjection({ message, color, speed });
    setMessage('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-500">Promotional Injections</h2>
        <p className="text-sm text-red-200/50">Inject messages directly into the user dashboard</p>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-red-900/30 rounded-3xl border border-amber-500/10 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Promotional Message</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
            <input 
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Exclusive 50% discount for Supreme members only! Limited time offer."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-red-950/50 border border-amber-500/20 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500/70 uppercase ml-1 flex items-center gap-2">
              <Palette className="w-3 h-3" /> Background Styling
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    c,
                    color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500/70 uppercase ml-1 flex items-center gap-2">
              <Gauge className="w-3 h-3" /> Scroll Speed ({speed}s)
            </label>
            <input 
              type="range"
              min="5"
              max="40"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-red-950/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-red-200/30 font-bold uppercase">
              <span>Fast</span>
              <span>Medium</span>
              <span>Slow</span>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-3 bg-amber-500 text-red-950 font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Inject Promotion
        </button>
      </form>

      {/* Active Injections */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-500/50 uppercase tracking-widest">Active Injections</h3>
        <div className="grid grid-cols-1 gap-4">
          {promotionalInjections.map((injection) => (
            <div 
              key={injection.id}
              className="p-4 bg-red-900/20 rounded-2xl border border-amber-500/10 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={clsx("w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white", injection.color)}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-amber-100 font-bold truncate">{injection.message}</p>
                  <p className="text-[10px] text-red-200/40 font-bold uppercase">
                    Speed: {injection.speed}s • Created {new Date(injection.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleInjection(injection.id)}
                  title={injection.isActive ? "Deactivate" : "Activate"}
                  className={clsx(
                    "p-2 rounded-xl transition-colors",
                    injection.isActive ? "text-green-500 bg-green-500/10" : "text-red-200/20 bg-red-950/50"
                  )}
                >
                  {injection.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => removeInjection(injection.id)}
                  className="p-2 text-red-200/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {promotionalInjections.length === 0 && (
            <div className="py-12 text-center space-y-4 border-2 border-dashed border-red-800/30 rounded-3xl">
              <LayoutTemplate className="w-12 h-12 text-red-800/30 mx-auto" />
              <p className="text-red-200/30 italic">No promotional injections created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
