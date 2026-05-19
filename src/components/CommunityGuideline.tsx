import React from 'react';
import { motion } from 'motion/react';
import { Users, ShieldAlert, Heart, MessageSquare, Ban, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const GUIDELINES = [
  {
    title: "Respect & Inclusivity",
    color: "text-indigo-600",
    icon: Heart,
    description: "Supreme is a global community. We expect all users to treat each other with respect, regardless of their background, rank, or status.",
    rules: [
      "No hate speech or discriminatory language.",
      "Respect personal boundaries in Chat and YFYG.",
      "Foster a supportive environment for new members."
    ]
  },
  {
    title: "Content Standards",
    color: "text-rose-600",
    icon: MessageSquare,
    description: "All media, posts, and vibes shared on the platform must adhere to our safety standards to maintain a professional ecosystem.",
    rules: [
      "No sexually explicit or highly suggestive content.",
      "No promotion of illegal activities or substances.",
      "Avoid spamming in public channels or community groups."
    ]
  },
  {
    title: "Professional Conduct",
    color: "text-emerald-600",
    icon: ShieldAlert,
    description: "As a platform focused on financial and technical growth, professional integrity is paramount.",
    rules: [
      "Do not impersonate other users or platform staff.",
      "No deceptive marketing or fraudulent investment schemes.",
      "Respect intellectual property rights of creators."
    ]
  },
  {
    title: "Safety & Enforcement",
    color: "text-amber-600",
    icon: Ban,
    description: "Violations of these guidelines may result in temporary or permanent account restrictions.",
    rules: [
      "Reporting: Use the UTDC to report guideline violations.",
      "Appeals: Account restrictions can be appealed via support tickets.",
      "Zero Tolerance: Harassment and bullying result in immediate bans."
    ]
  }
];

export default function CommunityGuideline() {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          Community Guidelines
        </h2>
        <p className="text-gray-500 font-medium">
          Our mission is to provide a safe, professional, and empowering space for the Supreme global community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {GUIDELINES.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={clsx("p-3 rounded-2xl bg-gray-50", item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className={clsx("text-xl font-bold uppercase tracking-tight", item.color)}>
                {item.title}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed font-medium">
              {item.description}
            </p>

            <div className="space-y-3">
              {item.rules.map((rule, rIndex) => (
                <div key={rIndex} className="flex items-start gap-3">
                  <CheckCircle2 className={clsx("w-5 h-5 shrink-0 mt-0.5", item.color)} />
                  <span className="text-sm text-gray-700 font-medium">{rule}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 text-center">
        <h4 className="text-indigo-900 font-bold mb-2">Help Us Keep Supreme Safe</h4>
        <p className="text-indigo-700 text-sm max-w-xl mx-auto">
          If you encounter behavior that violates these guidelines, please use the reporting tools in the user profile or contact the UTDC team immediately.
        </p>
      </div>
    </div>
  );
}
