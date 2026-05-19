import React from 'react';
import { motion } from 'motion/react';
import { Gavel, FileText, Scale, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const TERMS = [
  {
    title: "Account Eligibility",
    color: "text-blue-600",
    icon: FileText,
    description: "By creating an account on Supreme, you agree to provide accurate, current, and complete information.",
    points: [
      "Minimum Age: You must be at least 18 years old.",
      "Account Security: You are responsible for maintaining the confidentiality of your login credentials.",
      "One Account: Users are prohibited from creating multiple accounts to manipulate platform metrics."
    ]
  },
  {
    title: "Financial Transactions",
    color: "text-amber-600",
    icon: Scale,
    description: "All financial activities, including mining, trading, and marketplace transactions, are subject to our financial terms.",
    points: [
      "Fees: Subscription fees for Profile Cards and Mining Rigs are non-refundable.",
      "Currency: Transactions are processed in Supreme Coin or USD as specified.",
      "Risk Disclosure: Trading and mining involve financial risk; Supreme does not guarantee profits."
    ]
  },
  {
    title: "Intellectual Property",
    color: "text-purple-600",
    icon: ShieldCheck,
    description: "Supreme owns all platform content, trademarks, and proprietary technology.",
    points: [
      "User Content: You retain ownership of content you post but grant Supreme a license to host and display it.",
      "Platform Assets: You may not copy, modify, or reverse-engineer any part of the Supreme infrastructure.",
      "Trademarks: Use of the Supreme logo or branding requires explicit written permission."
    ]
  },
  {
    title: "Termination of Service",
    color: "text-red-600",
    icon: AlertCircle,
    description: "Supreme reserves the right to suspend or terminate access for violations of these terms.",
    points: [
      "Immediate Termination: Serious violations like fraud or harassment result in immediate account closure.",
      "Data Retention: Upon termination, user data may be retained for legal and security purposes.",
      "Appeals: Users can appeal termination through the UTDC support system."
    ]
  }
];

export default function TermsOfService() {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Gavel className="w-8 h-8 text-blue-600" />
          Terms of Service
        </h2>
        <p className="text-gray-500 font-medium">
          Please read these terms carefully before using the Supreme platform. By accessing the platform, you agree to be bound by these terms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TERMS.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
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
              {item.points.map((point, pIndex) => (
                <div key={pIndex} className="flex items-start gap-3">
                  <CheckCircle2 className={clsx("w-5 h-5 shrink-0 mt-0.5", item.color)} />
                  <span className="text-sm text-gray-700 font-medium">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
        <h4 className="text-blue-900 font-bold mb-2">Legal Agreement</h4>
        <p className="text-blue-700 text-sm max-w-xl mx-auto">
          These terms constitute a legally binding agreement between you and Supreme. Continued use of the platform signifies your acceptance of any future updates to these terms.
        </p>
      </div>
    </div>
  );
}
