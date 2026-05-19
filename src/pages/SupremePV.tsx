import React from 'react';
import { motion } from 'motion/react';
import { Target, Rocket, TrendingUp, Users, Shield, Zap, Globe, Award, Sparkles, Star } from 'lucide-react';
import FeatureLoader from '../components/FeatureLoader';

const VISION_POINTS = [
  {
    icon: Target,
    title: "Empowerment & Achievement",
    description: "We provide the elite tools and high-performance network to help you build, develop, connect, and achieve your most ambitious desires and optimum potential.",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    icon: Rocket,
    title: "Limitless Inspiration",
    description: "We inspire our community to dream bigger and reach higher, fostering the unwavering faith that extraordinary success is not just possible, but inevitable for those who dare.",
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    icon: TrendingUp,
    title: "Wealth Creation & Acceleration",
    description: "Our mission is to make as many millionaires as possible within their short time on the platform, accelerating the path to absolute financial freedom.",
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    icon: Zap,
    title: "Digital Value Recognition",
    description: "We ensure that internet engagers are fairly compensated for their time and activities. Your digital presence is an asset, and we pay you for it.",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    icon: Shield,
    title: "Global Human Empowerment",
    description: "We are dedicated to empowering billions of people through their activities on the site, providing opportunities that transcend borders and backgrounds.",
    color: "text-[var(--color-supreme-gold)]",
    bg: "bg-yellow-50"
  },
  {
    icon: Globe,
    title: "Massive Scale Prosperity",
    description: "Our goal is to reach 1,000,000,000 signed-up users, enriching a billion lives through a global ecosystem of shared prosperity and mutual growth.",
    color: "text-cyan-500",
    bg: "bg-cyan-50"
  },
  {
    icon: Sparkles,
    title: "Innovation & Excellence",
    description: "We constantly push the boundaries of technology to provide a world-class experience that elevates your lifestyle and optimizes your digital journey.",
    color: "text-pink-500",
    bg: "bg-pink-50"
  },
  {
    icon: Users,
    title: "Community & Connection",
    description: "We foster a high-performance network where elite minds connect, collaborate, and expand their horizons together.",
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    icon: Award,
    title: "Sustainable Impact",
    description: "We build for the long term, ensuring that the wealth and opportunities created on Supreme have a lasting, positive impact on generations to come.",
    color: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    icon: Star,
    title: "Optimum Lifestyle",
    description: "We believe in living life at its peak. Supreme is the gateway to the lifestyle you've always dreamed of.",
    color: "text-amber-500",
    bg: "bg-amber-50"
  }
];

export default function SupremePV() {
  return (
    <FeatureLoader text="Supreme Platform Vision">
      <div className="max-w-7xl mx-auto space-y-12 3xl:space-y-32 pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-4 3xl:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 3xl:px-12 3xl:py-6 rounded-full bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] font-bold text-sm 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl uppercase tracking-widest"
          >
            <Award className="w-4 h-4 3xl:w-10 3xl:h-10 4xl:w-16 4xl:h-16 5xl:w-24 5xl:h-24" />
            Supreme PV
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl 3xl:text-[10rem] 4xl:text-[14rem] 5xl:text-[18rem] font-display font-bold text-[var(--color-supreme-text)] leading-tight"
          >
            Our Vision for <br />
            <span className="text-[var(--color-supreme-gold)]">Global Prosperity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl text-gray-500 max-w-3xl 3xl:max-w-7xl mx-auto leading-relaxed"
          >
            Supreme is more than a platform; it's a movement dedicated to unlocking human potential and redistributing wealth through digital innovation.
          </motion.p>
        </div>

        {/* Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 3xl:gap-16">
          {VISION_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] 3xl:rounded-[80px] p-8 3xl:p-24 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-16 h-16 3xl:w-48 3xl:h-48 rounded-2xl 3xl:rounded-[40px] ${point.bg} flex items-center justify-center mb-6 3xl:mb-16 group-hover:scale-110 transition-transform duration-500`}>
                <point.icon className={`w-8 h-8 3xl:w-24 3xl:h-24 ${point.color}`} />
              </div>
              <h3 className="text-xl 3xl:text-5xl 4xl:text-7xl 5xl:text-9xl font-bold text-gray-900 mb-4 3xl:mb-12">{point.title}</h3>
              <p className="text-gray-500 3xl:text-3xl 4xl:text-5xl 5xl:text-7xl leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-[var(--color-supreme-text)] rounded-[3rem] 3xl:rounded-[100px] p-12 3xl:p-40 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 3xl:w-[800px] 3xl:h-[800px] bg-[var(--color-supreme-gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 space-y-6 3xl:space-y-20">
            <h2 className="text-3xl md:text-5xl 3xl:text-9xl 4xl:text-[12rem] 5xl:text-[16rem] font-display font-bold text-white">Be Part of the Billion</h2>
            <p className="text-gray-400 text-lg 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl max-w-2xl 3xl:max-w-6xl mx-auto">
              Join the movement today and start your journey towards optimum achievement and financial freedom.
            </p>
            <button className="px-12 py-4 3xl:px-32 3xl:py-12 bg-[var(--color-supreme-gold)] text-white font-bold rounded-2xl 3xl:rounded-[60px] hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-500/20 3xl:text-4xl 4xl:text-6xl 5xl:text-8xl">
              Get Started Now
            </button>
          </div>
        </motion.div>
      </div>
    </FeatureLoader>
  );
}
