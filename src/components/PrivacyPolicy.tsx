import React from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, Lock, Database, Globe, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const POLICIES = [
  {
    title: "Data Collection",
    color: "text-emerald-600",
    icon: Database,
    description: "Supreme collects information necessary to provide and improve our services.",
    details: [
      "Personal Info: Name, email, and avatar provided during registration.",
      "Usage Data: Engagement metrics, login history, and device information.",
      "Financial Info: Transaction history and wallet addresses for mining and marketplace."
    ]
  },
  {
    title: "Data Protection",
    color: "text-blue-600",
    icon: Lock,
    description: "We use industry-standard security measures to protect your personal data.",
    details: [
      "Encryption: All sensitive data is encrypted in transit and at rest.",
      "Access Control: Only authorized personnel have access to user data.",
      "Security Logs: Real-time monitoring of unauthorized access attempts."
    ]
  },
  {
    title: "Data Sharing",
    color: "text-purple-600",
    icon: Globe,
    description: "We do not sell your personal data to third parties.",
    details: [
      "Service Providers: Data may be shared with trusted partners like Stripe for payments.",
      "Legal Compliance: Data may be disclosed if required by law or to protect platform safety.",
      "Public Profile: Your name and rank are visible to other users on the platform."
    ]
  },
  {
    title: "User Rights",
    color: "text-amber-600",
    icon: Eye,
    description: "You have control over your data and how it is used on the Supreme platform.",
    details: [
      "Visibility: You can toggle engagement visibility in your Profile Settings.",
      "Access: You can request a copy of your personal data through the UTDC.",
      "Deletion: You can request account deletion, which removes all personal identifiers."
    ]
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          Privacy Policy
        </h2>
        <p className="text-gray-500 font-medium">
          Your privacy is our priority. We are committed to being transparent about how we collect, use, and protect your information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {POLICIES.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
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
              {item.details.map((detail, dIndex) => (
                <div key={dIndex} className="flex items-start gap-3">
                  <CheckCircle2 className={clsx("w-5 h-5 shrink-0 mt-0.5", item.color)} />
                  <span className="text-sm text-gray-700 font-medium">{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center">
        <h4 className="text-emerald-900 font-bold mb-2">Privacy Commitment</h4>
        <p className="text-emerald-700 text-sm max-w-xl mx-auto">
          We continuously update our privacy practices to comply with global data protection standards. For any privacy-related inquiries, please contact our Data Protection Officer via UTDC.
        </p>
      </div>
    </div>
  );
}
