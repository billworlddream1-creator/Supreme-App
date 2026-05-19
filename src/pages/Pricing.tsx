import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription, PLANS, PlanType } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { Check, Crown, Bot, Play, ShoppingBag, Sparkles, AlertCircle, Pickaxe } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { event } from '../utils/analytics';
import SubscriptionPaymentModal from '../components/SubscriptionPaymentModal';

const PLAN_ICONS: Record<PlanType, any> = {
  'marketplace': ShoppingBag,
  'ai-ads': Bot,
  'streaming': Play,
  'general': Crown,
  'mining': Pickaxe
};

const PLAN_COLORS: Record<PlanType, string> = {
  'marketplace': 'text-blue-600 bg-blue-50',
  'ai-ads': 'text-purple-600 bg-purple-50',
  'streaming': 'text-red-600 bg-red-50',
  'general': 'text-[var(--color-supreme-gold)] bg-[var(--color-supreme-gold)]/10',
  'mining': 'text-yellow-600 bg-yellow-50'
};

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscribe, userSubscriptions, plans: allPlans } = useSubscription();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const groupedPlans = PLANS.reduce((acc, plan) => {
    if (!acc[plan.type]) acc[plan.type] = [];
    acc[plan.type].push(plan);
    return acc;
  }, {} as Record<PlanType, typeof PLANS>);

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlanId(planId);
    setIsModalOpen(true);
  };

  const confirmSubscription = (method: 'stripe' | 'wallet') => {
    if (selectedPlanId) {
      subscribe(selectedPlanId, method);
      event({ action: 'subscribe', category: 'Subscription', label: `${selectedPlanId}_${method}` });
      setIsModalOpen(false);
      setSelectedPlanId(null);
    }
  };

  const selectedPlan = selectedPlanId ? allPlans.find(p => p.id === selectedPlanId) : null;

  return (
    <div className="space-y-12 pb-20">
      <SubscriptionPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSelectMethod={confirmSubscription}
      />
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-800 font-medium">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-[var(--color-supreme-text)] mb-4">Supreme Subscriptions</h1>
        <p className="text-gray-600 text-lg">Choose the perfect plan to elevate your digital experience and unlock exclusive features.</p>
      </div>

      {Object.entries(groupedPlans).map(([type, plans]) => {
        const Icon = PLAN_ICONS[type as PlanType];
        const colorClass = PLAN_COLORS[type as PlanType];
        const isGeneral = type === 'general';

        return (
          <section key={type} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={clsx("p-3 rounded-xl", colorClass)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-supreme-text)] capitalize">
                  {type.replace('-', ' ')} {isGeneral ? 'Subs' : 'Plans'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isGeneral 
                    ? 'Full access to all Supreme features including Supreme Vibes, AI Tools, and more.' 
                    : `Specialized features for ${type.replace('-', ' ')}.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {plans.map((plan) => {
                const isUserSubscribed = userSubscriptions.some(s => s.planId === plan.id && s.isActive);
                
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    className={clsx(
                      "glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col bg-white/80",
                      isGeneral ? "border-[var(--color-supreme-gold)]/30 shadow-lg" : "border-gray-200",
                      isUserSubscribed && "ring-2 ring-[var(--color-supreme-gold)]"
                    )}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-[var(--color-supreme-text)]">${plan.price}</span>
                        <span className="text-gray-500 text-sm">/{plan.durationMonths === 1 ? 'mo' : `${plan.durationMonths}m`}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{plan.durationMonths} Month Access</span>
                      </li>
                      {plan.creditsPerDay && (
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{plan.creditsPerDay} AI Credits/Day</span>
                        </li>
                      )}
                      {plan.streamingHoursPerDay && (
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{plan.streamingHoursPerDay}h Streaming/Day</span>
                        </li>
                      )}
                      {isGeneral && (
                        <>
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Supreme Vibes Access</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Supreme Insight Access</span>
                          </li>
                        </>
                      )}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isUserSubscribed}
                      className={clsx(
                        "w-full py-2.5 rounded-xl font-bold transition-all",
                        isUserSubscribed 
                          ? "bg-gray-100 text-gray-400 cursor-default" 
                          : isGeneral
                            ? "bg-[var(--color-supreme-gold)] text-white hover:bg-[var(--color-supreme-gold-light)] shadow-md"
                            : "bg-gray-800 text-white hover:bg-gray-900"
                      )}
                    >
                      {isUserSubscribed ? 'Current Plan' : 'Subscribe Now'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
