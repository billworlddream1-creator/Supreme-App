import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { clsx } from 'clsx';

interface VerifiedBadgeProps {
  userId?: string;
  className?: string;
  size?: number;
}

export default function VerifiedBadge({ userId, className, size = 14 }: VerifiedBadgeProps) {
  const { isSubscribed } = useSubscription();
  
  // For demo, we'll assume the badge is shown if they have ANY active subscription
  // In a real app, we'd check the specific user's subscription status
  const hasAccess = isSubscribed('general') || isSubscribed('marketplace') || isSubscribed('ai-ads') || isSubscribed('streaming');

  if (!hasAccess) return null;

  return (
    <div className={clsx("inline-flex items-center justify-center text-green-500 ml-1", className)} title="Verified Paid Member">
      <CheckCircle2 size={size} fill="currentColor" className="text-white" />
      <div className="absolute inset-0 bg-green-500 rounded-full -z-10 scale-75"></div>
    </div>
  );
}
