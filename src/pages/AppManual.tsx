import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Download, 
  ChevronLeft, 
  Crown, 
  Map, 
  ShieldCheck, 
  Users, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Globe, 
  Key, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { SUPREME_FEATURES } from '../constants/featureIds';

export default function AppManual() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const manualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = 60000; // 60 seconds
    const interval = 100; // update every 100ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoaded(true), 500);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleDownloadPDF = async () => {
    if (!manualRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(manualRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save('Supreme_Master_Manual_v1.0.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Animated Background Gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[var(--color-supreme-gold)]/20 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-12 w-full max-w-lg relative z-10"
        >
          <div className="relative group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 border-[1px] border-dashed border-[var(--color-supreme-gold)]/40 rounded-full mx-auto"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-[1px] border-dashed border-amber-500/30 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <Crown className="w-14 h-14 text-[var(--color-supreme-gold)] drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <motion.h2 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[var(--color-supreme-gold)] text-[10px] font-black uppercase tracking-[1em] ml-[1em]"
              >
                Supreme Sovereign Script
              </motion.h2>
              <h1 className="text-3xl font-black text-white tracking-tighter">DATA SYNCHRONIZATION</h1>
            </div>
            
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px w-12 bg-white/10" />
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-[0.2em] animate-pulse">
                Version 1.0.8 // Protocol: BW-MASTER-KEY
              </p>
              <div className="h-px w-12 bg-white/10" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-600 via-[var(--color-supreme-gold)] to-amber-400 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-left">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Status</span>
                <span className="text-[var(--color-supreme-gold)] font-mono text-xs font-bold tabular-nums">
                  {progress < 25 && "ESTABLISHING CORE LINK"}
                  {progress >= 25 && progress < 50 && "DECRYPTING ASSET BUFFERS"}
                  {progress >= 50 && progress < 75 && "VALIDATING SECURITY NODES"}
                  {progress >= 75 && progress < 95 && "SYNTHESIZING LAYOUTS"}
                  {progress >= 95 && "PROTOCOL FINALIZED"}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Completion</span>
                <span className="text-white font-mono text-lg font-bold tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[8px] font-mono text-gray-600 uppercase tracking-wider text-left border-t border-white/5 pt-8">
            <div className="space-y-1">
              <p>System Layer: <span className="text-gray-400">Supreme Core v2</span></p>
              <p>Security Level: <span className="text-emerald-500">Master Sovereign</span></p>
            </div>
            <div className="space-y-1">
              <p>Encryption: <span className="text-gray-400">AES-4096-ECC</span></p>
              <p>Buffer Status: <span className="text-amber-500">Overflow Guard Active</span></p>
            </div>
          </div>
        </motion.div>

        {/* Floating Particle Accents */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 1000, y: Math.random() * 1000 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 50]
            }}
            transition={{ duration: 5 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-1 h-1 bg-[var(--color-supreme-gold)]/40 rounded-full blur-[1px]"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 animate-in fade-in duration-1000">
      {/* Interactive Controls Overlay */}
      <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-4">
        {isLoaded && (
          <div className="flex items-center gap-2 mr-4 px-4 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-widest shadow-2xl">
            <Sparkles className="w-3 h-3 animate-pulse" /> Master Script 1.0.8
          </div>
        )}
        <button
          onClick={() => window.history.back()}
          className="p-4 bg-white text-gray-900 rounded-full shadow-2xl hover:bg-gray-50 transition-all border border-gray-200"
          title="Go Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={clsx(
            "group relative flex items-center gap-4 px-10 py-5 bg-black text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all active:scale-95 disabled:opacity-50 overflow-hidden",
            !isGenerating && "hover:shadow-[0_20px_60px_rgba(212,175,55,0.2)]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[var(--color-supreme-gold)]" />
              <span className="text-sm">Synthesizing...</span>
            </>
          ) : (
            <>
              <div className="p-2 bg-[var(--color-supreme-gold)] rounded-lg text-black group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs">Download</span>
                <span className="text-[10px] text-[var(--color-supreme-gold)] mt-1">Sovereign Script</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Manual Content (A4 Optimized Wrapper) */}
      <div className="max-w-[210mm] mx-auto space-y-8 py-20 print:p-0 print:space-y-0" ref={manualRef}>
        
        {/* PAGE 1: MASTER COVER PAGE */}
        <section className="relative w-[210mm] h-[297mm] bg-black text-white flex flex-col justify-between p-20 overflow-hidden shadow-2xl rounded-[3rem] print:rounded-none">
          {/* Sovereign Watermark */}
          <div className="absolute top-10 left-10 text-[8px] font-mono text-white/20 tracking-[0.5em] uppercase pointer-events-none origin-left -rotate-90">
            Supreme Ecosystem Documentation // BW-MASTER-SCRIPT-1.0
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-supreme-gold)]/10 rounded-full blur-[120px] -mr-[300px] -mt-[300px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 bg-gradient-to-br from-[var(--color-supreme-gold)] to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(212,175,55,0.4)] mb-12 border-4 border-white/20"
            >
              <Crown className="w-24 h-24 text-white" />
            </motion.div>
            
            <h1 className="text-7xl font-black tracking-tighter leading-none mb-6">SUPREME</h1>
            <div className="h-1 w-24 bg-[var(--color-supreme-gold)] mb-8 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <p className="text-xl font-bold uppercase tracking-[0.3em] text-[var(--color-supreme-gold)] mb-12">Application Master Manual</p>
            
            <p className="max-w-md text-gray-400 text-lg leading-relaxed mb-20 italic">
              "The Ultimate Digital Power Platform - Featuring advanced wallet earnings, rank-based bonuses, follower monetization, and comprehensive ecosystem management."
            </p>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-12 flex justify-between items-end">
            <div className="text-left">
              <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">Author / Creator</p>
              <p className="text-3xl font-black tracking-tight">BILL WORLD</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-1">Edition</p>
              <p className="text-xl font-bold">SUPREME 1.1 (2026)</p>
            </div>
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        </section>

        {/* PAGE 2: TABLE OF CONTENTS */}
        <section className="relative w-[210mm] min-h-[297mm] p-20 bg-white shadow-2xl rounded-[3rem] print:rounded-none border border-gray-100">
          <div className="absolute top-10 left-10 text-[8px] font-mono text-black/20 tracking-[0.5em] uppercase pointer-events-none origin-left -rotate-90">
             BW-MASTER-SCRIPT-1.0 // PAGE 02
          </div>
          <h2 className="text-4xl font-black mb-12 border-b-4 border-black pb-4 inline-block">TABLE OF CONTENTS</h2>
          
          <div className="space-y-6">
            {[
              { num: '01', title: 'The Supreme Vision & Core Paradigm', page: '03' },
              { num: '02', title: 'Onboarding & Identity Management', page: '05' },
              { num: '03', title: 'The Digital Economy: Supreme Coin & Wallet', page: '08' },
              { num: '04', title: 'Monetization Mechanics: Rank-Based Bonuses', page: '12' },
              { num: '05', title: 'Supreme Celeb Hub & Media Protocols', page: '15' },
              { num: '06', title: 'Artificial Intelligence & Smart Tools', page: '18' },
              { num: '07', title: 'Marketplace Operations & Dealer Ecosystem', page: '22' },
              { num: '08', title: 'Advanced Monitoring: Supreme GMT', page: '26' },
              { num: '09', title: 'Administrative Sovereignty: Dashboard Controls', page: '30' },
              { num: '10', title: 'Supreme Appeal & Governance', page: '34' }
            ].map((item) => (
              <div key={item.num} className="flex items-center justify-between group border-b border-gray-50 pb-4">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-[var(--color-supreme-gold)]">{item.num}</span>
                  <span className="text-xl font-bold text-gray-800">{item.title}</span>
                </div>
                <span className="text-xl font-mono font-bold text-gray-400">{item.page}</span>
              </div>
            ))}
          </div>

          <div className="mt-20 p-8 bg-black text-white rounded-3xl">
            <h4 className="font-black mb-2 flex items-center gap-2 tracking-widest uppercase">
              <ShieldCheck className="w-5 h-5 text-[var(--color-supreme-gold)]" /> Security Notice
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              This manual contains proprietary architecture details of the Supreme Platform. Unauthorized reproduction or distribution is strictly prohibited under the Supreme digital sovereignty protocols.
            </p>
          </div>
        </section>

        {/* PAGE 3: CORE PARADIGM */}
        <section className="relative w-[210mm] min-h-[297mm] p-20 bg-white border-b border-gray-100">
           {/* Section Watermark */}
          <div className="absolute top-10 right-10 text-[8px] font-mono text-black/10 tracking-[0.3em] uppercase pointer-events-none">
            Chapter 01 // Vision & Framework
          </div>

          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">Chapter 01</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <h2 className="text-5xl font-black mb-10 tracking-tighter">The Supreme Vision & Core Paradigm</h2>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <Globe className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Global Ecosystem
                </h3>
                <p className="text-gray-600 leading-relaxed text-md">
                  Supreme is engineered to be more than an application; it is a digital sovereign state. It integrates social networking, financial engineering, and industrial task management into a single unified interface. The architecture is built on three pillars: <strong>Sovereignty, Scalability, and Prosperity.</strong>
                </p>
              </div>

              <div className="space-y-4 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                <h4 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Navigation Protocols
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">01</div>
                    <div>
                      <p className="text-xs font-bold uppercase mb-1">Omni-Channel Sidebar</p>
                      <p className="text-[10px] text-gray-500 leading-tight">Context-aware navigation providing instant access to modules based on user rank and permissions.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">02</div>
                    <div>
                      <p className="text-xs font-bold uppercase mb-1">Supreme Hub (The Gate)</p>
                      <p className="text-[10px] text-gray-500 leading-tight">A central node connecting the Marketplace, HOF, and high-tier interactive zones.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <Bot className="w-6 h-6 text-[var(--color-supreme-gold)]" /> Intelligence Layer
                </h3>
                <p className="text-gray-600 leading-relaxed text-md">
                  Powered by custom Gemini-derived models, the Intelligence Layer (Supreme AI) handles everything from content moderation to complex industrial task automation and financial forecasting.
                </p>
              </div>
              <div className="relative aspect-[4/3] bg-gray-900 rounded-[2.5rem] p-8 flex flex-col justify-end group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute inset-x-0 top-0 h-1 bg-[var(--color-supreme-gold)]" 
                />
                <div className="relative z-10 text-white space-y-2">
                  <p className="text-[8px] font-black uppercase text-[var(--color-supreme-gold)] tracking-[0.5em]">System Schematic</p>
                  <p className="text-lg font-black leading-tight">AI NEURAL NETWORK OVERLAY</p>
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="h-4 w-1 bg-white/10" style={{ height: Math.random() * 16 + 4 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 4: WEALTH GENERATION & RANKS */}
        <section className="relative w-[210mm] min-h-[297mm] p-20 bg-gray-50 border-b border-gray-100">
          <div className="absolute top-10 right-10 text-[8px] font-mono text-black/10 tracking-[0.3em] uppercase pointer-events-none">
            Chapter 02 // Economy & Status
          </div>

          <div className="flex items-center gap-4 mb-2">
            <span className="px-3 py-1 bg-[var(--color-supreme-gold)] text-black text-[10px] font-black uppercase tracking-widest leading-none">Chapter 02</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <h2 className="text-5xl font-black mb-10 tracking-tighter">Monetization & Rank Sovereignty</h2>

          <div className="space-y-12">
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1 space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight">The Rank System</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Supreme status is divided into distinct tiers. Each tier unlocks specific platform rights, higher earning coefficients, and access to exclusive governance tools.
                </p>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {[
                  { rank: 'Diamond', bonus: '2.5x Multiplier', color: 'text-cyan-400' },
                  { rank: 'Grand Master', bonus: '5.0x Multiplier', color: 'text-purple-500' },
                  { rank: 'Sovereign', bonus: '10.0x Multiplier', color: 'text-amber-500' },
                  { rank: 'Crown Master', bonus: 'Ultimate Privilege', color: 'text-[var(--color-supreme-gold)]' }
                ].map((r) => (
                  <div key={r.rank} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className={`text-[10px] font-black uppercase ${r.color}`}>{r.rank}</p>
                      <p className="text-[10px] font-bold text-gray-400">{r.bonus}</p>
                    </div>
                    <ShieldCheck className={`w-5 h-5 ${r.color}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-black text-white rounded-[3rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <TrendingUp className="w-32 h-32" />
               </div>
               
               <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-[var(--color-supreme-gold)]">Economic Engines</h3>
               <div className="grid grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                     <Users className="w-6 h-6 text-[var(--color-supreme-gold)]" />
                   </div>
                   <h4 className="text-lg font-bold">Follower Arbitrage</h4>
                   <p className="text-xs text-gray-400 leading-relaxed">
                     Monetize your social graph through the Network Protocol. Higher ranks receive percentage-based cascades from their network's industrial activities.
                   </p>
                 </div>
                 <div className="space-y-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                     <DollarSign className="w-6 h-6 text-emerald-400" />
                   </div>
                   <h4 className="text-lg font-bold">Industrial Incentives</h4>
                   <p className="text-xs text-gray-400 leading-relaxed">
                     Completing industrial tasks in Business Tools generates Supreme Coins (SC). These can be staked in the Coin Optimum for compounding yields.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* PAGE 5: FEATURE DIRECTORY */}
        <section className="relative w-[210mm] min-h-[297mm] p-20 bg-white shadow-2xl rounded-[3rem] print:rounded-none border border-gray-100">
           <div className="absolute top-10 left-10 text-[8px] font-mono text-black/20 tracking-[0.5em] uppercase pointer-events-none origin-left -rotate-90">
             BW-MASTER-SCRIPT-1.0 // PAGE 05
          </div>
          <h2 className="text-4xl font-black mb-12 flex items-center gap-4">
            Feature Directory <span className="text-sm font-bold text-gray-400 uppercase tracking-widest pt-2">Full Functional Breakdown</span>
          </h2>

          <div className="space-y-10">
            {SUPREME_FEATURES.map((feature, idx) => (
              <div key={feature.id} className="group border-l-4 border-black pl-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <code className="px-2 py-1 bg-gray-100 text-[10px] font-mono font-bold text-gray-600 rounded uppercase">ID: {feature.id}</code>
                  <span className="text-[10px] font-black uppercase text-[var(--color-supreme-gold)] tracking-widest">{feature.category}</span>
                </div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">{feature.name}</h3>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {getFeatureDescription(feature.id)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-gray-400">Core Capabilities</h5>
                    <ul className="space-y-1.5">
                      {getFeatureBullets(feature.id).map((bullet, i) => (
                        <li key={i} className="text-[10px] font-bold flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-500" /> {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PAGE 6: ADMIN & CREATOR PRIVILEGE */}
        <section className="relative w-[210mm] h-[297mm] p-20 bg-gray-950 text-white flex flex-col justify-between shadow-2xl rounded-[3rem] print:rounded-none border border-white/5">
           <div className="absolute top-10 left-10 text-[8px] font-mono text-white/20 tracking-[0.5em] uppercase pointer-events-none origin-left -rotate-90">
             BW-MASTER-SCRIPT-1.0 // PAGE 06
          </div>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-[var(--color-supreme-gold)] text-black text-[10px] font-black uppercase tracking-widest leading-none">Admin Protocol</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <h2 className="text-5xl font-black mb-12 tracking-tighter">Sovereign Control Systems</h2>

            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Key className="w-10 h-10 text-[var(--color-supreme-gold)] mb-4" />
                  <h4 className="text-xl font-bold mb-3 uppercase tracking-tight">Supreme Admin Dashboard</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    The nerve center of the ecosystem. Admins can manage users, track real-time financial flows, adjust platform coefficients, and manage global feature statuses.
                  </p>
                </div>
                <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
                  <h4 className="text-xl font-bold mb-3 uppercase tracking-tight">Security & Moderation</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Advanced oversight tools for maintaining ecosystem health. Includes anti-fraud protocols, KYC tracking, and the Supreme Appeal moderation system.
                  </p>
                </div>
              </div>

              <div className="bg-[var(--color-supreme-gold)]/10 border border-[var(--color-supreme-gold)]/20 rounded-[2.5rem] p-10">
                <h4 className="text-2xl font-black mb-6 text-[var(--color-supreme-gold)] flex items-center gap-4 uppercase tracking-widest">
                  Official Endorsement
                </h4>
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <span className="text-4xl font-display font-black text-[var(--color-supreme-gold)] tracking-tighter">BW</span>
                  </div>
                  <div>
                    <p className="text-gray-300 italic mb-4 leading-relaxed">
                      "I designed the Supreme Platform to empower users with true digital sovereignty. This manual serves as your map to navigating clinical financial freedom."
                    </p>
                    <p className="font-black text-xl tracking-widest uppercase">– Bill World</p>
                    <p className="text-[10px] font-bold text-[var(--color-supreme-gold)] uppercase tracking-[0.2em] mt-1">Lead Architect & Creator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             <p>© 2026 SUPREME ECOSYSTEM. ALL RIGHTS RESERVED.</p>
             <p>SYSTEM CODE: FT-ADM-999-PRT</p>
          </div>
        </section>

      </div>
    </div>
  );
}

// Helper components
const Check = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);

function getFeatureDescription(id: string): string {
  const descriptions: Record<string, string> = {
    'FT-MKT-101': 'A high-performance digital marketplace for trading exclusive assets and industrial services. Features real-time bidding, dealer verification, and escrow integration.',
    'FT-CHT-202': 'Encrypted communication layer supporting global channels, private relays, and integrated media sharing for high-level network collaboration.',
    'FT-NET-303': 'Proprietary graph-based social protocol allowing users to build and govern their own digital communities with integrated monetization.',
    'FT-AIT-404': 'Unified AI terminal providing access to multi-modal generative intelligence for text, images, and complex task automation.',
    'FT-GMT-505': 'Global Monitoring Tracker. A premium situational awareness tool for ecosystem oversight, tracking global events, and high-value user activity.',
    'FT-SCR-606': 'High-definition streaming infrastructure for live broadcasting with integrated tipping, subscriber tokens, and low-latency interaction.',
    'FT-HLF-707': 'Prestigious record of top earners and contributors. Entrance requires achievement of Diamond or Crown ranks.',
    'FT-UTL-808': 'A suite of professional tools including invoice generators, task organizers, and predictive business analytics.',
    'FT-COI-909': 'Integrated DEX interface for optimizing digital asset performance through liquidity provision and yield farming protocols.',
    'FT-HRD-010': 'Virtual hardware mining interface allowing users to lease computing power to generate Supreme Coins directly to their wallets.',
    'FT-MED-111': 'Unified media repository for managing assets, content libraries, and encrypted storage for sensitive platform data.',
    'FT-NOB-888': 'Elite governance tier for "Noble" rank holders, allowing participation in platform-wide referendums and feature steering.',
    'FT-BOX-777': 'Algorithmic rewards system distributing high-value assets and rarity-based digital items to active contributors.',
    'FT-TRS-555': 'Secure vault system for storing platform-native treasures, limited edition NFTs, and sovereign credentials.',
    'FT-ADM-999': 'Full-stack platform control center. Reserved for Supreme Rank holders to manage governance and revenue distribution protocols.'
  };
  return descriptions[id] || 'This feature provides integrated capabilities within the Supreme digital ecosystem, designed for scalability and user empowerment.';
}

function getFeatureBullets(id: string): string[] {
  const bullets: Record<string, string[]> = {
    'FT-MKT-101': ['Secure Transactions', 'Dealer Ratings', 'Inventory Tracking'],
    'FT-CHT-202': ['E2E Encryption', 'File Sync', 'Group Pools'],
    'FT-AIT-404': ['Generative Text', 'Image Processing', 'Auto-Automation'],
    'FT-GMT-505': ['Real-time Tracking', 'Global Heatmaps', 'Whale Alerts'],
    'FT-ADM-999': ['User Control', 'Revenue Split', 'Module Toggles'],
    'FT-NOB-888': ['Voting Power', 'Elite Access', 'Noble Perks'],
    'FT-BOX-777': ['Random Loot', 'Rarity Scaling', 'Daily Drops'],
    'FT-COI-909': ['Liquidity Pools', 'Staking Rewards', 'Yield Optimization']
  };
  return bullets[id] || ['Ecosystem Integration', 'Rank Scaling', 'Secure Access'];
}
