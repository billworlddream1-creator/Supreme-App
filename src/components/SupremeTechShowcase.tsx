import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Car, Tablet, Factory, Zap, Shield, Microscope, ArrowRight, RefreshCw, BarChart, X, Activity, Globe, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { generateTechInventions, TechInvention } from '../services/geminiService';

export default function SupremeTechShowcase() {
  const [inventions, setInventions] = useState<TechInvention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedInvention, setSelectedInvention] = useState<TechInvention | null>(null);

  const fetchTech = async () => {
    setIsLoading(true);
    try {
      const data = await generateTechInventions();
      setInventions(data);
    } catch (err) {
      console.error('Failed to fetch tech creations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTech();
  }, []);

  const filteredInventions = activeCategory === 'All' 
    ? inventions 
    : inventions.filter(inv => inv.category === activeCategory);

  const categories = ['All', 'Vehicles', 'Devices', 'Machines', 'Computing'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-[var(--color-supreme-text)] flex items-center gap-3">
            <Zap className="w-8 h-8 text-[var(--color-supreme-gold)]" /> Supreme Inventions & Creations
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-gray-500 text-sm font-medium">Real-time proprietary intelligence feeds active</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeCategory === cat 
                  ? "bg-black text-[var(--color-supreme-gold)] shadow-xl shadow-[var(--color-supreme-gold)]/20" 
                  : "bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black"
              )}
            >
              {cat}
            </button>
          ))}
          <button 
            onClick={fetchTech}
            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"
          >
            <RefreshCw className={clsx("w-5 h-5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[320px] bg-gray-100/50 animate-pulse rounded-[2.5rem] border border-gray-100" />
            ))
          ) : (
            filteredInventions.map((inv, idx) => (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative h-[320px] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white"
              >
                {/* Image Background */}
                <div className="absolute inset-0">
                  <img 
                    src={inv.image} 
                    alt={inv.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <div className="mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-[var(--color-supreme-gold)] text-[8px] font-black uppercase tracking-widest">
                      {inv.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold mb-3 group-hover:text-[var(--color-supreme-gold)] transition-colors line-clamp-1">
                    {inv.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Impact</div>
                      <div className="text-lg font-display font-black text-[var(--color-supreme-gold)]">#{inv.impactScore}</div>
                    </div>
                    <button 
                      onClick={() => setSelectedInvention(inv)}
                      className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-lg hover:bg-[var(--color-supreme-gold)] transition-all shadow-lg active:scale-95"
                    >
                      Dossier <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Category Icon */}
                <div className="absolute top-6 left-6 p-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {inv.category === 'Vehicles' && <Car className="w-4 h-4 text-white" />}
                  {inv.category === 'Devices' && <Tablet className="w-4 h-4 text-white" />}
                  {inv.category === 'Machines' && <Factory className="w-4 h-4 text-white" />}
                  {inv.category === 'Computing' && <Cpu className="w-4 h-4 text-white" />}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Dossier Modal */}
      <AnimatePresence>
        {selectedInvention && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvention(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedInvention.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[700px] border border-[var(--color-supreme-gold)]/20 shadow-[var(--color-supreme-gold)]/10"
            >
              {/* Modal Banner Section */}
              <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={selectedInvention.image} 
                  alt={selectedInvention.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                  <span className="text-[10px] font-black text-[var(--color-supreme-gold)] uppercase tracking-[0.4em] mb-3">Supreme Strategic Dossier</span>
                  <h2 className="text-4xl font-display font-black text-white">{selectedInvention.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedInvention(null)}
                  className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all border border-white/20 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Modal Content Section */}
              <div className="md:w-1/2 p-10 overflow-y-auto space-y-8 bg-white custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-2xl">
                      {selectedInvention.category === 'Vehicles' && <Car className="w-6 h-6 text-gray-700" />}
                      {selectedInvention.category === 'Devices' && <Tablet className="w-6 h-6 text-gray-700" />}
                      {selectedInvention.category === 'Machines' && <Factory className="w-6 h-6 text-gray-700" />}
                      {selectedInvention.category === 'Computing' && <Cpu className="w-6 h-6 text-gray-700" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedInvention.category} DIVISION</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-gray-900">{selectedInvention.status} READY</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[40px] font-display font-black text-[var(--color-supreme-gold)] leading-none">{selectedInvention.impactScore}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Strategic Impact Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Executive Executive Summary
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-[var(--color-supreme-gold)]/30 pl-4 py-1">
                    "{selectedInvention.description}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-500" /> Technical Data Spectrum
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedInvention.specifications.map((spec, i) => (
                      <div key={i} className="group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black/10 transition-all flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-black/20 group-hover:bg-[var(--color-supreme-gold)] transition-colors" />
                           <span className="text-xs font-bold text-gray-700">{spec}</span>
                         </div>
                         <Info className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                    <Shield className="w-4 h-4" /> Professional Grade Only
                  </div>
                  <button className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 group">
                    Acquire Intellectual Property <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
