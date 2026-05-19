import React from 'react';
import { 
  BookOpen, 
  Info, 
  HelpCircle, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Radio, 
  MessageCircle, 
  CreditCard, 
  Printer,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface GuidelineSection {
  id: string;
  title: string;
  color: string;
  icon: any;
  features: {
    name: string;
    description: string;
    usage: string;
  }[];
}

const GUIDELINES: GuidelineSection[] = [
  {
    id: 'core_platform',
    title: 'Core Platform Features',
    color: 'text-blue-600',
    icon: Zap,
    features: [
      {
        name: 'Supreme Users & Rankings',
        description: 'The central hub for member discovery and global status tracking.',
        usage: 'Browse the global leaderboard, view detailed engagement analysis, and connect with top-ranked experts.'
      },
      {
        name: 'YFYG (Your Friends, Your Groups)',
        description: 'A dedicated space for personal networking and community building.',
        usage: 'Manage friend requests, chat with connections, and participate in specialized group discussions.'
      },
      {
        name: 'Supreme Profile Card',
        description: 'Your digital identity that promotes your presence across the platform.',
        usage: 'Create and customize your card with business details and social links. Cards appear randomly to all users every 10 minutes.'
      }
    ]
  },
  {
    id: 'financial_mining',
    title: 'Financial & Mining Ecosystem',
    color: 'text-amber-600',
    icon: TrendingUp,
    features: [
      {
        name: 'Supreme Coin Optimum',
        description: 'Advanced cloud mining infrastructure for generating Supreme Coins.',
        usage: 'Subscribe to mining rigs, track real-time hash rates, and monitor your daily mining rewards.'
      },
      {
        name: 'GMT Forex Optimum',
        description: 'Professional-grade forex trading analysis and execution.',
        usage: 'Access real-time currency charts, execute trades, and use advanced technical indicators for market analysis.'
      },
      {
        name: 'Bank Hub',
        description: 'The unified financial management center for all platform assets.',
        usage: 'Convert mining rewards, transfer funds between wallets, and manage your subscription payments.'
      }
    ]
  },
  {
    id: 'engagement_tools',
    title: 'Engagement & Content',
    color: 'text-purple-600',
    icon: Sparkles,
    features: [
      {
        name: 'Supreme Stream & Media',
        description: 'High-quality video streaming and multimedia content sharing.',
        usage: 'Watch live broadcasts, upload exclusive media, and engage with content creators through likes and comments.'
      },
      {
        name: 'Marketplace',
        description: 'A secure environment for buying and selling goods and services.',
        usage: 'List your products, browse categories, and complete secure transactions using platform currency.'
      },
      {
        name: 'Print Set',
        description: 'Professional activity reporting and documentation tool.',
        usage: 'Generate A4-formatted reports of your earnings, security logs, and engagement metrics for personal records.'
      }
    ]
  },
  {
    id: 'security_support',
    title: 'Security & Support',
    color: 'text-red-600',
    icon: Shield,
    features: [
      {
        name: 'UTDC (Universal Technical Data Center)',
        description: 'The primary support and technical assistance gateway.',
        usage: 'Submit support tickets, access the knowledge base, and receive real-time help from technical staff.'
      },
      {
        name: 'Security Integrity Logs',
        description: 'Real-time monitoring of account access and security events.',
        usage: 'Review login history and tampering attempts through the Print Set or Security dashboard to ensure account safety.'
      }
    ]
  }
];

export default function UsageGuideline() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--color-supreme-gold)]" />
            Usage Guidelines
          </h2>
          <p className="text-gray-500">Master the Supreme platform with our comprehensive feature guide.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm font-medium">
          <Info className="w-4 h-4" />
          Updated for v2.5
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {GUIDELINES.map((section, index) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-8 rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={clsx("p-3 rounded-2xl bg-gray-50", section.color)}>
                <section.icon className="w-8 h-8" />
              </div>
              <h3 className={clsx("text-2xl font-black tracking-tight uppercase", section.color)}>
                {section.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.features.map((feature, fIndex) => (
                <div 
                  key={fIndex}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[var(--color-supreme-gold)]/30 transition-all group"
                >
                  <h4 className={clsx("text-lg font-bold mb-3 flex items-center gap-2", section.color)}>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {feature.name}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">How to Use</p>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{feature.usage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-1">Pro Tip: Daily Engagement</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your Rank Score is calculated based on daily activity. Regular engagement in Chat and Media sections significantly boosts your global standing and reward multipliers.
            </p>
          </div>
        </div>
        <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex items-start gap-4">
          <div className="p-2 bg-green-100 text-green-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-900 mb-1">Status Rewards</h4>
            <p className="text-xs text-green-700 leading-relaxed">
              Higher ranks (Crowned, Royal) unlock exclusive features like Expert Suggestion and higher mining efficiency. Maintain your score to keep these premium benefits.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Need more help? Contact the <span className="font-bold text-[var(--color-supreme-gold)]">UTDC Support Team</span>
        </p>
      </div>
    </div>
  );
}
