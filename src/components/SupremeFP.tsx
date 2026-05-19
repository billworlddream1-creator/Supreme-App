import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

const policies = [
  "Strict Adherence to Financial Terms: All financial transactions, activities, and engagements conducted within the Supreme Platform must strictly adhere to our comprehensive financing terms and conditions. Failure to comply may result in account suspension or forfeiture of earnings.",
  "Transparent Billing and Pricing Structures: The pricing and billing structures for all premium features, subscriptions, and services on the Supreme Platform are meticulously aligned with global international standards. Whether you opt for monthly or annual billing cycles, your account will be managed with absolute transparency and accuracy.",
  "Performance-Based Earning Potential: Earning potential on the Supreme Platform operates on a dynamic, performance-based model. By actively participating in the community, maintaining active subscriptions, and strictly abiding by our financial policies, dedicated users have the unprecedented opportunity to generate substantial wealth and potentially achieve multi-millionaire status over time.",
  "Unlimited Withdrawals with Low Thresholds: There are absolutely no upper limits on fund withdrawals, provided you have accumulated sufficient legitimate earnings. The minimum withdrawal threshold is set at an accessible $50. Once a withdrawal request is submitted and approved—often within seconds—funds may reach your designated external account in minutes, hours, or a few business days, depending on your selected processing method and regional banking regulations.",
  "Lucrative Awards and Recognition Programs: Our exclusive monthly and yearly awards programs offer exceptional opportunities to earn significant supplemental income. Rewards are meticulously calculated based on your platform engagement and key activity metrics, including but not limited to likes, followers, active subscriptions, subscriber count, and successful referrals.",
  "Secure Internal Supreme Wallet: All earnings and bonuses are credited directly to your highly secure, encrypted Supreme Wallet. Every user is assigned a unique internal account number specifically designed for seamless, instantaneous transactions within the Supreme ecosystem. Please note that this internal account number is proprietary and cannot be used for external banking or third-party transfers.",
  "Engagement-Driven Wealth Generation: Consistent, high-quality engagement directly correlates with your overall earning potential. Highly active users who consistently contribute value to the network also significantly increase their chances of being featured in our prestigious monthly and yearly Hall of Fame programs, unlocking further financial incentives.",
  "Exclusive High-Reward Programs: The Million Deal and Million Draw programs are exclusive, high-reward features specifically designed to offer substantial, life-changing financial benefits to our most consistently engaged, loyal, and active users.",
  "Flexible Fund Management: Funds earned through our various reward programs, including mining, forex trading, and monthly/yearly awards, can be instantly transferred to your internal Supreme Wallet for platform use, or withdrawn directly to your linked, verified external bank accounts and crypto wallets.",
  "Proportional Payout Velocity: The speed, priority, and frequency of your payouts on the Supreme Platform are directly proportional to your level of active engagement, account standing, and overall contribution to the community's growth.",
  "Dedicated Financial Support: Our dedicated, world-class Financial Management Team is committed to promptly addressing all financial inquiries, disputes, and needs, provided that users remain in full compliance with the platform's financial policies and community guidelines.",
  "A Premier Ecosystem for Growth: The Supreme Platform is a premier digital ecosystem designed for unparalleled personal and financial growth. Through your daily activities, strategic networking, and content creation, you can build substantial wealth, forge valuable global connections, expand your knowledge base, and create a lasting digital empire.",
  "Irreversible Transactions and User Responsibility: The Supreme Wallet is a world-class, highly secure financial tool designed to handle all your transactions with precision. We strongly urge all users to meticulously double-check transaction details, wallet addresses, and recipient information before initiating any transfer, either internally or externally. Funds transferred to incorrect accounts due to user error are strictly irreversible and cannot be retrieved by the Supreme Financial Team."
];

export default function SupremeFP() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-[var(--color-supreme-gold)]/10 rounded-full mb-6">
          <ShieldAlert className="w-12 h-12 text-[var(--color-supreme-gold)]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Supreme Financial Policy (Supreme FP)</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          The financial policy of Supreme App that handles all financial processing within the entire system's financial management.
        </p>
      </div>

      <div className="space-y-4">
        {policies.map((policy, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start hover:border-[var(--color-supreme-gold)]/30 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center font-bold text-gray-400">
              {index + 1}
            </div>
            <p className="text-gray-700 leading-relaxed pt-1">
              {policy}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
