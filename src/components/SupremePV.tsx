import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Rocket, 
  DollarSign, 
  Clock, 
  Users, 
  Globe, 
  Lightbulb, 
  TrendingUp, 
  Trophy, 
  ShieldCheck,
  Sparkles,
  Target
} from 'lucide-react';
import { clsx } from 'clsx';

const visionPoints = [
  {
    title: "Empowerment & Achievement",
    description: "Empowering users to build, develop, connect, and expand their horizons to achieve their ultimate life goals and optimum desires.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Limitless Aspiration",
    description: "Inspiring a global community to dream bigger, fostering unwavering self-belief and the courage to pursue extraordinary heights in every aspect of life.",
    icon: Rocket,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Wealth Acceleration",
    description: "Accelerating financial freedom to cultivate a new generation of millionaires through strategic platform engagement and innovative earning models.",
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Digital Value Realization",
    description: "Revolutionizing the digital economy by ensuring every user is fairly compensated for their time, creativity, and online activity.",
    icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Universal Empowerment",
    description: "Driving global empowerment by transforming everyday digital interactions into meaningful opportunities for personal and professional growth.",
    icon: Users,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    title: "Global Prosperity at Scale",
    description: "Scaling to 1 billion users to create a massive, interconnected ecosystem dedicated to universal enrichment and collective prosperity.",
    icon: Globe,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  },
  {
    title: "Innovation Leadership",
    description: "Fostering a culture of relentless innovation where users can pioneer new digital frontiers and lead significant industry shifts.",
    icon: Lightbulb,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Potential to Performance",
    description: "Bridging the gap between raw potential and peak performance through advanced tools and a supportive, high-achieving global network.",
    icon: TrendingUp,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Legacy of Excellence",
    description: "Cultivating a legacy of excellence where every Supreme user becomes a beacon of success and inspiration in their respective field.",
    icon: Trophy,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    title: "Democratized Opportunity",
    description: "Democratizing access to high-level financial, social, and educational opportunities for individuals across the globe, regardless of background.",
    icon: ShieldCheck,
    color: "text-teal-500",
    bg: "bg-teal-500/10"
  }
];

export default function SupremePV() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] text-sm font-bold uppercase tracking-widest"
        >
          <Sparkles className="w-4 h-4" />
          Supreme Platform Vision
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-[var(--color-supreme-text)] tracking-tight"
        >
          Supreme <span className="text-[var(--color-supreme-gold)]">PV</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-500 font-medium leading-relaxed"
        >
          Our mission is to redefine the boundaries of digital interaction, 
          creating a world where every individual has the tools, the network, 
          and the inspiration to achieve supreme success.
        </motion.p>
      </div>

      {/* Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visionPoints.map((point, index) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[var(--color-supreme-gold)]/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <point.icon className="w-24 h-24" />
            </div>
            
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500",
              point.bg, point.color
            )}>
              <point.icon className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-[var(--color-supreme-text)] mb-3 group-hover:text-[var(--color-supreme-gold)] transition-colors">
              {point.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {point.description}
            </p>

            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-[var(--color-supreme-gold)]/50 transition-colors">
              <Target className="w-3 h-3" />
              Strategic Objective {index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="p-12 rounded-[3rem] bg-gradient-to-br from-[var(--color-supreme-text)] to-black text-white text-center space-y-6 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-black tracking-tight">Join the Supreme Revolution</h3>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">
            Be part of a global movement dedicated to excellence, enrichment, and the pursuit of a higher standard of living.
          </p>
          <div className="pt-4">
            <button className="px-10 py-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-900/20">
              Start Your Journey
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
